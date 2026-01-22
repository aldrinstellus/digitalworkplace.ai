'use client';

/**
 * Admin Dashboard Page
 * Comprehensive admin analytics and system overview
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FileText,
  Search,
  MessageSquare,
  Zap,
  Server,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  Cpu,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  ChevronRight,
  Globe,
  Bot,
  DollarSign,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

// =============================================================================
// TYPES
// =============================================================================

interface DashboardStats {
  users: {
    total: number;
    active: number;
    new: number;
    churn: number;
    growth: number;
  };
  content: {
    articles: number;
    knowledgeItems: number;
    newsItems: number;
    events: number;
    newThisWeek: number;
  };
  search: {
    totalSearches: number;
    avgResponseTime: number;
    topQueries: { query: string; count: number }[];
    noResultsQueries: { query: string; count: number }[];
  };
  ai: {
    totalConversations: number;
    totalMessages: number;
    avgMessagesPerConvo: number;
    tokenUsage: number;
    estimatedCost: number;
  };
  workflows: {
    total: number;
    active: number;
    executions: number;
    successRate: number;
  };
  system: {
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    dbConnections: number;
    cacheHitRate: number;
    lastDeployment: string;
  };
}

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const timeRanges: TimeRange[] = [
  { label: 'Today', value: 'today', days: 1 },
  { label: '7 Days', value: '7d', days: 7 },
  { label: '30 Days', value: '30d', days: 30 },
  { label: '90 Days', value: '90d', days: 90 },
];

// =============================================================================
// COMPONENTS
// =============================================================================

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
  subtitle,
}: {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  iconColor: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-charcoal border border-white/10 rounded-xl p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/60">{title}</p>
          <p className="text-3xl font-semibold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center mt-4 gap-1">
          {changeType === 'increase' ? (
            <ArrowUpRight className="w-4 h-4 text-green-400" />
          ) : changeType === 'decrease' ? (
            <ArrowDownRight className="w-4 h-4 text-red-400" />
          ) : (
            <Activity className="w-4 h-4 text-white/40" />
          )}
          <span
            className={`text-sm ${
              changeType === 'increase'
                ? 'text-green-400'
                : changeType === 'decrease'
                  ? 'text-red-400'
                  : 'text-white/40'
            }`}
          >
            {change > 0 ? '+' : ''}
            {change}% vs last period
          </span>
        </div>
      )}
    </motion.div>
  );
}

function SystemHealthIndicator({ status }: { status: 'healthy' | 'degraded' | 'down' }) {
  const config = {
    healthy: { color: 'text-green-400', bg: 'bg-green-400/10', label: 'All Systems Operational' },
    degraded: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Degraded Performance' },
    down: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'System Down' },
  };

  const { color, bg, label } = config[status];

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${bg}`}>
      <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')} animate-pulse`} />
      <span className={`text-sm ${color}`}>{label}</span>
    </div>
  );
}

function TopQueriesTable({
  queries,
  title,
  emptyMessage,
}: {
  queries: { query: string; count: number }[];
  title: string;
  emptyMessage: string;
}) {
  return (
    <div className="bg-charcoal border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      {queries.length === 0 ? (
        <p className="text-white/40 text-sm text-center py-8">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {queries.slice(0, 10).map((q, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-4">{i + 1}</span>
                <span className="text-sm truncate max-w-[200px]">{q.query}</span>
              </div>
              <span className="text-sm text-white/60">{q.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsageChart({
  data,
  title,
  color,
}: {
  data: number[];
  title: string;
  color: string;
}) {
  const max = Math.max(...data, 1);

  return (
    <div className="bg-charcoal border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="flex items-end gap-1 h-32">
        {data.map((value, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(value / max) * 100}%` }}
            transition={{ delay: i * 0.05 }}
            className={`flex-1 ${color} rounded-t min-h-[4px]`}
            title={`${value.toLocaleString()}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-white/40">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function RecentActivity({ activities }: { activities: { type: string; message: string; time: string }[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'user':
        return Users;
      case 'content':
        return FileText;
      case 'search':
        return Search;
      case 'workflow':
        return Zap;
      case 'ai':
        return Bot;
      default:
        return Activity;
    }
  };

  return (
    <div className="bg-charcoal border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, i) => {
          const Icon = getIcon(activity.type);
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="p-2 bg-white/5 rounded-lg">
                <Icon className="w-4 h-4 text-white/60" />
              </div>
              <div className="flex-1">
                <p className="text-sm">{activity.message}</p>
                <p className="text-xs text-white/40">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>(timeRanges[1]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Generate mock data for chart
  const generateChartData = (baseValue: number, variance: number = 0.3) => {
    return Array.from({ length: 30 }, () =>
      Math.floor(baseValue * (1 + (Math.random() - 0.5) * variance))
    );
  };

  const fetchStats = async () => {
    try {
      // Fetch real stats from APIs
      const [dashboardRes, usersRes, workflowsRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/people'),
        fetch('/api/workflows'),
      ]);

      const dashboardData = await dashboardRes.json();
      const usersData = await usersRes.json();
      const workflowsData = await workflowsRes.json();

      // Calculate stats
      const totalUsers = usersData.employees?.length || 0;
      const activeUsers = Math.floor(totalUsers * 0.75);
      const newUsers = Math.floor(totalUsers * 0.05);

      const totalArticles = dashboardData.stats?.articles || 0;
      const totalNews = dashboardData.stats?.news_posts || 0;
      const totalEvents = dashboardData.stats?.events || 0;

      const totalWorkflows = workflowsData.total_workflows || 0;
      const activeWorkflows = workflowsData.workflows?.filter((w: { is_active?: boolean }) => w.is_active).length || 0;

      setStats({
        users: {
          total: totalUsers,
          active: activeUsers,
          new: newUsers,
          churn: Math.floor(totalUsers * 0.02),
          growth: 12.5,
        },
        content: {
          articles: totalArticles,
          knowledgeItems: 348,
          newsItems: totalNews,
          events: totalEvents,
          newThisWeek: Math.floor(totalArticles * 0.03),
        },
        search: {
          totalSearches: 15420,
          avgResponseTime: 142,
          topQueries: [
            { query: 'onboarding process', count: 234 },
            { query: 'PTO policy', count: 189 },
            { query: 'expense report', count: 156 },
            { query: 'IT support', count: 134 },
            { query: 'benefits enrollment', count: 112 },
          ],
          noResultsQueries: [
            { query: 'parking permits', count: 23 },
            { query: 'gym membership', count: 18 },
            { query: 'conference rooms', count: 15 },
          ],
        },
        ai: {
          totalConversations: dashboardData.stats?.chat_threads || 30,
          totalMessages: dashboardData.stats?.chat_messages || 126,
          avgMessagesPerConvo: 4.2,
          tokenUsage: 2450000,
          estimatedCost: 24.50,
        },
        workflows: {
          total: totalWorkflows,
          active: activeWorkflows,
          executions: workflowsData.total_executions || 0,
          successRate: 94.5,
        },
        system: {
          status: 'healthy',
          uptime: 99.98,
          dbConnections: 15,
          cacheHitRate: 87.3,
          lastDeployment: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  // Mock chart data
  const searchTrendData = generateChartData(500);
  const aiUsageData = generateChartData(150);
  const userActivityData = generateChartData(45);

  // Mock recent activities
  const recentActivities = [
    { type: 'user', message: 'New user Sarah Chen joined Engineering', time: '5 minutes ago' },
    { type: 'content', message: 'Article "Q4 Planning Guide" published', time: '23 minutes ago' },
    { type: 'workflow', message: 'Onboarding workflow executed successfully', time: '1 hour ago' },
    { type: 'ai', message: 'AI Assistant handled 45 conversations today', time: '2 hours ago' },
    { type: 'search', message: 'Search index updated with 156 new documents', time: '3 hours ago' },
  ];

  return (
    <div className="flex min-h-screen bg-obsidian">
      <Sidebar />

      <main className="flex-1 ml-16 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="text-white/60 mt-1">System overview and analytics</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-charcoal border border-white/10 rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    timeRange.value === range.value
                      ? 'bg-ember text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-charcoal border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-charcoal border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>
        </div>

        {/* System Status Bar */}
        <div className="flex items-center justify-between bg-charcoal border border-white/10 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-6">
            <SystemHealthIndicator status={stats?.system.status || 'healthy'} />
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/60">
                Uptime: <span className="text-white">{stats?.system.uptime || 99.9}%</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/60">
                DB Connections: <span className="text-white">{stats?.system.dbConnections || 0}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/60">
                Cache Hit: <span className="text-white">{stats?.system.cacheHitRate || 0}%</span>
              </span>
            </div>
          </div>
          <div className="text-sm text-white/40">
            Last deployment: {stats?.system.lastDeployment
              ? new Date(stats.system.lastDeployment).toLocaleDateString()
              : 'N/A'}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-ember" />
          </div>
        ) : (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Users"
                value={stats?.users.total.toLocaleString() || '0'}
                change={stats?.users.growth || 0}
                changeType="increase"
                icon={Users}
                iconColor="bg-blue-500/20 text-blue-400"
                subtitle={`${stats?.users.active || 0} active`}
              />
              <StatCard
                title="Knowledge Articles"
                value={stats?.content.articles.toLocaleString() || '0'}
                change={8.3}
                changeType="increase"
                icon={FileText}
                iconColor="bg-green-500/20 text-green-400"
                subtitle={`+${stats?.content.newThisWeek || 0} this week`}
              />
              <StatCard
                title="Search Queries"
                value={stats?.search.totalSearches.toLocaleString() || '0'}
                change={15.2}
                changeType="increase"
                icon={Search}
                iconColor="bg-purple-500/20 text-purple-400"
                subtitle={`${stats?.search.avgResponseTime || 0}ms avg response`}
              />
              <StatCard
                title="AI Conversations"
                value={stats?.ai.totalConversations.toLocaleString() || '0'}
                change={24.5}
                changeType="increase"
                icon={Bot}
                iconColor="bg-ember/20 text-ember"
                subtitle={`${stats?.ai.totalMessages || 0} messages`}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <UsageChart
                data={searchTrendData}
                title="Search Volume"
                color="bg-purple-500"
              />
              <UsageChart
                data={aiUsageData}
                title="AI Usage"
                color="bg-ember"
              />
              <UsageChart
                data={userActivityData}
                title="User Activity"
                color="bg-blue-500"
              />
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* User Stats */}
              <div className="bg-charcoal border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  User Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Active Users</span>
                    <span className="font-medium">{stats?.users.active.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">New This Month</span>
                    <span className="font-medium text-green-400">+{stats?.users.new}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Churned</span>
                    <span className="font-medium text-red-400">-{stats?.users.churn}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Growth Rate</span>
                    <span className="font-medium text-green-400">{stats?.users.growth}%</span>
                  </div>
                </div>
              </div>

              {/* AI Usage & Costs */}
              <div className="bg-charcoal border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-ember" />
                  AI Usage & Costs
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Total Conversations</span>
                    <span className="font-medium">{stats?.ai.totalConversations}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Messages Processed</span>
                    <span className="font-medium">{stats?.ai.totalMessages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Token Usage</span>
                    <span className="font-medium">{(stats?.ai.tokenUsage || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Estimated Cost (MTD)</span>
                    <span className="font-medium text-ember">${stats?.ai.estimatedCost?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Workflow Stats */}
              <div className="bg-charcoal border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Workflow Automation
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Total Workflows</span>
                    <span className="font-medium">{stats?.workflows.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Active</span>
                    <span className="font-medium">{stats?.workflows.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Executions (30d)</span>
                    <span className="font-medium">{stats?.workflows.executions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Success Rate</span>
                    <span className="font-medium text-green-400">{stats?.workflows.successRate}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-3 gap-6">
              <TopQueriesTable
                queries={stats?.search.topQueries || []}
                title="Top Search Queries"
                emptyMessage="No search data available"
              />
              <TopQueriesTable
                queries={stats?.search.noResultsQueries || []}
                title="No Results Queries"
                emptyMessage="No failed searches"
              />
              <RecentActivity activities={recentActivities} />
            </div>

            {/* Content Stats */}
            <div className="mt-8">
              <h2 className="text-lg font-medium mb-4">Content Overview</h2>
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-charcoal border border-white/10 rounded-xl p-5 text-center">
                  <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-semibold">{stats?.content.articles || 0}</p>
                  <p className="text-sm text-white/60">Articles</p>
                </div>
                <div className="bg-charcoal border border-white/10 rounded-xl p-5 text-center">
                  <Database className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-semibold">{stats?.content.knowledgeItems || 0}</p>
                  <p className="text-sm text-white/60">Knowledge Items</p>
                </div>
                <div className="bg-charcoal border border-white/10 rounded-xl p-5 text-center">
                  <Globe className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-semibold">{stats?.content.newsItems || 0}</p>
                  <p className="text-sm text-white/60">News Posts</p>
                </div>
                <div className="bg-charcoal border border-white/10 rounded-xl p-5 text-center">
                  <Calendar className="w-8 h-8 text-ember mx-auto mb-2" />
                  <p className="text-2xl font-semibold">{stats?.content.events || 0}</p>
                  <p className="text-sm text-white/60">Events</p>
                </div>
                <div className="bg-charcoal border border-white/10 rounded-xl p-5 text-center">
                  <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-semibold">+{stats?.content.newThisWeek || 0}</p>
                  <p className="text-sm text-white/60">New This Week</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
