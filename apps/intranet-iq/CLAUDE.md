# dIQ - Intranet IQ | Claude Code Instructions

---
## AUTO-READ TRIGGER (MANDATORY)
---

**ON ANY OF THESE PHRASES, IMMEDIATELY READ ALL 6 DOC FILES BEFORE RESPONDING:**
- "hey", "hi", "hello", "start", "begin", "let's go", "ready"
- "pull latest", "get latest", "check latest", "update"
- "open dev", "open local", "dev server", "localhost"
- "where were we", "continue", "resume", "what's next"
- ANY greeting or session start

**FILES TO READ (in this order):**
```
1. /Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq/SAVEPOINT.md
2. /Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq/context.md
3. /Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq/CHANGELOG.md
4. /Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md (MASTER DB - all projects)
5. /Users/aldrin-mac-mini/digitalworkplace.ai/docs/PGVECTOR_BEST_PRACTICES.md (Semantic search)
6. /Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq/CLAUDE.md
```

**THEN:**
- Open browser to: http://localhost:3001/diq/dashboard
- Summarize current state from SAVEPOINT.md
- List any pending tasks

---
## PROJECT OVERVIEW
---

**dIQ (Intranet IQ)** is an AI-powered internal knowledge network - part of the Digital Workplace AI product suite.

**Version:** 1.1.1 (Post-Audit TypeScript Cleanup)
**Audit Score:** 100/100
**Design System:** Midnight Ember (warm orange accents, not blue/purple)
**Production:** https://intranet-iq.vercel.app/diq/dashboard

