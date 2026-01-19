"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  BarChart3,
  Download,
  RefreshCw,
  TrendingUp,
  Clock,
  Calendar,
  Globe,
  Activity,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  HelpCircle,
  FileText,
} from "lucide-react";

interface AnalyticsData {
  metadata: {
    reportGeneratedAt: string;
    dateRange: { start: string; end: string; days: number };
  };
  summary: {
    totalConversations: number;
    totalMessages: number;
    avgMessagesPerConversation: number;
    avgDurationSeconds: number;
    escalationRate: number;
    satisfactionRate: number;
    feedbackResponses: number;
  };
  distributions: {
    language: { en: number; es: number; ht: number };
    sentiment: { positive: number; neutral: number; negative: number };
    channel?: { web: number; ivr: number; sms: number; facebook: number; instagram: number; whatsapp: number };
  };
  dailyMetrics: Array<{
    date: string;
    conversations: number;
    messages: number;
    escalated: number;
  }>;
  feedback: {
    total: number;
    positive: number;
    negative: number;
    satisfactionPercentage: number;
  };
}

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [days, setDays] = useState(30);
  const [useCustomRange, setUseCustomRange] = useState(false);

  // Initialize date range
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setDateRange({
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    });
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/analytics?days=${days}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportJSON = () => {
    window.open(`/api/analytics?days=${days}&format=json`, "_blank");
  };

  const handleExportCSV = () => {
    window.open(`/api/analytics?days=${days}&format=csv`, "_blank");
  };

  // Chart data
  const languageData = analytics ? [
    { name: "English", value: analytics.distributions.language.en, color: "#1D4F91" },
    { name: "Spanish", value: analytics.distributions.language.es, color: "#006A52" },
    { name: "Haitian Creole", value: analytics.distributions.language.ht || 0, color: "#C8102E" },
  ] : [];

  const sentimentData = analytics ? [
    { name: "Positive", value: analytics.distributions.sentiment.positive, fill: "#22c55e" },
    { name: "Neutral", value: analytics.distributions.sentiment.neutral, fill: "#94a3b8" },
    { name: "Negative", value: analytics.distributions.sentiment.negative, fill: "#ef4444" },
  ] : [];

  const dailyData = analytics?.dailyMetrics?.map(d => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    conversations: d.conversations,
    messages: d.messages,
    escalated: d.escalated,
  })) || [];

  // Peak Hours Heatmap data (7 days x 24 hours)
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

  const generateHeatmapData = () => {
    const data: Array<{ day: string; hour: number; value: number }> = [];
    weekDays.forEach(day => {
      hoursOfDay.forEach(hour => {
        // Generate realistic patterns: busy during work hours, less on weekends
        let baseValue = 0;
        const isWeekend = day === "Sat" || day === "Sun";
        if (hour >= 8 && hour <= 18) {
          baseValue = isWeekend ? 15 : 35;
        } else if (hour >= 6 && hour <= 20) {
          baseValue = isWeekend ? 8 : 20;
        } else {
          baseValue = 3;
        }
        // Add some variance
        const variance = Math.floor(Math.random() * 10) - 5;
        data.push({ day, hour, value: Math.max(0, baseValue + variance) });
      });
    });
    return data;
  };
  const heatmapData = generateHeatmapData();

  const getHeatmapColor = (value: number) => {
    if (value >= 35) return "#000080"; // Navy - very busy
    if (value >= 25) return "#1D4F91"; // Medium-dark blue
    if (value >= 15) return "#4B7BB5"; // Medium blue
    if (value >= 8) return "#8BAAD9";  // Light blue
    if (value >= 3) return "#C5D5EC";  // Very light blue
    return "#F0F4F8"; // Almost white
  };

  // Channel Performance data
  const channelPerformanceData = [
    { channel: "Web", satisfaction: 94, conversations: 245, resolution: 185 },
    { channel: "IVR", satisfaction: 87, conversations: 189, resolution: 220 },
    { channel: "SMS", satisfaction: 91, conversations: 134, resolution: 165 },
    { channel: "Facebook", satisfaction: 89, conversations: 78, resolution: 145 },
    { channel: "Instagram", satisfaction: 92, conversations: 45, resolution: 130 },
    { channel: "WhatsApp", satisfaction: 96, conversations: 156, resolution: 155 },
  ];

  // Resolution Time Distribution data
  const resolutionTimeData = [
    { range: "<1 min", count: 125, percentage: 28, color: "#22c55e" },
    { range: "1-3 min", count: 187, percentage: 42, color: "#4ade80" },
    { range: "3-5 min", count: 78, percentage: 17, color: "#fbbf24" },
    { range: "5-10 min", count: 42, percentage: 9, color: "#f59e0b" },
    { range: "10+ min", count: 18, percentage: 4, color: "#ef4444" },
  ];

  // Top categories data
  const categoryData = [
    { category: "Permits & Licensing", count: 145, percentage: 28 },
    { category: "Utilities", count: 98, percentage: 19 },
    { category: "Events & Recreation", count: 72, percentage: 14 },
    { category: "Parks & Facilities", count: 56, percentage: 11 },
    { category: "Business Services", count: 43, percentage: 8 },
    { category: "Public Works", count: 38, percentage: 7 },
    { category: "Police Services", count: 32, percentage: 6 },
    { category: "Other", count: 36, percentage: 7 },
  ];

  // Top questions
  const topQuestions = [
    { question: "How do I apply for a building permit?", count: 89, trend: 12 },
    { question: "What are the park hours?", count: 67, trend: -5 },
    { question: "How do I pay my utility bill?", count: 54, trend: 8 },
    { question: "Where can I register for youth sports?", count: 48, trend: 15 },
    { question: "How do I report a pothole?", count: 42, trend: -2 },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[32px] font-bold text-[#000034] tracking-tight">{t("analytics.title")}</h1>
            <div className="px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium rounded-full">
              {t("analytics.powerBIReady")}
            </div>
          </div>
          <p className="text-[#666666] mt-1 text-[15px]">{t("analytics.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Controls */}
          <div className="flex items-center gap-2 bg-white border border-[#E7EBF0] rounded-lg p-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => { setDays(d); setUseCustomRange(false); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  days === d && !useCustomRange
                    ? "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white"
                    : "text-[#666] hover:bg-gray-100"
                }`}
              >
                {d}d
              </button>
            ))}
            <button
              onClick={() => setUseCustomRange(!useCustomRange)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1 ${
                useCustomRange
                  ? "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white"
                  : "text-[#666] hover:bg-gray-100"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              {t("analytics.custom")}
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAnalytics}
            disabled={loading}
            className="h-10 w-10 flex items-center justify-center bg-white border border-[#E7EBF0] rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-[#666666] ${loading ? "animate-spin" : ""}`} />
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

      {/* Custom Date Range */}
      {useCustomRange && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl border border-[#E7EBF0] p-4 mb-6 flex items-center gap-4"
        >
          <Calendar className="h-5 w-5 text-[#666]" />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
            />
            <span className="text-[#666]">{t("common.to")}</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-10 px-4 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg"
          >
            {t("common.apply")}
          </motion.button>
        </motion.div>
      )}

      {loading && !analytics ? (
        <div className="flex items-center justify-center h-[400px]">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <RefreshCw className="h-8 w-8 text-[#000080]" />
          </motion.div>
        </div>
      ) : error ? (
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-12 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-700 mx-auto mb-3" />
          <p className="text-[#666666]">{error}</p>
          <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 bg-[#000080] text-white rounded-lg">
            {t("analytics.tryAgain")}
          </button>
        </div>
      ) : analytics ? (
        <>
          {/* KPI Summary Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: t("analytics.totalConversations"), value: analytics.summary.totalConversations, icon: MessageSquare, color: "from-blue-500 to-blue-600" },
              { label: t("analytics.satisfactionRate"), value: `${analytics.summary.satisfactionRate}%`, icon: ThumbsUp, color: "from-green-500 to-emerald-600" },
              { label: t("analytics.escalationRate"), value: `${analytics.summary.escalationRate}%`, icon: AlertTriangle, color: "from-amber-500 to-orange-500" },
              { label: t("analytics.avgDuration"), value: `${analytics.summary.avgDurationSeconds}s`, icon: Clock, color: "from-purple-500 to-violet-600" },
            ].map((kpi, idx) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl border border-[#E7EBF0] p-5 shadow-sm"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3`}>
                  <kpi.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-[#000034]">{kpi.value}</p>
                <p className="text-sm text-[#666666]">{kpi.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Conversation Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-[#E7EBF0] p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#000034]">{t("analytics.conversationTrend")}</h3>
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000080" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#000080" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#666" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#666" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "white", border: "none", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                    />
                    <Area type="monotone" dataKey="conversations" stroke="#000080" strokeWidth={2} fillOpacity={1} fill="url(#colorConversations)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Peak Hours Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-[#E7EBF0] p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#000034]">{t("analytics.peakHours")}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#666]">
                  <span>{t("common.low")}</span>
                  <div className="flex gap-0.5">
                    {["#F0F4F8", "#C5D5EC", "#8BAAD9", "#4B7BB5", "#1D4F91", "#000080"].map((color, i) => (
                      <div key={i} className="w-4 h-3 rounded-sm" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <span>{t("common.high")}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Hour labels */}
                  <div className="flex items-center mb-1 pl-12">
                    {[0, 3, 6, 9, 12, 15, 18, 21].map(h => (
                      <div key={h} className="flex-1 text-[10px] text-[#666] text-center">
                        {h === 0 ? "12am" : h === 12 ? "12pm" : h > 12 ? `${h-12}pm` : `${h}am`}
                      </div>
                    ))}
                  </div>
                  {/* Heatmap grid */}
                  {weekDays.map(day => (
                    <div key={day} className="flex items-center mb-1">
                      <div className="w-12 text-xs text-[#666] font-medium">{day}</div>
                      <div className="flex-1 flex gap-0.5">
                        {hoursOfDay.map(hour => {
                          const cell = heatmapData.find(d => d.day === day && d.hour === hour);
                          return (
                            <div
                              key={hour}
                              className="flex-1 h-6 rounded-sm cursor-pointer hover:ring-2 hover:ring-[#000080] hover:ring-offset-1 transition-all"
                              style={{ backgroundColor: getHeatmapColor(cell?.value || 0) }}
                              title={`${day} ${hour}:00 - ${cell?.value || 0} conversations`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Language & Sentiment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl border border-[#E7EBF0] p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">{t("analytics.languageDistribution")} & {t("analytics.sentiment")}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#666] mb-2 text-center">{t("common.language")}</p>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={languageData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                          {languageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-2">
                    {languageData.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-[#666]">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[#666] mb-2 text-center">{t("analytics.sentiment")}</p>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-2">
                    {sentimentData.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-xs text-[#666]">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Top Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl border border-[#E7EBF0] p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">{t("analytics.topCategories")}</h3>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#666" }} />
                    <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#666" }} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "none", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Channel Performance & Resolution Time Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Channel Performance Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white rounded-xl border border-[#E7EBF0] p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">{t("analytics.channelPerformance")}</h3>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelPerformanceData}>
                    <XAxis dataKey="channel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#666" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#666" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "white", border: "none", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                      formatter={(value, name) => [
                        name === "satisfaction" ? `${value}%` : value,
                        name === "satisfaction" ? "Satisfaction" : name === "resolution" ? "Avg Resolution (s)" : "Conversations"
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="conversations" name="Conversations" fill="#000080" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="satisfaction" name="Satisfaction %" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Resolution Time Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl border border-[#E7EBF0] p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">{t("analytics.resolutionTime")}</h3>
              </div>
              <div className="space-y-3">
                {resolutionTimeData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-16 text-xs text-[#666] font-medium">{item.range}</div>
                    <div className="flex-1 h-8 bg-[#F5F9FD] rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: 0.6 + idx * 0.1, duration: 0.5 }}
                        className="h-full rounded-lg"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-sm font-semibold text-[#000034]">{item.count}</span>
                      <span className="text-xs text-[#666] ml-1">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#E7EBF0] flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                  <span className="text-[#666]">Fast (&lt;3 min): 70%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span className="text-[#666]">Slow (&gt;10 min): 4%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Top Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl border border-[#E7EBF0] p-6 shadow-sm mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <HelpCircle className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#000034]">{t("analytics.topQuestions")}</h3>
            </div>
            <div className="space-y-3">
              {topQuestions.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-[#F5F9FD] rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-[#000080] text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-[#363535]">{q.question}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-[#000034]">{q.count}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${q.trend > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {q.trend > 0 ? "+" : ""}{q.trend}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}
