import { Fragment } from "react";
import type { IntlShape } from "react-intl";

import { getBoss, getCreature, type Wiki } from "../../data/wiki";
import { tr } from "../../i18n";
import { RouterLink } from "./RouterLink";

type Source = Wiki["levels"][number]["liquids"][number]["from"][number];

// Where a liquid comes from on a level: a creature's corpse (linked to the bestiary), a guardian or boss, the river…
export function SourceList({ from, lang, intl }: { from: Source[]; lang: string; intl: IntlShape }) {
  return from.map((source, i) => {
    let label;
    if (source.kind === "corpse" && source.creature) {
      const creature = getCreature(source.creature);
      label = <RouterLink href={`/${lang}/bestiary/${creature.id}`}>{tr(creature.name, lang)}</RouterLink>;
    } else if (source.creature) {
      const boss = getBoss(source.creature);
      label = `${tr(boss.name, lang)} (${intl.formatMessage({ id: `boss.kind.${boss.kind}` })})`;
    } else {
      label = intl.formatMessage({ id: `source.${source.kind}` });
    }
    return (
      <Fragment key={i}>
        {i ? ", " : null}
        {label}
        {source.note ? ` (${tr(source.note, lang)})` : null}
      </Fragment>
    );
  });
}
