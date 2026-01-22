/**
 * Federated Search
 * Search across multiple knowledge sources with unified results
 */

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/lib/embeddings';
import { ConnectorFactory, ConnectorConfig, ConnectorItem } from '@/lib/connectors';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface FederatedSearchParams {
  query: string;
  userId?: string;
  organizationId?: string;
  kbSpaceIds?: string[];
  sources?: SearchSource[];
  contentTypes?: string[];
  limit?: number;
  offset?: number;
  minScore?: number;
  includeConnectors?: boolean;
  semanticSearch?: boolean;
}

export type SearchSource =
  | 'internal_kb'
  | 'articles'
  | 'connectors'
  | 'knowledge_items'
  | 'news'
  | 'employees';

export interface SearchResult {
  id: string;
  source: SearchSource;
  source_id?: string;
  title: string;
  excerpt?: string;
  content?: string;
  content_type?: string;
  url?: string;
  thumbnail_url?: string;
  author?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  category?: string;
  tags?: string[];
  score: number;
  highlight?: {
    title?: string;
    content?: string;
  };
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface FederatedSearchResult {
  results: SearchResult[];
  total: number;
  sources: {
    source: SearchSource;
    count: number;
    duration_ms: number;
  }[];
  query: string;
  took_ms: number;
  has_more: boolean;
}

/**
 * Perform federated search across multiple sources
 */
export async function federatedSearch(
  params: FederatedSearchParams
): Promise<FederatedSearchResult> {
  const startTime = Date.now();
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const {
    query,
    sources = ['internal_kb', 'articles', 'knowledge_items'],
    limit = 20,
    offset = 0,
    minScore = 0.1,
    includeConnectors = true,
    semanticSearch = true,
  } = params;

  const allResults: SearchResult[] = [];
  const sourceStats: FederatedSearchResult['sources'] = [];

  // Generate embedding for semantic search
  let queryEmbedding: number[] | null = null;
  if (semanticSearch) {
    try {
      queryEmbedding = await generateEmbedding(query);
    } catch (error) {
      console.error('Failed to generate embedding:', error);
    }
  }

  // Search each source in parallel
  const searchPromises: Promise<void>[] = [];

  // Internal KB / Articles search
  if (sources.includes('internal_kb') || sources.includes('articles')) {
    searchPromises.push(
      (async () => {
        const sourceStart = Date.now();
        try {
          const results = await searchArticles(supabase, query, queryEmbedding, params);
          allResults.push(...results);
          sourceStats.push({
            source: 'articles',
            count: results.length,
            duration_ms: Date.now() - sourceStart,
          });
        } catch (error) {
          console.error('Articles search error:', error);
          sourceStats.push({
            source: 'articles',
            count: 0,
            duration_ms: Date.now() - sourceStart,
          });
        }
      })()
    );
  }

  // Knowledge items search
  if (sources.includes('knowledge_items')) {
    searchPromises.push(
      (async () => {
        const sourceStart = Date.now();
        try {
          const results = await searchKnowledgeItems(supabase, query, queryEmbedding, params);
          allResults.push(...results);
          sourceStats.push({
            source: 'knowledge_items',
            count: results.length,
            duration_ms: Date.now() - sourceStart,
          });
        } catch (error) {
          console.error('Knowledge items search error:', error);
          sourceStats.push({
            source: 'knowledge_items',
            count: 0,
            duration_ms: Date.now() - sourceStart,
          });
        }
      })()
    );
  }

  // News search
  if (sources.includes('news')) {
    searchPromises.push(
      (async () => {
        const sourceStart = Date.now();
        try {
          const results = await searchNews(supabase, query, params);
          allResults.push(...results);
          sourceStats.push({
            source: 'news',
            count: results.length,
            duration_ms: Date.now() - sourceStart,
          });
        } catch (error) {
          console.error('News search error:', error);
          sourceStats.push({
            source: 'news',
            count: 0,
            duration_ms: Date.now() - sourceStart,
          });
        }
      })()
    );
  }

  // Employee search
  if (sources.includes('employees')) {
    searchPromises.push(
      (async () => {
        const sourceStart = Date.now();
        try {
          const results = await searchEmployees(supabase, query, params);
          allResults.push(...results);
          sourceStats.push({
            source: 'employees',
            count: results.length,
            duration_ms: Date.now() - sourceStart,
          });
        } catch (error) {
          console.error('Employees search error:', error);
          sourceStats.push({
            source: 'employees',
            count: 0,
            duration_ms: Date.now() - sourceStart,
          });
        }
      })()
    );
  }

  // Connector search
  if (includeConnectors && sources.includes('connectors')) {
    searchPromises.push(
      (async () => {
        const sourceStart = Date.now();
        try {
          const results = await searchConnectors(supabase, query, params);
          allResults.push(...results);
          sourceStats.push({
            source: 'connectors',
            count: results.length,
            duration_ms: Date.now() - sourceStart,
          });
        } catch (error) {
          console.error('Connectors search error:', error);
          sourceStats.push({
            source: 'connectors',
            count: 0,
            duration_ms: Date.now() - sourceStart,
          });
        }
      })()
    );
  }

  // Wait for all searches to complete
  await Promise.all(searchPromises);

  // Normalize and deduplicate results
  const normalizedResults = normalizeResults(allResults);

  // Filter by minimum score
  const filteredResults = normalizedResults.filter(r => r.score >= minScore);

  // Sort by score
  filteredResults.sort((a, b) => b.score - a.score);

  // Apply pagination
  const paginatedResults = filteredResults.slice(offset, offset + limit);

  return {
    results: paginatedResults,
    total: filteredResults.length,
    sources: sourceStats,
    query,
    took_ms: Date.now() - startTime,
    has_more: offset + limit < filteredResults.length,
  };
}

/**
 * Search articles in the KB
 */
async function searchArticles(
  supabase: ReturnType<typeof createClient>,
  query: string,
  embedding: number[] | null,
  params: FederatedSearchParams
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  // Text search
  const { data: textResults } = await supabase
    .schema('diq')
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      status,
      category_id,
      author_id,
      created_at,
      updated_at,
      category:kb_categories(name),
      author:users(id, full_name, avatar_url)
    `)
    .textSearch('title', query, { type: 'websearch', config: 'english' })
    .eq('status', 'published')
    .limit(params.limit || 20);

  for (const article of textResults || []) {
    results.push({
      id: `article-${article.id}`,
      source: 'articles',
      source_id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content?.substring(0, 500),
      content_type: 'html',
      url: `/diq/content/${article.slug}`,
      author: article.author
        ? {
            id: (article.author as { id: string }).id,
            name: (article.author as { full_name: string }).full_name,
            avatar_url: (article.author as { avatar_url?: string }).avatar_url,
          }
        : undefined,
      category: (article.category as { name: string })?.name,
      score: 0.8,
      created_at: article.created_at,
      updated_at: article.updated_at,
    });
  }

  // Semantic search with embedding
  if (embedding) {
    const { data: semanticResults } = await supabase
      .schema('diq')
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        embedding,
        created_at,
        category:kb_categories(name)
      `)
      .eq('status', 'published')
      .not('embedding', 'is', null)
      .limit(params.limit || 20);

