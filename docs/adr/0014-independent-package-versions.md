# 0014. Independent package versions

Status: Accepted

## Context

Packages change at different rates, and a consumer installs only some of them.

## Decision

- Each package is versioned and published on its own.
- A release of a package also releases every package that depends on it, with at least a patch bump.
- Versions and changelogs are derived from Conventional Commits. How a release is cut is in [Releasing](../releasing.md).

## Consequences

- ⚠️ Releases depend on every commit message following Conventional Commits.
