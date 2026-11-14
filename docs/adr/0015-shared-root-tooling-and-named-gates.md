# 0015. Shared root tooling and named gates

Status: Accepted

## Context

The workspace holds plain TypeScript packages, Svelte packages and apps. CI has to gate each of them without per-project setup.

## Decision

- Dev tools are root dev dependencies, one version each. A project declares its runtime and peer dependencies, plus tools no other project uses.
- One ESLint config and one Prettier config at the root cover every project. Plain TypeScript packages extend the root `tsconfig.base.json`; Svelte projects use SvelteKit's generated config.
- A gate is a script with the same name in every project that runs it. CI checks formatting for the whole workspace, then runs every gate in every selected project that has it. A pull request that changes only projects or docs selects the changed projects, their dependents and the dependencies of both; anything else selects all projects.

## Consequences

- ✅ Upgrading a tool is one change.
- ✅ A new project joins CI without a workflow change.
- ⚠️ A project's gates need its workspace dependencies built first.
- ⚠️ Nothing stops a project from redeclaring a root tool.
- ❌ A project can't use a different version of a shared tool.
