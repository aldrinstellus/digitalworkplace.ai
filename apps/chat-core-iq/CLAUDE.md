# Chat Core IQ (dCQ) - Claude Code Instructions

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

**Chat Core IQ (dCQ)** is an AI-powered chatbot platform - part of the Digital Workplace AI product suite. Cloned from City of Doral project with full chatbot and admin functionality.

### URLs
| Page | Route | Local Dev |
|------|-------|-----------|
| **Homepage (Static)** | `/dcq/Home/index.html` | http://localhost:3002/dcq/Home/index.html |
| **Admin** | `/dcq/admin` | http://localhost:3002/dcq/admin |
| **Admin Content** | `/dcq/admin/content` | http://localhost:3002/dcq/admin/content |
| **Demo IVR** | `/dcq/demo/ivr` | http://localhost:3002/dcq/demo/ivr |
| **Main App** | - | http://localhost:3000/dashboard |

**Note:** All routes use `basePath: "/dcq"` configured in `next.config.ts`

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

- **AI Chatbot**: Conversational interface with Claude/OpenAI integration
- **FAQ Widget**: Homepage displays FAQs from admin portal
- **Admin Portal**: Full CRUD for FAQs, knowledge base, announcements
- **Multi-language**: English/Spanish support
- **Demo IVR**: Interactive Voice Response demo

---
## TECH STACK
---

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | React framework with App Router |
| **TypeScript** | 5.x | Type safety |
| **Supabase** | @supabase/supabase-js | Database |
| **Tailwind CSS** | 4.x | Styling |
| **Framer Motion** | 12.x | UI animations |
| **Anthropic SDK** | 0.71.x | Claude AI integration |
| **OpenAI SDK** | 6.x | GPT integration |

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
├── start.sh                    # Alternative: dual-server startup script
└── CLAUDE.md                   # This file
```

---
## INTEGRATION WITH MAIN APP
---

- **Port:** 3002 (main app on 3000, intranet-iq on 3001)
- **BasePath:** /dcq
- **Dashboard Link:** Main app dashboard links to http://localhost:3002/dcq/Home/index.html
- **Identity:** Standalone Chat Core IQ branding

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
