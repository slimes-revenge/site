# site

The Slime's Revenge game wiki: the slime's route through maps and levels, who lives where, what you can absorb, the bosses — only what a player meets in play. It also shows the report of the design [simulator](https://github.com/slimes-revenge/simulator) at `/ru/sim`: which slime builds win or lose against which enemies.

Stack: Next.js (App Router) + React + Material UI, TypeScript. It runs locally only for now; hosting (Vercel) comes later, closer to the game's first version.

## Pages

The site is the game wiki, in Russian first (`/` opens `/ru`). Each item carries a small status dot: decided, working, proposal.

- `/ru` — **the route** (done): five maps of four levels, the stop at a trader after each map.
- `/ru/maps/<map>` — **a map** (done): what blocks the river, the levels, the location guardian, the map boss, who lives there.
- `/ru/levels/<level>` — **a level** (done): enemies, which liquids you can absorb and from what, the possible guardians and bosses, the possible secret rooms, what resets on exit, rooms and capacity.
- `/ru/sim` — **build matrix** (done): the simulator report. Rows are slime builds, columns are enemies; a cell is coloured by win rate and opens the fight summary.

Planned, not built yet:

- **Bestiary** — a page per creature with its picture: type, element, what you take from it, weak and immune.
- **Liquids** — a page per liquid: strike, being hit, spit, puddle, holding it; where it is found.
- **Bosses and guardians**, **stops** — a page each.
- **What shifted** and **design rules** for the simulator report.

## Run

Node 26 (`.nvmrc`). There is no lockfile on purpose (`.npmrc`).

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000 (it redirects to `/ru`). Checks, the same as CI:

```bash
npx eslint . && npx prettier --check . && npx tsc --noEmit && npm run build
```

## Data

The wiki content is `data/wiki.json`, exported by the lore session and copied in; `src/data/wiki.ts` validates it and every id reference at build time (`docs/wiki-data.md`).

For the build matrix, every `next build` downloads the simulator report (never from a cache) and prerenders `/ru/sim` with it:

`https://github.com/slimes-revenge/simulator/releases/download/latest/design-guard.json`

The format is defined in the simulator repository, `docs/report-format.md`; `src/data/schema.ts` validates it with zod. When the download fails or the file does not match the schema, the build does not fail: it uses the committed `data/sample-design-guard.json` (a snapshot of a real report: simulator commit a2f83f6, 2026-11-25) and the page shows a yellow **Sample data** banner with the reason. The build log says so too (`design-guard.json: … using data/sample-design-guard.json`).

The data is read at build time only: the simulator publishes a new report on every push to its `dev`, and `npm run build` (or a reload in `npm run dev`) picks it up.

## Branches

`dev` is the default branch: all work lands there through squash-merged pull requests. There is no deployment and no release to `main` yet.
