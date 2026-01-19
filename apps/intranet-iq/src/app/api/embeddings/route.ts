import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEmbedding, getEmbeddingDimensions } from '@/lib/embeddings';

/**
 * POST /api/embeddings
 * Generate and store embeddings for content using local model
 */
export async function POST(request: NextRequest) {
  try {
    const { action, articleId, text } = await request.json();

    // Generate embedding for specific article
    if (action === 'generate_article' && articleId) {
      const { data: article, error } = await (supabase as any)
        .schema('diq')
        .from('articles')
        .select('id, title, content, summary')
        .eq('id', articleId)
        .single();

      if (error || !article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      // Combine title, summary, and content for embedding
      const textToEmbed = `${article.title}\n\n${article.summary || ''}\n\n${article.content || ''}`;
      const embedding = await generateEmbedding(textToEmbed);

      // Store embedding
      const { error: updateError } = await (supabase as any)
        .schema('diq')
        .from('articles')
        .update({ embedding: embedding as unknown as string })
        .eq('id', articleId);

      if (updateError) {
        console.error('Failed to store embedding:', updateError);
        return NextResponse.json({ error: 'Failed to store embedding' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        articleId,
        dimensions: embedding.length,
      });
    }

    // Generate embedding for arbitrary text (for search queries)
    if (action === 'query' && text) {
      const embedding = await generateEmbedding(text);
      return NextResponse.json({
        embedding,
        dimensions: embedding.length,
      });
    }

    // Batch generate embeddings for all knowledge_items without embeddings
    if (action === 'batch_knowledge_items') {
      const limit = 50; // Process 50 at a time

      // Get items needing embeddings from public.knowledge_items
      const { data: items, error } = await supabase
        .from('knowledge_items')
        .select('id, title, content, summary, source_table')
        .is('embedding', null)
        .limit(limit);

      if (error) {
        console.error('Failed to fetch knowledge items:', error);
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
      }

      if (!items || items.length === 0) {
        return NextResponse.json({
          processed: 0,
          results: [],
          message: 'All knowledge items already have embeddings',
        });
      }

      const results = [];
      for (const item of items) {
        try {
          const textToEmbed = `${item.title || ''}\n\n${item.summary || ''}\n\n${item.content || ''}`.trim();
          if (!textToEmbed) {
            results.push({ id: item.id, source: item.source_table, success: false, error: 'No text content' });
            continue;
          }

          const embedding = await generateEmbedding(textToEmbed);

          // Store embedding directly
          const { error: updateError } = await supabase
            .from('knowledge_items')
            .update({ embedding: embedding as unknown as string })
            .eq('id', item.id);

          if (updateError) {
            results.push({ id: item.id, source: item.source_table, success: false, error: updateError.message });
          } else {
            results.push({ id: item.id, title: item.title, source: item.source_table, success: true });
          }
        } catch (err) {
          results.push({ id: item.id, source: item.source_table, success: false, error: String(err) });
        }
      }

      // Get remaining count
      const { count } = await supabase
        .from('knowledge_items')
        .select('id', { count: 'exact', head: true })
        .is('embedding', null);

      return NextResponse.json({
        processed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        remaining: count || 0,
        results,
      });
    }

    // Batch generate embeddings for all articles without embeddings
    if (action === 'batch_articles') {
      // Use direct SQL since diq schema might not be exposed
      const { data: articles, error } = await supabase.rpc('get_articles_without_embeddings');

      if (error) {
        // Fallback: try to create the function
        await supabase.rpc('create_get_articles_function').catch(() => {});

        // Just return an empty result
        return NextResponse.json({
          processed: 0,
          results: [],
          message: 'No articles to process or function not available',
        });
      }

      if (!articles || articles.length === 0) {
        return NextResponse.json({
          processed: 0,
          results: [],
          message: 'All articles already have embeddings',
        });
      }

      const results = [];
      for (const article of articles) {
        try {
          const textToEmbed = `${article.title}\n\n${article.summary || ''}\n\n${article.content || ''}`;
          const embedding = await generateEmbedding(textToEmbed);

          // Store using RPC function
          await (supabase.rpc as any)('update_article_embedding', {
            article_id: article.id,
            embedding_vector: embedding,
          });

          results.push({ id: article.id, title: article.title, success: true });
        } catch (err) {
          results.push({ id: article.id, title: article.title, success: false, error: String(err) });
        }
      }

      return NextResponse.json({
        processed: results.length,
        results,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: generate_article, query, or batch_articles' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Embeddings API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate embeddings', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/embeddings
 * Get embedding coverage statistics
 */
export async function GET() {
  try {
    const { data, error } = await supabase.from('embedding_stats').select('*');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    return NextResponse.json({
      stats: data,
      embeddingModel: 'all-MiniLM-L6-v2',
      dimensions: getEmbeddingDimensions(),
      provider: 'local (transformers.js)',
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
