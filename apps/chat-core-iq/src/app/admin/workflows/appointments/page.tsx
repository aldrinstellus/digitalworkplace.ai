"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { apiUrl } from "@/lib/utils";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Building2,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeSlot {
  start: string;
  end: string;
}

interface AppointmentConfig {
  id: string;
  department: string;
  serviceName: string;
  description: string;
  duration: number;
  availableDays: string[];
  timeSlots: TimeSlot[];
  maxPerSlot: number;
  leadTimeHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  id: string;
  configId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string;
  timeSlot: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  reason: string;
  notes: string;
  createdAt: string;
}

const statusConfig = {
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-700 border-gray-200", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  "no-show": { label: "No Show", color: "bg-amber-100 text-amber-700 border-amber-200", icon: XCircle },
};

const dayLabels: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

type TabType = "services" | "appointments";

export default function AppointmentsPage() {
  useLanguage(); // Context hook
  const { confirm, DialogComponent } = useConfirmDialog();

  const [activeTab, setActiveTab] = useState<TabType>("services");
  const [configs, setConfigs] = useState<AppointmentConfig[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AppointmentConfig | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchConfigs = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/appointments/config"));
      if (res.ok) {
        const data = await res.json();
        setConfigs(data);
      }
    } catch {
      console.error("Failed to fetch configs");
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/appointments"));
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch {
      console.error("Failed to fetch appointments");
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchConfigs(), fetchAppointments()]);
    setLoading(false);
  }, [fetchConfigs, fetchAppointments]);

  // Initial data fetch
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchConfigs(), fetchAppointments()]);
      if (mounted) setLoading(false);
    };
    loadData();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter and paginate appointments
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.userName.toLowerCase().includes(query) ||
          a.userEmail.toLowerCase().includes(query) ||
          a.reason.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    return filtered;
  }, [appointments, searchQuery, statusFilter]);

  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(start, start + itemsPerPage);
  }, [filteredAppointments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // Reset page when filters change - intentional synchronous setState
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const toggleConfigStatus = async (config: AppointmentConfig) => {
    try {
      const res = await fetch(apiUrl("/api/appointments/config"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: config.id, isActive: !config.isActive }),
      });
      if (res.ok) {
        fetchConfigs();
        toast.success(`Service ${config.isActive ? "deactivated" : "activated"}`);
      }
    } catch {
      toast.error("Failed to update service status");
    }
  };

  const deleteConfig = (config: AppointmentConfig) => {
    confirm({
      title: "Delete Appointment Service",
      description: `Are you sure you want to delete "${config.serviceName}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/appointments/config?id=${config.id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            fetchConfigs();
            toast.success("Service deleted successfully");
          }
        } catch {
          toast.error("Failed to delete service");
        }
      },
    });
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(apiUrl("/api/appointments"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchAppointments();
        toast.success("Appointment status updated");
      }
    } catch {
      toast.error("Failed to update appointment");
    }
  };

  const getConfigName = (configId: string): string => {
    const config = configs.find((c) => c.id === configId);
    return config ? `${config.department} - ${config.serviceName}` : "Unknown Service";
  };

  // Stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr && a.status !== "cancelled").length;
  const upcomingAppointments = appointments.filter((a) => new Date(a.date) >= new Date() && a.status !== "cancelled").length;
  const activeServices = configs.filter((c) => c.isActive).length;

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
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            Appointment Scheduling
          </h1>
          <p className="text-[#666666] mt-1 text-[15px]">
            Configure appointment services and manage bookings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={loading}
            className="h-10 px-4 flex items-center gap-2 bg-white border border-[#E7EBF0] rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
          {activeTab === "services" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingConfig(null);
                setShowConfigModal(true);
              }}
              className="h-10 px-4 flex items-center gap-2 bg-[#000080] text-white rounded-lg hover:bg-[#0000a0] transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Service
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Services" value={activeServices} total={configs.length} icon={Settings} color="blue" />
        <StatCard label="Today's Appointments" value={todayAppointments} icon={CalendarDays} color="amber" />
        <StatCard label="Upcoming" value={upcomingAppointments} icon={Clock} color="indigo" />
        <StatCard label="Departments" value={[...new Set(configs.map((c) => c.department))].length} icon={Building2} color="emerald" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <TabButton active={activeTab === "services"} onClick={() => setActiveTab("services")} icon={Settings} label="Services" />
        <TabButton active={activeTab === "appointments"} onClick={() => setActiveTab("appointments")} icon={Users} label="Appointments" count={upcomingAppointments} />
      </div>

      {/* Content */}
      {activeTab === "services" ? (
        <ServicesTab
          configs={configs}
          loading={loading}
          onEdit={(config) => {
            setEditingConfig(config);
            setShowConfigModal(true);
          }}
          onDelete={deleteConfig}
          onToggle={toggleConfigStatus}
        />
      ) : (
        <AppointmentsTab
          appointments={paginatedAppointments}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onStatusChange={updateAppointmentStatus}
          getConfigName={getConfigName}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAppointments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Config Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <ConfigModal
            config={editingConfig}
            onClose={() => {
              setShowConfigModal(false);
              setEditingConfig(null);
            }}
            onSave={async (data) => {
              try {
                const method = editingConfig ? "PUT" : "POST";
                const body = editingConfig ? { ...data, id: editingConfig.id } : data;
                const res = await fetch(apiUrl("/api/appointments/config"), {
                  method,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });
                if (res.ok) {
                  fetchConfigs();
                  setShowConfigModal(false);
                  setEditingConfig(null);
                  toast.success(editingConfig ? "Service updated" : "Service created");
                }
              } catch {
                toast.error("Failed to save service");
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, total, icon: Icon, color }: {
  label: string;
  value: number;
  total?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "amber" | "indigo" | "emerald";
}) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    amber: "from-amber-500 to-amber-600",
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
  };

  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl border border-[#E7EBF0] p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color]} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#000034]">
            {value}
            {total !== undefined && <span className="text-sm font-normal text-[#666666]">/{total}</span>}
          </p>
          <p className="text-xs text-[#666666]">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, count }: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
        active
          ? "bg-[#000080] text-white shadow-md"
          : "bg-white text-[#666666] border border-[#E7EBF0] hover:bg-gray-50"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {count !== undefined && count > 0 && (
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          active ? "bg-white/20" : "bg-[#000080]/10 text-[#000080]"
        }`}>
          {count}
        </span>
      )}
    </motion.button>
  );
}

