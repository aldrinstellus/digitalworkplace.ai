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
3. /Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-pilot-iq/CLAUDE.md (This file)
```

**THEN:**
- Open browser to: http://localhost:3004/dtq/dashboard
- Check if dev server is running

---
## PROJECT OVERVIEW
---

**Test Pilot IQ (dTQ)** is an AI-powered QA & testing intelligence platform - part of the Digital Workplace AI product suite.

### Status: ⬜ PENDING IMPLEMENTATION

### Planned URLs
| Page | Route | Local Dev |
|------|-------|-----------|
| **Dashboard** | `/dtq/dashboard` | http://localhost:3004/dtq/dashboard |
| **Test Cases** | `/dtq/tests` | http://localhost:3004/dtq/tests |
| **Defects** | `/dtq/defects` | http://localhost:3004/dtq/defects |
| **Reports** | `/dtq/reports` | http://localhost:3004/dtq/reports |

**Note:** Will use `basePath: "/dtq"` in `next.config.ts`

---
## DATABASE REFERENCE (REQUIRED)
---

**CRITICAL:** All database schemas are defined in the master reference:
```
/Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md
```

### dTQ Schema Tables (from master reference)

| Table | Description | Has Embedding |
|-------|-------------|---------------|
| `dtq.projects` | Test projects | No |
| `dtq.test_suites` | Test collections | No |
| `dtq.test_cases` | Individual tests | ✅ Yes (384 dims) |
| `dtq.test_runs` | Execution runs | No |
| `dtq.defects` | Bug reports | ✅ Yes (384 dims) |
| `dtq.requirements` | Requirements | ✅ Yes (384 dims) |

### Cross-Project Integration
- Syncs to `public.knowledge_items` for cross-project search
- Uses same embedding model: `all-MiniLM-L6-v2` (384 dims)
- Follows patterns from dIQ implementation

---
## KEY FEATURES (Planned)
---

- **Test Case Management**: Create, organize, version test cases
- **AI Test Generation**: Generate test cases from requirements using embeddings
- **Defect Tracking**: Link defects to test cases and requirements
- **Similar Defect Detection**: Find duplicate bugs using semantic search
- **Coverage Matrix**: Requirements-to-tests traceability
- **Test Reports**: Execution summaries, trends, analytics

---
## TECH STACK
---

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | React framework with App Router |
| **TypeScript** | 5.x | Type safety |
| **Supabase** | @supabase/supabase-js | Database |
| **Tailwind CSS** | 4.x | Styling |
| **@xenova/transformers** | - | Local embeddings (384 dims) |

---
## QUICK START (When Implemented)
---

```bash
# From monorepo root
cd /Users/aldrin-mac-mini/digitalworkplace.ai
npm run dev:testpilot    # Start Test Pilot IQ on port 3004

# From apps/test-pilot-iq/
npm run dev              # Start dev server
npm run build            # Production build
```

---
## IMPLEMENTATION CHECKLIST
---

- [ ] Initialize Next.js project with basePath `/dtq`
- [ ] Create Supabase schema `dtq` (see master DB reference)
- [ ] Add embedding columns to test_cases, defects, requirements
- [ ] Create HNSW indexes for vector search
- [ ] Create sync triggers to `knowledge_items`
- [ ] Implement `/api/embeddings` endpoint
- [ ] Implement `/api/search` endpoint
- [ ] Build test case management UI
- [ ] Build defect tracker UI
- [ ] Build reports dashboard

---

*Part of Digital Workplace AI Product Suite*
*Location: /Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-pilot-iq*
*Port: 3004 | BasePath: /dtq | Status: PENDING*
