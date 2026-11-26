import type { Metadata } from "next";
import { Fragment } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";

import { getMap, wiki } from "../../../data/wiki";
import { getIntl, tr } from "../../../i18n";
import { LiquidLink } from "../../components/LiquidLink";
import { RouterLink } from "../../components/RouterLink";
import { StatusMark } from "../../components/StatusMark";

interface IProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  return { title: getIntl((await params).lang).formatMessage({ id: "stops.title" }) };
}

export default async function StopsPage({ params }: IProps) {
  const { lang } = await params;
  const intl = getIntl(lang);

  return (
    <Container maxWidth="lg" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {intl.formatMessage({ id: "stops.title" })}
      </Typography>
      <Typography sx={{ maxWidth: "75ch", mb: 2 }}>{intl.formatMessage({ id: "stops.lead" })}</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1 }}>
        {wiki.stops.map(stop => (
          <Paper key={stop.id} variant="outlined" sx={{ p: 1.5 }}>
            <RouterLink href={`/${lang}/stops/${stop.id}`} sx={{ fontWeight: 500 }}>
              {tr(stop.name, lang)}
            </RouterLink>
            <StatusMark status={stop.status} intl={intl} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {intl.formatMessage({ id: "stop.afterMap" }, { n: getMap(stop.afterMap).n })}
            </Typography>
            {stop.offers.length ? (
              <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                {intl.formatMessage({ id: "stop.offers" })}:{" "}
                {stop.offers.map((id, i) => (
                  <Fragment key={id}>
                    {i ? ", " : null}
                    <LiquidLink id={id} lang={lang} />
                  </Fragment>
                ))}
              </Typography>
            ) : null}
          </Paper>
        ))}
      </Box>
    </Container>
  );
}
