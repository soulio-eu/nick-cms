/** A document as an adapter persists it. `data` is a JSON value; dates keep millisecond precision. */
export interface StoredDocument {
  id: string;
  type: string;
  key: string | null;
  schemaVersion: number;
  data: unknown;
  createdAt: Date;
  updatedAt: Date;
}

/** A position in a type's documents, ordered by `createdAt`, then `id` compared by its UTF-8 bytes. */
export interface DocumentPosition {
  createdAt: Date;
  id: string;
}

/** The outcome of `DocumentRecords.replace`. */
export type ReplaceResult =
  | { outcome: 'replaced'; document: StoredDocument }
  | { outcome: 'missing' }
  | { outcome: 'newer'; schemaVersion: number };

/**
 * The records port for the document store. Every operation is scoped by `type`: documents of
 * another type are invisible to it. Ids are unique across all types.
 */
export interface DocumentRecords {
  get(type: string, id: string): Promise<StoredDocument | null>;
  getByKey(type: string, key: string): Promise<StoredDocument | null>;
  /**
   * Up to `limit` documents in `DocumentPosition` order, strictly after `after`. `after` need not
   * be a stored document.
   */
  list(
    type: string,
    options: { limit: number; after?: DocumentPosition | undefined },
  ): Promise<StoredDocument[]>;
  /**
   * Stores a new document. Throws `DocumentKeyConflictError` when another document of the same
   * type holds its key; documents without a key never conflict. Rejects when the id exists.
   */
  insert(document: StoredDocument): Promise<void>;
  /**
   * Replaces data, schema version and `updatedAt`, unless the stored schema version is newer than
   * `change.schemaVersion`; then it changes nothing and reports the stored version. The check and
   * the write are atomic. Reports `missing` when the document doesn't exist.
   */
  replace(
    type: string,
    id: string,
    change: { data: unknown; schemaVersion: number; updatedAt: Date },
  ): Promise<ReplaceResult>;
  /** Returns `false` when the document is missing. */
  delete(type: string, id: string): Promise<boolean>;
}

/** The storage port that adapters implement. */
export interface Store {
  readonly documents: DocumentRecords;
}
