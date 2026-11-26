import { existsSync } from "node:fs";
import { join } from "node:path";

import Image from "next/image";
import { Box } from "@mui/material";

import type { Wiki } from "../../data/wiki";
import { tr } from "../../i18n";

// A creature's picture: `public/creatures/<id>.png` (a frame of the game sprite) when it exists, else an empty slot
// with the name's first letter. Read at build time; the pages are static.
export function CreaturePicture({
  creature,
  lang,
  size,
  missing,
}: {
  creature: Wiki["creatures"][number];
  lang: string;
  size: number;
  missing: string;
}) {
  const name = tr(creature.name, lang);
  const file = `/creatures/${creature.id}.png`;
  const box = { width: size, height: size, flexShrink: 0, borderRadius: 1, bgcolor: "action.hover" } as const;

  if (existsSync(join(process.cwd(), "public", file))) {
    return (
      <Box sx={box}>
        <Image src={file} alt={name} width={size} height={size} style={{ imageRendering: "pixelated" }} />
      </Box>
    );
  }
  return (
    <Box
      role="img"
      aria-label={`${name}: ${missing}`}
      title={missing}
      sx={{
        ...box,
        display: "grid",
        placeItems: "center",
        border: 1,
        borderStyle: "dashed",
        borderColor: "divider",
        color: "text.disabled",
        fontSize: size / 2.5,
      }}
    >
      {name[0]}
    </Box>
  );
}
