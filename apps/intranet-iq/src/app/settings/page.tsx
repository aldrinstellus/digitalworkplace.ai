"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { FadeIn, StaggerContainer, StaggerItem } from "@/lib/motion";
import { useUserSettings, useCurrentUser, useDepartments } from "@/lib/hooks/useSupabase";
import {
  Settings,
  User,
  Bell,
  Lock,
  Palette,
  Monitor,
  Shield,
  Users,
  Database,
  Activity,
  Moon,
  Sun,
  Mail,
  MessageSquare,
  Loader2,
  Check,
  X,
  Plus,
  Trash2,
  Edit3,
} from "lucide-react";

const settingsSections = [
  { id: "profile", name: "Profile", icon: User },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "appearance", name: "Appearance", icon: Palette },
  { id: "privacy", name: "Privacy & Security", icon: Lock },
  { id: "integrations", name: "Integrations", icon: Database },
];

const adminSections = [
  { id: "users", name: "User Management", icon: Users },
  { id: "roles", name: "Roles & Permissions", icon: Shield },
  { id: "audit", name: "Audit Logs", icon: Activity },
  { id: "system", name: "System Settings", icon: Settings },
];

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

// Role types and default data
interface Role {
  id: string;
  name: string;
  users: number;
  permissions: string[];
  color: string;
  system: boolean;
  description?: string;
}

const availablePermissions = [
  { id: "all", label: "All Permissions", category: "System" },
  { id: "manage_users", label: "Manage Users", category: "User Management" },
  { id: "invite_users", label: "Invite Users", category: "User Management" },
  { id: "view_users", label: "View Users", category: "User Management" },
  { id: "edit_roles", label: "Edit Roles", category: "User Management" },
  { id: "remove_users", label: "Remove Users", category: "User Management" },
  { id: "manage_content", label: "Manage Content", category: "Content Management" },
  { id: "create_content", label: "Create Content", category: "Content Management" },
  { id: "edit_content", label: "Edit Content", category: "Content Management" },
  { id: "edit_own", label: "Edit Own Content", category: "Content Management" },
  { id: "delete_content", label: "Delete Content", category: "Content Management" },
  { id: "publish", label: "Publish Content", category: "Content Management" },
  { id: "view_content", label: "View Content", category: "Content Management" },
  { id: "view_analytics", label: "View Analytics", category: "Analytics" },
  { id: "export_data", label: "Export Data", category: "Analytics" },
  { id: "create_dashboards", label: "Create Dashboards", category: "Analytics" },
  { id: "manage_integrations", label: "Manage Integrations", category: "System" },
  { id: "configure_settings", label: "Configure Settings", category: "System" },
  { id: "view_audit_logs", label: "View Audit Logs", category: "System" },
];

const roleColors = [
  { id: "red", label: "Red", class: "bg-red-500" },
  { id: "orange", label: "Orange", class: "bg-orange-500" },
  { id: "amber", label: "Amber", class: "bg-amber-500" },
  { id: "green", label: "Green", class: "bg-green-500" },
  { id: "blue", label: "Blue", class: "bg-blue-500" },
  { id: "purple", label: "Purple", class: "bg-purple-500" },
  { id: "gray", label: "Gray", class: "bg-gray-500" },
];

const defaultRoles: Role[] = [
  { id: "1", name: "Super Admin", users: 2, permissions: ["all"], color: "bg-red-500", system: true, description: "Full system access" },
  { id: "2", name: "Admin", users: 5, permissions: ["manage_users", "manage_content", "view_analytics"], color: "bg-orange-500", system: true, description: "Administrative access" },
  { id: "3", name: "Editor", users: 12, permissions: ["create_content", "edit_content", "publish"], color: "bg-[var(--accent-ember)]", system: true, description: "Content creation and publishing" },
  { id: "4", name: "Contributor", users: 25, permissions: ["create_content", "edit_own"], color: "bg-green-500", system: false, description: "Create and edit own content" },
  { id: "5", name: "Viewer", users: 150, permissions: ["view_content"], color: "bg-gray-500", system: true, description: "Read-only access" },
];

const defaultNotificationSettings: NotificationSetting[] = [
  {
    id: "mentions",
    label: "Mentions & Replies",
    description: "When someone mentions you or replies to your messages",
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: "channels",
    label: "Channel Activity",
    description: "New posts in channels you follow",
    email: false,
    push: true,
    inApp: true,
  },
  {
    id: "documents",
    label: "Document Updates",
    description: "Changes to documents you're subscribed to",
    email: true,
    push: false,
    inApp: true,
  },
  {
    id: "calendar",
    label: "Calendar Events",
    description: "Reminders for upcoming meetings and events",
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: "workflows",
    label: "Workflow Notifications",
    description: "Updates on agentic workflow executions",
    email: false,
    push: true,
    inApp: true,
  },
];

