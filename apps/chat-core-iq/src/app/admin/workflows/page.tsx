"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Workflow,
  Calendar,
  GitBranch,
  MessageSquareText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
  Settings,
  BarChart3,
  Building2,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  Zap,
  FileText,
  Bell,
  Users,
  Mail,
  Phone,
  Globe,
  Shield,
  Briefcase,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { apiUrl } from "@/lib/utils";

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, LucideIcon> = {
  Calendar,
  GitBranch,
  MessageSquareText,
  Workflow,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Settings,
  BarChart3,
  Building2,
  Zap,
  FileText,
  Bell,
  Users,
  Mail,
  Phone,
  Globe,
  Shield,
  Briefcase,
  HelpCircle,
};

interface WorkflowType {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  handlerType: string;
  isActive: boolean;
  isSystem: boolean;
  order: number;
}

interface AppointmentConfig {
  id: string;
  department: string;
  serviceName: string;
  isActive: boolean;
}

interface RoutingRule {
  id: string;
  name: string;
  category: string;
  targetDepartment: string;
  isActive: boolean;
}

interface Appointment {
  id: string;
  status: string;
  date: string;
}

interface FAQ {
  id: string;
  workflowAction?: {
    type: string;
    buttonLabel: string;
    configId?: string;
    externalUrl?: string;
  };
}

interface WorkflowStats {
  totalAppointmentTypes: number;
  activeAppointmentTypes: number;
  totalRoutingRules: number;
  activeRoutingRules: number;
  upcomingAppointments: number;
  todayAppointments: number;
  faqsWithActions: number;
}

// Color options for workflow types
const colorOptions = [
  { value: "from-blue-500 to-indigo-600", label: "Blue" },
  { value: "from-emerald-500 to-teal-600", label: "Green" },
  { value: "from-purple-500 to-violet-600", label: "Purple" },
  { value: "from-amber-500 to-orange-600", label: "Orange" },
  { value: "from-rose-500 to-pink-600", label: "Pink" },
  { value: "from-cyan-500 to-blue-600", label: "Cyan" },
  { value: "from-gray-500 to-gray-600", label: "Gray" },
];

// Icon options for workflow types
const iconOptions = [
  "Calendar", "GitBranch", "MessageSquareText", "Workflow", "Clock",
  "FileText", "Bell", "Users", "Mail", "Phone", "Globe", "Shield",
  "Briefcase", "HelpCircle", "Zap", "Building2", "Settings", "BarChart3",
];