    for (const article of semanticResults || []) {
      if (!article.embedding) continue;

      const similarity = cosineSimilarity(embedding, article.embedding);
      if (similarity < 0.3) continue;

      // Check if already in results
      const existingIdx = results.findIndex(r => r.source_id === article.id);
      if (existingIdx >= 0) {
        // Boost existing result
        results[existingIdx].score = Math.min(1, results[existingIdx].score + similarity * 0.3);
        continue;
      }

      results.push({
        id: `article-${article.id}`,
        source: 'articles',
        source_id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        url: `/diq/content/${article.slug}`,
        category: (article.category as { name: string })?.name,
        score: similarity,
        created_at: article.created_at,
      });
    }
  }

  return results;
}

/**
 * Search unified knowledge items
 */
async function searchKnowledgeItems(
  supabase: ReturnType<typeof createClient>,
  query: string,
  embedding: number[] | null,
  params: FederatedSearchParams
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  // Full-text search using tsvector
  const { data: textResults } = await supabase
    .schema('diq')
    .from('knowledge_items')
    .select('*')
    .textSearch('search_vector', query, { config: 'english' })
    .eq('status', 'published')
    .limit(params.limit || 20);

  for (const item of textResults || []) {
    results.push({
      id: `ki-${item.id}`,
      source: 'knowledge_items',
      source_id: item.id,
      title: item.title,
      excerpt: item.excerpt,
      content: item.content?.substring(0, 500),
      content_type: item.content_type,
      url: item.internal_url || item.source_url,
      category: item.category_id,
      tags: item.tags,
      score: 0.7,
      metadata: {
        source_type: item.source_type,
        view_count: item.view_count,
      },
      created_at: item.created_at,
      updated_at: item.updated_at,
    });
  }

  // Semantic search
  if (embedding) {
    const { data: semanticResults } = await supabase
      .schema('diq')
      .from('knowledge_items')
      .select('id, title, excerpt, embedding, source_url, internal_url, tags')
      .eq('status', 'published')
      .not('embedding', 'is', null)
      .limit(params.limit || 20);

    for (const item of semanticResults || []) {
      if (!item.embedding) continue;

      const similarity = cosineSimilarity(embedding, item.embedding);
      if (similarity < 0.3) continue;

      const existingIdx = results.findIndex(r => r.source_id === item.id && r.source === 'knowledge_items');
      if (existingIdx >= 0) {
        results[existingIdx].score = Math.min(1, results[existingIdx].score + similarity * 0.3);
        continue;
      }

      results.push({
        id: `ki-${item.id}`,
        source: 'knowledge_items',
        source_id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        url: item.internal_url || item.source_url,
        tags: item.tags,
        score: similarity,
      });
    }
  }

  return results;
}

