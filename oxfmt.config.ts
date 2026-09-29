// Resources
import { defineConfig } from "oxfmt";

/** The formatter configuration. */
const configuration = defineConfig({
  arrowParens: "avoid",
  bracketSameLine: false,
  bracketSpacing: true,
  endOfLine: "lf",
  ignorePatterns: ["**/out/**", "**/dist/**", "**/node_modules/**", "**/build/**"],
  printWidth: 120,
  semi: true,
  singleQuote: false,
  trailingComma: "none"
});

export default configuration;
