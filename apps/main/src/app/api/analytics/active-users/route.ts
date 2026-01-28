import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export interface ActiveUserDetail {
  user_id: string;
  user_email: string;
  user_name: string;
  avatar_url: string | null;
  role: string;
  // Session timestamps
  session_id: string;
  session_started_at: string;
  last_heartbeat_at: string;
  session_duration_seconds: number;
  // Device info
  device_type: string;
  browser: string;
  os: string;
  ip_address: string | null;
  // Activity
  current_app: string | null;
  current_page: string | null;
  total_page_views_session: number;
  // Status
  is_active: boolean;
  idle_seconds: number;
  status: 'online' | 'idle' | 'away';
}

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
    const timeWindow = searchParams.get('window') || '24h'; // 24h, 7d, 30d, all

    // Calculate time filter based on window
    const now = new Date();
    let timeFilter: Date;
    switch (timeWindow) {
      case '1h':
        timeFilter = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get all active sessions with user details
    const { data: activeSessions, error: sessionsError } = await supabaseAdmin
      .from('user_sessions')
      .select(`
        id,
        user_id,
        started_at,
        last_heartbeat_at,
        duration_seconds,
        device_type,
        browser,
        os,
        ip_address,
        is_active,
        users!inner(id, email, full_name, avatar_url, role)
      `)
      .gte('last_heartbeat_at', timeFilter.toISOString())
      .order('last_heartbeat_at', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // Get page views for each session to determine current activity
    const sessionIds = activeSessions?.map(s => s.id) || [];
    const { data: pageViews } = await supabaseAdmin
      .from('page_views')
      .select('session_id, project_code, page_path, entered_at')
      .in('session_id', sessionIds)
      .order('entered_at', { ascending: false });

    // Build lookup for latest page view per session
    const latestPageBySession = new Map<string, { project_code: string; page_path: string }>();
    const pageCountBySession = new Map<string, number>();

    pageViews?.forEach(pv => {
      // Track count
      pageCountBySession.set(pv.session_id, (pageCountBySession.get(pv.session_id) || 0) + 1);
      // Track latest (first one we encounter since sorted desc)
      if (!latestPageBySession.has(pv.session_id)) {
        latestPageBySession.set(pv.session_id, {
          project_code: pv.project_code,
          page_path: pv.page_path,
        });
      }
    });

    // Build detailed user list (dedupe by user, keep most recent session)
    const userMap = new Map<string, ActiveUserDetail>();

    activeSessions?.forEach((session: any) => {
      const user = session.users;
      const existingUser = userMap.get(user.id);

      // Calculate idle time
      const lastHeartbeat = new Date(session.last_heartbeat_at).getTime();
      const idleSeconds = Math.floor((now.getTime() - lastHeartbeat) / 1000);

      // Determine status based on idle time
      let status: 'online' | 'idle' | 'away';
      if (session.is_active && idleSeconds < 300) {
        status = 'online'; // Active in last 5 minutes
      } else if (idleSeconds < 900) {
        status = 'idle'; // Active in last 15 minutes
      } else {
        status = 'away'; // More than 15 minutes idle
      }

      // Get current page info
      const latestPage = latestPageBySession.get(session.id);

      const userDetail: ActiveUserDetail = {
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name || 'Unknown',
        avatar_url: user.avatar_url,
        role: user.role || 'user',
        session_id: session.id,
        session_started_at: session.started_at,
        last_heartbeat_at: session.last_heartbeat_at,
        session_duration_seconds: session.duration_seconds || 0,
        device_type: session.device_type || 'unknown',
        browser: session.browser || 'unknown',
        os: session.os || 'unknown',
        ip_address: session.ip_address,
        current_app: latestPage?.project_code || null,
        current_page: latestPage?.page_path || null,
        total_page_views_session: pageCountBySession.get(session.id) || 0,
        is_active: session.is_active,
        idle_seconds: idleSeconds,
        status,
      };

      // Keep most recent session per user
      if (!existingUser || new Date(session.last_heartbeat_at) > new Date(existingUser.last_heartbeat_at)) {
        userMap.set(user.id, userDetail);
      }
    });

    // Convert to array and sort by status then last activity
    const activeUsers = Array.from(userMap.values()).sort((a, b) => {
      // Sort: online first, then idle, then away
      const statusOrder = { online: 0, idle: 1, away: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      // Then by most recent activity
      return new Date(b.last_heartbeat_at).getTime() - new Date(a.last_heartbeat_at).getTime();
    });

    // Calculate summary stats
    const summary = {
      total_active: activeUsers.length,
      online_now: activeUsers.filter(u => u.status === 'online').length,
      idle: activeUsers.filter(u => u.status === 'idle').length,
      away: activeUsers.filter(u => u.status === 'away').length,
      by_device: {
        desktop: activeUsers.filter(u => u.device_type === 'desktop').length,
        mobile: activeUsers.filter(u => u.device_type === 'mobile').length,
        tablet: activeUsers.filter(u => u.device_type === 'tablet').length,
      },
      by_app: {} as Record<string, number>,
    };

    // Count users by app
    activeUsers.forEach(u => {
      if (u.current_app) {
        summary.by_app[u.current_app] = (summary.by_app[u.current_app] || 0) + 1;
      }
    });

    return NextResponse.json({
      data: activeUsers,
      summary,
      timestamp: now.toISOString(),
      window: timeWindow,
    });
  } catch (error) {
    console.error('Error fetching active users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
