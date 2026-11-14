# 0011. Degrade to a fallback

Status: Accepted

## Context

A store failure or a missing dependency should not send a site to SvelteKit's error page.

## Decision

- `loadApp()` returns `{ status: 'ready', ... }` or `{ status: 'unavailable', error }`. It never throws on store failure.
- `NickApp` sets its contexts only when status is `ready`. Otherwise it renders its `fallback` snippet and nothing below it.
- `NickApp` wraps its children in `<svelte:boundary>`, so a getter's missing-context error renders the same `fallback`.
- A getter throws when nothing provides its dependency. `has()` lets a component render a degraded state instead.
- A dependency that failed to load is never set: unsatisfied means not provided.

## Consequences

- ✅ The consumer decides what an outage looks like.
- ✅ A consumer's own boundary fails one region instead of the whole tree.
