"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Connection,
  type OnConnect,
  type NodeChange,
  type EdgeChange,
  ConnectionLineType,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./nodes";
import { edgeTypes } from "./edges";
import { WorkflowControls } from "./WorkflowControls";
import { ComponentPalette } from "./ComponentPalette";
import { ContextMenu, type ContextMenuPosition } from "./ContextMenu";
import type { WorkflowNode, WorkflowEdge, WorkflowNodeType } from "@/lib/workflow/types";
import { useWorkflowStore } from "@/lib/workflow/store";
import { validateConnection } from "@/lib/workflow/validation";
import { CANVAS_DEFAULTS, NODE_TYPE_CONFIG } from "@/lib/workflow/constants";

interface WorkflowCanvasNewProps {
  onSave?: () => void;
  onNodeSelect?: (nodeId: string | null) => void;
  readOnly?: boolean;
  isSaving?: boolean;
}

// Custom SVG markers for edges
const EdgeMarkers = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
      <marker
        id="arrow"
        markerWidth="12"
        markerHeight="12"
        refX="8"
        refY="6"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M2,2 L10,6 L2,10 L4,6 Z"
          fill="rgba(255, 255, 255, 0.4)"
        />
      </marker>
      <marker
        id="arrow-success"
        markerWidth="12"
        markerHeight="12"
        refX="8"
        refY="6"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M2,2 L10,6 L2,10 L4,6 Z"
          fill="#22c55e"
        />
      </marker>
      <marker
        id="arrow-failure"
        markerWidth="12"
        markerHeight="12"
        refX="8"
        refY="6"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M2,2 L10,6 L2,10 L4,6 Z"
          fill="#ef4444"
        />
      </marker>
    </defs>
  </svg>
);

