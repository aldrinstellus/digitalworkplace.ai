"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Search, Sparkles, Clock, TrendingUp, FileText, Users, Calendar, MessageSquare, Newspaper, Bell } from "lucide-react";
import { useNewsPosts, useUpcomingEvents, useRecentActivity } from "@/lib/hooks/useSupabase";
import type { NewsPost, Event } from "@/lib/database.types";
import Link from "next/link";

export default function Dashboard() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  // Fetch real data from Supabase
  const { posts: newsPosts, loading: postsLoading } = useNewsPosts({ limit: 5 });
  const { events, loading: eventsLoading } = useUpcomingEvents({ limit: 3 });
  const { activities, loading: activitiesLoading } = useRecentActivity(5);

  // Trending topics derived from recent posts
  const trendingTopics = ["AI Strategy", "Q4 Goals", "New Hires", "Product Launch", "Team Building"];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-16 p-8">
        {/* Header */}
        <div className="max-w-5xl mx-auto">
          {/* dIQ Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <svg height="18" viewBox="0 0 32 18" style={{ overflow: "visible" }}>
                  <text x="0" y="14" fill="white" fontSize="18" fontWeight="700" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">d</text>
                  <text x="11" y="14" fill="white" fillOpacity="0.85" fontSize="10" fontWeight="400" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">I</text>
                  <text x="16.5" y="14" fill="white" fillOpacity="0.85" fontSize="10" fontWeight="400" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">Q</text>
                  <circle cx="27" cy="13" r="2.5" fill="#60a5fa" style={{ filter: "drop-shadow(0 0 3px rgba(96, 165, 250, 0.6))" }} />
                </svg>
              </div>
              <span className="text-white/40 text-sm">Intranet IQ</span>
            </div>
            <span className="text-xs text-white/30 font-mono">localhost:3001</span>
          </div>

          {/* Greeting */}
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-white mb-1">
              Good {getTimeOfDay()}, {firstName}
            </h1>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span>For you</span>
              <span>|</span>
              <span>Company</span>
            </div>
          </div>

          {/* Search Bar */}
          <Link href="/search">
            <div className="relative mb-8">
              <div className="bg-[#1a1a1f] border border-white/10 rounded-2xl p-4 hover:border-blue-500/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-white/40" />
                  <span className="flex-1 text-white/40 text-lg">Ask anything...</span>
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-white/5">
                      <Sparkles className="w-4 h-4" />
                      Fast
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Link href="/content">
              <QuickActionCard
                icon={<FileText className="w-5 h-5" />}
                title="Recent Documents"
                description="View your recently accessed files"
                color="blue"
              />
            </Link>
            <Link href="/people">
              <QuickActionCard
                icon={<Users className="w-5 h-5" />}
                title="Team Updates"
                description="See what your team is working on"
                color="purple"
              />
            </Link>
            <Link href="/chat">
              <QuickActionCard
                icon={<MessageSquare className="w-5 h-5" />}
                title="AI Assistant"
                description="Ask questions and get answers"
                color="cyan"
              />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* News Feed */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-purple-400" />
                  Company News
                </h2>
                <button className="text-sm text-blue-400 hover:text-blue-300">View all</button>
              </div>

              {postsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : newsPosts.length > 0 ? (
                <div className="space-y-3">
                  {newsPosts.map((post: NewsPost) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        {post.pinned && (
                          <Bell className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm truncate">
                            {post.title || post.content.slice(0, 50)}
                          </h4>
                          <p className="text-xs text-white/50 line-clamp-2 mt-1">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                            <span>{post.likes_count} likes</span>
                            <span>{post.comments_count} comments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm">No news posts yet</p>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  Upcoming Events
                </h2>
                <button className="text-sm text-blue-400 hover:text-blue-300">View all</button>
              </div>

              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event: Event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border-l-2 border-green-500"
                    >
                      <h4 className="text-white font-medium text-sm">{event.title}</h4>
                      <p className="text-xs text-white/50 mt-1">
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
                            ? "bg-blue-500/20 text-blue-400"
                            : event.location_type === "hybrid"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-green-500/20 text-green-400"
                        }`}>
                          {event.location_type}
                        </span>
                        {event.location && (
                          <span className="text-xs text-white/40 truncate">{event.location}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm">No upcoming events</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-[#0f0f14] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Recent Activity
              </h2>
              <button className="text-sm text-blue-400 hover:text-blue-300">View all</button>
            </div>

            {activitiesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-2">
                {activities.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.action}</p>
                      <p className="text-xs text-white/40">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Fallback mock data when no activities */}
                <ActivityItem
                  title="Q4 Planning Document"
                  type="document"
                  time="2 hours ago"
                  user="Sarah Chen"
                />
                <ActivityItem
                  title="Engineering Team Channel"
                  type="channel"
                  time="4 hours ago"
                  user="12 new messages"
                />
                <ActivityItem
                  title="Product Roadmap 2026"
                  type="document"
                  time="Yesterday"
                  user="Updated by Alex"
                />
              </div>
            )}
          </div>

          {/* Trending */}
          <div className="mt-6 bg-[#0f0f14] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-medium text-white">Trending in your organization</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((topic) => (
                <Link
                  key={topic}
                  href={`/search?q=${encodeURIComponent(topic)}`}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-white/70 cursor-pointer transition-colors"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
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
  color: "blue" | "purple" | "cyan";
}) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50",
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-500/50",
  };

  const iconColors = {
    blue: "text-blue-400",
    purple: "text-purple-400",
    cyan: "text-cyan-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02]`}
    >
      <div className={`${iconColors[color]} mb-3`}>{icon}</div>
      <h3 className="text-white font-medium mb-1">{title}</h3>
      <p className="text-sm text-white/50">{description}</p>
    </div>
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
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        type === "document" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
      }`}>
        {type === "document" ? (
          <FileText className="w-5 h-5" />
        ) : (
          <Users className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1">
        <h4 className="text-white font-medium">{title}</h4>
        <p className="text-sm text-white/50">{user}</p>
      </div>
      <span className="text-xs text-white/40">{time}</span>
    </div>
  );
}
