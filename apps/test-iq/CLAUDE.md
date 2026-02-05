# Test Pilot IQ (dTQ) - Claude Code Instructions

---
## AUTO-READ TRIGGER (MANDATORY)
---

**ON ANY OF THESE PHRASES, IMMEDIATELY READ ALL DOC FILES BEFORE RESPONDING:**
- "hey", "hi", "hello", "start", "begin", "let's go", "ready"
- "pull latest", "get latest", "check latest", "update"
- "open dev", "open local", "dev server", "localhost"
- "where were we", "continue", "resume", "what's next"
- ANY greeting or session start

**FILES TO READ (in this order):**
```
1. /Users/aldrin-mac-mini/digitalworkplace.ai/SAVEPOINT.md (CURRENT STATE - most important)
2. /Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/CLAUDE.md (This file)
3. /Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/TESTING-AUDIT-GUIDE.md (Testing audit results)
4. /Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md (MASTER DB)
5. /Users/aldrin-mac-mini/digitalworkplace.ai/docs/PGVECTOR_BEST_PRACTICES.md (Semantic search)
```

**DOCUMENTATION FILES (reference as needed):**
```
- /Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/DEMO-GUIDE.md (1760-line comprehensive demo guide)
- /Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/DEMO-GUIDE.pdf (PDF version)
- /Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/SALES-GUIDE.md (534-line sales demo script)
- /Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/SALES-GUIDE.pdf (PDF version)
- /Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/TESTING-AUDIT-GUIDE.md (200-check testing audit)
- /Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/PRD-FULL-SPECTRUM-AUDIT.md (62-check PRD audit — 100%)
```

**THEN:**
- Open browser to: http://localhost:3004/dtq/dashboard
- Check if dev server is running

---
## PROJECT OVERVIEW
---

**Test Pilot IQ (dTQ)** is an AI-powered QA & testing intelligence platform - part of the Digital Workplace AI product suite.

### Status: ✅ IMPLEMENTED (Database-Backed Demo)

### URLs
| Page | Route | Local Dev |
|------|-------|-----------|
| **Dashboard** | `/dtq/dashboard` | http://localhost:3004/dtq/dashboard |
| **History** | `/dtq/history` | http://localhost:3004/dtq/history |
| **Reports** | `/dtq/reports` | http://localhost:3004/dtq/reports |

**Note:** Uses `basePath: "/dtq"` in `next.config.ts`

---
## DATABASE SCHEMA (dtq)
---

**Schema:** `dtq` (Supabase)

### Tables

| Table | Description | Row Count |
|-------|-------------|-----------|
| `dtq.features` | Test features across 10 categories | 46 |
| `dtq.test_runs` | Test execution history | 40+ |
| `dtq.test_issues` | Failures/defects from test runs | 30 |
| `dtq.daily_metrics` | 30-day historical metrics | 30 |
| `dtq.personas` | Role-based persona definitions | 3 |
| `dtq.persona_metrics` | KPIs per persona | 24 |
| `dtq.knowledge_base` | **AI knowledge base with vector embeddings** | **130** |

### Migration Files
```
supabase/migrations/
├── 012_dtq_schema.sql         # Schema + tables + RLS
├── 013_dtq_seed_data.sql      # All seed data (features, runs, metrics, personas)
├── 014_dtq_knowledge_sync.sql # Knowledge base integration trigger
└── 015_dtq_knowledge_base.sql # Knowledge base + embeddings + semantic search
```

### Knowledge Base (`dtq.knowledge_base`)
| Item Type | Count | Description |
|-----------|-------|-------------|
| `feature` | 80 | All features across 3 personas (16+46+18) |
| `category_summary` | 20 | Category aggregations (5+10+5) |
| `persona_kpi` | 24 | KPI metrics (7+9+8) |
| `test_run_summary` | 3 | Per-persona test execution summaries |
| `daily_metrics_summary` | 3 | Per-persona 30-day metrics overviews |
| **Total** | **130** | **100% embedding coverage (1536-dim)** |

### Public Schema Views (PostgREST Access)

**Note:** The `dtq` schema is NOT exposed via PostgREST. All API access uses public schema views.

| View | Points To | Row Count |
|------|-----------|-----------|
| `public.dtq_features` | `dtq.features` | 46 |
| `public.dtq_test_runs` | `dtq.test_runs` | 40 |
| `public.dtq_test_issues` | `dtq.test_issues` | 30 |
| `public.dtq_daily_metrics` | `dtq.daily_metrics` | 30 |
| `public.dtq_personas` | `dtq.personas` | 3 |
| `public.dtq_persona_metrics` | `dtq.persona_metrics` | 24 |

