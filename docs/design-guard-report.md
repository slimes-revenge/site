# The design-guard report

## Source

The simulator publishes `design-guard.json` as an asset of its GitHub release `latest`: `REPORT_URL` in `src/data/report.ts`. Its format is owned by the simulator (`docs/report-format.md` in `slimes-revenge/simulator`); `src/data/schema.ts` mirrors it and must change together with it. A new `schemaVersion` fails validation (`z.literal(1)`), so the site falls back to the sample until the schema here is updated.

## Loading

`loadReport()` runs while `next build` prerenders `/`. The default `fetch` options mean one download per build and no cache between builds. On a non-200 answer, a network error, invalid JSON or a schema mismatch it logs a warning and returns `data/sample-design-guard.json` with the reason; the page shows the reason in the **Sample data** banner. The sample is validated by the same schema, so a broken sample fails the build.

The sample is made up: five builds named after the slime's substances, the enemies of the game's `docs/creatures.md` (Rat, Bat, Scorpion, Cat, Dog), 1–3 of each. Its commit is all zeros.

## Fields used

- Header line: `policy`, `actionsPerRound`, `seeds`, `commit` (linked to the simulator commit), `generatedUtc` (ISO 8601 with `Z`).
- Rows: `builds`, in the report's order.
- Column groups: enemy kinds in the order they first appear in `encounters`; inside a group the enemy counts ascending. A cell is the entry of `cells` with the same `build`, `enemy` and `enemies`; a missing one shows `—`.
- Cell: `winRate` (0–1) sets the hue, 0 = red, 0.5 = yellow, 1 = green, with a lighter tone in light mode and a darker one in dark mode; it shows `winRate` and `avgUnitsLeft`.
- Dialog: `winRate`, `avgRounds`, `avgUnitsSpent`, `avgUnitsLeft`, `cause` (the most common cause of a loss; `null` when no fight was lost, shown as "no losses").

The report has one `actionsPerRound` value. If the simulator starts publishing several action-point variants, the page gets a switch between them.
