#!/usr/bin/env node
/**
 * dTQ Knowledge Base - Generate Embeddings Script
 *
 * Generates OpenAI embeddings for all dtq.knowledge_base rows
 * that are missing embeddings. Uses text-embedding-3-small (1536d).
 *
 * Usage: node scripts/dtq-generate-embeddings.mjs
 * Requires: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in env
 */

import { createClient } from '@supabase/supabase-js';

// Configuration from environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://fhtempgkltrazrgbedrh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodGVtcGdrbHRyYXpyZ2JlZHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODgzOTEsImV4cCI6MjA4NDM2NDM5MX0.6nESGQI48SWOfwBen2IRDStMMkOEKBKdAE6xCK7McQs';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is required');
  console.log('Set it with: export OPENAI_API_KEY="sk-proj-..."');
  process.exit(1);
}

// Use public schema (default) — dtq schema is not exposed via PostgREST.
// We use SECURITY DEFINER RPC functions to access dtq.knowledge_base.
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Generate embedding using OpenAI API
 */
async function generateEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('dTQ Knowledge Base - Embedding Generator');
  console.log('='.repeat(60));
  console.log('');

  // Step 1: Get knowledge_base rows without embeddings
  console.log('1. Finding dtq.knowledge_base rows without embeddings...\n');

  const { data: items, error: fetchError } = await supabase
    .rpc('get_dtq_kb_without_embeddings');

  if (fetchError) {
    console.error('Error fetching items:', fetchError.message);
    process.exit(1);
  }

  if (!items || items.length === 0) {
    console.log('All dtq.knowledge_base rows already have embeddings!\n');
  } else {
    console.log(`Found ${items.length} rows without embeddings.\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const textToEmbed = [item.title, item.content].filter(Boolean).join('\n\n');

        process.stdout.write(`  [${i + 1}/${items.length}] ${item.title.substring(0, 50).padEnd(50)} `);

        const embedding = await generateEmbedding(textToEmbed);

        const { error: updateError } = await supabase
          .rpc('update_dtq_kb_embedding', {
            row_id: item.id,
            new_embedding: embedding,
          });

        if (updateError) {
          console.log(`FAILED: ${updateError.message}`);
          errorCount++;
        } else {
          console.log('OK');
          successCount++;
        }

        // Rate limit: 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.log(`ERROR: ${err.message}`);
        errorCount++;
      }
    }

    console.log('');
    console.log(`   dtq.knowledge_base: ${successCount} updated, ${errorCount} errors`);
  }

  // Step 2: Update public.knowledge_items that match dTQ entries
  console.log('\n2. Updating public.knowledge_items embeddings...\n');

  const { data: publicItems, error: publicFetchError } = await supabase
    .from('knowledge_items')
    .select('id, title, content, summary, source_table')
    .eq('source_table', 'dtq.knowledge_base')
    .is('embedding', null);

  if (publicFetchError) {
    console.error('Error fetching public items:', publicFetchError.message);
  } else if (!publicItems || publicItems.length === 0) {
    console.log('All public.knowledge_items (dTQ) already have embeddings!\n');
  } else {
    console.log(`Found ${publicItems.length} public knowledge_items without embeddings.\n`);

    let pubSuccess = 0;
    let pubError = 0;

    for (let i = 0; i < publicItems.length; i++) {
      const item = publicItems[i];
      try {
        const textToEmbed = [item.title, item.summary || '', item.content || ''].filter(Boolean).join('\n\n');

        process.stdout.write(`  [${i + 1}/${publicItems.length}] ${item.title.substring(0, 50).padEnd(50)} `);

        const embedding = await generateEmbedding(textToEmbed);

        const { error: updateError } = await supabase
          .from('knowledge_items')
          .update({ embedding })
          .eq('id', item.id);

        if (updateError) {
          console.log(`FAILED: ${updateError.message}`);
          pubError++;
        } else {
          console.log('OK');
          pubSuccess++;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.log(`ERROR: ${err.message}`);
        pubError++;
      }
    }

    console.log('');
    console.log(`   public.knowledge_items: ${pubSuccess} updated, ${pubError} errors`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('COMPLETE');
  console.log('='.repeat(60));
  console.log('');
  console.log('Verify with:');
  console.log('  SELECT COUNT(*), COUNT(embedding) FROM dtq.knowledge_base;');
  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
