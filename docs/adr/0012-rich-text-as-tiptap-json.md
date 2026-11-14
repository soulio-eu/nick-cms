# 0012. Rich text as Tiptap JSON

Status: Accepted

## Context

Page and post bodies are rich text, edited in the admin UI and rendered during SSR.

## Decision

- Bodies are stored as Tiptap (ProseMirror) JSON and edited with Tiptap in the admin UI.
- The library ships an HTML renderer for SSR. Consumers may render the JSON themselves.

## Consequences

- ✅ Stored content is structured, not HTML.
- ⚠️ Stored content is tied to Tiptap's document schema.
