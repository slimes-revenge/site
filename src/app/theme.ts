"use client";

import { createTheme } from "@mui/material/styles";

// Light and dark follow the system setting (prefers-color-scheme) through CSS variables.
export const theme = createTheme({
  cssVariables: true,
  colorSchemes: { light: true, dark: true },
  typography: {
    fontFamily: "var(--font-roboto)",
  },
});
