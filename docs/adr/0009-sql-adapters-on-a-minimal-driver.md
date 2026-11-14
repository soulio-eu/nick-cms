# 0009. SQL adapters on a minimal driver interface

Status: Accepted

## Context

D1 is SQLite, and so are the Node backends Nick may support (`better-sqlite3`, libSQL).

## Decision

- The D1 adapter depends on the `D1Database` type only, so core and the adapter carry no runtime Cloudflare dependency.
- The SQL layer is written against a minimal driver interface that other SQLite adapters reuse.

## Consequences

- ✅ The SQL is written once for every SQLite backend.
- ⚠️ The SQL stays within what D1 and the Node drivers share.
