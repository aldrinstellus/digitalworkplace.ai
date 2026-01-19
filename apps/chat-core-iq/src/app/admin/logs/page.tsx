"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Pagination } from "@/components/ui/pagination";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
  User,
  Bot,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Globe,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  MinusCircle,
} from "lucide-react";
import { apiUrl } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface Conversation {
  id: string;
  sessionId: string;
  messages: Message[];
  language: string;
  sentiment: string;
  escalated: boolean;
  feedbackGiven?: boolean;
  feedbackRating?: 'positive' | 'negative' | null;
  startTime: string;
  endTime?: string;
}

// Animated counter component
function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
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
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

type SortDirection = "asc" | "desc" | null;
type SortKey = "sessionId" | "language" | "sentiment" | "feedbackGiven" | "startTime" | "messages" | "";

export default function ConversationLogs() {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterLanguage, setFilterLanguage] = useState<string>("all");
  const [filterSentiment, setFilterSentiment] = useState<string>("all");
  const [filterFeedback, setFilterFeedback] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("startTime");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") { setSortKey(""); setSortDirection(null); }
      else setSortDirection("asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />;
    if (sortDirection === "asc") return <ArrowUp className="h-3.5 w-3.5 text-[#000080]" />;
    if (sortDirection === "desc") return <ArrowDown className="h-3.5 w-3.5 text-[#000080]" />;
    return <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />;
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(apiUrl("/api/log"));
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations || []);
        }
      } catch (error) {
        console.error("Failed to fetch:", error);
        // Demo data only used if API fails
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = conv.messages.some((msg) => msg.content.toLowerCase().includes(search));
      if (!matchesSearch) return false;
    }
    if (filterLanguage !== "all" && conv.language !== filterLanguage) return false;
    if (filterSentiment !== "all" && conv.sentiment !== filterSentiment) return false;
    if (filterFeedback !== "all") {
      if (filterFeedback === "positive" && conv.feedbackRating !== "positive") return false;
      if (filterFeedback === "negative" && conv.feedbackRating !== "negative") return false;
      if (filterFeedback === "none" && conv.feedbackGiven) return false;
    }
    return true;
  });

  const sortedConversations = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredConversations;

    return [...filteredConversations].sort((a, b) => {
      let aVal: string | number | boolean;
      let bVal: string | number | boolean;

      switch (sortKey) {
        case "sessionId":
          aVal = a.sessionId;
          bVal = b.sessionId;
          break;
        case "language":
          aVal = a.language;
          bVal = b.language;
          break;
        case "sentiment":
          aVal = a.sentiment;
          bVal = b.sentiment;
          break;
        case "feedbackGiven":
          aVal = a.feedbackGiven ? 1 : 0;
          bVal = b.feedbackGiven ? 1 : 0;
          break;
        case "startTime":
          aVal = new Date(a.startTime).getTime();
          bVal = new Date(b.startTime).getTime();
          break;
        case "messages":
          aVal = a.messages.length;
          bVal = b.messages.length;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredConversations, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedConversations.length / itemsPerPage);
  const paginatedConversations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedConversations.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedConversations, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLanguage, filterSentiment, filterFeedback]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setExpandedId(null);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setExpandedId(null);
  }, []);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(filteredConversations, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conversations-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    // CSV headers
    const headers = ["ID", "Session ID", "Language", "Sentiment", "Escalated", "Feedback Given", "Start Time", "End Time", "Message Count", "First User Message"];

    // Map conversations to CSV rows
    const rows = filteredConversations.map((conv) => [
      conv.id,
      conv.sessionId,
      conv.language,
      conv.sentiment,
      conv.escalated ? "Yes" : "No",
      conv.feedbackGiven ? "Yes" : "No",
      new Date(conv.startTime).toLocaleString(),
      conv.endTime ? new Date(conv.endTime).toLocaleString() : "N/A",
      conv.messages.length,
      // Get first user message, escape quotes
      conv.messages.find((m) => m.role === "user")?.content.replace(/"/g, '""').slice(0, 200) || "",
    ]);

    // Convert to CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conversations-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSentimentStyles = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return {
          bg: "bg-gradient-to-r from-green-50 to-emerald-50",
          text: "text-green-700",
          border: "border-green-100",
          icon: TrendingUp,
        };
      case "negative":
        return {
          bg: "bg-gradient-to-r from-red-50 to-rose-50",
          text: "text-red-600",
          border: "border-red-100",
          icon: TrendingDown,
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-50 to-slate-50",
          text: "text-[#666666]",
          border: "border-gray-200",
          icon: Minus,
        };
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return { date: "—", time: "—" };
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { date: "—", time: "—" };
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    };
  };

  const calculateDuration = (startTime: string, endTime?: string) => {
    if (!startTime || !endTime) return "—";
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    if (isNaN(start) || isNaN(end)) return "—";
    const seconds = Math.floor((end - start) / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const stats = {
    total: filteredConversations.length,
    positive: filteredConversations.filter((c) => c.sentiment === "positive").length,
    negative: filteredConversations.filter((c) => c.sentiment === "negative").length,
    thumbsUp: filteredConversations.filter((c) => c.feedbackRating === "positive").length,
    thumbsDown: filteredConversations.filter((c) => c.feedbackRating === "negative").length,
  };

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
            <h1 className="text-[32px] font-bold text-[#000034] tracking-tight">{t("conversations.title")}</h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <MessageSquare className="h-6 w-6 text-[#1D4F91]" />
            </motion.div>
          </div>
          <p className="text-[#666666] mt-1 text-[15px]">{t("conversations.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportJSON}
            className="h-11 px-5 bg-gradient-to-r from-white to-blue-50/50 border border-[#E7EBF0] text-[#363535] text-sm font-medium rounded-xl hover:shadow-lg hover:border-[#000080]/30 transition-all duration-300 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t("common.exportJSON")}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCSV}
            className="h-11 px-5 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t("common.exportCSV")}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total Shown", value: stats.total, color: "from-blue-500 to-blue-600", icon: MessageSquare },
          { label: "Positive Sentiment", value: stats.positive, color: "from-emerald-500 to-emerald-600", icon: TrendingUp },
          { label: "Negative Sentiment", value: stats.negative, color: "from-red-500 to-red-600", icon: TrendingDown },
          { label: "Helpful (👍)", value: stats.thumbsUp, color: "from-green-500 to-green-600", icon: ThumbsUp },
          { label: "Not Helpful (👎)", value: stats.thumbsDown, color: "from-orange-500 to-orange-600", icon: ThumbsDown },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl border border-[#E7EBF0] p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#000034]">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-xs text-[#666666]">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-[#E7EBF0] p-4 mb-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
            <input
              type="text"
              placeholder={t("conversations.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white border border-[#E7EBF0] rounded-xl text-sm text-[#363535] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 focus:shadow-[0_0_0_4px_rgba(0,0,128,0.05)] transition-all duration-200"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`h-11 px-5 border rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              showFilters
                ? "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white border-transparent shadow-lg shadow-[#000080]/25"
                : "bg-white text-[#363535] border-[#E7EBF0] hover:bg-gray-50 hover:border-[#000080]/30"
            }`}
          >
            <Filter className="h-4 w-4" />
            {t("common.filters")}
            <motion.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-[#E7EBF0]">
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide">Language</label>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 cursor-pointer transition-all duration-200"
                  >
                    <option value="all">All Languages</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide">Sentiment</label>
                  <select
                    value={filterSentiment}
                    onChange={(e) => setFilterSentiment(e.target.value)}
                    className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 cursor-pointer transition-all duration-200"
                  >
                    <option value="all">All Sentiments</option>
                    <option value="positive">Positive</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Negative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide">Feedback</label>
                  <select
                    value={filterFeedback}
                    onChange={(e) => setFilterFeedback(e.target.value)}
                    className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 cursor-pointer transition-all duration-200"
                  >
                    <option value="all">All Feedback</option>
                    <option value="positive">👍 Helpful</option>
                    <option value="negative">👎 Not Helpful</option>
                    <option value="none">No Rating</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Conversations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="p-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="h-8 w-8 text-[#000080] mx-auto mb-3" />
            </motion.div>
            <p className="text-[#666666] text-sm">{t("conversations.loading")}</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-[#E7EBF0]" />
              <p className="text-[#666666] text-sm">
                {searchTerm || filterLanguage !== "all" || filterSentiment !== "all" || filterFeedback !== "all"
                  ? t("conversations.noMatch")
                  : t("conversations.noConversations")}
              </p>
            </motion.div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E7EBF0]">
                <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 w-8"></th>
                <th
                  className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("sessionId")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Session</span>
                    <SortIcon columnKey="sessionId" />
                  </div>
                </th>
                <th
                  className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 w-24 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("language")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Language</span>
                    <SortIcon columnKey="language" />
                  </div>
                </th>
                <th
                  className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 w-28 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("sentiment")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Sentiment</span>
                    <SortIcon columnKey="sentiment" />
                  </div>
                </th>
                <th
                  className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 w-24 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("feedbackGiven")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Feedback</span>
                    <SortIcon columnKey="feedbackGiven" />
                  </div>
                </th>
                <th
                  className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 w-24 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("messages")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Duration</span>
                    <SortIcon columnKey="messages" />
                  </div>
                </th>
                <th
                  className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 w-40 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("startTime")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <SortIcon columnKey="startTime" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EBF0]">
              {paginatedConversations.map((conv, idx) => {
                const sentimentStyles = getSentimentStyles(conv.sentiment);
                const SentimentIcon = sentimentStyles.icon;
                return (
                  <React.Fragment key={conv.id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`cursor-pointer transition-all duration-200 ${
                        idx % 2 === 0 ? "bg-white" : "bg-[#F5F9FD]/50"
                      } hover:bg-blue-50/50`}
                      onClick={() => setExpandedId(expandedId === conv.id ? null : conv.id)}
                    >
                      <td className="px-6 py-4">
                        <motion.div
                          animate={{ rotate: expandedId === conv.id ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4 text-[#666666]" />
                        </motion.div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {conv.escalated && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <AlertTriangle className="h-4 w-4 text-amber-700" />
                            </motion.div>
                          )}
                          <span className="text-sm font-medium text-[#000034]">
                            {conv.sessionId.slice(0, 12)}...
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-[#666666]">
                          <Globe className="h-4 w-4" />
                          {conv.language.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg capitalize font-medium border ${sentimentStyles.bg} ${sentimentStyles.text} ${sentimentStyles.border}`}
                        >
                          <SentimentIcon className="h-3 w-3" />
                          {conv.sentiment}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {conv.feedbackGiven ? (
                          conv.feedbackRating === 'positive' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border bg-green-50 text-green-700 border-green-200">
                              <ThumbsUp className="h-3 w-3" />
                              Helpful
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border bg-red-50 text-red-600 border-red-200">
                              <ThumbsDown className="h-3 w-3" />
                              Not Helpful
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border bg-gray-50 text-gray-500 border-gray-200">
                            <MinusCircle className="h-3 w-3" />
                            No Rating
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[#000034]">{calculateDuration(conv.startTime, conv.endTime)}</p>
                        <p className="text-xs text-gray-500">{conv.messages.length} messages</p>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const formatted = formatDate(conv.startTime);
                          return (
                            <>
                              <p className="text-sm text-[#666666]">{formatted.date}</p>
                              <p className="text-xs text-gray-500">{formatted.time}</p>
                            </>
                          );
                        })()}
                      </td>
                    </motion.tr>

                    <AnimatePresence>
                      {expandedId === conv.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={7} className="bg-gradient-to-b from-[#F5F9FD] to-white px-6 py-5 border-t border-[#E7EBF0]">
                            <div className="space-y-4 max-w-3xl">
                              {conv.messages.map((msg, msgIdx) => (
                                <motion.div
                                  key={msgIdx}
                                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: msgIdx * 0.1 }}
                                  className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                                      msg.role === "assistant"
                                        ? "bg-gradient-to-br from-[#000080] to-[#1D4F91] text-white"
                                        : "bg-gradient-to-br from-[#E7EBF0] to-gray-200 text-[#666666]"
                                    }`}
                                  >
                                    {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                  </motion.div>
                                  <div
                                    className={`flex-1 p-4 rounded-xl text-sm shadow-sm ${
                                      msg.role === "assistant"
                                        ? "bg-white border border-[#E7EBF0] text-[#363535]"
                                        : "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white"
                                    }`}
                                  >
                                    {msg.content}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                            <p className="text-xs text-[#6b6b6b] mt-5 pt-4 border-t border-[#E7EBF0] flex items-center gap-2">
                              <Sparkles className="h-3 w-3" />
                              Session ID: {conv.sessionId}
                            </p>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && sortedConversations.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedConversations.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </motion.div>
    </div>
  );
}
