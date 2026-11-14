# Admin UI

The library ships admin components, not admin routes. The consumer mounts them on a route of their choice.

- **Mount**: `src/routes/admin/[...path]/+page.svelte` renders `<NickAdmin>`; `+page.server.ts` re-exports the library's `adminLoad` and `adminActions`.
- **Writes** go through SvelteKit form actions, so editing works without client JavaScript.
- **Authorization**: every request passes the consumer's `authorize(event)` hook, which returns a role or rejects. Roles are defined in [First-party domains](domains.md).
- **Styling**: no bundled theme. Components expose `class` props and CSS custom properties.
- **Overrides**: snippets replace a field editor, a list row or a whole screen, keyed by domain, collection or field type.
- **Editors**: first-party domains get hand-built editors. Collections get forms generated from their schema (see [Document store](document-store.md#schemas)).
