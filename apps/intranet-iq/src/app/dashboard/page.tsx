"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import { useState, useCallback, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Search, Sparkles, Clock, TrendingUp, FileText, Users, Calendar,
  MessageSquare, Newspaper, Bell, ChevronRight, ListTodo, GripVertical,
  Layout, ChevronDown, X, CheckCircle2, Circle, AlertCircle, Bot,
  ArrowRight, ExternalLink, Flame, Zap, Star, Bookmark, Target, BarChart3,
  CloudSun, Megaphone, Gift, Vote
} from "lucide-react";
import { useDashboardWidgets, DashboardWidget, LAYOUT_PRESETS, LayoutPresetKey } from "@/lib/hooks/useDashboardWidgets";
import { mockNewsPosts, mockEvents, mockRecentActivity, type MockNewsPost, type MockEvent, type MockActivity } from "@/lib/mockData";
import Link from "next/link";
import { MeetingCard } from "@/components/dashboard/MeetingCard";
import { AppShortcutsBar } from "@/components/dashboard/AppShortcutsBar";
import { DashboardCustomizer, DashboardCustomizeButton } from "@/components/dashboard/DashboardCustomizer";
import { EditLayoutButton } from "@/components/dashboard/DraggableWidget";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/lib/motion";
import { ListItemSkeleton } from "@/components/ui/Skeleton";

// Connection status type for real-time indicator
type ConnectionStatus = "connected" | "stale" | "disconnected";

// Mock data for full-depth previews
const mockTasks = [
  { id: 1, title: "Review Q4 budget proposal", priority: "high", due: "Today", status: "pending" },
  { id: 2, title: "Prepare team standup notes", priority: "medium", due: "Today", status: "pending" },
  { id: 3, title: "Update project documentation", priority: "low", due: "Tomorrow", status: "in-progress" },
  { id: 4, title: "Schedule 1:1 with Sarah", priority: "medium", due: "This week", status: "pending" },
  { id: 5, title: "Complete security training", priority: "high", due: "Jan 31", status: "pending" },
];

const mockRecentDocs = [
  { id: 1, title: "Q4 Planning Document", type: "document", updated: "2 hours ago", author: "Sarah Chen", href: "/content/1" },
  { id: 2, title: "Engineering Roadmap 2026", type: "spreadsheet", updated: "4 hours ago", author: "Mike Johnson", href: "/content/2" },
  { id: 3, title: "Product Launch Checklist", type: "document", updated: "Yesterday", author: "Alex Kim", href: "/content/3" },
  { id: 4, title: "Team Budget Report", type: "spreadsheet", updated: "Yesterday", author: "Lisa Park", href: "/content/4" },
  { id: 5, title: "Design System v3.0", type: "presentation", updated: "2 days ago", author: "James Wilson", href: "/content/5" },
];

const mockTeamUpdates = [
  { id: 1, title: "New hire: Welcome Emma to Engineering!", type: "announcement", time: "1 hour ago", reactions: 24, href: "/news/2" },
  { id: 2, title: "Office closed Monday for holiday", type: "notice", time: "3 hours ago", reactions: 12, href: "/news/6" },
  { id: 3, title: "Q4 goals published - check them out!", type: "announcement", time: "Yesterday", reactions: 45, href: "/news/1" },
  { id: 4, title: "New coffee machine in break room ☕", type: "casual", time: "Yesterday", reactions: 67, href: "/news/5" },
];

const mockAISuggestions = [
  { id: 1, title: "Draft reply to client email", description: "You have an unread email from Acme Corp waiting for response", icon: "email" },
  { id: 2, title: "Summarize meeting notes", description: "Yesterday's product sync has notes that need summarizing", icon: "summary" },
  { id: 3, title: "Prepare weekly report", description: "Your weekly report is due in 2 days", icon: "report" },
];

// Mock data for new widgets
const mockCalendarEvents = [
  { id: 1, title: "Team Standup", time: "9:00 AM", type: "meeting" },
  { id: 2, title: "1:1 with Sarah", time: "11:00 AM", type: "meeting" },
  { id: 3, title: "Lunch & Learn", time: "12:30 PM", type: "event" },
  { id: 4, title: "Sprint Planning", time: "2:00 PM", type: "meeting" },
  { id: 5, title: "Code Review", time: "4:00 PM", type: "task" },
];

const mockBookmarks = [
  { id: 1, title: "HR Portal", url: "/settings", icon: "users" },
  { id: 2, title: "Expense Reports", url: "/content", icon: "receipt" },
  { id: 3, title: "IT Help Desk", url: "/chat", icon: "headset" },
  { id: 4, title: "Company Wiki", url: "/content", icon: "book" },
];

