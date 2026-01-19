# dIQ - Intranet IQ | Design Context & Specifications

---

## PURPOSE

This document contains design specifications, UI/UX guidelines, and brand identity details for **dIQ (Intranet IQ)** - the AI-powered internal knowledge network.

---

## dIQ BRAND IDENTITY

### Logo System

**Standard Format for all Digital Workplace products:**
```
Bold letter + regular suffix + dot (all on same baseline)
─────────────────────────────────────────────────────────
dIQ·  → Digital Intranet IQ
dSQ·  → Digital Support IQ
dTQ·  → Digital Test Pilot IQ
dCQ·  → Digital Chat Core IQ
```

### Logo Specifications (Official Standard)

```
┌─────────────────────────────────────┐
│                                     │
│    d I Q ·                          │
│    ↑ ↑ ↑ ↑                          │
│    │ │ │ └── Blue dot (#60a5fa)     │
│    │ │ └──── Q (regular, 85% opacity)│
│    │ └────── I (regular, 85% opacity)│
│    └──────── d (bold, 100% opacity)  │
│                                     │
│    ALL ON SAME BASELINE             │
│                                     │
└─────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| **"d"** | Bold (fontWeight 700), 100% opacity |
| **"I"** | Regular (fontWeight 400), 85% opacity |
| **"Q"** | Regular (fontWeight 400), 85% opacity |
| **Dot** | Blue circle (#60a5fa) with glow |
| **Alignment** | All elements on same baseline |
| **Background** | Blue-purple gradient |
| **Font** | ui-monospace, SF Mono, Menlo, Monaco, Consolas |
| **Animation** | Glitch effect (4s interval) |
| **Rendering** | SVG-based for pixel-perfect alignment |

### SVG Implementation
```jsx
<svg height="18" viewBox="0 0 32 18">
  <text x="0" y="14" fill="white" fontSize="18" fontWeight="700">d</text>
  <text x="11" y="14" fill="white" fillOpacity="0.85" fontSize="10" fontWeight="400">I</text>
  <text x="16.5" y="14" fill="white" fillOpacity="0.85" fontSize="10" fontWeight="400">Q</text>
  <circle cx="27" cy="13" r="2.5" fill="#60a5fa" />
</svg>
```

### Size Variants
| Size | "d" font | "IQ" font | Dot radius |
|------|----------|-----------|------------|
| sm   | 16px     | 9px       | 2px        |
| md   | 20px     | 11px      | 2.5px      |
| lg   | 26px     | 14px      | 3px        |
| xl   | 32px     | 17px      | 3.5px      |

### Favicon
- **Design:** "d." with green dot (matches Digital Workplace AI)
- **Background:** Dark (#0f0f1a)
- **Dot Color:** Green (#4ade80)
- **Size:** 32x32 (browser), 180x180 (Apple)
- **File:** `src/app/icon.tsx` (dynamic generation)

### Page Titles
- **Default:** "dIQ - Intranet IQ"
- **Template:** "%s | dIQ"
- **Example:** "Settings | dIQ"

---

## DESIGN PHILOSOPHY

### Core Principles
1. **Intelligence First** - AI assistance is always accessible
2. **Instant Discovery** - Search is the primary interaction
3. **Contextual Awareness** - UI adapts to user role and context
4. **Standalone Identity** - Clear dIQ branding, separate from main app

### User Experience Goals
- Zero-training adoption
- Sub-second search responses
- Conversational AI interactions
- Mobile-first responsiveness

---

## VISUAL DESIGN SYSTEM

### Color Palette

#### Primary Colors (Blue Theme)
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Background Dark | #0a0a0f | 10, 10, 15 | Main page background |
| Background Card | #0f0f14 | 15, 15, 20 | Cards, sidebar, panels |
| Background Input | #1a1a1f | 26, 26, 31 | Input fields, search bars |
| Background Hover | #252530 | 37, 37, 48 | Hover states |

#### Brand Gradient
```css
background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
```

#### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| Primary Blue | #3b82f6 | Primary actions, links, dIQ brand |
| Secondary Purple | #8b5cf6 | Secondary elements, gradients |
| Accent Cyan | #06b6d4 | Highlights, badges |
| Success Green | #22c55e | Success states |
| Warning Amber | #f59e0b | Warnings |
| Error Red | #ef4444 | Errors |
| Blue Dot | #60a5fa | Logo indicator dot |

#### Text Colors
| Name | Value | Usage |
|------|-------|-------|
| Text Primary | white | Headings, primary text |
| Text Secondary | rgba(255,255,255,0.7) | Body text |
| Text Muted | rgba(255,255,255,0.5) | Helper text, timestamps |
| Text Disabled | rgba(255,255,255,0.3) | Disabled states |

### Typography

#### Font Stack
```css
/* Primary */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Brand/Code */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

