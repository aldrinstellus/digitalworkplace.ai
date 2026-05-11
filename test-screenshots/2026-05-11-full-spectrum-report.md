# Full-Spectrum Production Test — Digital Workplace AI

**Date**: 2026-05-11
**Tester**: Claude (Opus 4.7, Chrome DevTools MCP)
**Method**: Manual smoke + happy-path walk via real Chrome browser, prod URLs only
**Per-product depth**: Persona/route sample, console error capture, network 404 audit, screenshot

---

## Summary

| Product | Surface | Status | Console |
|---|---|---|---|
| **Main** | `/sign-in` | ✅ Clean | 0 errors / 0 warns |
| **dSQ** | `/demo/atc-executive` + Live Tickets widget | ✅ Clean | 0 errors / 0 warns |
| **dSQ** | `/demo/cor` + Contract Performance widget | ✅ Clean | 0 errors / 0 warns |
| **dSQ** | `/demo/project-manager` | ✅ Clean | 0 errors / 0 warns |
| **dIQ** | `/diq/dashboard` | ❌ **Issues** | 2 errors / 2 warns |
| **dIQ** | `/diq/chat` | ⚠️ Issues | 0 errors / 3 warns |
| **dCQ** | `/dcq/Home/index.html` (Doral home) | ❌ **Issues** | 5 errors / 3 warns |
| **dCQ** | `/dcq/admin` | ✅ Clean | 0 errors / 0 warns |
| **dCQ** | `/dcq/demo/ivr` | ✅ Clean | 0 errors / 0 warns |

**Verdict**: Main + dSQ are solid. **dIQ + dCQ have real production issues that warrant fixes before the next demo.**

---

## 🔴 Critical Findings

### F1. dIQ runs Clerk DEVELOPMENT keys in production

**Surface**: `https://intranet-iq.vercel.app/diq/chat` (and likely all auth-protected dIQ routes)
**Severity**: Critical — same class as the bug Main fixed 2026-03-18
**Evidence**:
```
[warn] Clerk: Clerk has been loaded with development keys. Development instances have
strict usage limits and should not be used when deploying your application to production.
Learn more: https://clerk.com/docs/deployments/overview
```

Per SAVEPOINT 2026-03-18: a Clerk Production instance was created for the Main app (`pk_live_*` keys, `clerk.digitalworkplace.ai` DNS). That fix never propagated to dIQ — it still loads `leading-aardvark-17.clerk.accounts.dev` (dev instance).

**Risk**: Rate limits will throttle production users. Sign-in flow may break under load. Dev Clerk has no SLA.

**Fix path**: Either share the existing Main app's Clerk Production instance (recommended — single sign-on across apps), or create a separate Clerk Prod instance for dIQ. Update Vercel env vars on the intranet-iq project.

---

### F2. dIQ /dashboard throws React hydration error #418

**Surface**: `https://intranet-iq.vercel.app/diq/dashboard`
**Severity**: Critical — hydration failure
**Evidence**:
```
[error] Uncaught Error: Minified React error #418; visit
https://react.dev/errors/418?args[]=text&args[]= for the full message or use the
non-minified dev environment for full errors and additional helpful warnings.
```

React error #418 = `"Hydration failed because the server-rendered HTML didn't match the client"`. Typically caused by:
- Server-rendering with a time/random value that differs on client (use `useId()`, not `Math.random()` or `Date.now()`)
- Conditional rendering based on `typeof window`
- Locale-dependent date formatting

The dashboard renders content (you can see meetings, news, etc.) but hydration mismatch leaks JS state — subsequent client interactions may behave inconsistently.

**Fix path**: Run dev build (un-minify), reproduce, follow stack trace. Per global CLAUDE.md hydration safety rule, check for `Math.random()`/`Date.now()` in `useState` initializers and SVG `<title>` children that aren't single strings.

---

### F3. dCQ home page has cascading JavaScript failures

