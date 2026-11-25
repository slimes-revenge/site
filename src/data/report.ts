import { z } from "zod";

import sample from "../../data/sample-design-guard.json";
import { Report, reportSchema } from "./schema";

export const REPORT_URL = "https://github.com/slimes-revenge/simulator/releases/download/latest/design-guard.json";

// Runs once per `next build`. `no-store` keeps the response out of the fetch cache (a default fetch is stored there and
// reused by later builds); `dynamic = "force-static"` in page.tsx keeps the page prerendered despite `no-store`.
export async function loadReport(): Promise<{ report: Report; sampleReason?: string }> {
  try {
    const response = await fetch(REPORT_URL, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return { report: reportSchema.parse(await response.json()) };
  } catch (error) {
    const reason =
      error instanceof z.ZodError
        ? `invalid report: ${z.prettifyError(error)}`
        : error instanceof Error
          ? error.message
          : String(error);
    console.warn(`design-guard.json: ${reason}; using data/sample-design-guard.json`);
    return { report: reportSchema.parse(sample), sampleReason: reason };
  }
}
