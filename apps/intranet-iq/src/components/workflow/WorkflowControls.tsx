"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlignVerticalJustifyCenter,
  Save,
  Plus,
  Loader2,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useWorkflowStore } from "@/lib/workflow/store";
import { applyVerticalLayout } from "@/lib/workflow/autoLayout";

interface WorkflowControlsProps {
  onSave?: () => void;
  onTogglePalette?: () => void;
  isSaving?: boolean;
  isPaletteOpen?: boolean;
}

export function WorkflowControls({
  onSave,
  onTogglePalette,
  isSaving,
  isPaletteOpen,
}: WorkflowControlsProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const {
    nodes,
    edges,
    setNodes,
    undo,
    redo,
    canUndo,
    canRedo,
    isDirty,
  } = useWorkflowStore();

  const handleAutoLayout = useCallback(() => {
    // Use vertical (top-to-bottom) layout as default
    const layoutedNodes = applyVerticalLayout(nodes, edges);
    setNodes(layoutedNodes);
    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }, [nodes, edges, setNodes, fitView]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
    >
      <div className="flex items-center gap-1 bg-[var(--bg-charcoal)]/95 backdrop-blur-xl
                      rounded-full px-2 py-1.5 border border-[var(--border-subtle)] shadow-xl">
        {/* Add Node Button */}
        <motion.button
          onClick={onTogglePalette}
          className={`p-2 rounded-full transition-all ${
            isPaletteOpen
              ? "bg-[var(--accent-ember)] text-white"
              : "hover:bg-white/10 text-[var(--text-secondary)]"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Add Component"
        >
          <Plus className={`w-4 h-4 transition-transform ${isPaletteOpen ? "rotate-45" : ""}`} />
        </motion.button>

        <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />

        {/* Undo/Redo */}
        <motion.button
          onClick={undo}
          disabled={!canUndo()}
          className={`p-2 rounded-full transition-colors ${
            canUndo()
              ? "hover:bg-white/10 text-[var(--text-secondary)]"
              : "text-[var(--text-muted)] opacity-40 cursor-not-allowed"
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
          className={`p-2 rounded-full transition-colors ${
            canRedo()
              ? "hover:bg-white/10 text-[var(--text-secondary)]"
              : "text-[var(--text-muted)] opacity-40 cursor-not-allowed"
          }`}
          whileHover={canRedo() ? { scale: 1.05 } : {}}
          whileTap={canRedo() ? { scale: 0.95 } : {}}
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </motion.button>

        <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />

        {/* Zoom Controls */}
        <motion.button
          onClick={() => zoomOut()}
          className="p-2 rounded-full hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </motion.button>
        <motion.button
          onClick={() => zoomIn()}
          className="p-2 rounded-full hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </motion.button>
        <motion.button
          onClick={() => fitView({ padding: 0.2 })}
          className="p-2 rounded-full hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Fit View"
        >
          <Maximize2 className="w-4 h-4" />
        </motion.button>

        <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />

        {/* Auto Layout */}
        <motion.button
          onClick={handleAutoLayout}
          className="p-2 rounded-full hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Auto Layout (Vertical)"
        >
          <AlignVerticalJustifyCenter className="w-4 h-4" />
        </motion.button>

        {/* Save Button */}
        {onSave && (
          <>
            <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />
            <motion.button
              onClick={onSave}
              disabled={isSaving || !isDirty}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all ${
                isDirty && !isSaving
                  ? "bg-[var(--accent-ember)] text-white hover:bg-[var(--accent-ember-soft)]"
                  : "bg-[var(--bg-slate)] text-[var(--text-muted)] cursor-not-allowed"
              }`}
              whileHover={isDirty && !isSaving ? { scale: 1.02 } : {}}
              whileTap={isDirty && !isSaving ? { scale: 0.98 } : {}}
              title={isDirty ? "Save Changes" : "No changes to save"}
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {isSaving ? "Saving" : "Save"}
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}
