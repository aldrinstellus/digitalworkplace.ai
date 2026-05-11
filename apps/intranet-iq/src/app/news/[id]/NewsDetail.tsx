"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { FadeIn } from "@/lib/motion";
import { getNewsPostById, mockNewsPosts, type MockNewsPost } from "@/lib/mockData";
import {
  ArrowLeft,
  Clock,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  Pin,
  Heart,
  Send,
  Eye,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import Link from "next/link";

// Mock comments data for news posts
const mockComments: Record<string, Array<{
  id: string;
  author: { id: string; name: string; role: string; avatar: string };
  content: string;
  likes: number;
  timestamp: string;
  replies: Array<{
    id: string;
    author: { id: string; name: string; role: string; avatar: string };
    content: string;
    likes: number;
    timestamp: string;
  }>;
}>> = {
  "1": [
    {
      id: "c1",
      author: { id: "u2", name: "Mike Johnson", role: "VP Engineering", avatar: "MJ" },
      content: "Incredible results! The engineering team is proud to have contributed to this success. Looking forward to even bigger things in 2026!",
      likes: 45,
      timestamp: "2026-01-28T10:15:00Z",
      replies: [
        {
          id: "c1-r1",
          author: { id: "u3", name: "Lisa Park", role: "HR Director", avatar: "LP" },
          content: "Absolutely! The team growth has been amazing to manage. Great job everyone!",
          likes: 12,
          timestamp: "2026-01-28T10:30:00Z",
        },
      ],
    },
    {
      id: "c2",
      author: { id: "u4", name: "James Wilson", role: "Product Lead", avatar: "JW" },
      content: "The product milestones this quarter were incredible. AI Assistant 3.0 has been a game-changer for our customers.",
      likes: 32,
      timestamp: "2026-01-28T11:00:00Z",
      replies: [],
    },
    {
      id: "c3",
      author: { id: "u5", name: "Emily Rodriguez", role: "Customer Success Manager", avatar: "ER" },
      content: "Our customers are thrilled with the improvements! The NPS score jump reflects the hard work everyone has put in.",
      likes: 28,
      timestamp: "2026-01-28T11:45:00Z",
      replies: [],
    },
  ],
  "2": [
    {
      id: "c4",
      author: { id: "u1", name: "Sarah Chen", role: "CEO", avatar: "SC" },
      content: "Welcome to the team everyone! Excited to see what we'll build together.",
      likes: 67,
      timestamp: "2026-01-27T14:30:00Z",
      replies: [],
    },
    {
      id: "c5",
      author: { id: "u8", name: "Alex Kim", role: "Staff Engineer", avatar: "AK" },
      content: "Looking forward to collaborating with all the new team members! Our infrastructure projects will move so much faster.",
      likes: 23,
      timestamp: "2026-01-27T15:00:00Z",
      replies: [],
    },
  ],
  "3": [
    {
      id: "c6",
      author: { id: "u8", name: "Alex Kim", role: "Staff Engineer", avatar: "AK" },
      content: "This is fantastic! The flexibility options are exactly what modern teams need. Thank you for listening to feedback!",
      likes: 89,
      timestamp: "2026-01-25T12:00:00Z",
      replies: [
        {
          id: "c6-r1",
          author: { id: "u3", name: "Lisa Park", role: "HR Director", avatar: "LP" },
          content: "We heard you loud and clear! This policy was shaped by over 200 survey responses.",
          likes: 34,
          timestamp: "2026-01-25T12:30:00Z",
        },
      ],
    },
  ],
  "4": [
    {
      id: "c7",
      author: { id: "u7", name: "Emily Rodriguez", role: "VP Customer Success", avatar: "ER" },
      content: "Our customers have been asking for the 128K context window! This will be a game-changer for document analysis.",
      likes: 56,
      timestamp: "2026-01-24T09:00:00Z",
      replies: [],
    },
    {
      id: "c8",
      author: { id: "u2", name: "Mike Johnson", role: "VP Engineering", avatar: "MJ" },
      content: "Huge kudos to the AI team for pulling this off. The performance improvements are remarkable.",
      likes: 42,
      timestamp: "2026-01-24T09:30:00Z",
      replies: [],
    },
  ],
  "5": [
    {
      id: "c9",
      author: { id: "u8", name: "Alex Kim", role: "Staff Engineer", avatar: "AK" },
      content: "The Library looks amazing! Finally a quiet space for deep work. Can't wait to try the focus pods!",
      likes: 45,
      timestamp: "2026-01-23T11:00:00Z",
      replies: [],
    },
  ],
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function NewsDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // Get the post from centralized mock data
  const post = getNewsPostById(id);
  const comments = mockComments[id] || [];

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setNewComment("");
    setSubmittingComment(false);
  };

  // Get related posts (other posts from same author or department)
  const relatedPosts = mockNewsPosts
    .filter(p => p.id !== id && (p.department_id === post?.department_id || p.author_id === post?.author_id))
    .slice(0, 3);

  if (!post) {
    return (
      <div className="flex h-screen bg-[var(--bg-obsidian)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto ml-16">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <FadeIn>
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  News Post Not Found
                </h1>
                <p className="text-[var(--text-secondary)] mb-6">
                  The news post you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-ember)] text-white rounded-lg hover:bg-[var(--accent-ember-soft)] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to News
                </Link>
              </div>
            </FadeIn>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ml-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Back Button */}
          <FadeIn>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-ember)] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Link>
          </FadeIn>

          {/* Article Header */}
          <FadeIn delay={0.1}>
            <div className="mb-8">
              {post.pinned && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--accent-ember)]/20 text-[var(--accent-ember)] rounded-full text-xs mb-4">
                  <Pin className="w-3 h-3" />
                  Pinned
                </div>
              )}
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-ember)]/20 flex items-center justify-center text-[var(--accent-ember)] font-medium">
                    {post.author_avatar}
                  </div>
                  <div>
                    <Link href={`/people/${post.author_id.replace('user-', 'emp-')}`} className="text-[var(--text-primary)] font-medium hover:text-[var(--accent-ember)] transition-colors">
                      {post.author_name}
                    </Link>
                    <p className="text-xs text-[var(--text-muted)]">{post.author_role}</p>
                  </div>
                </div>
                <span className="text-[var(--text-muted)]">•</span>
                <div className="flex items-center gap-1 text-[var(--text-secondary)] text-sm">
                  <Clock className="w-4 h-4" />
                  {formatDate(post.published_at)}
                </div>
                <span className="text-[var(--text-muted)]">•</span>
                <div className="flex items-center gap-1 text-[var(--text-secondary)] text-sm">
                  <Eye className="w-4 h-4" />
                  {post.views_count.toLocaleString()} views
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Tags */}
          <FadeIn delay={0.15}>
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-full text-xs text-[var(--text-secondary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </FadeIn>

          {/* Article Content */}
          <FadeIn delay={0.2}>
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-8 mb-6">
              <div className="prose prose-invert max-w-none text-[var(--text-secondary)]">
                {post.content.split('\n').map((paragraph, index) => {
                  // Handle headers
                  if (paragraph.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-semibold text-[var(--text-primary)] mt-6 mb-3">{paragraph.slice(3)}</h2>;
                  }
                  if (paragraph.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-medium text-[var(--text-primary)] mt-4 mb-2">{paragraph.slice(4)}</h3>;
                  }
                  // Handle list items
                  if (paragraph.startsWith('- ')) {
                    return <li key={index} className="ml-4 mb-1">{paragraph.slice(2).replace(/\*\*([^*]+)\*\*/g, '$1')}</li>;
                  }
                  if (paragraph.match(/^\d+\. /)) {
                    return <li key={index} className="ml-4 mb-1">{paragraph.replace(/^\d+\. /, '').replace(/\*\*([^*]+)\*\*/g, '$1')}</li>;
                  }
                  // Handle table rows (basic)
                  if (paragraph.startsWith('|')) {
                    return null; // Skip tables for simplicity
                  }
                  // Regular paragraphs
                  if (paragraph.trim()) {
                    return <p key={index} className="mb-4">{paragraph.replace(/\*\*([^*]+)\*\*/g, '$1')}</p>;
                  }
                  return null;
                })}
              </div>
            </div>
          </FadeIn>

          {/* Attachments */}
          {post.attachments.length > 0 && (
            <FadeIn delay={0.25}>
              <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                  Attachments ({post.attachments.length})
                </h3>
                <div className="space-y-2">
                  {post.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      className="flex items-center gap-3 p-3 bg-[var(--bg-slate)] rounded-lg hover:bg-[var(--bg-obsidian)] transition-colors"
                    >
                      <div className="w-10 h-10 bg-[var(--accent-ember)]/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[var(--accent-ember)]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[var(--text-primary)] font-medium">{attachment.name}</p>
                        {attachment.size && (
                          <p className="text-xs text-[var(--text-muted)]">
                            {formatFileSize(attachment.size)}
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Actions Bar */}
          <FadeIn delay={0.3}>
            <div className="flex items-center justify-between p-4 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    liked
                      ? "bg-[var(--accent-ember)] text-white"
                      : "bg-[var(--bg-slate)] text-[var(--text-secondary)] hover:bg-[var(--bg-obsidian)]"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                  {post.likes_count + (liked ? 1 : 0)}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-slate)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-obsidian)] transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  {comments.length}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 bg-[var(--bg-slate)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-obsidian)] transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-colors ${
                    bookmarked
                      ? "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]"
                      : "bg-[var(--bg-slate)] text-[var(--text-secondary)] hover:bg-[var(--bg-obsidian)]"
                  }`}
                  title="Bookmark"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>
          </FadeIn>

          {/* Comments Section */}
          <FadeIn delay={0.35}>
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
                Comments ({comments.length})
              </h3>

              {/* New Comment Input */}
              <div className="flex gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-ember)]/20 flex items-center justify-center text-[var(--accent-ember)] font-medium flex-shrink-0">
                  U
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-3 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ember)] resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || submittingComment}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-ember)] text-white rounded-lg hover:bg-[var(--accent-ember-soft)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingComment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing Comments */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent-ember)]/20 flex items-center justify-center text-[var(--accent-ember)] font-medium flex-shrink-0">
                        {comment.author.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[var(--text-primary)] font-medium">
                            {comment.author.name}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {comment.author.role}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">•</span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {formatRelativeTime(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-[var(--text-secondary)] mb-2">{comment.content}</p>
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--accent-ember)] text-sm transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            {comment.likes}
                          </button>
                          <button className="text-[var(--text-muted)] hover:text-[var(--accent-ember)] text-sm transition-colors">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="ml-12 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/20 flex items-center justify-center text-[var(--accent-gold)] text-sm font-medium flex-shrink-0">
                              {reply.author.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[var(--text-primary)] font-medium text-sm">
                                  {reply.author.name}
                                </span>
                                <span className="text-xs text-[var(--text-muted)]">
                                  {formatRelativeTime(reply.timestamp)}
                                </span>
                              </div>
                              <p className="text-[var(--text-secondary)] text-sm">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <FadeIn delay={0.4}>
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                  Related Posts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/news/${relatedPost.id}`}
                      className="block p-4 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--accent-ember)]/50 transition-colors"
                    >
                      <h4 className="text-[var(--text-primary)] font-medium line-clamp-2 mb-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatRelativeTime(relatedPost.published_at)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </main>
    </div>
  );
}
