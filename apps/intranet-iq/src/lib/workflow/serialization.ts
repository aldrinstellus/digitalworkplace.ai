/**
 * Workflow Serialization
 * Convert between ReactFlow nodes/edges and database format
 */

import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowStepDB,
  WorkflowEdgeDB,
  WorkflowResponse,
  WorkflowNodeData,
} from './types';
import { createDefaultNodeData } from './constants';

// =============================================================================
// DATABASE TO REACTFLOW CONVERSION
// =============================================================================

/**
 * Convert database workflow response to ReactFlow nodes and edges
 */
export function workflowToReactFlow(workflow: WorkflowResponse): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} {
  const nodes = stepsToNodes(workflow.steps || []);
  const edges = dbEdgesToReactFlowEdges(workflow.edges || []);

  // Fix edge source handles based on source node types
  // This handles legacy data where condition nodes might have 'output' as source handle
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const fixedEdges = edges.map((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    if (!sourceNode) return edge;

    // If source is a condition node and sourceHandle is 'output' or undefined,
    // default to 'true' handle
    if (sourceNode.data.type === 'condition') {
      if (!edge.sourceHandle || edge.sourceHandle === 'output') {
        return {
          ...edge,
          sourceHandle: 'true',
          type: 'conditional' as const,
          data: {
            ...edge.data,
            condition: 'true' as const,
            label: 'True',
          },
        };
      }
    } else {
      // For non-condition nodes, ensure sourceHandle defaults to 'output'
      if (!edge.sourceHandle) {
        return {
          ...edge,
          sourceHandle: 'output',
        };
      }
    }

    return edge;
  });

  return { nodes, edges: fixedEdges };
}

/**
 * Convert database workflow steps to ReactFlow nodes
 */
export function stepsToNodes(steps: WorkflowStepDB[]): WorkflowNode[] {
  return steps.map((step) => {
    // Support both old (name/type) and new (step_name/step_type) field names
    const stepType = step.step_type || (step as unknown as { type: string }).type;
    const stepName = step.step_name || (step as unknown as { name: string }).name;
    const defaultData = createDefaultNodeData(stepType as WorkflowNode['data']['type']);

    const nodeData: WorkflowNodeData = {
      label: stepName,
      description: (step.config as Record<string, unknown>).description as string || defaultData.description,
      type: stepType as WorkflowNode['data']['type'],
      config: step.config || defaultData.config,
      isConfigured: Object.keys(step.config || {}).length > 1, // More than just default config
    };

    return {
      id: step.id,
      type: stepType as WorkflowNode['type'],
      position: {
        x: step.position_x || 0,
        y: step.position_y || 0,
      },
      data: nodeData,
    };
  });
}

/**
 * Convert database edges to ReactFlow edges
 * Note: For edges without a source_handle, we leave it undefined to let ReactFlow
 * auto-connect to the first available handle on the source node.
 */
export function dbEdgesToReactFlowEdges(dbEdges: WorkflowEdgeDB[]): WorkflowEdge[] {
  return dbEdges.map((edge) => {
    const sourceHandle = edge.source_handle || undefined;
    const isConditionEdge = sourceHandle === 'true' || sourceHandle === 'false';

    return {
      id: edge.id,
      source: edge.source_step_id,
      target: edge.target_step_id,
      sourceHandle,
      targetHandle: edge.target_handle || 'input',
      type: isConditionEdge ? 'conditional' : 'default',
      animated: edge.animated,
      data: {
        label: edge.label || undefined,
        condition: sourceHandle as 'success' | 'failure' | 'true' | 'false' | undefined,
      },
    };
  });
}

// =============================================================================
// REACTFLOW TO DATABASE CONVERSION
// =============================================================================

/**
 * Convert ReactFlow nodes and edges to database format for saving
 */
export function reactFlowToDatabase(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  workflowId: string
): {
  steps: Omit<WorkflowStepDB, 'created_at'>[];
  edges: Omit<WorkflowEdgeDB, 'created_at'>[];
} {
  const steps = nodesToSteps(nodes, edges, workflowId);
  const dbEdges = reactFlowEdgesToDB(edges, workflowId);

  return { steps, edges: dbEdges };
}

/**
 * Convert ReactFlow nodes to database workflow steps
 */
export function nodesToSteps(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  workflowId: string
): Omit<WorkflowStepDB, 'created_at'>[] {
  // Create a map of node to its next steps based on edges
  const nextStepMap = new Map<string, { success?: string; failure?: string }>();

  for (const edge of edges) {
    const current = nextStepMap.get(edge.source) || {};

    if (edge.sourceHandle === 'false' || edge.data?.condition === 'failure') {
      current.failure = edge.target;
    } else {
      current.success = edge.target;
    }

    nextStepMap.set(edge.source, current);
  }

  return nodes.map((node, index) => {
    const nextSteps = nextStepMap.get(node.id);

    return {
      id: node.id,
      workflow_id: workflowId,
      step_number: index + 1,
      step_name: node.data.label,  // API expects step_name
      step_type: node.data.type,   // API expects step_type
      config: {
        ...node.data.config,
        description: node.data.description,
      },
      next_step_on_success: nextSteps?.success || null,
      next_step_on_failure: nextSteps?.failure || null,
      position_x: node.position.x,
      position_y: node.position.y,
      ui_config: {},
    };
  });
}

