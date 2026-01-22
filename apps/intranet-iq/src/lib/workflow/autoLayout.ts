/**
 * Auto Layout for Workflow Builder
 * Uses Dagre for automatic node positioning
 */

import dagre from 'dagre';
import type { WorkflowNode, WorkflowEdge } from './types';
import { CANVAS_DEFAULTS } from './constants';

// =============================================================================
// LAYOUT OPTIONS
// =============================================================================

export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL';

export interface LayoutOptions {
  direction: LayoutDirection;
  nodeWidth: number;
  nodeHeight: number;
  nodeSeparation: number;
  rankSeparation: number;
  marginX: number;
  marginY: number;
}

const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  direction: 'TB', // Top to Bottom (vertical flow) - default for modern workflow builders
  nodeWidth: CANVAS_DEFAULTS.nodeWidth,
  nodeHeight: CANVAS_DEFAULTS.nodeHeight,
  nodeSeparation: 60,
  rankSeparation: 120,
  marginX: 80,
  marginY: 80,
};

// =============================================================================
// AUTO LAYOUT FUNCTION
// =============================================================================

/**
 * Apply automatic layout to nodes using Dagre
 */
export function applyAutoLayout(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options: Partial<LayoutOptions> = {}
): WorkflowNode[] {
  const opts = { ...DEFAULT_LAYOUT_OPTIONS, ...options };

  // Create a new directed graph
  const g = new dagre.graphlib.Graph();

  // Set graph options
  g.setGraph({
    rankdir: opts.direction,
    nodesep: opts.nodeSeparation,
    ranksep: opts.rankSeparation,
    marginx: opts.marginX,
    marginy: opts.marginY,
  });

  // Required by dagre
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph
  for (const node of nodes) {
    g.setNode(node.id, {
      width: opts.nodeWidth,
      height: opts.nodeHeight,
    });
  }

  // Add edges to the graph
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  // Run the layout algorithm
  dagre.layout(g);

  // Apply the calculated positions to nodes
  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);

    if (!nodeWithPosition) {
      return node;
    }

    return {
      ...node,
      position: {
        // Dagre returns center positions, we need top-left
        x: nodeWithPosition.x - opts.nodeWidth / 2,
        y: nodeWithPosition.y - opts.nodeHeight / 2,
      },
    };
  });
}

// =============================================================================
// LAYOUT PRESETS
// =============================================================================

/**
 * Apply horizontal layout (left to right)
 */
export function applyHorizontalLayout(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  return applyAutoLayout(nodes, edges, { direction: 'LR' });
}

/**
 * Apply vertical layout (top to bottom)
 */
export function applyVerticalLayout(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  return applyAutoLayout(nodes, edges, { direction: 'TB' });
}

/**
 * Apply compact layout with smaller spacing
 */
export function applyCompactLayout(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  return applyAutoLayout(nodes, edges, {
    nodeSeparation: 40,
    rankSeparation: 100,
    marginX: 50,
    marginY: 50,
  });
}

/**
 * Apply spacious layout with larger spacing
 */
export function applySpaciousLayout(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  return applyAutoLayout(nodes, edges, {
    nodeSeparation: 120,
    rankSeparation: 200,
    marginX: 150,
    marginY: 150,
  });
}

// =============================================================================
// LAYOUT HELPERS
// =============================================================================

/**
 * Center nodes in the viewport
 */
export function centerNodes(
  nodes: WorkflowNode[],
  viewportWidth: number,
  viewportHeight: number
): WorkflowNode[] {
  if (nodes.length === 0) return nodes;

  // Calculate bounding box
  const minX = Math.min(...nodes.map((n) => n.position.x));
  const maxX = Math.max(...nodes.map((n) => n.position.x + CANVAS_DEFAULTS.nodeWidth));
  const minY = Math.min(...nodes.map((n) => n.position.y));
  const maxY = Math.max(...nodes.map((n) => n.position.y + CANVAS_DEFAULTS.nodeHeight));

  const graphWidth = maxX - minX;
  const graphHeight = maxY - minY;

  // Calculate offset to center
  const offsetX = (viewportWidth - graphWidth) / 2 - minX;
  const offsetY = (viewportHeight - graphHeight) / 2 - minY;

  // Apply offset to all nodes
  return nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY,
    },
  }));
}

/**
 * Align nodes to grid
 */
export function alignToGrid(
  nodes: WorkflowNode[],
  gridSize: number = CANVAS_DEFAULTS.gridSize
): WorkflowNode[] {
  return nodes.map((node) => ({
    ...node,
    position: {
      x: Math.round(node.position.x / gridSize) * gridSize,
      y: Math.round(node.position.y / gridSize) * gridSize,
    },
  }));
}

/**
 * Distribute nodes evenly horizontally
 */
export function distributeHorizontally(
  nodes: WorkflowNode[],
  startX: number = 100
): WorkflowNode[] {
  const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);
  const spacing = CANVAS_DEFAULTS.nodeWidth + 100;

  return sortedNodes.map((node, index) => ({
    ...node,
    position: {
      x: startX + index * spacing,
      y: node.position.y,
    },
  }));
}

/**
 * Distribute nodes evenly vertically
 */
export function distributeVertically(
  nodes: WorkflowNode[],
  startY: number = 100
): WorkflowNode[] {
  const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);
  const spacing = CANVAS_DEFAULTS.nodeHeight + 80;

  return sortedNodes.map((node, index) => ({
    ...node,
    position: {
      x: node.position.x,
      y: startY + index * spacing,
    },
  }));
}

/**
 * Align selected nodes to a common edge
 */
export function alignNodes(
  nodes: WorkflowNode[],
  alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY'
): WorkflowNode[] {
  if (nodes.length <= 1) return nodes;

  let alignValue: number;

  switch (alignment) {
    case 'left':
      alignValue = Math.min(...nodes.map((n) => n.position.x));
      return nodes.map((n) => ({ ...n, position: { ...n.position, x: alignValue } }));

    case 'right':
      alignValue = Math.max(...nodes.map((n) => n.position.x + CANVAS_DEFAULTS.nodeWidth));
      return nodes.map((n) => ({
        ...n,
        position: { ...n.position, x: alignValue - CANVAS_DEFAULTS.nodeWidth },
      }));

    case 'top':
      alignValue = Math.min(...nodes.map((n) => n.position.y));
      return nodes.map((n) => ({ ...n, position: { ...n.position, y: alignValue } }));

    case 'bottom':
      alignValue = Math.max(...nodes.map((n) => n.position.y + CANVAS_DEFAULTS.nodeHeight));
      return nodes.map((n) => ({
        ...n,
        position: { ...n.position, y: alignValue - CANVAS_DEFAULTS.nodeHeight },
      }));

    case 'centerX':
      alignValue =
        (Math.min(...nodes.map((n) => n.position.x)) +
          Math.max(...nodes.map((n) => n.position.x + CANVAS_DEFAULTS.nodeWidth))) /
        2;
      return nodes.map((n) => ({
        ...n,
        position: { ...n.position, x: alignValue - CANVAS_DEFAULTS.nodeWidth / 2 },
      }));

    case 'centerY':
      alignValue =
        (Math.min(...nodes.map((n) => n.position.y)) +
          Math.max(...nodes.map((n) => n.position.y + CANVAS_DEFAULTS.nodeHeight))) /
        2;
      return nodes.map((n) => ({
        ...n,
        position: { ...n.position, y: alignValue - CANVAS_DEFAULTS.nodeHeight / 2 },
      }));

    default:
      return nodes;
  }
}
