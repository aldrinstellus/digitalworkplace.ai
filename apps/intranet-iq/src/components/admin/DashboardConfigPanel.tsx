"use client";

import { useState } from "react";
import {
  Settings2,
  Layout,
  Palette,
  Users,
  LayoutGrid,
  List,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Newspaper,
  Calendar,
  TrendingUp,
  MessageSquare,
  FileText,
  Search,
  Bell,
  Star,
  Clock,
  BarChart3,
  Users2,
} from "lucide-react";

interface WidgetConfig {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  order: number;
  size: "sm" | "md" | "lg" | "full";
  icon: typeof Newspaper;
  description: string;
  roles: string[];
}

interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  widgets: string[];
  isDefault?: boolean;
}

interface RoleConfig {
  role: string;
  label: string;
  defaultWidgets: string[];
  canCustomize: boolean;
}

const defaultWidgets: WidgetConfig[] = [
  { id: "news", name: "Company News", type: "news", enabled: true, order: 1, size: "lg", icon: Newspaper, description: "Latest company announcements and updates", roles: ["all"] },
  { id: "events", name: "Upcoming Events", type: "events", enabled: true, order: 2, size: "md", icon: Calendar, description: "Calendar of company events and meetings", roles: ["all"] },
  { id: "activity", name: "Activity Feed", type: "activity", enabled: true, order: 3, size: "md", icon: TrendingUp, description: "Recent activity across the platform", roles: ["all"] },
  { id: "quickActions", name: "Quick Actions", type: "actions", enabled: true, order: 4, size: "sm", icon: Star, description: "Frequently used actions and shortcuts", roles: ["all"] },
  { id: "aiAssistant", name: "AI Assistant", type: "assistant", enabled: true, order: 5, size: "md", icon: MessageSquare, description: "Quick access to AI chat assistant", roles: ["user", "contributor", "editor", "manager", "admin", "super_admin"] },
  { id: "recentContent", name: "Recent Content", type: "content", enabled: true, order: 6, size: "md", icon: FileText, description: "Recently viewed or updated documents", roles: ["all"] },
  { id: "searchWidget", name: "Search Widget", type: "search", enabled: true, order: 7, size: "sm", icon: Search, description: "Quick search across all content", roles: ["all"] },
  { id: "notifications", name: "Notifications", type: "notifications", enabled: true, order: 8, size: "sm", icon: Bell, description: "Unread notifications and alerts", roles: ["all"] },
  { id: "myTasks", name: "My Tasks", type: "tasks", enabled: false, order: 9, size: "md", icon: Clock, description: "Personal tasks and to-do items", roles: ["user", "contributor", "editor", "manager", "admin", "super_admin"] },
  { id: "teamMetrics", name: "Team Metrics", type: "metrics", enabled: false, order: 10, size: "lg", icon: BarChart3, description: "Team performance and analytics", roles: ["manager", "admin", "super_admin"] },
  { id: "orgHighlights", name: "Org Highlights", type: "org", enabled: false, order: 11, size: "md", icon: Users2, description: "New hires, promotions, and celebrations", roles: ["all"] },
];

const layoutPresets: LayoutPreset[] = [
  { id: "default", name: "Default Layout", description: "Standard dashboard with news, events, and activity", widgets: ["news", "events", "activity", "quickActions"], isDefault: true },
  { id: "minimal", name: "Minimal", description: "Clean layout with essential widgets only", widgets: ["news", "searchWidget", "quickActions"] },
  { id: "productivity", name: "Productivity Focus", description: "Task and content-oriented layout", widgets: ["myTasks", "recentContent", "aiAssistant", "searchWidget"] },
  { id: "manager", name: "Manager View", description: "Team-focused with metrics and activity", widgets: ["teamMetrics", "activity", "events", "orgHighlights"] },
  { id: "engagement", name: "Engagement Focus", description: "News, events, and social features", widgets: ["news", "events", "orgHighlights", "notifications"] },
];

