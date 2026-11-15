import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import { defineCollection } from './collection.js';
import { createDocumentRepository } from './document-repository.js';
import {
  DocumentKeyConflictError,
  DocumentMigrationError,
  DocumentNotFoundError,
  DocumentSchemaVersionError,
  DocumentValidationError,
  InvalidCursorError,
} from './errors.js';
import { createMemoryStore } from './memory-store.test-support.js';
import type { Store } from './store.js';

const testimonials = defineCollection({
  type: 'testimonial',
  schema: z.object({
    author: z.string(),
    quote: z.string(),
    rating: z.number().int().default(5),
  }),
});

function setup(store: Store = createMemoryStore()) {
  let tick = 0;
  let sequence = 0;
  const repo = createDocumentRepository(store.documents, testimonials, {
    now: () => new Date(Date.UTC(2026, 0, 1) + tick++ * 1000),
    generateId: () => `id-${String(++sequence).padStart(3, '0')}`,
  });
  return { store, repo };
}

describe('create', () => {
  test('stores the parsed data with generated id and timestamps', async () => {
    const { repo } = setup();
    const created = await repo.create({ author: 'Jana', quote: 'Great' }, { key: 'jana' });
    expect(created).toEqual({
      id: 'id-001',
      key: 'jana',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      data: { author: 'Jana', quote: 'Great', rating: 5 },
    });
    expect(await repo.get('id-001')).toEqual(created);
    expect(await repo.getByKey('jana')).toEqual(created);
  });

  test('throws DocumentValidationError for invalid data and stores nothing', async () => {
    const { repo } = setup();
    const error: unknown = await repo.create({ author: 'Jana' } as never).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(DocumentValidationError);
    expect((error as DocumentValidationError).id).toBeUndefined();
    expect((error as DocumentValidationError).issues[0]?.path).toEqual(['quote']);
    expect((await repo.list({ limit: 10 })).items).toEqual([]);
  });

  test('throws DocumentKeyConflictError for a taken key', async () => {
    const { repo } = setup();
    await repo.create({ author: 'A', quote: 'a' }, { key: 'same' });
    await expect(repo.create({ author: 'B', quote: 'b' }, { key: 'same' })).rejects.toBeInstanceOf(
      DocumentKeyConflictError,
    );
  });

  test('rejects an empty key', async () => {
    const { repo } = setup();
    await expect(repo.create({ author: 'A', quote: 'a' }, { key: '' })).rejects.toBeInstanceOf(
      TypeError,
    );
  });
});

describe('get and getByKey', () => {
  test('return null when nothing matches', async () => {
    const { repo } = setup();
    expect(await repo.get('missing')).toBeNull();
    expect(await repo.getByKey('missing')).toBeNull();
  });
});

