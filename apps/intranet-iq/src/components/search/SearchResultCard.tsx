"use client";

import {
  FileText,
  Users,
  Calendar,
  Database,
  Star,
  ExternalLink,
  Sparkles,
  MessageSquare,
  Clock,
  Loader2,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  summary?: string;
  type: string;
  relevance?: number;
  project_code?: string;
  created_at?: string;
  updatedAt?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  thumbnail?: string;
  source?: string;
}

interface SearchResultCardProps {
  result: SearchResult;
  onSummarize?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onOpen?: (id: string) => void;
  isSummarizing?: boolean;
}

const typeIcons: Record<string, typeof FileText> = {
  article: FileText,
  employee: Users,
  event: Calendar,
  document: FileText,
  channel: MessageSquare,
};

const typeColors: Record<string, string> = {
  article: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  employee: "bg-green-500/20 text-green-400 border-green-500/30",
  event: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  document: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  channel: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const sourceBadges: Record<string, { label: string; color: string }> = {
  confluence: { label: "Confluence", color: "bg-blue-600/20 text-blue-400" },
  sharepoint: { label: "SharePoint", color: "bg-teal-500/20 text-teal-400" },
  drive: { label: "Drive", color: "bg-yellow-500/20 text-yellow-400" },
  slack: { label: "Slack", color: "bg-purple-500/20 text-purple-400" },
  kb: { label: "Knowledge Base", color: "bg-blue-500/20 text-blue-400" },
};

export function SearchResultCard({
  result,
  onSummarize,
  onBookmark,
  onOpen,
  isSummarizing = false,
}: SearchResultCardProps) {
  const Icon = typeIcons[result.type] || FileText;
  const colorClass = typeColors[result.type] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  const sourceBadge = result.source ? sourceBadges[result.source] : null;
  const displayDate = result.updatedAt || result.created_at;

  return (
    <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-4 hover:border-blue-500/30 transition-all cursor-pointer group">
      <div className="flex gap-4">
        {/* Thumbnail */}
        {result.thumbnail ? (
          <div className="w-20 h-20 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
            <img
              src={result.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 border ${colorClass}`}
          >
            <Icon className="w-8 h-8" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Source Badge */}
              {sourceBadge && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${sourceBadge.color}`}>
                  {sourceBadge.label}
                </span>
              )}
              {/* Type Badge */}
              <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/50 capitalize">
                {result.type}
              </span>
              {/* Relevance Score */}
              {result.relevance && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                  {Math.round(result.relevance * 100)}% match
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onSummarize && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSummarize(result.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-blue-400 transition-colors"
                  title="Summarize"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
              {onBookmark && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmark(result.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-yellow-400 transition-colors"
                  title="Bookmark"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              {onOpen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(result.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  title="Open"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors line-clamp-1">
            {result.title}
          </h3>

          {/* Summary */}
          {result.summary && (
            <p className="text-sm text-white/60 line-clamp-2 mt-1">
              {result.summary.substring(0, 200)}...
            </p>
          )}

          {/* Footer Row */}
          <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
            {/* Author */}
            {result.author && (
              <div className="flex items-center gap-2">
                {result.author.avatar ? (
                  <img
                    src={result.author.avatar}
                    alt=""
                    className="w-4 h-4 rounded-full"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[8px] text-white/60">
                    {result.author.name.charAt(0)}
                  </div>
                )}
                <span>{result.author.name}</span>
              </div>
            )}
            {/* Date */}
            {displayDate && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(displayDate).toLocaleDateString()}
              </span>
            )}
            {/* Project */}
            {result.project_code && (
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                {result.project_code}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI Summarize Button (shown on hover) */}
      {onSummarize && (
        <div className={`mt-3 pt-3 border-t border-white/5 transition-opacity ${isSummarizing ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isSummarizing) onSummarize(result.id);
            }}
            disabled={isSummarizing}
            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
          >
            {isSummarizing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating summary...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Summarize this result
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
