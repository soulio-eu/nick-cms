# 0007. Zod schemas, validated on write and read

Status: Accepted

## Context

A document's shape is defined in consumer code, while stored documents outlive changes to it.

## Decision

- Collection schemas are Zod schemas.
- Documents are validated before every write and on every read.
- Each document stores its schema version. A collection may declare a `version` and a `migrate` function, applied on read.

## Consequences

- ✅ A stored document that no longer fits its schema fails with an error instead of reaching a component.
- ⚠️ Every read pays for validation.
