# Nick CMS

Nick, a Nearly-Headless CMS: a typed content library for SvelteKit with first-party content domains, a Zod-validated document store and admin components. Cloudflare D1 is the first storage adapter.

Nick is a library, not a framework: it plugs into a stock `sv create` project and owns no routes, build steps or project layout.

## Status

Pre-release. No package is published yet. The [documentation](docs/index.md) describes the v1 design ahead of the implementation.

## Scope of v1

In scope:

- First-party domains: site settings, pages, posts, menus, users (profiles and roles, not authentication).
- A catch-all document store with typed collections validated on read and write.
- Typed dependency injection over Svelte's `createContext`, and an `App` boundary that degrades gracefully.
- Admin UI: unstyled, overridable Svelte components for listing and editing each domain and collection.
- SvelteKit server integration and SEO helpers (meta, JSON-LD, sitemap, robots, RSS).
- One storage adapter: Cloudflare D1.

Out of scope:

- Authentication. The admin UI calls a consumer-supplied authorize hook.
- Media and file storage, i18n, multi-tenancy, a plugin system.
- Firestore and Node storage adapters. The storage port must allow them.

## Documentation

Start at [docs/index.md](docs/index.md). Architectural decisions are indexed in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#architecture-decision-records).

## Development

Requirements:

- Node.js, at the major version in `.nvmrc`. With nvm, run `nvm use` in the repository root.
- pnpm, at the version in the `packageManager` field of `package.json`.

Set up:

```sh
pnpm install
```

`pnpm install` also installs the git hooks (lefthook): a Prettier check on staged files before commit, and commitlint on the commit message. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/); releases are derived from them.

Format:

```sh
pnpm format        # rewrite files
pnpm format:check  # check only, as CI does
```

## Issues

Bugs, proposals and planned work are tracked in [GitHub Issues](https://github.com/soulio-eu/nick-cms/issues).

## License

[MIT](LICENSE)
