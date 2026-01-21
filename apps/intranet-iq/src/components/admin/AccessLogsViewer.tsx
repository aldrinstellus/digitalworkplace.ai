"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  LogIn,
  LogOut,
  FileText,
  Users,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Building2,
  Loader2,
  X,
} from "lucide-react";

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface AccessLogsViewerProps {
  projectId?: string;
  userId?: string;
  compact?: boolean;
}

const ACTION_ICONS: Record<string, typeof Eye> = {
  view: Eye,
  create: Plus,
  edit: Edit,
  delete: Trash2,
  login: LogIn,
  logout: LogOut,
  approve: CheckCircle,
  reject: XCircle,
  settings: Settings,
  permission: Shield,
};

const ACTION_COLORS: Record<string, string> = {
  view: "text-blue-400 bg-blue-500/20",
  create: "text-green-400 bg-green-500/20",
  edit: "text-yellow-400 bg-yellow-500/20",
  delete: "text-red-400 bg-red-500/20",
  login: "text-cyan-400 bg-cyan-500/20",
  logout: "text-white/50 bg-white/10",
  approve: "text-green-400 bg-green-500/20",
  reject: "text-red-400 bg-red-500/20",
  settings: "text-purple-400 bg-purple-500/20",
  permission: "text-orange-400 bg-orange-500/20",
};

const ENTITY_ICONS: Record<string, typeof FileText> = {
  article: FileText,
  user: User,
  department: Building2,
  settings: Settings,
  permission: Shield,
  workflow: Settings,
};

// Demo data for when not connected to real API
const DEMO_LOGS: ActivityLog[] = [
  {
    id: "1",
    user_id: "user-1",
    action: "view",
    entity_type: "article",
    entity_id: "art-1",
    metadata: { article_title: "Q4 Planning Document" },
    ip_address: "192.168.1.100",
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    user: { id: "user-1", email: "sarah.chen@company.com", full_name: "Sarah Chen" },
  },
  {
    id: "2",
    user_id: "user-2",
    action: "edit",
    entity_type: "article",
    entity_id: "art-2",
    metadata: { article_title: "Employee Handbook", changes: 3 },
    ip_address: "192.168.1.101",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    user: { id: "user-2", email: "john.doe@company.com", full_name: "John Doe" },
  },
  {
    id: "3",
    user_id: "user-3",
    action: "approve",
    entity_type: "article",
    entity_id: "art-3",
    metadata: { article_title: "New Hire Onboarding Guide" },
    ip_address: "192.168.1.102",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    user: { id: "user-3", email: "admin@company.com", full_name: "Admin User" },
  },
  {
    id: "4",
    user_id: "user-1",
    action: "login",
    entity_type: "session",
    metadata: { method: "google_oauth" },
    ip_address: "192.168.1.100",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    user: { id: "user-1", email: "sarah.chen@company.com", full_name: "Sarah Chen" },
  },
  {
    id: "5",
    user_id: "user-4",
    action: "create",
    entity_type: "article",
    entity_id: "art-4",
    metadata: { article_title: "Product Launch Strategy" },
    ip_address: "192.168.1.103",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: { id: "user-4", email: "jane.smith@company.com", full_name: "Jane Smith" },
  },
  {
    id: "6",
    user_id: "user-2",
    action: "permission",
    entity_type: "user",
    entity_id: "user-5",
    metadata: { changed_role: "editor", previous_role: "viewer" },
    ip_address: "192.168.1.101",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    user: { id: "user-2", email: "john.doe@company.com", full_name: "John Doe" },
  },
  {
    id: "7",
    user_id: "user-3",
    action: "delete",
    entity_type: "article",
    entity_id: "art-5",
    metadata: { article_title: "Deprecated Policy Document" },
    ip_address: "192.168.1.102",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    user: { id: "user-3", email: "admin@company.com", full_name: "Admin User" },
  },
  {
    id: "8",
    user_id: "user-1",
    action: "logout",
    entity_type: "session",
    ip_address: "192.168.1.100",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    user: { id: "user-1", email: "sarah.chen@company.com", full_name: "Sarah Chen" },
  },
];

