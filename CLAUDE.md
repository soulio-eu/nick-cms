# CLAUDE.md

Before doing any work, load and follow the `house-rules` skill.

## Project brief

The project brief is the description of the Linear project "Nick CMS". Fetch it with one call to the Linear MCP `get_project` tool:

- id: `6aaf96a1-9242-4da3-90de-4e2ab5b7f021`

Treat that description as the source of truth for scope and design decisions.

## Toolchain

- If a `node` or `pnpm` command fails unexpectedly, check that `node --version` matches the major version in `.nvmrc`.
- Use pnpm, not npm or yarn.
