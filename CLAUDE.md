# Digital Workplace AI - Claude Code Instructions

---
## ⚠️ CRITICAL: DEFAULT LANDING PAGE (READ FIRST)
---

**THE SIGN-IN PAGE IS THE DEFAULT LANDING PAGE FOR DIGITAL WORKPLACE AI.**

| URL | Behavior |
|-----|----------|
| `http://localhost:3000` | **REDIRECTS** → `/sign-in` (unauthenticated) or `/dashboard` (authenticated) |
| `http://localhost:3000/sign-in` | **DEFAULT LANDING PAGE** - World map with Google OAuth |
| `https://digitalworkplace-ai.vercel.app` | **REDIRECTS** → `/sign-in` (unauthenticated) or `/dashboard` (authenticated) |

**Implementation**: `apps/main/src/app/page.tsx` uses `router.replace("/sign-in")` for unauthenticated users.

**There is NO separate landing/home page. The root URL (`/`) always redirects.**

*Last verified: 2026-01-19*

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
1. /Users/aldrin-mac-mini/digitalworkplace.ai/SAVEPOINT.md  (CURRENT STATE - most important)
2. /Users/aldrin-mac-mini/digitalworkplace.ai/context.md    (Design specs)
3. /Users/aldrin-mac-mini/digitalworkplace.ai/CHANGELOG.md  (Version history)
4. /Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md (MASTER DB - all projects)
5. /Users/aldrin-mac-mini/digitalworkplace.ai/docs/PGVECTOR_BEST_PRACTICES.md (Semantic search standards)
6. /Users/aldrin-mac-mini/digitalworkplace.ai/CLAUDE.md     (This file - already loaded)
```

**THEN:**
- Open Chrome DevTools to: http://localhost:3000/sign-in (default dev page)
- Summarize current state from SAVEPOINT.md
- List any pending tasks

---
## SESSION END PROTOCOL (Before User Closes)
---

**CLAUDE MUST DO THESE BEFORE SESSION ENDS:**
1. Update SAVEPOINT.md with:
   - What was accomplished
   - Any new pending tasks
   - Current git status/commit
   - Update timestamp
2. Update CHANGELOG.md if version changed
3. Update context.md if design specs changed
4. Remind user: "Session docs updated. Ready to close."

**USER CHECKLIST (copy this to user):**
```
Before closing this session:
[ ] SAVEPOINT.md updated with current state
[ ] Git changes committed (if any)
[ ] Dev server can be stopped: Ctrl+C
```

---
## QUICK REFERENCE URLS
---

| Page | Local Dev | Production | Notes |
|------|-----------|------------|-------|
| **Sign-in (DEFAULT)** | http://localhost:3000/sign-in | https://digitalworkplace-ai.vercel.app/sign-in | **THE DEFAULT LANDING PAGE** |
| **Dashboard** | http://localhost:3000/dashboard | https://digitalworkplace-ai.vercel.app/dashboard | Protected - requires auth |
| **Admin** | http://localhost:3000/admin | https://digitalworkplace-ai.vercel.app/admin | super_admin only |
| **Root (/)** | http://localhost:3000 | https://digitalworkplace-ai.vercel.app | **REDIRECTS to sign-in or dashboard** |

**⚠️ DEFAULT PAGE: http://localhost:3000/sign-in**
**Root URL (`/`) is NOT a landing page - it redirects based on auth status.**

---

## Project Overview
Digital Workplace AI is a Next.js 16 application with Clerk authentication and Supabase backend, deployed on Vercel. Features a dark theme with an edgy, tech-forward aesthetic.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Authentication**: Clerk (@clerk/nextjs) - Google OAuth
- **Database**: Supabase
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion, GSAP
- **Audio**: Web Audio API (procedural sound effects)
- **Deployment**: Vercel

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with ClerkProvider
│   ├── page.tsx            # ROOT REDIRECT → /sign-in (unauth) or /dashboard (auth)
│   ├── globals.css         # Global styles
│   ├── sign-in/            # Sign-in page (full-screen layout)
│   │   ├── layout.tsx      # Auth-specific layout (no header)
│   │   └── [[...sign-in]]/
│   │       └── page.tsx    # Minimalistic login page
│   ├── sign-up/            # Sign-up page
│   │   └── [[...sign-up]]/
│   │       └── page.tsx
│   ├── sso-callback/       # OAuth callback handler
│   │   ├── layout.tsx      # SSO callback layout
│   │   └── page.tsx
│   ├── dashboard/          # Main dashboard (protected)
│   │   └── page.tsx        # Product cards with animated SVGs
│   └── admin/              # Admin panel (super_admin only)
│       └── page.tsx        # User management interface
├── components/
│   ├── audio/              # Audio components
│   │   ├── BackgroundMusic.tsx  # Background music player (disabled)
│   │   └── SoundToggle.tsx      # Sound effects toggle (active)
│   ├── brand/              # Brand identity components
│   │   ├── Wordmark.tsx        # Basic animated wordmark
│   │   ├── WordmarkEdgy.tsx    # SVG-based wordmark
│   │   └── WordmarkGlitch.tsx  # Glitch effect wordmark (primary)
│   ├── login/              # Login-related components
│   │   └── LoginBackground.tsx # World map with floating avatars
│   └── ui/                 # shadcn/ui components
│       └── button.tsx      # Button component
├── proxy.ts                # Clerk auth proxy (Next.js 16)
└── lib/
    ├── utils.ts            # Utility functions (cn)
    ├── supabase.ts         # Supabase client configuration
    ├── userRole.ts         # User role management & Clerk sync
    ├── sounds.ts           # Web Audio API sound effects
    └── backgroundMusic.ts  # Procedural music generator (disabled)
```

