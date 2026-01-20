"use client";

import { useState, useEffect } from "react";
import {
  Check,
  X,
  Clock,
  FileText,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
} from "lucide-react";
import type { Article } from "@/lib/database.types";

interface ApprovalAction {
  type: "approve" | "reject" | "request_changes";
  comment?: string;
}

interface ArticleApprovalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApprovalComplete?: () => void;
}

export function ArticleApprovalPanel({
  isOpen,
  onClose,
  onApprovalComplete,
}: ArticleApprovalPanelProps) {
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [actionComment, setActionComment] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPendingArticles();
    }
  }, [isOpen]);

  const fetchPendingArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/diq/api/content/pending");
      if (!response.ok) throw new Error("Failed to fetch pending articles");
      const data = await response.json();
      setPendingArticles(data.articles || []);
    } catch (err) {
      setError("Failed to load pending articles");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (articleId: string, action: ApprovalAction) => {
    setProcessing(articleId);
    setError(null);
    try {
      const response = await fetch("/diq/api/content/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          action: action.type,
          comment: action.comment || actionComment,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to process approval");
      }

      // Remove article from list
      setPendingArticles((prev) => prev.filter((a) => a.id !== articleId));
      setExpandedArticle(null);
      setActionComment("");
      onApprovalComplete?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setProcessing(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f14] border border-white/10 rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Pending Approvals</h2>
              <p className="text-sm text-white/50">
                {pendingArticles.length} article{pendingArticles.length !== 1 ? "s" : ""} awaiting review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
            </div>
          ) : pendingArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/40">
              <CheckCircle2 className="w-12 h-12 mb-3" />
              <p>No articles pending review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingArticles.map((article) => {
                const isExpanded = expandedArticle === article.id;
                const isProcessing = processing === article.id;

                return (
                  <div
                    key={article.id}
                    className="border border-white/10 rounded-lg overflow-hidden"
                  >
                    {/* Article Header */}
                    <div
                      onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{article.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {(article as any).author?.full_name || "Unknown"}
                          </span>
                          <span>
                            Submitted {new Date(article.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                          Pending Review
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-white/40" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-white/10">
                        {/* Preview */}
                        <div className="p-4 bg-white/5">
                          <p className="text-sm text-white/70 mb-2">
                            {article.summary || "No summary provided"}
                          </p>
                          <div
                            className="prose prose-invert prose-sm max-w-none line-clamp-4"
                            dangerouslySetInnerHTML={{
                              __html: (article.content || "").slice(0, 500) + "...",
                            }}
                          />
                        </div>

                        {/* Comment Input */}
                        <div className="p-4 border-t border-white/10">
                          <div className="flex items-start gap-3">
                            <MessageSquare className="w-5 h-5 text-white/40 mt-0.5" />
                            <div className="flex-1">
                              <textarea
                                value={expandedArticle === article.id ? actionComment : ""}
                                onChange={(e) => setActionComment(e.target.value)}
                                placeholder="Add feedback or comments (optional)..."
                                className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/30 outline-none resize-none"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 p-4 border-t border-white/10 bg-white/5">
                          <button
                            onClick={() =>
                              handleApprovalAction(article.id, { type: "reject" })
                            }
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 disabled:opacity-50 transition-colors text-sm"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              handleApprovalAction(article.id, { type: "request_changes" })
                            }
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-50 transition-colors text-sm"
                          >
                            <Send className="w-4 h-4" />
                            Request Changes
                          </button>
                          <button
                            onClick={() =>
                              handleApprovalAction(article.id, { type: "approve" })
                            }
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-colors text-sm"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Approve & Publish
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