const mockGoals = [
  { id: 1, title: "Complete Q1 OKRs", progress: 75, status: "on-track" },
  { id: 2, title: "Launch v2.0 features", progress: 45, status: "at-risk" },
  { id: 3, title: "Improve NPS score", progress: 90, status: "ahead" },
];

const mockTeamMembers = [
  { id: 1, name: "Sarah Chen", role: "Engineering Manager", avatar: "SC", status: "online" },
  { id: 2, name: "Mike Johnson", role: "Senior Developer", avatar: "MJ", status: "away" },
  { id: 3, name: "Emily Rodriguez", role: "Product Designer", avatar: "ER", status: "online" },
  { id: 4, name: "Alex Kim", role: "Data Analyst", avatar: "AK", status: "offline" },
];

const mockAnnouncements = [
  { id: 1, title: "Office Closure - President's Day", date: "Feb 17", priority: "high" },
  { id: 2, title: "Benefits Enrollment Deadline", date: "Feb 28", priority: "medium" },
  { id: 3, title: "Q1 Town Hall Meeting", date: "Mar 5", priority: "normal" },
];

const mockPolls = [
  { id: 1, title: "Best day for team lunch?", votes: 24, options: 4, expires: "2 days" },
  { id: 2, title: "Preferred meeting time", votes: 18, options: 3, expires: "5 days" },
];

const mockBirthdays = [
  { id: 1, name: "Sarah Chen", type: "birthday", date: "Today" },
  { id: 2, name: "Mike Johnson", type: "anniversary", years: 3, date: "Tomorrow" },
  { id: 3, name: "Emily Rodriguez", type: "birthday", date: "Feb 3" },
];

const mockPerformance = [
  { id: 1, metric: "Tasks Completed", value: 24, trend: "+12%" },
  { id: 2, metric: "Response Time", value: "2.4h", trend: "-18%" },
  { id: 3, metric: "Satisfaction Score", value: "4.8", trend: "+5%" },
];

