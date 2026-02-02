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
    "auzmor-office": { name: "Auzmor Office", icon: "🏢", color: "bg-white" },
    slack: { name: "Slack", icon: "💬", color: "bg-[#611f69]" },
    email: { name: "Email", icon: "📧", color: "bg-[#EA4335]" },
    jira: { name: "Jira", icon: "🎯", color: "bg-[#0052CC]" },
    github: { name: "GitHub", icon: "🐙", color: "bg-[#24292f]" },
    drive: { name: "Google Drive", icon: "📁", color: "bg-white" },
    zoom: { name: "Zoom", icon: "🎥", color: "bg-[#2D8CFF]" },
    confluence: { name: "Confluence", icon: "📝", color: "bg-[#0052CC]" },
    bookmarks: { name: "Bookmarks", icon: "🔖", color: "bg-[#8B5CF6]" },
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
      case "auzmor-office": return <AuzmorOfficeApp />;
      case "slack": return <SlackApp />;
      case "email": return <EmailApp />;
      case "jira": return <JiraApp />;
      case "github": return <GitHubApp />;
      case "drive": return <DriveApp />;
      case "zoom": return <ZoomApp />;
      case "confluence": return <ConfluenceApp />;
      case "bookmarks": return <BookmarksApp />;
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
// AUZMOR OFFICE - Social Intranet Replica (Light Theme - Matching Original)
// ============================================================================
function AuzmorOfficeApp() {
  const [activeNavTab, setActiveNavTab] = useState<"feed" | "people" | "apps" | "channels" | "admin">("feed");
  const [appLauncherOpen, setAppLauncherOpen] = useState(true);
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [teamsOpen, setTeamsOpen] = useState(true);
  const [birthdayOpen, setBirthdayOpen] = useState(true);
  const [anniversaryOpen, setAnniversaryOpen] = useState(true);
  const [channelRequestsOpen, setChannelRequestsOpen] = useState(true);

  // Mock data - Posts for feed (matching original Auzmor Office)
  const posts = [
    {
      id: "p1",
      author: { name: "Lily Wright", avatar: "/avatars/lily.jpg", initials: "LW" },
      content: "",
      timestamp: "16 days ago",
      likes: 0,
      comments: 0,
      isPublic: true,
    },
    {
      id: "p2",
      author: { name: "Addison Green", avatar: "/avatars/addison.jpg", initials: "AG" },
      content: "",
      timestamp: "16 days ago",
      likes: 0,
      comments: 0,
      isPublic: true,
    },
    {
      id: "p3",
      author: { name: "Logan Martinez", avatar: "/avatars/logan.jpg", initials: "LM" },
      content: "",
      timestamp: "16 days ago",
      likes: 0,
      comments: 0,
      isPublic: true,
    },
    {
      id: "p4",
      author: { name: "Sebastian Sanchez", avatar: "/avatars/sebastian.jpg", initials: "SS" },
      content: "",
      timestamp: "16 days ago",
      likes: 0,
      comments: 1,
      isPublic: true,
    },
  ];

  // Mock data - Channels (matching original)
  const channels = [
    { id: "core-data", name: "Core Data Science", members: 12 },
    { id: "dei", name: "DEI Employee Resou...", members: 45 },
  ];

  // Mock data - Channel requests
  const channelRequests = [
    { id: "1", user: { name: "Sofia Rodriguez", avatar: "/avatars/sofia.jpg", initials: "SR" }, channel: "Core Data Scie..." },
    { id: "2", user: { name: "Elena Ivanova", avatar: "/avatars/elena.jpg", initials: "EI" }, channel: "DEI Employee ..." },
    { id: "3", user: { name: "Hiroshi Yamamoto", avatar: "/avatars/hiroshi.jpg", initials: "HY" }, channel: "Data Innovatio..." },
  ];

  return (
    <div className="h-full flex flex-col bg-[#f5f5f5]">
      {/* Top Header - Full Width */}
      <div className="h-14 bg-white border-b border-neutral-200 px-4 flex items-center justify-between shrink-0">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0d9488] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L3 9V21H9V14H15V21H21V9L12 3Z" fill="white"/>
              </svg>
            </div>
            <div className="flex items-baseline">
              <span className="text-[#0d9488] font-bold text-lg">auzmor</span>
              <span className="text-neutral-600 font-normal text-lg ml-1">Office</span>
            </div>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search trainings, people, teams, channels, documents, apps"
              className="w-full pl-10 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-full text-sm text-neutral-600 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
            />
          </div>
        </div>

        {/* Right: Navigation */}
        <div className="flex items-center gap-1">
          {[
            { id: "feed", label: "Feed", icon: Home },
            { id: "people", label: "People", icon: Users },
            { id: "apps", label: "Apps", icon: Grid3X3 },
            { id: "channels", label: "Channels", icon: Hash },
            { id: "admin", label: "Admin", icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNavTab(item.id as typeof activeNavTab)}
              className={`flex flex-col items-center px-4 py-1.5 rounded-lg transition-colors ${
                activeNavTab === item.id
                  ? "text-[#0d9488]"
                  : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-0.5">{item.label}</span>
            </button>
          ))}
          <div className="w-px h-8 bg-neutral-200 mx-2" />
          <button className="relative p-2 hover:bg-neutral-100 rounded-lg">
            <Bell className="w-5 h-5 text-neutral-500" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0d9488] to-[#10b981] flex items-center justify-center text-white text-sm font-medium ml-2">
            TA
          </div>
        </div>
      </div>

      {/* Trial Banner */}
      <div className="h-10 bg-neutral-800 flex items-center justify-center gap-2 text-sm shrink-0">
        <span className="text-neutral-300">Experience</span>
        <span className="text-[#10b981] font-medium">12 days trial</span>
        <span className="text-neutral-300">of Auzmor Office</span>
        <button className="ml-2 px-3 py-1 bg-[#0d9488] text-white text-sm rounded hover:bg-[#0f766e] transition-colors">
          Contact Sales
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (293px) */}
        <div className="w-[293px] bg-white border-r border-neutral-200 flex flex-col shrink-0 overflow-y-auto">
          {/* User Card */}
          <div className="p-4">
            <div className="bg-gradient-to-br from-[#0d9488] to-[#10b981] rounded-xl p-4 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-white text-2xl font-medium mb-2">
                TA
              </div>
              <h3 className="text-white font-semibold text-lg">Test Admin</h3>
              <p className="text-white/80 text-sm flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                San Francisco, CA
              </p>
            </div>
          </div>

          {/* App Launcher */}
          <div className="px-4 py-2">
            <button
              onClick={() => setAppLauncherOpen(!appLauncherOpen)}
              className="w-full flex items-center justify-between py-2 text-neutral-900 font-semibold"
            >
              <span>App Launcher</span>
              {appLauncherOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {appLauncherOpen && (
              <div className="py-3 text-center border border-neutral-200 rounded-lg mt-2">
                <p className="text-neutral-500 text-sm">There are no apps in your organization.</p>
                <button className="mt-2 px-4 py-1.5 border border-neutral-300 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 flex items-center gap-1 mx-auto">
                  <Plus className="w-4 h-4" />
                  Add Apps
                </button>
                <p className="text-neutral-400 text-xs mt-2">Only admins can see this.</p>
              </div>
            )}
          </div>

          {/* Channels */}
          <div className="px-4 py-2">
            <button
              onClick={() => setChannelsOpen(!channelsOpen)}
              className="w-full flex items-center justify-between py-2 text-neutral-900 font-semibold"
            >
              <span>Channels</span>
              {channelsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {channelsOpen && (
              <div className="space-y-1 mt-2">
                {channels.map((ch) => (
                  <button
                    key={ch.id}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg"
                  >
                    <span className="truncate">{ch.name}</span>
                    <Plus className="w-4 h-4 text-neutral-400" />
                  </button>
                ))}
                <button className="w-full py-2 text-sm text-[#0d9488] font-medium hover:bg-neutral-100 rounded-lg">
                  Explore Channels
                </button>
              </div>
            )}
          </div>

          {/* Teams */}
          <div className="px-4 py-2 flex-1">
            <button
              onClick={() => setTeamsOpen(!teamsOpen)}
              className="w-full flex items-center justify-between py-2 text-neutral-900 font-semibold"
            >
              <span>Teams</span>
              {teamsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {teamsOpen && (
              <div className="mt-4 flex flex-col items-center py-4">
                {/* Team illustration - two people working */}
                <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="mb-2">
                  {/* Person 1 at desk */}
                  <ellipse cx="35" cy="85" rx="25" ry="8" fill="#e5e5e5"/>
                  <rect x="20" y="55" width="30" height="25" rx="2" fill="#d4d4d4"/>
                  <rect x="25" y="58" width="20" height="12" rx="1" fill="#a3a3a3"/>
                  <circle cx="35" cy="45" r="8" fill="#fed7aa"/>
                  <path d="M28 43 C28 38, 42 38, 42 43" fill="#78350f"/>
                  <rect x="30" y="52" width="10" height="12" rx="2" fill="#0d9488"/>

                  {/* Person 2 standing */}
                  <ellipse cx="85" cy="88" rx="15" ry="5" fill="#e5e5e5"/>
                  <circle cx="85" cy="40" r="10" fill="#fcd34d"/>
                  <path d="M76 37 C76 30, 94 30, 94 37" fill="#92400e"/>
                  <rect x="78" y="50" width="14" height="20" rx="2" fill="#6366f1"/>
                  <rect x="78" y="70" width="6" height="15" rx="1" fill="#4f46e5"/>
                  <rect x="86" y="70" width="6" height="15" rx="1" fill="#4f46e5"/>

                  {/* Plant */}
                  <rect x="95" y="70" width="8" height="12" rx="1" fill="#a3a3a3"/>
                  <ellipse cx="99" cy="65" rx="6" ry="8" fill="#10b981"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-2xl mx-auto">
            {/* Create Post */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d9488] to-[#10b981] flex items-center justify-center text-white font-medium shrink-0">
                  TA
                </div>
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  className="flex-1 h-10 px-4 bg-neutral-100 border border-neutral-200 rounded-full text-sm text-neutral-600 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                />
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-200">
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg flex-1 justify-center">
                  <ImageIcon className="w-4 h-4" />
                  Media
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg flex-1 justify-center">
                  <Award className="w-4 h-4" />
                  Shoutout
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg flex-1 justify-center">
                  <TrendingUp className="w-4 h-4" />
                  Polls
                </button>
              </div>
            </div>

            {/* Feed Actions */}
            <div className="flex items-center gap-3 mb-4">
              <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-neutral-200">
                <RefreshCw className="w-4 h-4 text-neutral-500" />
              </button>
              <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-neutral-200">
                <Bookmark className="w-4 h-4 text-neutral-500" />
              </button>
              <div className="flex-1" />
              <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-neutral-200">
                <Filter className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-400 flex items-center justify-center text-white font-medium shrink-0">
                        {post.author.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-900">{post.author.name}</span>
                          <span className="text-neutral-500 text-sm">shared a post</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                          <span>{post.timestamp}</span>
                          <span>•</span>
                          <Globe className="w-3 h-3" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-neutral-100 rounded">
                          <Bookmark className="w-4 h-4 text-neutral-400" />
                        </button>
                        <button className="p-1.5 hover:bg-neutral-100 rounded">
                          <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                        </button>
                      </div>
                    </div>
                    {/* Post content placeholder */}
                    <div className="mt-4 h-32 bg-neutral-100 rounded-lg" />
                  </div>
                  <div className="px-4 py-3 border-t border-neutral-100 flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm text-neutral-600 hover:text-[#10b981]">
                      <ThumbsUp className="w-4 h-4" />
                      Like
                    </button>
                    <button className="flex items-center gap-2 text-sm text-neutral-600 hover:text-[#10b981]">
                      <MessageCircle className="w-4 h-4" />
                      Comment
                      {post.comments > 0 && <span className="text-neutral-500">({post.comments} comment{post.comments !== 1 ? 's' : ''})</span>}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar (293px) */}
        <div className="w-[293px] bg-white border-l border-neutral-200 p-4 shrink-0 overflow-y-auto">
          {/* Birthday Widget */}
          <div className="mb-4">
            <button
              onClick={() => setBirthdayOpen(!birthdayOpen)}
              className="w-full flex items-center justify-between py-2"
            >
              <span className="font-semibold text-neutral-900">Birthday 🎂</span>
              {birthdayOpen ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
            </button>
            {birthdayOpen && (
              <div className="flex flex-col items-center py-6 border border-neutral-200 rounded-xl mt-2">
                {/* Birthday illustration */}
                <svg width="100" height="80" viewBox="0 0 100 80" fill="none" className="mb-3">
                  {/* Cake */}
                  <rect x="30" y="45" width="40" height="25" rx="4" fill="#fcd34d"/>
                  <rect x="25" y="65" width="50" height="10" rx="2" fill="#f59e0b"/>
                  {/* Candle */}
                  <rect x="48" y="30" width="4" height="15" fill="#60a5fa"/>
                  <ellipse cx="50" cy="28" rx="4" ry="6" fill="#fbbf24"/>
                  {/* Decorations */}
                  <circle cx="35" cy="52" r="3" fill="#ec4899"/>
                  <circle cx="50" cy="55" r="3" fill="#8b5cf6"/>
                  <circle cx="65" cy="52" r="3" fill="#10b981"/>
                  {/* Confetti */}
                  <rect x="20" y="20" width="3" height="6" rx="1" fill="#ec4899" transform="rotate(15 20 20)"/>
                  <rect x="75" y="15" width="3" height="6" rx="1" fill="#10b981" transform="rotate(-20 75 15)"/>
                  <rect x="80" y="35" width="3" height="6" rx="1" fill="#fbbf24" transform="rotate(10 80 35)"/>
                  <rect x="15" y="40" width="3" height="6" rx="1" fill="#60a5fa" transform="rotate(-15 15 40)"/>
                </svg>
                <p className="text-neutral-500 text-sm text-center">
                  Upcoming birthdays will show here.
                </p>
              </div>
            )}
          </div>

          {/* Work Anniversaries Widget */}
          <div className="mb-4">
            <button
              onClick={() => setAnniversaryOpen(!anniversaryOpen)}
              className="w-full flex items-center justify-between py-2"
            >
              <span className="font-semibold text-neutral-900">Work Anniversaries 🎉</span>
              {anniversaryOpen ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
            </button>
            {anniversaryOpen && (
              <div className="flex flex-col items-center py-6 border border-neutral-200 rounded-xl mt-2">
                {/* Anniversary illustration */}
                <svg width="100" height="80" viewBox="0 0 100 80" fill="none" className="mb-3">
                  {/* Trophy */}
                  <path d="M35 25 L35 45 L45 55 L55 55 L65 45 L65 25 Z" fill="#fbbf24"/>
                  <rect x="43" y="55" width="14" height="8" fill="#d97706"/>
                  <rect x="38" y="63" width="24" height="6" rx="1" fill="#92400e"/>
                  {/* Handles */}
                  <path d="M35 28 C25 28, 25 42, 35 42" stroke="#fbbf24" strokeWidth="4" fill="none"/>
                  <path d="M65 28 C75 28, 75 42, 65 42" stroke="#fbbf24" strokeWidth="4" fill="none"/>
                  {/* Star */}
                  <path d="M50 30 L52 36 L58 36 L53 40 L55 46 L50 42 L45 46 L47 40 L42 36 L48 36 Z" fill="#ffffff"/>
                  {/* Confetti */}
                  <circle cx="25" cy="20" r="3" fill="#ec4899"/>
                  <circle cx="75" cy="25" r="3" fill="#10b981"/>
                  <rect x="80" cy="45" width="4" height="4" fill="#60a5fa" transform="rotate(45 80 45)"/>
                  <rect x="15" cy="35" width="4" height="4" fill="#8b5cf6" transform="rotate(45 15 35)"/>
                </svg>
                <p className="text-neutral-500 text-sm text-center">
                  Upcoming work anniversaries will show here.
                </p>
              </div>
            )}
          </div>

          {/* Channel Requests Widget */}
          <div>
            <button
              onClick={() => setChannelRequestsOpen(!channelRequestsOpen)}
              className="w-full flex items-center justify-between py-2"
            >
              <span className="font-semibold text-neutral-900">Channel requests ( 3 )</span>
              {channelRequestsOpen ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
            </button>
            {channelRequestsOpen && (
              <div className="space-y-3 mt-2">
                {channelRequests.map((request) => (
                  <div key={request.id} className="p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-400 flex items-center justify-center text-white text-xs font-medium shrink-0">
                        {request.user.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-700">
                          <span className="font-medium">{request.user.name}</span>
                          <span className="text-neutral-500"> requested to join </span>
                          <span className="text-[#0d9488] font-medium">{request.channel}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 justify-end">
                      <button className="px-4 py-1.5 text-sm border border-neutral-300 rounded-lg text-neutral-600 hover:bg-neutral-100">
                        Decline
                      </button>
                      <button className="px-4 py-1.5 text-sm bg-[#10b981] text-white rounded-lg hover:bg-[#059669]">
                        Accept
                      </button>
                    </div>
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
// SLACK - Authentic Interface Replica (Enhanced)
// ============================================================================
function SlackApp() {
  const [selectedChannel, setSelectedChannel] = useState("engineering");
  const [messageInput, setMessageInput] = useState("");
  const [showThreads, setShowThreads] = useState(false);

  const workspaces = [
    { name: "Digital Workplace", icon: "DW", active: true },
    { name: "ATC Partners", icon: "AT", active: false },
    { name: "Acme Corp", icon: "AC", active: false },
  ];
  const channels = [
    { id: "general", name: "general", unread: 3, isPrivate: false, description: "Company-wide announcements" },
    { id: "engineering", name: "engineering", unread: 12, isPrivate: false, description: "Engineering team discussions" },
    { id: "product-launch", name: "product-launch", unread: 0, isPrivate: true, description: "Q1 product launch planning" },
    { id: "design", name: "design", unread: 5, isPrivate: false, description: "Design system and UX" },
    { id: "random", name: "random", unread: 24, isPrivate: false, description: "Non-work banter" },
    { id: "help-requests", name: "help-requests", unread: 0, isPrivate: false, description: "IT support requests" },
    { id: "sales-wins", name: "sales-wins", unread: 2, isPrivate: false, description: "Celebrate closed deals" },
    { id: "frontend", name: "frontend", unread: 8, isPrivate: false, description: "React, Next.js, UI/UX" },
    { id: "backend", name: "backend", unread: 3, isPrivate: false, description: "APIs, databases, infra" },
    { id: "devops", name: "devops", unread: 1, isPrivate: true, description: "CI/CD, deployments" },
  ];
  const dms = [
    { id: "sarah", name: "Sarah Chen", status: "online", unread: 2, title: "VP of Engineering" },
    { id: "mike", name: "Mike Johnson", status: "away", unread: 0, title: "Senior Developer" },
    { id: "alex", name: "Alex Kim", status: "dnd", unread: 0, title: "DevOps Lead" },
    { id: "emily", name: "Emily Rodriguez", status: "offline", unread: 1, title: "Product Manager" },
    { id: "james", name: "James Wilson", status: "online", unread: 0, title: "UI/UX Designer" },
    { id: "lisa", name: "Lisa Park", status: "online", unread: 3, title: "QA Engineer" },
  ];
  const apps = [
    { name: "GitHub", icon: "🐙" },
    { name: "Jira", icon: "🎯" },
    { name: "Google Drive", icon: "📁" },
    { name: "Zoom", icon: "📹" },
  ];

  const messages = [
    { id: 1, user: "Sarah Chen", avatar: "SC", time: "9:42 AM", content: "Good morning team! 👋 Just pushed the latest updates to the staging environment. Please take a look when you get a chance. The main changes include:\n\n• Real-time notification system\n• WebSocket connection pooling\n• Performance optimizations for the dashboard", reactions: [{ emoji: "👍", count: 5 }, { emoji: "🎉", count: 3 }, { emoji: "🚀", count: 7 }] },
    { id: 2, user: "Mike Johnson", avatar: "MJ", time: "9:45 AM", content: "Awesome! I'll review it right after standup. Quick question - did you include the fix for the notification bug?", thread: { count: 4, lastReply: "10:12 AM", participants: ["SC", "AK"] } },
    { id: 3, user: "Sarah Chen", avatar: "SC", time: "9:47 AM", content: "Yes! That's in there. Here's the PR for reference:", attachment: { type: "link", title: "fix: notification timing issue #2847", url: "github.com/digitalworkplace/intranet-iq/pull/2847", preview: "Fixes race condition in notification queue processing" } },
    { id: 4, user: "Alex Kim", avatar: "AK", time: "10:15 AM", content: "```typescript\nconst handleNotification = async (event: NotificationEvent) => {\n  await processQueue(event.data);\n  dispatch({ type: 'NOTIFICATION_RECEIVED', payload: event });\n  analytics.track('notification_received', { type: event.type });\n};\n```\nThis is the updated handler - much cleaner now! Added TypeScript types and analytics tracking.", reactions: [{ emoji: "💯", count: 2 }, { emoji: "🔥", count: 4 }] },
    { id: 5, user: "Emily Rodriguez", avatar: "ER", time: "10:32 AM", content: "@channel Reminder: Sprint planning in 30 minutes! Please review the backlog items before the meeting. Here's the agenda:\n\n1. Sprint 14 retrospective (10 min)\n2. Velocity review (5 min)\n3. Sprint 15 planning (30 min)\n4. Open discussion (15 min)", reactions: [{ emoji: "✅", count: 8 }, { emoji: "👀", count: 4 }], mention: true, pinned: true },
    { id: 6, user: "James Wilson", avatar: "JW", time: "10:45 AM", content: "Just finished the new dashboard mockups! Check out the Figma link:", attachment: { type: "figma", title: "Dashboard v3.0 - Final Designs", url: "figma.com/file/abc123", preview: "12 frames • Updated 2 hours ago" }, reactions: [{ emoji: "😍", count: 6 }, { emoji: "💜", count: 3 }] },
    { id: 7, user: "Lisa Park", avatar: "LP", time: "11:02 AM", content: "QA update: All regression tests passing ✅\n\n• Unit tests: 847/847 passed\n• Integration tests: 124/124 passed\n• E2E tests: 56/56 passed\n• Performance benchmarks: Within thresholds\n\nReady for release when you are!", reactions: [{ emoji: "🎉", count: 9 }, { emoji: "💪", count: 5 }], thread: { count: 2, lastReply: "11:15 AM", participants: ["SC"] } },
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
  const [activeView, setActiveView] = useState("board");
  const [filterAssignee, setFilterAssignee] = useState("all");

  const columns = [
    { id: "todo", name: "TO DO", count: 6, color: "bg-gray-500" },
    { id: "inprogress", name: "IN PROGRESS", count: 4, color: "bg-blue-500" },
    { id: "review", name: "IN REVIEW", count: 3, color: "bg-purple-500" },
    { id: "done", name: "DONE", count: 8, color: "bg-green-500" },
  ];

  const epics = [
    { key: "DIQ-100", name: "Real-time Notifications", color: "#36B37E" },
    { key: "DIQ-101", name: "Search Enhancement", color: "#6554C0" },
    { key: "DIQ-102", name: "Dashboard Redesign", color: "#FF5630" },
    { key: "DIQ-103", name: "Mobile Optimization", color: "#00B8D9" },
  ];

  const tickets = {
    todo: [
      { key: "DIQ-1240", title: "Add keyboard shortcuts for power users", type: "task", priority: "medium", assignee: "JW", points: 5, labels: ["UX"], epic: "DIQ-102", comments: 3 },
      { key: "DIQ-1241", title: "Implement dark mode toggle", type: "story", priority: "low", assignee: "AK", points: 3, labels: ["Frontend"], epic: "DIQ-102", comments: 7 },
      { key: "DIQ-1242", title: "Update API documentation", type: "task", priority: "low", assignee: null, points: 2, labels: ["Docs"], comments: 0 },
      { key: "DIQ-1243", title: "Performance optimization for search", type: "story", priority: "high", assignee: "MJ", points: 8, labels: ["Backend", "Performance"], epic: "DIQ-101", comments: 12 },
      { key: "DIQ-1250", title: "Add export to PDF feature", type: "story", priority: "medium", assignee: "SC", points: 5, labels: ["Feature"], comments: 2 },
      { key: "DIQ-1251", title: "Implement rate limiting for API", type: "task", priority: "high", assignee: "AK", points: 3, labels: ["Security", "Backend"], comments: 5 },
    ],
    inprogress: [
      { key: "DIQ-1234", title: "Implement real-time notification system", type: "story", priority: "high", assignee: "MJ", points: 8, labels: ["Feature", "WebSocket"], epic: "DIQ-100", comments: 24, subtasks: { done: 6, total: 8 } },
      { key: "DIQ-1238", title: "Integrate with Microsoft 365 Calendar", type: "story", priority: "high", assignee: "LP", points: 13, blocked: true, blockedBy: "DIQ-1252", labels: ["Integration"], comments: 8 },
      { key: "DIQ-1239", title: "Create onboarding flow for new users", type: "story", priority: "medium", assignee: "ER", points: 5, labels: ["UX", "Onboarding"], comments: 15, subtasks: { done: 3, total: 5 } },
      { key: "DIQ-1246", title: "Mobile responsive navigation", type: "story", priority: "high", assignee: "JW", points: 5, labels: ["Mobile", "Frontend"], epic: "DIQ-103", comments: 9 },
    ],
    review: [
      { key: "DIQ-1235", title: "[BUG] Search results not updating after deletion", type: "bug", priority: "highest", assignee: "AK", points: 3, labels: ["Bug", "Critical"], comments: 18, flagged: true },
      { key: "DIQ-1237", title: "Add user activity analytics dashboard", type: "story", priority: "medium", assignee: "SC", points: 8, labels: ["Analytics", "Dashboard"], epic: "DIQ-102", comments: 6 },
      { key: "DIQ-1248", title: "Implement SSO with Okta", type: "story", priority: "high", assignee: "MJ", points: 8, labels: ["Security", "Integration"], comments: 11 },
    ],
    done: [
      { key: "DIQ-1230", title: "Set up CI/CD pipeline", type: "task", priority: "high", assignee: "AK", points: 5, labels: ["DevOps"], comments: 14 },
      { key: "DIQ-1231", title: "Create component library documentation", type: "task", priority: "medium", assignee: "JW", points: 3, labels: ["Docs"], comments: 5 },
      { key: "DIQ-1232", title: "Implement user authentication", type: "story", priority: "highest", assignee: "MJ", points: 13, labels: ["Auth", "Security"], epic: "DIQ-100", comments: 31 },
      { key: "DIQ-1233", title: "Design system color tokens", type: "task", priority: "medium", assignee: "JW", points: 2, labels: ["Design"], comments: 8 },
      { key: "DIQ-1229", title: "Database schema migration", type: "task", priority: "high", assignee: "AK", points: 5, labels: ["Backend", "Database"], comments: 12 },
      { key: "DIQ-1244", title: "Add Elasticsearch integration", type: "story", priority: "high", assignee: "MJ", points: 13, labels: ["Search", "Backend"], epic: "DIQ-101", comments: 22 },
      { key: "DIQ-1245", title: "Implement file upload with S3", type: "story", priority: "medium", assignee: "AK", points: 8, labels: ["Feature", "AWS"], comments: 9 },
      { key: "DIQ-1247", title: "Add unit tests for auth module", type: "task", priority: "medium", assignee: "LP", points: 5, labels: ["Testing"], comments: 4 },
    ],
  };

  const sprintStats = {
    totalPoints: 94,
    completedPoints: 54,
    daysRemaining: 8,
    velocity: 42,
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
  const [expandedFile, setExpandedFile] = useState("src/lib/websocket/client.ts");

  const prData = {
    title: "feat: implement WebSocket-based real-time notifications",
    number: 2846,
    state: "open",
    author: "mikejohnson",
    authorAvatar: "MJ",
    branch: { from: "feature/realtime-notifications", to: "main" },
    commits: 12,
    additions: 1847,
    deletions: 234,
    files: 28,
    createdAt: "3 days ago",
    updatedAt: "2 hours ago",
    labels: [
      { name: "feature", color: "0e8a16" },
      { name: "priority: high", color: "d93f0b" },
      { name: "needs-review", color: "fbca04" },
    ],
    reviewers: [
      { name: "alexkim", status: "approved", avatar: "AK" },
      { name: "emilyrodriguez", status: "approved", avatar: "ER" },
      { name: "sarahchen", status: "pending", avatar: "SC" },
    ],
    checks: [
      { name: "CI / Build", status: "success", time: "2m 34s" },
      { name: "CI / Unit Tests (847 tests)", status: "success", time: "4m 12s" },
      { name: "CI / Integration Tests", status: "success", time: "6m 45s" },
      { name: "CI / E2E Tests", status: "success", time: "8m 21s" },
      { name: "Security Scan (Snyk)", status: "success", time: "1m 12s" },
      { name: "Code Coverage (87%)", status: "success", time: "32s" },
      { name: "Lint & Format", status: "success", time: "45s" },
      { name: "Type Check", status: "success", time: "1m 8s" },
    ],
    comments: [
      { user: "alexkim", avatar: "AK", time: "2 days ago", content: "Great implementation! The connection pooling logic looks solid. Just a few minor suggestions." },
      { user: "emilyrodriguez", avatar: "ER", time: "1 day ago", content: "LGTM! Tested locally and notifications are working perfectly." },
    ],
  };

  const files = [
    { name: "src/lib/websocket/client.ts", additions: 245, deletions: 0, status: "added", comments: 3 },
    { name: "src/lib/websocket/server.ts", additions: 312, deletions: 0, status: "added", comments: 1 },
    { name: "src/lib/websocket/types.ts", additions: 67, deletions: 0, status: "added", comments: 0 },
    { name: "src/hooks/useNotifications.ts", additions: 89, deletions: 23, status: "modified", comments: 2 },
    { name: "src/hooks/useWebSocket.ts", additions: 134, deletions: 0, status: "added", comments: 0 },
    { name: "src/components/NotificationBell.tsx", additions: 156, deletions: 45, status: "modified", comments: 4 },
    { name: "src/components/NotificationPanel.tsx", additions: 234, deletions: 0, status: "added", comments: 1 },
    { name: "src/components/NotificationItem.tsx", additions: 89, deletions: 0, status: "added", comments: 0 },
    { name: "src/app/api/notifications/route.ts", additions: 67, deletions: 12, status: "modified", comments: 0 },
    { name: "src/app/api/notifications/stream/route.ts", additions: 145, deletions: 0, status: "added", comments: 2 },
    { name: "package.json", additions: 3, deletions: 1, status: "modified", comments: 0 },
    { name: "package-lock.json", additions: 286, deletions: 152, status: "modified", comments: 0 },
  ];

  const commits = [
    { sha: "a1b2c3d", message: "feat: add WebSocket client with reconnection logic", author: "mikejohnson", time: "3 days ago" },
    { sha: "e4f5g6h", message: "feat: implement notification server endpoints", author: "mikejohnson", time: "3 days ago" },
    { sha: "i7j8k9l", message: "feat: add useWebSocket hook for React integration", author: "mikejohnson", time: "2 days ago" },
    { sha: "m0n1o2p", message: "feat: create NotificationPanel component", author: "mikejohnson", time: "2 days ago" },
    { sha: "q3r4s5t", message: "fix: handle edge case in connection pooling", author: "mikejohnson", time: "2 days ago" },
    { sha: "u6v7w8x", message: "test: add unit tests for WebSocket client", author: "mikejohnson", time: "1 day ago" },
    { sha: "y9z0a1b", message: "docs: update README with WebSocket configuration", author: "mikejohnson", time: "1 day ago" },
    { sha: "c2d3e4f", message: "refactor: extract types to separate file", author: "mikejohnson", time: "2 hours ago" },
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
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("modified");

  const folders = [
    { name: "Engineering", items: 24, color: "#4285f4", shared: true },
    { name: "Product", items: 18, color: "#ea4335", shared: true },
    { name: "Design", items: 12, color: "#fbbc04", shared: false },
    { name: "Marketing", items: 31, color: "#34a853", shared: true },
    { name: "Finance", items: 8, color: "#9334e6", shared: false },
    { name: "HR Documents", items: 15, color: "#ff6d01", shared: false },
    { name: "Legal", items: 6, color: "#185abc", shared: false },
    { name: "Client Projects", items: 42, color: "#137333", shared: true },
  ];

  const recentFolders = [
    { name: "Sprint 14 Assets", parent: "Engineering", modified: "2 hours ago" },
    { name: "Brand Refresh 2026", parent: "Marketing", modified: "Yesterday" },
    { name: "API Specs v3", parent: "Engineering", modified: "2 days ago" },
  ];

  const files = [
    { name: "Q1 2026 Product Roadmap.pptx", type: "presentation", size: "24.5 MB", modified: "Jan 30, 2026", owner: "Emily R.", starred: true, shared: ["Sarah C.", "Mike J.", "+3"] },
    { name: "Engineering OKRs.xlsx", type: "spreadsheet", size: "1.2 MB", modified: "Jan 29, 2026", owner: "Sarah C.", starred: true, shared: ["Team"] },
    { name: "API Documentation v3.docx", type: "document", size: "856 KB", modified: "Jan 28, 2026", owner: "Mike J.", starred: false, shared: ["Public"] },
    { name: "Brand Guidelines.pdf", type: "pdf", size: "45.2 MB", modified: "Jan 27, 2026", owner: "James W.", starred: true, shared: ["Marketing"] },
    { name: "Architecture Diagram.png", type: "image", size: "2.1 MB", modified: "Jan 26, 2026", owner: "Alex K.", starred: false, shared: [] },
    { name: "Sprint Retro Notes.docx", type: "document", size: "124 KB", modified: "Jan 25, 2026", owner: "Emily R.", starred: false, shared: ["Engineering"] },
    { name: "Budget Forecast 2026.xlsx", type: "spreadsheet", size: "3.4 MB", modified: "Jan 24, 2026", owner: "Finance Team", starred: true, shared: ["Execs"] },
    { name: "User Research Findings.pdf", type: "pdf", size: "12.8 MB", modified: "Jan 23, 2026", owner: "Lisa P.", starred: false, shared: ["Product"] },
    { name: "Competitor Analysis.pptx", type: "presentation", size: "18.6 MB", modified: "Jan 22, 2026", owner: "Emily R.", starred: false, shared: ["Strategy"] },
    { name: "Database Schema.sql", type: "code", size: "45 KB", modified: "Jan 21, 2026", owner: "Alex K.", starred: true, shared: ["Backend"] },
    { name: "Meeting Recording 01-20.mp4", type: "video", size: "245 MB", modified: "Jan 20, 2026", owner: "Zoom", starred: false, shared: [] },
    { name: "Onboarding Checklist.docx", type: "document", size: "234 KB", modified: "Jan 19, 2026", owner: "HR Team", starred: false, shared: ["All"] },
  ];

  const storageUsed = 8.7;
  const storageTotal = 15;

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
  const [activeSection, setActiveSection] = useState("home");

  const meetings = [
    { id: 1, title: "Weekly Team Standup", time: "10:00 AM - 10:30 AM", host: "Sarah Chen", status: "live", participants: 12, meetingId: "847 2931 4582", recurring: true },
    { id: 2, title: "Q1 Planning Review", time: "2:00 PM - 3:00 PM", host: "Emily Rodriguez", status: "upcoming", participants: 0, meetingId: "923 1847 3920", recurring: false },
    { id: 3, title: "Design Review", time: "4:00 PM - 4:45 PM", host: "James Wilson", status: "upcoming", participants: 0, meetingId: "182 9374 5821", recurring: true },
    { id: 4, title: "1:1 with Mike", time: "5:00 PM - 5:30 PM", host: "You", status: "upcoming", participants: 0, meetingId: "293 1820 4738", recurring: true },
  ];

  const upcomingMeetings = [
    { title: "Sprint Retrospective", date: "Tomorrow", time: "9:00 AM", host: "Sarah Chen" },
    { title: "Product Roadmap Review", date: "Tomorrow", time: "2:00 PM", host: "Emily Rodriguez" },
    { title: "All-Hands Meeting", date: "Friday", time: "10:00 AM", host: "CEO" },
    { title: "Tech Talk: WebSockets", date: "Friday", time: "3:00 PM", host: "Mike Johnson" },
  ];

  const recordings = [
    { title: "Product Demo - Acme Corp", date: "Jan 29, 2026", duration: "42:18", size: "156 MB", thumbnail: "demo", views: 24, shared: true },
    { title: "Engineering All-Hands", date: "Jan 28, 2026", duration: "58:32", size: "234 MB", thumbnail: "meeting", views: 47, shared: true },
    { title: "Customer Success Training", date: "Jan 27, 2026", duration: "1:23:45", size: "412 MB", thumbnail: "training", views: 156, shared: true },
    { title: "Q4 2025 Review", date: "Jan 15, 2026", duration: "1:45:22", size: "523 MB", thumbnail: "review", views: 89, shared: false },
    { title: "New Hire Orientation", date: "Jan 12, 2026", duration: "2:10:15", size: "678 MB", thumbnail: "onboard", views: 234, shared: true },
  ];

  const contacts = [
    { name: "Sarah Chen", email: "sarah@company.com", status: "online", favorite: true },
    { name: "Mike Johnson", email: "mike@company.com", status: "away", favorite: true },
    { name: "Emily Rodriguez", email: "emily@company.com", status: "offline", favorite: true },
    { name: "Alex Kim", email: "alex@company.com", status: "dnd", favorite: false },
    { name: "James Wilson", email: "james@company.com", status: "online", favorite: false },
  ];

  const personalMeetingId = "847 2931 4582";

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
  const [selectedQuarter, setSelectedQuarter] = useState("Q1 2026");
  const [viewMode, setViewMode] = useState("pipeline");

  const stages = [
    { name: "Prospecting", color: "#b0adab", deals: 4, value: "$2.85M" },
    { name: "Qualification", color: "#f88962", deals: 3, value: "$1.12M" },
    { name: "Proposal", color: "#54c1d2", deals: 2, value: "$1.65M" },
    { name: "Negotiation", color: "#4bc076", deals: 2, value: "$980K" },
    { name: "Closed Won", color: "#2e844a", deals: 5, value: "$4.8M" },
  ];

  const pipelineStats = {
    totalValue: "$11.4M",
    weightedValue: "$6.2M",
    avgDealSize: "$712K",
    winRate: "32%",
    avgSalesCycle: "45 days",
    dealsInPipeline: 16,
  };

  const opportunities = {
    Prospecting: [
      { name: "Retail Giant - Analytics Suite", account: "Retail Giant Co", amount: 1200000, probability: 10, owner: "David Brown", nextStep: "Discovery call scheduled", closeDate: "Mar 15, 2026", industry: "Retail" },
      { name: "Tech Startup - Basic Plan", account: "NextGen Tech", amount: 180000, probability: 15, owner: "Lisa Park", nextStep: "Send proposal", closeDate: "Feb 28, 2026", industry: "Technology" },
      { name: "Manufacturing Corp - IoT Platform", account: "Industrial Systems Inc", amount: 890000, probability: 10, owner: "David Brown", nextStep: "Initial meeting", closeDate: "Apr 10, 2026", industry: "Manufacturing" },
      { name: "Education First - Learning Suite", account: "Education First", amount: 580000, probability: 20, owner: "Sarah M.", nextStep: "Demo scheduled", closeDate: "Mar 22, 2026", industry: "Education" },
    ],
    Qualification: [
      { name: "HealthCare Plus - Compliance Package", account: "HealthCare Plus", amount: 425000, probability: 30, owner: "Lisa Park", nextStep: "Technical review", closeDate: "Feb 20, 2026", industry: "Healthcare" },
      { name: "Financial Services - Risk Platform", account: "Capital Partners", amount: 520000, probability: 35, owner: "David Brown", nextStep: "Security audit", closeDate: "Mar 5, 2026", industry: "Finance" },
      { name: "Logistics Pro - Tracking System", account: "FastShip Logistics", amount: 175000, probability: 40, owner: "Sarah M.", nextStep: "POC setup", closeDate: "Feb 15, 2026", industry: "Logistics" },
    ],
    Proposal: [
      { name: "Global Finance - Platform Migration", account: "Global Finance Ltd", amount: 850000, probability: 50, owner: "David Brown", nextStep: "Contract review", closeDate: "Feb 10, 2026", industry: "Finance", hot: true },
      { name: "Media Group - Content Platform", account: "Digital Media Corp", amount: 800000, probability: 55, owner: "Lisa Park", nextStep: "Executive presentation", closeDate: "Feb 18, 2026", industry: "Media" },
    ],
    Negotiation: [
      { name: "TechStart Inc - Startup Plan", account: "TechStart Inc", amount: 180000, probability: 75, owner: "Lisa Park", nextStep: "Final pricing discussion", closeDate: "Feb 5, 2026", industry: "Technology", hot: true },
      { name: "Insurance Partners - Claims System", account: "National Insurance", amount: 800000, probability: 80, owner: "David Brown", nextStep: "Legal review", closeDate: "Feb 8, 2026", industry: "Insurance", hot: true },
    ],
    "Closed Won": [
      { name: "Acme Corp - Enterprise License", account: "Acme Corporation", amount: 2400000, probability: 100, owner: "David Brown", closeDate: "Jan 28, 2026", industry: "Technology" },
      { name: "Metro Hospital - Patient Portal", account: "Metro Health System", amount: 650000, probability: 100, owner: "Lisa Park", closeDate: "Jan 25, 2026", industry: "Healthcare" },
      { name: "Legal Associates - Document AI", account: "Legal Associates LLP", amount: 320000, probability: 100, owner: "Sarah M.", closeDate: "Jan 22, 2026", industry: "Legal" },
      { name: "Green Energy - Monitoring Suite", account: "Green Energy Solutions", amount: 890000, probability: 100, owner: "David Brown", closeDate: "Jan 18, 2026", industry: "Energy" },
      { name: "Travel Co - Booking Platform", account: "Global Travel Inc", amount: 540000, probability: 100, owner: "Lisa Park", closeDate: "Jan 12, 2026", industry: "Travel" },
    ],
  };

  const activities = [
    { type: "call", description: "Discovery call with Retail Giant", time: "2 hours ago", owner: "David Brown" },
    { type: "email", description: "Sent proposal to Global Finance", time: "4 hours ago", owner: "David Brown" },
    { type: "meeting", description: "Demo with HealthCare Plus", time: "Yesterday", owner: "Lisa Park" },
    { type: "task", description: "Follow up with TechStart Inc", time: "Yesterday", owner: "Lisa Park" },
  ];

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
  const [selectedPage, setSelectedPage] = useState("sprint-planning");
  const [dbView, setDbView] = useState("board");

  const workspaces = [
    { name: "Digital Workplace", icon: "🏢", members: 47 },
    { name: "Personal", icon: "👤", members: 1 },
  ];

  const pages = [
    { id: "sprint-planning", icon: "📋", name: "Sprint Planning", type: "database", lastEdited: "2 hours ago", views: ["Board", "Table", "Timeline"] },
    { id: "team-wiki", icon: "📚", name: "Team Wiki", type: "page", lastEdited: "Yesterday" },
    { id: "ideas-backlog", icon: "💡", name: "Ideas Backlog", type: "database", lastEdited: "3 days ago", views: ["Board", "List"] },
    { id: "meeting-notes", icon: "📝", name: "Meeting Notes", type: "page", lastEdited: "Today" },
    { id: "okrs-2026", icon: "🎯", name: "OKRs 2026", type: "database", lastEdited: "1 week ago", views: ["Table", "Board"] },
    { id: "roadmap", icon: "🗺️", name: "Product Roadmap", type: "database", lastEdited: "Yesterday", views: ["Timeline", "Board"] },
    { id: "docs", icon: "📖", name: "Documentation", type: "page", lastEdited: "4 days ago" },
    { id: "resources", icon: "🔗", name: "Useful Resources", type: "page", lastEdited: "1 week ago" },
  ];

  const favorites = [
    { icon: "⭐", name: "Quick Links", type: "page" },
    { icon: "📊", name: "Team Dashboard", type: "database" },
  ];

  const sprintTasks = {
    "To Do": [
      { id: 1, title: "Implement search filters", priority: "High", assignee: "SC", tags: ["Frontend"], dueDate: "Feb 5" },
      { id: 2, title: "Write API documentation", priority: "Medium", assignee: "MJ", tags: ["Docs"], dueDate: "Feb 7" },
      { id: 3, title: "Design error states", priority: "Low", assignee: "JW", tags: ["Design"], dueDate: "Feb 8" },
      { id: 4, title: "Set up monitoring", priority: "High", assignee: "AK", tags: ["DevOps"], dueDate: "Feb 4" },
    ],
    "In Progress": [
      { id: 5, title: "Build notification system", priority: "High", assignee: "MJ", tags: ["Backend", "Feature"], dueDate: "Feb 3", progress: 75 },
      { id: 6, title: "User testing sessions", priority: "Medium", assignee: "LP", tags: ["Research"], dueDate: "Feb 6", progress: 40 },
    ],
    "Done": [
      { id: 7, title: "Database migration", priority: "High", assignee: "AK", tags: ["Backend"], completedDate: "Jan 30" },
      { id: 8, title: "Landing page redesign", priority: "Medium", assignee: "JW", tags: ["Design", "Frontend"], completedDate: "Jan 29" },
      { id: 9, title: "Performance optimization", priority: "High", assignee: "SC", tags: ["Frontend"], completedDate: "Jan 28" },
    ],
  };

  const recentActivity = [
    { user: "Sarah Chen", action: "edited", page: "Sprint Planning", time: "2 hours ago" },
    { user: "Mike Johnson", action: "commented on", page: "API Documentation", time: "4 hours ago" },
    { user: "James Wilson", action: "created", page: "Design System v3", time: "Yesterday" },
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
  const [activeTab, setActiveTab] = useState("feed");

  const userProfile = {
    name: "Your Name",
    title: "Software Engineer at Digital Workplace AI",
    connections: 847,
    profileViews: 142,
    postImpressions: 1247,
    searchAppearances: 38,
  };

  const posts = [
    {
      author: "Sarah Chen",
      title: "VP of Engineering at Digital Workplace AI",
      avatar: "SC",
      time: "2h",
      content: "Excited to announce that we've just reached a major milestone - our AI assistant now handles over 1 million queries per day! 🎉\n\nThis wouldn't have been possible without our incredible engineering team. Special thanks to @Mike Johnson and @Alex Kim for leading this effort.\n\nKey achievements:\n• 99.9% uptime\n• <100ms average response time\n• 4.8/5 user satisfaction score\n\n#AI #Engineering #Milestone #TechLeadership",
      likes: 1234,
      comments: 89,
      reposts: 45,
      celebrates: 156,
      verified: true,
    },
    {
      author: "Emily Rodriguez",
      title: "Product Manager at Digital Workplace AI",
      avatar: "ER",
      time: "5h",
      content: "Just published a new article on building products that users actually love. Key takeaway: Listen more, assume less.\n\n5 principles I've learned:\n1. User feedback is gold\n2. Data tells stories\n3. Iterate fast, fail faster\n4. Simplicity wins\n5. Empathy is your superpower\n\nLink in comments 👇",
      likes: 567,
      comments: 78,
      reposts: 23,
      image: true,
    },
    {
      author: "Mike Johnson",
      title: "Senior Software Engineer at Digital Workplace AI",
      avatar: "MJ",
      time: "1d",
      content: "🚀 Just open-sourced our WebSocket library that powers real-time features at Digital Workplace!\n\nFeatures:\n• Automatic reconnection\n• Connection pooling\n• TypeScript support\n• <5KB gzipped\n\nCheck it out: github.com/digitalworkplace/ws-client\n\n#OpenSource #WebSockets #TypeScript",
      likes: 892,
      comments: 134,
      reposts: 67,
      code: true,
    },
    {
      author: "Digital Workplace AI",
      title: "45,000 followers • Enterprise Software",
      avatar: "DW",
      time: "2d",
      content: "We're hiring! 🎯\n\nLooking for talented engineers to join our growing team:\n\n• Senior Frontend Engineer (React/Next.js)\n• Backend Engineer (Node.js/Python)\n• DevOps Engineer (AWS/Kubernetes)\n• Product Designer (Figma)\n\nRemote-first | Competitive salary | Great benefits\n\nApply now: careers.digitalworkplace.ai\n\n#Hiring #TechJobs #RemoteWork",
      likes: 456,
      comments: 89,
      reposts: 123,
      promoted: true,
    },
  ];

  const notifications = [
    { type: "connection", text: "Alex Kim accepted your connection request", time: "1h ago" },
    { type: "like", text: "Sarah Chen and 12 others liked your post", time: "3h ago" },
    { type: "comment", text: "Mike Johnson commented on your post", time: "5h ago" },
    { type: "view", text: "Your profile was viewed by 15 people", time: "1d ago" },
  ];

  const suggestedConnections = [
    { name: "Jennifer Lee", title: "Engineering Manager at Meta", mutual: 12 },
    { name: "David Park", title: "CTO at TechStartup", mutual: 8 },
    { name: "Amanda Torres", title: "Product Lead at Google", mutual: 15 },
  ];

  const trendingTopics = [
    { topic: "#AIEngineering", posts: "2,847 posts" },
    { topic: "#RemoteWork", posts: "5,234 posts" },
    { topic: "#TechLeadership", posts: "1,456 posts" },
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

// ============================================================================
// EMAIL - Gmail-style Email Client
// ============================================================================
function EmailApp() {
  const [selectedEmail, setSelectedEmail] = useState<number | null>(1);
  const [selectedFolder, setSelectedFolder] = useState("inbox");

  const folders = [
    { id: "inbox", name: "Inbox", icon: "📥", count: 12 },
    { id: "starred", name: "Starred", icon: "⭐", count: 3 },
    { id: "sent", name: "Sent", icon: "📤", count: 0 },
    { id: "drafts", name: "Drafts", icon: "📝", count: 2 },
    { id: "important", name: "Important", icon: "🏷️", count: 5 },
    { id: "spam", name: "Spam", icon: "⚠️", count: 0 },
    { id: "trash", name: "Trash", icon: "🗑️", count: 0 },
  ];

  const emails = [
    { id: 1, from: "Sarah Chen", email: "sarah@company.com", subject: "Re: Q1 Budget Review - Final approval needed", preview: "Hi team, I've reviewed the budget proposal and have a few comments...", time: "2h ago", starred: true, important: true, unread: true },
    { id: 2, from: "Mike Johnson", email: "mike@company.com", subject: "Sprint Planning Notes - Attached", preview: "Here are the notes from today's sprint planning session. Please review and add any items I might have missed.", time: "4h ago", starred: false, important: false, unread: true },
    { id: 3, from: "HR Team", email: "hr@company.com", subject: "Benefits Enrollment Reminder - Action Required", preview: "This is a reminder that open enrollment closes on Friday. Please make sure to review and confirm your selections.", time: "Yesterday", starred: false, important: true, unread: false },
    { id: 4, from: "Alex Kim", email: "alex@company.com", subject: "DevOps Weekly Update", preview: "Quick update on our CI/CD improvements this week. We've reduced build times by 40% and...", time: "Yesterday", starred: false, important: false, unread: false },
    { id: 5, from: "Emily Rodriguez", email: "emily@company.com", subject: "Product Roadmap Q2 2026", preview: "Attached is the draft roadmap for Q2. Would love your feedback before we present to leadership.", time: "2 days ago", starred: true, important: true, unread: false },
    { id: 6, from: "James Wilson", email: "james@company.com", subject: "Design Review Meeting", preview: "Reminder: We have our design review meeting tomorrow at 2 PM. Please bring your latest mockups.", time: "2 days ago", starred: false, important: false, unread: false },
    { id: 7, from: "Lisa Park", email: "lisa@company.com", subject: "QA Test Results - All Passed", preview: "Great news! All regression tests have passed. We're ready for the release candidate.", time: "3 days ago", starred: false, important: false, unread: false },
    { id: 8, from: "Tech Newsletter", email: "news@tech.com", subject: "This Week in AI: GPT-5 Rumors and More", preview: "Your weekly roundup of the latest in technology, AI, and software development...", time: "3 days ago", starred: false, important: false, unread: false },
  ];

  const selectedEmailData = emails.find(e => e.id === selectedEmail);

  return (
    <div className="h-full flex bg-[#f6f8fc]">
      {/* Sidebar */}
      <div className="w-64 bg-[#f6f8fc] p-4 flex flex-col">
        <button className="flex items-center gap-3 px-6 py-3 bg-white hover:shadow-md rounded-2xl text-gray-700 font-medium mb-4 transition-shadow">
          <Edit3 className="w-5 h-5" />
          Compose
        </button>
        <nav className="space-y-1">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-r-full text-sm ${
                selectedFolder === folder.id
                  ? "bg-[#d3e3fd] text-[#001d35] font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{folder.icon}</span>
              <span className="flex-1 text-left">{folder.name}</span>
              {folder.count > 0 && (
                <span className={`text-xs ${selectedFolder === folder.id ? "font-bold" : ""}`}>
                  {folder.count}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t">
          <div className="text-xs text-gray-500">
            <div className="flex justify-between mb-1">
              <span>Storage used</span>
              <span>5.2 GB of 15 GB</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full">
              <div className="h-full w-1/3 bg-[#1a73e8] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="w-96 bg-white border-x border-gray-200 flex flex-col">
        <div className="p-3 border-b flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 rounded"
          />
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          <span className="ml-auto text-xs text-gray-500">1-50 of 128</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email.id)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 ${
                selectedEmail === email.id
                  ? "bg-[#c2dbff]"
                  : email.unread
                  ? "bg-white hover:shadow-md"
                  : "bg-[#f6f8fc] hover:bg-gray-100"
              }`}
            >
              <input type="checkbox" className="w-4 h-4 mt-1 rounded" onClick={(e) => e.stopPropagation()} />
              <button onClick={(e) => { e.stopPropagation(); }} className="mt-0.5">
                <Star className={`w-4 h-4 ${email.starred ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm truncate ${email.unread ? "font-bold text-gray-900" : "text-gray-700"}`}>
                    {email.from}
                  </span>
                  {email.important && <span className="text-yellow-500 text-xs">🏷️</span>}
                </div>
                <p className={`text-sm truncate ${email.unread ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                  {email.subject}
                </p>
                <p className="text-xs text-gray-500 truncate">{email.preview}</p>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">{email.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Email Detail */}
      <div className="flex-1 bg-white flex flex-col">
        {selectedEmailData ? (
          <>
            <div className="p-4 border-b flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5 text-gray-500" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-full"><Trash2 className="w-5 h-5 text-gray-500" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-full"><FileText className="w-5 h-5 text-gray-500" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-full"><Clock className="w-5 h-5 text-gray-500" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <h1 className="text-2xl text-gray-900 mb-4">{selectedEmailData.subject}</h1>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {selectedEmailData.from[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{selectedEmailData.from}</span>
                    <span className="text-sm text-gray-500">&lt;{selectedEmailData.email}&gt;</span>
                  </div>
                  <div className="text-sm text-gray-500">to me</div>
                </div>
                <span className="text-sm text-gray-500">{selectedEmailData.time}</span>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Star className={`w-5 h-5 ${selectedEmailData.starred ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                </button>
              </div>
              <div className="prose max-w-none text-gray-700">
                <p>Hi,</p>
                <p className="mt-4">{selectedEmailData.preview}</p>
                <p className="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <p className="mt-4">Please let me know if you have any questions or concerns.</p>
                <p className="mt-4">Best regards,<br />{selectedEmailData.from}</p>
              </div>
            </div>
            <div className="p-4 border-t flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border rounded-full text-gray-700 hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4" /> Reply
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border rounded-full text-gray-700 hover:bg-gray-100">
                <Share2 className="w-4 h-4" /> Forward
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select an email to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// BOOKMARKS - Bookmark Manager App
// ============================================================================
function BookmarksApp() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All Bookmarks", icon: "📚", count: 24 },
    { id: "work", name: "Work", icon: "💼", count: 12 },
    { id: "dev", name: "Development", icon: "💻", count: 8 },
    { id: "design", name: "Design", icon: "🎨", count: 6 },
    { id: "learning", name: "Learning", icon: "📖", count: 5 },
    { id: "tools", name: "Tools", icon: "🛠️", count: 7 },
    { id: "news", name: "News", icon: "📰", count: 3 },
  ];

  const bookmarks = [
    { id: 1, title: "React Documentation", url: "react.dev", category: "dev", favicon: "⚛️", description: "Official React documentation - learn React step by step", tags: ["react", "frontend", "docs"], createdAt: "2 days ago" },
    { id: 2, title: "Tailwind CSS", url: "tailwindcss.com", category: "dev", favicon: "🎨", description: "Rapidly build modern websites without ever leaving your HTML", tags: ["css", "styling", "framework"], createdAt: "3 days ago" },
    { id: 3, title: "Figma Community", url: "figma.com/community", category: "design", favicon: "🎨", description: "Browse and use thousands of free design files and plugins", tags: ["design", "ui", "templates"], createdAt: "1 week ago" },
    { id: 4, title: "GitHub", url: "github.com", category: "dev", favicon: "🐙", description: "Where the world builds software", tags: ["code", "git", "collaboration"], createdAt: "1 week ago" },
    { id: 5, title: "Vercel Dashboard", url: "vercel.com/dashboard", category: "work", favicon: "▲", description: "Deploy and manage your applications", tags: ["deploy", "hosting", "ci-cd"], createdAt: "2 weeks ago" },
    { id: 6, title: "Supabase Docs", url: "supabase.com/docs", category: "dev", favicon: "⚡", description: "Supabase documentation and API reference", tags: ["database", "backend", "api"], createdAt: "2 weeks ago" },
    { id: 7, title: "Dribbble", url: "dribbble.com", category: "design", favicon: "🏀", description: "Discover the world's top designers & creatives", tags: ["design", "inspiration", "portfolio"], createdAt: "3 weeks ago" },
    { id: 8, title: "MDN Web Docs", url: "developer.mozilla.org", category: "learning", favicon: "🦊", description: "Resources for developers, by developers", tags: ["docs", "reference", "web"], createdAt: "1 month ago" },
    { id: 9, title: "Company Wiki", url: "wiki.company.com", category: "work", favicon: "📖", description: "Internal company knowledge base and documentation", tags: ["internal", "docs", "wiki"], createdAt: "1 month ago" },
    { id: 10, title: "Jira Board", url: "jira.atlassian.com/browse/PROJ", category: "work", favicon: "🎯", description: "Project management and issue tracking", tags: ["project", "tasks", "agile"], createdAt: "1 month ago" },
    { id: 11, title: "Notion Templates", url: "notion.so/templates", category: "tools", favicon: "📓", description: "Get started with templates for every use case", tags: ["templates", "productivity", "notes"], createdAt: "1 month ago" },
    { id: 12, title: "Tech News Daily", url: "technews.com", category: "news", favicon: "📰", description: "Latest technology news and updates", tags: ["news", "tech", "updates"], createdAt: "2 months ago" },
  ];

  const filteredBookmarks = bookmarks.filter(b => {
    const matchesCategory = selectedCategory === "all" || b.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full flex bg-[#0f0f12]">
      {/* Sidebar */}
      <div className="w-64 bg-[#16161a] border-r border-white/10 p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="font-semibold text-white">Bookmarks</h1>
            <p className="text-xs text-white/50">24 saved links</p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 rounded-xl text-white font-medium mb-4 transition-colors">
          <Plus className="w-4 h-4" />
          Add Bookmark
        </button>

        <nav className="space-y-1 flex-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat.id
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{cat.icon}</span>
              <span className="flex-1 text-left">{cat.name}</span>
              <span className="text-xs opacity-60">{cat.count}</span>
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-white/10">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white/70 text-sm">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookmarks..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 text-white/40">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            {filteredBookmarks.map((bookmark) => (
              <motion.a
                key={bookmark.id}
                href={`https://${bookmark.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-xl bg-[#1a1a1f] border border-white/5 hover:border-violet-500/30 transition-all"
                whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(139, 92, 246, 0.15)" }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                    {bookmark.favicon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate group-hover:text-violet-300 transition-colors">
                      {bookmark.title}
                    </h3>
                    <p className="text-xs text-white/40 truncate">{bookmark.url}</p>
                  </div>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/50 transition-all"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-3 text-sm text-white/50 line-clamp-2">{bookmark.description}</p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {bookmark.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/40">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30">
                  <span>Added {bookmark.createdAt}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
