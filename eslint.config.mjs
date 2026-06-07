import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // scripts/ is one-off utility/QA code (not Next.js app code). Kept loose
    // on purpose — see scripts/README.md for the long-term plan to migrate
    // them to tsx with proper types.
    "scripts/**",
  ]),
]);

export default eslintConfig;
