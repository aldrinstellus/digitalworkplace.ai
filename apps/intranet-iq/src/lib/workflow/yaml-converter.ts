/**
 * Workflow YAML Converter
 * Converts workflow data between visual builder format and YAML/JSON code format
 */

import * as yaml from 'yaml';
import type { WorkflowNode, WorkflowEdge } from './types';

// =============================================================================
// YAML WORKFLOW STRUCTURE
// =============================================================================

export interface YAMLWorkflow {
  name: string;
  description?: string;
  trigger?: {
    type: 'manual' | 'schedule' | 'webhook' | 'event';
    cron?: string;
    webhook_path?: string;
    event_type?: string;
  };
  steps: YAMLStep[];
}

export interface YAMLStep {
  id: string;
  type: string;
  name: string;
  description?: string;
  config?: Record<string, unknown>;
  next?: string | { success?: string; failure?: string };
}

// =============================================================================
// CONVERSION FUNCTIONS
// =============================================================================

/**
 * Convert ReactFlow nodes/edges to YAML string
 */
export function workflowToYAML(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  metadata: { name: string; description?: string }
): string {
  const yamlWorkflow = nodesToYAMLStructure(nodes, edges, metadata);
  return yaml.stringify(yamlWorkflow, {
    indent: 2,
    lineWidth: 0, // Disable line wrapping
  });
}

/**
 * Convert ReactFlow nodes/edges to JSON string
 */
export function workflowToJSON(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  metadata: { name: string; description?: string }
): string {
  const yamlWorkflow = nodesToYAMLStructure(nodes, edges, metadata);
  return JSON.stringify(yamlWorkflow, null, 2);
}

/**
 * Convert nodes/edges to YAML-friendly structure
 */
function nodesToYAMLStructure(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  metadata: { name: string; description?: string }
): YAMLWorkflow {
  // Build edge map for quick lookup
  const edgeMap = new Map<string, { success?: string; failure?: string }>();
  for (const edge of edges) {
    const current = edgeMap.get(edge.source) || {};
    if (edge.sourceHandle === 'false' || edge.data?.condition === 'failure') {
      current.failure = edge.target;
    } else {
      current.success = edge.target;
    }
    edgeMap.set(edge.source, current);
  }

  // Find trigger node
  const triggerNode = nodes.find(n => n.data.type === 'trigger');
  let trigger: YAMLWorkflow['trigger'] | undefined;

  if (triggerNode) {
    const config = triggerNode.data.config as { triggerType?: string; schedule?: { cron?: string }; webhook?: { path?: string }; event?: { eventType?: string } };
    trigger = {
      type: (config.triggerType || 'manual') as 'manual' | 'schedule' | 'webhook' | 'event',
    };
    if (config.schedule?.cron) {
      trigger.cron = config.schedule.cron;
    }
    if (config.webhook?.path) {
      trigger.webhook_path = config.webhook.path;
    }
    if (config.event?.eventType) {
      trigger.event_type = config.event.eventType;
    }
  }

  // Convert nodes to steps (exclude trigger from steps, as it's separate)
  const steps: YAMLStep[] = nodes
    .filter(n => n.data.type !== 'trigger')
    .map(node => {
      const step: YAMLStep = {
        id: node.id,
        type: node.data.type,
        name: node.data.label,
      };

      if (node.data.description) {
        step.description = node.data.description;
      }

      // Add config if not empty
      const config = node.data.config;
      if (config && Object.keys(config).length > 0) {
        // Clean up config to be YAML-friendly
        step.config = cleanConfigForYAML(config);
      }

      // Add next step references
      const nextSteps = edgeMap.get(node.id);
      if (nextSteps) {
        if (nextSteps.failure) {
          step.next = { success: nextSteps.success, failure: nextSteps.failure };
        } else if (nextSteps.success) {
          step.next = nextSteps.success;
        }
      }

      return step;
    });

  return {
    name: metadata.name || 'Untitled Workflow',
    description: metadata.description,
    trigger,
    steps,
  };
}

/**
 * Clean config object for YAML output
 */
