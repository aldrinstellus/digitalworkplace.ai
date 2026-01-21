# Digital Workplace AI - Session Savepoint

**Last Updated**: 2026-01-21 (dCQ Chat Core IQ v1.0.0 Production Release)
**Version**: 0.7.0
**Session Status**: dCQ fully deployed to Vercel, all systems operational
**Machine**: Mac Mini (aldrin-mac-mini)

---

## ⚠️ CRITICAL: DEFAULT LANDING PAGE

**THE SIGN-IN PAGE IS THE DEFAULT LANDING PAGE FOR DIGITAL WORKPLACE AI.**

| URL | What Happens |
|-----|--------------|
| `http://localhost:3000` | **REDIRECTS** → `/sign-in` (if not logged in) |
| `http://localhost:3000` | **REDIRECTS** → `/dashboard` (if logged in) |
| `http://localhost:3000/sign-in` | **DEFAULT LANDING PAGE** - This is what users see first |

**Code Location**: `apps/main/src/app/page.tsx`
**There is NO separate landing page. Root URL (`/`) always redirects.**

*Triple verified on 2026-01-19*

---

## 🔗 Complete URL Reference

### Production & Deployment
| Service | URL |
|---------|-----|
| **Production App** | https://digitalworkplace-ai.vercel.app |
| **Production Sign-in** | https://digitalworkplace-ai.vercel.app/sign-in |
| **Production Dashboard** | https://digitalworkplace-ai.vercel.app/dashboard |
| **Production Admin** | https://digitalworkplace-ai.vercel.app/admin |
| **Vercel Dashboard** | https://vercel.com/aldrinstellus/digitalworkplace-ai |
| **GitHub Repository** | https://github.com/aldrinstellus/digitalworkplace.ai |

### Local Development URLs

#### Main Dashboard (Port 3000)
| Page | URL | Notes |
|------|-----|-------|
| **Root (/)** | http://localhost:3000 | **REDIRECTS** to sign-in or dashboard |
| **Sign-in (DEFAULT)** | http://localhost:3000/sign-in | **DEFAULT LANDING PAGE** |
| **Sign-up** | http://localhost:3000/sign-up | |
| **SSO Callback** | http://localhost:3000/sso-callback | |
| **Dashboard** | http://localhost:3000/dashboard | Protected - requires auth |
| **Admin Panel** | http://localhost:3000/admin | super_admin only |

#### dIQ - Intranet IQ (Port 3001)
| Page | URL |
|------|-----|
| **dIQ Dashboard** | http://localhost:3001/diq/dashboard |
| **dIQ Chat** | http://localhost:3001/diq/chat |
| **dIQ Search** | http://localhost:3001/diq/search |
| **dIQ People** | http://localhost:3001/diq/people |
| **dIQ Content** | http://localhost:3001/diq/content |
| **dIQ Agents** | http://localhost:3001/diq/agents |
| **dIQ Settings** | http://localhost:3001/diq/settings |

#### dCQ - Chat Core IQ (Port 3002) - PRODUCTION LIVE
| Page | Local URL | Production URL |
|------|-----------|----------------|
| **dCQ Home** | http://localhost:3002/dcq/Home/index.html | https://chat-core-iq.vercel.app/dcq/Home/index.html |
| **dCQ Admin** | http://localhost:3002/dcq/admin | https://chat-core-iq.vercel.app/dcq/admin |
| **dCQ Vercel Dashboard** | - | https://vercel.com/aldos-projects-8cf34b67/chat-core-iq |

#### dSQ - Support IQ (Port 3003) - ACTIVE
| Page | URL |
|------|-----|
| **dSQ Demo (ATC)** | http://localhost:3003/demo/atc-executive |
| **dSQ Demo (Government)** | http://localhost:3003/demo/cor |
| **dSQ Demo (Project)** | http://localhost:3003/demo/project-manager |
| **dSQ Health** | http://localhost:3003/api/health |
| **dSQ Production** | https://support-iq-pearl.vercel.app |

