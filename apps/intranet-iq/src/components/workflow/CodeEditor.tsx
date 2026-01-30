"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react";
import type { ParseError } from "@/lib/workflow/yaml-converter";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  format: "yaml" | "json";
  onFormatChange: (format: "yaml" | "json") => void;
  errors: ParseError[];
  onValidate: () => void;
  onApply: () => void;
  isValid: boolean;
  isDirty: boolean;
  readOnly?: boolean;
}

/**
 * Code Editor Component for Workflow YAML/JSON editing
 * Features:
 * - Syntax highlighting
 * - Line numbers
 * - Error highlighting
 * - Format toggle (YAML/JSON)
 * - Copy/Download functionality
 */
export function CodeEditor({
  value,
  onChange,
  format,
  onFormatChange,
  errors,
  onValidate,
  onApply,
  isValid,
  isDirty,
  readOnly = false,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Sync scroll between textarea, highlight, and line numbers
  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = target.scrollTop;
      highlightRef.current.scrollLeft = target.scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = target.scrollTop;
    }
  }, []);

  // Apply syntax highlighting
  const highlightedCode = useMemo(() => {
    return applySyntaxHighlighting(value, format, errors);
  }, [value, format, errors]);

  // Count lines
  const lineCount = value.split("\n").length;

  // Get error lines for highlighting
  const errorLines = useMemo(() => {
    return new Set(errors.filter(e => e.line).map(e => e.line as number));
  }, [errors]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Download file
  const handleDownload = () => {
    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import file
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = format === "yaml" ? ".yaml,.yml" : ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        onChange(text);
      }
    };
    input.click();
  };

  // Handle tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newValue =
        value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);

      // Move cursor after indent
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#08080c] rounded-xl overflow-hidden border border-[var(--border-subtle)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d12] border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          {/* Format Toggle */}
          <div className="flex items-center rounded-lg bg-[#16161d] border border-[var(--border-subtle)] p-0.5">
            <button
              onClick={() => onFormatChange("yaml")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                format === "yaml"
                  ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              YAML
            </button>
            <button
              onClick={() => onFormatChange("json")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                format === "json"
                  ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              JSON
            </button>
          </div>

          {/* Status indicator */}
          <AnimatePresence mode="wait">
            {errors.length > 0 ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.length} error{errors.length > 1 ? "s" : ""}
              </motion.div>
            ) : isValid ? (
              <motion.div
                key="valid"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--success)]/10 text-[var(--success)] text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valid
              </motion.div>
            ) : null}
          </AnimatePresence>

          {isDirty && (
            <span className="text-xs text-[var(--text-muted)]">(unsaved)</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleImport}
            className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            title="Import file"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[var(--success)]" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <div className="w-px h-4 bg-[var(--border-subtle)] mx-1" />
          <button
            onClick={onValidate}
            className="px-3 py-1 text-xs font-medium rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Validate
          </button>
          <button
            onClick={onApply}
            disabled={errors.length > 0 || !isDirty}
            className="px-3 py-1 text-xs font-medium rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Changes
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="flex-shrink-0 w-12 py-4 px-2 bg-[#0a0a0f] border-r border-[var(--border-subtle)] overflow-hidden select-none"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i + 1}
              className={`text-right text-xs leading-6 ${
                errorLines.has(i + 1)
                  ? "text-red-400 bg-red-500/10 -mx-2 px-2"
                  : "text-white/30"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Syntax Highlighted Overlay */}
          <div
            ref={highlightRef}
            className="absolute inset-0 py-4 px-4 overflow-auto pointer-events-none whitespace-pre-wrap break-words"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "13px",
              lineHeight: "24px",
              wordBreak: "break-word",
            }}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />

          {/* Actual Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            spellCheck={false}
            className="absolute inset-0 w-full h-full py-4 px-4 bg-transparent text-transparent caret-white resize-none outline-none"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "13px",
              lineHeight: "24px",
              wordBreak: "break-word",
            }}
          />
        </div>
      </div>

      {/* Error Panel */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--border-subtle)] bg-[#0d0d12] overflow-hidden"
          >
            <div className="p-3 max-h-32 overflow-y-auto">
              <div className="text-xs font-medium text-red-400 mb-2">Errors:</div>
              {errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-xs text-red-300/80 mb-1 last:mb-0"
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    {error.line && (
                      <span className="text-red-400">Line {error.line}: </span>
                    )}
                    {error.message}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// SYNTAX HIGHLIGHTING
// =============================================================================

function applySyntaxHighlighting(
  code: string,
  format: "yaml" | "json",
  errors: ParseError[]
): string {
  const errorLines = new Set(errors.filter(e => e.line).map(e => e.line as number));
  const lines = code.split("\n");

  const highlightedLines = lines.map((line, index) => {
    const lineNum = index + 1;
    const hasError = errorLines.has(lineNum);
    let highlighted = escapeHtml(line);

    if (format === "yaml") {
      highlighted = highlightYAML(highlighted);
    } else {
      highlighted = highlightJSON(highlighted);
    }

    if (hasError) {
      return `<span class="bg-red-500/20 block -mx-4 px-4">${highlighted}</span>`;
    }

    return highlighted;
  });

  return highlightedLines.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlightYAML(line: string): string {
  // Comments
  if (line.trim().startsWith("#")) {
    return `<span style="color: rgba(255,255,255,0.4); font-style: italic;">${line}</span>`;
  }

  // Key-value pairs
  const keyValueMatch = line.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)(:)(.*)$/);
  if (keyValueMatch) {
    const [, indent, key, colon, value] = keyValueMatch;
    const highlightedValue = highlightYAMLValue(value.trim());
    return `${indent}<span style="color: #fafafa;">${key}</span><span style="color: rgba(255,255,255,0.5);">${colon}</span> ${highlightedValue}`;
  }

  // List items
  const listMatch = line.match(/^(\s*)(-)(.*)$/);
  if (listMatch) {
    const [, indent, dash, rest] = listMatch;
    const highlightedRest = highlightYAMLValue(rest.trim());
    return `${indent}<span style="color: #f59e0b;">${dash}</span> ${highlightedRest}`;
  }

  return line;
}

function highlightYAMLValue(value: string): string {
  if (!value) return "";

  // Boolean
  if (/^(true|false)$/i.test(value)) {
    return `<span style="color: #f59e0b;">${value}</span>`;
  }

  // Number
  if (/^-?\d+\.?\d*$/.test(value)) {
    return `<span style="color: #f59e0b;">${value}</span>`;
  }

  // Null
  if (/^(null|~)$/i.test(value)) {
    return `<span style="color: #f59e0b;">${value}</span>`;
  }

  // Quoted string
  if (/^["'].*["']$/.test(value)) {
    return `<span style="color: #10b981;">${value}</span>`;
  }

  // Inline key-value (nested on same line)
  const inlineKV = value.match(/^([a-zA-Z_][a-zA-Z0-9_]*):(.*)$/);
  if (inlineKV) {
    const [, k, v] = inlineKV;
    return `<span style="color: #fafafa;">${k}</span><span style="color: rgba(255,255,255,0.5);">:</span> ${highlightYAMLValue(v.trim())}`;
  }

  // Unquoted string (emerald)
  return `<span style="color: #10b981;">${value}</span>`;
}

function highlightJSON(line: string): string {
  let result = line;

  // Keys (white)
  result = result.replace(
    /"([^"]+)"(\s*:)/g,
    '<span style="color: #fafafa;">"$1"</span><span style="color: rgba(255,255,255,0.5);">$2</span>'
  );

  // String values (emerald)
  result = result.replace(
    /:\s*"([^"]*)"/g,
    ': <span style="color: #10b981;">"$1"</span>'
  );

  // Numbers (amber)
  result = result.replace(
    /:\s*(-?\d+\.?\d*)/g,
    ': <span style="color: #f59e0b;">$1</span>'
  );

  // Booleans (amber)
  result = result.replace(
    /:\s*(true|false)/g,
    ': <span style="color: #f59e0b;">$1</span>'
  );

  // Null (amber)
  result = result.replace(
    /:\s*(null)/g,
    ': <span style="color: #f59e0b;">$1</span>'
  );

  return result;
}

export default CodeEditor;
