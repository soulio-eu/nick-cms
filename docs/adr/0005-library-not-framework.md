# 0005. Library, not framework

Status: Accepted

## Context

Consumers start from a stock `sv create` project and keep control of it.

## Decision

- Nick owns no routes, build steps or project layout.
- The consumer mounts what Nick ships on routes and hooks of its choice.

## Consequences

- ✅ Nick plugs into a stock SvelteKit project.
- ⚠️ Each feature needs consumer wiring: a hook, a route or a handler.
