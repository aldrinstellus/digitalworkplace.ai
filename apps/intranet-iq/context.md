# dIQ - Intranet IQ | Design Context & Specifications

---

## PURPOSE

This document contains design specifications, UI/UX guidelines, and brand identity details for **dIQ (Intranet IQ)** - the AI-powered internal knowledge network.

**Version:** 1.1.1
**Design System:** Midnight Ember
**Last Updated:** January 22, 2026
**Audit Score:** 100/100 (Full Spectrum Implementation - Post-Audit TypeScript Cleanup)

---

## DESIGN SYSTEM: MIDNIGHT EMBER

### Overview
Midnight Ember is a warm, distinctive dark theme that avoids the generic "AI-generated" blue/purple aesthetic. It features:
- Deep obsidian backgrounds
- Warm ember/orange accent colors
- Gold highlights for emphasis
- Subtle animations throughout
- WCAG 2.1 AA compliant contrast ratios

### Color Palette

#### Backgrounds
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--bg-obsidian` | #08080c | 8, 8, 12 | Primary page background |
| `--bg-charcoal` | #121218 | 18, 18, 24 | Cards, elevated surfaces |
| `--bg-slate` | #1c1c24 | 28, 28, 36 | Inputs, hover states |
| `--bg-elevated` | #252530 | 37, 37, 48 | Modals, dropdowns |

#### Borders
| Token | Value | Usage |
|-------|-------|-------|
| `--border-subtle` | rgba(255,255,255,0.06) | Subtle separators |
| `--border-default` | rgba(255,255,255,0.12) | Default borders |
| `--border-strong` | rgba(255,255,255,0.20) | Emphasized borders |

#### Accent Colors (Ember Palette)
| Token | Hex | Usage |
|-------|-----|-------|
| `--accent-ember` | #f97316 | Primary accent (buttons, links) |
| `--accent-ember-soft` | #fb923c | Hover states |
| `--accent-copper` | #ea580c | Active/pressed states |
| `--accent-gold` | #fbbf24 | Highlights, badges, emphasis |

#### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | #22c55e | Success states |
| `--warning` | #eab308 | Warning states |
| `--error` | #ef4444 | Error states |
| `--info` | #3b82f6 | Informational |

#### Text Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | #fafafa | Headings, primary text |
| `--text-secondary` | rgba(250,250,250,0.7) | Body text |
| `--text-muted` | rgba(250,250,250,0.5) | Helper text, timestamps |
| `--text-disabled` | rgba(250,250,250,0.3) | Disabled states |

---

## dIQ BRAND IDENTITY

### Logo System

**Standard Format for all Digital Workplace products:**
```
Bold letter + regular suffix + dot (all on same baseline)
---------------------------------------------------------
dIQ·  -> Digital Intranet IQ
dSQ·  -> Digital Support IQ
dTQ·  -> Digital Test Pilot IQ
dCQ·  -> Digital Chat Core IQ
```

### Logo Specifications (Official Standard)

```
+-------------------------------------+
|                                     |
|    d I Q .                          |
|    ^ ^ ^ ^                          |
|    | | | +-- Orange dot (#f97316)   |
|    | | +---- Q (regular, 85% opacity)|
|    | +------ I (regular, 85% opacity)|
|    +-------- d (bold, 100% opacity)  |
|                                     |
|    ALL ON SAME BASELINE             |
|                                     |
+-------------------------------------+
```

| Property | Value |
|----------|-------|
| **"d"** | Bold (fontWeight 700), 100% opacity |
| **"I"** | Regular (fontWeight 400), 85% opacity |
| **"Q"** | Regular (fontWeight 400), 85% opacity |
| **Dot** | Orange circle (#f97316) with glow |
| **Alignment** | All elements on same baseline |
| **Background** | Ember gradient or transparent |
| **Font** | ui-monospace, SF Mono, Menlo, Monaco, Consolas |
| **Animation** | Subtle pulse effect |
| **Rendering** | SVG-based for pixel-perfect alignment |

### SVG Implementation
```jsx
<svg height="18" viewBox="0 0 32 18">
  <text x="0" y="14" fill="white" fontSize="18" fontWeight="700">d</text>
  <text x="11" y="14" fill="white" fillOpacity="0.85" fontSize="10" fontWeight="400">I</text>
  <text x="16.5" y="14" fill="white" fillOpacity="0.85" fontSize="10" fontWeight="400">Q</text>
  <circle cx="27" cy="13" r="2.5" fill="#f97316" />
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
- **Background:** Dark (#08080c)
- **Dot Color:** Green (#4ade80)
- **Size:** 32x32 (browser), 180x180 (Apple)
- **File:** `src/app/icon.tsx` (dynamic generation)

### Page Titles
- **Default:** "dIQ - Intranet IQ"
- **Template:** "%s | dIQ"
- **Example:** "Settings | dIQ"

---

## TYPOGRAPHY

### Font Stack
```css
/* Primary */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Brand/Code */
font-family: ui-monospace, 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 36px | 700 | 1.2 |
| H2 | 28px | 600 | 1.3 |
| H3 | 22px | 600 | 1.4 |
| H4 | 18px | 500 | 1.4 |
| Body | 16px | 400 | 1.5 |
| Small | 14px | 400 | 1.5 |
| Caption | 12px | 400 | 1.4 |

---

## SPACING SYSTEM

| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Small gaps |
| md | 16px | Standard spacing |
| lg | 24px | Section gaps |
| xl | 32px | Large sections |
| 2xl | 48px | Page margins |

---

## BORDER RADIUS

| Name | Value | Usage |
|------|-------|-------|
| sm | 6px | Buttons, inputs |
| md | 8px | Cards |
| lg | 12px | Modals, panels |
| xl | 16px | Large containers |
| full | 9999px | Avatars, badges |

---

## ANIMATION GUIDELINES

### Framer Motion Integration
All animations use Framer Motion v12 with consistent patterns.

### Motion Components (`src/lib/motion.tsx`)
```typescript
// FadeIn - Standard entrance animation
<FadeIn delay={0.1}>
  <Card />
</FadeIn>

// SlideIn - Directional slide
<SlideIn direction="left">
  <Sidebar />
</SlideIn>

// StaggerList - Children animate in sequence
<StaggerList staggerDelay={0.05}>
  {items.map(item => <Item key={item.id} />)}
</StaggerList>

// ScaleOnHover - Interactive feedback
<ScaleOnHover scale={1.02}>
  <Button />
</ScaleOnHover>
```

### Animation Tokens
| Property | Value | Usage |
|----------|-------|-------|
| Duration (fast) | 200ms | Quick interactions |
| Duration (normal) | 300ms | Standard transitions |
| Duration (slow) | 500ms | Page transitions |
| Easing | cubic-bezier(0.22, 1, 0.36, 1) | Smooth deceleration |
| Spring stiffness | 400 | Bouncy feel |
| Spring damping | 25 | Controlled settling |

### Reduced Motion Support
```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Animations respect user preference
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{
    duration: prefersReducedMotion ? 0 : 0.3
  }}
/>
```

---

## COMPONENT SPECIFICATIONS

### Sidebar Navigation
- **Width:** 64px (collapsed)
- **Background:** #121218
- **Border:** 1px solid rgba(255,255,255,0.06)
- **Icon Size:** 20px
- **Logo:** dIQ logo at top (links to dashboard)
- **Active State:** Ember gradient bg + left indicator bar
- **Hover:** Subtle glow effect

### Cards
- **Background:** #121218
- **Border:** 1px solid rgba(255,255,255,0.06)
- **Border Radius:** 12px
- **Padding:** 20px
- **Hover:** Subtle ember glow shadow
- **Animation:** Scale 1.01 on hover

### Buttons
| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary | #f97316 | white | none |
| Secondary | transparent | #f97316 | 1px #f97316 |
| Ghost | transparent | #fafafa | none |
| Danger | #ef4444 | white | none |

### Inputs
- **Background:** #1c1c24
- **Border:** 1px solid rgba(255,255,255,0.12)
- **Focus Border:** #f97316
- **Focus Glow:** 0 0 0 2px rgba(249,115,22,0.2)
- **Border Radius:** 8px
- **Padding:** 12px 16px

### Search Bar (Hero)
- **Height:** 56px
- **Background:** #1c1c24
- **Border:** 1px solid rgba(255,255,255,0.12)
- **Placeholder:** "Ask anything..."
- **Icon:** Search (left), Sparkles (right)
- **Focus:** Ember glow effect

---

## PAGE LAYOUTS

### Dashboard (`/diq/dashboard`)
```
+---------------------------------------------------+
| Sidebar |           Main Content Area              |
|  64px   |                                          |
|         |  +---------------------------------+     |
| [dIQ]   |  |  "Good [time], [Name]"         |     |
|         |  |  For you | Company tabs         |     |
| [Home]  |  +---------------------------------+     |
| [Chat]  |  +---------------------------------+     |
| [Agents]|  |  Search Bar ("Ask anything...")  |     |
| [People]|  +---------------------------------+     |
| [Content|                                          |
|         |  +-------+ +-------+ +-------+          |
| [Search]|  | Quick | | Quick | | Quick |          |
| [Gear]  |  | Action| | Action| | Action|          |
|         |  +-------+ +-------+ +-------+          |
|         |                                          |
|         |  +---------------------------------+    |
|         |  | Recent Activity / News Feed     |    |
|         |  +---------------------------------+    |
+---------------------------------------------------+
```

### Content (`/diq/content`)
```
+---------------------------------------------------+
| Sidebar |           Content Browser               |
|         |                                          |
|         |  +-----------+---------------------+     |
|         |  | Category  |  Article Display    |     |
|         |  | Tree      |                     |     |
|         |  | (left)    |  Title              |     |
|         |  |           |  Published badge    |     |
|         |  | Recent    |  Views / Helpful    |     |
|         |  | Documents |                     |     |
|         |  | (list)    |  Content preview    |     |
|         |  |           |                     |     |
|         |  +-----------+---------------------+     |
+---------------------------------------------------+
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
- Color contrast 4.5:1 minimum for text
- 3:1 minimum for interactive elements

### Focus States
- Visible focus ring: 2px ember outline with 2px offset
- Skip-to-content link
- Logical tab order

### Reduced Motion
- All animations respect `prefers-reduced-motion`
- Essential animations use opacity only
- No auto-playing animations that can't be paused

---

## DATA MODELS (Supabase)

### Database Schema
```
public schema (shared)     diq schema (project-specific)
+-- organizations          +-- departments (15)
+-- projects               +-- employees (60)
+-- users (60+)            +-- kb_categories (20)
+-- user_project_access    +-- articles (212)
+-- knowledge_items        +-- article_versions
+-- activity_log           +-- chat_threads (30)
                           +-- chat_messages (26)
                           +-- search_history
                           +-- workflows (31)
                           +-- workflow_steps (66)
                           +-- workflow_executions (29)
                           +-- news_posts (61)
                           +-- news_comments
                           +-- events (49)
                           +-- event_rsvps
                           +-- bookmarks
                           +-- user_settings
                           +-- notifications
                           +-- notification_preferences
                           +-- reactions
                           +-- recognitions
                           +-- recognition_recipients
                           +-- polls
                           +-- poll_options
                           +-- poll_votes
                           +-- channels
                           +-- channel_members
                           +-- channel_messages
                           +-- celebrations
                           +-- tasks
                           +-- connectors
                           +-- connector_items
                           +-- kb_spaces
                           +-- kb_space_items
                           +-- frameworks
                           +-- saas_products
                           +-- search_logs
                           +-- ai_usage_logs
                           +-- system_health_logs
                           +-- workflow_execution_logs
                           +-- page_view_logs
                           +-- user_activity_summary
```

### Key TypeScript Interfaces

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

---

## DEPLOYMENT

### Production URLs

| Service | URL |
|---------|-----|
| **dIQ Production** | https://intranet-iq.vercel.app |
| **dIQ Dashboard** | https://intranet-iq.vercel.app/diq/dashboard |
| **Main App** | https://digitalworkplace-ai.vercel.app |
| **Main App Link** | `apps/main/src/app/dashboard/page.tsx:29` |

### Latest Deployment
- **Git Commit:** Pending
- **Date:** January 22, 2026
- **Version:** 1.1.0
- **Changes:** Full Spectrum Implementation - 100% Feature Coverage

---

## WORKFLOW BUILDER (Glean-Inspired)

### Overview
The workflow builder uses ReactFlow (@xyflow/react) for a professional, drag-and-drop workflow canvas with vertical (top-to-bottom) layout.

### Architecture
```
src/components/workflow/
├── WorkflowBuilder.tsx        # Main container with ReactFlowProvider
├── WorkflowCanvasNew.tsx      # ReactFlow canvas with drag-drop
├── ComponentPalette.tsx       # Right-side panel for adding nodes
├── WorkflowControls.tsx       # Floating toolbar (bottom-center)
├── ContextMenu.tsx            # Right-click context menu
├── nodes/
│   ├── BaseNode.tsx           # Universal node component
│   └── index.ts               # Node type registry
├── edges/
│   ├── DefaultEdge.tsx        # Standard connection
│   ├── ConditionalEdge.tsx    # Yes/No branches
│   └── index.ts               # Edge type registry
└── panels/
    └── NodeConfigPanel.tsx    # Slide-out config panel

src/lib/workflow/
├── store.ts                   # Zustand state management
├── types.ts                   # TypeScript types
├── constants.ts               # Node configs, colors
├── validation.ts              # Connection validation
├── serialization.ts           # DB ↔ ReactFlow conversion
└── autoLayout.ts              # Dagre auto-layout
```

### Node Types & Colors
| Type | Icon | Color | Handles |
|------|------|-------|---------|
| trigger | Zap | Purple (#a855f7) | Output only (bottom) |
| search | Search | Blue (#3b82f6) | Input (top) + Output (bottom) |
| action | Play | Green (#22c55e) | Input (top) + Output (bottom) |
| condition | GitBranch | Orange (#f97316) | Input (top) + Yes/No (bottom) |
| transform | Shuffle | Cyan (#06b6d4) | Input (top) + Output (bottom) |
| output | CheckCircle | Gold (#fbbf24) | Input only (top) |

### Workflow Templates (6)
1. **Employee Onboarding** - HR onboarding automation
2. **Document Approval** - Review and approval workflow
3. **Data Sync** - System-to-system data synchronization
4. **Report Generation** - Automated report creation
5. **Email Campaign** - Marketing email automation
6. **Ticket Routing** - Support ticket assignment

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Cmd/Ctrl + C` | Copy selected nodes |
| `Cmd/Ctrl + V` | Paste nodes |
| `Cmd/Ctrl + D` | Duplicate selected |
| `Cmd/Ctrl + A` | Select all |
| `Delete` | Delete selected |
| `Escape` | Deselect all |
| `Enter` | Open config panel |

### State Management (Zustand)
```typescript
interface WorkflowStore {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  isDirty: boolean;
  history: HistoryState[];
  historyIndex: number;

  // Actions
  addNode: (type, position) => void;
  deleteNode: (id) => void;
  updateNode: (id, updates) => void;
  undo: () => void;
  redo: () => void;
  copySelectedNodes: () => void;
  pasteNodes: () => void;
  // ... more actions
}
```

---

## PERFORMANCE OPTIMIZATIONS

### React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,        // 30 seconds
      gcTime: 5 * 60 * 1000,       // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

### API Parallelization
- Dashboard: 5 queries in parallel with `Promise.all()`
- Content/People: Query-level filtering reduces data transfer by 50%

### Memoization
- Org chart tree building: O(n) with lookup maps
- Employee transformations: `useMemo` for derived data

### Cache Headers
```typescript
response.headers.set(
  'Cache-Control',
  'public, s-maxage=60, stale-while-revalidate=120'
);
```

---

---

## v1.1.0 FULL SPECTRUM FEATURES

### AI Assistant (Point 2) - 100%
- **Conversation History**: Full context from previous messages in threads
- **Streaming Responses**: Server-Sent Events for real-time AI responses
- **Vector RAG**: Semantic search using pgvector embeddings (1536 dimensions)
- **File Processing**: PDF, text, markdown parsing with automatic embedding
- **Function Calling**: Tool use for search, employee lookup, workflow triggers

### EX Features (Point 9) - 100%
- **Notifications System**: Full notification center with preferences
- **Reactions**: Emoji reactions on posts, comments, and messages
- **Recognition/Shout-outs**: Employee recognition with @mentions
- **Threaded Comments**: Nested comment replies with parent_id
- **Polls**: Create polls, vote, view results (persistent)
- **Channels Backend**: Real database-backed channels with members
- **Celebrations**: Birthday/anniversary tracking and display

### Framework Integration (Point 4) - 100%
- **Connector Framework**: Abstract base class with 4 implementations
  - Confluence (CQL search, Basic Auth)
  - SharePoint (Microsoft Graph API, OAuth2)
  - Notion (Block-to-markdown conversion)
  - Google Drive (Changes API for incremental sync)
- **Multi-tenant KB Spaces**: Organization, department, team isolation
- **Federated Search**: Unified search across all knowledge sources
- **Framework Registry**: ITIL 4, Agile, ISO 27001
- **SaaS Product Catalog**: Compliance tracking

### Productivity Assistant (Point 8) - 100%
- **My Day Page**: Personal productivity hub
- **Task Management**: Kanban board with drag-drop
- **Daily Briefing**: AI-generated summary of tasks, meetings, news
- **Quick Capture**: Fast task entry modal

### Agentic Workflows (Point 6) - 100%
- **Workflow Execution Engine**: Full step-by-step executor
- **LLM Actions**: Claude integration for AI steps
- **API Call Execution**: Template variable interpolation
- **Condition Evaluation**: Simple, script, and LLM-based
- **Transform Operations**: Map, filter, aggregate, merge, custom
- **Webhook Triggers**: Secret verification, IP whitelisting
- **Scheduled Triggers**: Cron expression parsing

### Admin Dashboard (Point 7) - 100%
- **User Statistics**: Total, active, new, churn, growth rate
- **Content Metrics**: Articles, knowledge items, news, events
- **Search Analytics**: Top queries, zero-results tracking
- **AI Usage & Costs**: Token usage, estimated costs
- **Workflow Stats**: Executions, success rate
- **System Health**: Status, uptime, DB connections, cache

### New API Routes (18+)
- `/api/chat/stream` - SSE streaming
- `/api/notifications` - Notification CRUD
- `/api/reactions` - Reaction management
- `/api/recognitions` - Recognition posts
- `/api/polls` - Poll management
- `/api/channels` - Channel backend
- `/api/tasks` - Task management
- `/api/celebrations` - Birthday/anniversary
- `/api/connectors` - Connector CRUD
- `/api/kb-spaces` - KB space management
- `/api/search/federated` - Federated search
- `/api/workflows/execute` - Workflow execution
- `/api/workflows/webhook/[workflowId]` - Webhook triggers
- `/api/workflows/scheduled` - Scheduled triggers
- `/api/admin/stats` - Admin statistics

### New Pages (3)
- `/notifications` - Notification center
- `/my-day` - Productivity hub
- `/admin/dashboard` - Admin analytics

---

*Last Updated: January 22, 2026*
*Version: 1.1.1*
*Part of Digital Workplace AI Product Suite*
