"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { apiUrl } from "@/lib/utils";
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
  Megaphone,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Loader2,
  CheckSquare,
  Square,
  Search,
  Filter,
  Users,
  Building2,
  Globe,
  ChevronDown,
  RotateCcw,
  Settings2,
  Monitor,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "alert" | "success";
  priority: "low" | "medium" | "high";
  language: "en" | "es" | "ht" | "all";
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  showInChat: boolean;
}

interface BannerSettings {
  rotationEnabled: boolean;
  rotationInterval: number;
  pauseOnHover: boolean;
  showNavigation: boolean;
  showDismiss: boolean;
  updatedAt: string;
}

const typeConfig = {
  info: {
    icon: Info,
    color: "text-[#1D4F91]",
    bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
    border: "border-blue-200",
    glow: "shadow-blue-500/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-700",
    bg: "bg-gradient-to-br from-amber-50 to-yellow-100/50",
    border: "border-amber-200",
    glow: "shadow-amber-500/20",
  },
  alert: {
    icon: Megaphone,
    color: "text-red-600",
    bg: "bg-gradient-to-br from-red-50 to-rose-100/50",
    border: "border-red-200",
    glow: "shadow-red-500/20",
  },
  success: {
    icon: CheckCircle2,
    color: "text-[#006A52]",
    bg: "bg-gradient-to-br from-green-50 to-emerald-100/50",
    border: "border-green-200",
    glow: "shadow-green-500/20",
  },
};

// Animated counter component
function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeOut * value));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

