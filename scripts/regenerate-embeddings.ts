/**
 * Script to regenerate all embeddings using OpenAI text-embedding-3-small
 * Run with: npx tsx scripts/regenerate-embeddings.ts
 */

import { createClient } from '@supabase/supabase-js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fhtempgkltrazrgbedrh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set');
  process.exit(1);
}

if (!SUPABASE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY!);

interface OpenAIEmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
  usage: {
    total_tokens: number;
  };
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000).trim(),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data: OpenAIEmbeddingResponse = await response.json();
  return data.data[0].embedding;
}

async function updateKnowledgeItems() {
  console.log('\n📚 Updating public.knowledge_items...');

  const { data: items, error } = await supabase
    .from('knowledge_items')
    .select('id, title, content')
    .is('embedding', null);

  if (error) {
    console.error('Error fetching knowledge_items:', error);
    return 0;
  }

  let updated = 0;
  for (const item of items || []) {
    try {
      const text = `${item.title}\n\n${item.content}`;
      const embedding = await generateEmbedding(text);

      const { error: updateError } = await supabase
        .from('knowledge_items')
        .update({ embedding: embedding as any })
        .eq('id', item.id);

      if (updateError) {
        console.error(`  ❌ Failed to update ${item.id}:`, updateError.message);
      } else {
        updated++;
        console.log(`  ✅ ${item.title.substring(0, 40)}...`);
      }

      // Rate limit protection
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.error(`  ❌ Error processing ${item.id}:`, err);
    }
  }

  return updated;
}

async function updateDcqFaqs() {
  console.log('\n💬 Updating dcq.faqs...');

  const { data: faqs, error } = await supabase
    .schema('dcq')
    .from('faqs')
    .select('id, question, answer')
    .is('embedding', null);

  if (error) {
    console.error('Error fetching dcq.faqs:', error);
    return 0;
  }

  let updated = 0;
  for (const faq of faqs || []) {
    try {
      const text = `${faq.question}\n\n${faq.answer}`;
      const embedding = await generateEmbedding(text);

      const { error: updateError } = await supabase
        .schema('dcq')
        .from('faqs')
        .update({ embedding: embedding as any })
        .eq('id', faq.id);

      if (updateError) {
        console.error(`  ❌ Failed to update ${faq.id}:`, updateError.message);
      } else {
        updated++;
        console.log(`  ✅ ${faq.question.substring(0, 40)}...`);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.error(`  ❌ Error processing ${faq.id}:`, err);
    }
  }

  return updated;
}

async function updateDiqArticles() {
  console.log('\n📰 Updating diq.articles...');

  const { data: articles, error } = await supabase
    .schema('diq')
    .from('articles')
    .select('id, title, content')
    .is('embedding', null);

  if (error) {
    console.error('Error fetching diq.articles:', error);
    return 0;
  }

  let updated = 0;
  for (const article of articles || []) {
    try {
      const text = `${article.title}\n\n${article.content}`;
      const embedding = await generateEmbedding(text);

      const { error: updateError } = await supabase
        .schema('diq')
        .from('articles')
        .update({ embedding: embedding as any })
        .eq('id', article.id);

      if (updateError) {
        console.error(`  ❌ Failed to update ${article.id}:`, updateError.message);
      } else {
        updated++;
        console.log(`  ✅ ${article.title.substring(0, 40)}...`);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.error(`  ❌ Error processing ${article.id}:`, err);
    }
  }

  return updated;
}

async function main() {
  console.log('🚀 Starting embedding regeneration with OpenAI text-embedding-3-small');
  console.log('   Dimensions: 1536');
  console.log('   Supabase URL:', SUPABASE_URL);

  const knowledgeCount = await updateKnowledgeItems();
  const faqCount = await updateDcqFaqs();
  const articleCount = await updateDiqArticles();

  console.log('\n✨ Embedding regeneration complete!');
  console.log(`   Knowledge Items: ${knowledgeCount} updated`);
  console.log(`   DCQ FAQs: ${faqCount} updated`);
  console.log(`   DIQ Articles: ${articleCount} updated`);
  console.log(`   Total: ${knowledgeCount + faqCount + articleCount} embeddings generated`);
}

main().catch(console.error);
