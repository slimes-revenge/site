import type { Metadata } from "next";
import { Breadcrumbs, Chip, Container, Paper, Stack, Typography } from "@mui/material";

import { findBoss, getBoss, getCreature, getLevel, getLiquid, getMap, wiki } from "../../../../data/wiki";
import { getIntl, tr } from "../../../../i18n";
import { BossCard } from "../../../components/BossCard";
import { StatusMark } from "../../../components/StatusMark";
import { RouterLink } from "../../../components/RouterLink";

interface IProps {
  params: Promise<{ lang: string; level: string }>;
}

export function generateStaticParams() {
  return wiki.levels.map(level => ({ level: level.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const { lang, level } = await params;
  return { title: `${getIntl(lang).formatMessage({ id: "level.label" }, { n: getLevel(level).n })}` };
}

export default async function LevelPage({ params }: IProps) {
  const { lang, level: levelId } = await params;
  const intl = getIntl(lang);
  const t = (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values);
  const level = getLevel(levelId);
  const map = getMap(level.map);
  const index = wiki.levels.indexOf(level);
  const prev = wiki.levels[index - 1];
  const next = wiki.levels[index + 1];
  const liquidName = (id: string) => tr(getLiquid(id).name, lang);

  return (
    <Container maxWidth="lg" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Breadcrumbs sx={{ mb: 1 }}>
        <RouterLink href={`/${lang}`}>{t("nav.route")}</RouterLink>
        <RouterLink href={`/${lang}/maps/${map.id}`}>{t("map.label", { n: map.n })}</RouterLink>
        <Typography>{t("level.label", { n: level.n })}</Typography>
      </Breadcrumbs>
      <Typography variant="h4" component="h1">
        {t("level.label", { n: level.n })}: {tr(level.name, lang)}
        <StatusMark status={level.status} intl={intl} />
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 2 }}>
        {t(`level.kind.${level.kind}`)} · {t(`level.exit.${level.exit}`)}
      </Typography>

      <Typography variant="h6" component="h2">
        {t("level.enemies")}
      </Typography>
      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75, mb: 2 }}>
        {level.enemies.map(id => (
          <Chip key={id} label={tr(getCreature(id).name, lang)} size="small" />
        ))}
      </Stack>

      <Typography variant="h6" component="h2">
        {t("level.liquids")}
      </Typography>
      <Stack component="ul" sx={{ pl: 2.5, mt: 0.5, mb: 2 }} spacing={0.25}>
        {level.liquids.map(({ liquid, from }) => (
          <li key={liquid}>
            <b>{liquidName(liquid)}</b>
            {" — "}
            {from
              .map(source => {
                const label = source.creature
                  ? source.kind === "corpse"
                    ? tr(getCreature(source.creature).name, lang)
                    : `${tr(getBoss(source.creature).name, lang)} (${t(`boss.kind.${getBoss(source.creature).kind}`)})`
                  : t(`source.${source.kind}`);
                return source.note ? `${label} (${tr(source.note, lang)})` : label;
              })
              .join(", ")}
          </li>
        ))}
      </Stack>

      {level.variants.length ? (
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" component="h2">
            {t("level.bosses")}
          </Typography>
          {level.variants.map(variant => (
            <BossCard
              key={variant.id}
              // The full record when there is one; a pool alternative has only the variant's own text.
              boss={findBoss(variant.id) ?? { ...variant, does: variant.about }}
              lang={lang}
              intl={intl}
            />
          ))}
        </Stack>
      ) : null}

      {level.secrets.length ? (
        <>
          <Typography variant="h6" component="h2">
            {t("level.secrets")}
          </Typography>
          <Stack component="ul" sx={{ pl: 2.5, mt: 0.5, mb: 2 }} spacing={0.25}>
            {level.secrets.map(secret => (
              <li key={secret.name.ru}>
                <b>{tr(secret.name, lang)}</b>
                {secret.note ? ` — ${tr(secret.note, lang)}` : null}
                <StatusMark status={secret.status} intl={intl} />
              </li>
            ))}
          </Stack>
        </>
      ) : null}

      {level.inside.length ? (
        <>
          <Typography variant="h6" component="h2">
            {t("level.inside")}
          </Typography>
          <Stack component="ul" sx={{ pl: 2.5, mt: 0.5, mb: 2 }} spacing={0.25}>
            {level.inside.map(item => (
              <li key={item.ru}>{tr(item, lang)}</li>
            ))}
          </Stack>
        </>
      ) : null}

      {level.resetsOnExit.length ? (
        <>
          <Typography variant="h6" component="h2">
            {t("level.resets")}
          </Typography>
          <Stack component="ul" sx={{ pl: 2.5, mt: 0.5, mb: 2 }} spacing={0.25}>
            {level.resetsOnExit.map(reset => (
              <li key={reset.liquid}>
                {reset.becomes
                  ? t("level.resetBecomes", { from: liquidName(reset.liquid), to: liquidName(reset.becomes) })
                  : t("level.resetGone", { from: liquidName(reset.liquid) })}
                {" — "}
                {tr(reset.where, lang)}
              </li>
            ))}
          </Stack>
        </>
      ) : null}

      <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
        <Typography variant="h6" component="h2">
          {t("level.numbers")}
        </Typography>
        <Typography variant="body2">
          {t("level.rooms")}: {level.rooms}
        </Typography>
        <Typography variant="body2">
          {t("level.perRoom")}: {tr(level.perRoom, lang)}
        </Typography>
        <Typography variant="body2">
          {t("level.capacity")}: {level.capacity.easy} · {level.capacity.normal} · {level.capacity.hard}
        </Typography>
        {level.hunters ? (
          <Typography variant="body2">
            {t("level.hunters")}: {tr(level.hunters.note, lang)}
            <StatusMark status={level.hunters.status} intl={intl} />
          </Typography>
        ) : null}
      </Paper>

      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
        {prev ? (
          <RouterLink href={`/${lang}/levels/${prev.id}`}>{t("level.prev", { n: prev.n })}</RouterLink>
        ) : (
          <span />
        )}
        {next ? <RouterLink href={`/${lang}/levels/${next.id}`}>{t("level.next", { n: next.n })}</RouterLink> : null}
      </Stack>
    </Container>
  );
}
