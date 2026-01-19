"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pagination } from "@/components/ui/pagination";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Search,
  Filter,
  RefreshCw,
  Download,
  LogIn,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileDown,
  User,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronDown,
  Globe,
  Monitor,
  MapPin,
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  adminUser: string;
  adminEmail: string;
  action: "LOGIN" | "LOGOUT" | "CREATE" | "UPDATE" | "DELETE" | "VIEW_PII" | "EXPORT" | "VIEW";
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  location?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  changes?: { field: string; oldValue: string; newValue: string }[];
}

// Generate demo audit logs
const generateDemoLogs = (): AuditLog[] => {
  const admins = [
    { name: "Maria Rodriguez", email: "mrodriguez@cityofdoral.com" },
    { name: "Carlos Martinez", email: "cmartinez@cityofdoral.com" },
    { name: "Jennifer Chen", email: "jchen@cityofdoral.com" },
    { name: "David Thompson", email: "dthompson@cityofdoral.com" },
    { name: "Ana Garcia", email: "agarcia@cityofdoral.com" },
  ];

  const actions: AuditLog["action"][] = ["LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "VIEW_PII", "EXPORT", "VIEW"];

  const resources = [
    { type: "FAQ", id: "faq-001", details: "Updated FAQ about permit applications" },
    { type: "FAQ", id: "faq-002", details: "Created new FAQ for park reservations" },
    { type: "Escalation", id: "esc-123", details: "Resolved escalation from John Smith" },
    { type: "Escalation", id: "esc-124", details: "Updated status to in progress" },
    { type: "User Settings", id: "settings", details: "Modified notification preferences" },
    { type: "Knowledge Base", id: "kb-001", details: "Triggered manual scrape" },
    { type: "Conversation Log", id: "conv-456", details: "Exported conversation history" },
    { type: "Admin User", id: "admin-002", details: "Created new admin account" },
    { type: "System Config", id: "config", details: "Updated chatbot greeting message" },
    { type: "Report", id: "report-001", details: "Generated monthly analytics report" },
  ];

  const ips = [
    { ip: "192.168.1.105", location: "Doral, FL" },
    { ip: "10.0.0.45", location: "Miami, FL" },
    { ip: "172.16.0.12", location: "Doral, FL" },
    { ip: "192.168.2.200", location: "Hialeah, FL" },
    { ip: "10.1.1.88", location: "Miami Beach, FL" },
  ];

  const browsers = ["Chrome 120", "Firefox 121", "Safari 17", "Edge 120"];
  const oses = ["Windows 11", "macOS Sonoma", "Windows 10", "macOS Ventura"];

  const logs: AuditLog[] = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const admin = admins[Math.floor(Math.random() * admins.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const resource = resources[Math.floor(Math.random() * resources.length)];
    const ipInfo = ips[Math.floor(Math.random() * ips.length)];
    const hoursAgo = Math.floor(Math.random() * 168); // Up to 7 days ago

    let details = resource.details;
    let changes: { field: string; oldValue: string; newValue: string }[] | undefined;

    if (action === "LOGIN") {
      details = "Successful admin login";
    } else if (action === "LOGOUT") {
      details = "Admin session ended";
    } else if (action === "UPDATE") {
      changes = [
        { field: "Status", oldValue: "Pending", newValue: "Active" },
        { field: "Priority", oldValue: "Low", newValue: "High" },
      ];
    } else if (action === "DELETE") {
      details = `Deleted ${resource.type.toLowerCase()} record`;
    } else if (action === "VIEW_PII") {
      details = "Accessed user contact information";
    } else if (action === "EXPORT") {
      details = `Exported ${resource.type.toLowerCase()} data to CSV`;
    }

    logs.push({
      id: `log-${String(i + 1).padStart(3, "0")}`,
      timestamp: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString(),
      adminUser: admin.name,
      adminEmail: admin.email,
      action,
      resource: resource.type,
      resourceId: resource.id,
      details,
      ipAddress: ipInfo.ip,
      location: ipInfo.location,
      userAgent: `Mozilla/5.0 (${oses[Math.floor(Math.random() * oses.length)]})`,
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      os: oses[Math.floor(Math.random() * oses.length)],
      changes,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const actionConfig = {
  LOGIN: { icon: LogIn, color: "bg-green-100 text-green-700", label: "Login" },
  LOGOUT: { icon: LogOut, color: "bg-gray-100 text-gray-700", label: "Logout" },
  CREATE: { icon: Plus, color: "bg-blue-100 text-blue-700", label: "Create" },
  UPDATE: { icon: Edit, color: "bg-amber-100 text-amber-700", label: "Update" },
  DELETE: { icon: Trash2, color: "bg-red-100 text-red-700", label: "Delete" },
  VIEW_PII: { icon: Eye, color: "bg-purple-100 text-purple-700", label: "View PII" },
  EXPORT: { icon: FileDown, color: "bg-indigo-100 text-indigo-700", label: "Export" },
  VIEW: { icon: Eye, color: "bg-slate-100 text-slate-700", label: "View" },
};

type SortDirection = "asc" | "desc" | null;
type SortKey = "timestamp" | "adminUser" | "action" | "details" | "ipAddress" | "";

// Helper function to parse and format details
function formatDetails(details: string): { isJson: boolean; items: { key: string; value: string }[] } {
  try {
    const parsed = JSON.parse(details);
    if (typeof parsed === "object" && parsed !== null) {
      const items: { key: string; value: string }[] = [];
      const formatValue = (val: unknown): string => {
        if (typeof val === "object" && val !== null) {
          return JSON.stringify(val, null, 2);
        }
        return String(val);
      };
      Object.entries(parsed).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          // Nested object - flatten it
          Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
            items.push({ key: nestedKey, value: formatValue(nestedValue) });
          });
        } else {
          items.push({ key, value: formatValue(value) });
        }
      });
      return { isJson: true, items };
    }
  } catch {
    // Not JSON, return as plain text
  }
  return { isJson: false, items: [{ key: "Details", value: details }] };
}

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === "asc") return <ArrowUp className="h-3.5 w-3.5 text-[#000080]" />;
  if (direction === "desc") return <ArrowDown className="h-3.5 w-3.5 text-[#000080]" />;
  return <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />;
}

