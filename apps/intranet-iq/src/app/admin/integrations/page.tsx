"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Plug,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings2,
  Pause,
  Trash2,
  Plus,
  Search,
  ExternalLink,
  Database,
  Calendar,
  FileText,
  Users,
  MessageSquare,
  GitBranch,
  Code,
  Unlink,
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

// GitHub Repository type
interface GitHubRepo {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  languageColor: string;
  lastSynced: string;
  filesIndexed: number;
  status: "synced" | "syncing" | "error";
  private: boolean;
}

// Mock GitHub connected repos
const GITHUB_REPOS: GitHubRepo[] = [
  {
    id: "repo-1",
    name: "enterprise-api",
    fullName: "acme-corp/enterprise-api",
    description: "Main REST API service for enterprise applications",
    language: "TypeScript",
    languageColor: "bg-blue-400",
    lastSynced: "5 minutes ago",
    filesIndexed: 1247,
    status: "synced",
    private: true,
  },
  {
    id: "repo-2",
    name: "frontend-components",
    fullName: "acme-corp/frontend-components",
    description: "Shared React component library",
    language: "TypeScript",
    languageColor: "bg-blue-400",
    lastSynced: "12 minutes ago",
    filesIndexed: 856,
    status: "synced",
    private: false,
  },
  {
    id: "repo-3",
    name: "data-pipeline",
    fullName: "acme-corp/data-pipeline",
    description: "ETL and data processing pipelines",
    language: "Python",
    languageColor: "bg-yellow-400",
    lastSynced: "Syncing now...",
    filesIndexed: 423,
    status: "syncing",
    private: true,
  },
  {
    id: "repo-4",
    name: "mobile-app",
    fullName: "acme-corp/mobile-app",
    description: "Cross-platform mobile application",
    language: "Dart",
    languageColor: "bg-cyan-400",
    lastSynced: "1 hour ago",
    filesIndexed: 634,
    status: "synced",
    private: false,
  },
];

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

  // GitHub connector state
  const [githubConnected, setGithubConnected] = useState(true);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>(GITHUB_REPOS);
  const [githubConnecting, setGithubConnecting] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [syncingRepoId, setSyncingRepoId] = useState<string | null>(null);

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

  // GitHub-specific handlers
  const handleGithubConnect = async () => {
    setGithubConnecting(true);
    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setGithubConnected(true);
    setGithubRepos(GITHUB_REPOS);
    setGithubConnecting(false);
  };

  const handleGithubDisconnect = () => {
    setGithubConnected(false);
    setGithubRepos([]);
  };

  const handleSyncRepo = async (repoId: string) => {
    setSyncingRepoId(repoId);
    setGithubRepos((prev) =>
      prev.map((r) => (r.id === repoId ? { ...r, status: "syncing" as const, lastSynced: "Syncing now..." } : r))
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setGithubRepos((prev) =>
      prev.map((r) =>
        r.id === repoId
          ? { ...r, status: "synced" as const, lastSynced: "Just now", filesIndexed: r.filesIndexed + Math.floor(Math.random() * 50) }
          : r
      )
    );
    setSyncingRepoId(null);
  };

  const handleSyncAllRepos = async () => {
    setGithubRepos((prev) => prev.map((r) => ({ ...r, status: "syncing" as const, lastSynced: "Syncing now..." })));
    await new Promise((resolve) => setTimeout(resolve, 4000));
    setGithubRepos((prev) =>
      prev.map((r) => ({
        ...r,
        status: "synced" as const,
        lastSynced: "Just now",
        filesIndexed: r.filesIndexed + Math.floor(Math.random() * 50),
      }))
    );
  };

  const handleDisconnectRepo = (repoId: string) => {
    setGithubRepos((prev) => prev.filter((r) => r.id !== repoId));
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

          {/* GitHub/GitLab Connector Section */}
          <div className="mb-8">
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
              {/* GitHub Header */}
              <div className="p-6 border-b border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <GitBranch className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-medium text-[var(--text-primary)] flex items-center gap-3">
                        GitHub Connector
                        {githubConnected && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--success)]/20 text-[var(--success)]">
                            <CheckCircle className="w-3 h-3" />
                            Connected
                          </span>
                        )}
                      </h2>
                      <p className="text-sm text-[var(--text-muted)]">
                        Index code repositories for semantic search and documentation
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {githubConnected ? (
                      <>
                        <button
                          onClick={handleSyncAllRepos}
                          className="px-4 py-2 rounded-lg bg-[var(--accent-ember)]/20 hover:bg-[var(--accent-ember)]/30 text-[var(--accent-ember)] flex items-center gap-2 transition-colors text-sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Sync All
                        </button>
                        <button
                          onClick={() => setShowGithubModal(true)}
                          className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-white flex items-center gap-2 transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add Repository
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleGithubConnect}
                        disabled={githubConnecting}
                        className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {githubConnecting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <GitBranch className="w-5 h-5" />
                            Connect GitHub
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* GitHub Stats */}
                {githubConnected && (
                  <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Repositories</div>
                      <div className="text-lg font-medium text-[var(--text-primary)]">{githubRepos.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Files Indexed</div>
                      <div className="text-lg font-medium text-[var(--text-primary)]">
                        {githubRepos.reduce((sum, r) => sum + r.filesIndexed, 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Syncing</div>
                      <div className="text-lg font-medium text-[var(--text-primary)]">
                        {githubRepos.filter((r) => r.status === "syncing").length}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Last Activity</div>
                      <div className="text-lg font-medium text-[var(--text-primary)]">2 min ago</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Connected Repositories List */}
              {githubConnected && githubRepos.length > 0 && (
                <div className="divide-y divide-[var(--border-subtle)]">
                  {githubRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                          <Code className="w-5 h-5 text-[var(--text-secondary)]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[var(--text-primary)]">{repo.name}</span>
                            {repo.private && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-400">
                                Private
                              </span>
                            )}
                            <span className={`w-2 h-2 rounded-full ${repo.languageColor}`} title={repo.language} />
                            <span className="text-xs text-[var(--text-muted)]">{repo.language}</span>
                          </div>
                          <p className="text-sm text-[var(--text-muted)]">{repo.fullName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Sync Status */}
                        <div className="text-right">
                          <div className="text-xs text-[var(--text-muted)] mb-0.5">Last Synced</div>
                          <div className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                            {repo.status === "syncing" && (
                              <RefreshCw className="w-3 h-3 animate-spin text-[var(--accent-ember)]" />
                            )}
                            {repo.status === "synced" && <CheckCircle className="w-3 h-3 text-[var(--success)]" />}
                            {repo.status === "error" && <AlertCircle className="w-3 h-3 text-[var(--error)]" />}
                            {repo.lastSynced}
                          </div>
                        </div>

                        {/* Files Indexed */}
                        <div className="text-right min-w-[80px]">
                          <div className="text-xs text-[var(--text-muted)] mb-0.5">Files</div>
                          <div className="text-sm text-[var(--text-secondary)]">{repo.filesIndexed.toLocaleString()}</div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSyncRepo(repo.id)}
                            disabled={repo.status === "syncing" || syncingRepoId === repo.id}
                            className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--accent-ember)] transition-colors disabled:opacity-50"
                            title="Re-sync"
                          >
                            <RefreshCw className={`w-4 h-4 ${repo.status === "syncing" ? "animate-spin" : ""}`} />
                          </button>
                          <button
                            onClick={() => window.open(`https://github.com/${repo.fullName}`, "_blank")}
                            className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                            title="Open in GitHub"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDisconnectRepo(repo.id)}
                            className="p-2 rounded-lg hover:bg-[var(--error)]/10 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                            title="Disconnect"
                          >
                            <Unlink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {githubConnected && githubRepos.length === 0 && (
                <div className="p-8 text-center">
                  <Code className="w-12 h-12 text-[var(--text-muted)]/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">No repositories connected</h3>
                  <p className="text-sm text-[var(--text-muted)]/70 mb-4">
                    Add repositories to start indexing code for search
                  </p>
                  <button
                    onClick={() => setShowGithubModal(true)}
                    className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-white text-sm transition-colors"
                  >
                    Add Repository
                  </button>
                </div>
              )}

              {/* Not Connected State */}
              {!githubConnected && (
                <div className="p-8 text-center">
                  <GitBranch className="w-12 h-12 text-[var(--text-muted)]/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">Connect your GitHub account</h3>
                  <p className="text-sm text-[var(--text-muted)]/70 mb-4">
                    Index code repositories for semantic search and AI-powered documentation
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Other Integrations Grid */}
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Other Integrations</h3>
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

      {/* Add GitHub Repository Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-2xl w-[600px] max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Add GitHub Repository
              </h2>
              <button
                onClick={() => setShowGithubModal(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Select repositories to index from your connected GitHub account.
              </p>

              {/* Search repos */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-slate)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50"
                />
              </div>

              {/* Available repos to add */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {[
                  { name: "documentation", fullName: "acme-corp/documentation", language: "Markdown", private: false },
                  { name: "backend-services", fullName: "acme-corp/backend-services", language: "Go", private: true },
                  { name: "infrastructure", fullName: "acme-corp/infrastructure", language: "HCL", private: true },
                  { name: "design-system", fullName: "acme-corp/design-system", language: "TypeScript", private: false },
                ].map((repo) => (
                  <div
                    key={repo.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-ember)]/30 hover:bg-[var(--accent-ember)]/5 transition-colors cursor-pointer"
                    onClick={() => {
                      const newRepo: GitHubRepo = {
                        id: `repo-${Date.now()}`,
                        name: repo.name,
                        fullName: repo.fullName,
                        description: `Repository for ${repo.name}`,
                        language: repo.language,
                        languageColor: repo.language === "Go" ? "bg-cyan-400" : repo.language === "HCL" ? "bg-purple-400" : "bg-blue-400",
                        lastSynced: "Never",
                        filesIndexed: 0,
                        status: "synced",
                        private: repo.private,
                      };
                      setGithubRepos((prev) => [...prev, newRepo]);
                      setShowGithubModal(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Code className="w-5 h-5 text-[var(--text-muted)]" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[var(--text-primary)]">{repo.name}</span>
                          {repo.private && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-400">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">{repo.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-muted)]">{repo.language}</span>
                      <Plus className="w-4 h-4 text-[var(--accent-ember)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setShowGithubModal(false)}
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
