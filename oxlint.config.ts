// Resources
import { defineConfig } from "oxlint";

/** The linting configuration. */
const configuration = defineConfig({
  categories: {
    correctness: "error",
    pedantic: "error",
    perf: "error",
    restriction: "error",
    style: "error",
    suspicious: "error"
  },
  ignorePatterns: ["out/**", "dist/**"],
  options: {
    typeAware: true,
    typeCheck: true
  },
  rules: {
    "eslint/max-classes-per-file": "off",
    "eslint/max-lines-per-function": "off",
    "eslint/one-var": "off",
    "eslint/require-await": "off",
    "no-magic-numbers": "off",
    "no-ternary": "off",
    "oxc/no-async-await": "off",
    "typescript/promise-function-async": "error",
    "typescript/return-await": "error"
  }
});

export default configuration;
