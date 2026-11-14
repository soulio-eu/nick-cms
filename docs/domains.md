# First-party domains

Each domain is an entity type, a repository port with CRUD plus the queries sites need, and the rules that belong to it. Every entity carries `id` (UUID), `createdAt` and `updatedAt`.

| Domain        | Key fields                                                    | Queries beyond CRUD                          | Domain rules                                                      |
| ------------- | ------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------- |
| Site settings | name, base URL, default SEO, locale                           | `get()` (singleton)                          | One row; base URL is absolute                                     |
| Page          | slug, title, body, status, SEO overrides, parent              | `getBySlug`, `listPublished`, `tree`         | Slug unique per parent; only `published` is publicly readable     |
| Post          | slug, title, excerpt, body, status, publishedAt, tags, author | `getBySlug`, `listPublished` (paged, by tag) | `publishedAt` set on first publish; slug unique                   |
| Menu          | handle, items (label, href or page ref, children, order)      | `getByHandle`                                | Handle unique; page refs resolve to current slugs                 |
| User          | email, display name, role, avatar URL                         | `getByEmail`                                 | Email unique; roles are a fixed set (`admin`, `editor`, `author`) |

- Status is `draft` or `published`.
- The body format is in [ADR 0012](adr/0012-rich-text-as-tiptap-json.md).
- Users are profiles and roles; authentication is [out of v1 scope](../README.md#scope-of-v1).

Other data goes in the [document store](document-store.md) ([ADR 0006](adr/0006-domains-and-document-store.md)). How domains are persisted is in [Storage](storage.md).
