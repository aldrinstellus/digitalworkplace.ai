# Digital Workplace AI - Database Architecture

## Overview

This document describes the Supabase database architecture for Digital Workplace AI and its sub-projects (dIQ, dSQ, dTQ, dCQ).

---

## Architecture Principles

### 1. Schema Separation
Each sub-project gets its own PostgreSQL schema:
- `public` - Shared core tables (users, projects, cross-project data)
- `diq` - Intranet IQ specific tables
- `dsq` - Support IQ specific tables (future)
- `dtq` - Test Pilot IQ specific tables (future)
- `dcq` - Chat Core IQ specific tables (future)

### 2. Cross-Project Linking
All project data is linked through:
- `public.projects` - Registry of all projects
- `public.knowledge_items` - Unified searchable content from all projects
- `public.activity_log` - Cross-project audit trail
- `public.user_project_access` - Role-based access per project

### 3. Row-Level Security (RLS)
Every table has RLS policies ensuring:
- Users only see data they have access to
- Project access is enforced at database level
- Admin roles can manage their project's data

---

## Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE DATABASE STRUCTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                     PUBLIC SCHEMA (Shared)                            │ │
│  │                                                                       │ │
│  │  organizations ──┬── projects ──┬── knowledge_items                   │ │
│  │        │         │       │      │                                     │ │
│  │        │         │       │      └── activity_log                      │ │
│  │        │         │       │                                            │ │
│  │        └── users ┴───────┴── user_project_access                      │ │
│  │              │                                                        │ │
│  │              └── integrations                                         │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                              │                                              │
│              ┌───────────────┼───────────────┐                             │
│              │               │               │                             │
│              ▼               ▼               ▼                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                  │
│  │  diq SCHEMA   │  │  dsq SCHEMA   │  │  dtq SCHEMA   │                  │
│  │               │  │  (future)     │  │  (future)     │                  │
│  │ departments   │  │               │  │               │                  │
│  │ employees     │  │ tickets       │  │ test_cases    │                  │
│  │ kb_categories │  │ conversations │  │ test_runs     │                  │
│  │ articles      │  │ kb_articles   │  │ reports       │                  │
│  │ chat_threads  │  │ escalations   │  │ ...           │                  │
│  │ chat_messages │  │ ...           │  │               │                  │
│  │ workflows     │  │               │  │               │                  │
│  │ news_posts    │  │               │  │               │                  │
│  │ events        │  │               │  │               │                  │
│  │ ...           │  │               │  │               │                  │
│  └───────────────┘  └───────────────┘  └───────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Public Schema Tables

### organizations
Root entity for multi-tenant support.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Organization name |
| slug | VARCHAR(100) | URL-friendly identifier |
| settings | JSONB | Custom settings |

### projects
Registry of Digital Workplace AI products.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| code | VARCHAR(10) | Unique code (dIQ, dSQ, etc.) |
| name | VARCHAR(255) | Display name |
| color_primary | VARCHAR(7) | Theme color |
| is_active | BOOLEAN | Enable/disable project |

### users
User profiles synced from Clerk.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| clerk_id | VARCHAR(255) | Clerk user ID |
| email | VARCHAR(255) | Email address |
| role | VARCHAR(50) | Global role (user/admin/super_admin) |
| organization_id | UUID | FK to organizations |

### user_project_access
Per-project role assignments.

| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | FK to users |
| project_id | UUID | FK to projects |
| role | VARCHAR(50) | Project role (viewer/editor/admin) |

### knowledge_items
Unified cross-project searchable content.

| Column | Type | Description |
|--------|------|-------------|
| project_id | UUID | FK to projects |
| source_table | VARCHAR(100) | Origin table (e.g., diq.articles) |
| source_id | UUID | ID in source table |
| type | VARCHAR(50) | Content type |
| title | VARCHAR(500) | Searchable title |
| content | TEXT | Full content |
| searchable | TSVECTOR | Full-text search index |
| tags | TEXT[] | Tags array |

