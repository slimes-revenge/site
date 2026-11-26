import type { Metadata } from "next";
import { Fragment } from "react";
import { Breadcrumbs, Container, Stack, Typography } from "@mui/material";

import { bossFields, bossPages, getBossPage, getLevel, getMap } from "../../../../data/wiki";
import { getIntl, tr } from "../../../../i18n";
import { RouterLink } from "../../../components/RouterLink";
import { StatusMark } from "../../../components/StatusMark";

interface IProps {
  params: Promise<{ lang: string; boss: string }>;
}

export function generateStaticParams() {
  return bossPages.map(boss => ({ boss: boss.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const { lang, boss } = await params;
  return { title: tr(getBossPage(boss).name, lang) };
}

export default async function BossPage({ params }: IProps) {
  const { lang, boss: bossId } = await params;
  const intl = getIntl(lang);
  const t = (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values);
  const boss = getBossPage(bossId);
  const map = getMap(boss.map);

  return (
    <Container maxWidth="md" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Breadcrumbs sx={{ mb: 1 }}>
        <RouterLink href={`/${lang}/bosses`}>{t("bosses.title")}</RouterLink>
        <Typography>{tr(boss.name, lang)}</Typography>
      </Breadcrumbs>
      <Typography variant="h4" component="h1">
        {tr(boss.name, lang)}
        <StatusMark status={boss.status} intl={intl} />
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 2 }}>
        {boss.name.en} · {t(`boss.kind.${boss.kind}`)}
        {boss.alternative ? ` · ${t("boss.alternative")}` : null}
      </Typography>
      <Stack spacing={0.75}>
        <Typography component="div">
          <b>{t("boss.where")}:</b>{" "}
          <RouterLink href={`/${lang}/maps/${map.id}`}>
            {t("map.label", { n: map.n })}: {tr(map.name, lang)}
          </RouterLink>
          {" — "}
          {boss.levels.map((id, i) => (
            <Fragment key={id}>
              {i ? ", " : null}
              <RouterLink href={`/${lang}/levels/${id}`}>{t("level.label", { n: getLevel(id).n })}</RouterLink>
            </Fragment>
          ))}
        </Typography>
        {bossFields.map(field => {
          const value = boss[field];
          return value ? (
            <Typography key={field}>
              <b>{t(`boss.${field}`)}:</b> {tr(value, lang)}
            </Typography>
          ) : null;
        })}
      </Stack>
    </Container>
  );
}
