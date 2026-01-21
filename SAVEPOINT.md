# Digital Workplace AI - Session Savepoint

**Last Updated**: 2026-01-21 08:30 UTC
**Version**: 0.7.1
**Session Status**: All systems operational, all documentation updated
**Machine**: Mac Mini (aldrin-mac-mini)

---

## CRITICAL: DEFAULT LANDING PAGE

**THE SIGN-IN PAGE IS THE DEFAULT LANDING PAGE FOR DIGITAL WORKPLACE AI.**

| URL | What Happens |
|-----|--------------|
| `http://localhost:3000` | **REDIRECTS** → `/sign-in` (if not logged in) |
| `http://localhost:3000` | **REDIRECTS** → `/dashboard` (if logged in) |
| `http://localhost:3000/sign-in` | **DEFAULT LANDING PAGE** - This is what users see first |

**Code Location**: `apps/main/src/app/page.tsx`
**There is NO separate landing page. Root URL (`/`) always redirects.**

---

## Production URLs (All Verified)

| Product | Production URL | Status |
|---------|----------------|--------|
| **Main Dashboard** | https://digitalworkplace-ai.vercel.app | ✅ Live |
| **Support IQ (dSQ)** | https://support-iq-pearl.vercel.app | ✅ Live |
| **Intranet IQ (dIQ)** | https://intranet-iq.vercel.app | ✅ Live |
| **Chat Core IQ (dCQ)** | https://chat-core-iq.vercel.app | ✅ Live |
| **Test Pilot IQ (dTQ)** | - | ⬜ Pending |

### GitHub Repository
- **URL**: https://github.com/aldrinstellus/digitalworkplace.ai
- **Latest Commit**: `caf26a6` (dCQ v1.0.0 production docs)
- **Performance Commit**: `ceaf7f1` (login page optimization)

### Vercel Projects
| Project | Vercel Dashboard |
|---------|------------------|
| Main | https://vercel.com/aldos-projects-8cf34b67/digitalworkplace-ai |
| Chat Core IQ | https://vercel.com/aldos-projects-8cf34b67/chat-core-iq |
| Intranet IQ | https://vercel.com/aldos-projects-8cf34b67/intranet-iq |
| Support IQ | https://vercel.com/aldos-projects-8cf34b67/support-iq |

---

## Local Development URLs

### Main Dashboard (Port 3000)
| Page | URL |
|------|-----|
| **Root (/)** | http://localhost:3000 → Redirects |
| **Sign-in (DEFAULT)** | http://localhost:3000/sign-in |
| **Dashboard** | http://localhost:3000/dashboard |
| **Admin Panel** | http://localhost:3000/admin |

### dIQ - Intranet IQ (Port 3001)
| Page | URL |
|------|-----|
| **Dashboard** | http://localhost:3001/diq/dashboard |
| **Chat** | http://localhost:3001/diq/chat |
| **Search** | http://localhost:3001/diq/search |
| **People** | http://localhost:3001/diq/people |
| **Content** | http://localhost:3001/diq/content |

### dCQ - Chat Core IQ (Port 3002)
| Page | URL |
|------|-----|
| **Home** | http://localhost:3002/dcq/Home/index.html |
| **Admin** | http://localhost:3002/dcq/admin |

### dSQ - Support IQ (Port 3003)
| Page | URL |
|------|-----|
| **ATC Demo** | http://localhost:3003/demo/atc-executive |
| **Gov Demo** | http://localhost:3003/demo/cor |

---

## Products Status Summary

| Product | Code | Port | Local | Vercel | Embeddings | Database |
|---------|------|------|-------|--------|------------|----------|
| **Support IQ** | dSQ | 3003 | ✅ | ✅ Live | ✅ 100% | 15 tables |
| **Intranet IQ** | dIQ | 3001 | ✅ | ✅ Live | ✅ 100% | 21 tables |
| **Chat Core IQ** | dCQ | 3002 | ✅ | ✅ Live | ✅ 100% | 28 tables |
| **Test Pilot IQ** | dTQ | 3004 | ⬜ | ⬜ | ⬜ | ⬜ |

### Database Stats (Supabase)
- **Project**: digitalworkplace-ai (fhtempgkltrazrgbedrh)
- **Schemas**: public, diq, dsq, dcq
- **pgvector**: v0.8.0 enabled
- **Total Knowledge Items**: 348 with 100% embedding coverage

---

## Latest Changes (v0.7.1)

