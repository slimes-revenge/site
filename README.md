# site

The Slime's Revenge design site. The [simulator](https://github.com/slimes-revenge/simulator) plays fights by the design rules; this site draws its report, so a change to the design shows at a glance which slime builds now win or lose against which enemies. Later the same data becomes a player wiki.

Stack: Next.js (App Router) + React + Material UI, TypeScript, hosted on Vercel.

## Pages

- `/` — **build matrix** (done): rows are slime builds, column groups are enemy kinds, sub-columns are 1, 2 and 3 enemies. A cell is coloured by win rate (red → yellow → green) and shows the win rate and the average units of body left; a click opens the fight summary (rounds, body spent, body left, the most common cause of a loss). The header line names the simulator policy, action points per round, seeds, commit and generation time.

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

`next build` downloads the simulator report once and prerenders the page with it:

`https://github.com/slimes-revenge/simulator/releases/download/latest/design-guard.json`

The format is defined in the simulator repository, `docs/report-format.md`; `src/data/schema.ts` validates it with zod. When the download fails or the file does not match the schema, the build does not fail: it uses the committed made-up `data/sample-design-guard.json` and the page shows a yellow **Sample data** banner with the reason. The build log says so too (`design-guard.json: … using data/sample-design-guard.json`).

The data is read at build time only. A new simulator release appears on the site after the next deployment (a push, or a redeploy in Vercel).

## Deploy (Vercel)

Vercel builds every push and pull request itself once the project is connected. The project does not exist yet; the repository owner creates it:

1. Open https://vercel.com/new, choose **Import Git Repository** and pick `slimes-revenge/site` (grant the Vercel GitHub app access to the `slimes-revenge` organisation if it is not listed).
2. **Framework Preset**: Next.js (detected). Root directory `./`; leave the build, install and output commands at their defaults. No environment variables are needed.
3. Deploy.
4. **Settings → Build and Deployment → Node.js Version**: `26.x`.
5. **Settings → Environments → Production → Branch Tracking**: `main`. Work lands in `dev`, which gets preview deployments; production is released by fast-forwarding `main` to `dev`.

Optional: create a Deploy Hook (**Settings → Git → Deploy Hooks**, branch `main`) and call it from the simulator's release workflow, so a new report reaches the site without a push here.