export default function AuditLogsPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("7d");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (searchQuery) params.set("search", searchQuery);
      params.set("days", dateFilter.replace("d", ""));

      const response = await fetch(`/api/audit-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || generateDemoLogs());
      } else {
        // Use demo data if API fails
        setLogs(generateDemoLogs());
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      // Use demo data if API fails
      setLogs(generateDemoLogs());
    } finally {
      setLoading(false);
    }
  }, [actionFilter, dateFilter, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleExport = () => {
    // Export logs as CSV
    const csvContent = [
      ["Timestamp", "Admin", "Action", "Resource", "Details", "IP Address"].join(","),
      ...logs.map((log) =>
        [
          new Date(log.timestamp).toISOString(),
          log.adminUser,
          log.action,
          log.resource,
          `"${log.details.replace(/"/g, '""')}"`,
          log.ipAddress,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey("");
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedLogs = useMemo(() => {
    if (!sortKey || !sortDirection) return logs;

    return [...logs].sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortKey) {
        case "timestamp":
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case "adminUser":
          aValue = a.adminUser.toLowerCase();
          bValue = b.adminUser.toLowerCase();
          break;
        case "action":
          aValue = a.action.toLowerCase();
          bValue = b.action.toLowerCase();
          break;
        case "details":
          aValue = a.details.toLowerCase();
          bValue = b.details.toLowerCase();
          break;
        case "ipAddress":
          aValue = a.ipAddress;
          bValue = b.ipAddress;
          break;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [logs, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedLogs, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, actionFilter, dateFilter]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-[32px] font-bold text-[#000034] tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#000080]" />
            {t("auditLogs.title")}
          </h1>
          <p className="text-[#666666] mt-1 text-[15px]">
            {t("auditLogs.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="h-10 px-4 flex items-center gap-2 bg-white border border-[#E7EBF0] rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            <Download className="h-4 w-4" />
            {t("common.exportCSV")}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchLogs}
            disabled={loading}
            className="h-10 px-4 flex items-center gap-2 bg-[#000080] text-white rounded-lg hover:bg-[#0000a0] transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("common.refresh")}
          </motion.button>
        </div>
      </motion.div>

      {/* Compliance Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">{t("auditLogs.securityCompliance")}</h3>
            <p className="text-sm text-blue-700 mt-1">
              {t("auditLogs.complianceNotice")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-[#E7EBF0] p-4 mb-6 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder={t("auditLogs.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20"
              />
            </div>
          </form>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-10 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] cursor-pointer"
            >
              <option value="all">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="VIEW_PII">View PII</option>
              <option value="EXPORT">Export</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-10 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] cursor-pointer"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 text-[#000080] animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-[#000034] mb-1">{t("auditLogs.noLogs")}</h3>
            <p className="text-[#666666] text-sm">
              {t("auditLogs.noLogsMatch")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-[#E7EBF0]">
                <tr>
                  <th className="w-10 px-4 py-4"></th>
                  <th
                    className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort("timestamp")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Timestamp</span>
                      <SortIcon direction={sortKey === "timestamp" ? sortDirection : null} />
                    </div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort("adminUser")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Admin</span>
                      <SortIcon direction={sortKey === "adminUser" ? sortDirection : null} />
                    </div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort("action")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Action</span>
                      <SortIcon direction={sortKey === "action" ? sortDirection : null} />
                    </div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort("details")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Resource</span>
                      <SortIcon direction={sortKey === "details" ? sortDirection : null} />
                    </div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort("ipAddress")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Location</span>
                      <SortIcon direction={sortKey === "ipAddress" ? sortDirection : null} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EBF0]">
                {paginatedLogs.map((log, index) => {
                  const config = actionConfig[log.action as keyof typeof actionConfig] || actionConfig.VIEW;
                  const ActionIcon = config.icon;
                  const isExpanded = expandedId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${isExpanded ? "bg-blue-50/30" : ""}`}
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      >
                        <td className="px-4 py-4">
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          </motion.div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-[#000034]">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#000080] to-[#1D4F91] rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#000034]">{log.adminUser}</p>
                              <p className="text-xs text-gray-500">{log.adminEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${config.color}`}>
                            <ActionIcon className="h-3 w-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#000034]">{log.resource}</p>
                          {log.resourceId && (
                            <p className="text-xs text-gray-500">ID: {log.resourceId}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-gray-500" />
                            <div>
                              <p className="text-sm text-[#000034]">{log.location || "Unknown"}</p>
                              <p className="text-xs text-gray-500">{log.ipAddress}</p>
                            </div>
                          </div>
                        </td>
                      </motion.tr>

                      {/* Expanded Details Row */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td colSpan={6} className="p-0">
                              <div className="bg-gradient-to-b from-[#F8FAFC] to-white border-t border-[#E7EBF0]">
                                <div className="p-4 md:p-6 max-w-full overflow-hidden">
                                  {/* Responsive Grid Container */}
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                                    {/* Action Details Card */}
                                    <div className="bg-white rounded-lg border border-[#E7EBF0] p-4 shadow-sm overflow-hidden">
                                      <h4 className="text-xs font-semibold text-[#000080] uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#000080]"></div>
                                        Action Details
                                      </h4>
                                      {(() => {
                                        const { isJson, items } = formatDetails(log.details);
                                        return (
                                          <ul className="space-y-2 text-sm text-[#363535]">
                                            {isJson ? (
                                              items.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                  <span className="text-[#000080] mt-1 shrink-0">•</span>
                                                  <span className="break-words min-w-0">
                                                    <strong className="capitalize">{item.key.replace(/([A-Z])/g, ' $1').trim()}:</strong>{' '}
                                                    <span className="text-gray-600">{item.value}</span>
                                                  </span>
                                                </li>
                                              ))
                                            ) : (
                                              <li className="flex items-start gap-2">
                                                <span className="text-[#000080] mt-1 shrink-0">•</span>
                                                <span className="break-words min-w-0">{log.details}</span>
                                              </li>
                                            )}
                                            <li className="flex items-start gap-2">
                                              <span className="text-[#000080] mt-1 shrink-0">•</span>
                                              <span><strong>Resource:</strong> {log.resource}</span>
                                            </li>
                                            {log.resourceId && (
                                              <li className="flex items-start gap-2">
                                                <span className="text-[#000080] mt-1 shrink-0">•</span>
                                                <span><strong>Resource ID:</strong> <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded break-all">{log.resourceId}</code></span>
                                              </li>
                                            )}
                                          </ul>
                                        );
                                      })()}
                                      {log.changes && log.changes.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-[#E7EBF0]">
                                          <p className="text-xs font-medium text-[#666666] mb-2">Changes Made:</p>
                                          <ul className="space-y-1.5">
                                            {log.changes.map((change, idx) => (
                                              <li key={idx} className="text-xs bg-gray-50 rounded p-2">
                                                <span className="font-medium text-[#000034]">{change.field}:</span>
                                                <div className="flex flex-wrap items-center gap-1 mt-1">
                                                  <span className="text-red-600 line-through break-all">{change.oldValue}</span>
                                                  <span className="text-gray-500">→</span>
                                                  <span className="text-green-700 break-all">{change.newValue}</span>
                                                </div>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>

                                    {/* Device Info Card */}
                                    <div className="bg-white rounded-lg border border-[#E7EBF0] p-4 shadow-sm">
                                      <h4 className="text-xs font-semibold text-[#000080] uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#000080]"></div>
                                        Device Information
                                      </h4>
                                      <ul className="space-y-2 text-sm text-[#363535]">
                                        <li className="flex items-start gap-2">
                                          <Globe className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                                          <span className="break-words"><strong>Browser:</strong> {log.browser || "Unknown"}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <Monitor className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                                          <span className="break-words"><strong>OS:</strong> {log.os || "Unknown"}</span>
                                        </li>
                                        {log.userAgent && (
                                          <li className="flex items-start gap-2">
                                            <span className="text-[#000080] mt-1">•</span>
                                            <span className="break-all text-xs text-gray-500">{log.userAgent}</span>
                                          </li>
                                        )}
                                      </ul>
                                    </div>

                                    {/* Network Info Card */}
                                    <div className="bg-white rounded-lg border border-[#E7EBF0] p-4 shadow-sm">
                                      <h4 className="text-xs font-semibold text-[#000080] uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#000080]"></div>
                                        Network Information
                                      </h4>
                                      <ul className="space-y-2 text-sm text-[#363535]">
                                        <li className="flex items-start gap-2">
                                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                                          <span><strong>Location:</strong> {log.location || "Unknown"}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <span className="text-[#000080] mt-1">•</span>
                                          <span><strong>IP Address:</strong> <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{log.ipAddress}</code></span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <span className="text-[#000080] mt-1">•</span>
                                          <span><strong>Time:</strong> {new Date(log.timestamp).toLocaleString()}</span>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>

                                  {/* Log ID Footer */}
                                  <div className="mt-4 pt-3 border-t border-[#E7EBF0] flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs text-gray-500">
                                      <strong>Log ID:</strong> <code className="bg-gray-100 px-1.5 py-0.5 rounded">{log.id}</code>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      <strong>Admin:</strong> {log.adminUser} ({log.adminEmail})
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && sortedLogs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedLogs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </motion.div>
    </div>
  );
}
