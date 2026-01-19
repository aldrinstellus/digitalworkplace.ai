# Digital Workplace AI - Main Dashboard | Claude Code Instructions

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
1. /Users/aldrin-mac-mini/digitalworkplace.ai/SAVEPOINT.md (Global state)
2. /Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md (MASTER DB - REQUIRED)
3. /Users/aldrin-mac-mini/digitalworkplace.ai/docs/PGVECTOR_BEST_PRACTICES.md (Semantic search)
4. /Users/aldrin-mac-mini/digitalworkplace.ai/CLAUDE.md (Global instructions)
5. /Users/aldrin-mac-mini/digitalworkplace.ai/apps/main/CLAUDE.md (This file)
```

**THEN:**
- Open browser to: http://localhost:3000/sign-in
- Check if dev server is running

---
## PROJECT OVERVIEW
---

**Main Dashboard** is the central hub for Digital Workplace AI product suite. It provides:
- Google OAuth authentication (Clerk)
- Product card navigation to all sub-projects
- User management and admin panel

### URLs
| Page | Route | Local Dev |
|------|-------|-----------|
| **Sign-in** | `/sign-in` | http://localhost:3000/sign-in |
| **Dashboard** | `/dashboard` | http://localhost:3000/dashboard |
| **Admin** | `/admin` | http://localhost:3000/admin |

---
## DATABASE REFERENCE
---

**IMPORTANT:** All database schemas are defined in the master reference:
```
/Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md
```

This project uses tables from `public` schema:
- `organizations`
- `projects` (dIQ, dSQ, dTQ, dCQ registry)
- `users` (synced from Clerk)
- `user_project_access`
- `knowledge_items` (cross-project search hub)
- `activity_log`
- `integrations`

---
## TECH STACK
---

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | React framework with App Router |
| **TypeScript** | 5.x | Type safety |
| **Clerk** | @clerk/nextjs | Authentication (Google OAuth) |
| **Supabase** | @supabase/supabase-js | Database & user roles |
| **Tailwind CSS** | 4.x | Styling |
| **Framer Motion** | 12.x | UI animations |
| **GSAP** | 3.x | Complex animations |

---
## QUICK START
---

```bash
# From monorepo root
cd /Users/aldrin-mac-mini/digitalworkplace.ai
npm run dev              # Start all apps
npm run dev:main         # Start only main app (port 3000)

# From apps/main/
npm run dev              # Start dev server
npm run build            # Production build
```

---
## SUB-PROJECTS LAUNCHED FROM HERE
---

| Product | Code | Port | Launch URL |
|---------|------|------|------------|
| **Intranet IQ** | dIQ | 3001 | http://localhost:3001/diq/dashboard |
| **Support IQ** | dSQ | 3003 | http://localhost:3003/dsq/dashboard |
| **Test Pilot IQ** | dTQ | 3004 | http://localhost:3004/dtq/dashboard |
| **Chat Core IQ** | dCQ | 3002 | http://localhost:3002/dcq/Home/index.html |

---

*Part of Digital Workplace AI Product Suite*
*Location: /Users/aldrin-mac-mini/digitalworkplace.ai/apps/main*
*Port: 3000*
