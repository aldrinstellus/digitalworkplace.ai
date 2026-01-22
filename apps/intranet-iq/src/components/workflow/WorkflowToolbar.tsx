"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  LayoutGrid,
  Save,
  Download,
  Upload,
  Settings,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import type { WorkflowNodeType } from "@/lib/workflow/types";
import { NODE_TYPE_CONFIG } from "@/lib/workflow/constants";
import { useWorkflowStore } from "@/lib/workflow/store";
import { applyHorizontalLayout } from "@/lib/workflow/autoLayout";

interface WorkflowToolbarProps {
  onSave?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  isSaving?: boolean;
}

export function WorkflowToolbar({
  onSave,
  onExport,
  onImport,
  isSaving,
}: WorkflowToolbarProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const {
    nodes,
    edges,
    addNode,
    setNodes,
    undo,
    redo,
    canUndo,
    canRedo,
    isDirty,
  } = useWorkflowStore();

  const handleAddNode = useCallback(
    (type: WorkflowNodeType) => {
      // Calculate position for new node
      const lastNode = nodes[nodes.length - 1];
      const position = lastNode
        ? { x: lastNode.position.x + 350, y: lastNode.position.y }
        : { x: 100, y: 200 };

      addNode(type, position);
    },
    [nodes, addNode]
  );

  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = applyHorizontalLayout(nodes, edges);
    setNodes(layoutedNodes);
    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }, [nodes, edges, setNodes, fitView]);

  const nodeTypes = Object.keys(NODE_TYPE_CONFIG) as WorkflowNodeType[];

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
      {/* Add Nodes Panel */}
      <div className="flex items-center gap-1 bg-[var(--bg-charcoal)]/95 backdrop-blur rounded-xl p-2 border border-[var(--border-subtle)] shadow-xl">
        <span className="text-xs text-[var(--text-muted)] px-2 font-medium">Add</span>
        <div className="w-px h-6 bg-[var(--border-subtle)]" />
        {nodeTypes.map((type) => {
          const config = NODE_TYPE_CONFIG[type];
          const Icon = config.icon;
          return (
            <motion.button
              key={type}
              onClick={() => handleAddNode(type)}
              className="p-2 rounded-lg transition-all hover:scale-105"
              style={{
                backgroundColor: config.bgColor,
                color: config.color,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={`Add ${config.label}`}
            >
              <Icon className="w-4 h-4" />
            </motion.button>
          );
        })}
      </div>

      {/* Canvas Controls */}
      <div className="flex items-center gap-1 bg-[var(--bg-charcoal)]/95 backdrop-blur rounded-xl p-2 border border-[var(--border-subtle)] shadow-xl">
        {/* Undo/Redo */}
        <motion.button
          onClick={undo}
          disabled={!canUndo()}
          className={`p-2 rounded-lg transition-colors ${
            canUndo()
              ? "hover:bg-white/10 text-[var(--text-secondary)]"
              : "text-[var(--text-muted)] opacity-50 cursor-not-allowed"
          }`}
          whileHover={canUndo() ? { scale: 1.05 } : {}}
          whileTap={canUndo() ? { scale: 0.95 } : {}}
          title="Undo (Cmd+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </motion.button>
        <motion.button
          onClick={redo}
          disabled={!canRedo()}
          className={`p-2 rounded-lg transition-colors ${
            canRedo()
              ? "hover:bg-white/10 text-[var(--text-secondary)]"
              : "text-[var(--text-muted)] opacity-50 cursor-not-allowed"
          }`}
          whileHover={canRedo() ? { scale: 1.05 } : {}}
          whileTap={canRedo() ? { scale: 0.95 } : {}}
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </motion.button>

        <div className="w-px h-6 bg-[var(--border-subtle)] mx-1" />

        {/* Zoom Controls */}
        <motion.button
          onClick={() => zoomOut()}
          className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </motion.button>
        <motion.button
          onClick={() => zoomIn()}
          className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </motion.button>
        <motion.button
          onClick={() => fitView({ padding: 0.2 })}
          className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Fit View"
        >
          <Maximize2 className="w-4 h-4" />
        </motion.button>

        <div className="w-px h-6 bg-[var(--border-subtle)] mx-1" />

        {/* Layout */}
        <motion.button
          onClick={handleAutoLayout}
          className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Auto Layout"
        >
          <LayoutGrid className="w-4 h-4" />
        </motion.button>
      </div>

      {/* File Operations */}
      <div className="flex items-center gap-1 bg-[var(--bg-charcoal)]/95 backdrop-blur rounded-xl p-2 border border-[var(--border-subtle)] shadow-xl">
        {onSave && (
          <motion.button
            onClick={onSave}
            disabled={isSaving || !isDirty}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm transition-colors ${
              isDirty && !isSaving
                ? "bg-[var(--accent-ember)] text-white hover:bg-[var(--accent-ember-soft)]"
                : "bg-[var(--bg-slate)] text-[var(--text-muted)] cursor-not-allowed"
            }`}
            whileHover={isDirty && !isSaving ? { scale: 1.02 } : {}}
            whileTap={isDirty && !isSaving ? { scale: 0.98 } : {}}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save"}
          </motion.button>
        )}
        {onExport && (
          <motion.button
            onClick={onExport}
            className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Export Workflow"
          >
            <Download className="w-4 h-4" />
          </motion.button>
        )}
        {onImport && (
          <motion.button
            onClick={onImport}
            className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Import Workflow"
          >
            <Upload className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
