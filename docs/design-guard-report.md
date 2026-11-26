# The design-guard report

## Source

The simulator publishes `design-guard.json` as an asset of its GitHub release whose tag is literally `latest` (re-published on each run): `REPORT_URL` in `src/data/report.ts`. Its format is owned by the simulator (`docs/report-format.md` in `slimes-revenge/simulator`); `src/data/schema.ts` mirrors it and must change together with it. A new `schemaVersion` fails validation (`z.literal(1)`), so the site falls back to the sample until the schema here is updated.

## Loading

`loadReport()` runs while `next build` prerenders `/ru/sim`. The fetch uses `cache: "no-store"` and the page exports `dynamic = "force-static"`: the report is downloaded on every build, nothing goes into `.next/cache/fetch-cache`, and the page stays static. A default-options fetch would be stored in that cache and reused by the next build, hiding a new release. On a non-200 answer, a network error, a 10-second timeout, invalid JSON or a schema mismatch (zod's message is shortened with `z.prettifyError`; a cell whose `build` or `encounter` is not listed is a mismatch too) it logs a warning and returns `data/sample-design-guard.json` with the reason; the page shows the reason in the **Sample data** banner. The sample is validated by the same schema when the module loads, so a broken sample fails every build.

The sample is a snapshot of a real report (simulator commit `8a37dec`, 2026-11-26, 8 reports — 2 action points × 4 policies — × 126 cells). Refresh it by downloading `REPORT_URL` over it when the format changes.

## Shape

The file is a JSON array of reports (`reportsSchema`, at least one), one per `actionsPerRound` × `policy` (how the simulated slime plays); today 1 and 2 action points × `newcomer`, `arranger`, `kite`, `reader`. Each report is complete on its own. Cell fields the page does not read (`avgUnitsBitten`, `avgEnemiesKilled`, …) are dropped by zod.

- `builds[]`: `id` (the key cells use), `name` (row label), `units` (liquid → count).
- `encounters[]`: `id` (the key cells use), `enemy`, `enemies`.
- Grid and uniqueness (checked by the schema): every `actionsPerRound` × `policy` pair has exactly one report, build ids, encounter ids, and one cell per build × encounter; a duplicate would collide as React keys and overwrite cells.
- `cells[]`: `build` and `encounter` are ids; `enemy`, `enemies` copied from the encounter; `winRate` 0–1, `avgRounds`, `avgUnitsLeft`, `avgUnitsSpent`; `cause` (most common loss cause, `null` when every fight was won); `causes` (cause → fights, `{}` when every fight was won). Causes look like `melee:<Enemy>`, `status:<Status>`, `timeout`.

## How the page uses it

- Switches: action points (`<n> AP`) and policy, each shown when it has more than one value, in file order; the first report's values are selected first. Everything below follows the report for the selected pair.
- Header line: `policy`, `actionsPerRound`, `seeds`, `commit` (linked to the simulator commit when it is a hex sha; the contract allows `unknown`, shown as text), `generatedUtc` (ISO 8601 with `Z`, shown as UTC to the minute).
- Rows: `builds` in the report's order; the row label is `name`, its tooltip lists `units`.
- Column groups: enemy kinds in the order of `encounters` (roster order, then count), each with its encounters as sub-columns. A cell is the entry of `cells` with that build id and encounter id; a missing one shows `—`.
- Cell: `winRate` sets the hue, 0 = red, 0.5 = yellow, 1 = green, lighter in light mode and darker in dark mode; it shows `winRate` and `avgUnitsLeft`.
- Dialog: the build's `units`, `actionsPerRound`, `winRate` of `seeds` fights, `avgRounds`, `avgUnitsSpent`, `avgUnitsLeft`, `cause` ("no losses" when `null`) and `causes` sorted by count.
