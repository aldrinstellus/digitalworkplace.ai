"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { FadeIn } from "@/lib/motion";
import {
  ArrowLeft,
  Hash,
  Lock,
  Users,
  Settings,
  Bell,
  BellOff,
  Star,
  Pin,
  Search,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Loader2,
  AlertCircle,
  AtSign,
  Image,
  File,
  Link2,
  Calendar,
  UserPlus,
  X,
  Check,
} from "lucide-react";

// Comprehensive mock channels data
const mockChannelsData: Record<string, ChannelDetail> = {
  "1": {
    id: "1",
    name: "general",
    description: "Company-wide announcements and updates. All employees are members of this channel.",
    type: "public",
    category: "Company",
    created_at: "2019-03-15T10:00:00Z",
    created_by: { id: "1", name: "Sarah Chen", avatar: "SC" },
    member_count: 156,
    is_member: true,
    is_muted: false,
    is_starred: true,
    pinned_messages: [
      {
        id: "pm1",
        author: { id: "1", name: "Sarah Chen", avatar: "SC", role: "CEO" },
        content: "Welcome to Digital Workplace AI! This is our main company channel for important announcements. Please keep conversations on-topic.",
        timestamp: "2019-03-15T10:00:00Z",
        reactions: [{ emoji: "👍", count: 89 }, { emoji: "🎉", count: 45 }],
      },
    ],
    recent_messages: [
      {
        id: "m1",
        author: { id: "1", name: "Sarah Chen", avatar: "SC", role: "CEO" },
        content: "🎉 Excited to share that we've closed Q4 with record-breaking results! Check out the full announcement in News. Thank you all for your incredible work!",
        timestamp: "2026-01-28T09:15:00Z",
        reactions: [{ emoji: "🎉", count: 78 }, { emoji: "🚀", count: 45 }, { emoji: "💪", count: 32 }],
        replies_count: 23,
        thread_preview: [
          { id: "t1", author: { name: "Mike Johnson", avatar: "MJ" }, content: "Amazing results! Proud of the whole team!" },
          { id: "t2", author: { name: "Lisa Park", avatar: "LP" }, content: "What a quarter! Let's keep the momentum going!" },
        ],
      },
      {
        id: "m2",
        author: { id: "3", name: "Lisa Park", avatar: "LP", role: "HR Director" },
        content: "📋 Reminder: Benefits enrollment closes on February 15th! Please make sure to review and submit your selections. Link to benefits portal: https://benefits.digitalworkplace.ai",
        timestamp: "2026-01-27T14:30:00Z",
        reactions: [{ emoji: "👍", count: 34 }, { emoji: "✅", count: 12 }],
        replies_count: 8,
        thread_preview: [],
      },
      {
        id: "m3",
        author: { id: "5", name: "Tom Chen", avatar: "TC", role: "Facilities Manager" },
        content: "🏢 Office renovation is complete! The new Innovation Hub, Library, and Rooftop Terrace are now open. Grand opening celebration this Friday at 3 PM!",
        timestamp: "2026-01-23T11:00:00Z",
        reactions: [{ emoji: "🎉", count: 67 }, { emoji: "☕", count: 23 }, { emoji: "🏢", count: 18 }],
        replies_count: 31,
        thread_preview: [
          { id: "t3", author: { name: "Jordan Williams", avatar: "JW" }, content: "The Library looks amazing! Can't wait to try the focus pods." },
        ],
      },
      {
        id: "m4",
        author: { id: "2", name: "Mike Johnson", avatar: "MJ", role: "VP Engineering" },
        content: "Welcome to our 17 new engineering team members joining this month! 🎉 Looking forward to what we'll build together. Full introductions coming in #engineering.",
        timestamp: "2026-01-22T10:00:00Z",
        reactions: [{ emoji: "👋", count: 89 }, { emoji: "🚀", count: 45 }, { emoji: "🎉", count: 34 }],
        replies_count: 42,
        thread_preview: [],
      },
    ],
    members: [
      { id: "1", name: "Sarah Chen", avatar: "SC", role: "CEO", status: "online" },
      { id: "2", name: "Mike Johnson", avatar: "MJ", role: "VP Engineering", status: "online" },
      { id: "3", name: "Lisa Park", avatar: "LP", role: "HR Director", status: "away" },
      { id: "4", name: "James Wilson", avatar: "JW", role: "Product Lead", status: "online" },
      { id: "5", name: "Emily Rodriguez", avatar: "ER", role: "VP Customer Success", status: "offline" },
    ],
    settings: {
      posting_permissions: "all_members",
      notification_preference: "all_messages",
    },
  },
  "2": {
    id: "2",
    name: "engineering",
    description: "Engineering team discussions, technical updates, and code reviews. For engineers and engineering-adjacent roles.",
    type: "public",
    category: "Engineering",
    created_at: "2019-04-01T10:00:00Z",
    created_by: { id: "2", name: "Mike Johnson", avatar: "MJ" },
    member_count: 68,
    is_member: true,
    is_muted: false,
    is_starred: true,
    pinned_messages: [
      {
        id: "pm2",
        author: { id: "2", name: "Mike Johnson", avatar: "MJ", role: "VP Engineering" },
        content: "📌 Engineering Team Guidelines:\n• Always create PRs for code changes\n• Require at least 2 reviews before merging\n• Use conventional commits\n• Update docs with API changes",
        timestamp: "2024-01-15T10:00:00Z",
        reactions: [{ emoji: "👍", count: 45 }],
      },
    ],
    recent_messages: [
      {
        id: "m5",
        author: { id: "7", name: "Alex Kim", avatar: "AK", role: "Staff Engineer" },
        content: "🚀 Just deployed the new caching layer to production. Seeing 40% reduction in API response times across the board. Dashboard: https://metrics.internal",
        timestamp: "2026-01-30T11:30:00Z",
        reactions: [{ emoji: "🚀", count: 34 }, { emoji: "🔥", count: 23 }, { emoji: "👏", count: 18 }],
        replies_count: 12,
        thread_preview: [
          { id: "t4", author: { name: "Mike Johnson", avatar: "MJ" }, content: "Incredible work! This is going to make a huge difference." },
        ],
      },
      {
        id: "m6",
        author: { id: "8", name: "Nina Patel", avatar: "NP", role: "Principal Platform Engineer" },
        content: "Heads up team: Kubernetes cluster maintenance scheduled for Saturday 2 AM - 4 AM PT. No expected downtime but monitoring closely. Runbook: https://docs.internal/k8s-maintenance",
        timestamp: "2026-01-30T09:00:00Z",
        reactions: [{ emoji: "👀", count: 15 }, { emoji: "✅", count: 8 }],
        replies_count: 5,
        thread_preview: [],
      },
      {
        id: "m7",
        author: { id: "9", name: "Jordan Williams", avatar: "JW", role: "Senior Frontend Engineer" },
        content: "RFC for the new component library is ready for review: https://docs.internal/rfc/component-library-v2\n\nTL;DR: Moving to Radix UI primitives + custom theming. Would love feedback especially on the accessibility approach.",
        timestamp: "2026-01-29T16:00:00Z",
        reactions: [{ emoji: "📖", count: 12 }, { emoji: "👍", count: 8 }],
        replies_count: 18,
        thread_preview: [
          { id: "t5", author: { name: "Sophie Anderson", avatar: "SA" }, content: "Love the accessibility-first approach! Left some comments on the RFC." },
        ],
      },
    ],
    members: [
      { id: "2", name: "Mike Johnson", avatar: "MJ", role: "VP Engineering", status: "online" },
      { id: "7", name: "Alex Kim", avatar: "AK", role: "Staff Engineer", status: "online" },
      { id: "8", name: "Nina Patel", avatar: "NP", role: "Principal Platform Engineer", status: "away" },
      { id: "9", name: "Jordan Williams", avatar: "JW", role: "Senior Frontend Engineer", status: "online" },
    ],
    settings: {
      posting_permissions: "all_members",
      notification_preference: "mentions_only",
    },
  },
  "3": {
    id: "3",
    name: "product",
    description: "Product discussions, roadmap updates, and feature planning. Join us in building the future!",
    type: "public",
    category: "Product",
    created_at: "2019-04-15T10:00:00Z",
    created_by: { id: "4", name: "James Wilson", avatar: "JW" },
    member_count: 42,
    is_member: true,
    is_muted: false,
    is_starred: false,
    pinned_messages: [],
    recent_messages: [
      {
        id: "m8",
        author: { id: "4", name: "James Wilson", avatar: "JW", role: "Product Lead" },
        content: "🎯 Q1 Roadmap is now live! Key themes:\n\n1. AI Assistant 3.0 enhancements\n2. Enterprise search improvements\n3. Mobile app launch\n4. Performance optimization\n\nFull roadmap: https://roadmap.internal",
        timestamp: "2026-01-28T10:00:00Z",
        reactions: [{ emoji: "🎯", count: 28 }, { emoji: "🚀", count: 19 }, { emoji: "👏", count: 15 }],
        replies_count: 14,
        thread_preview: [],
      },
      {
        id: "m9",
        author: { id: "12", name: "Rachel Kim", avatar: "RK", role: "Product Manager" },
        content: "User research insights from last week's interviews:\n\n• 8/10 users want better search filtering\n• Mobile usage up 35% in 6 months\n• Workflow automation is top requested feature\n\nFull report in Notion.",
        timestamp: "2026-01-27T15:00:00Z",
        reactions: [{ emoji: "📊", count: 18 }, { emoji: "👍", count: 12 }],
        replies_count: 9,
        thread_preview: [],
      },
    ],
    members: [
      { id: "4", name: "James Wilson", avatar: "JW", role: "Product Lead", status: "online" },
      { id: "12", name: "Rachel Kim", avatar: "RK", role: "Product Manager", status: "online" },
      { id: "13", name: "David Lee", avatar: "DL", role: "Product Designer", status: "away" },
    ],
    settings: {
      posting_permissions: "all_members",
      notification_preference: "all_messages",
    },
  },
  "4": {
    id: "4",
    name: "leadership-sync",
    description: "Private channel for leadership team discussions and strategic planning.",
    type: "private",
    category: "Executive",
    created_at: "2019-03-20T10:00:00Z",
    created_by: { id: "1", name: "Sarah Chen", avatar: "SC" },
    member_count: 8,
    is_member: true,
    is_muted: false,
    is_starred: true,
    pinned_messages: [],
    recent_messages: [
      {
        id: "m10",
        author: { id: "1", name: "Sarah Chen", avatar: "SC", role: "CEO" },
        content: "Board meeting prep: I've uploaded the Q4 deck to the shared drive. Please review before our sync Thursday. Key discussion points:\n\n• 2026 hiring plan\n• International expansion timeline\n• Product investment priorities",
        timestamp: "2026-01-29T17:00:00Z",
        reactions: [{ emoji: "👍", count: 5 }, { emoji: "✅", count: 3 }],
        replies_count: 4,
        thread_preview: [],
      },
    ],
    members: [
      { id: "1", name: "Sarah Chen", avatar: "SC", role: "CEO", status: "online" },
      { id: "2", name: "Mike Johnson", avatar: "MJ", role: "VP Engineering", status: "online" },
      { id: "3", name: "Lisa Park", avatar: "LP", role: "HR Director", status: "away" },
      { id: "4", name: "James Wilson", avatar: "JW", role: "Product Lead", status: "online" },
    ],
    settings: {
      posting_permissions: "all_members",
      notification_preference: "all_messages",
    },
  },
  "5": {
    id: "5",
    name: "random",
    description: "Non-work banter and water cooler chat. Have fun! 🎉",
    type: "public",
    category: "Social",
    created_at: "2019-03-15T12:00:00Z",
    created_by: { id: "1", name: "Sarah Chen", avatar: "SC" },
    member_count: 134,
    is_member: true,
    is_muted: true,
    is_starred: false,
    pinned_messages: [],
    recent_messages: [
      {
        id: "m11",
        author: { id: "15", name: "Chris O'Brien", avatar: "CO", role: "Senior CSM" },
        content: "Does anyone want to join a lunch run to the new ramen place? They have amazing tonkotsu! 🍜",
        timestamp: "2026-01-30T11:45:00Z",
        reactions: [{ emoji: "🍜", count: 8 }, { emoji: "👀", count: 5 }, { emoji: "🙋", count: 12 }],
        replies_count: 15,
        thread_preview: [
          { id: "t6", author: { name: "Priya Sharma", avatar: "PS" }, content: "Count me in!" },
          { id: "t7", author: { name: "Marcus Johnson", avatar: "MJ" }, content: "What time are you thinking?" },
        ],
      },
      {
        id: "m12",
        author: { id: "11", name: "Tom Martinez", avatar: "TM", role: "Recruiter" },
        content: "Friday trivia night is back! This week's theme: 90s Movies 🎬\n\nWhen: Friday 5:30 PM\nWhere: Rooftop Terrace\nPrizes: Gift cards and bragging rights\n\nRSVP in thread!",
        timestamp: "2026-01-29T16:30:00Z",
        reactions: [{ emoji: "🎬", count: 23 }, { emoji: "🍿", count: 15 }, { emoji: "🏆", count: 8 }],
        replies_count: 34,
        thread_preview: [],
      },
    ],
    members: [
      { id: "15", name: "Chris O'Brien", avatar: "CO", role: "Senior CSM", status: "online" },
      { id: "11", name: "Tom Martinez", avatar: "TM", role: "Recruiter", status: "online" },
      { id: "16", name: "Priya Sharma", avatar: "PS", role: "CSM", status: "away" },
    ],
    settings: {
      posting_permissions: "all_members",
      notification_preference: "nothing",
    },
  },
};

