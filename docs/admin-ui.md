# Admin UI

The admin UI's design is in [ADR 0013](adr/0013-unstyled-overridable-admin-components.md).

Mount it on a route: `src/routes/admin/[...path]/+page.svelte` renders `<NickAdmin>`, and `+page.server.ts` re-exports the library's `adminLoad` and `adminActions`.
