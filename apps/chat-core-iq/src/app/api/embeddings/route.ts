import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEmbedding, getEmbeddingDimensions } from '@/lib/embeddings';
import { validateAdminRequest, validateStrictAdminRequest } from '@/lib/api-auth';

/**
 * POST /api/embeddings
 * Generate and store embeddings for dCQ content
 *
 * Actions:
 * - generate_faq: Generate embedding for a single FAQ
 * - batch_faqs: Generate embeddings for all FAQs without embeddings
 * - batch_knowledge: Generate embeddings for master knowledge_items
 * - query: Generate embedding for a search query
 */
export async function POST(request: NextRequest) {
  // Require strict admin access for embedding generation (write operations)
  const authError = validateStrictAdminRequest(request);
  if (authError) return authError;

  try {
    const { action, faqId, text } = await request.json();

    // Generate embedding for specific FAQ
    if (action === 'generate_faq' && faqId) {
      // Use public schema view
      const { data: faq, error } = await supabase
        .from('dcq_faqs')
        .select('id, question, answer, category')
        .eq('id', faqId)
        .single();

      if (error || !faq) {
        return NextResponse.json({ error: 'FAQ not found', details: error?.message }, { status: 404 });
      }

      // Combine question and answer for embedding
      const textToEmbed = `${faq.question}\n\n${faq.answer}`;
      const embedding = await generateEmbedding(textToEmbed);

      // Store embedding via public schema view
      const { error: updateError } = await supabase
        .from('dcq_faqs')
        .update({ embedding: embedding as unknown as string })
        .eq('id', faqId);

      if (updateError) {
        console.error('Failed to store embedding:', updateError);
        return NextResponse.json({ error: 'Failed to store embedding', details: updateError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        faqId,
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

    // Batch generate embeddings for all FAQs without embeddings
    if (action === 'batch_faqs') {
      // Get all FAQs without embeddings using public schema view
      const { data: faqs, error } = await supabase
        .from('dcq_faqs')
        .select('id, question, answer')
        .is('embedding', null)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching FAQs:', error);
        return NextResponse.json({ error: 'Failed to fetch FAQs', details: error.message }, { status: 500 });
      }

      if (!faqs || faqs.length === 0) {
        return NextResponse.json({
          processed: 0,
          results: [],
          message: 'All FAQs already have embeddings',
        });
      }

      const results = [];
      for (const faq of faqs) {
        try {
          const textToEmbed = `${faq.question}\n\n${faq.answer}`;
          const embedding = await generateEmbedding(textToEmbed);

          // Store embedding via public schema view
          const { error: updateError } = await supabase
            .from('dcq_faqs')
            .update({ embedding: embedding as unknown as string })
            .eq('id', faq.id);

          if (updateError) {
            results.push({ id: faq.id, question: faq.question.substring(0, 50), success: false, error: updateError.message });
          } else {
            results.push({ id: faq.id, question: faq.question.substring(0, 50), success: true });
          }
        } catch (err) {
          results.push({ id: faq.id, question: faq.question.substring(0, 50), success: false, error: String(err) });
        }
      }

      return NextResponse.json({
        processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      });
    }

    // Batch generate embeddings for master knowledge_items
    if (action === 'batch_knowledge') {
      // Get all knowledge items without embeddings
      const { data: items, error } = await supabase
        .from('knowledge_items')
        .select('id, title, content, source_table')
        .is('embedding', null)
        .limit(50); // Process in batches to avoid timeout

      if (error) {
        console.error('Error fetching knowledge items:', error);
        return NextResponse.json({ error: 'Failed to fetch knowledge items', details: error.message }, { status: 500 });
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
          const textToEmbed = `${item.title}\n\n${item.content || ''}`;
          const embedding = await generateEmbedding(textToEmbed);

          // Store embedding in knowledge_items
          const { error: updateError } = await supabase
            .from('knowledge_items')
            .update({ embedding: embedding as unknown as string })
            .eq('id', item.id);

          if (updateError) {
            results.push({ id: item.id, title: item.title?.substring(0, 50), source: item.source_table, success: false, error: updateError.message });
          } else {
            results.push({ id: item.id, title: item.title?.substring(0, 50), source: item.source_table, success: true });
          }
        } catch (err) {
          results.push({ id: item.id, title: item.title?.substring(0, 50), source: item.source_table, success: false, error: String(err) });
        }
      }

      return NextResponse.json({
        processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: generate_faq, query, batch_faqs, or batch_knowledge' },
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
 * Get embedding coverage statistics for dCQ and master knowledge base
 */
export async function GET(request: NextRequest) {
  // Require admin access to view embedding stats
  const authError = validateAdminRequest(request);
  if (authError) return authError;

  try {
    // Get FAQ stats using public schema view
    const { data: faqStats, error: faqError } = await supabase
      .from('dcq_faqs')
      .select('id, embedding, status');

    if (faqError) {
      console.error('FAQ stats error:', faqError);
    }

    const activeFaqs = faqStats?.filter(f => f.status === 'active') || [];
    const totalFaqs = activeFaqs.length;
    const faqsWithEmbedding = activeFaqs.filter(f => f.embedding !== null).length;

    // Get knowledge entry stats using public schema view
    const { data: knowledgeStats, error: knowledgeError } = await supabase
      .from('dcq_knowledge_entries')
      .select('id, embedding, is_active');

    if (knowledgeError) {
      console.error('Knowledge stats error:', knowledgeError);
    }

    const activeKnowledge = knowledgeStats?.filter(k => k.is_active === true) || [];
    const totalKnowledge = activeKnowledge.length;
    const knowledgeWithEmbedding = activeKnowledge.filter(k => k.embedding !== null).length;

    // Get master knowledge_items stats
    const { data: masterStats, error: masterError } = await supabase
      .from('knowledge_items')
      .select('id, embedding, source_table');

    if (masterError) {
      console.error('Master KB stats error:', masterError);
    }

    const totalMaster = masterStats?.length || 0;
    const masterWithEmbedding = masterStats?.filter(m => m.embedding !== null).length || 0;

    // Count by source
    const bySource: Record<string, { total: number; withEmbedding: number }> = {};
    masterStats?.forEach(item => {
      const source = item.source_table?.split('.')[0] || 'unknown';
      if (!bySource[source]) {
        bySource[source] = { total: 0, withEmbedding: 0 };
      }
      bySource[source].total++;
      if (item.embedding) bySource[source].withEmbedding++;
    });

    return NextResponse.json({
      stats: {
        dcq_faqs: {
          total: totalFaqs,
          withEmbedding: faqsWithEmbedding,
          missing: totalFaqs - faqsWithEmbedding,
          coverage: totalFaqs > 0 ? Math.round((faqsWithEmbedding / totalFaqs) * 100) : 100,
        },
        dcq_knowledge_entries: {
          total: totalKnowledge,
          withEmbedding: knowledgeWithEmbedding,
          missing: totalKnowledge - knowledgeWithEmbedding,
          coverage: totalKnowledge > 0 ? Math.round((knowledgeWithEmbedding / totalKnowledge) * 100) : 100,
        },
        master_knowledge_items: {
          total: totalMaster,
          withEmbedding: masterWithEmbedding,
          missing: totalMaster - masterWithEmbedding,
          coverage: totalMaster > 0 ? Math.round((masterWithEmbedding / totalMaster) * 100) : 100,
          bySource,
        },
      },
      embeddingModel: 'all-MiniLM-L6-v2',
      dimensions: getEmbeddingDimensions(),
      provider: 'local (transformers.js)',
      actions: {
        generateMissing: 'POST with { action: "batch_knowledge" } to generate missing embeddings',
        generateFaqs: 'POST with { action: "batch_faqs" } to generate FAQ embeddings',
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats', details: String(error) }, { status: 500 });
  }
}
