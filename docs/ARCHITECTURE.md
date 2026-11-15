# Architecture

## Packages

Example packages; the repository layout is authoritative. Why each layer is a package is in [ADR 0002](adr/0002-one-package-per-layer.md).

| Package            | Layer                                          | Peer dependencies      | Dependencies |
| ------------------ | ---------------------------------------------- | ---------------------- | ------------ |
| `@nick-cms/core`   | Domain, ports, collections                     | Zod, Vitest (optional) | —            |
| `@nick-cms/svelte` | Contexts, `NickApp`, `Seo`                     | core, Svelte           | —            |
| `@nick-cms/kit`    | Handle, load helpers, SEO handlers, `nick` CLI | core, SvelteKit        | svelte       |
| `@nick-cms/d1`     | D1 store, migrations                           | core                   | —            |
| `@nick-cms/admin`  | Admin components and handlers                  | core, SvelteKit        | svelte, kit  |

Versioning and publishing are in [Releasing](releasing.md).

## Architecture decision records

Add every new or superseding ADR to this index. The format is in [ADR 0001](adr/0001-record-architecture-decisions.md).

| ADR                                                         | Title                                                |
| ----------------------------------------------------------- | ---------------------------------------------------- |
| [0001](adr/0001-record-architecture-decisions.md)           | Record architecture decisions                        |
| [0002](adr/0002-one-package-per-layer.md)                   | One package per layer                                |
| [0003](adr/0003-core-owns-the-ports.md)                     | Core owns the ports                                  |
| [0004](adr/0004-two-composition-roots.md)                   | Two composition roots                                |
| [0005](adr/0005-library-not-framework.md)                   | Library, not framework                               |
| [0006](adr/0006-domains-and-document-store.md)              | First-party domains and a document store             |
| [0007](adr/0007-zod-schemas-validated-on-write-and-read.md) | Zod schemas, validated on write and read             |
| [0008](adr/0008-share-the-consumers-database.md)            | Share the consumer's database                        |
| [0009](adr/0009-sql-adapters-on-a-minimal-driver.md)        | SQL adapters on a minimal driver interface           |
| [0010](adr/0010-typed-context-injection.md)                 | Typed context injection                              |
| [0011](adr/0011-degrade-to-a-fallback.md)                   | Degrade to a fallback                                |
| [0012](adr/0012-rich-text-as-tiptap-json.md)                | Rich text as Tiptap JSON                             |
| [0013](adr/0013-unstyled-overridable-admin-components.md)   | Unstyled, overridable admin components               |
| [0014](adr/0014-independent-package-versions.md)            | Independent package versions                         |
| [0015](adr/0015-shared-root-tooling-and-named-gates.md)     | Shared root tooling and named gates                  |
| [0016](adr/0016-adapters-store-records.md)                  | Adapters store records; core owns document semantics |
