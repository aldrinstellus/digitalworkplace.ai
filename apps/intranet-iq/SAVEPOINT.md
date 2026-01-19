# dIQ - Intranet IQ | Session Savepoint

---

## CURRENT STATE
**Last Updated:** January 19, 2025 (Session End)
**Session:** Database Architecture + Logo Standard + Flow Verified
**Version:** 0.2.2

---

## WHAT WAS ACCOMPLISHED

### Session: January 19, 2025 (Latest)

1. **Complete Flow Verified**
   - Sign-in → Master Dashboard → dIQ Dashboard (all working)
   - `localhost:3000/sign-in` → `localhost:3000/dashboard` → `localhost:3001/diq/dashboard`
   - "Launch App" button opens dIQ in new tab correctly

2. **Supabase Database Architecture Designed**
   - Multi-schema structure: `public` (shared) + `diq` (project-specific)
   - Cross-project knowledge search via `knowledge_items` table
   - Full TypeScript types generated
   - Supabase client helpers created
   - Row-Level Security policies defined
   - Migration files ready to deploy

3. **dIQ Logo Standard Finalized**
   - SVG-based rendering for pixel-perfect alignment
   - All characters (d, I, Q, dot) on same baseline
   - Same monospace font family across all elements
   - Bold "d" (700) + Regular "IQ" (400) + Blue dot
   - Seamless, professional appearance

2. **Logo Technical Specs**
   ```
   Font: ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas
   "d": fontWeight 700, full opacity
   "I": fontWeight 400, 85% opacity
   "Q": fontWeight 400, 85% opacity
   Dot: #60a5fa with glow shadow
   Baseline: All elements share same y-coordinate
   ```

3. **URL Routing Fixed**
   - Main app dashboard now correctly links to `/diq/dashboard`
   - All dIQ routes use `/diq` prefix (basePath)

4. **All Core Pages Implemented**
   - `/diq/dashboard` - Main dashboard with search bar, quick actions, activity feed
   - `/diq/chat` - AI Assistant with threaded chat, LLM selector, source citations
   - `/diq/search` - Enterprise search with filters, AI summary, result cards
   - `/diq/people` - Org chart with grid/list/tree views, employee profiles
   - `/diq/content` - Knowledge base with tree navigation, article editor
   - `/diq/agents` - Workflow automation with visual steps, templates
   - `/diq/settings` - User/Admin settings with profile, notifications, privacy

---

## dIQ LOGO STANDARD (Official)

### Design Specification
```
┌─────────────────────────────────────┐
│                                     │
│    d I Q ·                          │
│    ↑ ↑ ↑ ↑                          │
│    │ │ │ └── Blue dot (#60a5fa)     │
│    │ │ └──── Q (regular, 85%)       │
│    │ └────── I (regular, 85%)       │
│    └──────── d (bold, 100%)         │
│                                     │
│    ALL ON SAME BASELINE             │
│                                     │
└─────────────────────────────────────┘
```

### Font Stack
```css
font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace;
```

### Implementation (SVG)
```jsx
<svg height="18" viewBox="0 0 32 18">
  <text x="0" y="14" fill="white" fontSize="18" fontWeight="700">d</text>
  <text x="11" y="14" fill="white" fillOpacity="0.85" fontSize="10" fontWeight="400">I</text>
  <text x="16.5" y="14" fill="white" fillOpacity="0.85" fontSize="10" fontWeight="400">Q</text>
  <circle cx="27" cy="13" r="2.5" fill="#60a5fa" />
</svg>
```

### Size Variants
| Size | d fontSize | IQ fontSize | Dot radius |
|------|-----------|-------------|------------|
| sm   | 16px      | 9px         | 2px        |
| md   | 20px      | 11px        | 2.5px      |
| lg   | 26px      | 14px        | 3px        |
| xl   | 32px      | 17px        | 3.5px      |

---

## CURRENT STATUS

### Dev Servers
| App | Port | Base URL |
|-----|------|----------|
| Main App | 3000 | http://localhost:3000 |
| dIQ (Intranet IQ) | 3001 | http://localhost:3001/diq |

