# 0004. Two composition roots

Status: Accepted

## Context

Svelte context does not reach `load` functions, and the store (the D1 binding, for example) exists only on the server. A component cannot await a repository during SSR, and in the browser it has no store to call.

## Decision

| Root      | Where                             | Scope                                      | Holds                                                          |
| --------- | --------------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| Server    | `nickHandle` in `hooks.server.ts` | One per request, on `event.locals.nick`    | Repositories bound to the store                                |
| Component | `<NickApp>` in a layout           | One per component tree, via Svelte context | Loaded read models (settings, menus), SEO context, BFF clients |

- Repositories are never placed in Svelte context.
- Components read data that `load` already fetched. For anything else they call a BFF client, which calls a `+server.ts` endpoint the consumer mounts with the library's handler.

## Consequences

- ⚠️ Reads beyond the loaded read models need a BFF client and an endpoint.
