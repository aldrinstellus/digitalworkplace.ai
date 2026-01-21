"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Database,
  Activity,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  FileText,
  RefreshCw,
  CheckCircle2,
  Search,
  Trash2,
  Settings,
  Download,
  Upload,
  Zap,
  Plus,
} from "lucide-react";

interface IndexStats {
  name: string;
  docCount: number;
  size: string;
  health: "green" | "yellow" | "red";
  status: "open" | "close";
}

interface ClusterHealth {
  status: "green" | "yellow" | "red";
  nodeCount: number;
  activePrimaryShards: number;
  activeShards: number;
  relocatingShards: number;
  initializingShards: number;
  unassignedShards: number;
}

interface NodeStats {
  name: string;
  host: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  heapUsage: number;
}

// Mock data for demo
const mockIndexStats: IndexStats[] = [
  { name: "diq-content", docCount: 15420, size: "128MB", health: "green", status: "open" },
  { name: "diq-articles", docCount: 3250, size: "45MB", health: "green", status: "open" },
  { name: "diq-employees", docCount: 850, size: "12MB", health: "green", status: "open" },
  { name: "diq-events", docCount: 420, size: "8MB", health: "yellow", status: "open" },
  { name: "diq-documents", docCount: 8750, size: "256MB", health: "green", status: "open" },
];

const mockClusterHealth: ClusterHealth = {
  status: "green",
  nodeCount: 3,
  activePrimaryShards: 15,
  activeShards: 30,
  relocatingShards: 0,
  initializingShards: 0,
  unassignedShards: 0,
};

const mockNodeStats: NodeStats[] = [
  { name: "es-node-1", host: "192.168.1.10", cpuUsage: 35, memoryUsage: 62, diskUsage: 45, heapUsage: 58 },
  { name: "es-node-2", host: "192.168.1.11", cpuUsage: 28, memoryUsage: 55, diskUsage: 42, heapUsage: 52 },
  { name: "es-node-3", host: "192.168.1.12", cpuUsage: 42, memoryUsage: 68, diskUsage: 48, heapUsage: 61 },
];

