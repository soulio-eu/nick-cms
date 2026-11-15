import { DocumentKeyConflictError } from './errors.js';
import type { Store, StoredDocument } from './store.js';

/** Copies through JSON, as a real backend would, so non-JSON data does not survive. */
function copy(document: StoredDocument): StoredDocument {
  return {
    ...document,
    data: JSON.parse(JSON.stringify(document.data)) as unknown,
    createdAt: new Date(document.createdAt),
    updatedAt: new Date(document.updatedAt),
  };
}

const encoder = new TextEncoder();

function compareUtf8(a: string, b: string): number {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  for (let i = 0; i < Math.min(left.length, right.length); i += 1) {
    const difference = (left[i] ?? 0) - (right[i] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }
  return left.length - right.length;
}

function byPosition(a: StoredDocument, b: StoredDocument): number {
  return a.createdAt.getTime() - b.createdAt.getTime() || compareUtf8(a.id, b.id);
}

export function createMemoryStore(): Store {
  const rows = new Map<string, StoredDocument>();
  const find = (type: string, id: string) => {
    const row = rows.get(id);
    return row?.type === type ? row : undefined;
  };

  return {
    documents: {
      get(type, id) {
        const row = find(type, id);
        return Promise.resolve(row === undefined ? null : copy(row));
      },

      getByKey(type, key) {
        const row = [...rows.values()].find((r) => r.type === type && r.key === key);
        return Promise.resolve(row === undefined ? null : copy(row));
      },

      list(type, { limit, after }) {
        const matching = [...rows.values()]
          .filter((r) => r.type === type)
          .filter(
            (r) =>
              after === undefined ||
              byPosition(r, { ...r, createdAt: after.createdAt, id: after.id }) > 0,
          )
          .sort(byPosition)
          .slice(0, limit);
        return Promise.resolve(matching.map(copy));
      },

      insert(document) {
        if (rows.has(document.id)) {
          return Promise.reject(new Error(`Document id ${document.id} already exists.`));
        }
        const { key } = document;
        if (
          key !== null &&
          [...rows.values()].some((r) => r.type === document.type && r.key === key)
        ) {
          return Promise.reject(new DocumentKeyConflictError(key));
        }
        rows.set(document.id, copy(document));
        return Promise.resolve();
      },

      replace(type, id, change) {
        const row = find(type, id);
        if (row === undefined) {
          return Promise.resolve({ outcome: 'missing' });
        }
        if (row.schemaVersion > change.schemaVersion) {
          return Promise.resolve({ outcome: 'newer', schemaVersion: row.schemaVersion });
        }
        const updated = copy({ ...row, ...change });
        rows.set(id, updated);
        return Promise.resolve({ outcome: 'replaced', document: copy(updated) });
      },

      delete(type, id) {
        return Promise.resolve(find(type, id) !== undefined && rows.delete(id));
      },
    },
  };
}