**Surface**: `https://dcq.digitalworkplace.ai/dcq/Home/index.html`
**Severity**: Critical — feature breakage visible to demo viewers
**Evidence**:
```
[error] Refused to execute script from
'https://dcq.digitalworkplace.ai/dcq/ocapi/9a439b8d-bef9-4c87-b5bb-cf40e6ee6a75/en-US/websitesettings.js'
because its MIME type ('text/html') is not executable, and strict MIME type checking is enabled.

[error] Uncaught TypeError: Cannot read properties of undefined (reading 'AddressPickerVariables')
[error] Uncaught SyntaxError: Invalid or unexpected token
[error] Uncaught TypeError: Cannot read properties of undefined (reading 'Application') × 4
[warn] jQuery.Deferred exception: Cannot read properties of undefined (reading 'Application')
```

**Cascade**: `websitesettings.js` returns a 404 HTML page (not JS). Browser refuses to execute. The missing config object then causes 5+ downstream `Application is undefined` errors in the Granicus OpenCities CMS framework (jQuery-based ScriptResource.axd bundle).

**Visible symptom**: The **"Doral By The Numbers"** section shows all stat counters as `0`:
- `0` Year incorporated as a City (should be a real year)
- `0` Employees come to work every day in our city
- `0` Home to 11 Residential Parks (label says 11, counter says 0)
- `#0` Of America's Top 25 Towns to Live Well by Forbes.com

The animated counter component depends on the `Application` object that fails to load.

**Fix path**: Investigate the missing `/dcq/ocapi/.../websitesettings.js` endpoint — likely deployment-config drift between the dCQ scrape source (City of Doral / Granicus) and the proxied/hosted version. Either restore the JSON config endpoint or hard-code the values into the page template.

---

## 🟡 Medium Findings

### F4. dCQ footer copyright stale

**Surface**: `https://dcq.digitalworkplace.ai/dcq/Home/index.html`
**Evidence**: Footer text reads `© 2025 City of Doral`
**Severity**: Cosmetic — demo credibility hit if a sharp evaluator notices
**Fix**: Update template, or hook to `new Date().getFullYear()`.

### F5. dIQ dashboard news + events dated Jan/Feb 2026

**Surface**: `https://intranet-iq.vercel.app/diq/dashboard`
**Evidence**:
- "Updated Remote Work Policy - Effective February 1st"
- "Q4 2025 Company Results"
- Upcoming Events: "Q1 2026 All-Hands Meeting Tue, Feb 3", "Engineering Team Offsite Tue, Feb 10", "New Employee Orientation Thu, Feb 5"
- Chat history shown dated 1/28–1/30/2026

Current date 2026-05-11. "Upcoming Events" panel shows events 3 months in the past — undercuts "Live" indicator at the top of the dashboard.

**Fix path**: Either rotate fixture dates forward, or compute dates relative to "today" so the demo always feels current.

### F6. dSQ COR Contract Performance — fixture dates from 2025

**Surface**: `https://dsq.digitalworkplace.ai/dsq/demo/cor` → "Contract Status Active" widget
**Evidence**: Deliverable due dates: `11/30/2025`, `12/15/2025`, `12/31/2025`, `11/20/2025`. Active Issues due: `11/25/2025`, `11/18/2025`. All ~6 months in the past.
**Severity**: Cosmetic — same class as F5
**Fix path**: Rotate fixture dates or compute relative.

### F7. dIQ uses deprecated Clerk `afterSignInUrl` prop

**Surface**: `https://intranet-iq.vercel.app/diq/chat` (and likely Clerk config across dIQ)
**Evidence**:
```
[warn] Clerk: The prop "afterSignInUrl" is deprecated and should be replaced with
the new "fallbackRedirectUrl" or "forceRedirectUrl" props instead.
```
**Severity**: Future-breaking — Clerk will remove this in a future major bump
**Fix path**: Replace `afterSignInUrl` → `forceRedirectUrl` in the Clerk wrapper component used by dIQ.

### F8. dCQ Response Time distribution rounds to 107%

**Surface**: `https://dcq.digitalworkplace.ai/dcq/admin` → "Response Time" widget
**Evidence**: 74% (Under 1 min) + 27% (1-5 min) + 6% (Over 5 min) = 107%. Off-by-rounding.
**Severity**: Cosmetic credibility hit
**Fix path**: Compute percentages so they sum to 100 (e.g. allocate rounding leftover to the largest bucket).

