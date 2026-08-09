// Resources
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

// Rules
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import eslintPluginImport from "eslint-plugin-import";
import { jsdoc } from "eslint-plugin-jsdoc";

const GLOBAL_IGNORES = ["out/**", "dist/**", "**.config.ts"];

// eslint-disable-next-line @typescript-eslint/no-deprecated
const ESLINT_CONFIGURATION = tseslint.config(
  {
    ignores: GLOBAL_IGNORES,
    extends: [
      eslint.configs.recommended,
      eslintPluginUnicorn.configs.recommended,
      tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      eslintPluginImport.flatConfigs.recommended
    ],
    languageOptions: { parserOptions: { projectService: true } },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json"
        }
      }
    }
  },
  {
    ignores: GLOBAL_IGNORES,
    extends: [
      jsdoc({
        config: "flat/recommended-typescript",
        files: ["**/*.ts"],
        rules: {
          "jsdoc/require-returns": "off",
          "jsdoc/tag-lines": [
            "error",
            "any",
            {
              startLines: 1
            }
          ]
        }
      })
    ]
  }
);

export default ESLINT_CONFIGURATION;
