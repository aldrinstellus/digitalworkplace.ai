# pgvector Semantic Search - Best Practices

## Overview

This document covers best practices for implementing pgvector-based semantic search across Digital Workplace AI sub-projects (dIQ, dSQ, dTQ, dCQ).

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Embedding Providers](#embedding-providers)
3. [Database Setup](#database-setup)
4. [Multi-Project Pattern](#multi-project-pattern)
5. [Code Implementation](#code-implementation)
6. [Search Strategies](#search-strategies)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)
9. [Migration Checklist](#migration-checklist)

---

## Architecture Overview

### How Semantic Search Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SEMANTIC SEARCH FLOW                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. INDEXING (Write Path)                                               │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌───────────┐ │
│  │ Content  │ →  │  Embedding   │ →  │  384-dim    │ →  │  Store in │ │
│  │ (Text)   │    │  Model       │    │  Vector     │    │  pgvector │ │
│  └──────────┘    └──────────────┘    └─────────────┘    └───────────┘ │
│                                                                         │
│  2. QUERYING (Read Path)                                                │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌───────────┐ │
│  │ Search   │ →  │  Embedding   │ →  │  Query      │ →  │ pgvector  │ │
│  │ Query    │    │  Model       │    │  Vector     │    │ Cosine    │ │
│  └──────────┘    └──────────────┘    └─────────────┘    │ Similarity│ │
│                                                          └─────┬─────┘ │
│                                                                │       │
│                                            ┌───────────────────▼─────┐ │
│                                            │ Ranked Results          │ │
│                                            │ (by similarity score)   │ │
│                                            └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Concepts

| Term | Definition |
|------|------------|
| **Embedding** | Dense vector representation of text (e.g., 384 floats) |
| **Dimensions** | Size of embedding vector (384, 768, 1536, etc.) |
| **Cosine Similarity** | Measures angle between vectors (0 to 1, higher = more similar) |
| **HNSW Index** | Hierarchical Navigable Small World - fast approximate nearest neighbor |
| **Threshold** | Minimum similarity score to include in results |

---

## Embedding Providers

### Comparison Table

| Provider | Model | Dimensions | Cost | Speed | Quality | Best For |
|----------|-------|------------|------|-------|---------|----------|
| **Local (Transformers.js)** | all-MiniLM-L6-v2 | 384 | Free | ~100ms | Good | POC, Low volume |
| **Local (Transformers.js)** | all-mpnet-base-v2 | 768 | Free | ~200ms | Better | Production |
| **OpenAI** | text-embedding-3-small | 1536 | $0.02/1M tokens | ~50ms | Very Good | High quality needs |
| **OpenAI** | text-embedding-3-large | 3072 | $0.13/1M tokens | ~100ms | Excellent | Maximum quality |
| **Cohere** | embed-english-v3.0 | 1024 | $0.10/1M tokens | ~60ms | Very Good | Multi-language |
| **Voyage AI** | voyage-large-2 | 1536 | $0.12/1M tokens | ~80ms | Excellent | Technical content |

### Current Implementation (dIQ)

**Provider:** Local Transformers.js
**Model:** all-MiniLM-L6-v2
**Dimensions:** 384
**Cost:** Free

```typescript
// apps/intranet-iq/src/lib/embeddings.ts
import { pipeline } from '@xenova/transformers';

let embeddingModel: any = null;

async function getEmbeddingPipeline() {
  if (embeddingModel) return embeddingModel;

  const { pipeline: createPipeline } = await import('@xenova/transformers');
  embeddingModel = await createPipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
  );

  return embeddingModel;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = await getEmbeddingPipeline();
  const truncatedText = text.substring(0, 2000); // Model limit
  const output = await model(truncatedText, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export function getEmbeddingDimensions(): number {
  return 384;
}
```

### When to Upgrade Providers

| Scenario | Recommended Provider |
|----------|---------------------|
| POC / Development | Local (all-MiniLM-L6-v2) |
| Production < 10K docs | Local (all-mpnet-base-v2) |
| Production > 10K docs | OpenAI text-embedding-3-small |
| Multi-language support | Cohere embed-multilingual-v3.0 |
| Technical/code search | Voyage AI voyage-code-2 |
| Maximum quality needed | OpenAI text-embedding-3-large |

---

## Database Setup

### 1. Enable pgvector Extension

```sql
-- Run once per Supabase project
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Add Embedding Columns

```sql
-- Pattern: Add to tables that need semantic search
ALTER TABLE schema_name.table_name
ADD COLUMN IF NOT EXISTS embedding vector(384);  -- Match your model dimensions
```

### 3. Create HNSW Index

```sql
-- HNSW index for fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_table_embedding_hnsw
ON schema_name.table_name
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Index parameters:
-- m = 16: Number of connections per node (higher = more accurate, more memory)
-- ef_construction = 64: Build-time accuracy (higher = better index, slower build)
```

### 4. Create Search Functions

```sql
-- Semantic search function template
CREATE OR REPLACE FUNCTION search_table_semantic(
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
    FROM schema_name.table_name t
    WHERE t.embedding IS NOT NULL
      AND 1 - (t.embedding <=> query_embedding) > match_threshold
    ORDER BY t.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

### 5. Recommended Thresholds

| Model | Dimensions | Good Match | Moderate Match | Weak Match |
|-------|------------|------------|----------------|------------|
| all-MiniLM-L6-v2 | 384 | > 0.5 | 0.3 - 0.5 | 0.1 - 0.3 |
| all-mpnet-base-v2 | 768 | > 0.6 | 0.4 - 0.6 | 0.2 - 0.4 |
| text-embedding-3-small | 1536 | > 0.7 | 0.5 - 0.7 | 0.3 - 0.5 |

**Note:** Lower dimension models have lower similarity scores. Adjust thresholds accordingly.

---

## Multi-Project Pattern

### Shared vs Project-Specific Embeddings

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MULTI-PROJECT EMBEDDING ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PUBLIC SCHEMA (Cross-Project Search)                                   │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  knowledge_items                                                   │ │
│  │  ├── id, project_id, source_table, source_id                     │ │
│  │  ├── title, content, type, tags                                  │ │
│  │  ├── searchable (tsvector for keyword search)                    │ │
│  │  └── embedding vector(384) ← UNIFIED CROSS-PROJECT SEARCH        │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                              ▲                                          │
│              ┌───────────────┼───────────────┐                         │
│              │               │               │                         │
│  ┌───────────┴───┐  ┌───────┴───────┐  ┌───┴───────────┐             │
│  │  diq.articles │  │  dsq.tickets  │  │  dtq.tests    │             │
│  │  + embedding  │  │  + embedding  │  │  + embedding  │             │
│  │  (source)     │  │  (source)     │  │  (source)     │             │
│  └───────────────┘  └───────────────┘  └───────────────┘             │
│                                                                         │
│  PROJECT SCHEMAS (Project-Specific Search)                              │
└─────────────────────────────────────────────────────────────────────────┘
```

### Sync Pattern: Source Table → knowledge_items

```sql
-- Trigger to sync article embeddings to knowledge_items
CREATE OR REPLACE FUNCTION sync_article_to_knowledge_items()
RETURNS TRIGGER AS $$
BEGIN
    -- Upsert to knowledge_items
    INSERT INTO public.knowledge_items (
        project_id,
        source_table,
        source_id,
        item_type,
        title,
        summary,
        content,
        embedding,
        updated_at
    )
    SELECT
        p.id,
        'diq.articles',
        NEW.id,
        'article',
        NEW.title,
        NEW.summary,
        NEW.content,
        NEW.embedding,
        NOW()
    FROM public.projects p
    WHERE p.code = 'dIQ'
    ON CONFLICT (source_table, source_id)
    DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_article_embedding
AFTER INSERT OR UPDATE OF embedding ON diq.articles
FOR EACH ROW
EXECUTE FUNCTION sync_article_to_knowledge_items();
```

### Cross-Project Search Function

```sql
-- Hybrid search across all projects
CREATE OR REPLACE FUNCTION search_knowledge_hybrid(
    search_query text,
    query_embedding vector(384),
    keyword_weight float DEFAULT 0.3,
    semantic_weight float DEFAULT 0.7,
    match_threshold float DEFAULT 0.3,
    match_count int DEFAULT 20,
    project_codes text[] DEFAULT NULL,
    item_types text[] DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    project_code text,
    item_type text,
    title text,
    summary text,
    combined_score float,
    keyword_score float,
    semantic_score float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH keyword_results AS (
        SELECT
            ki.id,
            p.code as project_code,
            ki.item_type,
            ki.title,
            ki.summary,
            ts_rank(ki.searchable, plainto_tsquery('english', search_query)) as kw_score
        FROM public.knowledge_items ki
        JOIN public.projects p ON p.id = ki.project_id
        WHERE (project_codes IS NULL OR p.code = ANY(project_codes))
          AND (item_types IS NULL OR ki.item_type = ANY(item_types))
          AND ki.searchable @@ plainto_tsquery('english', search_query)
    ),
    semantic_results AS (
        SELECT
            ki.id,
            1 - (ki.embedding <=> query_embedding) as sem_score
        FROM public.knowledge_items ki
        WHERE ki.embedding IS NOT NULL
          AND 1 - (ki.embedding <=> query_embedding) > match_threshold
    )
    SELECT
        COALESCE(kr.id, sr_full.id) as id,
        COALESCE(kr.project_code, p2.code) as project_code,
        COALESCE(kr.item_type, ki2.item_type) as item_type,
        COALESCE(kr.title, ki2.title)::text as title,
        COALESCE(kr.summary, ki2.summary)::text as summary,
        (COALESCE(kr.kw_score, 0) * keyword_weight +
         COALESCE(sr.sem_score, 0) * semantic_weight) as combined_score,
        COALESCE(kr.kw_score, 0)::float as keyword_score,
        COALESCE(sr.sem_score, 0)::float as semantic_score
    FROM keyword_results kr
    FULL OUTER JOIN semantic_results sr ON kr.id = sr.id
    LEFT JOIN semantic_results sr_full ON sr.id = sr_full.id
    LEFT JOIN public.knowledge_items ki2 ON sr_full.id = ki2.id
    LEFT JOIN public.projects p2 ON ki2.project_id = p2.id
    WHERE (COALESCE(kr.kw_score, 0) * keyword_weight +
           COALESCE(sr.sem_score, 0) * semantic_weight) > 0
    ORDER BY combined_score DESC
    LIMIT match_count;
END;
$$;
```

---

## Code Implementation

### Project Structure

```
apps/[project]/
├── src/
│   ├── lib/
│   │   ├── embeddings.ts      # Embedding generation (shared or project-specific)
│   │   ├── supabase.ts        # Database client + search helpers
│   │   └── database.types.ts  # TypeScript types
│   └── app/
│       └── api/
│           ├── embeddings/
│           │   └── route.ts   # Embedding generation API
│           └── search/
│               └── route.ts   # Search API
```

### Embeddings Library Template

```typescript
// src/lib/embeddings.ts

// Configuration
const EMBEDDING_CONFIG = {
  model: 'Xenova/all-MiniLM-L6-v2',
  dimensions: 384,
  maxTextLength: 2000,
  provider: 'local'
};

let embeddingModel: any = null;

async function getEmbeddingPipeline() {
  if (embeddingModel) return embeddingModel;

  const { pipeline } = await import('@xenova/transformers');
  embeddingModel = await pipeline(
    'feature-extraction',
    EMBEDDING_CONFIG.model
  );

  return embeddingModel;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = await getEmbeddingPipeline();
  const truncatedText = text.substring(0, EMBEDDING_CONFIG.maxTextLength);
  const output = await model(truncatedText, {
    pooling: 'mean',
    normalize: true
  });
  return Array.from(output.data);
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    results.push(await generateEmbedding(text));
  }
  return results;
}

export function getEmbeddingConfig() {
  return EMBEDDING_CONFIG;
}
```

### Search API Template

```typescript
// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/embeddings';

export async function POST(request: NextRequest) {
  try {
    const {
      query,
      searchType = 'hybrid',  // 'semantic', 'keyword', 'hybrid'
      projectCodes = null,     // null = all projects
      itemTypes = null,        // null = all types
      limit = 10,
      threshold = 0.3,
    } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    let results: any[] = [];

    if (searchType === 'keyword') {
      // Keyword-only search
      const { data, error } = await supabase.rpc('search_knowledge', {
        search_query: query,
        project_codes: projectCodes,
        item_types: itemTypes,
        max_results: limit
      });

      if (!error && data) {
        results = data;
      }
    } else {
      // Semantic or hybrid search
      const embedding = await generateEmbedding(query);

      const { data, error } = await supabase.rpc('search_knowledge_hybrid', {
        search_query: query,
        query_embedding: embedding,
        keyword_weight: searchType === 'semantic' ? 0 : 0.3,
        semantic_weight: searchType === 'semantic' ? 1 : 0.7,
        match_threshold: threshold,
        match_count: limit,
        project_codes: projectCodes,
        item_types: itemTypes
      });

      if (!error && data) {
        results = data;
      }
    }

    return NextResponse.json({
      query,
      searchType,
      totalResults: results.length,
      results
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
```

### Embedding Generation API Template

```typescript
// src/app/api/embeddings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEmbedding, getEmbeddingConfig } from '@/lib/embeddings';

export async function POST(request: NextRequest) {
  const { action, id, text, table } = await request.json();

  switch (action) {
    case 'generate_single':
      // Generate embedding for a single record
      const embedding = await generateEmbedding(text);

      await supabase
        .from(table)
        .update({ embedding })
        .eq('id', id);

      return NextResponse.json({ success: true, dimensions: embedding.length });

    case 'query':
      // Generate embedding for search query
      const queryEmbedding = await generateEmbedding(text);
      return NextResponse.json({ embedding: queryEmbedding });

    case 'batch':
      // Generate embeddings for all records without embeddings
      const { data: records } = await supabase
        .from(table)
        .select('id, title, content')
        .is('embedding', null)
        .limit(100);

      const results = [];
      for (const record of records || []) {
        try {
          const textToEmbed = `${record.title}\n\n${record.content || ''}`;
          const emb = await generateEmbedding(textToEmbed);

          await supabase
            .from(table)
            .update({ embedding: emb })
            .eq('id', record.id);

          results.push({ id: record.id, success: true });
        } catch (err) {
          results.push({ id: record.id, success: false, error: String(err) });
        }
      }

      return NextResponse.json({ processed: results.length, results });

    default:
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
  }
}

export async function GET() {
  // Return embedding stats
  const config = getEmbeddingConfig();

  const { data: stats } = await supabase
    .from('embedding_stats')
    .select('*');

  return NextResponse.json({
    stats,
    ...config
  });
}
```

---

## Search Strategies

### 1. Semantic Search (Pure Vector)
Best for: Natural language queries, concept matching

```typescript
// "how to work remotely" → finds "Remote Work Policy"
const results = await searchSemantic(query, { threshold: 0.3 });
```

### 2. Keyword Search (Full-Text)
Best for: Exact term matching, known phrases

```typescript
// "Q4 2024 report" → finds documents with exact terms
const results = await searchKeyword(query);
```

### 3. Hybrid Search (Recommended)
Best for: General search, combining precision and recall

```typescript
// Combines keyword (30%) + semantic (70%)
const results = await searchHybrid(query, {
  keywordWeight: 0.3,
  semanticWeight: 0.7
});
```

### 4. RAG Context Retrieval
Best for: AI chat context, answer generation

```typescript
// Get relevant context for LLM
const context = await getChatContext(queryEmbedding, {
  maxTokens: 4000,
  diversityFactor: 0.3  // Avoid too-similar results
});
```

---

## Performance Optimization

### 1. Index Configuration

```sql
-- For high-accuracy (slower, more memory)
CREATE INDEX USING hnsw (embedding vector_cosine_ops)
WITH (m = 32, ef_construction = 128);

-- For balanced performance (recommended)
CREATE INDEX USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- For fast queries (lower accuracy)
CREATE INDEX USING hnsw (embedding vector_cosine_ops)
WITH (m = 8, ef_construction = 32);
```

### 2. Query Performance Tips

| Optimization | Impact | Implementation |
|--------------|--------|----------------|
| Use HNSW index | 10-100x faster | See index creation above |
| Limit results | Reduces memory | `LIMIT 20` in queries |
| Pre-filter with WHERE | Reduces search space | Add status/type filters |
| Cache embeddings | Avoid regeneration | Cache query embeddings |
| Batch operations | Reduce API calls | Process in batches of 100 |

### 3. Embedding Generation Performance

```typescript
// Bad: Generate embeddings one at a time
for (const article of articles) {
  await generateAndStore(article);  // Slow
}

// Good: Batch processing with concurrency control
const batchSize = 10;
for (let i = 0; i < articles.length; i += batchSize) {
  const batch = articles.slice(i, i + batchSize);
  await Promise.all(batch.map(generateAndStore));
}
```

### 4. Memory Management

```typescript
// For local embeddings, model stays in memory
// First call: ~2-5 seconds (model loading)
// Subsequent calls: ~50-100ms

// If memory is an issue, consider:
// 1. Use API-based provider (OpenAI, Cohere)
// 2. Run embedding service separately
// 3. Use smaller model (all-MiniLM-L6-v2)
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No results returned | Threshold too high | Lower threshold (try 0.1 for 384-dim) |
| Slow first query | Model loading | Normal behavior, subsequent queries fast |
| "Schema not exposed" | PostgREST config | Use RPC functions or public wrappers |
| Dimension mismatch | Different models used | Ensure same model for indexing and querying |
| Out of memory | Model too large | Use smaller model or API provider |

### Debugging Queries

```sql
-- Check embedding coverage
SELECT
    COUNT(*) as total,
    COUNT(embedding) as with_embedding,
    ROUND(COUNT(embedding)::numeric / COUNT(*) * 100, 2) as coverage_pct
FROM diq.articles;

-- Test similarity scores manually
SELECT
    title,
    1 - (embedding <=> '[0.1, 0.2, ...]'::vector) as similarity
FROM diq.articles
WHERE embedding IS NOT NULL
ORDER BY similarity DESC
LIMIT 10;

-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM diq.articles
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 10;
```

### Embedding Validation

```typescript
// Verify embedding dimensions
export function validateEmbedding(embedding: number[]): boolean {
  const expectedDims = getEmbeddingDimensions();

  if (embedding.length !== expectedDims) {
    console.error(`Dimension mismatch: got ${embedding.length}, expected ${expectedDims}`);
    return false;
  }

  // Check for NaN or Infinity
  if (embedding.some(v => !Number.isFinite(v))) {
    console.error('Embedding contains invalid values');
    return false;
  }

  return true;
}
```

---

## Migration Checklist

### Adding Semantic Search to a New Project

- [ ] **1. Enable pgvector**
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

- [ ] **2. Add embedding columns**
  ```sql
  ALTER TABLE schema.table ADD COLUMN embedding vector(384);
  ```

- [ ] **3. Create HNSW index**
  ```sql
  CREATE INDEX idx_table_embedding_hnsw
  ON schema.table USING hnsw (embedding vector_cosine_ops);
  ```

- [ ] **4. Create search functions**
  - Semantic search function
  - Hybrid search function
  - RAG context function (if using AI chat)

- [ ] **5. Create sync triggers**
  - Sync to knowledge_items for cross-project search

- [ ] **6. Install dependencies**
  ```bash
  npm install @xenova/transformers
  ```

- [ ] **7. Create embeddings library**
  - Copy from existing project or use template above

- [ ] **8. Create API routes**
  - `/api/embeddings` - Generate embeddings
  - `/api/search` - Search endpoint

- [ ] **9. Generate embeddings for existing content**
  - Use batch endpoint or script

- [ ] **10. Update TypeScript types**
  - Add embedding-related types to database.types.ts

- [ ] **11. Test search**
  - Verify semantic search works
  - Verify hybrid search works
  - Check threshold settings

### Changing Embedding Models

If you need to switch embedding providers:

1. **Create new column** (don't drop old one yet)
   ```sql
   ALTER TABLE schema.table ADD COLUMN embedding_new vector(NEW_DIMS);
   ```

2. **Generate new embeddings**
   ```typescript
   // Batch regenerate all embeddings with new model
   ```

3. **Update search functions**
   ```sql
   -- Point to new column
   ```

4. **Test thoroughly**

5. **Drop old column**
   ```sql
   ALTER TABLE schema.table DROP COLUMN embedding;
   ALTER TABLE schema.table RENAME COLUMN embedding_new TO embedding;
   ```

---

## Quick Reference

### Dimension by Provider

| Provider | Model | Dimensions |
|----------|-------|------------|
| Local | all-MiniLM-L6-v2 | 384 |
| Local | all-mpnet-base-v2 | 768 |
| OpenAI | text-embedding-3-small | 1536 |
| OpenAI | text-embedding-3-large | 3072 |
| Cohere | embed-english-v3.0 | 1024 |

### Similarity Operators

| Operator | Function | Use Case |
|----------|----------|----------|
| `<=>` | Cosine distance | Most common, normalized vectors |
| `<->` | Euclidean distance | Raw distances |
| `<#>` | Inner product | Dot product similarity |

### Default Settings (dIQ)

```typescript
{
  model: 'Xenova/all-MiniLM-L6-v2',
  dimensions: 384,
  threshold: 0.3,
  hybridWeights: { keyword: 0.3, semantic: 0.7 },
  maxTextLength: 2000,
  indexConfig: { m: 16, ef_construction: 64 }
}
```

---

## Current Implementation Status (2026-01-28)

### App-Specific Embedding Coverage

| App | Embedding Model | Dimensions | Coverage | Items |
|-----|-----------------|------------|----------|-------|
| **dIQ** (Intranet IQ) | all-MiniLM-L6-v2 (local) | 384 | 100% | 212 articles |
| **dCQ** (Chat Core IQ) | text-embedding-3-small (OpenAI) | 1536 | 100% | 7 FAQs, 1,066 pages |
| **dSQ** (Support IQ) | text-embedding-3-small (OpenAI) | 1536 | 100% | 356 knowledge items |

### dCQ Database Tables with Embeddings

| Table | Count | Embedding Status |
|-------|-------|------------------|
| `dcq_faqs` | 7 | ✅ 100% embedded |
| `dcq_crawler_urls` | 60 | No embeddings (URL metadata) |
| `dcq_documents` | 18 | No embeddings (file metadata) |
| `dcq_knowledge_entries` | 8 | Custom entries |

### Knowledge Base Files (dCQ)

| Language | File | Pages | Sections |
|----------|------|-------|----------|
| English | `knowledge-base.json` | 506 | 15 |
| Spanish | `knowledge-base-es.json` | 560 | 23 |
| Haitian Creole | `knowledge-base-ht.json` | 0 | 0 (placeholder) |

---

*Last Updated: January 28, 2026*
*Version: 1.1.0*
*Applies to: Digital Workplace AI (dIQ, dSQ, dTQ, dCQ)*
