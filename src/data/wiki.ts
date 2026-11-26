import { z } from "zod";

import raw from "../../data/wiki.json";

// The game wiki data, exported by the lore session (spoiler-free) and copied into `data/wiki.json`.
// Text is `{ ru, en? }`; ids are stable slugs and become URLs.
// Objects are strict: a field the export adds or renames fails the build instead of being dropped unnoticed.

const text = z.strictObject({ ru: z.string(), en: z.string().optional() });
const name = z.strictObject({ ru: z.string(), en: z.string() });
const status = z.enum(["decided", "working", "proposal", "idea"]);

const mapSchema = z.strictObject({
  id: z.string(),
  n: z.number().int(),
  name,
  sky: text,
  status,
  obstacle: text,
  levels: z.array(z.string()),
  guardian: z.string(),
  boss: z.string(),
  stop: z.string().nullable(),
});

const levelSchema = z.strictObject({
  id: z.string(),
  n: z.number().int(),
  map: z.string(),
  name: text,
  kind: z.enum(["unique", "typical", "boss"]),
  status,
  enemies: z.array(z.string()),
  liquids: z.array(
    z.strictObject({
      liquid: z.string(),
      from: z.array(
        z.strictObject({
          kind: z.enum(["river", "corpse", "source", "guardian", "boss", "secret"]),
          // A creature or boss id for corpse, guardian and boss sources.
          creature: z.string().optional(),
          note: text.optional(),
        }),
      ),
    }),
  ),
  guardian: z.string().nullable(),
  boss: z.string().nullable(),
  secrets: z.array(z.strictObject({ name: text, note: text.nullable(), status })),
  inside: z.array(text),
  resetsOnExit: z.array(z.strictObject({ liquid: z.string(), becomes: z.string().nullable(), where: text })),
  exit: z.enum(["day", "night", "none"]),
  capacity: z.strictObject({ easy: z.number().int(), normal: z.number().int(), hard: z.number().int() }),
  rooms: z.number().int(),
  perRoom: text,
  hunters: z.strictObject({ note: text, status }).nullable(),
  // Every guardian, boss or arena that can stand on this level; a pool lists each alternative.
  // An id may be missing from `bosses` (a pool alternative described only here).
  variants: z.array(
    z.strictObject({
      id: z.string(),
      name,
      kind: z.enum(["guardian", "boss", "arena"]),
      about: text,
      pass: text,
      status,
    }),
  ),
});

const bossSchema = z.strictObject({
  id: z.string(),
  kind: z.enum(["guardian", "boss", "arena"]),
  name,
  map: z.string(),
  level: z.string(),
  // Every level where it can stand.
  levels: z.array(z.string()),
  does: text,
  pass: text,
  break: text.nullable(),
  deal: text.nullable(),
  loot: text.nullable(),
  status,
});

const creatureSchema = z.strictObject({
  id: z.string(),
  name,
  type: text,
  element: z.string(),
  does: text,
  levels: z.array(z.number().int()),
  // `levels`: where this corpse gives this liquid (loot can differ by map).
  loot: z.array(
    z.strictObject({ liquid: z.string(), levels: z.array(z.number().int()).optional(), note: text.optional() }),
  ),
  weakTo: z.array(z.string()),
  immuneTo: z.array(z.string()),
  status,
});

const liquidSchema = z.strictObject({
  id: z.string(),
  name,
  group: z.enum(["circle-1", "circle-2", "status", "single"]),
  hold: text,
  strike: text.nullable(),
  hit: text.nullable(),
  spit: text,
  puddle: text.nullable(),
  status,
});

const stopSchema = z.strictObject({
  id: z.string(),
  name,
  afterMap: z.string(),
  where: text,
  offers: z.array(z.string()),
  fixed: z.string().nullable(),
  single: text.nullable(),
  wants: text,
  also: text,
  status,
});

