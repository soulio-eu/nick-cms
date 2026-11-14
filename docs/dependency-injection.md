# Dependency injection

Components receive dependencies through Svelte context, provided by `<NickApp>`. Why there are two composition roots, and why repositories stay out of context, is in [ADR 0004](adr/0004-two-composition-roots.md).

## Injection API

Each dependency is a Svelte `createContext<T>()` triplet `[get, set, has]`; the type replaces the key.

- The library exports the getter and `has` for each dependency it provides (e.g. `getSiteSettings`, `hasSiteSettings`). Setters stay internal to `NickApp`.
- A getter throws when nothing provides its dependency, so the nearest boundary renders its fallback.
- `has()` lets a component render a degraded state instead of failing.
- Consumers create triplets the same way for their own dependencies.

## Failure handling

- `loadApp()` returns `{ status: 'ready', ... }` or `{ status: 'unavailable', error }`. It never throws on store failure.
- `NickApp` sets its contexts only when status is `ready`. Otherwise it renders the `fallback` snippet and nothing below it.
- `NickApp` wraps its children in `<svelte:boundary>`, so a getter's missing-context error renders the same `fallback` instead of SvelteKit's error page. Consumers add their own boundaries to fail one region instead of the whole tree.
- Unsatisfied means not provided: a dependency that failed to load is never set, so `has()` is false and the getter throws.
