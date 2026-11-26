import type { Metadata } from "next";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";

import { wiki } from "../../../data/wiki";
import { getIntl, tr } from "../../../i18n";
import { CreaturePicture } from "../../components/CreaturePicture";
import { RouterLink } from "../../components/RouterLink";
import { StatusMark } from "../../components/StatusMark";

interface IProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  return { title: getIntl((await params).lang).formatMessage({ id: "bestiary.title" }) };
}

export default async function BestiaryPage({ params }: IProps) {
  const { lang } = await params;
  const intl = getIntl(lang);

  return (
    <Container maxWidth="lg" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {intl.formatMessage({ id: "bestiary.title" })}
      </Typography>
      <Typography sx={{ maxWidth: "75ch", mb: 2 }}>{intl.formatMessage({ id: "bestiary.lead" })}</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 1 }}>
        {wiki.creatures.map(creature => (
          <Paper key={creature.id} variant="outlined" sx={{ p: 1 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <CreaturePicture
                creature={creature}
                lang={lang}
                size={64}
                missing={intl.formatMessage({ id: "creature.noPicture" })}
              />
              <Box>
                <RouterLink href={`/${lang}/bestiary/${creature.id}`} sx={{ fontWeight: 500 }}>
                  {tr(creature.name, lang)}
                </RouterLink>
                <StatusMark status={creature.status} intl={intl} />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {tr(creature.type, lang)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Box>
    </Container>
  );
}
