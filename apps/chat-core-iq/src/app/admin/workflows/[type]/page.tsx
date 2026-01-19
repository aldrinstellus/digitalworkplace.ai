"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { apiUrl } from "@/lib/utils";
import {
  ArrowLeft,
  Workflow,
  Settings,
  Plus,
  RefreshCw,
  AlertCircle,
  Calendar,
  GitBranch,
  MessageSquareText,
  Clock,
  CheckCircle,
  FileText,
  Bell,
  Users,
  Mail,
  Phone,
  Globe,
  Shield,
  Briefcase,
  HelpCircle,
  Zap,
  Building2,
  BarChart3,
  Edit2,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
  type LucideIcon,
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Calendar,
  GitBranch,
  MessageSquareText,
  Workflow,
  Clock,
  CheckCircle,
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

interface WorkflowCategory {
  id: string;
  name: string;
  workflowTypeId: string;
  description?: string;
  isActive: boolean;
  order: number;
}

export default function DynamicWorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const typeSlug = params.type as string;

  const [workflowType, setWorkflowType] = useState<WorkflowType | null>(null);
  const [categories, setCategories] = useState<WorkflowCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<WorkflowCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  // Redirect system types to their dedicated pages
  useEffect(() => {
    if (typeSlug === "appointments") {
      router.replace("/admin/workflows/appointments");
      return;
    }
    if (typeSlug === "service-requests") {
      router.replace("/admin/workflows/service-requests");
      return;
    }
    if (typeSlug === "faq-actions") {
      router.replace("/admin/workflows/faq-actions");
      return;
    }
  }, [typeSlug, router]);

  const fetchData = useCallback(async () => {
    if (["appointments", "service-requests", "faq-actions"].includes(typeSlug)) {
      return; // Will be redirected
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch workflow type
      const typesRes = await fetch(apiUrl("/api/workflows/types"));
      if (!typesRes.ok) throw new Error("Failed to fetch workflow types");
      const types: WorkflowType[] = await typesRes.json();
      const type = types.find((t) => t.slug === typeSlug);

      if (!type) {
        setError("Workflow type not found");
        setLoading(false);
        return;
      }

      setWorkflowType(type);

      // Fetch categories for this workflow type
      const catsRes = await fetch(`/api/workflows/categories?workflowTypeId=${type.id}`);
      if (catsRes.ok) {
        const cats = await catsRes.json();
        setCategories(cats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [typeSlug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Category CRUD operations
  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
    setShowCategoryModal(true);
  };

  const openEditCategory = (category: WorkflowCategory) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, description: category.description || "" });
    setShowCategoryModal(true);
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim() || !workflowType) {
      toast.error("Category name is required");
      return;
    }

    try {
      const method = editingCategory ? "PUT" : "POST";
      const body = editingCategory
        ? { id: editingCategory.id, name: categoryForm.name, description: categoryForm.description }
        : { name: categoryForm.name, description: categoryForm.description, workflowTypeId: workflowType.id };

      const res = await fetch(apiUrl("/api/workflows/categories"), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save category");
      }

      toast.success(editingCategory ? "Category updated" : "Category created");
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category");
    }
  };

  const deleteCategory = async (category: WorkflowCategory) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/workflows/categories?id=${category.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete category");
      }

      toast.success("Category deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const toggleCategoryStatus = async (category: WorkflowCategory) => {
    try {
      const res = await fetch(apiUrl("/api/workflows/categories"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: category.id, isActive: !category.isActive }),
      });

      if (!res.ok) {
        throw new Error("Failed to update category");
      }

      toast.success(`Category ${category.isActive ? "deactivated" : "activated"}`);
      fetchData();
    } catch {
      toast.error("Failed to update category status");
    }
  };

  if (["appointments", "service-requests", "faq-actions"].includes(typeSlug)) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#000080] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#000080] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (error || !workflowType) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-md mx-auto text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#000034] mb-2">
            {error || "Workflow Not Found"}
          </h2>
          <p className="text-gray-500 mb-6">
            The workflow type &ldquo;{typeSlug}&rdquo; could not be found.
          </p>
          <Link
            href="/admin/workflows"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#000080] text-white rounded-lg hover:bg-[#000080]/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workflows
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = iconMap[workflowType.icon] || Workflow;

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/admin/workflows"
          className="inline-flex items-center gap-2 text-sm text-[#666666] hover:text-[#000080] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workflows
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${workflowType.color}`}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-[32px] font-bold text-[#000034] tracking-tight">
                {workflowType.name}
              </h1>
              <p className="text-[#666666] text-[15px]">
                {workflowType.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchData}
              className="h-10 px-4 flex items-center gap-2 bg-white border border-[#E7EBF0] rounded-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-10 px-4 flex items-center gap-2 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white rounded-lg hover:opacity-90 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Custom Workflow Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-[#000034] mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#000080]" />
              Workflow Configuration
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Custom Workflow Type</p>
                  <p className="text-sm text-blue-700 mt-1">
                    This is a custom workflow type. You can configure its behavior by adding
                    categories and items below. The workflow handler type is: <strong>{workflowType.handlerType}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Placeholder for custom workflow items */}
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <Workflow className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                No Items Configured
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Start by adding items to this workflow or configuring categories.
              </p>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#000080] text-white rounded-lg hover:bg-[#000080]/90 transition-colors">
                <Plus className="h-4 w-4" />
                Add First Item
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm p-6"
          >
            <h3 className="font-semibold text-[#000034] mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Active</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  workflowType.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {workflowType.isActive ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">System Type</span>
                <span className="text-sm text-[#000034]">
                  {workflowType.isSystem ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Handler</span>
                <span className="text-sm text-[#000034] capitalize">
                  {workflowType.handlerType}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Categories Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#000034]">Categories</h3>
              <span className="text-xs text-gray-500">{categories.length} total</span>
            </div>
            {categories.length > 0 ? (
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`flex items-center justify-between p-2 bg-gray-50 rounded-lg group ${
                      !cat.isActive ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-[#000034] block truncate">{cat.name}</span>
                      {cat.description && (
                        <span className="text-xs text-gray-500 block truncate">{cat.description}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleCategoryStatus(cat)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title={cat.isActive ? "Deactivate" : "Activate"}
                      >
                        {cat.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-700" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      <button
                        onClick={() => openEditCategory(cat)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-gray-500" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No categories configured
              </p>
            )}
            <button
              onClick={openAddCategory}
              className="w-full mt-4 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#000080] hover:text-[#000080] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </motion.div>
        </div>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#E7EBF0]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#000034]">
                    {editingCategory ? "Edit Category" : "Add Category"}
                  </h3>
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#363535] mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g., General Inquiries"
                    className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#363535] mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Brief description of this category..."
                    rows={3}
                    className="w-full px-3 py-2 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-[#E7EBF0] flex justify-end gap-3">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#666666] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveCategory}
                  disabled={!categoryForm.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#000080] hover:bg-[#0000a0] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingCategory ? "Update Category" : "Create Category"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
