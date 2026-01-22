# dIQ - Intranet IQ | Session Savepoint

---

## CURRENT STATE
**Last Updated:** January 22, 2026 @ 10:30 AM
**Session:** Workflow Builder Upgrade - Glean-Inspired Design
**Version:** 0.8.0
**Git Commit:** 3a61376 (pushed to GitHub)
**Vercel Status:** Auto-deploying on push

---

## PRODUCTION DEPLOYMENT

| Environment | URL | Status |
|-------------|-----|--------|
| **Production** | https://intranet-iq.vercel.app/diq/dashboard | Live |
| **Local Dev** | http://localhost:3001/diq/dashboard | Port 3001 |
| **Main App Link** | `apps/main/src/app/dashboard/page.tsx:29` | Linked |

---

## DESIGN SYSTEM: MIDNIGHT EMBER

The app uses the "Midnight Ember" design system - a warm, distinctive aesthetic that avoids generic AI appearance.

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-obsidian` | #08080c | Primary background |
| `--bg-charcoal` | #121218 | Cards, elevated surfaces |
| `--bg-slate` | #1c1c24 | Inputs, hover states |
| `--accent-ember` | #f97316 | Primary accent (orange) |
| `--accent-gold` | #fbbf24 | Highlights, badges |
| `--text-primary` | #fafafa | Primary text |
| `--text-secondary` | rgba(250,250,250,0.7) | Secondary text |

### Key Design Features
- Framer Motion animations throughout
- Orange/ember accent color (not blue/purple)
- Warm, professional aesthetic
- 60fps animations with `prefers-reduced-motion` support

---

## WHAT WAS ACCOMPLISHED

### Session: January 22, 2026 (Workflow Builder Upgrade)

#### Problem Addressed
- Legacy workflow builder was too basic with limited functionality
- No proper drag-and-drop for nodes
- Templates showing empty canvas when created
- Horizontal layout was outdated compared to modern workflow builders (like Glean)

#### Solutions Implemented

1. **ReactFlow Integration**
   - Installed `@xyflow/react` for professional workflow canvas
   - Custom node types: trigger, search, action, condition, transform, output
   - Custom edge types: default and conditional (Yes/No branches)
   - Vertical (top-to-bottom) layout matching modern workflow builders

2. **New Workflow Components**
   | Component | Purpose |
   |-----------|---------|
   | `WorkflowBuilder.tsx` | Main container with ReactFlowProvider |
   | `WorkflowCanvasNew.tsx` | ReactFlow canvas with drag-drop |
   | `ComponentPalette.tsx` | Right-side panel for adding nodes |
   | `WorkflowControls.tsx` | Floating toolbar (undo/redo, zoom, save) |
   | `ContextMenu.tsx` | Right-click context menu |
   | `BaseNode.tsx` | Universal node with vertical handles |
   | `DefaultEdge.tsx` | Standard connection edge |
   | `ConditionalEdge.tsx` | Yes/No conditional branches |

3. **Rich Workflow Templates (6)**
   - Employee Onboarding (6 steps)
   - Document Approval (6 steps)
   - Data Sync (6 steps)
   - Report Generation (6 steps)
   - Email Campaign (6 steps)
   - Ticket Routing (6 steps)

4. **State Management (Zustand)**
   - Full undo/redo history (50 steps)
   - Copy/paste/duplicate nodes
   - Multi-select support
   - Auto-save with dirty state tracking

5. **Keyboard Shortcuts**
   - Cmd+Z/Y for undo/redo
   - Cmd+C/V for copy/paste
   - Cmd+D for duplicate
   - Delete for remove
   - Escape to deselect

6. **Template Fix**
   - Templates now properly convert to ReactFlow nodes
   - Both database format and legacy format supported
   - Vertical positioning for new workflows

---

## FILES CREATED/MODIFIED

### New Files (15+)
| File | Purpose |
|------|---------|
| `src/components/workflow/WorkflowBuilder.tsx` | Main builder container |
| `src/components/workflow/WorkflowCanvasNew.tsx` | ReactFlow canvas |
| `src/components/workflow/ComponentPalette.tsx` | Node palette (right panel) |
| `src/components/workflow/WorkflowControls.tsx` | Floating controls |
| `src/components/workflow/ContextMenu.tsx` | Right-click menu |
| `src/components/workflow/WorkflowToolbar.tsx` | Top toolbar |
| `src/components/workflow/index.ts` | Component exports |
| `src/components/workflow/nodes/BaseNode.tsx` | Universal node component |
| `src/components/workflow/nodes/index.ts` | Node type registry |
| `src/components/workflow/edges/DefaultEdge.tsx` | Standard edge |
| `src/components/workflow/edges/ConditionalEdge.tsx` | Yes/No edge |
| `src/components/workflow/edges/index.ts` | Edge type registry |
| `src/components/workflow/panels/NodeConfigPanel.tsx` | Config slide-out |
| `src/lib/workflow/store.ts` | Zustand state management |
| `src/lib/workflow/types.ts` | TypeScript types |
| `src/lib/workflow/constants.ts` | Node configs, colors |
| `src/lib/workflow/validation.ts` | Connection validation |
| `src/lib/workflow/serialization.ts` | DB ↔ ReactFlow conversion |
| `src/lib/workflow/autoLayout.ts` | Dagre auto-layout |
| `src/app/api/workflows/steps/route.ts` | Steps CRUD API |
| `src/app/api/workflows/edges/route.ts` | Edges CRUD API |

### Modified Files
| File | Changes |
|------|---------|
| `src/app/agents/page.tsx` | Template creation with node conversion |
| `src/app/globals.css` | Workflow builder CSS styles |
| `src/app/api/workflows/route.ts` | Workflow save API |
| `src/lib/database.types.ts` | Workflow edge types |

---

## DATA INVENTORY

### Database Content
| Entity | Count | Schema |
|--------|-------|--------|
| Articles | 212 | diq.articles |
| KB Categories | 20 | diq.kb_categories |
| Employees | 60 | diq.employees |
| Departments | 15 | diq.departments |
| Workflows | 31 | diq.workflows |
| Workflow Steps | 66+ | diq.workflow_steps |
| Workflow Edges | 50+ | diq.workflow_edges |
| News Posts | 61 | diq.news_posts |
| Events | 49 | diq.events |
| Chat Threads | 30 | diq.chat_threads |
| Chat Messages | 26 | diq.chat_messages |
| Users | 60+ | public.users |

### Elasticsearch
| Metric | Value |
|--------|-------|
| Nodes | 3 |
| Documents | 28,690 |
| Index | diq-content |

---

## PAGES STATUS (All 16 Verified)

| Page | Route | Status | Data |
|------|-------|--------|------|
| Dashboard | `/diq/dashboard` | Working | 10 news, 10 events, stats |
| Chat | `/diq/chat` | Working | AI Assistant (Claude) |
| Search | `/diq/search` | Working | Semantic + keyword |
| People | `/diq/people` | Working | 60 employees, 15 depts |
| Content | `/diq/content` | Working | 212 articles, 20 categories |
| **Agents** | `/diq/agents` | **Upgraded** | 31 workflows, 6 templates |
| Settings | `/diq/settings` | Working | 9 panels |
| News | `/diq/news` | Working | News feed |
| Events | `/diq/events` | Working | Calendar |
| Channels | `/diq/channels` | Working | Communication |
| Integrations | `/diq/integrations` | Working | Third-party |
| Elasticsearch | `/diq/admin/elasticsearch` | Working | 3 nodes |
| Analytics | `/diq/admin/analytics` | Working | Charts |
| Permissions | `/diq/admin/permissions` | Working | RBAC |
| News Detail | `/diq/news/[id]` | Working | Single news |
| Events Detail | `/diq/events/[id]` | Working | Single event |

---

## TECH STACK

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.3 | React framework |
| React Query | 5.x | Data caching/fetching |
| **ReactFlow** | @xyflow/react | Workflow canvas |
| **Zustand** | 5.x | Workflow state management |
| **Dagre** | 1.x | Auto-layout algorithm |
| TypeScript | 5.x | Type safety |
| Clerk | @clerk/nextjs | Authentication |
| Supabase | @supabase/supabase-js | Database |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.x | Animations |
| GSAP | 3.x | Complex animations |
| Lucide React | 0.562.x | Icons |

---

## QUICK VERIFICATION COMMANDS

```bash
# Start dev server
cd /Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq
npm run dev

