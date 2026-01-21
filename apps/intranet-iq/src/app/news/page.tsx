"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { FadeIn, StaggerContainer, StaggerItem } from "@/lib/motion";
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
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />

      <main className="ml-16 p-8">
        <FadeIn className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-[var(--text-primary)] mb-2 flex items-center gap-3">
              <Newspaper className="w-7 h-7 text-[var(--accent-ember)]" />
              Company News
            </h1>
            <p className="text-[var(--text-muted)]">
              Stay updated with the latest company announcements and news
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl px-2">
              <Filter className="w-4 h-4 text-[var(--text-muted)]" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | "pinned")}
                className="bg-transparent text-[var(--text-primary)] py-3 pr-2 outline-none cursor-pointer"
              >
                <option value="all">All Posts</option>
                <option value="pinned">Pinned Only</option>
              </select>
            </div>
          </div>

          {/* News Posts */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-ember)]" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="w-12 h-12 text-[var(--text-muted)]/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">No news found</h3>
              <p className="text-sm text-[var(--text-muted)]/70">
                {searchQuery ? "Try different search terms" : "No news posts have been published yet"}
              </p>
            </div>
          ) : (
            <StaggerContainer className="space-y-4">
              {filteredPosts.map((post: NewsPost) => (
                <StaggerItem key={post.id}>
                  <motion.div
                    whileHover={{ scale: 1.01, borderColor: "rgba(249,115,22,0.3)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {post.pinned && (
                        <div className="flex-shrink-0 mt-1">
                          <Bell className="w-5 h-5 text-[var(--accent-gold)]" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                          {post.title || post.content.slice(0, 60)}
                        </h3>
                        <p className="text-[var(--text-secondary)] mb-4 line-clamp-3">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
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
                            <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]">
                              Pinned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </FadeIn>
      </main>
    </div>
  );
}
