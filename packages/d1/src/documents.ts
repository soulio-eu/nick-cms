import { DocumentKeyConflictError } from '@nick-cms/core';
import type { DocumentRecords, ReplaceResult, StoredDocument } from '@nick-cms/core';

import type { D1DatabaseLike } from './d1.js';

interface DocumentRow {
  id: string;
  type: string;
  key: string | null;
  schema_version: number;
  data: string;
  created_at: string;
  updated_at: string;
}

const COLUMNS = 'id, type, key, schema_version, data, created_at, updated_at';

function toDocument(row: DocumentRow): StoredDocument {
  return {
    id: row.id,
    type: row.type,
    key: row.key,
    schemaVersion: row.schema_version,
    data: JSON.parse(row.data) as unknown,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/** The `DocumentRecords` port over the `nick_documents` table. */
export function createD1DocumentRecords(db: D1DatabaseLike): DocumentRecords {
  return {
    async get(type, id) {
      const row = await db
        .prepare(`SELECT ${COLUMNS} FROM nick_documents WHERE type = ? AND id = ?`)
        .bind(type, id)
        .first<DocumentRow>();
      return row === null ? null : toDocument(row);
    },

    async getByKey(type, key) {
      const row = await db
        .prepare(`SELECT ${COLUMNS} FROM nick_documents WHERE type = ? AND key = ?`)
        .bind(type, key)
        .first<DocumentRow>();
      return row === null ? null : toDocument(row);
    },

    async list(type, { limit, after }) {
      const statement =
        after === undefined
          ? db
              .prepare(
                `SELECT ${COLUMNS} FROM nick_documents WHERE type = ?
                 ORDER BY created_at, id LIMIT ?`,
              )
              .bind(type, limit)
          : db
              .prepare(
                `SELECT ${COLUMNS} FROM nick_documents WHERE type = ? AND (created_at, id) > (?, ?)
                 ORDER BY created_at, id LIMIT ?`,
              )
              .bind(type, after.createdAt.toISOString(), after.id, limit);
      const { results } = await statement.all<DocumentRow>();
      return results.map(toDocument);
    },

    async insert(document) {
      // The conflict target covers only the key: a duplicate id still raises its constraint error.
      const inserted = await db
        .prepare(
          `INSERT INTO nick_documents (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT (type, key) DO NOTHING RETURNING id`,
        )
        .bind(
          document.id,
          document.type,
          document.key,
          document.schemaVersion,
          JSON.stringify(document.data),
          document.createdAt.toISOString(),
          document.updatedAt.toISOString(),
        )
        .first();
      if (inserted === null && document.key !== null) {
        throw new DocumentKeyConflictError(document.key);
      }
    },

    async replace(type, id, change): Promise<ReplaceResult> {
      const [updated, current] = await db.batch<DocumentRow>([
        db
          .prepare(
            `UPDATE nick_documents SET data = ?, schema_version = ?, updated_at = ?
             WHERE type = ? AND id = ? AND schema_version <= ? RETURNING ${COLUMNS}`,
          )
          .bind(
            JSON.stringify(change.data),
            change.schemaVersion,
            change.updatedAt.toISOString(),
            type,
            id,
            change.schemaVersion,
          ),
        db
          .prepare(`SELECT ${COLUMNS} FROM nick_documents WHERE type = ? AND id = ?`)
          .bind(type, id),
      ]);
      const replaced = updated?.results[0];
      if (replaced !== undefined) return { outcome: 'replaced', document: toDocument(replaced) };
      const stored = current?.results[0];
      if (stored === undefined) return { outcome: 'missing' };
      return { outcome: 'newer', schemaVersion: stored.schema_version };
    },

    async delete(type, id) {
      const deleted = await db
        .prepare('DELETE FROM nick_documents WHERE type = ? AND id = ? RETURNING id')
        .bind(type, id)
        .first();
      return deleted !== null;
    },
  };
}
