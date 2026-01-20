"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Clock, TrendingUp, FileText, Users, Calendar, X, Loader2 } from "lucide-react";

interface SearchSuggestion {
  id: string;
  type: "recent" | "trending" | "article" | "person" | "event";
  text: string;
  subtitle?: string;
}

// Get recent searches from localStorage
function getRecentSearches(): SearchSuggestion[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('diq-recent-searches');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save recent search to localStorage
function saveRecentSearch(text: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentSearches();
    const filtered = current.filter(s => s.text.toLowerCase() !== text.toLowerCase());
    const updated = [
      { id: `recent-${Date.now()}`, type: 'recent' as const, text },
      ...filtered,
    ].slice(0, 5);
    localStorage.setItem('diq-recent-searches', JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

// Remove a recent search
function removeRecentSearch(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentSearches();
    const updated = current.filter(s => s.id !== id);
    localStorage.setItem('diq-recent-searches', JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
}

const typeIcons = {
  recent: Clock,
  trending: TrendingUp,
  article: FileText,
  person: Users,
  event: Calendar,
};

const typeColors = {
  recent: "text-white/40",
  trending: "text-orange-400",
  article: "text-blue-400",
  person: "text-green-400",
  event: "text-purple-400",
};

export function SearchAutocomplete({
  value,
  onChange,
  onSearch,
  placeholder = "Search anything...",
}: SearchAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    const recentSearches = getRecentSearches();

    if (!query.trim()) {
      // Fetch trending suggestions from API
      try {
        const response = await fetch('/diq/api/search/autocomplete?limit=5');
        const data = await response.json();
        setSuggestions([...recentSearches, ...data.suggestions]);
      } catch {
        setSuggestions(recentSearches);
      }
      return;
    }

    setLoading(true);

    try {
      // Fetch real suggestions from API
      const response = await fetch(`/diq/api/search/autocomplete?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();

      // Filter recent searches to match query
      const matchingRecent = recentSearches.filter((r) =>
        r.text.toLowerCase().includes(query.toLowerCase())
      );

      setSuggestions([...matchingRecent, ...data.suggestions]);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      // Fall back to recent searches only
      setSuggestions(recentSearches.filter((r) =>
        r.text.toLowerCase().includes(query.toLowerCase())
      ));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === "Enter") {
        onSearch(value);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          onChange(suggestions[selectedIndex].text);
          onSearch(suggestions[selectedIndex].text);
        } else {
          onSearch(value);
        }
        setShowSuggestions(false);
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    onSearch(suggestion.text);
    // Save to recent searches
    saveRecentSearch(suggestion.text);
    setShowSuggestions(false);
  };

  const clearRecentSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecentSearch(id);
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder-white/40 outline-none text-lg pl-12 pr-4 py-2"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f0f14] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {/* Recent Searches */}
            {suggestions.some((s) => s.type === "recent") && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/40 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  Recent Searches
                </div>
                {suggestions
                  .filter((s) => s.type === "recent")
                  .map((suggestion, idx) => {
                    const globalIdx = suggestions.findIndex((s) => s.id === suggestion.id);
                    const Icon = typeIcons[suggestion.type];
                    return (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                          selectedIndex === globalIdx
                            ? "bg-blue-500/20 text-white"
                            : "hover:bg-white/5 text-white/70"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${typeColors[suggestion.type]}`} />
                          <span>{suggestion.text}</span>
                        </div>
                        <button
                          onClick={(e) => clearRecentSearch(suggestion.id, e)}
                          className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </button>
                    );
                  })}
              </div>
            )}

            {/* Trending */}
            {suggestions.some((s) => s.type === "trending") && (
              <div className="p-2 border-t border-white/10">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/40 uppercase tracking-wider">
                  <TrendingUp className="w-3 h-3" />
                  Trending
                </div>
                {suggestions
                  .filter((s) => s.type === "trending")
                  .map((suggestion) => {
                    const globalIdx = suggestions.findIndex((s) => s.id === suggestion.id);
                    const Icon = typeIcons[suggestion.type];
                    return (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          selectedIndex === globalIdx
                            ? "bg-blue-500/20 text-white"
                            : "hover:bg-white/5 text-white/70"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${typeColors[suggestion.type]}`} />
                        <div className="text-left">
                          <div>{suggestion.text}</div>
                          {suggestion.subtitle && (
                            <div className="text-xs text-white/40">{suggestion.subtitle}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}

            {/* Search Results */}
            {suggestions.some((s) => !["recent", "trending"].includes(s.type)) && (
              <div className="p-2 border-t border-white/10">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/40 uppercase tracking-wider">
                  <Search className="w-3 h-3" />
                  Suggestions
                </div>
                {suggestions
                  .filter((s) => !["recent", "trending"].includes(s.type))
                  .map((suggestion) => {
                    const globalIdx = suggestions.findIndex((s) => s.id === suggestion.id);
                    const Icon = typeIcons[suggestion.type];
                    return (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          selectedIndex === globalIdx
                            ? "bg-blue-500/20 text-white"
                            : "hover:bg-white/5 text-white/70"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${typeColors[suggestion.type]}`} />
                        <div className="text-left flex-1">
                          <div>{suggestion.text}</div>
                          {suggestion.subtitle && (
                            <div className="text-xs text-white/40">{suggestion.subtitle}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 px-3 py-2">
            <p className="text-xs text-white/30">
              ↑↓ to navigate, Enter to search, Esc to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
