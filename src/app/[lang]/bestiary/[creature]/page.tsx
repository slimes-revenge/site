import type { Metadata } from "next";
import { Fragment } from "react";
import { Box, Breadcrumbs, Container, Stack, Typography } from "@mui/material";

import { getCreature, wiki } from "../../../../data/wiki";
import { getIntl, tr } from "../../../../i18n";
import { CreaturePicture } from "../../../components/CreaturePicture";
import { LiquidLink } from "../../../components/LiquidLink";
import { RouterLink } from "../../../components/RouterLink";
import { StatusMark } from "../../../components/StatusMark";

interface IProps {
  params: Promise<{ lang: string; creature: string }>;
}

export function generateStaticParams() {
  return wiki.creatures.map(creature => ({ creature: creature.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const { lang, creature } = await params;
  return { title: tr(getCreature(creature).name, lang) };
}

export default async function CreaturePage({ params }: IProps) {
  const { lang, creature: creatureId } = await params;
  const intl = getIntl(lang);
  const t = (id: string, values?: Record<string, string>) => intl.formatMessage({ id }, values);
  const creature = getCreature(creatureId);
  const levels = wiki.levels.filter(level => creature.levels.includes(level.n));

  // A comma-separated list of liquid links, or "ничего".
  const liquids = (ids: string[]) =>
    ids.length
      ? ids.map((id, i) => (
          <Fragment key={id}>
            {i ? ", " : null}
            <LiquidLink id={id} lang={lang} />
          </Fragment>
        ))
      : t("creature.nothing");

  return (
    <Container maxWidth="md" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Breadcrumbs sx={{ mb: 1 }}>
        <RouterLink href={`/${lang}/bestiary`}>{t("bestiary.title")}</RouterLink>
        <Typography>{tr(creature.name, lang)}</Typography>
      </Breadcrumbs>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, mb: 2 }}>
        <CreaturePicture creature={creature} lang={lang} size={160} missing={t("creature.noPicture")} />
        <Box>
          <Typography variant="h4" component="h1">
            {tr(creature.name, lang)}
            <StatusMark status={creature.status} intl={intl} />
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>{creature.name.en}</Typography>
          <Typography sx={{ mt: 1 }}>{tr(creature.does, lang)}</Typography>
        </Box>
      </Stack>

      <Stack spacing={0.75}>
        <Typography>
          <b>{t("creature.type")}:</b> {tr(creature.type, lang)}
        </Typography>
        <Typography>
          <b>{t("creature.element")}:</b> <LiquidLink id={creature.element} lang={lang} />
        </Typography>
        <Typography component="div">
          <b>{t("creature.loot")}:</b>{" "}
          {creature.loot.length
            ? creature.loot.map((loot, i) => (
                <Fragment key={loot.liquid}>
                  {i ? "; " : null}
                  <LiquidLink id={loot.liquid} lang={lang} />
                  {loot.levels ? ` (${t("creature.lootLevels", { levels: loot.levels.join(", ") })})` : null}
                  {loot.note ? ` — ${tr(loot.note, lang)}` : null}
                </Fragment>
              ))
            : t("creature.nothing")}
        </Typography>
        <Typography>
          <b>{t("creature.weakTo")}:</b> {liquids(creature.weakTo)}
        </Typography>
        <Typography>
          <b>{t("creature.immuneTo")}:</b> {liquids(creature.immuneTo)}
        </Typography>
        <Typography component="div">
          <b>{t("creature.levels")}:</b>{" "}
          {levels.map((level, i) => (
            <Fragment key={level.id}>
              {i ? ", " : null}
              <RouterLink href={`/${lang}/levels/${level.id}`}>{level.n}</RouterLink>
            </Fragment>
          ))}
        </Typography>
      </Stack>
    </Container>
  );
}