export function AccessLogsViewer({
  projectId,
  userId,
  compact = false,
}: AccessLogsViewerProps) {
  const [logs, setLogs] = useState<ActivityLog[]>(DEMO_LOGS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const pageSize = compact ? 5 : 10;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      // const response = await fetch(`/diq/api/admin/activity-logs?${params}`);
      // const data = await response.json();
      // setLogs(data.logs);
      // setTotalPages(Math.ceil(data.total / pageSize));

      // Using demo data
      await new Promise((r) => setTimeout(r, 500));
      setTotalPages(Math.ceil(DEMO_LOGS.length / pageSize));
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, page, selectedAction, selectedEntity, dateRange]);

  // Filter logs based on current filters
  const filteredLogs = logs.filter((log) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !log.user?.full_name?.toLowerCase().includes(query) &&
        !log.user?.email?.toLowerCase().includes(query) &&
        !log.action.toLowerCase().includes(query) &&
        !log.entity_type.toLowerCase().includes(query) &&
        !JSON.stringify(log.metadata).toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (selectedAction && log.action !== selectedAction) return false;
    if (selectedEntity && log.entity_type !== selectedEntity) return false;
    return true;
  });

  const paginatedLogs = filteredLogs.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60 * 1000) return "Just now";
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getActionDescription = (log: ActivityLog): string => {
    const entityName = log.metadata?.article_title || log.entity_id || log.entity_type;

    switch (log.action) {
      case "view":
        return `Viewed ${entityName}`;
      case "create":
        return `Created ${entityName}`;
      case "edit":
        return `Edited ${entityName}`;
      case "delete":
        return `Deleted ${entityName}`;
      case "login":
        return `Logged in via ${log.metadata?.method || "unknown"}`;
      case "logout":
        return "Logged out";
      case "approve":
        return `Approved ${entityName}`;
      case "reject":
        return `Rejected ${entityName}`;
      case "permission":
        return `Changed ${log.metadata?.changed_role ? `role to ${log.metadata.changed_role}` : "permissions"}`;
      default:
        return log.action;
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Timestamp", "User", "Action", "Entity Type", "Details", "IP Address"],
      ...filteredLogs.map((log) => [
        new Date(log.created_at).toISOString(),
        log.user?.full_name || log.user_id,
        log.action,
        log.entity_type,
        getActionDescription(log),
        log.ip_address || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `access-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueActions = [...new Set(logs.map((l) => l.action))];
  const uniqueEntities = [...new Set(logs.map((l) => l.entity_type))];

  return (
    <div className="bg-[#0f0f14] border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Access Logs</h3>
            <p className="text-xs text-white/50">
              {filteredLogs.length} entries
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters
                ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                : "border-white/10 text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExport}
            className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-white/10 bg-white/5 space-y-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/50"
              />
            </div>

            {/* Action Filter */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-[#1a1a1f] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </option>
              ))}
            </select>

            {/* Entity Filter */}
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="bg-[#1a1a1f] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">All Entities</option>
              {uniqueEntities.map((entity) => (
                <option key={entity} value={entity}>
                  {entity.charAt(0).toUpperCase() + entity.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/40" />
              <span className="text-xs text-white/50">From:</span>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="bg-[#1a1a1f] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">To:</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="bg-[#1a1a1f] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>
            {(searchQuery || selectedAction || selectedEntity || dateRange.start || dateRange.end) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedAction("");
                  setSelectedEntity("");
                  setDateRange({ start: "", end: "" });
                }}
                className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Logs List */}
      <div className={`${compact ? "max-h-96" : ""} overflow-y-auto`}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/40">
            <Clock className="w-8 h-8 mb-2" />
            <p className="text-sm">No logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {paginatedLogs.map((log) => {
              const ActionIcon =
                ACTION_ICONS[log.action] || AlertTriangle;
              const actionColor =
                ACTION_COLORS[log.action] || "text-white/50 bg-white/10";

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${actionColor.split(" ")[1]}`}
                  >
                    <ActionIcon
                      className={`w-5 h-5 ${actionColor.split(" ")[0]}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">
                      {getActionDescription(log)}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.user?.full_name || log.user?.email || "Unknown"}
                      </span>
                      <span>{log.ip_address}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-white/50">
                      {formatTime(log.created_at)}
                    </p>
                    <span className="inline-flex mt-1 px-2 py-0.5 rounded text-xs bg-white/5 text-white/40">
                      {log.entity_type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!compact && totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <p className="text-xs text-white/50">
            Showing {(page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, filteredLogs.length)} of{" "}
            {filteredLogs.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm text-white/70">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f14] border border-white/10 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-medium">Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40">User</label>
                  <p className="text-white">{selectedLog.user?.full_name}</p>
                  <p className="text-xs text-white/50">{selectedLog.user?.email}</p>
                </div>
                <div>
                  <label className="text-xs text-white/40">Timestamp</label>
                  <p className="text-white">
                    {new Date(selectedLog.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-white/40">Action</label>
                  <p className="text-white capitalize">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-xs text-white/40">Entity Type</label>
                  <p className="text-white capitalize">{selectedLog.entity_type}</p>
                </div>
                <div>
                  <label className="text-xs text-white/40">IP Address</label>
                  <p className="text-white font-mono text-sm">
                    {selectedLog.ip_address || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-white/40">Entity ID</label>
                  <p className="text-white font-mono text-sm">
                    {selectedLog.entity_id || "N/A"}
                  </p>
                </div>
              </div>
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="text-xs text-white/40">Metadata</label>
                  <pre className="mt-1 p-3 bg-white/5 rounded-lg text-xs text-white/70 overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.user_agent && (
                <div>
                  <label className="text-xs text-white/40">User Agent</label>
                  <p className="text-xs text-white/50 mt-1 break-all">
                    {selectedLog.user_agent}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