### Pages Status
| Page | Route | Status |
|------|-------|--------|
| Dashboard | `/diq/dashboard` | ✅ Complete |
| Chat | `/diq/chat` | ✅ Complete |
| Search | `/diq/search` | ✅ Complete |
| People | `/diq/people` | ✅ Complete |
| Content | `/diq/content` | ✅ Complete |
| Agents | `/diq/agents` | ✅ Complete |
| Settings | `/diq/settings` | ✅ Complete |

### Brand Identity
| Element | Status |
|---------|--------|
| dIQ Logo (SVG-based, baseline aligned) | ✅ Complete |
| Page Title: "dIQ - Intranet IQ" | ✅ Complete |
| Favicon "d." with green dot | ✅ Complete |
| Glitch animation effect | ✅ Complete |
| Dashboard header badge | ✅ Complete |
| URL basePath `/diq` | ✅ Complete |
| Main app routing to dIQ | ✅ Complete |

---

## KEY FILES

### Database Files
```
supabase/migrations/
├── 001_core_schema.sql     # Shared tables (users, projects, knowledge_items)
└── 002_diq_schema.sql      # dIQ-specific tables

apps/intranet-iq/src/lib/
├── database.types.ts       # TypeScript types for all tables
└── supabase.ts             # Supabase client with helper functions

docs/
└── DATABASE_ARCHITECTURE.md # Full architecture documentation
```

### Logo Component
```
/src/components/brand/IQLogo.tsx
├── IQLogo - Main component with glitch effect
├── IQMark - Compact version
└── LogoText - SVG-based text rendering (internal)
```

### App Structure
```
apps/intranet-iq/
├── src/app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Redirects to /diq/dashboard
│   ├── icon.tsx            # Favicon "d." (dark + green dot)
│   ├── apple-icon.tsx      # Apple touch icon
│   ├── dashboard/page.tsx  # Main dashboard with dIQ badge
│   ├── chat/page.tsx       # AI Assistant
│   ├── search/page.tsx     # Enterprise Search
│   ├── people/page.tsx     # Org Chart
│   ├── content/page.tsx    # Knowledge Base
│   ├── agents/page.tsx     # Workflows
│   └── settings/page.tsx   # Settings
├── src/components/
│   ├── brand/IQLogo.tsx    # dIQ logo component (SVG)
│   └── layout/Sidebar.tsx  # Navigation
├── next.config.ts          # basePath: "/diq"
├── CLAUDE.md
├── context.md
├── CHANGELOG.md
└── SAVEPOINT.md
```

---

## PENDING TASKS

### Immediate
- [ ] Run Supabase migrations (`supabase db push`)
- [ ] Test database connection from dIQ app
- [ ] Test logo rendering across different browsers

### Short-term
- [ ] Seed sample data (departments, employees, articles)
- [ ] Connect pages to real Supabase data
- [ ] Implement actual AI chat functionality with LLM backend
- [ ] Add real employee data to People directory
- [ ] Create real knowledge base articles

### Long-term (from PRD)
- [ ] EPIC 1: Core Search and Discovery (Elasticsearch)
- [ ] EPIC 2: AI-Driven Assistance (Multi-LLM)
- [ ] EPIC 3: Knowledge Management
- [ ] EPIC 4: Integration and Customization
- [ ] EPIC 5: Security and Access Control
- [ ] EPIC 6: Workflow Automation
- [ ] EPIC 7: Dashboards and Analytics

---

## QUICK REFERENCE URLs

```
Dashboard:  http://localhost:3001/diq/dashboard
Chat:       http://localhost:3001/diq/chat
Search:     http://localhost:3001/diq/search
People:     http://localhost:3001/diq/people
Content:    http://localhost:3001/diq/content
Agents:     http://localhost:3001/diq/agents
Settings:   http://localhost:3001/diq/settings
```

---

## QUICK RESUME COMMANDS

```bash
# From monorepo root
cd /Users/aldrin-mac-mini/digitalworkplace.ai
npm run dev              # Start all apps
npm run dev:intranet     # Start only dIQ (port 3001)

# URLs
# Main App: http://localhost:3000
# dIQ:      http://localhost:3001/diq/dashboard
```

---

*Part of Digital Workplace AI Product Suite*
*Location: /Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq*
*Version: 0.2.2*
