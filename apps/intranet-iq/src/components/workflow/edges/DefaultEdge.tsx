"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useWorkflowStore } from "@/lib/workflow/store";
import type { WorkflowEdgeData } from "@/lib/workflow/types";

type DefaultEdgeProps = EdgeProps & {
  data?: WorkflowEdgeData;
};

function DefaultEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: DefaultEdgeProps) {
  const { deleteEdge, saveToHistory } = useWorkflowStore();

  // Use smooth step path for cleaner vertical connections
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveToHistory();
    deleteEdge(id);
  };

  return (
    <>
      {/* Edge Path */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? "var(--accent-ember)" : "rgba(255, 255, 255, 0.25)",
          strokeWidth: selected ? 2.5 : 1.5,
          transition: "stroke 0.15s, stroke-width 0.15s",
        }}
      />

      {/* Animated flow indicator when selected */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke="var(--accent-ember)"
          strokeWidth="4"
          strokeDasharray="8 8"
          strokeLinecap="round"
          style={{
            animation: "flowAnimation 1s linear infinite",
          }}
        />
      )}

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {/* Edge Label */}
          {data?.label && (
            <span className="px-2 py-0.5 bg-[var(--bg-charcoal)]/90 backdrop-blur-sm border border-[var(--border-subtle)] rounded-full text-[10px] text-[var(--text-secondary)]">
              {data.label}
            </span>
          )}

          {/* Delete Button (visible on select) */}
          {selected && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={handleDelete}
              className="absolute -top-6 left-1/2 -translate-x-1/2 p-1 rounded-full bg-red-500/90 text-white hover:bg-red-600 transition-colors shadow-lg"
              title="Delete connection"
            >
              <X className="w-3 h-3" />
            </motion.button>
          )}
        </div>
      </EdgeLabelRenderer>

      <style jsx global>{`
        @keyframes flowAnimation {
          from {
            stroke-dashoffset: 16;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </>
  );
}

export const DefaultEdge = memo(DefaultEdgeComponent);
export default DefaultEdge;
