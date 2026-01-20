/**
 * Pending Articles API Route
 * Fetches articles that are pending review (for editors/managers)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { getUserContext, canPerformAction } from '@/lib/rbac';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user context for permission check
    const userContext = await getUserContext(userId);
    if (!userContext) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can approve content
    if (!canPerformAction(userContext, 'approve')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view pending articles' },
        { status: 403 }
      );
    }

    // Fetch pending articles with author info
    const { data: articles, error } = await supabase
      .schema('diq')
      .from('articles')
      .select('*')
      .eq('status', 'pending_review')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending articles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get author IDs and fetch user info
    const authorIds = [...new Set((articles || []).map((a) => a.author_id).filter(Boolean))];
    let authors: any[] = [];

    if (authorIds.length > 0) {
      const { data: authorsData } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .in('id', authorIds);
      authors = authorsData || [];
    }

    // Create author lookup
    const authorMap = new Map(authors.map((a) => [a.id, a]));

    // Attach author info to articles
    const articlesWithAuthors = (articles || []).map((article) => ({
      ...article,
      author: authorMap.get(article.author_id) || null,
    }));

    return NextResponse.json({
      articles: articlesWithAuthors,
      count: articlesWithAuthors.length,
    });
  } catch (error) {
    console.error('Error in pending articles API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
