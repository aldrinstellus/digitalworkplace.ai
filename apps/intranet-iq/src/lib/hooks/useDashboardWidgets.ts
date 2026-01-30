"use client";

import { useState, useEffect, useCallback } from "react";
import { useUserSettings } from "./useSupabase";

export type WidgetType =
  | "quick-actions"
  | "news"
  | "events"
  | "activity"
  | "trending"
  | "meeting"
  | "calendar"
  | "weather"
  | "bookmarks"
  | "team-directory"
  | "announcements"
  | "polls"
  | "birthdays"
  | "performance"
  | "goals";

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  visible: boolean;
  order: number;
  size?: "small" | "medium" | "large" | "full";
}

// Widget catalog with metadata for the customizer
export interface WidgetCatalogItem {
  type: WidgetType;
  title: string;
  description: string;
  category: "core" | "productivity" | "social" | "analytics";
  defaultSize: "small" | "medium" | "large" | "full";
  icon: string;
}

export const WIDGET_CATALOG: WidgetCatalogItem[] = [
  // Core widgets
  { type: "meeting", title: "Upcoming Meeting", description: "Shows your next scheduled meeting with quick join", category: "core", defaultSize: "full", icon: "video" },
  { type: "quick-actions", title: "Quick Actions", description: "Tasks, documents, and AI assistant shortcuts", category: "core", defaultSize: "full", icon: "zap" },
  { type: "news", title: "Company News", description: "Latest announcements and company updates", category: "core", defaultSize: "medium", icon: "newspaper" },
  { type: "events", title: "Upcoming Events", description: "Calendar events and meetings", category: "core", defaultSize: "medium", icon: "calendar" },
  { type: "activity", title: "Recent Activity", description: "Your recent actions and notifications", category: "core", defaultSize: "full", icon: "clock" },
  { type: "trending", title: "Trending Topics", description: "Popular discussions and topics", category: "core", defaultSize: "full", icon: "trending-up" },

  // Productivity widgets
  { type: "calendar", title: "Calendar", description: "Full calendar view with upcoming events", category: "productivity", defaultSize: "large", icon: "calendar-days" },
  { type: "bookmarks", title: "Bookmarks", description: "Quick access to saved links and resources", category: "productivity", defaultSize: "small", icon: "bookmark" },
  { type: "goals", title: "Goals & OKRs", description: "Track your quarterly goals and objectives", category: "productivity", defaultSize: "medium", icon: "target" },

  // Social widgets
  { type: "team-directory", title: "Team Directory", description: "Quick access to team members", category: "social", defaultSize: "medium", icon: "users" },
  { type: "announcements", title: "Announcements", description: "Important company-wide announcements", category: "social", defaultSize: "medium", icon: "megaphone" },
  { type: "polls", title: "Active Polls", description: "Participate in company polls and surveys", category: "social", defaultSize: "small", icon: "bar-chart" },
  { type: "birthdays", title: "Birthdays & Anniversaries", description: "Celebrate team milestones", category: "social", defaultSize: "small", icon: "cake" },

  // Analytics widgets
  { type: "performance", title: "Performance", description: "Your performance metrics and KPIs", category: "analytics", defaultSize: "medium", icon: "line-chart" },
  { type: "weather", title: "Weather", description: "Current weather for your location", category: "analytics", defaultSize: "small", icon: "cloud-sun" },
];

export const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "meeting", type: "meeting", title: "Upcoming Meeting", visible: true, order: 0, size: "full" },
  { id: "quick-actions", type: "quick-actions", title: "Quick Actions", visible: true, order: 1, size: "full" },
  { id: "news", type: "news", title: "Company News", visible: true, order: 2, size: "medium" },
  { id: "events", type: "events", title: "Upcoming Events", visible: true, order: 3, size: "medium" },
  { id: "activity", type: "activity", title: "Recent Activity", visible: true, order: 4, size: "full" },
  { id: "trending", type: "trending", title: "Trending Topics", visible: true, order: 5, size: "full" },
];

