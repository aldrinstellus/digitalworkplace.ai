"use client";

import {
  FileText,
  Users,
  Calendar,
  MessageSquare,
  Database,
  Mail,
  Folder,
  Globe,
  Bot,
} from "lucide-react";

interface FacetCount {
  type: string;
  label?: string;
  count: number;
  icon?: typeof FileText;
}

interface Department {
  id: string;
  name: string;
}

interface FacetedSidebarProps {
  facets: FacetCount[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  totalCount: number;
  departments?: Department[];
  selectedDepartments?: string[];
  onDepartmentToggle?: (deptId: string) => void;
}

const typeConfig: Record<string, { icon: typeof FileText; label: string; color: string }> = {
  all: { icon: Database, label: "All", color: "text-white" },
  article: { icon: FileText, label: "Articles", color: "text-blue-400" },
  employee: { icon: Users, label: "People", color: "text-green-400" },
  event: { icon: Calendar, label: "Events", color: "text-orange-400" },
  document: { icon: Folder, label: "Documents", color: "text-purple-400" },
  channel: { icon: MessageSquare, label: "Channels", color: "text-cyan-400" },
  email: { icon: Mail, label: "Emails", color: "text-yellow-400" },
  workflow: { icon: Bot, label: "Agents", color: "text-pink-400" },
  web: { icon: Globe, label: "Web", color: "text-gray-400" },
};

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

export function FacetedSidebar({
  facets,
  activeFilter,
  onFilterChange,
  totalCount,
  departments = [],
  selectedDepartments = [],
  onDepartmentToggle,
}: FacetedSidebarProps) {
  // Filter out "all" from facets and sort by count descending
  const sortedFacets = [...facets]
    .filter((f) => f.type !== "all")
    .sort((a, b) => b.count - a.count);

  return (
    <div className="w-56 flex-shrink-0">
      <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-4 sticky top-8">
        <h3 className="text-sm font-medium text-white mb-3">Filter Results</h3>

        {/* All Results */}
        <button
          onClick={() => onFilterChange("all")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${
            activeFilter === "all"
              ? "bg-blue-500/20 text-blue-400"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>All</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
            {formatCount(totalCount)}
          </span>
        </button>

        {/* Divider */}
        <div className="h-px bg-white/10 my-3" />

        {/* Facets by Type */}
        <div className="space-y-1">
          {sortedFacets.map((facet) => {
            const config = typeConfig[facet.type] || {
              icon: FileText,
              label: facet.type,
              color: "text-gray-400",
            };
            const Icon = config.icon;

            return (
              <button
                key={facet.type}
                onClick={() => onFilterChange(facet.type)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFilter === facet.type
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span>{config.label}</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeFilter === facet.type
                      ? "bg-blue-500/30 text-blue-300"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {formatCount(facet.count)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {sortedFacets.length === 0 && (
          <p className="text-xs text-white/40 text-center py-4">
            No results to filter
          </p>
        )}

        {/* Department Filter */}
        {departments.length > 0 && onDepartmentToggle && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-white mb-3">Department</h3>
            <div className="space-y-2">
              {departments.map((dept) => (
                <label
                  key={dept.id}
                  className="flex items-center gap-2 text-sm text-white/60 cursor-pointer hover:text-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(dept.id)}
                    onChange={() => onDepartmentToggle(dept.id)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                  />
                  {dept.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Share Feedback */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors">
            <MessageSquare className="w-3 h-3" />
            Share feedback
          </button>
        </div>
      </div>
    </div>
  );
}
