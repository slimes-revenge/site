import type { Metadata } from "next";
import { Fragment } from "react";
import { Breadcrumbs, Container, Stack, Typography } from "@mui/material";

import { getLiquid, wiki } from "../../../../data/wiki";
import { getIntl, tr } from "../../../../i18n";
import { RouterLink } from "../../../components/RouterLink";
import { SourceList } from "../../../components/SourceList";
import { StatusMark } from "../../../components/StatusMark";

interface IProps {
  params: Promise<{ lang: string; liquid: string }>;
}

const roles = ["hold", "strike", "hit", "spit", "puddle"] as const;

export function generateStaticParams() {
  return wiki.liquids.map(liquid => ({ liquid: liquid.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const { lang, liquid } = await params;
  return { title: tr(getLiquid(liquid).name, lang) };
}

export default async function LiquidPage({ params }: IProps) {
  const { lang, liquid: liquidId } = await params;
  const intl = getIntl(lang);
  const t = (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values);
  const liquid = getLiquid(liquidId);
  const found = wiki.levels.flatMap(level =>
    level.liquids.filter(entry => entry.liquid === liquid.id).map(entry => ({ level, from: entry.from })),
  );
  const element = wiki.creatures.filter(creature => creature.element === liquid.id);
  const stops = wiki.stops.filter(stop => stop.offers.includes(liquid.id) || stop.fixed === liquid.id);

  return (
    <Container maxWidth="md" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Breadcrumbs sx={{ mb: 1 }}>
        <RouterLink href={`/${lang}/liquids`}>{t("liquids.title")}</RouterLink>
        <Typography>{tr(liquid.name, lang)}</Typography>
      </Breadcrumbs>
      <Typography variant="h4" component="h1">
        {tr(liquid.name, lang)}
        <StatusMark status={liquid.status} intl={intl} />
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 2 }}>
        {liquid.name.en} · {t(`liquid.group.${liquid.group}`)}
      </Typography>

      <Stack spacing={0.75} sx={{ mb: 2 }}>
        {roles.map(role => {
          const value = liquid[role];
          return value ? (
            <Typography key={role}>
              <b>{t(`liquid.${role}`)}:</b> {tr(value, lang)}
            </Typography>
          ) : null;
        })}
      </Stack>

      <Typography variant="h6" component="h2">
        {t("liquid.found")}
      </Typography>
      {found.length ? (
        <Stack component="ul" sx={{ pl: 2.5, mt: 0.5, mb: 2 }} spacing={0.25}>
          {found.map(({ level, from }) => (
            <li key={level.id}>
              <RouterLink href={`/${lang}/levels/${level.id}`}>{t("level.label", { n: level.n })}</RouterLink>
              {" — "}
              <SourceList from={from} lang={lang} intl={intl} />
            </li>
          ))}
        </Stack>
      ) : (
        <Typography sx={{ mb: 2, color: "text.secondary" }}>{t("liquid.foundNowhere")}</Typography>
      )}

      {stops.length ? (
        <>
          <Typography variant="h6" component="h2">
            {t("liquid.stops")}
          </Typography>
          <Stack component="ul" sx={{ pl: 2.5, mt: 0.5, mb: 2 }} spacing={0.25}>
            {stops.map(stop => (
              <li key={stop.id}>
                {tr(stop.name, lang)} — {t(stop.fixed === liquid.id ? "liquid.stopFixed" : "liquid.stopOffer")}
              </li>
            ))}
          </Stack>
        </>
      ) : null}

      {element.length ? (
        <>
          <Typography variant="h6" component="h2">
            {t("liquid.element")}
          </Typography>
          <Typography component="div" sx={{ mb: 2 }}>
            {element.map((creature, i) => (
              <Fragment key={creature.id}>
                {i ? ", " : null}
                <RouterLink href={`/${lang}/bestiary/${creature.id}`}>{tr(creature.name, lang)}</RouterLink>
              </Fragment>
            ))}
          </Typography>
        </>
      ) : null}
    </Container>
  );
}
