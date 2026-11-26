import type { Metadata } from "next";
import { Fragment } from "react";
import { Breadcrumbs, Container, Stack, Typography } from "@mui/material";

import { getMap, getStop, wiki } from "../../../../data/wiki";
import { getIntl, tr } from "../../../../i18n";
import { LiquidLink } from "../../../components/LiquidLink";
import { RouterLink } from "../../../components/RouterLink";
import { StatusMark } from "../../../components/StatusMark";

interface IProps {
  params: Promise<{ lang: string; stop: string }>;
}

export function generateStaticParams() {
  return wiki.stops.map(stop => ({ stop: stop.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const { lang, stop } = await params;
  return { title: tr(getStop(stop).name, lang) };
}

export default async function StopPage({ params }: IProps) {
  const { lang, stop: stopId } = await params;
  const intl = getIntl(lang);
  const t = (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values);
  const stop = getStop(stopId);
  const map = getMap(stop.afterMap);

  return (
    <Container maxWidth="md" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Breadcrumbs sx={{ mb: 1 }}>
        <RouterLink href={`/${lang}/stops`}>{t("stops.title")}</RouterLink>
        <Typography>{tr(stop.name, lang)}</Typography>
      </Breadcrumbs>
      <Typography variant="h4" component="h1">
        {tr(stop.name, lang)}
        <StatusMark status={stop.status} intl={intl} />
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 2 }}>
        {stop.name.en} · <RouterLink href={`/${lang}/maps/${map.id}`}>{t("stop.afterMap", { n: map.n })}</RouterLink>
      </Typography>
      <Stack spacing={0.75}>
        <Typography>
          <b>{t("stop.where")}:</b> {tr(stop.where, lang)}
        </Typography>
        {stop.offers.length ? (
          <Typography component="div">
            <b>{t("stop.offers")}:</b>{" "}
            {stop.offers.map((id, i) => (
              <Fragment key={id}>
                {i ? ", " : null}
                <LiquidLink id={id} lang={lang} />
              </Fragment>
            ))}
          </Typography>
        ) : null}
        {stop.fixed ? (
          <Typography component="div">
            <b>{t("stop.fixed")}:</b> <LiquidLink id={stop.fixed} lang={lang} />
          </Typography>
        ) : null}
        {stop.single ? (
          <Typography>
            <b>{t("stop.single")}:</b> {tr(stop.single, lang)}
          </Typography>
        ) : null}
        <Typography>
          <b>{t("stop.wants")}:</b> {tr(stop.wants, lang)}
        </Typography>
        <Typography>
          <b>{t("stop.also")}:</b> {tr(stop.also, lang)}
        </Typography>
      </Stack>
    </Container>
  );
}
