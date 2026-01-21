# dIQ - Intranet IQ | Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.7.0] - 2026-01-21

### Added - Performance Optimization Release

#### React Query Integration
- Installed `@tanstack/react-query` for client-side data caching
- Created `QueryProvider` with optimized defaults (30s stale, 5min cache)
- Created `useQueryHooks.ts` with centralized query keys
- Automatic request deduplication across components
- Stale-while-revalidate pattern for instant navigation

#### API Route Optimizations
- **Dashboard API**: Parallelized 5 queries with `Promise.all()` (~3-5x faster)
- **Content API**: Query-level filtering (categoryId, status, limit, offset)
- **People API**: Query-level filtering (departmentId, search, limit, offset)
- Fixed cross-schema joins (diq schema → public.users)
- Added `Cache-Control` headers for edge caching

#### Client-Side Optimizations
- Memoized `transformedEmployees` with `useMemo`
- Created O(1) lookup maps for org chart child finding
- Memoized `buildOrgTree` to prevent O(n²) rebuilds

#### Documentation
- Created `docs/PERFORMANCE_AUDIT.md` with verification checklist

### Changed
- Load times reduced from 10-15 seconds to ~2-3 seconds (60-80% improvement)
- Cached data loads instantly on navigation

### Fixed
- Cross-schema FK join errors between `diq` and `public` schemas
- Duplicate API requests on component re-renders

---

## [0.6.8] - 2026-01-21

### Added

#### PRD 100% Coverage Achieved
All 7 EPICs from the Product Requirements Document are now fully implemented.

#### New Components

**EPIC 3: Knowledge Management**
- `FileAttachmentUpload.tsx` - Drag-drop file upload with progress tracking, validation, expandable panel
- Integrated into `ArticleEditor.tsx` with Paperclip toolbar button

**EPIC 4: Integration & Collaboration**
- `PollWidget.tsx` - Full polling system with:
  - Create Poll Modal (multiple choice, anonymous, expiration)
  - Real-time voting with percentage bars
  - Poll management (close, delete, view results)

**EPIC 5: Security & Access Control**
- `AccessLogsViewer.tsx` - Access logs viewer with:
  - Search across all fields
  - Filters by action type, entity type, date range
  - Pagination with page navigation
  - CSV export functionality
  - Detail modal with full log information

**EPIC 6: Workflow Automation**
- `StructuredOutput.tsx` - Structured output formats:
  - Five view formats: Table, List, Summary, JSON, Markdown
  - Sortable table columns
  - Export to CSV, JSON, and Markdown
  - Collapsible output sections

**EPIC 7: Dashboards & Analytics**
- `DrillDownModal.tsx` - Interactive drill-down analytics:
  - Tabs for different breakdown views (by department, time, device)
  - Charts and visualizations for each metric type
  - Support for users, searches, conversations, views, daily activity, feature usage

- `DashboardConfigPanel.tsx` - Admin dashboard configuration:
  - Four tabs: Widgets, Layout Presets, Role Defaults, Appearance
  - Drag-drop widget ordering with enable/disable toggles
  - Pre-built layout presets (Default, Minimal, Productivity, Manager, Engagement)
  - Role-based default configurations
  - Appearance customization (theme, colors, card style, density, animations)

### Changed

**Analytics Page Updates**
- Made all metric cards clickable with drill-down functionality
- Made weekly activity chart bars clickable
- Made usage by feature section clickable
- Made AI performance metrics clickable
- Added visual hover states and "click for details" hints

### Documentation
- Updated `PRD_GAP_ANALYSIS.md` to reflect 100% coverage
- All 7 EPICs now marked as complete with detailed component references

### Summary by EPIC
| EPIC | Coverage | Status |
|------|----------|--------|
| EPIC 1: Core Search and Discovery | 100% | ✅ Complete |
| EPIC 2: AI-Driven Assistance | 100% | ✅ Complete |
| EPIC 3: Knowledge Management | 100% | ✅ Complete |
| EPIC 4: Integration and Customization | 100% | ✅ Complete |
| EPIC 5: Security and Access Control | 100% | ✅ Complete |
| EPIC 6: Workflow Automation | 100% | ✅ Complete |
| EPIC 7: Dashboards and Analytics | 100% | ✅ Complete |

---

## [0.6.7] - 2026-01-21

### Verified
- Triple-check PRD verification - 42/42 tests passed (100%)
- Section 10 Test Scenarios - 43/43 tests passed
- CRUD operations verified - all pages functional
- USER_GUIDE.md used as source of truth

---

## [0.6.6] - 2026-01-21

### Fixed
- **DASH-04**: Trending topics now auto-execute search when clicked
- **CONT-02**: KB categories tree now shows all published content

---

## [0.6.5] - 2026-01-21

### Verified
- Full Vercel production test - ALL 10 pages verified
- Search fix - Made embedding generation resilient to missing API key
- OpenAI API Key configured in Vercel for semantic search
- Anthropic API Key configured for AI summaries

---

## [0.2.7] - 2025-01-20

### Added

#### Enterprise Data Population
- 60 users across roles (super_admin, admin, user)
- 15 departments with organizational hierarchies
- 60 employees with realistic profiles
- 20 KB categories in tree structure
- 212 knowledge base articles
- 61 news posts
- 49 events
- 31 workflow templates
- 66 workflow steps
- 29 workflow executions
- 30 chat threads
- 26 chat messages
- 174 activity logs

#### API Routes for Cross-Schema Joins
- `/api/dashboard/route.ts` - News posts + events with user joins
- `/api/workflows/route.ts` - Workflows with creator + steps + executions
- `/api/people/route.ts` - Employees with department joins
- `/api/content/route.ts` - Articles with author joins

### Fixed
- Hydration Error in ChatSpaces.tsx
- Schema Permissions for anon and authenticated roles

---

## [0.2.6] - 2025-01-20

### Added
- UI Audit - All Non-Functional Buttons Fixed
- Security Enhancements (DOMPurify for XSS protection)
- Dynamic Greeting System
- Cross-App Authentication

---

## [0.2.2] - 2025-01-19

### Added
- Supabase Database Architecture
- dIQ Database Tables (21 tables)
- Cross-Project Features
- TypeScript Integration
- Documentation

---

## [0.2.1] - 2025-01-19

### Changed
- Logo Standard Finalized (SVG-based rendering)
- URL Routing Fix

---

## [0.2.0] - 2025-01-19

### Added
- All Core Pages Implemented (6 pages)
- dIQ Brand Identity
- Standalone Identity
- Dashboard Enhancements
- Favicon

---

## [0.1.0] - 2025-01-19

### Added
- Initial Project Setup
- Authentication (Clerk)
- Core Pages (Dashboard)
- Navigation
- Styling
- Documentation

---

*Part of Digital Workplace AI Product Suite*
*Location: /Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq*