## Key Files

### Authentication
- `src/proxy.ts` - Clerk auth proxy (server-side route protection)
- `src/app/layout.tsx` - ClerkProvider wrapper
- `src/app/sign-in/[[...sign-in]]/page.tsx` - Google OAuth login ("Continue with Google")
- `src/app/sso-callback/page.tsx` - OAuth redirect handler

### Branding
- `src/app/icon.tsx` - Dynamic favicon (32x32 PNG) - "d." with green dot
- `src/app/apple-icon.tsx` - Apple touch icon (180x180 PNG)

### Dashboard
- `src/app/dashboard/page.tsx` - Main dashboard with:
  - 4 product cards (Support IQ, Intranet IQ, Test Pilot IQ, Chat Core IQ)
  - Animated SVG illustrations for each product
  - 3D tilt effects with Framer Motion
  - Colored borders matching product themes
  - Continuous looping animations
  - User avatar with dropdown menu
  - Super admin badge and link

### User Role System
- `src/lib/userRole.ts` - Supabase user management:
  - `getUserByEmail(email)` - Get user by email
  - `getUserByClerkId(clerkId)` - Get user by Clerk ID
  - `syncUserWithClerk(email, clerkId, fullName?, avatarUrl?)` - Sync Clerk user to Supabase
  - `isSuperAdmin(email)` - Check if user is super admin
  - `isAdmin(email)` - Check if user is admin or super admin
  - `getAllUsers()` - Get all users (for admin)
  - `updateUserRole(userId, role)` - Update user role

### Admin Panel
- `src/app/admin/page.tsx` - Super admin interface:
  - User list with role badges
  - Role assignment dropdown
  - Protected route (super_admin only)

