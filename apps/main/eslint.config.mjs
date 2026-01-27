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
  ]),
  // Custom rules
  {
    rules: {
      // Allow any types in specific cases (API routes, database types)
      "@typescript-eslint/no-explicit-any": "warn",
      // Relax react-hooks rules for initialization patterns
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      // Allow unused vars with underscore prefix
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      // Allow img tags for avatars and external images
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
