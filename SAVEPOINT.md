# Digital Workplace AI - Session Savepoint

**Last Updated**: 2026-02-05
**Version**: 0.9.11
**Session Status**: dTQ v2.0.0 - PRD Gap Features + Dashboard UX Overhaul LIVE
**Machine**: Mac Mini (aldrin-mac-mini)
**Git Commit**: (pending) - feat(dTQ): PRD gap features + dashboard UX overhaul

---

## CRITICAL REFERENCE FILE

**For OAuth troubleshooting and permanent fixes, ALWAYS read:**
```
/Users/aldrin-mac-mini/digitalworkplace.ai/.claude/learning.md
```

This file contains:
- Clerk OAuth configuration details
- Troubleshooting guide for auth issues
- Deployment checklist
- Common issues & fixes registry

---

## ⚠️ CRITICAL: CLERK OAUTH CONFIGURATION (FULLY FIXED)

**OAuth now works seamlessly: Sign-in → Google → Dashboard (no intermediate screens)**

### Root Cause & Fix (2026-01-28)

**Problem:** Users were getting stuck at `/sign-in/tasks` with endless spinner after Google OAuth.

**Root Cause:** Clerk Dashboard had "Organizations → Membership required" enabled, forcing users to create/join an organization.

**Solution:** Changed Clerk Dashboard setting:
- **Navigate to:** dashboard.clerk.com → digitalworkplace.ai → Configure → Organizations → Settings
- **Changed:** "Membership required" → **"Membership optional"**

### Required Configuration (ALL must be set)

#### 1. Clerk Dashboard Settings (CRITICAL)
```
Organizations → Settings → Membership options:
✅ "Membership optional" (Users can work with personal account)
❌ NOT "Membership required" (This causes /sign-in/tasks redirect)
```

#### 2. ClerkProvider in `layout.tsx`
```typescript
<ClerkProvider
  signInForceRedirectUrl="/dashboard"
  signUpForceRedirectUrl="/dashboard"
>
```

#### 3. Environment Variables (Vercel + .env.local)
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL="/dashboard"
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL="/dashboard"
```

#### 4. OAuth Redirect in `sign-in/[[...sign-in]]/page.tsx`
```typescript
await signIn.authenticateWithRedirect({
  strategy: "oauth_google",
  redirectUrl: "/sso-callback",
  redirectUrlComplete: "/dashboard",
});
```

#### 5. Middleware `proxy.ts` - Public Routes
```typescript
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/icon(.*)',
  '/apple-icon(.*)',
  '/api/tracking/session/end',
  '/api/tracking/pageview',
  '/api/tracking/navigation',
  '/api/analytics(.*)',
]);
```

### Verification Checklist (ALL PASSING ✅)
- [x] Click "Continue with Google" → Google account picker appears
- [x] Select account → Redirects directly to /dashboard
- [x] No `/sign-in/tasks` intermediate page
- [x] No Clerk branded pages visible
- [x] Sign out → Returns to /sign-in

---

## CRITICAL: DEFAULT LANDING PAGE

**THE SIGN-IN PAGE IS THE DEFAULT LANDING PAGE FOR DIGITAL WORKPLACE AI.**

| URL | What Happens |
|-----|--------------|
| `http://localhost:3000` | **REDIRECTS** → `/sign-in` (if not logged in) |
| `http://localhost:3000` | **REDIRECTS** → `/dashboard` (if logged in) |
| `http://localhost:3000/sign-in` | **DEFAULT LANDING PAGE** - This is what users see first |

**Code Location**: `apps/main/src/app/page.tsx`
**There is NO separate landing page. Root URL (`/`) always redirects.**

---

## Production URLs (All Verified)

| Product | Production URL | Status | Version |
|---------|----------------|--------|---------|
| **Main Dashboard** | https://digitalworkplace-ai.vercel.app | ✅ Live | 0.7.6 |
| **Support IQ (dSQ)** | https://dsq.digitalworkplace.ai | ✅ Live | 1.2.5 |
| **Intranet IQ (dIQ)** | https://intranet-iq.vercel.app | ✅ Live | **2.0.0** |
| **Chat Core IQ (dCQ)** | https://dcq.digitalworkplace.ai/dcq/Home/index.html | ✅ Live | 1.2.1 |
| **Test Pilot IQ (dTQ)** | https://dtq.digitalworkplace.ai/dtq/dashboard | ✅ Live | **2.0.0** |

### GitHub Repository
- **URL**: https://github.com/aldrinstellus/digitalworkplace.ai
- **Latest Commit**: b2b3fee - feat(dTQ): 4-tier link resolution pipeline — every response gets actionable links

### Vercel Projects
| Project | Vercel Dashboard |
|---------|------------------|
| Main | https://vercel.com/aldos-projects-8cf34b67/digitalworkplace-ai |
| Chat Core IQ | https://vercel.com/aldos-projects-8cf34b67/chat-core-iq |
| Intranet IQ | https://vercel.com/aldos-projects-8cf34b67/intranet-iq |
| Support IQ | https://vercel.com/aldos-projects-8cf34b67/support-iq |
| Test Pilot IQ | https://vercel.com/aldos-projects-8cf34b67/test-iq |

---

## Products Status Summary

| Product | Code | Port | Local | Vercel | Embeddings | Database | Audit |
|---------|------|------|-------|--------|------------|----------|-------|
| **Support IQ** | dSQ | 3003 | ✅ | ✅ Live | ✅ 100% | 15 tables | - |
| **Intranet IQ** | dIQ | 3001 | ✅ | ✅ Live | ✅ 100% | 45+ tables | 100/100 |
| **Chat Core IQ** | dCQ | 3002 | ✅ | ✅ Live | ✅ 100% | 28 tables | **100/100** |
| **Test Pilot IQ** | dTQ | 3004 | ✅ | ✅ Live | ✅ 100% | 7 tables | - |

### Database Stats (Supabase)
- **Project**: digitalworkplace-ai (fhtempgkltrazrgbedrh)
- **Schemas**: public, diq, dsq, dcq, dtq
- **pgvector**: v0.8.0 enabled
- **Total Knowledge Items**: 457 with 100% embedding coverage (357 existing + 100 dTQ)
- **DCQ FAQs**: 8 with 100% embedding coverage
- **DTQ Knowledge Base**: 130 rows with 100% embedding coverage (1536-dim)

