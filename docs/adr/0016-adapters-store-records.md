# 0016. Adapters store records; core owns document semantics

Status: Accepted

## Context

If adapters implemented typed repositories, each would repeat the validation, migration and id rules.

## Decision

- The `Store` port exposes `documents`: a records port over stored documents, scoped by type.
- `core` builds each typed `DocumentRepository` on that port and owns ids, timestamps, validation, migration and list cursors.
- Adapters persist records and enforce key uniqueness per type and id uniqueness across types.
- `@nick-cms/core/testing` exports the port's contract suite, `describeStoreContract`. Every adapter runs it.

## Consequences

- ✅ Document rules are written and tested once.
- ✅ Every adapter is checked against the same contract.
- ⚠️ `core` publishes a Vitest-based test helper; Vitest is an optional peer dependency.
