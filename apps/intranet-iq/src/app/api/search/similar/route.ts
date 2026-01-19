import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { SimilarArticleResult } from '@/lib/database.types';

/**
 * GET /api/search/similar?articleId=xxx
 * Find articles similar to a given article using vector similarity
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId is required' },
        { status: 400 }
      );
    }

    // Use the find_similar_articles function
    const { data, error } = await (supabase.rpc as any)('find_similar_articles', {
      article_id: articleId,
      match_count: limit,
    }) as { data: SimilarArticleResult[] | null; error: any };

    if (error) {
      console.error('Similar articles error:', error);

      // If the function doesn't exist or embedding is missing, fall back to category-based
      const { data: article } = await supabase
        .schema('diq')
        .from('articles')
        .select('category_id')
        .eq('id', articleId)
        .single();

      if (article) {
        const { data: similar } = await supabase
          .schema('diq')
          .from('articles')
          .select('id, title, summary, slug')
          .eq('category_id', article.category_id)
          .eq('status', 'published')
          .neq('id', articleId)
          .limit(limit);

        return NextResponse.json({
          articleId,
          method: 'category-based',
          similar: similar || [],
        });
      }

      return NextResponse.json({ error: 'Failed to find similar articles' }, { status: 500 });
    }

    const similar = (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      slug: item.slug,
      category: item.category_name,
      similarity: item.similarity,
      relevanceScore: Math.round(item.similarity * 100),
    }));

    return NextResponse.json({
      articleId,
      method: 'semantic',
      similar,
    });
  } catch (error) {
    console.error('Similar articles API error:', error);
    return NextResponse.json(
      { error: 'Failed to find similar articles' },
      { status: 500 }
    );
  }
}
