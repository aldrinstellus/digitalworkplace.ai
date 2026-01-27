"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAllUsers, UserData } from "@/lib/userRole";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatDuration } from "@/lib/analytics";

// Project colors matching dashboard
const projectColors: Record<string, { primary: string; glow: string; name: string }> = {
  main: { primary: "#4ade80", glow: "rgba(74, 222, 128, 0.4)", name: "Main Dashboard" },
  dIQ: { primary: "#3b82f6", glow: "rgba(59, 130, 246, 0.4)", name: "Intranet IQ" },
  dSQ: { primary: "#10b981", glow: "rgba(16, 185, 129, 0.4)", name: "Support IQ" },
  dCQ: { primary: "#a855f7", glow: "rgba(168, 85, 247, 0.4)", name: "Chat Core IQ" },
  dTQ: { primary: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)", name: "Test Pilot IQ" },
};

type ModalType = "users" | "active" | "sessions" | "pageviews" | null;

interface ActiveUserDetail {
  user_id: string;
  user_email: string;
  user_name: string;
  avatar_url: string | null;
  role: string;
  session_id: string;
  session_started_at: string;
  last_heartbeat_at: string;
  session_duration_seconds: number;
  device_type: string;
  browser: string;
  os: string;
  ip_address: string | null;
  current_app: string | null;
  current_page: string | null;
  total_page_views_session: number;
  is_active: boolean;
  idle_seconds: number;
  status: 'online' | 'idle' | 'away';
}

interface ActiveUsersSummary {
  total_active: number;
  online_now: number;
  idle: number;
  away: number;
  by_device: { desktop: number; mobile: number; tablet: number };
  by_app: Record<string, number>;
}

