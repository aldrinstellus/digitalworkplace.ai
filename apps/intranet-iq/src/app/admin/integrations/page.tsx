"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Plug,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Settings2,
  Play,
  Pause,
  Trash2,
  Plus,
  Search,
  ExternalLink,
  Database,
  Mail,
  Calendar,
  FileText,
  Users,
  MessageSquare,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof Database;
  status: "connected" | "disconnected" | "syncing" | "error";
  lastSync?: string;
  itemsIndexed?: number;
  syncFrequency: string;
  category: string;
}

const integrations: Integration[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Sync documents, spreadsheets, and presentations",
    icon: FileText,
    status: "connected",
    lastSync: "5 minutes ago",
    itemsIndexed: 1245,
    syncFrequency: "Every 15 minutes",
    category: "storage",
  },
  {
    id: "sharepoint",
    name: "SharePoint",
    description: "Index SharePoint sites and document libraries",
    icon: Database,
    status: "connected",
    lastSync: "12 minutes ago",
    itemsIndexed: 3421,
    syncFrequency: "Every 30 minutes",
    category: "storage",
  },
  {
    id: "confluence",
    name: "Confluence",
    description: "Sync wiki pages and knowledge articles",
    icon: FileText,
    status: "syncing",
    lastSync: "Syncing now...",
    itemsIndexed: 892,
    syncFrequency: "Every hour",
    category: "knowledge",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Index messages and files from channels",
    icon: MessageSquare,
    status: "disconnected",
    syncFrequency: "Real-time",
    category: "communication",
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    description: "Sync teams, channels, and conversations",
    icon: Users,
    status: "error",
    lastSync: "Failed 2 hours ago",
    itemsIndexed: 456,
    syncFrequency: "Every 15 minutes",
    category: "communication",
  },
  {
    id: "outlook",
    name: "Outlook Calendar",
    description: "Sync calendar events and meetings",
    icon: Calendar,
    status: "connected",
    lastSync: "2 minutes ago",
    itemsIndexed: 234,
    syncFrequency: "Real-time",
    category: "calendar",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Index issues, projects, and comments",
    icon: Database,
    status: "connected",
    lastSync: "8 minutes ago",
    itemsIndexed: 5678,
    syncFrequency: "Every 15 minutes",
    category: "project",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sync pages, databases, and wikis",
    icon: FileText,
    status: "disconnected",
    syncFrequency: "Every hour",
    category: "knowledge",
  },
];

const categoryLabels: Record<string, string> = {
  storage: "Cloud Storage",
  knowledge: "Knowledge Base",
  communication: "Communication",
  calendar: "Calendar",
  project: "Project Management",
};

