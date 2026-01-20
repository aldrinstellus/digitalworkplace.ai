import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // Fetch news posts from diq schema
    const { data: newsPosts, error: newsError } = await supabase
      .schema('diq')
      .from('news_posts')
      .select('*')
      .eq('visibility', 'all')
      .order('published_at', { ascending: false })
      .limit(10);

    if (newsError) {
      console.error('News posts fetch error:', newsError);
    }

    // Fetch events from diq schema
    const { data: events, error: eventsError } = await supabase
      .schema('diq')
      .from('events')
      .select('*')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(10);

    if (eventsError) {
      console.error('Events fetch error:', eventsError);
    }

    // Get unique author/organizer IDs
    const authorIds = [...new Set(newsPosts?.map(p => p.author_id).filter(Boolean))];
    const organizerIds = [...new Set(events?.map(e => e.organizer_id).filter(Boolean))];
    const allUserIds = [...new Set([...authorIds, ...organizerIds])];

    // Fetch users from public schema
    let users: Record<string, { id: string; full_name: string; avatar_url: string | null }> = {};
    if (allUserIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('id', allUserIds);

      if (usersData) {
        users = usersData.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as typeof users);
      }
    }

    // Enrich news posts with author data
    const enrichedNewsPosts = newsPosts?.map(post => ({
      ...post,
      author: post.author_id ? users[post.author_id] || null : null,
    })) || [];

    // Enrich events with organizer data
    const enrichedEvents = events?.map(event => ({
      ...event,
      organizer: event.organizer_id ? users[event.organizer_id] || null : null,
    })) || [];

    // Get some stats
    const { count: articleCount } = await supabase
      .schema('diq')
      .from('articles')
      .select('*', { count: 'exact', head: true });

    const { count: employeeCount } = await supabase
      .schema('diq')
      .from('employees')
      .select('*', { count: 'exact', head: true });

    const { count: workflowCount } = await supabase
      .schema('diq')
      .from('workflows')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    return NextResponse.json({
      news_posts: enrichedNewsPosts,
      events: enrichedEvents,
      stats: {
        articles: articleCount || 0,
        employees: employeeCount || 0,
        active_workflows: workflowCount || 0,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
