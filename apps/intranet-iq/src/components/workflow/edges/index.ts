/**
 * Edge Type Registry
 * Maps edge types to their components for ReactFlow
 */

import type { EdgeTypes } from "@xyflow/react";
import { DefaultEdge } from "./DefaultEdge";
import { ConditionalEdge } from "./ConditionalEdge";

// Using 'as EdgeTypes' to satisfy ReactFlow's type requirements
export const edgeTypes = {
  default: DefaultEdge,
  conditional: ConditionalEdge,
} as EdgeTypes;

export { DefaultEdge } from "./DefaultEdge";
export { ConditionalEdge } from "./ConditionalEdge";