function ServicesTab({ configs, loading, onEdit, onDelete, onToggle }: {
  configs: AppointmentConfig[];
  loading: boolean;
  onEdit: (config: AppointmentConfig) => void;
  onDelete: (config: AppointmentConfig) => void;
  onToggle: (config: AppointmentConfig) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E7EBF0] p-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E7EBF0] p-12 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-[#000034] mb-2">No Appointment Services</h3>
        <p className="text-[#666666] text-sm">Create your first appointment service to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {configs.map((config) => (
        <motion.div
          key={config.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-xl border border-[#E7EBF0] p-6 shadow-sm ${
            !config.isActive ? "opacity-60" : ""
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[#000034]">{config.serviceName}</h3>
                {!config.isActive && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">Inactive</span>
                )}
              </div>
              <p className="text-sm text-[#666666] flex items-center gap-1 mt-1">
                <Building2 className="h-3.5 w-3.5" />
                {config.department}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onToggle(config)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={config.isActive ? "Deactivate" : "Activate"}
              >
                {config.isActive ? (
                  <ToggleRight className="h-5 w-5 text-green-700" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-gray-500" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(config)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit2 className="h-4 w-4 text-gray-500" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(config)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
              </motion.button>
            </div>
          </div>

          {config.description && (
            <p className="text-sm text-[#666666] mb-4">{config.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#666666] mb-1">Duration</p>
              <p className="font-medium text-[#000034]">{config.duration} minutes</p>
            </div>
            <div>
              <p className="text-[#666666] mb-1">Max per Slot</p>
              <p className="font-medium text-[#000034]">{config.maxPerSlot} appointments</p>
            </div>
            <div>
              <p className="text-[#666666] mb-1">Lead Time</p>
              <p className="font-medium text-[#000034]">{config.leadTimeHours} hours</p>
            </div>
            <div>
              <p className="text-[#666666] mb-1">Available Days</p>
              <div className="flex gap-1 flex-wrap">
                {config.availableDays.map((day) => (
                  <span key={day} className="px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
                    {dayLabels[day]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E7EBF0]">
            <p className="text-[#666666] text-xs mb-2">Time Slots</p>
            <div className="flex gap-2 flex-wrap">
              {config.timeSlots.map((slot, i) => (
                <span key={i} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg">
                  {slot.start} - {slot.end}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AppointmentsTab({
  appointments,
  loading,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onStatusChange,
  getConfigName,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: {
  appointments: Appointment[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  onStatusChange: (id: string, status: string) => void;
  getConfigName: (configId: string) => string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-[#E7EBF0]">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-[#000034] mb-2">No Appointments Found</h3>
          <p className="text-[#666666] text-sm">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "No appointments have been booked yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-[#E7EBF0]">
                <tr>
                  <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">Client</th>
                  <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">Service</th>
                  <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">Date & Time</th>
                  <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-right text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EBF0]">
                {appointments.map((apt) => {
                  const status = statusConfig[apt.status];
                  const StatusIcon = status.icon;
                  return (
                    <motion.tr
                      key={apt.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#000080] to-[#1D4F91] rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-[#000034]">{apt.userName}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {apt.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#000034]">{getConfigName(apt.configId)}</p>
                        {apt.reason && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]" title={apt.reason}>
                            {apt.reason}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[#000034]">
                          {new Date(apt.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-gray-500">{apt.timeSlot}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={apt.status}
                            onChange={(e) => onStatusChange(apt.id, e.target.value)}
                            className="text-xs px-2 py-1 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no-show">No Show</option>
                          </select>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </>
      )}
    </div>
  );
}

function ConfigModal({
  config,
  onClose,
  onSave,
}: {
  config: AppointmentConfig | null;
  onClose: () => void;
  onSave: (data: Partial<AppointmentConfig>) => void;
}) {
  const [formData, setFormData] = useState({
    department: config?.department || "",
    serviceName: config?.serviceName || "",
    description: config?.description || "",
    duration: config?.duration || 30,
    availableDays: config?.availableDays || ["monday", "tuesday", "wednesday", "thursday", "friday"],
    timeSlots: config?.timeSlots || [{ start: "09:00", end: "17:00" }],
    maxPerSlot: config?.maxPerSlot || 1,
    leadTimeHours: config?.leadTimeHours || 24,
  });

  const allDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const addTimeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { start: "09:00", end: "17:00" }],
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index),
    }));
  };

  const updateTimeSlot = (index: number, field: "start" | "end", value: string) => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

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
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#E7EBF0] sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#000034]">
              {config ? "Edit Service" : "Add New Service"}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#363535] mb-2">Department *</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g., Building & Permits"
              className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#363535] mb-2">Service Name *</label>
            <input
              type="text"
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              placeholder="e.g., Permit Consultation"
              className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#363535] mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the service..."
              className="w-full h-20 px-3 py-2 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#363535] mb-2">Duration (min) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                min={15}
                step={15}
                className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#363535] mb-2">Max per Slot</label>
              <input
                type="number"
                value={formData.maxPerSlot}
                onChange={(e) => setFormData({ ...formData, maxPerSlot: parseInt(e.target.value) || 1 })}
                min={1}
                className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#363535] mb-2">Lead Time (hrs)</label>
              <input
                type="number"
                value={formData.leadTimeHours}
                onChange={(e) => setFormData({ ...formData, leadTimeHours: parseInt(e.target.value) || 24 })}
                min={1}
                className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#363535] mb-2">Available Days *</label>
            <div className="flex flex-wrap gap-2">
              {allDays.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    formData.availableDays.includes(day)
                      ? "bg-[#000080] text-white border-[#000080]"
                      : "bg-white text-gray-600 border-[#E7EBF0] hover:border-[#000080]"
                  }`}
                >
                  {dayLabels[day]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#363535]">Time Slots *</label>
              <button
                type="button"
                onClick={addTimeSlot}
                className="text-xs text-[#000080] hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Slot
              </button>
            </div>
            <div className="space-y-2">
              {formData.timeSlots.map((slot, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateTimeSlot(index, "start", e.target.value)}
                    className="flex-1 h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateTimeSlot(index, "end", e.target.value)}
                    className="flex-1 h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
                  />
                  {formData.timeSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#E7EBF0] flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#666666] hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSave(formData)}
            disabled={!formData.department || !formData.serviceName || formData.availableDays.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-[#000080] hover:bg-[#0000a0] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {config ? "Update Service" : "Create Service"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