// API response type
interface APIAnnouncement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "urgent";
  startDate: string;
  endDate: string;
  targetAudience: "all" | "residents" | "businesses";
  language: "en" | "es" | "ht" | "all";
  isActive: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function Announcements() {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [filterType, setFilterType] = useState<"all" | "info" | "warning" | "alert" | "success">("all");
  const [filterAudience, setFilterAudience] = useState<"all" | "residents" | "businesses">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority" | "views">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { confirm, DialogComponent } = useConfirmDialog();

  // Banner display settings
  const [bannerSettings, setBannerSettings] = useState<BannerSettings | null>(null);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Map API type to component type
  const mapApiToComponent = (api: APIAnnouncement): Announcement => ({
    id: api.id,
    title: api.title,
    message: api.content,
    type: api.type === "urgent" ? "alert" : api.type,
    priority: api.type === "urgent" ? "high" : api.type === "warning" ? "medium" : "low",
    language: api.language || "all",
    isActive: api.isActive,
    startDate: api.startDate.split("T")[0],
    endDate: api.endDate.split("T")[0],
    createdAt: api.createdAt,
    showInChat: true,
  });

  // Fetch announcements from API
  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await fetch(apiUrl("/api/announcements"));
      if (response.ok) {
        const data = await response.json();
        const mapped = data.announcements.map(mapApiToComponent);
        setAnnouncements(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch banner display settings
  const fetchBannerSettings = useCallback(async () => {
    try {
      const response = await fetch(apiUrl("/api/banner-settings"));
      if (response.ok) {
        const data = await response.json();
        setBannerSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch banner settings:", error);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
    fetchBannerSettings();
  }, [fetchAnnouncements, fetchBannerSettings]);

  // Save banner settings
  const saveBannerSettings = async () => {
    if (!bannerSettings) return;
    setSavingSettings(true);
    try {
      const response = await fetch(apiUrl("/api/banner-settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bannerSettings),
      });
      if (response.ok) {
        const updated = await response.json();
        setBannerSettings(updated);
        setSettingsChanged(false);
        toast.success("Display settings saved successfully");
      } else {
        toast.error("Failed to save display settings");
      }
    } catch (error) {
      console.error("Failed to save banner settings:", error);
      toast.error("An error occurred while saving settings");
    } finally {
      setSavingSettings(false);
    }
  };

  // Update banner setting
  const updateBannerSetting = <K extends keyof BannerSettings>(key: K, value: BannerSettings[K]) => {
    if (bannerSettings) {
      setBannerSettings({ ...bannerSettings, [key]: value });
      setSettingsChanged(true);
    }
  };

  // Format rotation interval for display
  const formatInterval = (ms: number) => {
    const seconds = ms / 1000;
    return seconds === 1 ? "1 second" : `${seconds} seconds`;
  };

  const handleSave = async (announcement: Announcement) => {
    setSaving(true);
    try {
      const apiData = {
        id: announcement.id,
        title: announcement.title,
        content: announcement.message,
        type: announcement.type === "alert" ? "urgent" : announcement.type === "success" ? "info" : announcement.type,
        startDate: announcement.startDate,
        endDate: announcement.endDate,
        targetAudience: "all",
        language: announcement.language,
        isActive: announcement.isActive,
      };

      if (editingAnnouncement) {
        const response = await fetch(apiUrl("/api/announcements"), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        });
        if (response.ok) {
          await fetchAnnouncements();
          toast.success("Announcement updated successfully");
        } else {
          toast.error("Failed to update announcement");
        }
      } else {
        const response = await fetch(apiUrl("/api/announcements"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        });
        if (response.ok) {
          await fetchAnnouncements();
          toast.success("Announcement created successfully");
        } else {
          toast.error("Failed to create announcement");
        }
      }
      setEditingAnnouncement(null);
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to save announcement:", error);
      toast.error("An error occurred while saving the announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    const announcement = announcements.find((a) => a.id === id);
    confirm({
      title: "Delete Announcement",
      description: `Are you sure you want to delete "${announcement?.title?.slice(0, 50)}..."? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/announcements?id=${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            await fetchAnnouncements();
            toast.success("Announcement deleted successfully");
          } else {
            toast.error("Failed to delete announcement");
          }
        } catch (error) {
          console.error("Failed to delete announcement:", error);
          toast.error("An error occurred while deleting the announcement");
        }
      },
    });
  };

  const handleToggleActive = async (id: string) => {
    const announcement = announcements.find((a) => a.id === id);
    if (!announcement) return;

    try {
      const response = await fetch(apiUrl("/api/announcements"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isActive: !announcement.isActive,
        }),
      });
      if (response.ok) {
        await fetchAnnouncements();
        toast.success(`Announcement ${announcement.isActive ? "deactivated" : "activated"} successfully`);
      } else {
        toast.error("Failed to update announcement status");
      }
    } catch (error) {
      console.error("Failed to toggle announcement:", error);
      toast.error("An error occurred while updating the announcement");
    }
  };

  const handleLanguageChange = async (id: string, newLang: "en" | "es" | "ht" | "all") => {
    try {
      const response = await fetch(apiUrl("/api/announcements"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, language: newLang }),
      });
      if (response.ok) {
        await fetchAnnouncements();
        toast.success(`Language updated to ${newLang === "all" ? "All" : newLang.toUpperCase()}`);
      } else {
        toast.error("Failed to update language");
      }
    } catch (error) {
      console.error("Failed to update language:", error);
      toast.error("An error occurred while updating language");
    }
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredAnnouncements.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAnnouncements.map((a) => a.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    confirm({
      title: "Delete Selected Announcements",
      description: `Are you sure you want to delete ${selectedIds.size} announcement(s)? This action cannot be undone.`,
      confirmLabel: "Delete All",
      variant: "danger",
      onConfirm: async () => {
        try {
          const deletePromises = Array.from(selectedIds).map((id) =>
            fetch(`/api/announcements?id=${id}`, { method: "DELETE" })
          );
          await Promise.all(deletePromises);
          await fetchAnnouncements();
          setSelectedIds(new Set());
          toast.success(`${selectedIds.size} announcement(s) deleted successfully`);
        } catch (error) {
          console.error("Failed to bulk delete:", error);
          toast.error("An error occurred while deleting announcements");
        }
      },
    });
  };

  const handleBulkToggleActive = async (activate: boolean) => {
    try {
      const updatePromises = Array.from(selectedIds).map((id) =>
        fetch(apiUrl("/api/announcements"), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, isActive: activate }),
        })
      );
      await Promise.all(updatePromises);
      await fetchAnnouncements();
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size} announcement(s) ${activate ? "activated" : "deactivated"}`);
    } catch (error) {
      console.error("Failed to bulk update:", error);
      toast.error("An error occurred while updating announcements");
    }
  };

  const filteredAnnouncements = useMemo(() => {
    const filtered = announcements.filter((a) => {
      // Status filter
      if (filterActive === "active" && !a.isActive) return false;
      if (filterActive === "inactive" && a.isActive) return false;

      // Type filter
      if (filterType !== "all" && a.type !== filterType) return false;

      // Audience filter - map API types to UI types
      if (filterAudience !== "all") {
        // The API uses 'residents' and 'businesses', but we need to handle 'all' target audience
        const audienceMatches = filterAudience === "residents"
          ? true  // residents can see all announcements
          : filterAudience === "businesses";
        if (!audienceMatches) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = a.title.toLowerCase().includes(query);
        const matchesMessage = a.message.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMessage) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "views":
          return 0; // Views not tracked in current model, but ready for future
        default:
          return 0;
      }
    });

    return filtered;
  }, [announcements, filterActive, filterType, filterAudience, searchQuery, sortBy]);

  const activeCount = announcements.filter((a) => a.isActive).length;
  const highPriorityCount = announcements.filter((a) => a.priority === "high" && a.isActive).length;
  const hasActiveFilters = filterType !== "all" || filterAudience !== "all" || searchQuery.trim() !== "";

  const resetFilters = () => {
    setFilterType("all");
    setFilterAudience("all");
    setSearchQuery("");
    setSortBy("newest");
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {DialogComponent}
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[32px] font-bold text-[#000034] tracking-tight">{t("announcements.title")}</h1>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Bell className="h-6 w-6 text-amber-700" />
            </motion.div>
          </div>
          <p className="text-[#666666] mt-1 text-[15px]">{t("announcements.subtitle")}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="h-11 px-6 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2 w-fit"
        >
          <Plus className="h-4 w-4" />
          {t("announcements.newAnnouncement")}
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: t("common.total"), value: announcements.length, icon: Bell, gradient: "from-[#000080]" },
          { label: t("common.active"), value: activeCount, icon: Eye, gradient: "from-[#006A52]" },
          { label: t("common.inactive"), value: announcements.length - activeCount, icon: EyeOff, gradient: "from-gray-500" },
          { label: t("announcements.highPriority"), value: highPriorityCount, icon: AlertTriangle, gradient: "from-amber-500" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,128,0.15)] transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} to-transparent/50 flex items-center justify-center shadow-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#666666] font-medium uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-[#000034]">
                  <AnimatedCounter value={stat.value} />
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Display Settings Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          onClick={() => setShowDisplaySettings(!showDisplaySettings)}
          className="w-full bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] p-4 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,128,0.12)] transition-all duration-300 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#000080] to-[#1D4F91] flex items-center justify-center shadow-lg">
              <Settings2 className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[#000034]">Banner Display Settings</h3>
              <p className="text-sm text-[#666666]">
                {bannerSettings?.rotationEnabled
                  ? `Auto-rotation every ${(bannerSettings.rotationInterval / 1000)}s`
                  : "Auto-rotation disabled"
                }
                {bannerSettings?.showNavigation && " • Navigation visible"}
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: showDisplaySettings ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-[#666666]" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {showDisplaySettings && bannerSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Rotation Settings */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <RotateCcw className="h-5 w-5 text-[#000080]" />
                      <h4 className="font-semibold text-[#000034]">Auto-Rotation</h4>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="rotationEnabled" className="text-sm font-medium text-[#363535]">
                          Enable Auto-Rotation
                        </Label>
                        <p className="text-xs text-[#6b6b6b] mt-0.5">
                          Automatically cycle through announcements
                        </p>
                      </div>
                      <Switch
                        id="rotationEnabled"
                        checked={bannerSettings.rotationEnabled}
                        onCheckedChange={(checked: boolean) => updateBannerSetting("rotationEnabled", checked)}
                      />
                    </div>

                    <div className={!bannerSettings.rotationEnabled ? "opacity-50 pointer-events-none" : ""}>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium text-[#363535]">Rotation Speed</Label>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded-lg text-[#666666]">
                          {formatInterval(bannerSettings.rotationInterval)}
                        </span>
                      </div>
                      <Slider
                        value={[bannerSettings.rotationInterval / 1000]}
                        onValueChange={([value]: number[]) => updateBannerSetting("rotationInterval", value * 1000)}
                        min={3}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-[#6b6b6b] mt-2">
                        <span>3s (fast)</span>
                        <span>30s (slow)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pauseOnHover" className="text-sm font-medium text-[#363535]">
                          Pause on Hover
                        </Label>
                        <p className="text-xs text-[#6b6b6b] mt-0.5">
                          Stop rotation when hovering
                        </p>
                      </div>
                      <Switch
                        id="pauseOnHover"
                        checked={bannerSettings.pauseOnHover}
                        onCheckedChange={(checked: boolean) => updateBannerSetting("pauseOnHover", checked)}
                        disabled={!bannerSettings.rotationEnabled}
                      />
                    </div>
                  </div>

                  {/* Display Options */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Monitor className="h-5 w-5 text-[#000080]" />
                      <h4 className="font-semibold text-[#000034]">Display Options</h4>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showNavigation" className="text-sm font-medium text-[#363535]">
                          Show Navigation
                        </Label>
                        <p className="text-xs text-[#6b6b6b] mt-0.5">
                          Display prev/next arrows and indicators
                        </p>
                      </div>
                      <Switch
                        id="showNavigation"
                        checked={bannerSettings.showNavigation}
                        onCheckedChange={(checked: boolean) => updateBannerSetting("showNavigation", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showDismiss" className="text-sm font-medium text-[#363535]">
                          Show Dismiss Button
                        </Label>
                        <p className="text-xs text-[#6b6b6b] mt-0.5">
                          Allow users to dismiss announcements
                        </p>
                      </div>
                      <Switch
                        id="showDismiss"
                        checked={bannerSettings.showDismiss}
                        onCheckedChange={(checked: boolean) => updateBannerSetting("showDismiss", checked)}
                      />
                    </div>

                    {/* Save Button */}
                    <div className="pt-4 border-t border-[#E7EBF0]">
                      <motion.button
                        whileHover={{ scale: settingsChanged ? 1.02 : 1 }}
                        whileTap={{ scale: settingsChanged ? 0.98 : 1 }}
                        onClick={saveBannerSettings}
                        disabled={!settingsChanged || savingSettings}
                        className={`w-full h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                          settingsChanged
                            ? "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white hover:shadow-lg hover:shadow-[#000080]/25"
                            : "bg-gray-100 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {savingSettings ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {savingSettings ? "Saving..." : "Save Display Settings"}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 mb-6"
      >
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
            <input
              type="text"
              placeholder={t("announcements.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-white border border-[#E7EBF0] rounded-xl text-sm text-[#363535] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#666] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle & Sort */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`h-11 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white shadow-lg shadow-[#000080]/25"
                  : "bg-white border border-[#E7EBF0] text-[#363535] hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  {(filterType !== "all" ? 1 : 0) + (filterAudience !== "all" ? 1 : 0)}
                </span>
              )}
            </motion.button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-11 pl-4 pr-10 bg-white border border-[#E7EBF0] rounded-xl text-sm text-[#363535] appearance-none cursor-pointer focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Type Filter */}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide">
                      Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "all", label: "All Types", icon: null },
                        { value: "info", label: "Info", icon: Info },
                        { value: "warning", label: "Warning", icon: AlertTriangle },
                        { value: "alert", label: "Alert", icon: Megaphone },
                        { value: "success", label: "Success", icon: CheckCircle2 },
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setFilterType(type.value as typeof filterType)}
                          className={`h-9 px-3 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                            filterType === type.value
                              ? "bg-[#000080] text-white shadow-sm"
                              : "bg-gray-50 text-[#666666] hover:bg-gray-100"
                          }`}
                        >
                          {type.icon && <type.icon className="h-3.5 w-3.5" />}
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audience Filter */}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide">
                      Target Audience
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "all", label: "Everyone", icon: Globe },
                        { value: "residents", label: "Residents", icon: Users },
                        { value: "businesses", label: "Businesses", icon: Building2 },
                      ].map((audience) => (
                        <button
                          key={audience.value}
                          onClick={() => setFilterAudience(audience.value as typeof filterAudience)}
                          className={`h-9 px-3 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                            filterAudience === audience.value
                              ? "bg-[#000080] text-white shadow-sm"
                              : "bg-gray-50 text-[#666666] hover:bg-gray-100"
                          }`}
                        >
                          <audience.icon className="h-3.5 w-3.5" />
                          {audience.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset Button */}
                  {hasActiveFilters && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetFilters}
                      className="h-9 px-4 rounded-lg text-sm font-medium flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset Filters
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "inactive"] as const).map((filter) => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilterActive(filter)}
              className={`relative h-10 px-5 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
                filterActive === filter
                  ? "text-white"
                  : "bg-white text-[#363535] hover:bg-gray-50 border border-[#E7EBF0]"
              }`}
            >
              {filterActive === filter && (
                <motion.div
                  layoutId="activeFilterBg"
                  className="absolute inset-0 bg-gradient-to-r from-[#000080] to-[#1D4F91] rounded-xl shadow-lg shadow-[#000080]/25"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {filter === "all" && `All (${announcements.length})`}
                {filter === "active" && (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    Active ({activeCount})
                  </>
                )}
                {filter === "inactive" && (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    Inactive ({announcements.length - activeCount})
                  </>
                )}
              </span>
            </motion.button>
          ))}

          {/* Results Count */}
          {(searchQuery || hasActiveFilters) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-10 px-4 flex items-center text-sm text-[#666666] bg-gray-50 rounded-xl"
            >
              Showing {filteredAnnouncements.length} of {announcements.length} announcements
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(showAddForm || editingAnnouncement) && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_8px_30px_-4px_rgba(0,0,128,0.12)] p-6 mb-6 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#000080] to-[#1D4F91] flex items-center justify-center shadow-lg">
                {editingAnnouncement ? <Edit2 className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
              </div>
              {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
            </h3>
            <AnnouncementForm
              announcement={editingAnnouncement || undefined}
              onSave={handleSave}
              onCancel={() => {
                setEditingAnnouncement(null);
                setShowAddForm(false);
              }}
              saving={saving}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-[#000080]/5 to-[#1D4F91]/5 border border-[#000080]/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm text-[#000080] hover:text-[#1D4F91] transition-colors"
                >
                  {selectedIds.size === filteredAnnouncements.length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {selectedIds.size === filteredAnnouncements.length ? "Deselect All" : "Select All"}
                </button>
                <span className="text-sm text-[#666666]">
                  {selectedIds.size} of {filteredAnnouncements.length} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBulkToggleActive(true)}
                  className="h-9 px-4 bg-[#006A52] text-white text-sm font-medium rounded-lg hover:bg-[#005a45] transition-colors flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Activate
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBulkToggleActive(false)}
                  className="h-9 px-4 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <EyeOff className="h-4 w-4" />
                  Deactivate
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBulkDelete}
                  className="h-9 px-4 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <>
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)]"
              >
                <div className="flex items-start gap-4">
                  <Skeleton className="h-5 w-5 mt-1 bg-gray-200" />
                  <Skeleton className="h-14 w-14 rounded-xl bg-gray-200" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-5 w-48 bg-gray-200" />
                      <Skeleton className="h-5 w-20 rounded-lg bg-gray-100" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2 bg-gray-100" />
                    <Skeleton className="h-4 w-3/4 mb-3 bg-gray-100" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-32 rounded-lg bg-gray-100" />
                      <Skeleton className="h-6 w-28 rounded-lg bg-gray-100" />
                      <Skeleton className="h-6 w-16 rounded-lg bg-gray-100" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-9 w-9 rounded-lg bg-gray-200" />
                    <Skeleton className="h-9 w-9 rounded-lg bg-gray-200" />
                    <Skeleton className="h-9 w-9 rounded-lg bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : filteredAnnouncements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] p-12 text-center shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)]"
          >
            <Bell className="h-12 w-12 mx-auto mb-4 text-[#E7EBF0]" />
            <h3 className="font-medium text-[#000034] mb-2">{t("announcements.noAnnouncements")}</h3>
            <p className="text-sm text-[#666666]">
              {t("announcements.createFirst")}
            </p>
          </motion.div>
        ) : (
          filteredAnnouncements.map((announcement, idx) => {
            const config = typeConfig[announcement.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className={`bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,128,0.12)] transition-all duration-300 ${
                  !announcement.isActive ? "opacity-60" : ""
                } ${announcement.priority === "high" && announcement.isActive ? `shadow-lg ${config.glow}` : ""}`}
              >
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOne(announcement.id);
                    }}
                    className={`flex-shrink-0 mt-1 ${
                      selectedIds.has(announcement.id)
                        ? "text-[#000080]"
                        : "text-gray-300 hover:text-gray-500"
                    } transition-colors`}
                  >
                    {selectedIds.has(announcement.id) ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </motion.button>

                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`p-3.5 rounded-xl ${config.bg} ${config.border} border flex-shrink-0 shadow-sm`}
                  >
                    <Icon className={`h-6 w-6 ${config.color}`} />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="font-semibold text-[#000034]">{announcement.title}</h3>
                      {announcement.priority === "high" && (
                        <motion.span
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-red-50 to-rose-50 text-red-600 px-2.5 py-1 rounded-lg font-medium border border-red-100"
                        >
                          <Zap className="h-3 w-3" />
                          High Priority
                        </motion.span>
                      )}
                      {!announcement.isActive && (
                        <span className="text-xs bg-gray-100 text-[#666666] px-2.5 py-1 rounded-lg font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#666666] mb-3 leading-relaxed">{announcement.message}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6b6b6b]">
                      <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                        <Calendar className="h-3.5 w-3.5" />
                        {announcement.startDate} - {announcement.endDate}
                      </span>
                      <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                        <Clock className="h-3.5 w-3.5" />
                        Created: {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                      {/* Language Toggle Buttons */}
                      <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLanguageChange(announcement.id, "en");
                          }}
                          className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
                            announcement.language === "en" || announcement.language === "all"
                              ? "bg-[#1D4F91] text-white shadow-sm"
                              : "text-gray-500 hover:text-gray-600"
                          }`}
                          title="English"
                        >
                          EN
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLanguageChange(announcement.id, "es");
                          }}
                          className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
                            announcement.language === "es" || announcement.language === "all"
                              ? "bg-[#006A52] text-white shadow-sm"
                              : "text-gray-500 hover:text-gray-600"
                          }`}
                          title="Spanish"
                        >
                          ES
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLanguageChange(announcement.id, "ht");
                          }}
                          className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
                            announcement.language === "ht" || announcement.language === "all"
                              ? "bg-[#C8102E] text-white shadow-sm"
                              : "text-gray-500 hover:text-gray-600"
                          }`}
                          title="Haitian Creole"
                        >
                          HT
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLanguageChange(announcement.id, "all");
                          }}
                          className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
                            announcement.language === "all"
                              ? "bg-gradient-to-r from-[#1D4F91] to-[#C8102E] text-white shadow-sm"
                              : "text-gray-500 hover:text-gray-600"
                          }`}
                          title="All Languages"
                        >
                          ALL
                        </button>
                      </div>
                      {announcement.showInChat && (
                        <span className="flex items-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-[#1D4F91] px-2.5 py-1 rounded-lg font-medium border border-blue-100">
                          <Sparkles className="h-3 w-3" />
                          Shown in Chat
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleActive(announcement.id)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors ${
                        announcement.isActive ? "text-[#006A52]" : "text-[#6b6b6b]"
                      }`}
                      title={announcement.isActive ? "Deactivate" : "Activate"}
                    >
                      {announcement.isActive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditingAnnouncement(announcement)}
                      className="w-9 h-9 flex items-center justify-center text-[#6b6b6b] hover:text-[#1D4F91] hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(announcement.id)}
                      className="w-9 h-9 flex items-center justify-center text-[#6b6b6b] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Announcement Form Component
function AnnouncementForm({
  announcement,
  onSave,
  onCancel,
  saving = false,
}: {
  announcement?: Announcement;
  onSave: (announcement: Announcement) => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  const { today, nextWeek } = useMemo(() => {
    const now = new Date();
    const next = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return {
      today: now.toISOString().split("T")[0],
      nextWeek: next.toISOString().split("T")[0],
    };
  }, []);

  const [formData, setFormData] = useState<Announcement>({
    id: announcement?.id || "",
    title: announcement?.title || "",
    message: announcement?.message || "",
    type: announcement?.type || "info",
    priority: announcement?.priority || "medium",
    language: announcement?.language || "all",
    isActive: announcement?.isActive ?? true,
    startDate: announcement?.startDate || today,
    endDate: announcement?.endDate || nextWeek,
    createdAt: announcement?.createdAt || "",
    showInChat: announcement?.showInChat ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full h-11 px-4 bg-white border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 focus:shadow-[0_0_0_4px_rgba(0,0,128,0.05)] transition-all duration-200";
  const labelClass = "block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={inputClass}
          placeholder="Announcement title..."
          required
        />
      </div>

      <div>
        <label className={labelClass}>Message</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 bg-white border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 focus:shadow-[0_0_0_4px_rgba(0,0,128,0.05)] transition-all duration-200 min-h-[120px] resize-none"
          placeholder="Announcement message..."
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Type</label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as Announcement["type"] })
            }
            className={`${inputClass} cursor-pointer`}
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="alert">Alert</option>
            <option value="success">Success</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Priority</label>
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value as Announcement["priority"] })
            }
            className={`${inputClass} cursor-pointer`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Language</label>
          <select
            value={formData.language}
            onChange={(e) =>
              setFormData({ ...formData, language: e.target.value as Announcement["language"] })
            }
            className={`${inputClass} cursor-pointer`}
          >
            <option value="all">All Languages</option>
            <option value="en">English Only</option>
            <option value="es">Spanish Only</option>
            <option value="ht">Haitian Creole Only</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className={`${inputClass} cursor-pointer`}
            required
          />
        </div>

        <div>
          <label className={labelClass}>End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className={`${inputClass} cursor-pointer`}
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-6 pt-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-[#000080] peer-checked:to-[#1D4F91] transition-all duration-300"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5"></div>
          </div>
          <span className="text-sm text-[#363535] group-hover:text-[#000034] transition-colors">Active</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.showInChat}
              onChange={(e) => setFormData({ ...formData, showInChat: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-[#000080] peer-checked:to-[#1D4F91] transition-all duration-300"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5"></div>
          </div>
          <span className="text-sm text-[#363535] group-hover:text-[#000034] transition-colors">Show in Chatbot</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#E7EBF0]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="h-11 px-6 bg-white border border-[#E7EBF0] text-[#363535] text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: saving ? 1 : 1.02, y: saving ? 0 : -2 }}
          whileTap={{ scale: saving ? 1 : 0.98 }}
          type="submit"
          disabled={saving}
          className="h-11 px-6 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Announcement"}
        </motion.button>
      </div>
    </form>
  );
}
