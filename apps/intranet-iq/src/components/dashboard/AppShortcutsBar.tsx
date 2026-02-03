"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Plus, Settings, X, Trash2, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcons";

interface AppShortcut {
  id: string;
  name: string;
  url: string;
  color: string;
  isExternal?: boolean;
  customIcon?: string; // For user-added custom apps (emoji fallback)
}

// Default app shortcuts - Uses internal /diq/apps/[id] routes with proper SVG icons
const defaultApps: AppShortcut[] = [
  { id: "auzmor-office", name: "Auzmor Office", url: "/diq/apps/auzmor-office", color: "bg-emerald-500/20" },
  { id: "drive", name: "Google Drive", url: "/diq/apps/drive", color: "bg-amber-500/20" },
  { id: "slack", name: "Slack", url: "/diq/apps/slack", color: "bg-[var(--accent-ember)]/20" },
  { id: "zoom", name: "Zoom", url: "/diq/apps/zoom", color: "bg-blue-500/20" },
  { id: "confluence", name: "Confluence", url: "/diq/apps/confluence", color: "bg-blue-600/20" },
  { id: "jira", name: "Jira", url: "/diq/apps/jira", color: "bg-blue-500/20" },
  { id: "salesforce", name: "Salesforce", url: "/diq/apps/salesforce", color: "bg-sky-500/20" },
  { id: "linkedin", name: "LinkedIn", url: "/diq/apps/linkedin", color: "bg-blue-700/20" },
  { id: "github", name: "GitHub", url: "/diq/apps/github", color: "bg-[var(--bg-slate)]" },
  { id: "notion", name: "Notion", url: "/diq/apps/notion", color: "bg-[var(--border-default)]" },
  { id: "figma", name: "Figma", url: "/diq/apps/figma", color: "bg-purple-500/20" },
];

// Available apps to add (not in default list)
const availableAppsToAdd: AppShortcut[] = [
  { id: "teams", name: "Microsoft Teams", url: "/diq/apps/teams", color: "bg-purple-600/20" },
  { id: "outlook", name: "Outlook", url: "https://outlook.com", color: "bg-blue-500/20", isExternal: true },
  { id: "dropbox", name: "Dropbox", url: "/diq/apps/dropbox", color: "bg-blue-600/20" },
  { id: "asana", name: "Asana", url: "/diq/apps/asana", color: "bg-rose-500/20" },
  { id: "trello", name: "Trello", url: "/diq/apps/trello", color: "bg-blue-500/20" },
  { id: "monday", name: "Monday.com", url: "https://monday.com", color: "bg-[var(--accent-ember)]/20", isExternal: true },
  { id: "airtable", name: "Airtable", url: "https://airtable.com", color: "bg-amber-400/20", isExternal: true },
  { id: "miro", name: "Miro", url: "https://miro.com", color: "bg-amber-500/20", isExternal: true },
  { id: "hubspot", name: "HubSpot", url: "https://hubspot.com", color: "bg-orange-500/20", isExternal: true },
  { id: "zendesk", name: "Zendesk", url: "https://zendesk.com", color: "bg-emerald-500/20", isExternal: true },
];

const STORAGE_KEY = "diq-app-shortcuts";
const STORAGE_VERSION_KEY = "diq-app-shortcuts-version";
const CURRENT_VERSION = 2; // Increment when defaultApps changes
const VISIBLE_APPS = 8;

