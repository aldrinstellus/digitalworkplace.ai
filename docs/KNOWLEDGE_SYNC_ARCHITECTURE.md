# Knowledge Sync Architecture

## Overview

The Digital Workplace AI platform uses a **centralized knowledge base** in Supabase that aggregates knowledge from all sub-projects. This enables cross-project search, unified AI training data, and shared insights across the enterprise.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Master Supabase Database                      │
│                    (digitalworkplace-ai)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              public.knowledge_items                       │   │
│  │  (Unified Knowledge Base - Cross-Project Search)          │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ▲              ▲              ▲              ▲          │
│         │              │              │              │          │
│    ┌────┴────┐   ┌────┴────┐   ┌────┴────┐   ┌────┴────┐      │
│    │   dSQ   │   │   dIQ   │   │   dCQ   │   │   dTQ   │      │
│    │ Support │   │Intranet │   │  Chat   │   │  Test   │      │
│    │   IQ    │   │   IQ    │   │Core IQ  │   │Pilot IQ │      │
│    └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘      │
│         │              │              │              │          │
│  ┌──────┴──────┐ ┌────┴────┐  ┌─────┴─────┐  ┌─────┴─────┐   │
│  │dsq.kb_articles│ diq.*   │  │dcq.faqs   │  │dtq.*      │   │
│  │dsq.tickets   │          │  │           │  │           │   │
│  │dsq.canned_   │          │  │           │  │           │   │
│  │  responses   │          │  │           │  │           │   │
│  └──────────────┘ └────────┘  └───────────┘  └───────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Projects Registry (`public.projects`)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| code | VARCHAR | Project code (dSQ, dIQ, dCQ, dTQ) |
| name | VARCHAR | Human-readable name |
| color_primary | VARCHAR | Brand color |
| is_active | BOOLEAN | Active status |

### Knowledge Items (`public.knowledge_items`)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | FK to projects |
| source_table | VARCHAR | Origin table (e.g., 'dsq.kb_articles') |
| source_id | UUID | Original record ID |
| type | VARCHAR | Item type (kb_article, faq, resolved_ticket, etc.) |
| title | VARCHAR | Searchable title |
| content | TEXT | Full content |
| summary | TEXT | Brief summary |
| tags | TEXT[] | Tags array |
| metadata | JSONB | Source-specific metadata |
| searchable | TSVECTOR | Full-text search vector |
| embedding | VECTOR(384) | Semantic search embedding |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

## Sync Triggers

Each project schema has automatic triggers that sync data to `public.knowledge_items`:

### Support IQ (dSQ) Triggers

1. **`trg_dsq_kb_article_knowledge_sync`**
   - Syncs published KB articles
   - Removes unpublished articles from knowledge base
   - Source: `dsq.kb_articles` → Type: `kb_article`

2. **`trg_dsq_ticket_knowledge_sync`**
   - Syncs resolved/closed tickets as knowledge
   - Removes non-resolved tickets from knowledge base
   - Source: `dsq.tickets` → Type: `resolved_ticket`

3. **`trg_dsq_canned_response_knowledge_sync`**
   - Syncs all canned responses
   - Source: `dsq.canned_responses` → Type: `canned_response`

### Chat Core IQ (dCQ) Triggers

- Syncs FAQ entries → Type: `faq`

### Intranet IQ (dIQ) Triggers

- Syncs articles → Type: `article`

## Sync Flow

```
1. User creates/updates content in project schema
   └─> Example: INSERT INTO dsq.kb_articles (title, content, status='published')

2. Project-specific trigger fires
   └─> Example: trg_dsq_kb_article_knowledge_sync

3. Trigger function executes
   └─> dsq.sync_kb_article_to_knowledge()

4. Knowledge item upserted to public.knowledge_items
   └─> ON CONFLICT (source_table, source_id) DO UPDATE

5. Item available for cross-project search
   └─> Full-text search via searchable tsvector
   └─> Semantic search via embedding vector (when populated)
```

## Cross-Project Search

### SQL Example

```sql
-- Search across all projects
SELECT p.code, k.type, k.title,
       ts_rank(k.searchable, query) as relevance
FROM public.knowledge_items k
JOIN public.projects p ON k.project_id = p.id,
     to_tsquery('english', 'password & reset') query
WHERE k.searchable @@ query
ORDER BY relevance DESC
LIMIT 20;
```

### TypeScript Example (Support IQ)

```typescript
import { searchKnowledgeItems } from '@/lib/supabase';

// Search all projects
const { data: allResults } = await searchKnowledgeItems('password reset');

// Search specific projects only
const { data: supportOnly } = await searchKnowledgeItems('password reset', ['dSQ']);

// Search multiple projects
const { data: supportAndChat } = await searchKnowledgeItems('password reset', ['dSQ', 'dCQ']);
```

## Current Knowledge Base Stats

| Project | Code | Item Types | Count |
|---------|------|------------|-------|
| Support IQ | dSQ | kb_article, canned_response, resolved_ticket | 18+ |
| Intranet IQ | dIQ | article | 3 |
| Chat Core IQ | dCQ | faq | 7 |
| Test Pilot IQ | dTQ | (planned) | 0 |

## Adding Knowledge Sync to New Projects

1. **Register the project** in `public.projects`:
   ```sql
   INSERT INTO public.projects (code, name, is_active)
   VALUES ('dXQ', 'New Project IQ', true);
   ```

2. **Create sync function** in project schema:
   ```sql
   CREATE FUNCTION project_schema.sync_content_to_knowledge()
   RETURNS TRIGGER AS $$ ... $$ LANGUAGE plpgsql;
   ```

3. **Create trigger** on source table:
   ```sql
   CREATE TRIGGER trg_sync_knowledge
   AFTER INSERT OR UPDATE OR DELETE ON project_schema.source_table
   FOR EACH ROW EXECUTE FUNCTION project_schema.sync_content_to_knowledge();
   ```

4. **Run initial sync** for existing data:
   ```sql
   INSERT INTO public.knowledge_items (...)
   SELECT ... FROM project_schema.source_table
   ON CONFLICT DO NOTHING;
   ```

## Best Practices

1. **Only sync searchable content** - Don't sync internal system data
2. **Include meaningful metadata** - Store source-specific info in JSONB
3. **Maintain searchable vectors** - Use tsvector for full-text search
4. **Handle deletions** - Remove from knowledge_items when source is deleted
5. **Filter by status** - Only sync published/active/resolved content
6. **Use upserts** - `ON CONFLICT ... DO UPDATE` for idempotent syncs

## Related Documentation

- [SUPABASE_DATABASE_REFERENCE.md](./SUPABASE_DATABASE_REFERENCE.md) - Full database schema
- [PGVECTOR_BEST_PRACTICES.md](./PGVECTOR_BEST_PRACTICES.md) - Semantic search with embeddings
- [apps/support-iq/src/lib/supabase.ts](../apps/support-iq/src/lib/supabase.ts) - TypeScript client