const wikiSchema = z
  .object({
    schemaVersion: z.literal(1),
    generated: z.string(),
    maps: z.array(mapSchema),
    levels: z.array(levelSchema),
    bosses: z.array(bossSchema),
    creatures: z.array(creatureSchema),
    liquids: z.array(liquidSchema),
    stops: z.array(stopSchema),
  })
  .superRefine((wiki, ctx) => {
    // Every id is unique within its list, and every reference points at a listed item.
    const ids = {
      map: wiki.maps,
      level: wiki.levels,
      boss: wiki.bosses,
      creature: wiki.creatures,
      liquid: wiki.liquids,
      stop: wiki.stops,
    };
    const sets = Object.fromEntries(
      Object.entries(ids).map(([kind, items]) => {
        const set = new Set(items.map(item => item.id));
        if (set.size !== items.length) ctx.addIssue({ code: "custom", message: `duplicate ${kind} id` });
        return [kind, set];
      }),
    ) as Record<keyof typeof ids, Set<string>>;
    const check = (kind: keyof typeof ids, id: string | null | undefined, where: string) => {
      if (id != null && !sets[kind].has(id))
        ctx.addIssue({ code: "custom", message: `${where}: unknown ${kind} "${id}"` });
    };
    wiki.maps.forEach(map => {
      map.levels.forEach(id => check("level", id, map.id));
      check("boss", map.guardian, map.id);
      check("boss", map.boss, map.id);
      check("stop", map.stop, map.id);
    });
    wiki.levels.forEach(level => {
      check("map", level.map, level.id);
      level.enemies.forEach(id => check("creature", id, level.id));
      check("boss", level.guardian, level.id);
      check("boss", level.boss, level.id);
      level.resetsOnExit.forEach(reset => {
        check("liquid", reset.liquid, level.id);
        check("liquid", reset.becomes, level.id);
      });
      level.liquids.forEach(({ liquid, from }) => {
        check("liquid", liquid, level.id);
        from.forEach(source => {
          const where = `${level.id} ${liquid}`;
          if (["corpse", "guardian", "boss"].includes(source.kind) && !source.creature)
            ctx.addIssue({ code: "custom", message: `${where}: a ${source.kind} source needs "creature"` });
          check(source.kind === "corpse" ? "creature" : "boss", source.creature, where);
        });
      });
    });
    wiki.bosses.forEach(boss => {
      check("map", boss.map, boss.id);
      [boss.level, ...boss.levels].forEach(id => check("level", id, boss.id));
    });
    wiki.creatures.forEach(creature => {
      [creature.element, ...creature.weakTo, ...creature.immuneTo, ...creature.loot.map(l => l.liquid)].forEach(id =>
        check("liquid", id, creature.id),
      );
    });
    wiki.stops.forEach(stop => {
      check("map", stop.afterMap, stop.id);
      [...stop.offers, stop.fixed].forEach(id => check("liquid", id, stop.id));
    });
    // Both sides of a link agree.
    if (new Set(wiki.levels.map(level => level.n)).size !== wiki.levels.length)
      ctx.addIssue({ code: "custom", message: "duplicate level number" });
    wiki.maps.forEach(map => {
      const listed = wiki.levels.filter(level => level.map === map.id).map(level => level.id);
      if (listed.join() !== map.levels.join())
        ctx.addIssue({
          code: "custom",
          message: `${map.id}: levels [${map.levels.join()}] ≠ levels naming it [${listed.join()}]`,
        });
      const stop = wiki.stops.find(item => item.afterMap === map.id)?.id ?? null;
      if (stop !== map.stop)
        ctx.addIssue({ code: "custom", message: `${map.id}: stop "${map.stop}" ≠ stop after it "${stop}"` });
    });
    wiki.levels.forEach(level => {
      [level.guardian, level.boss].forEach(id => {
        const boss = id ? wiki.bosses.find(item => item.id === id) : undefined;
        if (boss && !boss.levels.includes(level.id))
          ctx.addIssue({ code: "custom", message: `${level.id}: ${boss.id} does not list it in its levels` });
      });
    });
  });

// Parsed once at module load: a broken export fails the build with the zod error.
export const wiki = wikiSchema.parse(raw);

export type Wiki = typeof wiki;
export type Status = z.infer<typeof status>;
export type Text = z.infer<typeof text>;

function byId<T extends { id: string }>(items: T[]) {
  const map = new Map(items.map(item => [item.id, item]));
  return (id: string) => {
    const item = map.get(id);
    if (!item) throw new Error(`unknown id "${id}"`);
    return item;
  };
}

export const getMap = byId(wiki.maps);
export const getLevel = byId(wiki.levels);
export const getBoss = byId(wiki.bosses);
// Every guardian, boss and arena boss with its own page: the `bosses` records plus the pool alternatives that exist
// only as level `variants` (described by their `about` and `pass`), with the levels each can stand on.
export const bossPages = [
  ...wiki.bosses,
  ...Object.values(
    Object.fromEntries(
      wiki.levels
        .flatMap(level => level.variants.map(variant => ({ variant, level })))
        .filter(({ variant }) => !wiki.bosses.some(boss => boss.id === variant.id))
        .map(({ variant, level }) => [variant.id, { variant, level }]),
    ),
  ).map(({ variant, level }) => ({
    id: variant.id,
    kind: variant.kind,
    name: variant.name,
    map: level.map,
    level: level.id,
    levels: wiki.levels.filter(item => item.variants.some(v => v.id === variant.id)).map(item => item.id),
    does: variant.about,
    pass: variant.pass,
    break: null,
    deal: null,
    loot: null,
    status: variant.status,
  })),
];
export const getBossPage = byId(bossPages);

// The text fields of a boss, in the order pages show them.
export const bossFields = ["does", "pass", "break", "deal", "loot"] as const;
export const getCreature = byId(wiki.creatures);
export const getLiquid = byId(wiki.liquids);
export const getStop = byId(wiki.stops);
