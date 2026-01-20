"use client";

import React, { useState, useMemo, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { WorkflowCanvas, type WorkflowNode } from "@/components/workflow/WorkflowCanvas";
import { ExecutionView } from "@/components/workflow/ExecutionView";
import { useWorkflows } from "@/lib/hooks/useSupabase";
import {
  Bot,
  Plus,
  Play,
  Pause,
  Settings,
  MoreVertical,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  FileText,
  Mail,
  Database,
  MessageSquare,
  Users,
  Calendar,
  GitBranch,
  Sparkles,
  Edit,
  Loader2,
  Star,
  TrendingUp,
  Eye,
  Grid,
} from "lucide-react";
import type { Workflow } from "@/lib/database.types";

const workflowTemplates = [
  { name: "Employee Onboarding", icon: Users, category: "HR" },
  { name: "Document Approval", icon: FileText, category: "Operations" },
  { name: "Data Sync", icon: Database, category: "IT" },
  { name: "Report Generation", icon: Calendar, category: "Analytics" },
  { name: "Email Campaign", icon: Mail, category: "Marketing" },
  { name: "Ticket Routing", icon: MessageSquare, category: "Support" },
];

const statusConfig = {
  active: { color: "bg-green-500/20 text-green-400", icon: CheckCircle2, label: "Active" },
  paused: { color: "bg-yellow-500/20 text-yellow-400", icon: Pause, label: "Paused" },
  draft: { color: "bg-gray-500/20 text-gray-400", icon: Edit, label: "Draft" },
  error: { color: "bg-red-500/20 text-red-400", icon: XCircle, label: "Error" },
  archived: { color: "bg-gray-500/20 text-gray-400", icon: XCircle, label: "Archived" },
};

const stepTypeConfig = {
  trigger: { color: "bg-purple-500/20 border-purple-500/30", dotColor: "bg-purple-500" },
  action: { color: "bg-blue-500/20 border-blue-500/30", dotColor: "bg-blue-500" },
  condition: { color: "bg-orange-500/20 border-orange-500/30", dotColor: "bg-orange-500" },
  output: { color: "bg-green-500/20 border-green-500/30", dotColor: "bg-green-500" },
};

const stepTypeIcons: Record<string, typeof Bot> = {
  trigger: Zap,
  action: Play,
  condition: GitBranch,
  output: CheckCircle2,
  llm_call: Sparkles,
  api_call: Database,
  notification: Mail,
};

// Featured agents data
const featuredAgents = [
  { id: "f1", name: "Daily Report Generator", description: "Generates daily summary reports", runs: 1250, icon: FileText },
  { id: "f2", name: "Email Auto-Responder", description: "Intelligent email response drafts", runs: 890, icon: Mail },
  { id: "f3", name: "Data Sync Bot", description: "Syncs data across systems", runs: 2100, icon: Database },
];

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showTemplates, setShowTemplates] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "canvas">("list");
  const [showExecution, setShowExecution] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canvasNodes, setCanvasNodes] = useState<WorkflowNode[]>([]);
  const [executionSteps, setExecutionSteps] = useState<{
    id: string;
    name: string;
    status: "pending" | "running" | "completed" | "error";
    sources?: { id: string; title: string; type: string; url?: string }[];
  }[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const { workflows, loading, error, updateWorkflow, createWorkflow } = useWorkflows();
  const [showEditMode, setShowEditMode] = useState(false);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [workflowList, setWorkflowList] = useState<Workflow[]>([]);

  // Sync workflows from hook to local state
  React.useEffect(() => {
    if (workflows.length > 0 && workflowList.length === 0) {
      setWorkflowList(workflows);
    }
  }, [workflows, workflowList.length]);

  // Use local state for immediate UI updates
  const displayWorkflows = workflowList.length > 0 ? workflowList : workflows;

  const toggleFavorite = (workflowId: string) => {
    setFavorites(prev =>
      prev.includes(workflowId)
        ? prev.filter(id => id !== workflowId)
        : [...prev, workflowId]
    );
  };

  // Toggle workflow status (pause/activate)
  const handleToggleWorkflowStatus = async (workflow: Workflow) => {
    const newStatus = workflow.status === "active" ? "paused" : "active";

    // Optimistic update
    setWorkflowList(prev =>
      prev.map(w => w.id === workflow.id ? { ...w, status: newStatus } : w)
    );
    if (selectedWorkflow?.id === workflow.id) {
      setSelectedWorkflow({ ...workflow, status: newStatus });
    }

    // In production, persist to Supabase
    if (updateWorkflow) {
      await updateWorkflow(workflow.id, { status: newStatus });
    }
  };

  // Enter edit mode for workflow
  const handleEditWorkflow = (workflow: Workflow) => {
    setShowEditMode(true);
    setViewMode("canvas");
    // Convert steps to canvas nodes for editing
    const steps = getWorkflowSteps(workflow);
    const nodes: WorkflowNode[] = steps.map((step, index) => ({
      id: step.id,
      type: step.type as WorkflowNode["type"],
      name: step.name,
      description: step.description,
      position: { x: 50 + index * 300, y: 100 },
      connections: index < steps.length - 1 ? { success: steps[index + 1].id } : {},
    }));
    setCanvasNodes(nodes);
  };

  // Add new step to workflow
  const handleAddStep = () => {
    if (!selectedWorkflow) return;

    const steps = getWorkflowSteps(selectedWorkflow);
    const newStepId = `step-${Date.now()}`;
    const newStep = {
      id: newStepId,
      type: "action",
      name: "New Step",
      description: "Configure this step",
    };

    // Update workflow with new step
    const updatedConfig = {
      ...(selectedWorkflow.trigger_config as object || {}),
      steps: [...steps, newStep],
    };

    const updatedWorkflow = {
      ...selectedWorkflow,
      trigger_config: updatedConfig,
    };

    setSelectedWorkflow(updatedWorkflow);
    setWorkflowList(prev =>
      prev.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w)
    );
    setEditingStep(newStepId);
  };

  // Create workflow from scratch
  const handleCreateFromScratch = async () => {
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      name: "New Workflow",
      description: "Configure your new workflow",
      trigger_type: "manual",
      trigger_config: {
        steps: [
          { id: "1", type: "trigger", name: "Trigger", description: "Start condition" },
          { id: "2", type: "action", name: "Action", description: "Main action" },
          { id: "3", type: "output", name: "Output", description: "Result" },
        ],
      },
      is_template: false,
      template_category: null,
      created_by: "current-user",
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setWorkflowList(prev => [newWorkflow, ...prev]);
    setSelectedWorkflow(newWorkflow);
    setShowTemplates(false);
    setShowEditMode(true);
    setViewMode("canvas");

    // In production, persist to Supabase
    if (createWorkflow) {
      await createWorkflow(newWorkflow);
    }
  };

  // Create workflow from template
  const handleCreateFromTemplate = async (template: typeof workflowTemplates[0]) => {
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      name: template.name,
      description: `${template.name} workflow`,
      trigger_type: "scheduled",
      trigger_config: {
        steps: [
          { id: "1", type: "trigger", name: "Trigger", description: `${template.category} trigger` },
          { id: "2", type: "action", name: template.name, description: `Execute ${template.name}` },
          { id: "3", type: "output", name: "Complete", description: "Workflow complete" },
        ],
      },
      is_template: false,
      template_category: template.category,
      created_by: "current-user",
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setWorkflowList(prev => [newWorkflow, ...prev]);
    setSelectedWorkflow(newWorkflow);
    setShowTemplates(false);
    setShowEditMode(true);

    // In production, persist to Supabase
    if (createWorkflow) {
      await createWorkflow(newWorkflow);
    }
  };

  const runWorkflow = (_workflow: Workflow) => {
    setShowExecution(true);
    setIsRunning(true);
    setExecutionSteps([
      { id: "1", name: "Initializing workflow", status: "running" },
      { id: "2", name: "Fetching data sources", status: "pending" },
      { id: "3", name: "Processing with AI", status: "pending" },
      { id: "4", name: "Generating output", status: "pending" },
    ]);

    // Simulate execution
    let stepIndex = 0;
    const interval = setInterval(() => {
      setExecutionSteps(prev => {
        const updated = [...prev];
        if (stepIndex < updated.length) {
          if (stepIndex > 0) {
            updated[stepIndex - 1].status = "completed";
          }
          updated[stepIndex].status = "running";
          updated[stepIndex].sources = [
            { id: `src-${stepIndex}`, title: "Knowledge Base Article", type: "article" },
            { id: `src-${stepIndex}-2`, title: "Internal Documentation", type: "document" },
          ];
        }
        if (stepIndex === updated.length) {
          updated[stepIndex - 1].status = "completed";
          setIsRunning(false);
          clearInterval(interval);
        }
        stepIndex++;
        return updated;
      });
    }, 2000);
  };

  const filteredWorkflows = useMemo(() => {
    return displayWorkflows.filter((workflow) => {
      const matchesSearch =
        workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (workflow.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus = filterStatus === "all" || workflow.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [displayWorkflows, searchQuery, filterStatus]);

  // Auto-select first workflow when loaded (only on initial load)
  const hasInitializedRef = useRef(false);
  if (workflows.length > 0 && !selectedWorkflow && !hasInitializedRef.current) {
    hasInitializedRef.current = true;
    setSelectedWorkflow(workflows[0]);
  }

  // Parse steps from workflow trigger_config or use default structure
  const getWorkflowSteps = (workflow: Workflow) => {
    // Check if trigger_config has steps defined
    const triggerConfig = workflow.trigger_config as { steps?: Array<{ id: string; type: string; name: string; description: string }> } | null;
    if (triggerConfig?.steps) {
      return triggerConfig.steps;
    }

    // Default steps based on workflow type
    return [
      { id: "1", type: "trigger", name: "Trigger", description: workflow.trigger_type || "Workflow trigger condition" },
      { id: "2", type: "action", name: "Process", description: "Main workflow action" },
      { id: "3", type: "output", name: "Complete", description: "Workflow completion" },
    ];
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />

      <main className="ml-16 h-screen flex">
        {/* Left Panel - Workflow List */}
        <div className="w-96 border-r border-white/10 flex flex-col">
          {/* Featured Agents */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white/70">Featured Agents</span>
            </div>
            <div className="space-y-2">
              {featuredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 flex items-center justify-center">
                    <agent.icon className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{agent.name}</div>
                    <div className="text-xs text-white/40">{agent.runs.toLocaleString()} runs</div>
                  </div>
                  <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-yellow-400 transition-colors">
                    <Star className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400" />
                Workflows
              </h2>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center rounded-lg bg-white/5 border border-white/10 p-0.5">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "list" ? "bg-blue-500/20 text-blue-400" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("canvas")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "canvas" ? "bg-blue-500/20 text-blue-400" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setShowTemplates(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workflows..."
                className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1">
              {["all", "active", "paused", "draft"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterStatus === status
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Workflow List */}
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : filteredWorkflows.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/40">No workflows found</p>
              </div>
            ) : (
              filteredWorkflows.map((workflow) => {
                const status = statusConfig[workflow.status as keyof typeof statusConfig] || statusConfig.draft;
                const StatusIcon = status.icon;
                return (
                  <div
                    key={workflow.id}
                    onClick={() => setSelectedWorkflow(workflow)}
                    className={`p-4 rounded-xl cursor-pointer transition-all mb-2 ${
                      selectedWorkflow?.id === workflow.id
                        ? "bg-blue-500/10 border border-blue-500/30"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium text-sm">
                            {workflow.name}
                          </h3>
                          {workflow.template_category && (
                            <span className="text-xs text-white/40">
                              {workflow.template_category}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(workflow.id);
                          }}
                          className={`p-1 rounded transition-colors ${
                            favorites.includes(workflow.id)
                              ? "text-yellow-400"
                              : "text-white/30 hover:text-yellow-400"
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${favorites.includes(workflow.id) ? "fill-yellow-400" : ""}`} />
                        </button>
                        <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                    </div>
                    {workflow.description && (
                      <p className="text-xs text-white/50 line-clamp-2 mb-2">
                        {workflow.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(workflow.updated_at).toLocaleDateString()}
                      </span>
                      {workflow.is_template && (
                        <span className="text-purple-400">Template</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Workflow Detail */}
        <div className="flex-1 flex flex-col">
          {selectedWorkflow ? (
            <>
              {/* Workflow Header */}
              <div className="border-b border-white/10 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-medium text-white mb-1">
                        {selectedWorkflow.name}
                      </h1>
                      <p className="text-sm text-white/50">
                        Created{" "}
                        {new Date(selectedWorkflow.created_at).toLocaleDateString()}
                        {selectedWorkflow.trigger_type && ` • Trigger: ${selectedWorkflow.trigger_type}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runWorkflow(selectedWorkflow)}
                      className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Run Now
                    </button>
                    {selectedWorkflow.status === "active" ? (
                      <button
                        onClick={() => handleToggleWorkflowStatus(selectedWorkflow)}
                        className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white flex items-center gap-2 transition-colors"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleWorkflowStatus(selectedWorkflow)}
                        className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white flex items-center gap-2 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleEditWorkflow(selectedWorkflow)}
                      className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-white/50">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {selectedWorkflow.description && (
                  <p className="mt-4 text-sm text-white/60">{selectedWorkflow.description}</p>
                )}

                {/* Stats */}
                <div className="flex gap-6 mt-6">
                  <div className="bg-[#0f0f14] border border-white/10 rounded-xl px-4 py-3">
                    <div className="text-2xl font-medium text-white">
                      {getWorkflowSteps(selectedWorkflow).length}
                    </div>
                    <div className="text-xs text-white/50">Steps</div>
                  </div>
                  <div className="bg-[#0f0f14] border border-white/10 rounded-xl px-4 py-3">
                    <div className="text-2xl font-medium text-white capitalize">
                      {selectedWorkflow.status}
                    </div>
                    <div className="text-xs text-white/50">Status</div>
                  </div>
                  {selectedWorkflow.is_template && (
                    <div className="bg-[#0f0f14] border border-white/10 rounded-xl px-4 py-3">
                      <div className="text-2xl font-medium text-purple-400">
                        Yes
                      </div>
                      <div className="text-xs text-white/50">Template</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Workflow Content - Show execution, canvas, or steps based on state */}
              <div className="flex-1 overflow-y-auto p-6">
                {showExecution ? (
                  /* Execution View */
                  <ExecutionView
                    workflowName={selectedWorkflow.name}
                    steps={executionSteps}
                    isRunning={isRunning}
                    onCancel={() => {
                      setIsRunning(false);
                      setShowExecution(false);
                    }}
                  />
                ) : viewMode === "canvas" ? (
                  /* Canvas View */
                  <div>
                    <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider mb-4">
                      Visual Workflow Builder
                    </h3>
                    <WorkflowCanvas
                      nodes={canvasNodes.length > 0 ? canvasNodes : [
                        { id: "1", type: "trigger", name: "Trigger", description: "Start workflow", position: { x: 50, y: 100 }, connections: { success: "2" } },
                        { id: "2", type: "search", name: "Search KB", description: "Search knowledge base", position: { x: 350, y: 100 }, connections: { success: "3" } },
                        { id: "3", type: "think", name: "AI Analysis", description: "Process with AI", position: { x: 650, y: 100 }, connections: { success: "4" } },
                        { id: "4", type: "output", name: "Output", description: "Return result", position: { x: 950, y: 100 }, connections: {} },
                      ]}
                      onNodesChange={setCanvasNodes}
                    />
                  </div>
                ) : (
                  /* List View */
                  <>
                    <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider mb-4">
                      Workflow Steps
                    </h3>
                    <div className="space-y-4">
                      {getWorkflowSteps(selectedWorkflow).map((step, index) => {
                        const config = stepTypeConfig[step.type as keyof typeof stepTypeConfig] || stepTypeConfig.action;
                        const StepIcon = stepTypeIcons[step.type] || Bot;
                        return (
                          <div key={step.id} className="flex items-start gap-4">
                            {/* Step Number & Connector */}
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full ${config.dotColor} flex items-center justify-center text-white text-sm font-medium`}>
                                {index + 1}
                              </div>
                              {index < getWorkflowSteps(selectedWorkflow).length - 1 && (
                                <div className="w-px h-12 bg-white/20 my-2" />
                              )}
                            </div>

                            {/* Step Card */}
                            <div className={`flex-1 border rounded-xl p-4 ${config.color}`}>
                              <div className="flex items-center gap-3 mb-2">
                                <StepIcon className="w-5 h-5" />
                                <div>
                                  <h4 className="text-white font-medium">{step.name}</h4>
                                  <span className="text-xs text-white/40 capitalize">
                                    {step.type}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-white/60">{step.description}</p>
                            </div>

                            {/* Actions */}
                            <button className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/70 transition-colors">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Step Button */}
                    <button
                      onClick={handleAddStep}
                      className="mt-6 w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-white/40 hover:text-white/70 hover:border-white/20 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Step
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Bot className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/50 mb-2">
                  Select a workflow
                </h3>
                <p className="text-sm text-white/30">
                  Choose a workflow to view details and configuration
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-[600px] max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-white">
                    Create New Workflow
                  </h2>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/50"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <button
                    onClick={handleCreateFromScratch}
                    className="w-full p-4 border-2 border-dashed border-blue-500/30 rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Start from Scratch</h4>
                        <p className="text-sm text-white/50">Build a custom workflow using the visual builder</p>
                      </div>
                    </div>
                  </button>
                </div>

                <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
                  Or start with a template
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {workflowTemplates.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => handleCreateFromTemplate(template)}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <template.icon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-white/40">{template.category}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
