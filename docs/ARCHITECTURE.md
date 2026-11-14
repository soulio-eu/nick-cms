# Architecture

## Packages

Example packages; the repository layout is authoritative. Why each layer is a package is in [ADR 0002](adr/0002-one-package-per-layer.md).

| Package            | Layer                                          | Peer dependencies | Dependencies |
| ------------------ | ---------------------------------------------- | ----------------- | ------------ |
| `@nick-cms/core`   | Domain, ports, collections                     | Zod               | —            |
| `@nick-cms/svelte` | Contexts, `NickApp`, `Seo`                     | core, Svelte      | —            |
| `@nick-cms/kit`    | Handle, load helpers, SEO handlers, `nick` CLI | core, SvelteKit   | svelte       |
| `@nick-cms/d1`     | D1 store, migrations                           | core              | —            |
| `@nick-cms/admin`  | Admin components and handlers                  | core, SvelteKit   | svelte, kit  |

Versioning and publishing are in [Releasing](releasing.md).

## Architecture decision records

Add every new or superseding ADR to this index. The format is in [ADR 0001](adr/0001-record-architecture-decisions.md).

| ADR                                               | Title                         |
| ------------------------------------------------- | ----------------------------- |
| [0001](adr/0001-record-architecture-decisions.md) | Record architecture decisions |
| [0002](adr/0002-one-package-per-layer.md)         | One package per layer         |
| [0003](adr/0003-core-owns-the-ports.md)           | Core owns the ports           |
| [0004](adr/0004-two-composition-roots.md)         | Two composition roots         |