export default function WorkflowsPage() {
  const [workflowTypes, setWorkflowTypes] = useState<WorkflowType[]>([]);
  const [stats, setStats] = useState<WorkflowStats>({
    totalAppointmentTypes: 0,
    activeAppointmentTypes: 0,
    totalRoutingRules: 0,
    activeRoutingRules: 0,
    upcomingAppointments: 0,
    todayAppointments: 0,
    faqsWithActions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<WorkflowType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "Workflow",
    color: "from-gray-500 to-gray-600",
  });
  const [saving, setSaving] = useState(false);

  const fetchWorkflowTypes = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/workflows/types"));
      if (res.ok) {
        const types = await res.json();
        setWorkflowTypes(types);
      }
    } catch (error) {
      console.error("Failed to fetch workflow types:", error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch appointment configs
      const appointmentConfigRes = await fetch(apiUrl("/api/appointments/config"));
      const appointmentConfigs: AppointmentConfig[] = appointmentConfigRes.ok
        ? await appointmentConfigRes.json()
        : [];

      // Fetch routing rules
      const routingRes = await fetch(apiUrl("/api/workflows/routing"));
      const routingRules: RoutingRule[] = routingRes.ok
        ? await routingRes.json()
        : [];

      // Fetch appointments
      const appointmentsRes = await fetch(apiUrl("/api/appointments"));
      const appointments: Appointment[] = appointmentsRes.ok
        ? (await appointmentsRes.json()).appointments || []
        : [];

      // Fetch FAQs to count those with workflow actions
      const faqsRes = await fetch(apiUrl("/api/faqs"));
      const faqsData = faqsRes.ok ? await faqsRes.json() : { faqs: [] };
      const faqs: FAQ[] = faqsData.faqs || [];
      const faqsWithActionsCount = faqs.filter((f) => f.workflowAction).length;

      // Calculate stats
      const today = new Date().toISOString().split("T")[0];
      const todayAppointments = appointments.filter(
        (a) => a.date === today && a.status !== "cancelled"
      ).length;

      const upcomingAppointments = appointments.filter(
        (a) => new Date(a.date) >= new Date() && a.status !== "cancelled"
      ).length;

      // Get unique departments
      const uniqueDepts = [...new Set(routingRules.map((r) => r.targetDepartment))];
      setDepartments(uniqueDepts);

      setStats({
        totalAppointmentTypes: appointmentConfigs.length,
        activeAppointmentTypes: appointmentConfigs.filter((c) => c.isActive).length,
        totalRoutingRules: routingRules.length,
        activeRoutingRules: routingRules.filter((r) => r.isActive).length,
        upcomingAppointments,
        todayAppointments,
        faqsWithActions: faqsWithActionsCount,
      });
    } catch (error) {
      console.error("Failed to fetch workflow stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflowTypes();
    fetchStats();
  }, [fetchWorkflowTypes, fetchStats]);

  const getStatValue = (slug: string, statKey: string): number | string => {
    if (slug === "appointments") {
      if (statKey === "active") return stats.activeAppointmentTypes;
      if (statKey === "today") return stats.todayAppointments;
    }
    if (slug === "service-requests") {
      if (statKey === "active") return stats.activeRoutingRules;
      if (statKey === "departments") return departments.length;
    }
    if (slug === "faq-actions") {
      if (statKey === "configured") return stats.faqsWithActions;
      if (statKey === "types") return 3;
    }
    return 0;
  };

  const getStatsForType = (type: WorkflowType) => {
    if (type.slug === "appointments") {
      return [
        { label: "Active Services", value: getStatValue(type.slug, "active") },
        { label: "Today's Appointments", value: getStatValue(type.slug, "today") },
      ];
    }
    if (type.slug === "service-requests") {
      return [
        { label: "Active Rules", value: getStatValue(type.slug, "active") },
        { label: "Departments", value: getStatValue(type.slug, "departments") },
      ];
    }
    if (type.slug === "faq-actions") {
      return [
        { label: "FAQs with Actions", value: getStatValue(type.slug, "configured") },
        { label: "Action Types", value: getStatValue(type.slug, "types") },
      ];
    }
    // Default stats for custom types
    return [
      { label: "Status", value: type.isActive ? "Active" : "Inactive" },
      { label: "Type", value: type.handlerType },
    ];
  };

  const openCreateModal = () => {
    setEditingType(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "Workflow",
      color: "from-gray-500 to-gray-600",
    });
    setShowModal(true);
  };

  const openEditModal = (type: WorkflowType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      slug: type.slug,
      description: type.description,
      icon: type.icon,
      color: type.color,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    setSaving(true);
    try {
      const url = "/api/workflows/types";
      const method = editingType ? "PUT" : "POST";
      const body = editingType
        ? { id: editingType.id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      toast.success(editingType ? "Workflow type updated" : "Workflow type created");
      setShowModal(false);
      fetchWorkflowTypes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save workflow type");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: WorkflowType) => {
    if (type.isSystem) {
      toast.error("System workflow types cannot be deleted");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${type.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/workflows/types?id=${type.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("Workflow type deleted");
      fetchWorkflowTypes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete workflow type");
    }
  };

  const handleToggleActive = async (type: WorkflowType) => {
    try {
      const res = await fetch(apiUrl("/api/workflows/types"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: type.id,
          isActive: !type.isActive,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }

      toast.success(`Workflow ${type.isActive ? "disabled" : "enabled"}`);
      fetchWorkflowTypes();
    } catch {
      toast.error("Failed to update workflow status");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

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
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#000080] to-[#1D4F91]">
              <Workflow className="h-6 w-6 text-white" />
            </div>
            Customizable Workflows
          </h1>
          <p className="text-[#666666] mt-1 text-[15px]">
            Configure and manage workflow types, appointment scheduling, service request routing, and FAQ actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchStats}
            disabled={loading}
            className="h-10 px-4 flex items-center gap-2 bg-white border border-[#E7EBF0] rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateModal}
            className="h-10 px-4 flex items-center gap-2 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white rounded-lg hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Workflow Type
          </motion.button>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Workflow Types"
          value={workflowTypes.filter((t) => t.isActive).length}
          total={workflowTypes.length}
          icon={Workflow}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Appointment Services"
          value={stats.activeAppointmentTypes}
          total={stats.totalAppointmentTypes}
          icon={Calendar}
          color="emerald"
          loading={loading}
        />
        <StatCard
          label="Upcoming Appointments"
          value={stats.upcomingAppointments}
          icon={Clock}
          color="amber"
          loading={loading}
        />
        <StatCard
          label="Departments"
          value={departments.length}
          icon={Building2}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {workflowTypes.map((type, index) => {
          const IconComponent = iconMap[type.icon] || Workflow;
          const typeStats = getStatsForType(type);

          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              {/* Action Buttons - Overlay */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleToggleActive(type)}
                  className="p-1.5 rounded-lg bg-white/90 hover:bg-white shadow-sm transition-all"
                  title={type.isActive ? "Disable" : "Enable"}
                >
                  {type.isActive ? (
                    <Eye className="h-4 w-4 text-green-700" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {!type.isSystem && (
                  <>
                    <button
                      onClick={() => openEditModal(type)}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white shadow-sm transition-all"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(type)}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white shadow-sm transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </>
                )}
              </div>

              <Link href={`/admin/workflows/${type.slug}`}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={`bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden h-full hover:shadow-lg transition-all cursor-pointer ${
                    !type.isActive ? "opacity-60" : ""
                  }`}
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${type.color} p-6`}>
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        {type.isSystem && (
                          <span className="px-2 py-0.5 bg-white/20 rounded text-xs text-white font-medium">
                            System
                          </span>
                        )}
                        <ArrowRight className="h-5 w-5 text-white/70" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-4">{type.name}</h3>
                    <p className="text-white/80 text-sm mt-1">{type.description}</p>
                  </div>

                  {/* Card Stats */}
                  <div className="p-4 bg-gray-50/50">
                    <div className="grid grid-cols-2 gap-4">
                      {typeStats.map((stat) => (
                        <div key={stat.label}>
                          <p className="text-2xl font-bold text-[#000034]">
                            {loading ? "-" : stat.value}
                          </p>
                          <p className="text-xs text-[#666666]">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}

        {/* Add New Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: workflowTypes.length * 0.1 }}
        >
          <motion.button
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={openCreateModal}
            className="w-full h-full min-h-[240px] bg-white rounded-xl border-2 border-dashed border-[#E7EBF0] hover:border-[#000080] hover:bg-[#000080]/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-4 rounded-xl bg-[#000080]/10 group-hover:bg-[#000080]/20 transition-colors">
              <Plus className="h-8 w-8 text-[#000080]" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-[#000034]">Create New Workflow Type</p>
              <p className="text-sm text-[#666666] mt-1">Add a custom workflow</p>
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-[#000034] mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#000080]" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Add Appointment Type"
            description="Create a new appointment service"
            href="/admin/workflows/appointments?action=new"
            icon={Plus}
          />
          <QuickActionCard
            title="Add Routing Rule"
            description="Set up new service request routing"
            href="/admin/workflows/service-requests?action=new"
            icon={Plus}
          />
          <QuickActionCard
            title="View Today's Schedule"
            description={`${stats.todayAppointments} appointments today`}
            href="/admin/workflows/appointments?view=today"
            icon={Calendar}
          />
          <QuickActionCard
            title="Manage Categories"
            description="Edit workflow categories"
            href="/admin/workflows/categories"
            icon={Settings}
          />
        </div>
      </motion.div>

      {/* Workflow Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 bg-white rounded-xl border border-[#E7EBF0] shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-[#000034] mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#000080]" />
          Workflow Status
        </h2>
        <div className="space-y-3">
          <StatusItem
            title="Appointment Scheduling"
            status={stats.activeAppointmentTypes > 0 ? "active" : "inactive"}
            detail={`${stats.activeAppointmentTypes} active services configured`}
          />
          <StatusItem
            title="Service Request Routing"
            status={stats.activeRoutingRules > 0 ? "active" : "inactive"}
            detail={`${stats.activeRoutingRules} active routing rules`}
          />
          <StatusItem
            title="FAQ Workflow Actions"
            status={stats.faqsWithActions > 0 ? "active" : "pending"}
            detail={
              stats.faqsWithActions > 0
                ? `${stats.faqsWithActions} FAQ${stats.faqsWithActions > 1 ? "s" : ""} with actions configured`
                : "Configure FAQ action buttons"
            }
          />
        </div>
      </motion.div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#000034]">
                    {editingType ? "Edit Workflow Type" : "Create Workflow Type"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-[#000034] mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: editingType?.isSystem ? formData.slug : generateSlug(e.target.value),
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-transparent"
                    placeholder="e.g., Document Processing"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-[#000034] mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    disabled={editingType?.isSystem}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-transparent disabled:bg-gray-100"
                    placeholder="e.g., document-processing"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (lowercase, hyphens only)</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#000034] mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-transparent resize-none"
                    placeholder="Brief description of this workflow type"
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-[#000034] mb-1">
                    Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map((iconName) => {
                      const Icon = iconMap[iconName] || Workflow;
                      return (
                        <button
                          key={iconName}
                          onClick={() => setFormData({ ...formData, icon: iconName })}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            formData.icon === iconName
                              ? "border-[#000080] bg-[#000080]/10"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Icon className="h-5 w-5 mx-auto text-[#000034]" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-[#000034] mb-1">
                    Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`p-3 rounded-lg bg-gradient-to-r ${color.value} transition-all ${
                          formData.color === color.value
                            ? "ring-2 ring-offset-2 ring-[#000080]"
                            : ""
                        }`}
                        title={color.label}
                      >
                        <span className="text-xs font-medium text-white">{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-[#000034] mb-2">
                    Preview
                  </label>
                  <div className={`bg-gradient-to-r ${formData.color} p-4 rounded-lg`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        {(() => {
                          const PreviewIcon = iconMap[formData.icon] || Workflow;
                          return <PreviewIcon className="h-5 w-5 text-white" />;
                        })()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{formData.name || "Workflow Name"}</p>
                        <p className="text-white/80 text-sm">{formData.description || "Description"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name || !formData.slug}
                  className="px-4 py-2 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingType ? "Save Changes" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  label,
  value,
  total,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  total?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "emerald" | "amber" | "purple";
  loading: boolean;
}) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    purple: "from-purple-500 to-purple-600",
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
          <p className="text-2xl font-bold text-[#000034]">
            {loading ? "-" : value}
            {total !== undefined && !loading && (
              <span className="text-sm font-normal text-[#666666]">/{total}</span>
            )}
          </p>
          <p className="text-xs text-[#666666]">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="p-4 border border-[#E7EBF0] rounded-lg hover:border-[#000080] hover:bg-[#000080]/5 transition-all cursor-pointer group"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#000080]/10 rounded-lg group-hover:bg-[#000080]/20 transition-colors">
            <Icon className="h-4 w-4 text-[#000080]" />
          </div>
          <div>
            <p className="font-medium text-[#000034] text-sm">{title}</p>
            <p className="text-xs text-[#666666] mt-0.5">{description}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function StatusItem({
  title,
  status,
  detail,
}: {
  title: string;
  status: "active" | "inactive" | "pending";
  detail: string;
}) {
  const statusConfig = {
    active: {
      icon: CheckCircle,
      color: "text-green-700 bg-green-100",
      label: "Active",
    },
    inactive: {
      icon: AlertTriangle,
      color: "text-amber-700 bg-amber-100",
      label: "Inactive",
    },
    pending: {
      icon: Clock,
      color: "text-gray-600 bg-gray-100",
      label: "Pending Setup",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <StatusIcon className={`h-5 w-5 ${config.color.split(" ")[0]}`} />
        <div>
          <p className="font-medium text-[#000034] text-sm">{title}</p>
          <p className="text-xs text-[#666666]">{detail}</p>
        </div>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}