### activity_log
Audit trail for all projects.

| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | FK to users |
| project_id | UUID | FK to projects |
| action | VARCHAR(100) | Action performed |
| entity_type | VARCHAR(100) | Type of entity |
| entity_id | UUID | Entity ID |
| metadata | JSONB | Additional context |

---

## dIQ Schema Tables

### departments
Organizational structure.

### employees
Extended user profiles with job info, skills, manager hierarchy.

### kb_categories
Hierarchical knowledge base categories.

### articles
Knowledge base articles with version tracking.

### article_versions
Historical versions of articles.

### chat_threads
AI assistant conversation threads.

### chat_messages
Individual messages with sources, confidence scores.

### search_history
User search queries for analytics.

### workflows
Custom agentic workflow definitions.

### workflow_steps
Individual steps within workflows.

### workflow_executions
Execution history and status.

### news_posts
Employee experience news feed.

### news_comments
Comments on news posts.

### events
Calendar events.

### event_rsvps
Event attendance responses.

### bookmarks
User-saved items.

### user_settings
dIQ-specific user preferences.

---

## Key Functions

### search_knowledge(query, project_codes, item_types, max_results)
Cross-project full-text search.

```sql
SELECT * FROM search_knowledge(
    'quarterly report',
    ARRAY['dIQ', 'dSQ'],
    ARRAY['article', 'document'],
    20
);
```

### get_user_projects(user_clerk_id)
Get projects a user has access to.

### diq.get_org_chart(dept_id)
Get organizational hierarchy.

### diq.search_articles(query, category_slug, max_results)
Search dIQ articles.

---

## Migrations

Migration files are located in:
```
supabase/migrations/
├── 001_core_schema.sql      # Public schema (shared tables)
├── 002_diq_schema.sql       # dIQ-specific tables
├── 003_dsq_schema.sql       # (future)
├── 004_dtq_schema.sql       # (future)
└── 005_dcq_schema.sql       # (future)
```

### Running Migrations

```bash
# Using Supabase CLI
supabase db push

# Or run directly in Supabase SQL Editor
# Copy contents of migration files and execute
```

---

## TypeScript Integration

Types are generated in:
```
apps/intranet-iq/src/lib/database.types.ts
```

Supabase client with helpers:
```
apps/intranet-iq/src/lib/supabase.ts
```

### Usage Example

```typescript
import {
  getArticles,
  searchKnowledge,
  getChatThreads
} from '@/lib/supabase';

// Get published articles
const { data: articles } = await getArticles({
  status: 'published',
  limit: 10
});

// Cross-project search
const { data: results } = await searchKnowledge(
  'quarterly report',
  { projectCodes: ['dIQ', 'dSQ'] }
);

// Get user's chat threads
const { data: threads } = await getChatThreads(userId);
```

---

## Row-Level Security

### Pattern for Project-Scoped Data

```sql
-- Users can only see data in projects they have access to
CREATE POLICY "Project-scoped access"
ON diq.articles FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_project_access upa
        JOIN public.users u ON u.id = upa.user_id
        JOIN public.projects p ON p.id = upa.project_id
        WHERE p.code = 'dIQ'
        AND u.clerk_id = auth.jwt()->>'sub'
    )
);
```

### Pattern for User-Owned Data

```sql
-- Users can only see their own chat threads
CREATE POLICY "Users see own chat threads"
ON diq.chat_threads FOR ALL
TO authenticated
USING (user_id = (
    SELECT id FROM public.users
    WHERE clerk_id = auth.jwt()->>'sub'
));
```

---

## Adding a New Sub-Project

1. Create schema: `CREATE SCHEMA IF NOT EXISTS <project_code>;`
2. Create project-specific tables
3. Add triggers to sync to `knowledge_items`
4. Add RLS policies
5. Generate TypeScript types
6. Create helper functions in supabase.ts

---

## Environment Variables

Required in all apps:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For server-side operations:
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

*Last Updated: January 19, 2025*
*Version: 1.0.0*