### Login Page Performance Optimization
- Reduced avatar images from 150x150 to 80x80 pixels
- First 6 avatars load eagerly, remaining 18 lazy loaded
- GSAP/Framer animations deferred 300ms post-LCP
- Initial particles reduced from 40 to 20, doubled after paint
- Added preconnect hints for Unsplash/Wikimedia
- Configured Next.js image optimization (AVIF, WebP)

**Expected Impact**: LCP from 3,722ms → ~1,500-2,000ms

### Files Changed
```
apps/main/src/components/login/LoginBackground.tsx
apps/main/src/app/sign-in/layout.tsx
apps/main/next.config.ts
```

---

## Quick Start Commands

```bash
# Navigate to project
cd /Users/aldrin-mac-mini/digitalworkplace.ai

# Start all apps
npm run dev              # Main (port 3000)
npm run dev:intranet     # dIQ (port 3001)
npm run dev:chatcore     # dCQ (port 3002)

# Build
npm run build

# Git
git status
git pull origin main
git add . && git commit -m "message" && git push
```

---

## File System Paths

### Project Root
```
/Users/aldrin-mac-mini/digitalworkplace.ai
```

### Key Documentation
| File | Path |
|------|------|
| **SAVEPOINT.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/SAVEPOINT.md` |
| **CHANGELOG.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/CHANGELOG.md` |
| **CLAUDE.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/CLAUDE.md` |
| **context.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/context.md` |
| **DB Reference** | `/Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md` |

### Monorepo Structure
```
digitalworkplace.ai/
├── apps/
│   ├── main/              # Port 3000 - Main dashboard
│   ├── intranet-iq/       # Port 3001 - dIQ
│   ├── chat-core-iq/      # Port 3002 - dCQ
│   ├── support-iq/        # Port 3003 - dSQ
│   └── test-pilot-iq/     # Port 3004 - dTQ (pending)
├── docs/
├── supabase/migrations/
├── CLAUDE.md
├── SAVEPOINT.md
├── CHANGELOG.md
└── context.md
```

---

## Environment Variables

### Required for All Apps
```env
NEXT_PUBLIC_SUPABASE_URL=https://fhtempgkltrazrgbedrh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk-key>
CLERK_SECRET_KEY=<clerk-secret>
OPENAI_API_KEY=<openai-key>  # For embeddings
```

### dCQ Additional
```env
ANTHROPIC_API_KEY=<anthropic-key>  # Primary LLM
ELEVENLABS_API_KEY=<elevenlabs-key>  # TTS for IVR
NEXT_PUBLIC_BASE_URL=https://chat-core-iq.vercel.app/dcq
```

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | React framework |
| **TypeScript** | 5.x | Type safety |
| **Clerk** | @clerk/nextjs | Authentication |
| **Supabase** | @supabase/supabase-js | Database |
| **pgvector** | 0.8.0 | Vector search |
| **Tailwind CSS** | 4.x | Styling |
| **Framer Motion** | 12.x | Animations |
| **GSAP** | 3.x | Complex animations |
| **OpenAI** | text-embedding-3-small | Embeddings |

---

## Pending Tasks

### Short Term
- [ ] Verify login page performance improvement post-deploy
- [ ] dTQ (Test Pilot IQ) implementation

### Medium Term
- [ ] Cross-project search UI
- [ ] User profile page
- [ ] Settings page

---

## Session Resume Checklist

When starting a new Claude Code session:

1. **Read documentation**
   ```bash
   # These files contain full context
   cat /Users/aldrin-mac-mini/digitalworkplace.ai/SAVEPOINT.md
   cat /Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md
   ```

2. **Sync with GitHub**
   ```bash
   cd /Users/aldrin-mac-mini/digitalworkplace.ai
   git pull origin main
   ```

3. **Start dev server**
   ```bash
   npm run dev
   ```

4. **Verify locally**
   - http://localhost:3000/sign-in
   - http://localhost:3000/dashboard

---

## Design System

### Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Background Dark | #0f0f1a | Main background |
| Background Mid | #1a1a2e | Cards |
| Green Accent | #4ade80 | Highlights |

### Product Colors
| Product | Primary | Secondary |
|---------|---------|-----------|
| Support IQ | #10b981 | #06b6d4 |
| Intranet IQ | #3b82f6 | #8b5cf6 |
| Chat Core IQ | #a855f7 | #ec4899 |
| Test Pilot IQ | #f59e0b | #ef4444 |

---

*Last session: 2026-01-21 07:50 UTC*
*Version: 0.7.1*
*Machine: Mac Mini (aldrin-mac-mini)*
