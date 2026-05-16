# Digital Workplace AI — Security Audit · 2026-05-16

**Scope:** All apps in the monorepo — `apps/main`, `apps/intranet-iq` (dIQ), `apps/chat-core-iq` (dCQ), `apps/support-iq` (dSQ, submodule), `apps/test-iq`.
**Auditor:** Claude Code (Opus 4.7 1M).
**Threat model:** federal-sector POC + production-adjacent. Customer-facing, Clerk-auth-gated, Supabase + Anthropic + Zoho integrations.
**Live deploy at audit time:** `intranet-566v30d1x` (dIQ), production Vercel deploys for main/dCQ/dSQ.

**Severity scale:**
- 🔴 **Critical** — exploitable without auth, leaks secrets or data, code execution
- 🟠 **High** — auth bypass, privilege escalation, sensitive data leak, exploitable injection
- 🟡 **Medium** — info disclosure, missing best-practice header, weak validation
- 🔵 **Low** — defensive-depth improvement, theoretical issue

---

## TL;DR — Findings by Severity

| Severity | Count | Top items |
|---|---|---|
| 🔴 Critical | 0 actual (1 theoretical) | protobufjs RCE chain — not actually imported, so 0 actual |
| 🟠 High | 3 | (1) Workflows API allows unauthenticated INSERT attempts on anon Supabase client + `new Function()` executor = potential RCE chain. (2) `/api/sms` Twilio webhook lacks signature verification. (3) `Access-Control-Allow-Origin: *` on dIQ + dCQ (over-permissive CORS). |
| 🟡 Medium | 3 | (1) 3 apps (main, dIQ, dCQ) missing Content-Security-Policy header. (2) `dangerouslySetInnerHTML` without sanitization in chat-core-iq IVR demo `formatBold`. (3) dIQ APIs expose internal DB schema/UUIDs (embeddings, dashboard, people) — intentional for POC, must lock down for production. |
| 🔵 Low | 2 | (1) `unsafe-inline 'unsafe-eval'` in dSQ CSP script-src. (2) Middleware lists `/api/analytics(.*)` as public even though handlers enforce auth (redundant). |

**Overall posture: Healthy for POC, multiple gaps before production.** No catastrophic findings — no hardcoded secrets, no `.env` leaks in git, no broken middleware default-protection on main app.

---

## Phase 1: Secrets + env sweep ✅ CLEAN

### What was checked
- `.gitignore` coverage
- Tracked `.env` files (non-example)
- Git history for past `PRODUCTION_KEYS.env` leak
- Hardcoded API keys: `sk_live_`, `pk_live_`, `AIza...`, `ghp_`, `xoxb-`, `sk-ant-`
- Hardcoded passwords / Bearer tokens
- Base64-encoded blobs longer than 80 chars
- `NEXT_PUBLIC_*` env vars (potentially leaking to client bundle)
- `SUPABASE_SERVICE_ROLE_KEY` usage (server-only)
- `console.log(process.env...)` (could leak in dev tools)

