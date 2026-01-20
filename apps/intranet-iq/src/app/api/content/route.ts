/**
 * Content API Route
 * Fetches articles with author and category data
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // Fetch articles with joined author and category data via RPC
    const { data: articlesRaw, error: artError } = await supabase.rpc('get_articles_with_details');

    if (artError) {
      console.error('Error fetching articles:', artError);
      return NextResponse.json({ error: artError.message }, { status: 500 });
    }

    // Fetch categories via RPC
    const { data: categories, error: catError } = await supabase.rpc('get_kb_categories_list');

    if (catError) {
      console.error('Error fetching categories:', catError);
      return NextResponse.json({ error: catError.message }, { status: 500 });
    }

    // Transform articles to match expected format
    const articles = (articlesRaw || []).map((a: any) => ({
      id: a.id,
      category_id: a.category_id,
      title: a.title,
      slug: a.slug,
      content: a.content,
      summary: a.summary,
      author_id: a.author_id,
      status: a.status,
      published_at: a.published_at,
      tags: a.tags,
      metadata: a.metadata,
      view_count: a.view_count,
      helpful_count: a.helpful_count,
      created_at: a.created_at,
      updated_at: a.updated_at,
      author: {
        id: a.author_id,
        full_name: a.author_full_name,
        email: a.author_email,
        avatar_url: a.author_avatar_url,
      },
      category: a.category_id ? {
        id: a.category_id,
        name: a.category_name,
        slug: a.category_slug,
      } : null,
    }));

    return NextResponse.json({
      articles,
      categories: categories || [],
    });
  } catch (error) {
    console.error('Error in content API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