export function WorkflowCanvasNew({
  onSave,
  onNodeSelect,
  readOnly = false,
  isSaving = false,
}: WorkflowCanvasNewProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Component palette state
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: ContextMenuPosition;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
  });

  // Zustand store
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    selectNode,
    saveToHistory,
    selectedNodeId,
    selectedNodeIds,
    setSelection,
    clearSelection,
    copySelectedNodes,
    pasteNodes,
    duplicateSelectedNodes,
    deleteSelectedNodes,
    canPaste,
    addNode,
    togglePanel,
  } = useWorkflowStore();

  // ReactFlow state (synced with Zustand)
  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  // Sync ReactFlow state to Zustand store
  useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

  // Handle node changes (position, selection)
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (readOnly) return;
      onNodesChange(changes as NodeChange<WorkflowNode>[]);

      // Sync to store after position changes
      const hasPositionChange = changes.some(
        (c) => c.type === "position" && !c.dragging
      );
      if (hasPositionChange) {
        setStoreNodes(nodes as WorkflowNode[]);
      }
    },
    [onNodesChange, setStoreNodes, nodes, readOnly]
  );

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (readOnly) return;
      onEdgesChange(changes);
    },
    [onEdgesChange, readOnly]
  );

  // Handle new connections
  const handleConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (readOnly) return;

      // Validate connection
      const validationResult = validateConnection(
        connection,
        nodes as WorkflowNode[],
        edges as WorkflowEdge[]
      );

      if (!validationResult.isValid) {
        console.warn("Invalid connection:", validationResult.errors);
        return;
      }

      saveToHistory();

      // Determine edge type based on source handle
      const isConditionEdge =
        connection.sourceHandle === "true" || connection.sourceHandle === "false";

      const newEdge = {
        ...connection,
        type: isConditionEdge ? "conditional" : "default",
        animated: false,
        data: {
          condition: connection.sourceHandle as "true" | "false" | undefined,
          label: isConditionEdge ? connection.sourceHandle : undefined,
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      setStoreEdges([...storeEdges, newEdge as WorkflowEdge]);
    },
    [nodes, edges, storeEdges, setEdges, setStoreEdges, saveToHistory, readOnly]
  );

  // Handle node selection (supports multi-select)
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: unknown[] }) => {
      const nodeIds = (selectedNodes as WorkflowNode[]).map((n) => n.id);

      if (nodeIds.length === 0) {
        clearSelection();
        onNodeSelect?.(null);
      } else if (nodeIds.length === 1) {
        selectNode(nodeIds[0]);
        onNodeSelect?.(nodeIds[0]);
      } else {
        setSelection(nodeIds);
        onNodeSelect?.(nodeIds[0]);
      }
    },
    [selectNode, setSelection, clearSelection, onNodeSelect]
  );

  // Handle drag over for adding nodes
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle drop for adding nodes
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (readOnly) return;

      const type = event.dataTransfer.getData(
        "application/reactflow"
      ) as WorkflowNodeType;

      if (!type || !NODE_TYPE_CONFIG[type]) return;

      // Use screenToFlowPosition for accurate placement
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Center the node on drop position (node width ~260px)
      const centeredPosition = {
        x: position.x - 130,
        y: position.y - 40,
      };

      useWorkflowStore.getState().addNode(type, centeredPosition);
    },
    [readOnly, screenToFlowPosition]
  );

  // Context menu handlers
  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (readOnly) return;
      event.preventDefault();
      setContextMenu({
        isOpen: true,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    [readOnly]
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleContextMenuAddNode = useCallback(
    (type: WorkflowNodeType) => {
      // Use screenToFlowPosition for accurate placement
      const position = screenToFlowPosition({
        x: contextMenu.position.x,
        y: contextMenu.position.y,
      });

      // Center the node on context menu position
      const centeredPosition = {
        x: position.x - 130,
        y: position.y - 40,
      };

      addNode(type, centeredPosition);
    },
    [contextMenu.position, addNode, screenToFlowPosition]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (readOnly) return;

      const isMod = event.metaKey || event.ctrlKey;

      // Undo: Cmd/Ctrl + Z
      if (isMod && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        useWorkflowStore.getState().undo();
      }

      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if ((isMod && event.key === "z" && event.shiftKey) || (isMod && event.key === "y")) {
        event.preventDefault();
        useWorkflowStore.getState().redo();
      }

      // Copy: Cmd/Ctrl + C
      if (isMod && event.key === "c") {
        if (selectedNodeId || selectedNodeIds.length > 0) {
          event.preventDefault();
          copySelectedNodes();
        }
      }

      // Paste: Cmd/Ctrl + V
      if (isMod && event.key === "v") {
        if (canPaste()) {
          event.preventDefault();
          pasteNodes();
        }
      }

      // Duplicate: Cmd/Ctrl + D
      if (isMod && event.key === "d") {
        if (selectedNodeId || selectedNodeIds.length > 0) {
          event.preventDefault();
          duplicateSelectedNodes();
        }
      }

      // Select All: Cmd/Ctrl + A
      if (isMod && event.key === "a") {
        event.preventDefault();
        const allNodeIds = useWorkflowStore.getState().nodes.map((n) => n.id);
        setSelection(allNodeIds);
      }

      // Delete: Backspace or Delete
      if (event.key === "Backspace" || event.key === "Delete") {
        if (selectedNodeId || selectedNodeIds.length > 0) {
          event.preventDefault();
          deleteSelectedNodes();
        }
      }

      // Escape: Deselect and close context menu
      if (event.key === "Escape") {
        closeContextMenu();
        clearSelection();
        setIsPaletteOpen(false);
      }

      // Enter: Open panel for selected node
      if (event.key === "Enter" && selectedNodeId) {
        event.preventDefault();
        togglePanel(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    readOnly,
    selectedNodeId,
    selectedNodeIds,
    copySelectedNodes,
    pasteNodes,
    duplicateSelectedNodes,
    deleteSelectedNodes,
    setSelection,
    clearSelection,
    closeContextMenu,
    togglePanel,
    canPaste,
  ]);

  return (
    <div
      ref={reactFlowWrapper}
      className="relative w-full h-full bg-[var(--bg-obsidian)] overflow-hidden"
      onContextMenu={handleContextMenu}
    >
      <EdgeMarkers />

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={closeContextMenu}
        selectedNodeId={selectedNodeId}
        onDeleteNode={deleteSelectedNodes}
        onDuplicateNode={duplicateSelectedNodes}
        onEditNode={() => togglePanel(true)}
        onPaste={pasteNodes}
        canPaste={canPaste()}
        onAddNode={handleContextMenuAddNode}
      />

      {/* Component Palette (Right Panel) */}
      {!readOnly && (
        <ComponentPalette
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
        />
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onSelectionChange={handleSelectionChange}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: "default",
          animated: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
        }}
        fitView
        fitViewOptions={{
          padding: 0.3,
          minZoom: CANVAS_DEFAULTS.minZoom,
          maxZoom: CANVAS_DEFAULTS.maxZoom,
        }}
        minZoom={CANVAS_DEFAULTS.minZoom}
        maxZoom={CANVAS_DEFAULTS.maxZoom}
        snapToGrid={CANVAS_DEFAULTS.snapToGrid}
        snapGrid={[CANVAS_DEFAULTS.gridSize, CANVAS_DEFAULTS.gridSize]}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={null}
        panOnScroll
        selectionOnDrag
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        className="workflow-canvas"
      >
        {/* Subtle dot grid background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(255, 255, 255, 0.03)"
        />

        {/* Minimap - Compact in bottom-right */}
        <MiniMap
          nodeColor={(node) => {
            const type = node.data?.type as WorkflowNodeType;
            return NODE_TYPE_CONFIG[type]?.color || "#666";
          }}
          maskColor="rgba(0, 0, 0, 0.85)"
          style={{
            backgroundColor: "var(--bg-charcoal)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "8px",
            width: 140,
            height: 90,
          }}
          className="!bottom-16 !right-4"
          pannable
          zoomable
        />

        {/* Bottom Controls */}
        {!readOnly && (
          <WorkflowControls
            onSave={onSave}
            onTogglePalette={() => setIsPaletteOpen(!isPaletteOpen)}
            isSaving={isSaving}
            isPaletteOpen={isPaletteOpen}
          />
        )}

        {/* Read-only Badge */}
        {readOnly && (
          <Panel position="top-right" className="m-4">
            <div className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-xs text-yellow-400">
              View Only
            </div>
          </Panel>
        )}

        {/* Empty State */}
        {nodes.length === 0 && (
          <Panel position="top-center" className="mt-32">
            <div className="text-center max-w-xs">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-ember)]/20 to-[var(--accent-copper)]/20
                              border border-[var(--accent-ember)]/30 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-[var(--accent-ember)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">
                Build Your Workflow
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Click the <span className="text-[var(--accent-ember)]">+</span> button to add components,
                or drag them from the right panel onto the canvas.
              </p>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
