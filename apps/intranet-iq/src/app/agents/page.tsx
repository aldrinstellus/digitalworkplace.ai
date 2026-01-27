"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { FadeIn, StaggerContainer, StaggerItem } from "@/lib/motion";
import { WorkflowCanvas, type WorkflowNode as LegacyWorkflowNode } from "@/components/workflow/WorkflowCanvas";
import { WorkflowBuilder } from "@/components/workflow";
import { ExecutionView } from "@/components/workflow/ExecutionView";
import { useWorkflows } from "@/lib/hooks/useSupabase";
import { workflowToReactFlow, reactFlowToDatabase, convertLegacyWorkflow } from "@/lib/workflow/serialization";
import type { WorkflowNode, WorkflowEdge, WorkflowResponse } from "@/lib/workflow/types";
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
  active: { color: "bg-[var(--success)]/20 text-[var(--success)]", icon: CheckCircle2, label: "Active" },
  paused: { color: "bg-[var(--warning)]/20 text-[var(--warning)]", icon: Pause, label: "Paused" },
  draft: { color: "bg-[var(--text-muted)]/20 text-[var(--text-muted)]", icon: Edit, label: "Draft" },
  error: { color: "bg-[var(--error)]/20 text-[var(--error)]", icon: XCircle, label: "Error" },
  archived: { color: "bg-[var(--text-muted)]/20 text-[var(--text-muted)]", icon: XCircle, label: "Archived" },
};

