# Digital Workplace AI - Session Savepoint

**Last Updated**: 2026-01-27 19:45 UTC
**Version**: 0.7.9
**Session Status**: Full Spectrum Semantic Search & Sync Test PASSED
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

| Product | Production URL | Status | Version |
|---------|----------------|--------|---------|
| **Main Dashboard** | https://digitalworkplace-ai.vercel.app | ✅ Live | 0.7.6 |
| **Support IQ (dSQ)** | https://dsq.digitalworkplace.ai | ✅ Live | 1.2.5 |
| **Intranet IQ (dIQ)** | https://intranet-iq.vercel.app | ✅ Live | 1.1.0 |
| **Chat Core IQ (dCQ)** | https://dcq.digitalworkplace.ai/dcq/Home/index.html | ✅ Live | 1.1.0 |
| **Test Pilot IQ (dTQ)** | - | ⬜ Pending | - |

### GitHub Repository
- **URL**: https://github.com/aldrinstellus/digitalworkplace.ai
- **Latest Commit**: 329adb3 - fix: Update Chat Core IQ link to Doral homepage

### Vercel Projects
| Project | Vercel Dashboard |
|---------|------------------|
| Main | https://vercel.com/aldos-projects-8cf34b67/digitalworkplace-ai |
| Chat Core IQ | https://vercel.com/aldos-projects-8cf34b67/chat-core-iq |
| Intranet IQ | https://vercel.com/aldos-projects-8cf34b67/intranet-iq |
| Support IQ | https://vercel.com/aldos-projects-8cf34b67/support-iq |

---

## Products Status Summary

| Product | Code | Port | Local | Vercel | Embeddings | Database | Audit |
|---------|------|------|-------|--------|------------|----------|-------|
| **Support IQ** | dSQ | 3003 | ✅ | ✅ Live | ✅ 100% | 15 tables | - |
| **Intranet IQ** | dIQ | 3001 | ✅ | ✅ Live | ✅ 100% | 45+ tables | 100/100 |
| **Chat Core IQ** | dCQ | 3002 | ✅ | ✅ Live | ✅ 100% | 28 tables | **100/100** |
| **Test Pilot IQ** | dTQ | 3004 | ⬜ | ⬜ | ⬜ | ⬜ | - |

### Database Stats (Supabase)
- **Project**: digitalworkplace-ai (fhtempgkltrazrgbedrh)
- **Schemas**: public, diq, dsq, dcq
- **pgvector**: v0.8.0 enabled
- **Total Knowledge Items**: 357 with 100% embedding coverage
- **DCQ FAQs**: 8 with 100% embedding coverage

---

## Latest Changes (v0.7.9)

### Full Spectrum Semantic Search & Sync Test PASSED (2026-01-27)

**Comprehensive semantic search, embedding, and cross-component sync verification completed with 100% pass rate.**

#### Embedding Coverage (Fixed)

| Table | Before | After | Coverage |
|-------|--------|-------|----------|
| **dcq.faqs** | 7/8 (87.5%) | 8/8 | **100%** ✅ |
| **public.knowledge_items** | 356/357 (99.7%) | 357/357 | **100%** ✅ |

Fixed: Generated missing embedding for pothole FAQ using `/api/embeddings` batch endpoint.

#### Semantic Search Verification

| Query | Semantic Variation | Result |
|-------|-------------------|--------|
| "How do I get a building permit?" | "I need to apply for a construction permit" | ✅ Same intent recognized |
| "What are the office hours?" | "When is city hall open?" | ✅ Correct answers |
| "How do I start a business in Doral?" | - | ✅ Business licensing info with sources |
| "Where can I report a pothole?" | - | ✅ Triggers service request workflow |

#### Multi-Language Support Verified

| Language | Code | Status |
|----------|------|--------|
| **English** | EN | ✅ Working |
| **Spanish** | ES | ✅ Working |
| **Haitian Creole** | HT | ✅ Working |

