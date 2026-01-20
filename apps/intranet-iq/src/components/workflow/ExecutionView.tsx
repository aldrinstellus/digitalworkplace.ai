"use client";

import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  Loader2,
  XCircle,
  FileText,
  Database,
  Bot,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

interface Source {
  id: string;
  title: string;
  type: string;
  url?: string;
}

interface ExecutionStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "error";
  startedAt?: string;
  completedAt?: string;
  sources?: Source[];
  output?: string;
  error?: string;
}

interface ExecutionViewProps {
  workflowName: string;
  steps: ExecutionStep[];
  isRunning: boolean;
  onCancel?: () => void;
}

export function ExecutionView({
  workflowName,
  steps,
  isRunning,
  onCancel,
}: ExecutionViewProps) {
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [showAllSources, setShowAllSources] = useState(false);

  const currentStep = steps.find((s) => s.status === "running");
  const completedSteps = steps.filter((s) => s.status === "completed");
  const allSources = steps.flatMap((s) => s.sources || []);

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  };

  return (
    <div className="bg-[#0f0f14] border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">{workflowName}</h3>
            <p className="text-xs text-white/50">
              {isRunning
                ? currentStep
                  ? `Running: ${currentStep.name}`
                  : "Initializing..."
                : `Completed ${completedSteps.length}/${steps.length} steps`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Cancel
            </button>
          )}
          <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors">
            Schedule agent
          </button>
        </div>
      </div>

      {/* Current Activity */}
      {isRunning && currentStep && (
        <div className="p-4 border-b border-white/10 bg-blue-500/5">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-sm text-white/80">{currentStep.name}</span>
          </div>

          {/* Sources being searched */}
          {currentStep.sources && currentStep.sources.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentStep.sources.slice(0, 6).map((source) => (
                <span
                  key={source.id}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 text-xs text-white/60"
                >
                  <FileText className="w-3 h-3" />
                  {source.title}
                </span>
              ))}
              {currentStep.sources.length > 6 && (
                <span className="px-2 py-1 text-xs text-white/40">
                  +{currentStep.sources.length - 6} more
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Show Work Toggle */}
      <button
        onClick={() => setShowAllSources(!showAllSources)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/10"
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-white/50" />
          <span className="text-sm text-white/70">Show work</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/50">
            {allSources.length} sources
          </span>
        </div>
        {showAllSources ? (
          <ChevronUp className="w-4 h-4 text-white/40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/40" />
        )}
      </button>

      {/* All Sources */}
      {showAllSources && allSources.length > 0 && (
        <div className="p-4 border-b border-white/10 max-h-48 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {allSources.map((source, index) => (
              <a
                key={`${source.id}-${index}`}
                href={source.url || "#"}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 hover:text-white transition-colors"
              >
                <FileText className="w-3 h-3" />
                {source.title}
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="p-4">
        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">
          Execution Steps
        </h4>
        <div className="space-y-2">
          {steps.map((step, index) => {
            const isExpanded = expandedSteps.includes(step.id);

            return (
              <div
                key={step.id}
                className="border border-white/10 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                >
                  {/* Status Icon */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                    ) : step.status === "error" ? (
                      <XCircle className="w-3 h-3" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 text-left">
                    <p className="text-sm text-white/80">{step.name}</p>
                    {step.completedAt && (
                      <p className="text-xs text-white/40">
                        Completed in{" "}
                        {new Date(step.completedAt).getTime() -
                          new Date(step.startedAt || step.completedAt).getTime()}
                        ms
                      </p>
                    )}
                  </div>

                  {/* Expand Icon */}
                  {(step.sources?.length || step.output || step.error) && (
                    <ChevronDown
                      className={`w-4 h-4 text-white/40 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-0">
                    {step.sources && step.sources.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-white/40 mb-1">Sources:</p>
                        <div className="flex flex-wrap gap-1">
                          {step.sources.map((source) => (
                            <span
                              key={source.id}
                              className="px-2 py-0.5 rounded bg-white/5 text-xs text-white/60"
                            >
                              {source.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {step.output && (
                      <div className="p-2 bg-white/5 rounded text-xs text-white/70 font-mono">
                        {step.output}
                      </div>
                    )}
                    {step.error && (
                      <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                        {step.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask anything..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-blue-500/50 transition-colors"
          />
          <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
