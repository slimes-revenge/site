import type { Metadata } from "next";
import { Box, Container, Paper, Typography } from "@mui/material";

import { wiki } from "../../../data/wiki";
import { getIntl, tr } from "../../../i18n";
import { RouterLink } from "../../components/RouterLink";
import { StatusMark } from "../../components/StatusMark";

interface IProps {
  params: Promise<{ lang: string }>;
}

const groups = ["circle-1", "circle-2", "status", "single"] as const;

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  return { title: getIntl((await params).lang).formatMessage({ id: "liquids.title" }) };
}

export default async function LiquidsPage({ params }: IProps) {
  const { lang } = await params;
  const intl = getIntl(lang);

  return (
    <Container maxWidth="lg" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {intl.formatMessage({ id: "liquids.title" })}
      </Typography>
      <Typography sx={{ maxWidth: "75ch", mb: 2 }}>{intl.formatMessage({ id: "liquids.lead" })}</Typography>
      {groups.map(group => (
        <Box key={group} sx={{ mb: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {intl.formatMessage({ id: `liquid.group.${group}` })}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 1 }}>
            {wiki.liquids
              .filter(liquid => liquid.group === group)
              .map(liquid => (
                <Paper key={liquid.id} variant="outlined" sx={{ p: 1 }}>
                  <RouterLink href={`/${lang}/liquids/${liquid.id}`} sx={{ fontWeight: 500 }}>
                    {tr(liquid.name, lang)}
                  </RouterLink>
                  <StatusMark status={liquid.status} intl={intl} />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {tr(liquid.hold, lang)}
                  </Typography>
                </Paper>
              ))}
          </Box>
        </Box>
      ))}
    </Container>
  );
}