/**
 * Search news posts
 */
async function searchNews(
  supabase: ReturnType<typeof createClient>,
  query: string,
  params: FederatedSearchParams
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  const { data: posts } = await supabase
    .schema('diq')
    .from('news_posts')
    .select(`
      id,
      content,
      type,
      attachments,
      pinned,
      published_at,
      author:author_id(id, full_name, avatar_url)
    `)
    .ilike('content', `%${query}%`)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(params.limit || 20);

  for (const post of posts || []) {
    // Extract title from content (first line or first 100 chars)
    const content = post.content || '';
    const title = content.split('\n')[0].substring(0, 100) || 'News Post';

    results.push({
      id: `news-${post.id}`,
      source: 'news',
      source_id: post.id,
      title,
      excerpt: content.substring(0, 200),
      content_type: 'text',
      url: `/diq/news/${post.id}`,
      author: post.author
        ? {
            id: (post.author as { id: string }).id,
            name: (post.author as { full_name: string }).full_name,
            avatar_url: (post.author as { avatar_url?: string }).avatar_url,
          }
        : undefined,
      score: post.pinned ? 0.9 : 0.6,
      metadata: {
        type: post.type,
        pinned: post.pinned,
        attachments_count: (post.attachments as unknown[])?.length || 0,
      },
      created_at: post.published_at,
    });
  }

  return results;
}

/**
 * Search employees
 */
