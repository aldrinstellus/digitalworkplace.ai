"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Timer,
  Globe,
  Phone,
  MessageCircle,
  RefreshCw,
  AlertTriangle,
  Activity,
  Zap,
  Users,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Wifi,
  WifiOff,
  Download,
  FileText,
} from "lucide-react";
import { apiUrl } from "@/lib/utils";

// Export handlers for downloading files
const handleExportJSON = async () => {
  try {
    const response = await fetch(apiUrl('/api/analytics?days=7&format=json'));
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dcq-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('JSON exported successfully');
  } catch (error) {
    console.error('Export failed:', error);
    toast.error('Failed to export JSON');
  }
};

const handleExportCSV = async () => {
  try {
    const response = await fetch(apiUrl('/api/analytics?days=7&format=csv'));
    if (!response.ok) throw new Error('Failed to fetch data');
    const csvData = await response.text();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dcq-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  } catch (error) {
    console.error('Export failed:', error);
    toast.error('Failed to export CSV');
  }
};

// Simulated real-time data for dashboard
interface DashboardData {
  activeSessions: number;
  queueLength: number;
  longestWait: number; // in seconds
  todayConversations: number;
  todayResolved: number;
  todayPending: number;
  avgWaitTime: number; // in seconds
  yesterdayConversations: number;
  yesterdaySatisfaction: number;
  yesterdayDuration: number;
  yesterdayEscalations: number;
  todaySatisfaction: number;
  todayDuration: number;
  todayEscalations: number;
  pendingEscalations: number;
  negativeFeedback: number;
  channels: {
    web: number;
    ivr: number;
    sms: number;
    facebook: number;
    instagram: number;
    whatsapp: number;
  };
  responseDistribution: {
    under1min: number;
    oneToFive: number;
    over5min: number;
  };
  recentActivity: Array<{
    id: string;
    time: string;
    type: 'resolved' | 'escalated' | 'started' | 'completed';
    channel: string;
    agent?: string;
  }>;
}

// Generate simulated dashboard data
function generateDashboardData(): DashboardData {
  const now = new Date();
  const activities = [
    { id: '1', time: formatTime(now, -2), type: 'resolved' as const, channel: 'Web', agent: 'Maria' },
    { id: '2', time: formatTime(now, -5), type: 'escalated' as const, channel: 'IVR' },
    { id: '3', time: formatTime(now, -8), type: 'completed' as const, channel: 'WhatsApp', agent: 'Jose' },
    { id: '4', time: formatTime(now, -12), type: 'started' as const, channel: 'Web' },
    { id: '5', time: formatTime(now, -15), type: 'resolved' as const, channel: 'SMS', agent: 'Ana' },
  ];

  return {
    activeSessions: Math.floor(Math.random() * 12) + 8,
    queueLength: Math.floor(Math.random() * 5),
    longestWait: Math.floor(Math.random() * 180) + 30,
    todayConversations: Math.floor(Math.random() * 50) + 120,
    todayResolved: Math.floor(Math.random() * 40) + 100,
    todayPending: Math.floor(Math.random() * 15) + 5,
    avgWaitTime: Math.floor(Math.random() * 60) + 45,
    yesterdayConversations: 142,
    yesterdaySatisfaction: 92,
    yesterdayDuration: 225,
    yesterdayEscalations: 6,
    todaySatisfaction: Math.floor(Math.random() * 5) + 93,
    todayDuration: Math.floor(Math.random() * 30) + 190,
    todayEscalations: Math.floor(Math.random() * 4) + 2,
    pendingEscalations: Math.floor(Math.random() * 5) + 1,
    negativeFeedback: Math.floor(Math.random() * 3),
    channels: {
      web: Math.floor(Math.random() * 30) + 40,
      ivr: Math.floor(Math.random() * 15) + 18,
      sms: Math.floor(Math.random() * 10) + 8,
      facebook: Math.floor(Math.random() * 8) + 5,
      instagram: Math.floor(Math.random() * 3),
      whatsapp: Math.floor(Math.random() * 12) + 10,
    },
    responseDistribution: {
      under1min: Math.floor(Math.random() * 10) + 68,
      oneToFive: Math.floor(Math.random() * 8) + 20,
      over5min: Math.floor(Math.random() * 5) + 5,
    },
    recentActivity: activities,
  };
}

