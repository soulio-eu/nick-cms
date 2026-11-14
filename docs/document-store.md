# Document store

Any data without a [first-party domain](domains.md) lives in one generic table and is accessed through typed collections.

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

- Writes validate against the schema before storing. Invalid input throws `DocumentValidationError`.
- Reads validate too. A stored document that fails throws `DocumentValidationError` carrying the id and the issues.
- `key` is an optional per-type unique string, for slug-style lookup without querying JSON.

## Schemas

- Schemas are Zod schemas.
- The admin UI derives collection forms from them through `z.toJSONSchema`. UI hints (label, widget, order) live in `.meta()`.
- Each document stores `schemaVersion`. A collection may declare `version` and `migrate(old, fromVersion)`, applied on read.

## Limits

Filtering by fields inside `data` is out of v1. Data that needs filtering or relations is a candidate for a first-party domain.

The table layout is in [Storage](storage.md#tables).
