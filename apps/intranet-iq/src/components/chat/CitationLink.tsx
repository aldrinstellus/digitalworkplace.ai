"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, FileText, Globe } from "lucide-react";
import type { ChatSource } from "@/lib/database.types";

interface CitationLinkProps {
  citationNumber: number;
  source: ChatSource;
  onSourceClick?: (source: ChatSource) => void;
}

/**
 * CitationLink - Inline citation marker that's clickable
 * Displays as [1], [2], etc. in emerald color with hover preview
 */
export function CitationLink({ citationNumber, source, onSourceClick }: CitationLinkProps) {
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLButtonElement>(null);

  // Close preview when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        previewRef.current &&
        !previewRef.current.contains(event.target as Node) &&
        linkRef.current &&
        !linkRef.current.contains(event.target as Node)
      ) {
        setShowPreview(false);
      }
    }

    if (showPreview) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPreview]);

  const handleClick = () => {
    if (source.url) {
      window.open(source.url, "_blank", "noopener,noreferrer");
    } else if (onSourceClick) {
      onSourceClick(source);
    } else {
      setShowPreview(!showPreview);
    }
  };

  const getSourceIcon = () => {
    switch (source.type) {
      case "article":
        return <FileText className="w-3.5 h-3.5" />;
      case "web":
        return <Globe className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <span className="relative inline-block">
      <button
        ref={linkRef}
        onClick={handleClick}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        className="inline-flex items-center justify-center text-[#10b981] hover:text-[#34d399] hover:underline transition-colors text-xs font-medium align-super cursor-pointer mx-0.5"
        style={{ fontSize: "0.7em", verticalAlign: "super" }}
        title={source.title}
      >
        [{citationNumber}]
      </button>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            ref={previewRef}
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[var(--bg-charcoal)] border border-[var(--border-default)] rounded-lg shadow-xl p-3"
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
          >
            {/* Arrow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[var(--border-default)]" />
            </div>

            {/* Content */}
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                {getSourceIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                  {source.type === "article" ? "Knowledge Base" : source.type === "web" ? "Web" : "Document"}
                </div>
                <div className="text-sm text-[var(--text-primary)] font-medium truncate">
                  {source.title}
                </div>
                {source.snippet && (
                  <div className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                    {source.snippet}
                  </div>
                )}
                {source.relevance && (
                  <div className="text-xs text-[#10b981] mt-1">
                    {Math.round(source.relevance * 100)}% relevant
                  </div>
                )}
              </div>
            </div>

            {source.url && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(source.url, "_blank", "noopener,noreferrer");
                }}
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] text-xs font-medium transition-colors"
              >
                Open source
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

interface SourcesFooterProps {
  sources: ChatSource[];
  onSourceClick?: (source: ChatSource) => void;
}

/**
 * SourcesFooter - Numbered list of sources at the bottom of AI responses
 */
export function SourcesFooter({ sources, onSourceClick }: SourcesFooterProps) {
  if (!sources || sources.length === 0) return null;

  const handleSourceClick = (source: ChatSource) => {
    if (source.url) {
      window.open(source.url, "_blank", "noopener,noreferrer");
    } else if (onSourceClick) {
      onSourceClick(source);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="w-3.5 h-3.5" />;
      case "web":
        return <Globe className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const getSourceTypeLabel = (type: string) => {
    switch (type) {
      case "article":
        return "Knowledge Base";
      case "web":
        return "Web";
      case "document":
        return "Document";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.12)]">
      <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <FileText className="w-3.5 h-3.5" />
        Sources
      </div>
      <div className="space-y-1.5">
        {sources.map((source, index) => (
          <button
            key={source.id || index}
            onClick={() => handleSourceClick(source)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md bg-[var(--bg-slate)]/50 hover:bg-[var(--bg-slate)] text-left transition-colors group"
          >
            <span className="flex-shrink-0 w-5 h-5 rounded bg-[#10b981]/20 flex items-center justify-center text-[#10b981] text-xs font-medium">
              {index + 1}
            </span>
            <span className="flex-shrink-0 text-[var(--text-muted)]">
              {getSourceIcon(source.type)}
            </span>
            <span className="flex-1 min-w-0 text-sm text-[var(--text-primary)] truncate group-hover:text-[#10b981] transition-colors">
              {source.title}
            </span>
            <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">
              {getSourceTypeLabel(source.type)}
            </span>
            {source.url && (
              <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[#10b981] transition-colors" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface MessageContentWithCitationsProps {
  content: string;
  sources: ChatSource[];
  onSourceClick?: (source: ChatSource) => void;
}

/**
 * MessageContentWithCitations - Renders message content with inline clickable citations
 * Detects patterns like [1], [2], etc. and replaces them with CitationLink components
 */
export function MessageContentWithCitations({
  content,
  sources,
  onSourceClick
}: MessageContentWithCitationsProps) {
  // Parse content and replace citation patterns with CitationLink components
  const renderContentWithCitations = () => {
    if (!sources || sources.length === 0) {
      return <span>{content}</span>;
    }

    // Match citation patterns like [1], [2], [12], etc.
    const citationPattern = /\[(\d+)\]/g;
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = citationPattern.exec(content)) !== null) {
      // Add text before the citation
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      const citationNumber = parseInt(match[1], 10);
      const sourceIndex = citationNumber - 1; // Citations are 1-indexed, arrays are 0-indexed

      if (sourceIndex >= 0 && sourceIndex < sources.length) {
        // Valid citation - render as clickable link
        parts.push(
          <CitationLink
            key={`citation-${match.index}-${citationNumber}`}
            citationNumber={citationNumber}
            source={sources[sourceIndex]}
            onSourceClick={onSourceClick}
          />
        );
      } else {
        // Invalid citation number - render as plain text
        parts.push(match[0]);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last citation
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return <>{parts}</>;
  };

  return (
    <div className="text-[var(--text-primary)]/90 whitespace-pre-wrap text-sm leading-relaxed">
      {renderContentWithCitations()}
    </div>
  );
}
