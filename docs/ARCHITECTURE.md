# Architecture

## Layers

From the consumer inward:

1. Consumer components and consumer server code.
2. `svelte` (context getters, `NickApp`, `Seo`), `kit` (`nickHandle`, `loadApp`, SEO handlers) and `admin` (admin components and handlers).
3. `core`: domains, typed collections, repository ports and the `Store` port.

Adapters implement the `Store` port: `d1`, plus the further adapters listed in [Storage](storage.md#adapters).

Dependency rules:

- Dependencies point inward at `core`, which owns the domain and the ports.
- Nothing in `core` or `svelte` imports an adapter or a SvelteKit server API.
- Only `kit` and `admin` touch `RequestEvent`. They are adapter-agnostic because the consumer supplies the `store(event)` factory.
- The consumer chooses the adapter in `hooks.server.ts`.

## Packages

Each layer is a package in a pnpm workspace. Optional modules with their own domains (e-commerce, for example) are further packages on the same core.

| Package            | Layer                                          | Peer dependencies | Dependencies |
| ------------------ | ---------------------------------------------- | ----------------- | ------------ |
| `@nick-cms/core`   | Domain, ports, collections                     | Zod               | —            |
| `@nick-cms/svelte` | Contexts, `NickApp`, `Seo`                     | core, Svelte      | —            |
| `@nick-cms/kit`    | Handle, load helpers, SEO handlers, `nick` CLI | core, SvelteKit   | svelte       |
| `@nick-cms/d1`     | D1 store, migrations                           | core              | —            |
| `@nick-cms/admin`  | Admin components and handlers                  | core, SvelteKit   | svelte, kit  |

- `@nick-cms/core` is a peer dependency of every other package, so a consumer always has exactly one copy of core.
- Internal dependencies use `workspace:^`.

Versioning and publishing are in [Releasing](releasing.md).

## Composition roots

There are two composition roots, because Svelte context does not reach `load` functions and the D1 binding exists only on the server.

| Root      | Where                             | Scope                                      | Holds                                                          |
| --------- | --------------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| Server    | `nickHandle` in `hooks.server.ts` | One per request, on `event.locals.nick`    | Repositories bound to the store                                |
| Component | `<NickApp>` in a layout           | One per component tree, via Svelte context | Loaded read models (settings, menus), SEO context, BFF clients |

Repositories are never placed in Svelte context: a component cannot await one during SSR, and in the browser it has no store to call. Components read data that `load` already fetched, and reach the server for anything else through a client that calls a `+server.ts` endpoint the consumer mounts with the library's handler.

The injection API and failure handling are in [Dependency injection](dependency-injection.md).

## Architecture decision records

Each architectural decision is recorded as an ADR in `docs/adr/` when it is made. Add every new or superseding ADR to this index.

| ADR | Title |
| --- | ----- |
