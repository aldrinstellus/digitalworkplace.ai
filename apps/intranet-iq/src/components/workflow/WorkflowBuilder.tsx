"use client";

import { useState, useCallback, useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkflowCanvasNew } from "./WorkflowCanvasNew";
import { NodeConfigPanel } from "./panels";
import { useWorkflowStore } from "@/lib/workflow/store";
import type { WorkflowNode, WorkflowEdge } from "@/lib/workflow/types";

interface WorkflowBuilderProps {
  workflowId?: string;
  initialNodes?: WorkflowNode[];
  initialEdges?: WorkflowEdge[];
  onSave?: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => Promise<void>;
  readOnly?: boolean;
}

export function WorkflowBuilder({
  workflowId,
  initialNodes = [],
  initialEdges = [],
  onSave,
  readOnly = false,
}: WorkflowBuilderProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Zustand store
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedNodeId,
    selectNode,
    isDirty,
    markClean,
  } = useWorkflowStore();

  // Initialize workflow from props
  useEffect(() => {
    if (initialNodes.length > 0) {
      setNodes(initialNodes);
    }
    if (initialEdges.length > 0) {
      setEdges(initialEdges);
    }
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!onSave || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await onSave(nodes, edges);
      markClean();
    } catch (error) {
      console.error("Failed to save workflow:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, onSave, isSaving, markClean]);

  // Handle node selection from canvas
  const handleNodeSelect = useCallback(
    (nodeId: string | null) => {
      selectNode(nodeId);
    },
    [selectNode]
  );

  // Close panel
  const handleClosePanel = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!onSave || !isDirty || readOnly) return;

    const timeoutId = setTimeout(() => {
      // Auto-save after 5 seconds of no changes
      // Uncomment if auto-save is desired:
      // handleSave();
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, isDirty, onSave, readOnly, handleSave]);

  // Warn on unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <ReactFlowProvider>
      <div className="relative w-full h-full flex">
        {/* Main Canvas */}
        <div
          className={`flex-1 h-full transition-all duration-300 ${
            selectedNodeId ? "mr-[400px]" : ""
          }`}
        >
          <WorkflowCanvasNew
            onSave={onSave ? handleSave : undefined}
            onNodeSelect={handleNodeSelect}
            readOnly={readOnly}
            isSaving={isSaving}
          />
        </div>

        {/* Node Configuration Panel */}
        <NodeConfigPanel
          isOpen={!!selectedNodeId && !readOnly}
          onClose={handleClosePanel}
        />

        {/* Save Error Toast */}
        <AnimatePresence>
          {saveError && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="px-4 py-3 bg-red-500/90 backdrop-blur rounded-xl shadow-xl border border-red-400/30 flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-white text-sm">{saveError}</span>
                <button
                  onClick={() => setSaveError(null)}
                  className="ml-2 text-white/80 hover:text-white"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saving Indicator */}
        <AnimatePresence>
          {isSaving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-4 right-4 z-50"
            >
              <div className="px-3 py-2 bg-[var(--bg-charcoal)]/95 backdrop-blur rounded-lg border border-[var(--border-subtle)] flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[var(--accent-ember)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[var(--text-secondary)]">
                  Saving...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dirty Indicator */}
        {isDirty && !isSaving && onSave && (
          <div className="fixed top-4 right-4 z-40">
            <div className="px-3 py-2 bg-[var(--bg-charcoal)]/95 backdrop-blur rounded-lg border border-yellow-500/30 flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-sm text-yellow-400">Unsaved changes</span>
            </div>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
}

export default WorkflowBuilder;
