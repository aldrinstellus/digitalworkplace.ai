/**
 * Workflow Builder Constants
 * Node configurations, colors, and defaults for the workflow builder
 */

import {
  Zap,
  Search,
  Play,
  GitBranch,
  Shuffle,
  CheckCircle,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import type { WorkflowNodeType, WorkflowNodeData } from './types';

// =============================================================================
// NODE TYPE CONFIGURATION
// =============================================================================

export interface NodeTypeConfig {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  handles: {
    inputs: { id: string; label: string }[];
    outputs: { id: string; label: string }[];
  };
  defaultConfig: Record<string, unknown>;
}

export const NODE_TYPE_CONFIG: Record<WorkflowNodeType, NodeTypeConfig> = {
  trigger: {
    type: 'trigger',
    label: 'Trigger',
    description: 'Start condition for the workflow',
    icon: Zap,
    color: '#a855f7', // Purple
    bgColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.4)',
    handles: {
      inputs: [],
      outputs: [{ id: 'output', label: 'Output' }],
    },
    defaultConfig: {
      triggerType: 'manual',
    },
  },
  search: {
    type: 'search',
    label: 'Search',
    description: 'Search knowledge base or external sources',
    icon: Search,
    color: '#3b82f6', // Blue
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    handles: {
      inputs: [{ id: 'input', label: 'Input' }],
      outputs: [{ id: 'output', label: 'Results' }],
    },
    defaultConfig: {
      searchType: 'knowledge_base',
      maxResults: 10,
    },
  },
  action: {
    type: 'action',
    label: 'Action',
    description: 'Execute an action (LLM call, API, notification)',
    icon: Play,
    color: '#22c55e', // Green
    bgColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
    handles: {
      inputs: [{ id: 'input', label: 'Input' }],
      outputs: [{ id: 'output', label: 'Output' }],
    },
    defaultConfig: {
      actionType: 'llm_call',
    },
  },
  condition: {
    type: 'condition',
    label: 'Condition',
    description: 'Branch workflow based on conditions',
    icon: GitBranch,
    color: '#10b981', // Green
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    handles: {
      inputs: [{ id: 'input', label: 'Input' }],
      outputs: [
        { id: 'true', label: 'True' },
        { id: 'false', label: 'False' },
      ],
    },
    defaultConfig: {
      conditionType: 'simple',
    },
  },
  transform: {
    type: 'transform',
    label: 'Transform',
    description: 'Transform or process data',
    icon: Shuffle,
    color: '#06b6d4', // Cyan
    bgColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: 'rgba(6, 182, 212, 0.4)',
    handles: {
      inputs: [{ id: 'input', label: 'Input' }],
      outputs: [{ id: 'output', label: 'Output' }],
    },
    defaultConfig: {
      transformType: 'map',
    },
  },
  output: {
    type: 'output',
    label: 'Output',
    description: 'Final output of the workflow',
    icon: CheckCircle,
    color: '#fbbf24', // Gold
    bgColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: 'rgba(251, 191, 36, 0.4)',
    handles: {
      inputs: [{ id: 'input', label: 'Input' }],
      outputs: [],
    },
    defaultConfig: {
      outputType: 'return',
      format: 'json',
    },
  },
  approval: {
    type: 'approval',
    label: 'Approval',
    description: 'Human-in-the-loop approval step',
    icon: UserCheck,
    color: '#f97316', // Orange
    bgColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.4)',
    handles: {
      inputs: [{ id: 'input', label: 'Input' }],
      outputs: [
        { id: 'approved', label: 'Approved' },
        { id: 'rejected', label: 'Rejected' },
      ],
    },
    defaultConfig: {
      approvalType: 'single',
      requiredApprovals: 1,
      timeoutHours: 72,
      timeoutAction: 'escalate',
    },
  },
};

// =============================================================================
// CANVAS DEFAULTS
// =============================================================================

