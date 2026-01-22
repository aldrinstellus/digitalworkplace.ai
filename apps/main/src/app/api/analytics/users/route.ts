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
    const { data: currentUser } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('clerk_id', clerkId)
      .single();

    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = searchParams.get('end') || new Date().toISOString();
    const limit = parseInt(searchParams.get('limit') || '50');

    // Use aggregated queries instead of N+1
    // Get all users with their session and page view stats in parallel
    const [usersResult, sessionsResult, pageViewsResult] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('id, email, full_name, role, created_at'),
      supabaseAdmin
        .from('user_sessions')
        .select('user_id, duration_seconds, last_heartbeat_at, is_active')
        .gte('started_at', start)
        .lte('started_at', end),
      supabaseAdmin
        .from('page_views')
        .select('user_id, project_code, time_on_page_seconds')
        .gte('entered_at', start)
        .lte('entered_at', end),
    ]);

    const users = usersResult.data || [];
    const sessions = sessionsResult.data || [];
    const pageViews = pageViewsResult.data || [];

    // Build lookup maps for O(1) access
    const sessionsByUser = new Map<string, typeof sessions>();
    sessions.forEach(s => {
      const list = sessionsByUser.get(s.user_id) || [];
      list.push(s);
      sessionsByUser.set(s.user_id, list);
    });

    const pageViewsByUser = new Map<string, typeof pageViews>();
    pageViews.forEach(pv => {
      const list = pageViewsByUser.get(pv.user_id) || [];
      list.push(pv);
      pageViewsByUser.set(pv.user_id, list);
    });

    // Build metrics for each user
    const metrics = users.map(user => {
      const userSessions = sessionsByUser.get(user.id) || [];
      const userPageViews = pageViewsByUser.get(user.id) || [];

      // Calculate favorite app
      const appCounts: Record<string, number> = {};
      userPageViews.forEach(pv => {
        appCounts[pv.project_code] = (appCounts[pv.project_code] || 0) + 1;
      });
      const favoriteApp = Object.entries(appCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

      // Find last active time
      const lastActive = userSessions.reduce((latest, s) => {
        const time = new Date(s.last_heartbeat_at).getTime();
        return time > latest ? time : latest;
      }, 0);

      // Check if currently active
      const isActive = userSessions.some(s => s.is_active);

      return {
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name || 'Unknown',
        role: user.role,
        total_sessions: userSessions.length,
        total_time_seconds: userSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0),
        total_page_views: userPageViews.length,
        last_active: lastActive ? new Date(lastActive).toISOString() : user.created_at,
        favorite_app: favoriteApp,
        is_active: isActive,
        joined_at: user.created_at,
      };
    });

    // Sort by total time (most active first) and limit
    const sortedMetrics = metrics
      .sort((a, b) => b.total_time_seconds - a.total_time_seconds)
      .slice(0, limit);

    // Also return total count for pagination
    return NextResponse.json({
      data: sortedMetrics,
      total: users.length,
    });
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