### Brand Identity
- **Logo:** Bold "d" + regular "IQ" + orange dot (all on same baseline)
- **Favicon:** "d." with green dot on dark background
- **Page Title:** "dIQ - Intranet IQ"
- **Color Theme:** Midnight Ember (orange #f97316 accent)

### Core Features (v1.1.0)
- Enterprise Search (Elasticsearch + Semantic + Federated)
- AI Assistant (Claude with streaming, RAG, function calling)
- Knowledge Base Management (212 articles + connector sources)
- Employee Directory & Org Charts (60 employees)
- Custom Agentic Workflows (full execution engine)
- Role-based Access Control (RBAC)
- React Query caching for 60-80% faster loads
- EX Features (notifications, reactions, polls, channels)
- Productivity Hub (/my-day page)
- Admin Analytics Dashboard

---
## QUICK REFERENCE URLS
---

| Page | Route | Local Dev | Production |
|------|-------|-----------|------------|
| **Dashboard** | `/diq/dashboard` | http://localhost:3001/diq/dashboard | https://intranet-iq.vercel.app/diq/dashboard |
| **Chat** | `/diq/chat` | http://localhost:3001/diq/chat | https://intranet-iq.vercel.app/diq/chat |
| **Search** | `/diq/search` | http://localhost:3001/diq/search | https://intranet-iq.vercel.app/diq/search |
| **People** | `/diq/people` | http://localhost:3001/diq/people | https://intranet-iq.vercel.app/diq/people |
| **Content** | `/diq/content` | http://localhost:3001/diq/content | https://intranet-iq.vercel.app/diq/content |
| **Agents** | `/diq/agents` | http://localhost:3001/diq/agents | https://intranet-iq.vercel.app/diq/agents |
| **Settings** | `/diq/settings` | http://localhost:3001/diq/settings | https://intranet-iq.vercel.app/diq/settings |

**Note:** All routes use `basePath: "/diq"` configured in `next.config.ts`

---
## GLOBAL STANDARDS REFERENCE
---

**IMPORTANT**: This app follows global standards defined in the root CLAUDE.md file:
- **Query Detection Standards**: Match threshold 50%, compound words, key term penalties
- **Semantic Search**: Uses real OpenAI embeddings (text-embedding-3-small)
- **Reference**: `/Users/aldrin-mac-mini/digitalworkplace.ai/CLAUDE.md` → "GLOBAL STANDARDS" section

---
## TECH STACK
---

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.3 | React framework with App Router |
| **React Query** | 5.x | Data caching & fetching |
| **TypeScript** | 5.x | Type safety |
| **Clerk** | @clerk/nextjs | Authentication (shared with main app) |
| **Supabase** | @supabase/supabase-js | Database & user roles |
| **Tailwind CSS** | 4.x | Styling |
| **Framer Motion** | 12.x | UI animations |
| **GSAP** | 3.x | Complex animations |
| **Lucide React** | 0.562.x | Icons |

---
## DESIGN SYSTEM: MIDNIGHT EMBER
---

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-obsidian` | #08080c | Primary background |
| `--bg-charcoal` | #121218 | Cards, elevated surfaces |
| `--bg-slate` | #1c1c24 | Inputs, hover states |
| `--border-subtle` | rgba(255,255,255,0.06) | Subtle borders |
| `--border-default` | rgba(255,255,255,0.12) | Default borders |
| `--accent-ember` | #f97316 | Primary accent (orange) |
| `--accent-ember-soft` | #fb923c | Hover state |
| `--accent-copper` | #ea580c | Active/pressed state |
| `--accent-gold` | #fbbf24 | Highlights, badges |
| `--text-primary` | #fafafa | Primary text |
| `--text-secondary` | rgba(250,250,250,0.7) | Secondary text |
| `--text-muted` | rgba(250,250,250,0.5) | Muted text |

### Navigation
- **Sidebar Width:** 64px (collapsed)
- **Icons:** Lucide React
- **Active State:** Ember gradient bg + left indicator bar
- **Hover:** Subtle glow effect

---
## PROJECT STRUCTURE
---

```
apps/intranet-iq/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + QueryProvider
│   │   ├── page.tsx            # Redirects to /dashboard
│   │   ├── globals.css         # Midnight Ember theme
│   │   ├── icon.tsx            # Dynamic favicon "d."
│   │   ├── dashboard/page.tsx  # Main dashboard
│   │   ├── chat/page.tsx       # AI Assistant
│   │   ├── search/page.tsx     # Enterprise Search
│   │   ├── people/page.tsx     # Org Chart & Directory
│   │   ├── content/page.tsx    # Knowledge Base
│   │   ├── agents/page.tsx     # Workflow Automation
│   │   ├── settings/page.tsx   # User/Admin Settings
│   │   ├── news/page.tsx       # News feed
│   │   ├── events/page.tsx     # Events calendar
│   │   ├── channels/page.tsx   # Communication
│   │   ├── integrations/page.tsx # Third-party integrations
│   │   ├── admin/
│   │   │   ├── elasticsearch/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   └── permissions/page.tsx
│   │   └── api/
│   │       ├── dashboard/route.ts  # Parallelized queries
│   │       ├── content/route.ts    # Filtered articles
│   │       ├── people/route.ts     # Filtered employees
│   │       └── workflows/route.ts
│   ├── components/
│   │   ├── brand/IQLogo.tsx    # dIQ logo (SVG-based)
│   │   ├── layout/Sidebar.tsx  # Navigation sidebar
│   │   └── dashboard/          # Dashboard components
│   └── lib/
│       ├── motion.tsx          # Framer Motion components
│       ├── providers/QueryProvider.tsx  # React Query
│       ├── hooks/useQueryHooks.ts       # Cached data hooks
│       ├── hooks/useSupabase.ts         # Supabase hooks
│       ├── supabase.ts         # Supabase client
│       └── utils.ts            # Utility functions
├── docs/
│   ├── PERFORMANCE_AUDIT.md    # Performance checklist
│   └── DATABASE_ARCHITECTURE.md
├── CLAUDE.md                   # This file
├── context.md                  # Design specs
├── SAVEPOINT.md                # Session state
└── CHANGELOG.md                # Version history
```

---
## PAGES IMPLEMENTED (19 Total)
---

| Page | Route | Features |
|------|-------|----------|
| **Dashboard** | `/diq/dashboard` | News, events, stats, quick actions |
| **Chat** | `/diq/chat` | Claude AI, streaming, RAG, function calling |
| **Search** | `/diq/search` | Semantic + keyword + federated search |
| **People** | `/diq/people` | Grid/list/tree views, 60 employees |
| **Content** | `/diq/content` | 212 articles, tree navigation |
| **Agents** | `/diq/agents` | 31 workflow templates, full execution |
| **Settings** | `/diq/settings` | 9 panels (profile, appearance, etc.) |
| **News** | `/diq/news` | News feed with reactions |
| **Events** | `/diq/events` | Calendar view |
| **Channels** | `/diq/channels` | Real backend with members, messages |
| **Integrations** | `/diq/integrations` | Third-party services |
| **Notifications** | `/diq/notifications` | **NEW** - Notification center |
| **My Day** | `/diq/my-day` | **NEW** - Productivity hub, tasks |
| **Elasticsearch** | `/diq/admin/elasticsearch` | 3 nodes, 28K docs |
| **Analytics** | `/diq/admin/analytics` | Charts, drill-down |
| **Permissions** | `/diq/admin/permissions` | RBAC management |
| **Admin Dashboard** | `/diq/admin/dashboard` | **NEW** - Admin stats, system health |
| **News Detail** | `/diq/news/[id]` | Single article with reactions |
| **Events Detail** | `/diq/events/[id]` | Single event |

---
## DEVELOPMENT COMMANDS
---

```bash
# From monorepo root
cd /Users/aldrin-mac-mini/digitalworkplace.ai
npm run dev              # Start all apps
npm run dev:intranet     # Start only dIQ (port 3001)

# From apps/intranet-iq/
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run ESLint
npm run type-check       # TypeScript check

# Test API performance
time curl -s http://localhost:3001/diq/api/dashboard | jq '.stats'
time curl -s http://localhost:3001/diq/api/people | jq '.employees | length'
time curl -s http://localhost:3001/diq/api/content | jq '.articles | length'

# URLs after starting dev server
# Main App: http://localhost:3000
# dIQ:      http://localhost:3001/diq/dashboard
```

---
## PERFORMANCE OPTIMIZATION (v0.7.0)
---

### React Query Configuration
```typescript
// src/lib/providers/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,        // 30 seconds
      gcTime: 5 * 60 * 1000,       // 5 minutes cache
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Query Keys
```typescript
export const queryKeys = {
  dashboard: ["dashboard"] as const,
  content: (params?: ContentParams) => ["content", params] as const,
  people: (params?: PeopleParams) => ["people", params] as const,
  workflows: (params?: WorkflowParams) => ["workflows", params] as const,
  currentUser: ["currentUser"] as const,
};
```

### API Parallelization Pattern
```typescript
// Promise.all() for parallel queries
const [news, events, stats] = await Promise.all([
  supabase.schema('diq').from('news_posts').select('*'),
  supabase.schema('diq').from('events').select('*'),
  supabase.schema('diq').from('articles').select('*', { count: 'exact', head: true }),
]);
```

---
## DATABASE ARCHITECTURE
---

### Supabase Multi-Schema Structure
```
public schema (shared)     diq schema (project-specific)
├── organizations          ├── departments (15)
├── projects               ├── employees (60)
├── users (60+)            ├── kb_categories (20)
├── user_project_access    ├── articles (212)
├── knowledge_items        ├── chat_threads (30)
└── activity_log           ├── chat_messages (26)
                           ├── workflows (31)
                           ├── news_posts (61)
                           ├── events (49)
                           └── user_settings
```

### Cross-Schema Join Pattern
```typescript
// FK joins don't work across schemas - use manual enrichment
const employees = await supabase.schema('diq').from('employees').select('*');
const userIds = [...new Set(employees.map(e => e.user_id))];
const users = await supabase.from('users').select('*').in('id', userIds);
const usersMap = new Map(users.data.map(u => [u.id, u]));
const enriched = employees.map(e => ({ ...e, user: usersMap.get(e.user_id) }));
```

---
## ELASTICSEARCH INTEGRATION
---

### Quick Start
```bash
# Start Elasticsearch (requires Docker)
docker compose -f docker-compose.elasticsearch.yml up -d

# Access: http://localhost:9200 (ES), http://localhost:5601 (Kibana)
```

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/elasticsearch/search` | POST | Search with keyword/semantic/hybrid |
| `/api/elasticsearch/index` | POST | Index operations |

---
## SESSION END PROTOCOL
---

**Before ending session:**
1. Update SAVEPOINT.md with current state
2. Update CHANGELOG.md if version changed
3. Update context.md if design specs changed
4. Commit and push changes to git

**User Checklist:**
```
[ ] SAVEPOINT.md updated
[ ] Git changes committed and pushed
[ ] Dev server: Ctrl+C to stop
```

---
## INTEGRATION WITH MAIN APP
---

- **Main App Dashboard:** `apps/main/src/app/dashboard/page.tsx:29`
- **Production Link:** https://intranet-iq.vercel.app/diq/dashboard
- **Authentication:** Shared Clerk instance
- **Database:** Shared Supabase (public + diq schemas)
- **Port:** 3001 (main app on 3000)

---

---
## API ROUTES (35+ Total)
---

### Core APIs
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dashboard` | GET | Dashboard data |
| `/api/content` | GET | Articles with filtering |
| `/api/people` | GET | Employees with filtering |
| `/api/workflows` | GET/POST | Workflow management |
| `/api/search` | GET | Search endpoint |

### New v1.1.0 APIs
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat/stream` | POST | SSE streaming AI responses |
| `/api/notifications` | GET/POST | Notification CRUD |
| `/api/reactions` | GET/POST/DELETE | Reaction management |
| `/api/recognitions` | GET/POST | Recognition/shoutouts |
| `/api/polls` | GET/POST | Poll management |
| `/api/channels` | GET/POST | Real channel backend |
| `/api/tasks` | GET/POST | Task management |
| `/api/celebrations` | GET | Birthday/anniversary |
| `/api/connectors` | GET/POST | External connectors |
| `/api/kb-spaces` | GET/POST | KB space management |
| `/api/search/federated` | POST | Federated search |
| `/api/workflows/execute` | POST/GET | Workflow execution |
| `/api/workflows/webhook/[id]` | POST | Webhook triggers |
| `/api/workflows/scheduled` | POST | Cron triggers |
| `/api/admin/stats` | GET | Admin statistics |

---

*Part of Digital Workplace AI Product Suite*
*Location: /Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq*
*Repository: https://github.com/aldrinstellus/digitalworkplace.ai*
*Version: 1.1.1*
*Last Updated: January 22, 2026*
