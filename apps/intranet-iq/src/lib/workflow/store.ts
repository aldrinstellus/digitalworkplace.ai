/**
 * Workflow Builder Store
 * Zustand state management with undo/redo support
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { XYPosition } from '@xyflow/react';
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeData,
  WorkflowNodeType,
  WorkflowBuilderState,
} from './types';
import { createDefaultNodeData, isValidConnection } from './constants';

// =============================================================================
// HELPERS
// =============================================================================

// Generate proper UUIDs for database compatibility
const generateId = () => crypto.randomUUID();
const generateEdgeId = (_source: string, _target: string) => crypto.randomUUID();

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState = {
  nodes: [] as WorkflowNode[],
  edges: [] as WorkflowEdge[],
  selectedNodeId: null as string | null,
  selectedNodeIds: [] as string[],
  selectedEdgeId: null as string | null,
  isPanelOpen: false,
  zoom: 1,
  workflowId: null as string | null,
  workflowName: 'Untitled Workflow',
  workflowDescription: '',
  isDirty: false,
  history: [] as { nodes: WorkflowNode[]; edges: WorkflowEdge[] }[],
  historyIndex: -1,
  clipboard: null as { nodes: WorkflowNode[]; edges: WorkflowEdge[] } | null,
};

// =============================================================================
// STORE
// =============================================================================

export const useWorkflowStore = create<WorkflowBuilderState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // Set nodes
      setNodes: (nodes) => {
        set({ nodes, isDirty: true });
      },

      // Set edges
      setEdges: (edges) => {
        set({ edges, isDirty: true });
      },

      // Add a new node
      addNode: (type: WorkflowNodeType, position: XYPosition) => {
        const id = generateId();
        const nodeData = createDefaultNodeData(type);

        const newNode: WorkflowNode = {
          id,
          type,
          position,
          data: nodeData,
        };

        const state = get();
        state.saveToHistory();

        set((state) => ({
          nodes: [...state.nodes, newNode],
          selectedNodeId: id,
          isPanelOpen: true,
          isDirty: true,
        }));

        return id;
      },

      // Update a node's data
      updateNode: (nodeId: string, data: Partial<WorkflowNodeData>) => {
        const state = get();
        state.saveToHistory();

        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...data } }
              : node
          ),
          isDirty: true,
        }));
      },

      // Delete a node and its connected edges
      deleteNode: (nodeId: string) => {
        const state = get();
        state.saveToHistory();

        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          edges: state.edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
          selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
          isPanelOpen: state.selectedNodeId === nodeId ? false : state.isPanelOpen,
          isDirty: true,
        }));
      },

      // Add a new edge
      addEdge: (connection) => {
        const { source, target, sourceHandle, targetHandle } = connection;

        // Validate connection
        const state = get();
        const sourceNode = state.nodes.find((n) => n.id === source);
        const targetNode = state.nodes.find((n) => n.id === target);

        if (!sourceNode || !targetNode) return;
        if (!isValidConnection(sourceNode.data.type, targetNode.data.type)) return;

        // Check if edge already exists
        const edgeExists = state.edges.some(
          (e) =>
            e.source === source &&
            e.target === target &&
            e.sourceHandle === sourceHandle &&
            e.targetHandle === targetHandle
        );

        if (edgeExists) return;

        state.saveToHistory();

        const edgeId = generateEdgeId(source, target);
        // Condition nodes use 'true'/'false' handles, others use 'output'
        const defaultSourceHandle = sourceNode.data.type === 'condition' ? 'true' : 'output';
        const resolvedSourceHandle = sourceHandle || defaultSourceHandle;
        const resolvedIsCondition = resolvedSourceHandle === 'true' || resolvedSourceHandle === 'false';

        const newEdge: WorkflowEdge = {
          id: edgeId,
          source,
          target,
          sourceHandle: resolvedSourceHandle,
          targetHandle: targetHandle || 'input',
          type: resolvedIsCondition ? 'conditional' : 'default',
          animated: false,
          data: {
            condition: resolvedSourceHandle as 'success' | 'failure' | 'true' | 'false' | undefined,
            label: resolvedIsCondition ? resolvedSourceHandle : undefined,
          },
        };

        set((state) => ({
          edges: [...state.edges, newEdge],
          isDirty: true,
        }));
      },

      // Delete an edge
      deleteEdge: (edgeId: string) => {
        const state = get();
        state.saveToHistory();

        set((state) => ({
          edges: state.edges.filter((edge) => edge.id !== edgeId),
          selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
          isDirty: true,
        }));
      },

      // Select a node
      selectNode: (nodeId: string | null) => {
        set({
          selectedNodeId: nodeId,
          selectedEdgeId: null,
          isPanelOpen: nodeId !== null,
        });
      },

      // Select an edge
      selectEdge: (edgeId: string | null) => {
        set({
          selectedEdgeId: edgeId,
          selectedNodeId: null,
          isPanelOpen: false,
        });
      },

      // Toggle panel
      togglePanel: (open?: boolean) => {
        set((state) => ({
          isPanelOpen: open !== undefined ? open : !state.isPanelOpen,
        }));
      },

      // Set workflow metadata
      setWorkflowMetadata: (name: string, description: string) => {
        set({ workflowName: name, workflowDescription: description, isDirty: true });
      },

      // Load an existing workflow
      loadWorkflow: (id, nodes, edges, name, description) => {
        set({
          workflowId: id,
          nodes,
          edges,
          workflowName: name,
          workflowDescription: description,
          isDirty: false,
          selectedNodeId: null,
          selectedEdgeId: null,
          isPanelOpen: false,
          history: [],
          historyIndex: -1,
        });
      },

      // Reset workflow to initial state
      resetWorkflow: () => {
        set({
          ...initialState,
          history: [],
          historyIndex: -1,
        });
      },

      // Clear workflow (alias for resetWorkflow)
      clearWorkflow: () => {
        set({
          ...initialState,
          history: [],
          historyIndex: -1,
        });
      },

      // Mark workflow as clean (no unsaved changes)
      markClean: () => {
        set({ isDirty: false });
      },

      // Save current state to history
      saveToHistory: () => {
        const state = get();
        const currentState = {
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          edges: JSON.parse(JSON.stringify(state.edges)),
        };

        // Trim history if we're not at the end
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(currentState);

        // Limit history to 50 entries
        if (newHistory.length > 50) {
          newHistory.shift();
        }

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      // Undo
      undo: () => {
        const state = get();
        if (state.historyIndex <= 0) return;

        const prevIndex = state.historyIndex - 1;
        const prevState = state.history[prevIndex];

        if (prevState) {
          set({
            nodes: JSON.parse(JSON.stringify(prevState.nodes)),
            edges: JSON.parse(JSON.stringify(prevState.edges)),
            historyIndex: prevIndex,
            isDirty: true,
          });
        }
      },

      // Redo
      redo: () => {
        const state = get();
        if (state.historyIndex >= state.history.length - 1) return;

        const nextIndex = state.historyIndex + 1;
        const nextState = state.history[nextIndex];

        if (nextState) {
          set({
            nodes: JSON.parse(JSON.stringify(nextState.nodes)),
            edges: JSON.parse(JSON.stringify(nextState.edges)),
            historyIndex: nextIndex,
            isDirty: true,
          });
        }
      },

      // Check if can undo
      canUndo: () => {
        const state = get();
        return state.historyIndex > 0;
      },

      // Check if can redo
      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },

      // Multi-select: Add node to selection
      addToSelection: (nodeId: string) => {
        set((state) => ({
          selectedNodeIds: state.selectedNodeIds.includes(nodeId)
            ? state.selectedNodeIds
            : [...state.selectedNodeIds, nodeId],
          selectedNodeId: nodeId,
          selectedEdgeId: null,
        }));
      },

      // Multi-select: Remove node from selection
      removeFromSelection: (nodeId: string) => {
        set((state) => ({
          selectedNodeIds: state.selectedNodeIds.filter((id) => id !== nodeId),
          selectedNodeId: state.selectedNodeIds.length > 1
            ? state.selectedNodeIds.find((id) => id !== nodeId) || null
            : null,
        }));
      },

      // Multi-select: Clear selection
      clearSelection: () => {
        set({
          selectedNodeIds: [],
          selectedNodeId: null,
          selectedEdgeId: null,
          isPanelOpen: false,
        });
      },

      // Multi-select: Set multiple selections
      setSelection: (nodeIds: string[]) => {
        set({
          selectedNodeIds: nodeIds,
          selectedNodeId: nodeIds.length > 0 ? nodeIds[0] : null,
          selectedEdgeId: null,
          isPanelOpen: nodeIds.length === 1,
        });
      },

      // Clipboard: Copy selected nodes
      copySelectedNodes: () => {
        const state = get();
        const nodeIds = state.selectedNodeIds.length > 0
          ? state.selectedNodeIds
          : state.selectedNodeId
            ? [state.selectedNodeId]
            : [];

        if (nodeIds.length === 0) return;

        const nodesToCopy = state.nodes.filter((n) => nodeIds.includes(n.id));
        const edgesToCopy = state.edges.filter(
          (e) => nodeIds.includes(e.source) && nodeIds.includes(e.target)
        );

        set({
          clipboard: {
            nodes: JSON.parse(JSON.stringify(nodesToCopy)),
            edges: JSON.parse(JSON.stringify(edgesToCopy)),
          },
        });
      },

      // Clipboard: Paste nodes
      pasteNodes: (offset: { x: number; y: number } = { x: 50, y: 50 }) => {
        const state = get();
        if (!state.clipboard || state.clipboard.nodes.length === 0) return;

        state.saveToHistory();

        // Generate new IDs and create ID mapping
        const idMap = new Map<string, string>();
        const newNodes: WorkflowNode[] = state.clipboard.nodes.map((node) => {
          const newId = generateId();
          idMap.set(node.id, newId);
          return {
            ...node,
            id: newId,
            position: {
              x: node.position.x + offset.x,
              y: node.position.y + offset.y,
            },
            selected: true,
          };
        });

        // Create new edges with mapped IDs
        const newEdges: WorkflowEdge[] = state.clipboard.edges.map((edge) => {
          const newSource = idMap.get(edge.source) || edge.source;
          const newTarget = idMap.get(edge.target) || edge.target;
          return {
            ...edge,
            id: generateEdgeId(newSource, newTarget),
            source: newSource,
            target: newTarget,
          };
        });

        set((state) => ({
          nodes: [...state.nodes, ...newNodes],
          edges: [...state.edges, ...newEdges],
          selectedNodeIds: newNodes.map((n) => n.id),
          selectedNodeId: newNodes.length > 0 ? newNodes[0].id : null,
          isDirty: true,
        }));
      },

      // Clipboard: Duplicate selected node(s)
      duplicateSelectedNodes: () => {
        const state = get();
        state.copySelectedNodes();
        state.pasteNodes({ x: 50, y: 50 });
      },

      // Clipboard: Check if can paste
      canPaste: () => {
        const state = get();
        return state.clipboard !== null && state.clipboard.nodes.length > 0;
      },

      // Delete selected nodes (supports multi-select)
      deleteSelectedNodes: () => {
        const state = get();
        const nodeIds = state.selectedNodeIds.length > 0
          ? state.selectedNodeIds
          : state.selectedNodeId
            ? [state.selectedNodeId]
            : [];

        if (nodeIds.length === 0) return;

        state.saveToHistory();

        set((state) => ({
          nodes: state.nodes.filter((node) => !nodeIds.includes(node.id)),
          edges: state.edges.filter(
            (edge) => !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
          ),
          selectedNodeId: null,
          selectedNodeIds: [],
          selectedEdgeId: null,
          isPanelOpen: false,
          isDirty: true,
        }));
      },
    })),
    { name: 'workflow-store' }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectSelectedNode = (state: WorkflowBuilderState) =>
  state.nodes.find((n) => n.id === state.selectedNodeId);

export const selectSelectedEdge = (state: WorkflowBuilderState) =>
  state.edges.find((e) => e.id === state.selectedEdgeId);

export const selectNodeById = (nodeId: string) => (state: WorkflowBuilderState) =>
  state.nodes.find((n) => n.id === nodeId);

export const selectNodeCount = (state: WorkflowBuilderState) => state.nodes.length;

export const selectEdgeCount = (state: WorkflowBuilderState) => state.edges.length;

export const selectIsWorkflowEmpty = (state: WorkflowBuilderState) =>
  state.nodes.length === 0;

export const selectHasUnsavedChanges = (state: WorkflowBuilderState) => state.isDirty;
