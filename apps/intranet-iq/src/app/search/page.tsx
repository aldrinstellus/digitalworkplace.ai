"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useSearch, useDepartments, useActivityLog } from "@/lib/hooks/useSupabase";
import {
  Search,
  FileText,
  Users,
  Calendar,
  Mail,
  Database,
  Clock,
  Star,
  Sparkles,
  SlidersHorizontal,
  ExternalLink,
  Loader2,
} from "lucide-react";

const filterCategories = [
  { id: "all", label: "All Results", icon: Database },
  { id: "article", label: "Articles", icon: FileText },
  { id: "employee", label: "People", icon: Users },
  { id: "event", label: "Events", icon: Calendar },
  { id: "document", label: "Documents", icon: FileText },
];

const typeIcons: Record<string, typeof FileText> = {
  article: FileText,
  employee: Users,
  event: Calendar,
  document: FileText,
  channel: Users,
  email: Mail,
};

const typeColors: Record<string, string> = {
  article: "bg-blue-500/20 text-blue-400",
  employee: "bg-green-500/20 text-green-400",
  event: "bg-orange-500/20 text-orange-400",
  document: "bg-purple-500/20 text-purple-400",
  channel: "bg-cyan-500/20 text-cyan-400",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState("any");
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const { results, loading, error, search } = useSearch();
  const { departments } = useDepartments();
  const { log } = useActivityLog();

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    await search(query, {
      itemTypes: activeFilter === "all" ? undefined : [activeFilter],
      maxResults: 20,
    });

    // Log search activity
    await log("search", {
      entityType: "search",
      metadata: { query, filter: activeFilter },
    });
  }, [query, activeFilter, search, log]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleDepartment = (deptId: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(deptId)
        ? prev.filter((id) => id !== deptId)
        : [...prev, deptId]
    );
  };

  const filteredResults = results.filter((result) => {
    if (activeFilter === "all") return true;
    return result.type === activeFilter;
  });

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
              Search across articles, knowledge bases, people, and more
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
                  onKeyDown={handleKeyDown}
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
                    disabled={loading || !query.trim()}
                    className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
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

          {/* AI Suggestion - show when there are results */}
          {filteredResults.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/90">
                    <strong className="text-blue-400">AI Summary:</strong> Found{" "}
                    {filteredResults.length} results for &quot;{query}&quot;.
                    {filteredResults.some((r) => r.type === "article") &&
                      " Includes knowledge base articles."}
                    {filteredResults.some((r) => r.type === "employee") &&
                      " Found matching people in the directory."}
                  </p>
                  <button className="mt-2 text-sm text-blue-400 hover:text-blue-300">
                    Ask AI for more details →
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    {departments.map((dept) => (
                      <label
                        key={dept.id}
                        className="flex items-center gap-2 text-sm text-white/60 cursor-pointer hover:text-white"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(dept.id)}
                          onChange={() => toggleDepartment(dept.id)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                        />
                        {dept.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/50">
                  {filteredResults.length} results
                  {query && ` for "${query}"`}
                </span>
                <button className="text-sm text-white/50 hover:text-white flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Search history
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  Error: {error}
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white/50 mb-2">
                    {query ? "No results found" : "Start searching"}
                  </h3>
                  <p className="text-sm text-white/30">
                    {query
                      ? "Try different keywords or filters"
                      : "Enter a search term to find articles, people, and more"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResults.map((result) => {
                    const Icon = typeIcons[result.type] || FileText;
                    const colorClass = typeColors[result.type] || "bg-gray-500/20 text-gray-400";

                    return (
                      <div
                        key={result.id}
                        className="bg-[#0f0f14] border border-white/10 rounded-xl p-4 hover:border-blue-500/30 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start gap-4">
                          {/* Type Icon */}
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                {result.title}
                              </h3>
                              {result.relevance && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/50">
                                  {Math.round(result.relevance * 100)}% match
                                </span>
                              )}
                            </div>
                            {result.summary && (
                              <p className="text-sm text-white/60 line-clamp-2 mb-2">
                                {result.summary.substring(0, 200)}...
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-white/40">
                              <span className="flex items-center gap-1">
                                <Database className="w-3 h-3" />
                                {result.type}
                              </span>
                              {result.project_code && (
                                <span>{result.project_code}</span>
                              )}
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
              )}

              {/* Load More */}
              {filteredResults.length > 0 && (
                <div className="mt-6 text-center">
                  <button className="px-6 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors">
                    Load more results
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
