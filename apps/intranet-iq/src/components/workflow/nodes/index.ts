/**
 * Node Type Registry
 * Maps node types to their components for ReactFlow
 */

import type { NodeTypes } from "@xyflow/react";
import BaseNode from "./BaseNode";

// All node types use the same BaseNode component
// The type-specific styling comes from NODE_TYPE_CONFIG
// Using 'as NodeTypes' to satisfy ReactFlow's type requirements
export const nodeTypes = {
  trigger: BaseNode,
  search: BaseNode,
  action: BaseNode,
  condition: BaseNode,
  transform: BaseNode,
  output: BaseNode,
} as NodeTypes;

export { BaseNode } from "./BaseNode";