#### Cross-Component Sync Verified

| Component | Test | Status |
|-----------|------|--------|
| **Admin Panel** | Create pothole FAQ | ✅ Created |
| **Database** | Embedding generated | ✅ 100% coverage |
| **Website FAQ Widget** | Pothole FAQ visible | ✅ Displayed |
| **FAQ Accordion** | Answer expands | ✅ Shows "PUBLIC WORKS" category + answer |
| **Chatbot** | Semantic search finds FAQ | ✅ Working |
| **IVR Demo** | Transfer code generation | ✅ Working (EYJJIJ) |

#### Final Score: **100/100** ✅

---

## Previous Changes (v0.7.8)

### Chat Core IQ Link Fix (2026-01-27)

**Fixed incorrect URL for Chat Core IQ product card on main dashboard.**

The "Launch App" button for Chat Core IQ was linking to the wrong page. Now correctly opens the City of Doral homepage.

#### Fix Details

| | Before (Wrong) | After (Correct) |
|---|----------------|-----------------|
| **Local** | `http://localhost:3002/dcq/homepage` | `http://localhost:3002/dcq/Home/index.html` |
| **Production** | `https://chat-core-iq.vercel.app/dcq/homepage` | `https://dcq.digitalworkplace.ai/dcq/Home/index.html` |

#### File Changed
- `apps/main/src/app/dashboard/page.tsx` (lines 52-53)

#### Deployment
- GitHub: Commit 329adb3
- Vercel: Deployed to production
- Verified: Working correctly

---

## Previous Changes (v0.7.7)

### dCQ v1.1.0 - Session-Based Settings Isolation (2026-01-27)

**New feature enabling isolated admin changes per user session.**

When users login via main dashboard and access dCQ, their admin changes only affect their session - not the global public site.

#### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| SessionContext | `src/contexts/SessionContext.tsx` | Capture & store session params |
| Layout | `src/app/layout.tsx` | SessionProvider wrapper |
| Admin Announcements | `src/app/admin/announcements/page.tsx` | Session-aware saves |
| Widget | `public/announcements-widget.js` | Session override support |
| Dashboard | `apps/main/src/app/dashboard/page.tsx` | Pass session params |

#### How It Works

1. Main dashboard passes `clerk_id` + `session_id` in URL when launching dCQ
2. SessionContext captures params and stores in localStorage
3. Admin saves to localStorage with session prefix instead of database
4. Widget checks localStorage first, falls back to API for public users
5. Visual "Session Only" badge in admin panel

#### Storage Keys

- `dcq_session_info` - Session state
- `dcq_session_{sessionId}_banner_settings` - Session-specific settings

#### Deployment

- GitHub: Commit 431ded6
- Vercel: Deployed to production
- Production URL: https://dcq.digitalworkplace.ai/dcq/Home/index.html

---

## Previous Changes (v0.7.5)

### dCQ v1.0.2 Full Spectrum Audit PASSED (2026-01-22)

**Comprehensive audit completed with 100% pass rate across ALL components.**

#### Audit Results

| Category | Score | Status |
|----------|-------|--------|
| Homepage & Chatbot | 100% | ✅ PASSED |
| IVR Demo | 100% | ✅ PASSED |
| Admin Panel (10 pages) | 100% | ✅ PASSED |
| Database (28 tables) | 100% | ✅ PASSED |
| Vector Embeddings | 100% | ✅ PASSED |
| API Endpoints (9) | 100% | ✅ PASSED |
| **Overall Score** | **100/100** | **PRODUCTION READY** |

#### Issues Fixed

1. **Dynamic Sidebar Badges**
   - Escalations badge now fetches real count from API
   - Announcements badge now fetches real count from API
   - File: `src/app/admin/AdminLayoutClient.tsx`

2. **Test Data Cleanup**
   - Removed test entries without embeddings
   - `public.knowledge_items`: 348/348 (100%)
   - `dcq.faqs`: 7/7 (100%)