const statusConfig = {
  connected: { icon: CheckCircle, color: "text-[var(--success)]", bg: "bg-[var(--success)]/20", label: "Connected" },
  disconnected: { icon: XCircle, color: "text-[var(--text-muted)]", bg: "bg-[var(--text-muted)]/20", label: "Disconnected" },
  syncing: { icon: RefreshCw, color: "text-[var(--accent-ember)]", bg: "bg-[var(--accent-ember)]/20", label: "Syncing" },
  error: { icon: AlertCircle, color: "text-[var(--error)]", bg: "bg-[var(--error)]/20", label: "Error" },
};

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [integrationList, setIntegrationList] = useState(integrations);
  const [showSettingsModal, setShowSettingsModal] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const categories = ["all", ...new Set(integrationList.map((i) => i.category))];

  // Handle sync/refresh integration
  const handleSync = async (integrationId: string) => {
    setIntegrationList((prev) =>
      prev.map((i) =>
        i.id === integrationId ? { ...i, status: "syncing" as const, lastSync: "Syncing now..." } : i
      )
    );
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIntegrationList((prev) =>
      prev.map((i) =>
        i.id === integrationId
          ? { ...i, status: "connected" as const, lastSync: "Just now", itemsIndexed: (i.itemsIndexed || 0) + Math.floor(Math.random() * 50) }
          : i
      )
    );
  };

  // Handle connect integration
  const handleConnect = async (integrationId: string) => {
    setConnectingId(integrationId);
    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIntegrationList((prev) =>
      prev.map((i) =>
        i.id === integrationId
          ? { ...i, status: "connected" as const, lastSync: "Just now", itemsIndexed: Math.floor(Math.random() * 100) }
          : i
      )
    );
    setConnectingId(null);
  };

  // Handle retry failed integration
  const handleRetry = async (integrationId: string) => {
    setConnectingId(integrationId);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIntegrationList((prev) =>
      prev.map((i) =>
        i.id === integrationId
          ? { ...i, status: "connected" as const, lastSync: "Just now" }
          : i
      )
    );
    setConnectingId(null);
  };

  // Handle pause integration
  const handlePause = (integrationId: string) => {
    setIntegrationList((prev) =>
      prev.map((i) =>
        i.id === integrationId ? { ...i, status: "disconnected" as const } : i
      )
    );
  };

  // Handle add new integration
  const handleAddIntegration = (name: string, category: string) => {
    const newIntegration: Integration = {
      id: `new-${Date.now()}`,
      name,
      description: `Connect your ${name} account`,
      icon: Database,
      status: "disconnected",
      syncFrequency: "Every hour",
      category: category.toLowerCase(),
    };
    setIntegrationList((prev) => [...prev, newIntegration]);
    setShowAddModal(false);
  };

  // Open external docs
  const handleOpenDocs = (integrationName: string) => {
    window.open(`https://docs.digitalworkplace.ai/integrations/${integrationName.toLowerCase().replace(/\s/g, "-")}`, "_blank");
  };

  const filteredIntegrations = integrationList.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || integration.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = integrationList.filter((i) => i.status === "connected" || i.status === "syncing").length;
  const totalItems = integrationList.reduce((sum, i) => sum + (i.itemsIndexed || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />

      <main className="ml-16 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[var(--text-primary)] flex items-center gap-3">
                <Plug className="w-7 h-7 text-[var(--accent-ember)]" />
                Integrations Hub
              </h1>
              <p className="text-[var(--text-muted)] mt-1">
                Connect external data sources to enrich your knowledge base
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-[var(--text-primary)] flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Integration
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4">
              <div className="text-sm text-[var(--text-muted)] mb-1">Connected Integrations</div>
              <div className="text-2xl font-medium text-[var(--text-primary)]">
                {connectedCount} / {integrations.length}
              </div>
            </div>
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4">
              <div className="text-sm text-[var(--text-muted)] mb-1">Total Items Indexed</div>
              <div className="text-2xl font-medium text-[var(--text-primary)]">{totalItems.toLocaleString()}</div>
            </div>
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4">
              <div className="text-sm text-[var(--text-muted)] mb-1">Sync Status</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-medium text-[var(--success)]">Healthy</span>
                <CheckCircle className="w-5 h-5 text-[var(--success)]" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search integrations..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50"
              />
            </div>
            <div className="flex items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    categoryFilter === category
                      ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)] border border-[var(--accent-ember)]/30"
                      : "bg-white/5 text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-white/10"
                  }`}
                >
                  {category === "all" ? "All" : categoryLabels[category] || category}
                </button>
              ))}
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredIntegrations.map((integration) => {
              const status = statusConfig[integration.status];
              const StatusIcon = status.icon;
              const IntegrationIcon = integration.icon;

              return (
                <div
                  key={integration.id}
                  className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <IntegrationIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-[var(--text-primary)]">{integration.name}</h3>
                        <p className="text-sm text-[var(--text-muted)]">{integration.description}</p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bg} ${status.color} text-sm`}
                    >
                      <StatusIcon
                        className={`w-4 h-4 ${integration.status === "syncing" ? "animate-spin" : ""}`}
                      />
                      {status.label}
                    </div>
                  </div>

                  {/* Stats */}
                  {integration.status !== "disconnected" && (
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-xs text-[var(--text-muted)] mb-0.5">Last Sync</div>
                        <div className="text-sm text-[var(--text-secondary)]">{integration.lastSync || "Never"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-muted)] mb-0.5">Items Indexed</div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          {integration.itemsIndexed?.toLocaleString() || "0"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-muted)] mb-0.5">Sync Frequency</div>
                        <div className="text-sm text-[var(--text-secondary)]">{integration.syncFrequency}</div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2">
                      {integration.status === "connected" && (
                        <button
                          onClick={() => handleSync(integration.id)}
                          className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--accent-ember)] transition-colors"
                          title="Sync now"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setShowSettingsModal(integration.id)}
                        className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                        title="Settings"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDocs(integration.name)}
                        className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                        title="Documentation"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                    {integration.status === "disconnected" ? (
                      <button
                        onClick={() => handleConnect(integration.id)}
                        disabled={connectingId === integration.id}
                        className="px-4 py-1.5 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] disabled:opacity-50 text-[var(--text-primary)] text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        {connectingId === integration.id && <RefreshCw className="w-3 h-3 animate-spin" />}
                        {connectingId === integration.id ? "Connecting..." : "Connect"}
                      </button>
                    ) : integration.status === "error" ? (
                      <button
                        onClick={() => handleRetry(integration.id)}
                        disabled={connectingId === integration.id}
                        className="px-4 py-1.5 rounded-lg bg-[var(--error)]/20 hover:bg-[var(--error)]/30 disabled:opacity-50 text-[var(--error)] text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        {connectingId === integration.id && <RefreshCw className="w-3 h-3 animate-spin" />}
                        {connectingId === integration.id ? "Retrying..." : "Retry"}
                      </button>
                    ) : integration.status === "syncing" ? (
                      <span className="px-4 py-1.5 rounded-lg bg-[var(--accent-ember)]/10 text-[var(--accent-ember)] text-sm flex items-center gap-2">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Syncing...
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePause(integration.id)}
                        className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] text-sm transition-colors flex items-center gap-2"
                      >
                        <Pause className="w-3 h-3" />
                        Pause
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredIntegrations.length === 0 && (
            <div className="text-center py-16">
              <Plug className="w-16 h-16 text-[var(--text-muted)]/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">No integrations found</h3>
              <p className="text-sm text-[var(--text-muted)]/70">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-2xl w-[600px] max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-medium text-[var(--text-primary)]">Add Integration</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Select an integration to connect to your dIQ instance.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Salesforce", icon: Database, category: "CRM" },
                  { name: "HubSpot", icon: Users, category: "CRM" },
                  { name: "Zendesk", icon: MessageSquare, category: "Support" },
                  { name: "GitHub", icon: FileText, category: "Development" },
                  { name: "Figma", icon: FileText, category: "Design" },
                  { name: "Dropbox", icon: Database, category: "Storage" },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleAddIntegration(item.name, item.category)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-ember)]/30 hover:bg-[var(--accent-ember)]/5 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-[var(--text-secondary)]" />
                    </div>
                    <div>
                      <p className="text-[var(--text-primary)] font-medium">{item.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{item.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-2xl w-[500px] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-medium text-[var(--text-primary)]">Integration Settings</h2>
              <button
                onClick={() => setShowSettingsModal(null)}
                className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  Sync Frequency
                </label>
                <select className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50">
                  <option>Real-time</option>
                  <option>Every 15 minutes</option>
                  <option>Every 30 minutes</option>
                  <option>Every hour</option>
                  <option>Every 6 hours</option>
                  <option>Daily</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  Content Types to Index
                </label>
                <div className="space-y-2">
                  {["Documents", "Messages", "Comments", "Files"].map((type) => (
                    <label key={type} className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <input type="checkbox" defaultChecked className="rounded border-white/30" />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  Exclude Patterns
                </label>
                <input
                  type="text"
                  placeholder="e.g., /private/*, *.log"
                  className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => {
                  const integration = integrationList.find((i) => i.id === showSettingsModal);
                  if (integration) handlePause(integration.id);
                  setShowSettingsModal(null);
                }}
                className="px-4 py-2 rounded-lg text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Disconnect
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettingsModal(null)}
                  className="px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowSettingsModal(null)}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-[var(--text-primary)] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
