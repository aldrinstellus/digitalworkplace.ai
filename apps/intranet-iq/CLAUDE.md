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

### Brand Identity
- **Logo:** Bold "d" + regular "IQ" + blue dot (all on same baseline)
- **Favicon:** "d." with green dot on dark background
- **Page Title:** "dIQ - Intranet IQ"
- **Color Theme:** Blue-to-purple gradient (#3b82f6 → #8b5cf6)

### Core Features
- Enterprise Search (Elasticsearch-based)
- AI Assistant (Multi-LLM support: GPT-4, Claude, Custom)
- Knowledge Base Management
- Employee Experience (Org Charts, People Directory)
- Custom Agentic Workflows
- Role-based Access Control

---
## dIQ LOGO STANDARD (Official)
---

### Visual Specification
```
    d I Q ·
    ↑ ↑ ↑ ↑
    │ │ │ └── Blue dot (#60a5fa)
    │ │ └──── Q (regular weight, 85% opacity)
    │ └────── I (regular weight, 85% opacity)
    └──────── d (bold weight, 100% opacity)

    ALL CHARACTERS ON SAME BASELINE
```

### Technical Implementation
```jsx
// SVG-based for pixel-perfect alignment
<svg height="18" viewBox="0 0 32 18">
  <text x="0" y="14" fill="white" fontSize="18" fontWeight="700">d</text>
  <text x="11" y="14" fill="white" fillOpacity="0.85" fontSize="10" fontWeight="400">I</text>
  <text x="16.5" y="14" fill="white" fillOpacity="0.85" fontSize="10" fontWeight="400">Q</text>
  <circle cx="27" cy="13" r="2.5" fill="#60a5fa" />
</svg>
```

### Font Stack
```css
font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace;
```

### Size Variants
| Size | d font | IQ font | Dot radius | Container |
|------|--------|---------|------------|-----------|
| sm   | 16px   | 9px     | 2px        | h-7       |
| md   | 20px   | 11px    | 2.5px      | h-8       |
| lg   | 26px   | 14px    | 3px        | h-10      |
| xl   | 32px   | 17px    | 3.5px      | h-12      |

### Logo Component Usage
```tsx
import { IQLogo, IQMark } from "@/components/brand/IQLogo";

// Full logo with gradient background (sidebar, headers)
<IQLogo size="md" />

// With text label
<IQLogo size="lg" showText />

// Compact version
<IQMark />
```

---
## QUICK REFERENCE URLS
---

| Page | Route | Local Dev |
|------|-------|-----------|
| **Dashboard** | `/diq/dashboard` | http://localhost:3001/diq/dashboard |
| **Chat** | `/diq/chat` | http://localhost:3001/diq/chat |
| **Search** | `/diq/search` | http://localhost:3001/diq/search |
| **People** | `/diq/people` | http://localhost:3001/diq/people |
| **Content** | `/diq/content` | http://localhost:3001/diq/content |
| **Agents** | `/diq/agents` | http://localhost:3001/diq/agents |
| **Settings** | `/diq/settings` | http://localhost:3001/diq/settings |
| **Main App** | - | http://localhost:3000/dashboard |

**Note:** All routes use `basePath: "/diq"` configured in `next.config.ts`

---
## TECH STACK
---

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.3 | React framework with App Router |
| **TypeScript** | 5.x | Type safety |
| **Clerk** | @clerk/nextjs | Authentication (shared with main app) |
| **Supabase** | @supabase/supabase-js | Database & user roles |
| **Tailwind CSS** | 4.x | Styling |
| **Framer Motion** | 12.x | UI animations |
| **Lucide React** | 0.562.x | Icons |

---
## PROJECT STRUCTURE
---

```
apps/intranet-iq/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + metadata
│   │   ├── page.tsx            # Redirects to /dashboard
│   │   ├── globals.css         # Global styles (blue theme)
│   │   ├── icon.tsx            # Dynamic favicon "d."
│   │   ├── apple-icon.tsx      # Apple touch icon
│   │   ├── dashboard/page.tsx  # Main dashboard
│   │   ├── chat/page.tsx       # AI Assistant
│   │   ├── search/page.tsx     # Enterprise Search
│   │   ├── people/page.tsx     # Org Chart & Directory
│   │   ├── content/page.tsx    # Knowledge Base
│   │   ├── agents/page.tsx     # Workflow Automation
│   │   └── settings/page.tsx   # User/Admin Settings
│   ├── components/
│   │   ├── brand/
│   │   │   └── IQLogo.tsx      # dIQ logo (SVG-based)
│   │   └── layout/
│   │       └── Sidebar.tsx     # Navigation sidebar
│   └── lib/
│       └── utils.ts            # Utility functions (cn)
├── public/                     # Static assets
├── reference-docs/             # PRD & design references
├── package.json
├── tsconfig.json
├── next.config.ts              # basePath: "/diq"
├── CLAUDE.md                   # This file
├── context.md                  # Design specs
├── SAVEPOINT.md                # Session state
└── CHANGELOG.md                # Version history
```

---
## PAGES IMPLEMENTED
---

| Page | Features |
|------|----------|
| **Dashboard** | dIQ badge (SVG), search bar, quick actions, activity feed, trending topics |
| **Chat** | Threaded chat, LLM selector, source citations, confidence scores |
| **Search** | AI summary, filters, result cards with relevance scores |
| **People** | Grid/list/tree views, employee profiles, department filtering |
| **Content** | Tree navigation, article editor, version history |
| **Agents** | Visual workflow steps, templates modal, status indicators |
| **Settings** | Profile, notifications, appearance, privacy, admin sections |

---
## DESIGN SYSTEM
---

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Background Dark | #0a0a0f | Main background |
| Background Card | #0f0f14 | Cards, sidebar |
| Background Input | #1a1a1f | Input fields |
| Border | rgba(255,255,255,0.1) | Borders |
| Primary Blue | #3b82f6 | Primary accent |
| Secondary Purple | #8b5cf6 | Secondary accent |
| Accent Cyan | #06b6d4 | Highlights |
| Logo Dot | #60a5fa | Blue dot in logo |

### Navigation
- **Sidebar Width:** 64px (collapsed)
- **Icons:** Lucide React
- **Active State:** Blue gradient bg + left indicator bar

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

# URLs after starting dev server
# Main App: http://localhost:3000
# dIQ:      http://localhost:3001/diq/dashboard
```

---
## COMMON TASKS
---

### Adding a new page
1. Create folder in `src/app/[page-name]/`
2. Add `page.tsx` with component
3. Update `Sidebar.tsx` navigation if needed
4. Add route to CLAUDE.md reference URLs

### Using the dIQ Logo
```tsx
import { IQLogo, IQMark } from "@/components/brand/IQLogo";

// Full logo (sidebar, headers)
<IQLogo size="md" />

// With text
<IQLogo size="lg" showText />

// Compact mark
<IQMark />
```

### Adding a component
1. Create in `src/components/[category]/`
2. Use existing patterns from brand/IQLogo.tsx
3. Import with `@/components/...`

---
## INTEGRATION WITH MAIN APP
---

- **Authentication:** Shared Clerk instance
- **Database:** Shared Supabase
- **Port:** 3001 (main app on 3000)
- **Identity:** Standalone dIQ branding
- **Routing:** Main app links to `http://localhost:3001/diq/dashboard`

---
## SESSION END PROTOCOL
---

**Before ending session:**
1. Update SAVEPOINT.md with current state
2. Update CHANGELOG.md if version changed
3. Update context.md if design specs changed
4. Commit changes to git (if requested)

**User Checklist:**
```
[ ] SAVEPOINT.md updated
[ ] Git changes committed (if any)
[ ] Dev server: Ctrl+C to stop
```

---

---
## ELASTICSEARCH INTEGRATION
---

### Overview
dIQ uses Elasticsearch 8.x for enterprise-grade full-text search with the following capabilities:
- Real-time and batch indexing
- Hybrid search (keyword + semantic with OpenAI embeddings)
- Autocomplete suggestions
- Faceted search with aggregations
- Highlighted search results

### Quick Start
```bash
# Start Elasticsearch (requires Docker)
cd /Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq
docker compose -f docker-compose.elasticsearch.yml up -d

# Access Elasticsearch: http://localhost:9200
# Access Kibana: http://localhost:5601
```

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/elasticsearch/search` | POST | Search with keyword/semantic/hybrid |
| `/api/elasticsearch/search` | GET | Autocomplete suggestions |
| `/api/elasticsearch/index` | GET | Index status and stats |
| `/api/elasticsearch/index` | POST | Index operations |

### Indexing Operations
```bash
# Create index
curl -X POST http://localhost:3001/diq/api/elasticsearch/index \
  -H "Content-Type: application/json" \
  -d '{"action": "create-index"}'

# Full sync from Supabase
curl -X POST http://localhost:3001/diq/api/elasticsearch/index \
  -H "Content-Type: application/json" \
  -d '{"action": "full-sync"}'

# Generate demo data (100-500 items)
curl -X POST http://localhost:3001/diq/api/elasticsearch/index \
  -H "Content-Type: application/json" \
  -d '{"action": "generate-demo", "options": {"count": 200}}'
```

### Key Files
```
apps/intranet-iq/
├── docker-compose.elasticsearch.yml  # ES + Kibana Docker config
├── docs/ELASTICSEARCH_SETUP.md       # Full setup guide
├── src/lib/
│   ├── elasticsearch.ts              # ES client + search functions
│   └── elasticsearch-indexer.ts      # Content sync from Supabase
└── src/app/api/elasticsearch/
    ├── search/route.ts               # Search & autocomplete API
    └── index/route.ts                # Index management API
```

### Environment Variables
```env
ELASTICSEARCH_URL=http://localhost:9200  # ES server URL
ELASTICSEARCH_INDEX=diq-content          # Index name
ELASTICSEARCH_API_KEY=                   # Optional: for Elastic Cloud
```

---
## DATABASE ARCHITECTURE
---

### Supabase Multi-Schema Structure
```
public schema (shared)     diq schema (project-specific)
├── organizations          ├── departments
├── projects               ├── employees
├── users                  ├── kb_categories
├── user_project_access    ├── articles
├── knowledge_items        ├── article_versions
└── activity_log           ├── chat_threads
                           ├── chat_messages
                           ├── search_history
                           ├── workflows
                           ├── workflow_steps
                           ├── workflow_executions
                           ├── news_posts
                           ├── news_comments
                           ├── events
                           ├── event_rsvps
                           ├── bookmarks
                           └── user_settings
```

### Key Files
```
supabase/migrations/
├── 001_core_schema.sql           # Shared tables
├── 002_diq_schema.sql            # dIQ-specific tables
└── 003_pgvector_embeddings.sql   # pgvector semantic search

apps/intranet-iq/src/lib/
├── database.types.ts             # TypeScript types
├── supabase.ts                   # Client + helpers
└── hooks/useSupabase.ts          # React data hooks

docs/DATABASE_ARCHITECTURE.md     # Full documentation
```

### Cross-Project Search
```typescript
import { searchKnowledge } from '@/lib/supabase';

// Search across all projects
const { data } = await searchKnowledge('quarterly report', {
  projectCodes: ['dIQ', 'dSQ'],
  itemTypes: ['article', 'document'],
  maxResults: 20
});
```

### Helper Functions Available
```typescript
// Articles
getArticles(options)
getArticleBySlug(slug)
searchArticles(query, options)

// Chat
getChatThreads(userId)
getChatMessages(threadId)
createChatThread(userId, title, llmModel)
addChatMessage(threadId, role, content, options)

// People
getEmployees(options)
getOrgChart(departmentId)
getDepartments()

// Workflows
getWorkflows(options)
getWorkflowWithSteps(workflowId)

// Content
getKBCategories(departmentId)
getNewsPosts(options)
getUpcomingEvents(options)

// User
getUserBookmarks(userId, itemType)
getUserSettings(userId)
updateUserSettings(userId, settings)

// Activity
logActivity(userId, action, options)

// Semantic Search (pgvector)
searchKnowledgeSemantic(queryEmbedding, options)      // Vector similarity search
searchKnowledgeHybrid(searchQuery, queryEmbedding, options)  // Keyword + vector
searchArticlesSemantic(queryEmbedding, options)       // Article semantic search
findSimilarArticles(articleId, matchCount)            // Find similar content
getChatContext(queryEmbedding, options)               // RAG context for AI chat
getEmbeddingStats()                                   // Embedding coverage stats
```

---

*Part of Digital Workplace AI Product Suite*
*Location: /Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq*
*Version: 0.2.4*