#### Type Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 36px | 700 | 1.2 |
| H2 | 28px | 600 | 1.3 |
| H3 | 22px | 600 | 1.4 |
| H4 | 18px | 500 | 1.4 |
| Body | 16px | 400 | 1.5 |
| Small | 14px | 400 | 1.5 |
| Caption | 12px | 400 | 1.4 |

### Spacing System
| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Small gaps |
| md | 16px | Standard spacing |
| lg | 24px | Section gaps |
| xl | 32px | Large sections |
| 2xl | 48px | Page margins |

### Border Radius
| Name | Value | Usage |
|------|-------|-------|
| sm | 6px | Buttons, inputs |
| md | 8px | Cards |
| lg | 12px | Modals, panels |
| xl | 16px | Large containers |
| full | 9999px | Avatars, badges |

---

## COMPONENT SPECIFICATIONS

### Sidebar Navigation
- **Width:** 64px (collapsed)
- **Background:** #0f0f14
- **Border:** 1px solid rgba(255,255,255,0.1)
- **Icon Size:** 20px
- **Logo:** dIQ logo at top (links to dashboard)
- **Active State:** Blue gradient bg + left indicator bar

### Dashboard Header Badge
- **Content:** "dIQ" badge + "Intranet IQ" label + port indicator
- **Badge Style:** Gradient background, rounded corners
- **Position:** Top of main content area

### Search Bar (Hero)
- **Height:** 56px
- **Background:** #1a1a1f
- **Border:** 1px solid rgba(255,255,255,0.1)
- **Placeholder:** "Ask anything..."
- **Icon:** Search (left), Sparkles (right)

### Quick Action Cards
- **Background:** gradient (blue to purple)
- **Border Radius:** 12px
- **Padding:** 20px
- **Icon Size:** 24px
- **Hover:** Scale 1.02, enhanced shadow

### Activity Items
- **Avatar Size:** 40px
- **Padding:** 16px
- **Border Bottom:** 1px solid rgba(255,255,255,0.05)

### Trending Topics
- **Badge Style:** Pill shape
- **Background:** rgba(59,130,246,0.2)
- **Text Color:** #3b82f6
- **Padding:** 8px 16px

---

## PAGE LAYOUTS

### Dashboard (/dashboard)
```
┌─────────────────────────────────────────────────────┐
│ Sidebar │           Main Content Area               │
│  64px   │                                           │
│         │  ┌─────────────────────────────────────┐  │
│ [dIQ]   │  │  [dIQ Badge] Intranet IQ  :3001    │  │
│         │  └─────────────────────────────────────┘  │
│ [Home]  │  ┌─────────────────────────────────────┐  │
│ [Chat]  │  │  Greeting + Search Bar              │  │
│ [Agents]│  └─────────────────────────────────────┘  │
│ [People]│                                           │
│ [Content│  ┌────────┐ ┌────────┐ ┌────────┐       │
│         │  │ Quick  │ │ Quick  │ │ Quick  │       │
│ [Search]│  │ Action │ │ Action │ │ Action │       │
│ [Gear]  │  └────────┘ └────────┘ └────────┘       │
│         │                                           │
│         │  ┌─────────────────────────────────────┐ │
│         │  │ Recent Activity / Trending Topics   │ │
│         │  └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Chat (/chat)
```
┌─────────────────────────────────────────────────────┐
│ Sidebar │           Chat Interface                  │
│         │                                           │
│         │  ┌─────────────────────────────────────┐  │
│         │  │  LLM Selector + Model Options       │  │
│         │  └─────────────────────────────────────┘  │
│         │  ┌─────────────────────────────────────┐  │
│         │  │  Conversation History (scrollable)  │  │
│         │  │                                     │  │
│         │  │  [AI Message + Sources]             │  │
│         │  │                    [User Message]   │  │
│         │  │  [AI Message + Confidence Score]   │  │
│         │  └─────────────────────────────────────┘  │
│         │  ┌─────────────────────────────────────┐  │
│         │  │  Input Field + Send Button          │  │
│         │  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### People (/people)
```
┌─────────────────────────────────────────────────────┐
│ Sidebar │           People Directory                │
│         │                                           │
│         │  ┌─────────────────────────────────────┐  │
│         │  │  Search + View Toggle (Grid/List)   │  │
│         │  └─────────────────────────────────────┘  │
│         │                                           │
│         │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│         │  │Person│ │Person│ │Person│ │Person│    │
│         │  │ Card │ │ Card │ │ Card │ │ Card │    │
│         │  └──────┘ └──────┘ └──────┘ └──────┘    │
│         │                                           │
│         │  ┌─────────────────────────────────────┐ │
│         │  │ Selected Person Detail Panel        │ │
│         │  └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## ANIMATION GUIDELINES

### Transitions
- **Duration:** 200ms (fast), 300ms (normal), 500ms (slow)
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1)

### Motion Patterns
- **Page transitions:** Fade + slide (300ms)
- **Modal open:** Scale up from 0.95 (200ms)
- **Sidebar toggle:** Width transition (200ms)
- **Hover effects:** Scale 1.02 + shadow (200ms)

### Logo Glitch Effect
```typescript
// Triggers every 4 seconds
const triggerGlitch = () => {
  setGlitch(true);
  setTimeout(() => setGlitch(false), 150);
};

