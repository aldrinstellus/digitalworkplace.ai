"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Shield,
  Users,
  Plus,
  Search,
  Settings,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Lock,
  Eye,
  FileText,
  Bot,
  MessageSquare,
  UserPlus,
  Clock,
  AlertTriangle,
  X,
  CalendarDays,
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  lastActive: string;
  avatar?: string;
  temporaryAccess?: {
    expiresAt: string;
    grantedBy: string;
    grantedAt: string;
  };
}

const permissionCategories = [
  {
    name: "Content",
    icon: FileText,
    permissions: [
      { id: "content:read", name: "View content", description: "View articles and documents" },
      { id: "content:create", name: "Create content", description: "Create new articles and documents" },
      { id: "content:edit", name: "Edit content", description: "Edit existing content" },
      { id: "content:delete", name: "Delete content", description: "Delete content permanently" },
      { id: "content:publish", name: "Publish content", description: "Publish content to users" },
    ],
  },
  {
    name: "Search",
    icon: Search,
    permissions: [
      { id: "search:basic", name: "Basic search", description: "Use basic search functionality" },
      { id: "search:advanced", name: "Advanced search", description: "Access advanced filters" },
      { id: "search:export", name: "Export results", description: "Export search results" },
    ],
  },
  {
    name: "AI Chat",
    icon: MessageSquare,
    permissions: [
      { id: "chat:use", name: "Use AI chat", description: "Access AI assistant" },
      { id: "chat:history", name: "View history", description: "View chat history" },
      { id: "chat:spaces", name: "Create spaces", description: "Create chat spaces" },
    ],
  },
  {
    name: "Workflows",
    icon: Bot,
    permissions: [
      { id: "workflow:view", name: "View workflows", description: "View workflow list" },
      { id: "workflow:create", name: "Create workflows", description: "Create new workflows" },
      { id: "workflow:edit", name: "Edit workflows", description: "Modify workflows" },
      { id: "workflow:run", name: "Run workflows", description: "Execute workflows" },
      { id: "workflow:delete", name: "Delete workflows", description: "Delete workflows" },
    ],
  },
  {
    name: "Administration",
    icon: Settings,
    permissions: [
      { id: "admin:users", name: "Manage users", description: "Add, edit, remove users" },
      { id: "admin:roles", name: "Manage roles", description: "Create and edit roles" },
      { id: "admin:settings", name: "System settings", description: "Modify system settings" },
      { id: "admin:analytics", name: "View analytics", description: "Access analytics dashboard" },
      { id: "admin:audit", name: "Audit logs", description: "View audit logs" },
    ],
  },
];

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Super Admin",
    description: "Full system access",
    userCount: 3,
    permissions: permissionCategories.flatMap(c => c.permissions.map(p => p.id)),
    isSystem: true,
  },
  {
    id: "2",
    name: "Admin",
    description: "Administrative access without system settings",
    userCount: 8,
    permissions: ["content:read", "content:create", "content:edit", "content:publish", "search:basic", "search:advanced", "chat:use", "chat:history", "workflow:view", "workflow:create", "admin:users", "admin:analytics"],
    isSystem: true,
  },
  {
    id: "3",
    name: "Editor",
    description: "Can create and edit content",
    userCount: 24,
    permissions: ["content:read", "content:create", "content:edit", "search:basic", "search:advanced", "chat:use", "chat:history", "workflow:view"],
    isSystem: false,
  },
  {
    id: "4",
    name: "Viewer",
    description: "Read-only access",
    userCount: 156,
    permissions: ["content:read", "search:basic", "chat:use"],
    isSystem: false,
  },
];

