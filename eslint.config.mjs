import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import tsParser from "@typescript-eslint/parser";

/**
 * ESLint 10 + eslint-config-next workarounds:
 * 1) Pin react.version — skips eslint-plugin-react detect path that calls
 *    removed context.getFilename().
 * 2) Use @typescript-eslint/parser for JS/MJS too — Next's Babel parser
 *    lacks ScopeManager#addGlobals required by ESLint 10.
 * @see https://github.com/vercel/next.js/issues/89764
 */
const eslintConfig = defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    settings: {
      react: {
        version: "19.2.8",
      },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
