# The design-guard report

## Source

The simulator publishes `design-guard.json` as an asset of its GitHub release whose tag is literally `latest` (re-published on each run): `REPORT_URL` in `src/data/report.ts`. Its format is owned by the simulator (`docs/report-format.md` in `slimes-revenge/simulator`); `src/data/schema.ts` mirrors it and must change together with it. A new `schemaVersion` fails validation (`z.literal(1)`), so the site falls back to the sample until the schema here is updated.

## Loading

`loadReport()` runs while `next build` prerenders `/`. The fetch uses `cache: "no-store"` and `page.tsx` exports `dynamic = "force-static"`: the report is downloaded on every build, nothing goes into `.next/cache/fetch-cache`, and `/` stays static. A default-options fetch would be stored in that cache and reused by the next build, hiding a new release. On a non-200 answer, a network error, a 10-second timeout, invalid JSON or a schema mismatch (zod's message is shortened with `z.prettifyError`; a cell whose `build` or `encounter` is not listed is a mismatch too) it logs a warning and returns `data/sample-design-guard.json` with the reason; the page shows the reason in the **Sample data** banner. The sample is validated by the same schema, so a broken sample fails the build.

The sample is made up: five builds named after the slime's substances, the enemies of the game's `docs/creatures.md` (Rat, Bat, Scorpion, Cat, Dog), 1–3 of each. Its commit is all zeros, so while the sample is shown the header prints the commit without a link.

## Fields used

- Header line: `policy`, `actionsPerRound`, `seeds`, `commit` (linked to the simulator commit), `generatedUtc` (ISO 8601 with `Z`).
- Rows: `builds`, in the report's order.
- Column groups: enemy kinds in the order they first appear in `encounters`; inside a group the enemy counts ascending. A cell is the entry of `cells` with the same `build`, `enemy` and `enemies`; a missing one shows `—`.
- Cell: `winRate` (0–1) sets the hue, 0 = red, 0.5 = yellow, 1 = green, with a lighter tone in light mode and a darker one in dark mode; it shows `winRate` and `avgUnitsLeft`.
- Dialog: `winRate`, `avgRounds`, `avgUnitsSpent`, `avgUnitsLeft`, `cause` (the most common cause of a loss; `null` when no fight was lost, shown as "no losses").

The report has one `actionsPerRound` value. If the simulator starts publishing several action-point variants, the page gets a switch between them.
