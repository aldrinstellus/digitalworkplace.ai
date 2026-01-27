# Chat Core IQ (dCQ) - Claude Code Instructions

**Version**: 1.0.3
**Last Updated**: 2026-01-27
**Status**: Production Live - Full Spectrum Audit PASSED (100/100)
**Audit Report**: FULL_SPECTRUM_AUDIT_REPORT.md
**Cache Prevention**: ✅ Configured (no-store, must-revalidate)

---
## PRODUCTION URLS
---

| Environment | URL |
|-------------|-----|
| **Production Homepage** | https://dcq.digitalworkplace.ai/dcq/Home/index.html |
| **Production Admin** | https://dcq.digitalworkplace.ai/dcq/admin |
| **Vercel Dashboard** | https://vercel.com/aldos-projects-8cf34b67/chat-core-iq |
| **GitHub Repository** | https://github.com/aldrinstellus/digitalworkplace.ai |

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
1. /Users/aldrin-mac-mini/digitalworkplace.ai/apps/chat-core-iq/CLAUDE.md (This file)
2. /Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md (MASTER DB - all projects)
3. /Users/aldrin-mac-mini/digitalworkplace.ai/docs/PGVECTOR_BEST_PRACTICES.md (Semantic search)
```

**THEN:**
- Open browser to: http://localhost:3002/dcq/Home/index.html
- Check if dev server is running

---
## PROJECT OVERVIEW
---

**Chat Core IQ (dCQ)** is an AI-powered chatbot platform - part of the Digital Workplace AI product suite. Features Claude/OpenAI LLM integration with semantic search and 100% vector embedding coverage.

### URLs
| Page | Local Dev | Production |
|------|-----------|------------|
| **Homepage** | http://localhost:3002/dcq/Home/index.html | https://dcq.digitalworkplace.ai/dcq/Home/index.html |
| **Admin** | http://localhost:3002/dcq/admin | https://dcq.digitalworkplace.ai/dcq/admin |
| **Admin Content** | http://localhost:3002/dcq/admin/content | https://dcq.digitalworkplace.ai/dcq/admin/content |
| **Demo IVR** | http://localhost:3002/dcq/demo/ivr | https://dcq.digitalworkplace.ai/dcq/demo/ivr |

**Note:** All routes use `basePath: "/dcq"` configured in `next.config.ts`

---
## GLOBAL STANDARDS REFERENCE
---

**IMPORTANT**: This app follows global standards for Digital Workplace AI:

### Query Detection Standards
**Canonical Document**: `/docs/QUERY_DETECTION_STANDARDS.md`

| Standard | Value |
|----------|-------|
| Match Threshold | 0.50 (50%) minimum |
| Compound Words | 75+ domain-specific phrases |
| Key Terms | Bonus/penalty system |
| Stop Words | KEEP action words (show, me, my) |

### Semantic Search
- **Method**: Real OpenAI embeddings (text-embedding-3-small)
- **Dimensions**: 1536
- **Status**: Production ready

### References
- Full Standards: `/docs/QUERY_DETECTION_STANDARDS.md`
- Root Instructions: `/CLAUDE.md` → "GLOBAL STANDARDS"
- Vector Practices: `/docs/PGVECTOR_BEST_PRACTICES.md`

### Cache Prevention (v1.0.3 - CRITICAL)

**Permanent cache-busting is configured to prevent stale deployments.**

```typescript
// next.config.ts
generateBuildId: async () => {
  return `build-${Date.now()}`;
},

async headers() {
  return [{
    source: '/((?!_next/static|_next/image|favicon.ico).*)',
    headers: [
      { key: 'Cache-Control', value: 'no-store, must-revalidate' },
    ],
  }];
}
```

**What This Prevents:**
- Stale JavaScript after deployments
- Browser showing old content after code changes
- Need for users to hard-refresh manually

**Full Documentation:** `/docs/QUERY_DETECTION_STANDARDS.md` (Section 10)

---
## QUICK START
---

```bash
# From monorepo root
cd /Users/aldrin-mac-mini/digitalworkplace.ai
npm run dev:chatcore     # Start Chat Core IQ on port 3002