export function AppShortcutsBar() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [apps, setApps] = useState<AppShortcut[]>(defaultApps);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Drag-to-scroll state
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startScroll, setStartScroll] = useState(0);
  const hasMovedRef = useRef(false);

  // Load apps from localStorage on mount (with version migration)
  useEffect(() => {
    const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    const storedVersion = savedVersion ? parseInt(savedVersion, 10) : 0;

    // If version mismatch, reset to defaults (new apps added)
    if (storedVersion < CURRENT_VERSION) {
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION.toString());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultApps));
      setApps(defaultApps);
      setIsLoaded(true);
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setApps(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved app shortcuts:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save apps to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    }
  }, [apps, isLoaded]);

  // Mouse wheel scroll handler
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const maxScroll = Math.max(0, apps.length - VISIBLE_APPS);

    if (e.deltaY > 0) {
      // Scroll down
      setScrollPosition(prev => Math.min(maxScroll, prev + 1));
    } else if (e.deltaY < 0) {
      // Scroll up
      setScrollPosition(prev => Math.max(0, prev - 1));
    }
  }, [apps.length]);

  // Drag handlers for click-hold-drag scrolling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartScroll(scrollPosition);
    hasMovedRef.current = false;
  }, [scrollPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaY = startY - e.clientY;
    const scrollDelta = Math.round(deltaY / 68); // 68px per item

    if (Math.abs(deltaY) > 5) {
      hasMovedRef.current = true;
    }

    const maxScroll = Math.max(0, apps.length - VISIBLE_APPS);
    const newScroll = Math.min(maxScroll, Math.max(0, startScroll + scrollDelta));
    setScrollPosition(newScroll);
  }, [isDragging, startY, startScroll, apps.length]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // Reset hasMoved after a short delay to allow click events
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 100);
  }, []);

  // Add/remove event listeners for drag and wheel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add wheel listener with passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const canScrollUp = scrollPosition > 0;
  const canScrollDown = scrollPosition < apps.length - VISIBLE_APPS;

  const scroll = (direction: "up" | "down") => {
    if (direction === "up" && canScrollUp) {
      setScrollPosition((prev) => Math.max(0, prev - 2));
    } else if (direction === "down" && canScrollDown) {
      setScrollPosition((prev) => Math.min(apps.length - VISIBLE_APPS, prev + 2));
    }
  };

  const addApp = (app: AppShortcut) => {
    if (!apps.find((a) => a.id === app.id)) {
      setApps([...apps, app]);
    }
  };

  const removeApp = (appId: string) => {
    setApps(apps.filter((a) => a.id !== appId));
    if (scrollPosition > 0 && scrollPosition >= apps.length - VISIBLE_APPS) {
      setScrollPosition(Math.max(0, apps.length - VISIBLE_APPS - 1));
    }
  };

  const moveApp = (appId: string, direction: "up" | "down") => {
    const index = apps.findIndex((a) => a.id === appId);
    if (index === -1) return;

    const newApps = [...apps];
    if (direction === "up" && index > 0) {
      [newApps[index - 1], newApps[index]] = [newApps[index], newApps[index - 1]];
    } else if (direction === "down" && index < apps.length - 1) {
      [newApps[index + 1], newApps[index]] = [newApps[index], newApps[index + 1]];
    }
    setApps(newApps);
  };

  const resetToDefaults = () => {
    setApps(defaultApps);
    setScrollPosition(0);
  };

  const appsToAdd = availableAppsToAdd.filter((app) => !apps.find((a) => a.id === app.id));

  return (
    <>
      {/* Right Sidebar */}
      <motion.div
        className="fixed top-0 right-0 h-full bg-[var(--bg-charcoal)]/95 backdrop-blur-md border-l border-[var(--border-subtle)] z-40"
        initial={false}
        animate={{
          width: isCollapsed ? 0 : 80,
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full py-4">
          {/* Header with title */}
          <div className="px-2 mb-2">
            <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider block text-center">Apps</span>
          </div>

          {/* Scroll Up Button */}
          <motion.button
            onClick={() => scroll("up")}
            disabled={!canScrollUp}
            className={`mx-auto p-1.5 rounded-lg transition-colors mb-1 ${
              canScrollUp
                ? "hover:bg-[var(--accent-ember)]/10 text-[var(--text-secondary)] hover:text-[var(--accent-ember)]"
                : "text-[var(--text-muted)]/30 cursor-not-allowed"
            }`}
            whileHover={canScrollUp ? { scale: 1.1 } : undefined}
            whileTap={canScrollUp ? { scale: 0.9 } : undefined}
          >
            <ChevronUp className="w-4 h-4" />
          </motion.button>

          {/* Apps Container - Vertical Scroll with Mouse Wheel & Drag Support */}
          <div
            ref={containerRef}
            className="flex-1 overflow-hidden px-2 select-none"
            onMouseDown={handleMouseDown}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <motion.div
              className="flex flex-col gap-1"
              animate={{ y: -scrollPosition * 68 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {apps.map((app, index) => (
                <motion.a
                  key={app.id}
                  href={app.url}
                  target={app.isExternal ? "_blank" : undefined}
                  rel={app.isExternal ? "noopener noreferrer" : undefined}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[var(--bg-slate)] transition-colors group"
                  title={app.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    // Prevent navigation if we just finished dragging
                    if (hasMovedRef.current) {
                      e.preventDefault();
                    }
                  }}
                >
                  <motion.div
                    className={`w-10 h-10 rounded-xl ${app.color} flex items-center justify-center`}
                    whileHover={{
                      boxShadow: "0 4px 20px rgba(16, 185, 129, 0.2)",
                    }}
                  >
                    {app.customIcon ? (
                      <span className="text-lg">{app.customIcon}</span>
                    ) : (
                      <AppIcon appId={app.id} size={24} />
                    )}
                  </motion.div>
                  <span className="text-[10px] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] truncate w-full text-center transition-colors">
                    {app.name.length > 8 ? app.name.slice(0, 7) + "…" : app.name}
                  </span>
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Scroll Down Button */}
          <motion.button
            onClick={() => scroll("down")}
            disabled={!canScrollDown}
            className={`mx-auto p-1.5 rounded-lg transition-colors mt-1 ${
              canScrollDown
                ? "hover:bg-[var(--accent-ember)]/10 text-[var(--text-secondary)] hover:text-[var(--accent-ember)]"
                : "text-[var(--text-muted)]/30 cursor-not-allowed"
            }`}
            whileHover={canScrollDown ? { scale: 1.1 } : undefined}
            whileTap={canScrollDown ? { scale: 0.9 } : undefined}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>

          {/* Scroll Indicator */}
          {apps.length > VISIBLE_APPS && (
            <div className="text-center mt-1">
              <span className="text-[9px] text-[var(--text-muted)]/50">
                {scrollPosition + 1}-{Math.min(scrollPosition + VISIBLE_APPS, apps.length)} of {apps.length}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-1 pt-3 mt-2 border-t border-[var(--border-subtle)] px-2">
            <motion.button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full p-2 rounded-lg hover:bg-[var(--accent-ember)]/10 text-[var(--text-muted)] hover:text-[var(--accent-ember)] transition-colors flex items-center justify-center"
              title="Add app shortcut"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-full p-2 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center justify-center"
              title="Manage shortcuts"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Collapse/Expand Toggle */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-1/2 -translate-y-1/2 z-50 p-1.5 rounded-l-lg bg-[var(--bg-charcoal)] border border-r-0 border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--accent-ember)] hover:bg-[var(--bg-slate)] transition-all"
        animate={{ right: isCollapsed ? 0 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        title={isCollapsed ? "Show apps" : "Hide apps"}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isCollapsed ? <ChevronUp className="w-4 h-4 -rotate-90" /> : <ChevronDown className="w-4 h-4 -rotate-90" />}
      </motion.button>

      {/* Add App Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddAppModal
            appsToAdd={appsToAdd}
            onAdd={addApp}
            onClose={() => setIsAddModalOpen(false)}
            existingApps={apps}
          />
        )}
      </AnimatePresence>

      {/* Settings/Manage Modal */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <ManageAppsModal
            apps={apps}
            onRemove={removeApp}
            onMove={moveApp}
            onReset={resetToDefaults}
            onClose={() => setIsSettingsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Add App Modal Component
function AddAppModal({
  appsToAdd,
  onAdd,
  onClose,
}: {
  appsToAdd: AppShortcut[];
  onAdd: (app: AppShortcut) => void;
  onClose: () => void;
  existingApps: AppShortcut[];
}) {
  const [customName, setCustomName] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customIcon, setCustomIcon] = useState("🔗");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [addedApps, setAddedApps] = useState<Set<string>>(new Set());

  const iconOptions = ["🔗", "🌐", "💻", "📱", "🛠️", "📈", "🎮", "🎵", "📚", "🏢"];

  const handleAddApp = (app: AppShortcut) => {
    onAdd(app);
    setAddedApps(new Set([...addedApps, app.id]));
  };

  const handleAddCustom = () => {
    if (!customName.trim() || !customUrl.trim()) return;

    let url = customUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const customApp: AppShortcut = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      url: url,
      customIcon: customIcon,
      color: "bg-[var(--bg-slate)]",
      isExternal: true,
    };
    onAdd(customApp);
    setCustomName("");
    setCustomUrl("");
    setCustomIcon("🔗");
    setShowCustomForm(false);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[var(--bg-charcoal)] border border-[var(--border-default)] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Ember top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-ember)]/30 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Add App Shortcut</h2>
          <motion.button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Suggested Apps */}
          {appsToAdd.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Suggested Apps</h3>
              <div className="grid grid-cols-2 gap-2">
                {appsToAdd.map((app) => {
                  const isAdded = addedApps.has(app.id);
                  return (
                    <motion.button
                      key={app.id}
                      onClick={() => !isAdded && handleAddApp(app)}
                      disabled={isAdded}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                        isAdded
                          ? "bg-[var(--success)]/10 border-[var(--success)]/30 cursor-default"
                          : "bg-[var(--bg-slate)] border-[var(--border-subtle)] hover:border-[var(--accent-ember)]/50"
                      }`}
                      whileHover={!isAdded ? { scale: 1.02 } : undefined}
                      whileTap={!isAdded ? { scale: 0.98 } : undefined}
                    >
                      <div className={`w-8 h-8 rounded-lg ${app.color} flex items-center justify-center`}>
                        <AppIcon appId={app.id} size={20} />
                      </div>
                      <span className="text-sm text-[var(--text-secondary)] truncate flex-1">{app.name}</span>
                      {isAdded && <Check className="w-4 h-4 text-[var(--success)]" />}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom App */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Custom App</h3>
            {!showCustomForm ? (
              <motion.button
                onClick={() => setShowCustomForm(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[var(--border-default)] hover:border-[var(--accent-ember)]/50 hover:bg-[var(--bg-slate)] transition-colors text-[var(--text-muted)] hover:text-[var(--accent-ember)]"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Plus className="w-4 h-4" />
                Add custom app
              </motion.button>
            ) : (
              <motion.div
                className="space-y-3 p-3 rounded-xl bg-[var(--bg-slate)] border border-[var(--border-subtle)]"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Icon Selector */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Icon</label>
                  <div className="flex gap-1 flex-wrap">
                    {iconOptions.map((icon) => (
                      <motion.button
                        key={icon}
                        onClick={() => setCustomIcon(icon)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-colors ${
                          customIcon === icon
                            ? "bg-[var(--accent-ember)]/20 border border-[var(--accent-ember)]/50"
                            : "bg-[var(--bg-charcoal)] hover:bg-[var(--bg-charcoal)]/80"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {icon}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="App name"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--accent-ember)]/50 input-glow"
                  />
                </div>

                {/* URL Input */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-1.5 block">URL</label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--accent-ember)]/50 input-glow"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="secondary"
                    onClick={() => setShowCustomForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleAddCustom}
                    disabled={!customName.trim() || !customUrl.trim()}
                    className="flex-1"
                  >
                    Add App
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)]">
          <Button variant="secondary" onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Manage Apps Modal Component
function ManageAppsModal({
  apps,
  onRemove,
  onMove,
  onReset,
  onClose,
}: {
  apps: AppShortcut[];
  onRemove: (appId: string) => void;
  onMove: (appId: string, direction: "up" | "down") => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[var(--bg-charcoal)] border border-[var(--border-default)] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden relative"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Ember top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-ember)]/30 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Manage Shortcuts</h2>
          <motion.button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {apps.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <p>No app shortcuts</p>
              <p className="text-sm mt-1">Click the + button to add apps</p>
            </div>
          ) : (
            <div className="space-y-2">
              {apps.map((app, index) => (
                <motion.div
                  key={app.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-slate)] border border-[var(--border-subtle)] group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <motion.button
                      onClick={() => onMove(app.id, "up")}
                      disabled={index === 0}
                      className={`p-0.5 rounded transition-colors ${
                        index === 0 ? "text-[var(--text-muted)]/30" : "text-[var(--text-muted)] hover:text-[var(--accent-ember)] hover:bg-[var(--accent-ember)]/10"
                      }`}
                      whileHover={index !== 0 ? { scale: 1.2 } : undefined}
                      whileTap={index !== 0 ? { scale: 0.8 } : undefined}
                    >
                      <ChevronUp className="w-3 h-3" />
                    </motion.button>
                    <motion.button
                      onClick={() => onMove(app.id, "down")}
                      disabled={index === apps.length - 1}
                      className={`p-0.5 rounded transition-colors ${
                        index === apps.length - 1 ? "text-[var(--text-muted)]/30" : "text-[var(--text-muted)] hover:text-[var(--accent-ember)] hover:bg-[var(--accent-ember)]/10"
                      }`}
                      whileHover={index !== apps.length - 1 ? { scale: 1.2 } : undefined}
                      whileTap={index !== apps.length - 1 ? { scale: 0.8 } : undefined}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </motion.button>
                  </div>

                  {/* App Info */}
                  <div className={`w-8 h-8 rounded-lg ${app.color} flex items-center justify-center`}>
                    {app.customIcon ? (
                      <span className="text-base">{app.customIcon}</span>
                    ) : (
                      <AppIcon appId={app.id} size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] truncate">{app.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{app.url}</p>
                  </div>

                  {/* Actions */}
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-ember)] hover:bg-[var(--accent-ember)]/10 transition-colors"
                    title="Open link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <motion.button
                    onClick={() => onRemove(app.id)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                    title="Remove"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] space-y-2">
          {!confirmReset ? (
            <Button
              variant="ghost"
              onClick={() => setConfirmReset(true)}
              className="w-full"
            >
              Reset to Defaults
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setConfirmReset(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onReset();
                  setConfirmReset(false);
                }}
                className="flex-1"
              >
                Confirm Reset
              </Button>
            </div>
          )}
          <Button variant="primary" onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
