# Contributing

Thanks for wanting to help. Here's how to get started.

## Setup

```bash
git clone https://github.com/ignsm/formhaus.git
cd formhaus
pnpm install
```

## Project structure

```
packages/
  core/     # form engine, types, validation, visibility (zero deps)
  react/    # React adapter (depends on core)
  vue/      # Vue 3 adapter (depends on core)
  figma/    # Figma plugin (depends on core)
docs/       # VitePress site at formhaus.dev
```

`core` is the heart. It has no framework dependencies. React and Vue are thin adapters that connect the engine to framework reactivity and render native HTML by default.

## Build and test

```bash
# build everything
pnpm build

# test core (only package with tests right now)
cd packages/core && pnpm test

# build a specific package
cd packages/react && pnpm build
```

## Run docs locally

```bash
cd docs
pnpm install
pnpm dev
```

Opens at http://localhost:5173.

## Making changes

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Make sure `pnpm build` and `pnpm test` pass
4. Commit using [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`)
5. Open a PR against `main`

## What could use help

- Tests for React and Vue adapters
- Svelte adapter (`@formhaus/svelte`)
- More fixture schemas in `packages/core/fixtures/`
- Docs improvements
- Bug reports

## Code style

- TypeScript everywhere
- No runtime dependencies in `core`
- Adapters render native HTML by default, users bring their own UI kit via `components` prop
- CSS class prefix: `fh-`

## Questions?

Open an issue. No question is too small.