export default function AnalyticsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [dateRangeLabel, setDateRangeLabel] = useState("Last 30 days");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeUsersData, setActiveUsersData] = useState<ActiveUserDetail[]>([]);
  const [activeUsersSummary, setActiveUsersSummary] = useState<ActiveUsersSummary | null>(null);
  const [activeUsersLoading, setActiveUsersLoading] = useState(false);
  const [activeUsersWindow, setActiveUsersWindow] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const {
    overview,
    sessions,
    userMetrics,
    appUsage,
    crossAppFlow,
    loading: analyticsLoading,
    refresh,
    setDateRange,
  } = useAnalytics({ autoRefresh: true, refreshInterval: 60000 }); // Changed to 60s

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const allUsers = await getAllUsers();
      const current = allUsers.find(
        (u) => u.email === user.primaryEmailAddress?.emailAddress
      );

      if (!current || current.role !== "super_admin") {
        router.push("/");
        return;
      }

      setCurrentUserData(current);
      setLoading(false);
    };

    if (user) {
      fetchData();
    }
  }, [user, isLoaded, router]);

  const handleDateRangeChange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    setDateRange({
      start: start.toISOString(),
      end: end.toISOString(),
    });

    setDateRangeLabel(
      days === 1
        ? "Last 24 hours"
        : days === 7
        ? "Last 7 days"
        : days === 30
        ? "Last 30 days"
        : `Last ${days} days`
    );
  };

  const handleSignOut = () => {
    signOut({ redirectUrl: "/sign-in" });
  };

  // Fetch active users with full details
  const fetchActiveUsers = async (window: '1h' | '24h' | '7d' | '30d' = '24h') => {
    setActiveUsersLoading(true);
    try {
      const res = await fetch(`/api/analytics/active-users?window=${window}`);
      if (res.ok) {
        const json = await res.json();
        setActiveUsersData(json.data || []);
        setActiveUsersSummary(json.summary || null);
      }
    } catch (err) {
      console.error('Error fetching active users:', err);
    } finally {
      setActiveUsersLoading(false);
    }
  };

  // Fetch active users when modal opens
  useEffect(() => {
    if (activeModal === 'active') {
      fetchActiveUsers(activeUsersWindow);
    }
  }, [activeModal, activeUsersWindow]);

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-green-500/20 border-t-green-500 rounded-full"
        />
      </div>
    );
  }

  const isSuperAdmin = currentUserData?.role === "super_admin";

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f1a]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <button
                onClick={() => router.push("/dashboard")}
                className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl tracking-tight hover:opacity-80 transition-opacity"
              >
                <span className="text-white/60">digital</span>
                <span className="text-white">workplace</span>
                <span className="text-green-400">.ai</span>
              </button>
            </motion.div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isSuperAdmin && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => router.push("/admin")}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a2e] hover:bg-[#1f1f35] border border-white/5 hover:border-white/10 rounded-lg transition-all"
                >
                  <span className="text-xs">👑</span>
                  <span className="text-white/70 text-sm font-medium">Admin</span>
                </motion.button>
              )}

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center p-0.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {user?.imageUrl && !avatarError ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || "User"}
                      className="w-8 h-8 rounded-lg border border-white/10 object-cover"
                      onError={() => setAvatarError(true)}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-white/70 font-medium text-sm">
                      {user?.firstName?.[0] || "U"}
                    </div>
                  )}
                </motion.button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-52 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-white/5">
                      <p className="text-white/90 font-medium text-sm truncate">{user?.fullName}</p>
                      <p className="text-white/40 text-xs truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                    <button onClick={() => router.push("/dashboard")} className="w-full px-3 py-2.5 text-left text-sm text-white/60 hover:text-white/90 hover:bg-white/5 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                      Dashboard
                    </button>
                    <button onClick={handleSignOut} className="w-full px-3 py-2.5 text-left text-sm text-white/60 hover:text-white/90 hover:bg-white/5 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                      Sign out
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-5 sm:py-6">
        {/* Title & Controls */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">Analytics Dashboard</h1>
              <p className="text-white/40 text-sm mt-0.5">Click any card to see detailed data</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={dateRangeLabel}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "Last 24 hours") handleDateRangeChange(1);
                  else if (v === "Last 7 days") handleDateRangeChange(7);
                  else if (v === "Last 30 days") handleDateRangeChange(30);
                }}
                className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-green-500/50"
              >
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={refresh} className="p-2 bg-[#1a1a2e] border border-white/10 rounded-lg hover:border-green-500/30">
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Clickable Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Users"
            value={overview?.totalUsers ?? 0}
            color="#4ade80"
            icon="👥"
            onClick={() => setActiveModal("users")}
            loading={analyticsLoading}
          />
          <StatCard
            title="Active (24h)"
            value={overview?.active24h ?? 0}
            color="#06b6d4"
            icon="🟢"
            onClick={() => setActiveModal("active")}
            loading={analyticsLoading}
            subtitle={`${overview?.active7d ?? 0} (7d) • ${overview?.active30d ?? 0} (30d)`}
          />
          <StatCard
            title="Total Sessions"
            value={overview?.totalSessions ?? 0}
            color="#3b82f6"
            icon="📊"
            onClick={() => setActiveModal("sessions")}
            loading={analyticsLoading}
          />
          <StatCard
            title="Avg. Session"
            value={formatDuration(overview?.avgSessionDuration ?? 0)}
            color="#a855f7"
            icon="⏱️"
            onClick={() => setActiveModal("sessions")}
            loading={analyticsLoading}
            subtitle={`${overview?.totalPageViews ?? 0} page views`}
          />
        </div>

        {/* App Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ContentCard title="App Usage" subtitle="Page views by application">
            {analyticsLoading ? (
              <LoadingSpinner />
            ) : appUsage.length === 0 ? (
              <EmptyState message="No page views recorded yet" />
            ) : (
              <div className="space-y-4">
                {appUsage.map((app, i) => {
                  const colors = projectColors[app.project_code] || { primary: "#6b7280", name: app.project_code };
                  return (
                    <div key={app.project_code}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }} />
                          <span className="text-white/80 text-sm font-medium">{colors.name}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: colors.primary }}>{app.percentage}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${app.percentage}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: colors.primary }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-white/40">
                        <span>{app.total_views.toLocaleString()} views</span>
                        <span>{app.unique_users} users</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ContentCard>

          <ContentCard title="Cross-App Navigation" subtitle="User flow between apps">
            {analyticsLoading ? (
              <LoadingSpinner />
            ) : crossAppFlow.length === 0 ? (
              <EmptyState message="No cross-app navigation recorded" />
            ) : (
              <div className="space-y-3">
                {crossAppFlow.slice(0, 6).map((flow) => {
                  const fromColors = projectColors[flow.from_project_code] || { primary: "#6b7280" };
                  const toColors = projectColors[flow.to_project_code] || { primary: "#6b7280" };
                  return (
                    <div key={`${flow.from_project_code}-${flow.to_project_code}`} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: `${fromColors.primary}20`, color: fromColors.primary }}>
                        {projectColors[flow.from_project_code]?.name || flow.from_project_code}
                      </span>
                      <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: `${toColors.primary}20`, color: toColors.primary }}>
                        {projectColors[flow.to_project_code]?.name || flow.to_project_code}
                      </span>
                      <span className="ml-auto text-white/60 text-sm font-semibold">{flow.navigation_count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </ContentCard>
        </div>

        {/* Recent Sessions Table */}
        <ContentCard title="Recent Sessions" subtitle="Latest user sign-ins" className="mb-8">
          {analyticsLoading ? (
            <LoadingSpinner />
          ) : sessions.length === 0 ? (
            <EmptyState message="No sessions recorded yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-white/40 border-b border-white/5">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Started</th>
                    <th className="pb-3 font-medium">Duration</th>
                    <th className="pb-3 font-medium">Device</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {sessions.slice(0, 10).map((session) => (
                    <tr key={session.id} className="border-b border-white/5 last:border-0">
                      <td className="py-3">
                        <p className="text-white/90 font-medium">{session.user_name}</p>
                        <p className="text-white/40 text-xs">{session.user_email}</p>
                      </td>
                      <td className="py-3 text-white/60">{new Date(session.started_at).toLocaleString()}</td>
                      <td className="py-3 text-white/60">{formatDuration(session.duration_seconds)}</td>
                      <td className="py-3 text-white/60 capitalize">{session.device_type} / {session.browser}</td>
                      <td className="py-3">
                        {session.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-full text-white/40 text-xs">Ended</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ContentCard>

        {/* Top Users Table */}
        <ContentCard title="Top Users by Activity" subtitle="Most active users in selected period">
          {analyticsLoading ? (
            <LoadingSpinner />
          ) : userMetrics.length === 0 ? (
            <EmptyState message="No user activity recorded" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-white/40 border-b border-white/5">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Sessions</th>
                    <th className="pb-3 font-medium">Total Time</th>
                    <th className="pb-3 font-medium">Page Views</th>
                    <th className="pb-3 font-medium">Favorite App</th>
                    <th className="pb-3 font-medium">Last Active</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {userMetrics.slice(0, 10).map((u: any) => (
                    <tr key={u.user_id} className="border-b border-white/5 last:border-0">
                      <td className="py-3">
                        <p className="text-white/90 font-medium">{u.user_name}</p>
                        <p className="text-white/40 text-xs">{u.user_email}</p>
                      </td>
                      <td className="py-3 text-white/60">{u.total_sessions}</td>
                      <td className="py-3 text-white/60">{formatDuration(u.total_time_seconds)}</td>
                      <td className="py-3 text-white/60">{u.total_page_views}</td>
                      <td className="py-3">
                        {u.favorite_app !== "N/A" ? (
                          <span className="px-2 py-1 rounded text-xs font-medium" style={{
                            backgroundColor: `${projectColors[u.favorite_app]?.primary || "#6b7280"}20`,
                            color: projectColors[u.favorite_app]?.primary || "#6b7280"
                          }}>
                            {projectColors[u.favorite_app]?.name || u.favorite_app}
                          </span>
                        ) : (
                          <span className="text-white/40">-</span>
                        )}
                      </td>
                      <td className="py-3 text-white/60 text-xs">{new Date(u.last_active).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ContentCard>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === "users" && (
          <Modal title="All Users" subtitle={`${overview?.totalUsers ?? 0} total users`} onClose={() => setActiveModal(null)}>
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#1a1a2e]">
                  <tr className="text-left text-xs text-white/40 border-b border-white/10">
                    <th className="pb-3 pt-2 font-medium">User</th>
                    <th className="pb-3 pt-2 font-medium">Role</th>
                    <th className="pb-3 pt-2 font-medium">Sessions</th>
                    <th className="pb-3 pt-2 font-medium">Page Views</th>
                    <th className="pb-3 pt-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {userMetrics.map((u: any) => (
                    <tr key={u.user_id} className="border-b border-white/5">
                      <td className="py-3">
                        <p className="text-white/90 font-medium">{u.user_name}</p>
                        <p className="text-white/40 text-xs">{u.user_email}</p>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${u.role === 'super_admin' ? 'bg-amber-500/20 text-amber-400' : u.role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/60'}`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="py-3 text-white/60">{u.total_sessions}</td>
                      <td className="py-3 text-white/60">{u.total_page_views}</td>
                      <td className="py-3">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-green-400 text-xs"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>Online</span>
                        ) : (
                          <span className="text-white/40 text-xs">Offline</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Modal>
        )}

        {activeModal === "active" && (
          <Modal title="Active Users Breakdown" subtitle={`Comprehensive view of all logged-in users`} onClose={() => setActiveModal(null)}>
            {/* Time Window Selector */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white/40 text-sm">Time window:</span>
              {(['1h', '24h', '7d', '30d'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setActiveUsersWindow(w)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeUsersWindow === w
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {w === '1h' ? '1 Hour' : w === '24h' ? '24 Hours' : w === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
              <button
                onClick={() => fetchActiveUsers(activeUsersWindow)}
                className="ml-auto p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className={`w-4 h-4 text-white/60 ${activeUsersLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-400">{activeUsersSummary?.online_now ?? 0}</p>
                <p className="text-white/50 text-xs">Online Now</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-yellow-400">{activeUsersSummary?.idle ?? 0}</p>
                <p className="text-white/50 text-xs">Idle (5-15m)</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-orange-400">{activeUsersSummary?.away ?? 0}</p>
                <p className="text-white/50 text-xs">Away (15m+)</p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-cyan-400">{activeUsersSummary?.total_active ?? 0}</p>
                <p className="text-white/50 text-xs">Total Active</p>
              </div>
            </div>

            {/* Device & App Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/60 text-xs mb-2 font-medium">By Device</p>
                <div className="flex gap-3">
                  <span className="text-sm"><span className="text-white/80">💻</span> <span className="text-white/60">{activeUsersSummary?.by_device?.desktop ?? 0}</span></span>
                  <span className="text-sm"><span className="text-white/80">📱</span> <span className="text-white/60">{activeUsersSummary?.by_device?.mobile ?? 0}</span></span>
                  <span className="text-sm"><span className="text-white/80">📲</span> <span className="text-white/60">{activeUsersSummary?.by_device?.tablet ?? 0}</span></span>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/60 text-xs mb-2 font-medium">By App</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(activeUsersSummary?.by_app || {}).map(([app, count]) => (
                    <span key={app} className="px-2 py-0.5 rounded text-xs" style={{
                      backgroundColor: `${projectColors[app]?.primary || '#6b7280'}20`,
                      color: projectColors[app]?.primary || '#6b7280'
                    }}>
                      {projectColors[app]?.name || app}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* All Users Table */}
            <div className="overflow-y-auto max-h-[45vh] border border-white/10 rounded-lg">
              {activeUsersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-white/10 border-t-cyan-500 rounded-full animate-spin" />
                </div>
              ) : activeUsersData.length === 0 ? (
                <div className="text-center py-12 text-white/40">No active users in this time window</div>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#1a1a2e] z-10">
                    <tr className="text-left text-xs text-white/40 border-b border-white/10">
                      <th className="px-3 pb-3 pt-3 font-medium">User</th>
                      <th className="px-3 pb-3 pt-3 font-medium">Status</th>
                      <th className="px-3 pb-3 pt-3 font-medium">Session Started</th>
                      <th className="px-3 pb-3 pt-3 font-medium">Last Activity</th>
                      <th className="px-3 pb-3 pt-3 font-medium">Duration</th>
                      <th className="px-3 pb-3 pt-3 font-medium">Current App</th>
                      <th className="px-3 pb-3 pt-3 font-medium">Device</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {activeUsersData.map((u) => (
                      <tr key={u.session_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              u.status === 'online' ? 'bg-green-400 animate-pulse' :
                              u.status === 'idle' ? 'bg-yellow-400' : 'bg-orange-400/60'
                            }`} />
                            <div>
                              <p className="text-white/90 font-medium">{u.user_name}</p>
                              <p className="text-white/40 text-xs">{u.user_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.status === 'online' ? 'bg-green-500/20 text-green-400' :
                            u.status === 'idle' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {u.status === 'online' ? 'Online' : u.status === 'idle' ? 'Idle' : 'Away'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div>
                            <p className="text-white/70 text-xs">{new Date(u.session_started_at).toLocaleString()}</p>
                            <p className="text-white/40 text-xs">{formatRelativeTime(u.session_started_at)}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div>
                            <p className="text-white/70 text-xs">{new Date(u.last_heartbeat_at).toLocaleString()}</p>
                            <p className="text-white/40 text-xs">{formatRelativeTime(u.last_heartbeat_at)}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-white/60">{formatDuration(u.session_duration_seconds)}</td>
                        <td className="px-3 py-3">
                          {u.current_app ? (
                            <div>
                              <span className="px-2 py-0.5 rounded text-xs" style={{
                                backgroundColor: `${projectColors[u.current_app]?.primary || '#6b7280'}20`,
                                color: projectColors[u.current_app]?.primary || '#6b7280'
                              }}>
                                {projectColors[u.current_app]?.name || u.current_app}
                              </span>
                              {u.current_page && (
                                <p className="text-white/30 text-xs mt-0.5 truncate max-w-[120px]" title={u.current_page}>
                                  {u.current_page}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-white/30 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-white/50 text-xs">
                            <p className="capitalize">{u.device_type}</p>
                            <p>{u.browser} / {u.os}</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Modal>
        )}

        {activeModal === "sessions" && (
          <Modal title="All Sessions" subtitle={`${overview?.totalSessions ?? 0} total sessions`} onClose={() => setActiveModal(null)}>
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#1a1a2e]">
                  <tr className="text-left text-xs text-white/40 border-b border-white/10">
                    <th className="pb-3 pt-2 font-medium">User</th>
                    <th className="pb-3 pt-2 font-medium">Started</th>
                    <th className="pb-3 pt-2 font-medium">Duration</th>
                    <th className="pb-3 pt-2 font-medium">Device</th>
                    <th className="pb-3 pt-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-b border-white/5">
                      <td className="py-3">
                        <p className="text-white/90 font-medium">{s.user_name}</p>
                        <p className="text-white/40 text-xs">{s.user_email}</p>
                      </td>
                      <td className="py-3 text-white/60 text-sm">{new Date(s.started_at).toLocaleString()}</td>
                      <td className="py-3 text-white/60">{formatDuration(s.duration_seconds)}</td>
                      <td className="py-3 text-white/60 capitalize text-sm">{s.device_type} / {s.browser} / {s.os}</td>
                      <td className="py-3">
                        {s.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-white/5 rounded-full text-white/40 text-xs">Ended</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {showUserMenu && <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />}
    </div>
  );
}

// Components
function StatCard({ title, value, color, icon, onClick, loading, subtitle }: {
  title: string; value: number | string; color: string; icon: string;
  onClick: () => void; loading?: boolean; subtitle?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative p-4 sm:p-5 rounded-xl text-left overflow-hidden group"
      style={{ background: `linear-gradient(145deg, rgba(26,26,46,0.95), rgba(15,15,26,0.98))`, boxShadow: `0 4px 20px -5px ${color}30, inset 0 0 0 1px ${color}30` }}
    >
      <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: `radial-gradient(circle at 80% 20%, ${color}, transparent 60%)` }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl">{icon}</span>
          <svg className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </div>
        {loading ? (
          <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
        ) : (
          <p className="text-2xl sm:text-3xl font-bold text-white">{typeof value === "number" ? value.toLocaleString() : value}</p>
        )}
        <p className="text-sm mt-1" style={{ color }}>{title}</p>
        {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
      </div>
    </motion.button>
  );
}

function ContentCard({ title, subtitle, children, className = "" }: { title: string; subtitle: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#1a1a2e]/80 border border-white/5 rounded-xl p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-white/40 text-sm">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Modal({ title, subtitle, children, onClose }: { title: string; subtitle: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="text-white/40 text-sm">{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-white/10 border-t-green-500/50 rounded-full animate-spin" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-white/40">{message}</p>
    </div>
  );
}
