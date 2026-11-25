"use client";

import { Fragment, useState } from "react";
import {
  Box,
  ButtonBase,
  Dialog,
  DialogContent,
  DialogTitle,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

import type { Build, Cell, Report } from "../../data/schema";

// Hue 0 (red) → 60 (yellow) → 120 (green) by win rate.
const cellColors = (winRate: number) => (theme: Theme) => ({
  bgcolor: `hsl(${winRate * 120} 70% 72%)`,
  color: "#000",
  ...theme.applyStyles("dark", { bgcolor: `hsl(${winRate * 120} 55% 28%)`, color: "#fff" }),
});

const percent = (value: number) => `${Math.round(value * 100)}%`;

const unitsText = (build: Build) =>
  Object.entries(build.units)
    .map(([liquid, count]) => `${count} ${liquid}`)
    .join(", ");

const stickyColumn = { position: "sticky", left: 0, zIndex: 1, bgcolor: "background.paper" } as const;

export function BuildMatrix({ reports }: { reports: Report[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<{ build: Build; cell: Cell } | null>(null);
  const report = reports[index];
  const generated = new Date(report.generatedUtc).toISOString().replace("T", " ").slice(0, 16);

  // Column groups: enemy kinds in the order of the report's encounters (roster order, then count).
  const groups = new Map<string, typeof report.encounters>();
  for (const encounter of report.encounters) {
    groups.set(encounter.enemy, [...(groups.get(encounter.enemy) ?? []), encounter]);
  }
  const cells = new Map(report.cells.map(cell => [`${cell.build}/${cell.encounter}`, cell]));

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 1 }}>
        {reports.length > 1 ? (
          <ToggleButtonGroup
            size="small"
            exclusive
            value={index}
            onChange={(_event, value: number | null) => {
              if (value !== null) {
                setIndex(value);
              }
            }}
            aria-label="Action points per round"
          >
            {reports.map((r, i) => (
              <ToggleButton key={r.actionsPerRound} value={i}>
                {r.actionsPerRound} AP
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        ) : null}
        <Typography variant="body2" color="text.secondary">
          Policy <b>{report.policy}</b> · action points per round <b>{report.actionsPerRound}</b> · seeds{" "}
          <b>{report.seeds}</b> · commit{" "}
          {/^[0-9a-f]{7,40}$/.test(report.commit) ? (
            <Link href={`https://github.com/slimes-revenge/simulator/commit/${report.commit}`}>
              {report.commit.slice(0, 7)}
            </Link>
          ) : (
            report.commit
          )}{" "}
          · generated {generated} UTC
        </Typography>
      </Box>

      <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
        <Table size="small" sx={{ "& td, & th": { px: 0.75, borderColor: "divider" } }}>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} sx={stickyColumn}>
                Build
              </TableCell>
              {[...groups].map(([enemy, encounters]) => (
                <TableCell key={enemy} colSpan={encounters.length} align="center" sx={{ borderLeft: 1 }}>
                  {enemy}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              {[...groups.values()].flatMap(encounters =>
                encounters.map((encounter, i) => (
                  <TableCell key={encounter.id} align="center" sx={{ borderLeft: i === 0 ? 1 : 0 }}>
                    {encounter.enemies}×
                  </TableCell>
                )),
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {report.builds.map(build => (
              <TableRow key={build.id}>
                <TableCell
                  component="th"
                  scope="row"
                  title={unitsText(build)}
                  sx={{ ...stickyColumn, whiteSpace: "nowrap" }}
                >
                  {build.name}
                </TableCell>
                {[...groups.values()].flat().map(encounter => {
                  const cell = cells.get(`${build.id}/${encounter.id}`);
                  return (
                    <TableCell key={encounter.id} align="center" sx={{ p: "1px !important" }}>
                      {cell ? (
                        <ButtonBase
                          onClick={() => setSelected({ build, cell })}
                          aria-label={`${build.name} vs ${encounter.enemies}× ${encounter.enemy}: ${percent(cell.winRate)} wins, ${cell.avgUnitsLeft.toFixed(1)} body left`}
                          sx={[
                            { width: "100%", minWidth: 48, py: 0.5, borderRadius: 0.5, flexDirection: "column" },
                            cellColors(cell.winRate),
                          ]}
                        >
                          <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
                            {percent(cell.winRate)}
                          </Typography>
                          <Typography variant="caption" component="span" sx={{ opacity: 0.8, lineHeight: 1.2 }}>
                            {cell.avgUnitsLeft.toFixed(1)}
                          </Typography>
                        </ButtonBase>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
        Each cell: share of fights won (red 0% → yellow 50% → green 100%) and, below it, the average units of body left.
        Click a cell for the fight summary.
      </Typography>

      <Dialog open={selected !== null} onClose={() => setSelected(null)} fullWidth maxWidth="xs">
        {selected ? (
          <>
            <DialogTitle>
              {selected.build.name} vs {selected.cell.enemies}× {selected.cell.enemy}
            </DialogTitle>
            <DialogContent>
              <Box component="dl" sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 1, m: 0 }}>
                {[
                  ["Build", unitsText(selected.build)],
                  ["Action points", String(report.actionsPerRound)],
                  ["Win rate", `${percent(selected.cell.winRate)} of ${report.seeds} fights`],
                  ["Rounds (avg)", selected.cell.avgRounds.toFixed(1)],
                  ["Body spent (avg)", selected.cell.avgUnitsSpent.toFixed(1)],
                  ["Body left (avg)", selected.cell.avgUnitsLeft.toFixed(1)],
                  ["Most common loss", selected.cell.cause ?? "no losses"],
                  [
                    "Losses by cause",
                    Object.entries(selected.cell.causes)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cause, fights]) => `${cause}: ${fights}`)
                      .join(", ") || "—",
                  ],
                ].map(([label, value]) => (
                  <Fragment key={label}>
                    <Typography component="dt" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography component="dd" sx={{ m: 0 }}>
                      {value}
                    </Typography>
                  </Fragment>
                ))}
              </Box>
            </DialogContent>
          </>
        ) : null}
      </Dialog>
    </>
  );
}