const roleConfigs: RoleConfig[] = [
  { role: "guest", label: "Guest", defaultWidgets: ["news", "events", "searchWidget"], canCustomize: false },
  { role: "user", label: "User", defaultWidgets: ["news", "events", "activity", "quickActions", "aiAssistant"], canCustomize: true },
  { role: "contributor", label: "Contributor", defaultWidgets: ["news", "events", "activity", "quickActions", "aiAssistant", "recentContent"], canCustomize: true },
  { role: "editor", label: "Editor", defaultWidgets: ["news", "events", "activity", "quickActions", "aiAssistant", "recentContent", "myTasks"], canCustomize: true },
  { role: "manager", label: "Manager", defaultWidgets: ["news", "events", "activity", "teamMetrics", "aiAssistant", "myTasks"], canCustomize: true },
  { role: "admin", label: "Admin", defaultWidgets: ["news", "events", "activity", "teamMetrics", "aiAssistant", "notifications"], canCustomize: true },
  { role: "super_admin", label: "Super Admin", defaultWidgets: ["all"], canCustomize: true },
];

export function DashboardConfigPanel() {
  const [activeTab, setActiveTab] = useState<"widgets" | "layouts" | "roles" | "appearance">("widgets");
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);
  const [selectedPreset, setSelectedPreset] = useState("default");
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: "dark",
    primaryColor: "#3b82f6",
    cardStyle: "rounded",
    density: "comfortable",
    showWelcome: true,
    animationsEnabled: true,
  });

  const handleToggleWidget = (widgetId: string) => {
    setWidgets(prev =>
      prev.map(w => w.id === widgetId ? { ...w, enabled: !w.enabled } : w)
    );
    setUnsavedChanges(true);
  };

  const handleWidgetSizeChange = (widgetId: string, size: WidgetConfig["size"]) => {
    setWidgets(prev =>
      prev.map(w => w.id === widgetId ? { ...w, size } : w)
    );
    setUnsavedChanges(true);
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = layoutPresets.find(p => p.id === presetId);
    if (preset) {
      setWidgets(prev =>
        prev.map(w => ({
          ...w,
          enabled: preset.widgets.includes(w.id) || preset.widgets.includes("all"),
        }))
      );
      setSelectedPreset(presetId);
      setUnsavedChanges(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setUnsavedChanges(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setWidgets(defaultWidgets);
    setSelectedPreset("default");
    setAppearance({
      theme: "dark",
      primaryColor: "#3b82f6",
      cardStyle: "rounded",
      density: "comfortable",
      showWelcome: true,
      animationsEnabled: true,
    });
    setUnsavedChanges(false);
  };

  const handleDragStart = (widgetId: string) => {
    setDraggedWidget(widgetId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedWidget && draggedWidget !== targetId) {
      const draggedIndex = widgets.findIndex(w => w.id === draggedWidget);
      const targetIndex = widgets.findIndex(w => w.id === targetId);
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newWidgets = [...widgets];
        const [removed] = newWidgets.splice(draggedIndex, 1);
        newWidgets.splice(targetIndex, 0, removed);
        // Update order
        newWidgets.forEach((w, idx) => w.order = idx + 1);
        setWidgets(newWidgets);
        setUnsavedChanges(true);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const tabs = [
    { id: "widgets", label: "Widgets", icon: LayoutGrid },
    { id: "layouts", label: "Layout Presets", icon: Layout },
    { id: "roles", label: "Role Defaults", icon: Users },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="bg-[#0f0f14] border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">Dashboard Configuration</h2>
            <p className="text-sm text-white/50">Configure default dashboard for all users</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unsavedChanges && (
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 hover:text-white text-sm flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !unsavedChanges}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-6 py-3 text-sm transition-colors ${
              activeTab === tab.id
                ? "text-white border-b-2 border-blue-500 bg-white/5"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Widgets Tab */}
        {activeTab === "widgets" && (
          <div className="space-y-4">
            <p className="text-sm text-white/50 mb-4">
              Drag to reorder widgets. Enable or disable widgets to customize the default dashboard.
            </p>
            <div className="space-y-2">
              {widgets
                .sort((a, b) => a.order - b.order)
                .map(widget => (
                  <div
                    key={widget.id}
                    draggable
                    onDragStart={() => handleDragStart(widget.id)}
                    onDragOver={(e) => handleDragOver(e, widget.id)}
                    onDragEnd={handleDragEnd}
                    className={`border rounded-lg overflow-hidden transition-all ${
                      widget.enabled
                        ? "bg-white/5 border-white/10"
                        : "bg-white/[0.02] border-white/5 opacity-60"
                    } ${draggedWidget === widget.id ? "opacity-50" : ""}`}
                  >
                    <div
                      className="flex items-center gap-3 p-4 cursor-pointer"
                      onClick={() => setExpandedWidget(expandedWidget === widget.id ? null : widget.id)}
                    >
                      <GripVertical className="w-5 h-5 text-white/30 cursor-grab" />
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <widget.icon className="w-5 h-5 text-white/60" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{widget.name}</h4>
                        <p className="text-xs text-white/40">{widget.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={widget.size}
                          onClick={e => e.stopPropagation()}
                          onChange={e => handleWidgetSizeChange(widget.id, e.target.value as WidgetConfig["size"])}
                          className="bg-white/10 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
                        >
                          <option value="sm">Small</option>
                          <option value="md">Medium</option>
                          <option value="lg">Large</option>
                          <option value="full">Full Width</option>
                        </select>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleToggleWidget(widget.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            widget.enabled
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-white/10 text-white/40 hover:bg-white/20"
                          }`}
                        >
                          {widget.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        {expandedWidget === widget.id ? (
                          <ChevronUp className="w-4 h-4 text-white/40" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-white/40" />
                        )}
                      </div>
                    </div>

                    {expandedWidget === widget.id && (
                      <div className="px-4 pb-4 border-t border-white/10 mt-2 pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <label className="text-white/50 block mb-1">Available to roles:</label>
                            <div className="flex flex-wrap gap-1">
                              {widget.roles.includes("all") ? (
                                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs">All roles</span>
                              ) : (
                                widget.roles.map(role => (
                                  <span key={role} className="px-2 py-0.5 rounded bg-white/10 text-white/70 text-xs capitalize">
                                    {role.replace("_", " ")}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="text-white/50 block mb-1">Widget type:</label>
                            <span className="text-white capitalize">{widget.type}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Layouts Tab */}
        {activeTab === "layouts" && (
          <div className="space-y-4">
            <p className="text-sm text-white/50 mb-4">
              Choose a preset layout or create a custom one. Presets can be applied to quickly configure the dashboard.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {layoutPresets.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedPreset === preset.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{preset.name}</h4>
                    {preset.isDefault && (
                      <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">Default</span>
                    )}
                    {selectedPreset === preset.id && (
                      <Check className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <p className="text-sm text-white/50 mb-3">{preset.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {preset.widgets.slice(0, 4).map(widgetId => {
                      const widget = defaultWidgets.find(w => w.id === widgetId);
                      return widget ? (
                        <span key={widgetId} className="px-2 py-0.5 rounded bg-white/10 text-white/60 text-xs">
                          {widget.name}
                        </span>
                      ) : null;
                    })}
                    {preset.widgets.length > 4 && (
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white/40 text-xs">
                        +{preset.widgets.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl border border-dashed border-white/20 flex items-center justify-center gap-2 cursor-pointer hover:border-white/40 hover:bg-white/5 transition-colors">
              <Plus className="w-5 h-5 text-white/50" />
              <span className="text-white/50">Create Custom Preset</span>
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === "roles" && (
          <div className="space-y-4">
            <p className="text-sm text-white/50 mb-4">
              Configure default widgets for each user role. Users can customize their own dashboard if allowed.
            </p>
            <div className="space-y-3">
              {roleConfigs.map(role => (
                <div
                  key={role.role}
                  className="p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        role.role === "super_admin" ? "bg-red-500/20" :
                        role.role === "admin" ? "bg-orange-500/20" :
                        role.role === "manager" ? "bg-purple-500/20" :
                        role.role === "editor" ? "bg-blue-500/20" :
                        role.role === "contributor" ? "bg-green-500/20" :
                        "bg-white/10"
                      }`}>
                        <Users className={`w-5 h-5 ${
                          role.role === "super_admin" ? "text-red-400" :
                          role.role === "admin" ? "text-orange-400" :
                          role.role === "manager" ? "text-purple-400" :
                          role.role === "editor" ? "text-blue-400" :
                          role.role === "contributor" ? "text-green-400" :
                          "text-white/60"
                        }`} />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{role.label}</h4>
                        <p className="text-xs text-white/40">
                          {role.canCustomize ? "Can customize dashboard" : "Fixed dashboard layout"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-xs flex items-center gap-1 transition-colors">
                        <Copy className="w-3 h-3" />
                        Copy from
                      </button>
                      <button className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 text-xs transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {role.defaultWidgets.includes("all") ? (
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs">All widgets</span>
                    ) : (
                      role.defaultWidgets.map(widgetId => {
                        const widget = defaultWidgets.find(w => w.id === widgetId);
                        return widget ? (
                          <span key={widgetId} className="px-2 py-0.5 rounded bg-white/10 text-white/60 text-xs">
                            {widget.name}
                          </span>
                        ) : null;
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === "appearance" && (
          <div className="space-y-6">
            <p className="text-sm text-white/50 mb-4">
              Customize the visual appearance of the dashboard for all users.
            </p>

            {/* Theme */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Color Theme</label>
              <div className="flex gap-2">
                {["dark", "light", "auto"].map(theme => (
                  <button
                    key={theme}
                    onClick={() => {
                      setAppearance(prev => ({ ...prev, theme }));
                      setUnsavedChanges(true);
                    }}
                    className={`px-4 py-2 rounded-lg border text-sm capitalize transition-colors ${
                      appearance.theme === theme
                        ? "border-blue-500 bg-blue-500/20 text-blue-400"
                        : "border-white/10 text-white/50 hover:border-white/20"
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Primary Accent Color</label>
              <div className="flex gap-2">
                {["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"].map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      setAppearance(prev => ({ ...prev, primaryColor: color }));
                      setUnsavedChanges(true);
                    }}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      appearance.primaryColor === color
                        ? "border-white scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Card Style */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Card Style</label>
              <div className="flex gap-2">
                {[
                  { value: "rounded", label: "Rounded" },
                  { value: "sharp", label: "Sharp" },
                  { value: "pill", label: "Pill" },
                ].map(style => (
                  <button
                    key={style.value}
                    onClick={() => {
                      setAppearance(prev => ({ ...prev, cardStyle: style.value }));
                      setUnsavedChanges(true);
                    }}
                    className={`px-4 py-2 border text-sm transition-colors ${
                      style.value === "rounded" ? "rounded-lg" :
                      style.value === "sharp" ? "rounded-none" :
                      "rounded-full"
                    } ${
                      appearance.cardStyle === style.value
                        ? "border-blue-500 bg-blue-500/20 text-blue-400"
                        : "border-white/10 text-white/50 hover:border-white/20"
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Density */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Content Density</label>
              <div className="flex gap-2">
                {["compact", "comfortable", "spacious"].map(density => (
                  <button
                    key={density}
                    onClick={() => {
                      setAppearance(prev => ({ ...prev, density }));
                      setUnsavedChanges(true);
                    }}
                    className={`px-4 py-2 rounded-lg border text-sm capitalize transition-colors ${
                      appearance.density === density
                        ? "border-blue-500 bg-blue-500/20 text-blue-400"
                        : "border-white/10 text-white/50 hover:border-white/20"
                    }`}
                  >
                    {density}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-white text-sm">Show Welcome Message</p>
                  <p className="text-xs text-white/40">Display personalized greeting on dashboard</p>
                </div>
                <button
                  onClick={() => {
                    setAppearance(prev => ({ ...prev, showWelcome: !prev.showWelcome }));
                    setUnsavedChanges(true);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    appearance.showWelcome ? "bg-blue-500" : "bg-white/20"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    appearance.showWelcome ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-white text-sm">Enable Animations</p>
                  <p className="text-xs text-white/40">Smooth transitions and micro-interactions</p>
                </div>
                <button
                  onClick={() => {
                    setAppearance(prev => ({ ...prev, animationsEnabled: !prev.animationsEnabled }));
                    setUnsavedChanges(true);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    appearance.animationsEnabled ? "bg-blue-500" : "bg-white/20"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    appearance.animationsEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
