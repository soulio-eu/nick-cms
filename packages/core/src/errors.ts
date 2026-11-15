import type { z } from 'zod';

/** Data failed its collection schema, on write or on read. `id` is set on update and on read. */
export class DocumentValidationError extends Error {
  override readonly name = 'DocumentValidationError';

  constructor(
    readonly issues: readonly z.core.$ZodIssue[],
    readonly id?: string,
  ) {
    super(
      id === undefined
        ? 'Document data does not match its schema.'
        : `Document ${id} does not match its schema.`,
    );
  }
}

/** No document with this id exists in the collection. */
export class DocumentNotFoundError extends Error {
  override readonly name = 'DocumentNotFoundError';

  constructor(readonly id: string) {
    super(`Document ${id} not found.`);
  }
}

/** Another document of the same type already holds this key. */
export class DocumentKeyConflictError extends Error {
  override readonly name = 'DocumentKeyConflictError';

  constructor(readonly key: string) {
    super(`A document with key "${key}" already exists.`);
  }
}

/** A stored document has a newer schema version than its collection. */
export class DocumentSchemaVersionError extends Error {
  override readonly name = 'DocumentSchemaVersionError';

  constructor(
    readonly id: string,
    readonly storedVersion: number,
    readonly collectionVersion: number,
  ) {
    super(
      `Document ${id} has schema version ${String(storedVersion)}, newer than the collection's ${String(collectionVersion)}.`,
    );
  }
}

/** The collection's `migrate` function threw for a stored document; the original error is `cause`. */
export class DocumentMigrationError extends Error {
  override readonly name = 'DocumentMigrationError';

  constructor(
    readonly id: string,
    cause: unknown,
  ) {
    super(`Migrating document ${id} failed.`, { cause });
  }
}

/** A `list` cursor is not one this library issued. */
export class InvalidCursorError extends Error {
  override readonly name = 'InvalidCursorError';

  constructor() {
    super('Invalid list cursor.');
  }
}
