"use client";

import { useRef } from "react";
import { GripVertical } from "lucide-react";

interface DraggableWidgetProps {
  id: string;
  children: React.ReactNode;
  isEditMode: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (id: string) => void;
  onDrop: (targetId: string) => void;
  className?: string;
}

export function DraggableWidget({
  id,
  children,
  isEditMode,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  className = "",
}: DraggableWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    // Use a small delay to allow the ghost image to be captured
    setTimeout(() => {
      onDragStart(id);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    onDragOver(id);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    onDrop(id);
  };

  const handleDragEnd = () => {
    onDragEnd();
  };

  return (
    <div
      ref={widgetRef}
      draggable={isEditMode}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      className={`relative transition-all duration-150 ${className} ${
        isEditMode ? "cursor-move" : ""
      } ${
        isDropTarget && !isDragging
          ? "ring-2 ring-[#10b981] ring-dashed ring-offset-2 ring-offset-[var(--bg-obsidian)]"
          : ""
      } ${
        isDragging ? "opacity-50 scale-[0.98] shadow-2xl shadow-[#10b981]/20" : ""
      }`}
    >
      {/* Drag Handle - Only visible in edit mode */}
      {isEditMode && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 -translate-x-full z-10 flex items-center justify-center w-6 h-12 rounded-l-lg bg-[var(--bg-charcoal)] border border-r-0 border-[var(--border-subtle)] cursor-grab active:cursor-grabbing hover:bg-[var(--bg-slate)] transition-colors group">
          <GripVertical
            className="w-4 h-4 transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
          />
        </div>
      )}

      {/* Widget Content */}
      {children}
    </div>
  );
}

// Widget wrapper for individual widgets (like news, events) that need drag handle in header
interface DraggableWidgetHeaderProps {
  isEditMode: boolean;
  children: React.ReactNode;
}

export function DraggableWidgetHeader({ isEditMode, children }: DraggableWidgetHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      {isEditMode && (
        <GripVertical
          className="w-4 h-4 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          style={{ color: "rgba(255,255,255,0.5)" }}
        />
      )}
      {children}
    </div>
  );
}

// Edit mode toggle button
interface EditLayoutButtonProps {
  isEditMode: boolean;
  onToggle: () => void;
}

export function EditLayoutButton({ isEditMode, onToggle }: EditLayoutButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        isEditMode
          ? "bg-[#10b981] text-white hover:bg-[#059669]"
          : "bg-[var(--bg-charcoal)] text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/10"
      }`}
    >
      {isEditMode ? "Done" : "Customize"}
    </button>
  );
}
