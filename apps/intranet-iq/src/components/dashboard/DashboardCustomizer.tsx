"use client";

import { useState } from "react";
import {
  Settings2,
  X,
  Eye,
  EyeOff,
  GripVertical,
  RotateCcw,
  FileText,
  Users,
  Calendar,
  Newspaper,
  Clock,
  TrendingUp,
  Video,
} from "lucide-react";
import { useDashboardWidgets, DashboardWidget } from "@/lib/hooks/useDashboardWidgets";

const widgetIcons: Record<string, typeof Settings2> = {
  "quick-actions": FileText,
  news: Newspaper,
  events: Calendar,
  activity: Clock,
  trending: TrendingUp,
  meeting: Video,
};

const widgetColors: Record<string, string> = {
  "quick-actions": "text-blue-400 bg-blue-500/20",
  news: "text-purple-400 bg-purple-500/20",
  events: "text-green-400 bg-green-500/20",
  activity: "text-cyan-400 bg-cyan-500/20",
  trending: "text-yellow-400 bg-yellow-500/20",
  meeting: "text-orange-400 bg-orange-500/20",
};

interface DashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardCustomizer({ isOpen, onClose }: DashboardCustomizerProps) {
  const { widgets, toggleWidget, reorderWidgets, resetWidgets } = useDashboardWidgets();
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedWidget && draggedWidget !== targetId) {
      reorderWidgets(draggedWidget, targetId);
    }
    setDraggedWidget(null);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed right-4 top-20 z-50 w-80 bg-[#0f0f14] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-blue-400" />
            Customize Dashboard
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Widget List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <p className="text-xs text-white/50 mb-3">
            Drag to reorder • Click eye to show/hide
          </p>

          <div className="space-y-2">
            {widgets
              .sort((a, b) => a.order - b.order)
              .map((widget) => {
                const Icon = widgetIcons[widget.type] || FileText;
                const colorClass = widgetColors[widget.type] || "text-white/60 bg-white/10";

                return (
                  <div
                    key={widget.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, widget.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, widget.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-move ${
                      draggedWidget === widget.id
                        ? "border-blue-500 bg-blue-500/10 opacity-50"
                        : widget.visible
                        ? "border-white/10 bg-white/5 hover:border-white/20"
                        : "border-white/5 bg-transparent opacity-50"
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-white/30 flex-shrink-0" />

                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass.split(" ")[1]}`}>
                      <Icon className={`w-4 h-4 ${colorClass.split(" ")[0]}`} />
                    </div>

                    <span className={`flex-1 text-sm ${widget.visible ? "text-white" : "text-white/40"}`}>
                      {widget.title}
                    </span>

                    <button
                      onClick={() => toggleWidget(widget.id)}
                      className={`p-1.5 rounded transition-colors ${
                        widget.visible
                          ? "text-green-400 hover:bg-green-500/20"
                          : "text-white/30 hover:bg-white/10"
                      }`}
                      title={widget.visible ? "Hide widget" : "Show widget"}
                    >
                      {widget.visible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={resetWidgets}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </button>
        </div>
      </div>
    </>
  );
}

// Button to trigger the customizer
export function DashboardCustomizeButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
      title="Customize Dashboard"
    >
      <Settings2 className="w-4 h-4" />
    </button>
  );
}