describe('update', () => {
  test('replaces the data and keeps key and createdAt', async () => {
    const { repo } = setup();
    const created = await repo.create(
      { author: 'Jana', quote: 'Great', rating: 3 },
      { key: 'jana' },
    );
    const updated = await repo.update(created.id, { author: 'Jana', quote: 'Even better' });
    expect(updated).toEqual({
      ...created,
      updatedAt: new Date('2026-01-01T00:00:01.000Z'),
      data: { author: 'Jana', quote: 'Even better', rating: 5 },
    });
  });

  test('throws DocumentValidationError carrying the id for invalid data', async () => {
    const { repo } = setup();
    const created = await repo.create({ author: 'Jana', quote: 'Great' });
    const error: unknown = await repo
      .update(created.id, { author: 1 } as never)
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(DocumentValidationError);
    expect((error as DocumentValidationError).id).toBe(created.id);
  });

  test('throws DocumentNotFoundError for a missing document', async () => {
    const { repo } = setup();
    await expect(repo.update('missing', { author: 'A', quote: 'a' })).rejects.toBeInstanceOf(
      DocumentNotFoundError,
    );
  });

  test('refuses a document stored at a newer schema version and leaves it unchanged', async () => {
    const { store, repo } = setup();
    const newer = {
      id: 'newer',
      type: 'testimonial',
      key: null,
      schemaVersion: 2,
      data: { author: 'Jana', quote: 'Great', extra: 'kept' },
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
    await store.documents.insert(newer);
    await expect(repo.update('newer', { author: 'Jana', quote: 'Changed' })).rejects.toBeInstanceOf(
      DocumentSchemaVersionError,
    );
    expect(await store.documents.get('testimonial', 'newer')).toEqual(newer);
  });
});

describe('delete', () => {
  test('removes the document, then throws DocumentNotFoundError', async () => {
    const { repo } = setup();
    const created = await repo.create({ author: 'Jana', quote: 'Great' });
    await repo.delete(created.id);
    expect(await repo.get(created.id)).toBeNull();
    await expect(repo.delete(created.id)).rejects.toBeInstanceOf(DocumentNotFoundError);
  });
});

describe('list', () => {
  test('pages through documents in creation order', async () => {
    const { repo } = setup();
    for (const author of ['A', 'B', 'C', 'D', 'E']) {
      await repo.create({ author, quote: author });
    }
    const authors: string[][] = [];
    let cursor: string | null = null;
    do {
      const page = await repo.list({ limit: 2, cursor });
      authors.push(page.items.map((item) => item.data.author));
      cursor = page.nextCursor;
    } while (cursor !== null);
    expect(authors).toEqual([['A', 'B'], ['C', 'D'], ['E']]);
  });

  test('pages through documents with non-ASCII ids', async () => {
    let n = 0;
    const repo = createDocumentRepository(createMemoryStore().documents, testimonials, {
      now: () => new Date(0),
      generateId: () => `ž-${String(++n)}-🐎`,
    });
    for (const author of ['A', 'B', 'C']) {
      await repo.create({ author, quote: author });
    }
    const first = await repo.list({ limit: 2 });
    const second = await repo.list({ limit: 2, cursor: first.nextCursor });
    expect([...first.items, ...second.items].map((item) => item.data.author)).toEqual([
      'A',
      'B',
      'C',
    ]);
    expect(second.nextCursor).toBeNull();
  });

  test('returns no next cursor when the page is exactly full', async () => {
    const { repo } = setup();
    await repo.create({ author: 'A', quote: 'a' });
    await repo.create({ author: 'B', quote: 'b' });
    expect((await repo.list({ limit: 2 })).nextCursor).toBeNull();
  });

  test.each([0, -1, 1.5])('rejects limit %s', async (limit) => {
    const { repo } = setup();
    await expect(repo.list({ limit })).rejects.toBeInstanceOf(RangeError);
  });

  test.each([
    'not base64!',
    btoa('not json'),
    btoa('{"c":1,"i":"x"}'),
    btoa('{"c":"nope","i":"x"}'),
  ])('rejects malformed cursor %s', async (cursor) => {
    const { repo } = setup();
    await expect(repo.list({ limit: 1, cursor })).rejects.toBeInstanceOf(InvalidCursorError);
  });
});

describe('reading stored documents', () => {
  const insertRaw = async (store: Store, data: unknown, schemaVersion: number) => {
    await store.documents.insert({
      id: 'stored',
      type: 'testimonial',
      key: null,
      schemaVersion,
      data,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    });
  };

  test('throws DocumentValidationError with id and issues for invalid stored data', async () => {
    const { store, repo } = setup();
    await insertRaw(store, { author: 'Jana' }, 1);
    const error: unknown = await repo.get('stored').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(DocumentValidationError);
    expect((error as DocumentValidationError).id).toBe('stored');
    expect((error as DocumentValidationError).issues).not.toHaveLength(0);
  });

  test('throws DocumentSchemaVersionError for a version newer than the collection', async () => {
    const { store, repo } = setup();
    await insertRaw(store, { author: 'Jana', quote: 'Great' }, 2);
    await expect(repo.get('stored')).rejects.toBeInstanceOf(DocumentSchemaVersionError);
  });

  test('migrates older documents on read without writing them back', async () => {
    const store = createMemoryStore();
    const v2 = defineCollection({
      type: 'testimonial',
      schema: z.object({ name: z.string(), quote: z.string() }),
      version: 2,
      migrate: (old, fromVersion) => {
        expect(fromVersion).toBe(1);
        const { author, quote } = old as { author: string; quote: string };
        return { name: author, quote };
      },
    });
    await insertRaw(store, { author: 'Jana', quote: 'Great' }, 1);
    const repo = createDocumentRepository(store.documents, v2);
    expect((await repo.get('stored'))?.data).toEqual({ name: 'Jana', quote: 'Great' });
    expect((await store.documents.get('testimonial', 'stored'))?.schemaVersion).toBe(1);
  });

  test('throws DocumentValidationError with the id when migrated data is invalid', async () => {
    const store = createMemoryStore();
    const v2 = defineCollection({
      type: 'testimonial',
      schema: z.object({ name: z.string() }),
      version: 2,
      migrate: () => ({ name: 42 as unknown as string }),
    });
    await insertRaw(store, { author: 'Jana' }, 1);
    const error: unknown = await createDocumentRepository(store.documents, v2)
      .get('stored')
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(DocumentValidationError);
    expect((error as DocumentValidationError).id).toBe('stored');
  });

  test('wraps a throwing migrate in DocumentMigrationError', async () => {
    const store = createMemoryStore();
    const failure = new Error('cannot migrate');
    const v2 = defineCollection({
      type: 'testimonial',
      schema: z.object({ quote: z.string() }),
      version: 2,
      migrate: () => {
        throw failure;
      },
    });
    await insertRaw(store, { quote: 'Great' }, 1);
    const error: unknown = await createDocumentRepository(store.documents, v2)
      .get('stored')
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(DocumentMigrationError);
    expect((error as DocumentMigrationError).id).toBe('stored');
    expect((error as DocumentMigrationError).cause).toBe(failure);
  });

  test('a schema whose output is not JSON fails on read', async () => {
    const store = createMemoryStore();
    const events = defineCollection({ type: 'event', schema: z.object({ at: z.date() }) });
    const repo = createDocumentRepository(store.documents, events);
    const created = await repo.create({ at: new Date(0) });
    await expect(repo.get(created.id)).rejects.toBeInstanceOf(DocumentValidationError);
  });
});