---

## Latest Changes (v0.9.11)

### dTQ v2.0.0 - PRD Gap Features + Dashboard UX Overhaul (2026-02-05)

**6 new PRD features (~1,600 lines of new code) + complete dashboard UX overhaul. Closes PRD coverage from 45.6% to ~85%+.**

#### 6 New Features

| # | Feature | PRD Slide | New Files | Modified Files |
|---|---------|-----------|-----------|----------------|
| 1 | **Tech Lead Execution Console** | Slide 7 | 6 new | 3 modified |
| 2 | **Before/After ROI Comparison** | Slide 10 | 1 new | 1 modified |
| 3 | **Inline Mini-Charts in Chat** | Slide 8 | 2 new | 1 modified |
| 4 | **12-Month Trend Data** | Slide 5 | 1 new | 2 modified |
| 5 | **Integration Badges** | Slide 4, 9 | 1 new | 1 modified |
| 6 | **Deployment Architecture Modal** | Slide 11 | 1 new | 1 modified |

#### New Files (12)

| File | Feature |
|------|---------|
| `src/components/dtq/TechLeadExecutionConsole.tsx` | Tech Lead Execution Console |
| `src/components/dtq/execution/FeatureSelectionPanel.tsx` | Feature checkboxes (18 in 5 categories) |
| `src/components/dtq/execution/ConfigurationBar.tsx` | Environment/browser/parallel config |
| `src/components/dtq/execution/ActionButtons.tsx` | Execute/Queue/Schedule buttons |
| `src/components/dtq/execution/ExecutionStatusPanel.tsx` | Progress bars, console log |
| `src/hooks/useExecutionSimulation.ts` | State machine: idle→running→complete |
| `src/components/dtq/BeforeAfterComparison.tsx` | ROI table with animated numbers |
| `src/components/dtq/MiniSparkline.tsx` | Tiny inline chat sparklines |
| `src/lib/dtq/chat-chart-detector.ts` | Metric mention regex detection |
| `src/components/dtq/TimeRangeSelector.tsx` | 7d/30d/90d/12m pill buttons |
| `src/components/dtq/IntegrationBadges.tsx` | 6 integration badges (JIRA, GitHub, etc.) |
| `src/components/dtq/modals/DeploymentModal.tsx` | Cloud/Gov/On-Prem deployment options |

#### Dashboard UX Overhaul

| Change | Before | After |
|--------|--------|-------|
| Trend Charts | 2 basic charts, 7-day data | 4 rich charts, 14-day data |
| TrendChart design | Minimal header, h-48, 0-100 Y-axis | Prominent 3xl value + change badge, h-52, tight Y-axis, avg reference line, pulsing dot |
| Integration Badges | Grid of 6 cards | Compact horizontal bar |
| Layout order | Metrics → Charts → Integrations (bottom) | Metrics → Integrations → Charts → ROI → Coverage |
| Charts available | Pass Rate, Automation Coverage | + Defect Detection, First Run Pass Rate |

#### Modified Files (9)

| File | Changes |
|------|---------|
| `src/components/dtq/TrendChart.tsx` | Complete rewrite — rich chart with value header, change badge, reference line, pulsing dot |
| `src/app/(dashboard)/dashboard/page.tsx` | 4 charts (was 2), 14-day data, reordered layout, execution console |
| `src/hooks/useRealTimeSimulation.ts` | Added `addTestRuns()` method |
| `src/lib/dtq/types.ts` | Added ExecutionConfig, FeatureExecutionState, ConsoleLogEntry, ExecutionPhase types |
| `src/lib/dtq/persona-data.ts` | 365-day data generation (was 30), upward trend factor |
| `src/app/(dashboard)/history/page.tsx` | TimeRangeSelector, 7d/30d/90d/12m filtering |
| `src/components/dtq/ChatWidget.tsx` | Inline mini-chart sparklines in chat |
| `src/components/dtq/Sidebar.tsx` | Deployment badge + modal in footer |
| `src/app/globals.css` | Execution console CSS, ROI table styles |

**Build**: 0 errors, 13/13 pages
**Deployed**: Vercel production at https://dtq.digitalworkplace.ai — HTTP 200

---

### Previous: dTQ v1.8.0 - Performance Optimization (2026-02-05)

**16-file optimization across 7 priorities — eliminates timer cascade, reduces animation overhead, prevents unnecessary re-renders.**

| Priority | Change | Files |
|----------|--------|-------|
| P1 CRITICAL | Timer cascade fix: `useRef` for features, interval 10s→30s, `startTransition` | `useRealTimeSimulation.ts` |
| P2 HIGH | Animation reduction: TrendChart 1500→500ms, PersonaCard stagger halved | `TrendChart.tsx`, `PersonaCard.tsx` |
| P2 HIGH | CSS migration: ReportCard glow + stat hover, FeatureCoverage rows, MetricCard | `ReportCard.tsx`, `FeatureCoverage.tsx`, `MetricCard.tsx` |
| P3 HIGH | Dashboard re-render prevention: stable handlers, conditional modals, chart refs | `dashboard/page.tsx` |
| P4 MED | ChatWidget memoization: `MemoizedMessageContent`, `MemoizedLinkCard`, `AnimatePresence sync` | `ChatWidget.tsx` |
| P5 MED | History consolidation: 8 useMemos → 2 single-pass | `history/page.tsx` |
| P6 MED | CSS animation classes: `.stat-card`, `.failed-badge-glow`, `.metric-card-interactive`, `.feature-row` | `globals.css` |
| P7 LOW | API: Cache-Control headers, nested selects, 30s AbortController timeout | 5 API routes |

**Deployed**: Vercel production at https://dtq.digitalworkplace.ai — HTTP 200

---

### Previous: dTQ v1.7.0 - 4-Tier Link Resolution Pipeline (2026-02-05)

**Complete rewrite of link-resolver.ts — every AI response now generates actionable links.**

#### Problem (10 gaps)
Chat responses lacked links to features, categories, metrics, and pages. Bold-text matching was unreliable, source types test_run_summary and daily_metrics_summary were ignored, feature lookup was persona-scoped only, no substring matching, metric names never linked, demo mode sources empty, error fallbacks had no links, no guaranteed fallback.

