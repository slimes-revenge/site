"use client";

import { Fragment, useState } from "react";
import {
  Box,
  ButtonBase,
  Dialog,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

import type { Cell, Report } from "../../data/schema";

// Hue 0 (red) → 60 (yellow) → 120 (green) by win rate.
const cellColors = (winRate: number) => (theme: Theme) => ({
  bgcolor: `hsl(${winRate * 120} 70% 72%)`,
  color: "#000",
  ...theme.applyStyles("dark", { bgcolor: `hsl(${winRate * 120} 55% 28%)`, color: "#fff" }),
});

const percent = (value: number) => `${Math.round(value * 100)}%`;

const stickyColumn = { position: "sticky", left: 0, zIndex: 1, bgcolor: "background.paper" } as const;

export function BuildMatrix({ report }: { report: Report }) {
  const [selected, setSelected] = useState<Cell | null>(null);

  // Column groups: enemy kinds in the order of the report's encounters, each with its enemy counts.
  const groups = new Map<string, number[]>();
  for (const encounter of report.encounters) {
    const cell = report.cells.find(c => c.encounter === encounter);
    if (cell) {
      const counts = groups.get(cell.enemy) ?? [];
      groups.set(
        cell.enemy,
        [...counts, cell.enemies].sort((a, b) => a - b),
      );
    }
  }
  const columns = [...groups].flatMap(([enemy, counts]) => counts.map(enemies => ({ enemy, enemies })));
  const findCell = (build: string, enemy: string, enemies: number) =>
    report.cells.find(c => c.build === build && c.enemy === enemy && c.enemies === enemies);

  return (
    <>
      <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
        <Table size="small" sx={{ "& td, & th": { px: 0.75, borderColor: "divider" } }}>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} sx={stickyColumn}>
                Build
              </TableCell>
              {[...groups].map(([enemy, counts]) => (
                <TableCell key={enemy} colSpan={counts.length} align="center" sx={{ borderLeft: 1 }}>
                  {enemy}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              {columns.map(({ enemy, enemies }, index) => (
                <TableCell
                  key={`${enemy}-${enemies}`}
                  align="center"
                  sx={{ borderLeft: index === 0 || columns[index - 1].enemy !== enemy ? 1 : 0 }}
                >
                  {enemies}×
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {report.builds.map(build => (
              <TableRow key={build}>
                <TableCell component="th" scope="row" sx={{ ...stickyColumn, whiteSpace: "nowrap" }}>
                  {build}
                </TableCell>
                {columns.map(({ enemy, enemies }) => {
                  const cell = findCell(build, enemy, enemies);
                  return (
                    <TableCell key={`${enemy}-${enemies}`} align="center" sx={{ p: "1px !important" }}>
                      {cell ? (
                        <ButtonBase
                          onClick={() => setSelected(cell)}
                          aria-label={`${build} vs ${cell.encounter}: ${percent(cell.winRate)} wins, ${cell.avgUnitsLeft.toFixed(1)} body left`}
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
              {selected.build} vs {selected.encounter}
            </DialogTitle>
            <DialogContent>
              <Box component="dl" sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 1, m: 0 }}>
                {[
                  ["Win rate", percent(selected.winRate)],
                  ["Rounds (avg)", selected.avgRounds.toFixed(1)],
                  ["Body spent (avg)", selected.avgUnitsSpent.toFixed(1)],
                  ["Body left (avg)", selected.avgUnitsLeft.toFixed(1)],
                  ["Most common loss", selected.cause ?? "no losses"],
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
