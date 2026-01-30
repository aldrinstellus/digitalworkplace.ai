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
  Plus,
  Trash2,
  Bookmark,
  Target,
  Megaphone,
  BarChart3,
  Cake,
  LineChart,
  CloudSun,
  CalendarDays,
  Zap,
  ChevronDown,
  Check,
  Sparkles,
} from "lucide-react";
import { useDashboardWidgets, WIDGET_CATALOG, WidgetCatalogItem, WidgetType } from "@/lib/hooks/useDashboardWidgets";
import { motion, AnimatePresence } from "framer-motion";

const widgetIcons: Record<string, typeof Settings2> = {
  "quick-actions": Zap,
  news: Newspaper,
  events: Calendar,
  activity: Clock,
  trending: TrendingUp,
  meeting: Video,
  calendar: CalendarDays,
  weather: CloudSun,
  bookmarks: Bookmark,
  "team-directory": Users,
  announcements: Megaphone,
  polls: BarChart3,
  birthdays: Cake,
  performance: LineChart,
  goals: Target,
};

const widgetColors: Record<string, string> = {
  "quick-actions": "text-blue-400 bg-blue-500/20",
  news: "text-purple-400 bg-purple-500/20",
  events: "text-green-400 bg-green-500/20",
  activity: "text-cyan-400 bg-cyan-500/20",
  trending: "text-yellow-400 bg-yellow-500/20",
  meeting: "text-orange-400 bg-orange-500/20",
  calendar: "text-indigo-400 bg-indigo-500/20",
  weather: "text-sky-400 bg-sky-500/20",
  bookmarks: "text-pink-400 bg-pink-500/20",
  "team-directory": "text-emerald-400 bg-emerald-500/20",
  announcements: "text-red-400 bg-red-500/20",
  polls: "text-violet-400 bg-violet-500/20",
  birthdays: "text-amber-400 bg-amber-500/20",
  performance: "text-teal-400 bg-teal-500/20",
  goals: "text-rose-400 bg-rose-500/20",
};

const categoryLabels: Record<string, string> = {
  core: "Core Widgets",
  productivity: "Productivity",
  social: "Social & Team",
  analytics: "Analytics & Data",
};

const categoryColors: Record<string, string> = {
  core: "text-blue-400",
  productivity: "text-green-400",
  social: "text-purple-400",
  analytics: "text-cyan-400",
};

interface DashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "active" | "add";
type SizeOption = "small" | "medium" | "large" | "full";

