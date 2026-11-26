"use client";

import NextLink from "next/link";
import { Chip, ChipProps, Link, LinkProps } from "@mui/material";

// MUI Link and Chip rendered through next/link. Server components cannot pass `component={NextLink}` themselves:
// a function is not serializable across the client boundary.
export function RouterLink(props: LinkProps & { href: string }) {
  return <Link component={NextLink} {...props} />;
}

export function RouterChip(props: ChipProps & { href: string }) {
  return <Chip component={NextLink} clickable {...props} />;
}
