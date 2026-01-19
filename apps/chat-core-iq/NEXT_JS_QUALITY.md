# Next.js Quality Assurance Process

## Quick Commands

```bash
# Check everything (type + lint)
npm run check

# Individual checks
npm run type-check    # TypeScript errors
npm run lint          # ESLint warnings/errors
npm run lint:fix      # Auto-fix ESLint issues
npm run build         # Full production build
```

## Root Causes Identified & Fixed

### 1. ESLint Scanning External Files
**Problem:** ESLint was scanning `Website Scrapped/` folder (4781+ errors from external JS)
**Solution:** Updated `eslint.config.mjs` to ignore non-source folders:
```js
globalIgnores([
  "Website Scrapped/**",
  "website-scraper/**",
  "scripts/**",
])
```

### 2. No Type-Check Script
**Problem:** Missing `npm run type-check` script
**Solution:** Added scripts to `package.json`:
```json
"scripts": {
  "type-check": "tsc --noEmit",
  "check": "npm run type-check && npm run lint"
}
```

### 3. Unused Imports/Variables
**Problem:** Leftover imports from development causing ESLint warnings
**Solution:** Cleaned up unused imports in:
- `src/app/api/documents/route.ts` - Removed ParsedDocument
- `src/app/api/ivr/route.ts` - Removed unused Twilio helpers
- `src/app/api/ivr/process/route.ts` - Removed callSid
- `src/lib/channels/meta-adapter.ts` - Simplified platform detection

## Pre-Commit Checklist

Before committing code, run:

```bash
npm run check
```

This runs both TypeScript type-check and ESLint in one command.

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `@next/next/no-img-element` | Using `<img>` instead of `<Image />` | Disabled in eslint.config.mjs for src/ |
| `@typescript-eslint/no-unused-vars` | Unused imports | Remove or prefix with `_` |
| Hydration mismatch | Date.now() in initial state | Move to useEffect |
| Browser extension warnings | Extensions modifying DOM | Add `suppressHydrationWarning` |

## ESLint Config Overview

```js
// eslint.config.mjs
globalIgnores([
  ".next/**",
  "out/**",
  "build/**",
  "next-env.d.ts",
  "Website Scrapped/**",
  "website-scraper/**",
  "scripts/**",
])
```

## Recommended Workflow

1. **During Development:** Run `npm run dev` (Next.js catches most errors)
2. **Before Commit:** Run `npm run check`
3. **Before Deploy:** Run `npm run build`

## Current Status

- TypeScript: 0 errors
- ESLint: 0 errors, 0 warnings
- Build: Success