# From apps/chat-core-iq/
npm run dev              # Start dev server (port 3002)
npm run build            # Production build
npm run lint             # Run ESLint
```

**Primary URL:** http://localhost:3002/dcq/Home/index.html (static site with chatbot)

---
## KEY FEATURES
---

- **AI Chatbot**: Claude (primary) + OpenAI (fallback) LLM integration
- **Semantic Search**: 348 knowledge items with 100% vector embedding coverage (7 FAQs)
- **FAQ Widget**: Homepage displays FAQs from admin portal
- **Admin Portal**: Full CRUD for FAQs, knowledge base, announcements
- **Multi-language**: English/Spanish/Haitian Creole support (EN/ES/HT)
- **Demo IVR**: Interactive Voice Response demo

---
## TECH STACK
---

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | React framework with App Router |
| **TypeScript** | 5.x | Type safety |
| **Supabase** | @supabase/supabase-js | Database + pgvector |
| **Tailwind CSS** | 4.x | Styling |
| **Framer Motion** | 12.x | UI animations |
| **Anthropic SDK** | 0.71.x | Claude AI integration |
| **OpenAI SDK** | 6.x | GPT integration + embeddings |
| **Transformers.js** | - | Local embeddings (all-MiniLM-L6-v2) |

---
## ENVIRONMENT VARIABLES
---

### Local (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://fhtempgkltrazrgbedrh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
ANTHROPIC_API_KEY=<your-anthropic-key>
OPENAI_API_KEY=<your-openai-key>
ELEVENLABS_API_KEY=<your-elevenlabs-key>
NEXT_PUBLIC_BASE_URL=http://localhost:3002/dcq
```

### Vercel Production
All 7 environment variables configured:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_PUBLISHABLE_KEY`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `NEXT_PUBLIC_BASE_URL` (https://dcq.digitalworkplace.ai/dcq)

---
## PROJECT STRUCTURE
---

```
apps/chat-core-iq/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Redirects to /homepage
│   │   ├── homepage/page.tsx   # Main chatbot interface
│   │   ├── globals.css         # Global styles
│   │   ├── admin/              # Admin panel pages
│   │   ├── api/                # API routes (chat, faqs, etc.)
│   │   └── demo/ivr/           # IVR demo page
│   ├── components/             # UI components
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom hooks
│   └── lib/                    # Utilities & configs
├── data/                       # JSON data files
├── public/                     # Static assets + Home/index.html
│   ├── Home/index.html         # Main static homepage with chatbot
│   ├── chat-widget.js          # Chatbot widget
│   ├── faq-widget.js           # FAQ accordion widget
│   └── announcements-widget.js # Announcements banner
├── package.json
├── tsconfig.json
├── next.config.ts              # basePath: "/dcq", port: 3002
└── CLAUDE.md                   # This file
```

---
## API ENDPOINTS
---

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/chat` | POST | AI chat with semantic search |
| `/api/faqs` | GET/POST | FAQ management |
| `/api/knowledge` | GET | Knowledge base items |
| `/api/settings` | GET/PATCH | App settings |
| `/api/announcements` | GET | Announcements |
| `/api/analytics` | GET | Usage analytics |
| `/api/embeddings` | POST | Generate embeddings |
| `/api/feedback` | POST | User feedback |
| `/api/escalations` | GET/POST | Escalation management |

---
## INTEGRATION WITH MAIN APP
---

- **Port:** 3002 (main app on 3000, intranet-iq on 3001)
- **BasePath:** /dcq
- **Dashboard Link:** https://dcq.digitalworkplace.ai/dcq/Home/index.html
- **Identity:** Standalone Chat Core IQ branding

---
## DEPLOYMENT
---

### Vercel
```bash
# Deploy to production
vercel --prod

# Check logs
vercel logs chat-core-iq.vercel.app

# List env vars
vercel env ls production
```

### GitHub
```bash
git add .
git commit -m "Your message"
git push origin main
```

---
## DEVELOPMENT COMMANDS
---

```bash
# From monorepo root (/Users/aldrin-mac-mini/digitalworkplace.ai)
npm run dev:chatcore     # Start Chat Core IQ only (port 3002)
npm run build:chatcore   # Build Chat Core IQ

# From apps/chat-core-iq/
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run ESLint
npm run type-check       # TypeScript check
```

---

*Part of Digital Workplace AI Product Suite*
*Location: /Users/aldrin-mac-mini/digitalworkplace.ai/apps/chat-core-iq*
*Port: 3002 | BasePath: /dcq*
*Production: https://dcq.digitalworkplace.ai*
