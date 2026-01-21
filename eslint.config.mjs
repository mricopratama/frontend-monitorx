import nextPlugin from "eslint-config-next";

const eslintConfig = [
  nextPlugin,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
      "e2e/**",
      "playwright.config.ts",
    ],
  },
];

export default eslintConfig;
