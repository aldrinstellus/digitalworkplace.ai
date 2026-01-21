/**
 * Content API Route - OPTIMIZED v2
 * - Parallel queries with Promise.all()
 * - Deferred auth check (only when needed)
 * - Batch author fetch
 * - Query-level filtering
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
    // Default limit to 50 for performance - use limit=-1 to fetch all
    const rawLimit = searchParams.get('limit');
    const limit = rawLimit === '-1' ? 0 : parseInt(rawLimit || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const departmentId = searchParams.get('departmentId');

    // For non-published content, we need auth - start it early
    const needsAuth = status && status !== 'published';
    const authPromise = needsAuth
      ? auth().catch(() => ({ userId: null as string | null }))
      : Promise.resolve({ userId: null as string | null });

    // Check if full content is needed (for single article view)
    const includeContent = searchParams.get('includeContent') === 'true';

    // Build articles query - select only needed fields for performance
    // Full content is large - only include when explicitly requested
    const selectFields = includeContent
      ? '*'
      : 'id, category_id, title, slug, summary, author_id, status, tags, view_count, helpful_count, published_at, created_at, updated_at';

    let articlesQuery = supabase
      .schema('diq')
      .from('articles')
      .select(selectFields)
      .order('updated_at', { ascending: false });

    // Apply status filter
    if (status) {
      articlesQuery = articlesQuery.eq('status', status);
    } else {
      // Default: published only for public access
      articlesQuery = articlesQuery.eq('status', 'published');
    }

    // Apply category filter at query level
    if (categoryId) {
      articlesQuery = articlesQuery.eq('category_id', categoryId);
    }

    // Apply pagination
    if (limit > 0) {
      articlesQuery = articlesQuery.range(offset, offset + limit - 1);
    }

    // Build categories query
    let categoriesQuery = supabase
      .schema('diq')
      .from('kb_categories')
      .select('*')
      .order('name', { ascending: true });

    if (departmentId) {
      categoriesQuery = categoriesQuery.eq('department_id', departmentId);
    }

    // Execute articles + categories in parallel (auth runs in background if needed)
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

    // Collect author IDs for batch fetch
    const authorIds = [...new Set(articles.map((a: any) => a.author_id).filter(Boolean))];

    // Fetch authors (only if we have IDs)
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

    // Create categories lookup
    const categoriesMap = new Map<string, any>();
    for (const cat of categories) {
      categoriesMap.set(cat.id, cat);
    }

    // Join data
    let transformedArticles = articles.map((a: any) => ({
      ...a,
      author: authorsMap.get(a.author_id) || {
        id: a.author_id,
        full_name: 'Unknown',
        email: '',
        avatar_url: null,
      },
      category: categoriesMap.get(a.category_id) || null,
    }));

    // Get user context only if we need RBAC filtering
    let userContext = null;
    if (needsAuth) {
      const { userId } = await authPromise;
      if (userId) {
        userContext = await getUserContext(userId);
        // Verify admin for non-published content
        if (!userContext?.isAdmin && status !== 'published') {
          // Non-admin trying to access non-published - filter to empty
          transformedArticles = [];
        }
      } else if (status !== 'published') {
        // No auth but requesting non-published - return empty
        transformedArticles = [];
      }
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

    // Cache headers - longer for public content
    const cacheDuration = needsAuth ? 10 : CACHE_DURATION;
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${cacheDuration}, stale-while-revalidate=${cacheDuration * 2}`
    );

    return response;
  } catch (error) {
    console.error('Error in content API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
