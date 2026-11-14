# 0001. Record architecture decisions

Status: Accepted

## Context

Decisions outlive the discussions that made them. Their readers are people and agents.

## Decision

- Each architectural decision is an ADR at `docs/adr/NNNN-kebab-title.md`, numbered in sequence and listed in the [index](../ARCHITECTURE.md#architecture-decision-records).
- Sections: `Status`, `Context`, `Decision`, `Consequences`. Add `Alternatives` only when a real alternative was considered and rejected.
- Consequences are one bullet each, led by ✅ (benefit), ⚠️ (trade-off) or ❌ (limit).
- Use as few words as the decision needs. Link to values owned elsewhere instead of copying them.
- No dates or deciders; git and the pull request hold them.
- An ADR is accepted when it merges and is not edited afterwards. An addition goes in a dated `Addenda` section. A reversal is a new ADR; the old one's status becomes `Superseded by NNNN`.
- A decision is stated only in its ADR. Other documents link to it.

## Consequences

- ⚠️ Changing a decision takes a new ADR or an addendum, not an edit.