# Test workflows API
curl -s http://localhost:3001/diq/api/workflows | jq '.workflows | length'

# Test workflow steps
curl -s http://localhost:3001/diq/api/workflows | jq '.workflows[0].steps | length'

# Open workflow builder
# http://localhost:3001/diq/agents
# Click "New" → Select template → Should show full workflow in canvas
```

---

## GIT HISTORY (Recent)

| Commit | Date | Description |
|--------|------|-------------|
| 3a61376 | Jan 22, 2026 | feat(diq): Workflow Builder Upgrade v0.8.0 |
| a2c53bf | Jan 22, 2026 | perf: Optimize API routes |
| b9e86dd | Jan 21, 2026 | docs: Update commit hash in SAVEPOINT |
| bc65405 | Jan 21, 2026 | feat(diq): Performance optimization v0.7.0 |

---

## PENDING TASKS
- None

---

## PREVIOUS SESSIONS

### January 21, 2026 (Performance Optimization - v0.7.0)
- React Query integration for 60-80% faster loads
- API parallelization with Promise.all()
- Cross-schema join fixes
- Commit: b9e86dd

### January 21, 2026 (UX/UI Overhaul - Midnight Ember)
- Complete visual overhaul with Midnight Ember design system
- Framer Motion animations throughout
- 89 files changed, 25,125 insertions

---

## KEY DOCUMENTATION FILES

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project instructions for Claude |
| `context.md` | Design specifications |
| `CHANGELOG.md` | Version history |
| `docs/PERFORMANCE_AUDIT.md` | Performance verification guide |
| `docs/DATABASE_ARCHITECTURE.md` | Database schema reference |

---

*Part of Digital Workplace AI Product Suite*
*Repository: https://github.com/aldrinstellus/intranet-iq*
*Production: https://intranet-iq.vercel.app/diq/agents*
