# City of Doral Admin Portal - Full Spectrum Implementation Module

**ITN No. 2025-20** | **Implementation Guide**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Design System](#design-system)
3. [Requirements Matrix](#requirements-matrix)
4. [Feature Specifications](#feature-specifications)
5. [Implementation Roadmap](#implementation-roadmap)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Security & Compliance](#security--compliance)

---

## Executive Summary

The Admin Portal is a critical component of the City of Doral AI Chatbot solution, required by ITN 2025-20. This document provides full spectrum implementation details for all admin-related features, ensuring compliance with mandatory requirements while matching the City of Doral's visual identity.

### Quick Stats

| Metric | Value |
|--------|-------|
| Total Requirements | 17 |
| Mandatory | 14 |
| Optional | 3 |
| Current Completion | 30% |

---

## Design System

### Color Palette

All admin portal components MUST use these exact colors to match the City of Doral website:

#### Primary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Primary Navy | `#000080` | 0, 0, 128 | Headers, primary buttons, chat widget |
| Primary Dark | `#000034` | 0, 0, 52 | Headings, emphasis text |
| Secondary Navy | `#0000a0` | 0, 0, 160 | Hover states on primary buttons |

#### Secondary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Business Blue | `#1D4F91` | 29, 79, 145 | Links, table headers, emphasis boxes |
| Teal Accent | `#006A52` | 6, 106, 82 | Selected tab states |
| Light Blue | `#1c95d4` | 28, 149, 212 | Accent elements |

#### Status Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Success Green | `#22c55e` | 34, 197, 94 | Positive indicators |
| Error Red | `#ef4444` | 239, 68, 68 | Error states |
| Warning Amber | `#f59e0b` | 245, 158, 11 | Warning states |
| Neutral Gray | `#9ca3af` | 156, 163, 175 | Neutral states |

#### Neutral Colors
| Name | Hex | Usage |
|------|-----|-------|
| White | `#FFFFFF` | Backgrounds, contrast |
| Light Gray | `#F5F9FD` | Alternating rows |
| Medium Gray | `#F3F4F6` | Card backgrounds |
| Text Gray | `#363535` | Body text |
| Light Text | `#666666` | Secondary text |
| Border Gray | `#E7EBF0` | Borders, dividers |

### Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title (H1) | 38px / 2.375em | Bold | #000034 |
| Section (H2) | 32px / 2em | Bold | #000034 |
| Subsection (H3) | 26px / 1.625em | Bold | #000034 |
| Card Title (H4) | 24px / 1.5em | Bold | #000034 |
| Body Text | 18px / 1.125em | 500 | #363535 |
| Small Text | 15px / 0.95em | Normal | #666666 |

**Font Family:** `"Figtree", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Component Patterns

#### Buttons
```css
/* Primary Button */
.btn-primary {
  background: #000080;
  color: #FFFFFF;
  padding: 8px 16px;
  border-radius: 0px; /* Sharp corners per website */
  transition: background-color 300ms ease-out;
}
.btn-primary:hover {
  background: #0000a0;
}

/* Icon FAB */
.fab-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #000080;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}
```

#### Cards
```css
.admin-card {
  background: #FFFFFF;
  border: 1px solid #E7EBF0;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
```

#### Tables
```css
.admin-table thead {
  background: #1D4F91;
  color: #FFFFFF;
}
.admin-table tbody tr:nth-child(even) {
  background: #F5F9FD;
}
.admin-table td {
  padding: 10px;
  border: 1px solid #E7EBF0;
}
```

### Spacing System

| Size | Value | Usage |
|------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Small gaps |
| md | 16px | Standard padding |
| lg | 24px | Section spacing |
| xl | 32px | Large gaps |

### Border Radius

| Type | Value | Usage |
|------|-------|-------|
| Sharp | 0px | Primary buttons |
| Subtle | 4px | Cards, inputs |
| Rounded | 8px | Chips, tags |
| Pill | 16px | Suggestion buttons |
| Circle | 50% | Avatars, FABs |

### Shadows

| Type | Value | Usage |
|------|-------|-------|
| Subtle | `0 1px 2px rgba(0,0,0,0.1)` | Cards |
| Medium | `0 4px 12px rgba(0,0,0,0.15)` | Elevated elements |
| Strong | `0 4px 20px rgba(0,0,0,0.2)` | Modals, dropdowns |

---

## Requirements Matrix

### Section 3.1.3 - Security & Privacy (MANDATORY)

| # | Requirement | Status | Priority | Implementation |
|---|-------------|--------|----------|----------------|
| 1 | Audit Trails | DONE | P1 | `/api/log` - Logs all interactions |
| 2 | Data Privacy Compliance | Partial | P1 | HTTPS in transit, at-rest TBD |
| 3 | Access Control | NOT STARTED | P1 | Role-based auth required |

**Audit Trails Implementation:**
- File: `src/app/api/log/route.ts`
- Storage: `data/conversations.json`
- Logs: sessionId, messages, sentiment, escalation, timestamps, userAgent

**Access Control Requirements:**
- Admin role: Full access
- Viewer role: Read-only analytics
- Editor role: Content management only
- Auditor role: Logs and reports only

### Section 3.1.4 - Self-Management (MANDATORY)

| # | Requirement | Status | Priority | Implementation |
|---|-------------|--------|----------|----------------|
| 4 | Content Management Interface | NOT STARTED | P1 | `/admin/content` |
| 5 | Daily Scraping Automation | NOT STARTED | P2 | Cron job setup |
| 6 | Announcements & Alerts | NOT STARTED | P2 | `/admin/announcements` |

**Content Management Features:**
- FAQ Editor (WYSIWYG)
- Workflow Builder (drag-and-drop)
- Knowledge Base Manager
- Response Template Editor

**Daily Scraping Requirements:**
- Automated daily at 2:00 AM EST
- Scrape cityofdoral.com and doralpd.com
- Update knowledge-base.json
- Email notification on failure

**Announcements System:**
- Create/Edit/Delete announcements
- Schedule publishing
- Set expiration dates
- Priority levels (Info, Warning, Critical)
- Push to chatbot users

### Section 3.1.5 - Power BI Integration (MANDATORY)

| # | Requirement | Status | Priority | Implementation |
|---|-------------|--------|----------|----------------|
| 7 | Power BI Analytics Integration | DONE | P1 | `/api/analytics` |

**Current Implementation:**
- File: `src/app/api/analytics/route.ts`
- Exports: JSON and CSV formats
- Metrics: conversations, satisfaction, escalation, sentiment, language
- Time Range: 7, 30, 90 days configurable

**Power BI Data Schema:**
```json
{
  "metadata": {
    "reportGeneratedAt": "ISO8601",
    "dateRange": { "start": "ISO8601", "end": "ISO8601", "days": 30 }
  },
  "summary": {
    "totalConversations": 0,
    "totalMessages": 0,
    "avgMessagesPerConversation": 0,
    "avgDurationSeconds": 0,
    "escalationRate": 0,
    "satisfactionRate": 0,
    "feedbackResponses": 0
  },
  "distributions": {
    "language": { "en": 0, "es": 0 },
    "sentiment": { "positive": 0, "neutral": 0, "negative": 0 }
  },
  "dailyMetrics": [
    { "date": "YYYY-MM-DD", "conversations": 0, "messages": 0, "escalated": 0 }
  ],
  "feedback": {
    "total": 0,
    "positive": 0,
    "negative": 0,
    "satisfactionPercentage": 0
  }
}
```

### Section 3.1.6 - Performance Monitoring (MANDATORY)

| # | Requirement | Status | Priority | Implementation |
|---|-------------|--------|----------|----------------|
| 8 | Performance Dashboard | DONE | P1 | `/admin` |
| 9 | User Feedback Mechanism | DONE | P1 | `/api/feedback` |
| 10 | KPI Tracking | Partial | P1 | Dashboard displays |

**Dashboard Metrics:**
- Total Conversations
- Satisfaction Rate (%)
- Escalation Rate (%)
- Average Duration (seconds)
- Language Distribution (EN/ES)
- Sentiment Distribution (Positive/Neutral/Negative)
- Feedback Summary

**KPIs to Track:**
1. Task Completion Rate
2. User Satisfaction Score
3. Response Accuracy
4. Average Response Time
5. Escalation Rate
6. Peak Usage Hours
7. Common Query Topics
8. Fallback Rate

### Section 3.2 - Additional Requirements

| # | Requirement | Status | Priority | Type |
|---|-------------|--------|----------|------|
| 11 | Multi-URL Configuration | NOT STARTED | P2 | Mandatory |
| 12 | LLM Configuration | Partial | P2 | Mandatory |
| 13 | CRM Integration Admin | NOT STARTED | P3 | Optional |
| 14 | SMS Integration Admin | NOT STARTED | P3 | Optional |
| 15 | Document Parsing Config | NOT STARTED | P2 | Mandatory |
| 16 | IVR & Social Admin | NOT STARTED | P3 | Mandatory |
| 17 | WCAG 2.1 Compliance | Partial | P1 | Mandatory |

---

## Feature Specifications

### 1. Dashboard Home (`/admin`)

**Status:** DONE

**Components:**
- Summary Cards (4): Conversations, Satisfaction, Escalation, Duration
- Language Distribution Chart
- Sentiment Analysis Chart
- Feedback Summary
- Power BI Export Buttons

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [< Back]  City of Doral - Admin Dashboard    [7d ▼] [↻]    │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ Convos   │ │ Satis %  │ │ Escal %  │ │ Avg Dur  │        │
│ │   123    │ │   87%    │ │   5%     │ │   45s    │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                             │
│ ┌────────────────────────┐ ┌────────────────────────┐      │
│ │ Language Distribution  │ │ Sentiment Analysis     │      │
│ │ ████████ EN 75%        │ │ ████ Positive 60%      │      │
│ │ ████ ES 25%            │ │ ██ Neutral 30%         │      │
│ │                        │ │ █ Negative 10%         │      │
│ └────────────────────────┘ └────────────────────────┘      │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ User Feedback Summary                                 │   │
│ │ Total: 50  Positive: 43  Negative: 7  Rate: 86%      │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Export for Power BI                                   │   │
│ │ [Export JSON]  [Export CSV]                          │   │
│ └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Content Management (`/admin/content`)

**Status:** NOT STARTED

**Features:**
- FAQ Management
- Workflow Builder
- Knowledge Base Editor
- Response Templates

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Content Management                              [+ Add New] │
├─────────────────────────────────────────────────────────────┤
│ [FAQs] [Workflows] [Knowledge Base] [Templates]             │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Search: [____________________] [🔍]                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Question                    │ Category    │ Actions    │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ What are City Hall hours?   │ Hours       │ [✏️] [🗑️]  │ │
│ │ How do I get a permit?      │ Permits     │ [✏️] [🗑️]  │ │
│ │ Where is Morgan Levy Park?  │ Parks       │ [✏️] [🗑️]  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**API Endpoints:**
- `GET /api/admin/content` - List all content
- `POST /api/admin/content` - Create content
- `PUT /api/admin/content/:id` - Update content
- `DELETE /api/admin/content/:id` - Delete content

### 3. Announcements (`/admin/announcements`)

**Status:** NOT STARTED

**Features:**
- Create/Edit/Delete announcements
- Schedule publishing
- Priority levels
- Multi-language support

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Announcements & Alerts                    [+ New Announcement]│
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Filter: [All ▼]  Status: [Active ▼]  [Search...]       │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔴 CRITICAL - City Hall Closed Jan 1                   │ │
│ │    Expires: 2026-01-02  Status: Active                 │ │
│ │    [Edit] [Deactivate]                                 │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 🟡 WARNING - Permit Office Hours Changed               │ │
│ │    Expires: 2026-01-31  Status: Scheduled              │ │
│ │    [Edit] [Deactivate]                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Data Model:**
```typescript
interface Announcement {
  id: string;
  title: { en: string; es: string };
  message: { en: string; es: string };
  priority: 'info' | 'warning' | 'critical';
  startDate: string;
  endDate: string;
  status: 'draft' | 'scheduled' | 'active' | 'expired';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### 4. User Management (`/admin/users`)

**Status:** NOT STARTED

**Features:**
- User list with roles
- Create/Edit/Delete users
- Role assignment
- Access logs

**Roles:**
| Role | Dashboard | Content | Users | Logs | Settings |
|------|-----------|---------|-------|------|----------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editor | ✅ | ✅ | ❌ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |
| Auditor | ✅ | ❌ | ❌ | ✅ | ❌ |

### 5. Conversation Logs (`/admin/logs`)

**Status:** NOT STARTED (API exists)

**Features:**
- Searchable conversation history
- Filter by date, language, sentiment
- Export functionality
- Escalation review

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Conversation Logs                              [Export All] │
├─────────────────────────────────────────────────────────────┤
│ Date: [From ▼] to [To ▼]  Language: [All ▼]  Escalated: [▼]│
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ID: conv_123  │  2026-01-01 10:30  │  EN  │  Neutral   │ │
│ │ User: What are City Hall hours?                        │ │
│ │ Bot: City Hall is open Monday-Friday 8AM-5PM...        │ │
│ │ [View Full] [Export]                                   │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ID: conv_124  │  2026-01-01 10:45  │  ES  │  ⚠️ Escal  │ │
│ │ User: Necesito hablar con alguien ahora                │ │
│ │ Bot: Entiendo su urgencia...                           │ │
│ │ [View Full] [Export] [Review Escalation]               │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 6. Settings (`/admin/settings`)

**Status:** NOT STARTED

**Features:**
- LLM Configuration
- Multi-URL Configuration
- Scraping Schedule
- Integration Settings
- Accessibility Options

**Sections:**
1. **AI Configuration**
   - Primary LLM: GPT-4o-mini
   - Backup LLM: Claude (failover)
   - Temperature: 0.7
   - Max Tokens: 1000

2. **Website Configuration**
   - Primary URL: cityofdoral.com
   - Secondary URL: doralpd.com
   - Scrape Schedule: Daily 2:00 AM

3. **Integrations**
   - Power BI: Enabled
   - SMS (Twilio): Disabled
   - IVR: Disabled
   - Social Media: Disabled

---

## Implementation Roadmap

### Phase 1: Core Admin (Current)
| Task | Status | File |
|------|--------|------|
| Dashboard Home | DONE | `/admin/page.tsx` |
| Analytics API | DONE | `/api/analytics/route.ts` |
| Feedback API | DONE | `/api/feedback/route.ts` |
| Logging API | DONE | `/api/log/route.ts` |

### Phase 2: Content Management
| Task | Status | File |
|------|--------|------|
| Content List Page | TODO | `/admin/content/page.tsx` |
| FAQ Editor | TODO | `/admin/content/faq/page.tsx` |
| Workflow Builder | TODO | `/admin/content/workflows/page.tsx` |
| Content API | TODO | `/api/admin/content/route.ts` |

### Phase 3: User & Access
| Task | Status | File |
|------|--------|------|
| User List Page | TODO | `/admin/users/page.tsx` |
| Role Management | TODO | `/admin/users/roles/page.tsx` |
| Auth Middleware | TODO | `src/middleware.ts` |
| User API | TODO | `/api/admin/users/route.ts` |

### Phase 4: Advanced Features
| Task | Status | File |
|------|--------|------|
| Announcements | TODO | `/admin/announcements/page.tsx` |
| Conversation Logs | TODO | `/admin/logs/page.tsx` |
| Settings | TODO | `/admin/settings/page.tsx` |
| Scraping Automation | TODO | `scripts/cron-scraper.mjs` |

---

## API Endpoints

### Existing Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/chat` | POST | Main chat endpoint | DONE |
| `/api/knowledge` | POST | RAG search | DONE |
| `/api/feedback` | GET/POST | User feedback | DONE |
| `/api/log` | GET/POST | Conversation logs | DONE |
| `/api/analytics` | GET | Power BI export | DONE |

### Planned Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/admin/content` | CRUD | Content management | TODO |
| `/api/admin/users` | CRUD | User management | TODO |
| `/api/admin/announcements` | CRUD | Announcements | TODO |
| `/api/admin/settings` | GET/PUT | Settings | TODO |
| `/api/admin/scrape` | POST | Manual scrape trigger | TODO |

---

## Database Schema

### conversations.json
```typescript
interface ConversationEntry {
  id: string;
  sessionId: string;
  startTime: string;
  endTime: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  language: 'en' | 'es';
  sentiment: 'positive' | 'neutral' | 'negative';
  escalated: boolean;
  feedbackGiven: boolean;
  userAgent: string;
  referrer: string;
}
```

### feedback.json
```typescript
interface FeedbackEntry {
  id: string;
  messageId: string;
  conversationId: string;
  rating: 'positive' | 'negative';
  query: string;
  response: string;
  timestamp: string;
  language: 'en' | 'es';
}
```

### announcements.json (Planned)
```typescript
interface Announcement {
  id: string;
  title: { en: string; es: string };
  message: { en: string; es: string };
  priority: 'info' | 'warning' | 'critical';
  startDate: string;
  endDate: string;
  status: 'draft' | 'scheduled' | 'active' | 'expired';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### users.json (Planned)
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer' | 'auditor';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}
```

---

## Security & Compliance

### Access Control Requirements (ITN 3.1.3)

1. **Authentication**
   - Email/password login
   - Session management
   - Password requirements (8+ chars, mixed case, numbers)

2. **Authorization**
   - Role-based access control (RBAC)
   - Permission matrix per role
   - API endpoint protection

3. **Audit Logging**
   - All admin actions logged
   - Timestamp, user, action, target
   - Retention: 1 year minimum

### Data Privacy (ITN 3.1.3)

1. **PII Encryption**
   - At rest: AES-256
   - In transit: TLS 1.3

2. **Data Retention**
   - Conversations: 90 days
   - Feedback: 1 year
   - Audit logs: 1 year

### WCAG 2.1 Compliance (ITN 3.2.1)

1. **Keyboard Navigation**
   - All interactive elements focusable
   - Logical tab order
   - Skip links

2. **Screen Reader**
   - ARIA labels
   - Semantic HTML
   - Live regions for updates

3. **Visual**
   - Color contrast AA (4.5:1)
   - Resizable text
   - Focus indicators

---

## Files Reference

### Created Files
| File | Purpose |
|------|---------|
| `src/app/admin/page.tsx` | Admin dashboard |
| `src/app/api/feedback/route.ts` | Feedback API |
| `src/app/api/log/route.ts` | Conversation logging API |
| `src/app/api/analytics/route.ts` | Power BI export |
| `data/conversations.json` | Conversation storage |
| `data/feedback.json` | Feedback storage |

### Planned Files
| File | Purpose |
|------|---------|
| `src/app/admin/content/page.tsx` | Content management |
| `src/app/admin/users/page.tsx` | User management |
| `src/app/admin/announcements/page.tsx` | Announcements |
| `src/app/admin/logs/page.tsx` | Conversation logs UI |
| `src/app/admin/settings/page.tsx` | Settings |
| `src/middleware.ts` | Auth middleware |
| `scripts/cron-scraper.mjs` | Automated scraping |

---

## Appendix: CSS Variables for Admin Portal

```css
:root {
  /* Primary */
  --admin-primary: #000080;
  --admin-primary-dark: #000034;
  --admin-primary-hover: #0000a0;

  /* Secondary */
  --admin-business-blue: #1D4F91;
  --admin-teal: #006A52;

  /* Status */
  --admin-success: #22c55e;
  --admin-error: #ef4444;
  --admin-warning: #f59e0b;

  /* Neutral */
  --admin-white: #FFFFFF;
  --admin-light-gray: #F5F9FD;
  --admin-medium-gray: #F3F4F6;
  --admin-text: #363535;
  --admin-text-light: #666666;
  --admin-border: #E7EBF0;

  /* Typography */
  --admin-font: "Figtree", -apple-system, BlinkMacSystemFont, sans-serif;

  /* Spacing */
  --admin-space-xs: 4px;
  --admin-space-sm: 8px;
  --admin-space-md: 16px;
  --admin-space-lg: 24px;
  --admin-space-xl: 32px;

  /* Shadows */
  --admin-shadow-subtle: 0 1px 2px rgba(0,0,0,0.1);
  --admin-shadow-medium: 0 4px 12px rgba(0,0,0,0.15);
}
```

---

**Document Version:** 1.0
**Last Updated:** 2026-01-01
**Author:** Claude Code
