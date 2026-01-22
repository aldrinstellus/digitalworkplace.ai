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

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = searchParams.get('end') || new Date().toISOString();

    // Fetch app usage breakdown
    const { data: pageViews } = await supabaseAdmin
      .from('page_views')
      .select('project_code, user_id, time_on_page_seconds')
      .gte('entered_at', start)
      .lte('entered_at', end);

    // Aggregate app usage
    const appStats: Record<string, { views: number; users: Set<string>; time: number }> = {};
    (pageViews || []).forEach(view => {
      if (!appStats[view.project_code]) {
        appStats[view.project_code] = { views: 0, users: new Set(), time: 0 };
      }
      appStats[view.project_code].views++;
      appStats[view.project_code].users.add(view.user_id);
      appStats[view.project_code].time += view.time_on_page_seconds || 0;
    });

    const totalViews = Object.values(appStats).reduce((sum, s) => sum + s.views, 0);
    const appUsage = Object.entries(appStats)
      .map(([code, stats]) => ({
        project_code: code,
        total_views: stats.views,
        unique_users: stats.users.size,
        total_time_seconds: stats.time,
        percentage: totalViews > 0 ? Math.round((stats.views / totalViews) * 100) : 0,
      }))
      .sort((a, b) => b.total_views - a.total_views);

    // Fetch cross-app navigation flows
    const { data: navigations } = await supabaseAdmin
      .from('cross_app_navigation')
      .select('from_project_code, to_project_code, time_in_source_seconds')
      .gte('navigated_at', start)
      .lte('navigated_at', end);

    // Aggregate flows
    const flows: Record<string, { count: number; totalTime: number }> = {};
    (navigations || []).forEach(nav => {
      const key = `${nav.from_project_code}->${nav.to_project_code}`;
      if (!flows[key]) {
        flows[key] = { count: 0, totalTime: 0 };
      }
      flows[key].count++;
      flows[key].totalTime += nav.time_in_source_seconds || 0;
    });

    const crossAppFlow = Object.entries(flows)
      .map(([key, stats]) => {
        const [from, to] = key.split('->');
        return {
          from_project_code: from,
          to_project_code: to,
          navigation_count: stats.count,
          avg_time_before_nav: stats.count > 0 ? Math.round(stats.totalTime / stats.count) : 0,
        };
      })
      .sort((a, b) => b.navigation_count - a.navigation_count);

    // Fetch recent activity timeline
    const activities: any[] = [];

    // Get recent sessions
    const { data: sessions } = await supabaseAdmin
      .from('user_sessions')
      .select(`
        id,
        started_at,
        ended_at,
        users!inner(email, full_name)
      `)
      .gte('started_at', start)
      .order('started_at', { ascending: false })
      .limit(20);

    sessions?.forEach((session: any) => {
      activities.push({
        id: `session-start-${session.id}`,
        type: 'session_start',
        user_email: session.users?.email || 'Unknown',
        user_name: session.users?.full_name || 'Unknown',
        description: 'Started a new session',
        timestamp: session.started_at,
      });

      if (session.ended_at) {
        activities.push({
          id: `session-end-${session.id}`,
          type: 'session_end',
          user_email: session.users?.email || 'Unknown',
          user_name: session.users?.full_name || 'Unknown',
          description: 'Ended session',
          timestamp: session.ended_at,
        });
      }
    });

    // Get recent page views
    const { data: recentPageViews } = await supabaseAdmin
      .from('page_views')
      .select(`
        id,
        project_code,
        page_path,
        entered_at,
        users!inner(email, full_name)
      `)
      .gte('entered_at', start)
      .order('entered_at', { ascending: false })
      .limit(20);

    recentPageViews?.forEach((pv: any) => {
      activities.push({
        id: `pageview-${pv.id}`,
        type: 'page_view',
        user_email: pv.users?.email || 'Unknown',
        user_name: pv.users?.full_name || 'Unknown',
        description: `Viewed ${pv.page_path}`,
        timestamp: pv.entered_at,
        project_code: pv.project_code,
      });
    });

    // Get recent cross-app navigations
    const { data: recentNavigations } = await supabaseAdmin
      .from('cross_app_navigation')
      .select(`
        id,
        from_project_code,
        to_project_code,
        navigated_at,
        users!inner(email, full_name)
      `)
      .gte('navigated_at', start)
      .order('navigated_at', { ascending: false })
      .limit(15);

    recentNavigations?.forEach((nav: any) => {
      activities.push({
        id: `nav-${nav.id}`,
        type: 'cross_app_nav',
        user_email: nav.users?.email || 'Unknown',
        user_name: nav.users?.full_name || 'Unknown',
        description: `Navigated from ${nav.from_project_code} to ${nav.to_project_code}`,
        timestamp: nav.navigated_at,
        project_code: nav.to_project_code,
      });
    });

    // Sort activities by timestamp
    const activityTimeline = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    return NextResponse.json({
      appUsage,
      crossAppFlow,
      activityTimeline,
    });
  } catch (error) {
    console.error('Error fetching navigation data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