### RPC Functions
| Function | Schema | Purpose |
|----------|--------|---------|
| `search_dtq_knowledge_semantic` | `public` | SECURITY DEFINER wrapper for vector search (accepts jsonb) |
| `get_dtq_kb_without_embeddings` | `public` | Helper for embedding generation script |
| `update_dtq_kb_embedding` | `public` | Helper for embedding generation script |
| `insert_dtq_test_run` | `public` | SECURITY DEFINER INSERT into dtq.test_runs |
| `insert_dtq_test_issues` | `public` | SECURITY DEFINER INSERT into dtq.test_issues |
| `search_knowledge_semantic` | `dtq` | Internal semantic search (vector parameter) |

### Key Fields

**Features:**
- `id`, `name`, `category`, `coverage`, `status`
- `open_defects`, `closed_defects`, `risk_score`, `pass_rate`, `impact_score`

**Test Runs:**
- `id`, `feature_id`, `feature_name`, `executed_at`, `status`
- `total_tests`, `passed_tests`, `failed_tests`, `duration`

**Daily Metrics:**
- `date`, `pass_rate`, `first_run_pass_rate`, `defect_detection`
- `effectiveness`, `automation_coverage`

---
## API ENDPOINTS
---

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dtq/features` | GET | List all 46 features |
| `/api/dtq/categories` | GET | Categories with aggregated stats |
| `/api/dtq/test-runs` | GET | Test run history with issues |
| `/api/dtq/test-runs` | POST | Create new test run (simulation) |
| `/api/dtq/metrics` | GET | Daily metrics (30 days) |
| `/api/dtq/metrics?type=summary` | GET | Summary metrics from features |
| `/api/dtq/personas` | GET | All personas with metrics |
| `/api/dtq/chat` | POST | **Claude-powered AI chat with RAG** |

---
## KEY FEATURES
---

### Implemented
- **46 Features** across 10 categories (LMS-focused)
- **3 Personas** with role-specific KPIs:
  - C-Suite: Strategic business metrics (7 KPIs)
  - QA Manager: Team performance metrics (9 KPIs)
  - Tech Lead: Engineering metrics (8 KPIs)
- **Real-time Simulation**: New test runs every 8-15 seconds
- **30-Day Metrics History**: Pass rate, defect detection, automation coverage
- **Export Functionality**: CSV and PDF exports working
- **Interactive Modals**: Feature drill-down, chart point analysis
- **Knowledge Base Sync**: Features synced to `public.knowledge_items`
- **AI Chat with RAG**: Claude-powered floating chat widget with vector semantic search
  - 130 knowledge base rows with 1536-dim OpenAI embeddings (100% coverage)
  - Persona-aware context filtering (csuite/manager/techlead)
  - Semantic search via `public.search_dtq_knowledge_semantic` RPC
  - Claude Sonnet 4 responses with RAG context injection
  - Demo mode fallback when API keys not configured
  - **ChatWidget UX (v1.5.0)**: Floating overlay, persistent quick action pills, user-controlled scroll, reset button, cross-page persistence via ChatContext
  - **Interlinked Navigation (v1.6.0)**: Actionable link cards below AI responses with NavigationContext dispatch pattern; links navigate to features, categories, metrics, reports, and history pages; 3 link resolution strategies (bold text, RAG sources, keywords); max 5 links per response
  - **4-Tier Link Resolution (v1.7.0)**: Complete rewrite of link-resolver.ts — global entity index (80 features, 20 categories, 24 KPIs across all 3 personas), 4-tier pipeline (source-based → entity text scanning → keyword detection → context-aware fallback), guaranteed ≥1 link per response, cross-persona feature resolution, ~20 keyword pattern groups, error fallback links in ChatWidget
- **Performance Optimization (v1.8.0)**: 16-file optimization across 7 priorities:
  - Timer cascade fix: `useRef` for features in `useRealTimeSimulation.ts`, metric interval 10s→30s, `startTransition` wrapping
  - Animation reduction: TrendChart 1500→500ms, PersonaCard stagger halved, spring stiffness 300→200
  - CSS migration: ReportCard stat hover + failed glow, FeatureCoverage row animations, MetricCard hover → CSS transitions/keyframes
  - Re-render prevention: Pre-built metric handlers via `useMemo`, conditional modal rendering, stabilized chart data refs
  - Memoization: `MemoizedMessageContent` + `MemoizedLinkCard` components, `AnimatePresence mode="sync"`
  - History consolidation: 8 useMemos → 2 single-pass calculations
  - API routes: Cache-Control headers, nested selects (test-runs, personas), 30s AbortController timeout on Claude API
- **PRD Gap Features (v2.0.0)**: 6 new features closing PRD coverage from 45.6% to ~85%+:
  - **Tech Lead Execution Console**: Feature selection (18 features in 5 categories), environment/browser/parallel config, Execute/Queue/Schedule buttons, live progress bars + console log, state machine (idle→running→complete), generates TestRun objects
  - **Before/After ROI Comparison**: Collapsible table with 6 persona-aware metric rows, animated counters for "After" values
  - **Inline Mini-Charts in Chat**: Regex-detected metric mentions render 180×36px Recharts sparklines below AI responses
  - **12-Month Trend Data**: persona-data.ts generates 365 days (was 30), TimeRangeSelector on History page (7d/30d/90d/12m)
  - **Integration Badges**: 6 badges (JIRA, Confluence, GitHub, ServiceNow, Slack, Azure DevOps) in compact horizontal bar
  - **Deployment Architecture Modal**: Cloud/Gov Cloud/On-Premises options from sidebar footer
- **Dashboard UX Overhaul (v2.0.0)**:
  - TrendChart: Complete rewrite — prominent 3xl current value + change badge, tightened Y-axis, avg reference line, pulsing SVG dot, richer gradient
  - 4 trend charts (was 2): Pass Rate, Automation Coverage, Defect Detection, First Run Pass Rate
  - 14-day chart data (was 7-day) with stabilized refs
  - Integration Badges moved to compact horizontal bar right after primary metrics
  - Layout reorder: Metrics → Integrations → High Risk → 4x Charts → Persona Metrics → ROI → Coverage

### Data Flow
1. Initial data loaded from Supabase via API endpoints
2. Fallback to static data.ts if API fails
3. Real-time simulation updates local state (not persisted)
4. Export functions use current state data
5. AI chat: user message → OpenAI embedding → semantic search → Claude response with RAG context
6. Link resolution: 4-tier pipeline — Tier 1 (RAG source types including test_run_summary/daily_metrics_summary) → Tier 2 (entity name substring scanning across all personas) → Tier 3 (~20 keyword pattern groups) → Tier 4 (context-aware fallback guaranteeing ≥1 link)
7. Navigation: link card click → NavigationContext.dispatch → router.push + pendingAction → page useEffect opens modal

---
## TECH STACK
---

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | React framework with App Router |
| **TypeScript** | 5.x | Type safety |
| **Supabase** | @supabase/supabase-js | Database |
| **Tailwind CSS** | 4.x | Styling |
| **Framer Motion** | 12.x | Animations |
| **Recharts** | 3.x | Charts/visualizations |
| **GSAP** | 3.x | Advanced animations |

---
## QUICK START
---

```bash
# From monorepo root
cd /Users/aldrin-mac-mini/digitalworkplace.ai
npm run dev:testpilot    # Start Test Pilot IQ on port 3004

