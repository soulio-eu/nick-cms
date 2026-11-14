# SvelteKit integration and SEO

The `kit` package connects the core to SvelteKit. Its place in the layers is in [ADR 0003](adr/0003-core-owns-the-ports.md).

| Export                  | Kind             | Does                                                                                                                                      |
| ----------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `nickHandle(options)`   | `Handle`         | Builds the per-request container on `locals.nick`; composable with `sequence`                                                             |
| `locals.nick.loadApp()` | load helper      | Health check plus settings and menus, as a serializable `NickAppData`                                                                     |
| `<NickApp>`             | component        | Provides context keys, renders `fallback` on failure (see [Dependency injection](dependency-injection.md))                                |
| `<Seo>`                 | component        | `<svelte:head>` title, description, canonical, Open Graph, Twitter card, JSON-LD; defaults from site settings, overrides per page or post |
| `sitemap(options)`      | `RequestHandler` | `sitemap.xml` from published pages and posts                                                                                              |
| `robots(options)`       | `RequestHandler` | `robots.txt` with the sitemap URL                                                                                                         |
| `feed(options)`         | `RequestHandler` | RSS for published posts                                                                                                                   |

- A type augmentation module adds `nick` to `App.Locals`.
- SEO output must be in the server-rendered HTML, so pages using `<Seo>` require SSR. Prerendering works where the data is static.

Wiring these into a project is shown in [Getting started](getting-started.md).
