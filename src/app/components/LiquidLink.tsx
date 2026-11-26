import { getLiquid } from "../../data/wiki";
import { tr } from "../../i18n";
import { RouterLink } from "./RouterLink";

// A liquid's name linked to its page.
export function LiquidLink({ id, lang }: { id: string; lang: string }) {
  return <RouterLink href={`/${lang}/liquids/${id}`}>{tr(getLiquid(id).name, lang)}</RouterLink>;
}
