"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
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

export default function SettingsPage() {
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

  // Load settings from database (only when settings data changes)
  const settingsId = settings?.id ?? null;
  if (settings && settingsId !== prevSettingsIdRef.current && !settingsInitializedRef.current) {
    prevSettingsIdRef.current = settingsId;
    settingsInitializedRef.current = true;

    const appearance = settings.appearance as { theme?: string; language?: string } | null;
    const notifPrefs = settings.notification_prefs as unknown as Record<string, { email?: boolean; push?: boolean; inApp?: boolean }> | null;

    if (appearance?.theme) {
      setTheme(appearance.theme as "dark" | "light" | "system");
    }
    if (appearance?.language) {
      setLanguage(appearance.language);
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
      appearance: { theme, language, sidebar_collapsed: false, density: "comfortable" },
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [notifications, theme, language, updateSettings]);

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-white mb-1">Profile Settings</h2>
              <p className="text-sm text-white/50">Manage your personal information and preferences</p>
            </div>

            {/* Profile Photo */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Profile Photo</h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-medium overflow-hidden">
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
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors"
                  >
                    Change Photo
                  </button>
                  <button
                    onClick={handleRemovePhoto}
                    className="px-4 py-2 rounded-lg text-white/50 hover:text-white text-sm ml-2 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    defaultValue={clerkUser?.firstName || dbUser?.full_name?.split(" ")[0] || ""}
                    className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    defaultValue={clerkUser?.lastName || dbUser?.full_name?.split(" ")[1] || ""}
                    className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={clerkUser?.primaryEmailAddress?.emailAddress || dbUser?.email || ""}
                    disabled
                    className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                    Department
                  </label>
                  <select className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50 transition-colors">
                    <option value="">Select department...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineer"
                    className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="mt-6 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm transition-colors flex items-center gap-2"
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
              <h2 className="text-lg font-medium text-white mb-1">Notification Settings</h2>
              <p className="text-sm text-white/50">Control how and when you receive notifications</p>
            </div>

            {settingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : (
              <>
                <div className="bg-[#0f0f14] border border-white/10 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-white/10 bg-white/5">
                    <div className="text-sm font-medium text-white">Notification Type</div>
                    <div className="text-sm font-medium text-white text-center flex items-center justify-center gap-1">
                      <Mail className="w-4 h-4" /> Email
                    </div>
                    <div className="text-sm font-medium text-white text-center flex items-center justify-center gap-1">
                      <Bell className="w-4 h-4" /> Push
                    </div>
                    <div className="text-sm font-medium text-white text-center flex items-center justify-center gap-1">
                      <MessageSquare className="w-4 h-4" /> In-App
                    </div>
                  </div>

                  {notifications.map((setting) => (
                    <div
                      key={setting.id}
                      className="grid grid-cols-4 gap-4 p-4 border-b border-white/10 last:border-b-0"
                    >
                      <div>
                        <div className="text-sm text-white">{setting.label}</div>
                        <div className="text-xs text-white/40">{setting.description}</div>
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleNotification(setting.id, "email")}
                          className={`w-10 h-6 rounded-full transition-colors ${
                            setting.email ? "bg-blue-500" : "bg-white/20"
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
                            setting.push ? "bg-blue-500" : "bg-white/20"
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
                            setting.inApp ? "bg-blue-500" : "bg-white/20"
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
                <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-white mb-4">Quiet Hours</h3>
                  <p className="text-sm text-white/50 mb-4">
                    Pause notifications during specific hours
                  </p>
                  <div className="flex items-center gap-4">
                    <select className="bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none">
                      <option>10:00 PM</option>
                      <option>11:00 PM</option>
                      <option>12:00 AM</option>
                    </select>
                    <span className="text-white/50">to</span>
                    <select className="bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none">
                      <option>6:00 AM</option>
                      <option>7:00 AM</option>
                      <option>8:00 AM</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm transition-colors flex items-center gap-2"
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
              <h2 className="text-lg font-medium text-white mb-1">Appearance</h2>
              <p className="text-sm text-white/50">Customize how Intranet IQ looks on your device</p>
            </div>

            {/* Theme */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Theme</h3>
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
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <t.icon className={`w-6 h-6 mx-auto mb-2 ${theme === t.id ? "text-blue-400" : "text-white/50"}`} />
                    <div className={`text-sm ${theme === t.id ? "text-white" : "text-white/70"}`}>
                      {t.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Language & Region</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                    Timezone
                  </label>
                  <select className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50">
                    <option>Pacific Time (PT)</option>
                    <option>Mountain Time (MT)</option>
                    <option>Central Time (CT)</option>
                    <option>Eastern Time (ET)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm transition-colors flex items-center gap-2"
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
              <h2 className="text-lg font-medium text-white mb-1">Privacy & Security</h2>
              <p className="text-sm text-white/50">Manage your account security and privacy preferences</p>
            </div>

            {/* Two-Factor Auth */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${twoFactorEnabled ? "bg-green-500/20" : "bg-white/10"}`}>
                    <Shield className={`w-5 h-5 ${twoFactorEnabled ? "text-green-400" : "text-white/40"}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Two-Factor Authentication</h3>
                    <p className="text-xs text-white/50">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    twoFactorEnabled
                      ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                      : "border-white/10 text-white/60 hover:bg-white/5"
                  }`}
                >
                  {twoFactorEnabled ? "Enabled" : "Enable"}
                </button>
              </div>
            </div>

            {/* Sessions */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Active Sessions</h3>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-white/40" />
                      <div>
                        <div className="text-sm text-white">{session.device}</div>
                        <div className="text-xs text-white/40">{session.location}</div>
                      </div>
                    </div>
                    {session.current ? (
                      <span className="text-xs text-green-400">Current session</span>
                    ) : (
                      <button
                        onClick={() => handleSignOutSession(session.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Sign out
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Data Privacy */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Data & Privacy</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">Profile Visibility</div>
                    <div className="text-xs text-white/40">Control who can see your profile</div>
                  </div>
                  <select className="bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none">
                    <option>Everyone</option>
                    <option>My Team</option>
                    <option>Only Me</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">Activity Status</div>
                    <div className="text-xs text-white/40">Show when you&apos;re online</div>
                  </div>
                  <button
                    onClick={() => setShowActivityStatus(!showActivityStatus)}
                    className={`w-10 h-6 rounded-full transition-colors ${showActivityStatus ? "bg-blue-500" : "bg-white/20"}`}
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
              <h2 className="text-lg font-medium text-white mb-1">User Management</h2>
              <p className="text-sm text-white/50">Manage users and their access levels</p>
            </div>

            <div className="bg-[#0f0f14] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg pl-4 pr-4 py-2 text-sm text-white placeholder-white/40 outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors"
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                        {u.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-sm text-white">{u.name}</div>
                        <div className="text-xs text-white/40">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-white/50">{u.dept}</span>
                      <select className="bg-[#1a1a1f] border border-white/10 rounded px-3 py-1 text-sm text-white outline-none">
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
              <h2 className="text-lg font-medium text-white mb-1">Integrations</h2>
              <p className="text-sm text-white/50">Connect external services and data sources</p>
            </div>

            {/* Connected Integrations */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Connected Services</h3>
              <div className="space-y-4">
                {[
                  { name: "Microsoft 365", icon: "M", status: "connected", lastSync: "2 hours ago", color: "bg-blue-500" },
                  { name: "Google Workspace", icon: "G", status: "connected", lastSync: "1 hour ago", color: "bg-red-500" },
                  { name: "Slack", icon: "S", status: "connected", lastSync: "5 mins ago", color: "bg-purple-500" },
                ].map((integration, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center text-white font-bold`}>
                        {integration.icon}
                      </div>
                      <div>
                        <div className="text-sm text-white">{integration.name}</div>
                        <div className="text-xs text-white/40">Last synced: {integration.lastSync}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">Connected</span>
                      <button className="text-xs text-white/50 hover:text-white">Configure</button>
                      <button className="text-xs text-red-400 hover:text-red-300">Disconnect</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Integrations */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Available Integrations</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Salesforce", icon: "SF", description: "CRM & customer data", color: "bg-cyan-500" },
                  { name: "Jira", icon: "J", description: "Project management", color: "bg-blue-600" },
                  { name: "Confluence", icon: "C", description: "Documentation", color: "bg-blue-400" },
                  { name: "ServiceNow", icon: "SN", description: "IT service management", color: "bg-green-600" },
                  { name: "Zendesk", icon: "Z", description: "Customer support", color: "bg-emerald-500" },
                  { name: "Box", icon: "B", description: "File storage", color: "bg-blue-500" },
                ].map((integration, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center text-white font-bold text-sm`}>
                        {integration.icon}
                      </div>
                      <div>
                        <div className="text-sm text-white">{integration.name}</div>
                        <div className="text-xs text-white/40">{integration.description}</div>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-400 text-xs hover:bg-blue-500/10 transition-colors">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* API Settings */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">API Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value="sk-diq-xxxx-xxxx-xxxx-xxxx"
                      disabled
                      className="flex-1 bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white/50 font-mono text-sm"
                    />
                    <button className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white text-sm transition-colors">
                      Regenerate
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Webhook URL</label>
                  <input
                    type="text"
                    placeholder="https://your-server.com/webhook"
                    className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 text-sm outline-none focus:border-blue-500/50"
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
              <h2 className="text-lg font-medium text-white mb-1">Roles & Permissions</h2>
              <p className="text-sm text-white/50">Define access levels and permissions for your organization</p>
            </div>

            {/* Roles List */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Organization Roles</h3>
                <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors">
                  Create Role
                </button>
              </div>
              <div className="divide-y divide-white/10">
                {[
                  { name: "Super Admin", users: 2, permissions: ["all"], color: "bg-red-500", system: true },
                  { name: "Admin", users: 5, permissions: ["manage_users", "manage_content", "view_analytics"], color: "bg-orange-500", system: true },
                  { name: "Editor", users: 12, permissions: ["create_content", "edit_content", "publish"], color: "bg-blue-500", system: true },
                  { name: "Contributor", users: 25, permissions: ["create_content", "edit_own"], color: "bg-green-500", system: false },
                  { name: "Viewer", users: 150, permissions: ["view_content"], color: "bg-gray-500", system: true },
                ].map((role, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${role.color}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">{role.name}</span>
                          {role.system && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/50">System</span>
                          )}
                        </div>
                        <div className="text-xs text-white/40">{role.users} users</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {role.permissions.slice(0, 3).map((perm, pidx) => (
                          <span key={pidx} className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/60">
                            {perm}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="text-xs text-white/40">+{role.permissions.length - 3}</span>
                        )}
                      </div>
                      <button className="text-xs text-white/50 hover:text-white">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Permission Categories</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { category: "Content Management", permissions: ["Create articles", "Edit articles", "Delete articles", "Publish content"] },
                  { category: "User Management", permissions: ["View users", "Invite users", "Edit roles", "Remove users"] },
                  { category: "Analytics", permissions: ["View reports", "Export data", "Create dashboards"] },
                  { category: "System", permissions: ["Manage integrations", "Configure settings", "View audit logs"] },
                ].map((cat, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-white/10">
                    <div className="text-sm text-white mb-3">{cat.category}</div>
                    <div className="space-y-2">
                      {cat.permissions.map((perm, pidx) => (
                        <div key={pidx} className="flex items-center gap-2 text-xs text-white/60">
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
              <h2 className="text-lg font-medium text-white mb-1">Audit Logs</h2>
              <p className="text-sm text-white/50">Track all system activities and user actions</p>
            </div>

            {/* Filters */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search logs..."
                    className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/40 outline-none"
                  />
                </div>
                <select className="bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none">
                  <option value="">All Actions</option>
                  <option value="login">Login</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                </select>
                <select className="bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none">
                  <option value="">All Users</option>
                  <option value="sarah">Sarah Chen</option>
                  <option value="michael">Michael Park</option>
                </select>
                <select className="bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none">
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <button className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white text-sm transition-colors">
                  Export
                </button>
              </div>
            </div>

            {/* Audit Log Entries */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl overflow-hidden">
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
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        log.type === "create" ? "bg-green-500/20 text-green-400" :
                        log.type === "update" ? "bg-blue-500/20 text-blue-400" :
                        log.type === "delete" ? "bg-red-500/20 text-red-400" :
                        "bg-purple-500/20 text-purple-400"
                      }`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm text-white">{log.action}</div>
                        <div className="text-xs text-white/40">
                          <span className="text-blue-400">{log.user}</span> &middot; {log.target}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/50">{log.time}</div>
                      <div className="text-xs text-white/30 font-mono">{log.ip}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-white/50">Showing 1-8 of 1,234 entries</div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs hover:text-white transition-colors">
                    Previous
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs">1</button>
                  <button className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs hover:text-white transition-colors">2</button>
                  <button className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs hover:text-white transition-colors">3</button>
                  <button className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs hover:text-white transition-colors">
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
              <h2 className="text-lg font-medium text-white mb-1">System Settings</h2>
              <p className="text-sm text-white/50">Configure global system preferences and features</p>
            </div>

            {/* General Settings */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">General</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Organization Name</label>
                  <input
                    type="text"
                    defaultValue="Digital Workplace AI"
                    className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Default Language</label>
                  <select className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50">
                    <option value="en">English (US)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Default Timezone</label>
                  <select className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50">
                    <option>Pacific Time (PT)</option>
                    <option>Eastern Time (ET)</option>
                    <option>UTC</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Settings */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">AI Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Default LLM Model</label>
                  <select className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50">
                    <option value="claude-3">Claude 3.5 Sonnet</option>
                    <option value="gpt-4">GPT-4 Turbo</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="custom">Custom Model</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">AI Response Citations</div>
                    <div className="text-xs text-white/40">Include source references in AI responses</div>
                  </div>
                  <button className="w-10 h-6 rounded-full bg-blue-500">
                    <div className="w-4 h-4 bg-white rounded-full mx-1 translate-x-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">Confidence Scores</div>
                    <div className="text-xs text-white/40">Display confidence levels for AI answers</div>
                  </div>
                  <button className="w-10 h-6 rounded-full bg-blue-500">
                    <div className="w-4 h-4 bg-white rounded-full mx-1 translate-x-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search Settings */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Search Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Search Mode</label>
                  <select className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50">
                    <option value="hybrid">Hybrid (Keyword + Semantic)</option>
                    <option value="semantic">Semantic Only</option>
                    <option value="keyword">Keyword Only</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Semantic Threshold</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="70"
                      className="flex-1"
                    />
                    <span className="text-sm text-white/70 w-12 text-right">0.70</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">Auto-generate Embeddings</div>
                    <div className="text-xs text-white/40">Automatically create embeddings for new content</div>
                  </div>
                  <button className="w-10 h-6 rounded-full bg-blue-500">
                    <div className="w-4 h-4 bg-white rounded-full mx-1 translate-x-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">Enforce 2FA</div>
                    <div className="text-xs text-white/40">Require two-factor authentication for all users</div>
                  </div>
                  <button className="w-10 h-6 rounded-full bg-white/20">
                    <div className="w-4 h-4 bg-white rounded-full mx-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">SSO Only</div>
                    <div className="text-xs text-white/40">Disable password login, require SSO</div>
                  </div>
                  <button className="w-10 h-6 rounded-full bg-white/20">
                    <div className="w-4 h-4 bg-white rounded-full mx-1" />
                  </button>
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    defaultValue="60"
                    className="w-32 bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>

            <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors">
              Save System Settings
            </button>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-white/50">Settings section coming soon</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />

      <main className="ml-16 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-white mb-2">Settings</h1>
            <p className="text-white/50">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="flex gap-8">
            {/* Settings Navigation */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-2">
                <div className="mb-2 px-3 py-2 text-xs text-white/40 uppercase tracking-wider">
                  User Settings
                </div>
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section.id
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.name}
                  </button>
                ))}

                {isAdmin && (
                  <>
                    <div className="mt-4 mb-2 px-3 py-2 text-xs text-white/40 uppercase tracking-wider border-t border-white/10 pt-4">
                      Admin Settings
                    </div>
                    {adminSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === section.id
                            ? "bg-blue-500/20 text-blue-400"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <section.icon className="w-4 h-4" />
                        {section.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1">{renderContent()}</div>
          </div>
        </div>
      </main>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Invite User</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50 transition-colors"
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Editor">Editor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                  setInviteRole("Viewer");
                }}
                className="px-4 py-2 rounded-lg text-white/60 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteUser}
                disabled={!inviteEmail.trim()}
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm transition-colors"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
