import { Alert, Container, Link, Typography } from "@mui/material";

import { loadReport, REPORT_URL } from "../data/report";
import { BuildMatrix } from "./components/BuildMatrix";

// Prerendered at build time even though the report fetch uses `no-store` (see src/data/report.ts).
export const dynamic = "force-static";

export default async function Page() {
  const { reports, sampleReason } = await loadReport();

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Slime&apos;s Revenge · build matrix
      </Typography>
      {sampleReason ? (
        <Alert severity="warning" sx={{ my: 1 }}>
          <b>Sample data.</b> The simulator report could not be loaded at build time ({sampleReason}), so this page
          shows a saved snapshot (simulator commit a2f83f6, 2026-11-25), <code>data/sample-design-guard.json</code>.
          Source: <Link href={REPORT_URL}>simulator release asset</Link>
        </Alert>
      ) : null}
      <BuildMatrix reports={reports} />
    </Container>
  );
}
