"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Search,
  Filter,
  FileText,
  Users,
  Calendar,
  Mail,
  Database,
  ChevronDown,
  X,
  ExternalLink,
  Clock,
  Star,
  Sparkles,
  SlidersHorizontal,
  Image as ImageIcon,
  Video,
  Link2,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  type: "document" | "channel" | "person" | "event" | "email" | "kb";
  source: string;
  relevance: number;
  date: string;
  thumbnail?: string;
}

const sampleResults: SearchResult[] = [
  {
    id: "1",
    title: "Q4 2025 Strategic Planning Document",
    snippet:
      "This document outlines the strategic priorities for Q4 2025, including market expansion plans, product roadmap updates, and key performance indicators...",
    type: "document",
    source: "Company Documents",
    relevance: 98,
    date: "Updated 2 days ago",
  },
  {
    id: "2",
    title: "Engineering Team Channel",
    snippet:
      "Discussion about Q4 planning milestones and resource allocation for the upcoming sprint cycles...",
    type: "channel",
    source: "Team Channels",
    relevance: 92,
    date: "12 new messages",
  },
  {
    id: "3",
    title: "Sarah Chen - VP of Engineering",
    snippet:
      "Leading the engineering team. Key contact for technical decisions and Q4 planning coordination...",
    type: "person",
    source: "People Directory",
    relevance: 88,
    date: "Active now",
  },
  {
    id: "4",
    title: "Q4 Planning Kickoff Meeting",
    snippet:
      "All-hands meeting to discuss Q4 priorities, team goals, and resource planning for the quarter...",
    type: "event",
    source: "Calendar",
    relevance: 85,
    date: "Tomorrow at 2:00 PM",
  },
  {
    id: "5",
    title: "Project Management Best Practices",
    snippet:
      "Knowledge base article covering project planning methodologies, sprint planning, and quarterly goal setting...",
    type: "kb",
    source: "Knowledge Base",
    relevance: 82,
    date: "Last updated 1 week ago",
  },
];

const filterCategories = [
  { id: "all", label: "All Results", icon: Database },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "channels", label: "Channels", icon: Users },
  { id: "people", label: "People", icon: Users },
  { id: "events", label: "Events", icon: Calendar },
  { id: "emails", label: "Emails", icon: Mail },
  { id: "kb", label: "Knowledge Base", icon: Database },
];

const typeIcons: Record<string, typeof FileText> = {
  document: FileText,
  channel: Users,
  person: Users,
  event: Calendar,
  email: Mail,
  kb: Database,
};

const typeColors: Record<string, string> = {
  document: "bg-blue-500/20 text-blue-400",
  channel: "bg-purple-500/20 text-purple-400",
  person: "bg-green-500/20 text-green-400",
  event: "bg-orange-500/20 text-orange-400",
  email: "bg-cyan-500/20 text-cyan-400",
  kb: "bg-pink-500/20 text-pink-400",
};

export default function SearchPage() {
  const [query, setQuery] = useState("Q4 planning");
  const [activeFilter, setActiveFilter] = useState("all");
  const [results, setResults] = useState<SearchResult[]>(sampleResults);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState("any");
  const [sortBy, setSortBy] = useState("relevance");

  const handleSearch = () => {
    // In production, this would call Elasticsearch API
    console.log("Searching:", query);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />

      <main className="ml-16 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-white mb-2">
              Enterprise Search
            </h1>
            <p className="text-white/50">
              Search across documents, knowledge bases, channels, and more
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="bg-[#0f0f14] border border-white/10 rounded-2xl p-4 focus-within:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search anything..."
                  className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-lg"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      showAdvanced
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-white/50 hover:text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Advanced
                  </button>
                  <button
                    onClick={handleSearch}
                    className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvanced && (
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                      Date Range
                    </label>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                    >
                      <option value="any">Any time</option>
                      <option value="day">Past 24 hours</option>
                      <option value="week">Past week</option>
                      <option value="month">Past month</option>
                      <option value="year">Past year</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="date">Most recent</option>
                      <option value="modified">Last modified</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                      Content Type
                    </label>
                    <select className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50">
                      <option value="all">All types</option>
                      <option value="text">Text</option>
                      <option value="pdf">PDF</option>
                      <option value="spreadsheet">Spreadsheet</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Suggestion */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/90">
                  <strong className="text-blue-400">AI Summary:</strong> Based on
                  your search for &quot;Q4 planning&quot;, I found the main strategic
                  document, related team discussions, and upcoming meetings. The
                  VP of Engineering is the key stakeholder for technical
                  planning.
                </p>
                <button className="mt-2 text-sm text-blue-400 hover:text-blue-300">
                  Ask AI for more details →
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <div className="w-56 flex-shrink-0">
              <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-medium text-white mb-3">
                  Filter by Type
                </h3>
                <div className="space-y-1">
                  {filterCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveFilter(cat.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeFilter === cat.id
                          ? "bg-blue-500/20 text-blue-400"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <cat.icon className="w-4 h-4" />
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-medium text-white mb-3">
                    Department
                  </h3>
                  <div className="space-y-2">
                    {["Engineering", "Marketing", "Sales", "HR", "Finance"].map(
                      (dept) => (
                        <label
                          key={dept}
                          className="flex items-center gap-2 text-sm text-white/60 cursor-pointer hover:text-white"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                          />
                          {dept}
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/50">
                  {results.length} results for &quot;{query}&quot;
                </span>
                <button className="text-sm text-white/50 hover:text-white flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Search history
                </button>
              </div>

              <div className="space-y-4">
                {results.map((result) => {
                  const Icon = typeIcons[result.type] || FileText;
                  return (
                    <div
                      key={result.id}
                      className="bg-[#0f0f14] border border-white/10 rounded-xl p-4 hover:border-blue-500/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Type Icon */}
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            typeColors[result.type]
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                              {result.title}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/50">
                              {result.relevance}% match
                            </span>
                          </div>
                          <p className="text-sm text-white/60 line-clamp-2 mb-2">
                            {result.snippet}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <Database className="w-3 h-3" />
                              {result.source}
                            </span>
                            <span>{result.date}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
                            <Star className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More */}
              <div className="mt-6 text-center">
                <button className="px-6 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors">
                  Load more results
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
