# Adding a workspace project

Shared tooling and the gate contract are in [ADR 0015](adr/0015-shared-root-tooling-and-named-gates.md); package boundaries are in [ADR 0002](adr/0002-one-package-per-layer.md).

| Kind                     | Location          | Generator                      |
| ------------------------ | ----------------- | ------------------------------ |
| Plain TypeScript package | `packages/<name>` | `pnpm init`                    |
| Svelte package           | `packages/<name>` | `sv create --template library` |
| App                      | `apps/<name>`     | `sv create --template minimal` |

Set `name` to the project name and `dir` to `packages/<name>` or `apps/<name>`. Run each block from the repository root as one shell command. Follow the recipe for the kind, then [Every project](#every-project).

## Plain TypeScript package

```sh
(
  set -e; : "${name:?}" "${dir:?}"
  mkdir -p "$dir/src" && cd "$dir"
  pnpm init
  pnpm pkg delete main description keywords author
  pnpm pkg set name="@nick-cms/$name" version=0.0.0 license=MIT type=module \
    scripts.build='tsc -p tsconfig.build.json && publint' \
    scripts.check='tsc --noEmit' \
    scripts.lint='eslint .' \
    scripts.test='vitest run --passWithNoTests'
  pnpm pkg set --json \
    'exports={".":{"types":"./dist/index.d.ts","default":"./dist/index.js"}}' \
    'files=["dist"]'
)
```

Add `$dir/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
```

Add `$dir/tsconfig.build.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist" },
  "exclude": ["src/**/*.test.ts"]
}
```

Add `$dir/src/index.ts` (`export {};` until the package has code).

## Svelte package

```sh
(
  set -e; : "${name:?}" "${dir:?}"
  pnpm dlx sv@latest create --template library --types ts --no-add-ons --no-install "$dir"
  cd "$dir"
  rm -rf .vscode .npmrc README.md src/routes static
  pnpm pkg set name="@nick-cms/$name" version=0.0.0 license=MIT \
    scripts.build='svelte-kit sync && svelte-package && publint' \
    scripts.lint='eslint .' \
    scripts.test='vitest run --passWithNoTests'
  pnpm pkg delete scripts.dev scripts.preview scripts.prepack
)
```

## App

```sh
(
  set -e; : "${name:?}" "${dir:?}"
  pnpm dlx sv@latest create --template minimal --types ts --no-add-ons --no-install "$dir"
  cd "$dir"
  rm -rf .vscode .npmrc README.md
  pnpm pkg set name="@nick-cms/$name" \
    scripts.lint='eslint .' \
    scripts.test='vitest run --passWithNoTests'
)
```

## Every project

1. Remove the dev dependencies the root already provides:

   ```sh
   (
     set -e; : "${dir:?}"
     tools=$(node -p "const root = require('./package.json').devDependencies; Object.keys(require('./$dir/package.json').devDependencies ?? {}).filter((d) => d in root).join(' ')")
     [ -z "$tools" ] || pnpm --dir "$dir" remove $tools
   )
   ```

2. Add runtime and peer dependencies (`--save-peer` for a peer), e.g.:

   ```sh
   (
     set -e; : "${dir:?}"
     pnpm --dir "$dir" add --save-peer zod
   )
   ```

   Add internal dependencies as [ADR 0002](adr/0002-one-package-per-layer.md) describes.

3. For a package, add `$dir/README.md`: a heading with the package name and one sentence naming its layer.
4. Run `pnpm install` and `pnpm format`.
5. Run the gates:

   ```sh
   (
     set -e; : "${name:?}"
     pnpm --filter "@nick-cms/$name..." run --if-present build
     for gate in check lint test; do pnpm --filter "@nick-cms/$name" run --if-present "$gate"; done
   )
   ```

## Gates

| Script  | Checks                                       |
| ------- | -------------------------------------------- |
| `build` | The package builds and its exports are valid |
| `check` | Types                                        |
| `lint`  | ESLint                                       |
| `test`  | Vitest                                       |

CI runs them in [`ci.yml`](../.github/workflows/ci.yml). Adding a gate means adding its script to the projects and a step to the `gates` job.
