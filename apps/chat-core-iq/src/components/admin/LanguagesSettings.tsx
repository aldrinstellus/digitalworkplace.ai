"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Globe,
  Check,
  Star,
  GripVertical,
  ToggleLeft,
  ToggleRight,
  Settings,
  Loader2,
  Languages,
  Volume2,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { apiUrl } from "@/lib/utils";

interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  isDefault: boolean;
  autoDetect: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface LanguageSettings {
  languages: LanguageConfig[];
  autoDetectEnabled: boolean;
  fallbackLanguage: string;
  browserDetectEnabled: boolean;
  userOverrideAllowed: boolean;
}

interface LanguagesSettingsProps {
  onLanguageChange?: () => void;
}

// Country flag emojis for each language
const languageFlags: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  ht: "🇭🇹",
  fr: "🇫🇷",
  pt: "🇧🇷",
  zh: "🇨🇳",
  de: "🇩🇪",
  it: "🇮🇹",
  ja: "🇯🇵",
  ko: "🇰🇷",
  ru: "🇷🇺",
  ar: "🇸🇦",
  vi: "🇻🇳",
  tl: "🇵🇭",
};

// Common languages for quick add
const commonLanguages = [
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "tl", name: "Tagalog", nativeName: "Tagalog" },
];

export default function LanguagesSettings({ onLanguageChange }: LanguagesSettingsProps) {
  const [settings, setSettings] = useState<LanguageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<LanguageConfig | null>(null);
  const [newLanguage, setNewLanguage] = useState({ code: "", name: "", nativeName: "" });

  // Fetch language settings
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(apiUrl("/api/languages"));
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching language settings:", error);
      toast.error("Failed to load language settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Toggle language enabled/disabled
  const toggleLanguage = async (languageCode: string) => {
    if (!settings) return;
    setSaving(true);

    try {
      const response = await fetch(apiUrl("/api/languages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", languageCode }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success("Language updated");
        onLanguageChange?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update language");
      }
    } catch (error) {
      console.error("Error toggling language:", error);
      toast.error("Failed to update language");
    } finally {
      setSaving(false);
    }
  };

  // Set default language
  const setDefaultLanguage = async (languageCode: string) => {
    if (!settings) return;
    setSaving(true);

    try {
      const response = await fetch(apiUrl("/api/languages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setDefault", languageCode }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success("Default language updated");
        onLanguageChange?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to set default language");
      }
    } catch (error) {
      console.error("Error setting default language:", error);
      toast.error("Failed to set default language");
    } finally {
      setSaving(false);
    }
  };

  // Add new language
  const addLanguage = async () => {
    if (!settings || !newLanguage.code || !newLanguage.name || !newLanguage.nativeName) {
      toast.error("Please fill in all fields");
      return;
    }

    // Check for duplicates
    if (settings.languages.some(l => l.code === newLanguage.code)) {
      toast.error("Language code already exists");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(apiUrl("/api/languages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          language: {
            code: newLanguage.code.toLowerCase(),
            name: newLanguage.name,
            nativeName: newLanguage.nativeName,
            enabled: true,
            isDefault: false,
            autoDetect: true,
            order: settings.languages.length + 1,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success(`${newLanguage.name} added successfully`);
        setShowAddModal(false);
        setNewLanguage({ code: "", name: "", nativeName: "" });
        onLanguageChange?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add language");
      }
    } catch (error) {
      console.error("Error adding language:", error);
      toast.error("Failed to add language");
    } finally {
      setSaving(false);
    }
  };

  // Update language
  const updateLanguage = async () => {
    if (!settings || !editingLanguage) return;
    setSaving(true);

    try {
      const response = await fetch(apiUrl("/api/languages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          language: {
            code: editingLanguage.code,
            name: editingLanguage.name,
            nativeName: editingLanguage.nativeName,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success("Language updated successfully");
        setShowEditModal(false);
        setEditingLanguage(null);
        onLanguageChange?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update language");
      }
    } catch (error) {
      console.error("Error updating language:", error);
      toast.error("Failed to update language");
    } finally {
      setSaving(false);
    }
  };

  // Delete language
  const deleteLanguage = async () => {
    if (!settings || !editingLanguage) return;

    if (editingLanguage.isDefault) {
      toast.error("Cannot delete the default language");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(apiUrl("/api/languages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          languageCode: editingLanguage.code,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success(`${editingLanguage.name} deleted successfully`);
        setShowDeleteModal(false);
        setEditingLanguage(null);
        onLanguageChange?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete language");
      }
    } catch (error) {
      console.error("Error deleting language:", error);
      toast.error("Failed to delete language");
    } finally {
      setSaving(false);
    }
  };

  // Quick add from common languages
  const quickAddLanguage = (lang: { code: string; name: string; nativeName: string }) => {
    setNewLanguage(lang);
  };

  // Toggle global settings
  const updateGlobalSettings = async (updates: Partial<LanguageSettings>) => {
    if (!settings) return;
    setSaving(true);

    try {
      const updatedSettings = { ...settings, ...updates };
      const response = await fetch(apiUrl("/api/languages"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success("Settings updated");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  // Toggle per-language auto-detect
  const toggleAutoDetect = async (languageCode: string) => {
    if (!settings) return;
    setSaving(true);

    const updatedLanguages = settings.languages.map((l) =>
      l.code === languageCode ? { ...l, autoDetect: !l.autoDetect } : l
    );

    try {
      const response = await fetch(apiUrl("/api/languages"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, languages: updatedLanguages }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success("Auto-detect setting updated");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update setting");
      }
    } catch (error) {
      console.error("Error updating auto-detect:", error);
      toast.error("Failed to update setting");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#000080]" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load language settings</p>
      </div>
    );
  }

  const sortedLanguages = [...settings.languages].sort((a, b) => a.order - b.order);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Global Settings Card */}
      <div className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6">
        <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#000080] to-[#1D4F91] flex items-center justify-center shadow-lg">
            <Settings className="h-5 w-5 text-white" />
          </div>
          Global Language Settings
        </h2>

        <div className="space-y-4">
          {/* Auto-detect from message toggle */}
          <motion.label
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-4 bg-gradient-to-br from-[#F5F9FD] to-blue-50/30 rounded-xl cursor-pointer hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#000080]/10"
          >
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-[#000080]" />
              <div>
                <p className="font-medium text-[#000034]">Auto-detect from message</p>
                <p className="text-sm text-[#666666]">Automatically detect language from user&apos;s message</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.autoDetectEnabled}
                onChange={() => updateGlobalSettings({ autoDetectEnabled: !settings.autoDetectEnabled })}
                disabled={saving}
                className="sr-only peer"
              />
              <motion.div
                animate={{ backgroundColor: settings.autoDetectEnabled ? "#000080" : "#E5E7EB" }}
                className="w-12 h-7 rounded-full transition-colors duration-300"
              />
              <motion.div
                animate={{ x: settings.autoDetectEnabled ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
              />
            </div>
          </motion.label>

          {/* Browser language detection toggle */}
          <motion.label
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-4 bg-gradient-to-br from-[#F5F9FD] to-blue-50/30 rounded-xl cursor-pointer hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#000080]/10"
          >
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-[#000080]" />
              <div>
                <p className="font-medium text-[#000034]">Browser language detection</p>
                <p className="text-sm text-[#666666]">Use browser language preference for initial language</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.browserDetectEnabled}
                onChange={() => updateGlobalSettings({ browserDetectEnabled: !settings.browserDetectEnabled })}
                disabled={saving}
                className="sr-only peer"
              />
              <motion.div
                animate={{ backgroundColor: settings.browserDetectEnabled ? "#000080" : "#E5E7EB" }}
                className="w-12 h-7 rounded-full transition-colors duration-300"
              />
              <motion.div
                animate={{ x: settings.browserDetectEnabled ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
              />
            </div>
          </motion.label>

          {/* User override toggle */}
          <motion.label
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-4 bg-gradient-to-br from-[#F5F9FD] to-blue-50/30 rounded-xl cursor-pointer hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#000080]/10"
          >
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-[#000080]" />
              <div>
                <p className="font-medium text-[#000034]">Allow user language selection</p>
                <p className="text-sm text-[#666666]">Let users manually change their language in the chat widget</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.userOverrideAllowed}
                onChange={() => updateGlobalSettings({ userOverrideAllowed: !settings.userOverrideAllowed })}
                disabled={saving}
                className="sr-only peer"
              />
              <motion.div
                animate={{ backgroundColor: settings.userOverrideAllowed ? "#000080" : "#E5E7EB" }}
                className="w-12 h-7 rounded-full transition-colors duration-300"
              />
              <motion.div
                animate={{ x: settings.userOverrideAllowed ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
              />
            </div>
          </motion.label>
        </div>
      </div>

      {/* Languages List Card */}
      <div className="bg-gradient-to-br from-white via-white to-indigo-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#000034] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Globe className="h-5 w-5 text-white" />
            </div>
            Enabled Languages
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#666666]">
              {settings.languages.filter((l) => l.enabled).length} of {settings.languages.length} enabled
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-shadow"
            >
              <Plus className="h-4 w-4" />
              Add Language
            </motion.button>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {sortedLanguages.map((lang) => (
              <motion.div
                key={lang.code}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  lang.enabled
                    ? "bg-gradient-to-br from-white to-blue-50/50 border-[#E7EBF0] hover:border-[#000080]/20"
                    : "bg-gray-50/50 border-gray-200 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Drag handle placeholder */}
                    <GripVertical className="h-5 w-5 text-gray-300 cursor-grab" />

                    {/* Flag and name */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{languageFlags[lang.code] || "🌐"}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#000034]">{lang.nativeName}</span>
                          {lang.isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              <Star className="h-3 w-3 fill-current" />
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#666666]">
                          <span className="uppercase font-mono">{lang.code}</span>
                          <span>•</span>
                          <span>{lang.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Auto-detect toggle */}
                    {lang.enabled && (
                      <button
                        onClick={() => toggleAutoDetect(lang.code)}
                        disabled={saving || !settings.autoDetectEnabled}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                          lang.autoDetect && settings.autoDetectEnabled
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        } ${!settings.autoDetectEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        title={!settings.autoDetectEnabled ? "Enable global auto-detect first" : ""}
                      >
                        {lang.autoDetect ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                        Auto-detect
                      </button>
                    )}

                    {/* Set as default button */}
                    {lang.enabled && !lang.isDefault && (
                      <button
                        onClick={() => setDefaultLanguage(lang.code)}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-amber-700 rounded-lg text-sm transition-all"
                      >
                        <Star className="h-4 w-4" />
                        Set default
                      </button>
                    )}

                    {/* Enable/Disable toggle */}
                    <button
                      onClick={() => toggleLanguage(lang.code)}
                      disabled={saving || (lang.isDefault && lang.enabled)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        lang.enabled
                          ? "bg-[#000080] text-white hover:bg-[#000066]"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      } ${lang.isDefault && lang.enabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      title={lang.isDefault && lang.enabled ? "Cannot disable the default language" : ""}
                    >
                      {lang.enabled ? (
                        <>
                          <Check className="h-4 w-4" />
                          Enabled
                        </>
                      ) : (
                        "Disabled"
                      )}
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => {
                        setEditingLanguage(lang);
                        setShowEditModal(true);
                      }}
                      disabled={saving}
                      className="p-2 text-gray-500 hover:text-[#000080] hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit language"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* Delete button */}
                    {!lang.isDefault && (
                      <button
                        onClick={() => {
                          setEditingLanguage(lang);
                          setShowDeleteModal(true);
                        }}
                        disabled={saving}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete language"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Helper text */}
        <p className="mt-4 text-sm text-[#666666] flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          The default language is used when language cannot be detected
        </p>
      </div>

      {/* Saving indicator */}
      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-[#000080] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Language Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-[#000034] flex items-center gap-2">
                  <Plus className="h-5 w-5 text-[#000080]" />
                  Add New Language
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Quick add from common languages */}
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide">
                    Quick Add Common Language
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonLanguages
                      .filter(l => !settings?.languages.some(sl => sl.code === l.code))
                      .slice(0, 6)
                      .map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => quickAddLanguage(lang)}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                            newLanguage.code === lang.code
                              ? "bg-[#000080] text-white border-[#000080]"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#000080]"
                          }`}
                        >
                          {languageFlags[lang.code] || "🌐"} {lang.name}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500 mb-4">Or enter custom language details:</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide">
                        Language Code
                      </label>
                      <input
                        type="text"
                        value={newLanguage.code}
                        onChange={(e) => setNewLanguage({ ...newLanguage, code: e.target.value.toLowerCase() })}
                        placeholder="e.g., fr, de, ja"
                        maxLength={5}
                        className="w-full h-11 px-4 bg-white border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#999] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide">
                        English Name
                      </label>
                      <input
                        type="text"
                        value={newLanguage.name}
                        onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                        placeholder="e.g., French, German"
                        className="w-full h-11 px-4 bg-white border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#999] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide">
                      Native Name
                    </label>
                    <input
                      type="text"
                      value={newLanguage.nativeName}
                      onChange={(e) => setNewLanguage({ ...newLanguage, nativeName: e.target.value })}
                      placeholder="e.g., Français, Deutsch"
                      className="w-full h-11 px-4 bg-white border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#999] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewLanguage({ code: "", name: "", nativeName: "" });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addLanguage}
                  disabled={saving || !newLanguage.code || !newLanguage.name || !newLanguage.nativeName}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Language
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Language Modal */}
      <AnimatePresence>
        {showEditModal && editingLanguage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-[#000034] flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-[#000080]" />
                  Edit Language
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <span className="text-3xl">{languageFlags[editingLanguage.code] || "🌐"}</span>
                  <div>
                    <p className="font-medium text-[#000034]">{editingLanguage.code.toUpperCase()}</p>
                    <p className="text-sm text-gray-500">Language code cannot be changed</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide">
                    English Name
                  </label>
                  <input
                    type="text"
                    value={editingLanguage.name}
                    onChange={(e) => setEditingLanguage({ ...editingLanguage, name: e.target.value })}
                    className="w-full h-11 px-4 bg-white border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide">
                    Native Name
                  </label>
                  <input
                    type="text"
                    value={editingLanguage.nativeName}
                    onChange={(e) => setEditingLanguage({ ...editingLanguage, nativeName: e.target.value })}
                    className="w-full h-11 px-4 bg-white border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingLanguage(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={updateLanguage}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Language Modal */}
      <AnimatePresence>
        {showDeleteModal && editingLanguage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Delete Language
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl mb-4">
                  <span className="text-3xl">{languageFlags[editingLanguage.code] || "🌐"}</span>
                  <div>
                    <p className="font-medium text-[#000034]">{editingLanguage.nativeName}</p>
                    <p className="text-sm text-gray-500">{editingLanguage.name} ({editingLanguage.code.toUpperCase()})</p>
                  </div>
                </div>
                <p className="text-[#666666]">
                  Are you sure you want to delete this language? This action cannot be undone.
                  All welcome messages and content in this language will be lost.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setEditingLanguage(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={deleteLanguage}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete Language
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
