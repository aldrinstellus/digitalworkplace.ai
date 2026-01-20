# dIQ - Intranet IQ | Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.6] - 2025-01-20

### Added

#### UI Audit - All Non-Functional Buttons Fixed
- Settings page: Invite User modal with email input and role selector
- Settings page: Photo upload functionality
- Settings page: 2FA toggle with enable/disable states
- Settings page: Session management (Sign out all devices)
- Content page: New Article modal with title, category, and editor
- Agents page: Workflow templates modal with template selection
- Integrations page: Add Integration modal (Salesforce, HubSpot, Zendesk, GitHub, Figma, Dropbox)
- Channels page: Create Channel modal with public/private options

#### Security Enhancements
- Added DOMPurify for HTML content sanitization
- ArticleEditor component now sanitizes all user content
- VersionHistoryModal sanitizes historical content
- Protection against XSS attacks in user-generated content

#### Dynamic Greeting System
- Greeting now shows "Good [morning/afternoon/evening], [Name]" when logged in
- Falls back to "Hello there" when not logged in
- Graceful handling of Clerk loading states
- Fallback chain: firstName → fullName → email username → "Hello there"

#### Cross-App Authentication
- ClerkProvider configured to use main app sign-in URLs
- Added NEXT_PUBLIC_MAIN_APP_URL environment variable
- Authentication cookies shared between port 3000 and 3001

### Changed

#### Dashboard Cleanup
- Removed redundant dIQ badge from main content header
- Removed "Intranet IQ" text from content area
- Removed "localhost:3001" dev indicator
- Sidebar dIQ logo now serves as sole branding element
- Cleaner, more focused dashboard layout

### Browser Testing Verified
All pages tested via browser automation:
- Dashboard, Search, Content, Chat, Agents, Settings, Integrations, Channels

---

## [0.2.2] - 2025-01-19

### Added

#### Supabase Database Architecture
- Designed multi-schema database structure linking all Digital Workplace AI projects
- Created `public` schema for shared tables (users, projects, knowledge_items, activity_log)
- Created `diq` schema for Intranet IQ-specific tables
- Full Row-Level Security (RLS) policies for data isolation

#### dIQ Database Tables
- `diq.departments` - Organizational structure with hierarchy
- `diq.employees` - Extended user profiles with skills, job info
- `diq.kb_categories` - Hierarchical knowledge base categories
- `diq.articles` - Knowledge base articles with version tracking
- `diq.article_versions` - Historical article versions
- `diq.chat_threads` - AI assistant conversation threads
- `diq.chat_messages` - Chat messages with sources, confidence scores
- `diq.search_history` - User search analytics
- `diq.workflows` - Agentic workflow definitions
- `diq.workflow_steps` - Individual workflow steps
- `diq.workflow_executions` - Execution history
- `diq.news_posts` - Employee news feed
- `diq.news_comments` - News post comments
- `diq.events` - Calendar events
- `diq.event_rsvps` - Event attendance
- `diq.bookmarks` - User saved items
- `diq.user_settings` - dIQ-specific preferences

#### Cross-Project Features
- `public.knowledge_items` table for unified search across all projects
- `search_knowledge()` function for cross-project full-text search
- Automatic sync triggers from dIQ articles to knowledge_items
- Activity logging for audit trails

#### TypeScript Integration
- Complete database types in `database.types.ts`
- Supabase client helpers in `supabase.ts`
- Helper functions for all common operations

#### Documentation
- Created `docs/DATABASE_ARCHITECTURE.md` with full schema documentation
- Migration files ready for deployment

### Files Added
```
supabase/migrations/001_core_schema.sql
supabase/migrations/002_diq_schema.sql
apps/intranet-iq/src/lib/database.types.ts
apps/intranet-iq/src/lib/supabase.ts
docs/DATABASE_ARCHITECTURE.md
```

---

## [0.2.1] - 2025-01-19

### Changed