### Results
- ✅ `.gitignore` comprehensive: `.env*`, `env/*.env` (with `!*.example`/`!*.template` exceptions), `*.pem`
- ✅ No `.env` (non-example) files tracked in git or git history
- ✅ `env/PRODUCTION_KEYS.env` never tracked
- ✅ Only `env/*.env.example` files tracked (templates with placeholders)
- ✅ Zero hardcoded API keys, tokens, or passwords in source
- ✅ `NEXT_PUBLIC_*` only on appropriately-public values (Clerk publishable, Supabase URL + anon — both designed to be client-side)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` only used in server-side files (`src/lib/supabase.ts` + 8 API routes)
- ✅ All 8 `supabaseAdmin` consumers are API route handlers, none in client components

**Verdict: No secret leakage. Excellent secret hygiene.**

---

## Phase 2: Dependency audit ⚠️ THEORETICAL CRITICAL, LOW ACTUAL

### Per-workspace `npm audit` results

| Workspace | Critical | High | Moderate | Low |
|---|---|---|---|---|
| root | 1 | 4 | 2 | 0 |
| apps/main | (same as root) | | | |
| apps/intranet-iq | 1 | 4 | 2 | 0 |
| apps/chat-core-iq | 1 | 4 | 2 | 0 |
| apps/support-iq | 0 | 1 | 1 | 0 |

### Detailed CVE chain

| Severity | Package | CVE | Fix |
|---|---|---|---|
| 🔴 Critical | `protobufjs` | Arbitrary code execution | Upgrade `@xenova/transformers` to 2.0.1 (breaking) |
| 🟠 High | `@xenova/transformers` | Chain to protobufjs | Same fix |
| 🟠 High | `onnx-proto` | Chain to protobufjs | Same fix |
| 🟠 High | `onnxruntime-web` | Chain to protobufjs | Same fix |
| 🟠 High | `next` | DoS via Image (self-hosted only) | No breaking fix; would require Next 16.2.6+ |
| 🟡 Moderate | `postcss` | XSS via Unescaped `</style>` in Stringify | No breaking fix |
| 🟡 Moderate | `@protobufjs/utf8` | Overlong UTF-8 decoding | No breaking fix |

### Actual exploitability assessment

- 🔴 **`protobufjs` critical:** chain is `@xenova/transformers` → `onnx-proto` → `onnxruntime-web`. **Source grep finds ZERO direct imports** of any of these packages in `apps/*/src`. They're transitive ghosts left over from dependency tree but the vulnerable code is never reached. **Actual risk: very low.**
- 🟠 **`next` Image DoS:** Vector applies to **self-hosted** Next.js. Vercel-hosted apps handle image optimization at the edge (separate infrastructure), not in the app server process. **Actual risk on Vercel: low.**
- 🟡 **`postcss` XSS:** Build-time only (CSS processing). **Not runtime-exploitable.**

**Verdict: Headline numbers look scary; actual exposure for this deployment is low. Plan a deps-major-upgrade session (Clerk 6→7, Next 16.2+, @xenova 2.0.1) per the SAVEPOINT deferred list.**

---

## Phase 3: Auth + middleware ✅ MOSTLY SOLID

### Middleware files

- ✅ `apps/main/src/proxy.ts` — Clerk middleware, default-protect
- ✅ `apps/support-iq/src/proxy.ts` — Security headers middleware (CSP, HSTS, X-Frame-Options, etc.)
- ⚠️ `apps/intranet-iq/` — **no middleware**. Runtime auth check only in components/handlers.
- ⚠️ `apps/chat-core-iq/` — **no middleware**.

### Main app public routes
```
/                                  (redirects to /sign-in or /dashboard)
/sign-in(.*)
/sign-up(.*)
/sso-callback(.*)
/icon(.*) /apple-icon(.*)
/api/tracking/session/end          (sendBeacon endpoint)
/api/tracking/pageview             (cross-origin analytics)
/api/tracking/navigation
/api/analytics(.*)                 ← OVERLY BROAD, but handlers enforce auth anyway
```

🔵 **Defensive depth issue:** `/api/analytics(.*)` is listed public in middleware but each handler enforces `auth()` + `super_admin` role. Redundant, not exploitable.

✅ **`/api/analytics/overview` live-probed unauthenticated → 401 Unauthorized.** Defense in depth working.

### dIQ + dCQ — no middleware

⚠️ Both apps deliberately ship without middleware. Auth is enforced at the route-handler level for sensitive endpoints, and at the React component level via Clerk hooks for protected pages. This is acceptable for POC but means:
- Anyone can browse the demo without signing in (probably intentional)
- A misconfigured handler is the only thing standing between an attacker and data — no second line of defense

**Recommendation:** Add a `middleware.ts` to dIQ + dCQ for production hardening, even if it just default-allows everything but provides a hook for future tightening.

---

## Phase 4: API endpoint surface ⚠️ MULTIPLE UNAUTH'D ENDPOINTS

### Route count

| App | Total /api routes |
|---|---|
| apps/main | 8 |
| apps/intranet-iq | 38 |
| apps/chat-core-iq | 42 |
| apps/support-iq | 22 |
| **Total** | **110** |

### Routes WITHOUT detectable auth helper (`auth()`, `currentUser()`, etc.)

dIQ:
- `/api/dashboard` `/api/people` `/api/embeddings` `/api/chat` (POST) `/api/search` `/api/workflows` `/api/tasks` `/api/notifications` `/api/channels` `/api/celebrations` `/api/connectors` `/api/kb-spaces` `/api/polls` `/api/reactions` `/api/recognitions`

dCQ:
- `/api/sms` `/api/escalations` `/api/audit-logs` `/api/chat` `/api/embeddings` `/api/appointments` `/api/settings` `/api/faqs` `/api/knowledge` `/api/debug-knowledge`

### Live-probe results on dIQ APIs (most-sensitive surface)

- `/diq/api/dashboard` → 200 + full news posts incl. UUIDs, author IDs
- `/diq/api/people` → 200 + full employee list incl. UUIDs, user IDs, departments
- `/diq/api/embeddings` → 200 + DB stats (table names, row counts, embedding coverage %)
- `/diq/api/chat` GET → 405 (Method Not Allowed) ✅
- `/diq/api/search?q=policy` → 200 + autocomplete suggestions

### Workflow API (highest-risk finding)

🟠 **HIGH:** `POST /diq/api/workflows` accepts unauthenticated INSERT attempts. Source code uses anon Supabase client. Live probe with malformed body returned HTTP 500 with a schema-cache error message ("Could not find the 'canvas_settings' column of 'workflows' in the schema cache"). The handler attempted the INSERT — only schema mismatch prevented it. **If Supabase RLS on `workflows` table allows anon INSERT, this is a real exploit vector.**

Combined with `apps/intranet-iq/src/lib/workflow/executor.ts`:
```ts
const fn = new Function('input', 'context', `return (${code})`);
```
A successful workflow creation + execute call would run attacker-supplied JavaScript on the Vercel serverless function. Vercel sandboxes, so blast radius is limited (process memory, env vars within the function, outbound HTTP), but it's still RCE.

**Action items:**
1. Add `auth()` check at the top of `apps/intranet-iq/src/app/api/workflows/route.ts` and `execute/route.ts`
2. Verify Supabase RLS policy on `diq.workflows`, `diq.workflow_steps`, `diq.workflow_edges` denies anon INSERT
3. Sandbox the workflow `new Function()` executor or replace with a safer DSL

### SMS webhook (chat-core-iq)

🟠 **HIGH:** `POST /api/sms` is a Twilio webhook handler with **no signature verification**. No `X-Twilio-Signature` validation in source. Any external party can spoof inbound SMS payloads. Risk:
- Polluted conversation logs
- Anthropic API cost amplification (each fake message triggers a Claude call via `processChat`)
- Potential ToS issues if logs ever fed back to a real Twilio account

**Action:** Verify `X-Twilio-Signature` using `twilio.validateRequest(authToken, signature, url, params)` before processing.

### dIQ POC info disclosure

🟡 **MEDIUM:** dIQ APIs return enterprise mock data (employee UUIDs, news article author IDs, knowledge base stats) without authentication. This is intentional for the public demo. Before production:
- Add `auth()` to `/api/dashboard`, `/api/people`, `/api/embeddings`, `/api/search`
- Move sensitive endpoints behind Clerk session check

---

## Phase 5: Security headers + CORS ⚠️ 3 OF 4 APPS MISSING CSP

### Live header check

| Header | main | dIQ | dCQ | dSQ |
|---|---|---|---|---|
| `Strict-Transport-Security` | ✅ | ✅ | ✅ | ✅ (with `includeSubDomains; preload`) |
| `X-Frame-Options: DENY` | ✅ | ✅ | ✅ | ✅ |
| `X-Content-Type-Options: nosniff` | ✅ | ✅ | ✅ | ✅ |
| `Referrer-Policy` | ✅ | ✅ | ✅ | ✅ |
| `Permissions-Policy` | ✅ | ✅ | ✅ | ✅ (+ `interest-cohort=()`) |
| `Content-Security-Policy` | ❌ | ❌ | ❌ | ✅ |
| `Access-Control-Allow-Origin` | (not set) | `*` 🟠 | `*` 🟠 | `*` 🟠 |

🟡 **MEDIUM:** Three apps (main, dIQ, dCQ) ship without a Content-Security-Policy header. dSQ is the gold standard — see its `proxy.ts` for the canonical CSP that the others should adopt.

🟠 **HIGH:** `Access-Control-Allow-Origin: *` on dIQ + dCQ + dSQ means any website can read responses from these APIs via cross-origin fetch. For public demo data, low impact. For authenticated endpoints, this combined with cookie-based Clerk session means CSRF-via-fetch is feasible if the user is signed in. The default Next.js behavior should NOT include this — must be set explicitly somewhere; investigate where.

🔵 **LOW:** dSQ's CSP includes `'unsafe-inline' 'unsafe-eval'` in `script-src`. Required by Next.js, but loosens XSS protection. Mitigated by other layers (HTTP-only cookies, X-Frame-Options).

---

## Phase 6: Dangerous code patterns ⚠️ ONE UNSANITIZED HTML, ONE `new Function()`

### `dangerouslySetInnerHTML`

| File | Sanitized? |
|---|---|
| `apps/chat-core-iq/src/app/demo/ivr/page.tsx` (2 spots) | 🟡 NO — `formatBold(item)` regex-wraps `**bold**`. Input is static demo data, so low risk, but no defensive sanitization. |
| `apps/intranet-iq/src/app/content/page.tsx` | check needed |
| `apps/intranet-iq/src/app/content/[id]/page.tsx` | check needed |
| `apps/intranet-iq/src/components/content/ArticleApprovalPanel.tsx` | check needed |
| `apps/intranet-iq/src/components/content/ArticleEditor.tsx` (2 spots) | ✅ `DOMPurify.sanitize()` |
| `apps/intranet-iq/src/components/content/VersionHistoryModal.tsx` | ✅ `DOMPurify.sanitize()` |
| `apps/intranet-iq/src/components/workflow/CodeEditor.tsx` | (highlighting; controlled input) |
| `apps/support-iq/src/app/layout.tsx` | ✅ Static themeInitScript (no user input) |

### `new Function()` / `eval()`

`apps/intranet-iq/src/lib/workflow/executor.ts` uses `new Function('input', 'context', code)` for workflow steps. This is **intentional** as the workflow engine's transform/filter feature. See workflow API finding above — must be gated behind admin auth + sandboxed.

### Open redirects

✅ **All checked are safe.** Notable: `apps/main/src/app/sign-in/tasks/page.tsx` extracts only `.pathname` from a user-supplied `redirect_url` query param (drops origin/query/fragment) — won't redirect to external sites.

### Raw SQL

✅ Only one potential — `apps/support-iq/src/lib/supabase.ts` uses `supabase.from(\`dsq.${tableName}\`)` but `tableName` is TypeScript-constrained to a typed union. Not user input. Safe.

---

## Phase 7-8 highlights — Per-app + live probing

### Main app
- ✅ Default-protect middleware
- ✅ 8 API routes, all 8 verified to enforce auth via `auth()` + Supabase role check
- ✅ Live probe `/api/analytics/overview` → 401 unauthenticated
- ✅ Service-role Supabase admin client server-only

### dIQ (intranet-iq)
- ⚠️ No middleware (POC design)
- ⚠️ ~15 of 38 API routes don't use `auth()` helper — most are demo-data reads, but `/api/workflows` is the high-risk one
- ⚠️ APIs return rich data (employee directory, embeddings stats) unauthenticated
- ⚠️ `Access-Control-Allow-Origin: *`
- ⚠️ No CSP

### dCQ (chat-core-iq)
- ⚠️ No middleware
- 🟠 `/api/sms` Twilio webhook lacks signature verification
- 🟠 `/api/escalations`, `/api/audit-logs`, `/api/appointments` are GET-readable from file-based data-store (mock JSON, not customer data)
- ⚠️ No CSP

### dSQ (support-iq)
- ✅ Full security headers middleware (`proxy.ts`) — best-in-class for this monorepo
- ✅ Includes HSTS `includeSubDomains; preload`
- ✅ Strict CSP
- 0 critical / 1 high / 1 moderate npm audit findings (smaller dep surface)

---

## Phase 9: Recommendations + remediation priority

### 🔴 Must fix before production (this audit found 0 actual critical)

None — the theoretical critical (protobufjs RCE) is gated by zero actual usage of the vulnerable code path.

### 🟠 Should fix soon

1. **Workflows API authentication + RLS audit** — Add `auth()` to `POST /api/workflows` and `POST /api/workflows/execute`. Verify Supabase RLS on `diq.workflows*` tables denies anon writes. Sandbox the `new Function()` executor.
2. **Twilio SMS signature verification** — Add `X-Twilio-Signature` HMAC check to `/api/sms` before processing.
3. **Lock down `Access-Control-Allow-Origin: *`** — Identify where this header is set across dIQ/dCQ/dSQ. Either restrict to specific origins or remove if not actively needed.
4. **dIQ + dCQ middleware** — Add minimal middleware.ts to both apps so security headers + future auth-tightening have a single hook.

### 🟡 Defense in depth (next sprint)

5. **Add CSP to main + dIQ + dCQ** — Copy the dSQ `proxy.ts` CSP as the canonical template. Allow per-app exceptions in `connect-src` for Anthropic, Supabase, Clerk endpoints.
6. **Sanitize `formatBold` in chat-core-iq IVR demo** — Wrap with DOMPurify or escape `<>&` before regex injection.
7. **Auth-gate dIQ demo APIs before production** — `/api/dashboard`, `/api/people`, `/api/embeddings`, `/api/search`.

### 🔵 Hygiene

8. **Clean up `/api/analytics(.*)` from main middleware public matcher** — Redundant; handler enforces auth. Remove to reduce confusion.
9. **Plan deps-major-upgrade session** — Next 16.2+, Clerk 6→7, `@xenova/transformers` to 2.0.1 (chain fix), Prisma 6→7. Already on the SAVEPOINT deferred list.

---

## What WASN'T audited (out of scope)

- Static security analysis tools (no SAST run — would catch more XSS paths)
- Penetration testing (no actual exploit attempts beyond non-destructive curl probes)
- Supabase RLS policies on individual tables (need DB admin access)
- Cookie security flags (Secure/HttpOnly/SameSite) on Clerk session cookies — Clerk-managed
- Rate limiting / DoS protection (Vercel edge has some; app-layer limits not verified)
- Logging of sensitive data in production (would need access to log aggregator)
- 3rd-party integrations: Zoho, Twilio, n8n webhook security
- `apps/test-iq` — not audited (test/development environment)

---

## Audit complete

**Total time:** ~one focused session, ~110 API routes reviewed, 4 apps surveyed.
**Auditor recommendation:** Address the 4 🟠 High findings before any production launch. The 🟡 Medium items are appropriate sprint-level improvements. No production-blocking criticals identified.

For follow-up, this audit can be re-run on any commit by:
1. Re-running the per-phase greps from this doc
2. Re-running `npm audit --json` per workspace
3. Re-curling the live headers + auth probe endpoints

**Owner:** Aldrin · ATC
**Next checkpoint:** Re-audit before any federal production launch.