async function searchEmployees(
  supabase: ReturnType<typeof createClient>,
  query: string,
  params: FederatedSearchParams
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  // Search in employees joined with users
  const { data: employees } = await supabase
    .schema('diq')
    .from('employees')
    .select(`
      id,
      job_title,
      location,
      user:user_id(id, full_name, email, avatar_url),
      department:department_id(id, name)
    `)
    .or(`job_title.ilike.%${query}%,location.ilike.%${query}%`)
    .limit(params.limit || 20);

  for (const emp of employees || []) {
    const user = emp.user as { id: string; full_name: string; email: string; avatar_url?: string } | null;
    if (!user) continue;

    results.push({
      id: `employee-${emp.id}`,
      source: 'employees',
      source_id: emp.id,
      title: user.full_name,
      excerpt: `${emp.job_title} - ${(emp.department as { name: string })?.name || 'Unknown Department'}`,
      thumbnail_url: user.avatar_url,
      url: `/diq/people?id=${emp.id}`,
      author: {
        id: user.id,
        name: user.full_name,
        avatar_url: user.avatar_url,
      },
      score: 0.7,
      metadata: {
        job_title: emp.job_title,
        department: (emp.department as { name: string })?.name,
        location: emp.location,
        email: user.email,
      },
    });
  }

  // Also search by name in users
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, avatar_url')
    .ilike('full_name', `%${query}%`)
    .limit(params.limit || 20);

  for (const user of users || []) {
    // Skip if already in results
    if (results.some(r => r.author?.id === user.id)) continue;

    results.push({
      id: `user-${user.id}`,
      source: 'employees',
      source_id: user.id,
      title: user.full_name,
      excerpt: user.email,
      thumbnail_url: user.avatar_url,
      url: `/diq/people?userId=${user.id}`,
      author: {
        id: user.id,
        name: user.full_name,
        avatar_url: user.avatar_url,
      },
      score: 0.65,
    });
  }

  return results;
}

/**
 * Search connected external sources
 */
async function searchConnectors(
  supabase: ReturnType<typeof createClient>,
  query: string,
  params: FederatedSearchParams
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  // Get active connectors
  const { data: connectors } = await supabase
    .schema('diq')
    .from('connectors')
    .select('*')
    .eq('status', 'active');

  if (!connectors || connectors.length === 0) {
    return results;
  }

  // Search synced items from connectors
  const { data: items } = await supabase
    .schema('diq')
    .from('connector_items')
    .select('*')
    .eq('sync_status', 'synced')
    .ilike('title', `%${query}%`)
    .limit(params.limit || 20);

  for (const item of items || []) {
    const connector = connectors.find(c => c.id === item.connector_id);

    results.push({
      id: `connector-${item.id}`,
      source: 'connectors',
      source_id: item.id,
      title: item.title,
      excerpt: item.excerpt,
      content: item.content?.substring(0, 500),
      content_type: item.content_type,
      url: item.source_url,
      author: item.author_name
        ? {
            id: item.author_id || '',
            name: item.author_name,
            avatar_url: item.author_avatar_url,
          }
        : undefined,
      tags: item.tags,
      score: 0.6,
      metadata: {
        connector_type: connector?.type,
        connector_name: connector?.name,
        source_path: item.source_path,
      },
      created_at: item.external_created_at,
      updated_at: item.external_updated_at,
    });
  }

  // Optionally, also search live via connector APIs
  // (Disabled by default for performance)
  const searchLive = false;

  if (searchLive) {
    for (const connectorConfig of connectors) {
      try {
        const connector = ConnectorFactory.create(connectorConfig as ConnectorConfig);
        const liveResults = await connector.search({
          query,
          limit: 10,
        });

        for (const item of liveResults) {
          results.push({
            id: `live-${connectorConfig.type}-${item.external_id}`,
            source: 'connectors',
            source_id: item.external_id,
            title: item.title,
            excerpt: item.excerpt,
            content_type: item.content_type,
            url: item.source_url,
            author: item.author,
            score: 0.5, // Lower score for live results
            metadata: {
              connector_type: connectorConfig.type,
              connector_name: connectorConfig.name,
              live: true,
            },
          });
        }
      } catch (error) {
        console.error(`Live search failed for connector ${connectorConfig.id}:`, error);
      }
    }
  }

  return results;
}

/**
 * Normalize and deduplicate results
 */
function normalizeResults(results: SearchResult[]): SearchResult[] {
  const seen = new Map<string, SearchResult>();

  for (const result of results) {
    const key = `${result.source}-${result.source_id}`;

    if (seen.has(key)) {
      // Keep the one with higher score
      const existing = seen.get(key)!;
      if (result.score > existing.score) {
        seen.set(key, result);
      }
    } else {
      seen.set(key, result);
    }
  }

  return Array.from(seen.values());
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Highlight matching text in results
 */
export function highlightMatches(text: string, query: string): string {
  if (!text || !query) return text;

  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  let highlighted = text;

  for (const word of words) {
    const regex = new RegExp(`(${word})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  }

  return highlighted;
}
