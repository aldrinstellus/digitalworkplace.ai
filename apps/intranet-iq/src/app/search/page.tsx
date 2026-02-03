"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { FacetedSidebar } from "@/components/search/FacetedSidebar";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { mockSearchResults, mockDepartments, type MockSearchResult, type MockDepartment } from "@/lib/mockData";
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
  CheckCircle,
  Type,
  Brain,
  Blend,
  Info,
  GitPullRequest,
  Video,
} from "lucide-react";
import { SOURCE_DISPLAY, CONTENT_TYPE_DISPLAY, type DataSource, type ContentType } from "@/lib/unifiedTypes";
import { searchAllSources, getSearchFacets } from "@/lib/integratedData";

const filterCategories = [
  { id: "all", label: "All Results", icon: Database },
  { id: "article", label: "Articles", icon: FileText },
  { id: "employee", label: "People", icon: Users },
  { id: "event", label: "Events", icon: Calendar },
  { id: "document", label: "Documents", icon: FileText },
];

// Source filter chips for app integrations
const sourceFilters: { id: DataSource | 'all'; label: string; icon: string; color: string }[] = [
  { id: 'all', label: 'All Sources', icon: '🔍', color: '#10b981' },
  { id: 'diq', label: 'dIQ', icon: '📊', color: '#10b981' },
  { id: 'slack', label: 'Slack', icon: '💬', color: '#4A154B' },
  { id: 'jira', label: 'Jira', icon: '🎯', color: '#0052CC' },
  { id: 'github', label: 'GitHub', icon: '🐙', color: '#24292e' },
  { id: 'drive', label: 'Drive', icon: '📁', color: '#4285F4' },
  { id: 'zoom', label: 'Zoom', icon: '🎥', color: '#2D8CFF' },
  { id: 'confluence', label: 'Confluence', icon: '📝', color: '#172B4D' },
  { id: 'salesforce', label: 'Salesforce', icon: '☁️', color: '#00A1E0' },
  { id: 'figma', label: 'Figma', icon: '🎨', color: '#F24E1E' },
  { id: 'notion', label: 'Notion', icon: '📓', color: '#000000' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  { id: 'auzmor-office', label: 'Auzmor Office', icon: '🏢', color: '#10b981' },
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

// Common typo corrections mapping
const commonCorrections: Record<string, string[]> = {
  'employe': ['employee'],
  'emplyee': ['employee'],
  'emploee': ['employee'],
  'polcy': ['policy'],
  'poilcy': ['policy'],
  'policiy': ['policy'],
  'vacaton': ['vacation'],
  'vacaion': ['vacation'],
  'benifits': ['benefits'],
  'benefts': ['benefits'],
  'beneftis': ['benefits'],
  'onbording': ['onboarding'],
  'onboardng': ['onboarding'],
  'onboaring': ['onboarding'],
  'guidelins': ['guidelines'],
  'guidlines': ['guidelines'],
  'documnt': ['document'],
  'documnet': ['document'],
  'proceedure': ['procedure'],
  'procedur': ['procedure'],
  'orgnization': ['organization'],
  'organisaton': ['organization'],
  'calender': ['calendar'],
  'calandar': ['calendar'],
  'schedual': ['schedule'],
  'schdule': ['schedule'],
  'traininig': ['training'],
  'traning': ['training'],
  'annoucment': ['announcement'],
  'anouncement': ['announcement'],
  'departmnt': ['department'],
  'deparment': ['department'],
  'knowlege': ['knowledge'],
  'knowlede': ['knowledge'],
  'managment': ['management'],
  'managemnt': ['management'],
  'infomation': ['information'],
  'informaton': ['information'],
  'requirment': ['requirement'],
  'requiremnt': ['requirement'],
  'performace': ['performance'],
  'perfomance': ['performance'],
  'secuirty': ['security'],
  'securty': ['security'],
  'compiance': ['compliance'],
  'complance': ['compliance'],
  'heatlh': ['health'],
  'helath': ['health'],
  'saftey': ['safety'],
  'safty': ['safety'],
  'payrol': ['payroll'],
  'paryoll': ['payroll'],
  'expenes': ['expenses'],
  'expensess': ['expenses'],
  'reimbusement': ['reimbursement'],
  'reimbursmnt': ['reimbursement'],
  'appoval': ['approval'],
  'aprooval': ['approval'],
  'timeoff': ['time off', 'time-off'],
  'pto': ['PTO', 'time off', 'paid time off'],
  'hr': ['HR', 'human resources'],
  'faq': ['FAQ', 'frequently asked questions'],
};

// Related search suggestions for common topics
const relatedTerms: Record<string, string[]> = {
  'employee': ['employee handbook', 'employee directory', 'employee benefits'],
  'policy': ['vacation policy', 'remote work policy', 'expense policy'],
  'vacation': ['vacation policy', 'time off request', 'PTO balance'],
  'benefits': ['health benefits', 'employee benefits', '401k'],
  'onboarding': ['new hire checklist', 'onboarding guide', 'first day'],
  'training': ['training schedule', 'compliance training', 'learning'],
  'payroll': ['payroll schedule', 'direct deposit', 'pay stub'],
  'handbook': ['employee handbook', 'company policies', 'code of conduct'],
  'remote': ['remote work policy', 'work from home', 'hybrid work'],
  'expense': ['expense report', 'expense policy', 'reimbursement'],
  'leave': ['leave request', 'sick leave', 'parental leave'],
  'performance': ['performance review', 'goals', 'feedback'],
  'security': ['security policy', 'password reset', 'data protection'],
  'compliance': ['compliance training', 'code of conduct', 'ethics'],
  'it': ['IT support', 'helpdesk', 'password reset'],
  'help': ['IT help', 'HR help', 'FAQ'],
};

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

// Generate spelling suggestions using fuzzy matching
function generateSuggestions(query: string): { corrections: string[]; relatedSearches: string[] } {
  const normalizedQuery = query.toLowerCase().trim();
  const corrections: string[] = [];
  const relatedSearches: string[] = [];

  // Check for exact typo matches first
  if (commonCorrections[normalizedQuery]) {
    corrections.push(...commonCorrections[normalizedQuery]);
  }

  // Check for partial matches in typo corrections
  const queryWords = normalizedQuery.split(/\s+/);
  queryWords.forEach(word => {
    if (commonCorrections[word]) {
      corrections.push(...commonCorrections[word].map(correction =>
        normalizedQuery.replace(word, correction)
      ));
    }
  });

  // Fuzzy match against known terms using Levenshtein distance
  const allKnownTerms = [
    ...Object.values(commonCorrections).flat(),
    ...Object.keys(relatedTerms),
  ];

  const uniqueTerms = [...new Set(allKnownTerms)];

  uniqueTerms.forEach(term => {
    const termLower = term.toLowerCase();
    const distance = levenshteinDistance(normalizedQuery, termLower);
    const maxAllowedDistance = Math.max(2, Math.floor(termLower.length * 0.3));

    if (distance > 0 && distance <= maxAllowedDistance && !corrections.includes(term)) {
      corrections.push(term);
    }
  });

  // Get related searches based on query terms
  queryWords.forEach(word => {
    const wordLower = word.toLowerCase();
    // Direct match in related terms
    if (relatedTerms[wordLower]) {
      relatedSearches.push(...relatedTerms[wordLower]);
    }
    // Check if word is part of a key
    Object.keys(relatedTerms).forEach(key => {
      if (key.includes(wordLower) || wordLower.includes(key)) {
        relatedSearches.push(...relatedTerms[key]);
      }
    });
  });

  // Deduplicate and limit results
  const uniqueCorrections = [...new Set(corrections)]
    .filter(c => c.toLowerCase() !== normalizedQuery)
    .slice(0, 3);

  const uniqueRelated = [...new Set(relatedSearches)]
    .filter(r => r.toLowerCase() !== normalizedQuery && !uniqueCorrections.includes(r.toLowerCase()))
    .slice(0, 5);

  return { corrections: uniqueCorrections, relatedSearches: uniqueRelated };
}

// Search mode configuration
type SearchMode = 'keyword' | 'semantic' | 'hybrid';

const searchModes: { id: SearchMode; label: string; icon: typeof Type; tooltip: string }[] = [
  { id: 'keyword', label: 'Keyword', icon: Type, tooltip: 'Traditional text matching' },
  { id: 'semantic', label: 'Semantic', icon: Brain, tooltip: 'AI-powered meaning-based search' },
  { id: 'hybrid', label: 'Hybrid', icon: Blend, tooltip: 'Best of both (Recommended)' },
];

function SearchPageInner() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState("any");
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null);

  // Search mode state - default to hybrid
  const [searchMode, setSearchMode] = useState<SearchMode>('hybrid');
  const [hoveredMode, setHoveredMode] = useState<SearchMode | null>(null);

  // Source filter state - for app integrations
  const [selectedSources, setSelectedSources] = useState<(DataSource | 'all')[]>(['all']);
  const [includeApps, setIncludeApps] = useState(true);
  const [appResults, setAppResults] = useState<any[]>([]);

  // Per-source advanced filters
  const [slackFilters, setSlackFilters] = useState<{ channel: string; dateRange: string }>({ channel: 'all', dateRange: 'any' });
  const [jiraFilters, setJiraFilters] = useState<{ project: string; status: string; priority: string }>({ project: 'all', status: 'all', priority: 'all' });
  const [githubFilters, setGithubFilters] = useState<{ repo: string; prStatus: string }>({ repo: 'all', prStatus: 'all' });
  const [driveFilters, setDriveFilters] = useState<{ fileType: string; folder: string }>({ fileType: 'all', folder: 'all' });

  // AI Summary state - stores summaries for each result
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});

  // Add to KB state
  const [addingToKBId, setAddingToKBId] = useState<string | null>(null);
  const [kbAddSuccess, setKbAddSuccess] = useState<string | null>(null);

  // Pagination state for infinite scroll
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Query suggestions state (for "Did you mean?" feature)
  const [querySuggestions, setQuerySuggestions] = useState<{
    corrections: string[];
    relatedSearches: string[];
  }>({ corrections: [], relatedSearches: [] });

  // Search history state
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<Array<{ query: string; timestamp: Date; resultCount: number }>>([
    { query: "employee handbook", timestamp: new Date(Date.now() - 86400000), resultCount: 15 },
    { query: "vacation policy", timestamp: new Date(Date.now() - 172800000), resultCount: 8 },
    { query: "quarterly report", timestamp: new Date(Date.now() - 259200000), resultCount: 23 },
    { query: "onboarding checklist", timestamp: new Date(Date.now() - 345600000), resultCount: 12 },
    { query: "remote work guidelines", timestamp: new Date(Date.now() - 432000000), resultCount: 6 },
  ]);

  // Use mock data instead of Supabase hooks
  const [results, setResults] = useState<MockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const departments = mockDepartments as MockDepartment[];
  const searchParams = useSearchParams();

  // Toggle source filter
  const toggleSourceFilter = (sourceId: DataSource | 'all') => {
    if (sourceId === 'all') {
      setSelectedSources(['all']);
    } else {
      setSelectedSources(prev => {
        const filtered = prev.filter(s => s !== 'all');
        if (filtered.includes(sourceId)) {
          const newSources = filtered.filter(s => s !== sourceId);
          return newSources.length === 0 ? ['all'] : newSources;
        } else {
          return [...filtered, sourceId];
        }
      });
    }
  };

  // Mock search function - now includes app data
  const search = useCallback(async (query: string, _options?: { itemTypes?: string[]; maxResults?: number; offset?: number; mode?: string }) => {
    setLoading(true);
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const queryLower = query.toLowerCase();
    const filtered = mockSearchResults.filter(result =>
      result.title.toLowerCase().includes(queryLower) ||
      (result.description?.toLowerCase().includes(queryLower) ?? false) ||
      (result.highlights?.some((h: string) => h.toLowerCase().includes(queryLower)) ?? false)
    );
    setResults(filtered);

    // Also search app data if enabled
    if (includeApps && query.trim()) {
      const sources = selectedSources.includes('all')
        ? undefined
        : selectedSources.filter((s): s is DataSource => s !== 'all');

      const integratedResults = searchAllSources(query, {
        sources,
        limit: 20,
      });
      setAppResults(integratedResults);
    } else {
      setAppResults([]);
    }

    setLoading(false);
  }, [includeApps, selectedSources]);

  // Mock activity log function
  const log = useCallback(async (_action: string, _data: Record<string, unknown>) => {
    // In production, this would log to the activity log
    console.log("Activity logged:", _action, _data);
  }, []);
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

  // Use a suggestion as search query
  const useSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setQuerySuggestions({ corrections: [], relatedSearches: [] });
    handleSearchWithQuery(suggestion);
  };

  // Filter results by department, author, and tags
  const departmentFilteredResults = allResults.filter((result) => {
    // Department filter
    if (selectedDepartments.length > 0 && !selectedDepartments.includes(result.department_id)) {
      return false;
    }
    // Author filter
    if (selectedAuthors.length > 0) {
      const author = (result as any).author_name || (result as any).author || (result as any).name;
      if (!author || !selectedAuthors.includes(author)) {
        return false;
      }
    }
    // Tag filter
    if (selectedTags.length > 0) {
      const tags = (result as any).tags || [];
      if (!selectedTags.some(t => tags.includes(t))) {
        return false;
      }
    }
    return true;
  });

  // Define loadMoreResults before useEffect that uses it
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
  }, [hasMore, loading, isLoadingMore, query, page, loadMoreResults]);

  // Update allResults when new search results come in
  useEffect(() => {
    if (page === 1) {
      setAllResults(results);
      setHasMore(results.length >= RESULTS_PER_PAGE);

      // Generate suggestions when results are low (0-2 results) and there's a query
      if (query.trim() && results.length < 3) {
        const suggestions = generateSuggestions(query);
        setQuerySuggestions(suggestions);
      } else {
        setQuerySuggestions({ corrections: [], relatedSearches: [] });
      }
    } else {
      setAllResults((prev) => [...prev, ...results]);
      setHasMore(results.length >= RESULTS_PER_PAGE);
    }
  }, [results, query, page]);

  // Compute faceted counts from department-filtered results
  const facetCounts = [
    { type: "all", label: "All Results", count: departmentFilteredResults.length, icon: Database },
    { type: "article", label: "Articles", count: departmentFilteredResults.filter(r => r.type === "article").length, icon: FileText },
    { type: "employee", label: "People", count: departmentFilteredResults.filter(r => r.type === "employee").length, icon: Users },
    { type: "event", label: "Events", count: departmentFilteredResults.filter(r => r.type === "event").length, icon: Calendar },
    { type: "document", label: "Documents", count: departmentFilteredResults.filter(r => r.type === "document").length, icon: FileText },
  ];

  // Compute author facets from results
  const authorFacets = (() => {
    const authorCounts = new Map<string, number>();
    departmentFilteredResults.forEach(r => {
      const author = (r as any).author_name || (r as any).author || (r as any).name;
      if (author) {
        authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
      }
    });
    return Array.from(authorCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  })();

  // Compute tag facets from results
  const tagFacets = (() => {
    const tagCounts = new Map<string, number>();
    departmentFilteredResults.forEach(r => {
      const tags = (r as any).tags || [];
      tags.forEach((tag: string) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  })();

  // Toggle author filter
  const toggleAuthor = (author: string) => {
    setSelectedAuthors(prev =>
      prev.includes(author) ? prev.filter(a => a !== author) : [...prev, author]
    );
  };

  // Toggle tag filter
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSummarize = async (resultId: string) => {
    setSummarizingId(resultId);

    // Find the result to get its content
    const result = allResults.find(r => r.id === resultId);
    if (!result) {
      setSummarizingId(null);
      return;
    }

    try {
      // Call the AI summarization API
      const response = await fetch("/diq/api/search/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          content: result.summary || result.description || "",
          type: result.type,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSummaries(prev => ({ ...prev, [resultId]: data.summary }));
      } else {
        // Fallback to a basic summary if API fails
        const fallbackSummary = `This ${result.type} titled "${result.title}" contains information that may be relevant to your search. ${result.summary ? result.summary.substring(0, 200) + "..." : ""}`;
        setAiSummaries(prev => ({ ...prev, [resultId]: fallbackSummary }));
      }
    } catch {
      // Generate a local summary on error
      const fallbackSummary = `This ${result.type} titled "${result.title}" appears to contain relevant information. ${result.summary ? result.summary.substring(0, 200) + "..." : "No preview available."}`;
      setAiSummaries(prev => ({ ...prev, [resultId]: fallbackSummary }));
    }

    setSummarizingId(null);

    // Log the summarization action
    await log("ai_summarize", {
      entityType: "search_result",
      entityId: resultId,
      metadata: { resultTitle: result.title },
    });
  };

  const handleAddToKB = async (resultId: string, title: string, summary: string, category?: string) => {
    setAddingToKBId(resultId);

    try {
      const response = await fetch("/diq/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: summary,
          category: category || "general",
          source: "search_import",
          sourceResultId: resultId,
        }),
      });

      if (response.ok) {
        setKbAddSuccess(resultId);
        setTimeout(() => setKbAddSuccess(null), 3000);

        // Log the action
        await log("add_to_kb", {
          entityType: "article",
          metadata: { title, sourceResultId: resultId, category },
        });
      }
    } catch (error) {
      console.error("Failed to add to KB:", error);
    }

    setAddingToKBId(null);
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
      mode: searchMode,
    });

    // Add to search history (results will be in the `results` state from useSearch)
    // We'll use a placeholder count since the actual results are set asynchronously
    addToHistory(searchQuery, 0);

    // Log search activity
    await log("search", {
      entityType: "search",
      metadata: { query: searchQuery, filter: activeFilter, departments: selectedDepartments, searchMode },
    });
  }, [activeFilter, search, log, selectedDepartments, addToHistory, searchMode]);

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

  // Merge mock results with app results
  const mergedResults = [
    ...departmentFilteredResults.map(r => ({
      ...r,
      source: 'diq' as DataSource,
      sourceDisplay: SOURCE_DISPLAY['diq'],
    })),
    ...appResults.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description || r.summary,
      summary: r.summary || r.description,
      type: r.type,
      source: r.source as DataSource,
      sourceDisplay: SOURCE_DISPLAY[r.source as DataSource] || { name: r.source, icon: '📄', color: '#666' },
      typeDisplay: CONTENT_TYPE_DISPLAY[r.type as ContentType],
      url: r.url,
      created_at: r.createdAt,
      relevance: r.relevanceScore || 70,
      author: r.author,
      tags: r.tags,
      metadata: r.metadata,
    })),
  ];

  const filteredResults = mergedResults.filter((result) => {
    // Filter by content type
    if (activeFilter !== "all" && result.type !== activeFilter) return false;

    // Filter by source
    if (!selectedSources.includes('all')) {
      if (!selectedSources.includes(result.source)) return false;
    }

    return true;
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
              Search across articles, knowledge bases, people, and more with AI-powered summarization and insights
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

              {/* Search Mode Toggle */}
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Search Mode</span>
                    <div className="relative">
                      <Info className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-help" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-[#1c1c24] rounded-lg">
                    {searchModes.map((mode) => {
                      const Icon = mode.icon;
                      const isActive = searchMode === mode.id;
                      return (
                        <div key={mode.id} className="relative">
                          <motion.button
                            onClick={() => setSearchMode(mode.id)}
                            onMouseEnter={() => setHoveredMode(mode.id)}
                            onMouseLeave={() => setHoveredMode(null)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                              isActive
                                ? "bg-[#10b981] text-white shadow-lg shadow-[#10b981]/25"
                                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-slate)]"
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{mode.label}</span>
                            {mode.id === 'hybrid' && !isActive && (
                              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-[var(--accent-ember)]/20 text-[var(--accent-ember)] rounded-full">
                                Rec
                              </span>
                            )}
                          </motion.button>

                          {/* Tooltip */}
                          <AnimatePresence>
                            {hoveredMode === mode.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[var(--bg-obsidian)] border border-[var(--border-default)] rounded-lg shadow-xl z-50 whitespace-nowrap"
                              >
                                <span className="text-xs text-[var(--text-secondary)]">{mode.tooltip}</span>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                  <div className="border-4 border-transparent border-t-[var(--border-default)]" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Source Filters - App Integrations */}
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Search Sources</span>
                    <motion.button
                      onClick={() => setIncludeApps(!includeApps)}
                      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                        includeApps
                          ? 'bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]'
                          : 'bg-[var(--bg-slate)] text-[var(--text-muted)]'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {includeApps ? 'Apps Enabled' : 'Apps Disabled'}
                    </motion.button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sourceFilters.map((source) => {
                    const isSelected = selectedSources.includes(source.id);
                    return (
                      <motion.button
                        key={source.id}
                        onClick={() => toggleSourceFilter(source.id)}
                        disabled={!includeApps && source.id !== 'all' && source.id !== 'diq'}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                          isSelected
                            ? 'text-white shadow-md'
                            : 'bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-charcoal)]'
                        } ${!includeApps && source.id !== 'all' && source.id !== 'diq' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{
                          backgroundColor: isSelected ? source.color : undefined,
                        }}
                        whileHover={{ scale: includeApps || source.id === 'all' || source.id === 'diq' ? 1.02 : 1 }}
                        whileTap={{ scale: includeApps || source.id === 'all' || source.id === 'diq' ? 0.98 : 1 }}
                      >
                        <span>{source.icon}</span>
                        <span>{source.label}</span>
                      </motion.button>
                    );
                  })}
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

                    {/* Per-Source Filters - Show when specific source is selected */}
                    {selectedSources.includes('slack') && !selectedSources.includes('all') && (
                      <>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                            💬 Slack Channel
                          </label>
                          <select
                            value={slackFilters.channel}
                            onChange={(e) => setSlackFilters(prev => ({ ...prev, channel: e.target.value }))}
                            className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[#4A154B]/50"
                          >
                            <option value="all">All channels</option>
                            <option value="general">general</option>
                            <option value="engineering">engineering</option>
                            <option value="product-launch">product-launch</option>
                            <option value="design">design</option>
                            <option value="sales">sales</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                            💬 Message Date
                          </label>
                          <select
                            value={slackFilters.dateRange}
                            onChange={(e) => setSlackFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                            className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[#4A154B]/50"
                          >
                            <option value="any">Any time</option>
                            <option value="today">Today</option>
                            <option value="week">This week</option>
                            <option value="month">This month</option>
                          </select>
                        </div>
                      </>
                    )}

                    {selectedSources.includes('jira') && !selectedSources.includes('all') && (
                      <>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                            🎯 Jira Project
                          </label>
                          <select
                            value={jiraFilters.project}
                            onChange={(e) => setJiraFilters(prev => ({ ...prev, project: e.target.value }))}
                            className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[#0052CC]/50"
                          >
                            <option value="all">All projects</option>
                            <option value="DIQ">DIQ - dIQ Platform</option>
                            <option value="PLAT">PLAT - Platform</option>
                            <option value="MOB">MOB - Mobile</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                            🎯 Status
                          </label>
                          <select
                            value={jiraFilters.status}
                            onChange={(e) => setJiraFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[#0052CC]/50"
                          >
                            <option value="all">All statuses</option>
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="in-review">In Review</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                            🎯 Priority
                          </label>
                          <select
                            value={jiraFilters.priority}
                            onChange={(e) => setJiraFilters(prev => ({ ...prev, priority: e.target.value }))}
                            className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[#0052CC]/50"
                          >
                            <option value="all">All priorities</option>
                            <option value="highest">Highest</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                      </>
                    )}

                    {selectedSources.includes('github') && !selectedSources.includes('all') && (
                      <>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                            🐙 Repository
                          </label>
                          <select
                            value={githubFilters.repo}
                            onChange={(e) => setGithubFilters(prev => ({ ...prev, repo: e.target.value }))}
                            className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[#24292e]/50"
                          >
                            <option value="all">All repos</option>
                            <option value="diq-platform">diq-platform</option>
                            <option value="diq-mobile">diq-mobile</option>
                            <option value="diq-api">diq-api</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                            🐙 PR Status
                          </label>
                          <select
                            value={githubFilters.prStatus}
                            onChange={(e) => setGithubFilters(prev => ({ ...prev, prStatus: e.target.value }))}
                            className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[#24292e]/50"
                          >
                            <option value="all">All</option>
                            <option value="open">Open</option>
                            <option value="merged">Merged</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </>
                    )}

                    {selectedSources.includes('drive') && !selectedSources.includes('all') && (
                      <>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                            📁 File Type
                          </label>
                          <select
                            value={driveFilters.fileType}
                            onChange={(e) => setDriveFilters(prev => ({ ...prev, fileType: e.target.value }))}
                            className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[#4285F4]/50"
                          >
                            <option value="all">All types</option>
                            <option value="document">Documents</option>
                            <option value="spreadsheet">Spreadsheets</option>
                            <option value="presentation">Presentations</option>
                            <option value="pdf">PDFs</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                            📁 Folder
                          </label>
                          <select
                            value={driveFilters.folder}
                            onChange={(e) => setDriveFilters(prev => ({ ...prev, folder: e.target.value }))}
                            className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[#4285F4]/50"
                          >
                            <option value="all">All folders</option>
                            <option value="Product">Product</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Finance">Finance</option>
                          </select>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeIn>

          {/* Query Suggestions - "Did you mean?" */}
          <AnimatePresence>
            {(querySuggestions.corrections.length > 0 || querySuggestions.relatedSearches.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-transparent"
              >
                {/* Spelling corrections - "Did you mean?" */}
                {querySuggestions.corrections.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-[var(--text-muted)]">Did you mean:</span>
                    {querySuggestions.corrections.map((correction, idx) => (
                      <button
                        key={idx}
                        onClick={() => useSuggestion(correction)}
                        className="text-sm text-[#10b981] hover:text-[#34d399] underline underline-offset-2 transition-colors font-medium"
                      >
                        {correction}
                      </button>
                    ))}
                  </div>
                )}

                {/* Related searches - pill buttons */}
                {querySuggestions.relatedSearches.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-[var(--text-muted)]">Related searches:</span>
                    {querySuggestions.relatedSearches.map((related, idx) => (
                      <button
                        key={idx}
                        onClick={() => useSuggestion(related)}
                        className="px-3 py-1 text-sm text-[var(--text-secondary)] bg-[var(--bg-slate)] hover:bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] hover:border-[#10b981]/50 rounded-full transition-all hover:text-[#10b981]"
                      >
                        {related}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

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
              authors={authorFacets}
              selectedAuthors={selectedAuthors}
              onAuthorToggle={toggleAuthor}
              tags={tagFacets}
              selectedTags={selectedTags}
              onTagToggle={toggleTag}
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
                  {filteredResults.map((result) => (
                    <StaggerItem key={result.id}>
                      <div className="relative">
                        {/* Source Badge */}
                        {result.source && result.source !== 'diq' && (
                          <div
                            className="absolute -top-2 -left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white shadow-md"
                            style={{ backgroundColor: result.sourceDisplay?.color || '#666' }}
                          >
                            <span>{result.sourceDisplay?.icon}</span>
                            <span>{result.sourceDisplay?.name}</span>
                          </div>
                        )}
                        <SearchResultCard
                          result={{
                            id: result.id,
                            title: result.title,
                            summary: result.summary || result.description || "",
                            type: result.type,
                            source: result.sourceDisplay?.name || result.source || "dIQ",
                            relevance: result.relevance || 0,
                            updatedAt: result.created_at,
                          }}
                          onSummarize={() => handleSummarize(result.id)}
                          onAddToKB={handleAddToKB}
                          isSummarizing={summarizingId === result.id}
                          isAddingToKB={addingToKBId === result.id}
                          aiSummary={aiSummaries[result.id] || null}
                        />
                        {/* Success indicator for KB add */}
                        <AnimatePresence>
                          {kbAddSuccess === result.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Added to KB
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
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
