# Document store

Typed collections over the generic document table ([ADR 0006](adr/0006-domains-and-document-store.md)).

```ts
export const testimonials = defineCollection({
  type: 'testimonial',
  schema: z.object({ author: z.string(), quote: z.string(), rating: z.number().int() }),
});

const repo = locals.nick.collection(testimonials); // DocumentRepository<typeof testimonials.schema>
await repo.create({ author: 'Jana', quote: '…', rating: 5 });
```

## Repository contract

`createDocumentRepository(store.documents, collection)` returns a `DocumentRepository`. Its documents are `{ id, key, createdAt, updatedAt, data }`.

| Method                     | Returns                                                           | Throws                                                                                             |
| -------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `get(id)`, `getByKey(key)` | The document or `null`                                            |                                                                                                    |
| `list({ limit, cursor? })` | `{ items, nextCursor }`, ordered by `createdAt`, then `id`        | `RangeError` for a `limit` that isn't a positive integer, `InvalidCursorError`                     |
| `create(data, { key? })`   | The document                                                      | `DocumentValidationError`, `DocumentKeyConflictError`, `TypeError` for an empty key                |
| `update(id, data)`         | The document, with `data` replaced and `key` and `createdAt` kept | `DocumentValidationError` (carrying the id), `DocumentNotFoundError`, `DocumentSchemaVersionError` |
| `delete(id)`               | Nothing                                                           | `DocumentNotFoundError`                                                                            |

- A read whose stored data fails validation throws `DocumentValidationError` carrying the id and the issues.
- `key` is an optional per-type unique string, for slug-style lookup without querying JSON. It can't change after `create`.
- Documents created in the same millisecond list in id order.
- How the repository relates to the `Store` port is in [ADR 0016](adr/0016-adapters-store-records.md).

## Schemas

Schemas, validation and versioning are decided in [ADR 0007](adr/0007-zod-schemas-validated-on-write-and-read.md).

- The schema's output is what gets stored, so it must be a JSON value the schema accepts again as input. A `z.date()` field, for example, fails on read.
- Admin forms are generated through `z.toJSONSchema`. UI hints (label, widget, order) go in `.meta()`.
- Optional collection fields: `version` (default 1), `migrate(old, fromVersion)`, required above version 1. The stored field is `schemaVersion`.
- A document stored at an older version is migrated on read and never written back. A throwing `migrate` raises `DocumentMigrationError` with the id and the original error as `cause`. A newer stored version throws `DocumentSchemaVersionError` on read and on update.

The table layout is in [Storage](storage.md#tables).
