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

const mockUsers: User[] = [
  { id: "1", name: "Sarah Chen", email: "sarah.chen@company.com", role: "Super Admin", department: "Engineering", lastActive: "2 min ago" },
  { id: "2", name: "Alex Thompson", email: "alex.t@company.com", role: "Admin", department: "HR", lastActive: "15 min ago" },
  { id: "3", name: "Maria Garcia", email: "m.garcia@company.com", role: "Editor", department: "Marketing", lastActive: "1 hour ago" },
  { id: "4", name: "James Wilson", email: "j.wilson@company.com", role: "Viewer", department: "Sales", lastActive: "3 hours ago" },
  { id: "5", name: "Emily Brown", email: "e.brown@company.com", role: "Editor", department: "Product", lastActive: "1 day ago" },
];

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");
  const [selectedRole, setSelectedRole] = useState<Role | null>(mockRoles[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(permissionCategories.map(c => c.name));
  const [_showCreateRole, setShowCreateRole] = useState(false);

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
                        <td className="px-6 py-4 text-[var(--text-secondary)]">{user.department}</td>
                        <td className="px-6 py-4 text-[var(--text-muted)] text-sm">{user.lastActive}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                              <Eye className="w-4 h-4" />
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
      </main>
    </div>
  );
}
