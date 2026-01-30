"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

/**
 * Confidence Level Calculation:
 * - High: sources >= 3 AND avg relevance > 0.7
 * - Medium: sources >= 1 AND avg relevance > 0.5
 * - Low: otherwise
 */

export type ConfidenceLevel = "high" | "medium" | "low";

export interface ConfidenceData {
  level: ConfidenceLevel;
  sourceCount: number;
  avgRelevance: number;
}

export interface ConfidenceBadgeProps {
  sources?: Array<{ relevance?: number }>;
  className?: string;
}

/**
 * Calculate confidence level from sources array
 */
export function calculateConfidence(
  sources?: Array<{ relevance?: number }>
): ConfidenceData {
  if (!sources || sources.length === 0) {
    return {
      level: "low",
      sourceCount: 0,
      avgRelevance: 0,
    };
  }

  const sourceCount = sources.length;
  const relevanceScores = sources
    .map((s) => s.relevance ?? 0)
    .filter((r) => r > 0);

  const avgRelevance =
    relevanceScores.length > 0
      ? relevanceScores.reduce((sum, r) => sum + r, 0) / relevanceScores.length
      : 0;

  let level: ConfidenceLevel;

  if (sourceCount >= 3 && avgRelevance > 0.7) {
    level = "high";
  } else if (sourceCount >= 1 && avgRelevance > 0.5) {
    level = "medium";
  } else {
    level = "low";
  }

  return {
    level,
    sourceCount,
    avgRelevance,
  };
}

const confidenceConfig = {
  high: {
    label: "High Confidence",
    color: "#10b981", // emerald
    bgColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    Icon: CheckCircle,
  },
  medium: {
    label: "Medium Confidence",
    color: "#f59e0b", // amber
    bgColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    Icon: AlertCircle,
  },
  low: {
    label: "Low Confidence",
    color: "#ef4444", // red
    bgColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    Icon: AlertTriangle,
  },
};

export function ConfidenceBadge({ sources, className = "" }: ConfidenceBadgeProps) {
  const { level, sourceCount, avgRelevance } = calculateConfidence(sources);
  const config = confidenceConfig[level];
  const Icon = config.Icon;

  // Build tooltip text
  const tooltipText =
    sourceCount === 0
      ? "No sources found - response based on general knowledge"
      : `${config.label} - ${sourceCount} source${sourceCount !== 1 ? "s" : ""} (avg relevance: ${Math.round(avgRelevance * 100)}%)`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        color: config.color,
      }}
    >
      <Icon className="w-3 h-3" />
      <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>

      {/* Tooltip */}
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        style={{
          backgroundColor: "#121218", // bg-charcoal
          border: "1px solid rgba(255, 255, 255, 0.12)",
          color: "#fafafa",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
        }}
      >
        {tooltipText}
        {/* Tooltip arrow */}
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid rgba(255, 255, 255, 0.12)",
          }}
        />
      </div>
    </motion.div>
  );
}

export default ConfidenceBadge;