### Login Page Design
- `src/components/login/LoginBackground.tsx` - Full-screen world map with:
  - 24 floating avatar photos positioned across screen
  - Dark grey theme (#0f0f1a, #1a1a2e)
  - GSAP-powered floating animations
  - 15 max concurrent Framer Motion chat bubbles (40% slower speed)
  - Lighter mint-green chat bubbles with 70% opacity
  - Slow bezier-curve green dot animations (7-15s)
  - Pulsing location indicators
  - Connection arc lines
  - Avatar click-to-focus with auto-minimize (2.5s)
  - Sound effects (ambient pulse, data packets, chat bubbles)
  - **Responsive**: Smaller avatars on mobile (44-52px vs 58-68px desktop)
  - **Responsive**: Smaller chat bubbles and labels on mobile

### Audio System
- `src/lib/sounds.ts` - Web Audio API sound effects:
  - `playGlitchSound()` - Digital glitch effect
  - `playDataPacketSound()` - Soft blip for data packets
  - `playAmbientPulse()` - Subtle ambient pad (A minor chord)
  - `playChatBubbleSound()` - Soft pop notification
  - `playConnectionSound()` - Ultra-soft ping
  - Sound enabled by default, respects toggle state
  - **Browser autoplay handling**: Listens for user interaction (click, touch, keydown) to resume AudioContext
  - Sounds auto-play after first user interaction

- `src/components/audio/SoundToggle.tsx` - Toggle button:
  - Fixed top-right position (responsive: smaller on mobile)
  - Three states: "Enable" (initial), "On" (active), "Off" (muted)
  - Pulsing speaker icon before first interaction
  - Green animated bars when ON
  - Muted speaker icon when OFF
  - Text labels hidden on mobile for compact display

### Brand Components
- `src/components/brand/WordmarkGlitch.tsx` - Primary wordmark with:
  - Chromatic aberration (red/cyan split)
  - Variable intensity glitches (every 2.6 seconds)
  - Initial glitch at 500ms after load
  - Double-tap stuttering
  - Horizontal slice distortion
  - Corner bracket decorations
  - Blinking cursor

## Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

## Development Commands
```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment
- Hosted on Vercel
- Auto-deploys on push to `main` branch
- Production URL: https://digitalworkplace-ai.vercel.app

---
## SUB-PROJECTS
---

### dIQ - Intranet IQ (v1.1.0) - PRODUCTION LIVE (Full Spectrum)

| Property | Value |
|----------|-------|
| **Location** | `apps/intranet-iq/` |
| **Port** | 3001 |
| **Local URL** | http://localhost:3001/diq/dashboard |
| **Production URL** | https://intranet-iq.vercel.app/diq/dashboard |
| **basePath** | `/diq` |
| **Audit Score** | 100/100 (upgraded from 63/100) |
| **Documentation** | `apps/intranet-iq/CLAUDE.md`, `SAVEPOINT.md`, etc. |

**Quick Start:**
```bash
cd /Users/aldrin-mac-mini/digitalworkplace.ai
npm run dev:intranet     # Start dIQ on port 3001
```

**Pages (19 total, all production-verified):**
- `/diq/dashboard` - Main dashboard (news, events, activity feed)
- `/diq/chat` - AI Assistant (Claude streaming, RAG, function calling)
- `/diq/search` - Enterprise Search (keyword + semantic + federated)
- `/diq/people` - Org Chart & Directory (60 employees)
- `/diq/content` - Knowledge Base (20+ categories, 212 articles)
- `/diq/agents` - Workflow Automation (full execution engine)
- `/diq/settings` - User/Admin Settings (9 panels)
- `/diq/notifications` - **NEW** Notification center
- `/diq/my-day` - **NEW** Productivity hub, tasks
- `/diq/channels` - **NEW** Real backend channels
- `/diq/admin/elasticsearch` - Elasticsearch Admin (3 nodes, 28,690 docs)
- `/diq/admin/analytics` - Analytics Dashboard
- `/diq/admin/permissions` - RBAC Management (4 roles)
- `/diq/admin/dashboard` - **NEW** Admin analytics + system health

**Features (v1.1.0 Full Spectrum):**
- AI Assistant: Claude streaming, vector RAG, file processing, function calling
- Enterprise Search: Semantic + federated across external connectors
- AI Summary: Anthropic API generating search summaries
- RBAC: 4 roles (Super Admin, Admin, Editor, Viewer), 191 total users
- Elasticsearch: 3 nodes, 28,690 indexed documents
- EX Features: Notifications, reactions, polls, recognition, channels
- Productivity: My Day page, task management, daily briefing
- Workflows: Full execution engine, webhooks, cron triggers
- Connectors: Confluence, SharePoint, Notion, Google Drive
- Admin: User stats, content metrics, AI usage, system health

**Database (Supabase):**
- Schema: `diq` (project-specific) + `public` (shared)
- 45+ tables with full RLS policies
- TypeScript types: `apps/intranet-iq/src/lib/database.types.ts`
- Client helpers: `apps/intranet-iq/src/lib/supabase.ts`
- Migrations: `supabase/migrations/001_core_schema.sql` through `010_admin_analytics.sql`
- Documentation: `docs/DATABASE_ARCHITECTURE.md`

---

### dCQ - Chat Core IQ (v1.0.1) - PRODUCTION LIVE (Full Spectrum Verified)

| Property | Value |
|----------|-------|
| **Location** | `apps/chat-core-iq/` |
| **Port** | 3002 |
| **Local URL** | http://localhost:3002/dcq/Home/index.html |
| **Production URL** | https://chat-core-iq.vercel.app/dcq/Home/index.html |
| **basePath** | `/dcq` |
| **Documentation** | `apps/chat-core-iq/CLAUDE.md` |

**Quick Start:**
```bash
cd /Users/aldrin-mac-mini/digitalworkplace.ai
npm run dev:chatcore     # Start dCQ on port 3002
```

**Pages:**
| Page | Local | Production |
|------|-------|------------|
| Homepage | http://localhost:3002/dcq/Home/index.html | https://chat-core-iq.vercel.app/dcq/Home/index.html |
| Admin | http://localhost:3002/dcq/admin | https://chat-core-iq.vercel.app/dcq/admin |
| Content | http://localhost:3002/dcq/admin/content | https://chat-core-iq.vercel.app/dcq/admin/content |
| IVR Demo | http://localhost:3002/dcq/demo/ivr | https://chat-core-iq.vercel.app/dcq/demo/ivr |

**Features:**
- AI Chatbot: Claude (primary) + OpenAI (fallback) LLM integration
- Semantic Search: 348 knowledge items with 100% vector embedding coverage
- FAQ Widget: Homepage displays FAQs from admin portal
- Admin Portal: Full CRUD for FAQs, knowledge base, announcements
- Multi-language: English/Spanish support
- Demo IVR: Interactive Voice Response demo

**Database (Supabase):**
- Schema: `dcq` with 28 tables
- 348 knowledge items with 100% embedding coverage
- pgvector v0.8.0 for semantic search

---

## Code Conventions

### Components
- Use `"use client"` directive for client components
- Use Framer Motion for UI animations
- Use GSAP for complex/performant animations
- Use shadcn/ui for base components
- Follow existing patterns in brand/login components

### Styling
- Use Tailwind CSS utility classes
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Dark grey theme: #0f0f1a (bg), #1a1a2e (mid), #16213e (light)
- Green accent: #4ade80
- Lighter mint green for chat bubbles: rgba(134, 239, 172, 0.7)
- Monospace fonts: JetBrains Mono, Fira Code, SF Mono

### TypeScript
- Strict mode enabled
- Use proper type annotations
- Avoid `any` types where possible

## Design System

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Background Dark | #0f0f1a | Main background |
| Background Mid | #1a1a2e | Cards, overlays |
| Background Light | #16213e | Borders, accents |
| Green Accent | #4ade80 | .ai, indicators |
| Mint Green | rgba(134, 239, 172, 0.7) | Chat bubbles |
| White | #ffffff | Primary text |
| White 75% | rgba(255,255,255,0.75) | Secondary text |

### Product Theme Colors
| Product | Primary | Secondary | Usage |
|---------|---------|-----------|-------|
| Support IQ | #10b981 | #06b6d4 | Green/Cyan |
| Intranet IQ | #3b82f6 | #8b5cf6 | Blue/Purple |
| Test Pilot IQ | #f59e0b | #ef4444 | Orange/Red |
| Chat Core IQ | #a855f7 | #ec4899 | Purple/Pink |

### Typography
| Element | Font | Weight |
|---------|------|--------|
| Wordmark "digital" | JetBrains Mono | 300 |
| Wordmark "workplace" | JetBrains Mono | 500 |
| Wordmark ".ai" | JetBrains Mono | 600 |

## Common Tasks

### Adding a new page
1. Create folder in `src/app/`
2. Add `page.tsx` with component
3. Add `layout.tsx` if custom layout needed

### Modifying login design
1. Edit `src/components/login/LoginBackground.tsx` for background
2. Edit `src/app/sign-in/[[...sign-in]]/page.tsx` for login content
3. Edit `src/components/brand/WordmarkGlitch.tsx` for wordmark

### Adding shadcn/ui components
```bash
npx shadcn@latest add [component-name]
```

### Adding OAuth providers
1. Configure in Clerk Dashboard
2. Add button in sign-in page
3. Use `signIn.authenticateWithRedirect()` with appropriate strategy

### Modifying Sound Effects
1. Edit `src/lib/sounds.ts` for sound generation
2. Edit `src/components/audio/SoundToggle.tsx` for toggle UI
3. Sounds auto-play on page load (enabled by default)

## Key Animation Patterns

### Glitch Effect
```typescript
const [glitchActive, setGlitchActive] = useState(false);
const [glitchIntensity, setGlitchIntensity] = useState(0);

const triggerGlitch = () => {
  setGlitchIntensity(Math.random() > 0.5 ? 2 : 1);
  setGlitchActive(true);
  // Double-tap effect
  setTimeout(() => {
    setGlitchActive(false);
    if (Math.random() > 0.5) {
      setTimeout(() => {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 80);
      }, 50);
    }
  }, 120);
};
```

### GSAP Floating
```typescript
gsap.to(element, {
  y: -15,
  duration: 4,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut"
});
```

### Framer Motion Chat Bubbles
```typescript
<AnimatePresence>
  {bubbles.map(bubble => (
    <motion.div
      key={bubble.id}
      initial={{ opacity: 0, y: 10, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {bubble.message}
    </motion.div>
  ))}
</AnimatePresence>
```

### Web Audio Sound Effect
```typescript
export const playChatBubbleSound = (): void => {
  if (!audioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.02, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
};
```
