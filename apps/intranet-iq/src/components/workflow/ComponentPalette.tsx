"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { X, GripVertical, ChevronRight } from "lucide-react";
import type { WorkflowNodeType } from "@/lib/workflow/types";
import { NODE_TYPE_CONFIG } from "@/lib/workflow/constants";
import { useWorkflowStore } from "@/lib/workflow/store";

interface ComponentPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

// Node categories for organization
const NODE_CATEGORIES = [
  {
    id: "start",
    label: "Start",
    types: ["trigger"] as WorkflowNodeType[],
  },
  {
    id: "logic",
    label: "Logic",
    types: ["condition", "transform"] as WorkflowNodeType[],
  },
  {
    id: "actions",
    label: "Actions",
    types: ["search", "action"] as WorkflowNodeType[],
  },
  {
    id: "end",
    label: "End",
    types: ["output"] as WorkflowNodeType[],
  },
];

export function ComponentPalette({ isOpen, onClose }: ComponentPaletteProps) {
  const { nodes, addNode } = useWorkflowStore();

  // Handle adding a node - position below last node (top-to-bottom flow)
  const handleAddNode = useCallback(
    (type: WorkflowNodeType) => {
      const lastNode = nodes[nodes.length - 1];
      const position = lastNode
        ? { x: lastNode.position.x, y: lastNode.position.y + 150 }
        : { x: 300, y: 100 };

      addNode(type, position);
    },
    [nodes, addNode]
  );

  // Handle drag start for dragging nodes onto canvas
  const handleDragStart = useCallback(
    (event: React.DragEvent, type: WorkflowNodeType) => {
      event.dataTransfer.setData("application/reactflow", type);
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: isOpen ? 0 : 320, opacity: isOpen ? 1 : 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute top-0 right-0 h-full w-72 bg-[var(--bg-charcoal)]/98 backdrop-blur-xl
                 border-l border-[var(--border-subtle)] z-30 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)]
                          flex items-center justify-center">
            <ChevronRight className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-sm font-medium text-[var(--text-primary)]">Components</h3>
        </div>
        <motion.button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)]
                     hover:text-[var(--text-secondary)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {NODE_CATEGORIES.map((category) => (
          <div key={category.id}>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2 px-1">
              {category.label}
            </div>
            <div className="space-y-1.5">
              {category.types.map((type) => {
                const config = NODE_TYPE_CONFIG[type];
                const Icon = config.icon;
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, type)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <motion.div
                      onClick={() => handleAddNode(type)}
                      className="group flex items-center gap-3 p-2.5 rounded-lg
                                 bg-[var(--bg-obsidian)] border border-[var(--border-subtle)]
                                 hover:border-[var(--border-default)] hover:bg-[var(--bg-slate)] transition-all"
                      style={{
                        borderLeftColor: config.color,
                        borderLeftWidth: "3px",
                      }}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: config.bgColor }}
                    >
                      <Icon className="w-4 h-4" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        {config.label}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate">
                        {config.description}
                      </div>
                    </div>
                      <GripVertical className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0
                                               group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-obsidian)]/50">
        <p className="text-[10px] text-[var(--text-muted)] text-center">
          Drag components to canvas or click to add
        </p>
      </div>
    </motion.div>
  );
}
