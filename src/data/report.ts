import sample from "../../data/sample-design-guard.json";
import { Report, reportSchema } from "./schema";

export const REPORT_URL = "https://github.com/slimes-revenge/simulator/releases/download/latest/design-guard.json";

// Runs once per `next build`: the page is prerendered, so the default fetch is not cached between builds.
export async function loadReport(): Promise<{ report: Report; sampleReason?: string }> {
  try {
    const response = await fetch(REPORT_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return { report: reportSchema.parse(await response.json()) };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`design-guard.json: ${reason}; using data/sample-design-guard.json`);
    return { report: reportSchema.parse(sample), sampleReason: reason };
  }
}
