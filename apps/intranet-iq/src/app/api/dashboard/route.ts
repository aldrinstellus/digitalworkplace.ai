/**
 * Dashboard API Route - OPTIMIZED
 * Uses Promise.all() for parallel fetching
 * Manual joins for cross-schema relationships
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cache duration in seconds (for edge caching)
const CACHE_DURATION = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const newsLimit = parseInt(searchParams.get('newsLimit') || '10');
    const eventsLimit = parseInt(searchParams.get('eventsLimit') || '10');

    // Execute ALL queries in parallel using Promise.all()
    const [
      newsResult,
      eventsResult,
      articleCountResult,
      employeeCountResult,
      workflowCountResult,
    ] = await Promise.all([
      // Query 1: News posts (no FK join - will join manually)
      supabase
        .schema('diq')
        .from('news_posts')
        .select('*')
        .eq('visibility', 'all')
        .order('published_at', { ascending: false })
        .limit(newsLimit),

      // Query 2: Upcoming events (no FK join - will join manually)
      supabase
        .schema('diq')
        .from('events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(eventsLimit),

      // Query 3: Article count
      supabase
        .schema('diq')
        .from('articles')
        .select('*', { count: 'exact', head: true }),

      // Query 4: Employee count
      supabase
        .schema('diq')
        .from('employees')
        .select('*', { count: 'exact', head: true }),

      // Query 5: Active workflow count
      supabase
        .schema('diq')
        .from('workflows')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
    ]);

    // Log any errors but don't fail the entire request
    if (newsResult.error) console.error('News fetch error:', newsResult.error);
    if (eventsResult.error) console.error('Events fetch error:', eventsResult.error);

    const newsPosts = newsResult.data || [];
    const events = eventsResult.data || [];

    // Collect all user IDs for batch lookup
    const authorIds = newsPosts.map((p: any) => p.author_id).filter(Boolean);
    const organizerIds = events.map((e: any) => e.organizer_id).filter(Boolean);
    const allUserIds = [...new Set([...authorIds, ...organizerIds])];

    // Fetch users from public schema if we have IDs
    let usersMap = new Map<string, any>();
    if (allUserIds.length > 0) {
      const usersResult = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('id', allUserIds);

      if (!usersResult.error && usersResult.data) {
        for (const user of usersResult.data) {
          usersMap.set(user.id, user);
        }
      }
    }

    // Transform news posts with author data
    const enrichedNewsPosts = newsPosts.map((post: any) => ({
      ...post,
      author: usersMap.get(post.author_id) || null,
    }));

    // Transform events with organizer data
    const enrichedEvents = events.map((event: any) => ({
      ...event,
      organizer: usersMap.get(event.organizer_id) || null,
    }));

    const response = NextResponse.json({
      news_posts: enrichedNewsPosts,
      events: enrichedEvents,
      stats: {
        articles: articleCountResult.count || 0,
        employees: employeeCountResult.count || 0,
        active_workflows: workflowCountResult.count || 0,
      },
    });

    // Add cache headers for edge caching
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`
    );

    return response;
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
