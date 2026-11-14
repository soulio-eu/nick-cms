# Releasing

Each package in the workspace is versioned and published on its own. The packages are listed in [Architecture](ARCHITECTURE.md#packages).

- A release of a package also releases every package that depends on it, with at least a patch bump.
- release-please in manifest mode derives versions and changelogs from Conventional Commits, with the node-workspace plugin bumping dependents.
- Merging the release PR tags the release. `pnpm -r publish` then publishes the versions not yet on npm.
- `pnpm publish` replaces `workspace:^` dependencies with the released version range.
