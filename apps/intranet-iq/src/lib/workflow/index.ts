/**
 * Workflow Builder Library
 * Central exports for the workflow builder functionality
 */

// Types
export * from './types';

// Constants
export * from './constants';

// Store
export { useWorkflowStore, selectSelectedNode, selectSelectedEdge, selectNodeById, selectNodeCount, selectEdgeCount, selectIsWorkflowEmpty, selectHasUnsavedChanges } from './store';

// Validation
export { validateConnection, validateWorkflow, validateNodeConfig } from './validation';
export type { ValidationResult } from './validation';

// Serialization
export {
  workflowToReactFlow,
  stepsToNodes,
  dbEdgesToReactFlowEdges,
  reactFlowToDatabase,
  nodesToSteps,
  reactFlowEdgesToDB,
  convertLegacyWorkflow,
  exportWorkflowToJSON,
  importWorkflowFromJSON,
} from './serialization';

// Auto Layout
export {
  applyAutoLayout,
  applyHorizontalLayout,
  applyVerticalLayout,
  applyCompactLayout,
  applySpaciousLayout,
  centerNodes,
  alignToGrid,
  distributeHorizontally,
  distributeVertically,
  alignNodes,
} from './autoLayout';
export type { LayoutDirection, LayoutOptions } from './autoLayout';

// Executor
export {
  WorkflowExecutor,
  getWorkflowExecutor,
  handleWebhookTrigger,
  handleScheduledTrigger,
} from './executor';
export type {
  ExecutionContext,
  ExecutionLog,
  ExecutionResult,
  StepResult,
  WorkflowDefinition,
} from './executor';

// V2.0: Approval System
export {
  createApprovalRequest,
  submitApprovalResponse,
  processApprovalTimeout,
  cancelApproval,
  getPendingApprovalsForUser,
  getApproval,
  getExecutionApprovals,
} from './approval';
export type {
  ApprovalStatus,
  WorkflowApproval,
  ApprovalResponse,
  CreateApprovalInput,
  ApprovalResult,
} from './approval';
