import { z } from "zod";

import raw from "../../data/wiki.json";

// The game wiki data, exported by the lore session (spoiler-free) and copied into `data/wiki.json`.
// Text is `{ ru, en? }`; ids are stable slugs and become URLs.

const text = z.object({ ru: z.string(), en: z.string().optional() });
const name = z.object({ ru: z.string(), en: z.string() });
const status = z.enum(["decided", "working", "proposal", "idea"]);

const mapSchema = z.object({
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

const levelSchema = z.object({
  id: z.string(),
  n: z.number().int(),
  map: z.string(),
  name: text,
  kind: z.enum(["unique", "typical", "boss"]),
  status,
  enemies: z.array(z.string()),
  liquids: z.array(
    z.object({
      liquid: z.string(),
      from: z.array(
        z.object({
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
  secrets: z.array(z.object({ name: text, note: text.nullable(), status })),
  inside: z.array(text),
  resetsOnExit: z.array(z.object({ liquid: z.string(), becomes: z.string().nullable(), where: text })),
  exit: z.enum(["day", "night", "none"]),
  capacity: z.object({ easy: z.number().int(), normal: z.number().int(), hard: z.number().int() }),
  rooms: z.number().int(),
  perRoom: text,
  hunters: z.object({ note: text, status }).nullable(),
});

const bossSchema = z.object({
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

const creatureSchema = z.object({
  id: z.string(),
  name,
  type: text,
  element: z.string(),
  does: text,
  levels: z.array(z.number().int()),
  loot: z.array(z.object({ liquid: z.string(), note: text.optional() })),
  weakTo: z.array(z.string()),
  immuneTo: z.array(z.string()),
  status,
});

const liquidSchema = z.object({
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

const stopSchema = z.object({
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
        from.forEach(source =>
          check(source.kind === "corpse" ? "creature" : "boss", source.creature, `${level.id} ${liquid}`),
        );
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
export const getCreature = byId(wiki.creatures);
export const getLiquid = byId(wiki.liquids);
export const getStop = byId(wiki.stops);