// Types
interface Author {
  id?: string;
  name: string;
  avatar: string;
  role?: string;
}

interface Reaction {
  emoji: string;
  count: number;
}

interface ThreadPreview {
  id: string;
  author: { name: string; avatar: string };
  content: string;
}

interface Message {
  id: string;
  author: Author;
  content: string;
  timestamp: string;
  reactions: Reaction[];
  replies_count?: number;
  thread_preview?: ThreadPreview[];
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: "online" | "away" | "offline";
}

interface ChannelDetail {
  id: string;
  name: string;
  description: string;
  type: "public" | "private";
  category: string;
  created_at: string;
  created_by: { id: string; name: string; avatar: string };
  member_count: number;
  is_member: boolean;
  is_muted: boolean;
  is_starred: boolean;
  pinned_messages: Message[];
  recent_messages: Message[];
  members: Member[];
  settings: {
    posting_permissions: string;
    notification_preference: string;
  };
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (days < 7) return date.toLocaleDateString("en-US", { weekday: "short" }) + " " + date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getStatusColor(status: string): string {
  switch (status) {
    case "online": return "bg-green-500";
    case "away": return "bg-yellow-500";
    case "offline": return "bg-gray-500";
    default: return "bg-gray-500";
  }
}

export default function ChannelDetailPage() {
  const params = useParams();
  const [channel, setChannel] = useState<ChannelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = params.id as string;
    setTimeout(() => {
      const channelData = mockChannelsData[id];
      setChannel(channelData || null);
      setIsStarred(channelData?.is_starred || false);
      setIsMuted(channelData?.is_muted || false);
      setLoading(false);
    }, 500);
  }, [params.id]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    console.log("Sending message:", message);
    setMessage("");
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[var(--bg-obsidian)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-[var(--accent-ember)] animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex h-screen bg-[var(--bg-obsidian)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <FadeIn>
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Channel Not Found</h1>
                <p className="text-[var(--text-secondary)] mb-6">The channel you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.</p>
                <a href="/diq/channels" className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-ember)] text-white rounded-lg">
                  <ArrowLeft className="w-4 h-4" /> Back to Channels
                </a>
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
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Channel Header */}
        <FadeIn>
          <div className="flex-shrink-0 px-6 py-4 bg-[var(--bg-charcoal)] border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <a href="/diq/channels" className="p-2 hover:bg-[var(--bg-slate)] rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                </a>
                <div className="flex items-center gap-2">
                  {channel.type === "private" ? (
                    <Lock className="w-5 h-5 text-[var(--text-muted)]" />
                  ) : (
                    <Hash className="w-5 h-5 text-[var(--text-muted)]" />
                  )}
                  <h1 className="text-xl font-semibold text-[var(--text-primary)]">{channel.name}</h1>
                </div>
                <span className="text-[var(--text-muted)]">•</span>
                <span className="text-sm text-[var(--text-secondary)]">{channel.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsStarred(!isStarred)}
                  className={`p-2 rounded-lg transition-colors ${isStarred ? "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]" : "hover:bg-[var(--bg-slate)] text-[var(--text-secondary)]"}`}
                  title={isStarred ? "Unstar" : "Star"}
                >
                  <Star className={`w-5 h-5 ${isStarred ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-lg transition-colors ${isMuted ? "bg-red-500/20 text-red-400" : "hover:bg-[var(--bg-slate)] text-[var(--text-secondary)]"}`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${showMembers ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]" : "hover:bg-[var(--bg-slate)] text-[var(--text-secondary)]"}`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-sm">{channel.member_count}</span>
                </button>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Pinned Messages */}
              {channel.pinned_messages.length > 0 && (
                <FadeIn delay={0.1}>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Pin className="w-4 h-4 text-[var(--accent-ember)]" />
                      <span className="text-sm font-medium text-[var(--text-secondary)]">Pinned</span>
                    </div>
                    {channel.pinned_messages.map((msg) => (
                      <div key={msg.id} className="p-4 bg-[var(--accent-ember)]/5 border border-[var(--accent-ember)]/20 rounded-xl mb-2">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--accent-ember)]/20 flex items-center justify-center text-[var(--accent-ember)] text-sm font-medium">
                            {msg.author.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-[var(--text-primary)]">{msg.author.name}</span>
                              <span className="text-xs text-[var(--text-muted)]">{formatTimestamp(msg.timestamp)}</span>
                            </div>
                            <p className="text-[var(--text-secondary)] whitespace-pre-line">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </FadeIn>
              )}

              {/* Messages */}
              <FadeIn delay={0.15}>
                <div className="space-y-4">
                  {channel.recent_messages.map((msg) => (
                    <div key={msg.id} className="group">
                      <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--bg-charcoal)] transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-gold)] flex items-center justify-center text-white font-medium">
                          {msg.author.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-[var(--text-primary)]">{msg.author.name}</span>
                            {msg.author.role && (
                              <span className="px-2 py-0.5 bg-[var(--bg-slate)] rounded text-xs text-[var(--text-muted)]">
                                {msg.author.role}
                              </span>
                            )}
                            <span className="text-xs text-[var(--text-muted)]">{formatTimestamp(msg.timestamp)}</span>
                          </div>
                          <p className="text-[var(--text-secondary)] whitespace-pre-line mb-2">{msg.content}</p>

                          {/* Reactions */}
                          {msg.reactions.length > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                              {msg.reactions.map((reaction, index) => (
                                <button
                                  key={index}
                                  className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-slate)] hover:bg-[var(--bg-obsidian)] rounded-full text-sm transition-colors"
                                >
                                  <span>{reaction.emoji}</span>
                                  <span className="text-[var(--text-muted)]">{reaction.count}</span>
                                </button>
                              ))}
                              <button className="p-1 hover:bg-[var(--bg-slate)] rounded transition-colors opacity-0 group-hover:opacity-100">
                                <Smile className="w-4 h-4 text-[var(--text-muted)]" />
                              </button>
                            </div>
                          )}

                          {/* Thread Preview */}
                          {msg.replies_count && msg.replies_count > 0 && (
                            <button className="flex items-center gap-2 text-[var(--accent-ember)] text-sm hover:underline">
                              <MessageSquare className="w-4 h-4" />
                              {msg.replies_count} {msg.replies_count === 1 ? "reply" : "replies"}
                              {msg.thread_preview && msg.thread_preview.length > 0 && (
                                <div className="flex -space-x-2 ml-2">
                                  {msg.thread_preview.slice(0, 3).map((reply) => (
                                    <div key={reply.id} className="w-5 h-5 rounded-full bg-[var(--bg-slate)] border border-[var(--bg-charcoal)] flex items-center justify-center text-[var(--text-muted)] text-xs">
                                      {reply.author.avatar.charAt(0)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </button>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button className="p-1.5 hover:bg-[var(--bg-slate)] rounded transition-colors">
                            <MessageSquare className="w-4 h-4 text-[var(--text-muted)]" />
                          </button>
                          <button className="p-1.5 hover:bg-[var(--bg-slate)] rounded transition-colors">
                            <Smile className="w-4 h-4 text-[var(--text-muted)]" />
                          </button>
                          <button className="p-1.5 hover:bg-[var(--bg-slate)] rounded transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-[var(--text-muted)]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <FadeIn delay={0.2}>
              <div className="flex-shrink-0 px-6 py-4 bg-[var(--bg-charcoal)] border-t border-[var(--border-subtle)]">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Message #${channel.name}`}
                      className="w-full px-4 py-3 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ember)] resize-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                      <button className="p-1.5 hover:bg-[var(--bg-obsidian)] rounded transition-colors">
                        <Paperclip className="w-4 h-4 text-[var(--text-muted)]" />
                      </button>
                      <button className="p-1.5 hover:bg-[var(--bg-obsidian)] rounded transition-colors">
                        <Smile className="w-4 h-4 text-[var(--text-muted)]" />
                      </button>
                      <button className="p-1.5 hover:bg-[var(--bg-obsidian)] rounded transition-colors">
                        <AtSign className="w-4 h-4 text-[var(--text-muted)]" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-3 bg-[var(--accent-ember)] text-white rounded-xl hover:bg-[var(--accent-ember-soft)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Members Sidebar */}
          {showMembers && (
            <FadeIn>
              <div className="w-72 flex-shrink-0 bg-[var(--bg-charcoal)] border-l border-[var(--border-subtle)] overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[var(--text-primary)]">Members ({channel.member_count})</h3>
                    <button onClick={() => setShowMembers(false)} className="p-1 hover:bg-[var(--bg-slate)] rounded transition-colors">
                      <X className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                  </div>

                  {/* Online */}
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">
                      Online — {channel.members.filter(m => m.status === "online").length}
                    </h4>
                    <div className="space-y-1">
                      {channel.members.filter(m => m.status === "online").map((member) => (
                        <a key={member.id} href={`/diq/people/${member.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-slate)] transition-colors">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-[var(--accent-ember)]/20 flex items-center justify-center text-[var(--accent-ember)] text-sm font-medium">
                              {member.avatar}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--bg-charcoal)] ${getStatusColor(member.status)}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[var(--text-primary)] truncate">{member.name}</p>
                            <p className="text-xs text-[var(--text-muted)] truncate">{member.role}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Away */}
                  {channel.members.filter(m => m.status === "away").length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">
                        Away — {channel.members.filter(m => m.status === "away").length}
                      </h4>
                      <div className="space-y-1">
                        {channel.members.filter(m => m.status === "away").map((member) => (
                          <a key={member.id} href={`/diq/people/${member.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-slate)] transition-colors">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-[var(--bg-slate)] flex items-center justify-center text-[var(--text-muted)] text-sm font-medium">
                                {member.avatar}
                              </div>
                              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--bg-charcoal)] ${getStatusColor(member.status)}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[var(--text-secondary)] truncate">{member.name}</p>
                              <p className="text-xs text-[var(--text-muted)] truncate">{member.role}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Offline */}
                  {channel.members.filter(m => m.status === "offline").length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">
                        Offline — {channel.members.filter(m => m.status === "offline").length}
                      </h4>
                      <div className="space-y-1">
                        {channel.members.filter(m => m.status === "offline").map((member) => (
                          <a key={member.id} href={`/diq/people/${member.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-slate)] transition-colors opacity-60">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-[var(--bg-slate)] flex items-center justify-center text-[var(--text-muted)] text-sm font-medium">
                                {member.avatar}
                              </div>
                              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--bg-charcoal)] ${getStatusColor(member.status)}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[var(--text-muted)] truncate">{member.name}</p>
                              <p className="text-xs text-[var(--text-muted)] truncate">{member.role}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </main>
    </div>
  );
}
