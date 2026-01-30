"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import { useState, useCallback, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Search, Sparkles, Clock, TrendingUp, FileText, Users, Calendar, MessageSquare, Newspaper, Bell, ChevronRight, ListTodo, GripVertical, Layout, ChevronDown } from "lucide-react";
import { useNewsPosts, useUpcomingEvents, useRecentActivity } from "@/lib/hooks/useSupabase";
import { useDashboardWidgets, DashboardWidget, LAYOUT_PRESETS, LayoutPresetKey } from "@/lib/hooks/useDashboardWidgets";
import type { NewsPost, Event } from "@/lib/database.types";
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

  // Real-time connection status
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connected");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isPulsing, setIsPulsing] = useState(false);

  const { visibleWidgets, reorderWidgets, applyPreset } = useDashboardWidgets();

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
    // Initial connection check
    setConnectionStatus("connected");

    // Simulate periodic updates
    const updateInterval = setInterval(() => {
      setLastUpdated(new Date());
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, 30000); // Update every 30 seconds

    // Simulate connection status changes based on network
    const checkConnection = () => {
      if (!navigator.onLine) {
        setConnectionStatus("disconnected");
      } else {
        // Check if data is stale (more than 60 seconds old)
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

    // Listen for online/offline events
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

  // Get time since last update
  const getTimeSinceUpdate = () => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    if (diffSeconds < 5) return "Just now";
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ago`;
  };

  // Handle preset selection
  const handlePresetSelect = (presetKey: LayoutPresetKey) => {
    applyPreset(presetKey);
    setIsPresetDropdownOpen(false);
    setHoveredPreset(null);
  };

  // Get organization name with fallback
  const organizationName = organization?.name || "Your Organization";

  // Get display name from Clerk user
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
    ? `Good ${getTimeOfDay()}, ${userName}`
    : "Hello there";

  // Fetch real data from Supabase
  const { posts: newsPosts, loading: postsLoading } = useNewsPosts({ limit: 5 });
  const { events, loading: eventsLoading } = useUpcomingEvents({ limit: 3 });
  const { activities, loading: activitiesLoading } = useRecentActivity(5);

  // Trending topics derived from recent posts
  const trendingTopics = ["AI Strategy", "Q4 Goals", "New Hires", "Product Launch", "Team Building"];

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

  // Render widget based on type
  const renderWidget = (widget: DashboardWidget) => {
    const isDragging = draggedWidgetId === widget.id;
    const isDropTarget = dropTargetId === widget.id;

    const widgetContent = getWidgetContent(
      widget.type,
      { newsPosts, events, activities, postsLoading, eventsLoading, activitiesLoading, trendingTopics, isEditMode }
    );

    if (!widgetContent) return null;

    return (
      <DraggableWidgetWrapper
        key={widget.id}
        id={widget.id}
        isEditMode={isEditMode}
        isDragging={isDragging}
        isDropTarget={isDropTarget}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
      >
        {widgetContent}
      </DraggableWidgetWrapper>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-16 mr-20 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Greeting */}
          <FadeIn delay={0}>
            <div className="mb-8 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-medium text-[var(--text-primary)]">
                    {greeting}
                  </h1>
                  {/* Real-Time Update Indicator */}
                  <div className="relative group">
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-[var(--bg-charcoal)] border border-[var(--border-subtle)]">
                      <span className="relative flex h-2 w-2">
                        {/* Ping animation for connected status */}
                        {connectionStatus === "connected" && isPulsing && (
                          <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        )}
                        {/* Status dot */}
                        <span className={`relative rounded-full h-2 w-2 ${
                          connectionStatus === "connected"
                            ? "bg-emerald-500"
                            : connectionStatus === "stale"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`} />
                      </span>
                      <span className="text-xs text-white/50">Live</span>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap">
                      <div className="text-xs text-[var(--text-primary)]">
                        {connectionStatus === "connected" && "Connected - Real-time updates active"}
                        {connectionStatus === "stale" && "Connection stale - Attempting to reconnect"}
                        {connectionStatus === "disconnected" && "Disconnected - Check your connection"}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        Last updated: {getTimeSinceUpdate()}
                      </div>
                      {/* Arrow */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--bg-charcoal)] border-l border-t border-[var(--border-subtle)] rotate-45" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <span className="text-[var(--accent-ember)]">For you</span>
                  <span>|</span>
                  <span>{organizationName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Layout Presets Dropdown */}
                <div className="relative" ref={presetDropdownRef}>
                  <button
                    onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--bg-charcoal)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-ember)]/30 hover:text-[var(--accent-ember)] transition-all"
                  >
                    <Layout className="w-4 h-4" />
                    <span>Presets</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isPresetDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isPresetDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-2">
                          <div className="text-xs text-[var(--text-muted)] px-3 py-2 uppercase tracking-wider">
                            Layout Presets
                          </div>
                          {LAYOUT_PRESETS.map((preset) => (
                            <button
                              key={preset.key}
                              onClick={() => handlePresetSelect(preset.key)}
                              onMouseEnter={() => setHoveredPreset(preset.key)}
                              onMouseLeave={() => setHoveredPreset(null)}
                              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[var(--bg-slate)] transition-colors group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-ember)] transition-colors">
                                  {preset.name}
                                </span>
                                {preset.key === "default" && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent-ember)]/10 text-[var(--accent-ember)]">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                {preset.description}
                              </p>
                              {/* Preview tooltip on hover */}
                              <AnimatePresence>
                                {hoveredPreset === preset.key && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 pt-2 border-t border-[var(--border-subtle)]"
                                  >
                                    <div className="text-xs text-[var(--text-muted)]">Widgets:</div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {preset.widgetTypes.map((type) => (
                                        <span
                                          key={type}
                                          className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg-slate)] text-[var(--text-secondary)]"
                                        >
                                          {type.replace("-", " ")}
                                        </span>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <EditLayoutButton isEditMode={isEditMode} onToggle={() => setIsEditMode(!isEditMode)} />
                <DashboardCustomizeButton onClick={() => setIsCustomizerOpen(true)} />
              </div>
            </div>
          </FadeIn>

          {/* Edit Mode Banner */}
          <AnimatePresence>
            {isEditMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4 flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-[#10b981]" />
                  <div>
                    <p className="text-[#10b981] font-medium text-sm">Edit Layout Mode</p>
                    <p className="text-[var(--text-muted)] text-xs">Drag widgets to reorder them. Click Done when finished.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Bar */}
          <FadeIn delay={0.1}>
            <Link href="/search">
              <motion.div
                className="relative mb-8"
                whileHover={{ scale: isEditMode ? 1 : 1.01 }}
                whileTap={{ scale: isEditMode ? 1 : 0.99 }}
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

          {/* Widgets - Rendered in order */}
          <div className="space-y-6">
            {visibleWidgets.map((widget) => renderWidget(widget))}
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

// Draggable Widget Wrapper Component
interface DraggableWidgetWrapperProps {
  id: string;
  children: React.ReactNode;
  isEditMode: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  onDragEnd: () => void;
}

function DraggableWidgetWrapper({
  id,
  children,
  isEditMode,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: DraggableWidgetWrapperProps) {
  const handleDragStart = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    setTimeout(() => onDragStart(id), 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    onDragOver(id);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    onDrop(id);
  };

  return (
    <div
      draggable={isEditMode}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={onDragEnd}
      className={`relative transition-all duration-150 ${isEditMode ? "cursor-move" : ""} ${
        isDropTarget && !isDragging
          ? "ring-2 ring-[#10b981] ring-dashed ring-offset-2 ring-offset-[var(--bg-obsidian)]"
          : ""
      } ${isDragging ? "opacity-50 scale-[0.98] shadow-2xl shadow-[#10b981]/20" : ""}`}
    >
      {/* Drag Handle - Visible in edit mode */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute -left-2 top-4 -translate-x-full z-10 flex items-center justify-center w-6 h-10 rounded-l-lg bg-[var(--bg-charcoal)] border border-r-0 border-[var(--border-subtle)] cursor-grab active:cursor-grabbing hover:bg-[var(--bg-slate)] hover:border-[#10b981]/50 transition-colors group"
          >
            <GripVertical
              className="w-4 h-4 group-hover:text-[#10b981] transition-colors"
              style={{ color: "rgba(255,255,255,0.5)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}

// Get widget content based on type
interface WidgetContentProps {
  newsPosts: NewsPost[];
  events: Event[];
  activities: any[];
  postsLoading: boolean;
  eventsLoading: boolean;
  activitiesLoading: boolean;
  trendingTopics: string[];
  isEditMode: boolean;
}

function getWidgetContent(
  type: DashboardWidget["type"],
  props: WidgetContentProps
): React.ReactNode {
  const { newsPosts, events, activities, postsLoading, eventsLoading, activitiesLoading, trendingTopics, isEditMode } = props;

  switch (type) {
    case "meeting":
      return <MeetingCard />;

    case "quick-actions":
      return (
        <StaggerContainer className="grid grid-cols-4 gap-4">
          <StaggerItem>
            <Link href="/my-day">
              <QuickActionCard
                icon={<ListTodo className="w-5 h-5" />}
                title="My Tasks"
                description="View and manage your daily tasks"
                color="ember"
                isEditMode={isEditMode}
              />
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link href="/content?view=recent">
              <QuickActionCard
                icon={<FileText className="w-5 h-5" />}
                title="Recent Documents"
                description="View your recently accessed files"
                color="gold"
                isEditMode={isEditMode}
              />
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link href="/news">
              <QuickActionCard
                icon={<Newspaper className="w-5 h-5" />}
                title="Team Updates"
                description="Latest company news"
                color="copper"
                isEditMode={isEditMode}
              />
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link href="/chat">
              <QuickActionCard
                icon={<MessageSquare className="w-5 h-5" />}
                title="AI Assistant"
                description="Ask questions and get answers"
                color="ember"
                isEditMode={isEditMode}
              />
            </Link>
          </StaggerItem>
        </StaggerContainer>
      );

    case "news":
      return (
        <motion.div
          className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 hover:border-[var(--border-default)] transition-colors"
          whileHover={isEditMode ? {} : { y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-[var(--accent-ember)]" />
              Company News
            </h2>
            <Link href="/news" className="text-sm text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)] flex items-center gap-1 transition-colors">
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {postsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <ListItemSkeleton key={i} showAvatar={false} />
              ))}
            </div>
          ) : newsPosts.length > 0 ? (
            <StaggerContainer className="space-y-3">
              {newsPosts.map((post: NewsPost) => (
                <StaggerItem key={post.id}>
                  <Link href={`/news/${post.id}`}>
                    <motion.div
                      className="p-3 rounded-lg hover:bg-[var(--bg-slate)] transition-colors cursor-pointer"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-start gap-3">
                        {post.pinned && (
                          <Bell className="w-4 h-4 text-[var(--accent-gold)] mt-0.5 flex-shrink-0" />
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
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <p className="text-[var(--text-muted)] text-sm">No news posts yet</p>
          )}
        </motion.div>
      );

    case "events":
      return (
        <motion.div
          className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 hover:border-[var(--border-default)] transition-colors"
          whileHover={isEditMode ? {} : { y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--success)]" />
              Upcoming Events
            </h2>
            <Link href="/events" className="text-sm text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)] flex items-center gap-1 transition-colors">
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {eventsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <ListItemSkeleton key={i} showAvatar={false} />
              ))}
            </div>
          ) : events.length > 0 ? (
            <StaggerContainer className="space-y-3">
              {events.map((event: Event) => (
                <StaggerItem key={event.id}>
                  <Link href={`/events/${event.id}`}>
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
                        {event.location && (
                          <span className="text-xs text-[var(--text-muted)] truncate">{event.location}</span>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <p className="text-[var(--text-muted)] text-sm">No upcoming events</p>
          )}
        </motion.div>
      );

    case "activity":
      return (
        <motion.div
          className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 hover:border-[var(--border-default)] transition-colors"
          whileHover={isEditMode ? {} : { y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--accent-ember)]" />
              Recent Activity
            </h2>
            <Link href="/settings?tab=activity" className="text-sm text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)] flex items-center gap-1 transition-colors">
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {activitiesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          ) : activities.length > 0 ? (
            <StaggerContainer className="space-y-2">
              {activities.map((activity: any) => (
                <StaggerItem key={activity.id}>
                  <motion.div
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--bg-slate)] transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-ember)]/20 text-[var(--accent-ember)] flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[var(--text-primary)] text-sm">{activity.action}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <StaggerContainer className="space-y-3">
              <StaggerItem>
                <ActivityItem
                  title="Q4 Planning Document"
                  type="document"
                  time="2 hours ago"
                  user="Sarah Chen"
                />
              </StaggerItem>
              <StaggerItem>
                <ActivityItem
                  title="Engineering Team Channel"
                  type="channel"
                  time="4 hours ago"
                  user="12 new messages"
                />
              </StaggerItem>
              <StaggerItem>
                <ActivityItem
                  title="Product Roadmap 2026"
                  type="document"
                  time="Yesterday"
                  user="Updated by Alex"
                />
              </StaggerItem>
            </StaggerContainer>
          )}
        </motion.div>
      );

    case "trending":
      return (
        <motion.div
          className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 hover:border-[var(--border-default)] transition-colors"
          whileHover={isEditMode ? {} : { y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[var(--success)]" />
            <h2 className="text-lg font-medium text-[var(--text-primary)]">Trending in your organization</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic, index) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <Link
                  href={`/search?q=${encodeURIComponent(topic)}`}
                  className="px-3 py-1.5 bg-[var(--bg-slate)] hover:bg-[var(--accent-ember)]/10 border border-[var(--border-subtle)] hover:border-[var(--accent-ember)]/30 rounded-full text-sm text-[var(--text-secondary)] hover:text-[var(--accent-ember)] cursor-pointer transition-all duration-200"
                >
                  {topic}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      );

    default:
      return null;
  }
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function QuickActionCard({
  icon,
  title,
  description,
  color,
  isEditMode,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "ember" | "gold" | "copper";
  isEditMode?: boolean;
}) {
  const colorClasses = {
    ember: "from-[var(--accent-ember)]/20 to-[var(--accent-ember)]/5 border-[var(--accent-ember)]/30 hover:border-[var(--accent-ember)]/50",
    gold: "from-[var(--accent-gold)]/20 to-[var(--accent-gold)]/5 border-[var(--accent-gold)]/30 hover:border-[var(--accent-gold)]/50",
    copper: "from-[var(--accent-copper)]/20 to-[var(--accent-copper)]/5 border-[var(--accent-copper)]/30 hover:border-[var(--accent-copper)]/50",
  };

  const iconColors = {
    ember: "text-[var(--accent-ember)]",
    gold: "text-[var(--accent-gold)]",
    copper: "text-[var(--accent-copper)]",
  };

  return (
    <motion.div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 cursor-pointer transition-all`}
      whileHover={isEditMode ? {} : { scale: 1.02, y: -4 }}
      whileTap={isEditMode ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className={`${iconColors[color]} mb-3`}>{icon}</div>
      <h3 className="text-[var(--text-primary)] font-medium mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-muted)]">{description}</p>
    </motion.div>
  );
}

function ActivityItem({
  title,
  type,
  time,
  user,
}: {
  title: string;
  type: "document" | "channel";
  time: string;
  user: string;
}) {
  return (
    <motion.div
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--bg-slate)] transition-colors cursor-pointer"
      whileHover={{ x: 4 }}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        type === "document" ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]" : "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]"
      }`}>
        {type === "document" ? (
          <FileText className="w-5 h-5" />
        ) : (
          <Users className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1">
        <h4 className="text-[var(--text-primary)] font-medium">{title}</h4>
        <p className="text-sm text-[var(--text-muted)]">{user}</p>
      </div>
      <span className="text-xs text-[var(--text-muted)]">{time}</span>
    </motion.div>
  );
}
