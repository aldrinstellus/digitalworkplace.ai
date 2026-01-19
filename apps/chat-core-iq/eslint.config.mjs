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
    // Custom ignores - external scraped files (not part of app source):
    "Website Scrapped/**",
    "website-scraper/**",
    "scripts/**",
    "*.config.js",
    "*.config.mjs",
  ]),
  // Custom rules for src/ code
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // Allow img tags in admin layout (external URLs)
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