#### Features Verified

**Homepage:**
- Chatbot (EN/ES/HT) - All 3 languages working
- FAQ Widget - 6 FAQs with expand/collapse
- Announcements Banner - 3 announcements with rotation

**IVR Demo:**
- 3 languages (English, Spanish, Haitian Creole)
- Keypad input (0-9, *, #)
- Transfer codes generation

**Admin Panel (10 pages):**
- Dashboard - KPIs, charts, export
- Analytics - Date filters, 10+ charts
- Workflows - 3 workflow types, appointments
- Content - Knowledge base, FAQs, documents
- Escalations - Filters, empty state
- Notifications - 5 filter tabs
- Announcements - CRUD operations
- Audit Logs - 50 entries, pagination
- Settings - 5 tabs (Profile, Team, Permissions, Integrations, Chatbot)

**Integrations (19+):**
- Tyler Technologies (12 services)
- CRM (Salesforce, MS Dynamics)
- IVR (Twilio, Vonage, Amazon Connect)
- SMS (Twilio, MessageBird)
- Social (Facebook, WhatsApp, Instagram)

---

## Local Development URLs

### Main Dashboard (Port 3000)
| Page | URL |
|------|-----|
| **Root (/)** | http://localhost:3000 → Redirects |
| **Sign-in (DEFAULT)** | http://localhost:3000/sign-in |
| **Dashboard** | http://localhost:3000/dashboard |
| **Admin Panel** | http://localhost:3000/admin |

### dCQ - Chat Core IQ (Port 3002)
| Page | URL |
|------|-----|
| **Home** | http://localhost:3002/dcq/Home/index.html |
| **Admin** | http://localhost:3002/dcq/admin |
| **Admin Content** | http://localhost:3002/dcq/admin/content |
| **Demo IVR** | http://localhost:3002/dcq/demo/ivr |

### dIQ - Intranet IQ (Port 3001)
| Page | URL |
|------|-----|
| **Dashboard** | http://localhost:3001/diq/dashboard |
| **Chat** | http://localhost:3001/diq/chat |
| **Search** | http://localhost:3001/diq/search |
| **People** | http://localhost:3001/diq/people |
| **Content** | http://localhost:3001/diq/content |

### dSQ - Support IQ (Port 3003)
| Page | URL |
|------|-----|
| **ATC Executive** | http://localhost:3003/demo/atc-executive |
| **Gov COR** | http://localhost:3003/demo/cor |

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

# Deploy
vercel --prod
```

---

## Key Documentation Files

| File | Path |
|------|------|
| **SAVEPOINT.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/SAVEPOINT.md` |
| **CHANGELOG.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/CHANGELOG.md` |
| **CLAUDE.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/CLAUDE.md` |
| **context.md** | `/Users/aldrin-mac-mini/digitalworkplace.ai/context.md` |
| **DB Reference** | `/Users/aldrin-mac-mini/digitalworkplace.ai/docs/SUPABASE_DATABASE_REFERENCE.md` |
| **dCQ Audit Report** | `/Users/aldrin-mac-mini/digitalworkplace.ai/apps/chat-core-iq/FULL_SPECTRUM_AUDIT_REPORT.md` |

---

## Pending Tasks

### Short Term
- [x] dCQ v1.0.2 Full Spectrum Audit - COMPLETED
- [x] Fix embedding coverage to 100% - COMPLETED
- [x] dCQ v1.1.0 Session-Based Settings Isolation - COMPLETED
- [x] Fix Chat Core IQ link to Doral homepage - COMPLETED
- [x] Full Spectrum Semantic Search & Sync Test - COMPLETED (100/100)
- [ ] dTQ (Test Pilot IQ) implementation

### Medium Term
- [ ] Cross-project search UI
- [ ] User profile page
- [ ] Settings page

---

*Last session: 2026-01-27 19:45 UTC*
*Version: 0.7.9*
*Machine: Mac Mini (aldrin-mac-mini)*
