/**
 * Analytics Query Functions for Digital Workplace AI
 * Server-side functions for fetching analytics data
 */

import { supabase } from './supabase';

// Types
export interface AnalyticsOverview {
  totalUsers: number;
  active24h: number;
  active7d: number;
  active30d: number;
  totalSessions: number;
  avgSessionDuration: number;
  totalPageViews: number;
}

export interface SessionRecord {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  device_type: string;
  browser: string;
  os: string;
  is_active: boolean;
}

export interface UserMetrics {
  user_id: string;
  user_email: string;
  user_name: string;
  total_sessions: number;
  total_time_seconds: number;
  total_page_views: number;
  last_active: string;
  favorite_app: string;
}

export interface AppUsageData {
  project_code: string;
  total_views: number;
  unique_users: number;
  total_time_seconds: number;
  percentage: number;
}

export interface CrossAppFlow {
  from_project_code: string;
  to_project_code: string;
  navigation_count: number;
  avg_time_before_nav: number;
}

export interface ActivityTimelineItem {
  id: string;
  type: 'session_start' | 'session_end' | 'page_view' | 'cross_app_nav';
  user_email: string;
  user_name: string;
  description: string;
  timestamp: string;
  project_code?: string;
}

export interface DateRange {
  start: string;
  end: string;
}

// Default date range (last 30 days)
export function getDefaultDateRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

// Fetch analytics overview
export async function getAnalyticsOverview(dateRange?: DateRange): Promise<AnalyticsOverview | null> {
  try {
    const range = dateRange || getDefaultDateRange();

    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get active users in different time windows
    const now = new Date();
    const day1 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: sessions24h } = await supabase
      .from('user_sessions')
      .select('user_id')
      .gte('last_heartbeat_at', day1);

    const { data: sessions7d } = await supabase
      .from('user_sessions')
      .select('user_id')
      .gte('last_heartbeat_at', day7);

    const { data: sessions30d } = await supabase
      .from('user_sessions')
      .select('user_id')
      .gte('last_heartbeat_at', day30);

    const active24h = new Set(sessions24h?.map(s => s.user_id) || []).size;
    const active7d = new Set(sessions7d?.map(s => s.user_id) || []).size;
    const active30d = new Set(sessions30d?.map(s => s.user_id) || []).size;

    // Get session stats
    const { data: sessionStats } = await supabase
      .from('user_sessions')
      .select('id, duration_seconds')
      .gte('started_at', range.start)
      .lte('started_at', range.end);

    const totalSessions = sessionStats?.length || 0;
    const avgSessionDuration = totalSessions > 0
      ? Math.round((sessionStats?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0) / totalSessions)
      : 0;

    // Get page view count
    const { count: totalPageViews } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('entered_at', range.start)
      .lte('entered_at', range.end);

    return {
      totalUsers: totalUsers || 0,
      active24h,
      active7d,
      active30d,
      totalSessions,
      avgSessionDuration,
      totalPageViews: totalPageViews || 0,
    };
  } catch (err) {
    console.error('Error fetching analytics overview:', err);
    return null;
  }
}

// Fetch session history with user details
export async function getSessionHistory(
  limit: number = 50,
  offset: number = 0,
  dateRange?: DateRange
): Promise<SessionRecord[]> {
  try {
    const range = dateRange || getDefaultDateRange();

    const { data, error } = await supabase
      .from('user_sessions')
      .select(`
        id,
        user_id,
        started_at,
        ended_at,
        duration_seconds,
        device_type,
        browser,
        os,
        is_active,
        users!inner(email, full_name)
      `)
      .gte('started_at', range.start)
      .lte('started_at', range.end)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching session history:', error);
      return [];
    }

    return (data || []).map((session: { id: string; user_id: string; started_at: string; ended_at: string | null; duration_seconds: number | null; device_type: string | null; browser: string | null; os: string | null; is_active: boolean | null; users?: { email?: string; full_name?: string } }) => ({
      id: session.id,
      user_id: session.user_id,
      user_email: session.users?.email || 'Unknown',
      user_name: session.users?.full_name || 'Unknown',
      started_at: session.started_at,
      ended_at: session.ended_at,
      duration_seconds: session.duration_seconds || 0,
      device_type: session.device_type || 'unknown',
      browser: session.browser || 'unknown',
      os: session.os || 'unknown',
      is_active: session.is_active || false,
    }));
  } catch (err) {
    console.error('Error fetching session history:', err);
    return [];
  }
}

