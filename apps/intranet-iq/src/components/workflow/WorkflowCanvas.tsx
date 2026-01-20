"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Zap,
  Search,
  Brain,
  CheckCircle2,
  Plus,
  Trash2,
  Settings,
  Play,
  GitBranch,
  Bot,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from "lucide-react";

export interface WorkflowNode {
  id: string;
  type: "trigger" | "search" | "think" | "action" | "condition" | "output";
  name: string;
  description?: string;
  config?: Record<string, any>;
  position: { x: number; y: number };
  connections: {
    success?: string;
    failure?: string;
  };
}

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  readOnly?: boolean;
}

const nodeTypeConfig: Record<
  WorkflowNode["type"],
  {
    icon: typeof Zap;
    color: string;
    bgColor: string;
    borderColor: string;
    label: string;
  }
> = {
  trigger: {
    icon: Zap,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/50",
    label: "Trigger",
  },
  search: {
    icon: Search,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/50",
    label: "Company Search",
  },
  think: {
    icon: Brain,
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
    borderColor: "border-pink-500/50",
    label: "Think",
  },
  action: {
    icon: Play,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
    label: "Action",
  },
  condition: {
    icon: GitBranch,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/50",
    label: "Condition",
  },
  output: {
    icon: CheckCircle2,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/50",
    label: "Output",
  },
};

const NODE_WIDTH = 240;
const NODE_HEIGHT = 80;

