# dIQ - Intranet IQ | SAVEPOINT (Master Reference)

---

## ⚠️ MASTER REFERENCE - READ THIS FILE FIRST

**This is the SINGLE SOURCE OF TRUTH for dIQ development sessions.**

When starting a new session, say **"refer save point"** and Claude will read this file to understand:
1. Current project state
2. All documentation context
3. Key standards and configurations
4. Pending tasks

When ending a session, say **"do a save point"** and Claude will update this file.

---

## CURRENT STATE

| Property | Value |
|----------|-------|
| **Last Updated** | January 29, 2026 @ 7:30 PM |
| **Session** | Full Spectrum Session Management Setup |
| **Version** | 2.1.0 |
| **Audit Score** | 100/100 |
| **Git Commit** | Pending |
| **Vercel Status** | ✅ LIVE |
| **Local URL** | http://localhost:3001/diq/dashboard |
| **Production URL** | https://intranet-iq.vercel.app/diq/dashboard |

---

## DOCUMENTATION INDEX

| File | Path | Purpose |
|------|------|---------|
| **SAVEPOINT.md** | `SAVEPOINT.md` | This file - master reference |
| **CLAUDE.md** | `CLAUDE.md` | Project instructions, commands |
| **context.md** | `context.md` | Design system, UI specs |
| **CHANGELOG.md** | `CHANGELOG.md` | Version history |
| **Query Standards** | `docs/QUERY_DETECTION_STANDARDS.md` | Search algorithm |
| **Maintenance** | `docs/MAINTENANCE.md` | Health checks, deployment |

### Full Paths
```
/Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq/SAVEPOINT.md
/Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq/CLAUDE.md
/Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq/context.md
/Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq/CHANGELOG.md
/Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq/docs/QUERY_DETECTION_STANDARDS.md
/Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq/docs/MAINTENANCE.md
```

### Global Standards (Monorepo Root)
```
/Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md
/Users/aldrin-mac-mini/digitalworkplace.ai/docs/PGVECTOR_BEST_PRACTICES.md
/Users/aldrin-mac-mini/digitalworkplace.ai/docs/QUERY_DETECTION_STANDARDS.md
```

---

## QUICK START (from CLAUDE.md)

```bash
# Start dev server
cd /Users/aldrin-mac-mini/digitalworkplace.ai
npm run dev:intranet

# Open in browser
open http://localhost:3001/diq/dashboard

# Build for production
npm run build

# Deploy to Vercel
cd apps/intranet-iq && vercel --prod --yes
```

### Test API Performance
```bash
time curl -s http://localhost:3001/diq/api/dashboard | jq '.stats'
time curl -s http://localhost:3001/diq/api/people | jq '.employees | length'
time curl -s http://localhost:3001/diq/api/content | jq '.articles | length'
```

---

## DESIGN SYSTEM: MIDNIGHT GREEN (from context.md)

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-obsidian` | #08080c | Primary background |
| `--bg-charcoal` | #121218 | Cards, surfaces |
| `--bg-slate` | #1c1c24 | Inputs, hover |
| `--accent-ember` | #10b981 | Primary accent (emerald) |
| `--accent-ember-soft` | #34d399 | Hover state |
| `--accent-gold` | #6ee7b7 | Highlights, badges |
| `--text-primary` | #fafafa | Primary text |
| `--text-secondary` | rgba(250,250,250,0.7) | Body text |

### Brand Identity
- **Logo:** Bold "d" + regular "IQ" + green dot (same baseline)
- **Favicon:** "d." with green dot on dark bg
- **Page Title:** "dIQ - Intranet IQ"
- **Font:** ui-monospace, SF Mono, JetBrains Mono

### Animation (Framer Motion)
- Duration fast: 200ms
- Duration normal: 300ms
- Spring stiffness: 400
- Spring damping: 25

---

## QUERY DETECTION STANDARDS (from docs/QUERY_DETECTION_STANDARDS.md)

### Configuration
| Setting | Value |
|---------|-------|
| **Match Threshold** | 0.50 (50%) |
| **Embedding Model** | OpenAI text-embedding-3-small |
| **Dimensions** | 1536 |
| **Keyword Weight** | 0.4 |
| **Semantic Weight** | 0.6 |

### Key Compound Words
```
'knowledge base' → 'knowledgebase'
'org chart' → 'orgchart'
'pto request' → 'ptorequest'
'vacation policy' → 'vacationpolicy'
'my day' → 'myday'
```

### Search API Endpoints
| Endpoint | Purpose |
|----------|---------|
| `/api/search` | Main hybrid search |
| `/api/search/summarize` | Claude AI summarization |
| `/api/search/federated` | External connectors |

---

## MAINTENANCE COMMANDS (from docs/MAINTENANCE.md)

### Daily Health Checks
```bash
# Check application
curl -s http://localhost:3001/diq/api/admin/health | jq

# Check Elasticsearch
curl -s http://localhost:9200/_cluster/health | jq '.status'

# Check API response time
time curl -s http://localhost:3001/diq/api/dashboard > /dev/null
```

### Expected Results
| Check | Expected |
|-------|----------|
| Application | HTTP 200 |
| Elasticsearch | "green" or "yellow" |
| Response Time | < 500ms |

### Deployment
```bash
# Pre-deploy checks
npm run lint
npm run type-check
npm run build

# Deploy
cd apps/intranet-iq && vercel --prod --yes