function cleanConfigForYAML(config: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    // Skip empty values
    if (value === undefined || value === null || value === '') continue;

    // Skip empty objects/arrays
    if (typeof value === 'object' && Object.keys(value as object).length === 0) continue;

    // Recursively clean nested objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      const cleanedNested = cleanConfigForYAML(value as Record<string, unknown>);
      if (Object.keys(cleanedNested).length > 0) {
        cleaned[key] = cleanedNested;
      }
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

// =============================================================================
// PARSING FUNCTIONS
// =============================================================================

export interface ParseResult {
  success: boolean;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  errors?: ParseError[];
}

export interface ParseError {
  line?: number;
  column?: number;
  message: string;
  type: 'syntax' | 'validation';
}

/**
 * Parse YAML string to workflow nodes/edges
 */
export function yamlToWorkflow(yamlString: string): ParseResult {
  try {
    // Parse YAML
    const parsed = yaml.parse(yamlString) as YAMLWorkflow;

    // Validate structure
    const validationErrors = validateYAMLWorkflow(parsed);
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }

    // Convert to nodes/edges
    return convertYAMLToNodes(parsed);
  } catch (error) {
    // Handle YAML syntax errors
    if (error instanceof yaml.YAMLParseError) {
      return {
        success: false,
        errors: [{
          line: error.linePos?.[0]?.line,
          column: error.linePos?.[0]?.col,
          message: error.message,
          type: 'syntax',
        }],
      };
    }

    return {
      success: false,
      errors: [{
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'syntax',
      }],
    };
  }
}

/**
 * Parse JSON string to workflow nodes/edges
 */
export function jsonToWorkflow(jsonString: string): ParseResult {
  try {
    const parsed = JSON.parse(jsonString) as YAMLWorkflow;

    const validationErrors = validateYAMLWorkflow(parsed);
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }

    return convertYAMLToNodes(parsed);
  } catch (error) {
    // Extract line info from JSON error if available
    const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
    const lineMatch = errorMessage.match(/position (\d+)/i);

    return {
      success: false,
      errors: [{
        line: lineMatch ? parseInt(lineMatch[1]) : undefined,
        message: errorMessage,
        type: 'syntax',
      }],
    };
  }
}

/**
 * Validate YAML workflow structure
 */
function validateYAMLWorkflow(workflow: YAMLWorkflow): ParseError[] {
  const errors: ParseError[] = [];

  // Check required fields
  if (!workflow.name) {
    errors.push({ message: 'Workflow name is required', type: 'validation' });
  }

  if (!workflow.steps || !Array.isArray(workflow.steps)) {
    errors.push({ message: 'Workflow must have a steps array', type: 'validation' });
    return errors; // Can't continue validation without steps
  }

  // Check each step
  const stepIds = new Set<string>();
  for (let i = 0; i < workflow.steps.length; i++) {
    const step = workflow.steps[i];

    if (!step.id) {
      errors.push({ message: `Step ${i + 1}: id is required`, type: 'validation' });
    } else if (stepIds.has(step.id)) {
      errors.push({ message: `Step ${i + 1}: duplicate id "${step.id}"`, type: 'validation' });
    } else {
      stepIds.add(step.id);
    }

    if (!step.type) {
      errors.push({ message: `Step ${i + 1}: type is required`, type: 'validation' });
    }

    if (!step.name) {
      errors.push({ message: `Step ${i + 1}: name is required`, type: 'validation' });
    }

    // Validate next references
    if (step.next) {
      if (typeof step.next === 'string') {
        const nextId = step.next;
        if (!workflow.steps.some(s => s.id === nextId)) {
          errors.push({ message: `Step "${step.id}": next step "${nextId}" not found`, type: 'validation' });
        }
      } else if (typeof step.next === 'object') {
        const nextObj = step.next as { success?: string; failure?: string };
        if (nextObj.success && !workflow.steps.some(s => s.id === nextObj.success)) {
          errors.push({ message: `Step "${step.id}": success step "${nextObj.success}" not found`, type: 'validation' });
        }
        if (nextObj.failure && !workflow.steps.some(s => s.id === nextObj.failure)) {
          errors.push({ message: `Step "${step.id}": failure step "${nextObj.failure}" not found`, type: 'validation' });
        }
      }
    }
  }

  // Validate trigger
  if (workflow.trigger) {
    const validTypes = ['manual', 'schedule', 'webhook', 'event'];
    if (!validTypes.includes(workflow.trigger.type)) {
      errors.push({ message: `Invalid trigger type: ${workflow.trigger.type}`, type: 'validation' });
    }

    if (workflow.trigger.type === 'schedule' && !workflow.trigger.cron) {
      errors.push({ message: 'Schedule trigger requires cron expression', type: 'validation' });
    }
  }

  return errors;
}

/**
 * Convert YAML workflow to nodes/edges
 */