// Helper to get days until expiration
const getDaysUntilExpiration = (expiresAt: string): number => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper to format date for input
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const mockUsers: User[] = [
  { id: "1", name: "Sarah Chen", email: "sarah.chen@company.com", role: "Super Admin", department: "Engineering", lastActive: "2 min ago" },
  { id: "2", name: "Alex Thompson", email: "alex.t@company.com", role: "Admin", department: "HR", lastActive: "15 min ago" },
  { id: "3", name: "Maria Garcia", email: "m.garcia@company.com", role: "Editor", department: "Marketing", lastActive: "1 hour ago", temporaryAccess: { expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), grantedBy: "Sarah Chen", grantedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() } },
  { id: "4", name: "James Wilson", email: "j.wilson@company.com", role: "Viewer", department: "Sales", lastActive: "3 hours ago", temporaryAccess: { expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), grantedBy: "Alex Thompson", grantedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() } },
  { id: "5", name: "Emily Brown", email: "e.brown@company.com", role: "Editor", department: "Product", lastActive: "1 day ago" },
];

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");
  const [selectedRole, setSelectedRole] = useState<Role | null>(mockRoles[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(permissionCategories.map(c => c.name));
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showTempAccessModal, setShowTempAccessModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [selectedUserForTempAccess, setSelectedUserForTempAccess] = useState<User | null>(null);
  const [tempAccessDate, setTempAccessDate] = useState("");
  const [grantTempAccess, setGrantTempAccess] = useState(false);

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev =>
      prev.includes(name)
        ? prev.filter(c => c !== name)
        : [...prev, name]
    );
  };

  const hasPermission = (permissionId: string) => {
    return selectedRole?.permissions.includes(permissionId) || false;
  };

  const filteredUsers = mockUsers.filter(
    user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openTempAccessModal = (user: User) => {
    setSelectedUserForTempAccess(user);
    setGrantTempAccess(!!user.temporaryAccess);
    // Calculate default date (7 days from now) inside the event handler
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setTempAccessDate(
      user.temporaryAccess
        ? formatDateForInput(new Date(user.temporaryAccess.expiresAt))
        : formatDateForInput(defaultDate)
    );
    setShowTempAccessModal(true);
  };

  const handleSaveTempAccess = () => {
    // In production, this would save to the backend
    console.log("Saving temp access for", selectedUserForTempAccess?.name, {
      grantTempAccess,
      expiresAt: tempAccessDate,
    });
    setShowTempAccessModal(false);
    setSelectedUserForTempAccess(null);
  };

  const getExpirationBadge = (user: User) => {
    if (!user.temporaryAccess) return null;
    const daysLeft = getDaysUntilExpiration(user.temporaryAccess.expiresAt);
    const isExpiringSoon = daysLeft <= 7;
    const isExpired = daysLeft <= 0;

    if (isExpired) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30">
          <AlertTriangle className="w-3 h-3" />
          Expired
        </span>
      );
    }

    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
        isExpiringSoon
          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
      }`}>
        <Clock className="w-3 h-3" />
        Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />

      <main className="ml-16 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[var(--text-primary)] flex items-center gap-3">
                <Shield className="w-7 h-7 text-[var(--accent-ember)]" />
                Permissions & Access Control
              </h1>
              <p className="text-[var(--text-muted)] mt-1">Manage roles, permissions, and user access</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("roles")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === "roles"
                  ? "bg-[var(--accent-ember)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
              }`}
            >
              <Shield className="w-4 h-4" />
              Roles
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === "users"
                  ? "bg-[var(--accent-ember)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
              }`}
            >
              <Users className="w-4 h-4" />
              Users
            </button>
          </div>

          {activeTab === "roles" && (
            <div className="flex gap-6">
              {/* Roles List */}
              <div className="w-80 flex-shrink-0">
                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">Roles</h3>
                    <button
                      onClick={() => setShowCreateRole(true)}
                      className="p-1.5 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-[var(--text-primary)] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {mockRoles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedRole?.id === role.id
                            ? "bg-[var(--accent-ember)]/20 border border-[var(--accent-ember)]/30"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[var(--text-primary)] font-medium text-sm">{role.name}</span>
                          {role.isSystem && (
                            <Lock className="w-3 h-3 text-[var(--text-muted)]" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mb-2">{role.description}</p>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <Users className="w-3 h-3" />
                          {role.userCount} users
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Permissions Editor */}
              <div className="flex-1">
                {selectedRole && (
                  <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="p-6 border-b border-[var(--border-subtle)]">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-medium text-[var(--text-primary)] flex items-center gap-2">
                            {selectedRole.name}
                            {selectedRole.isSystem && (
                              <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-[var(--text-muted)]">System</span>
                            )}
                          </h2>
                          <p className="text-sm text-[var(--text-muted)] mt-1">{selectedRole.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!selectedRole.isSystem && (
                            <>
                              <button className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] hover:bg-white/5 text-[var(--text-primary)] flex items-center gap-2 transition-colors">
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button className="px-4 py-2 rounded-lg border border-[var(--error)]/30 hover:bg-[var(--error)]/10 text-[var(--error)] flex items-center gap-2 transition-colors">
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                        Permissions
                      </h3>
                      <div className="space-y-4">
                        {permissionCategories.map((category) => {
                          const CategoryIcon = category.icon;
                          const isExpanded = expandedCategories.includes(category.name);
                          const enabledCount = category.permissions.filter(p => hasPermission(p.id)).length;

                          return (
                            <div key={category.name} className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                              <button
                                onClick={() => toggleCategory(category.name)}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <CategoryIcon className="w-5 h-5 text-[var(--text-secondary)]" />
                                  <span className="text-[var(--text-primary)] font-medium">{category.name}</span>
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-[var(--text-muted)]">
                                    {enabledCount}/{category.permissions.length}
                                  </span>
                                </div>
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                                )}
                              </button>

                              {isExpanded && (
                                <div className="border-t border-[var(--border-subtle)] p-4 space-y-3">
                                  {category.permissions.map((permission) => (
                                    <div
                                      key={permission.id}
                                      className="flex items-center justify-between"
                                    >
                                      <div>
                                        <div className="text-sm text-[var(--text-primary)]">{permission.name}</div>
                                        <div className="text-xs text-[var(--text-muted)]">{permission.description}</div>
                                      </div>
                                      <button
                                        disabled={selectedRole.isSystem}
                                        className={`w-10 h-6 rounded-full transition-colors ${
                                          hasPermission(permission.id)
                                            ? "bg-[var(--accent-ember)]"
                                            : "bg-white/20"
                                        } ${selectedRole.isSystem ? "opacity-50 cursor-not-allowed" : ""}`}
                                      >
                                        <div
                                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                            hasPermission(permission.id) ? "translate-x-5" : "translate-x-1"
                                          }`}
                                        />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl">
              <div className="p-6 border-b border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users..."
                      className="w-full bg-white/5 border border-[var(--border-subtle)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                    />
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-[var(--text-primary)] flex items-center gap-2 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                      <th className="px-6 py-3 font-medium">User</th>
                      <th className="px-6 py-3 font-medium">Role</th>
                      <th className="px-6 py-3 font-medium">Access Status</th>
                      <th className="px-6 py-3 font-medium">Department</th>
                      <th className="px-6 py-3 font-medium">Last Active</th>
                      <th className="px-6 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-[var(--border-subtle)]/50 hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center text-[var(--text-primary)] font-medium">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-[var(--text-primary)] font-medium">{user.name}</div>
                              <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select className="bg-white/5 border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50">
                            {mockRoles.map((role) => (
                              <option key={role.id} value={role.id} selected={role.name === user.role}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {user.temporaryAccess ? (
                              <>
                                {getExpirationBadge(user)}
                                <span className="text-xs text-[var(--text-muted)]">
                                  by {user.temporaryAccess.grantedBy}
                                </span>
                              </>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[var(--accent-ember)]/20 text-[var(--accent-ember)] w-fit">
                                <Shield className="w-3 h-3" />
                                Permanent
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[var(--text-secondary)]">{user.department}</td>
                        <td className="px-6 py-4 text-[var(--text-muted)] text-sm">{user.lastActive}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openTempAccessModal(user)}
                              className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-amber-400 transition-colors"
                              title="Grant Temporary Access"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-[var(--error)]/20 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">
                  Showing {filteredUsers.length} of {mockUsers.length} users
                </span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 text-sm transition-colors">
                    Previous
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-[var(--accent-ember)]/20 text-[var(--accent-ember)] text-sm">
                    1
                  </button>
                  <button className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 text-sm transition-colors">
                    2
                  </button>
                  <button className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 text-sm transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Role Modal */}
        {showCreateRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreateRole(false)}
            />
            <div className="relative bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-ember)]/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[var(--accent-ember)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[var(--text-primary)]">
                      Create New Role
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      Define permissions for this role
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateRole(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                {/* Role Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g., Content Manager"
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                  />
                </div>

                {/* Role Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Description
                  </label>
                  <textarea
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder="Describe what this role can do..."
                    rows={2}
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors resize-none"
                  />
                </div>

                {/* Permissions Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Permissions
                  </label>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {permissionCategories.map((category) => {
                      const CategoryIcon = category.icon;
                      const selectedCount = category.permissions.filter(p =>
                        newRolePermissions.includes(p.id)
                      ).length;

                      return (
                        <div key={category.name} className="border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between p-3 bg-white/5">
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                              <span className="text-sm font-medium text-[var(--text-primary)]">{category.name}</span>
                              <span className="px-1.5 py-0.5 rounded text-xs bg-white/10 text-[var(--text-muted)]">
                                {selectedCount}/{category.permissions.length}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const allIds = category.permissions.map(p => p.id);
                                const allSelected = allIds.every(id => newRolePermissions.includes(id));
                                if (allSelected) {
                                  setNewRolePermissions(prev => prev.filter(id => !allIds.includes(id)));
                                } else {
                                  setNewRolePermissions(prev => [...new Set([...prev, ...allIds])]);
                                }
                              }}
                              className="text-xs text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)]"
                            >
                              {category.permissions.every(p => newRolePermissions.includes(p.id)) ? "Deselect All" : "Select All"}
                            </button>
                          </div>
                          <div className="p-3 space-y-2">
                            {category.permissions.map((permission) => (
                              <label key={permission.id} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={newRolePermissions.includes(permission.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewRolePermissions(prev => [...prev, permission.id]);
                                    } else {
                                      setNewRolePermissions(prev => prev.filter(id => id !== permission.id));
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-[var(--border-subtle)] bg-white/5 text-[var(--accent-ember)] focus:ring-[var(--accent-ember)]/50"
                                />
                                <div className="flex-1">
                                  <span className="text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-ember)] transition-colors">
                                    {permission.name}
                                  </span>
                                  <p className="text-xs text-[var(--text-muted)]">{permission.description}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-charcoal)]">
                <span className="text-sm text-[var(--text-muted)]">
                  {newRolePermissions.length} permissions selected
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowCreateRole(false);
                      setNewRoleName("");
                      setNewRoleDescription("");
                      setNewRolePermissions([]);
                    }}
                    className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // In production, this would save to the backend
                      console.log("Creating role:", {
                        name: newRoleName,
                        description: newRoleDescription,
                        permissions: newRolePermissions,
                      });
                      setShowCreateRole(false);
                      setNewRoleName("");
                      setNewRoleDescription("");
                      setNewRolePermissions([]);
                    }}
                    disabled={!newRoleName.trim()}
                    className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-primary)] text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Role
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Temporary Access Modal */}
        {showTempAccessModal && selectedUserForTempAccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowTempAccessModal(false)}
            />

            {/* Modal Content */}
            <div className="relative bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl w-full max-w-md shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[var(--text-primary)]">
                      Temporary Access
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {selectedUserForTempAccess.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTempAccessModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center text-[var(--text-primary)] font-medium text-lg">
                    {selectedUserForTempAccess.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[var(--text-primary)] font-medium">
                      {selectedUserForTempAccess.name}
                    </div>
                    <div className="text-sm text-[var(--text-muted)]">
                      {selectedUserForTempAccess.email}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      Current role: {selectedUserForTempAccess.role}
                    </div>
                  </div>
                </div>

                {/* Grant Temporary Access Toggle */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={grantTempAccess}
                        onChange={(e) => setGrantTempAccess(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 rounded-full bg-white/20 peer-checked:bg-[var(--accent-ember)] transition-colors" />
                      <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
                    </div>
                    <span className="text-[var(--text-primary)] font-medium">
                      Grant temporary access
                    </span>
                  </label>

                  {/* Date Picker - Only shown when temp access is enabled */}
                  {grantTempAccess && (
                    <div className="space-y-2 pl-[52px]">
                      <label className="block text-sm text-[var(--text-secondary)]">
                        Access expires on
                      </label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                          type="date"
                          value={tempAccessDate}
                          onChange={(e) => setTempAccessDate(e.target.value)}
                          min={formatDateForInput(new Date())}
                          className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                        />
                      </div>

                      {/* Preview of expiration */}
                      {tempAccessDate && (
                        <div className="flex items-center gap-2 text-sm">
                          {(() => {
                            const days = getDaysUntilExpiration(tempAccessDate);
                            const isExpiringSoon = days <= 7;
                            return (
                              <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                                isExpiringSoon
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}>
                                <Clock className="w-3 h-3" />
                                Expires in {days} day{days !== 1 ? 's' : ''}
                              </span>
                            );
                          })()}
                        </div>
                      )}

                      {/* Warning for short durations */}
                      {grantTempAccess && getDaysUntilExpiration(tempAccessDate) <= 7 && (
                        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>
                            Short-term access. The user will be notified when access is about to expire.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Current temporary access info */}
                {selectedUserForTempAccess.temporaryAccess && (
                  <div className="p-3 bg-white/5 rounded-lg border border-[var(--border-subtle)]">
                    <div className="text-xs text-[var(--text-muted)] mb-1">
                      Current temporary access
                    </div>
                    <div className="flex items-center justify-between">
                      {getExpirationBadge(selectedUserForTempAccess)}
                      <span className="text-xs text-[var(--text-muted)]">
                        Granted by {selectedUserForTempAccess.temporaryAccess.grantedBy}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => setShowTempAccessModal(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTempAccess}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-[var(--text-primary)] text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  {grantTempAccess ? "Save Access" : "Remove Temp Access"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
