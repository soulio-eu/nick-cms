# Storage

`core` defines a `Store` port that yields every repository. The D1 adapter implements it with SQL; other adapters implement the same port.

## Tables

- Tables are prefixed `nick_`, so they coexist with the consumer's own tables in the same database.
- The [document store](document-store.md) uses one generic table:

  ```sql
  nick_documents(
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    key TEXT,
    schema_version INTEGER NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT
  )
  ```

  with `UNIQUE(type, key)` and an index on `(type, created_at)`.

- [First-party domains](domains.md) get normalized tables: `nick_pages`, `nick_posts`, `nick_menus`, `nick_menu_items`, `nick_users`, `nick_settings`.

## Migrations

- Migrations ship as numbered SQL files inside the package.
- `nick migrations sync` copies them into `migrations/nick/`. Consumer migrations live in `migrations/app/`.
- The D1 binding sets `migrations_dir` to `migrations` and `migrations_pattern` to `migrations/*/*.sql`.
- `nick migrations check` exits non-zero when `migrations/nick/` lacks a shipped file or a copied file's hash differs. The consumer decides where it runs; an optional Vite plugin runs it during `vite build`.
- `loadApp()` compares applied migrations with the shipped list and returns `unavailable` when library migrations are pending on the target database.
- Consumer migrations that depend on library tables are unsupported.

## Adapters

- **D1** (`@nick-cms/d1`): depends on the `D1Database` type only, so core and the adapter carry no runtime Cloudflare dependency.
- **Node SQLite** ([out of v1 scope](../README.md#scope-of-v1)): D1 is SQLite, so the SQL layer is written against a minimal driver interface that an adapter over `better-sqlite3` or libSQL can reuse.
- **Firestore** ([out of v1 scope](../README.md#scope-of-v1)): implements the same `Store` port with collections. It ships as its own package because of the `firebase-admin` dependency.
