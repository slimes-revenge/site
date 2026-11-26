import { Paper, Typography } from "@mui/material";
import type { IntlShape } from "react-intl";

import { bossFields, type Text, type Wiki } from "../../data/wiki";
import { tr } from "../../i18n";
import { RouterLink } from "./RouterLink";
import { StatusMark } from "./StatusMark";

type Boss = Pick<Wiki["bosses"][number], "id" | "name" | "kind" | "status"> &
  Partial<Record<(typeof bossFields)[number], Text | null>>;

// A guardian, map boss or arena boss: what it does and the ways past it; the name links to its page.
export function BossCard({ boss, lang, intl }: { boss: Boss; lang: string; intl: IntlShape }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 500 }}>
        <RouterLink href={`/${lang}/bosses/${boss.id}`}>{tr(boss.name, lang)}</RouterLink>
        <StatusMark status={boss.status} intl={intl} />
        <Typography component="span" variant="body2" sx={{ color: "text.secondary", ml: 1 }}>
          {intl.formatMessage({ id: `boss.kind.${boss.kind}` })}
        </Typography>
      </Typography>
      {bossFields.map(field => {
        const value = boss[field];
        return value ? (
          <Typography key={field} variant="body2" sx={{ mt: 0.5 }}>
            <b>{intl.formatMessage({ id: `boss.${field}` })}:</b> {tr(value, lang)}
          </Typography>
        ) : null;
      })}
    </Paper>
  );
}
