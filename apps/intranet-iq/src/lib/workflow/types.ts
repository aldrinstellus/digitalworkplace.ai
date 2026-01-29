/**
 * Workflow Builder Types
 * Type definitions for ReactFlow-based workflow builder
 */

import type { Node, Edge, XYPosition } from '@xyflow/react';

// =============================================================================
// NODE TYPES
// =============================================================================

export type WorkflowNodeType =
  | 'trigger'
  | 'search'
  | 'action'
  | 'condition'
  | 'transform'
  | 'output'
  | 'approval'; // V2.0: Human-in-the-loop approval node

export interface WorkflowNodeData {
  label: string;
  description?: string;
  type: WorkflowNodeType;
  config: NodeConfig;
  isConfigured: boolean;
  icon?: string;
  [key: string]: unknown; // Index signature for ReactFlow compatibility
}

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;

// =============================================================================
// NODE CONFIGS BY TYPE
// =============================================================================

export interface TriggerConfig {
  triggerType: 'manual' | 'scheduled' | 'webhook' | 'event';
  schedule?: {
    cron?: string;
    interval?: number;
    timezone?: string;
  };
  webhook?: {
    path?: string;
    method?: 'GET' | 'POST';
  };
  event?: {
    source?: string;
    eventType?: string;
  };
  [key: string]: unknown;
}

export interface SearchConfig {
  searchType: 'knowledge_base' | 'elasticsearch' | 'database' | 'external';
  query?: string;
  queryTemplate?: string;
  useInputVariable?: string;
  filters?: Record<string, unknown>;
  maxResults?: number;
  includeMetadata?: boolean;
  [key: string]: unknown;
}

export interface ActionConfig {
  actionType: 'llm_call' | 'api_call' | 'notification' | 'update_record' | 'create_record';
  llm?: {
    model?: string;
    prompt?: string;
    temperature?: number;
    maxTokens?: number;
  };
  api?: {
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: string;
  };
  notification?: {
    type?: 'email' | 'slack' | 'teams' | 'in_app';
    recipients?: string[];
    subject?: string;
    template?: string;
  };
  record?: {
    table?: string;
    operation?: 'create' | 'update' | 'delete';
    data?: Record<string, unknown>;
  };
  [key: string]: unknown;
}

export interface ConditionConfig {
  conditionType: 'simple' | 'script' | 'llm_decision';
  simple?: {
    field?: string;
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
    value?: string;
  };
  script?: {
    code?: string;
  };
  llmDecision?: {
    prompt?: string;
    criteria?: string[];
  };
  [key: string]: unknown;
}

export interface TransformConfig {
  transformType: 'map' | 'filter' | 'aggregate' | 'merge' | 'custom';
  map?: {
    mappings?: { from: string; to: string }[];
  };
  filter?: {
    condition?: string;
  };
  aggregate?: {
    operation?: 'sum' | 'count' | 'average' | 'min' | 'max';
    field?: string;
    groupBy?: string;
  };
  merge?: {
    sources?: string[];
    strategy?: 'concat' | 'merge' | 'zip';
  };
  custom?: {
    code?: string;
  };
  [key: string]: unknown;
}

export interface OutputConfig {
  outputType: 'return' | 'store' | 'webhook' | 'log';
  format?: 'json' | 'text' | 'html' | 'markdown';
  template?: string;
  store?: {
    destination?: string;
    table?: string;
  };
  webhook?: {
    url?: string;
    method?: 'POST' | 'PUT';
  };
  [key: string]: unknown;
}

/**
 * V2.0: Human Approval Node Configuration
 * Pauses workflow execution until a human approves or rejects
 */
