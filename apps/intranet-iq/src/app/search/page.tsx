"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { FacetedSidebar } from "@/components/search/FacetedSidebar";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { useSearch, useDepartments, useActivityLog } from "@/lib/hooks/useSupabase";
import { FadeIn, StaggerContainer, StaggerItem } from "@/lib/motion";
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
  article: "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]",
  employee: "bg-[var(--success)]/20 text-[var(--success)]",
  event: "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]",
  document: "bg-[var(--accent-copper)]/20 text-[var(--accent-copper)]",
  channel: "bg-[var(--accent-ember-soft)]/20 text-[var(--accent-ember-soft)]",
};

const RESULTS_PER_PAGE = 20;

function SearchPageInner() {
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
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />

      <main className="ml-16 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Search Header */}
          <FadeIn className="mb-8">
            <h1 className="text-2xl font-medium text-[var(--text-primary)] mb-2">
              Enterprise Search
            </h1>
            <p className="text-[var(--text-muted)]">
              Search across articles, knowledge bases, people, and more
            </p>
          </FadeIn>

          {/* Search Bar with Autocomplete */}
          <FadeIn delay={0.1} className="relative mb-6">
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-2xl p-4 focus-within:border-[var(--accent-ember)]/50 focus-within:shadow-lg focus-within:shadow-[var(--accent-ember)]/5 transition-all">
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
                  <motion.button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      showAdvanced
                        ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-slate)]"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Advanced
                  </motion.button>
                  <motion.button
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                    className="px-4 py-1.5 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-[var(--accent-ember)]/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Search
                  </motion.button>
                </div>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-4 overflow-hidden"
                  >
                    <div>
                      <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                        Date Range
                      </label>
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50"
                      >
                        <option value="any">Any time</option>
                        <option value="day">Past 24 hours</option>
                        <option value="week">Past week</option>
                        <option value="month">Past month</option>
                        <option value="year">Past year</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="date">Most recent</option>
                        <option value="modified">Last modified</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                        Content Type
                      </label>
                      <select className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50">
                        <option value="all">All types</option>
                        <option value="text">Text</option>
                        <option value="pdf">PDF</option>
                        <option value="spreadsheet">Spreadsheet</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeIn>

          {/* AI Suggestion - show when there are results */}
          <AnimatePresence>
            {filteredResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-gradient-to-r from-[var(--accent-ember)]/10 to-[var(--accent-copper)]/10 border border-[var(--accent-ember)]/20 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[var(--accent-ember)]/20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--text-primary)]/90">
                      <strong className="text-[var(--accent-ember)]">AI Summary:</strong> Found{" "}
                      {filteredResults.length} results for &quot;{query}&quot;.
                      {filteredResults.some((r) => r.type === "article") &&
                        " Includes knowledge base articles."}
                      {filteredResults.some((r) => r.type === "employee") &&
                        " Found matching people in the directory."}
                    </p>
                    <button className="mt-2 text-sm text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)] transition-colors">
                      Ask AI for more details →
                    </button>
                  </div>
                </div>

                {/* Feedback buttons */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)]">Was this helpful?</span>
                  <motion.button
                    onClick={() => handleFeedback("positive")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      feedbackGiven === "positive"
                        ? "bg-[var(--success)]/20 text-[var(--success)]"
                        : "hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleFeedback("negative")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      feedbackGiven === "negative"
                        ? "bg-[var(--error)]/20 text-[var(--error)]"
                        : "hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </motion.button>
                  {feedbackGiven && (
                    <span className="text-xs text-[var(--text-muted)] ml-2">Thanks for your feedback!</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                <span className="text-sm text-[var(--text-muted)]">
                  {filteredResults.length} results
                  {query && ` for "${query}"`}
                </span>
                <div className="relative">
                  <motion.button
                    onClick={() => setShowSearchHistory(!showSearchHistory)}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Clock className="w-4 h-4" />
                    Search history
                  </motion.button>

                  {/* Search History Dropdown */}
                  <AnimatePresence>
                    {showSearchHistory && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowSearchHistory(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-charcoal)] border border-[var(--border-default)] rounded-xl shadow-xl z-50 overflow-hidden"
                        >
                          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
                            <span className="text-sm font-medium text-[var(--text-primary)]">Recent Searches</span>
                            {searchHistory.length > 0 && (
                              <button
                                onClick={clearAllHistory}
                                className="text-xs text-[var(--text-muted)] hover:text-[var(--error)] flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                Clear all
                              </button>
                            )}
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {searchHistory.length === 0 ? (
                              <div className="py-8 text-center text-[var(--text-muted)] text-sm">
                                No search history yet
                              </div>
                            ) : (
                              searchHistory.map((item, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="flex items-center justify-between px-4 py-2 hover:bg-[var(--bg-slate)] transition-colors group"
                                >
                                  <button
                                    onClick={() => useHistoryItem(item.query)}
                                    className="flex-1 text-left"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                      <span className="text-sm text-[var(--text-secondary)]">{item.query}</span>
                                    </div>
                                    <div className="ml-5.5 text-xs text-[var(--text-muted)]">
                                      {item.resultCount} results •{" "}
                                      {new Date(item.timestamp).toLocaleDateString()}
                                    </div>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFromHistory(item.query);
                                    }}
                                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-obsidian)] text-[var(--text-muted)] hover:text-[var(--error)] transition-all"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </motion.div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-xl text-[var(--error)] text-sm"
                >
                  Error: {error}
                </motion.div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-ember)]" />
                </div>
              ) : filteredResults.length === 0 ? (
                <FadeIn className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--bg-charcoal)] flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-[var(--text-muted)]" />
                  </div>
                  <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">
                    {query ? "No results found" : "Start searching"}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]/70">
                    {query
                      ? "Try different keywords or filters"
                      : "Enter a search term to find articles, people, and more"}
                  </p>
                </FadeIn>
              ) : (
                <StaggerContainer className="space-y-4">
                  {filteredResults.map((result, index) => (
                    <StaggerItem key={result.id}>
                      <SearchResultCard
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
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}

              {/* Infinite Scroll Trigger */}
              {filteredResults.length > 0 && (
                <div ref={loadMoreRef} className="mt-6 text-center">
                  {isLoadingMore ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-ember)] mr-2" />
                      <span className="text-[var(--text-muted)]">Loading more results...</span>
                    </div>
                  ) : hasMore ? (
                    <motion.button
                      onClick={loadMoreResults}
                      className="px-6 py-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Load more results
                    </motion.button>
                  ) : (
                    <p className="text-[var(--text-muted)] text-sm py-4">
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

// Loading fallback for Suspense
function SearchPageLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />
      <main className="ml-16 p-8">
        <div className="max-w-5xl mx-auto flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-ember)]" />
            <p className="text-[var(--text-muted)]">Loading search...</p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Export with Suspense wrapper for useSearchParams
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageInner />
    </Suspense>
  );
}
