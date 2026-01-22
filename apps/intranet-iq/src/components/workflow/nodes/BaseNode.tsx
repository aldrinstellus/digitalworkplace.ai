"use client";

import { memo, useMemo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { Settings, Trash2, GripVertical } from "lucide-react";
import type { WorkflowNodeData, WorkflowNodeType } from "@/lib/workflow/types";
import { NODE_TYPE_CONFIG } from "@/lib/workflow/constants";
import { useWorkflowStore } from "@/lib/workflow/store";

type BaseNodeProps = NodeProps & {
  data: WorkflowNodeData;
};

function BaseNodeComponent({ id, data, selected }: BaseNodeProps) {
  const { deleteNode, selectNode, togglePanel } = useWorkflowStore();

  const config = useMemo(() => NODE_TYPE_CONFIG[data.type as WorkflowNodeType], [data.type]);
  const Icon = config?.icon;

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(id);
    togglePanel?.(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  if (!config) {
    return (
      <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
        <span className="text-red-400 text-sm">Unknown node type: {String(data.type)}</span>
      </div>
    );
  }

  const hasInputs = config.handles.inputs.length > 0;
  const hasOutputs = config.handles.outputs.length > 0;
  const isCondition = data.type === "condition";

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.15 }}
      className={`
        relative w-[260px] rounded-xl overflow-hidden
        transition-all duration-150
        ${selected
          ? "ring-2 ring-offset-2 ring-offset-[var(--bg-obsidian)]"
          : "hover:shadow-lg"
        }
      `}
      style={{
        backgroundColor: "var(--bg-charcoal)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: selected ? config.color : "var(--border-subtle)",
        boxShadow: selected
          ? `0 0 24px ${config.color}30`
          : "0 4px 16px rgba(0, 0, 0, 0.2)",
        ["--tw-ring-color" as string]: config.color,
      }}
    >
      {/* Input Handle - TOP (for vertical TB layout) */}
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Top}
          id="input"
          className="!w-3 !h-3 !rounded-full !border-2 !-top-1.5 transition-all hover:!scale-150 hover:!border-white"
          style={{
            backgroundColor: "var(--bg-slate)",
            borderColor: "rgba(255, 255, 255, 0.4)",
          }}
        />
      )}

      {/* Colored Top Bar */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: config.color }}
      />

      {/* Node Content */}
      <div className="p-3">
        {/* Header Row */}
        <div className="flex items-center gap-2.5">
          {/* Icon */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: config.bgColor,
              border: `1px solid ${config.borderColor}`,
            }}
          >
            {Icon && (
              <Icon
                className="w-4.5 h-4.5"
                style={{ color: config.color }}
              />
            )}
          </div>

          {/* Title & Type */}
          <div className="flex-1 min-w-0">
            <h4 className="text-[var(--text-primary)] font-medium text-sm truncate leading-tight">
              {data.label}
            </h4>
            <span
              className="text-[10px] font-medium uppercase tracking-wider opacity-80"
              style={{ color: config.color }}
            >
              {config.label}
            </span>
          </div>

          {/* Action Buttons - Always visible on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              onClick={handleSettings}
              className="p-1.5 rounded-md hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Configure"
            >
              <Settings className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              onClick={handleDelete}
              className="p-1.5 rounded-md hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

        {/* Description - Only if present and not too long */}
        {data.description && (
          <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-2 pl-[46px]">
            {data.description}
          </p>
        )}

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 mt-2 pl-[46px]">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              data.isConfigured ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          <span className="text-[10px] text-[var(--text-muted)]">
            {data.isConfigured ? "Ready" : "Configure"}
          </span>
        </div>
      </div>

      {/* Output Handles - BOTTOM (for vertical TB layout) */}
      {hasOutputs && !isCondition && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="output"
          className="!w-3 !h-3 !rounded-full !border-2 !-bottom-1.5 transition-all hover:!scale-150 !cursor-crosshair"
          style={{
            backgroundColor: config.color,
            borderColor: config.color,
          }}
        />
      )}

      {/* Condition Handles - Two outputs at bottom */}
      {isCondition && (
        <>
          {/* True Handle - Bottom Left */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            className="!w-3 !h-3 !rounded-full !border-2 !-bottom-1.5 transition-all hover:!scale-150 !cursor-crosshair"
            style={{
              backgroundColor: "#22c55e",
              borderColor: "#22c55e",
              left: "30%",
            }}
          />
          {/* True Label */}
          <span className="absolute bottom-[-20px] text-[9px] font-medium text-emerald-400" style={{ left: "25%" }}>
            Yes
          </span>

          {/* False Handle - Bottom Right */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="!w-3 !h-3 !rounded-full !border-2 !-bottom-1.5 transition-all hover:!scale-150 !cursor-crosshair"
            style={{
              backgroundColor: "#ef4444",
              borderColor: "#ef4444",
              left: "70%",
            }}
          />
          {/* False Label */}
          <span className="absolute bottom-[-20px] text-[9px] font-medium text-red-400" style={{ left: "67%" }}>
            No
          </span>
        </>
      )}

      {/* Drag Indicator (subtle) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none">
        <GripVertical className="w-3 h-3 text-white" />
      </div>

      {/* Selected Glow Effect */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            boxShadow: `inset 0 0 20px ${config.color}20`,
          }}
        />
      )}
    </motion.div>
  );
}

// Wrap with group class for hover effects
export function BaseNode(props: BaseNodeProps) {
  return (
    <div className="group">
      <BaseNodeComponent {...props} />
    </div>
  );
}

export default memo(BaseNode);
