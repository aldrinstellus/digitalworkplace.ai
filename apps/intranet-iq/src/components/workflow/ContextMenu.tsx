"use client";

import { memo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Clipboard,
  Trash2,
  Edit3,
  GitBranch,
  Layers,
  Zap,
  Search,
  Play,
  Shuffle,
  CheckCircle,
  UserCheck,
} from "lucide-react";
import type { WorkflowNodeType } from "@/lib/workflow/types";
import { NODE_TYPE_CONFIG } from "@/lib/workflow/constants";

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuProps {
  isOpen: boolean;
  position: ContextMenuPosition;
  onClose: () => void;
  // Node actions
  selectedNodeId?: string | null;
  onDeleteNode?: () => void;
  onDuplicateNode?: () => void;
  onEditNode?: () => void;
  // Canvas actions
  onPaste?: () => void;
  canPaste?: boolean;
  // Add node actions
  onAddNode?: (type: WorkflowNodeType) => void;
}

const nodeTypeIcons: Record<WorkflowNodeType, React.ElementType> = {
  trigger: Zap,
  search: Search,
  action: Play,
  condition: GitBranch,
  transform: Shuffle,
  output: CheckCircle,
  approval: UserCheck,
};

function ContextMenuComponent({
  isOpen,
  position,
  onClose,
  selectedNodeId,
  onDeleteNode,
  onDuplicateNode,
  onEditNode,
  onPaste,
  canPaste,
  onAddNode,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Adjust position to keep menu in viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200),
    y: Math.min(position.y, window.innerHeight - 300),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          style={{
            position: "fixed",
            left: adjustedPosition.x,
            top: adjustedPosition.y,
            zIndex: 1000,
          }}
          className="min-w-[180px] bg-[var(--bg-charcoal)] border border-[var(--border-default)] rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Node Actions (when a node is selected) */}
          {selectedNodeId && (
            <>
              <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  Node Actions
                </span>
              </div>
              <div className="py-1">
                <MenuItem
                  icon={Edit3}
                  label="Edit Node"
                  shortcut="Enter"
                  onClick={() => {
                    onEditNode?.();
                    onClose();
                  }}
                />
                <MenuItem
                  icon={Copy}
                  label="Duplicate"
                  shortcut="⌘D"
                  onClick={() => {
                    onDuplicateNode?.();
                    onClose();
                  }}
                />
                <MenuItem
                  icon={Trash2}
                  label="Delete"
                  shortcut="⌫"
                  onClick={() => {
                    onDeleteNode?.();
                    onClose();
                  }}
                  variant="danger"
                />
              </div>
            </>
          )}

          {/* Canvas Actions (when no node selected) */}
          {!selectedNodeId && (
            <>
              <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  Canvas
                </span>
              </div>
              <div className="py-1">
                <MenuItem
                  icon={Clipboard}
                  label="Paste"
                  shortcut="⌘V"
                  onClick={() => {
                    onPaste?.();
                    onClose();
                  }}
                  disabled={!canPaste}
                />
              </div>

              {/* Add Node Submenu */}
              <div className="px-3 py-2 border-t border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  Add Node
                </span>
              </div>
              <div className="py-1 max-h-[200px] overflow-y-auto">
                {(Object.keys(NODE_TYPE_CONFIG) as WorkflowNodeType[]).map((type) => {
                  const config = NODE_TYPE_CONFIG[type];
                  const Icon = nodeTypeIcons[type];
                  return (
                    <MenuItem
                      key={type}
                      icon={Icon}
                      label={config.label}
                      iconColor={config.color}
                      onClick={() => {
                        onAddNode?.(type);
                        onClose();
                      }}
                    />
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
  iconColor?: string;
}

function MenuItem({
  icon: Icon,
  label,
  shortcut,
  onClick,
  disabled,
  variant = "default",
  iconColor,
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-3 py-2 flex items-center gap-3 text-sm transition-colors
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${
          variant === "danger"
            ? "text-red-400 hover:bg-red-500/10"
            : "text-[var(--text-primary)] hover:bg-[var(--bg-slate)]"
        }
      `}
    >
      <Icon
        className="w-4 h-4"
        style={iconColor ? { color: iconColor } : undefined}
      />
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <span className="text-xs text-[var(--text-muted)]">{shortcut}</span>
      )}
    </button>
  );
}

export const ContextMenu = memo(ContextMenuComponent);
export default ContextMenu;
