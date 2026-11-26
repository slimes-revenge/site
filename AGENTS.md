<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# What this project is

The game wiki of Slime's Revenge (GitHub `slimes-revenge/site`, public), run locally for now. Russian first, English-ready. Content (maps, levels, bosses, creatures, liquids, stops) comes from `data/wiki.json`, exported by the lore session and copied in; it must stay spoiler-free (no story twist, no endings). `/ru/sim` also draws the report of the design simulator (`slimes-revenge/simulator`, Rust): which slime builds win against which enemies. The game itself is `slimes-revenge/SlimesRevenge` (Unity). `README.md` lists the pages and the planned ones.

One Next.js app: App Router, React 19, MUI 9 (`@mui/material-nextjs` cache provider, Emotion), TypeScript, zod, react-intl (server-side `createIntl`). No database, no API routes, no environment variables.

# Run, build, check

- Node 26 (`.nvmrc`, `engines`). No lockfile on purpose (`.npmrc`: `package-lock=false`, `save-exact`, `legacy-peer-deps`); dependency versions are exact in `package.json`.
- `npm run dev`, `npm run build`, `npm run start`. `.claude/launch.json` has `site-start` (port 3200, serves the last build) and `site-dev` (port 3201).
- Checks (CI runs the same, `.github/workflows/ci.yml`, on pull requests and pushes to `dev`): `npx eslint .`, `npx prettier --check .`, `npx tsc --noEmit`, `npm run build`. `npm run lint` is `eslint . --fix` on the whole repo.
- Husky runs `lint-staged` on commit: Prettier and ESLint on `ts`/`tsx`, Prettier on `json`. Prettier: width 120, double quotes, trailing commas.
- No tests. A visible change is checked in the browser: light and dark (the theme follows the system setting), laptop and phone width.

# Layout

```text
src/app/
  [lang]/layout.tsx       root layout: locale params (only `ru`), Roboto (latin + cyrillic), metadata, nav, Providers
  [lang]/page.tsx         `/ru`: the route — maps, their levels, the stops
  [lang]/maps/[map]/      a map page
  [lang]/levels/[level]/  a level page
  [lang]/bestiary/        creature list + a page per creature
  [lang]/liquids/         liquid list + a page per liquid
  [lang]/sim/page.tsx     `/ru/sim`: loads the simulator reports, sample-data banner, BuildMatrix
  theme.ts                MUI theme, light + dark colour schemes via CSS variables
  components/
    Providers.tsx         AppRouterCacheProvider, ThemeProvider, CssBaseline
    RouterLink.tsx        MUI Link / Chip through next/link (client)
    StatusMark.tsx        status dot: decided / working / proposal / idea
    BossCard.tsx          a guardian, boss or arena boss
    CreaturePicture.tsx   public/creatures/<id>.png or an empty slot
    LiquidLink.tsx        a liquid name linked to its page
    SourceList.tsx        where a liquid comes from on a level
    BuildMatrix.tsx       action-points switch, header line, matrix table, fight-summary dialog (client)
src/i18n/                 locales, ru.json UI messages, getIntl(), tr() for `{ ru, en? }` data text
src/data/
  wiki.ts                 zod schema of data/wiki.json + id reference checks, getMap/getLevel/… lookups
  schema.ts               zod schema of design-guard.json (schemaVersion 1, an array of reports)
  report.ts               loadReport(): download at build time, fall back to the sample
public/creatures/         creature pictures cut from the game's sprite sheets (docs/wiki-data.md)
data/wiki.json            wiki content from the lore session (copied as is, not formatted by Prettier)
data/sample-design-guard.json   snapshot of a real report (a2f83f6, 2026-11-25), used when the download fails
docs/                     knowledge notes, index in docs/README.md
```

# Gotchas

- Server components cannot pass `component={NextLink}` to MUI (a function does not cross the client boundary): use `RouterLink` / `RouterChip`.
- Page props are typed by hand (`interface IProps { params: Promise<…> }`), not with the generated `PageProps`: CI runs `tsc` before `next build` generates those types.
- A new `data/wiki.json` is copied from `~/WebstormProjects/slimes-revenge/lore/export/wiki.json` and searched for spoilers before commit (`docs/wiki-data.md`).

- The report is fetched with `cache: "no-store"` and the page exports `dynamic = "force-static"`: together they download the report on every `next build`, keep `/ru/sim` static and store nothing in `.next/cache/fetch-cache`. A fetch with default options IS stored there and a later build reuses it (checked locally; on Vercel the build cache can carry it over too), so a new simulator release would not show. Without `force-static`, `no-store` makes the page dynamic (ƒ). Details: `docs/design-guard-report.md`.
- Every page must stay prerendered (`○` or `●` in the build output); routes with params use `generateStaticParams` and `dynamicParams = false`. Reading `cookies()`, `headers()` or search params on the server would make it render per request.
- MUI 9 removed system props on components (`fontWeight={500}`): use `sx`.
- `@ethberry/eslint-config` wants `interface` over `type` for object types and an `I` prefix on interface names; an inferred type often avoids both.
- Next.js may warn that it ignored a `package-lock.json` outside the repository (for example in the home folder); the warning is harmless.
- `next-env.d.ts` and `*.tsbuildinfo` are generated and git-ignored.
- `.npmrc` has `legacy-peer-deps=true` as in the other EthBerry-style repos: `@ethberry/eslint-config` pins plugin peers that do not always match the newest ESLint; without it `npm install` may refuse to resolve.
- `REPORT_URL` points at the simulator release whose tag is literally `latest` (`releases/download/latest/…`), not GitHub's "newest release" redirect (`releases/latest/download/…`). The simulator re-publishes that tag; if it switches to versioned tags, change the URL to the redirect form.

# Rules and docs

Agent rules: `.claude/rules/` (`workflow`, `documentation`, `kiss-dry-yagni`). Base branch `dev`; pull requests are squash-merged; conventional commits.

# Branches and deploy

- `dev` (default) gets the work through squash-merged pull requests.
- Not deployed anywhere yet: no Vercel project, no release to `main`, until the game is close to a first version. Do not set either up without the owner's word.