export interface ApprovalConfig {
  approvalType: 'single' | 'multiple' | 'any';
  approvers: {
    type: 'user' | 'role' | 'department';
    ids: string[];
  };
  title?: string;
  description?: string;
  instructions?: string;
  requiredApprovals?: number; // For 'multiple' type
  timeout?: {
    duration: number; // in hours
    action: 'approve' | 'reject' | 'escalate';
    escalateTo?: string[];
  };
  notifications?: {
    onRequest?: boolean;
    onApprove?: boolean;
    onReject?: boolean;
    onTimeout?: boolean;
    channels?: ('email' | 'in_app' | 'slack')[];
  };
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export type NodeConfig =
  | TriggerConfig
  | SearchConfig
  | ActionConfig
  | ConditionConfig
  | TransformConfig
  | OutputConfig
  | ApprovalConfig
  | Record<string, unknown>;

// =============================================================================
// EDGE TYPES
// =============================================================================

export type WorkflowEdgeType = 'default' | 'conditional';

export interface WorkflowEdgeData {
  label?: string;
  condition?: 'success' | 'failure' | 'true' | 'false';
  animated?: boolean;
  [key: string]: unknown; // Index signature for ReactFlow compatibility
}

export type WorkflowEdge = Edge<WorkflowEdgeData>;

// =============================================================================
// WORKFLOW STATE
// =============================================================================

export interface WorkflowBuilderState {
  // Core data
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];

  // UI state
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  selectedEdgeId: string | null;
  isPanelOpen: boolean;
  zoom: number;

  // Workflow metadata
  workflowId: string | null;
  workflowName: string;
  workflowDescription: string;
  isDirty: boolean;

  // History for undo/redo
  history: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }[];
  historyIndex: number;

  // Clipboard
  clipboard: { nodes: WorkflowNode[]; edges: WorkflowEdge[] } | null;

  // Actions
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  addNode: (type: WorkflowNodeType, position: XYPosition) => string;
  updateNode: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (connection: { source: string; target: string; sourceHandle?: string; targetHandle?: string }) => void;
  deleteEdge: (edgeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
  togglePanel: (open?: boolean) => void;
  setWorkflowMetadata: (name: string, description: string) => void;
  loadWorkflow: (id: string, nodes: WorkflowNode[], edges: WorkflowEdge[], name: string, description: string) => void;
  resetWorkflow: () => void;
  clearWorkflow: () => void;
  markClean: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;

  // Multi-select actions
  addToSelection: (nodeId: string) => void;
  removeFromSelection: (nodeId: string) => void;
  clearSelection: () => void;
  setSelection: (nodeIds: string[]) => void;

  // Clipboard actions
  copySelectedNodes: () => void;
  pasteNodes: (offset?: { x: number; y: number }) => void;
  duplicateSelectedNodes: () => void;
  canPaste: () => boolean;
  deleteSelectedNodes: () => void;
}

// =============================================================================
// DATABASE TYPES (Extended)
// =============================================================================

export interface WorkflowStepDB {
  id: string;
  workflow_id: string;
  step_number: number;
  step_name: string;  // Database column name
  step_type: string;  // Database column name
  config: Record<string, unknown>;
  next_step_on_success: string | null;
  next_step_on_failure: string | null;
  position_x: number;
  position_y: number;
  ui_config: Record<string, unknown>;
  created_at: string;
}

export interface WorkflowEdgeDB {
  id: string;
  workflow_id: string;
  source_step_id: string;
  target_step_id: string;
  source_handle: string;
  target_handle: string;
  label: string | null;
  animated: boolean;
  created_at: string;
}

// =============================================================================
// API TYPES
// =============================================================================

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  trigger_type?: string;
  trigger_config?: Record<string, unknown>;
  is_template?: boolean;
  template_category?: string;
  nodes: Omit<WorkflowStepDB, 'id' | 'workflow_id' | 'created_at'>[];
  edges: Omit<WorkflowEdgeDB, 'id' | 'workflow_id' | 'created_at'>[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'paused' | 'archived';
  trigger_type?: string;
  trigger_config?: Record<string, unknown>;
  nodes?: Omit<WorkflowStepDB, 'workflow_id' | 'created_at'>[];
  edges?: Omit<WorkflowEdgeDB, 'workflow_id' | 'created_at'>[];
}

export interface WorkflowResponse {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  status: string;
  trigger_type: string | null;
  trigger_config: Record<string, unknown>;
  is_template: boolean;
  template_category: string | null;
  created_at: string;
  updated_at: string;
  steps: WorkflowStepDB[];
  edges: WorkflowEdgeDB[];
}