// Chromatic aberration effect
// Cyan layer: translate(-1px, 0)
// Red layer: translate(1px, 0)
```

---

## RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640-1024px | Sidebar collapsed |
| Desktop | 1024-1440px | Full sidebar |
| Wide | > 1440px | Centered max-width container |

---

## ACCESSIBILITY

### Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast 4.5:1 minimum

### Focus States
- Visible focus ring (2px blue outline)
- Skip-to-content link
- Logical tab order

---

## DATA MODELS (Supabase)

### Database Schema
```
public schema (shared)     diq schema (project-specific)
├── organizations          ├── departments
├── projects               ├── employees
├── users                  ├── kb_categories
├── user_project_access    ├── articles / article_versions
├── knowledge_items        ├── chat_threads / chat_messages
└── activity_log           ├── workflows / workflow_steps
                           ├── news_posts / news_comments
                           ├── events / event_rsvps
                           └── bookmarks / user_settings
```

### User (public.users)
```typescript
interface User {
  id: string;
  clerk_id: string | null;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'super_admin';
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}
```

### Employee (diq.employees)
```typescript
interface Employee {
  id: string;
  user_id: string;
  department_id: string | null;
  job_title: string | null;
  manager_id: string | null;
  office_location: string | null;
  phone: string | null;
  skills: string[];
  bio: string | null;
  start_date: string | null;
  is_active: boolean;
}
```

### Article (diq.articles)
```typescript
interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category_id: string | null;
  author_id: string;
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  tags: string[];
  view_count: number;
  helpful_count: number;
  version: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
```

### ChatThread (diq.chat_threads)
```typescript
interface ChatThread {
  id: string;
  user_id: string;
  title: string | null;
  status: 'active' | 'archived' | 'deleted';
  llm_model: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
```

### ChatMessage (diq.chat_messages)
```typescript
interface ChatMessage {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources: object[];
  confidence: number | null;
  tokens_used: number | null;
  llm_model: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
```

### Workflow (diq.workflows)
```typescript
interface Workflow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: 'manual' | 'scheduled' | 'event';
  status: 'draft' | 'active' | 'paused' | 'archived';
  is_template: boolean;
  created_by: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
```

### KnowledgeItem (public.knowledge_items - Cross-Project Search)
```typescript
interface KnowledgeItem {
  id: string;
  project_id: string;
  source_table: string;
  source_id: string;
  type: string;
  title: string;
  content: string | null;
  url: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
```

---

## INTEGRATION POINTS

### Main App (Digital Workplace AI)
- **URL:** http://localhost:3000 (dev)
- **Auth:** Shared Clerk authentication
- **Database:** Shared Supabase instance

### External Services
- Supabase (Database)
- Clerk (Authentication)
- Elasticsearch (Search) - planned
- LLM APIs (AI Assistant) - planned

---

*Last Updated: January 19, 2025*
*Version: 0.2.2*
*Part of Digital Workplace AI Product Suite*