#### Solution: 4-Tier Pipeline + Global Entity Index

| Tier | Strategy | Description |
|------|----------|------------|
| 1 | Source-based | All 5 RAG source types (feature, category_summary, persona_kpi, test_run_summary, daily_metrics_summary) |
| 2 | Entity text scanning | Substring match of all 80 features + 20 categories + 24 metrics across all personas |
| 3 | Keyword detection | ~20 pattern groups (test runs, trends, pass rate, defects, automation, risk, security, CI/CD, etc.) |
| 4 | Context-aware fallback | Guaranteed ≥1 link per response, persona-appropriate defaults |

#### Files Changed (3)

| File | Changes |
|------|---------|
| `link-resolver.ts` | Complete rewrite — global entity index, 4-tier pipeline, ~310 lines |
| `chat/route.ts` | Pass userMessage + personaMetrics to resolveLinks (RAG + demo mode) |
| `ChatWidget.tsx` | getFallbackLinks helper + relatedLinks in both error catch blocks |

#### Verification Results

| Test | Result |
|------|--------|
| Build | 0 errors, 13/13 pages |
| Live (all 5 apps) | HTTP 200 |
| Payment Gateway (csuite) | 5 feature links |
| High-risk features (demo) | Category + feature links |
| Pass rate query | Metric + history links |
| Cross-persona (Penetration Test Suite on manager) | Resolves techlead features |
| Vague message ("hello") | 5 contextual fallback links |
| Local dev (port 3004) | Working with RAG |

#### Deployment
- **Git**: b2b3fee pushed to main
- **Vercel**: https://dtq.digitalworkplace.ai (deployed + verified)

---

### Previous: dTQ Full-Spectrum Testing Audit (2026-02-05)

**Ran 7 parallel testing agents across all dTQ documentation, APIs, and browser UI. 200 checks total.**

#### Testing Results

| Test Suite | Checks | Passed | Failed | Score |
|-----------|--------|--------|--------|-------|
| DEMO-GUIDE vs API (116 checks) | 116 | 114 | 2 | 98.3% |
| SALES-GUIDE vs API (48 checks) | 48 | 47 | 1 | 97.9% |
| Browser UI Testing (36 checks) | 36 | 35 | 1 | 97.2% |
| **Combined Total** | **200** | **196** | **4** | **98.0%** |

#### Discrepancies Fixed (Round 2)

| # | Document | Old Value | Fixed Value | Source |
|---|----------|-----------|-------------|--------|
| 1 | DEMO-GUIDE | Open Defects: 35 | 47 | API sum of all feature openDefects |
| 2 | DEMO-GUIDE | "88.5% avg coverage" | "88% avg coverage" | Math.round(4041/46) = 88 |
| 3 | SALES-GUIDE | "35 open defects" | "47 open defects" | API openDefects = 47 |

**Post-fix accuracy: DEMO-GUIDE 100%, SALES-GUIDE 100%**

#### Documents Created

| Document | Path | Description |
|----------|------|-------------|
| **TESTING-AUDIT-GUIDE.md** | `apps/test-iq/TESTING-AUDIT-GUIDE.md` | Full-spectrum testing results (200 checks) |

#### Documents Updated

| Document | Changes |
|----------|---------|
| DEMO-GUIDE.md | Fixed openDefects (35→47), avgCoverage (88.5%→88%) |
| SALES-GUIDE.md | Fixed openDefects (35→47) |
| CLAUDE.md (test-iq) | Added references to all documentation files |
| SAVEPOINT.md | Updated to v0.9.8 with testing audit results |

---

## Previous Changes (v0.9.7)

### dTQ Documentation - DEMO-GUIDE + SALES-GUIDE (2026-02-04)

**Created, verified, and corrected comprehensive documentation for Test Pilot IQ.**

#### Documents Created

| Document | Path | Format | Size |
|----------|------|--------|------|
| **DEMO-GUIDE.md** | `apps/test-iq/DEMO-GUIDE.md` | Markdown | 1,760 lines |
| **DEMO-GUIDE.pdf** | `apps/test-iq/DEMO-GUIDE.pdf` | PDF | ~1.6 MB |
| **SALES-GUIDE.md** | `apps/test-iq/SALES-GUIDE.md` | Markdown | 534 lines |
| **SALES-GUIDE.pdf** | `apps/test-iq/SALES-GUIDE.pdf` | PDF | ~611 KB |

#### DEMO-GUIDE.md (12 Sections)

Comprehensive user manual and TDD test specification covering:
1. Executive Overview
2. Access & Navigation
3. Personas — Full Spectrum (C-Suite 16 features, QA Manager 46 features, Tech Lead 18 features)
4. Dashboard Page — Full Walkthrough
5. Test Reports Page — Full Walkthrough
6. Metrics History Page — Full Walkthrough
7. AI Chat Assistant — Full Walkthrough (RAG pipeline, link cards, demo mode)
8. Interactive Modals — Reference (5 modals + BaseModal)
9. Real-Time Simulation
10. Data Export (CSV + PDF)
11. TDD Test Scenarios — 74 Given/When/Then test cases across 7 categories
12. Appendix — All 80 features, 24 KPIs, 20 categories, API endpoints, knowledge base stats

#### SALES-GUIDE.md (10 Sections)

30-minute sales demo script with SAY/SHOW format:
1. Pre-Demo Checklist (environment setup, key stats to memorize, pre-flight test)
2. Opening — The Hook (2 min)
3. Act 1: Executive View — C-Suite (5 min)
4. Act 2: Manager's Command Center (7 min)
5. Act 3: Engineer's Cockpit — Tech Lead (5 min)
6. Act 4: AI Chat — The Wow Factor (5 min)
7. Act 5: Real-Time & Exports (3 min)
8. Closing & Objection Handling (5 common objections with scripted responses)
9. Quick Reference Card (personas, killer features, differentiators, navigation)
10. Demo Flow Timing Guide (30-min full, 15-min short, 5-min lightning)

#### Full-Spectrum Verification

Both documents verified against 15+ source files with parallel agents:

| Document | Checks | Passed | Score |
|----------|--------|--------|-------|
| DEMO-GUIDE.md | 263 | 263 | **100%** |
| SALES-GUIDE.md | 106 | 106 | **100%** |

