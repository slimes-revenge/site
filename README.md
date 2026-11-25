# site

The Slime's Revenge design site. The [simulator](https://github.com/slimes-revenge/simulator) plays fights by the design rules; this site draws its report, so a change to the design shows at a glance which slime builds now win or lose against which enemies. Later the same data becomes a player wiki.

Stack: Next.js (App Router) + React + Material UI, TypeScript. It runs locally only for now; hosting (Vercel) comes later, closer to the game's first version.

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

The data is read at build time only: the simulator publishes a new report on every push to its `dev`, and `npm run build` (or a reload in `npm run dev`) picks it up.

## Branches

`dev` is the default branch: all work lands there through squash-merged pull requests. There is no deployment and no release to `main` yet.
