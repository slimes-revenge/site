# Wiki data and the route pages

## Source

`data/wiki.json` is the game wiki's content: maps, levels, bosses (guardians, map bosses, arenas), creatures, liquids and stops. The lore session writes it with `tools/path-gen.py` in its own folder and the site copies the file in unchanged (it is in `.prettierignore`, so a new copy diffs cleanly against the old one). The repository never reads a folder outside itself.

The file is spoiler-free at the source: the story twist and the endings stay private, the final fight is described neutrally. A new copy is still searched for spoiler topics before it is committed (golem, soul, alchemist's secret, hunters' motive, endings).

## Validation

`src/data/wiki.ts` parses the file with zod (strict objects: an unknown field fails too) when the module loads, so a broken export fails the build with the zod message. Besides the shape it checks that ids are unique per list and that every reference resolves: map → levels, guardian, boss, stop; level → map, enemies, bosses, liquids and their sources; boss → map and levels; creature → element, loot, weak and immune liquids; stop → map and liquids. Both sides of a link must agree: a map's `levels` are exactly the levels naming it, `map.stop` is the stop whose `afterMap` is the map, a level's `guardian` and `boss` list that level in their `levels`, level numbers are unique; corpse, guardian and boss sources must name their `creature`. `getMap`, `getLevel`, `getBoss`, `getCreature`, `getLiquid`, `getStop` look items up by id and throw on an unknown one.

Text fields are `{ ru, en? }`; names are `{ ru, en }`. `tr(text, lang)` picks the language and falls back to Russian. `status` is `decided | working | proposal | idea`; pages show it as a coloured dot (`StatusMark`), spelled out in the tooltip.

## Locales and routes

Every page lives under `src/app/[lang]/`; `locales` in `src/i18n/index.ts` lists the published locales (only `ru`). UI strings are ICU messages in `src/i18n/<locale>.json`, formatted with react-intl's `createIntl` on the server. `/` redirects to `/ru` (`next.config.ts`). All routes use `generateStaticParams` with `dynamicParams = false`, so every page is prerendered and an unknown locale or id is a 404. English needs `en.json`, an entry in `messages` and `en` texts in the data.

Server components cannot pass `component={NextLink}` to MUI; `RouterLink` and `RouterChip` (client) do it for them.

## Pages

- `/ru` — the route: five maps, each with its four levels (boss level red, the unique level outlined) and the stop after it.
- `/ru/maps/[map]` — sky, what blocks the river, the levels, the location guardian, the map boss and the arena bosses, the creatures whose `levels` fall on the map, the stop after it.
- `/ru/levels/[level]` — kind and surface exit; enemies; each liquid with its sources (river, a creature's corpse, a guardian or boss, an in-level source, with the note); the level's `variants`: every guardian, boss or arena that can stand there, each pool alternative separately (the full `bosses` record when there is one, otherwise the variant's own `about` and `pass`); secret-room variants; in-level sources and filters; what resets on exit; rooms, enemies per room, capacity per difficulty, hunters on Hard. Empty sections are left out.
- `/ru/bestiary` — every creature as a card: picture, name, type. `/ru/bestiary/[creature]` — picture, English name, what it does, type, element, loot (with the levels where that loot applies, from `loot[].levels`), weak to, immune to, the levels it lives on. Level and map pages link enemies here; `SourceList` links corpse sources here.
- `/ru/liquids` — the liquids grouped by `group` (first circle, second circle, states, singles) with what holding them does. `/ru/liquids/[liquid]` — the five roles (`hold`, `strike`, `hit`, `spit`, `puddle`; empty ones left out), where it is found (every level whose `liquids` list it, with the sources), the stops that offer it (on choice or always, `fixed`), the creatures whose element it is. `LiquidLink` links liquid names here.
- `/ru/sim` — the simulator's build matrix (`design-guard-report.md`).

## Creature pictures

`CreaturePicture` shows `public/creatures/<creature id>.png` when the file exists (checked at build time) and otherwise an empty dashed slot with the name's first letter ("картинки пока нет" in the tooltip). The pictures are the first 64×64 battle-sprite frame (top-left of the battle row, `y = 128` from the top) of the game's sprite sheets in `slimes-revenge/SlimesRevenge` → `Assets/Art/Animals/<Name>.png`, shown with `image-rendering: pixelated`. Only creatures whose game sprite is the same creature have one: `bat` (Bat), `undine` (Undine), `mandrake` (Mandragora). When the game gets new art, cut the same frame and save it under the creature's id.