14 discrepancies found and fixed:
- Export filenames: removed incorrect `dtq-` prefix
- Simulation parameters: corrected total tests (10-34), failed (1-5), duration (4-13)
- MetricDrillDownModal: "standard deviation" → "Current, 30-Day Avg, Peak, Low"
- TestRunDetailModal: header and copy button descriptions corrected
- QA Manager: automation rate 48%→43%, fully automated 22→20, high-risk 4→3
- Highest risk feature: "Mobile Experience" → "xAPI / LRS Integration (risk 45)"

#### Git Commits
- `5ad22f0` - docs(dTQ): add comprehensive DEMO-GUIDE.md and PDF
- `b5f9e7e` - docs(dTQ): add SALES-GUIDE.md and PDF
- `4af9358` - fix(dTQ): correct 14 discrepancies in DEMO-GUIDE and SALES-GUIDE

#### Deployment
All 5 apps redeployed to Vercel and verified live (HTTP 200):
- Main → https://www.digitalworkplace.ai
- Test Pilot IQ → https://dtq.digitalworkplace.ai
- Intranet IQ → https://intranet-iq.vercel.app
- Chat Core IQ → https://chat-core-iq.vercel.app
- Support IQ → https://dsq.digitalworkplace.ai

---

## Previous Changes (v0.9.6)

### dTQ v1.6.0 - Chatbot Interlinked Navigation (2026-02-04)

**Actionable link cards below AI chat responses that navigate directly to features, categories, metrics, and pages.**

#### Architecture

```
Chat API generates response + relatedLinks[]
  → ChatWidget renders link cards below response
  → User clicks → NavigationContext.dispatch(link)
  → router.push(targetPage) + set pendingAction
  → Page useEffect reads pendingAction → opens modal → clears action
```

#### Files Created (2)

| File | Purpose |
|------|---------|
| `src/contexts/NavigationContext.tsx` | NavigationProvider with dispatch/clearAction + 30s TTL |
| `src/lib/dtq/link-resolver.ts` | resolveLinks() — bold text extraction, source mapping, keyword detection |

#### Files Modified (7)

| File | Changes |
|------|---------|
| `src/lib/dtq/types.ts` | Added ChatLinkTarget, ChatLink, NavigationAction types; relatedLinks on ChatMessage |
| `src/app/api/dtq/chat/route.ts` | Calls resolveLinks after response, returns relatedLinks; bold-name system prompt instruction |
| `src/app/(dashboard)/layout.tsx` | Wrapped with NavigationProvider |
| `src/components/dtq/ChatWidget.tsx` | Renders "Related" link cards with icons, hover animations, dispatch on click |
| `src/app/(dashboard)/dashboard/page.tsx` | useEffect handles feature/category/metric navigation actions |
| `src/app/(dashboard)/reports/page.tsx` | useEffect handles test-run/feature navigation actions |
| `src/app/(dashboard)/history/page.tsx` | useEffect handles metric/history navigation actions |

#### Link Resolution Strategies
1. **Bold text extraction** — `**Feature Name**` matched against persona features/categories
2. **Source-based** — RAG source types (feature, category_summary, persona_kpi) → links
3. **Keyword detection** — "test run" → Reports, "trend"/"history" → History page

#### Verification
- **Build**: 0 errors, 13/13 pages
- **Live**: All 3 pages return HTTP 200
- **Chat API**: relatedLinks returned with correct entity IDs (5 links max)
- **Persona scoping**: Manager → `f*` IDs, Tech Lead → `tl-*` IDs, C-Suite → `cs-*` IDs
- **Git Commit**: 6a22d67
- **Vercel**: Deployed to https://dtq.digitalworkplace.ai

---

## Previous Changes (v0.9.5)

### dTQ v1.5.0 - ChatWidget UX Overhaul (2026-02-04)

**Complete UX rewrite of the AI chat widget with 5 critical fixes.**

#### Issues Fixed

| # | Issue | Fix |
|---|-------|-----|
| 1 | Auto-scroll forced user to bottom on every message | User-controlled scrolling via `shouldScrollRef` — only scrolls on user-sent messages |
| 2 | No reset/clear chat button | Added animated `RotateCcw` button in header (visible when messages exist) |
| 3 | Quick actions disappeared after first message | Moved to persistent horizontal pill strip above input — always visible |
| 4 | Messages appeared to "disappear" (ternary swap) | Removed mutually exclusive ternary — welcome state + messages now coexist |
| 5 | General UX polish | Flex layout, compact pill buttons, AnimatePresence transitions |

#### Architecture Changes
- **ChatWidget.tsx** replaces AIAssistant.tsx as floating overlay (not embedded in dashboard grid)
- **ChatContext.tsx** provides cross-page message persistence via React Context
- **Layout wrapping**: `(dashboard)/layout.tsx` wraps children in `<ChatProvider>` + `<ChatWidget />`
- Quick actions render as horizontal scrollable pills between messages and input

#### Files Changed

| File | Action |
|------|--------|
| `src/components/dtq/ChatWidget.tsx` | REWRITTEN — All 5 UX fixes |
| `src/components/dtq/AIAssistant.tsx` | DELETED — Replaced by ChatWidget |
| `src/contexts/ChatContext.tsx` | EXISTS — Cross-page message persistence |
| `src/app/(dashboard)/layout.tsx` | MODIFIED — ChatProvider + ChatWidget wrapper |
| `src/app/(dashboard)/dashboard/page.tsx` | MODIFIED — Removed inline AIAssistant |
| `src/lib/dtq/types.ts` | MODIFIED — Added sources to ChatMessage |

#### Browser Testing (13/13 Scenarios Passed)

| # | Scenario | Result |
|---|----------|--------|
| 1 | Open widget | Panel opens with welcome + quick actions |
| 2 | Quick action click | User message + typing + response |
| 3 | Quick actions persist | Still visible after responses |
| 4 | Scroll freely | No forced auto-scroll |
| 5-7 | All 4 quick actions | All work correctly |
| 8 | Custom question | Type + Enter works |
| 9 | Reset chat | Clears messages, shows welcome |
| 10 | Post-reset action | Works normally |
| 11 | Navigation persistence | Messages preserved across pages |
| 12 | Persona switch | Badge updates in header |
| 13 | Close/reopen | Messages preserved |

