import typescriptRules from "@ethberry/eslint-config/presets/tsx.mjs";

// Do not add or disable rules here: fix the code instead.

export default [
  {
    ignores: [".next", "next-env.d.ts"],
  },

  {
    ignores: ["eslint.config.mjs"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  ...typescriptRules,
];