---

## 🟢 Low / Performance Findings

### F9. dCQ Google Maps API loaded without `loading=async`

**Surface**: `https://dcq.digitalworkplace.ai/dcq/Home/index.html`
**Evidence**: `[warn] Google Maps JavaScript API has been loaded directly without loading=async`
**Fix**: Add `loading=async` to the Maps script tag.

### F10. dIQ + dCQ CSS preload hint

**Surface**: dIQ all routes
**Evidence**: `[warn] The resource ... 8a5bd6fe3abc8091.css was preloaded using link preload but not used within a few seconds`
**Fix**: Drop the preload tag for that bundle, or adjust the manifest.

### F11. dIQ Clerk `useOrganization` called without active session

**Surface**: `https://intranet-iq.vercel.app/diq/dashboard`
**Evidence**: `[warn] Clerk: "useOrganization" requires an active user session. Ensure a user is signed in before executing useOrganization.`
**Fix**: Guard the hook with `useUser()`/`useAuth()` check, or move it into a child component that only renders post-auth.

### F12. dCQ deprecated `apple-mobile-web-app-capable` meta

**Surface**: `https://dcq.digitalworkplace.ai/dcq/Home/index.html`
**Evidence**: `[warn] <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">`
**Fix**: Add the new meta alongside the old (keep both for back-compat) in the HTML template.

### F13. dIQ dashboard had intermittent RSC 404s

**Surface**: `https://intranet-iq.vercel.app/diq/dashboard`
**Evidence**: Browser console showed 7× 404 for `/diq/news/{1-4}?_rsc=...` and `/diq/events/{1-3}?_rsc=...` prefetches.
**Verification**: Direct curl of same URLs (with and without `_rsc` query/header) returns **200**. The 404s did not reproduce on direct navigation.
**Assessment**: Likely a transient deploy-cache miss during simultaneous prefetch storm. Not blocking, but worth re-testing after the next deploy to confirm it doesn't repeat.

---

## ✅ What Works Well

- **Main `/sign-in`** — all 24 avatars render, wordmark animations work, world-map background loads, "Continue with Google" button live. Zero console noise.
- **dSQ** — clean across all 3 mode personas tested (ATC Executive / Gov COR / Project PM). Mode switcher works. Quick Actions trigger the right widgets. Zero console errors.
  - **Live Zoho Tickets widget**: 20 real tickets, 4 KPI cards, refresh button working. Real Zoho data flowing through OAuth.
  - **Contract Performance Dashboard**: Multi-section widget with chart, financial breakdown, deliverables, issues, recommendations — comprehensive.
- **dCQ admin + IVR demo** — these are the in-house surfaces and they're solid. Real-time stats, channel health, recent activity, conversation metrics.

---

## Suggested Triage Priority

1. **F1** (dIQ dev Clerk keys in prod) — biggest customer-facing risk
2. **F3** (dCQ Home cascading JS failures + broken stat counters) — most visible regression
3. **F2** (dIQ React hydration #418) — silent JS state corruption
4. **F5 + F6** (stale fixture dates) — bundle and rotate together; quick win for demo freshness
5. **F4 + F8** (copyright + 107% rounding) — 5-min cosmetic fixes
6. **F7** (deprecated Clerk prop) — fold into the planned Clerk 6→7 upgrade session
7. **F9-F13** — sweep during any next dIQ/dCQ release

---

## Screenshots

All screenshots saved to `/Users/aldrin-mac-mini/digitalworkplace.ai/test-screenshots/2026-05-11-*.png`:

- `2026-05-11-main-signin.png`
- `2026-05-11-dsq-atc-executive.png`
- `2026-05-11-dsq-live-tickets.png` (full-page)
- `2026-05-11-dsq-cor-contract.png` (full-page)
- `2026-05-11-dsq-project-manager.png`
- `2026-05-11-diq-dashboard.png` (full-page)
- `2026-05-11-diq-chat.png`
- `2026-05-11-dcq-home.png` (full-page)
- `2026-05-11-dcq-admin.png`
- `2026-05-11-dcq-ivr.png`
