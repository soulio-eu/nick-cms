# CLAUDE.md

Before doing any work, load and follow the `house-rules` skill.

## Where to find things

- [README.md](README.md): what Nick is, the scope of v1, development setup.
- [docs/index.md](docs/index.md): index of every design document. Find the document for the area you touch there.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): package list and ADR index. Read the relevant ADRs before any change that adds a package, crosses a package boundary or changes a public interface.

The docs are the source of truth for scope and design. When a change contradicts them, raise it instead of following the code or the issue silently. Architectural decisions are recorded as ADRs; see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#architecture-decision-records).

## Issues

Work is tracked in GitHub Issues on `soulio-eu/nick-cms`. Use the `gh` CLI to read and update them.

## Toolchain

- If a `node` or `pnpm` command fails unexpectedly, check that `node --version` matches the major version in `.nvmrc`.
- Use pnpm, not npm or yarn.
