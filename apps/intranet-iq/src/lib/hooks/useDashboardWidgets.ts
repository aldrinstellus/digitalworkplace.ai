"use client";

import { useState, useEffect, useCallback } from "react";
import { useUserSettings } from "./useSupabase";

export interface DashboardWidget {
  id: string;
  type: "quick-actions" | "news" | "events" | "activity" | "trending" | "meeting";
  title: string;
  visible: boolean;
  order: number;
  size?: "small" | "medium" | "large" | "full";
}

export const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "meeting", type: "meeting", title: "Upcoming Meeting", visible: true, order: 0, size: "full" },
  { id: "quick-actions", type: "quick-actions", title: "Quick Actions", visible: true, order: 1, size: "full" },
  { id: "news", type: "news", title: "Company News", visible: true, order: 2, size: "medium" },
  { id: "events", type: "events", title: "Upcoming Events", visible: true, order: 3, size: "medium" },
  { id: "activity", type: "activity", title: "Recent Activity", visible: true, order: 4, size: "full" },
  { id: "trending", type: "trending", title: "Trending Topics", visible: true, order: 5, size: "full" },
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

  // Get visible widgets sorted by order
  const visibleWidgets = widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  return {
    widgets,
    visibleWidgets,
    loading,
    updateWidget,
    toggleWidget,
    reorderWidgets,
    resetWidgets,
  };
}