// Layout preset definitions
export type LayoutPresetKey = "task-focused" | "news-heavy" | "minimal" | "default";

export interface LayoutPreset {
  key: LayoutPresetKey;
  name: string;
  description: string;
  widgetTypes: WidgetType[];
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    key: "default",
    name: "Default",
    description: "Balanced layout with all widgets",
    widgetTypes: ["meeting", "quick-actions", "news", "events", "activity", "trending"],
  },
  {
    key: "task-focused",
    name: "Task-Focused",
    description: "Prioritizes tasks, calendar, and approvals",
    widgetTypes: ["quick-actions", "meeting", "activity"],
  },
  {
    key: "news-heavy",
    name: "News-Heavy",
    description: "Focus on news feed, announcements, and trending",
    widgetTypes: ["news", "trending", "activity"],
  },
  {
    key: "minimal",
    name: "Minimal",
    description: "Clean layout with essential widgets only",
    widgetTypes: ["quick-actions", "meeting"],
  },
];

const STORAGE_KEY = "diq-dashboard-widgets";

// Get widgets from localStorage (for non-logged-in users or initial load)
function getStoredWidgets(): DashboardWidget[] | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Save widgets to localStorage
function saveStoredWidgets(widgets: DashboardWidget[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  } catch {
    // Ignore storage errors
  }
}

