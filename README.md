# site

The Slime's Revenge design site. The [simulator](https://github.com/slimes-revenge/simulator) plays fights by the design rules; this site draws its report, so a change to the design shows at a glance which slime builds now win or lose against which enemies. Later the same data becomes a player wiki.

Stack: Next.js (App Router) + React + Material UI, TypeScript, hosted on Vercel.

## Pages

- `/` — **build matrix** (done): rows are slime builds, column groups are enemy kinds, sub-columns are 1, 2 and 3 enemies. A switch picks the report for 1 or 2 action points per round (the simulator publishes one report per value). A cell is coloured by win rate (red → yellow → green) and shows the win rate and the average units of body left; a click opens the fight summary (the build's liquids, rounds, body spent, body left, the most common loss cause and every loss cause with its count). The line above the matrix names the policy, action points, seeds, simulator commit and generation time; hovering a build name shows its liquids.

Planned, not built yet:

- **What shifted** — the matrix diffed against the previous simulator release: which cells got better or worse after a change.
- **Design rules** — the design's expectations (for example "a starter slime beats one rat") shown green when the report meets them and red when it does not.
- **Player wiki** — creatures, substances and builds for players, from the same data.

## Run

Node 26 (`.nvmrc`). There is no lockfile on purpose (`.npmrc`).

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. Checks, the same as CI:

```bash
npx eslint . && npx prettier --check . && npx tsc --noEmit && npm run build
```

## Data

Every `next build` downloads the simulator report (never from a cache) and prerenders the page with it:

`https://github.com/slimes-revenge/simulator/releases/download/latest/design-guard.json`

The format is defined in the simulator repository, `docs/report-format.md`; `src/data/schema.ts` validates it with zod. When the download fails or the file does not match the schema, the build does not fail: it uses the committed `data/sample-design-guard.json` (an old snapshot of a real report) and the page shows a yellow **Sample data** banner with the reason. The build log says so too (`design-guard.json: … using data/sample-design-guard.json`).

The data is read at build time only. The simulator publishes a new report on every push to its `dev`; the site shows it after its next deployment. Production rebuilds only on a push to `main` here, so without the Deploy Hook below production keeps the report of its last build.

## Branches and releases

- `dev` is the default branch: all work lands there through squash-merged pull requests. `dev` and every pull request get Vercel preview deployments.
- `main` is production. A release is a pull request `dev` → `main`, merged with a merge commit (not squash), so `main` keeps `dev`'s commits and the next release PR contains only new work.

## Deploy (Vercel)

Vercel builds every push and pull request itself once the project is connected. The project does not exist yet; Oleg creates it:

1. Open https://vercel.com/new, choose **Import Git Repository** and pick `slimes-revenge/site` (grant the Vercel GitHub app access to the `slimes-revenge` organisation if it is not listed).
2. **Framework Preset**: Next.js (detected). Root directory `./`; leave the build, install and output commands at their defaults. No environment variables are needed.
3. Deploy.
4. **Settings → Build and Deployment → Node.js Version**: `26.x`.
5. **Settings → Environments → Production → Branch Tracking**: `main`.

### Deploy Hook: rebuild production after each simulator report (to enable)

So that production shows a new report without a release here, Oleg enables a deploy hook (not created yet):

1. Vercel project → **Settings → Git → Deploy Hooks**: name `simulator-report`, branch `main` → **Create Hook**. Vercel shows a secret URL.
2. In `slimes-revenge/simulator` → **Settings → Secrets and variables → Actions** → new repository secret `VERCEL_DEPLOY_HOOK_SITE` with that URL.
3. In the simulator's release workflow, after the step that uploads `design-guard.json`, add a step that runs `curl -fsS -X POST "$VERCEL_DEPLOY_HOOK_SITE"` with `env: VERCEL_DEPLOY_HOOK_SITE: ${{ secrets.VERCEL_DEPLOY_HOOK_SITE }}`.

The URL is a secret: anyone who has it can trigger builds. Never commit it.
