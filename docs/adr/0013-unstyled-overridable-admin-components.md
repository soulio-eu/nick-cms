# 0013. Unstyled, overridable admin components

Status: Accepted

## Context

Sites differ in look and in how users sign in. The admin UI has to fit each without a fork.

## Decision

- Writes go through SvelteKit form actions.
- No theme ships. Components expose `class` props and CSS custom properties.
- Snippets replace a field editor, a list row or a whole screen, keyed by domain, collection or field type.
- First-party domains get hand-built editors. Collections get forms generated from their schema.
- Every admin request passes the consumer's `authorize(event)` hook, which returns a [role](../domains.md) or rejects.

## Consequences

- ✅ Editing works without client JavaScript.
- ⚠️ The admin UI is unstyled until the consumer styles it.