interface ConnectionDrag {
  fromNodeId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export function WorkflowCanvas({
  nodes,
  onNodesChange,
  readOnly = false,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionDrag, setConnectionDrag] = useState<ConnectionDrag | null>(null);
  const [hoveredConnectionTarget, setHoveredConnectionTarget] = useState<string | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));

  const handleNodeDrag = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      if (readOnly) return;

      e.preventDefault();
      setDragging(nodeId);
      setSelectedNode(nodeId);

      const startX = e.clientX;
      const startY = e.clientY;
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const startPos = { ...node.position };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = (moveEvent.clientX - startX) / zoom;
        const dy = (moveEvent.clientY - startY) / zoom;

        onNodesChange(
          nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  position: {
                    x: Math.max(0, startPos.x + dx),
                    y: Math.max(0, startPos.y + dy),
                  },
                }
              : n
          )
        );
      };

      const handleMouseUp = () => {
        setDragging(null);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [nodes, onNodesChange, zoom, readOnly]
  );

  const handleAddNode = (type: WorkflowNode["type"]) => {
    const newNode: WorkflowNode = {
      id: `node-${crypto.randomUUID()}`,
      type,
      name: nodeTypeConfig[type].label,
      description: `New ${nodeTypeConfig[type].label.toLowerCase()} step`,
      position: { x: 100 + nodes.length * 50, y: 100 + nodes.length * 30 },
      connections: {},
    };
    onNodesChange([...nodes, newNode]);
    setSelectedNode(newNode.id);
  };

  const handleDeleteNode = (nodeId: string) => {
    onNodesChange(nodes.filter((n) => n.id !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  // Handle connection drag start from output port
  const handleConnectionDragStart = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      if (readOnly) return;
      e.preventDefault();
      e.stopPropagation();

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const fromX = node.position.x + NODE_WIDTH;
      const fromY = node.position.y + NODE_HEIGHT / 2;

      setConnectionDrag({
        fromNodeId: nodeId,
        fromX,
        fromY,
        toX: fromX,
        toY: fromY,
      });

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const scrollLeft = canvasRef.current.scrollLeft;
        const scrollTop = canvasRef.current.scrollTop;
        const x = (moveEvent.clientX - rect.left + scrollLeft) / zoom;
        const y = (moveEvent.clientY - rect.top + scrollTop) / zoom;

        setConnectionDrag((prev) =>
          prev ? { ...prev, toX: x, toY: y } : null
        );
      };

      const handleMouseUp = () => {
        // Check if we're over a valid target node
        if (hoveredConnectionTarget && hoveredConnectionTarget !== nodeId) {
          // Create the connection
          onNodesChange(
            nodes.map((n) =>
              n.id === nodeId
                ? { ...n, connections: { ...n.connections, success: hoveredConnectionTarget } }
                : n
            )
          );
        }
        setConnectionDrag(null);
        setHoveredConnectionTarget(null);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [nodes, onNodesChange, zoom, readOnly, hoveredConnectionTarget]
  );

  // Handle removing a connection
  const handleRemoveConnection = useCallback(
    (nodeId: string) => {
      if (readOnly) return;
      onNodesChange(
        nodes.map((n) =>
          n.id === nodeId
            ? { ...n, connections: { ...n.connections, success: undefined } }
            : n
        )
      );
    },
    [nodes, onNodesChange, readOnly]
  );

  // Calculate connection paths
  const getConnectionPath = (fromNode: WorkflowNode, toNode: WorkflowNode) => {
    const fromX = fromNode.position.x + NODE_WIDTH;
    const fromY = fromNode.position.y + NODE_HEIGHT / 2;
    const toX = toNode.position.x;
    const toY = toNode.position.y + NODE_HEIGHT / 2;

    const midX = (fromX + toX) / 2;

    return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
  };

  return (
    <div
      className={`relative bg-[#0a0a0f] rounded-xl border border-white/10 overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-[500px]"
      }`}
    >
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#0f0f14]/90 backdrop-blur rounded-lg p-2 border border-white/10">
        {!readOnly && (
          <>
            <span className="text-xs text-white/40 px-2">Add:</span>
            {(
              Object.keys(nodeTypeConfig) as WorkflowNode["type"][]
            ).map((type) => {
              const config = nodeTypeConfig[type];
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() => handleAddNode(type)}
                  className={`p-2 rounded-lg ${config.bgColor} ${config.color} hover:opacity-80 transition-opacity`}
                  title={`Add ${config.label}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
            <div className="w-px h-6 bg-white/10 mx-1" />
          </>
        )}

        {/* Zoom Controls */}
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs text-white/50 min-w-[40px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 overflow-auto"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        }}
      >
        <div
          className="relative min-w-[2000px] min-h-[1000px]"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "0 0",
          }}
        >
          {/* Connection Lines (SVG) */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%" }}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="rgba(96, 165, 250, 0.5)"
                />
              </marker>
              <marker
                id="arrowhead-dragging"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="rgba(74, 222, 128, 0.7)"
                />
              </marker>
            </defs>
            {/* Existing connections */}
            {nodes.map((node) => {
              if (node.connections.success) {
                const targetNode = nodes.find(
                  (n) => n.id === node.connections.success
                );
                if (targetNode) {
                  return (
                    <g key={`${node.id}-${targetNode.id}`}>
                      <path
                        d={getConnectionPath(node, targetNode)}
                        stroke="rgba(96, 165, 250, 0.5)"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                      {/* Invisible wider path for easier clicking */}
                      {!readOnly && (
                        <path
                          d={getConnectionPath(node, targetNode)}
                          stroke="transparent"
                          strokeWidth="12"
                          fill="none"
                          className="cursor-pointer pointer-events-auto"
                          onClick={() => handleRemoveConnection(node.id)}
                        />
                      )}
                    </g>
                  );
                }
              }
              return null;
            })}
            {/* Dragging connection */}
            {connectionDrag && (
              <path
                d={`M ${connectionDrag.fromX} ${connectionDrag.fromY} C ${(connectionDrag.fromX + connectionDrag.toX) / 2} ${connectionDrag.fromY}, ${(connectionDrag.fromX + connectionDrag.toX) / 2} ${connectionDrag.toY}, ${connectionDrag.toX} ${connectionDrag.toY}`}
                stroke={hoveredConnectionTarget ? "rgba(74, 222, 128, 0.7)" : "rgba(96, 165, 250, 0.3)"}
                strokeWidth="2"
                strokeDasharray={hoveredConnectionTarget ? "none" : "5,5"}
                fill="none"
                markerEnd={hoveredConnectionTarget ? "url(#arrowhead-dragging)" : undefined}
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const config = nodeTypeConfig[node.type];
            const Icon = config.icon;
            const isSelected = selectedNode === node.id;
            const isDragging = dragging === node.id;

            return (
              <div
                key={node.id}
                className={`absolute cursor-move select-none transition-shadow ${
                  isDragging ? "z-30" : "z-10"
                }`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: NODE_WIDTH,
                }}
                onMouseDown={(e) => handleNodeDrag(node.id, e)}
                onClick={() => setSelectedNode(node.id)}
              >
                <div
                  className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-4 transition-all ${
                    isSelected
                      ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0a0a0f]"
                      : ""
                  } ${isDragging ? "shadow-xl scale-105" : "hover:scale-[1.02]"}`}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}
                    >
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm truncate">
                        {node.name}
                      </h4>
                      <p className="text-xs text-white/40 capitalize">
                        {node.type}
                      </p>
                    </div>
                    {!readOnly && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open settings modal
                          }}
                          className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                        >
                          <Settings className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNode(node.id);
                          }}
                          className="p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {node.description && (
                    <p className="text-xs text-white/50 line-clamp-2">
                      {node.description}
                    </p>
                  )}

                  {/* Connection Points */}
                  {/* Input port (left) */}
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-all ${
                      connectionDrag && connectionDrag.fromNodeId !== node.id
                        ? hoveredConnectionTarget === node.id
                          ? "bg-green-500 border-2 border-green-400 scale-150"
                          : "bg-white/40 border-2 border-white/60 scale-125"
                        : "bg-white/20 border-2 border-white/40"
                    }`}
                    onMouseEnter={() => {
                      if (connectionDrag && connectionDrag.fromNodeId !== node.id) {
                        setHoveredConnectionTarget(node.id);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredConnectionTarget(null);
                    }}
                  />
                  {/* Output port (right) */}
                  <div
                    className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full transition-all ${
                      !readOnly
                        ? "bg-blue-500 border-2 border-blue-400 cursor-crosshair hover:scale-125 hover:bg-blue-400"
                        : "bg-blue-500 border-2 border-blue-400"
                    } ${connectionDrag?.fromNodeId === node.id ? "scale-125 bg-blue-400" : ""}`}
                    onMouseDown={(e) => handleConnectionDragStart(node.id, e)}
                  />
                </div>
              </div>
            );
          })}

          {/* Start Marker */}
          {nodes.length > 0 && (
            <div
              className="absolute bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full"
              style={{
                left: Math.min(...nodes.map((n) => n.position.x)) - 80,
                top:
                  nodes.find((n) => n.type === "trigger")?.position.y ||
                  nodes[0].position.y + NODE_HEIGHT / 2 - 12,
              }}
            >
              START
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Bot className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/50 mb-2">
              Empty Canvas
            </h3>
            <p className="text-sm text-white/30 mb-4">
              Add nodes from the toolbar to build your workflow
            </p>
            {!readOnly && (
              <button
                onClick={() => handleAddNode("trigger")}
                className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Trigger
              </button>
            )}
          </div>
        </div>
      )}

      {/* Viewer Mode Badge */}
      {readOnly && (
        <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-xs text-yellow-400">
          Viewer Mode - Changes won&apos;t be saved
        </div>
      )}

      {/* Connection dragging hint */}
      {connectionDrag && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-400 pointer-events-none">
          {hoveredConnectionTarget
            ? "Release to connect"
            : "Drag to another node's input to connect"}
        </div>
      )}

      {/* Help hint for connections */}
      {!readOnly && nodes.length > 1 && !nodes.some((n) => n.connections.success) && !connectionDrag && (
        <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40">
          Tip: Drag from the blue dot to connect nodes
        </div>
      )}
    </div>
  );
}