function convertYAMLToNodes(workflow: YAMLWorkflow): ParseResult {
  const nodes: WorkflowNode[] = [];
  const edges: WorkflowEdge[] = [];

  // Create trigger node if trigger config exists
  if (workflow.trigger) {
    const triggerId = `trigger-${Date.now()}`;
    nodes.push({
      id: triggerId,
      type: 'trigger',
      position: { x: 200, y: 50 },
      data: {
        label: 'Trigger',
        description: `${workflow.trigger.type} trigger`,
        type: 'trigger',
        config: {
          triggerType: workflow.trigger.type,
          schedule: workflow.trigger.cron ? { cron: workflow.trigger.cron } : undefined,
          webhook: workflow.trigger.webhook_path ? { path: workflow.trigger.webhook_path } : undefined,
          event: workflow.trigger.event_type ? { eventType: workflow.trigger.event_type } : undefined,
        },
        isConfigured: true,
      },
    });

    // Connect trigger to first step
    if (workflow.steps.length > 0) {
      edges.push({
        id: `edge-${triggerId}-${workflow.steps[0].id}`,
        source: triggerId,
        target: workflow.steps[0].id,
        sourceHandle: 'output',
        targetHandle: 'input',
      });
    }
  }

  // Convert steps to nodes
  workflow.steps.forEach((step, index) => {
    const nodeType = mapStepTypeToNodeType(step.type);

    nodes.push({
      id: step.id,
      type: nodeType,
      position: { x: 200, y: 150 + index * 150 },
      data: {
        label: step.name,
        description: step.description,
        type: nodeType,
        config: step.config || {},
        isConfigured: !!step.config && Object.keys(step.config).length > 0,
      },
    });

    // Create edges from next references
    if (step.next) {
      if (typeof step.next === 'string') {
        edges.push({
          id: `edge-${step.id}-${step.next}`,
          source: step.id,
          target: step.next,
          sourceHandle: nodeType === 'condition' ? 'true' : 'output',
          targetHandle: 'input',
          type: nodeType === 'condition' ? 'conditional' : 'default',
          data: nodeType === 'condition' ? { condition: 'true' as const, label: 'True' } : undefined,
        });
      } else {
        if (step.next.success) {
          edges.push({
            id: `edge-${step.id}-${step.next.success}-success`,
            source: step.id,
            target: step.next.success,
            sourceHandle: nodeType === 'condition' ? 'true' : 'output',
            targetHandle: 'input',
            type: nodeType === 'condition' ? 'conditional' : 'default',
            data: nodeType === 'condition' ? { condition: 'true' as const, label: 'True' } : undefined,
          });
        }
        if (step.next.failure) {
          edges.push({
            id: `edge-${step.id}-${step.next.failure}-failure`,
            source: step.id,
            target: step.next.failure,
            sourceHandle: 'false',
            targetHandle: 'input',
            type: 'conditional',
            data: { condition: 'false' as const, label: 'False' },
          });
        }
      }
    }
  });

  return { success: true, nodes, edges };
}

/**
 * Map YAML step type to node type
 */
function mapStepTypeToNodeType(stepType: string): WorkflowNode['data']['type'] {
  const typeMap: Record<string, WorkflowNode['data']['type']> = {
    trigger: 'trigger',
    search: 'search',
    action: 'action',
    condition: 'condition',
    transform: 'transform',
    output: 'output',
    approval: 'approval',
    llm: 'action',
    api: 'action',
    notification: 'action',
    ai_reasoning: 'action',
  };

  return typeMap[stepType.toLowerCase()] || 'action';
}

// =============================================================================
// SYNTAX VALIDATION
// =============================================================================

/**
 * Quick syntax check without full parsing
 * Returns errors with line numbers for inline highlighting
 */
export function validateSyntax(code: string, format: 'yaml' | 'json'): ParseError[] {
  const errors: ParseError[] = [];

  if (format === 'yaml') {
    try {
      yaml.parse(code);
    } catch (error) {
      if (error instanceof yaml.YAMLParseError) {
        errors.push({
          line: error.linePos?.[0]?.line,
          column: error.linePos?.[0]?.col,
          message: error.message.split('\n')[0], // First line only
          type: 'syntax',
        });
      }
    }
  } else {
    try {
      JSON.parse(code);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Invalid JSON';
      // Try to extract line from error message
      errors.push({
        message: msg,
        type: 'syntax',
      });
    }
  }

  return errors;
}