const mockWeather = {
  temp: 72,
  condition: "Sunny",
  high: 78,
  low: 62,
  location: "San Francisco, CA"
};

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { organization } = useOrganization();
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);
  const [hoveredPreset, setHoveredPreset] = useState<LayoutPresetKey | null>(null);
  const presetDropdownRef = useRef<HTMLDivElement>(null);

  // Expanded card states
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Real-time connection status
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connected");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isPulsing, setIsPulsing] = useState(false);

  const { widgets, visibleWidgets, reorderWidgets, applyPreset, toggleWidget, currentPreset } = useDashboardWidgets();

  // Helper to check if a widget type is visible
  const isWidgetVisible = (widgetType: string) => {
    return visibleWidgets.some(w => w.type === widgetType);
  };

  // Close preset dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(event.target as Node)) {
        setIsPresetDropdownOpen(false);
        setHoveredPreset(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simulate real-time data updates and connection status
  useEffect(() => {
    setConnectionStatus("connected");
    const updateInterval = setInterval(() => {
      setLastUpdated(new Date());
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, 30000);

    const checkConnection = () => {
      if (!navigator.onLine) {
        setConnectionStatus("disconnected");
      } else {
        const now = new Date();
        const timeDiff = now.getTime() - lastUpdated.getTime();
        if (timeDiff > 60000) {
          setConnectionStatus("stale");
        } else {
          setConnectionStatus("connected");
        }
      }
    };

    const connectionInterval = setInterval(checkConnection, 5000);
    const handleOnline = () => setConnectionStatus("connected");
    const handleOffline = () => setConnectionStatus("disconnected");
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(updateInterval);
      clearInterval(connectionInterval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [lastUpdated]);

  const getTimeSinceUpdate = () => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    if (diffSeconds < 5) return "Just now";
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ago`;
  };

  const handlePresetSelect = (presetKey: LayoutPresetKey) => {
    applyPreset(presetKey);
    setIsPresetDropdownOpen(false);
    setHoveredPreset(null);
  };

  const organizationName = organization?.name || "Your Organization";

  const getDisplayName = (): string | null => {
    if (!isLoaded) return null;
    if (!user) return null;
    if (user.firstName) return user.firstName;
    if (user.fullName) return user.fullName.split(" ")[0];
    if (user.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress.split("@")[0];
    }
    return null;
  };

  const userName = getDisplayName();
  const greeting = userName
    ? `Hello there`
    : "Hello there";

  // Use mock data for news, events, and activity to ensure consistent IDs
  const newsPosts = mockNewsPosts.slice(0, 5);
  const postsLoading = false;
  const events = mockEvents.slice(0, 3);
  const eventsLoading = false;
  const activities = mockRecentActivity.slice(0, 5);
  const activitiesLoading = false;

  // Trending topics - linked to actual content
  const trendingTopics = [
    { name: "AI Strategy", count: 156, trending: true, link: "/news/4", description: "AI Assistant 3.0 Launch" },
    { name: "Q4 Results", count: 89, trending: true, link: "/news/1", description: "Record-Breaking Performance" },
    { name: "New Hires", count: 67, trending: false, link: "/news/2", description: "17 New Engineers" },
    { name: "Product Launch", count: 54, trending: true, link: "/news/4", description: "AI Assistant 3.0" },
    { name: "Remote Work", count: 43, trending: false, link: "/news/3", description: "Updated Policy" },
  ];

  // Drag handlers
  const handleDragStart = useCallback((widgetId: string) => {
    setDraggedWidgetId(widgetId);
  }, []);

  const handleDragOver = useCallback((targetId: string) => {
    if (targetId !== draggedWidgetId) {
      setDropTargetId(targetId);
    }
  }, [draggedWidgetId]);

  const handleDrop = useCallback((targetId: string) => {
    if (draggedWidgetId && draggedWidgetId !== targetId) {
      reorderWidgets(draggedWidgetId, targetId);
    }
    setDraggedWidgetId(null);
    setDropTargetId(null);
  }, [draggedWidgetId, reorderWidgets]);

  const handleDragEnd = useCallback(() => {
    setDraggedWidgetId(null);
    setDropTargetId(null);
  }, []);

  return (
    <div className="min-h-dvh bg-[var(--bg-obsidian)]">
      <Sidebar />

      {/* Main Content - Optimized 3-Column Layout */}
      <main className="ml-16 mr-20 min-h-dvh p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Row */}
          <FadeIn delay={0}>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-medium text-[var(--text-primary)]">
                    {greeting}
                  </h1>
                  {/* Real-Time Update Indicator */}
                  <div className="relative group">
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-[var(--bg-charcoal)] border border-[var(--border-subtle)]">
                      <span className="relative flex h-2 w-2">
                        {connectionStatus === "connected" && isPulsing && (
                          <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        )}
                        <span className={`relative rounded-full h-2 w-2 ${
                          connectionStatus === "connected" ? "bg-emerald-500"
                            : connectionStatus === "stale" ? "bg-yellow-500"
                            : "bg-red-500"
                        }`} />
                      </span>
                      <span className="text-xs text-white/50">Live</span>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap">
                      <div className="text-xs text-[var(--text-primary)]">
                        {connectionStatus === "connected" && "Connected - Real-time updates active"}
                        {connectionStatus === "stale" && "Connection stale - Attempting to reconnect"}
                        {connectionStatus === "disconnected" && "Disconnected - Check your connection"}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        Last updated: {getTimeSinceUpdate()}
                      </div>
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--bg-charcoal)] border-l border-t border-[var(--border-subtle)] rotate-45" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <span className="text-[var(--accent-ember)]">For you</span>
                  <span>|</span>
                  <span>{organizationName}</span>
                  <span>|</span>
                  <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Layout Presets Dropdown */}
                <div className="relative" ref={presetDropdownRef}>
                  <button
                    onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      currentPreset === "custom"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:border-purple-500/50"
                        : "bg-[var(--bg-charcoal)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--accent-ember)]/30 hover:text-[var(--accent-ember)]"
                    }`}
                  >
                    <Layout className="w-4 h-4" />
                    <span>{currentPreset === "custom" ? "Custom" : LAYOUT_PRESETS.find(p => p.key === currentPreset)?.name || "Presets"}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isPresetDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isPresetDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-2">
                          <div className="text-xs text-[var(--text-muted)] px-3 py-2 uppercase tracking-wider">
                            Layout Presets
                          </div>

                          {/* Custom indicator when active */}
                          {currentPreset === "custom" && (
                            <div className="mx-2 mb-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-purple-400">Custom Layout</span>
                                <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                                  Active
                                </span>
                              </div>
                              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                {visibleWidgets.length} widgets • Select a preset to change
                              </p>
                            </div>
                          )}

                          {LAYOUT_PRESETS.map((preset) => (
                            <button
                              key={preset.key}
                              onClick={() => handlePresetSelect(preset.key)}
                              onMouseEnter={() => setHoveredPreset(preset.key)}
                              onMouseLeave={() => setHoveredPreset(null)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${
                                currentPreset === preset.key
                                  ? 'bg-[var(--accent-ember)]/10 border border-[var(--accent-ember)]/30'
                                  : 'hover:bg-[var(--bg-slate)]'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-sm transition-colors ${
                                  currentPreset === preset.key
                                    ? 'text-[var(--accent-ember)]'
                                    : 'text-[var(--text-primary)] group-hover:text-[var(--accent-ember)]'
                                }`}>
                                  {preset.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  {currentPreset === preset.key && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]">
                                      Active
                                    </span>
                                  )}
                                  {preset.key === "default" && currentPreset !== preset.key && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent-ember)]/10 text-[var(--accent-ember)]">
                                      Recommended
                                    </span>
                                  )}
                                  <span className="text-xs text-[var(--text-muted)]">
                                    {preset.widgetTypes.length} widgets
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                {preset.description}
                              </p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <DashboardCustomizeButton onClick={() => setIsCustomizerOpen(true)} />
              </div>
            </div>
          </FadeIn>

          {/* Search Bar - Full Width */}
          <FadeIn delay={0.1}>
            <Link href="/search">
              <motion.div
                className="relative mb-6"
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
              >
                <div className="bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-2xl p-4 hover:border-[var(--accent-ember)]/50 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-ember)] transition-colors" />
                    <span className="flex-1 text-[var(--text-muted)] text-lg">Ask anything...</span>
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
                      <span className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--accent-ember)]/10 text-[var(--accent-ember)]">
                        <Sparkles className="w-4 h-4" />
                        Fast
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </FadeIn>

          {/* Meeting Card - Full Width */}
          {isWidgetVisible("meeting") && (
            <FadeIn delay={0.15}>
              <div className="mb-6">
                <MeetingCard />
              </div>
            </FadeIn>
          )}

          {/* ===== OPTIMIZED 3-COLUMN GRID LAYOUT ===== */}
          <div className={`grid gap-6 ${
            // Dynamic grid columns based on visible widgets
            (isWidgetVisible("quick-actions") && (isWidgetVisible("news") || isWidgetVisible("events") || isWidgetVisible("trending") || isWidgetVisible("activity")))
              ? 'grid-cols-3'
              : (isWidgetVisible("quick-actions") || isWidgetVisible("news") || isWidgetVisible("events") || isWidgetVisible("trending") || isWidgetVisible("activity"))
                ? 'grid-cols-2'
                : 'grid-cols-1'
          }`}>

            {/* Column 1: Quick Actions + AI Assistant */}
            {isWidgetVisible("quick-actions") && (
            <div className="space-y-6">
              {/* My Tasks Card */}
              <FadeIn delay={0.2}>
                <ExpandableQuickCard
                  icon={<ListTodo className="w-5 h-5" />}
                  title="My Tasks"
                  subtitle="6 due today"
                  color="ember"
                  href="/my-day"
                  isExpanded={expandedCard === "tasks"}
                  onToggle={() => setExpandedCard(expandedCard === "tasks" ? null : "tasks")}
                  expandedContent={
                    <div className="space-y-2 mt-4">
                      {mockTasks.map((task) => (
                        <Link key={task.id} href="/my-day">
                          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                            {task.status === "in-progress" ? (
                              <div className="w-4 h-4 rounded-full border-2 border-[var(--accent-ember)] border-t-transparent animate-spin" />
                            ) : (
                              <Circle className="w-4 h-4 text-[var(--text-muted)]" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[var(--text-primary)] truncate">{task.title}</p>
                              <p className="text-xs text-[var(--text-muted)]">Due: {task.due}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              task.priority === "high" ? "bg-red-500/20 text-red-400" :
                              task.priority === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-blue-500/20 text-blue-400"
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </Link>
                      ))}
                      <Link href="/my-day" className="flex items-center justify-center gap-2 mt-3 py-2 text-sm text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)] transition-colors">
                        View all tasks <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  }
                />
              </FadeIn>

              {/* Recent Documents Card */}
              <FadeIn delay={0.25}>
                <ExpandableQuickCard
                  icon={<FileText className="w-5 h-5" />}
                  title="Recent Documents"
                  subtitle="5 accessed today"
                  color="gold"
                  href="/content?view=recent"
                  isExpanded={expandedCard === "docs"}
                  onToggle={() => setExpandedCard(expandedCard === "docs" ? null : "docs")}
                  expandedContent={
                    <div className="space-y-2 mt-4">
                      {mockRecentDocs.map((doc) => (
                        <Link key={doc.id} href={doc.href}>
                          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${
                              doc.type === "document" ? "bg-blue-500/20 text-blue-400" :
                              doc.type === "spreadsheet" ? "bg-green-500/20 text-green-400" :
                              "bg-orange-500/20 text-orange-400"
                            }`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[var(--text-primary)] truncate">{doc.title}</p>
                              <p className="text-xs text-[var(--text-muted)]">{doc.author} · {doc.updated}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                      <Link href="/content" className="flex items-center justify-center gap-2 mt-3 py-2 text-sm text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)] transition-colors">
                        View all documents <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  }
                />
              </FadeIn>

              {/* AI Assistant Card */}
              <FadeIn delay={0.3}>
                <ExpandableQuickCard
                  icon={<Bot className="w-5 h-5" />}
                  title="AI Assistant"
                  subtitle="3 suggestions"
                  color="ember"
                  href="/chat"
                  isExpanded={expandedCard === "ai"}
                  onToggle={() => setExpandedCard(expandedCard === "ai" ? null : "ai")}
                  expandedContent={
                    <div className="space-y-3 mt-4">
                      {mockAISuggestions.map((suggestion) => (
                        <Link key={suggestion.id} href="/chat">
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--accent-ember)]/5 border border-[var(--accent-ember)]/20 hover:border-[var(--accent-ember)]/40 transition-colors cursor-pointer">
                            <Zap className="w-4 h-4 text-[var(--accent-ember)] mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[var(--text-primary)]">{suggestion.title}</p>
                              <p className="text-xs text-[var(--text-muted)] mt-0.5">{suggestion.description}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                      <Link href="/chat" className="flex items-center justify-center gap-2 py-2 text-sm text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)] transition-colors">
                        Open AI Assistant <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  }
                />
              </FadeIn>
            </div>
            )}

            {/* Column 2: Company News + Team Updates */}
            {isWidgetVisible("news") && (
            <div className="space-y-6">
              {/* Team Updates Card */}
              <FadeIn delay={0.2}>
                <ExpandableQuickCard
                  icon={<Users className="w-5 h-5" />}
                  title="Team Updates"
                  subtitle="4 new updates"
                  color="copper"
                  href="/news"
                  isExpanded={expandedCard === "updates"}
                  onToggle={() => setExpandedCard(expandedCard === "updates" ? null : "updates")}
                  expandedContent={
                    <div className="space-y-2 mt-4">
                      {mockTeamUpdates.map((update) => (
                        <Link key={update.id} href={update.href}>
                          <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                            <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                              update.type === "announcement" ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]" :
                              update.type === "notice" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-blue-500/20 text-blue-400"
                            }`}>
                              {update.type === "announcement" ? <Bell className="w-4 h-4" /> :
                               update.type === "notice" ? <AlertCircle className="w-4 h-4" /> :
                               <MessageSquare className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[var(--text-primary)] line-clamp-2">{update.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-[var(--text-muted)]">{update.time}</span>
                                <span className="text-xs text-[var(--text-muted)]">·</span>
                                <span className="text-xs text-[var(--accent-ember)]">{update.reactions} reactions</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                      <Link href="/news" className="flex items-center justify-center gap-2 mt-3 py-2 text-sm text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)] transition-colors">
                        View all updates <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  }
                />
              </FadeIn>

              {/* Company News - Full Height Card */}
              <FadeIn delay={0.25}>
                <motion.div
                  className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--border-default)] transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <Newspaper className="w-5 h-5 text-[var(--accent-ember)]" />
                      Company News
                    </h2>
                    <Link href="/news" className="text-xs text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)] flex items-center gap-1 transition-colors">
                      View all <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {postsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <ListItemSkeleton key={i} showAvatar={false} />
                      ))}
                    </div>
                  ) : newsPosts.length > 0 ? (
                    <div className="space-y-3">
                      {newsPosts.slice(0, 4).map((post: MockNewsPost) => (
                        <Link key={post.id} href={`/news/${post.id}`}>
                          <motion.div
                            className="p-3 rounded-lg hover:bg-[var(--bg-slate)] transition-colors cursor-pointer"
                            whileHover={{ x: 4 }}
                          >
                            <div className="flex items-start gap-2">
                              {post.pinned && (
                                <Bell className="w-3 h-3 text-[var(--accent-gold)] mt-1 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[var(--text-primary)] font-medium text-sm truncate">
                                  {post.title || post.content.slice(0, 50)}
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                                  {post.content}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                                  <span>{post.likes_count} likes</span>
                                  <span>{post.comments_count} comments</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--text-muted)] text-sm">No news posts yet</p>
                  )}
                </motion.div>
              </FadeIn>
            </div>
            )}

            {/* Column 3: Trending + Events + Activity */}
            {(isWidgetVisible("trending") || isWidgetVisible("events") || isWidgetVisible("activity")) && (
            <div className="space-y-6">
              {/* Trending - Now at top of column */}
              {isWidgetVisible("trending") && (
              <FadeIn delay={0.2}>
                <motion.div
                  className="bg-gradient-to-br from-[var(--accent-ember)]/10 to-transparent border border-[var(--accent-ember)]/20 rounded-xl p-5 hover:border-[var(--accent-ember)]/40 transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-5 h-5 text-[var(--accent-ember)]" />
                    <h2 className="text-base font-medium text-[var(--text-primary)]">Trending Now</h2>
                  </div>
                  <div className="space-y-2">
                    {trendingTopics.map((topic, index) => (
                      <Link key={topic.name} href={topic.link}>
                        <motion.div
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-[var(--text-muted)] w-4">#{index + 1}</span>
                            <div>
                              <span className="text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-ember)] transition-colors flex items-center gap-1">
                                {topic.name}
                                {topic.trending && (
                                  <TrendingUp className="w-3 h-3 text-[var(--accent-ember)]" />
                                )}
                              </span>
                              <span className="text-xs text-[var(--text-muted)]">{topic.description}</span>
                            </div>
                          </div>
                          <span className="text-xs text-[var(--text-muted)]">{topic.count}</span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </FadeIn>
              )}

              {/* Upcoming Events */}
              {isWidgetVisible("events") && (
              <FadeIn delay={0.25}>
                <motion.div
                  className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--border-default)] transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[var(--success)]" />
                      Upcoming Events
                    </h2>
                    <Link href="/events" className="text-xs text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)] flex items-center gap-1 transition-colors">
                      View all <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {eventsLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <ListItemSkeleton key={i} showAvatar={false} />
                      ))}
                    </div>
                  ) : events.length > 0 ? (
                    <div className="space-y-3">
                      {events.slice(0, 3).map((event: MockEvent) => (
                        <Link key={event.id} href={`/events/${event.id}`}>
                          <motion.div
                            className="p-3 rounded-lg hover:bg-[var(--bg-slate)] transition-colors cursor-pointer border-l-2 border-[var(--success)]"
                            whileHover={{ x: 4 }}
                          >
                            <h4 className="text-[var(--text-primary)] font-medium text-sm">{event.title}</h4>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              {new Date(event.start_time).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                event.location_type === "virtual"
                                  ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                                  : event.location_type === "hybrid"
                                  ? "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]"
                                  : "bg-[var(--success)]/20 text-[var(--success)]"
                              }`}>
                                {event.location_type}
                              </span>
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--text-muted)] text-sm">No upcoming events</p>
                  )}
                </motion.div>
              </FadeIn>
              )}

              {/* Recent Activity */}
              {isWidgetVisible("activity") && (
              <FadeIn delay={0.3}>
                <motion.div
                  className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--border-default)] transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[var(--accent-ember)]" />
                      Recent Activity
                    </h2>
                    <Link href="/notifications" className="text-xs text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)] flex items-center gap-1 transition-colors">
                      View all <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {activities.slice(0, 4).map((activity: MockActivity) => {
                      // Determine the link based on target_type
                      const getActivityLink = () => {
                        switch (activity.target_type) {
                          case "news": return `/news/${activity.target_id}`;
                          case "event": return `/events/${activity.target_id}`;
                          case "article": return `/content/${activity.target_id}`;
                          case "channel": return `/channels/${activity.target_id}`;
                          default: return "/notifications";
                        }
                      };

                      // Format the time
                      const formatTime = (dateStr: string) => {
                        const date = new Date(dateStr);
                        const now = new Date();
                        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
                        if (diffHours < 1) return "Just now";
                        if (diffHours < 24) return `${diffHours} hours ago`;
                        if (diffHours < 48) return "Yesterday";
                        return `${Math.floor(diffHours / 24)} days ago`;
                      };

                      return (
                        <ActivityItem
                          key={activity.id}
                          title={activity.title}
                          type={activity.target_type === "channel" ? "channel" : "document"}
                          time={formatTime(activity.created_at)}
                          user={activity.actor_name}
                          href={getActivityLink()}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              </FadeIn>
              )}
            </div>
            )}
          </div>

          {/* ===== ADDITIONAL WIDGETS SECTION ===== */}
          <div className="grid gap-6 mt-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Calendar Widget */}
            {isWidgetVisible("calendar") && (
              <FadeIn delay={0.35}>
                <motion.div
                  className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--border-default)] transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[var(--accent-ember)]" />
                      Today's Schedule
                    </h2>
                    <Link href="/events" className="text-xs text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)] flex items-center gap-1 transition-colors">
                      Full calendar <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {mockCalendarEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-slate)] transition-colors">
                        <div className={`w-1 h-8 rounded ${
                          event.type === "meeting" ? "bg-[var(--accent-ember)]" :
                          event.type === "event" ? "bg-[var(--success)]" :
                          "bg-[var(--accent-gold)]"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text-primary)] truncate">{event.title}</p>
                          <p className="text-xs text-[var(--text-muted)]">{event.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </FadeIn>
            )}

            {/* Bookmarks Widget */}
            {isWidgetVisible("bookmarks") && (
              <FadeIn delay={0.4}>
                <motion.div
                  className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--border-default)] transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-[var(--accent-gold)]" />
                      Quick Links
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {mockBookmarks.map((bookmark) => (
                      <Link key={bookmark.id} href={bookmark.url}>
                        <div className="p-3 rounded-lg bg-[var(--bg-slate)] hover:bg-[var(--accent-ember)]/10 transition-colors cursor-pointer text-center">
                          <Bookmark className="w-4 h-4 text-[var(--accent-ember)] mx-auto mb-1" />
                          <p className="text-xs text-[var(--text-primary)] truncate">{bookmark.title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </FadeIn>
            )}

            {/* Goals Widget */}
            {isWidgetVisible("goals") && (
              <FadeIn delay={0.45}>
                <motion.div
                  className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--border-default)] transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <Target className="w-5 h-5 text-[var(--success)]" />
                      Goals & OKRs
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {mockGoals.map((goal) => (
                      <div key={goal.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-[var(--text-primary)] truncate">{goal.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            goal.status === "ahead" ? "bg-green-500/20 text-green-400" :
                            goal.status === "on-track" ? "bg-blue-500/20 text-blue-400" :
                            "bg-yellow-500/20 text-yellow-400"
                          }`}>{goal.status}</span>
                        </div>
                        <div className="h-2 bg-[var(--bg-slate)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              goal.status === "ahead" ? "bg-green-500" :
                              goal.status === "on-track" ? "bg-blue-500" :
                              "bg-yellow-500"
                            }`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </FadeIn>
            )}

            {/* Team Directory Widget */}
            {isWidgetVisible("team-directory") && (
              <FadeIn delay={0.5}>
                <motion.div
                  className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--border-default)] transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <Users className="w-5 h-5 text-[var(--accent-ember)]" />
                      Team Directory
                    </h2>
                    <Link href="/people" className="text-xs text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)] flex items-center gap-1 transition-colors">
                      View all <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {mockTeamMembers.map((member) => (
                      <Link key={member.id} href="/people">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-slate)] transition-colors cursor-pointer">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-[var(--accent-ember)]/20 flex items-center justify-center text-xs font-medium text-[var(--accent-ember)]">
                              {member.avatar}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-charcoal)] ${
                              member.status === "online" ? "bg-green-500" :
                              member.status === "away" ? "bg-yellow-500" :
                              "bg-gray-500"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[var(--text-primary)] truncate">{member.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{member.role}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </FadeIn>
            )}

            {/* Announcements Widget */}
            {isWidgetVisible("announcements") && (
              <FadeIn delay={0.55}>
                <motion.div
                  className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--border-default)] transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-[var(--accent-gold)]" />
                      Announcements
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {mockAnnouncements.map((announcement) => (
                      <div key={announcement.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-slate)] transition-colors">
                        <div className={`w-2 h-2 rounded-full ${
                          announcement.priority === "high" ? "bg-red-500" :
                          announcement.priority === "medium" ? "bg-yellow-500" :
                          "bg-blue-500"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text-primary)] truncate">{announcement.title}</p>
                          <p className="text-xs text-[var(--text-muted)]">{announcement.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </FadeIn>
            )}

            {/* Polls Widget */}
            {isWidgetVisible("polls") && (
              <FadeIn delay={0.6}>
                <motion.div
                  className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--border-default)] transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <Vote className="w-5 h-5 text-[var(--accent-ember)]" />
                      Active Polls
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {mockPolls.map((poll) => (
                      <div key={poll.id} className="p-3 rounded-lg bg-[var(--bg-slate)] hover:bg-[var(--accent-ember)]/5 transition-colors cursor-pointer">
                        <p className="text-sm text-[var(--text-primary)]">{poll.title}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                          <span>{poll.votes} votes</span>
                          <span>·</span>
                          <span>{poll.options} options</span>
                          <span>·</span>
                          <span>Expires in {poll.expires}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </FadeIn>
            )}

            {/* Birthdays Widget */}
            {isWidgetVisible("birthdays") && (
              <FadeIn delay={0.65}>
                <motion.div
                  className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-5 hover:border-pink-500/40 transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <Gift className="w-5 h-5 text-pink-400" />
                      Celebrations
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {mockBirthdays.map((celebration) => (
                      <div key={celebration.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                          {celebration.type === "birthday" ? "🎂" : "🎉"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text-primary)] truncate">{celebration.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {celebration.type === "birthday" ? "Birthday" : `${celebration.years} Year Anniversary`} · {celebration.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </FadeIn>
            )}

            {/* Performance Widget */}
            {isWidgetVisible("performance") && (
              <FadeIn delay={0.7}>
                <motion.div
                  className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--border-default)] transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[var(--accent-ember)]" />
                      Performance
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {mockPerformance.map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-slate)] transition-colors">
                        <span className="text-sm text-[var(--text-muted)]">{metric.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--text-primary)]">{metric.value}</span>
                          <span className={`text-xs ${
                            metric.trend.startsWith("+") ? "text-green-400" : "text-red-400"
                          }`}>{metric.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </FadeIn>
            )}

            {/* Weather Widget */}
            {isWidgetVisible("weather") && (
              <FadeIn delay={0.75}>
                <motion.div
                  className="bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-500/20 rounded-xl p-5 hover:border-sky-500/40 transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <CloudSun className="w-5 h-5 text-sky-400" />
                      Weather
                    </h2>
                  </div>
                  <div className="text-center py-2">
                    <div className="text-4xl mb-2">☀️</div>
                    <p className="text-3xl font-light text-[var(--text-primary)]">{mockWeather.temp}°F</p>
                    <p className="text-sm text-[var(--text-secondary)]">{mockWeather.condition}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      H: {mockWeather.high}° L: {mockWeather.low}°
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{mockWeather.location}</p>
                  </div>
                </motion.div>
              </FadeIn>
            )}
          </div>
        </div>
      </main>

      {/* Dashboard Customizer */}
      <DashboardCustomizer isOpen={isCustomizerOpen} onClose={() => setIsCustomizerOpen(false)} />

      {/* App Shortcuts Bar */}
      <AppShortcutsBar />
    </div>
  );
}

