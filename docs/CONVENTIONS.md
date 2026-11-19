# Conventions

Rules that apply across packages and are easy to miss in the code.

## Storage adapters

- Run statements that must be atomic as one transaction. On D1, send them in one `db.batch([...])`, which runs as a transaction ([D1 batch statements](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch)).
- Report conflicts through the database's constraints, e.g. `INSERT … ON CONFLICT (…) DO NOTHING RETURNING …`, not by parsing error messages.

The D1 document records in [`packages/d1/src/documents.ts`](../packages/d1/src/documents.ts) follow both.
