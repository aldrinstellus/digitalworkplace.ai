"use client";

import { useState, useEffect, useCallback } from 'react';
import type {
  AnalyticsOverview,
  SessionRecord,
  UserMetrics,
  AppUsageData,
  CrossAppFlow,
  ActivityTimelineItem,
  DateRange,
} from '@/lib/analytics';

interface UseAnalyticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseAnalyticsReturn {
  // Data
  overview: AnalyticsOverview | null;
  sessions: SessionRecord[];
  userMetrics: UserMetrics[];
  appUsage: AppUsageData[];
  crossAppFlow: CrossAppFlow[];
  activityTimeline: ActivityTimelineItem[];

  // State
  loading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  setDateRange: (range: DateRange) => void;
  exportData: (type: 'sessions' | 'users' | 'overview') => void;
}

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const { autoRefresh = true, refreshInterval = 30000 } = options;

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetrics[]>([]);
  const [appUsage, setAppUsage] = useState<AppUsageData[]>([]);
  const [crossAppFlow, setCrossAppFlow] = useState<CrossAppFlow[]>([]);
  const [activityTimeline, setActivityTimeline] = useState<ActivityTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start: start.toISOString(), end: end.toISOString() };
  });

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const params = new URLSearchParams({
        start: dateRange.start,
        end: dateRange.end,
      });

      // Fetch all data in parallel
      const [
        overviewRes,
        sessionsRes,
        usersRes,
        navigationRes,
      ] = await Promise.all([
        fetch(`/api/analytics/overview?${params}`),
        fetch(`/api/analytics/sessions?${params}&limit=50`),
        fetch(`/api/analytics/users?${params}&limit=20`),
        fetch(`/api/analytics/navigation?${params}`),
      ]);

      if (!overviewRes.ok || !sessionsRes.ok || !usersRes.ok || !navigationRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [overviewData, sessionsData, usersData, navigationData] = await Promise.all([
        overviewRes.json(),
        sessionsRes.json(),
        usersRes.json(),
        navigationRes.json(),
      ]);

      setOverview(overviewData.data);
      setSessions(sessionsData.data || []);
      setUserMetrics(usersData.data || []);
      setAppUsage(navigationData.appUsage || []);
      setCrossAppFlow(navigationData.crossAppFlow || []);
      setActivityTimeline(navigationData.activityTimeline || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  // Export function
  const exportData = useCallback((type: 'sessions' | 'users' | 'overview') => {
    let data: any[];
    let filename: string;

    switch (type) {
      case 'sessions':
        data = sessions;
        filename = 'analytics-sessions.csv';
        break;
      case 'users':
        data = userMetrics;
        filename = 'analytics-users.csv';
        break;
      case 'overview':
        data = overview ? [overview] : [];
        filename = 'analytics-overview.csv';
        break;
      default:
        return;
    }

    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(header => {
        const val = row[header];
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [sessions, userMetrics, overview]);

  return {
    overview,
    sessions,
    userMetrics,
    appUsage,
    crossAppFlow,
    activityTimeline,
    loading,
    error,
    refresh: fetchData,
    setDateRange,
    exportData,
  };
}
