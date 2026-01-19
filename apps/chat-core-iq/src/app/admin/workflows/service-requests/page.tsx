"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { apiUrl } from "@/lib/utils";
import {
  GitBranch,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Building2,
  Clock,
  Tag,
  X,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RoutingRule {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  targetDepartment: string;
  priority: "low" | "medium" | "high" | "urgent";
  slaHours: number;
  autoAssign: boolean;
  isActive: boolean;
  createdAt: string;
}

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-700 border-gray-200", sla: "96 hours" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700 border-blue-200", sla: "48 hours" },
  high: { label: "High", color: "bg-amber-100 text-amber-700 border-amber-200", sla: "24 hours" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700 border-red-200", sla: "4 hours" },
};

const departmentOptions = [
  "Building & Permits",
  "Code Compliance",
  "Planning & Zoning",
  "Public Works",
  "Parks & Recreation",
  "Business Licensing",
  "Finance",
  "City Manager's Office",
  "Police Department",
  "Fire Department",
];

const categoryOptions = [
  { value: "permits", label: "Permits & Licenses" },
  { value: "code-compliance", label: "Code Compliance" },
  { value: "utilities", label: "Utilities" },
  { value: "recreation", label: "Parks & Recreation" },
  { value: "business", label: "Business Services" },
  { value: "public-works", label: "Public Works" },
  { value: "general", label: "General Inquiries" },
];

