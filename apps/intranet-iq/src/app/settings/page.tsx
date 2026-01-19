"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Settings,
  User,
  Bell,
  Lock,
  Palette,
  Monitor,
  Globe,
  Shield,
  Key,
  Users,
  Database,
  Activity,
  ChevronRight,
  Check,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
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

const notificationSettings: NotificationSetting[] = [
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
  const { user } = useUser();
  const [activeSection, setActiveSection] = useState("profile");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState(notificationSettings);
  const [isAdmin] = useState(true); // In production, check actual role

  const toggleNotification = (
    id: string,
    type: "email" | "push" | "inApp"
  ) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, [type]: !n[type] } : n
      )
    );
  };

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
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors">
                    Change Photo
                  </button>
                  <button className="px-4 py-2 rounded-lg text-white/50 hover:text-white text-sm ml-2 transition-colors">
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
                    defaultValue={user?.firstName || ""}
                    className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.lastName || ""}
                    className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
                    disabled
                    className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                    Department
                  </label>
                  <select className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500/50 transition-colors">
                    <option>Engineering</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                    <option>HR</option>
                    <option>Finance</option>
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
              <button className="mt-6 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors">
                Save Changes
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
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Two-Factor Authentication</h3>
                    <p className="text-xs text-white/50">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-lg border border-green-500/30 text-green-400 text-sm hover:bg-green-500/10 transition-colors">
                  Enabled
                </button>
              </div>
            </div>

            {/* Sessions */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Active Sessions</h3>
              <div className="space-y-3">
                {[
                  { device: "MacBook Pro", location: "San Francisco, CA", current: true },
                  { device: "iPhone 15", location: "San Francisco, CA", current: false },
                ].map((session, idx) => (
                  <div
                    key={idx}
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
                      <button className="text-xs text-red-400 hover:text-red-300">
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
                  <button className="w-10 h-6 rounded-full bg-blue-500 transition-colors">
                    <div className="w-4 h-4 bg-white rounded-full transition-transform translate-x-4 mx-1" />
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
                <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors">
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
    </div>
  );
}
