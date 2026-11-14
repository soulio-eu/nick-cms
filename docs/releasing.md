# Releasing

Versioning rules are in [ADR 0014](adr/0014-independent-package-versions.md).

- release-please in manifest mode derives versions and changelogs, with the node-workspace plugin bumping dependents.
- Merging the release PR tags the release. `pnpm -r publish` then publishes the versions not yet on npm.
- `pnpm publish` replaces `workspace:^` dependencies with the released version range.
