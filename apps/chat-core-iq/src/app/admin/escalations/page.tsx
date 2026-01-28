"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Pagination } from "@/components/ui/pagination";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { apiUrl } from "@/lib/utils";
import {
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  User,
  MoreHorizontal,
  ArrowUpRight,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Escalation {
  id: string;
  sessionId: string;
  userName: string;
  contactMethod: "phone" | "email";
  contactValue: string;
  reason: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  requestedAt: string;
  resolvedAt?: string;
  notes?: string;
  assignedTo?: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: ArrowUpRight,
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle,
  },
  closed: {
    label: "Closed",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: XCircle,
  },
};

// Highlight matching text component
function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) {
    return <>{text}</>;
  }
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-[#000034] rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

type SortDirection = "asc" | "desc" | null;
type SortKey = "userName" | "contactMethod" | "reason" | "requestedAt" | "status" | "";

export default function EscalationsPage() {
  const { t } = useLanguage();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { confirm, DialogComponent } = useConfirmDialog();
  const [sortKey, setSortKey] = useState<SortKey>("requestedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") { setSortKey(""); setSortDirection(null); }
      else setSortDirection("asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />;
    if (sortDirection === "asc") return <ArrowUp className="h-3.5 w-3.5 text-[#000080]" />;
    if (sortDirection === "desc") return <ArrowDown className="h-3.5 w-3.5 text-[#000080]" />;
    return <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />;
  };

  const sortedEscalations = useMemo(() => {
    if (!sortKey || !sortDirection) return escalations;

    return [...escalations].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortKey) {
        case "userName":
          aVal = a.userName.toLowerCase();
          bVal = b.userName.toLowerCase();
          break;
        case "contactMethod":
          aVal = a.contactMethod;
          bVal = b.contactMethod;
          break;
        case "reason":
          aVal = a.reason.toLowerCase();
          bVal = b.reason.toLowerCase();
          break;
        case "requestedAt":
          aVal = new Date(a.requestedAt).getTime();
          bVal = new Date(b.requestedAt).getTime();
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [escalations, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedEscalations.length / itemsPerPage);
  const paginatedEscalations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedEscalations.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedEscalations, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  const fetchEscalations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(apiUrl(`/api/escalations?${params}`));
      if (response.ok) {
        const data = await response.json();
        setEscalations(data.escalations || []);
      }
    } catch (error) {
      console.error("Failed to fetch escalations:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchEscalations();
  }, [fetchEscalations]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEscalations();
  };

  const updateStatus = async (id: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(apiUrl(`/api/escalations/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      if (response.ok) {
        fetchEscalations();
        setShowUpdateModal(false);
        setSelectedEscalation(null);
        toast.success("Escalation status updated successfully");
      } else {
        toast.error("Failed to update escalation status");
      }
    } catch (error) {
      console.error("Failed to update escalation:", error);
      toast.error("An error occurred while updating the escalation");
    }
  };

  const handleDelete = (escalation: Escalation) => {
    confirm({
      title: "Delete Escalation",
      description: `Are you sure you want to delete the escalation from "${escalation.userName}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          const response = await fetch(apiUrl(`/api/escalations/${escalation.id}`), {
            method: "DELETE",
          });
          if (response.ok) {
            fetchEscalations();
            toast.success("Escalation deleted successfully");
          } else {
            toast.error("Failed to delete escalation");
          }
        } catch (error) {
          console.error("Failed to delete escalation:", error);
          toast.error("An error occurred while deleting the escalation");
        }
      },
    });
  };

  const pendingCount = escalations.filter((e) => e.status === "pending").length;
  const inProgressCount = escalations.filter((e) => e.status === "in_progress").length;

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {DialogComponent}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-[32px] font-bold text-[#000034] tracking-tight flex items-center gap-3">
            {t("escalations.title")}
            {pendingCount > 0 && (
              <span className="px-3 py-1 text-sm font-semibold bg-amber-100 text-amber-700 rounded-full">
                {pendingCount} {t("escalations.pending")}
              </span>
            )}
          </h1>
          <p className="text-[#666666] mt-1 text-[15px]">
            {t("escalations.subtitle")}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchEscalations}
          disabled={loading}
          className="h-10 px-4 flex items-center gap-2 bg-white border border-[#E7EBF0] rounded-lg hover:bg-gray-50 transition-all shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {t("common.refresh")}
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Escalations"
          value={escalations.length}
          icon={AlertTriangle}
          color="blue"
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          icon={ArrowUpRight}
          color="indigo"
        />
        <StatCard
          label="Resolved Today"
          value={escalations.filter((e) =>
            e.status === "resolved" &&
            new Date(e.resolvedAt || "").toDateString() === new Date().toDateString()
          ).length}
          icon={CheckCircle}
          color="green"
        />
      </div>

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
                placeholder="Search by name, contact, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20"
              />
            </div>
          </form>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Escalations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-[#E7EBF0]">
                <tr>
                  <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">User</th>
                  <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">Contact</th>
                  <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">Reason</th>
                  <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">Requested</th>
                  <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-right text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EBF0]">
                {[...Array(4)].map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1 bg-gray-200" />
                          <Skeleton className="h-3 w-20 bg-gray-100" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 bg-gray-200" />
                        <Skeleton className="h-4 w-32 bg-gray-200" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-48 bg-gray-200" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20 mb-1 bg-gray-200" />
                      <Skeleton className="h-3 w-16 bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-24 rounded-full bg-gray-200" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg bg-gray-200" />
                        <Skeleton className="h-8 w-8 rounded-lg bg-gray-200" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : escalations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-700" />
            </div>
            <h3 className="text-lg font-semibold text-[#000034] mb-1">{t("escalations.noEscalations")}</h3>
            <p className="text-[#666666] text-sm">
              {statusFilter !== "all" ? "No escalations match your filter" : t("escalations.allClear")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-[#E7EBF0]">
                <tr>
                  <th
                    className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("userName")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>User</span>
                      <SortIcon columnKey="userName" />
                    </div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("contactMethod")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Contact</span>
                      <SortIcon columnKey="contactMethod" />
                    </div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("reason")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Reason</span>
                      <SortIcon columnKey="reason" />
                    </div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("requestedAt")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Requested</span>
                      <SortIcon columnKey="requestedAt" />
                    </div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      <SortIcon columnKey="status" />
                    </div>
                  </th>
                  <th className="text-right text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EBF0]">
                {paginatedEscalations.map((escalation, index) => {
                  const status = statusConfig[escalation.status];
                  const StatusIcon = status.icon;
                  return (
                    <motion.tr
                      key={escalation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#000080] to-[#1D4F91] rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-[#000034]">
                              <HighlightText text={escalation.userName} highlight={searchQuery} />
                            </p>
                            <p className="text-xs text-gray-500">Session: {escalation.sessionId.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {escalation.contactMethod === "phone" ? (
                            <Phone className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Mail className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="text-sm text-[#363535]">
                            <HighlightText text={escalation.contactValue} highlight={searchQuery} />
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#363535] max-w-xs truncate" title={escalation.reason}>
                          <HighlightText text={escalation.reason} highlight={searchQuery} />
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#666666]">
                          {new Date(escalation.requestedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(escalation.requestedAt).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedEscalation(escalation);
                              setShowUpdateModal(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Update Status"
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(escalation)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Escalation"
                          >
                            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && sortedEscalations.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedEscalations.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </motion.div>

      {/* Update Status Modal */}
      <AnimatePresence>
        {showUpdateModal && selectedEscalation && (
          <UpdateStatusModal
            escalation={selectedEscalation}
            onClose={() => {
              setShowUpdateModal(false);
              setSelectedEscalation(null);
            }}
            onUpdate={updateStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "amber" | "indigo" | "green";
}) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    amber: "from-amber-500 to-amber-600",
    indigo: "from-indigo-500 to-indigo-600",
    green: "from-green-500 to-green-600",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-[#E7EBF0] p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color]} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#000034]">{value}</p>
          <p className="text-xs text-[#666666]">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function UpdateStatusModal({
  escalation,
  onClose,
  onUpdate,
}: {
  escalation: Escalation;
  onClose: () => void;
  onUpdate: (id: string, status: string, notes?: string) => void;
}) {
  const [newStatus, setNewStatus] = useState(escalation.status);
  const [notes, setNotes] = useState(escalation.notes || "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#E7EBF0]">
          <h3 className="text-lg font-semibold text-[#000034]">Update Escalation</h3>
          <p className="text-sm text-[#666666] mt-1">Change status or add notes</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#363535] mb-2">User</label>
            <p className="text-sm text-[#666666]">{escalation.userName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#363535] mb-2">Reason</label>
            <p className="text-sm text-[#666666]">{escalation.reason}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#363535] mb-2">Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as Escalation["status"])}
              className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#363535] mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add resolution notes..."
              className="w-full h-24 px-3 py-2 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] resize-none"
            />
          </div>
        </div>
        <div className="p-6 border-t border-[#E7EBF0] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#666666] hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onUpdate(escalation.id, newStatus, notes)}
            className="px-4 py-2 text-sm font-medium text-white bg-[#000080] hover:bg-[#0000a0] rounded-lg transition-colors"
          >
            Update
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