const stepTypeConfig = {
  trigger: { color: "bg-[var(--accent-ember)]/20 border-[var(--accent-ember)]/30", dotColor: "bg-[var(--accent-ember)]" },
  action: { color: "bg-[var(--accent-copper)]/20 border-[var(--accent-copper)]/30", dotColor: "bg-[var(--accent-copper)]" },
  condition: { color: "bg-[var(--accent-gold)]/20 border-[var(--accent-gold)]/30", dotColor: "bg-[var(--accent-gold)]" },
  output: { color: "bg-[var(--success)]/20 border-[var(--success)]/30", dotColor: "bg-[var(--success)]" },
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
  const [canvasNodes, setCanvasNodes] = useState<LegacyWorkflowNode[]>([]);
  const [reactFlowNodes, setReactFlowNodes] = useState<WorkflowNode[]>([]);
  const [reactFlowEdges, setReactFlowEdges] = useState<WorkflowEdge[]>([]);
  const [useNewBuilder, setUseNewBuilder] = useState(true); // Toggle between old and new builder
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

    if (useNewBuilder) {
      // Check if workflow has steps array from database (WorkflowResponse format)
      const workflowWithSteps = workflow as unknown as WorkflowResponse;

      if (workflowWithSteps.steps && Array.isArray(workflowWithSteps.steps) && workflowWithSteps.steps.length > 0) {
        // Database format: use workflowToReactFlow
        const { nodes, edges } = workflowToReactFlow(workflowWithSteps);
        setReactFlowNodes(nodes);
        setReactFlowEdges(edges);
      } else {
        // Legacy format: use convertLegacyWorkflow (handles trigger_config.steps)
        const { nodes, edges } = convertLegacyWorkflow(workflow, { layout: 'vertical' });
        setReactFlowNodes(nodes);
        setReactFlowEdges(edges);
      }
    } else {
      // Convert steps to canvas nodes for legacy editing
      const steps = getWorkflowSteps(workflow);
      const nodes: LegacyWorkflowNode[] = steps.map((step, index) => ({
        id: step.id,
        type: step.type as LegacyWorkflowNode["type"],
        name: step.name,
        description: step.description,
        position: { x: 50 + index * 300, y: 100 },
        connections: index < steps.length - 1 ? { success: steps[index + 1].id } : {},
      }));
      setCanvasNodes(nodes);
    }
  };

  // Save workflow from new ReactFlow builder
  const handleSaveWorkflow = useCallback(async (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
    if (!selectedWorkflow) return;

    try {
      // Convert ReactFlow format back to database format
      const { steps, edges: dbEdges } = reactFlowToDatabase(
        nodes,
        edges,
        selectedWorkflow.id
      );

      // Update workflow via API
      const response = await fetch('/diq/api/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedWorkflow.id,
          steps,
          edges: dbEdges,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to save workflow (${response.status})`;
        throw new Error(errorMessage);
      }

      const updatedWorkflow = await response.json();

      // Update local state
      setWorkflowList(prev =>
        prev.map(w => w.id === selectedWorkflow.id ? { ...w, ...updatedWorkflow } : w)
      );
      setSelectedWorkflow({ ...selectedWorkflow, ...updatedWorkflow });

      console.log('Workflow saved successfully');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      throw error;
    }
  }, [selectedWorkflow]);

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

    // Convert workflow steps to ReactFlow nodes/edges (vertical layout)
    const { nodes, edges } = convertLegacyWorkflow(newWorkflow, { layout: 'vertical' });
    setReactFlowNodes(nodes);
    setReactFlowEdges(edges);

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
    // Build template-specific steps based on template type
    const templateSteps = getTemplateSteps(template);

    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      name: template.name,
      description: `${template.name} workflow`,
      trigger_type: "scheduled",
      trigger_config: {
        steps: templateSteps,
      },
      is_template: false,
      template_category: template.category,
      created_by: "current-user",
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Convert workflow steps to ReactFlow nodes/edges (vertical layout)
    const { nodes, edges } = convertLegacyWorkflow(newWorkflow, { layout: 'vertical' });
    setReactFlowNodes(nodes);
    setReactFlowEdges(edges);

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

  // Get template-specific steps for rich workflow templates
  const getTemplateSteps = (template: typeof workflowTemplates[0]) => {
    const templateConfigs: Record<string, Array<{ id: string; type: string; name: string; description: string }>> = {
      "Employee Onboarding": [
        { id: "1", type: "trigger", name: "New Employee Added", description: "Triggered when HR adds a new employee" },
        { id: "2", type: "action", name: "Create Accounts", description: "Set up email, Slack, and system access" },
        { id: "3", type: "condition", name: "Check Department", description: "Route based on department needs" },
        { id: "4", type: "action", name: "Assign Equipment", description: "Request laptop and equipment" },
        { id: "5", type: "action", name: "Schedule Training", description: "Book onboarding sessions" },
        { id: "6", type: "output", name: "Complete", description: "Onboarding workflow complete" },
      ],
      "Document Approval": [
        { id: "1", type: "trigger", name: "Document Submitted", description: "Triggered when a document is submitted for review" },
        { id: "2", type: "search", name: "Find Reviewers", description: "Identify appropriate reviewers" },
        { id: "3", type: "action", name: "Request Review", description: "Send document to reviewers" },
        { id: "4", type: "condition", name: "Approved?", description: "Check if all reviews are positive" },
        { id: "5", type: "action", name: "Notify Submitter", description: "Send approval/rejection notification" },
        { id: "6", type: "output", name: "Complete", description: "Document workflow complete" },
      ],
      "Data Sync": [
        { id: "1", type: "trigger", name: "Schedule Trigger", description: "Run on schedule or data change" },
        { id: "2", type: "search", name: "Fetch Source Data", description: "Query source system" },
        { id: "3", type: "transform", name: "Transform Data", description: "Map and transform fields" },
        { id: "4", type: "condition", name: "Validate Data", description: "Check data integrity" },
        { id: "5", type: "action", name: "Update Target", description: "Push to target system" },
        { id: "6", type: "output", name: "Sync Complete", description: "Data sync completed" },
      ],
      "Report Generation": [
        { id: "1", type: "trigger", name: "Report Request", description: "Manual or scheduled trigger" },
        { id: "2", type: "search", name: "Gather Data", description: "Query all data sources" },
        { id: "3", type: "transform", name: "Aggregate Data", description: "Calculate metrics and summaries" },
        { id: "4", type: "action", name: "Generate Report", description: "Create formatted report" },
        { id: "5", type: "action", name: "Distribute Report", description: "Email or publish report" },
        { id: "6", type: "output", name: "Complete", description: "Report generation complete" },
      ],
      "Email Campaign": [
        { id: "1", type: "trigger", name: "Campaign Start", description: "Manual trigger or schedule" },
        { id: "2", type: "search", name: "Build Audience", description: "Query contact database" },
        { id: "3", type: "condition", name: "Segment Audience", description: "Apply targeting rules" },
        { id: "4", type: "action", name: "Personalize Content", description: "Generate personalized emails" },
        { id: "5", type: "action", name: "Send Campaign", description: "Dispatch emails" },
        { id: "6", type: "output", name: "Campaign Sent", description: "Email campaign completed" },
      ],
      "Ticket Routing": [
        { id: "1", type: "trigger", name: "New Ticket", description: "Triggered when ticket is created" },
        { id: "2", type: "search", name: "Analyze Content", description: "AI analysis of ticket content" },
        { id: "3", type: "condition", name: "Priority Check", description: "Determine ticket priority" },
        { id: "4", type: "search", name: "Find Agent", description: "Match to available agent" },
        { id: "5", type: "action", name: "Assign Ticket", description: "Assign to selected agent" },
        { id: "6", type: "output", name: "Ticket Routed", description: "Ticket routing complete" },
      ],
    };

    return templateConfigs[template.name] || [
      { id: "1", type: "trigger", name: "Trigger", description: `${template.category} trigger` },
      { id: "2", type: "action", name: template.name, description: `Execute ${template.name}` },
      { id: "3", type: "output", name: "Complete", description: "Workflow complete" },
    ];
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
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />

      <main className="ml-16 h-screen flex">
        {/* Left Panel - Workflow List */}
        <FadeIn className="w-96 border-r border-[var(--border-subtle)] flex flex-col bg-[var(--bg-charcoal)]">
          {/* Featured Agents */}
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[var(--success)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Featured Agents</span>
            </div>
            <div className="space-y-2">
              {featuredAgents.map((agent) => (
                <motion.div
                  key={agent.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-slate)] cursor-pointer transition-colors"
                  whileHover={{ x: 2 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-ember)]/20 to-[var(--accent-gold)]/20 border border-[var(--accent-ember)]/30 flex items-center justify-center">
                    <agent.icon className="w-4 h-4 text-[var(--accent-ember)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[var(--text-primary)] truncate">{agent.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{agent.runs.toLocaleString()} runs</div>
                  </div>
                  <motion.button
                    className="p-1 rounded hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Star className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Bot className="w-5 h-5 text-[var(--accent-ember)]" />
                Workflows
              </h2>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center rounded-lg bg-[var(--bg-slate)] border border-[var(--border-subtle)] p-0.5">
                  <motion.button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "list" ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Grid className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode("canvas")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "canvas" ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                </div>
                <motion.button
                  onClick={() => setShowTemplates(true)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-white text-sm flex items-center gap-1.5 transition-colors shadow-lg shadow-[var(--accent-ember)]/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" />
                  New
                </motion.button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workflows..."
                className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 focus:shadow-lg focus:shadow-[var(--accent-ember)]/5 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1">
              {["all", "active", "paused", "draft"].map((status) => (
                <motion.button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterStatus === status
                      ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)]"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Workflow List */}
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-ember)]" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-[var(--error)] mx-auto mb-2" />
                <p className="text-sm text-[var(--error)]">{error}</p>
              </div>
            ) : filteredWorkflows.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-muted)]">No workflows found</p>
              </div>
            ) : (
              <StaggerContainer>
                {filteredWorkflows.map((workflow) => {
                  const status = statusConfig[workflow.status as keyof typeof statusConfig] || statusConfig.draft;
                  const StatusIcon = status.icon;
                  return (
                    <StaggerItem key={workflow.id}>
                      <motion.div
                        onClick={() => setSelectedWorkflow(workflow)}
                        className={`group p-4 rounded-xl cursor-pointer transition-all mb-2 ${
                          selectedWorkflow?.id === workflow.id
                            ? "bg-[var(--accent-ember)]/10 border border-[var(--accent-ember)]/30"
                            : "hover:bg-[var(--bg-slate)] border border-transparent"
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center shadow-lg shadow-[var(--accent-ember)]/20">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h3 className="text-[var(--text-primary)] font-medium text-sm">
                                {workflow.name}
                              </h3>
                              {workflow.template_category && (
                                <span className="text-xs text-[var(--text-muted)]">
                                  {workflow.template_category}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(workflow.id);
                              }}
                              className={`p-1 rounded transition-colors ${
                                favorites.includes(workflow.id)
                                  ? "text-[var(--accent-gold)]"
                                  : "text-[var(--text-muted)] hover:text-[var(--accent-gold)]"
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Star className={`w-3.5 h-3.5 ${favorites.includes(workflow.id) ? "fill-[var(--accent-gold)]" : ""}`} />
                            </motion.button>
                            <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </div>
                        </div>
                        {workflow.description && (
                          <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2">
                            {workflow.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(workflow.updated_at).toLocaleDateString()}
                            </span>
                            {workflow.is_template && (
                              <span className="text-[var(--accent-ember)]">Template</span>
                            )}
                          </div>
                          <span className={`flex items-center gap-1 transition-colors ${
                            selectedWorkflow?.id === workflow.id
                              ? "text-[var(--accent-ember)]"
                              : "group-hover:text-[var(--text-secondary)]"
                          }`}>
                            <Eye className="w-3 h-3" />
                            View details
                          </span>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}
          </div>
        </FadeIn>

        {/* Right Panel - Workflow Detail */}
        <FadeIn className="flex-1 flex flex-col">
          {selectedWorkflow ? (
            <>
              {/* Workflow Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-[var(--border-subtle)] p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center shadow-lg shadow-[var(--accent-ember)]/20"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <Bot className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                      <h1 className="text-xl font-medium text-[var(--text-primary)] mb-1">
                        {selectedWorkflow.name}
                      </h1>
                      <p className="text-sm text-[var(--text-muted)]">
                        Created{" "}
                        {new Date(selectedWorkflow.created_at).toLocaleDateString()}
                        {selectedWorkflow.trigger_type && ` • Trigger: ${selectedWorkflow.trigger_type}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => runWorkflow(selectedWorkflow)}
                      className="px-4 py-2 rounded-lg bg-[var(--success)] hover:bg-[var(--success)]/80 text-white flex items-center gap-2 transition-colors shadow-lg shadow-[var(--success)]/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Play className="w-4 h-4" />
                      Run Now
                    </motion.button>
                    {selectedWorkflow.status === "active" ? (
                      <motion.button
                        onClick={() => handleToggleWorkflowStatus(selectedWorkflow)}
                        className="px-4 py-2 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-slate)] text-[var(--text-primary)] flex items-center gap-2 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => handleToggleWorkflowStatus(selectedWorkflow)}
                        className="px-4 py-2 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-slate)] text-[var(--text-primary)] flex items-center gap-2 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Play className="w-4 h-4" />
                        Activate
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => handleEditWorkflow(selectedWorkflow)}
                      className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-white flex items-center gap-2 transition-colors shadow-lg shadow-[var(--accent-ember)]/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </motion.button>
                    <motion.button
                      className="p-2 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)]"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Description */}
                {selectedWorkflow.description && (
                  <p className="mt-4 text-sm text-[var(--text-secondary)]">{selectedWorkflow.description}</p>
                )}

                {/* Stats */}
                <div className="flex gap-6 mt-6">
                  <motion.div
                    className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl px-4 py-3"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="text-2xl font-medium text-[var(--text-primary)]">
                      {getWorkflowSteps(selectedWorkflow).length}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">Steps</div>
                  </motion.div>
                  <motion.div
                    className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl px-4 py-3"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="text-2xl font-medium text-[var(--text-primary)] capitalize">
                      {selectedWorkflow.status}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">Status</div>
                  </motion.div>
                  {selectedWorkflow.is_template && (
                    <motion.div
                      className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl px-4 py-3"
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="text-2xl font-medium text-[var(--accent-ember)]">
                        Yes
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">Template</div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Workflow Content - Show execution, canvas, or steps based on state */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex-1 overflow-y-auto p-6"
              >
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
                  <div className="h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Visual Workflow Builder
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">Builder:</span>
                        <motion.button
                          onClick={() => setUseNewBuilder(!useNewBuilder)}
                          className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                            useNewBuilder
                              ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                              : "bg-[var(--bg-slate)] text-[var(--text-muted)]"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {useNewBuilder ? "ReactFlow (New)" : "Legacy"}
                        </motion.button>
                      </div>
                    </div>
                    {useNewBuilder ? (
                      <div className="h-[calc(100%-2rem)] min-h-[500px] rounded-xl overflow-hidden">
                        <WorkflowBuilder
                          workflowId={selectedWorkflow.id}
                          initialNodes={reactFlowNodes}
                          initialEdges={reactFlowEdges}
                          onSave={handleSaveWorkflow}
                          readOnly={false}
                        />
                      </div>
                    ) : (
                      <WorkflowCanvas
                        nodes={canvasNodes.length > 0 ? canvasNodes : [
                          { id: "1", type: "trigger", name: "Trigger", description: "Start workflow", position: { x: 50, y: 100 }, connections: { success: "2" } },
                          { id: "2", type: "search", name: "Search KB", description: "Search knowledge base", position: { x: 350, y: 100 }, connections: { success: "3" } },
                          { id: "3", type: "think", name: "AI Analysis", description: "Process with AI", position: { x: 650, y: 100 }, connections: { success: "4" } },
                          { id: "4", type: "output", name: "Output", description: "Return result", position: { x: 950, y: 100 }, connections: {} },
                        ]}
                        onNodesChange={setCanvasNodes}
                      />
                    )}
                  </div>
                ) : (
                  /* List View */
                  <>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                      Workflow Steps
                    </h3>
                    <StaggerContainer className="space-y-4">
                      {getWorkflowSteps(selectedWorkflow).map((step, index) => {
                        const config = stepTypeConfig[step.type as keyof typeof stepTypeConfig] || stepTypeConfig.action;
                        const StepIcon = stepTypeIcons[step.type] || Bot;
                        return (
                          <StaggerItem key={step.id}>
                            <div className="flex items-start gap-4">
                              {/* Step Number & Connector */}
                              <div className="flex flex-col items-center">
                                <motion.div
                                  className={`w-8 h-8 rounded-full ${config.dotColor} flex items-center justify-center text-white text-sm font-medium shadow-lg`}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  {index + 1}
                                </motion.div>
                                {index < getWorkflowSteps(selectedWorkflow).length - 1 && (
                                  <div className="w-px h-12 bg-[var(--border-default)] my-2" />
                                )}
                              </div>

                              {/* Step Card */}
                              <motion.div
                                className={`flex-1 border rounded-xl p-4 ${config.color}`}
                                whileHover={{ scale: 1.01, x: 2 }}
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <StepIcon className="w-5 h-5" />
                                  <div>
                                    <h4 className="text-[var(--text-primary)] font-medium">{step.name}</h4>
                                    <span className="text-xs text-[var(--text-muted)] capitalize">
                                      {step.type}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">{step.description}</p>
                              </motion.div>

                              {/* Actions */}
                              <motion.button
                                className="p-2 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Settings className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </StaggerItem>
                        );
                      })}
                    </StaggerContainer>

                    {/* Add Step Button */}
                    <motion.button
                      onClick={handleAddStep}
                      className="mt-6 w-full py-3 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-ember)]/30 flex items-center justify-center gap-2 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Plus className="w-5 h-5" />
                      Add Step
                    </motion.button>
                  </>
                )}
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center">
                <Bot className="w-16 h-16 text-[var(--border-subtle)] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">
                  Select a workflow
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Choose a workflow to view details and configuration
                </p>
              </div>
            </motion.div>
          )}
        </FadeIn>

        {/* Templates Modal */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowTemplates(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[var(--bg-charcoal)] border border-[var(--border-default)] rounded-2xl w-[600px] max-h-[80vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-[var(--text-primary)]">
                      Create New Workflow
                    </h2>
                    <motion.button
                      onClick={() => setShowTemplates(false)}
                      className="p-2 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)]"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <XCircle className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <motion.button
                      onClick={handleCreateFromScratch}
                      className="w-full p-4 border-2 border-dashed border-[var(--accent-ember)]/30 rounded-xl hover:border-[var(--accent-ember)]/50 hover:bg-[var(--accent-ember)]/5 transition-colors text-left"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--accent-ember)]/20 flex items-center justify-center">
                          <Plus className="w-5 h-5 text-[var(--accent-ember)]" />
                        </div>
                        <div>
                          <h4 className="text-[var(--text-primary)] font-medium">Start from Scratch</h4>
                          <p className="text-sm text-[var(--text-muted)]">Build a custom workflow using the visual builder</p>
                        </div>
                      </div>
                    </motion.button>
                  </div>

                  <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
                    Or start with a template
                  </h3>

                  <StaggerContainer className="grid grid-cols-2 gap-3">
                    {workflowTemplates.map((template) => (
                      <StaggerItem key={template.name}>
                        <motion.button
                          onClick={() => handleCreateFromTemplate(template)}
                          className="w-full p-4 bg-[var(--bg-slate)] hover:bg-[var(--bg-slate)]/80 border border-[var(--border-subtle)] rounded-xl transition-colors text-left"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--accent-gold)]/20 flex items-center justify-center">
                              <template.icon className="w-5 h-5 text-[var(--accent-gold)]" />
                            </div>
                            <div>
                              <h4 className="text-[var(--text-primary)] font-medium text-sm">{template.name}</h4>
                              <p className="text-xs text-[var(--text-muted)]">{template.category}</p>
                            </div>
                          </div>
                        </motion.button>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