# Verify
curl -s -o /dev/null -w "%{http_code}" https://intranet-iq.vercel.app/diq/dashboard
```

---

## VERSION HISTORY (from CHANGELOG.md)

### v2.1.0 (January 29, 2026) - Current
- EPIC 1: AI summarization + Add to KB on search results
- EPIC 4: Framework Hub in Knowledge Base
- EPIC 8: Calendar widget in My Day
- Project documentation (QUERY_DETECTION_STANDARDS.md, MAINTENANCE.md)

### v2.0.0 (January 29, 2026)
- 90/90 test points (100%)
- Multi-LLM support (8 models)
- Real-time indexing
- Access request system
- Content approval workflow
- Workflow human approvals
- Admin health monitoring
- Direct messaging

### v1.1.0 (January 22, 2026)
- Full Spectrum Implementation (100% feature coverage)
- AI Assistant with streaming, RAG, function calling
- EX Features (notifications, reactions, polls, channels)
- Framework Integration (4 connectors)
- Productivity Assistant (My Day)
- Agentic Workflows (execution engine)
- Admin Dashboard

---

## TECH STACK

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.3 | React framework |
| React Query | 5.x | Data caching |
| TypeScript | 5.x | Type safety |
| Clerk | @clerk/nextjs | Authentication |
| Supabase | @supabase/supabase-js | Database |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.x | Animations |
| Lucide React | 0.562.x | Icons |
| Anthropic SDK | @anthropic-ai/sdk | Claude AI |

---

## PROJECT STRUCTURE

```
apps/intranet-iq/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Redirects to /dashboard
│   │   ├── globals.css         # Midnight Green theme
│   │   ├── dashboard/          # Main dashboard
│   │   ├── chat/               # AI Assistant
│   │   ├── search/             # Enterprise Search
│   │   ├── people/             # Directory & Org Chart
│   │   ├── content/            # Knowledge Base + Framework Hub
│   │   ├── agents/             # Workflows
│   │   ├── my-day/             # Productivity Hub
│   │   ├── settings/           # User Settings
│   │   └── api/                # 35+ API routes
│   ├── components/
│   │   ├── brand/IQLogo.tsx    # dIQ logo
│   │   ├── layout/Sidebar.tsx  # Navigation
│   │   └── search/             # Search components
│   └── lib/
│       ├── ai/                 # LLM providers
│       ├── workflow/           # Workflow engine
│       └── supabase.ts         # Database client
├── docs/
│   ├── QUERY_DETECTION_STANDARDS.md
│   └── MAINTENANCE.md
├── CLAUDE.md
├── context.md
├── SAVEPOINT.md                # THIS FILE
└── CHANGELOG.md
```

---

## DATABASE (Supabase)

### Schemas
- **diq**: Project-specific tables (45+)
- **public**: Shared tables (users, organizations)

### Key Tables
| Table | Count | Purpose |
|-------|-------|---------|
| articles | 212 | Knowledge base |
| employees | 60 | Directory |
| departments | 15 | Organization |
| workflows | 31 | Automation |
| news_posts | 61 | Company news |
| events | 49 | Calendar |

### Embeddings
- 100% coverage on articles
- pgvector v0.8.0
- 1536 dimensions

---

## PAGES (19 Total)

| Page | Route | Status |
|------|-------|--------|
| Dashboard | `/diq/dashboard` | ✅ |
| Chat | `/diq/chat` | ✅ Streaming, RAG |
| Search | `/diq/search` | ✅ Semantic + federated |
| People | `/diq/people` | ✅ 60 employees |
| Content | `/diq/content` | ✅ 212 articles + Framework Hub |
| Agents | `/diq/agents` | ✅ Full execution |
| My Day | `/diq/my-day` | ✅ Calendar widget |
| Settings | `/diq/settings` | ✅ 9 panels |
| News | `/diq/news` | ✅ Reactions |
| Events | `/diq/events` | ✅ Calendar |
| Channels | `/diq/channels` | ✅ Real backend |
| Notifications | `/diq/notifications` | ✅ |
| Integrations | `/diq/integrations` | ✅ |
| Admin Dashboard | `/diq/admin/dashboard` | ✅ |
| Analytics | `/diq/admin/analytics` | ✅ |
| Permissions | `/diq/admin/permissions` | ✅ RBAC |
| Elasticsearch | `/diq/admin/elasticsearch` | ✅ 3 nodes |

---

## PENDING TASKS

- [ ] None - v2.1.0 complete
- [ ] Git commit pending

---

## SESSION HISTORY

### January 29, 2026 (Current)
- Implemented PRD compliance enhancements (v2.1.0)
- Added AI summarization to search results
- Added Framework Hub to Knowledge Base
- Added Calendar widget to My Day
- Created project documentation files
- Set up full spectrum session management

### January 22, 2026
- Full Spectrum Implementation (v1.1.0)
- Achieved 100/100 audit score
- Deployed to production

---

## SESSION END PROTOCOL

When ending session, Claude must:
1. Update SAVEPOINT.md with accomplishments
2. Update CHANGELOG.md if version changed
3. Update context.md if design changed
4. Remind user to commit git changes

---

*Part of Digital Workplace AI Product Suite*
*Repository: https://github.com/aldrinstellus/digitalworkplace.ai*
*Production: https://intranet-iq.vercel.app/diq/dashboard*
*Version: 2.1.0*
*Last Updated: January 29, 2026*
