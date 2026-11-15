# 0003. Core owns the ports

Status: Accepted

## Context

The `Store` port must allow backends beyond D1 ([scope](../../README.md#scope-of-v1)) without changing the domain.

## Decision

- Layers, from the consumer inward: consumer code; `svelte`, `kit` and `admin`; `core`.
- `core` owns the domain, typed collections, repository ports and the `Store` port, which yields every repository. Adapters implement `Store`.
- Dependencies point inward at `core`. Nothing in `core` or `svelte` imports an adapter or a SvelteKit server API.
- Only `kit` and `admin` touch `RequestEvent`. They get the store from a consumer-supplied `store(event)` factory, so they stay adapter-agnostic.
- The consumer chooses the adapter in `hooks.server.ts`.

## Consequences

- ✅ A new backend is a new adapter; no other package changes.
- ⚠️ The `Store` port has to fit document databases as well as SQL.

## Addenda

### 2026-11-15: The document store's port

For documents, the repository the `Store` yields is a records port, and `core` builds the typed repositories on it ([ADR 0016](0016-adapters-store-records.md)).
