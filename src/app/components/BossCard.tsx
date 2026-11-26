import { Paper, Typography } from "@mui/material";
import type { IntlShape } from "react-intl";

import type { Wiki } from "../../data/wiki";
import { tr } from "../../i18n";
import { StatusMark } from "./StatusMark";

const fields = ["does", "pass", "break", "deal", "loot"] as const;

// A guardian, map boss or arena boss: what it does and the ways past it.
export function BossCard({ boss, lang, intl }: { boss: Wiki["bosses"][number]; lang: string; intl: IntlShape }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 500 }}>
        {tr(boss.name, lang)}
        <StatusMark status={boss.status} intl={intl} />
        <Typography component="span" variant="body2" sx={{ color: "text.secondary", ml: 1 }}>
          {intl.formatMessage({ id: `boss.kind.${boss.kind}` })}
        </Typography>
      </Typography>
      {fields.map(field => {
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
