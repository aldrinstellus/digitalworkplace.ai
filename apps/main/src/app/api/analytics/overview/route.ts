import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super_admin
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('clerk_id', clerkId)
      .single();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
    }

    // Parse date range from query params
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = searchParams.get('end') || new Date().toISOString();

    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get active users in different time windows
    const now = new Date();
    const day1 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: sessions24h } = await supabaseAdmin
      .from('user_sessions')
      .select('user_id')
      .gte('last_heartbeat_at', day1);

    const { data: sessions7d } = await supabaseAdmin
      .from('user_sessions')
      .select('user_id')
      .gte('last_heartbeat_at', day7);

    const { data: sessions30d } = await supabaseAdmin
      .from('user_sessions')
      .select('user_id')
      .gte('last_heartbeat_at', day30);

    const active24h = new Set(sessions24h?.map(s => s.user_id) || []).size;
    const active7d = new Set(sessions7d?.map(s => s.user_id) || []).size;
    const active30d = new Set(sessions30d?.map(s => s.user_id) || []).size;

    // Get session stats
    const { data: sessionStats } = await supabaseAdmin
      .from('user_sessions')
      .select('id, duration_seconds')
      .gte('started_at', start)
      .lte('started_at', end);

    const totalSessions = sessionStats?.length || 0;
    const avgSessionDuration = totalSessions > 0
      ? Math.round((sessionStats?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0) / totalSessions)
      : 0;

    // Get page view count
    const { count: totalPageViews } = await supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('entered_at', start)
      .lte('entered_at', end);

    return NextResponse.json({
      data: {
        totalUsers: totalUsers || 0,
        active24h,
        active7d,
        active30d,
        totalSessions,
        avgSessionDuration,
        totalPageViews: totalPageViews || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
