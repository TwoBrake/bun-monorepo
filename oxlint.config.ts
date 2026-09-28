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
    "eslint/one-var": "off",
    "no-magic-numbers": "off",
    "no-ternary": "off"
  }
});

export default configuration;