export function DashboardCustomizer({ isOpen, onClose }: DashboardCustomizerProps) {
  const {
    widgets,
    availableWidgets,
    toggleWidget,
    reorderWidgets,
    resetWidgets,
    updateWidget,
    addWidget,
    removeWidget,
  } = useDashboardWidgets();

  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);

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

  const handleSizeChange = (widgetId: string, size: SizeOption) => {
    updateWidget(widgetId, { size });
    setExpandedWidget(null);
  };

  const sizeLabels: Record<SizeOption, string> = {
    small: "Small",
    medium: "Medium",
    large: "Large",
    full: "Full Width",
  };

  // Group available widgets by category
  const groupedAvailableWidgets = availableWidgets.reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, WidgetCatalogItem[]>);

  const visibleCount = widgets.filter((w) => w.visible).length;
  const hiddenCount = widgets.filter((w) => !w.visible).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed right-4 top-16 z-50 w-96 bg-[var(--bg-charcoal)] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-[calc(100vh-100px)] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <div>
            <h3 className="text-white font-medium flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-[var(--accent-ember)]" />
              Customize Dashboard
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              {visibleCount} active • {hiddenCount} hidden • {availableWidgets.length} available
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "active"
                ? "text-[var(--accent-ember)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              Active Widgets
            </span>
            {activeTab === "active" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-ember)]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "add"
                ? "text-[var(--accent-ember)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Add Widgets
              {availableWidgets.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]">
                  {availableWidgets.length}
                </span>
              )}
            </span>
            {activeTab === "add" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-ember)]"
              />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "active" ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4"
              >
                <p className="text-xs text-white/50 mb-3 flex items-center gap-2">
                  <GripVertical className="w-3 h-3" />
                  Drag to reorder • Click eye to show/hide
                </p>

                <div className="space-y-2">
                  {widgets
                    .sort((a, b) => a.order - b.order)
                    .map((widget) => {
                      const Icon = widgetIcons[widget.type] || FileText;
                      const colorClass = widgetColors[widget.type] || "text-white/60 bg-white/10";
                      const isExpanded = expandedWidget === widget.id;

                      return (
                        <div key={widget.id}>
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, widget.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, widget.id)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-move ${
                              draggedWidget === widget.id
                                ? "border-[var(--accent-ember)] bg-[var(--accent-ember)]/10 opacity-50"
                                : widget.visible
                                ? "border-white/10 bg-white/5 hover:border-white/20"
                                : "border-white/5 bg-transparent opacity-50"
                            }`}
                          >
                            <GripVertical className="w-4 h-4 text-white/30 flex-shrink-0" />

                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass.split(" ")[1]}`}>
                              <Icon className={`w-4 h-4 ${colorClass.split(" ")[0]}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <span className={`text-sm block truncate ${widget.visible ? "text-white" : "text-white/40"}`}>
                                {widget.title}
                              </span>
                              <span className="text-xs text-white/30">
                                {sizeLabels[widget.size || "medium"]}
                              </span>
                            </div>

                            {/* Size dropdown button */}
                            <button
                              onClick={() => setExpandedWidget(isExpanded ? null : widget.id)}
                              className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                              title="Change size"
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </button>

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

                            <button
                              onClick={() => removeWidget(widget.id)}
                              className="p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Remove widget"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Size options dropdown */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-12 mt-1 p-2 bg-white/5 rounded-lg border border-white/10">
                                  <p className="text-xs text-white/50 mb-2">Widget Size</p>
                                  <div className="grid grid-cols-2 gap-1">
                                    {(["small", "medium", "large", "full"] as SizeOption[]).map((size) => (
                                      <button
                                        key={size}
                                        onClick={() => handleSizeChange(widget.id, size)}
                                        className={`px-3 py-1.5 text-xs rounded flex items-center justify-between transition-colors ${
                                          widget.size === size
                                            ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)] border border-[var(--accent-ember)]/30"
                                            : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent"
                                        }`}
                                      >
                                        {sizeLabels[size]}
                                        {widget.size === size && <Check className="w-3 h-3" />}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                </div>

                {widgets.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-sm">No widgets added yet</p>
                    <p className="text-white/30 text-xs mt-1">Go to &quot;Add Widgets&quot; to get started</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4"
              >
                <p className="text-xs text-white/50 mb-4">
                  Click on a widget to add it to your dashboard
                </p>

                {Object.entries(groupedAvailableWidgets).map(([category, categoryWidgets]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h4 className={`text-xs font-medium uppercase tracking-wider mb-2 ${categoryColors[category] || "text-white/60"}`}>
                      {categoryLabels[category] || category}
                    </h4>
                    <div className="space-y-2">
                      {categoryWidgets.map((catalogItem) => {
                        const Icon = widgetIcons[catalogItem.type] || FileText;
                        const colorClass = widgetColors[catalogItem.type] || "text-white/60 bg-white/10";

                        return (
                          <button
                            key={catalogItem.type}
                            onClick={() => addWidget(catalogItem.type)}
                            className="w-full flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:border-[var(--accent-ember)]/30 hover:bg-[var(--accent-ember)]/5 transition-all text-left group"
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass.split(" ")[1]}`}>
                              <Icon className={`w-5 h-5 ${colorClass.split(" ")[0]}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-white group-hover:text-[var(--accent-ember)] transition-colors">
                                  {catalogItem.title}
                                </span>
                                <Plus className="w-4 h-4 text-white/30 group-hover:text-[var(--accent-ember)] transition-colors" />
                              </div>
                              <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                                {catalogItem.description}
                              </p>
                              <span className="text-xs text-white/30 mt-1 inline-block">
                                Default: {sizeLabels[catalogItem.defaultSize]}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {availableWidgets.length === 0 && (
                  <div className="text-center py-8">
                    <Check className="w-8 h-8 text-green-400/50 mx-auto mb-2" />
                    <p className="text-white/40 text-sm">All widgets added!</p>
                    <p className="text-white/30 text-xs mt-1">You have access to all available widgets</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex-shrink-0 space-y-2">
          <button
            onClick={resetWidgets}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default Layout
          </button>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-white font-medium transition-colors text-sm"
          >
            Done
          </button>
        </div>
      </motion.div>
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
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--bg-charcoal)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-ember)]/30 hover:text-[var(--accent-ember)] transition-all"
      title="Customize Dashboard"
    >
      <Settings2 className="w-4 h-4" />
      <span>Customize</span>
    </button>
  );
}