/**
 * Convert ReactFlow edges to database format
 */
export function reactFlowEdgesToDB(
  edges: WorkflowEdge[],
  workflowId: string
): Omit<WorkflowEdgeDB, 'created_at'>[] {
  return edges.map((edge) => ({
    id: edge.id,
    workflow_id: workflowId,
    source_step_id: edge.source,
    target_step_id: edge.target,
    source_handle: edge.sourceHandle || 'output',
    target_handle: edge.targetHandle || 'input',
    label: edge.data?.label || null,
    animated: edge.animated || false,
  }));
}

// =============================================================================
// LEGACY FORMAT CONVERSION
// =============================================================================

/**
 * Convert old trigger_config.steps format to new format
 * This handles workflows that store steps in trigger_config
 */
export function convertLegacyWorkflow(workflow: {
  id: string;
  name: string;
  description?: string | null;
  trigger_config?: {
    steps?: Array<{
      id: string;
      type: string;
      name: string;
      description?: string | null;
    }>;
  };
}, options?: { layout?: 'horizontal' | 'vertical' }): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
  const legacySteps = workflow.trigger_config?.steps || [];
  const layout = options?.layout || 'vertical'; // Default to vertical (top-to-bottom)

  // Convert legacy steps to nodes
  const nodes: WorkflowNode[] = legacySteps.map((step, index) => {
    const type = mapLegacyType(step.type);
    const defaultData = createDefaultNodeData(type);

    // Position nodes based on layout direction
    const position = layout === 'vertical'
      ? { x: 200, y: 100 + index * 150 }  // Vertical: stack top-to-bottom
      : { x: 100 + index * 320, y: 200 }; // Horizontal: left-to-right

    return {
      id: step.id,
      type,
      position,
      data: {
        label: step.name,
        description: step.description || defaultData.description,
        type,
        config: { ...defaultData.config },
        isConfigured: false,
      },
    };
  });

  // Create edges connecting sequential nodes
  const edges: WorkflowEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const sourceNode = nodes[i];
    // Condition nodes use 'true'/'false' handles, others use 'output'
    const sourceHandle = sourceNode.data.type === 'condition' ? 'true' : 'output';
    const isConditionEdge = sourceNode.data.type === 'condition';

    edges.push({
      id: `edge-${nodes[i].id}-${nodes[i + 1].id}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      sourceHandle,
      targetHandle: 'input',
      type: isConditionEdge ? 'conditional' : 'default',
      animated: false,
      data: isConditionEdge ? { condition: 'true' as const, label: 'True' } : undefined,
    });
  }

  return { nodes, edges };
}

/**
 * Map legacy step types to new node types
 */
function mapLegacyType(legacyType: string): WorkflowNode['data']['type'] {
  const typeMap: Record<string, WorkflowNode['data']['type']> = {
    trigger: 'trigger',
    search: 'search',
    think: 'action', // Legacy "think" becomes "action" with LLM config
    action: 'action',
    condition: 'condition',
    transform: 'transform',
    output: 'output',
    llm: 'action',
    llm_call: 'action',
    api_call: 'action',
    notification: 'action',
  };

  return typeMap[legacyType] || 'action';
}

// =============================================================================
// EXPORT/IMPORT
// =============================================================================

/**
 * Export workflow to JSON format for backup/sharing
 */
export function exportWorkflowToJSON(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  metadata: {
    name: string;
    description: string;
    id?: string;
  }
): string {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    metadata,
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
      animated: edge.animated,
      data: edge.data,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import workflow from JSON format
 */
export function importWorkflowFromJSON(json: string): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: {
    name: string;
    description: string;
  };
} | null {
  try {
    const data = JSON.parse(json);

    if (!data.nodes || !Array.isArray(data.nodes)) {
      return null;
    }

    // Regenerate IDs to avoid conflicts - use proper UUIDs for database compatibility
    const idMap = new Map<string, string>();

    const nodes: WorkflowNode[] = data.nodes.map((node: WorkflowNode) => {
      const newId = crypto.randomUUID();
      idMap.set(node.id, newId);

      return {
        ...node,
        id: newId,
      };
    });

    const edges: WorkflowEdge[] = (data.edges || []).map((edge: WorkflowEdge) => {
      const newSource = idMap.get(edge.source) || edge.source;
      const newTarget = idMap.get(edge.target) || edge.target;

      return {
        ...edge,
        id: crypto.randomUUID(),
        source: newSource,
        target: newTarget,
      };
    });

    return {
      nodes,
      edges,
      metadata: data.metadata || { name: 'Imported Workflow', description: '' },
    };
  } catch {
    return null;
  }
}
