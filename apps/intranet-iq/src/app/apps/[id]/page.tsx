"use client";

import { useParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft, MessageSquare, Hash, Lock, Users, Search, Send, Paperclip, Smile, AtSign, Phone,
  CheckCircle2, Circle, AlertCircle, Clock, GitBranch, GitPullRequest, GitMerge, Code, Eye,
  FileText, Folder, Star, Share2, MoreHorizontal, Download, ThumbsUp, MessageCircle, Image,
  Video, Calendar, PlayCircle, ExternalLink, Plus, Settings, Filter, ChevronRight, ChevronDown,
  RefreshCw, TrendingUp, DollarSign, Target, Award, Bell, Briefcase, UserPlus, Home, Bookmark,
  Grid3X3, List, Info, Edit3, Copy, Trash2, MoreVertical, Headphones, Mic, MicOff, VideoOff,
  Monitor, Layout, Type, Square, MousePointer, Pencil, Move, Layers, Maximize2, MinusSquare,
  PlusSquare, AlignLeft, Bold, Italic, Underline, Link2, ListOrdered, Quote, Table, Minus,
  Globe, Building2, GraduationCap, MapPin, Heart, Repeat2, Send as SendIcon, ImageIcon
} from "lucide-react";
import { FadeIn } from "@/lib/motion";
import { AppShortcutsBar } from "@/components/dashboard/AppShortcutsBar";

