"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useNewsPosts } from "@/lib/hooks/useSupabase";
import {
  Newspaper,
  Bell,
  Clock,
  ThumbsUp,
  MessageSquare,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import type { NewsPost } from "@/lib/database.types";

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pinned">("all");
  const { posts, loading } = useNewsPosts({ limit: 50 });

  const filteredPosts = posts.filter((post: NewsPost) => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "pinned" && post.pinned);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />

      <main className="ml-16 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-white mb-2 flex items-center gap-3">
              <Newspaper className="w-7 h-7 text-purple-400" />
              Company News
            </h1>
            <p className="text-white/50">
              Stay updated with the latest company announcements and news
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full bg-[#0f0f14] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 bg-[#0f0f14] border border-white/10 rounded-xl px-2">
              <Filter className="w-4 h-4 text-white/40" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | "pinned")}
                className="bg-transparent text-white py-3 pr-2 outline-none cursor-pointer"
              >
                <option value="all">All Posts</option>
                <option value="pinned">Pinned Only</option>
              </select>
            </div>
          </div>

          {/* News Posts */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/50 mb-2">No news found</h3>
              <p className="text-sm text-white/30">
                {searchQuery ? "Try different search terms" : "No news posts have been published yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post: NewsPost) => (
                <div
                  key={post.id}
                  className="bg-[#0f0f14] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {post.pinned && (
                      <div className="flex-shrink-0 mt-1">
                        <Bell className="w-5 h-5 text-yellow-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white mb-2">
                        {post.title || post.content.slice(0, 60)}
                      </h3>
                      <p className="text-white/60 mb-4 line-clamp-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-white/40">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {new Date(post.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <ThumbsUp className="w-4 h-4" />
                          {post.likes_count} likes
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4" />
                          {post.comments_count} comments
                        </span>
                        {post.pinned && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                            Pinned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
