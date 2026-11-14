# Nick CMS

Nick, a Nearly-Headless CMS: a typed content library for SvelteKit with first-party content domains, a Zod-validated document store and admin components. Cloudflare D1 is the first storage adapter.

Nick is a library, not a framework: it plugs into a stock `sv create` project and owns no routes, build steps or project layout.

## Status

Pre-release. No package is published yet.

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
