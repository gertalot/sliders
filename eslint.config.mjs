import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

import globals from "globals";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/eslint-recommended",
      "prettier",
      "plugin:prettier/recommended",
      "plugin:react-hooks/recommended",
      "plugin:react/jsx-runtime"
    )
  ),
  ...storybook.configs["flat/recommended"],
  {
    plugins: {
      "react-hooks": fixupPluginRules(reactHooks),
      prettier: fixupPluginRules(prettier),
      react: fixupPluginRules(react)
    },

    languageOptions: { globals: { ...globals.browser, ...globals.node } },

    ignores: ["!storybook", "dist", "storybook-static"],
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true
        }
      ]
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
];