#### Deployment
- **Git Commit**: eb2c5ce
- **Vercel**: Deployed to production
- **Live URL**: https://dtq.digitalworkplace.ai/dtq/dashboard (verified 200 OK)
- **All 3 pages**: Dashboard, History, Reports — all 200 OK

---

## Previous Changes (v0.9.4)

### dTQ v1.4.0 - All API Endpoints Fixed + Full Data Seeded (2026-02-04)

**Fixed all data API endpoints and seeded missing data. All 6 endpoints now return live data from Supabase.**

#### Root Cause
The `dtq` schema is NOT exposed via Supabase PostgREST. All API routes were querying tables like `features`, `test_runs` etc. in the public schema, but these only exist in the `dtq` schema.

#### Fix Applied
1. **Created 6 public schema views** mapping to dtq tables
2. **Created 2 SECURITY DEFINER RPC functions** for INSERT operations
3. **Updated all API routes** to use public schema views
4. **Updated `supabase.ts`** — removed `{ db: { schema: 'dtq' } }` override
5. **Seeded missing data**: persona_metrics (24 rows), test_issues (30 rows)

#### Git Commit: caa67b5
#### Deploy: https://dtq.digitalworkplace.ai

---

## Previous Changes (v0.9.3)

### dTQ v1.3.0 - Knowledge Base + Vector Embeddings + AI Chat with RAG (2026-02-04)

**Added full AI infrastructure: knowledge base, vector embeddings, and Claude-powered chat with RAG.**

#### What Was Built
- **dtq.knowledge_base**: 130 rows seeded across 3 personas (features, KPIs, summaries, categories)
- **Vector Embeddings**: OpenAI text-embedding-3-small (1536-dim), 100% coverage on all 130 rows
- **Semantic Search**: `public.search_dtq_knowledge_semantic` RPC (SECURITY DEFINER wrapper, jsonb→vector)
- **Chat API**: `/api/dtq/chat` — Claude Sonnet 4 with RAG context from knowledge base
- **AIAssistant**: Wired to real chat API with persona-aware context and demo mode fallback
- **Cross-project Sync**: 100 items synced to `public.knowledge_items` with embeddings

#### Files Created/Modified
| File | Action |
|------|--------|
| `src/lib/embeddings.ts` | NEW - OpenAI embedding utility |
| `src/app/api/dtq/chat/route.ts` | NEW - Claude chat API with RAG |
| `src/lib/dtq/persona-data.ts` | NEW - Persona-specific data module |
| `src/components/dtq/modals/TestRunDetailModal.tsx` | NEW - Test run detail modal |
| `scripts/dtq-generate-embeddings.mjs` | NEW - Embedding generation script |
| `supabase/migrations/015_dtq_knowledge_base.sql` | NEW - KB table + seed data |
| `src/components/dtq/AIAssistant.tsx` | EDIT - Wired to real chat API |
| `apps/test-iq/package.json` | EDIT - Added @anthropic-ai/sdk, openai |

#### Database Verification (3 Levels)
| Check | Result |
|-------|--------|
| Table columns (11) | id, persona, item_type, title, content, summary, tags, metadata, embedding, created/updated_at |
| Indexes (5) | PK, HNSW (embedding), btree (persona, item_type), GIN (tags) |
| RLS (2 policies) | Public read, service role full access |
| Functions (4) | dtq.search_knowledge_semantic, public.search_dtq_knowledge_semantic, get/update helpers |
| Data (130 rows) | 80 features + 20 categories + 24 KPIs + 3 test runs + 3 metrics |
| Embeddings | 130/130 (100%), all 1536 dimensions |
| public.knowledge_items | 100/100 (100%), synced with embeddings |
| Semantic search | Working — returns relevant results with persona filtering |
| Live RAG test | 8 sources returned, Claude references real data points |

#### Deployment
- **Git Commits**: 2427907 → ea5da59 → 1a60bdf → 24ae02e → 2fa6180
- **Vercel**: Deployed with OPENAI_API_KEY, ANTHROPIC_API_KEY, SUPABASE vars
- **Live URL**: https://dtq.digitalworkplace.ai/dtq/dashboard (verified 200 OK)
- **Chat API**: https://dtq.digitalworkplace.ai/dtq/api/dtq/chat (RAG verified working)

---

## Previous Changes (v0.9.2)

### dTQ v1.3.0 - Knowledge Base + Vector Embeddings + AI Chat (2026-02-04)

**Added 130-row knowledge base with 1536-dim OpenAI embeddings and Claude-powered AI chat with RAG.**

- Knowledge base: 130 rows (features, KPIs, category summaries, test run summaries, daily metrics)
- 100% embedding coverage (text-embedding-3-small, 1536 dimensions)
- AI Chat: Claude Sonnet 4 with semantic search RAG pipeline
- Match threshold: 0.3 (returns 8 sources per query)
- Persona-aware context filtering

---

### dTQ v1.1.0 - Test Pilot IQ Linked from Main Dashboard (2026-02-04)

**Linked Test Pilot IQ to the main DigitalWorkplace.ai dashboard and deployed both apps.**

