import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/embeddings';
import type { SemanticSearchResult, HybridSearchResult } from '@/lib/database.types';

/**
 * Generate embedding for search query using local model
 */
async function generateQueryEmbedding(text: string): Promise<number[]> {
  return generateEmbedding(text);
}

/**
 * POST /api/search
 * Semantic and hybrid search endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const {
      query,
      searchType = 'hybrid', // 'semantic', 'keyword', 'hybrid'
      contentTypes = ['article', 'news', 'event'],
      departmentId,
      limit = 10,
      threshold = 0.5,
    } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    let results: any[] = [];
    let searchMethod = searchType;

    // Try semantic search if OpenAI is configured
    if (searchType === 'semantic' || searchType === 'hybrid') {
      const embedding = await generateQueryEmbedding(query);

      if (embedding) {
        if (searchType === 'semantic') {
          // Pure semantic search using pgvector
          const { data, error } = await (supabase.rpc as any)('search_articles_semantic', {
            query_embedding: embedding,
            match_threshold: threshold,
            match_count: limit,
            department_filter: departmentId || null,
          }) as { data: SemanticSearchResult[] | null; error: any };

          if (!error && data) {
            results = data.map((item) => ({
              id: item.id,
              type: 'article',
              title: item.title,
              summary: item.summary,
              slug: item.slug,
              category: item.category_name,
              department: item.department_name,
              similarity: item.similarity,
              relevanceScore: Math.round(item.similarity * 100),
            }));
          }
        } else {
          // Hybrid search: combine keyword + semantic
          const { data, error } = await (supabase.rpc as any)('search_knowledge_hybrid', {
            search_query: query,
            query_embedding: embedding,
            keyword_weight: 0.3,
            semantic_weight: 0.7,
            match_threshold: threshold,
            match_count: limit,
            project_codes: null, // Search all projects
            item_types: contentTypes,
          }) as { data: HybridSearchResult[] | null; error: any };

          if (!error && data) {
            results = data.map((item) => ({
              id: item.id,
              type: item.item_type,
              title: item.title,
              summary: item.summary,
              projectCode: item.project_code,
              combinedScore: item.combined_score,
              keywordScore: item.keyword_score,
              semanticScore: item.semantic_score,
              relevanceScore: Math.round(item.combined_score * 100),
            }));
          }
        }
      } else if (searchType === 'semantic') {
        // No OpenAI configured, fall back to keyword for semantic requests
        searchMethod = 'keyword';
      }
    }

    // Keyword-only search (fallback or explicit)
    if (searchType === 'keyword' || (searchMethod === 'keyword' && results.length === 0)) {
      searchMethod = 'keyword';

      // Use public wrapper function for diq schema search
      const { data, error } = await (supabase.rpc as any)('search_diq_articles', {
        search_query: query,
        category_slug: null,
        max_results: limit,
      });

      if (!error && data) {
        results = (data as any[]).map((item) => ({
          id: item.id,
          type: 'article',
          title: item.title,
          summary: item.summary,
          category: item.category_name,
          author: item.author_name,
          relevanceScore: Math.round((item.relevance || 0.75) * 100),
        }));
      }
    }

    // Get AI summary if we have results and Anthropic is configured
    let aiSummary = null;
    if (results.length > 0 && process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const context = results
          .slice(0, 3)
          .map((r) => `- ${r.title}: ${r.summary || 'No summary'}`)
          .join('\n');

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 256,
          messages: [
            {
              role: 'user',
              content: `Based on these search results for "${query}":\n\n${context}\n\nProvide a 1-2 sentence summary of what the user might find helpful. Be concise.`,
            },
          ],
        });

        aiSummary =
          response.content[0].type === 'text' ? response.content[0].text : null;
      } catch (err) {
        console.error('AI summary generation failed:', err);
      }
    }

    return NextResponse.json({
      query,
      searchMethod,
      totalResults: results.length,
      results,
      aiSummary,
      embeddingsEnabled: true,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to process search request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/search/suggestions
 * Get search suggestions based on popular queries
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Get article titles that match
    const { data: articles } = await supabase
      .schema('diq')
      .from('articles')
      .select('title')
      .eq('status', 'published')
      .ilike('title', `%${query}%`)
      .limit(5);

    // Get recent search queries (if tracking is enabled)
    const { data: recentSearches } = await supabase
      .schema('diq')
      .from('search_history')
      .select('query')
      .ilike('query', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(5);

    const suggestions = [
      ...(articles?.map((a) => a.title) || []),
      ...(recentSearches?.map((s) => s.query) || []),
    ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

    return NextResponse.json({
      suggestions: suggestions.slice(0, 8),
    });
  } catch (error) {
    console.error('Suggestions API error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