export const CANVAS_DEFAULTS = {
  defaultZoom: 1,
  minZoom: 0.25,
  maxZoom: 2,
  snapToGrid: true,
  gridSize: 20,
  nodeWidth: 280,
  nodeHeight: 100,
  defaultViewport: { x: 100, y: 100, zoom: 1 },
  // Default to vertical (top-to-bottom) layout
  defaultLayoutDirection: 'TB' as const,
};

// =============================================================================
// EDGE STYLES
// =============================================================================

export const EDGE_STYLES = {
  default: {
    stroke: 'rgba(255, 255, 255, 0.3)',
    strokeWidth: 2,
    animated: false,
  },
  selected: {
    stroke: '#10b981',
    strokeWidth: 3,
    animated: true,
  },
  success: {
    stroke: '#22c55e',
    strokeWidth: 2,
    animated: false,
  },
  failure: {
    stroke: '#ef4444',
    strokeWidth: 2,
    animated: false,
    strokeDasharray: '5,5',
  },
};

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

export const KEYBOARD_SHORTCUTS = {
  delete: ['Backspace', 'Delete'],
  undo: 'mod+z',
  redo: 'mod+shift+z',
  copy: 'mod+c',
  paste: 'mod+v',
  selectAll: 'mod+a',
  escape: 'Escape',
  zoomIn: 'mod+=',
  zoomOut: 'mod+-',
  fitView: 'mod+0',
};

// =============================================================================
// VALIDATION RULES
// =============================================================================

export const CONNECTION_RULES: Record<WorkflowNodeType, WorkflowNodeType[]> = {
  trigger: ['search', 'action', 'condition', 'transform', 'output', 'approval'],
  search: ['action', 'condition', 'transform', 'output', 'approval'],
  action: ['search', 'action', 'condition', 'transform', 'output', 'approval'],
  condition: ['search', 'action', 'condition', 'transform', 'output', 'approval'],
  transform: ['search', 'action', 'condition', 'transform', 'output', 'approval'],
  output: [], // Output nodes cannot connect to anything
  approval: ['search', 'action', 'condition', 'transform', 'output'], // Approval can continue to other nodes
};

// Helper to check if connection is valid
export function isValidConnection(
  sourceType: WorkflowNodeType,
  targetType: WorkflowNodeType
): boolean {
  return CONNECTION_RULES[sourceType]?.includes(targetType) ?? false;
}

// =============================================================================
// DEFAULT NODE DATA
// =============================================================================

export function createDefaultNodeData(type: WorkflowNodeType): WorkflowNodeData {
  const config = NODE_TYPE_CONFIG[type];
  return {
    label: config.label,
    description: config.description,
    type,
    config: { ...config.defaultConfig },
    isConfigured: false,
  };
}

// =============================================================================
// ACTION SUBTYPES
// =============================================================================

export const ACTION_SUBTYPES = [
  { value: 'llm_call', label: 'LLM Call', description: 'Call an AI model' },
  { value: 'api_call', label: 'API Call', description: 'Make an HTTP request' },
  { value: 'notification', label: 'Send Notification', description: 'Send email, Slack, etc.' },
  { value: 'update_record', label: 'Update Record', description: 'Update a database record' },
  { value: 'create_record', label: 'Create Record', description: 'Create a new record' },
];

export const SEARCH_SUBTYPES = [
  { value: 'knowledge_base', label: 'Knowledge Base', description: 'Search internal KB' },
  { value: 'elasticsearch', label: 'Elasticsearch', description: 'Full-text search' },
  { value: 'database', label: 'Database Query', description: 'Query database directly' },
  { value: 'external', label: 'External API', description: 'Search external services' },
];

export const TRIGGER_SUBTYPES = [
  { value: 'manual', label: 'Manual', description: 'Triggered manually' },
  { value: 'scheduled', label: 'Scheduled', description: 'Run on a schedule' },
  { value: 'webhook', label: 'Webhook', description: 'Triggered by webhook' },
  { value: 'event', label: 'Event', description: 'Triggered by system event' },
];

export const CONDITION_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
];

export const LLM_MODELS = [
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];
