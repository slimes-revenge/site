import { z } from "zod";

// The simulator's design-guard report, schemaVersion 1.
// The contract lives in slimes-revenge/simulator → docs/report-format.md.

export const buildSchema = z.object({
  id: z.string(),
  name: z.string(),
  // Liquid → units of it in the slime's starting volume.
  units: z.record(z.string(), z.number().int().nonnegative()),
});

export const encounterSchema = z.object({
  id: z.string(),
  enemy: z.string(),
  enemies: z.number().int().positive(),
});

export const cellSchema = z.object({
  build: z.string(),
  encounter: z.string(),
  enemy: z.string(),
  enemies: z.number().int().positive(),
  winRate: z.number().min(0).max(1),
  avgRounds: z.number().nonnegative(),
  avgUnitsLeft: z.number().nonnegative(),
  avgUnitsSpent: z.number().nonnegative(),
  // The most common cause of a loss; null when every fight was won.
  cause: z.string().nullable(),
  // Every loss cause → number of fights it ended; {} when every fight was won.
  causes: z.record(z.string(), z.number().int().nonnegative()),
});

export const reportSchema = z
  .object({
    schemaVersion: z.literal(1),
    generatedUtc: z.iso.datetime(),
    commit: z.string(),
    policy: z.string(),
    actionsPerRound: z.number().int().positive(),
    seeds: z.number().int().positive(),
    builds: z.array(buildSchema),
    encounters: z.array(encounterSchema),
    cells: z.array(cellSchema),
  })
  .superRefine((report, ctx) => {
    // Ids must be unique and every cell must point at a listed build and encounter,
    // or the matrix would overwrite or drop cells silently.
    const builds = new Set(report.builds.map(build => build.id));
    const encounters = new Set(report.encounters.map(encounter => encounter.id));
    if (builds.size !== report.builds.length || encounters.size !== report.encounters.length) {
      ctx.addIssue({ code: "custom", path: [], message: "build or encounter ids are not unique" });
    }
    const cellKeys = new Set(report.cells.map(cell => `${cell.build}/${cell.encounter}`));
    if (cellKeys.size !== report.cells.length) {
      ctx.addIssue({ code: "custom", path: ["cells"], message: "two cells share a build and encounter" });
    }
    report.cells.forEach((cell, index) => {
      if (!builds.has(cell.build) || !encounters.has(cell.encounter)) {
        ctx.addIssue({
          code: "custom",
          path: ["cells", index],
          message: `cell ${cell.build} / ${cell.encounter} is not in builds / encounters`,
        });
      }
    });
  });

// The file is an array of reports, one per actionsPerRound value.
export const reportsSchema = z
  .array(reportSchema)
  .min(1)
  .refine(reports => new Set(reports.map(report => report.actionsPerRound)).size === reports.length, {
    message: "two reports share actionsPerRound",
  });

export type Build = z.infer<typeof buildSchema>;
export type Cell = z.infer<typeof cellSchema>;
export type Report = z.infer<typeof reportSchema>;
