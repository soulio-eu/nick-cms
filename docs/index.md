# Documentation

These documents describe the design of Nick v1. The scope of v1 is in the [README](../README.md#scope-of-v1).

| Document                                                  | Covers                                                               |
| --------------------------------------------------------- | -------------------------------------------------------------------- |
| [Architecture](ARCHITECTURE.md)                           | Packages, layers, dependency rules, composition roots, ADR index     |
| [Getting started](getting-started.md)                     | Wiring Nick into a fresh SvelteKit project                           |
| [Dependency injection](dependency-injection.md)           | Context triplets, `NickApp`, failure handling                        |
| [First-party domains](domains.md)                         | Site settings, pages, posts, menus, users                            |
| [Document store](document-store.md)                       | Typed collections, `DocumentRepository`, validation, schema versions |
| [Storage](storage.md)                                     | The `Store` port, the D1 adapter, tables, migrations                 |
| [SvelteKit integration and SEO](sveltekit-integration.md) | `nickHandle`, `loadApp`, `<Seo>`, sitemap, robots, RSS               |
| [Admin UI](admin-ui.md)                                   | Mounting, authorization, styling, overrides                          |
| [Releasing](releasing.md)                                 | Versioning, changelogs, publishing                                   |

Architecture decision records are indexed in [ARCHITECTURE.md](ARCHITECTURE.md#architecture-decision-records).