# From apps/test-iq/
npm run dev              # Start dev server
npm run build            # Production build
```

---
## FILE STRUCTURE
---

```
apps/test-iq/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Dashboard layout + Persona + ChatProvider + ChatWidget
│   │   │   ├── dashboard/page.tsx   # Main dashboard (4 charts, integrations, ROI, execution console)
│   │   │   ├── history/page.tsx     # 365-day metrics trends with TimeRangeSelector
│   │   │   └── reports/page.tsx     # Test execution reports
│   │   └── api/dtq/
│   │       ├── features/route.ts    # Features API
│   │       ├── categories/route.ts  # Categories API
│   │       ├── test-runs/route.ts   # Test runs API
│   │       ├── metrics/route.ts     # Metrics API
│   │       ├── personas/route.ts    # Personas API
│   │       └── chat/route.ts        # Claude chat API with RAG
│   ├── components/dtq/
│   │   ├── AgentPipeline.tsx         # 3-agent pipeline visualization (v2.1.0)
│   │   ├── BeforeAfterComparison.tsx # Before/After ROI table (v2.1.0 - PRD exact match)
│   │   ├── ChatWidget.tsx            # Floating AI chat with inline sparklines
│   │   ├── CompetitiveComparison.tsx # Traditional vs Low-Code vs dTQ table (v2.1.0)
│   │   ├── FeatureCoverage.tsx
│   │   ├── HighRiskBanner.tsx
│   │   ├── ImplementationPhases.tsx  # 4-phase implementation timeline (v2.1.0)
│   │   ├── IntegrationBadges.tsx     # 6 integration badges (v2.1.0 - Jenkins, BitBucket)
│   │   ├── LiveIndicator.tsx
│   │   ├── MetricCard.tsx
│   │   ├── MiniSparkline.tsx         # Tiny inline chat charts (v2.0.0)
│   │   ├── NextStepsCTA.tsx          # 3 CTA cards - Demo, Pilot, Marketplace (v2.1.0)
│   │   ├── PersonaCard.tsx
│   │   ├── ReportCard.tsx
│   │   ├── ResultsStatCards.tsx      # 6 big stat cards (v2.1.0)
│   │   ├── Sidebar.tsx               # + Deployment badge in footer
│   │   ├── TechLeadExecutionConsole.tsx # Execution orchestrator (v2.0.0)
│   │   ├── TimeRangeSelector.tsx     # 7d/30d/90d/12m pills (v2.0.0)
│   │   ├── TrendChart.tsx            # Rich area chart with value header
│   │   ├── execution/               # Execution console sub-components (v2.0.0)
│   │   │   ├── FeatureSelectionPanel.tsx
│   │   │   ├── ConfigurationBar.tsx
│   │   │   ├── ActionButtons.tsx
│   │   │   └── ExecutionStatusPanel.tsx
│   │   └── modals/
│   │       ├── BaseModal.tsx
│   │       ├── CategoryAnalyticsModal.tsx
│   │       ├── ChartDrillDownModal.tsx
│   │       ├── DeploymentModal.tsx   # Cloud/Gov/On-Prem (v2.0.0)
│   │       ├── FeatureDetailModal.tsx
│   │       ├── MetricDrillDownModal.tsx
│   │       └── TestRunDetailModal.tsx
│   ├── contexts/
│   │   ├── ChatContext.tsx            # Cross-page chat message persistence
│   │   └── NavigationContext.tsx      # Chat link → page modal navigation dispatch
│   ├── hooks/
│   │   ├── useExecutionSimulation.ts  # Execution state machine (v2.0.0)
│   │   └── useRealTimeSimulation.ts   # Main data hook (API + simulation)
│   └── lib/
│       ├── supabase.ts              # Supabase client (dtq schema)
│       └── dtq/
│           ├── chat-chart-detector.ts # Metric mention regex (v2.0.0)
│           ├── data.ts              # Fallback static data
│           ├── types.ts             # TypeScript interfaces (+ execution types)
│           ├── export.ts            # CSV/PDF export functions
│           ├── persona-data.ts      # 365-day data generator (csuite/techlead)
│           └── link-resolver.ts     # Chat response → navigation link resolver
└── CLAUDE.md                        # This file
```

---
## IMPLEMENTATION CHECKLIST
---

- [x] Initialize Next.js project with basePath `/dtq`
- [x] Create Supabase schema `dtq` with 6 tables
- [x] Create RLS policies (public read for demo)
- [x] Seed 46 features across 10 categories
- [x] Seed 40 test runs with issues
- [x] Seed 30 days of metrics
- [x] Seed 3 personas with 24 metrics
- [x] Create API endpoints for all data
- [x] Wire hook to fetch from API with fallback
- [x] Implement CSV export (working)
- [x] Implement PDF export (working)
- [x] Create knowledge base sync trigger
- [x] Add knowledge base table with 130 rows
- [x] Generate OpenAI embeddings (100% coverage, 1536-dim)
- [x] Create semantic search RPC function
- [x] Build Claude chat API with RAG pipeline
- [x] Wire AIAssistant to real chat API
- [x] Sync 100 items to public.knowledge_items
- [x] Deploy to Vercel with all API keys configured
- [x] ChatWidget UX overhaul — persistent quick actions, user-controlled scroll, reset button (v1.5.0)
- [x] Cross-page chat persistence via ChatContext
- [x] Chatbot interlinked navigation — actionable link cards, NavigationContext, link-resolver (v1.6.0)
- [x] 4-tier link resolution pipeline — global entity index, cross-persona matching, guaranteed fallback (v1.7.0)
- [x] Performance optimization — 16-file, 7-priority: timer cascade, CSS animations, memoization (v1.8.0)
- [x] PRD gap features — Tech Lead Execution Console, Before/After ROI, Mini-Charts in Chat, 12-Month Trends, Integration Badges, Deployment Modal (v2.0.0)
- [x] Dashboard UX overhaul — TrendChart rewrite, 4 charts, 14-day data, compact integrations, reordered layout (v2.0.0)
- [x] 100% PRD alignment — 18 gaps fixed, 5 new components (AgentPipeline, ResultsStatCards, ImplementationPhases, CompetitiveComparison, NextStepsCTA), 11 modified files, 59/59 checks (v2.1.0)
- [x] Independent re-audit — 3 additional gaps found and fixed (G8 math corrected, Slide 1 quote, Production Defect Rate label), 62/62 checks (v2.1.1)

---

*Part of Digital Workplace AI Product Suite*
*Location: /Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq*
*Port: 3004 | BasePath: /dtq | Version: 2.1.1 | Status: IMPLEMENTED*
