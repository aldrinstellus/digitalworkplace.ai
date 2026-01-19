"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  MessageSquareText,
  RefreshCw,
  Calendar,
  FileText,
  ExternalLink,
  Link2,
  Unlink,
  Search,
  Filter,
  ChevronRight,
  Info,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiUrl } from "@/lib/utils";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: "active" | "inactive";
  workflowAction?: {
    type: "appointment" | "service-request" | "external-link";
    configId?: string;
    buttonLabel: string;
    externalUrl?: string;
  };
}

interface AppointmentConfig {
  id: string;
  department: string;
  serviceName: string;
  isActive: boolean;
}

const actionTypes = [
  {
    type: "appointment",
    label: "Book Appointment",
    description: "Link to appointment scheduling",
    icon: Calendar,
    color: "from-blue-500 to-indigo-600",
  },
  {
    type: "service-request",
    label: "Submit Request",
    description: "Create a service request",
    icon: FileText,
    color: "from-emerald-500 to-teal-600",
  },
  {
    type: "external-link",
    label: "External Link",
    description: "Link to external resource",
    icon: ExternalLink,
    color: "from-purple-500 to-violet-600",
  },
];

export default function FAQActionsPage() {
  useLanguage(); // Context hook

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [appointmentConfigs, setAppointmentConfigs] = useState<AppointmentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showActionFilter, setShowActionFilter] = useState("all");
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [faqRes, configRes] = await Promise.all([
        fetch(apiUrl("/api/faqs")),
        fetch(apiUrl("/api/appointments/config?activeOnly=true")),
      ]);

      if (faqRes.ok) {
        const data = await faqRes.json();
        setFaqs(data.faqs || []);
      }
      if (configRes.ok) {
        const configs = await configRes.json();
        setAppointmentConfigs(configs);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredFaqs = faqs.filter((faq) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!faq.question.toLowerCase().includes(query) && !faq.answer.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (categoryFilter !== "all" && faq.category !== categoryFilter) {
      return false;
    }
    if (showActionFilter === "with-action" && !faq.workflowAction) {
      return false;
    }
    if (showActionFilter === "without-action" && faq.workflowAction) {
      return false;
    }
    return true;
  });

  const categories = [...new Set(faqs.map((f) => f.category))];
  const faqsWithActions = faqs.filter((f) => f.workflowAction).length;

  const saveAction = async (faqId: string, action: FAQ["workflowAction"] | null) => {
    try {
      const res = await fetch(apiUrl("/api/faqs"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: faqId, workflowAction: action }),
      });
      if (res.ok) {
        fetchData();
        setShowModal(false);
        setSelectedFaq(null);
        toast.success(action ? "Action linked to FAQ" : "Action removed from FAQ");
      }
    } catch {
      toast.error("Failed to update FAQ");
    }
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
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600">
              <MessageSquareText className="h-6 w-6 text-white" />
            </div>
            FAQ Workflow Actions
          </h1>
          <p className="text-[#666666] mt-1 text-[15px]">
            Connect FAQs to appointment booking or service request workflows
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchData}
          disabled={loading}
          className="h-10 px-4 flex items-center gap-2 bg-white border border-[#E7EBF0] rounded-lg hover:bg-gray-50 transition-all shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total FAQs" value={faqs.length} icon={MessageSquareText} color="purple" />
        <StatCard label="With Actions" value={faqsWithActions} icon={Link2} color="blue" />
        <StatCard label="Without Actions" value={faqs.length - faqsWithActions} icon={Unlink} color="gray" />
        <StatCard label="Categories" value={categories.length} icon={Filter} color="emerald" />
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Info className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-[#000034] mb-1">How FAQ Actions Work</h3>
            <p className="text-sm text-[#666666]">
              Link FAQs to workflows to add action buttons. When users view an FAQ, they&apos;ll see a button to book an appointment,
              submit a service request, or visit an external link. This helps guide users to take action after reading the FAQ.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-[#E7EBF0] p-4 mb-6 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={showActionFilter}
              onChange={(e) => setShowActionFilter(e.target.value)}
              className="h-10 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
            >
              <option value="all">All FAQs</option>
              <option value="with-action">With Actions</option>
              <option value="without-action">Without Actions</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* FAQ List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-[#E7EBF0] rounded-lg">
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquareText className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-[#000034] mb-2">No FAQs Found</h3>
            <p className="text-[#666666] text-sm">
              {searchQuery || categoryFilter !== "all"
                ? "Try adjusting your filters"
                : "Add FAQs in Content Management first"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E7EBF0]">
            {filteredFaqs.map((faq, index) => {
              const action = faq.workflowAction;
              const actionConfig = action
                ? actionTypes.find((a) => a.type === action.type)
                : null;
              const ActionIcon = actionConfig?.icon || Link2;

              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 lg:p-6 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedFaq(faq);
                    setShowModal(true);
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {faq.category}
                        </span>
                        {faq.status === "inactive" && (
                          <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-[#000034] mb-1">{faq.question}</h3>
                      <p className="text-sm text-[#666666] line-clamp-2">{faq.answer}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {action ? (
                        <div
                          className={`px-3 py-2 rounded-lg bg-gradient-to-r ${actionConfig?.color} text-white text-sm flex items-center gap-2`}
                        >
                          <ActionIcon className="h-4 w-4" />
                          {action.buttonLabel}
                        </div>
                      ) : (
                        <div className="px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm flex items-center gap-2">
                          <Link2 className="h-4 w-4" />
                          No Action
                        </div>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Action Modal */}
      <AnimatePresence>
        {showModal && selectedFaq && (
          <ActionModal
            faq={selectedFaq}
            appointmentConfigs={appointmentConfigs}
            onClose={() => {
              setShowModal(false);
              setSelectedFaq(null);
            }}
            onSave={(action) => saveAction(selectedFaq.id, action)}
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
  color: "purple" | "blue" | "gray" | "emerald";
}) {
  const colors = {
    purple: "from-purple-500 to-purple-600",
    blue: "from-blue-500 to-blue-600",
    gray: "from-gray-400 to-gray-500",
    emerald: "from-emerald-500 to-emerald-600",
  };

  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl border border-[#E7EBF0] p-4 shadow-sm">
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

function ActionModal({
  faq,
  appointmentConfigs,
  onClose,
  onSave,
}: {
  faq: FAQ;
  appointmentConfigs: AppointmentConfig[];
  onClose: () => void;
  onSave: (action: FAQ["workflowAction"] | null) => void;
}) {
  const [actionType, setActionType] = useState<string>(faq.workflowAction?.type || "");
  const [buttonLabel, setButtonLabel] = useState(faq.workflowAction?.buttonLabel || "");
  const [configId, setConfigId] = useState(faq.workflowAction?.configId || "");
  const [externalUrl, setExternalUrl] = useState(faq.workflowAction?.externalUrl || "");

  const handleSave = () => {
    if (!actionType) {
      onSave(null);
      return;
    }

    const action: FAQ["workflowAction"] = {
      type: actionType as "appointment" | "service-request" | "external-link",
      buttonLabel: buttonLabel || getDefaultLabel(actionType),
    };

    if (actionType === "appointment" && configId) {
      action.configId = configId;
    }
    if (actionType === "external-link" && externalUrl) {
      action.externalUrl = externalUrl;
    }

    onSave(action);
  };

  const getDefaultLabel = (type: string): string => {
    switch (type) {
      case "appointment":
        return "Book Appointment";
      case "service-request":
        return "Submit Request";
      case "external-link":
        return "Learn More";
      default:
        return "Take Action";
    }
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
        className="bg-white rounded-xl shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#E7EBF0]">
          <h3 className="text-lg font-semibold text-[#000034]">Configure FAQ Action</h3>
          <p className="text-sm text-[#666666] mt-1 line-clamp-2">{faq.question}</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Action Type Selection */}
          <div>
            <label className="block text-sm font-medium text-[#363535] mb-3">Action Type</label>
            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  actionType === "" ? "border-[#000080] bg-[#000080]/5" : "border-[#E7EBF0] hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="actionType"
                  value=""
                  checked={actionType === ""}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-4 h-4 text-[#000080]"
                />
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Unlink className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-[#000034]">No Action</p>
                  <p className="text-xs text-[#666666]">Remove any linked action</p>
                </div>
              </label>

              {actionTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <label
                    key={type.type}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      actionType === type.type
                        ? "border-[#000080] bg-[#000080]/5"
                        : "border-[#E7EBF0] hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="actionType"
                      value={type.type}
                      checked={actionType === type.type}
                      onChange={(e) => setActionType(e.target.value)}
                      className="w-4 h-4 text-[#000080]"
                    />
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${type.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#000034]">{type.label}</p>
                      <p className="text-xs text-[#666666]">{type.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action-specific options */}
          {actionType && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#363535] mb-2">Button Label</label>
                <input
                  type="text"
                  value={buttonLabel}
                  onChange={(e) => setButtonLabel(e.target.value)}
                  placeholder={getDefaultLabel(actionType)}
                  className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
                />
              </div>

              {actionType === "appointment" && (
                <div>
                  <label className="block text-sm font-medium text-[#363535] mb-2">
                    Appointment Service (optional)
                  </label>
                  <select
                    value={configId}
                    onChange={(e) => setConfigId(e.target.value)}
                    className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
                  >
                    <option value="">Any service</option>
                    {appointmentConfigs.map((config) => (
                      <option key={config.id} value={config.id}>
                        {config.department} - {config.serviceName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === "external-link" && (
                <div>
                  <label className="block text-sm font-medium text-[#363535] mb-2">External URL *</label>
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
                  />
                </div>
              )}
            </>
          )}
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
            onClick={handleSave}
            disabled={actionType === "external-link" && !externalUrl}
            className="px-4 py-2 text-sm font-medium text-white bg-[#000080] hover:bg-[#0000a0] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Action
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
