"use client";

import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// Light and dark follow the system setting (prefers-color-scheme) through CSS variables.
// Headings shrink on narrow screens (responsiveFontSizes).
export const theme = responsiveFontSizes(
  createTheme({
    cssVariables: true,
    colorSchemes: { light: true, dark: true },
    typography: {
      fontFamily: "var(--font-roboto)",
    },
  }),
);
