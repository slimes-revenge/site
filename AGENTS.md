<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# What this project is

The design site of Slime's Revenge (GitHub `slimes-revenge/site`). It draws the report of the design simulator (`slimes-revenge/simulator`, Rust): which slime builds win against which enemies. Later it becomes a player wiki from the same data. The game itself is `slimes-revenge/SlimesRevenge` (Unity). `README.md` lists the pages, the planned ones and the Vercel setup.

One Next.js app: App Router, React 19, MUI 9 (`@mui/material-nextjs` cache provider, Emotion), TypeScript, zod. No database, no API routes, no environment variables.

# Run, build, check

- Node 26 (`.nvmrc`, `engines`). No lockfile on purpose (`.npmrc`: `package-lock=false`, `save-exact`, `legacy-peer-deps`); dependency versions are exact in `package.json`.
- `npm run dev`, `npm run build`, `npm run start`. `.claude/launch.json` has `site-start` (port 3200, serves the last build) and `site-dev` (port 3201).
- Checks (CI runs the same, `.github/workflows/ci.yml`, on pull requests and pushes to `dev`): `npx eslint .`, `npx prettier --check .`, `npx tsc --noEmit`, `npm run build`. `npm run lint` is `eslint . --fix` on the whole repo.
- Husky runs `lint-staged` on commit: Prettier and ESLint on `ts`/`tsx`, Prettier on `json`. Prettier: width 120, double quotes, trailing commas.
- No tests. A visible change is checked in the browser: light and dark (the theme follows the system setting), laptop and phone width.

# Layout

```text
src/app/
  layout.tsx              root layout: Roboto font, metadata, Providers
  page.tsx                `/`: loads the report, header line, sample-data banner, BuildMatrix
  theme.ts                MUI theme, light + dark colour schemes via CSS variables
  components/
    Providers.tsx         AppRouterCacheProvider, ThemeProvider, CssBaseline
    BuildMatrix.tsx       the matrix table and the fight-summary dialog (client component)
src/data/
  schema.ts               zod schema of design-guard.json (schemaVersion 1)
  report.ts               loadReport(): download at build time, fall back to the sample
data/sample-design-guard.json   made-up report used when the download fails
docs/                     knowledge notes, index in docs/README.md
```

# Gotchas

- The report is fetched with `cache: "no-store"` and the page exports `dynamic = "force-static"`: together they download the report on every `next build`, keep `/` static and store nothing in `.next/cache/fetch-cache`. A fetch with default options IS stored there and a later build reuses it (checked locally; on Vercel the build cache can carry it over too), so a new simulator release would not show. Without `force-static`, `no-store` makes `/` dynamic (ƒ). Details: `docs/design-guard-report.md`.
- The page must stay static (`○` in the build output). Reading `cookies()`, `headers()` or search params on the server would make it render per request.
- MUI 9 removed system props on components (`fontWeight={500}`): use `sx`.
- `@ethberry/eslint-config` wants `interface` over `type` for object types and an `I` prefix on interface names; an inferred type often avoids both.
- Next.js may warn that it ignored a `package-lock.json` outside the repository (for example in the home folder); the warning is harmless.
- `next-env.d.ts` and `*.tsbuildinfo` are generated and git-ignored.
- `.npmrc` has `legacy-peer-deps=true` as in the other EthBerry-style repos: `@ethberry/eslint-config` pins plugin peers that do not always match the newest ESLint; without it `npm install` may refuse to resolve.
- `REPORT_URL` points at the simulator release whose tag is literally `latest` (`releases/download/latest/…`), not GitHub's "newest release" redirect (`releases/latest/download/…`). The simulator re-publishes that tag; if it switches to versioned tags, change the URL to the redirect form.

# Rules and docs

Agent rules: `.claude/rules/` (`workflow`, `documentation`, `kiss-dry-yagni`). Base branch `dev`; pull requests are squash-merged; conventional commits. Knowledge notes: `docs/README.md`.
