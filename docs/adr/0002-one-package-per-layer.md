# 0002. One package per layer

Status: Accepted

## Context

The layers depend on different things (Svelte, SvelteKit, a storage driver), and optional modules add their own domains.

## Decision

- Each layer and each optional module is its own package in the pnpm workspace. Adapters ship outside the layer packages.
- `@nick-cms/core` is a peer dependency of every other package, so a consumer has exactly one copy of core.
- Internal dependencies use `workspace:^`.

## Consequences

- ✅ A consumer installs only the layers and adapters it uses.
- ✅ A heavy adapter dependency, such as `firebase-admin`, stays out of the layer packages.
