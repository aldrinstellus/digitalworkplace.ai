"use client";

import { useUser } from "@clerk/nextjs";
import { Sidebar } from "@/components/layout/Sidebar";
import { Search, Sparkles, Clock, TrendingUp, FileText, Users, Calendar } from "lucide-react";

export default function Dashboard() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-16 p-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
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
          <div className="relative mb-8">
            <div className="bg-[#1a1a1f] border border-white/10 rounded-2xl p-4 hover:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-lg"
                />
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-white/5">
                    <Sparkles className="w-4 h-4" />
                    Fast
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <QuickActionCard
              icon={<FileText className="w-5 h-5" />}
              title="Recent Documents"
              description="View your recently accessed files"
              color="blue"
            />
            <QuickActionCard
              icon={<Users className="w-5 h-5" />}
              title="Team Updates"
              description="See what your team is working on"
              color="purple"
            />
            <QuickActionCard
              icon={<Calendar className="w-5 h-5" />}
              title="Upcoming Events"
              description="Check your calendar and meetings"
              color="cyan"
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Recent Activity
              </h2>
              <button className="text-sm text-blue-400 hover:text-blue-300">
                View all
              </button>
            </div>

            <div className="space-y-3">
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
          </div>

          {/* Trending */}
          <div className="mt-8 bg-[#0f0f14] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-medium text-white">Trending in your organization</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {["AI Strategy", "Q4 Goals", "New Hires", "Product Launch", "Team Building"].map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-white/70 cursor-pointer transition-colors"
                >
                  {topic}
                </span>
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
