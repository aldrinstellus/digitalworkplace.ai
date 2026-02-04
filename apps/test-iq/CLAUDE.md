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
1. /Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md (MASTER DB - REQUIRED)
2. /Users/aldrin-mac-mini/digitalworkplace.ai/docs/PGVECTOR_BEST_PRACTICES.md (Semantic search)
3. /Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq/CLAUDE.md (This file)
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
| `dtq.test_issues` | Failures/defects from test runs | 30+ |
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

### RPC Functions
| Function | Schema | Purpose |
|----------|--------|---------|
| `search_dtq_knowledge_semantic` | `public` | SECURITY DEFINER wrapper for vector search (accepts jsonb) |
| `get_dtq_kb_without_embeddings` | `public` | Helper for embedding generation script |
| `update_dtq_kb_embedding` | `public` | Helper for embedding generation script |
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
- **AI Chat with RAG**: Claude-powered assistant with vector semantic search
  - 130 knowledge base rows with 1536-dim OpenAI embeddings (100% coverage)
  - Persona-aware context filtering (csuite/manager/techlead)
  - Semantic search via `public.search_dtq_knowledge_semantic` RPC
  - Claude Sonnet 4 responses with RAG context injection
  - Demo mode fallback when API keys not configured

### Data Flow
1. Initial data loaded from Supabase via API endpoints
2. Fallback to static data.ts if API fails
3. Real-time simulation updates local state (not persisted)
4. Export functions use current state data
5. AI chat: user message → OpenAI embedding → semantic search → Claude response with RAG context

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
│   │   │   ├── layout.tsx           # Dashboard layout + Persona context
│   │   │   ├── dashboard/page.tsx   # Main dashboard
│   │   │   ├── history/page.tsx     # 30-day metrics trends
│   │   │   └── reports/page.tsx     # Test execution reports
│   │   └── api/dtq/
│   │       ├── features/route.ts    # Features API
│   │       ├── categories/route.ts  # Categories API
│   │       ├── test-runs/route.ts   # Test runs API
│   │       ├── metrics/route.ts     # Metrics API
│   │       └── personas/route.ts    # Personas API
│   ├── components/dtq/
│   │   ├── AIAssistant.tsx
│   │   ├── FeatureCoverage.tsx
│   │   ├── HighRiskBanner.tsx
│   │   ├── LiveIndicator.tsx
│   │   ├── MetricCard.tsx
│   │   ├── PersonaCard.tsx
│   │   ├── ReportCard.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TrendChart.tsx
│   │   └── modals/
│   ├── hooks/
│   │   └── useRealTimeSimulation.ts # Main data hook (API + simulation)
│   └── lib/
│       ├── supabase.ts              # Supabase client (dtq schema)
│       └── dtq/
│           ├── data.ts              # Fallback static data
│           ├── types.ts             # TypeScript interfaces
│           └── export.ts            # CSV/PDF export functions
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

---

*Part of Digital Workplace AI Product Suite*
*Location: /Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq*
*Port: 3004 | BasePath: /dtq | Status: IMPLEMENTED*
