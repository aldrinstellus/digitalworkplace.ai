/**
 * Workflow Validation
 * Connection rules and workflow validation utilities
 */

import type { Connection } from '@xyflow/react';
import type { WorkflowNode, WorkflowEdge } from './types';
import { CONNECTION_RULES, NODE_TYPE_CONFIG } from './constants';

// =============================================================================
// CONNECTION VALIDATION
// =============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates if a connection can be made between two nodes
 */
export function validateConnection(
  connection: Connection,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { source, target, sourceHandle, targetHandle } = connection;

  // Find source and target nodes
  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);

  if (!sourceNode || !targetNode) {
    errors.push('Source or target node not found');
    return { isValid: false, errors, warnings };
  }

  // Cannot connect to self
  if (source === target) {
    errors.push('Cannot connect a node to itself');
    return { isValid: false, errors, warnings };
  }

  // Check if connection type is allowed
  const sourceType = sourceNode.data.type;
  const targetType = targetNode.data.type;

  if (!CONNECTION_RULES[sourceType]?.includes(targetType)) {
    errors.push(
      `Cannot connect ${NODE_TYPE_CONFIG[sourceType].label} to ${NODE_TYPE_CONFIG[targetType].label}`
    );
    return { isValid: false, errors, warnings };
  }

  // Check for duplicate connections
  const duplicateEdge = edges.find(
    (e) =>
      e.source === source &&
      e.target === target &&
      e.sourceHandle === sourceHandle &&
      e.targetHandle === targetHandle
  );

  if (duplicateEdge) {
    errors.push('This connection already exists');
    return { isValid: false, errors, warnings };
  }

  // Output nodes cannot have outgoing connections
  if (sourceType === 'output') {
    errors.push('Output nodes cannot have outgoing connections');
    return { isValid: false, errors, warnings };
  }

  // Trigger nodes cannot have incoming connections
  if (targetType === 'trigger') {
    errors.push('Trigger nodes cannot have incoming connections');
    return { isValid: false, errors, warnings };
  }

  // Warn about potential cycles (basic check)
  const wouldCreateCycle = detectCycle(source, target, nodes, edges);
  if (wouldCreateCycle) {
    warnings.push('This connection may create a cycle in the workflow');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Simple cycle detection using DFS
 */
function detectCycle(
  source: string,
  target: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): boolean {
  const visited = new Set<string>();
  const stack = [target];

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (current === source) {
      return true; // Found a path from target back to source
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    // Add all nodes that this node connects to
    for (const edge of edges) {
      if (edge.source === current && !visited.has(edge.target)) {
        stack.push(edge.target);
      }
    }
  }

  return false;
}

// =============================================================================
// WORKFLOW VALIDATION
// =============================================================================

/**
 * Validates the entire workflow structure
 */
export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for at least one node
  if (nodes.length === 0) {
    errors.push('Workflow must have at least one node');
    return { isValid: false, errors, warnings };
  }

  // Check for exactly one trigger node
  const triggerNodes = nodes.filter((n) => n.data.type === 'trigger');
  if (triggerNodes.length === 0) {
    errors.push('Workflow must have a trigger node');
  } else if (triggerNodes.length > 1) {
    warnings.push('Workflow has multiple trigger nodes');
  }

  // Check for at least one output node
  const outputNodes = nodes.filter((n) => n.data.type === 'output');
  if (outputNodes.length === 0) {
    warnings.push('Workflow has no output node');
  }

  // Check for disconnected nodes
  const connectedNodes = new Set<string>();
  for (const edge of edges) {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  }

  const disconnectedNodes = nodes.filter(
    (n) => !connectedNodes.has(n.id) && n.data.type !== 'trigger'
  );

  if (disconnectedNodes.length > 0) {
    warnings.push(
      `${disconnectedNodes.length} node(s) are not connected to the workflow`
    );
  }

  // Check for unconfigured nodes
  const unconfiguredNodes = nodes.filter((n) => !n.data.isConfigured);
  if (unconfiguredNodes.length > 0) {
    warnings.push(
      `${unconfiguredNodes.length} node(s) need configuration`
    );
  }

  // Check condition nodes have both branches connected
  const conditionNodes = nodes.filter((n) => n.data.type === 'condition');
  for (const condNode of conditionNodes) {
    const trueEdge = edges.find(
      (e) => e.source === condNode.id && e.sourceHandle === 'true'
    );
    const falseEdge = edges.find(
      (e) => e.source === condNode.id && e.sourceHandle === 'false'
    );

    if (!trueEdge || !falseEdge) {
      warnings.push(
        `Condition node "${condNode.data.label}" should have both true and false branches`
      );
    }
  }

  // Check for reachability from trigger
  if (triggerNodes.length > 0) {
    const reachable = getReachableNodes(triggerNodes[0].id, edges);
    const unreachable = nodes.filter(
      (n) => n.data.type !== 'trigger' && !reachable.has(n.id)
    );

    if (unreachable.length > 0) {
      warnings.push(
        `${unreachable.length} node(s) are not reachable from the trigger`
      );
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Get all nodes reachable from a starting node
 */
function getReachableNodes(startId: string, edges: WorkflowEdge[]): Set<string> {
  const reachable = new Set<string>();
  const stack = [startId];

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (reachable.has(current)) {
      continue;
    }

    reachable.add(current);

    for (const edge of edges) {
      if (edge.source === current && !reachable.has(edge.target)) {
        stack.push(edge.target);
      }
    }
  }

  return reachable;
}

// =============================================================================
// NODE VALIDATION
// =============================================================================

/**
 * Validates a single node's configuration
 */
export function validateNodeConfig(node: WorkflowNode): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { type, config } = node.data;

  // Use index access since all config types have index signatures
  const cfg = config as Record<string, unknown>;

  switch (type) {
    case 'trigger':
      if (!cfg.triggerType) {
        errors.push('Trigger type is required');
      }
      if (cfg.triggerType === 'scheduled' && !(cfg.schedule as Record<string, unknown> | undefined)?.cron) {
        errors.push('Schedule configuration is required for scheduled triggers');
      }
      if (cfg.triggerType === 'webhook' && !(cfg.webhook as Record<string, unknown> | undefined)?.path) {
        errors.push('Webhook path is required');
      }
      break;

    case 'search':
      if (!cfg.searchType) {
        errors.push('Search type is required');
      }
      if (!cfg.query && !cfg.queryTemplate && !cfg.useInputVariable) {
        warnings.push('Search query is not configured');
      }
      break;

    case 'action':
      if (!cfg.actionType) {
        errors.push('Action type is required');
      }
      if (cfg.actionType === 'llm_call' && !(cfg.llm as Record<string, unknown> | undefined)?.prompt) {
        warnings.push('LLM prompt is not configured');
      }
      if (cfg.actionType === 'api_call' && !(cfg.api as Record<string, unknown> | undefined)?.url) {
        errors.push('API URL is required for API calls');
      }
      if (cfg.actionType === 'notification' && !(cfg.notification as Record<string, unknown> | undefined)?.type) {
        errors.push('Notification type is required');
      }
      break;

    case 'condition':
      if (!cfg.conditionType) {
        errors.push('Condition type is required');
      }
      if (cfg.conditionType === 'simple' && !(cfg.simple as Record<string, unknown> | undefined)?.field) {
        warnings.push('Condition field is not configured');
      }
      break;

    case 'transform':
      if (!cfg.transformType) {
        errors.push('Transform type is required');
      }
      break;

    case 'output':
      if (!cfg.outputType) {
        errors.push('Output type is required');
      }
      break;
  }

  return { isValid: errors.length === 0, errors, warnings };
}