// Expandable Quick Card Component
interface ExpandableQuickCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: "ember" | "gold" | "copper";
  href: string;
  isExpanded: boolean;
  onToggle: () => void;
  expandedContent: React.ReactNode;
}

function ExpandableQuickCard({
  icon,
  title,
  subtitle,
  color,
  href,
  isExpanded,
  onToggle,
  expandedContent,
}: ExpandableQuickCardProps) {
  const colorClasses = {
    ember: "from-[var(--accent-ember)]/20 to-[var(--accent-ember)]/5 border-[var(--accent-ember)]/30",
    gold: "from-[var(--accent-gold)]/20 to-[var(--accent-gold)]/5 border-[var(--accent-gold)]/30",
    copper: "from-[var(--accent-copper)]/20 to-[var(--accent-copper)]/5 border-[var(--accent-copper)]/30",
  };

  const iconColors = {
    ember: "text-[var(--accent-ember)]",
    gold: "text-[var(--accent-gold)]",
    copper: "text-[var(--accent-copper)]",
  };

  return (
    <motion.div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl overflow-hidden transition-all`}
      animate={{ height: isExpanded ? "auto" : "auto" }}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${iconColors[color]}`}>{icon}</div>
            <div>
              <h3 className="text-[var(--text-primary)] font-medium">{title}</h3>
              <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={href} onClick={(e) => e.stopPropagation()}>
              <ExternalLink className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--accent-ember)] transition-colors" />
            </Link>
            <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10"
          >
            <div className="px-4 pb-4">
              {expandedContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ActivityItem({
  title,
  type,
  time,
  user,
  href,
}: {
  title: string;
  type: "document" | "channel";
  time: string;
  user: string;
  href?: string;
}) {
  const content = (
    <motion.div
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-slate)] transition-colors cursor-pointer"
      whileHover={{ x: 4 }}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        type === "document" ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]" : "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]"
      }`}>
        {type === "document" ? (
          <FileText className="w-4 h-4" />
        ) : (
          <Users className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[var(--text-primary)] text-sm font-medium truncate">{title}</h4>
        <p className="text-xs text-[var(--text-muted)]">{user}</p>
      </div>
      <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{time}</span>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