export function useDashboardWidgets() {
  const { settings, updateSettings, loading: settingsLoading } = useUserSettings();
  const [widgets, setWidgetsState] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [loading, setLoading] = useState(true);

  // Load widgets from settings or localStorage
  useEffect(() => {
    if (settingsLoading) return;

    // Try to get from user settings first
    const savedWidgets = settings?.appearance?.dashboardWidgets as DashboardWidget[] | undefined;
    if (savedWidgets && Array.isArray(savedWidgets)) {
      setWidgetsState(savedWidgets);
    } else {
      // Fall back to localStorage
      const storedWidgets = getStoredWidgets();
      if (storedWidgets) {
        setWidgetsState(storedWidgets);
      }
    }
    setLoading(false);
  }, [settings, settingsLoading]);

  // Update a widget's properties
  const updateWidget = useCallback(
    async (widgetId: string, updates: Partial<DashboardWidget>) => {
      setWidgetsState((prev) => {
        const newWidgets = prev.map((w) =>
          w.id === widgetId ? { ...w, ...updates } : w
        );
        // Save to localStorage immediately
        saveStoredWidgets(newWidgets);
        // Also persist to user settings if logged in
        if (settings) {
          updateSettings({
            appearance: {
              ...settings.appearance,
              dashboardWidgets: newWidgets,
            },
          });
        }
        return newWidgets;
      });
    },
    [settings, updateSettings]
  );

  // Toggle widget visibility
  const toggleWidget = useCallback(
    (widgetId: string) => {
      setWidgetsState((prev) => {
        const widget = prev.find((w) => w.id === widgetId);
        if (!widget) return prev;
        const newWidgets = prev.map((w) =>
          w.id === widgetId ? { ...w, visible: !w.visible } : w
        );
        saveStoredWidgets(newWidgets);
        if (settings) {
          updateSettings({
            appearance: {
              ...settings.appearance,
              dashboardWidgets: newWidgets,
            },
          });
        }
        return newWidgets;
      });
    },
    [settings, updateSettings]
  );

  // Reorder widgets via drag-drop
  const reorderWidgets = useCallback(
    (sourceId: string, destinationId: string) => {
      setWidgetsState((prev) => {
        const sourceIndex = prev.findIndex((w) => w.id === sourceId);
        const destIndex = prev.findIndex((w) => w.id === destinationId);
        if (sourceIndex === -1 || destIndex === -1) return prev;

        const newWidgets = [...prev];
        const [removed] = newWidgets.splice(sourceIndex, 1);
        newWidgets.splice(destIndex, 0, removed);

        // Update order values
        const reordered = newWidgets.map((w, i) => ({ ...w, order: i }));

        saveStoredWidgets(reordered);
        if (settings) {
          updateSettings({
            appearance: {
              ...settings.appearance,
              dashboardWidgets: reordered,
            },
          });
        }
        return reordered;
      });
    },
    [settings, updateSettings]
  );

  // Reset to defaults
  const resetWidgets = useCallback(() => {
    setWidgetsState(DEFAULT_WIDGETS);
    saveStoredWidgets(DEFAULT_WIDGETS);
    if (settings) {
      updateSettings({
        appearance: {
          ...settings.appearance,
          dashboardWidgets: DEFAULT_WIDGETS,
        },
      });
    }
  }, [settings, updateSettings]);

  // Apply a layout preset
  const applyPreset = useCallback(
    (presetKey: LayoutPresetKey) => {
      const preset = LAYOUT_PRESETS.find((p) => p.key === presetKey);
      if (!preset) return;

      setWidgetsState((prev) => {
        // Create new widget array with visibility based on preset
        const newWidgets = prev.map((widget, index) => ({
          ...widget,
          visible: preset.widgetTypes.includes(widget.type),
          // Reorder based on preset order
          order: preset.widgetTypes.indexOf(widget.type) !== -1
            ? preset.widgetTypes.indexOf(widget.type)
            : index + preset.widgetTypes.length,
        }));

        // Sort by order
        const sorted = [...newWidgets].sort((a, b) => a.order - b.order);

        saveStoredWidgets(sorted);
        if (settings) {
          updateSettings({
            appearance: {
              ...settings.appearance,
              dashboardWidgets: sorted,
            },
          });
        }
        return sorted;
      });
    },
    [settings, updateSettings]
  );

  // Add a new widget from the catalog
  const addWidget = useCallback(
    (widgetType: WidgetType) => {
      const catalogItem = WIDGET_CATALOG.find((w) => w.type === widgetType);
      if (!catalogItem) return;

      // Check if widget already exists
      const exists = widgets.some((w) => w.type === widgetType);
      if (exists) {
        // Just make it visible
        toggleWidget(widgetType);
        return;
      }

      setWidgetsState((prev) => {
        const newWidget: DashboardWidget = {
          id: widgetType,
          type: widgetType,
          title: catalogItem.title,
          visible: true,
          order: prev.length,
          size: catalogItem.defaultSize,
        };
        const newWidgets = [...prev, newWidget];
        saveStoredWidgets(newWidgets);
        if (settings) {
          updateSettings({
            appearance: {
              ...settings.appearance,
              dashboardWidgets: newWidgets,
            },
          });
        }
        return newWidgets;
      });
    },
    [widgets, settings, updateSettings, toggleWidget]
  );

  // Remove a widget completely
  const removeWidget = useCallback(
    (widgetId: string) => {
      setWidgetsState((prev) => {
        const newWidgets = prev.filter((w) => w.id !== widgetId);
        // Re-order remaining widgets
        const reordered = newWidgets.map((w, i) => ({ ...w, order: i }));
        saveStoredWidgets(reordered);
        if (settings) {
          updateSettings({
            appearance: {
              ...settings.appearance,
              dashboardWidgets: reordered,
            },
          });
        }
        return reordered;
      });
    },
    [settings, updateSettings]
  );

  // Get visible widgets sorted by order
  const visibleWidgets = widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  // Get available widgets (in catalog but not in current widgets)
  const availableWidgets = WIDGET_CATALOG.filter(
    (catalogItem) => !widgets.some((w) => w.type === catalogItem.type)
  );

  return {
    widgets,
    visibleWidgets,
    availableWidgets,
    loading,
    updateWidget,
    toggleWidget,
    reorderWidgets,
    resetWidgets,
    applyPreset,
    addWidget,
    removeWidget,
  };
}