#### dTQ - Test Pilot IQ (Port 3004) - PENDING
| Page | URL |
|------|-----|
| **dTQ Dashboard** | http://localhost:3004/dtq/dashboard |

### Tech Stack Dashboards
| Service | Dashboard URL |
|---------|---------------|
| **Clerk** | https://dashboard.clerk.com |
| **Supabase** | https://supabase.com/dashboard |
| **Vercel** | https://vercel.com/dashboard |
| **GitHub** | https://github.com |

---

## 📁 Local File System Paths (Mac Mini)

### Project Root
```
/Users/aldrin-mac-mini/digitalworkplace.ai
```

### Key Documentation Files
| File | Full Path |
|------|-----------|
| **SAVEPOINT.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/SAVEPOINT.md` |
| **CLAUDE.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/CLAUDE.md` |
| **CHANGELOG.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/CHANGELOG.md` |
| **context.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/context.md` |
| **SUPABASE_DATABASE_REFERENCE.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md` |
| **PGVECTOR_BEST_PRACTICES.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/docs/PGVECTOR_BEST_PRACTICES.md` |
| **EMBEDDING_QUICKSTART.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/docs/EMBEDDING_QUICKSTART.md` |

### Monorepo Structure
```
digitalworkplace.ai/
├── apps/
│   ├── main/                    # Main dashboard (port 3000)
│   │   ├── CLAUDE.md
│   │   └── src/
│   ├── intranet-iq/             # dIQ (port 3001)
│   │   ├── CLAUDE.md
│   │   ├── SAVEPOINT.md
│   │   └── src/
│   ├── chat-core-iq/            # dCQ (port 3002)
│   │   ├── CLAUDE.md
│   │   └── src/
│   ├── support-iq/              # dSQ (port 3003) - PENDING
│   │   └── CLAUDE.md
│   └── test-pilot-iq/           # dTQ (port 3004) - PENDING
│       └── CLAUDE.md
├── docs/
│   ├── SUPABASE_DATABASE_REFERENCE.md  # MASTER DATABASE
│   ├── PGVECTOR_BEST_PRACTICES.md
│   └── EMBEDDING_QUICKSTART.md
├── supabase/
│   └── migrations/
│       ├── 001_core_schema.sql
│       ├── 002_diq_schema.sql
│       ├── 003_pgvector_embeddings.sql
│       └── 004_dsq_schema.sql
├── CLAUDE.md
├── SAVEPOINT.md
├── CHANGELOG.md
├── context.md
└── package.json
```

---

## Current State

### What's Working

#### Main Dashboard (apps/main)
- [x] Next.js 16 project with App Router
- [x] Clerk authentication (Google OAuth)
- [x] Clerk proxy for route protection (proxy.ts)
- [x] Custom favicon "d." branding
- [x] Full-screen world map login design
- [x] Dark grey theme (#0f0f1a, #1a1a2e, #16213e)
- [x] 24 floating avatars with GSAP animations
- [x] Sound effects system (Web Audio API)
- [x] Dashboard with 4 AI product cards
- [x] **Product order: Support IQ, Intranet IQ, Chat Core IQ, Test Pilot IQ**
- [x] **Test Pilot IQ disabled (gray, "Coming Soon")**
- [x] Animated SVG illustrations (continuous looping)
- [x] 3D tilt effects on product cards
- [x] Admin panel (super_admin only)
- [x] User role system (Supabase)
- [x] Deployed on Vercel

#### dIQ - Intranet IQ (apps/intranet-iq) - v0.2.7
- [x] Complete UI with all 12 pages verified
- [x] Supabase database schema (`diq`)
- [x] **pgvector Semantic Search** - 100% embedding coverage
- [x] `/api/embeddings` - Generate embeddings
- [x] `/api/search` - Hybrid search (semantic + keyword)
- [x] Chat with RAG (Retrieval Augmented Generation)
- [x] Local embeddings (all-MiniLM-L6-v2, 384 dims)
- [x] **Cross-Schema API Routes** (v0.2.7):
  - `/api/dashboard` - News + events with user joins
  - `/api/workflows` - Workflows with creator + steps
  - `/api/people` - Employees with departments
  - `/api/content` - Articles with authors
- [x] **Enterprise Data Populated**: 60 users, 15 depts, 212 articles, 31 workflows
- [x] **Production**: https://intranet-iq.vercel.app

#### dCQ - Chat Core IQ (apps/chat-core-iq) - v1.0.0 PRODUCTION
- [x] **Production Live**: https://chat-core-iq.vercel.app
- [x] AI Chat with Claude (primary) + OpenAI (fallback)
- [x] **348 knowledge items** with 100% vector embedding coverage
- [x] 11 API endpoints all operational
- [x] 7 Vercel environment variables configured
- [x] Dashboard linked to Vercel production URL
- [x] Full spectrum analysis verified

#### Database (Supabase)
- [x] Multi-schema architecture (public, diq, dsq, dtq, dcq)
- [x] Master database reference document
- [x] pgvector extension enabled
- [x] HNSW indexes for fast vector search
- [x] Cross-project search hub (`public.knowledge_items`)

### Products Status

| Product | Code | Port | Status | Embeddings | Production URL |
|---------|------|------|--------|------------|----------------|
| **Support IQ** | **dSQ** | **3003** | **✅ Active** | **✅ 100%** | https://support-iq-pearl.vercel.app |
| **Intranet IQ** | **dIQ** | **3001** | **✅ Active** | **✅ 100%** | https://intranet-iq.vercel.app |
| **Chat Core IQ** | **dCQ** | **3002** | **✅ LIVE** | **✅ 100%** | https://chat-core-iq.vercel.app |
| Test Pilot IQ | dTQ | 3004 | ⬜ Pending (Disabled in UI) | ⬜ Pending | - |

---

## 🚀 Quick Start Commands

### Start All Projects
```bash
cd /Users/aldrin-mac-mini/digitalworkplace.ai
npm run dev              # Start main app (port 3000)
npm run dev:intranet     # Start dIQ (port 3001)
npm run dev:chatcore     # Start dCQ (port 3002)
```

### Test the Complete Flow
1. Open http://localhost:3000/sign-in
2. Click "Continue with Google"
3. Complete OAuth → Redirects to Dashboard
4. See 4 product cards (Test Pilot IQ is grayed out)
5. Click "Launch App" on any active product
6. Click avatar for dropdown menu
7. Click Admin (if super_admin) to access admin panel

---

## Git Status

### Pending Changes
```
Modified files:
- CLAUDE.md
- SAVEPOINT.md
- CHANGELOG.md
- apps/intranet-iq/* (semantic search updates)
- apps/main/src/app/dashboard/page.tsx (product order + disabled state)
- package.json (workspace scripts)

New files:
- apps/chat-core-iq/
- apps/support-iq/
- apps/test-pilot-iq/
- apps/main/CLAUDE.md
- docs/SUPABASE_DATABASE_REFERENCE.md
- docs/PGVECTOR_BEST_PRACTICES.md
- docs/EMBEDDING_QUICKSTART.md
- supabase/migrations/003_pgvector_embeddings.sql
- supabase/migrations/004_dsq_schema.sql
```

### Commands
```bash
cd /Users/aldrin-mac-mini/digitalworkplace.ai
git status
git add .
git commit -m "feat: v0.5.0 - monorepo architecture + semantic search + multi-project"
git push origin main
```

---

## Tech Stack Summary

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16 | React framework with App Router |
| **TypeScript** | 5.x | Type safety |
| **Clerk** | @clerk/nextjs | Authentication (Google OAuth) |
| **Supabase** | @supabase/supabase-js | Database & user roles |
| **pgvector** | 0.7+ | Vector similarity search |
| **Tailwind CSS** | 4.x | Styling |
| **Framer Motion** | 12.x | UI animations |
| **GSAP** | 3.x | Complex animations |
| **transformers.js** | @xenova/transformers | Local embeddings |

---

## Embedding Configuration

```typescript
// All projects use OpenAI text-embedding-3-small
{
  model: 'text-embedding-3-small',
  dimensions: 1536,
  provider: 'OpenAI API',
  cost: '$0.02 per 1M tokens'
}
```

**Migration from Xenova/transformers.js to OpenAI completed on 2026-01-19.**

---

## Environment Variables Required

### .env.local (All Projects)
```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

---

## Pending Tasks

### Completed (v0.6.1)
- [x] Dashboard product order updated
- [x] Test Pilot IQ disabled in UI
- [x] Sign-in page as default landing page (all redirects fixed)
- [x] WordmarkGlitch animation: chaotic scramble with 75% stable display
- [x] OpenAI text-embedding-3-small migration (dIQ, dCQ)
- [x] **dSQ (Support IQ) fully implemented and deployed**
- [x] **dSQ FloatingModeSwitcher (top-right dropdown with animations)**
- [x] **dSQ Supabase schema with 15 tables, 100% embedding coverage**
- [x] **dSQ GitHub repo: aldrinstellus/support-iq**
- [x] **dSQ Vercel: https://support-iq-pearl.vercel.app**
- [x] **dIQ (Intranet IQ) v0.2.7 - Full Spectrum Analysis**
- [x] **dIQ Cross-schema API routes for PostgREST limitations**
- [x] **dIQ Enterprise data: 60 users, 212 articles, 31 workflows**
- [x] **dIQ Hydration error fix (ChatSpaces.tsx)**
- [x] **dIQ Vercel: https://intranet-iq.vercel.app**
- [x] Git commit and push
- [x] Vercel deployment (both main + dIQ)

### Short Term
- [ ] dTQ (Test Pilot IQ) implementation
- [ ] Cross-project search UI

### Medium Term
- [ ] User profile page
- [ ] Settings page
- [ ] Real-time collaboration

---

## Session Resume Checklist

When starting a new Claude Code session:

1. **Read the savepoint**
   ```bash
   cat /Users/aldrin-mac-mini/digitalworkplace.ai/SAVEPOINT.md
   ```

2. **Read master database reference**
   ```bash
   cat /Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md
   ```

3. **Start dev server**
   ```bash
   cd /Users/aldrin-mac-mini/digitalworkplace.ai
   npm run dev
   ```

4. **Verify working locally**
   - http://localhost:3000/sign-in
   - http://localhost:3000/dashboard
   - http://localhost:3000/admin

5. **Reference documentation**
   - `/Users/aldrin-mac-mini/digitalworkplace.ai/CLAUDE.md`
   - `/Users/aldrin-mac-mini/digitalworkplace.ai/context.md`
   - `/Users/aldrin-mac-mini/digitalworkplace.ai/CHANGELOG.md`

---

## Design System Reference

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Background Dark | #0f0f1a | Main background |
| Background Mid | #1a1a2e | Cards, overlays |
| Background Light | #16213e | Borders, accents |
| Green Accent | #4ade80 | .ai, indicators |
| Mint Green | rgba(134, 239, 172, 0.7) | Chat bubbles |

### Product Theme Colors
| Product | Primary | Secondary | Status |
|---------|---------|-----------|--------|
| Support IQ | #10b981 | #06b6d4 | Active |
| Intranet IQ | #3b82f6 | #8b5cf6 | Active |
| Chat Core IQ | #a855f7 | #ec4899 | Active |
| Test Pilot IQ | #f59e0b | #ef4444 | Disabled (Gray) |

### Responsive Breakpoints
| Breakpoint | Width | Grid Columns |
|------------|-------|--------------|
| Mobile | <640px | 1 |
| Tablet | 640-1024px | 2 |
| Desktop | >1024px | 4 |

---

*Last session ended at: 2026-01-21*
*Machine: Mac Mini (aldrin-mac-mini)*
*Version: 0.7.0 - dCQ Chat Core IQ v1.0.0 Production Release*
