// Resources
import baseConfig from "../../oxlint.config.ts";
import { defineConfig } from "oxlint";

const configuration = defineConfig({
  extends: [baseConfig],
  ignorePatterns: ["routeTree.gen.ts"],
  rules: {
    "eslint/no-void": "off",
    "eslint/sort-imports": "off",
    "typescript/no-floating-promises": "error",
    "typescript/prefer-readonly-parameter-types": "off",
    "typescript/strict-boolean-expressions": "off",
    "unicorn/prefer-global-this": "off",
  },
});

export default configuration;