#### Changes
- Enabled Test Pilot IQ card (removed "Coming Soon" disabled state)
- Updated card theme from orange to pink (#ff3366) matching dTQ branding
- Updated SVG illustration colors to pink theme
- Set local URL: `http://localhost:3004/dtq/dashboard`
- Set production URL: `https://dtq.digitalworkplace.ai/dtq/dashboard`

#### File Changed
- `apps/main/src/app/dashboard/page.tsx` - Card config + SVG illustration colors

#### Deployment
- **Git Commit**: 056de94
- **Main App**: https://www.digitalworkplace.ai (verified 200 OK)
- **Test IQ**: https://dtq.digitalworkplace.ai/dtq/dashboard (verified 200 OK)

---

## Previous Changes (v0.9.1)

### dIQ v2.4.0 - Realistic App Interface Replicas (2026-01-30)

**Added authentic UI replicas for all 10 integrated apps with realistic dummy data.**

#### App Interfaces Implemented

| App | Interface Type | Key Features |
|-----|---------------|--------------|
| **Slack** | Workspace UI | Channel sidebar, threading, reactions, DMs |
| **Jira** | Sprint Board | 4 Kanban columns, ticket cards, story points |
| **GitHub** | PR Code Review | File diffs, CI checks, reviewer status |
| **Drive** | File Manager | Folders grid, files table, storage indicator |
| **Zoom** | Meetings Dashboard | Action buttons, LIVE indicator, recordings |
| **Confluence** | Wiki Page | Space sidebar, documentation, code blocks |
| **Salesforce** | Opportunity Pipeline | 5 deal stages, probability, amounts |
| **Figma** | Canvas | Layers panel, properties, toolbar |
| **Notion** | Workspace | Database board view, Kanban columns |
| **LinkedIn** | Feed | Post creation, engagement metrics |

#### Files Changed
- `apps/intranet-iq/src/app/apps/[id]/page.tsx` - 1578 lines with all 10 apps
- `apps/intranet-iq/src/components/dashboard/AppShortcutsBar.tsx` - Internal routing

#### Deployment
- **Git Commit**: 1711e3c
- **Build**: 58 pages compiled successfully
- **Production**: https://diq.digitalworkplace.ai/diq/apps/slack (all 10 verified 200 OK)

---

## Previous Changes (v0.8.3)

### dCQ Workflow Expansion (2026-01-28)

**Added 12 new realistic workflows for City of Doral chatbot - All LIVE on production.**

#### Service Request Routing Rules (7 NEW)

| Rule | Department | Priority | SLA | Auto-Assign | Keywords |
|------|------------|----------|-----|-------------|----------|
| **Graffiti Removal** | Public Works | Medium | 48h | No | graffiti, vandalism, tagging, spray paint |
| **Abandoned Vehicle** | Police Department | Medium | 72h | No | abandoned, vehicle, car, towed, junk car |
| **Tree Trimming** | Parks & Recreation | Medium | 72h | No | tree, trimming, overgrown, branch, hazard |
| **Flooding & Drainage** | Public Works | High | 24h | ✅ Yes | flood, drainage, storm, standing water |
| **Animal Control** | Police Department | High | 12h | ✅ Yes | animal, stray, dog, cat, wildlife, snake |
| **Noise Complaint** | Code Compliance | Medium | 24h | No | noise, loud, music, party, barking |
| **Trash & Recycling** | Public Works | Medium | 48h | No | trash, garbage, recycling, missed pickup |

**Total Service Request Rules: 14 (was 7) - 13 Active**

#### Appointment Services (5 NEW)

| Service | Department | Duration | Days | Lead Time |
|---------|------------|----------|------|-----------|
| **Parks Program Registration** | Parks & Recreation | 30 min | Mon-Sat | 24h |
| **Utility Account Services** | Public Works | 20 min | Mon-Fri | 24h |
| **Police Records Request** | Police Department | 15 min | Mon-Fri | 48h |
| **Property Tax Consultation** | Finance | 30 min | Mon/Wed/Fri | 48h |
| **Notary Services** | City Clerk | 15 min | Mon-Fri | 24h |

**Total Appointment Services: 9 (was 4) - 8 Active**

#### Files Changed

- `apps/chat-core-iq/data/workflow-routing.json` - Added 7 new routing rules
- `apps/chat-core-iq/data/appointment-config.json` - Added 5 new appointment services

#### Deployment

- **Git Commit**: 4a4283f
- **Vercel**: Deployed to production via `vercel --prod`
- **Production URL**: https://dcq.digitalworkplace.ai/dcq/admin/workflows

#### Admin Portal Stats (Post-Deployment)

| Metric | Before | After |
|--------|--------|-------|
| Service Request Rules | 6/7 Active | 13/14 Active |
| Departments (SR) | 6 | 7 |
| Auto-Assign Rules | 2 | 4 |
| Appointment Services | 3/4 Active | 8/9 Active |
| Departments (Appt) | 4 | 9 |

#### Note on Workflow Builder UI

The admin portal workflow builder forms (Add Rule, Add Service) are display-only demo interfaces. Workflows were added by directly editing JSON data files and deploying to production. All 12 new workflows are fully functional in the chatbot.

---

## Previous Changes (v0.8.2)

### Clerk OAuth Organization Fix (2026-01-28)

**Fixed OAuth flow getting stuck at `/sign-in/tasks` - users now go directly to dashboard.**

#### Problem
After Google OAuth authentication, users were redirected to `/sign-in/tasks?redirect_url=...` showing an endless spinner instead of reaching the dashboard.

#### Root Cause
Clerk Dashboard had "Organizations → Membership required" enabled, which forced users through an organization creation/join flow before accessing the app.

#### Solution
Changed Clerk Dashboard configuration:
- **Setting:** Organizations → Settings → Membership options
- **Changed from:** "Membership required"
- **Changed to:** "Membership optional"

#### Files Changed

**Main Dashboard:**
- `src/app/layout.tsx` - Updated ClerkProvider with force redirect URLs
- `src/app/sign-in/[[...sign-in]]/page.tsx` - Added redirect_url handling, mounted state
- `src/app/sign-in/tasks/page.tsx` - NEW: Handler for Clerk internal task route
- `.env.local` - Updated to use FORCE redirect URLs

#### Verification (ALL PASSING ✅)
- Google OAuth → Dashboard redirect: ✅ Working
- No intermediate `/sign-in/tasks` page: ✅ Fixed
- No Clerk hosted pages visible: ✅ Confirmed

---

### Previous: Security Audit & Clerk OAuth Bulletproofing (v0.8.1)

**Comprehensive security audit completed with all critical vulnerabilities fixed.**

#### Security Vulnerabilities Fixed

| Severity | Issue | App | Fix Applied |
|----------|-------|-----|-------------|
| **CRITICAL** | Unauthenticated `/api/embeddings` | dCQ | Added origin/referer validation |
| **CRITICAL** | Unauthenticated `/api/documents` | dCQ | Added strict admin auth |
| **CRITICAL** | Unauthenticated `/api/admin/stats` | dIQ | Added origin/referer validation |
| **HIGH** | Overly permissive CORS (`*`) | dCQ | Restricted to allowed origins |
| **HIGH** | XSS in ticket description | dSQ | Added DOMPurify sanitization |
| **MEDIUM** | Clerk OAuth fallback to hosted pages | Main | Bulletproof configuration |

---

### dCQ v1.2.0 - Full Spectrum Data Sync & City of Doral Import (2026-01-28)

**Comprehensive data import from scraped City of Doral website with full admin panel synchronization.**

#### Data Import Summary

| Component | Count | Status |
|-----------|-------|--------|
| **FAQs** | 7 | ✅ 100% embeddings |
| **Crawler URLs** | 60 (50 EN + 10 ES) | ✅ Imported |
| **Documents** | 18 | ✅ Imported |
| **Knowledge Entries** | 8 custom | ✅ Imported |
| **Knowledge Base (EN)** | 506 pages, 15 sections | ✅ JSON loaded |
| **Knowledge Base (ES)** | 560 pages, 23 sections | ✅ JSON loaded |
| **Languages** | 3 (EN, ES, HT) | ✅ All active |

#### Database Tables (18 dcq_* tables)

| Table | Count | Purpose |
|-------|-------|---------|
| dcq_faqs | 7 | FAQ management |
| dcq_documents | 18 | Document storage |
| dcq_crawler_urls | 60 | Web crawler URLs |
| dcq_knowledge_entries | 8 | Custom knowledge |
| dcq_announcements | 3 | Site announcements |
| dcq_escalations | 8 | Chat escalations |
| dcq_notifications | 8 | User notifications |
| dcq_languages | 3 | Language config |
| dcq_settings | 1 | App settings |

#### Admin Panel Full Sync Verified

| Component | Local Files | Database | API | Status |
|-----------|-------------|----------|-----|--------|
| FAQs | ✅ | 7 (100% embedded) | ✅ | **SYNCED** |
| Documents | ✅ | 18 | ✅ | **SYNCED** |
| Crawler URLs | ✅ | 60 | ✅ | **SYNCED** |
| Knowledge Base | 1,066 pages | 8 custom | ✅ | **SYNCED** |
| Languages | 3 files | 3 rows | ✅ | **SYNCED** |
| Settings | - | 1 | ✅ | **SYNCED** |

#### Documentation Updated

- `apps/chat-core-iq/CLAUDE.md` - v1.2.0
- `context.md` - dCQ section updated
- `docs/QUERY_DETECTION_STANDARDS.md` - v1.2.0
- `docs/PGVECTOR_BEST_PRACTICES.md` - v1.1.0
- `CHANGELOG.md` - v0.8.0 entry
- `SAVEPOINT.md` - This file

#### Final Score: **100/100** ✅

---

## Previous Changes (v0.7.8)

### Chat Core IQ Link Fix (2026-01-27)

**Fixed incorrect URL for Chat Core IQ product card on main dashboard.**

The "Launch App" button for Chat Core IQ was linking to the wrong page. Now correctly opens the City of Doral homepage.

#### Fix Details

| | Before (Wrong) | After (Correct) |
|---|----------------|-----------------|
| **Local** | `http://localhost:3002/dcq/homepage` | `http://localhost:3002/dcq/Home/index.html` |
| **Production** | `https://chat-core-iq.vercel.app/dcq/homepage` | `https://dcq.digitalworkplace.ai/dcq/Home/index.html` |

#### File Changed
- `apps/main/src/app/dashboard/page.tsx` (lines 52-53)

#### Deployment
- GitHub: Commit 329adb3
- Vercel: Deployed to production
- Verified: Working correctly

---

## Previous Changes (v0.7.7)

### dCQ v1.1.0 - Session-Based Settings Isolation (2026-01-27)

**New feature enabling isolated admin changes per user session.**

When users login via main dashboard and access dCQ, their admin changes only affect their session - not the global public site.

#### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| SessionContext | `src/contexts/SessionContext.tsx` | Capture & store session params |
| Layout | `src/app/layout.tsx` | SessionProvider wrapper |
| Admin Announcements | `src/app/admin/announcements/page.tsx` | Session-aware saves |
| Widget | `public/announcements-widget.js` | Session override support |
| Dashboard | `apps/main/src/app/dashboard/page.tsx` | Pass session params |

#### How It Works

1. Main dashboard passes `clerk_id` + `session_id` in URL when launching dCQ
2. SessionContext captures params and stores in localStorage
3. Admin saves to localStorage with session prefix instead of database
4. Widget checks localStorage first, falls back to API for public users
5. Visual "Session Only" badge in admin panel

#### Storage Keys

- `dcq_session_info` - Session state
- `dcq_session_{sessionId}_banner_settings` - Session-specific settings

#### Deployment

- GitHub: Commit 431ded6
- Vercel: Deployed to production
- Production URL: https://dcq.digitalworkplace.ai/dcq/Home/index.html

---

## Previous Changes (v0.7.5)

### dCQ v1.0.2 Full Spectrum Audit PASSED (2026-01-22)

**Comprehensive audit completed with 100% pass rate across ALL components.**

#### Audit Results

| Category | Score | Status |
|----------|-------|--------|
| Homepage & Chatbot | 100% | ✅ PASSED |
| IVR Demo | 100% | ✅ PASSED |
| Admin Panel (10 pages) | 100% | ✅ PASSED |
| Database (28 tables) | 100% | ✅ PASSED |
| Vector Embeddings | 100% | ✅ PASSED |
| API Endpoints (9) | 100% | ✅ PASSED |
| **Overall Score** | **100/100** | **PRODUCTION READY** |

#### Issues Fixed

1. **Dynamic Sidebar Badges**
   - Escalations badge now fetches real count from API
   - Announcements badge now fetches real count from API
   - File: `src/app/admin/AdminLayoutClient.tsx`

2. **Test Data Cleanup**
   - Removed test entries without embeddings
   - `public.knowledge_items`: 348/348 (100%)
   - `dcq.faqs`: 7/7 (100%)

#### Features Verified

**Homepage:**
- Chatbot (EN/ES/HT) - All 3 languages working
- FAQ Widget - 6 FAQs with expand/collapse
- Announcements Banner - 3 announcements with rotation

**IVR Demo:**
- 3 languages (English, Spanish, Haitian Creole)
- Keypad input (0-9, *, #)
- Transfer codes generation

**Admin Panel (10 pages):**
- Dashboard - KPIs, charts, export
- Analytics - Date filters, 10+ charts
- Workflows - 3 workflow types, appointments
- Content - Knowledge base, FAQs, documents
- Escalations - Filters, empty state
- Notifications - 5 filter tabs
- Announcements - CRUD operations
- Audit Logs - 50 entries, pagination
- Settings - 5 tabs (Profile, Team, Permissions, Integrations, Chatbot)

**Integrations (19+):**
- Tyler Technologies (12 services)
- CRM (Salesforce, MS Dynamics)
- IVR (Twilio, Vonage, Amazon Connect)
- SMS (Twilio, MessageBird)
- Social (Facebook, WhatsApp, Instagram)

---

## Local Development URLs

### Main Dashboard (Port 3000)
| Page | URL |
|------|-----|
| **Root (/)** | http://localhost:3000 → Redirects |
| **Sign-in (DEFAULT)** | http://localhost:3000/sign-in |
| **Dashboard** | http://localhost:3000/dashboard |
| **Admin Panel** | http://localhost:3000/admin |

### dCQ - Chat Core IQ (Port 3002)
| Page | URL |
|------|-----|
| **Home** | http://localhost:3002/dcq/Home/index.html |
| **Admin** | http://localhost:3002/dcq/admin |
| **Admin Content** | http://localhost:3002/dcq/admin/content |
| **Demo IVR** | http://localhost:3002/dcq/demo/ivr |

### dIQ - Intranet IQ (Port 3001)
| Page | URL |
|------|-----|
| **Dashboard** | http://localhost:3001/diq/dashboard |
| **Chat** | http://localhost:3001/diq/chat |
| **Search** | http://localhost:3001/diq/search |
| **People** | http://localhost:3001/diq/people |
| **Content** | http://localhost:3001/diq/content |

### dSQ - Support IQ (Port 3003)
| Page | URL |
|------|-----|
| **ATC Executive** | http://localhost:3003/demo/atc-executive |
| **Gov COR** | http://localhost:3003/demo/cor |

---

## Quick Start Commands

```bash
# Navigate to project
cd /Users/aldrin-mac-mini/digitalworkplace.ai

# Start all apps
npm run dev              # Main (port 3000)
npm run dev:intranet     # dIQ (port 3001)
npm run dev:chatcore     # dCQ (port 3002)

# Build
npm run build

# Git
git status
git pull origin main
git add . && git commit -m "message" && git push

# Deploy
vercel --prod
```

---

## Key Documentation Files

| File | Path |
|------|------|
| **SAVEPOINT.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/SAVEPOINT.md` |
| **CHANGELOG.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/CHANGELOG.md` |
| **CLAUDE.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/CLAUDE.md` |
| **context.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/context.md` |
| **DB Reference** | `/Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md` |
| **dCQ Audit Report** | `/Users/aldrin-mac-mini/digitalworkplace.ai/apps/chat-core-iq/FULL_SPECTRUM_AUDIT_REPORT.md` |
| **dTQ DEMO-GUIDE** | `/Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/DEMO-GUIDE.md` |
| **dTQ DEMO-GUIDE (PDF)** | `/Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/DEMO-GUIDE.pdf` |
| **dTQ SALES-GUIDE** | `/Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/SALES-GUIDE.md` |
| **dTQ SALES-GUIDE (PDF)** | `/Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/SALES-GUIDE.pdf` |
| **dTQ TESTING-AUDIT-GUIDE** | `/Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/TESTING-AUDIT-GUIDE.md` |
| **dTQ CLAUDE.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/CLAUDE.md` |

---

## Pending Tasks

### Short Term
- [x] dCQ v1.0.2 Full Spectrum Audit - COMPLETED
- [x] Fix embedding coverage to 100% - COMPLETED
- [x] dCQ v1.1.0 Session-Based Settings Isolation - COMPLETED
- [x] Fix Chat Core IQ link to Doral homepage - COMPLETED
- [x] Full Spectrum Semantic Search & Sync Test - COMPLETED (100/100)
- [x] dCQ v1.2.0 City of Doral Data Import - COMPLETED
- [x] Security Audit - All critical vulnerabilities fixed - COMPLETED
- [x] Clerk OAuth Bulletproofing - COMPLETED
- [x] Clerk OAuth Organization Fix - COMPLETED (v0.8.2)
- [x] dCQ Workflow Expansion - 12 new workflows LIVE (v0.8.3)
- [x] dTQ (Test Pilot IQ) implementation - LIVE (v1.1.0)
- [x] dTQ linked from main dashboard with pink theme (#ff3366)
- [x] dTQ Knowledge Base + Vector Embeddings + AI Chat with RAG - LIVE (v1.3.0)
- [x] dTQ All API Endpoints Fixed + Full Data Seeded - LIVE (v1.4.0)
- [x] dTQ ChatWidget UX Overhaul — persistent quick actions, scroll fix, reset - LIVE (v1.5.0)
- [x] dTQ Chatbot Interlinked Navigation — actionable link cards in AI responses - LIVE (v1.6.0)
- [x] dTQ DEMO-GUIDE.md — 1,760-line demo guide + PDF, 263/263 checks verified (v0.9.7)
- [x] dTQ SALES-GUIDE.md — 534-line sales script + PDF, 106/106 checks verified (v0.9.7)
- [x] Full-spectrum verification of both documents against source code — 14 fixes applied (v0.9.7)
- [x] dTQ Full-Spectrum Testing Audit — 200 checks, 3 additional fixes, TESTING-AUDIT-GUIDE.md created (v0.9.8)
- [x] dTQ 4-Tier Link Resolution Pipeline — global entity index, cross-persona matching, guaranteed fallback, ~20 keyword groups (v0.9.9)
- [x] dTQ Performance Optimization — 16-file, 7-priority optimization: timer cascade fix, CSS animations, memoization, API caching (v0.9.10)
- [x] dTQ PRD Gap Features — 6 new features: Tech Lead Execution Console, Before/After ROI, Mini-Charts in Chat, 12-Month Trends, Integration Badges, Deployment Modal (v0.9.11)
- [x] dTQ Dashboard UX Overhaul — TrendChart rewrite, 4 charts (was 2), 14-day data, compact integrations bar, reordered layout (v0.9.11)

### Medium Term
- [ ] Cross-project search UI
- [ ] User profile page
- [ ] Settings page
- [ ] Make workflow builder UI functional (currently demo-only)

---

*Last session: 2026-02-05*
*Version: 0.9.11*
*Machine: Mac Mini (aldrin-mac-mini)*
