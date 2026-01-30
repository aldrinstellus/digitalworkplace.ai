"use client";

import { useState, useRef, useEffect } from "react";
import { motion as _motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { FadeIn as _FadeIn, StaggerContainer as _StaggerContainer, StaggerItem as _StaggerItem } from "@/lib/motion";
import { CreateChannelModal } from "@/components/channels/CreateChannelModal";
import { EmojiPicker } from "@/components/channels/EmojiPicker";
import {
  Hash,
  Lock,
  Plus,
  Search,
  Send,
  Smile,
  Paperclip,
  MoreHorizontal,
  Users,
  Settings2,
  Pin,
  Star,
  StarOff,
  Bell,
  BellOff,
  Trash2,
  Edit3 as _Edit3,
  Reply,
  AtSign,
  X as _X,
  Check as _Check,
  ChevronUp,
  ChevronDown,
  MessageCircleQuestion,
  CheckCircle2,
} from "lucide-react";

interface Channel {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  memberCount: number;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  lastMessage?: {
    author: string;
    content: string;
    time: string;
  };
}

interface Message {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: string;
  reactions: { emoji: string; count: number; users: string[] }[];
  replies?: number;
  isPinned?: boolean;
}

interface Question {
  id: string;
  title: string;
  author: string;
  votes: number;
  answers: number;
  hasAcceptedAnswer: boolean;
  timestamp: string;
  tags: string[];
}

// Mock Q&A data
const questions: Question[] = [
  {
    id: "q1",
    title: "How do I configure SSO for my department?",
    author: "John Smith",
    votes: 42,
    answers: 3,
    hasAcceptedAnswer: true,
    timestamp: "2 hours ago",
    tags: ["SSO", "IT", "Configuration"],
  },
  {
    id: "q2",
    title: "What's the process for requesting new software licenses?",
    author: "Maria Garcia",
    votes: 28,
    answers: 5,
    hasAcceptedAnswer: true,
    timestamp: "5 hours ago",
    tags: ["Software", "Procurement"],
  },
  {
    id: "q3",
    title: "How to access the VPN from home?",
    author: "Alex Chen",
    votes: 35,
    answers: 2,
    hasAcceptedAnswer: false,
    timestamp: "1 day ago",
    tags: ["VPN", "Remote Work"],
  },
  {
    id: "q4",
    title: "Where can I find the updated brand guidelines?",
    author: "Emily Davis",
    votes: 19,
    answers: 1,
    hasAcceptedAnswer: true,
    timestamp: "2 days ago",
    tags: ["Brand", "Design"],
  },
  {
    id: "q5",
    title: "What's the policy for expense reimbursements?",
    author: "Mike Johnson",
    votes: 15,
    answers: 0,
    hasAcceptedAnswer: false,
    timestamp: "3 days ago",
    tags: ["Finance", "Policy"],
  },
];

// Mock data
const channels: Channel[] = [
  {
    id: "1",
    name: "general",
    description: "Company-wide announcements and discussions",
    isPrivate: false,
    memberCount: 342,
    unreadCount: 5,
    isPinned: true,
    isMuted: false,
    lastMessage: { author: "Sarah", content: "Welcome to the new quarter!", time: "2m ago" },
  },
  {
    id: "2",
    name: "engineering",
    description: "Engineering team discussions",
    isPrivate: false,
    memberCount: 48,
    unreadCount: 12,
    isPinned: true,
    isMuted: false,
    lastMessage: { author: "Mike", content: "PR #234 is ready for review", time: "15m ago" },
  },
  {
    id: "3",
    name: "design",
    description: "Design team collaboration",
    isPrivate: false,
    memberCount: 24,
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    lastMessage: { author: "Anna", content: "New mockups are uploaded", time: "1h ago" },
  },
  {
    id: "4",
    name: "hr-private",
    description: "HR confidential discussions",
    isPrivate: true,
    memberCount: 8,
    unreadCount: 3,
    isPinned: false,
    isMuted: false,
    lastMessage: { author: "Lisa", content: "Updated the policy doc", time: "3h ago" },
  },
  {
    id: "5",
    name: "random",
    description: "Non-work banter and fun",
    isPrivate: false,
    memberCount: 289,
    unreadCount: 0,
    isPinned: false,
    isMuted: true,
    lastMessage: { author: "Tom", content: "Anyone up for lunch?", time: "5h ago" },
  },
  {
    id: "6",
    name: "product",
    description: "Product planning and roadmap",
    isPrivate: false,
    memberCount: 36,
    unreadCount: 8,
    isPinned: false,
    isMuted: false,
    lastMessage: { author: "James", content: "Q2 roadmap finalized", time: "1d ago" },
  },
];

const messages: Message[] = [
  {
    id: "1",
    author: { name: "Sarah Chen", avatar: "SC", role: "Engineering Lead" },
    content: "Hey everyone! Just pushed the new authentication flow to staging. Would love some feedback before we go to production.",
    timestamp: "10:23 AM",
    reactions: [
      { emoji: "👍", count: 5, users: ["Mike", "Anna", "Tom", "Lisa", "James"] },
      { emoji: "🚀", count: 3, users: ["Mike", "James", "Tom"] },
    ],
    replies: 4,
  },
  {
    id: "2",
    author: { name: "Mike Johnson", avatar: "MJ", role: "Senior Developer" },
    content: "Looks great! I noticed we might want to add rate limiting on the login endpoint. I can open a follow-up ticket.",
    timestamp: "10:28 AM",
    reactions: [{ emoji: "💯", count: 2, users: ["Sarah", "Anna"] }],
  },
  {
    id: "3",
    author: { name: "Anna Lee", avatar: "AL", role: "UX Designer" },
    content: "The new design is live on Figma if anyone wants to check it out. We addressed all the feedback from last week's review.",
    timestamp: "10:45 AM",
    reactions: [
      { emoji: "😍", count: 4, users: ["Sarah", "Mike", "Tom", "Lisa"] },
      { emoji: "🎨", count: 2, users: ["Sarah", "James"] },
    ],
    isPinned: true,
  },
  {
    id: "4",
    author: { name: "James Park", avatar: "JP", role: "Product Manager" },
    content: "@channel Quick reminder: Standup in 15 minutes. Please have your updates ready!",
    timestamp: "10:50 AM",
    reactions: [{ emoji: "✅", count: 8, users: ["Sarah", "Mike", "Anna", "Tom", "Lisa", "Alex", "Chris", "Emma"] }],
  },
];

type ActiveTab = "channels" | "qa";
type QASortBy = "recent" | "votes" | "unanswered";

export default function ChannelsPage() {
  const [channelList, setChannelList] = useState(channels);
  const [activeChannel, setActiveChannel] = useState(channels[1]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showChannelMenu, setShowChannelMenu] = useState<string | null>(null);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const [_showAttachmentMenu, _setShowAttachmentMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("channels");
  const [questionsList, setQuestionsList] = useState<Question[]>(questions);
  const [qaSortBy, setQaSortBy] = useState<QASortBy>("recent");
  const [qaSearchQuery, setQaSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredChannels = channelList.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChannels = filteredChannels.filter((c) => c.isPinned);
  const otherChannels = filteredChannels.filter((c) => !c.isPinned);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  // Handle create channel
  const handleCreateChannel = async (data: {
    name: string;
    description: string;
    isPrivate: boolean;
  }) => {
    const newChannel: Channel = {
      id: `ch-${Date.now()}`,
      name: data.name,
      description: data.description,
      isPrivate: data.isPrivate,
      memberCount: 1,
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
    };
    setChannelList((prev) => [...prev, newChannel]);
    setActiveChannel(newChannel);
    // In production, save to Supabase
  };

  // Handle channel actions
  const handlePinChannel = (channelId: string) => {
    setChannelList((prev) =>
      prev.map((ch) =>
        ch.id === channelId ? { ...ch, isPinned: !ch.isPinned } : ch
      )
    );
    setShowChannelMenu(null);
  };

  const handleMuteChannel = (channelId: string) => {
    setChannelList((prev) =>
      prev.map((ch) =>
        ch.id === channelId ? { ...ch, isMuted: !ch.isMuted } : ch
      )
    );
    setShowChannelMenu(null);
  };

  const handleLeaveChannel = (channelId: string) => {
    setChannelList((prev) => prev.filter((ch) => ch.id !== channelId));
    if (activeChannel.id === channelId) {
      setActiveChannel(channelList[0]);
    }
    setShowChannelMenu(null);
  };

  // Handle send message with persistence
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      author: {
        name: "You",
        avatar: "YO",
        role: "Team Member",
      },
      content: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      reactions: [],
    };

    setLocalMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
    // In production, save to Supabase and broadcast via WebSocket
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Handle file attachment
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to storage and add as message
      setMessageInput((prev) => prev + ` [File: ${file.name}]`);
    }
    _setShowAttachmentMenu(false);
  };

  // Handle message reaction
  const handleAddReaction = (messageId: string, emoji: string) => {
    setLocalMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, users: [...r.users, "You"] }
                : r
            ),
          };
        }
        return {
          ...msg,
          reactions: [...msg.reactions, { emoji, count: 1, users: ["You"] }],
        };
      })
    );
  };

  // Q&A functions
  const handleVote = (questionId: string, direction: "up" | "down") => {
    setQuestionsList((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, votes: q.votes + (direction === "up" ? 1 : -1) }
          : q
      )
    );
  };

  const sortedQuestions = [...questionsList]
    .filter(
      (q) =>
        q.title.toLowerCase().includes(qaSearchQuery.toLowerCase()) ||
        q.tags.some((t) => t.toLowerCase().includes(qaSearchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (qaSortBy) {
        case "votes":
          return b.votes - a.votes;
        case "unanswered":
          return a.answers - b.answers;
        default:
          return 0; // recent - keep original order
      }
    });

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />

      <main className="ml-16 h-screen flex">
        {/* Channels Sidebar */}
        <div className="w-64 border-r border-[var(--border-subtle)] bg-[var(--bg-charcoal)] flex flex-col">
          {/* Tab Header */}
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setActiveTab("channels")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "channels"
                    ? "bg-[var(--accent-ember)] text-white"
                    : "bg-white/5 text-[var(--text-secondary)] hover:bg-white/10"
                }`}
              >
                <Hash className="w-4 h-4" />
                Channels
              </button>
              <button
                onClick={() => setActiveTab("qa")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "qa"
                    ? "bg-[var(--accent-ember)] text-white"
                    : "bg-white/5 text-[var(--text-secondary)] hover:bg-white/10"
                }`}
              >
                <MessageCircleQuestion className="w-4 h-4" />
                Q&A
              </button>
            </div>
            <h2 className="text-lg font-medium text-[var(--text-primary)] mb-3">
              {activeTab === "channels" ? "Channels" : "Q&A Forums"}
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50"
              />
            </div>
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto p-2">
            {/* Pinned Channels */}
            {pinnedChannels.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 px-2 py-1 text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  <Pin className="w-3 h-3" />
                  Pinned
                </div>
                {pinnedChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isActive={activeChannel.id === channel.id}
                    onClick={() => setActiveChannel(channel)}
                    onMenuToggle={() => setShowChannelMenu(showChannelMenu === channel.id ? null : channel.id)}
                    showMenu={showChannelMenu === channel.id}
                    onPin={handlePinChannel}
                    onMute={handleMuteChannel}
                    onLeave={handleLeaveChannel}
                  />
                ))}
              </div>
            )}

            {/* Other Channels */}
            <div>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Channels</span>
                <button className="p-1 rounded hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              {otherChannels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isActive={activeChannel.id === channel.id}
                  onClick={() => setActiveChannel(channel)}
                  onMenuToggle={() => setShowChannelMenu(showChannelMenu === channel.id ? null : channel.id)}
                  showMenu={showChannelMenu === channel.id}
                  onPin={handlePinChannel}
                  onMute={handleMuteChannel}
                  onLeave={handleLeaveChannel}
                />
              ))}
            </div>
          </div>

          {/* Create Channel/Question */}
          <div className="p-3 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => setShowCreateChannel(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-[var(--text-primary)] text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              {activeTab === "channels" ? "Create Channel" : "Ask Question"}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {activeTab === "qa" ? (
            /* Q&A Section */
            <div className="flex-1 flex flex-col">
              {/* Q&A Header */}
              <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <MessageCircleQuestion className="w-5 h-5 text-[var(--accent-ember)]" />
                      Q&A Forums
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">Ask questions and get answers from the community</p>
                  </div>
                </div>
                {/* Search and Sort */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={qaSearchQuery}
                      onChange={(e) => setQaSearchQuery(e.target.value)}
                      placeholder="Search questions..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50"
                    />
                  </div>
                  <select
                    value={qaSortBy}
                    onChange={(e) => setQaSortBy(e.target.value as QASortBy)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm outline-none cursor-pointer"
                  >
                    <option value="recent">Recent</option>
                    <option value="votes">Most Votes</option>
                    <option value="unanswered">Unanswered</option>
                  </select>
                </div>
              </div>

              {/* Questions List */}
              <div className="flex-1 overflow-y-auto">
                {sortedQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="p-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex gap-4">
                      {/* Vote Controls */}
                      <div className="flex flex-col items-center gap-1 min-w-[50px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(question.id, "up");
                          }}
                          className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--accent-ember)] transition-colors"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                        <span className="text-lg font-bold text-[var(--text-primary)]">{question.votes}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(question.id, "down");
                          }}
                          className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-ember)] transition-colors">
                            {question.title}
                          </h3>
                          {question.hasAcceptedAnswer && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                          <span>Asked by {question.author}</span>
                          <span>•</span>
                          <span>{question.answers} {question.answers === 1 ? "answer" : "answers"}</span>
                          <span>•</span>
                          <span>{question.timestamp}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {question.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-[var(--accent-ember)]/10 text-[var(--accent-ember)] text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedQuestions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageCircleQuestion className="w-12 h-12 text-[var(--text-muted)]/30 mb-4" />
                    <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">No questions found</h3>
                    <p className="text-sm text-[var(--text-muted)]/70">
                      {qaSearchQuery ? "Try different search terms" : "Be the first to ask a question!"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Channels Chat Area */
            <>
          {/* Channel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                {activeChannel.isPrivate ? (
                  <Lock className="w-5 h-5 text-[var(--text-secondary)]" />
                ) : (
                  <Hash className="w-5 h-5 text-[var(--text-secondary)]" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
                  {activeChannel.name}
                  {activeChannel.isMuted && <BellOff className="w-4 h-4 text-[var(--text-primary)]/30" />}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">{activeChannel.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] transition-colors">
                <Users className="w-4 h-4" />
                <span className="text-sm">{activeChannel.memberCount}</span>
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] transition-colors">
                <Pin className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] transition-colors">
                <Settings2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {localMessages.map((message) => (
              <MessageItem key={message.id} message={message} onAddReaction={handleAddReaction} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="px-6 py-4 border-t border-[var(--border-subtle)]">
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-3 focus-within:border-[var(--accent-ember)]/50 transition-colors">
              <div className="flex items-end gap-3">
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Message #${activeChannel.name}`}
                    className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none resize-none text-sm min-h-[24px] max-h-[120px]"
                    rows={1}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                    <AtSign className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    {showEmojiPicker && (
                      <EmojiPicker
                        onSelect={handleEmojiSelect}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    )}
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="p-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] disabled:opacity-50 disabled:hover:bg-[var(--accent-ember)] text-[var(--text-primary)] transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--text-primary)]/30">
              Press Enter to send, Shift+Enter for new line. Use @username to mention someone.
            </p>
          </div>
          </>
          )}
        </div>
      </main>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <CreateChannelModal
          onClose={() => setShowCreateChannel(false)}
          onCreate={handleCreateChannel}
        />
      )}
    </div>
  );
}

// Channel Item Component
function ChannelItem({
  channel,
  isActive,
  onClick,
  onMenuToggle,
  showMenu,
  onPin,
  onMute,
  onLeave,
}: {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
  onMenuToggle: () => void;
  showMenu: boolean;
  onPin: (id: string) => void;
  onMute: (id: string) => void;
  onLeave: (id: string) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors group ${
          isActive ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]" : "hover:bg-white/5 text-[var(--text-secondary)]"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {channel.isPrivate ? (
            <Lock className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Hash className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="truncate text-sm">{channel.name}</span>
          {channel.isMuted && <BellOff className="w-3 h-3 text-[var(--text-primary)]/30" />}
        </div>
        <div className="flex items-center gap-1">
          {channel.unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[var(--accent-ember)] text-[var(--text-primary)] text-xs min-w-[20px] text-center">
              {channel.unreadCount}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle();
            }}
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </button>

      {/* Channel Menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={onMenuToggle} />
          <div className="absolute left-full top-0 ml-1 w-48 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl shadow-xl z-50 overflow-hidden">
            <button
              onClick={(e) => { e.stopPropagation(); onPin(channel.id); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-[var(--text-secondary)] text-sm transition-colors"
            >
              {channel.isPinned ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
              {channel.isPinned ? "Unpin" : "Pin"} channel
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMute(channel.id); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-[var(--text-secondary)] text-sm transition-colors"
            >
              {channel.isMuted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              {channel.isMuted ? "Unmute" : "Mute"} channel
            </button>
            <div className="border-t border-[var(--border-subtle)]" />
            <button
              onClick={(e) => { e.stopPropagation(); onLeave(channel.id); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-red-400 text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Leave channel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Message Item Component
function MessageItem({ message, onAddReaction }: { message: Message; onAddReaction: (messageId: string, emoji: string) => void }) {
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Pinned Badge */}
      {message.isPinned && (
        <div className="flex items-center gap-1 text-xs text-[var(--accent-gold)]/70 mb-1">
          <Pin className="w-3 h-3" />
          Pinned message
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center flex-shrink-0">
          <span className="text-[var(--text-primary)] text-sm font-medium">{message.author.avatar}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-[var(--text-primary)]">{message.author.name}</span>
            <span className="text-xs text-[var(--text-muted)]">{message.author.role}</span>
            <span className="text-xs text-[var(--text-primary)]/30">{message.timestamp}</span>
          </div>
          <p className="text-[var(--text-primary)]/80 text-sm mt-1">{message.content}</p>

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {message.reactions.map((reaction, idx) => (
                <button
                  key={idx}
                  onClick={() => onAddReaction(message.id, reaction.emoji)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-sm transition-colors"
                  title={reaction.users.join(", ")}
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-[var(--text-muted)]">{reaction.count}</span>
                </button>
              ))}
              <div className="relative">
                <button
                  onClick={() => setShowReactionPicker(!showReactionPicker)}
                  className="p-1 rounded-full hover:bg-white/5 text-[var(--text-primary)]/30 hover:text-[var(--text-muted)] transition-colors"
                >
                  <Smile className="w-4 h-4" />
                </button>
                {showReactionPicker && (
                  <div className="absolute bottom-full left-0 mb-2 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-lg p-2 flex gap-1 z-50">
                    {["👍", "❤️", "😀", "🎉", "🚀", "✅"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onAddReaction(message.id, emoji);
                          setShowReactionPicker(false);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Replies */}
          {message.replies && message.replies > 0 && (
            <button className="mt-2 text-sm text-[var(--accent-ember)] hover:text-blue-300 flex items-center gap-1">
              <Reply className="w-4 h-4" />
              {message.replies} {message.replies === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="absolute right-0 top-0 flex items-center gap-1 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-lg p-1">
            <div className="relative">
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="p-1.5 rounded hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
            <button className="p-1.5 rounded hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              <Reply className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              <Pin className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
