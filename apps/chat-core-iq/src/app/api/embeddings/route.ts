import { NextRequest, NextResponse } from 'next/server';
import { supabaseDcq } from '@/lib/supabase';
import { generateEmbedding, getEmbeddingDimensions } from '@/lib/embeddings';

/**
 * POST /api/embeddings
 * Generate and store embeddings for dCQ content
 *
 * Actions:
 * - generate_faq: Generate embedding for a single FAQ
 * - batch_faqs: Generate embeddings for all FAQs without embeddings
 * - query: Generate embedding for a search query
 */
export async function POST(request: NextRequest) {
  try {
    const { action, faqId, text } = await request.json();

    // Generate embedding for specific FAQ
    if (action === 'generate_faq' && faqId) {
      const { data: faq, error } = await supabaseDcq
        .from('faqs')
        .select('id, question, answer, category')
        .eq('id', faqId)
        .single();

      if (error || !faq) {
        return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
      }

      // Combine question and answer for embedding
      const textToEmbed = `${faq.question}\n\n${faq.answer}`;
      const embedding = await generateEmbedding(textToEmbed);

      // Store embedding
      const { error: updateError } = await supabaseDcq
        .from('faqs')
        .update({ embedding: embedding as unknown as string })
        .eq('id', faqId);

      if (updateError) {
        console.error('Failed to store embedding:', updateError);
        return NextResponse.json({ error: 'Failed to store embedding' }, { status: 500 });
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
      // Get all FAQs without embeddings
      const { data: faqs, error } = await supabaseDcq
        .from('faqs')
        .select('id, question, answer')
        .is('embedding', null)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching FAQs:', error);
        return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
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

          // Store embedding
          const { error: updateError } = await supabaseDcq
            .from('faqs')
            .update({ embedding: embedding as unknown as string })
            .eq('id', faq.id);

          if (updateError) {
            results.push({ id: faq.id, question: faq.question.substring(0, 50), success: false, error: String(updateError) });
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

    return NextResponse.json(
      { error: 'Invalid action. Use: generate_faq, query, or batch_faqs' },
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
 * Get embedding coverage statistics for dCQ
 */
export async function GET() {
  try {
    // Get FAQ stats
    const { data: faqStats, error: faqError } = await supabaseDcq
      .from('faqs')
      .select('id, embedding')
      .eq('status', 'active');

    if (faqError) {
      return NextResponse.json({ error: 'Failed to fetch FAQ stats' }, { status: 500 });
    }

    const totalFaqs = faqStats?.length || 0;
    const faqsWithEmbedding = faqStats?.filter(f => f.embedding !== null).length || 0;

    // Get knowledge entry stats
    const { data: knowledgeStats, error: knowledgeError } = await supabaseDcq
      .from('knowledge_entries')
      .select('id, embedding')
      .eq('is_active', true);

    const totalKnowledge = knowledgeStats?.length || 0;
    const knowledgeWithEmbedding = knowledgeStats?.filter(k => k.embedding !== null).length || 0;

    return NextResponse.json({
      stats: {
        faqs: {
          total: totalFaqs,
          withEmbedding: faqsWithEmbedding,
          coverage: totalFaqs > 0 ? Math.round((faqsWithEmbedding / totalFaqs) * 100) : 0,
        },
        knowledgeEntries: {
          total: totalKnowledge,
          withEmbedding: knowledgeWithEmbedding,
          coverage: totalKnowledge > 0 ? Math.round((knowledgeWithEmbedding / totalKnowledge) * 100) : 0,
        },
      },
      embeddingModel: 'all-MiniLM-L6-v2',
      dimensions: getEmbeddingDimensions(),
      provider: 'local (transformers.js)',
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
