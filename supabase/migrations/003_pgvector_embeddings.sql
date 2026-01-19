-- =====================================================
-- Digital Workplace AI - pgvector Embeddings Migration
-- =====================================================
-- Enables vector similarity search for AI-powered features:
-- - Semantic search across knowledge items
-- - Similar content recommendations
-- - RAG (Retrieval-Augmented Generation) for AI assistants
-- =====================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- ADD EMBEDDING COLUMN TO KNOWLEDGE_ITEMS
-- =====================================================
-- Using 1536 dimensions for OpenAI ada-002 embeddings
-- Or 1024 dimensions for many other models
-- We'll use 1536 as it's the most common for production

ALTER TABLE public.knowledge_items
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create HNSW index for fast approximate nearest neighbor search
-- HNSW is faster than IVFFlat for most use cases
CREATE INDEX IF NOT EXISTS idx_knowledge_items_embedding
ON public.knowledge_items
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- =====================================================
-- SEMANTIC SEARCH FUNCTION
-- =====================================================
-- Search knowledge items by vector similarity
CREATE OR REPLACE FUNCTION search_knowledge_semantic(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_project_codes text[] DEFAULT NULL,
    filter_item_types text[] DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    project_code varchar,
    type varchar,
    title varchar,
    summary text,
    tags text[],
    similarity float,
    created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ki.id,
        p.code as project_code,
        ki.type,
        ki.title,
        ki.summary,
        ki.tags,
        1 - (ki.embedding <=> query_embedding) as similarity,
        ki.created_at
    FROM public.knowledge_items ki
    JOIN public.projects p ON ki.project_id = p.id
    WHERE
        ki.embedding IS NOT NULL
        AND 1 - (ki.embedding <=> query_embedding) > match_threshold
        AND (filter_project_codes IS NULL OR p.code = ANY(filter_project_codes))
        AND (filter_item_types IS NULL OR ki.type = ANY(filter_item_types))
    ORDER BY ki.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- =====================================================
-- HYBRID SEARCH FUNCTION (Vector + Full-text)
-- =====================================================
-- Combines semantic search with keyword search for best results
CREATE OR REPLACE FUNCTION search_knowledge_hybrid(
    search_query text,
    query_embedding vector(1536) DEFAULT NULL,
    match_count int DEFAULT 20,
    filter_project_codes text[] DEFAULT NULL,
    filter_item_types text[] DEFAULT NULL,
    semantic_weight float DEFAULT 0.5  -- 0.0 = pure keyword, 1.0 = pure semantic
)
RETURNS TABLE (
    id uuid,
    project_code varchar,
    type varchar,
    title varchar,
    summary text,
    tags text[],
    relevance float,
    created_at timestamptz
)
LANGUAGE plpgsql
AS $$
DECLARE
    ts_query tsquery;
BEGIN
    -- Create text search query
    ts_query := plainto_tsquery('english', search_query);

    RETURN QUERY
    SELECT
        ki.id,
        p.code as project_code,
        ki.type,
        ki.title,
        ki.summary,
        ki.tags,
        -- Combine scores: keyword relevance + semantic similarity
        CASE
            WHEN query_embedding IS NOT NULL AND ki.embedding IS NOT NULL THEN
                (1 - semantic_weight) * COALESCE(ts_rank(ki.searchable, ts_query), 0) +
                semantic_weight * (1 - (ki.embedding <=> query_embedding))
            ELSE
                ts_rank(ki.searchable, ts_query)
        END as relevance,
        ki.created_at
    FROM public.knowledge_items ki
    JOIN public.projects p ON ki.project_id = p.id
    WHERE
        (ki.searchable @@ ts_query OR
         (query_embedding IS NOT NULL AND ki.embedding IS NOT NULL))
        AND (filter_project_codes IS NULL OR p.code = ANY(filter_project_codes))
        AND (filter_item_types IS NULL OR ki.type = ANY(filter_item_types))
    ORDER BY relevance DESC
    LIMIT match_count;
END;
$$;

-- =====================================================
-- dIQ SCHEMA: ADD EMBEDDINGS TO ARTICLES
-- =====================================================
ALTER TABLE diq.articles
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Index for article embeddings
CREATE INDEX IF NOT EXISTS idx_diq_articles_embedding
ON diq.articles
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- =====================================================
-- dIQ SCHEMA: ADD EMBEDDINGS TO CHAT MESSAGES
-- =====================================================
-- Useful for finding similar conversations/responses
ALTER TABLE diq.chat_messages
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Index for chat message embeddings (for RAG retrieval)
CREATE INDEX IF NOT EXISTS idx_diq_chat_messages_embedding
ON diq.chat_messages
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- =====================================================
-- SEMANTIC ARTICLE SEARCH FOR dIQ
-- =====================================================
CREATE OR REPLACE FUNCTION diq.search_articles_semantic(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_category_slug text DEFAULT NULL,
    filter_status text DEFAULT 'published'
)
RETURNS TABLE (
    id uuid,
    title varchar,
    summary text,
    category_name varchar,
    author_name varchar,
    published_at timestamptz,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.title,
        a.summary,
        c.name as category_name,
        u.full_name as author_name,
        a.published_at,
        1 - (a.embedding <=> query_embedding) as similarity
    FROM diq.articles a
    LEFT JOIN diq.kb_categories c ON a.category_id = c.id
    LEFT JOIN public.users u ON a.author_id = u.id
    WHERE
        a.embedding IS NOT NULL
        AND 1 - (a.embedding <=> query_embedding) > match_threshold
        AND (filter_status IS NULL OR a.status = filter_status)
        AND (filter_category_slug IS NULL OR c.slug = filter_category_slug)
    ORDER BY a.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- =====================================================
-- FIND SIMILAR ARTICLES
-- =====================================================
CREATE OR REPLACE FUNCTION diq.find_similar_articles(
    article_id uuid,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id uuid,
    title varchar,
    summary text,
    similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
    source_embedding vector(1536);
BEGIN
    -- Get the embedding of the source article
    SELECT embedding INTO source_embedding
    FROM diq.articles
    WHERE id = article_id;

    IF source_embedding IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        a.id,
        a.title,
        a.summary,
        1 - (a.embedding <=> source_embedding) as similarity
    FROM diq.articles a
    WHERE
        a.id != article_id
        AND a.embedding IS NOT NULL
        AND a.status = 'published'
    ORDER BY a.embedding <=> source_embedding
    LIMIT match_count;
END;
$$;

-- =====================================================
-- RAG CONTEXT RETRIEVAL FOR CHAT
-- =====================================================
-- Get relevant context for AI chat responses
CREATE OR REPLACE FUNCTION diq.get_chat_context(
    query_embedding vector(1536),
    max_tokens int DEFAULT 4000,
    match_threshold float DEFAULT 0.7
)
RETURNS TABLE (
    source_type text,
    source_id uuid,
    title text,
    content text,
    similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
    total_chars int := 0;
    char_limit int := max_tokens * 4;  -- Approximate chars per token
BEGIN
    RETURN QUERY
    WITH ranked_sources AS (
        -- Articles
        SELECT
            'article'::text as source_type,
            a.id as source_id,
            a.title::text,
            COALESCE(a.summary, LEFT(a.content, 500))::text as content,
            1 - (a.embedding <=> query_embedding) as similarity,
            LENGTH(COALESCE(a.summary, LEFT(a.content, 500))) as content_length
        FROM diq.articles a
        WHERE
            a.embedding IS NOT NULL
            AND a.status = 'published'
            AND 1 - (a.embedding <=> query_embedding) > match_threshold

        UNION ALL

        -- Knowledge items
        SELECT
            ki.type::text as source_type,
            ki.id as source_id,
            ki.title::text,
            COALESCE(ki.summary, LEFT(ki.content, 500))::text as content,
            1 - (ki.embedding <=> query_embedding) as similarity,
            LENGTH(COALESCE(ki.summary, LEFT(ki.content, 500))) as content_length
        FROM public.knowledge_items ki
        JOIN public.projects p ON ki.project_id = p.id
        WHERE
            ki.embedding IS NOT NULL
            AND p.code = 'dIQ'
            AND 1 - (ki.embedding <=> query_embedding) > match_threshold
    )
    SELECT
        rs.source_type,
        rs.source_id,
        rs.title,
        rs.content,
        rs.similarity
    FROM ranked_sources rs
    WHERE rs.similarity > match_threshold
    ORDER BY rs.similarity DESC
    LIMIT 10;  -- Return top 10 most relevant sources
END;
$$;

-- =====================================================
-- EMBEDDING STATS VIEW
-- =====================================================
CREATE OR REPLACE VIEW public.embedding_stats AS
SELECT
    'knowledge_items' as table_name,
    COUNT(*) as total_rows,
    COUNT(embedding) as rows_with_embedding,
    ROUND(100.0 * COUNT(embedding) / NULLIF(COUNT(*), 0), 2) as embedding_coverage_pct
FROM public.knowledge_items
UNION ALL
SELECT
    'diq.articles' as table_name,
    COUNT(*) as total_rows,
    COUNT(embedding) as rows_with_embedding,
    ROUND(100.0 * COUNT(embedding) / NULLIF(COUNT(*), 0), 2) as embedding_coverage_pct
FROM diq.articles
UNION ALL
SELECT
    'diq.chat_messages' as table_name,
    COUNT(*) as total_rows,
    COUNT(embedding) as rows_with_embedding,
    ROUND(100.0 * COUNT(embedding) / NULLIF(COUNT(*), 0), 2) as embedding_coverage_pct
FROM diq.chat_messages;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON EXTENSION vector IS 'pgvector extension for vector similarity search';
COMMENT ON COLUMN public.knowledge_items.embedding IS 'Vector embedding (1536 dimensions) for semantic search';
COMMENT ON COLUMN diq.articles.embedding IS 'Vector embedding for semantic article search';
COMMENT ON COLUMN diq.chat_messages.embedding IS 'Vector embedding for RAG context retrieval';
COMMENT ON FUNCTION search_knowledge_semantic IS 'Semantic search using vector similarity';
COMMENT ON FUNCTION search_knowledge_hybrid IS 'Hybrid search combining keywords and vectors';
COMMENT ON FUNCTION diq.search_articles_semantic IS 'Semantic search for dIQ articles';
COMMENT ON FUNCTION diq.find_similar_articles IS 'Find similar articles based on content';
COMMENT ON FUNCTION diq.get_chat_context IS 'RAG context retrieval for AI chat';