function SettingsPageInner() {
  const { user: clerkUser } = useUser();
  const { user: dbUser } = useCurrentUser();
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings();
  const { departments } = useDepartments();
  const searchParams = useSearchParams();

  // Get initial tab from URL parameter
  const urlTab = searchParams.get("tab");
  const validTabs = ["profile", "notifications", "appearance", "privacy", "integrations", "users", "roles", "audit", "system", "activity"];
  const initialTab = urlTab && validTabs.includes(urlTab) ? urlTab : "profile";
  // Map 'activity' to 'audit' since that's where activity logs are
  const mappedInitialTab = initialTab === "activity" ? "audit" : initialTab;

  const [activeSection, setActiveSection] = useState(mappedInitialTab);
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("pt");
  const [notifications, setNotifications] = useState(defaultNotificationSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isAdmin] = useState(true); // In production, check actual role from dbUser
  const settingsInitializedRef = useRef(false);
  const prevSettingsIdRef = useRef<string | null>(null);

  // Session management state
  const [sessions, setSessions] = useState([
    { id: "1", device: "MacBook Pro", location: "San Francisco, CA", current: true },
    { id: "2", device: "iPhone 15", location: "San Francisco, CA", current: false },
  ]);
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Viewer");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Roles & Permissions state
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("bg-blue-500");
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [roleDeleteConfirm, setRoleDeleteConfirm] = useState<string | null>(null);

  // Handle photo change
  const handlePhotoChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to storage and update user profile
      console.log("Uploading photo:", file.name);
      // await uploadProfilePhoto(file);
    }
  };

  // Handle photo remove
  const handleRemovePhoto = () => {
    // In production, remove photo from storage and update user profile
    console.log("Removing photo");
  };

  // Handle sign out session
  const handleSignOutSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    // In production, invalidate the session token
  };

  // Handle 2FA toggle
  const handleToggle2FA = () => {
    if (twoFactorEnabled) {
      // In production, show confirmation dialog before disabling
      if (confirm("Are you sure you want to disable Two-Factor Authentication?")) {
        setTwoFactorEnabled(false);
      }
    } else {
      // In production, show 2FA setup wizard
      setTwoFactorEnabled(true);
    }
  };

  // Handle invite user
  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;
    // In production, send invite via API
    console.log("Inviting user:", inviteEmail, "with role:", inviteRole);
    setShowInviteModal(false);
    setInviteEmail("");
    setInviteRole("Viewer");
  };

  // Role management handlers
  const resetRoleForm = () => {
    setNewRoleName("");
    setNewRoleDescription("");
    setNewRoleColor("bg-blue-500");
    setNewRolePermissions([]);
    setSelectedRole(null);
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim()) return;
    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: newRoleName.trim(),
      description: newRoleDescription.trim(),
      users: 0,
      permissions: newRolePermissions,
      color: newRoleColor,
      system: false,
    };
    setRoles((prev) => [...prev, newRole]);
    setShowCreateRoleModal(false);
    resetRoleForm();
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setNewRoleName(role.name);
    setNewRoleDescription(role.description || "");
    setNewRoleColor(role.color);
    setNewRolePermissions([...role.permissions]);
    setShowEditRoleModal(true);
  };

  const handleUpdateRole = () => {
    if (!selectedRole || !newRoleName.trim()) return;
    setRoles((prev) =>
      prev.map((r) =>
        r.id === selectedRole.id
          ? {
              ...r,
              name: newRoleName.trim(),
              description: newRoleDescription.trim(),
              color: newRoleColor,
              permissions: newRolePermissions,
            }
          : r
      )
    );
    setShowEditRoleModal(false);
    resetRoleForm();
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    setRoleDeleteConfirm(null);
  };

  const togglePermission = (permId: string) => {
    setNewRolePermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  // Load settings from database (using useEffect to avoid state update during render)
  const settingsId = settings?.id ?? null;
  useEffect(() => {
    if (settings && settingsId !== prevSettingsIdRef.current && !settingsInitializedRef.current) {
      prevSettingsIdRef.current = settingsId;
      settingsInitializedRef.current = true;

      const appearance = settings.appearance as { theme?: string; language?: string; timezone?: string } | null;
      const notifPrefs = settings.notification_prefs as unknown as Record<string, { email?: boolean; push?: boolean; inApp?: boolean }> | null;

      if (appearance?.theme) {
        setTheme(appearance.theme as "dark" | "light" | "system");
      }
      if (appearance?.language) {
        setLanguage(appearance.language);
      }
      if (appearance?.timezone) {
        setTimezone(appearance.timezone);
      }

      if (notifPrefs && typeof notifPrefs === "object") {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            email: notifPrefs[n.id]?.email ?? n.email,
            push: notifPrefs[n.id]?.push ?? n.push,
            inApp: notifPrefs[n.id]?.inApp ?? n.inApp,
          }))
        );
      }
    }
  }, [settings, settingsId]);

  // Apply theme to document when theme changes
  useEffect(() => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove("theme-dark", "theme-light");

    if (theme === "system") {
      // Use system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(prefersDark ? "theme-dark" : "theme-light");
    } else {
      root.classList.add(`theme-${theme}`);
    }

    // Also update CSS variables for immediate visual feedback
    if (theme === "light" || (theme === "system" && !window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.style.setProperty("--bg-obsidian", "#f5f5f7");
      root.style.setProperty("--bg-charcoal", "#ffffff");
      root.style.setProperty("--bg-slate", "#e5e5e7");
      root.style.setProperty("--text-primary", "#1a1a1a");
      root.style.setProperty("--text-secondary", "rgba(26, 26, 26, 0.7)");
      root.style.setProperty("--text-muted", "rgba(26, 26, 26, 0.5)");
      root.style.setProperty("--border-subtle", "rgba(0, 0, 0, 0.08)");
      root.style.setProperty("--border-default", "rgba(0, 0, 0, 0.15)");
    } else {
      // Reset to dark theme (original values)
      root.style.setProperty("--bg-obsidian", "#08080c");
      root.style.setProperty("--bg-charcoal", "#121218");
      root.style.setProperty("--bg-slate", "#1c1c24");
      root.style.setProperty("--text-primary", "#fafafa");
      root.style.setProperty("--text-secondary", "rgba(250, 250, 250, 0.7)");
      root.style.setProperty("--text-muted", "rgba(250, 250, 250, 0.5)");
      root.style.setProperty("--border-subtle", "rgba(255, 255, 255, 0.06)");
      root.style.setProperty("--border-default", "rgba(255, 255, 255, 0.12)");
    }
  }, [theme]);

  const toggleNotification = (id: string, type: "email" | "push" | "inApp") => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [type]: !n[type] } : n))
    );
  };

  const handleSaveSettings = useCallback(async () => {
    setSaving(true);

    const notificationPrefs: Record<string, { email: boolean; push: boolean; inApp: boolean }> = {};
    notifications.forEach((n) => {
      notificationPrefs[n.id] = { email: n.email, push: n.push, inApp: n.inApp };
    });

    await updateSettings({
      notification_prefs: notificationPrefs,
      appearance: { theme, language, timezone, sidebar_collapsed: false, density: "comfortable" },
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [notifications, theme, language, timezone, updateSettings]);

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-1">Profile Settings</h2>
              <p className="text-sm text-[var(--text-muted)]">Manage your personal information and preferences</p>
            </div>

            {/* Profile Photo */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Profile Photo</h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center text-[var(--text-primary)] text-2xl font-medium overflow-hidden">
                  {clerkUser?.imageUrl ? (
                    <img
                      src={clerkUser.imageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      {clerkUser?.firstName?.[0]}
                      {clerkUser?.lastName?.[0]}
                    </>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={handlePhotoChange}
                    className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-[var(--text-primary)] text-sm transition-colors"
                  >
                    Change Photo
                  </button>
                  <button
                    onClick={handleRemovePhoto}
                    className="px-4 py-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm ml-2 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    defaultValue={clerkUser?.firstName || dbUser?.full_name?.split(" ")[0] || ""}
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    defaultValue={clerkUser?.lastName || dbUser?.full_name?.split(" ")[1] || ""}
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={clerkUser?.primaryEmailAddress?.emailAddress || dbUser?.email || ""}
                    disabled
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-muted)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Department
                  </label>
                  <select className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors">
                    <option value="">Select department...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineer"
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="mt-6 px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] disabled:opacity-50 text-[var(--text-primary)] text-sm transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <Check className="w-4 h-4" />
                ) : null}
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-1">Notification Settings</h2>
              <p className="text-sm text-[var(--text-muted)]">Control how and when you receive notifications</p>
            </div>

            {settingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-ember)]" />
              </div>
            ) : (
              <>
                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-slate)]">
                    <div className="text-sm font-medium text-[var(--text-primary)]">Notification Type</div>
                    <div className="text-sm font-medium text-[var(--text-primary)] text-center flex items-center justify-center gap-1">
                      <Mail className="w-4 h-4" /> Email
                    </div>
                    <div className="text-sm font-medium text-[var(--text-primary)] text-center flex items-center justify-center gap-1">
                      <Bell className="w-4 h-4" /> Push
                    </div>
                    <div className="text-sm font-medium text-[var(--text-primary)] text-center flex items-center justify-center gap-1">
                      <MessageSquare className="w-4 h-4" /> In-App
                    </div>
                  </div>

                  {notifications.map((setting) => (
                    <div
                      key={setting.id}
                      className="grid grid-cols-4 gap-4 p-4 border-b border-[var(--border-subtle)] last:border-b-0"
                    >
                      <div>
                        <div className="text-sm text-[var(--text-primary)]">{setting.label}</div>
                        <div className="text-xs text-[var(--text-muted)]">{setting.description}</div>
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleNotification(setting.id, "email")}
                          className={`w-10 h-6 rounded-full transition-colors ${
                            setting.email ? "bg-[var(--accent-ember)]" : "bg-[var(--bg-slate)]"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${
                              setting.email ? "translate-x-4" : ""
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleNotification(setting.id, "push")}
                          className={`w-10 h-6 rounded-full transition-colors ${
                            setting.push ? "bg-[var(--accent-ember)]" : "bg-[var(--bg-slate)]"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${
                              setting.push ? "translate-x-4" : ""
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleNotification(setting.id, "inApp")}
                          className={`w-10 h-6 rounded-full transition-colors ${
                            setting.inApp ? "bg-[var(--accent-ember)]" : "bg-[var(--bg-slate)]"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${
                              setting.inApp ? "translate-x-4" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quiet Hours */}
                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
                  <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Quiet Hours</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    Pause notifications during specific hours
                  </p>
                  <div className="flex items-center gap-4">
                    <select className="bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none">
                      <option>10:00 PM</option>
                      <option>11:00 PM</option>
                      <option>12:00 AM</option>
                    </select>
                    <span className="text-[var(--text-muted)]">to</span>
                    <select className="bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none">
                      <option>6:00 AM</option>
                      <option>7:00 AM</option>
                      <option>8:00 AM</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] disabled:opacity-50 text-[var(--text-primary)] text-sm transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : saved ? (
                    <Check className="w-4 h-4" />
                  ) : null}
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                </button>
              </>
            )}
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-1">Appearance</h2>
              <p className="text-sm text-[var(--text-muted)]">Customize how Intranet IQ looks on your device</p>
            </div>

            {/* Theme */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "light", label: "Light", icon: Sun },
                  { id: "system", label: "System", icon: Monitor },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as "dark" | "light" | "system")}
                    className={`p-4 rounded-xl border transition-colors ${
                      theme === t.id
                        ? "border-blue-500 bg-[var(--accent-ember)]/10"
                        : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                    }`}
                  >
                    <t.icon className={`w-6 h-6 mx-auto mb-2 ${theme === t.id ? "text-[var(--accent-ember)]" : "text-[var(--text-muted)]"}`} />
                    <div className={`text-sm ${theme === t.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                      {t.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Language & Region</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50"
                  >
                    <option value="pt">Pacific Time (PT)</option>
                    <option value="mt">Mountain Time (MT)</option>
                    <option value="ct">Central Time (CT)</option>
                    <option value="et">Eastern Time (ET)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] disabled:opacity-50 text-[var(--text-primary)] text-sm transition-colors flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : null}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-1">Privacy & Security</h2>
              <p className="text-sm text-[var(--text-muted)]">Manage your account security and privacy preferences</p>
            </div>

            {/* Two-Factor Auth */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${twoFactorEnabled ? "bg-[var(--success)]/20" : "bg-[var(--bg-slate)]"}`}>
                    <Shield className={`w-5 h-5 ${twoFactorEnabled ? "text-[var(--success)]" : "text-[var(--text-muted)]"}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">Two-Factor Authentication</h3>
                    <p className="text-xs text-[var(--text-muted)]">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    twoFactorEnabled
                      ? "border-[var(--success)]/30 text-[var(--success)] hover:bg-[var(--success)]/10"
                      : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-slate)]"
                  }`}
                >
                  {twoFactorEnabled ? "Enabled" : "Enable"}
                </button>
              </div>
            </div>

            {/* Sessions */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Active Sessions</h3>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-slate)]"
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-[var(--text-muted)]" />
                      <div>
                        <div className="text-sm text-[var(--text-primary)]">{session.device}</div>
                        <div className="text-xs text-[var(--text-muted)]">{session.location}</div>
                      </div>
                    </div>
                    {session.current ? (
                      <span className="text-xs text-[var(--success)]">Current session</span>
                    ) : (
                      <button
                        onClick={() => handleSignOutSession(session.id)}
                        className="text-xs text-[var(--error)] hover:text-[var(--error)]"
                      >
                        Sign out
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Data Privacy */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Data & Privacy</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[var(--text-primary)]">Profile Visibility</div>
                    <div className="text-xs text-[var(--text-muted)]">Control who can see your profile</div>
                  </div>
                  <select className="bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] text-sm outline-none">
                    <option>Everyone</option>
                    <option>My Team</option>
                    <option>Only Me</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[var(--text-primary)]">Activity Status</div>
                    <div className="text-xs text-[var(--text-muted)]">Show when you&apos;re online</div>
                  </div>
                  <button
                    onClick={() => setShowActivityStatus(!showActivityStatus)}
                    className={`w-10 h-6 rounded-full transition-colors ${showActivityStatus ? "bg-[var(--accent-ember)]" : "bg-[var(--bg-slate)]"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${showActivityStatus ? "translate-x-4" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-1">User Management</h2>
              <p className="text-sm text-[var(--text-muted)]">Manage users and their access levels</p>
            </div>

            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg pl-4 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-white/40 outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-[var(--text-primary)] text-sm transition-colors"
                >
                  Invite User
                </button>
              </div>

              <div className="divide-y divide-white/10">
                {[
                  { name: "Sarah Chen", email: "sarah@company.com", role: "Admin", dept: "Engineering" },
                  { name: "Michael Park", email: "michael@company.com", role: "Editor", dept: "Marketing" },
                  { name: "Emily Rodriguez", email: "emily@company.com", role: "Viewer", dept: "Sales" },
                ].map((u, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center text-[var(--text-primary)] font-medium text-sm">
                        {u.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-sm text-[var(--text-primary)]">{u.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[var(--text-muted)]">{u.dept}</span>
                      <select className="bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded px-3 py-1 text-sm text-[var(--text-primary)] outline-none">
                        <option>{u.role}</option>
                        <option>Admin</option>
                        <option>Editor</option>
                        <option>Viewer</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-1">Integrations</h2>
              <p className="text-sm text-[var(--text-muted)]">Connect external services and data sources</p>
            </div>

            {/* Connected Integrations */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Connected Services</h3>
              <div className="space-y-4">
                {[
                  { name: "Microsoft 365", icon: "M", status: "connected", lastSync: "2 hours ago", color: "bg-[var(--accent-ember)]" },
                  { name: "Google Workspace", icon: "G", status: "connected", lastSync: "1 hour ago", color: "bg-red-500" },
                  { name: "Slack", icon: "S", status: "connected", lastSync: "5 mins ago", color: "bg-purple-500" },
                ].map((integration, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-slate)]">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center text-[var(--text-primary)] font-bold`}>
                        {integration.icon}
                      </div>
                      <div>
                        <div className="text-sm text-[var(--text-primary)]">{integration.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">Last synced: {integration.lastSync}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-[var(--success)]/20 text-[var(--success)]">Connected</span>
                      <button className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">Configure</button>
                      <button className="text-xs text-[var(--error)] hover:text-[var(--error)]">Disconnect</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Integrations */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Available Integrations</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Salesforce", icon: "SF", description: "CRM & customer data", color: "bg-cyan-500" },
                  { name: "Jira", icon: "J", description: "Project management", color: "bg-blue-600" },
                  { name: "Confluence", icon: "C", description: "Documentation", color: "bg-blue-400" },
                  { name: "ServiceNow", icon: "SN", description: "IT service management", color: "bg-green-600" },
                  { name: "Zendesk", icon: "Z", description: "Customer support", color: "bg-emerald-500" },
                  { name: "Box", icon: "B", description: "File storage", color: "bg-[var(--accent-ember)]" },
                ].map((integration, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center text-[var(--text-primary)] font-bold text-sm`}>
                        {integration.icon}
                      </div>
                      <div>
                        <div className="text-sm text-[var(--text-primary)]">{integration.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{integration.description}</div>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg border border-[var(--accent-ember)]/30 text-[var(--accent-ember)] text-xs hover:bg-[var(--accent-ember)]/10 transition-colors">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* API Settings */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">API Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value="sk-diq-xxxx-xxxx-xxxx-xxxx"
                      disabled
                      className="flex-1 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-muted)] font-mono text-sm"
                    />
                    <button className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors">
                      Regenerate
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">Webhook URL</label>
                  <input
                    type="text"
                    placeholder="https://your-server.com/webhook"
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm outline-none focus:border-[var(--accent-ember)]/50"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "roles":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-1">Roles & Permissions</h2>
              <p className="text-sm text-[var(--text-muted)]">Define access levels and permissions for your organization</p>
            </div>

            {/* Roles List */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Organization Roles ({roles.length})</h3>
                <motion.button
                  onClick={() => {
                    resetRoleForm();
                    setShowCreateRoleModal(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-[var(--text-primary)] text-sm transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" />
                  Create Role
                </motion.button>
              </div>
              <div className="divide-y divide-white/10">
                {roles.map((role) => (
                  <motion.div
                    key={role.id}
                    className="flex items-center justify-between p-4 hover:bg-[var(--bg-slate)]/50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${role.color}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[var(--text-primary)]">{role.name}</span>
                          {role.system && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-slate)] text-[var(--text-muted)]">System</span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {role.users} users{role.description && ` • ${role.description}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {role.permissions.slice(0, 3).map((perm, pidx) => (
                          <span key={pidx} className="px-2 py-0.5 rounded-full text-xs bg-[var(--bg-slate)] text-[var(--text-secondary)]">
                            {perm}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="text-xs text-[var(--text-muted)]">+{role.permissions.length - 3}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleEditRole(role)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-ember)] hover:bg-[var(--accent-ember)]/10 transition-colors"
                        title="Edit role"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {!role.system && (
                        roleDeleteConfirm === role.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="px-2 py-1 rounded text-xs bg-[var(--error)] text-white hover:bg-[var(--error)]/80 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setRoleDeleteConfirm(null)}
                              className="px-2 py-1 rounded text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRoleDeleteConfirm(role.id)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                            title="Delete role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Permission Categories</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { category: "Content Management", permissions: ["Create articles", "Edit articles", "Delete articles", "Publish content"] },
                  { category: "User Management", permissions: ["View users", "Invite users", "Edit roles", "Remove users"] },
                  { category: "Analytics", permissions: ["View reports", "Export data", "Create dashboards"] },
                  { category: "System", permissions: ["Manage integrations", "Configure settings", "View audit logs"] },
                ].map((cat, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-[var(--border-subtle)]">
                    <div className="text-sm text-[var(--text-primary)] mb-3">{cat.category}</div>
                    <div className="space-y-2">
                      {cat.permissions.map((perm, pidx) => (
                        <div key={pidx} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                          <Shield className="w-3 h-3" />
                          {perm}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "audit":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-1">Audit Logs</h2>
              <p className="text-sm text-[var(--text-muted)]">Track all system activities and user actions</p>
            </div>

            {/* Filters */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search logs..."
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] placeholder-white/40 outline-none"
                  />
                </div>
                <select className="bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] outline-none">
                  <option value="">All Actions</option>
                  <option value="login">Login</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                </select>
                <select className="bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] outline-none">
                  <option value="">All Users</option>
                  <option value="sarah">Sarah Chen</option>
                  <option value="michael">Michael Park</option>
                </select>
                <select className="bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] outline-none">
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <button className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors">
                  Export
                </button>
              </div>
            </div>

            {/* Audit Log Entries */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
              <div className="divide-y divide-white/10">
                {[
                  { action: "Article Published", user: "Sarah Chen", target: "Q4 Strategy Guide", time: "2 minutes ago", type: "create", ip: "192.168.1.45" },
                  { action: "User Role Updated", user: "Admin System", target: "Michael Park -> Editor", time: "15 minutes ago", type: "update", ip: "10.0.0.1" },
                  { action: "Login Success", user: "Emily Rodriguez", target: "Web Dashboard", time: "1 hour ago", type: "login", ip: "172.16.0.89" },
                  { action: "Document Deleted", user: "Sarah Chen", target: "Draft: Old Policy v1", time: "2 hours ago", type: "delete", ip: "192.168.1.45" },
                  { action: "Integration Connected", user: "Admin System", target: "Slack Workspace", time: "3 hours ago", type: "create", ip: "10.0.0.1" },
                  { action: "Password Changed", user: "Michael Park", target: "Self", time: "5 hours ago", type: "update", ip: "192.168.1.102" },
                  { action: "API Key Generated", user: "Sarah Chen", target: "Production API Key", time: "1 day ago", type: "create", ip: "192.168.1.45" },
                  { action: "Bulk Import", user: "Admin System", target: "150 knowledge items", time: "2 days ago", type: "create", ip: "10.0.0.1" },
                ].map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-[var(--bg-slate)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        log.type === "create" ? "bg-[var(--success)]/20 text-[var(--success)]" :
                        log.type === "update" ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]" :
                        log.type === "delete" ? "bg-[var(--error)]/20 text-[var(--error)]" :
                        "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]"
                      }`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm text-[var(--text-primary)]">{log.action}</div>
                        <div className="text-xs text-[var(--text-muted)]">
                          <span className="text-[var(--accent-ember)]">{log.user}</span> &middot; {log.target}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[var(--text-muted)]">{log.time}</div>
                      <div className="text-xs text-[var(--text-primary)]/30 font-mono">{log.ip}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div className="text-xs text-[var(--text-muted)]">Showing 1-8 of 1,234 entries</div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-xs hover:text-[var(--text-primary)] transition-colors">
                    Previous
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-[var(--accent-ember)] text-[var(--text-primary)] text-xs">1</button>
                  <button className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-xs hover:text-[var(--text-primary)] transition-colors">2</button>
                  <button className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-xs hover:text-[var(--text-primary)] transition-colors">3</button>
                  <button className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-xs hover:text-[var(--text-primary)] transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "system":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-1">System Settings</h2>
              <p className="text-sm text-[var(--text-muted)]">Configure global system preferences and features</p>
            </div>

            {/* General Settings */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">General</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">Organization Name</label>
                  <input
                    type="text"
                    defaultValue="Digital Workplace AI"
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">Default Language</label>
                  <select className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50">
                    <option value="en">English (US)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">Default Timezone</label>
                  <select className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50">
                    <option>Pacific Time (PT)</option>
                    <option>Eastern Time (ET)</option>
                    <option>UTC</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Settings */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">AI Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">Default LLM Model</label>
                  <select className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50">
                    <option value="claude-3">Claude 3.5 Sonnet</option>
                    <option value="gpt-4">GPT-4 Turbo</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="custom">Custom Model</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[var(--text-primary)]">AI Response Citations</div>
                    <div className="text-xs text-[var(--text-muted)]">Include source references in AI responses</div>
                  </div>
                  <button className="w-10 h-6 rounded-full bg-[var(--accent-ember)]">
                    <div className="w-4 h-4 bg-white rounded-full mx-1 translate-x-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[var(--text-primary)]">Confidence Scores</div>
                    <div className="text-xs text-[var(--text-muted)]">Display confidence levels for AI answers</div>
                  </div>
                  <button className="w-10 h-6 rounded-full bg-[var(--accent-ember)]">
                    <div className="w-4 h-4 bg-white rounded-full mx-1 translate-x-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search Settings */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Search Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">Search Mode</label>
                  <select className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50">
                    <option value="hybrid">Hybrid (Keyword + Semantic)</option>
                    <option value="semantic">Semantic Only</option>
                    <option value="keyword">Keyword Only</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">Semantic Threshold</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="70"
                      className="flex-1"
                    />
                    <span className="text-sm text-[var(--text-secondary)] w-12 text-right">0.70</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[var(--text-primary)]">Auto-generate Embeddings</div>
                    <div className="text-xs text-[var(--text-muted)]">Automatically create embeddings for new content</div>
                  </div>
                  <button className="w-10 h-6 rounded-full bg-[var(--accent-ember)]">
                    <div className="w-4 h-4 bg-white rounded-full mx-1 translate-x-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[var(--text-primary)]">Enforce 2FA</div>
                    <div className="text-xs text-[var(--text-muted)]">Require two-factor authentication for all users</div>
                  </div>
                  <button className="w-10 h-6 rounded-full bg-[var(--bg-slate)]">
                    <div className="w-4 h-4 bg-white rounded-full mx-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[var(--text-primary)]">SSO Only</div>
                    <div className="text-xs text-[var(--text-muted)]">Disable password login, require SSO</div>
                  </div>
                  <button className="w-10 h-6 rounded-full bg-[var(--bg-slate)]">
                    <div className="w-4 h-4 bg-white rounded-full mx-1" />
                  </button>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    defaultValue="60"
                    className="w-32 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50"
                  />
                </div>
              </div>
            </div>

            <button className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-[var(--text-primary)] text-sm transition-colors">
              Save System Settings
            </button>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-[var(--text-muted)]">Settings section coming soon</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />

      <main className="ml-16 p-8">
        <FadeIn className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-medium text-[var(--text-primary)] mb-2">Settings</h1>
            <p className="text-[var(--text-muted)]">
              Manage your account settings and preferences
            </p>
          </motion.div>

          <div className="flex gap-8">
            {/* Settings Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-64 flex-shrink-0"
            >
              <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-2">
                <div className="mb-2 px-3 py-2 text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  User Settings
                </div>
                {settingsSections.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section.id
                        ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-slate)] hover:text-[var(--text-primary)]"
                    }`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.name}
                  </motion.button>
                ))}

                {isAdmin && (
                  <>
                    <div className="mt-4 mb-2 px-3 py-2 text-xs text-[var(--text-muted)] uppercase tracking-wider border-t border-[var(--border-subtle)] pt-4">
                      Admin Settings
                    </div>
                    {adminSections.map((section) => (
                      <motion.button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === section.id
                            ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-slate)] hover:text-[var(--text-primary)]"
                        }`}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <section.icon className="w-4 h-4" />
                        {section.name}
                      </motion.button>
                    ))}
                  </>
                )}
              </div>
            </motion.div>

            {/* Settings Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              {renderContent()}
            </motion.div>
          </div>
        </FadeIn>
      </main>

      {/* Invite User Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => {
              setShowInviteModal(false);
              setInviteEmail("");
              setInviteRole("Viewer");
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--bg-charcoal)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Invite User</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 focus:shadow-lg focus:shadow-[var(--accent-ember)]/5 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Editor">Editor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail("");
                    setInviteRole("Viewer");
                  }}
                  className="px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleInviteUser}
                  disabled={!inviteEmail.trim()}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-primary)] text-sm transition-colors shadow-lg shadow-[var(--accent-ember)]/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Invite
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Role Modal */}
      <AnimatePresence>
        {showCreateRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => {
              setShowCreateRoleModal(false);
              resetRoleForm();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--bg-charcoal)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-[var(--text-primary)]">Create New Role</h3>
                <button
                  onClick={() => {
                    setShowCreateRoleModal(false);
                    resetRoleForm();
                  }}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Role Name */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Role Name <span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g., Content Manager"
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                  />
                </div>

                {/* Role Description */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder="Brief description of this role"
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                  />
                </div>

                {/* Role Color */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {roleColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setNewRoleColor(color.class)}
                        className={`w-8 h-8 rounded-lg ${color.class} transition-all ${
                          newRoleColor === color.class
                            ? "ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-charcoal)]"
                            : "hover:scale-110"
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Permissions
                  </label>
                  <div className="bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg p-3 max-h-48 overflow-y-auto space-y-3">
                    {["User Management", "Content Management", "Analytics", "System"].map((category) => (
                      <div key={category}>
                        <div className="text-xs text-[var(--text-muted)] font-medium mb-2">{category}</div>
                        <div className="grid grid-cols-2 gap-2">
                          {availablePermissions
                            .filter((p) => p.category === category)
                            .map((perm) => (
                              <label
                                key={perm.id}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                  newRolePermissions.includes(perm.id)
                                    ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                                    : "hover:bg-[var(--bg-charcoal)] text-[var(--text-secondary)]"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={newRolePermissions.includes(perm.id)}
                                  onChange={() => togglePermission(perm.id)}
                                  className="sr-only"
                                />
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    newRolePermissions.includes(perm.id)
                                      ? "border-[var(--accent-ember)] bg-[var(--accent-ember)]"
                                      : "border-[var(--border-default)]"
                                  }`}
                                >
                                  {newRolePermissions.includes(perm.id) && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span className="text-xs">{perm.label}</span>
                              </label>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-subtle)]">
                <motion.button
                  onClick={() => {
                    setShowCreateRoleModal(false);
                    resetRoleForm();
                  }}
                  className="px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleCreateRole}
                  disabled={!newRoleName.trim()}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-primary)] text-sm transition-colors shadow-lg shadow-[var(--accent-ember)]/20 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" />
                  Create Role
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {showEditRoleModal && selectedRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => {
              setShowEditRoleModal(false);
              resetRoleForm();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--bg-charcoal)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-[var(--text-primary)]">
                  Edit Role: {selectedRole.name}
                  {selectedRole.system && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-slate)] text-[var(--text-muted)]">System</span>
                  )}
                </h3>
                <button
                  onClick={() => {
                    setShowEditRoleModal(false);
                    resetRoleForm();
                  }}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Role Name */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Role Name <span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g., Content Manager"
                    disabled={selectedRole.system}
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors disabled:opacity-50"
                  />
                  {selectedRole.system && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">System role names cannot be changed</p>
                  )}
                </div>

                {/* Role Description */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder="Brief description of this role"
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                  />
                </div>

                {/* Role Color */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {roleColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setNewRoleColor(color.class)}
                        className={`w-8 h-8 rounded-lg ${color.class} transition-all ${
                          newRoleColor === color.class
                            ? "ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-charcoal)]"
                            : "hover:scale-110"
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Permissions
                  </label>
                  <div className="bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg p-3 max-h-48 overflow-y-auto space-y-3">
                    {["User Management", "Content Management", "Analytics", "System"].map((category) => (
                      <div key={category}>
                        <div className="text-xs text-[var(--text-muted)] font-medium mb-2">{category}</div>
                        <div className="grid grid-cols-2 gap-2">
                          {availablePermissions
                            .filter((p) => p.category === category)
                            .map((perm) => (
                              <label
                                key={perm.id}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                  newRolePermissions.includes(perm.id)
                                    ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                                    : "hover:bg-[var(--bg-charcoal)] text-[var(--text-secondary)]"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={newRolePermissions.includes(perm.id)}
                                  onChange={() => togglePermission(perm.id)}
                                  className="sr-only"
                                />
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    newRolePermissions.includes(perm.id)
                                      ? "border-[var(--accent-ember)] bg-[var(--accent-ember)]"
                                      : "border-[var(--border-default)]"
                                  }`}
                                >
                                  {newRolePermissions.includes(perm.id) && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span className="text-xs">{perm.label}</span>
                              </label>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role Stats */}
                <div className="bg-[var(--bg-slate)] rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Users with this role:</span>
                    <span className="text-[var(--text-primary)] font-medium">{selectedRole.users}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-subtle)]">
                <motion.button
                  onClick={() => {
                    setShowEditRoleModal(false);
                    resetRoleForm();
                  }}
                  className="px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleUpdateRole}
                  disabled={!newRoleName.trim()}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-primary)] text-sm transition-colors shadow-lg shadow-[var(--accent-ember)]/20 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Loading fallback for Suspense
function SettingsPageLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />
      <main className="ml-16 p-8">
        <div className="max-w-5xl mx-auto flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-ember)]" />
            <p className="text-[var(--text-muted)]">Loading settings...</p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Export with Suspense wrapper for useSearchParams
export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageLoading />}>
      <SettingsPageInner />
    </Suspense>
  );
}