export default function ElasticsearchAdminPage() {
  const [indexStats, setIndexStats] = useState<IndexStats[]>(mockIndexStats);
  const [clusterHealth, setClusterHealth] = useState<ClusterHealth>(mockClusterHealth);
  const [nodeStats, setNodeStats] = useState<NodeStats[]>(mockNodeStats);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "indices" | "nodes" | "operations">("overview");
  const [reindexing, setReindexing] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    // In production, fetch from API
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulate data refresh with slight variations
    setIndexStats(mockIndexStats.map(stat => ({
      ...stat,
      docCount: stat.docCount + Math.floor(Math.random() * 10)
    })));
    setClusterHealth({ ...mockClusterHealth });
    setNodeStats(mockNodeStats.map(node => ({
      ...node,
      cpuUsage: Math.max(10, Math.min(90, node.cpuUsage + Math.floor(Math.random() * 10 - 5)))
    })));
    setLoading(false);
  };

  const handleReindex = async () => {
    setReindexing(true);
    // In production, call reindex API
    await new Promise(resolve => setTimeout(resolve, 3000));
    setReindexing(false);
  };

  const healthColors = {
    green: "text-green-400 bg-green-500/20",
    yellow: "text-yellow-400 bg-yellow-500/20",
    red: "text-red-400 bg-red-500/20",
  };

  const totalDocs = indexStats.reduce((sum, idx) => sum + idx.docCount, 0);

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />

      <main className="ml-16 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[var(--text-primary)] flex items-center gap-3">
                <Database className="w-7 h-7 text-[var(--accent-ember)]" />
                Elasticsearch Dashboard
              </h1>
              <p className="text-[var(--text-muted)] mt-1">Monitor and manage your search infrastructure</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] hover:bg-white/5 text-[var(--text-primary)] flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-[var(--text-primary)] flex items-center gap-2 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-lg w-fit">
            {(["overview", "indices", "nodes", "operations"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? "bg-[var(--accent-ember)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <>
              {/* Cluster Status Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[var(--text-muted)] text-sm">Cluster Health</span>
                    <Activity className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${clusterHealth.status === "green" ? "bg-green-400" : clusterHealth.status === "yellow" ? "bg-yellow-400" : "bg-red-400"}`} />
                    <span className="text-2xl font-medium text-[var(--text-primary)] capitalize">{clusterHealth.status}</span>
                  </div>
                </div>

                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[var(--text-muted)] text-sm">Total Documents</span>
                    <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <div className="text-2xl font-medium text-[var(--text-primary)]">{totalDocs.toLocaleString()}</div>
                </div>

                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[var(--text-muted)] text-sm">Active Nodes</span>
                    <Server className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <div className="text-2xl font-medium text-[var(--text-primary)]">{clusterHealth.nodeCount}</div>
                </div>

                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[var(--text-muted)] text-sm">Active Shards</span>
                    <HardDrive className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <div className="text-2xl font-medium text-[var(--text-primary)]">{clusterHealth.activeShards}</div>
                </div>
              </div>

              {/* Index Overview */}
              <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Index Overview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                        <th className="pb-3 font-medium">Index</th>
                        <th className="pb-3 font-medium">Documents</th>
                        <th className="pb-3 font-medium">Size</th>
                        <th className="pb-3 font-medium">Health</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indexStats.map((index) => (
                        <tr key={index.name} className="border-b border-[var(--border-subtle)]/50 hover:bg-white/5">
                          <td className="py-3 text-[var(--text-primary)] font-mono text-sm">{index.name}</td>
                          <td className="py-3 text-[var(--text-secondary)]">{index.docCount.toLocaleString()}</td>
                          <td className="py-3 text-[var(--text-secondary)]">{index.size}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${healthColors[index.health]}`}>
                              {index.health}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]">
                              {index.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              <button className="p-1.5 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                                <Search className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Node Health */}
              <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Node Health</h3>
                <div className="grid grid-cols-3 gap-4">
                  {nodeStats.map((node) => (
                    <div key={node.name} className="border border-[var(--border-subtle)] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-[var(--text-primary)] font-medium">{node.name}</h4>
                          <p className="text-xs text-[var(--text-muted)]">{node.host}</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[var(--text-muted)]">CPU</span>
                            <span className="text-[var(--text-secondary)]">{node.cpuUsage}%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${node.cpuUsage > 80 ? "bg-red-500" : node.cpuUsage > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                              style={{ width: `${node.cpuUsage}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[var(--text-muted)]">Memory</span>
                            <span className="text-[var(--text-secondary)]">{node.memoryUsage}%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${node.memoryUsage > 80 ? "bg-red-500" : node.memoryUsage > 60 ? "bg-yellow-500" : "bg-[var(--accent-ember)]"}`}
                              style={{ width: `${node.memoryUsage}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[var(--text-muted)]">Heap</span>
                            <span className="text-[var(--text-secondary)]">{node.heapUsage}%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${node.heapUsage > 80 ? "bg-red-500" : node.heapUsage > 60 ? "bg-yellow-500" : "bg-purple-500"}`}
                              style={{ width: `${node.heapUsage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "operations" && (
            <div className="grid grid-cols-2 gap-6">
              {/* Indexing Operations */}
              <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Indexing Operations</h3>
                <div className="space-y-4">
                  <button
                    onClick={handleReindex}
                    disabled={reindexing}
                    className="w-full p-4 rounded-xl border border-[var(--border-subtle)] hover:bg-white/5 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--accent-ember)]/20 flex items-center justify-center">
                        {reindexing ? (
                          <RefreshCw className="w-5 h-5 text-[var(--accent-ember)] animate-spin" />
                        ) : (
                          <RefreshCw className="w-5 h-5 text-[var(--accent-ember)]" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-[var(--text-primary)] font-medium">Full Reindex</h4>
                        <p className="text-sm text-[var(--text-muted)]">Reindex all content from Supabase</p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full p-4 rounded-xl border border-[var(--border-subtle)] hover:bg-white/5 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-[var(--text-primary)] font-medium">Sync New Content</h4>
                        <p className="text-sm text-[var(--text-muted)]">Index recently added content</p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full p-4 rounded-xl border border-[var(--border-subtle)] hover:bg-white/5 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--accent-gold)]/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-[var(--accent-gold)]" />
                      </div>
                      <div>
                        <h4 className="text-[var(--text-primary)] font-medium">Generate Demo Data</h4>
                        <p className="text-sm text-[var(--text-muted)]">Create sample content for testing</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Maintenance Operations */}
              <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Maintenance</h3>
                <div className="space-y-4">
                  <button className="w-full p-4 rounded-xl border border-[var(--border-subtle)] hover:bg-white/5 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <HardDrive className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <h4 className="text-[var(--text-primary)] font-medium">Force Merge</h4>
                        <p className="text-sm text-[var(--text-muted)]">Optimize index segments</p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full p-4 rounded-xl border border-[var(--border-subtle)] hover:bg-white/5 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <Download className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-[var(--text-primary)] font-medium">Create Snapshot</h4>
                        <p className="text-sm text-[var(--text-muted)]">Backup indices to repository</p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full p-4 rounded-xl border border-red-500/30 hover:bg-red-500/10 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-red-400 font-medium">Clear All Indices</h4>
                        <p className="text-sm text-[var(--text-muted)]">Delete all indexed data (irreversible)</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "indices" && (
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[var(--text-primary)]">Index Management</h3>
                <button className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-[var(--text-primary)] text-sm flex items-center gap-2 transition-colors">
                  <Plus className="w-4 h-4" />
                  Create Index
                </button>
              </div>
              <div className="space-y-3">
                {indexStats.map((index) => (
                  <div
                    key={index.name}
                    className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-subtle)] hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${index.health === "green" ? "bg-green-400" : index.health === "yellow" ? "bg-yellow-400" : "bg-red-400"}`} />
                      <div>
                        <h4 className="text-[var(--text-primary)] font-mono">{index.name}</h4>
                        <p className="text-xs text-[var(--text-muted)]">{index.docCount.toLocaleString()} docs | {index.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-white/5 text-[var(--text-secondary)] text-sm flex items-center gap-1.5 transition-colors">
                        <Search className="w-3.5 h-3.5" />
                        Query
                      </button>
                      <button className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-white/5 text-[var(--text-secondary)] text-sm flex items-center gap-1.5 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reindex
                      </button>
                      <button className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-white/5 text-[var(--text-secondary)] text-sm flex items-center gap-1.5 transition-colors">
                        <Settings className="w-3.5 h-3.5" />
                        Settings
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "nodes" && (
            <div className="space-y-6">
              {nodeStats.map((node) => (
                <div key={node.name} className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-ember)]/20 to-[var(--accent-copper)]/20 border border-[var(--accent-ember)]/30 flex items-center justify-center">
                        <Server className="w-6 h-6 text-[var(--accent-ember)]" />
                      </div>
                      <div>
                        <h4 className="text-[var(--text-primary)] font-medium">{node.name}</h4>
                        <p className="text-sm text-[var(--text-muted)]">{node.host}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Online
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-sm text-[var(--text-muted)]">CPU Usage</span>
                      </div>
                      <div className="text-2xl font-medium text-[var(--text-primary)]">{node.cpuUsage}%</div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${node.cpuUsage > 80 ? "bg-red-500" : node.cpuUsage > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                          style={{ width: `${node.cpuUsage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MemoryStick className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-sm text-[var(--text-muted)]">Memory</span>
                      </div>
                      <div className="text-2xl font-medium text-[var(--text-primary)]">{node.memoryUsage}%</div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${node.memoryUsage > 80 ? "bg-red-500" : node.memoryUsage > 60 ? "bg-yellow-500" : "bg-[var(--accent-ember)]"}`}
                          style={{ width: `${node.memoryUsage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <HardDrive className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-sm text-[var(--text-muted)]">Disk Usage</span>
                      </div>
                      <div className="text-2xl font-medium text-[var(--text-primary)]">{node.diskUsage}%</div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${node.diskUsage > 80 ? "bg-red-500" : node.diskUsage > 60 ? "bg-yellow-500" : "bg-purple-500"}`}
                          style={{ width: `${node.diskUsage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-sm text-[var(--text-muted)]">JVM Heap</span>
                      </div>
                      <div className="text-2xl font-medium text-[var(--text-primary)]">{node.heapUsage}%</div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${node.heapUsage > 80 ? "bg-red-500" : node.heapUsage > 60 ? "bg-yellow-500" : "bg-cyan-500"}`}
                          style={{ width: `${node.heapUsage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
