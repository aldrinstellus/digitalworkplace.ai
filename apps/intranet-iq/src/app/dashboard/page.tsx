"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Search, Sparkles, Clock, TrendingUp, FileText, Users, Calendar, MessageSquare, Newspaper, Bell, ChevronRight } from "lucide-react";
import { useNewsPosts, useUpcomingEvents, useRecentActivity } from "@/lib/hooks/useSupabase";
import { useDashboardWidgets } from "@/lib/hooks/useDashboardWidgets";
import type { NewsPost, Event } from "@/lib/database.types";
import Link from "next/link";
import { MeetingCard } from "@/components/dashboard/MeetingCard";
import { AppShortcutsBar } from "@/components/dashboard/AppShortcutsBar";
import { DashboardCustomizer, DashboardCustomizeButton } from "@/components/dashboard/DashboardCustomizer";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem, ScaleOnHover } from "@/lib/motion";
import { Skeleton, TextSkeleton, ListItemSkeleton } from "@/components/ui/Skeleton";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const { visibleWidgets, loading: widgetsLoading } = useDashboardWidgets();

  // Get display name from Clerk user
  const getDisplayName = (): string | null => {
    if (!isLoaded) return null; // Still loading
    if (!user) return null; // Not logged in
    if (user.firstName) return user.firstName;
    if (user.fullName) return user.fullName.split(" ")[0];
    if (user.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress.split("@")[0];
    }
    return null;
  };

  const userName = getDisplayName();
  // If we have a user name, show "Good [time], [name]". Otherwise show "Hello there"
  const greeting = userName
    ? `Good ${getTimeOfDay()}, ${userName}`
    : "Hello there";

  // Fetch real data from Supabase
  const { posts: newsPosts, loading: postsLoading } = useNewsPosts({ limit: 5 });
  const { events, loading: eventsLoading } = useUpcomingEvents({ limit: 3 });
  const { activities, loading: activitiesLoading } = useRecentActivity(5);

  // Trending topics derived from recent posts
  const trendingTopics = ["AI Strategy", "Q4 Goals", "New Hires", "Product Launch", "Team Building"];

  // Helper to check if a widget is visible
  const isWidgetVisible = (widgetType: string) =>
    visibleWidgets.some((w) => w.type === widgetType);

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
                <h1 className="text-2xl font-medium text-[var(--text-primary)] mb-1">
                  {greeting}
                </h1>
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <span className="text-[var(--accent-ember)]">For you</span>
                  <span>|</span>
                  <span>Company</span>
                </div>
              </div>
              <DashboardCustomizeButton onClick={() => setIsCustomizerOpen(true)} />
            </div>
          </FadeIn>

          {/* Search Bar */}
          <FadeIn delay={0.1}>
            <Link href="/search">
              <motion.div
                className="relative mb-8"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
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

          {/* Meeting Card */}
          {isWidgetVisible("meeting") && (
            <FadeIn delay={0.15}>
              <MeetingCard />
            </FadeIn>
          )}

          {/* Quick Actions */}
          {isWidgetVisible("quick-actions") && (
            <FadeIn delay={0.2}>
              <StaggerContainer className="grid grid-cols-3 gap-4 mb-8">
                <StaggerItem>
                  <Link href="/content?view=recent">
                    <QuickActionCard
                      icon={<FileText className="w-5 h-5" />}
                      title="Recent Documents"
                      description="View your recently accessed files"
                      color="ember"
                    />
                  </Link>
                </StaggerItem>
                <StaggerItem>
                  <Link href="/news">
                    <QuickActionCard
                      icon={<Newspaper className="w-5 h-5" />}
                      title="Team Updates"
                      description="Latest company news and announcements"
                      color="gold"
                    />
                  </Link>
                </StaggerItem>
                <StaggerItem>
                  <Link href="/chat">
                    <QuickActionCard
                      icon={<MessageSquare className="w-5 h-5" />}
                      title="AI Assistant"
                      description="Ask questions and get answers"
                      color="copper"
                    />
                  </Link>
                </StaggerItem>
              </StaggerContainer>
            </FadeIn>
          )}

          {/* News & Events Grid */}
          {(isWidgetVisible("news") || isWidgetVisible("events")) && (
            <FadeIn delay={0.25}>
              <div className={`grid gap-6 mb-6 ${isWidgetVisible("news") && isWidgetVisible("events") ? "grid-cols-2" : "grid-cols-1"}`}>
                {/* News Feed */}
                {isWidgetVisible("news") && (
                  <motion.div
                    className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 hover:border-[var(--border-default)] transition-colors"
                    whileHover={{ y: -2 }}
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
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                    ) : (
                      <p className="text-[var(--text-muted)] text-sm">No news posts yet</p>
                    )}
                  </motion.div>
                )}

                {/* Upcoming Events */}
                {isWidgetVisible("events") && (
                  <motion.div
                    className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 hover:border-[var(--border-default)] transition-colors"
                    whileHover={{ y: -2 }}
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
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                    ) : (
                      <p className="text-[var(--text-muted)] text-sm">No upcoming events</p>
                    )}
                  </motion.div>
                )}
              </div>
            </FadeIn>
          )}

          {/* Recent Activity */}
          {isWidgetVisible("activity") && (
            <FadeIn delay={0.3}>
              <motion.div
                className="mt-6 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 hover:border-[var(--border-default)] transition-colors"
                whileHover={{ y: -2 }}
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
                    {/* Fallback mock data when no activities */}
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
            </FadeIn>
          )}

          {/* Trending */}
          {isWidgetVisible("trending") && (
            <FadeIn delay={0.35}>
              <motion.div
                className="mt-6 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 hover:border-[var(--border-default)] transition-colors"
                whileHover={{ y: -2 }}
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
            </FadeIn>
          )}
        </div>
      </main>

      {/* Dashboard Customizer */}
      <DashboardCustomizer isOpen={isCustomizerOpen} onClose={() => setIsCustomizerOpen(false)} />

      {/* App Shortcuts Bar */}
      <AppShortcutsBar />
    </div>
  );
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
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "ember" | "gold" | "copper";
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
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
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
