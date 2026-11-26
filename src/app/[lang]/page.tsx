import { Box, Container, Paper, Stack, Typography } from "@mui/material";

import { getLevel, getStop, wiki } from "../../data/wiki";
import { getIntl, tr } from "../../i18n";
import { StatusMark } from "../components/StatusMark";
import { RouterChip, RouterLink } from "../components/RouterLink";

export default async function RoutePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const intl = getIntl(lang);

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {intl.formatMessage({ id: "route.title" })}
      </Typography>
      <Typography sx={{ maxWidth: "75ch" }}>{intl.formatMessage({ id: "route.lead" })}</Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, mt: 1 }}>
        {intl.formatMessage({ id: "route.legend" })}
        {(["decided", "working", "proposal"] as const).map(status => (
          <Box component="span" key={status} sx={{ ml: 1.5, whiteSpace: "nowrap" }}>
            <StatusMark status={status} intl={intl} /> {intl.formatMessage({ id: `status.${status}` })}
          </Box>
        ))}
      </Typography>
      <Stack spacing={1.5}>
        {wiki.maps.map(map => (
          <Paper key={map.id} variant="outlined" sx={{ p: 1.5 }}>
            <Typography variant="h6" component="h2">
              <RouterLink href={`/${lang}/maps/${map.id}`} underline="hover">
                {intl.formatMessage({ id: "map.label" }, { n: map.n })}: {tr(map.name, lang)}
              </RouterLink>
              <StatusMark status={map.status} intl={intl} />
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              {tr(map.sky, lang)}
            </Typography>
            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
              {map.levels.map(id => {
                const level = getLevel(id);
                return (
                  <RouterChip
                    key={id}
                    href={`/${lang}/levels/${id}`}
                    label={level.n}
                    title={tr(level.name, lang)}
                    color={level.kind === "boss" ? "error" : "default"}
                    variant={level.kind === "unique" ? "outlined" : "filled"}
                  />
                );
              })}
              {map.stop ? (
                <Typography variant="body2" sx={{ color: "text.secondary", ml: 1 }}>
                  → <RouterLink href={`/${lang}/stops/${map.stop}`}>{tr(getStop(map.stop).name, lang)}</RouterLink>
                </Typography>
              ) : null}
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
