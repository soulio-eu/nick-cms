# Storage

The `Store` port: [ADR 0003](adr/0003-core-owns-the-ports.md). The D1 adapter implements it with SQL.

## Tables

Table prefix and migration sharing: [ADR 0008](adr/0008-share-the-consumers-database.md).

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

- [First-party domain](domains.md) tables: `nick_pages`, `nick_posts`, `nick_menus`, `nick_menu_items`, `nick_users`, `nick_settings`.

## Migrations

- Library migrations are numbered SQL files.
- `nick migrations sync` copies them into `migrations/nick/`. Consumer migrations live in `migrations/app/`.
- The D1 binding sets `migrations_dir` to `migrations` and `migrations_pattern` to `migrations/*/*.sql`.
- `nick migrations check` exits non-zero when `migrations/nick/` lacks a shipped file or a copied file's hash differs. The consumer decides where it runs; an optional Vite plugin runs it during `vite build`.

## Adapters

SQL adapters share one SQL layer ([ADR 0009](adr/0009-sql-adapters-on-a-minimal-driver.md)).

- **D1** (`@nick-cms/d1`).
- **Node SQLite** ([out of v1 scope](../README.md#scope-of-v1)): over `better-sqlite3` or libSQL.
- **Firestore** ([out of v1 scope](../README.md#scope-of-v1)): implements `Store` with Firestore collections.
