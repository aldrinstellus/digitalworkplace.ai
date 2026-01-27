# Digital Workplace AI - Session Savepoint

**Last Updated**: 2026-01-27 UTC
**Version**: 0.7.6
**Session Status**: Full Spectrum Testing PASSED - dCQ v1.0.2, dIQ v1.1.0 (100/100)
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
| **Chat Core IQ (dCQ)** | https://dcq.digitalworkplace.ai/dcq/Home/index.html | ✅ Live | 1.0.2 |
| **Test Pilot IQ (dTQ)** | - | ⬜ Pending | - |

### GitHub Repository
- **URL**: https://github.com/aldrinstellus/digitalworkplace.ai
- **Latest Commit**: 0667ef8 - v0.7.6: Full spectrum testing passed

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
- **Total Knowledge Items**: 356 with 100% embedding coverage
- **DCQ FAQs**: 7 with 100% embedding coverage

---

## Latest Changes (v0.7.5)

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
- [ ] dTQ (Test Pilot IQ) implementation

### Medium Term
- [ ] Cross-project search UI
- [ ] User profile page
- [ ] Settings page

---

*Last session: 2026-01-27 UTC*
*Version: 0.7.6*
*Machine: Mac Mini (aldrin-mac-mini)*
