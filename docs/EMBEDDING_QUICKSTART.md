# Embedding Quick Start Guide

## Adding Semantic Search to a Sub-Project

This is a step-by-step checklist for adding pgvector semantic search to any Digital Workplace AI sub-project.

---

## Prerequisites

- Supabase project with pgvector enabled
- Node.js 18+ (for local embeddings)
- Project schema created (e.g., `dsq`, `dtq`, `dcq`)

---

## Step 1: Database Setup (5 min)

Run in Supabase SQL Editor:

```sql
-- 1. Ensure pgvector is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to your main content table
-- Replace [schema] and [table] with your values
ALTER TABLE [schema].[table]
ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 3. Create HNSW index for fast search
CREATE INDEX IF NOT EXISTS idx_[table]_embedding_hnsw
ON [schema].[table]
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. Create semantic search function
CREATE OR REPLACE FUNCTION [schema].search_[table]_semantic(
    query_embedding vector(384),
    match_threshold float DEFAULT 0.3,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    title text,
    content text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.title::text,
        t.content::text,
        1 - (t.embedding <=> query_embedding) as similarity
    FROM [schema].[table] t
    WHERE t.embedding IS NOT NULL
      AND 1 - (t.embedding <=> query_embedding) > match_threshold
    ORDER BY t.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

---

## Step 2: Install Dependencies (1 min)

```bash
cd apps/[your-project]
npm install @xenova/transformers
```

---

## Step 3: Create Embeddings Library (2 min)

Create `src/lib/embeddings.ts`:

```typescript
/**
 * Local Embeddings using Transformers.js
 * Model: all-MiniLM-L6-v2 (384 dimensions)
 */

let embeddingModel: any = null;

async function getEmbeddingPipeline() {
  if (embeddingModel) return embeddingModel;

  const { pipeline } = await import('@xenova/transformers');
  embeddingModel = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
  );

  return embeddingModel;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = await getEmbeddingPipeline();
  const truncatedText = text.substring(0, 2000);
  const output = await model(truncatedText, {
    pooling: 'mean',
    normalize: true
  });
  return Array.from(output.data);
}

export function getEmbeddingDimensions(): number {
  return 384;
}
```

---

## Step 4: Create Search API (5 min)

Create `src/app/api/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/embeddings';

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10, threshold = 0.3 } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // Generate query embedding
    const embedding = await generateEmbedding(query);

    // Search using pgvector
    const { data, error } = await supabase.rpc('search_[table]_semantic', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit
    });

    if (error) throw error;

    return NextResponse.json({
      query,
      totalResults: data?.length || 0,
      results: data || []
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
```

---

## Step 5: Create Embeddings API (5 min)

Create `src/app/api/embeddings/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEmbedding, getEmbeddingDimensions } from '@/lib/embeddings';

export async function POST(request: NextRequest) {
  const { action, id, text } = await request.json();

  if (action === 'generate' && id) {
    // Generate for single record
    const { data: record } = await supabase
      .from('[table]')
      .select('id, title, content')
      .eq('id', id)
      .single();

    if (!record) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const textToEmbed = `${record.title}\n\n${record.content || ''}`;
    const embedding = await generateEmbedding(textToEmbed);

    await supabase
      .from('[table]')
      .update({ embedding })
      .eq('id', id);

    return NextResponse.json({ success: true, dimensions: embedding.length });
  }

  if (action === 'batch') {
    // Generate for all records without embeddings
    const { data: records } = await supabase
      .from('[table]')
      .select('id, title, content')
      .is('embedding', null)
      .limit(100);

    const results = [];
    for (const record of records || []) {
      const textToEmbed = `${record.title}\n\n${record.content || ''}`;
      const embedding = await generateEmbedding(textToEmbed);

      await supabase.from('[table]').update({ embedding }).eq('id', record.id);
      results.push({ id: record.id, success: true });
    }

    return NextResponse.json({ processed: results.length, results });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function GET() {
  const { count: total } = await supabase
    .from('[table]')
    .select('*', { count: 'exact', head: true });

  const { count: withEmbedding } = await supabase
    .from('[table]')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  return NextResponse.json({
    total,
    withEmbedding,
    coveragePct: total ? Math.round((withEmbedding! / total) * 100) : 0,
    model: 'all-MiniLM-L6-v2',
    dimensions: getEmbeddingDimensions()
  });
}
```

---

## Step 6: Generate Embeddings (2 min)

```bash
# Generate embeddings for all content
curl -X POST http://localhost:[PORT]/api/embeddings \
  -H "Content-Type: application/json" \
  -d '{"action": "batch"}'

# Check coverage
curl http://localhost:[PORT]/api/embeddings
```

---

## Step 7: Test Search (1 min)

```bash
curl -X POST http://localhost:[PORT]/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "your search query", "threshold": 0.2}'
```

---

## Sync to Cross-Project Search (Optional)

To enable searching across all projects, sync embeddings to `public.knowledge_items`:

```sql
-- Create sync trigger
CREATE OR REPLACE FUNCTION sync_[table]_to_knowledge_items()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.knowledge_items (
        project_id, source_table, source_id, item_type,
        title, content, embedding, updated_at
    )
    SELECT
        p.id, '[schema].[table]', NEW.id, '[type]',
        NEW.title, NEW.content, NEW.embedding, NOW()
    FROM public.projects p WHERE p.code = '[PROJECT_CODE]'
    ON CONFLICT (source_table, source_id)
    DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_[table]_embedding
AFTER INSERT OR UPDATE OF embedding ON [schema].[table]
FOR EACH ROW EXECUTE FUNCTION sync_[table]_to_knowledge_items();
```

---

## Checklist

- [ ] pgvector extension enabled
- [ ] Embedding column added (vector(384))
- [ ] HNSW index created
- [ ] Search function created
- [ ] @xenova/transformers installed
- [ ] `src/lib/embeddings.ts` created
- [ ] `/api/search` endpoint created
- [ ] `/api/embeddings` endpoint created
- [ ] Embeddings generated for all content
- [ ] Search tested and working
- [ ] (Optional) Sync to knowledge_items

---

## Project Status

| Project | Status | Embedding Column | Search API |
|---------|--------|------------------|------------|
| **dIQ** | ✅ Complete | `diq.articles.embedding` | `/api/search` |
| **dSQ** | ⬜ Pending | - | - |
| **dTQ** | ⬜ Pending | - | - |
| **dCQ** | ⬜ Pending | - | - |

---

*See `PGVECTOR_BEST_PRACTICES.md` for detailed documentation*
