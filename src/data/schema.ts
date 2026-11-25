import { z } from "zod";

// The simulator's design-guard report, schemaVersion 1.
// The contract lives in slimes-revenge/simulator → docs/report-format.md.

export const cellSchema = z.object({
  build: z.string(),
  encounter: z.string(),
  enemy: z.string(),
  enemies: z.number().int().positive(),
  winRate: z.number().min(0).max(1),
  avgRounds: z.number().nonnegative(),
  avgUnitsLeft: z.number().nonnegative(),
  avgUnitsSpent: z.number().nonnegative(),
  // The most common cause of a loss; null when no fight was lost.
  cause: z.string().nullable(),
});

export const reportSchema = z.object({
  schemaVersion: z.literal(1),
  generatedUtc: z.iso.datetime(),
  commit: z.string(),
  policy: z.string(),
  actionsPerRound: z.number().int().positive(),
  seeds: z.number().int().positive(),
  builds: z.array(z.string()),
  encounters: z.array(z.string()),
  cells: z.array(cellSchema),
});

export type Cell = z.infer<typeof cellSchema>;
export type Report = z.infer<typeof reportSchema>;