#### Logo Standard Finalized
- Redesigned logo using SVG-based rendering for pixel-perfect alignment
- All characters (d, I, Q, dot) now sit on the same baseline
- Unified font family across all logo elements
- Bold "d" (fontWeight 700, 100% opacity)
- Regular "I" and "Q" (fontWeight 400, 85% opacity)
- Blue dot (#60a5fa) with subtle glow effect

#### Technical Improvements
- Replaced HTML/CSS-based logo with SVG text elements
- Font stack: ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas
- Consistent sizing system across sm/md/lg/xl variants
- Glitch effect maintained with chromatic aberration

#### URL Routing Fix
- Fixed main app dashboard link to dIQ (now correctly points to `/diq/dashboard`)

#### Documentation
- Updated all .md files with official logo standard
- Added SVG implementation examples
- Updated version to 0.2.1

### Logo Standard Reference
```
    d I Q ·
    ↑ ↑ ↑ ↑
    │ │ │ └── Blue dot (#60a5fa)
    │ │ └──── Q (regular, 85%)
    │ └────── I (regular, 85%)
    └──────── d (bold, 100%)

    ALL ON SAME BASELINE
```

---

## [0.2.0] - 2025-01-19

### Added

#### All Core Pages Implemented
- `/chat` - AI Assistant with threaded chat, LLM selector (GPT-4, Claude 3, Custom), source citations, confidence scores
- `/search` - Enterprise search with AI summary, advanced filters, result cards with relevance scores
- `/people` - Org chart with grid/list/tree views, employee profiles, department filtering
- `/content` - Knowledge base with expandable tree navigation, article editor, version history
- `/agents` - Workflow automation with visual step display, templates modal, status indicators
- `/settings` - User/Admin settings with profile, notifications, appearance, privacy sections

#### dIQ Brand Identity
- Created `IQLogo` component (`/src/components/brand/IQLogo.tsx`)
- Logo design: Bold **d** + small light **IQ** + blue dot indicator
- Blue-to-purple gradient background for logo
- Glitch animation effect (chromatic aberration every 4 seconds)
- `IQMark` compact version for favicon-style displays

#### Standalone Identity
- Updated page title to "dIQ - Intranet IQ"
- Title template: "%s | dIQ" for subpages
- Removed back button from sidebar
- Added dIQ logo as home link in sidebar

#### Dashboard Enhancements
- Added dIQ badge header with "Intranet IQ" label
- Added port indicator (localhost:3001) for dev clarity

#### Favicon (Updated to match main app)
- Created dynamic favicon (`src/app/icon.tsx`)
- Design: "d." with green dot on dark background (#0f0f1a)
- Matches Digital Workplace AI branding style
- Created Apple touch icon (`src/app/apple-icon.tsx`)

### Changed
- Sidebar navigation: Logo now links to dashboard (replaced back button)
- Page titles use standalone dIQ branding
- Favicon updated from blue gradient to dark background with green dot

### Logo Design Specification
Standard for all Digital Workplace products:
```
dIQ  - Digital Intranet IQ
dSQ  - Digital Support IQ
dTQ  - Digital Test Pilot IQ
dCQ  - Digital Chat Core IQ
```

---

## [0.1.0] - 2025-01-19

### Added

#### Initial Project Setup
- Next.js 16.1.3 with App Router and Turbopack
- TypeScript 5.x configuration
- Tailwind CSS 4.x with blue theme
- Framer Motion for animations

#### Authentication
- Clerk integration (shared with main app)
- Session management via ClerkProvider

#### Core Pages
- `/dashboard` - Main dashboard with:
  - Search bar ("Ask anything...")
  - Quick action cards (Search, Chat, Analytics)
  - Recent activity feed
  - Trending topics section
- `/` - Root redirect to dashboard

#### Navigation
- Sidebar component (64px collapsed)
- Icons: Home, Chat, Agents, People, Content, Search, Settings
- Back button to main Digital Workplace AI app
- Active route highlighting

#### Styling
- Blue theme color palette
- Dark mode design (#0a0a0f background)
- Gradient accents (blue to purple)
- Card hover effects

#### Documentation
- CLAUDE.md - Development instructions
- context.md - Design specifications
- SAVEPOINT.md - Session state tracking
- CHANGELOG.md - This file

#### Monorepo Integration
- Turborepo configuration
- Shared environment variables
- Cross-app navigation

### Technical Details
- Package name: `@digitalworkplace/intranet-iq`
- Development port: 3001
- Build system: Turbopack

---

## [Unreleased]

### Planned - Phase 2
- Connect to Supabase for real data
- Implement actual AI chat functionality
- Add real employee data to People directory
- Create real knowledge base articles

### Planned - Phase 3 (from PRD)
1. EPIC 1: Core Search and Discovery (Elasticsearch)
2. EPIC 2: AI-Driven Assistance (Multi-LLM backend)
3. EPIC 3: Knowledge Management (CRUD operations)
4. EPIC 4: Integration and Customization
5. EPIC 5: Security and Access Control
6. EPIC 6: Workflow Automation
7. EPIC 7: Dashboards and Analytics

---

*Part of Digital Workplace AI Product Suite*
*Location: /Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq*
