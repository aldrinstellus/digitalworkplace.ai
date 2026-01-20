/**
 * Content API Route
 * Fetches articles with author and category data using direct queries
 * Includes role-based access control filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { getUserContext, filterContentByAccess, buildAccessFilter } from '@/lib/rbac';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  try {
    // Get user context for role-based filtering
    let userContext = null;
    try {
      const { userId } = await auth();
      if (userId) {
        userContext = await getUserContext(userId);
      }
    } catch (authError) {
      // Continue without auth - will apply public access only
      console.warn('Auth check failed, applying public access:', authError);
    }

    // Build access filter based on user role
    const accessFilter = buildAccessFilter(userContext);

    // Fetch articles from diq schema
    let articlesQuery = supabase
      .schema('diq')
      .from('articles')
      .select('*')
      .order('updated_at', { ascending: false });

    // Apply status filter - only published for non-admins
    if (!userContext?.isAdmin) {
      articlesQuery = articlesQuery.eq('status', 'published');
    }

    const { data: articlesRaw, error: artError } = await articlesQuery;

    if (artError) {
      console.error('Error fetching articles:', artError);
      return NextResponse.json({ error: artError.message }, { status: 500 });
    }

    // Apply role-based content filtering
    const filteredArticles = filterContentByAccess(articlesRaw || [], userContext);

    // Fetch categories from diq schema
    let categoriesQuery = supabase
      .schema('diq')
      .from('kb_categories')
      .select('*')
      .order('name', { ascending: true });

    // Filter categories by visible departments if user has limited access
    if (accessFilter.departmentIds.length > 0 && !userContext?.isAdmin) {
      categoriesQuery = categoriesQuery.or(
        `department_id.is.null,department_id.in.(${accessFilter.departmentIds.join(',')})`
      );
    }

    const { data: categoriesRaw, error: catError } = await categoriesQuery;

    if (catError) {
      console.error('Error fetching categories:', catError);
      return NextResponse.json({ error: catError.message }, { status: 500 });
    }

    // Get unique author IDs to fetch user data
    const authorIds = [...new Set((filteredArticles || []).map((a: any) => a.author_id).filter(Boolean))];

    // Fetch authors from public schema
    let authors: any[] = [];
    if (authorIds.length > 0) {
      const { data: authorsData } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .in('id', authorIds);
      authors = authorsData || [];
    }

    // Create author lookup map
    const authorMap = new Map(authors.map((a: any) => [a.id, a]));

    // Create category lookup map
    const categoryMap = new Map((categoriesRaw || []).map((c: any) => [c.id, c]));

    // Transform articles with joined data
    const articles = (filteredArticles || []).map((a: any) => {
      const author = authorMap.get(a.author_id);
      const category = categoryMap.get(a.category_id);
      return {
        ...a,
        author: author ? {
          id: author.id,
          full_name: author.full_name,
          email: author.email,
          avatar_url: author.avatar_url,
        } : null,
        category: category ? {
          id: category.id,
          name: category.name,
          slug: category.slug,
        } : null,
      };
    });

    return NextResponse.json({
      articles,
      categories: categoriesRaw || [],
      userRole: userContext?.role || 'guest',
      isAdmin: userContext?.isAdmin || false,
    });
  } catch (error) {
    console.error('Error in content API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
