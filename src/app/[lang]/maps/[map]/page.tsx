import type { Metadata } from "next";
import { Breadcrumbs, Container, Stack, Typography } from "@mui/material";

import { getBoss, getLevel, getMap, getStop, wiki } from "../../../../data/wiki";
import { getIntl, tr } from "../../../../i18n";
import { BossCard } from "../../../components/BossCard";
import { StatusMark } from "../../../components/StatusMark";
import { RouterChip, RouterLink } from "../../../components/RouterLink";

interface IProps {
  params: Promise<{ lang: string; map: string }>;
}

export function generateStaticParams() {
  return wiki.maps.map(map => ({ map: map.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const { lang, map } = await params;
  return { title: tr(getMap(map).name, lang) };
}

export default async function MapPage({ params }: IProps) {
  const { lang, map: mapId } = await params;
  const intl = getIntl(lang);
  const map = getMap(mapId);
  const levels = map.levels.map(getLevel);
  const numbers = new Set(levels.map(level => level.n));
  const creatures = wiki.creatures.filter(creature => creature.levels.some(n => numbers.has(n)));
  const arenas = wiki.bosses.filter(boss => boss.map === map.id && boss.kind === "arena");

  return (
    <Container maxWidth="lg" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Breadcrumbs sx={{ mb: 1 }}>
        <RouterLink href={`/${lang}`}>{intl.formatMessage({ id: "nav.route" })}</RouterLink>
        <Typography>{intl.formatMessage({ id: "map.label" }, { n: map.n })}</Typography>
      </Breadcrumbs>
      <Typography variant="h4" component="h1">
        {tr(map.name, lang)}
        <StatusMark status={map.status} intl={intl} />
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 2 }}>
        {intl.formatMessage({ id: "map.sky" })}: {tr(map.sky, lang)}
      </Typography>

      <Typography variant="h6" component="h2">
        {intl.formatMessage({ id: "map.obstacle" })}
      </Typography>
      <Typography sx={{ mb: 2, maxWidth: "75ch" }}>{tr(map.obstacle, lang)}</Typography>

      <Typography variant="h6" component="h2">
        {intl.formatMessage({ id: "map.levels" })}
      </Typography>
      <Stack component="ol" sx={{ pl: 0, mb: 2, listStyle: "none" }} spacing={0.5}>
        {levels.map(level => (
          <li key={level.id}>
            <RouterLink href={`/${lang}/levels/${level.id}`}>
              {intl.formatMessage({ id: "level.label" }, { n: level.n })}
            </RouterLink>
            : {tr(level.name, lang)}
            <StatusMark status={level.status} intl={intl} />
          </li>
        ))}
      </Stack>

      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h6" component="h2">
          {intl.formatMessage({ id: "map.guardian" })}
        </Typography>
        <BossCard boss={getBoss(map.guardian)} lang={lang} intl={intl} />
        <Typography variant="h6" component="h2">
          {intl.formatMessage({ id: "map.boss" })}
        </Typography>
        <BossCard boss={getBoss(map.boss)} lang={lang} intl={intl} />
        {arenas.map(boss => (
          <BossCard key={boss.id} boss={boss} lang={lang} intl={intl} />
        ))}
      </Stack>

      <Typography variant="h6" component="h2">
        {intl.formatMessage({ id: "map.creatures" })}
      </Typography>
      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75, mb: 2 }}>
        {creatures.map(creature => (
          <RouterChip
            key={creature.id}
            href={`/${lang}/bestiary/${creature.id}`}
            label={tr(creature.name, lang)}
            size="small"
          />
        ))}
      </Stack>

      {map.stop ? (
        <Typography>
          {intl.formatMessage({ id: "map.stop" })}: {tr(getStop(map.stop).name, lang)}
        </Typography>
      ) : null}
    </Container>
  );
}
