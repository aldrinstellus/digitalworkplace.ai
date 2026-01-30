"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Trash2,
  Copy,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Shield,
} from "lucide-react";
import type { WorkflowNode, WorkflowNodeData, ErrorHandlingConfig } from "@/lib/workflow/types";
import {
  NODE_TYPE_CONFIG,
  TRIGGER_SUBTYPES,
  SEARCH_SUBTYPES,
  ACTION_SUBTYPES,
  CONDITION_OPERATORS,
  LLM_MODELS,
} from "@/lib/workflow/constants";
import { useWorkflowStore, selectSelectedNode } from "@/lib/workflow/store";
import { validateNodeConfig } from "@/lib/workflow/validation";

interface NodeConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Default error handling config
const defaultErrorHandling: ErrorHandlingConfig = {
  retry: {
    enabled: false,
    maxAttempts: 3,
    delaySeconds: 5,
    backoffMultiplier: 1,
  },
  fallback: {
    onFailure: 'stop',
    notifyOnFailure: false,
    logLevel: 'error',
  },
};

export function NodeConfigPanel({ isOpen, onClose }: NodeConfigPanelProps) {
  const selectedNode = useWorkflowStore(selectSelectedNode);
  const { updateNode, deleteNode, saveToHistory, updateNodeErrorHandling, nodes } = useWorkflowStore();

  // Local form state
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [errorHandling, setErrorHandling] = useState<ErrorHandlingConfig>(defaultErrorHandling);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    config: true,
    errorHandling: false,
    advanced: false,
  });

  // Sync local state with selected node
  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label);
      setDescription(selectedNode.data.description || "");
      setConfig((selectedNode.data.config || {}) as Record<string, unknown>);
      setErrorHandling(selectedNode.data.errorHandling || defaultErrorHandling);
    }
  }, [selectedNode]);

  // Validation
  const validation = selectedNode
    ? validateNodeConfig(selectedNode)
    : { isValid: true, errors: [], warnings: [] };

  // Handle save
  const handleSave = useCallback(() => {
    if (!selectedNode) return;

    saveToHistory();
    updateNode(selectedNode.id, {
      label,
      description,
      config,
      errorHandling,
      isConfigured: validation.isValid,
    });
  }, [selectedNode, label, description, config, errorHandling, validation.isValid, updateNode, saveToHistory]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (!selectedNode) return;
    deleteNode(selectedNode.id);
    onClose();
  }, [selectedNode, deleteNode, onClose]);

  // Update config field
  const updateConfigField = (path: string, value: unknown) => {
    const newConfig = { ...config };
    const keys = path.split(".");
    let current: Record<string, unknown> = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!selectedNode) return null;

  const nodeTypeConfig = NODE_TYPE_CONFIG[selectedNode.data.type];
  const Icon = nodeTypeConfig.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[420px] bg-[var(--bg-charcoal)] border-l border-[var(--border-subtle)] z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: nodeTypeConfig.bgColor,
                      border: `1px solid ${nodeTypeConfig.borderColor}`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: nodeTypeConfig.color }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-[var(--text-primary)]">
                      Configure Node
                    </h2>
                    <span
                      className="text-xs font-medium uppercase"
                      style={{ color: nodeTypeConfig.color }}
                    >
                      {nodeTypeConfig.label}
                    </span>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Validation Status */}
              {!validation.isValid && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    {validation.errors.map((error, i) => (
                      <p key={i} className="text-xs text-red-400">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {validation.isValid && validation.warnings.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    {validation.warnings.map((warning, i) => (
                      <p key={i} className="text-xs text-yellow-400">
                        {warning}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Basic Info Section */}
              <ConfigSection
                title="Basic Information"
                expanded={expandedSections.basic}
                onToggle={() => toggleSection("basic")}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Label
                    </label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-ember)]/50 focus:outline-none transition-colors"
                      placeholder="Enter node label"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-ember)]/50 focus:outline-none transition-colors resize-none"
                      placeholder="Describe what this node does"
                    />
                  </div>
                </div>
              </ConfigSection>

              {/* Type-specific Configuration */}
              <ConfigSection
                title="Configuration"
                expanded={expandedSections.config}
                onToggle={() => toggleSection("config")}
              >
                {renderTypeConfig(selectedNode.data.type, config, updateConfigField)}
              </ConfigSection>

              {/* Error Handling Section */}
              <ConfigSection
                title="Error Handling"
                expanded={expandedSections.errorHandling}
                onToggle={() => toggleSection("errorHandling")}
                icon={<Shield className="w-4 h-4 text-[var(--accent-ember)]" />}
                badge={errorHandling.retry.enabled ? "Retry" : undefined}
              >
                <div className="space-y-4">
                  {/* Retry Configuration */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry on Failure
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setErrorHandling((prev) => ({
                            ...prev,
                            retry: { ...prev.retry, enabled: !prev.retry.enabled },
                          }))
                        }
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          errorHandling.retry.enabled
                            ? "bg-[var(--accent-ember)]"
                            : "bg-[var(--bg-obsidian)]"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                            errorHandling.retry.enabled ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {errorHandling.retry.enabled && (
                      <div className="space-y-3 pl-5 border-l-2 border-[var(--accent-ember)]/30">
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">
                            Max Attempts (1-5)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={errorHandling.retry.maxAttempts}
                            onChange={(e) =>
                              setErrorHandling((prev) => ({
                                ...prev,
                                retry: {
                                  ...prev.retry,
                                  maxAttempts: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)),
                                },
                              }))
                            }
                            className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">
                            Delay Between Retries (seconds)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={300}
                            value={errorHandling.retry.delaySeconds}
                            onChange={(e) =>
                              setErrorHandling((prev) => ({
                                ...prev,
                                retry: {
                                  ...prev.retry,
                                  delaySeconds: Math.min(300, Math.max(0, parseInt(e.target.value) || 0)),
                                },
                              }))
                            }
                            className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fallback Configuration */}
                  <div className="pt-2 border-t border-[var(--border-subtle)]">
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                      On Failure Action
                    </label>
                    <select
                      value={errorHandling.fallback.onFailure}
                      onChange={(e) =>
                        setErrorHandling((prev) => ({
                          ...prev,
                          fallback: {
                            ...prev.fallback,
                            onFailure: e.target.value as "stop" | "skip" | "fallback",
                          },
                        }))
                      }
                      className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
                    >
                      <option value="stop">Stop Workflow</option>
                      <option value="skip">Skip Step & Continue</option>
                      <option value="fallback">Run Fallback Node</option>
                    </select>

                    {errorHandling.fallback.onFailure === "fallback" && (
                      <div className="mt-3">
                        <label className="block text-xs text-[var(--text-muted)] mb-1">
                          Fallback Node
                        </label>
                        <select
                          value={errorHandling.fallback.fallbackNodeId || ""}
                          onChange={(e) =>
                            setErrorHandling((prev) => ({
                              ...prev,
                              fallback: {
                                ...prev.fallback,
                                fallbackNodeId: e.target.value || undefined,
                              },
                            }))
                          }
                          className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
                        >
                          <option value="">Select a node...</option>
                          {nodes
                            .filter((n) => n.id !== selectedNode.id)
                            .map((node) => (
                              <option key={node.id} value={node.id}>
                                {node.data.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* Notify on Failure */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
                      <label className="text-xs text-[var(--text-muted)]">
                        Notify on failure
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setErrorHandling((prev) => ({
                            ...prev,
                            fallback: {
                              ...prev.fallback,
                              notifyOnFailure: !prev.fallback.notifyOnFailure,
                            },
                          }))
                        }
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          errorHandling.fallback.notifyOnFailure
                            ? "bg-[var(--accent-ember)]"
                            : "bg-[var(--bg-obsidian)]"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                            errorHandling.fallback.notifyOnFailure ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </ConfigSection>

              {/* Advanced Section */}
              <ConfigSection
                title="Advanced"
                expanded={expandedSections.advanced}
                onToggle={() => toggleSection("advanced")}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Node ID
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={selectedNode.id}
                        readOnly
                        className="flex-1 px-3 py-2 bg-[var(--bg-obsidian)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-muted)] font-mono"
                      />
                      <motion.button
                        onClick={() => navigator.clipboard.writeText(selectedNode.id)}
                        className="p-2 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Copy className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Position: ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
                  </div>
                </div>
              </ConfigSection>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <motion.button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2 hover:bg-red-500/20 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </motion.button>
              <motion.button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] text-white text-sm flex items-center gap-2 hover:bg-[var(--accent-ember-soft)] transition-colors shadow-lg shadow-[var(--accent-ember)]/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Config Section Component
function ConfigSection({
  title,
  expanded,
  onToggle,
  children,
  icon,
  badge,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-[var(--bg-slate)]/50 hover:bg-[var(--bg-slate)] transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-[var(--text-secondary)]">{title}</span>
          {badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]">
              {badge}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Type-specific configuration renderer
function renderTypeConfig(
  type: WorkflowNode["data"]["type"],
  config: Record<string, unknown>,
  updateConfig: (path: string, value: unknown) => void
) {
  switch (type) {
    case "trigger":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Trigger Type
            </label>
            <select
              value={(config.triggerType as string) || "manual"}
              onChange={(e) => updateConfig("triggerType", e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
            >
              {TRIGGER_SUBTYPES.map((subtype) => (
                <option key={subtype.value} value={subtype.value}>
                  {subtype.label}
                </option>
              ))}
            </select>
          </div>
          {config.triggerType === "scheduled" && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Cron Expression
              </label>
              <input
                type="text"
                value={((config.schedule as Record<string, unknown>)?.cron as string) || ""}
                onChange={(e) => updateConfig("schedule.cron", e.target.value)}
                placeholder="0 0 * * *"
                className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] font-mono placeholder-[var(--text-muted)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
              />
            </div>
          )}
          {config.triggerType === "webhook" && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Webhook Path
              </label>
              <input
                type="text"
                value={((config.webhook as Record<string, unknown>)?.path as string) || ""}
                onChange={(e) => updateConfig("webhook.path", e.target.value)}
                placeholder="/api/webhook/my-workflow"
                className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] font-mono placeholder-[var(--text-muted)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
              />
            </div>
          )}
        </div>
      );

    case "search":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Search Type
            </label>
            <select
              value={(config.searchType as string) || "knowledge_base"}
              onChange={(e) => updateConfig("searchType", e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
            >
              {SEARCH_SUBTYPES.map((subtype) => (
                <option key={subtype.value} value={subtype.value}>
                  {subtype.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Query Template
            </label>
            <textarea
              value={(config.queryTemplate as string) || ""}
              onChange={(e) => updateConfig("queryTemplate", e.target.value)}
              rows={3}
              placeholder="Enter search query or use {{input}} for dynamic values"
              className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-ember)]/50 focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Max Results
            </label>
            <input
              type="number"
              value={(config.maxResults as number) || 10}
              onChange={(e) => updateConfig("maxResults", parseInt(e.target.value))}
              min={1}
              max={100}
              className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
            />
          </div>
        </div>
      );

    case "action":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Action Type
            </label>
            <select
              value={(config.actionType as string) || "llm_call"}
              onChange={(e) => updateConfig("actionType", e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
            >
              {ACTION_SUBTYPES.map((subtype) => (
                <option key={subtype.value} value={subtype.value}>
                  {subtype.label}
                </option>
              ))}
            </select>
          </div>
          {config.actionType === "llm_call" && (
            <>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Model
                </label>
                <select
                  value={((config.llm as Record<string, unknown>)?.model as string) || "claude-3-sonnet"}
                  onChange={(e) => updateConfig("llm.model", e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
                >
                  {LLM_MODELS.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Prompt
                </label>
                <textarea
                  value={((config.llm as Record<string, unknown>)?.prompt as string) || ""}
                  onChange={(e) => updateConfig("llm.prompt", e.target.value)}
                  rows={5}
                  placeholder="Enter your prompt. Use {{input}} for previous step output."
                  className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-ember)]/50 focus:outline-none resize-none"
                />
              </div>
            </>
          )}
          {config.actionType === "api_call" && (
            <>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  URL
                </label>
                <input
                  type="url"
                  value={((config.api as Record<string, unknown>)?.url as string) || ""}
                  onChange={(e) => updateConfig("api.url", e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] font-mono placeholder-[var(--text-muted)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Method
                </label>
                <select
                  value={((config.api as Record<string, unknown>)?.method as string) || "GET"}
                  onChange={(e) => updateConfig("api.method", e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
            </>
          )}
        </div>
      );

    case "condition":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Field to Check
            </label>
            <input
              type="text"
              value={((config.simple as Record<string, unknown>)?.field as string) || ""}
              onChange={(e) => updateConfig("simple.field", e.target.value)}
              placeholder="e.g., output.status, data.count"
              className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] font-mono placeholder-[var(--text-muted)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Operator
            </label>
            <select
              value={((config.simple as Record<string, unknown>)?.operator as string) || "equals"}
              onChange={(e) => updateConfig("simple.operator", e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
            >
              {CONDITION_OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Value
            </label>
            <input
              type="text"
              value={((config.simple as Record<string, unknown>)?.value as string) || ""}
              onChange={(e) => updateConfig("simple.value", e.target.value)}
              placeholder="Value to compare against"
              className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
            />
          </div>
        </div>
      );

    case "transform":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Transform Type
            </label>
            <select
              value={(config.transformType as string) || "map"}
              onChange={(e) => updateConfig("transformType", e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
            >
              <option value="map">Map Fields</option>
              <option value="filter">Filter</option>
              <option value="aggregate">Aggregate</option>
              <option value="merge">Merge</option>
              <option value="custom">Custom Code</option>
            </select>
          </div>
          {config.transformType === "custom" && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Transform Code
              </label>
              <textarea
                value={((config.custom as Record<string, unknown>)?.code as string) || ""}
                onChange={(e) => updateConfig("custom.code", e.target.value)}
                rows={5}
                placeholder="// JavaScript code to transform data&#10;return input.map(item => ({&#10;  ...item,&#10;  processed: true&#10;}));"
                className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] font-mono placeholder-[var(--text-muted)] focus:border-[var(--accent-ember)]/50 focus:outline-none resize-none"
              />
            </div>
          )}
        </div>
      );

    case "output":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Output Type
            </label>
            <select
              value={(config.outputType as string) || "return"}
              onChange={(e) => updateConfig("outputType", e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
            >
              <option value="return">Return Result</option>
              <option value="store">Store in Database</option>
              <option value="webhook">Send to Webhook</option>
              <option value="log">Log Only</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Output Format
            </label>
            <select
              value={(config.format as string) || "json"}
              onChange={(e) => updateConfig("format", e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-ember)]/50 focus:outline-none"
            >
              <option value="json">JSON</option>
              <option value="text">Plain Text</option>
              <option value="markdown">Markdown</option>
              <option value="html">HTML</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Output Template (optional)
            </label>
            <textarea
              value={(config.template as string) || ""}
              onChange={(e) => updateConfig("template", e.target.value)}
              rows={4}
              placeholder="Template for formatting output. Use {{result}} for workflow result."
              className="w-full px-3 py-2 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-ember)]/50 focus:outline-none resize-none"
            />
          </div>
        </div>
      );

    default:
      return (
        <p className="text-sm text-[var(--text-muted)]">
          No configuration options available for this node type.
        </p>
      );
  }
}
