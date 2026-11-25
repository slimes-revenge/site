import { Alert, Box, Container, Link, Typography } from "@mui/material";

import { loadReport, REPORT_URL } from "../data/report";
import { BuildMatrix } from "./components/BuildMatrix";

export default async function Page() {
  const { report, sampleReason } = await loadReport();
  const generated = new Date(report.generatedUtc).toISOString().replace("T", " ").slice(0, 16);

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Slime&apos;s Revenge · build matrix
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Policy <b>{report.policy}</b> · action points <b>{report.actionsPerRound}</b> · seeds <b>{report.seeds}</b> ·
        commit{" "}
        <Link href={`https://github.com/slimes-revenge/simulator/commit/${report.commit}`}>
          {report.commit.slice(0, 7)}
        </Link>{" "}
        · generated {generated} UTC
      </Typography>
      {sampleReason ? (
        <Alert severity="warning" sx={{ my: 1 }}>
          <b>Sample data.</b> The simulator report could not be loaded at build time ({sampleReason}), so this page
          shows the made-up <code>data/sample-design-guard.json</code>. Source:{" "}
          <Link href={REPORT_URL}>simulator release asset</Link>
        </Alert>
      ) : null}
      <Box sx={{ mt: 2 }}>
        <BuildMatrix report={report} />
      </Box>
    </Container>
  );
}
