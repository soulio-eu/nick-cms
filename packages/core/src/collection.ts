import type { z } from 'zod';

interface CollectionBase<S extends z.ZodType> {
  /** Identifies the collection's documents in the store. */
  type: string;
  /** Validates documents. Its output must be a JSON value that it accepts again as input. */
  schema: S;
}

/** Turns a document stored at `fromVersion` into input for the current schema. */
export type Migrate<S extends z.ZodType> = (old: unknown, fromVersion: number) => z.input<S>;

export type CollectionDefinition<S extends z.ZodType> = CollectionBase<S> &
  ({ version?: 1 | undefined; migrate?: undefined } | { version: number; migrate: Migrate<S> });

export interface Collection<S extends z.ZodType> {
  readonly type: string;
  readonly schema: S;
  readonly version: number;
  readonly migrate: Migrate<S> | undefined;
}

/**
 * Defines a typed collection. `version` defaults to 1; a collection above version 1 needs
 * `migrate`. Throws `TypeError` for an empty type or a version that is not a positive integer.
 */
export function defineCollection<S extends z.ZodType>(
  definition: CollectionDefinition<S>,
): Collection<S> {
  const version = definition.version ?? 1;
  if (definition.type === '') {
    throw new TypeError('Collection type must not be empty.');
  }
  if (!Number.isInteger(version) || version < 1) {
    throw new TypeError(`Collection version must be a positive integer, got ${String(version)}.`);
  }
  if (version > 1 && definition.migrate === undefined) {
    throw new TypeError(
      `Collection "${definition.type}" is at version ${String(version)} but has no migrate.`,
    );
  }
  return Object.freeze({
    type: definition.type,
    schema: definition.schema,
    version,
    migrate: definition.migrate,
  });
}