// Fetch per-user metrics
export async function getUserMetrics(
  limit: number = 20,
  dateRange?: DateRange
): Promise<UserMetrics[]> {
  try {
    const range = dateRange || getDefaultDateRange();

    // Get all users with their session and page view data
    const { data: users } = await supabase
      .from('users')
      .select('id, email, full_name');

    if (!users) return [];

    const metrics: UserMetrics[] = [];

    for (const user of users) {
      // Get session stats
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('id, duration_seconds, last_heartbeat_at')
        .eq('user_id', user.id)
        .gte('started_at', range.start);

      // Get page view stats
      const { data: pageViews } = await supabase
        .from('page_views')
        .select('id, project_code, time_on_page_seconds')
        .eq('user_id', user.id)
        .gte('entered_at', range.start);

      if (!sessions?.length && !pageViews?.length) continue;

      // Calculate favorite app
      const appCounts: Record<string, number> = {};
      pageViews?.forEach(pv => {
        appCounts[pv.project_code] = (appCounts[pv.project_code] || 0) + 1;
      });
      const favoriteApp = Object.entries(appCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

      // Find last active time
      const lastActive = sessions?.reduce((latest, s) => {
        const time = new Date(s.last_heartbeat_at).getTime();
        return time > latest ? time : latest;
      }, 0);

      metrics.push({
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name || 'Unknown',
        total_sessions: sessions?.length || 0,
        total_time_seconds: sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0,
        total_page_views: pageViews?.length || 0,
        last_active: lastActive ? new Date(lastActive).toISOString() : 'Never',
        favorite_app: favoriteApp,
      });
    }

    // Sort by total time and limit
    return metrics
      .sort((a, b) => b.total_time_seconds - a.total_time_seconds)
      .slice(0, limit);
  } catch (err) {
    console.error('Error fetching user metrics:', err);
    return [];
  }
}

// Fetch app usage breakdown
export async function getAppUsageBreakdown(dateRange?: DateRange): Promise<AppUsageData[]> {
  try {
    const range = dateRange || getDefaultDateRange();

    const { data, error } = await supabase
      .from('page_views')
      .select('project_code, user_id, time_on_page_seconds')
      .gte('entered_at', range.start)
      .lte('entered_at', range.end);

    if (error) {
      console.error('Error fetching app usage:', error);
      return [];
    }

    // Aggregate by project code
    const appStats: Record<string, { views: number; users: Set<string>; time: number }> = {};

    (data || []).forEach(view => {
      if (!appStats[view.project_code]) {
        appStats[view.project_code] = { views: 0, users: new Set(), time: 0 };
      }
      appStats[view.project_code].views++;
      appStats[view.project_code].users.add(view.user_id);
      appStats[view.project_code].time += view.time_on_page_seconds || 0;
    });

    const totalViews = Object.values(appStats).reduce((sum, s) => sum + s.views, 0);

    return Object.entries(appStats)
      .map(([code, stats]) => ({
        project_code: code,
        total_views: stats.views,
        unique_users: stats.users.size,
        total_time_seconds: stats.time,
        percentage: totalViews > 0 ? Math.round((stats.views / totalViews) * 100) : 0,
      }))
      .sort((a, b) => b.total_views - a.total_views);
  } catch (err) {
    console.error('Error fetching app usage breakdown:', err);
    return [];
  }
}

// Fetch cross-app navigation flow data
export async function getCrossAppNavigationFlow(dateRange?: DateRange): Promise<CrossAppFlow[]> {
  try {
    const range = dateRange || getDefaultDateRange();

    const { data, error } = await supabase
      .from('cross_app_navigation')
      .select('from_project_code, to_project_code, time_in_source_seconds')
      .gte('navigated_at', range.start)
      .lte('navigated_at', range.end);

    if (error) {
      console.error('Error fetching cross-app navigation:', error);
      return [];
    }

    // Aggregate flows
    const flows: Record<string, { count: number; totalTime: number }> = {};

    (data || []).forEach(nav => {
      const key = `${nav.from_project_code}->${nav.to_project_code}`;
      if (!flows[key]) {
        flows[key] = { count: 0, totalTime: 0 };
      }
      flows[key].count++;
      flows[key].totalTime += nav.time_in_source_seconds || 0;
    });

    return Object.entries(flows)
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
  } catch (err) {
    console.error('Error fetching cross-app navigation flow:', err);
    return [];
  }
}

// Fetch recent activity timeline
export async function getActivityTimeline(
  limit: number = 50,
  dateRange?: DateRange
): Promise<ActivityTimelineItem[]> {
  try {
    const range = dateRange || getDefaultDateRange();
    const activities: ActivityTimelineItem[] = [];

    // Get recent sessions
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select(`
        id,
        started_at,
        ended_at,
        users!inner(email, full_name)
      `)
      .gte('started_at', range.start)
      .order('started_at', { ascending: false })
      .limit(Math.floor(limit / 3));

    sessions?.forEach((session: { id: string; started_at: string; ended_at: string | null; users?: { email?: string; full_name?: string } }) => {
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
    const { data: pageViews } = await supabase
      .from('page_views')
      .select(`
        id,
        project_code,
        page_path,
        entered_at,
        users!inner(email, full_name)
      `)
      .gte('entered_at', range.start)
      .order('entered_at', { ascending: false })
      .limit(Math.floor(limit / 3));

    pageViews?.forEach((pv: { id: string; project_code: string; page_path: string; entered_at: string; users?: { email?: string; full_name?: string } }) => {
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
    const { data: navigations } = await supabase
      .from('cross_app_navigation')
      .select(`
        id,
        from_project_code,
        to_project_code,
        navigated_at,
        users!inner(email, full_name)
      `)
      .gte('navigated_at', range.start)
      .order('navigated_at', { ascending: false })
      .limit(Math.floor(limit / 3));

    navigations?.forEach((nav: { id: string; from_project_code: string; to_project_code: string; navigated_at: string; users?: { email?: string; full_name?: string } }) => {
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

    // Sort all activities by timestamp and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch (err) {
    console.error('Error fetching activity timeline:', err);
    return [];
  }
}

// Export data to CSV format
export function exportToCSV(data: Record<string, unknown>[]): string {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(header => {
      const val = row[header];
      // Escape quotes and wrap in quotes if contains comma
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

// Format duration in human-readable format
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

// Get project display name
export function getProjectDisplayName(code: string): string {
  const names: Record<string, string> = {
    main: 'Main Dashboard',
    dIQ: 'Intranet IQ',
    dSQ: 'Support IQ',
    dCQ: 'Chat Core IQ',
    dTQ: 'Test Pilot IQ',
  };
  return names[code] || code;
}

// Get project color
export function getProjectColor(code: string): string {
  const colors: Record<string, string> = {
    main: '#4ade80',
    dIQ: '#3b82f6',
    dSQ: '#10b981',
    dCQ: '#a855f7',
    dTQ: '#f59e0b',
  };
  return colors[code] || '#6b7280';
}
