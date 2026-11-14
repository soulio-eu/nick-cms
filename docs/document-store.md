# Document store

Typed collections over the generic document table ([ADR 0006](adr/0006-domains-and-document-store.md)).

```ts
export const testimonials = defineCollection({
  type: 'testimonial',
  schema: z.object({ author: z.string(), quote: z.string(), rating: z.number().int() }),
});

const repo = locals.nick.collection(testimonials); // DocumentRepository<Testimonial>
await repo.create({ author: 'Jana', quote: '…', rating: 5 });
```

## Repository contract

`DocumentRepository<T>`: `get(id)`, `getByKey(key)`, `list({ limit, cursor })`, `create(data, { key? })`, `update(id, data)`, `delete(id)`.

- A write with invalid input throws `DocumentValidationError`.
- A read of a stored document that fails validation throws `DocumentValidationError` carrying the id and the issues.
- `key` is an optional per-type unique string, for slug-style lookup without querying JSON.

## Schemas

Schemas, validation and versioning are decided in [ADR 0007](adr/0007-zod-schemas-validated-on-write-and-read.md).

- Admin forms are generated through `z.toJSONSchema`. UI hints (label, widget, order) go in `.meta()`.
- Optional collection fields: `version`, `migrate(old, fromVersion)`. The stored field is `schemaVersion`.

The table layout is in [Storage](storage.md#tables).
