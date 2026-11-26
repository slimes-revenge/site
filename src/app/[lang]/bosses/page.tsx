import type { Metadata } from "next";
import { Container, Stack, Typography } from "@mui/material";

import { bossPages } from "../../../data/wiki";
import { getIntl } from "../../../i18n";
import { BossCard } from "../../components/BossCard";

interface IProps {
  params: Promise<{ lang: string }>;
}

const kinds = ["guardian", "boss", "arena"] as const;

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  return { title: getIntl((await params).lang).formatMessage({ id: "bosses.title" }) };
}

export default async function BossesPage({ params }: IProps) {
  const { lang } = await params;
  const intl = getIntl(lang);

  return (
    <Container maxWidth="lg" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {intl.formatMessage({ id: "bosses.title" })}
      </Typography>
      <Typography sx={{ maxWidth: "75ch", mb: 2 }}>{intl.formatMessage({ id: "bosses.lead" })}</Typography>
      {kinds.map(kind => (
        <Stack key={kind} spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" component="h2">
            {intl.formatMessage({ id: `bosses.group.${kind}` })}
          </Typography>
          {bossPages
            .filter(boss => boss.kind === kind)
            .map(boss => (
              <BossCard key={boss.id} boss={boss} lang={lang} intl={intl} />
            ))}
        </Stack>
      ))}
    </Container>
  );
}
