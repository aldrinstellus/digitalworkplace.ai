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
  Plus,
  X,
  Pin,
} from "lucide-react";
import type { NewsPost } from "@/lib/database.types";

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pinned">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostPinned, setNewPostPinned] = useState(false);
  const [creating, setCreating] = useState(false);
  const { posts, loading } = useNewsPosts({ limit: 50 });

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    setCreating(true);
    try {
      // In production, this would call the API to create the post
      console.log("Creating post:", { title: newPostTitle, content: newPostContent, pinned: newPostPinned });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset form and close modal
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostPinned(false);
      setShowCreateModal(false);

      // Refresh the page to show new post
      window.location.reload();
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setCreating(false);
    }
  };

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
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-medium text-[var(--text-primary)] mb-2 flex items-center gap-3">
                <Newspaper className="w-7 h-7 text-[var(--accent-ember)]" />
                Company News
              </h1>
              <p className="text-[var(--text-muted)]">
                Stay updated with the latest company announcements and news
              </p>
            </div>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-white transition-colors shadow-lg shadow-[var(--accent-ember)]/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              Create Post
            </motion.button>
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

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[var(--accent-ember)]" />
                Create News Post
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Enter a title..."
                  className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Content *
                </label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What's the news?"
                  rows={5}
                  className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors resize-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPostPinned}
                  onChange={(e) => setNewPostPinned(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--accent-ember)] focus:ring-[var(--accent-ember)]"
                />
                <span className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Pin className="w-4 h-4" />
                  Pin this post
                </span>
              </label>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)] transition-colors"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleCreatePost}
                disabled={creating || !newPostContent.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] disabled:opacity-50 text-white transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                {creating ? "Posting..." : "Post"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