function formatTime(date: Date, offsetMinutes: number): string {
  const d = new Date(date.getTime() + offsetMinutes * 60000);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

// Animated counter component
function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(animationFrame);
    };
  }, [value, duration]);

  // Use fixed locale to prevent hydration mismatch
  return <span>{displayValue.toLocaleString('en-US')}</span>;
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const refreshData = useCallback(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setData(generateDashboardData());
      setLastUpdate(new Date());
      setLoading(false);
    }, 500);
  }, []);

  // Mark as hydrated after client mount - combined with data refresh
  useEffect(() => {
    setIsHydrated(true); // eslint-disable-line
  }, []);

  useEffect(() => {
    refreshData(); // eslint-disable-line
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Online status check - only runs on client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial online status - runs once on mount
    setIsOnline(navigator.onLine); // eslint-disable-line

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getChannelStatus = (count: number): 'active' | 'low' | 'inactive' => {
    if (count === 0) return 'inactive';
    if (count < 5) return 'low';
    return 'active';
  };

  const getStatusColor = (status: 'active' | 'low' | 'inactive') => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'low': return 'bg-amber-500';
      case 'inactive': return 'bg-red-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'resolved': return <CheckCircle2 className="h-3.5 w-3.5 text-green-700" />;
      case 'escalated': return <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />;
      case 'started': return <Activity className="h-3.5 w-3.5 text-blue-600" />;
      case 'completed': return <CheckCircle2 className="h-3.5 w-3.5 text-green-700" />;
      default: return <Activity className="h-3.5 w-3.5 text-gray-500" />;
    }
  };

  const responseData = data ? [
    { name: t("dashboard.under1min"), value: data.responseDistribution.under1min, color: '#22c55e' },
    { name: t("dashboard.oneToFive"), value: data.responseDistribution.oneToFive, color: '#f59e0b' },
    { name: t("dashboard.over5min"), value: data.responseDistribution.over5min, color: '#ef4444' },
  ] : [];

  const calculateChange = (today: number, yesterday: number): { value: number; isPositive: boolean } => {
    if (yesterday === 0) return { value: 0, isPositive: true };
    const change = ((today - yesterday) / yesterday) * 100;
    return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Page Header with Live Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-[32px] font-bold text-[#000034] tracking-tight flex items-center gap-3">
            {t("dashboard.title")}
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
          </h1>
          <p className="text-[#666666] mt-1 text-[15px]">{t("dashboard.subtitle")}</p>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-[#E7EBF0] rounded-lg px-3 py-2 text-sm">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-700" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className={isOnline ? 'text-green-700' : 'text-red-600'}>
              {isOnline ? t("dashboard.liveStatus") : t("dashboard.offline")}
            </span>
          </div>
          {data && (
            <div className="flex items-center gap-2 bg-white border border-[#E7EBF0] rounded-lg px-3 py-2 text-sm">
              <Users className="h-4 w-4 text-[#000080]" />
              <span className="text-[#363535]">{data.activeSessions} {t("common.active")}</span>
            </div>
          )}
          {isHydrated && lastUpdate && (
            <div className="flex items-center gap-2 bg-white border border-[#E7EBF0] rounded-lg px-3 py-2 text-sm text-[#666]">
              <Clock className="h-4 w-4" />
              <span>Updated {lastUpdate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            disabled={loading}
            className="h-10 w-10 flex items-center justify-center bg-white border border-[#E7EBF0] rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-[#666666] ${loading ? 'animate-spin' : ''}`} />
          </motion.button>

          {/* Export Dropdown */}
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-10 px-4 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-lg shadow-[#000080]/20"
            >
              <Download className="h-4 w-4" />
              {t("common.export")}
            </motion.button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[#E7EBF0] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-3 text-left text-sm text-[#363535] hover:bg-[#F5F9FD] flex items-center gap-2 rounded-t-xl"
              >
                <FileText className="h-4 w-4 text-[#000080]" />
                {t("common.exportJSON")}
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full px-4 py-3 text-left text-sm text-[#363535] hover:bg-[#F5F9FD] flex items-center gap-2 rounded-b-xl border-t border-[#E7EBF0]"
              >
                <Download className="h-4 w-4 text-[#000080]" />
                {t("common.exportCSV")}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {loading && !data ? (
        <div className="flex items-center justify-center h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="h-8 w-8 text-[#000080]" />
          </motion.div>
        </div>
      ) : data ? (
        <>
          {/* Today's Snapshot KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <KPICard
              title={t("dashboard.todayConversations")}
              value={data.todayConversations}
              icon={MessageSquare}
              iconBg="bg-gradient-to-br from-[#000080] to-[#1D4F91]"
              delay={0}
            />
            <KPICard
              title={t("dashboard.resolved")}
              value={data.todayResolved}
              icon={CheckCircle2}
              iconBg="bg-gradient-to-br from-green-500 to-emerald-600"
              delay={0.1}
            />
            <KPICard
              title={t("dashboard.pending")}
              value={data.todayPending}
              icon={Clock}
              iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
              delay={0.2}
            />
            <KPICard
              title={t("dashboard.avgWaitTime")}
              value={data.avgWaitTime}
              suffix="s"
              icon={Timer}
              iconBg="bg-gradient-to-br from-purple-500 to-violet-600"
              delay={0.3}
            />
          </div>

          {/* Active Conversations & Channel Health Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Active Conversations Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-gradient-to-br from-white via-white to-red-50/30 rounded-xl border border-[#E7EBF0] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)]"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-lg shadow-red-500/20">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">{t("dashboard.activeNow")}</h3>
                <span className="ml-auto relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              </div>

              <div className="flex items-center gap-6 mb-4">
                <div className="flex-1">
                  <div className="text-4xl font-bold text-[#000034] mb-1">
                    <AnimatedCounter value={data.activeSessions} />
                  </div>
                  <p className="text-sm text-[#666]">{t("dashboard.sessions")}</p>
                </div>
                <div className="w-px h-16 bg-[#E7EBF0]" />
                <div className="flex-1">
                  <div className="text-4xl font-bold text-amber-700 mb-1">
                    <AnimatedCounter value={data.queueLength} />
                  </div>
                  <p className="text-sm text-[#666]">{t("dashboard.inQueue")}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#666]">{t("dashboard.longestWait")}</span>
                  <span className="font-medium text-[#000034]">{formatDuration(data.longestWait)}</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((data.longestWait / 300) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${data.longestWait > 180 ? 'bg-red-500' : data.longestWait > 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                  />
                </div>
              </div>
            </motion.div>

            {/* Channel Health Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-white via-white to-violet-50/30 rounded-xl border border-[#E7EBF0] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)]"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-lg shadow-violet-500/20">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">{t("dashboard.channelHealth")}</h3>
                <span className="ml-auto text-xs text-[#666] bg-violet-100 px-2 py-1 rounded-full">{t("common.today")}</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Web', value: data.channels.web, icon: Globe, color: '#000080' },
                  { name: 'IVR', value: data.channels.ivr, icon: Phone, color: '#7c3aed' },
                  { name: 'SMS', value: data.channels.sms, icon: MessageCircle, color: '#0891b2' },
                  { name: 'Facebook', value: data.channels.facebook, icon: MessageSquare, color: '#1877f2' },
                  { name: 'Instagram', value: data.channels.instagram, icon: MessageSquare, color: '#e4405f' },
                  { name: 'WhatsApp', value: data.channels.whatsapp, icon: MessageCircle, color: '#25d366' },
                ].map((channel) => {
                  const status = getChannelStatus(channel.value);
                  const Icon = channel.icon;
                  return (
                    <motion.div
                      key={channel.name}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-lg border border-[#E7EBF0] p-3 text-center relative"
                    >
                      <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${getStatusColor(status)}`} />
                      <div
                        className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
                        style={{ backgroundColor: `${channel.color}15` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: channel.color }} />
                      </div>
                      <p className="text-lg font-bold text-[#000034]">{channel.value}</p>
                      <p className="text-xs text-[#666]">{channel.name}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity & Today vs Yesterday Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Recent Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)]"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/20">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">{t("dashboard.recentActivity")}</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={refreshData}
                  className="ml-auto p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 text-[#666] ${loading ? 'animate-spin' : ''}`} />
                </motion.button>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {data.recentActivity.map((activity, idx) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-[#F5F9FD] rounded-lg"
                    >
                      {getActivityIcon(activity.type)}
                      <span className="text-xs text-[#6b6b6b] w-16">{activity.time}</span>
                      <span className="text-sm text-[#363535] flex-1">
                        {activity.channel} {activity.type === 'resolved' ? 'resolved' : activity.type === 'escalated' ? 'escalated' : activity.type === 'started' ? 'started' : 'completed'}
                      </span>
                      {activity.agent && (
                        <span className="text-xs text-[#666] bg-white px-2 py-1 rounded">{activity.agent}</span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Today vs Yesterday */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-white via-white to-green-50/30 rounded-xl border border-[#E7EBF0] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)]"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg shadow-green-500/20">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">{t("dashboard.todayVsYesterday")}</h3>
              </div>

              <div className="space-y-4">
                {[
                  { label: t("dashboard.conversations"), today: data.todayConversations, yesterday: data.yesterdayConversations },
                  { label: t("dashboard.satisfaction"), today: data.todaySatisfaction, yesterday: data.yesterdaySatisfaction, suffix: '%' },
                  { label: t("dashboard.avgDuration"), today: data.todayDuration, yesterday: data.yesterdayDuration, suffix: 's', invert: true },
                  { label: t("dashboard.escalations"), today: data.todayEscalations, yesterday: data.yesterdayEscalations, invert: true },
                ].map((item) => {
                  const change = calculateChange(item.today, item.yesterday);
                  const isGood = item.invert ? !change.isPositive : change.isPositive;
                  return (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-[#666]">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-[#000034]">
                          {item.today}{item.suffix || ''}
                        </span>
                        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          isGood ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                        }`}>
                          {change.isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {change.value}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Pending Actions & Response Time Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-gradient-to-br from-white via-white to-amber-50/30 rounded-xl border border-[#E7EBF0] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)]"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-lg shadow-amber-500/20">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">{t("dashboard.requiresAttention")}</h3>
              </div>

              <div className="space-y-3">
                {data.pendingEscalations > 0 && (
                  <Link href="/admin/escalations">
                    <motion.div
                      whileHover={{ scale: 1.01, x: 4 }}
                      className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm font-medium text-red-800">
                          {data.pendingEscalations} {t("dashboard.escalationsPending")}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-red-600" />
                    </motion.div>
                  </Link>
                )}

                {data.negativeFeedback > 0 && (
                  <Link href="/admin/logs">
                    <motion.div
                      whileHover={{ scale: 1.01, x: 4 }}
                      className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-sm font-medium text-amber-800">
                          {data.negativeFeedback} {t("dashboard.negativeFeedback")}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-amber-700" />
                    </motion.div>
                  </Link>
                )}

                {data.pendingEscalations === 0 && data.negativeFeedback === 0 && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-green-800">{t("dashboard.allClear")}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-blue-800">{t("dashboard.allOperational")}</span>
                </div>
              </div>
            </motion.div>

            {/* Response Time Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-white via-white to-cyan-50/30 rounded-xl border border-[#E7EBF0] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)]"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg shadow-lg shadow-cyan-500/20">
                  <Timer className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">{t("dashboard.responseTime")}</h3>
                <span className="ml-auto text-xs text-[#666] bg-cyan-100 px-2 py-1 rounded-full">{t("common.today")}</span>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-[140px] h-[140px]">
                  {isHydrated && (
                    <ResponsiveContainer width={140} height={140} minWidth={140} minHeight={140}>
                      <PieChart>
                        <Pie
                          data={responseData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1000}
                        >
                          {responseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "none",
                            borderRadius: "8px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                          }}
                          formatter={(value) => [`${value}%`, '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  {responseData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-[#666]">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-[#000034]">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </div>
  );
}

// KPI Card Component
function KPICard({
  title,
  value,
  suffix = "",
  icon: Icon,
  iconBg,
  delay = 0,
}: {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-gradient-to-br from-white via-white to-blue-50/50 rounded-xl border border-[#E7EBF0] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,128,0.15)] transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-xl ${iconBg} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="text-[13px] text-[#666666] mb-1">{title}</p>
      <p className="text-[28px] font-bold text-[#000034] tracking-tight">
        <AnimatedCounter value={value} />
        {suffix}
      </p>
    </motion.div>
  );
}
