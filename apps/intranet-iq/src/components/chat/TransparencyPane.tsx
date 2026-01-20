"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Database,
  FileText,
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";

interface Source {
  id: string;
  title: string;
  type: string;
  url?: string;
  relevance?: number;
}

interface Step {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "error";
  duration?: number;
  details?: string;
}

interface TransparencyPaneProps {
  sources: Source[];
  steps: Step[];
  isProcessing?: boolean;
  totalTokens?: number;
  responseTime?: number;
}

export function TransparencyPane({
  sources,
  steps,
  isProcessing = false,
  totalTokens,
  responseTime,
}: TransparencyPaneProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"sources" | "steps">("sources");

  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const runningStep = steps.find((s) => s.status === "running");

  return (
    <div className="bg-[#0f0f14] border border-white/10 rounded-xl overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            )}
            <span className="text-sm text-white/70">
              {isProcessing
                ? runningStep?.name || "Processing..."
                : "Show work"}
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
            {sources.length} sources
          </span>
          {steps.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
              {completedSteps}/{steps.length} steps
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {responseTime && (
            <span className="text-xs text-white/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {responseTime}ms
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-white/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/40" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-white/10">
          {/* Tabs */}
          <div className="flex gap-1 px-4 py-2 border-b border-white/10">
            <button
              onClick={() => setActiveTab("sources")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "sources"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Database className="w-3 h-3" />
                Sources ({sources.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("steps")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "steps"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Steps ({steps.length})
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-64 overflow-y-auto">
            {activeTab === "sources" ? (
              <div className="space-y-2">
                {sources.length === 0 ? (
                  <p className="text-xs text-white/40 text-center py-4">
                    No sources used
                  </p>
                ) : (
                  sources.map((source) => (
                    <a
                      key={source.id}
                      href={source.url || "#"}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 truncate group-hover:text-blue-400 transition-colors">
                          {source.title}
                        </p>
                        <p className="text-xs text-white/40 capitalize">
                          {source.type}
                        </p>
                      </div>
                      {source.relevance && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                          {Math.round(source.relevance * 100)}%
                        </span>
                      )}
                    </a>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-3">
                    {/* Step Status Icon */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          step.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : step.status === "running"
                            ? "bg-blue-500/20 text-blue-400"
                            : step.status === "error"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-white/10 text-white/40"
                        }`}
                      >
                        {step.status === "running" ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : step.status === "completed" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-px h-6 bg-white/10 my-1" />
                      )}
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-white/80">{step.name}</p>
                        {step.duration && (
                          <span className="text-xs text-white/40">
                            {step.duration}ms
                          </span>
                        )}
                      </div>
                      {step.details && (
                        <p className="text-xs text-white/40 mt-1">
                          {step.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Stats */}
          {totalTokens && (
            <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
              <span>Tokens used: {totalTokens.toLocaleString()}</span>
              {responseTime && <span>Response time: {responseTime}ms</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
