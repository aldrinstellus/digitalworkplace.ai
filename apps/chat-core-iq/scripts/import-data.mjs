#!/usr/bin/env node
// Import script for scraped data to Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importCrawlerUrls() {
  console.log('Importing crawler URLs...');
  const data = JSON.parse(readFileSync(join(dataDir, 'crawler-urls.json'), 'utf-8'));

  const urls = data.map(item => ({
    id: item.id,
    url: item.url,
    full_url: item.fullUrl,
    title: item.title || 'Untitled',
    section: item.section || 'Other',
    language: 'en',
    is_enabled: item.enabled !== false,
    is_custom: item.isCustom || false,
    last_crawled_at: item.lastCrawled || null,
    last_status: item.lastStatus || 'never',
  }));

  // Insert in batches of 100
  for (let i = 0; i < urls.length; i += 100) {
    const batch = urls.slice(i, i + 100);
    const { error } = await supabase.from('dcq_crawler_urls').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Error at batch ${i}:`, error.message);
    } else {
      console.log(`Imported URLs ${i + 1} to ${Math.min(i + 100, urls.length)}`);
    }
  }
  console.log(`Total URLs imported: ${urls.length}`);
}

async function importDocuments() {
  console.log('\nImporting documents...');
  const data = JSON.parse(readFileSync(join(dataDir, 'documents.json'), 'utf-8'));

  const docs = data.map(item => ({
    id: item.id,
    filename: item.filename,
    original_name: item.originalName,
    file_type: item.type,
    file_size: item.size,
    chunk_count: item.chunks,
    uploaded_at: item.uploadedAt,
    language: 'en',
    is_processed: true,
  }));

  const { error } = await supabase.from('dcq_documents').upsert(docs, { onConflict: 'id' });
  if (error) {
    console.error('Error importing documents:', error.message);
  } else {
    console.log(`Documents imported: ${docs.length}`);
  }
}

async function importDemoFaqs() {
  console.log('\nImporting demo FAQs...');
  const data = JSON.parse(readFileSync(join(dataDir, 'demo-faq.json'), 'utf-8'));

  const faqs = data.map(item => ({
    id: item.id,
    question: item.title,
    answer: item.content,
    category: item.section?.replace(/-/g, ' ') || 'General',
    priority: item.priority >= 100 ? 'high' : item.priority >= 50 ? 'medium' : 'low',
    status: 'active',
    url: item.url || null,
    views: 0,
    helpful: 0,
    not_helpful: 0,
  }));

  for (const faq of faqs) {
    const { error } = await supabase.from('dcq_faqs').upsert(faq, { onConflict: 'id' });
    if (error) {
      console.error(`Error importing FAQ ${faq.id}:`, error.message);
    }
  }
  console.log(`FAQs imported: ${faqs.length}`);
}

async function main() {
  console.log('Starting data import...\n');

  await importCrawlerUrls();
  await importDocuments();
  await importDemoFaqs();

  console.log('\nImport complete!');
}

main().catch(console.error);
