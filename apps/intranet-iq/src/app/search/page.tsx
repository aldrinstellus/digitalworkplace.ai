"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { FacetedSidebar } from "@/components/search/FacetedSidebar";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
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
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  X,
  Trash2,
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

const RESULTS_PER_PAGE = 20;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState("any");
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null);

  // Pagination state for infinite scroll
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Search history state
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<Array<{ query: string; timestamp: Date; resultCount: number }>>([
    { query: "employee handbook", timestamp: new Date(Date.now() - 86400000), resultCount: 15 },
    { query: "vacation policy", timestamp: new Date(Date.now() - 172800000), resultCount: 8 },
    { query: "quarterly report", timestamp: new Date(Date.now() - 259200000), resultCount: 23 },
    { query: "onboarding checklist", timestamp: new Date(Date.now() - 345600000), resultCount: 12 },
    { query: "remote work guidelines", timestamp: new Date(Date.now() - 432000000), resultCount: 6 },
  ]);

  const { results, loading, error, search } = useSearch();
  const { departments } = useDepartments();
  const { log } = useActivityLog();
  const searchParams = useSearchParams();
  const urlQueryProcessed = useRef(false);

  // Add to search history when a new search is performed
  const addToHistory = useCallback((searchQuery: string, resultCount: number) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter((h) => h.query.toLowerCase() !== searchQuery.toLowerCase());
      return [{ query: searchQuery, timestamp: new Date(), resultCount }, ...filtered].slice(0, 10);
    });
  }, []);

  // Clear a single history item
  const removeFromHistory = (queryToRemove: string) => {
    setSearchHistory((prev) => prev.filter((h) => h.query !== queryToRemove));
  };

  // Clear all history
  const clearAllHistory = () => {
    setSearchHistory([]);
    setShowSearchHistory(false);
  };

  // Use a history item as search query
  const useHistoryItem = (historyQuery: string) => {
    setQuery(historyQuery);
    setShowSearchHistory(false);
    // Trigger search
    handleSearchWithQuery(historyQuery);
  };

  // Filter results by department
  const departmentFilteredResults = allResults.filter((result) => {
    if (selectedDepartments.length === 0) return true;
    return selectedDepartments.includes(result.department_id);
  });

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isLoadingMore && query.trim()) {
          loadMoreResults();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, isLoadingMore, query, page]);

  // Update allResults when new search results come in
  useEffect(() => {
    if (page === 1) {
      setAllResults(results);
      setHasMore(results.length >= RESULTS_PER_PAGE);
    } else {
      setAllResults((prev) => [...prev, ...results]);
      setHasMore(results.length >= RESULTS_PER_PAGE);
    }
  }, [results]);

  const loadMoreResults = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);

    await search(query, {
      itemTypes: activeFilter === "all" ? undefined : [activeFilter],
      maxResults: RESULTS_PER_PAGE,
      offset: (nextPage - 1) * RESULTS_PER_PAGE,
    });

    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, page, query, activeFilter, search]);

  // Compute faceted counts from department-filtered results
  const facetCounts = [
    { type: "all", label: "All Results", count: departmentFilteredResults.length, icon: Database },
    { type: "article", label: "Articles", count: departmentFilteredResults.filter(r => r.type === "article").length, icon: FileText },
    { type: "employee", label: "People", count: departmentFilteredResults.filter(r => r.type === "employee").length, icon: Users },
    { type: "event", label: "Events", count: departmentFilteredResults.filter(r => r.type === "event").length, icon: Calendar },
    { type: "document", label: "Documents", count: departmentFilteredResults.filter(r => r.type === "document").length, icon: FileText },
  ];

  const handleSummarize = async (resultId: string) => {
    setSummarizingId(resultId);
    // Simulate AI summarization
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSummarizingId(null);
  };

  const handleFeedback = async (type: "positive" | "negative") => {
    setFeedbackGiven(type);
    await log("search_feedback", {
      entityType: "search",
      metadata: { query, feedbackType: type },
    });
  };

  const handleSearchWithQuery = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Reset pagination for new search
    setPage(1);
    setAllResults([]);
    setHasMore(true);

    await search(searchQuery, {
      itemTypes: activeFilter === "all" ? undefined : [activeFilter],
      maxResults: RESULTS_PER_PAGE,
    });

    // Add to search history (results will be in the `results` state from useSearch)
    // We'll use a placeholder count since the actual results are set asynchronously
    addToHistory(searchQuery, 0);

    // Log search activity
    await log("search", {
      entityType: "search",
      metadata: { query: searchQuery, filter: activeFilter, departments: selectedDepartments },
    });
  }, [activeFilter, search, log, selectedDepartments, addToHistory]);

  const handleSearch = useCallback(async () => {
    await handleSearchWithQuery(query);
  }, [query, handleSearchWithQuery]);

  // Auto-execute search from URL query parameter (e.g., ?q=topic from dashboard trending)
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery && !urlQueryProcessed.current) {
      urlQueryProcessed.current = true;
      setQuery(urlQuery);
      handleSearchWithQuery(urlQuery);
    }
  }, [searchParams, handleSearchWithQuery]);

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

  const filteredResults = departmentFilteredResults.filter((result) => {
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

          {/* Search Bar with Autocomplete */}
          <div className="relative mb-6">
            <div className="bg-[#0f0f14] border border-white/10 rounded-2xl p-4 focus-within:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <SearchAutocomplete
                    value={query}
                    onChange={setQuery}
                    onSearch={handleSearchWithQuery}
                    placeholder="Search anything..."
                  />
                </div>
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

              {/* Feedback buttons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                <span className="text-xs text-white/40">Was this helpful?</span>
                <button
                  onClick={() => handleFeedback("positive")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    feedbackGiven === "positive"
                      ? "bg-green-500/20 text-green-400"
                      : "hover:bg-white/5 text-white/40 hover:text-white/60"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFeedback("negative")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    feedbackGiven === "negative"
                      ? "bg-red-500/20 text-red-400"
                      : "hover:bg-white/5 text-white/40 hover:text-white/60"
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
                {feedbackGiven && (
                  <span className="text-xs text-white/40 ml-2">Thanks for your feedback!</span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-6">
            {/* Faceted Sidebar with counts */}
            <FacetedSidebar
              facets={facetCounts}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              totalCount={results.length}
              departments={departments}
              selectedDepartments={selectedDepartments}
              onDepartmentToggle={toggleDepartment}
            />

            {/* Results */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/50">
                  {filteredResults.length} results
                  {query && ` for "${query}"`}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowSearchHistory(!showSearchHistory)}
                    className="text-sm text-white/50 hover:text-white flex items-center gap-1"
                  >
                    <Clock className="w-4 h-4" />
                    Search history
                  </button>

                  {/* Search History Dropdown */}
                  {showSearchHistory && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowSearchHistory(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-80 bg-[#0f0f14] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                          <span className="text-sm font-medium text-white">Recent Searches</span>
                          {searchHistory.length > 0 && (
                            <button
                              onClick={clearAllHistory}
                              className="text-xs text-white/40 hover:text-red-400 flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              Clear all
                            </button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {searchHistory.length === 0 ? (
                            <div className="py-8 text-center text-white/40 text-sm">
                              No search history yet
                            </div>
                          ) : (
                            searchHistory.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors group"
                              >
                                <button
                                  onClick={() => useHistoryItem(item.query)}
                                  className="flex-1 text-left"
                                >
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-white/30" />
                                    <span className="text-sm text-white/80">{item.query}</span>
                                  </div>
                                  <div className="ml-5.5 text-xs text-white/40">
                                    {item.resultCount} results •{" "}
                                    {new Date(item.timestamp).toLocaleDateString()}
                                  </div>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromHistory(item.query);
                                  }}
                                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
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
                  {filteredResults.map((result) => (
                    <SearchResultCard
                      key={result.id}
                      result={{
                        id: result.id,
                        title: result.title,
                        summary: result.summary || "",
                        type: result.type,
                        source: result.project_code || "dIQ",
                        relevance: result.relevance || 0,
                        updatedAt: result.created_at,
                      }}
                      onSummarize={() => handleSummarize(result.id)}
                      isSummarizing={summarizingId === result.id}
                    />
                  ))}
                </div>
              )}

              {/* Infinite Scroll Trigger */}
              {filteredResults.length > 0 && (
                <div ref={loadMoreRef} className="mt-6 text-center">
                  {isLoadingMore ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-400 mr-2" />
                      <span className="text-white/50">Loading more results...</span>
                    </div>
                  ) : hasMore ? (
                    <button
                      onClick={loadMoreResults}
                      className="px-6 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
                    >
                      Load more results
                    </button>
                  ) : (
                    <p className="text-white/40 text-sm py-4">
                      No more results to load
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