export default function AppDetailPage() {
  const params = useParams();
  const appId = params.id as string;

  const appInfo: Record<string, { name: string; icon: string; color: string }> = {
    slack: { name: "Slack", icon: "💬", color: "bg-[#611f69]" },
    jira: { name: "Jira", icon: "🎯", color: "bg-[#0052CC]" },
    github: { name: "GitHub", icon: "🐙", color: "bg-[#24292f]" },
    drive: { name: "Google Drive", icon: "📁", color: "bg-white" },
    zoom: { name: "Zoom", icon: "🎥", color: "bg-[#2D8CFF]" },
    confluence: { name: "Confluence", icon: "📝", color: "bg-[#0052CC]" },
    salesforce: { name: "Salesforce", icon: "☁️", color: "bg-[#00A1E0]" },
    figma: { name: "Figma", icon: "🎨", color: "bg-[#1e1e1e]" },
    notion: { name: "Notion", icon: "📓", color: "bg-white" },
    linkedin: { name: "LinkedIn", icon: "💼", color: "bg-[#0A66C2]" },
  };

  const app = appInfo[appId];

  if (!app) {
    return (
      <div className="min-h-screen bg-[var(--bg-obsidian)]">
        <Sidebar />
        <main className="ml-16 mr-20 p-6">
          <div className="max-w-4xl mx-auto text-center py-20">
            <h1 className="text-2xl text-[var(--text-primary)]">App not found</h1>
            <Link href="/dashboard" className="text-[var(--accent-ember)] mt-4 inline-block">
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const renderApp = () => {
    switch (appId) {
      case "slack": return <SlackApp />;
      case "jira": return <JiraApp />;
      case "github": return <GitHubApp />;
      case "drive": return <DriveApp />;
      case "zoom": return <ZoomApp />;
      case "confluence": return <ConfluenceApp />;
      case "salesforce": return <SalesforceApp />;
      case "figma": return <FigmaApp />;
      case "notion": return <NotionApp />;
      case "linkedin": return <LinkedInApp />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />
      <main className="ml-16 mr-20 h-screen overflow-hidden">
        {/* Back button overlay */}
        <Link
          href="/dashboard"
          className="fixed top-4 left-20 z-50 p-2 rounded-lg bg-black/50 backdrop-blur text-white/70 hover:text-white hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <FadeIn className="h-full">
          {renderApp()}
        </FadeIn>
      </main>
      {/* App Shortcuts Bar */}
      <AppShortcutsBar />
    </div>
  );
}

// ============================================================================
// SLACK - Authentic Interface Replica
// ============================================================================
function SlackApp() {
  const [selectedChannel, setSelectedChannel] = useState("engineering");

  const workspaces = [{ name: "Digital Workplace", icon: "DW" }];
  const channels = [
    { id: "general", name: "general", unread: 3, isPrivate: false },
    { id: "engineering", name: "engineering", unread: 12, isPrivate: false },
    { id: "product-launch", name: "product-launch", unread: 0, isPrivate: true },
    { id: "design", name: "design", unread: 5, isPrivate: false },
    { id: "random", name: "random", unread: 24, isPrivate: false },
    { id: "help-requests", name: "help-requests", unread: 0, isPrivate: false },
  ];
  const dms = [
    { id: "sarah", name: "Sarah Chen", status: "online", unread: 2 },
    { id: "mike", name: "Mike Johnson", status: "away", unread: 0 },
    { id: "alex", name: "Alex Kim", status: "dnd", unread: 0 },
    { id: "emily", name: "Emily Rodriguez", status: "offline", unread: 1 },
  ];

  const messages = [
    { id: 1, user: "Sarah Chen", avatar: "SC", time: "9:42 AM", content: "Good morning team! 👋 Just pushed the latest updates to the staging environment. Please take a look when you get a chance.", reactions: [{ emoji: "👍", count: 5 }, { emoji: "🎉", count: 3 }] },
    { id: 2, user: "Mike Johnson", avatar: "MJ", time: "9:45 AM", content: "Awesome! I'll review it right after standup. Quick question - did you include the fix for the notification bug?", thread: { count: 4, lastReply: "10:12 AM" } },
    { id: 3, user: "Sarah Chen", avatar: "SC", time: "9:47 AM", content: "Yes! That's in there. Here's the PR for reference:", attachment: { type: "link", title: "fix: notification timing issue #2847", url: "github.com/..." } },
    { id: 4, user: "Alex Kim", avatar: "AK", time: "10:15 AM", content: "```\nconst handleNotification = async (event) => {\n  await processQueue(event.data);\n  dispatch({ type: 'NOTIFICATION_RECEIVED' });\n};\n```\nThis is the updated handler - much cleaner now!", reactions: [{ emoji: "💯", count: 2 }] },
    { id: 5, user: "Emily Rodriguez", avatar: "ER", time: "10:32 AM", content: "@channel Reminder: Sprint planning in 30 minutes! Please review the backlog items before the meeting.", reactions: [{ emoji: "✅", count: 8 }, { emoji: "👀", count: 4 }], mention: true },
  ];

  return (
    <div className="h-full flex bg-[#1a1d21]">
      {/* Workspace Sidebar */}
      <div className="w-[70px] bg-[#3f0e40] flex flex-col items-center py-3 gap-3">
        {workspaces.map((ws, i) => (
          <div key={i} className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:rounded-xl transition-all">
            {ws.icon}
          </div>
        ))}
        <div className="w-9 h-9 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center text-white/50 cursor-pointer hover:border-white/50 transition-colors">
          <Plus className="w-5 h-5" />
        </div>
      </div>

      {/* Channel Sidebar */}
      <div className="w-[260px] bg-[#3f0e40] flex flex-col">
        {/* Workspace Header */}
        <div className="h-[49px] px-4 flex items-center justify-between border-b border-white/10">
          <button className="flex items-center gap-1 text-white font-bold text-lg hover:bg-white/10 px-2 py-1 rounded">
            Digital Workplace <ChevronDown className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-2 py-2 space-y-0.5">
          <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[#cfc3cf] hover:bg-white/10 rounded text-[15px]">
            <Home className="w-4 h-4" /> Home
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[#cfc3cf] hover:bg-white/10 rounded text-[15px]">
            <MessageSquare className="w-4 h-4" /> DMs
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[#cfc3cf] hover:bg-white/10 rounded text-[15px]">
            <Bell className="w-4 h-4" /> Activity
            <span className="ml-auto bg-[#cd2553] text-white text-xs px-1.5 rounded">12</span>
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[#cfc3cf] hover:bg-white/10 rounded text-[15px]">
            <Bookmark className="w-4 h-4" /> Later
          </button>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="flex items-center justify-between px-3 py-1 text-[#9b8f9b] text-sm">
            <span className="flex items-center gap-1"><ChevronDown className="w-3 h-3" /> Channels</span>
            <Plus className="w-4 h-4 hover:text-white cursor-pointer" />
          </div>
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id)}
              className={`w-full flex items-center gap-2 px-3 py-1 rounded text-[15px] ${selectedChannel === ch.id ? 'bg-[#1164a3] text-white' : 'text-[#cfc3cf] hover:bg-white/10'}`}
            >
              {ch.isPrivate ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
              <span className="truncate">{ch.name}</span>
              {ch.unread > 0 && <span className="ml-auto bg-[#cd2553] text-white text-xs px-1.5 rounded-full">{ch.unread}</span>}
            </button>
          ))}

          <div className="flex items-center justify-between px-3 py-1 mt-4 text-[#9b8f9b] text-sm">
            <span className="flex items-center gap-1"><ChevronDown className="w-3 h-3" /> Direct messages</span>
            <Plus className="w-4 h-4 hover:text-white cursor-pointer" />
          </div>
          {dms.map((dm) => (
            <button key={dm.id} className="w-full flex items-center gap-2 px-3 py-1 text-[#cfc3cf] hover:bg-white/10 rounded text-[15px]">
              <span className={`w-2 h-2 rounded-full ${dm.status === 'online' ? 'bg-[#2bac76]' : dm.status === 'away' ? 'bg-[#e8912d]' : dm.status === 'dnd' ? 'bg-[#cd2553]' : 'bg-transparent border border-[#9b8f9b]'}`} />
              <span className="truncate">{dm.name}</span>
              {dm.unread > 0 && <span className="ml-auto bg-[#cd2553] text-white text-xs px-1.5 rounded-full">{dm.unread}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#1a1d21]">
        {/* Channel Header */}
        <div className="h-[49px] px-4 flex items-center justify-between border-b border-[#3b3b3b]">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-[#e0e0e0]" />
            <span className="text-white font-bold">{selectedChannel}</span>
            <ChevronDown className="w-4 h-4 text-[#ababad]" />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1 text-[#e0e0e0] hover:bg-[#3a3a3a] rounded text-sm">
              <Headphones className="w-4 h-4" /> Huddle
            </button>
            <div className="h-5 w-px bg-[#3b3b3b]" />
            <button className="flex items-center gap-1 px-2 py-1 text-[#ababad] hover:bg-[#3a3a3a] rounded">
              <Users className="w-4 h-4" /> 47
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 group ${msg.mention ? 'bg-[#f8e9a1]/10 -mx-5 px-5 py-2 border-l-4 border-[#f8e9a1]' : ''}`}>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#36c5f0] to-[#2eb67d] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {msg.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-[#e0e0e0] hover:underline cursor-pointer">{msg.user}</span>
                  <span className="text-xs text-[#ababad]">{msg.time}</span>
                </div>
                <p className="text-[#e0e0e0] mt-0.5 whitespace-pre-wrap">{msg.content}</p>
                {msg.attachment && (
                  <div className="mt-2 border border-[#3b3b3b] rounded-lg p-3 max-w-md bg-[#222529]">
                    <div className="flex items-center gap-2 text-[#1d9bd1] text-sm hover:underline cursor-pointer">
                      <GitPullRequest className="w-4 h-4" />
                      {msg.attachment.title}
                    </div>
                  </div>
                )}
                {msg.reactions && (
                  <div className="flex gap-1 mt-1">
                    {msg.reactions.map((r, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-[#2e2e30] hover:bg-[#3a3a3c] rounded-full text-sm cursor-pointer border border-[#3b3b3b]">
                        {r.emoji} <span className="text-[#1d9bd1]">{r.count}</span>
                      </span>
                    ))}
                    <button className="px-2 py-0.5 bg-[#2e2e30] hover:bg-[#3a3a3c] rounded-full text-sm text-[#ababad] border border-transparent hover:border-[#3b3b3b] opacity-0 group-hover:opacity-100 transition-opacity">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {msg.thread && (
                  <button className="flex items-center gap-2 mt-2 text-[#1d9bd1] text-sm hover:underline">
                    <MessageSquare className="w-4 h-4" />
                    {msg.thread.count} replies <span className="text-[#ababad]">Last reply {msg.thread.lastReply}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="px-5 pb-4">
          <div className="border border-[#5c5c5c] rounded-lg bg-[#222529]">
            <div className="flex items-center gap-1 px-3 py-2 border-b border-[#3b3b3b]">
              <button className="p-1.5 hover:bg-[#3a3a3a] rounded text-[#ababad]"><Bold className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-[#3a3a3a] rounded text-[#ababad]"><Italic className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-[#3a3a3a] rounded text-[#ababad]"><Code className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-[#3a3a3a] rounded text-[#ababad]"><Link2 className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-[#3a3a3a] rounded text-[#ababad]"><ListOrdered className="w-4 h-4" /></button>
            </div>
            <div className="px-3 py-3">
              <input type="text" placeholder={`Message #${selectedChannel}`} className="w-full bg-transparent text-[#e0e0e0] placeholder-[#ababad] focus:outline-none" />
            </div>
            <div className="flex items-center justify-between px-3 py-2 border-t border-[#3b3b3b]">
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-[#3a3a3a] rounded text-[#ababad]"><Plus className="w-5 h-5" /></button>
                <button className="p-1.5 hover:bg-[#3a3a3a] rounded text-[#ababad]"><Smile className="w-5 h-5" /></button>
                <button className="p-1.5 hover:bg-[#3a3a3a] rounded text-[#ababad]"><AtSign className="w-5 h-5" /></button>
                <button className="p-1.5 hover:bg-[#3a3a3a] rounded text-[#ababad]"><Mic className="w-5 h-5" /></button>
              </div>
              <button className="p-2 bg-[#007a5a] hover:bg-[#148567] rounded text-white"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Thread/Details Sidebar */}
      <div className="w-[320px] border-l border-[#3b3b3b] bg-[#1a1d21] hidden lg:block">
        <div className="h-[49px] px-4 flex items-center justify-between border-b border-[#3b3b3b]">
          <span className="text-white font-bold">Thread</span>
          <button className="text-[#ababad] hover:text-white"><Minus className="w-5 h-5" /></button>
        </div>
        <div className="p-4 text-center text-[#ababad] text-sm">
          Click on a thread to view replies
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// JIRA - Sprint Board Interface
// ============================================================================
function JiraApp() {
  const columns = [
    { id: "todo", name: "TO DO", count: 4, color: "bg-gray-500" },
    { id: "inprogress", name: "IN PROGRESS", count: 3, color: "bg-blue-500" },
    { id: "review", name: "IN REVIEW", count: 2, color: "bg-purple-500" },
    { id: "done", name: "DONE", count: 5, color: "bg-green-500" },
  ];

  const tickets = {
    todo: [
      { key: "DIQ-1240", title: "Add keyboard shortcuts for power users", type: "task", priority: "medium", assignee: "JW", points: 5 },
      { key: "DIQ-1241", title: "Implement dark mode toggle", type: "story", priority: "low", assignee: "AK", points: 3 },
      { key: "DIQ-1242", title: "Update API documentation", type: "task", priority: "low", assignee: null, points: 2 },
      { key: "DIQ-1243", title: "Performance optimization for search", type: "story", priority: "high", assignee: "MJ", points: 8 },
    ],
    inprogress: [
      { key: "DIQ-1234", title: "Implement real-time notification system", type: "story", priority: "high", assignee: "MJ", points: 8 },
      { key: "DIQ-1238", title: "Integrate with Microsoft 365 Calendar", type: "story", priority: "high", assignee: "LP", points: 13, blocked: true },
      { key: "DIQ-1239", title: "Create onboarding flow for new users", type: "story", priority: "medium", assignee: "ER", points: 5 },
    ],
    review: [
      { key: "DIQ-1235", title: "[BUG] Search results not updating after deletion", type: "bug", priority: "highest", assignee: "AK", points: 3 },
      { key: "DIQ-1237", title: "Add user activity analytics dashboard", type: "story", priority: "medium", assignee: "SC", points: 8 },
    ],
    done: [
      { key: "DIQ-1230", title: "Set up CI/CD pipeline", type: "task", priority: "high", assignee: "AK", points: 5 },
      { key: "DIQ-1231", title: "Create component library documentation", type: "task", priority: "medium", assignee: "JW", points: 3 },
      { key: "DIQ-1232", title: "Implement user authentication", type: "story", priority: "highest", assignee: "MJ", points: 13 },
      { key: "DIQ-1233", title: "Design system color tokens", type: "task", priority: "medium", assignee: "JW", points: 2 },
      { key: "DIQ-1229", title: "Database schema migration", type: "task", priority: "high", assignee: "AK", points: 5 },
    ],
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug": return <span className="w-4 h-4 rounded-sm bg-red-500 flex items-center justify-center text-white text-[10px]">🐛</span>;
      case "story": return <span className="w-4 h-4 rounded-sm bg-green-500 flex items-center justify-center text-white text-[10px]">📖</span>;
      case "task": return <span className="w-4 h-4 rounded-sm bg-blue-500 flex items-center justify-center text-white text-[10px]">✓</span>;
      default: return null;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "highest": return <span className="text-red-500">⬆⬆</span>;
      case "high": return <span className="text-orange-500">⬆</span>;
      case "medium": return <span className="text-yellow-500">=</span>;
      case "low": return <span className="text-blue-500">⬇</span>;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1d2125]">
      {/* Top Navigation */}
      <div className="h-14 bg-[#1d2125] border-b border-[#3b3b3b] flex items-center px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-[#0052CC] rounded flex items-center justify-center text-white text-xs font-bold">DI</span>
            <span className="text-[#b6c2cf] font-medium">dIQ Project</span>
          </div>
          <nav className="flex items-center gap-1 ml-8">
            <button className="px-3 py-1.5 text-[#b6c2cf] hover:bg-[#3b3b3b] rounded">Summary</button>
            <button className="px-3 py-1.5 bg-[#3b3b3b] text-white rounded">Board</button>
            <button className="px-3 py-1.5 text-[#b6c2cf] hover:bg-[#3b3b3b] rounded">Backlog</button>
            <button className="px-3 py-1.5 text-[#b6c2cf] hover:bg-[#3b3b3b] rounded">Timeline</button>
            <button className="px-3 py-1.5 text-[#b6c2cf] hover:bg-[#3b3b3b] rounded">Reports</button>
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a869a]" />
            <input type="text" placeholder="Search" className="w-48 pl-9 pr-3 py-1.5 bg-[#22272b] border border-[#3b3b3b] rounded text-[#b6c2cf] text-sm placeholder-[#7a869a] focus:outline-none focus:border-[#579dff]" />
          </div>
          <button className="px-3 py-1.5 bg-[#579dff] text-[#1d2125] rounded font-medium text-sm">Create</button>
        </div>
      </div>

      {/* Board Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-[#b6c2cf]">Sprint 14</h1>
          <p className="text-sm text-[#7a869a] mt-1">Jan 27 - Feb 10, 2026 • 8 days remaining</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {["SC", "MJ", "AK", "ER", "JW"].map((a, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#36c5f0] to-[#2eb67d] flex items-center justify-center text-white text-xs font-bold border-2 border-[#1d2125]">{a}</div>
            ))}
          </div>
          <button className="px-3 py-1.5 border border-[#3b3b3b] rounded text-[#b6c2cf] text-sm hover:bg-[#3b3b3b]">Complete Sprint</button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 px-6 pb-6 overflow-x-auto">
        <div className="flex gap-3 h-full min-w-max">
          {columns.map((col) => (
            <div key={col.id} className="w-72 bg-[#161a1d] rounded-lg flex flex-col">
              <div className="px-3 py-3 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="text-xs font-medium text-[#7a869a] uppercase">{col.name}</span>
                <span className="text-xs text-[#7a869a]">{col.count}</span>
              </div>
              <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto">
                {tickets[col.id as keyof typeof tickets]?.map((ticket) => (
                  <motion.div
                    key={ticket.key}
                    className={`bg-[#22272b] p-3 rounded shadow-sm hover:bg-[#282e33] cursor-pointer border-l-2 ${'blocked' in ticket && ticket.blocked ? 'border-red-500' : 'border-transparent'}`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-[#b6c2cf] line-clamp-2">{ticket.title}</p>
                      {'blocked' in ticket && ticket.blocked && <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded">BLOCKED</span>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(ticket.type)}
                        <span className="text-xs text-[#579dff]">{ticket.key}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(ticket.priority)}
                        <span className="w-5 h-5 bg-[#3b3b3b] rounded-full flex items-center justify-center text-[10px] text-[#b6c2cf]">{ticket.points}</span>
                        {ticket.assignee && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#36c5f0] to-[#2eb67d] flex items-center justify-center text-white text-[10px] font-bold">{ticket.assignee}</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GITHUB - Pull Request Interface
// ============================================================================
function GitHubApp() {
  const [activeTab, setActiveTab] = useState("files");

  const prData = {
    title: "feat: implement WebSocket-based real-time notifications",
    number: 2846,
    state: "open",
    author: "mikejohnson",
    branch: { from: "feature/realtime-notifications", to: "main" },
    commits: 12,
    additions: 1847,
    deletions: 234,
    files: 28,
    reviewers: [
      { name: "alexkim", status: "approved" },
      { name: "emilyrodriguez", status: "approved" },
    ],
    checks: [
      { name: "CI / Build", status: "success" },
      { name: "CI / Unit Tests", status: "success" },
      { name: "CI / Integration Tests", status: "success" },
      { name: "Security Scan", status: "success" },
      { name: "Code Coverage (87%)", status: "success" },
    ],
  };

  const files = [
    { name: "src/lib/websocket/client.ts", additions: 245, deletions: 0, status: "added" },
    { name: "src/lib/websocket/server.ts", additions: 312, deletions: 0, status: "added" },
    { name: "src/hooks/useNotifications.ts", additions: 89, deletions: 23, status: "modified" },
    { name: "src/components/NotificationBell.tsx", additions: 156, deletions: 45, status: "modified" },
    { name: "src/app/api/notifications/route.ts", additions: 67, deletions: 12, status: "modified" },
    { name: "package.json", additions: 3, deletions: 1, status: "modified" },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* GitHub Header */}
      <div className="h-16 bg-[#161b22] border-b border-[#30363d] flex items-center px-6">
        <div className="flex items-center gap-4">
          <span className="text-2xl">🐙</span>
          <nav className="flex items-center text-sm text-[#c9d1d9]">
            <a href="#" className="hover:text-[#58a6ff]">digitalworkplace</a>
            <span className="mx-1 text-[#484f58]">/</span>
            <a href="#" className="font-semibold hover:text-[#58a6ff]">intranet-iq</a>
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
            <input type="text" placeholder="Type / to search" className="w-72 pl-9 pr-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] text-sm placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff]" />
          </div>
          <Bell className="w-5 h-5 text-[#c9d1d9]" />
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
        </div>
      </div>

      {/* PR Header */}
      <div className="px-8 py-6 border-b border-[#30363d]">
        <div className="flex items-start gap-3">
          <span className="px-2.5 py-1 bg-[#238636] text-white text-sm font-medium rounded-full flex items-center gap-1">
            <GitPullRequest className="w-4 h-4" /> Open
          </span>
          <div>
            <h1 className="text-xl font-semibold text-[#c9d1d9]">{prData.title} <span className="font-normal text-[#484f58]">#{prData.number}</span></h1>
            <p className="text-sm text-[#8b949e] mt-1">
              <span className="font-medium text-[#c9d1d9]">{prData.author}</span> wants to merge {prData.commits} commits into <code className="px-1.5 py-0.5 bg-[#388bfd26] text-[#58a6ff] rounded">{prData.branch.to}</code> from <code className="px-1.5 py-0.5 bg-[#388bfd26] text-[#58a6ff] rounded">{prData.branch.from}</code>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mt-6 border-b border-[#30363d] -mb-px">
          {[
            { id: "conversation", label: "Conversation", count: 8 },
            { id: "commits", label: "Commits", count: prData.commits },
            { id: "checks", label: "Checks", count: prData.checks.length },
            { id: "files", label: "Files changed", count: prData.files },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm flex items-center gap-2 border-b-2 -mb-px ${activeTab === tab.id ? 'border-[#f78166] text-[#c9d1d9]' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'}`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-[#30363d] text-[#c9d1d9]' : 'bg-[#21262d] text-[#8b949e]'}`}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "files" && (
            <div className="p-6">
              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <span className="text-[#c9d1d9]">Showing <strong>{files.length}</strong> changed files with <strong className="text-[#3fb950]">{prData.additions} additions</strong> and <strong className="text-[#f85149]">{prData.deletions} deletions</strong></span>
              </div>

              {/* File List */}
              <div className="border border-[#30363d] rounded-md overflow-hidden">
                {files.map((file, i) => (
                  <div key={i} className="border-b border-[#30363d] last:border-b-0">
                    <div className="px-4 py-2 bg-[#161b22] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#8b949e]" />
                        <span className="text-sm text-[#c9d1d9] font-mono">{file.name}</span>
                        {file.status === "added" && <span className="px-1.5 py-0.5 bg-[#238636] text-white text-[10px] rounded">NEW</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#3fb950]">+{file.additions}</span>
                        <span className="text-[#f85149]">-{file.deletions}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-[#0d1117] font-mono text-xs">
                      <div className="flex">
                        <div className="w-12 text-right pr-4 text-[#484f58] select-none">1</div>
                        <div className="flex-1 bg-[#2ea04326] text-[#c9d1d9] px-2">+ import {'{ WebSocket }'} from &apos;ws&apos;;</div>
                      </div>
                      <div className="flex">
                        <div className="w-12 text-right pr-4 text-[#484f58] select-none">2</div>
                        <div className="flex-1 bg-[#2ea04326] text-[#c9d1d9] px-2">+ import {'{ EventEmitter }'} from &apos;events&apos;;</div>
                      </div>
                      <div className="flex">
                        <div className="w-12 text-right pr-4 text-[#484f58] select-none">3</div>
                        <div className="flex-1 text-[#c9d1d9] px-2">&nbsp;</div>
                      </div>
                      <div className="text-center text-[#8b949e] py-2">... collapsed lines ...</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-[#30363d] p-4 overflow-y-auto">
          {/* Reviewers */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#c9d1d9] mb-2">Reviewers</h3>
            {prData.reviewers.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500" />
                  <span className="text-sm text-[#c9d1d9]">{r.name}</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#238636]" />
              </div>
            ))}
          </div>

          {/* Checks */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#c9d1d9] mb-2">Checks</h3>
            <div className="space-y-2">
              {prData.checks.map((check, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#238636]" />
                  <span className="text-[#8b949e]">{check.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Merge Button */}
          <button className="w-full py-2 bg-[#238636] hover:bg-[#2ea043] text-white font-medium rounded-md flex items-center justify-center gap-2">
            <GitMerge className="w-4 h-4" /> Merge pull request
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GOOGLE DRIVE - File Manager Interface
// ============================================================================
function DriveApp() {
  const [view, setView] = useState<"list" | "grid">("list");

  const folders = [
    { name: "Engineering", items: 24, color: "#4285f4" },
    { name: "Product", items: 18, color: "#ea4335" },
    { name: "Design", items: 12, color: "#fbbc04" },
    { name: "Marketing", items: 31, color: "#34a853" },
  ];

  const files = [
    { name: "Q1 2026 Product Roadmap.pptx", type: "presentation", size: "24.5 MB", modified: "Jan 28, 2026", owner: "Emily R.", starred: true },
    { name: "Engineering OKRs.xlsx", type: "spreadsheet", size: "1.2 MB", modified: "Jan 27, 2026", owner: "Sarah C.", starred: true },
    { name: "API Documentation v3.docx", type: "document", size: "856 KB", modified: "Jan 26, 2026", owner: "Mike J.", starred: false },
    { name: "Brand Guidelines.pdf", type: "pdf", size: "45.2 MB", modified: "Jan 25, 2026", owner: "James W.", starred: true },
    { name: "Architecture Diagram.png", type: "image", size: "2.1 MB", modified: "Jan 24, 2026", owner: "Alex K.", starred: false },
    { name: "Sprint Retro Notes.docx", type: "document", size: "124 KB", modified: "Jan 23, 2026", owner: "Emily R.", starred: false },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="w-5 h-5 text-[#4285f4]" />;
      case "spreadsheet": return <Grid3X3 className="w-5 h-5 text-[#34a853]" />;
      case "presentation": return <Monitor className="w-5 h-5 text-[#fbbc04]" />;
      case "pdf": return <FileText className="w-5 h-5 text-[#ea4335]" />;
      case "image": return <Image className="w-5 h-5 text-[#ea4335]" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="h-full flex bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <button className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-full shadow-md hover:shadow-lg transition-shadow">
            <Plus className="w-6 h-6 text-gray-700" />
            <span className="font-medium text-gray-700">New</span>
          </button>
        </div>
        <nav className="flex-1 px-3">
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-[#c2e7ff] text-[#001d35] rounded-full font-medium">
            <Folder className="w-5 h-5" /> My Drive
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full mt-1">
            <Monitor className="w-5 h-5" /> Computers
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full mt-1">
            <Users className="w-5 h-5" /> Shared with me
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full mt-1">
            <Clock className="w-5 h-5" /> Recent
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full mt-1">
            <Star className="w-5 h-5" /> Starred
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full mt-1">
            <Trash2 className="w-5 h-5" /> Trash
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">Storage</div>
          <div className="w-full h-1 bg-gray-200 rounded-full mt-2">
            <div className="w-1/3 h-full bg-[#1a73e8] rounded-full" />
          </div>
          <div className="text-xs text-gray-500 mt-1">5.2 GB of 15 GB used</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-gray-800">My Drive</h1>
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search in Drive" className="w-80 pl-10 pr-4 py-2 bg-[#f1f3f4] rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:bg-white focus:shadow-md" />
            </div>
            <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
              <button onClick={() => setView("list")} className={`p-1.5 rounded ${view === "list" ? "bg-[#e8f0fe] text-[#1a73e8]" : "text-gray-600"}`}><List className="w-5 h-5" /></button>
              <button onClick={() => setView("grid")} className={`p-1.5 rounded ${view === "grid" ? "bg-[#e8f0fe] text-[#1a73e8]" : "text-gray-600"}`}><Grid3X3 className="w-5 h-5" /></button>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full"><Info className="w-5 h-5 text-gray-600" /></button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Folders */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Folders</h2>
            <div className="grid grid-cols-4 gap-3">
              {folders.map((folder) => (
                <div key={folder.name} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Folder className="w-6 h-6" style={{ color: folder.color }} />
                  <div>
                    <div className="font-medium text-gray-800">{folder.name}</div>
                    <div className="text-xs text-gray-500">{folder.items} items</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Files */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Files</h2>
            {view === "list" ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Owner</th>
                    <th className="pb-2 font-medium">Last modified</th>
                    <th className="pb-2 font-medium">File size</th>
                    <th className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.name} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <td className="py-3 flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <span className="text-gray-800">{file.name}</span>
                        {file.starred && <Star className="w-4 h-4 text-[#fbbc04] fill-[#fbbc04]" />}
                      </td>
                      <td className="py-3 text-gray-600 text-sm">{file.owner}</td>
                      <td className="py-3 text-gray-600 text-sm">{file.modified}</td>
                      <td className="py-3 text-gray-600 text-sm">{file.size}</td>
                      <td className="py-3"><MoreVertical className="w-5 h-5 text-gray-400" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-5 gap-4">
                {files.map((file) => (
                  <div key={file.name} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center mb-3">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="text-sm text-gray-800 truncate">{file.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ZOOM - Meetings Interface
// ============================================================================
function ZoomApp() {
  const meetings = [
    { id: 1, title: "Weekly Team Standup", time: "10:00 AM - 10:30 AM", host: "Sarah Chen", status: "live", participants: 12 },
    { id: 2, title: "Q1 Planning Review", time: "2:00 PM - 3:00 PM", host: "Emily Rodriguez", status: "upcoming" },
    { id: 3, title: "Design Review", time: "4:00 PM - 4:45 PM", host: "James Wilson", status: "upcoming" },
  ];

  const recordings = [
    { title: "Product Demo - Acme Corp", date: "Jan 29, 2026", duration: "42:18", size: "156 MB" },
    { title: "Engineering All-Hands", date: "Jan 28, 2026", duration: "58:32", size: "234 MB" },
    { title: "Customer Success Training", date: "Jan 27, 2026", duration: "1:23:45", size: "412 MB" },
  ];

  return (
    <div className="h-full flex bg-[#242424]">
      {/* Sidebar */}
      <div className="w-20 bg-[#1a1a1a] flex flex-col items-center py-6 gap-6">
        <div className="w-12 h-12 bg-[#0b5cff] rounded-xl flex items-center justify-center text-white font-bold">Z</div>
        <nav className="flex-1 flex flex-col items-center gap-2">
          <button className="w-14 h-14 rounded-xl bg-[#0b5cff] text-white flex flex-col items-center justify-center gap-1">
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>
          <button className="w-14 h-14 rounded-xl text-gray-400 hover:bg-[#333] flex flex-col items-center justify-center gap-1">
            <Calendar className="w-5 h-5" />
            <span className="text-[10px]">Calendar</span>
          </button>
          <button className="w-14 h-14 rounded-xl text-gray-400 hover:bg-[#333] flex flex-col items-center justify-center gap-1">
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px]">Chat</span>
          </button>
          <button className="w-14 h-14 rounded-xl text-gray-400 hover:bg-[#333] flex flex-col items-center justify-center gap-1">
            <Phone className="w-5 h-5" />
            <span className="text-[10px]">Phone</span>
          </button>
          <button className="w-14 h-14 rounded-xl text-gray-400 hover:bg-[#333] flex flex-col items-center justify-center gap-1">
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Contacts</span>
          </button>
        </nav>
        <button className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-medium">SC</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#333]">
          <h1 className="text-xl font-semibold text-white">Home</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search" className="w-64 pl-9 pr-4 py-2 bg-[#333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b5cff]" />
            </div>
            <button className="p-2 hover:bg-[#333] rounded-lg text-gray-400"><Settings className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <button className="p-6 bg-[#0b5cff] hover:bg-[#0950d8] rounded-xl text-white flex flex-col items-center gap-3">
              <Video className="w-8 h-8" />
              <span className="font-medium">New Meeting</span>
            </button>
            <button className="p-6 bg-[#333] hover:bg-[#404040] rounded-xl text-white flex flex-col items-center gap-3">
              <Plus className="w-8 h-8" />
              <span className="font-medium">Join</span>
            </button>
            <button className="p-6 bg-[#333] hover:bg-[#404040] rounded-xl text-white flex flex-col items-center gap-3">
              <Calendar className="w-8 h-8" />
              <span className="font-medium">Schedule</span>
            </button>
            <button className="p-6 bg-[#333] hover:bg-[#404040] rounded-xl text-white flex flex-col items-center gap-3">
              <Monitor className="w-8 h-8" />
              <span className="font-medium">Share Screen</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Upcoming Meetings */}
            <div className="bg-[#2d2d2d] rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Today&apos;s Meetings</h2>
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className={`p-4 rounded-lg ${meeting.status === 'live' ? 'bg-[#0b5cff]/20 border border-[#0b5cff]' : 'bg-[#383838]'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{meeting.title}</h3>
                          {meeting.status === 'live' && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">LIVE</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{meeting.time}</p>
                        <p className="text-sm text-gray-500 mt-1">Host: {meeting.host}</p>
                        {meeting.participants && <p className="text-sm text-gray-500">{meeting.participants} participants</p>}
                      </div>
                      <button className={`px-4 py-2 rounded-lg font-medium ${meeting.status === 'live' ? 'bg-[#0b5cff] text-white' : 'bg-[#0b5cff]/20 text-[#0b5cff]'}`}>
                        {meeting.status === 'live' ? 'Join' : 'Start'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recordings */}
            <div className="bg-[#2d2d2d] rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Recordings</h2>
              <div className="space-y-3">
                {recordings.map((rec, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-[#383838] rounded-lg hover:bg-[#404040] cursor-pointer">
                    <div className="w-12 h-12 bg-[#0b5cff]/20 rounded-lg flex items-center justify-center">
                      <PlayCircle className="w-6 h-6 text-[#0b5cff]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{rec.title}</h3>
                      <p className="text-sm text-gray-400">{rec.date} • {rec.duration}</p>
                    </div>
                    <span className="text-sm text-gray-500">{rec.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONFLUENCE - Wiki Interface
// ============================================================================
function ConfluenceApp() {
  return (
    <div className="h-full flex bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#f4f5f7] border-r border-[#dfe1e6] flex flex-col">
        <div className="p-4 border-b border-[#dfe1e6]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-[#0052cc] rounded flex items-center justify-center text-white font-bold text-sm">EN</span>
            <span className="font-semibold text-[#172b4d]">Engineering</span>
          </div>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="text-xs font-semibold text-[#6b778c] uppercase px-3 py-2">Space shortcuts</div>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-[#172b4d] bg-[#deebff] rounded"><Home className="w-4 h-4" /> Overview</button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-[#172b4d] hover:bg-[#ebecf0] rounded"><FileText className="w-4 h-4" /> Blog</button>

          <div className="text-xs font-semibold text-[#6b778c] uppercase px-3 py-2 mt-4">Pages</div>
          <div className="space-y-0.5">
            {["Getting Started", "API Documentation", "Architecture", "Onboarding Guide", "Code Standards"].map((page) => (
              <button key={page} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[#172b4d] hover:bg-[#ebecf0] rounded">
                <FileText className="w-4 h-4 text-[#6b778c]" /> {page}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 px-6 flex items-center justify-between border-b border-[#dfe1e6]">
          <div className="flex items-center gap-4">
            <span className="text-[#172b4d]">Engineering</span>
            <ChevronRight className="w-4 h-4 text-[#6b778c]" />
            <span className="font-medium text-[#172b4d]">API Documentation</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-[#172b4d] hover:bg-[#ebecf0] rounded">Share</button>
            <button className="px-3 py-1.5 bg-[#0052cc] text-white rounded hover:bg-[#0747a6]">Edit</button>
            <button className="p-2 hover:bg-[#ebecf0] rounded"><MoreHorizontal className="w-5 h-5 text-[#6b778c]" /></button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto py-8 px-6">
            <h1 className="text-3xl font-semibold text-[#172b4d] mb-4">API Documentation v3.0</h1>

            <div className="flex items-center gap-4 text-sm text-[#6b778c] mb-8">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
                <span>Mike Johnson</span>
              </div>
              <span>•</span>
              <span>Updated Jan 28, 2026</span>
              <span>•</span>
              <div className="flex items-center gap-1"><Eye className="w-4 h-4" /> 2,456 views</div>
              <span>•</span>
              <div className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> 28 likes</div>
            </div>

            <div className="prose max-w-none">
              <div className="p-4 bg-[#deebff] rounded-lg mb-6">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-[#0052cc] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#172b4d]">About this documentation</strong>
                    <p className="text-sm text-[#172b4d] mt-1">This page contains the complete API reference for the dIQ platform. Last updated for version 3.0.</p>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-[#172b4d] mt-8 mb-4">Authentication</h2>
              <p className="text-[#172b4d] mb-4">All API requests require authentication using Bearer tokens. Include the token in the Authorization header:</p>
              <pre className="bg-[#f4f5f7] p-4 rounded-lg text-sm overflow-x-auto mb-6">
                <code className="text-[#172b4d]">{`Authorization: Bearer <your-api-token>`}</code>
              </pre>

              <h2 className="text-xl font-semibold text-[#172b4d] mt-8 mb-4">Endpoints</h2>
              <table className="w-full border border-[#dfe1e6] rounded-lg overflow-hidden mb-6">
                <thead className="bg-[#f4f5f7]">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-[#172b4d]">Method</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-[#172b4d]">Endpoint</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-[#172b4d]">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { method: "GET", endpoint: "/api/users", desc: "List all users" },
                    { method: "POST", endpoint: "/api/users", desc: "Create a new user" },
                    { method: "GET", endpoint: "/api/content", desc: "Search content" },
                    { method: "POST", endpoint: "/api/chat", desc: "Send chat message" },
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-[#dfe1e6]">
                      <td className="px-4 py-2"><code className={`px-2 py-0.5 rounded text-xs font-medium ${row.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{row.method}</code></td>
                      <td className="px-4 py-2 font-mono text-sm text-[#172b4d]">{row.endpoint}</td>
                      <td className="px-4 py-2 text-sm text-[#6b778c]">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SALESFORCE - Opportunity Pipeline
// ============================================================================
function SalesforceApp() {
  const stages = [
    { name: "Prospecting", color: "#b0adab", deals: 2, value: "$1.38M" },
    { name: "Qualification", color: "#f88962", deals: 1, value: "$425K" },
    { name: "Proposal", color: "#54c1d2", deals: 1, value: "$850K" },
    { name: "Negotiation", color: "#4bc076", deals: 1, value: "$180K" },
    { name: "Closed Won", color: "#2e844a", deals: 1, value: "$2.4M" },
  ];

  const opportunities = {
    Prospecting: [
      { name: "Retail Giant - Analytics Suite", account: "Retail Giant Co", amount: 1200000, probability: 10, owner: "David Brown" },
      { name: "Tech Startup - Basic Plan", account: "NextGen Tech", amount: 180000, probability: 15, owner: "Lisa Park" },
    ],
    Qualification: [
      { name: "HealthCare Plus - Compliance Package", account: "HealthCare Plus", amount: 425000, probability: 30, owner: "Lisa Park" },
    ],
    Proposal: [
      { name: "Global Finance - Platform Migration", account: "Global Finance Ltd", amount: 850000, probability: 50, owner: "David Brown" },
    ],
    Negotiation: [
      { name: "TechStart Inc - Startup Plan", account: "TechStart Inc", amount: 180000, probability: 75, owner: "Lisa Park" },
    ],
    "Closed Won": [
      { name: "Acme Corp - Enterprise License", account: "Acme Corporation", amount: 2400000, probability: 100, owner: "David Brown" },
    ],
  };

  return (
    <div className="h-full flex flex-col bg-[#f3f3f3]">
      {/* Header */}
      <div className="h-12 bg-[#032d60] flex items-center px-4">
        <div className="flex items-center gap-4">
          <span className="text-white font-bold">☁️ Salesforce</span>
          <nav className="flex items-center gap-1 ml-8">
            {["Home", "Accounts", "Contacts", "Opportunities", "Leads", "Reports"].map((item) => (
              <button key={item} className={`px-3 py-2 text-sm ${item === "Opportunities" ? 'text-white border-b-2 border-white' : 'text-white/70 hover:text-white'}`}>{item}</button>
            ))}
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Search className="w-5 h-5 text-white/70" />
          <Bell className="w-5 h-5 text-white/70" />
          <div className="w-8 h-8 rounded-full bg-[#5eb5ef] flex items-center justify-center text-white text-sm font-medium">SC</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="bg-white rounded-lg shadow h-full flex flex-col">
          {/* Pipeline Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#080707]">Opportunity Pipeline</h1>
              <p className="text-sm text-[#706e6b]">Q1 2026 • All Opportunities</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-[#dddbda] rounded text-[#0070d2] text-sm hover:bg-[#f4f6f9]">
                <Filter className="w-4 h-4 inline mr-1" /> Filter
              </button>
              <button className="px-3 py-1.5 bg-[#0070d2] text-white rounded text-sm hover:bg-[#005fb2]">
                <Plus className="w-4 h-4 inline mr-1" /> New Opportunity
              </button>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="flex-1 overflow-x-auto p-4">
            <div className="flex gap-3 h-full min-w-max">
              {stages.map((stage) => (
                <div key={stage.name} className="w-72 flex flex-col">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="font-medium text-[#080707]">{stage.name}</span>
                    <span className="text-xs text-[#706e6b]">({stage.deals})</span>
                    <span className="ml-auto text-sm font-medium text-[#080707]">{stage.value}</span>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {opportunities[stage.name as keyof typeof opportunities]?.map((opp, i) => (
                      <motion.div
                        key={i}
                        className="bg-white border border-[#dddbda] rounded-lg p-3 hover:shadow-md cursor-pointer"
                        whileHover={{ y: -2 }}
                      >
                        <h3 className="font-medium text-[#080707] text-sm">{opp.name}</h3>
                        <p className="text-xs text-[#706e6b] mt-1">{opp.account}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-semibold text-[#080707]">${(opp.amount / 1000).toFixed(0)}K</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#706e6b]">{opp.probability}%</span>
                            <div className="w-6 h-6 rounded-full bg-[#5eb5ef] flex items-center justify-center text-white text-[10px] font-medium">
                              {opp.owner.split(' ').map(n => n[0]).join('')}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FIGMA - Design Canvas Interface
// ============================================================================
function FigmaApp() {
  const layers = [
    { id: 1, name: "Frame 1 - Dashboard", type: "frame", children: [
      { id: 2, name: "Header", type: "frame" },
      { id: 3, name: "Sidebar", type: "frame" },
      { id: 4, name: "Main Content", type: "frame" },
      { id: 5, name: "Widget Card", type: "component" },
    ]},
    { id: 6, name: "Frame 2 - Components", type: "frame", children: [
      { id: 7, name: "Button / Primary", type: "component" },
      { id: 8, name: "Button / Secondary", type: "component" },
      { id: 9, name: "Input Field", type: "component" },
    ]},
  ];

  return (
    <div className="h-full flex flex-col bg-[#2c2c2c]">
      {/* Top Toolbar */}
      <div className="h-12 bg-[#2c2c2c] border-b border-[#444] flex items-center px-3">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#444] rounded"><ChevronDown className="w-4 h-4 text-white" /></button>
          <span className="text-white text-sm font-medium">Dashboard v3.0</span>
        </div>
        <div className="flex items-center gap-1 ml-8 bg-[#383838] rounded-lg p-1">
          <button className="px-3 py-1 bg-[#0d99ff] text-white rounded text-xs font-medium">Design</button>
          <button className="px-3 py-1 text-[#b3b3b3] hover:text-white text-xs">Prototype</button>
          <button className="px-3 py-1 text-[#b3b3b3] hover:text-white text-xs">Dev Mode</button>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex -space-x-2">
            {["JW", "ER", "SC"].map((a, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold border-2 border-[#2c2c2c]">{a}</div>
            ))}
          </div>
          <button className="px-3 py-1.5 bg-[#0d99ff] text-white rounded text-sm font-medium">Share</button>
          <button className="p-2 hover:bg-[#444] rounded text-white"><PlayCircle className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Layers */}
        <div className="w-60 bg-[#2c2c2c] border-r border-[#444] flex flex-col">
          <div className="flex items-center border-b border-[#444]">
            <button className="flex-1 py-2 text-xs text-[#b3b3b3] border-b-2 border-[#0d99ff] text-white">Layers</button>
            <button className="flex-1 py-2 text-xs text-[#b3b3b3] hover:text-white">Assets</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 text-sm">
            {layers.map((layer) => (
              <div key={layer.id} className="mb-1">
                <div className="flex items-center gap-2 px-2 py-1 hover:bg-[#383838] rounded cursor-pointer">
                  <ChevronDown className="w-3 h-3 text-[#b3b3b3]" />
                  <Layers className="w-4 h-4 text-[#b3b3b3]" />
                  <span className="text-[#e5e5e5] truncate">{layer.name}</span>
                </div>
                {layer.children?.map((child) => (
                  <div key={child.id} className="flex items-center gap-2 px-2 py-1 ml-4 hover:bg-[#383838] rounded cursor-pointer">
                    {child.type === 'component' ? <Square className="w-4 h-4 text-[#9747ff]" /> : <Layers className="w-4 h-4 text-[#b3b3b3]" />}
                    <span className="text-[#b3b3b3] truncate">{child.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-[#1e1e1e] relative overflow-hidden">
          {/* Canvas Content - Simulated Design */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[800px] h-[500px] bg-[#121218] rounded-lg shadow-2xl overflow-hidden border border-[#333]">
              {/* Simulated Dashboard Frame */}
              <div className="h-12 bg-[#1a1a20] flex items-center px-4 gap-4 border-b border-[#333]">
                <div className="w-8 h-8 bg-[#10b981] rounded-lg" />
                <div className="flex-1 h-8 bg-[#252530] rounded" />
                <div className="w-8 h-8 bg-[#252530] rounded-full" />
              </div>
              <div className="flex h-[calc(100%-48px)]">
                <div className="w-16 bg-[#1a1a20] border-r border-[#333] p-2 space-y-2">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-full aspect-square bg-[#252530] rounded" />)}
                </div>
                <div className="flex-1 p-4 grid grid-cols-3 gap-3">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="bg-[#1a1a20] rounded-lg p-3 border border-[#333]">
                      <div className="w-full h-4 bg-[#252530] rounded mb-2" />
                      <div className="w-2/3 h-3 bg-[#252530] rounded mb-4" />
                      <div className="w-full h-16 bg-[#252530] rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-[#2c2c2c] rounded-lg p-1 border border-[#444]">
            <button className="p-1.5 hover:bg-[#383838] rounded text-white"><MinusSquare className="w-4 h-4" /></button>
            <span className="text-white text-xs px-2">100%</span>
            <button className="p-1.5 hover:bg-[#383838] rounded text-white"><PlusSquare className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-60 bg-[#2c2c2c] border-l border-[#444] flex flex-col">
          <div className="p-3 border-b border-[#444]">
            <h3 className="text-xs font-medium text-[#b3b3b3] uppercase">Design</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <div>
              <label className="text-xs text-[#b3b3b3] block mb-2">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center bg-[#383838] rounded px-2 py-1">
                  <span className="text-xs text-[#b3b3b3] mr-2">X</span>
                  <input type="text" value="120" className="w-full bg-transparent text-white text-xs focus:outline-none" readOnly />
                </div>
                <div className="flex items-center bg-[#383838] rounded px-2 py-1">
                  <span className="text-xs text-[#b3b3b3] mr-2">Y</span>
                  <input type="text" value="80" className="w-full bg-transparent text-white text-xs focus:outline-none" readOnly />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#b3b3b3] block mb-2">Size</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center bg-[#383838] rounded px-2 py-1">
                  <span className="text-xs text-[#b3b3b3] mr-2">W</span>
                  <input type="text" value="800" className="w-full bg-transparent text-white text-xs focus:outline-none" readOnly />
                </div>
                <div className="flex items-center bg-[#383838] rounded px-2 py-1">
                  <span className="text-xs text-[#b3b3b3] mr-2">H</span>
                  <input type="text" value="500" className="w-full bg-transparent text-white text-xs focus:outline-none" readOnly />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#b3b3b3] block mb-2">Fill</label>
              <div className="flex items-center gap-2 bg-[#383838] rounded px-2 py-1.5">
                <div className="w-5 h-5 rounded bg-[#121218] border border-[#555]" />
                <span className="text-xs text-white font-mono">#121218</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="h-12 bg-[#2c2c2c] border-t border-[#444] flex items-center justify-center gap-1 px-4">
        {[
          { icon: MousePointer, name: "Move" },
          { icon: Square, name: "Frame" },
          { icon: Square, name: "Rectangle" },
          { icon: Circle, name: "Ellipse" },
          { icon: Pencil, name: "Pen" },
          { icon: Type, name: "Text" },
        ].map((tool, i) => (
          <button key={i} className={`p-2.5 rounded ${i === 0 ? 'bg-[#0d99ff]' : 'hover:bg-[#383838]'}`}>
            <tool.icon className="w-4 h-4 text-white" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// NOTION - Workspace Interface
// ============================================================================
function NotionApp() {
  const pages = [
    { icon: "📋", name: "Sprint Planning", type: "database" },
    { icon: "📚", name: "Team Wiki", type: "page" },
    { icon: "💡", name: "Ideas Backlog", type: "database" },
    { icon: "📝", name: "Meeting Notes", type: "page" },
    { icon: "🎯", name: "OKRs 2026", type: "database" },
  ];

  return (
    <div className="h-full flex bg-[#191919]">
      {/* Sidebar */}
      <div className="w-60 bg-[#202020] flex flex-col">
        <div className="p-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white text-xs font-bold">D</div>
          <span className="font-medium text-[#ebebeb]">Digital Workplace</span>
          <ChevronDown className="w-4 h-4 text-[#9b9b9b] ml-auto" />
        </div>

        <div className="px-2 py-1">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[#9b9b9b] hover:bg-[#2f2f2f] rounded text-sm">
            <Search className="w-4 h-4" /> Search
            <span className="ml-auto text-xs text-[#5c5c5c]">⌘K</span>
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[#9b9b9b] hover:bg-[#2f2f2f] rounded text-sm">
            <Home className="w-4 h-4" /> Home
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[#9b9b9b] hover:bg-[#2f2f2f] rounded text-sm">
            <Bell className="w-4 h-4" /> Inbox
            <span className="ml-auto px-1.5 py-0.5 bg-[#eb5757] text-white text-[10px] rounded">3</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="text-xs text-[#5c5c5c] px-2 py-1 font-medium">Private</div>
          {pages.map((page, i) => (
            <button key={i} className="w-full flex items-center gap-2 px-2 py-1 text-[#ebebeb] hover:bg-[#2f2f2f] rounded text-sm">
              <span>{page.icon}</span>
              <span className="truncate">{page.name}</span>
            </button>
          ))}
        </div>

        <div className="p-2 border-t border-[#2f2f2f]">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[#9b9b9b] hover:bg-[#2f2f2f] rounded text-sm">
            <Plus className="w-4 h-4" /> New page
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#191919] overflow-y-auto">
        <div className="max-w-3xl mx-auto py-12 px-16">
          {/* Page Header */}
          <div className="mb-8">
            <div className="text-6xl mb-4">📋</div>
            <h1 className="text-4xl font-bold text-[#ebebeb] mb-2">Sprint Planning</h1>
            <div className="flex items-center gap-4 text-sm text-[#9b9b9b]">
              <span>Engineering Team</span>
              <span>•</span>
              <span>Last edited Jan 30, 2026</span>
            </div>
          </div>

          {/* Database View */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <button className="px-3 py-1 bg-[#2f2f2f] text-[#ebebeb] rounded text-sm">Board</button>
              <button className="px-3 py-1 text-[#9b9b9b] hover:bg-[#2f2f2f] rounded text-sm">Table</button>
              <button className="px-3 py-1 text-[#9b9b9b] hover:bg-[#2f2f2f] rounded text-sm">List</button>
              <button className="ml-auto px-3 py-1 text-[#9b9b9b] hover:bg-[#2f2f2f] rounded text-sm flex items-center gap-1">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>

            {/* Kanban View */}
            <div className="flex gap-3 overflow-x-auto pb-4">
              {["To Do", "In Progress", "Done"].map((col) => (
                <div key={col} className="w-64 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#9b9b9b] text-sm font-medium">{col}</span>
                    <span className="text-[#5c5c5c] text-xs">{col === "To Do" ? 4 : col === "In Progress" ? 2 : 3}</span>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, col === "Done" ? 3 : null].filter(Boolean).map((_, i) => (
                      <div key={i} className="p-3 bg-[#252525] rounded-lg hover:bg-[#2f2f2f] cursor-pointer">
                        <p className="text-[#ebebeb] text-sm mb-2">Task item {i + 1} for sprint</p>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-[#eb5757]/20 text-[#eb5757] text-[10px] rounded">High</span>
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 ml-auto" />
                        </div>
                      </div>
                    ))}
                    <button className="w-full p-2 text-[#5c5c5c] hover:bg-[#252525] rounded text-sm flex items-center gap-1">
                      <Plus className="w-4 h-4" /> New
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LINKEDIN - Feed Interface
// ============================================================================
function LinkedInApp() {
  const posts = [
    {
      author: "Sarah Chen",
      title: "VP of Engineering at Digital Workplace AI",
      avatar: "SC",
      time: "2h",
      content: "Excited to announce that we've just reached a major milestone - our AI assistant now handles over 1 million queries per day! 🎉\n\nThis wouldn't have been possible without our incredible engineering team. Special thanks to @Mike Johnson and @Alex Kim for leading this effort.\n\n#AI #Engineering #Milestone",
      likes: 234,
      comments: 45,
      reposts: 12,
    },
    {
      author: "Emily Rodriguez",
      title: "Product Manager at Digital Workplace AI",
      avatar: "ER",
      time: "5h",
      content: "Just published a new article on building products that users actually love. Key takeaway: Listen more, assume less.\n\nLink in comments 👇",
      likes: 156,
      comments: 28,
      reposts: 8,
      image: true,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-[#f3f2ef]">
      {/* Header */}
      <div className="h-14 bg-white border-b border-[#dce6f1] px-4">
        <div className="max-w-6xl mx-auto h-full flex items-center gap-4">
          <span className="text-3xl text-[#0a66c2] font-bold">in</span>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-2 bg-[#eef3f8] rounded text-sm focus:outline-none focus:bg-white focus:shadow" />
          </div>
          <nav className="flex items-center gap-6 ml-auto">
            {[
              { icon: Home, label: "Home", active: true },
              { icon: Users, label: "My Network" },
              { icon: Briefcase, label: "Jobs" },
              { icon: MessageSquare, label: "Messaging", badge: 3 },
              { icon: Bell, label: "Notifications", badge: 8 },
            ].map((item, i) => (
              <button key={i} className={`flex flex-col items-center gap-0.5 px-2 py-1 ${item.active ? 'text-[#191919] border-b-2 border-[#191919]' : 'text-[#666] hover:text-[#191919]'}`}>
                <div className="relative">
                  <item.icon className="w-6 h-6" />
                  {item.badge && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#cc1016] text-white text-[10px] rounded-full flex items-center justify-center">{item.badge}</span>}
                </div>
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
            <div className="w-px h-10 bg-[#dce6f1]" />
            <button className="flex flex-col items-center gap-0.5 px-2 py-1 text-[#666]">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182]" />
              <span className="text-xs flex items-center">Me <ChevronDown className="w-3 h-3" /></span>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto py-6 px-4 flex gap-6">
          {/* Left Sidebar */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-white rounded-lg border border-[#dce6f1] overflow-hidden">
              <div className="h-14 bg-gradient-to-r from-[#0a66c2] to-[#004182]" />
              <div className="px-4 pb-4 -mt-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0a66c2] to-cyan-500 border-4 border-white mx-auto" />
                <h3 className="text-center font-semibold text-[#191919] mt-2">Your Name</h3>
                <p className="text-center text-xs text-[#666] mt-1">Software Engineer at Company</p>
              </div>
              <div className="border-t border-[#dce6f1] px-4 py-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">Profile viewers</span>
                  <span className="text-[#0a66c2] font-semibold">142</span>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-[#666]">Post impressions</span>
                  <span className="text-[#0a66c2] font-semibold">1,247</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feed */}
          <div className="flex-1 max-w-xl space-y-4">
            {/* Create Post */}
            <div className="bg-white rounded-lg border border-[#dce6f1] p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0a66c2] to-cyan-500" />
                <button className="flex-1 px-4 py-3 border border-[#8f8f8f] rounded-full text-left text-[#666] hover:bg-[#f3f2ef]">Start a post</button>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2">
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#f3f2ef] rounded text-[#666] text-sm"><ImageIcon className="w-5 h-5 text-[#378fe9]" /> Photo</button>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#f3f2ef] rounded text-[#666] text-sm"><Video className="w-5 h-5 text-[#5f9b41]" /> Video</button>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#f3f2ef] rounded text-[#666] text-sm"><Calendar className="w-5 h-5 text-[#c37d16]" /> Event</button>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#f3f2ef] rounded text-[#666] text-sm"><FileText className="w-5 h-5 text-[#e16745]" /> Article</button>
              </div>
            </div>

            {/* Posts */}
            {posts.map((post, i) => (
              <div key={i} className="bg-white rounded-lg border border-[#dce6f1]">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">{post.avatar}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#191919] hover:text-[#0a66c2] hover:underline cursor-pointer">{post.author}</h3>
                      <p className="text-xs text-[#666]">{post.title}</p>
                      <p className="text-xs text-[#666]">{post.time} • <Globe className="w-3 h-3 inline" /></p>
                    </div>
                    <button className="p-2 hover:bg-[#f3f2ef] rounded-full"><MoreHorizontal className="w-5 h-5 text-[#666]" /></button>
                  </div>
                  <p className="mt-3 text-sm text-[#191919] whitespace-pre-line">{post.content}</p>
                  {post.image && (
                    <div className="mt-3 bg-[#f3f2ef] rounded-lg h-64 flex items-center justify-center text-[#666]">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-[#dce6f1] flex items-center justify-between text-xs text-[#666]">
                  <span><ThumbsUp className="w-4 h-4 inline text-[#0a66c2]" /> {post.likes}</span>
                  <span>{post.comments} comments • {post.reposts} reposts</span>
                </div>
                <div className="px-2 py-1 border-t border-[#dce6f1] flex items-center">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-[#f3f2ef] rounded text-[#666] text-sm"><ThumbsUp className="w-5 h-5" /> Like</button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-[#f3f2ef] rounded text-[#666] text-sm"><MessageCircle className="w-5 h-5" /> Comment</button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-[#f3f2ef] rounded text-[#666] text-sm"><Repeat2 className="w-5 h-5" /> Repost</button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-[#f3f2ef] rounded text-[#666] text-sm"><SendIcon className="w-5 h-5" /> Send</button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-lg border border-[#dce6f1] p-4">
              <h3 className="font-semibold text-[#191919] mb-3">Add to your feed</h3>
              {["TechCorp", "AI Insights", "Engineering Daily"].map((name, i) => (
                <div key={i} className="flex items-start gap-3 py-2">
                  <div className="w-12 h-12 rounded bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-sm">{name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-[#191919] truncate">{name}</h4>
                    <p className="text-xs text-[#666]">Company • Technology</p>
                    <button className="mt-1 px-3 py-1 border border-[#666] rounded-full text-xs text-[#666] hover:bg-[#f3f2ef] flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Follow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
