# 0006. First-party domains and a document store

Status: Accepted

## Context

Sites share a few well-known entities and also define data of their own.

## Decision

- [First-party domains](../domains.md) get normalized tables.
- Any other data is a document in one generic table, accessed through typed collections.

## Consequences

- ✅ A site adds a data type without a migration.
- ⚠️ Data that needs filtering or relations is a candidate for a first-party domain.
- ❌ No filtering by fields inside a document's data in v1.
