# 0008. Share the consumer's database

Status: Accepted

## Context

Nick's tables live in the consumer's database, next to the consumer's own, and library releases change their schema.

## Decision

- Nick's tables are prefixed `nick_`.
- Library migrations ship inside the package. The consumer copies them into its project, next to its own migrations, and applies both with the same tool.
- The copies are verified against the shipped files.
- `loadApp()` compares applied migrations with the shipped list and returns `unavailable` while any are pending.
- Consumer migrations that depend on library tables are unsupported.

## Consequences

- ✅ One database and one migration history, both under the consumer's control.
- ⚠️ Upgrades with migrations need a sync and an apply.
