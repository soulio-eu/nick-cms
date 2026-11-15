import type { z } from 'zod';

import type { Collection } from './collection.js';
import { decodeCursor, encodeCursor } from './cursor.js';
import {
  DocumentMigrationError,
  DocumentNotFoundError,
  DocumentSchemaVersionError,
  DocumentValidationError,
} from './errors.js';
import type { DocumentRecords, StoredDocument } from './store.js';

/** A document of a collection: metadata plus validated `data`. */
export interface Document<T> {
  id: string;
  key: string | null;
  createdAt: Date;
  updatedAt: Date;
  data: T;
}

export interface DocumentPage<T> {
  items: Document<T>[];
  /** Pass to `list` for the next page; `null` on the last page. */
  nextCursor: string | null;
}

/** Typed access to one collection's documents. */
export interface DocumentRepository<S extends z.ZodType> {
  get(id: string): Promise<Document<z.output<S>> | null>;
  getByKey(key: string): Promise<Document<z.output<S>> | null>;
  /** Documents ordered by creation time, then id. */
  list(options: {
    limit: number;
    cursor?: string | null | undefined;
  }): Promise<DocumentPage<z.output<S>>>;
  create(data: z.input<S>, options?: { key?: string | undefined }): Promise<Document<z.output<S>>>;
  /**
   * Replaces the document's data. Its key and creation time stay. Refuses a document stored at a
   * newer schema version than the collection's.
   */
  update(id: string, data: z.input<S>): Promise<Document<z.output<S>>>;
  delete(id: string): Promise<void>;
}

export interface DocumentRepositoryOptions {
  generateId?: (() => string) | undefined;
  now?: (() => Date) | undefined;
}

export function createDocumentRepository<S extends z.ZodType>(
  records: DocumentRecords,
  collection: Collection<S>,
  options: DocumentRepositoryOptions = {},
): DocumentRepository<S> {
  const generateId = options.generateId ?? (() => crypto.randomUUID());
  const now = options.now ?? (() => new Date());
  const { type, schema, version } = collection;

  function validateInput(data: unknown, id?: string): z.output<S> {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new DocumentValidationError(result.error.issues, id);
    }
    return result.data;
  }

  function toDocument(stored: StoredDocument): Document<z.output<S>> {
    let data = stored.data;
    if (stored.schemaVersion > version) {
      throw new DocumentSchemaVersionError(stored.id, stored.schemaVersion, version);
    }
    if (stored.schemaVersion < version) {
      try {
        if (collection.migrate === undefined) {
          throw new TypeError(`Collection "${type}" has no migrate.`);
        }
        data = collection.migrate(data, stored.schemaVersion);
      } catch (error) {
        throw new DocumentMigrationError(stored.id, error);
      }
    }
    return {
      id: stored.id,
      key: stored.key,
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
      data: validateInput(data, stored.id),
    };
  }

  return {
    async get(id) {
      const stored = await records.get(type, id);
      return stored === null ? null : toDocument(stored);
    },

    async getByKey(key) {
      const stored = await records.getByKey(type, key);
      return stored === null ? null : toDocument(stored);
    },

    async list({ limit, cursor }) {
      if (!Number.isInteger(limit) || limit < 1) {
        throw new RangeError(`limit must be a positive integer, got ${String(limit)}.`);
      }
      const after = cursor == null ? undefined : decodeCursor(cursor);
      const rows = await records.list(type, { limit: limit + 1, after });
      const page = rows.slice(0, limit);
      const last = page.at(-1);
      return {
        items: page.map(toDocument),
        nextCursor:
          rows.length > limit && last !== undefined
            ? encodeCursor({ createdAt: last.createdAt, id: last.id })
            : null,
      };
    },

    async create(data, createOptions = {}) {
      const key = createOptions.key ?? null;
      if (key === '') {
        throw new TypeError('Document key must not be empty.');
      }
      const timestamp = now();
      const stored: StoredDocument = {
        id: generateId(),
        type,
        key,
        schemaVersion: version,
        data: validateInput(data),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await records.insert(stored);
      return toDocument(stored);
    },

    async update(id, data) {
      const result = await records.replace(type, id, {
        data: validateInput(data, id),
        schemaVersion: version,
        updatedAt: now(),
      });
      switch (result.outcome) {
        case 'replaced':
          return toDocument(result.document);
        case 'missing':
          throw new DocumentNotFoundError(id);
        case 'newer':
          throw new DocumentSchemaVersionError(id, result.schemaVersion, version);
      }
    },

    async delete(id) {
      if (!(await records.delete(type, id))) {
        throw new DocumentNotFoundError(id);
      }
    },
  };
}
