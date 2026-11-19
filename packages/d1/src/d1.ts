/** The result of running a statement: the rows it returned, if any. */
export interface D1ResultLike<T = unknown> {
  results: T[];
}

/** A prepared statement, as the store uses it. */
export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1ResultLike<T>>;
}

/**
 * The part of a D1 database the store uses. A `D1Database` binding satisfies it. `batch` runs its
 * statements in one transaction.
 */
export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
  batch<T = unknown>(statements: D1PreparedStatementLike[]): Promise<D1ResultLike<T>[]>;
}
