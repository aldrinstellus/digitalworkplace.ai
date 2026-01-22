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

type ConditionalEdgeProps = EdgeProps & {
  data?: WorkflowEdgeData;
};

function ConditionalEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: ConditionalEdgeProps) {
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

  // Determine color based on condition type
  const isSuccess = data?.condition === "true" || data?.condition === "success";
  const edgeColor = isSuccess ? "#22c55e" : "#ef4444";
  const label = isSuccess ? "Yes" : "No";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveToHistory();
    deleteEdge(id);
  };

  return (
    <>
      {/* Main edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: edgeColor,
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: isSuccess ? undefined : "6,4",
          transition: "stroke-width 0.15s",
        }}
      />

      {/* Animated flow when selected */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke={edgeColor}
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
          {/* Condition Label Badge */}
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: `${edgeColor}15`,
              color: edgeColor,
              border: `1px solid ${edgeColor}40`,
            }}
          >
            {label}
          </span>

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
    </>
  );
}

export const ConditionalEdge = memo(ConditionalEdgeComponent);
export default ConditionalEdge;
