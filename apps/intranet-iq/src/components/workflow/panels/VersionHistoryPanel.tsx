"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  RotateCcw,
  Clock,
  Eye,
  ChevronRight,
  Save,
  X,
} from "lucide-react";
import { useWorkflowStore } from "@/lib/workflow/store";
import type { WorkflowVersion } from "@/lib/workflow/types";

interface VersionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VersionHistoryPanel({ isOpen, onClose }: VersionHistoryPanelProps) {
  const {
    versions,
    selectedVersionId,
    selectVersion,
    restoreVersion,
    nodes,
    edges,
  } = useWorkflowStore();

  // Sort versions by newest first
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const handleRestore = (version: WorkflowVersion) => {
    if (confirm(`Restore to "${version.description}"? This will save your current work as a new version first.`)) {
      restoreVersion(version.id);
    }
  };

  const handlePreview = (versionId: string) => {
    selectVersion(selectedVersionId === versionId ? null : versionId);
  };

  // Get the selected version for preview
  const previewVersion = versions.find((v) => v.id === selectedVersionId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="border-l border-[var(--border-subtle)] bg-[var(--bg-charcoal)] w-72 flex flex-col h-full"
        >
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-ember)]/20 flex items-center justify-center">
                  <History className="w-4 h-4 text-[var(--accent-ember)]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    Version History
                  </h3>
                  <span className="text-xs text-[var(--text-muted)]">
                    {versions.length} version{versions.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Current State */}
          <div className="p-3 border-b border-[var(--border-subtle)]">
            <div className="p-3 rounded-lg bg-[var(--accent-ember)]/10 border border-[var(--accent-ember)]/30">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[var(--accent-ember)] animate-pulse" />
                <span className="text-xs font-medium text-[var(--accent-ember)]">
                  Current
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {nodes.length} nodes, {edges.length} edges
              </p>
            </div>
          </div>

          {/* Version List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sortedVersions.length === 0 ? (
              <div className="text-center py-8">
                <Save className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                <p className="text-sm text-[var(--text-muted)]">No versions yet</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Versions are created when you save
                </p>
              </div>
            ) : (
              sortedVersions.map((version) => (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedVersionId === version.id
                      ? "bg-[var(--accent-ember)]/10 border-[var(--accent-ember)]/30"
                      : "bg-[var(--bg-slate)]/50 border-[var(--border-subtle)] hover:bg-[var(--bg-slate)]"
                  }`}
                  onClick={() => handlePreview(version.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        v{version.versionNumber}
                      </span>
                      {version.isAutoSave && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-[var(--bg-obsidian)] text-[var(--text-muted)]">
                          Auto
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Clock className="w-3 h-3" />
                      {formatDate(version.createdAt)}
                    </div>
                  </div>

                  {version.description && (
                    <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-2">
                      {version.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">
                      {version.nodes.length} nodes
                    </span>
                    <div className="flex items-center gap-1">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(version.id);
                        }}
                        className={`p-1.5 rounded transition-colors ${
                          selectedVersionId === version.id
                            ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                            : "hover:bg-[var(--bg-obsidian)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(version);
                        }}
                        className="p-1.5 rounded hover:bg-[var(--success)]/20 text-[var(--text-muted)] hover:text-[var(--success)] transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Restore"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Preview Footer */}
          <AnimatePresence>
            {previewVersion && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-obsidian)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--text-muted)]">
                    Previewing v{previewVersion.versionNumber}
                  </span>
                  <motion.button
                    onClick={() => selectVersion(null)}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    whileHover={{ scale: 1.05 }}
                  >
                    Close preview
                  </motion.button>
                </div>
                <motion.button
                  onClick={() => handleRestore(previewVersion)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--accent-ember)] text-white text-sm flex items-center justify-center gap-2 hover:bg-[var(--accent-ember-soft)] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore This Version
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