export default function ServiceRequestsPage() {
  useLanguage(); // Context hook
  const { confirm, DialogComponent } = useConfirmDialog();

  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/workflows/routing"));
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (error) {
      console.error("Failed to fetch routing rules:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const toggleRuleStatus = async (rule: RoutingRule) => {
    try {
      const res = await fetch(apiUrl("/api/workflows/routing"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id, isActive: !rule.isActive }),
      });
      if (res.ok) {
        fetchRules();
        toast.success(`Rule ${rule.isActive ? "deactivated" : "activated"}`);
      }
    } catch {
      toast.error("Failed to update rule status");
    }
  };

  const deleteRule = (rule: RoutingRule) => {
    confirm({
      title: "Delete Routing Rule",
      description: `Are you sure you want to delete "${rule.name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/workflows/routing?id=${rule.id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            fetchRules();
            toast.success("Rule deleted successfully");
          }
        } catch {
          toast.error("Failed to delete rule");
        }
      },
    });
  };

  const saveRule = async (data: Partial<RoutingRule>) => {
    try {
      const method = editingRule ? "PUT" : "POST";
      const body = editingRule ? { ...data, id: editingRule.id } : data;
      const res = await fetch(apiUrl("/api/workflows/routing"), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchRules();
        setShowModal(false);
        setEditingRule(null);
        toast.success(editingRule ? "Rule updated" : "Rule created");
      }
    } catch {
      toast.error("Failed to save rule");
    }
  };

  // Stats
  const activeRules = rules.filter((r) => r.isActive).length;
  const departments = [...new Set(rules.map((r) => r.targetDepartment))];
  const autoAssignRules = rules.filter((r) => r.autoAssign && r.isActive).length;

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
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <GitBranch className="h-6 w-6 text-white" />
            </div>
            Service Request Routing
          </h1>
          <p className="text-[#666666] mt-1 text-[15px]">
            Configure automatic routing rules for service requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchRules}
            disabled={loading}
            className="h-10 px-4 flex items-center gap-2 bg-white border border-[#E7EBF0] rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingRule(null);
              setShowModal(true);
            }}
            className="h-10 px-4 flex items-center gap-2 bg-[#000080] text-white rounded-lg hover:bg-[#0000a0] transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Rule
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Rules" value={activeRules} total={rules.length} icon={GitBranch} color="emerald" />
        <StatCard label="Departments" value={departments.length} icon={Building2} color="blue" />
        <StatCard label="Auto-Assign Enabled" value={autoAssignRules} icon={Zap} color="amber" />
        <StatCard label="Categories" value={categoryOptions.length} icon={Tag} color="purple" />
      </div>

      {/* Rules List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : rules.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GitBranch className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-[#000034] mb-2">No Routing Rules</h3>
            <p className="text-[#666666] text-sm">Create your first routing rule to automatically route service requests.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E7EBF0]">
            {rules.map((rule, index) => {
              const priority = priorityConfig[rule.priority];
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 lg:p-6 hover:bg-gray-50/50 transition-colors ${
                    !rule.isActive ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#000034]">{rule.name}</h3>
                        {!rule.isActive && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                            Inactive
                          </span>
                        )}
                        {rule.autoAssign && rule.isActive && (
                          <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Auto-Assign
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-[#666666]">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {rule.targetDepartment}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          {categoryOptions.find((c) => c.value === rule.category)?.label || rule.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          SLA: {rule.slaHours}h
                        </span>
                      </div>
                    </div>

                    {/* Priority Badge */}
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${priority.color}`}>
                        {priority.label} Priority
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleRuleStatus(rule)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={rule.isActive ? "Deactivate" : "Activate"}
                        >
                          {rule.isActive ? (
                            <ToggleRight className="h-5 w-5 text-green-700" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-gray-500" />
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setEditingRule(rule);
                            setShowModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4 text-gray-500" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteRule(rule)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  {rule.keywords.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#E7EBF0]">
                      <p className="text-xs text-[#666666] mb-2">Matching Keywords:</p>
                      <div className="flex flex-wrap gap-2">
                        {rule.keywords.map((keyword, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <RuleModal
            rule={editingRule}
            onClose={() => {
              setShowModal(false);
              setEditingRule(null);
            }}
            onSave={saveRule}
          />
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
}: {
  label: string;
  value: number;
  total?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "emerald" | "blue" | "amber" | "purple";
}) {
  const colors = {
    emerald: "from-emerald-500 to-emerald-600",
    blue: "from-blue-500 to-blue-600",
    amber: "from-amber-500 to-amber-600",
    purple: "from-purple-500 to-purple-600",
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

function RuleModal({
  rule,
  onClose,
  onSave,
}: {
  rule: RoutingRule | null;
  onClose: () => void;
  onSave: (data: Partial<RoutingRule>) => void;
}) {
  const [formData, setFormData] = useState({
    name: rule?.name || "",
    category: rule?.category || "general",
    keywords: rule?.keywords.join(", ") || "",
    targetDepartment: rule?.targetDepartment || departmentOptions[0],
    priority: rule?.priority || "medium",
    slaHours: rule?.slaHours || 48,
    autoAssign: rule?.autoAssign || false,
  });

  const handleSubmit = () => {
    const keywords = formData.keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    onSave({
      name: formData.name,
      category: formData.category,
      keywords,
      targetDepartment: formData.targetDepartment,
      priority: formData.priority as RoutingRule["priority"],
      slaHours: formData.slaHours,
      autoAssign: formData.autoAssign,
    });
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
        <div className="p-6 border-b border-[#E7EBF0]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#000034]">
              {rule ? "Edit Routing Rule" : "Add Routing Rule"}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#363535] mb-2">Rule Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Permit Inquiries"
              className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#363535] mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#363535] mb-2">Department *</label>
              <select
                value={formData.targetDepartment}
                onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
                className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
              >
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#363535] mb-2">Keywords (comma-separated)</label>
            <textarea
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="permit, building, construction, renovation"
              className="w-full h-20 px-3 py-2 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] resize-none"
            />
            <p className="text-xs text-[#666666] mt-1">
              Requests containing these keywords will be routed to this department
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#363535] mb-2">Priority *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as "low" | "medium" | "high" | "urgent" })}
                className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#363535] mb-2">SLA (hours) *</label>
              <input
                type="number"
                value={formData.slaHours}
                onChange={(e) => setFormData({ ...formData, slaHours: parseInt(e.target.value) || 48 })}
                min={1}
                className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="autoAssign"
              checked={formData.autoAssign}
              onChange={(e) => setFormData({ ...formData, autoAssign: e.target.checked })}
              className="w-4 h-4 text-[#000080] border-[#E7EBF0] rounded focus:ring-[#000080]"
            />
            <label htmlFor="autoAssign" className="flex-1">
              <p className="text-sm font-medium text-[#000034]">Auto-Assign to Department</p>
              <p className="text-xs text-[#666666]">
                Automatically assign matching requests to the department queue
              </p>
            </label>
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
            onClick={handleSubmit}
            disabled={!formData.name || !formData.targetDepartment}
            className="px-4 py-2 text-sm font-medium text-white bg-[#000080] hover:bg-[#0000a0] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rule ? "Update Rule" : "Create Rule"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
