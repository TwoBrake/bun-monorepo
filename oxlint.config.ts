// Resources
import { defineConfig } from "oxlint";

/** The linting configuration. */
const configuration = defineConfig({
  /* Global Categories */
  categories: {
    correctness: "error",
    pedantic: "error",
    perf: "error",
    restriction: "error",
    style: "error",
    suspicious: "error"
  },

  /* Exclude build, etc. */
  ignorePatterns: ["out/**", "dist/**", "node_modules", "build/**"],

  /* Global Options */
  options: {
    typeAware: true,
    typeCheck: true
  },

  overrides: [
    /* Base TypeScript */
    {
      files: ["**/*.ts"],
      plugins: ["jsdoc"],
      rules: {
        "jsdoc/require-param-type": "off",
        "jsdoc/require-returns-type": "off"
      }
    },
    /* React */
    {
      files: ["**/*.tsx"],
      plugins: ["react", "react-perf"],
      rules: {
        "react-perf/jsx-no-new-function-as-prop": "off",
        "react-perf/jsx-no-new-object-as-prop": "off",
        "react/forbid-component-props": "off",
        "react/function-component-definition": "off",
        "react/jsx-curly-brace-presence": ["error", "always"],
        "react/jsx-filename-extension": "off",
        "react/jsx-max-depth": "off",
        "react/only-export-components": "off"
      }
    }
  ],

  /* Global Rules */
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
