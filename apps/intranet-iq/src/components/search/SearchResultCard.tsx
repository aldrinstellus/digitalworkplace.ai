"use client";

import { useState } from "react";
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
  BookPlus,
  Check,
  X,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  onAddToKB?: (id: string, title: string, summary: string, category?: string) => void;
  isSummarizing?: boolean;
  isAddingToKB?: boolean;
  aiSummary?: string | null;
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

// KB category options for the Add to KB modal
const kbCategories = [
  { id: "general", name: "General" },
  { id: "engineering", name: "Engineering" },
  { id: "hr", name: "HR Policies" },
  { id: "it", name: "IT Support" },
  { id: "product", name: "Product" },
  { id: "sales", name: "Sales" },
  { id: "marketing", name: "Marketing" },
  { id: "finance", name: "Finance" },
  { id: "legal", name: "Legal & Compliance" },
  { id: "security", name: "Security" },
];

export function SearchResultCard({
  result,
  onSummarize,
  onBookmark,
  onOpen,
  onAddToKB,
  isSummarizing = false,
  isAddingToKB = false,
  aiSummary = null,
}: SearchResultCardProps) {
  const [showAddToKBModal, setShowAddToKBModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [customTitle, setCustomTitle] = useState(result.title);
  const [showSummary, setShowSummary] = useState(false);
  const [copied, setCopied] = useState(false);

  const Icon = typeIcons[result.type] || FileText;
  const colorClass = typeColors[result.type] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  const sourceBadge = result.source ? sourceBadges[result.source] : null;
  const displayDate = result.updatedAt || result.created_at;

  const handleAddToKB = () => {
    if (onAddToKB) {
      onAddToKB(result.id, customTitle, aiSummary || result.summary || "", selectedCategory);
      setShowAddToKBModal(false);
    }
  };

  const copySummary = async () => {
    if (aiSummary) {
      await navigator.clipboard.writeText(aiSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[var(--bg-charcoal)] border border-white/10 rounded-xl p-4 hover:border-blue-500/30 transition-all cursor-pointer group">
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
                  disabled={isSummarizing}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-blue-400 transition-colors disabled:opacity-50"
                  title="AI Summarize"
                >
                  {isSummarizing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              )}
              {onAddToKB && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddToKBModal(true);
                  }}
                  disabled={isAddingToKB}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-green-400 transition-colors disabled:opacity-50"
                  title="Add to Knowledge Base"
                >
                  {isAddingToKB ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <BookPlus className="w-4 h-4" />
                  )}
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

      {/* AI Summary Section - shows when summary is available or generating */}
      <AnimatePresence>
        {(isSummarizing || aiSummary) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-white/5"
          >
            {isSummarizing ? (
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating AI summary...</span>
              </div>
            ) : aiSummary ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-blue-400">
                    <Sparkles className="w-3 h-3" />
                    <span className="font-medium">AI Summary</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copySummary();
                      }}
                      className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      title="Copy summary"
                    >
                      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSummary(!showSummary);
                      }}
                      className="text-xs text-white/40 hover:text-white transition-colors"
                    >
                      {showSummary ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {showSummary && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-white/70 bg-blue-500/10 rounded-lg p-3 border border-blue-500/20"
                    >
                      {aiSummary}
                    </motion.p>
                  )}
                </AnimatePresence>
                {/* Quick Actions after summary */}
                <div className="flex items-center gap-2 pt-1">
                  {onAddToKB && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddToKBModal(true);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs transition-colors"
                    >
                      <BookPlus className="w-3 h-3" />
                      Add to KB
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summarize button (shown on hover when no summary yet) */}
      {onSummarize && !aiSummary && !isSummarizing && (
        <div className="mt-3 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSummarize(result.id);
            }}
            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Summarize this result
          </button>
        </div>
      )}

      {/* Add to KB Modal */}
      <AnimatePresence>
        {showAddToKBModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddToKBModal(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-[90vw] bg-[var(--bg-charcoal)] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <BookPlus className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-medium text-white">Add to Knowledge Base</h3>
                </div>
                <button
                  onClick={() => setShowAddToKBModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Source Badge */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/40">Source:</span>
                  {sourceBadge && (
                    <span className={`px-2 py-0.5 rounded ${sourceBadge.color}`}>
                      {sourceBadge.label}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white/50 capitalize">
                    {result.type}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Article Title</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-[var(--bg-slate)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50"
                    placeholder="Enter article title..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-[var(--bg-slate)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50"
                  >
                    {kbCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Summary Preview */}
                {(aiSummary || result.summary) && (
                  <div>
                    <label className="block text-xs text-white/60 mb-1.5">
                      {aiSummary ? "AI Summary (will be used as article content)" : "Original Summary"}
                    </label>
                    <div className="bg-[var(--bg-slate)] border border-white/10 rounded-lg p-3 text-sm text-white/70 max-h-32 overflow-y-auto">
                      {aiSummary || result.summary}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/10 bg-white/5">
                <button
                  onClick={() => setShowAddToKBModal(false)}
                  className="px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToKB}
                  disabled={isAddingToKB || !customTitle.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  {isAddingToKB ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <BookPlus className="w-4 h-4" />
                      Add to KB
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
