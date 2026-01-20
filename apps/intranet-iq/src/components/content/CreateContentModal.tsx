"use client";

import { useState } from "react";
import { X, FolderPlus, FileText, Loader2 } from "lucide-react";

interface CreateContentModalProps {
  type: "category" | "article";
  parentId?: string;
  departmentId?: string;
  onClose: () => void;
  onCreate: (data: {
    name?: string;
    title?: string;
    slug: string;
    description?: string;
    departmentId?: string;
    categoryId?: string;
  }) => Promise<void>;
  departments?: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
}

export function CreateContentModal({
  type,
  parentId,
  departmentId,
  onClose,
  onCreate,
  departments = [],
  categories = [],
}: CreateContentModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(departmentId || "");
  const [selectedCategory, setSelectedCategory] = useState(parentId || "");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setCreating(true);
    setError("");

    try {
      await onCreate({
        name: type === "category" ? name : undefined,
        title: type === "article" ? name : undefined,
        slug: generateSlug(name),
        description: description || undefined,
        departmentId: selectedDepartment || undefined,
        categoryId: type === "article" ? selectedCategory || undefined : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-[480px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {type === "category" ? (
              <FolderPlus className="w-5 h-5 text-yellow-400" />
            ) : (
              <FileText className="w-5 h-5 text-blue-400" />
            )}
            <h2 className="text-lg font-medium text-white">
              {type === "category" ? "New Category" : "New Article"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
              {type === "category" ? "Category Name" : "Article Title"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === "category" ? "e.g., HR Policies" : "e.g., Getting Started Guide"}
              className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors"
              autoFocus
            />
            {name && (
              <p className="mt-1 text-xs text-white/40">
                Slug: {generateSlug(name)}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={3}
              className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors resize-none"
            />
          </div>

          {type === "category" && departments.length > 0 && (
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500/50 transition-colors"
              >
                <option value="">No department (General)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === "article" && categories.length > 0 && (
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500/50 transition-colors"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white flex items-center gap-2 transition-colors"
          >
            {creating && <Loader2 className="w-4 h-4 animate-spin" />}
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
