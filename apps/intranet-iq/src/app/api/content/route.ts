/**
 * Content API Route - OPTIMIZED
 * - Query-level filtering (category, status, limit)
 * - Parallel queries with Promise.all()
 * - Manual join for cross-schema author data
 * - Pagination support
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { getUserContext, filterContentByAccess, buildAccessFilter } from '@/lib/rbac';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cache duration in seconds
const CACHE_DURATION = 30;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters for filtering
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '0'); // 0 = no limit
    const offset = parseInt(searchParams.get('offset') || '0');
    const departmentId = searchParams.get('departmentId');

    // Get user context for role-based filtering
    let userContext = null;
    try {
      const { userId } = await auth();
      if (userId) {
        userContext = await getUserContext(userId);
      }
    } catch (authError) {
      console.warn('Auth check failed, applying public access:', authError);
    }

    const accessFilter = buildAccessFilter(userContext);

    // Build articles query with server-side filtering
    let articlesQuery = supabase
      .schema('diq')
      .from('articles')
      .select('*')
      .order('updated_at', { ascending: false });

    // Apply status filter - only published for non-admins
    if (!userContext?.isAdmin) {
      articlesQuery = articlesQuery.eq('status', 'published');
    } else if (status) {
      articlesQuery = articlesQuery.eq('status', status);
    }

    // Apply category filter at query level (not client-side!)
    if (categoryId) {
      articlesQuery = articlesQuery.eq('category_id', categoryId);
    }

    // Apply pagination
    if (limit > 0) {
      articlesQuery = articlesQuery.range(offset, offset + limit - 1);
    }

    // Build categories query (same schema - direct query works)
    let categoriesQuery = supabase
      .schema('diq')
      .from('kb_categories')
      .select('*')
      .order('name', { ascending: true });

    // Filter categories by department if specified
    if (departmentId) {
      categoriesQuery = categoriesQuery.eq('department_id', departmentId);
    } else if (accessFilter.departmentIds.length > 0 && !userContext?.isAdmin) {
      categoriesQuery = categoriesQuery.or(
        `department_id.is.null,department_id.in.(${accessFilter.departmentIds.join(',')})`
      );
    }

    // Execute both queries in parallel
    const [articlesResult, categoriesResult] = await Promise.all([
      articlesQuery,
      categoriesQuery,
    ]);

    if (articlesResult.error) {
      console.error('Error fetching articles:', articlesResult.error);
      return NextResponse.json({ error: articlesResult.error.message }, { status: 500 });
    }

    if (categoriesResult.error) {
      console.error('Error fetching categories:', categoriesResult.error);
      return NextResponse.json({ error: categoriesResult.error.message }, { status: 500 });
    }

    const articles = articlesResult.data || [];
    const categories = categoriesResult.data || [];

    // Get unique author IDs and category IDs
    const authorIds = [...new Set(articles.map((a: any) => a.author_id).filter(Boolean))];

    // Create categories lookup map
    const categoriesMap = new Map<string, any>();
    for (const cat of categories) {
      categoriesMap.set(cat.id, cat);
    }

    // Fetch authors from public schema
    let authorsMap = new Map<string, any>();
    if (authorIds.length > 0) {
      const authorsResult = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .in('id', authorIds);

      if (!authorsResult.error && authorsResult.data) {
        for (const author of authorsResult.data) {
          authorsMap.set(author.id, author);
        }
      }
    }

    // Join data
    let transformedArticles = articles.map((a: any) => {
      const author = authorsMap.get(a.author_id);
      const category = categoriesMap.get(a.category_id);

      return {
        ...a,
        author: author || {
          id: a.author_id,
          full_name: 'Unknown',
          email: '',
          avatar_url: null,
        },
        category: category || null,
      };
    });

    // Apply role-based content filtering if needed
    if (userContext && !userContext.isAdmin) {
      transformedArticles = filterContentByAccess(transformedArticles, userContext);
    }

    const response = NextResponse.json({
      articles: transformedArticles,
      categories,
      userRole: userContext?.role || 'guest',
      isAdmin: userContext?.isAdmin || false,
      pagination: {
        offset,
        limit: limit || transformedArticles.length,
        total: transformedArticles.length,
      },
    });

    // Add cache headers
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`
    );

    return response;
  } catch (error) {
    console.error('Error in content API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
