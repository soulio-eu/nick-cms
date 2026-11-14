# 0010. Typed context injection

Status: Accepted

## Context

Components receive their dependencies through Svelte context, provided by `<NickApp>`.

## Decision

- Each dependency is a Svelte `createContext<T>()` triplet `[get, set, has]`; the type replaces the key.
- The library exports the getter and `has` for each dependency it provides (e.g. `getSiteSettings`, `hasSiteSettings`). Setters stay internal to `NickApp`.
- Consumers create triplets the same way for their own dependencies.

## Consequences

- ✅ Library and consumer dependencies are injected the same way.
