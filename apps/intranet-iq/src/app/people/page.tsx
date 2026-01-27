"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { FadeIn, StaggerContainer, StaggerItem, ScaleOnHover } from "@/lib/motion";
import {
  Search,
  Users,
  MapPin,
  Mail,
  Phone,
  ChevronDown,
  ChevronRight,
  Building2,
  MessageSquare,
  Calendar,
  Grid3X3,
  List,
  Network,
  ArrowUpDown,
} from "lucide-react";
import { useDepartments, useEmployees } from "@/lib/hooks/useSupabase";
import type { Employee, Department } from "@/lib/database.types";

type ViewMode = "grid" | "list" | "org";
type SortOption = "name-asc" | "name-desc" | "department" | "title";

const sortOptions = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "department", label: "Department" },
  { value: "title", label: "Title" },
];

const statusColors = {
  online: "bg-[var(--success)]",
  away: "bg-[var(--warning)]",
  offline: "bg-[var(--text-muted)]",
};

// Mock status since we don't have real-time presence
function getRandomStatus(): "online" | "away" | "offline" {
  const statuses: ("online" | "away" | "offline")[] = ["online", "away", "offline"];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

export default function PeoplePage() {
  const { departments, loading: deptLoading } = useDepartments();
  const { employees, loading: empLoading } = useEmployees();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [employeeStatuses, setEmployeeStatuses] = useState<Record<string, "online" | "away" | "offline">>({});
  const hasInitializedStatusesRef = useRef(false);
  const hasInitializedNodesRef = useRef(false);

  // Set random statuses for demo (using useEffect to avoid state update during render)
  useEffect(() => {
    if (employees.length > 0 && !hasInitializedStatusesRef.current) {
      hasInitializedStatusesRef.current = true;
      const statuses: Record<string, "online" | "away" | "offline"> = {};
      employees.forEach((emp: { id: string }) => {
        statuses[emp.id] = getRandomStatus();
      });
      setEmployeeStatuses(statuses);
    }
  }, [employees]);

  // Expand CEO node by default (using useEffect to avoid state update during render)
  useEffect(() => {
    if (employees.length > 0 && !hasInitializedNodesRef.current) {
      hasInitializedNodesRef.current = true;
      const ceo = employees.find((emp: { manager_id?: string | null }) => !emp.manager_id);
      if (ceo) {
        setExpandedNodes(new Set([ceo.id]));
      }
    }
  }, [employees]);

  const loading = deptLoading || empLoading;

  // Transform employees with user data - MEMOIZED
  const transformedEmployees = useMemo(() =>
    employees.map((emp: any) => ({
      id: emp.id,
      name: emp.user?.full_name || "Unknown",
      title: emp.job_title || "Employee",
      department: emp.department?.name || "General",
      departmentId: emp.department_id,
      location: emp.location || "Remote",
      email: emp.user?.email || "",
      phone: emp.phone || "",
      avatar: (emp.user?.full_name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase(),
      status: employeeStatuses[emp.id] || "offline",
      manager: emp.manager_id,
      managerId: emp.manager_id,
      skills: emp.skills || [],
    })),
    [employees, employeeStatuses]
  );

  // Create lookup maps for O(1) child finding - PERFORMANCE OPTIMIZATION
  const { childrenByManager, ceo } = useMemo(() => {
    const childrenMap = new Map<string, any[]>();
    let ceoNode: any = null;

    for (const person of transformedEmployees) {
      if (!person.managerId) {
        ceoNode = person;
      } else {
        const children = childrenMap.get(person.managerId) || [];
        children.push(person);
        childrenMap.set(person.managerId, children);
      }
    }

    return { childrenByManager: childrenMap, ceo: ceoNode };
  }, [transformedEmployees]);

  const filteredPeople = useMemo(() => {
    const filtered = transformedEmployees.filter((person: any) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        person.name.toLowerCase().includes(searchLower) ||
        person.title.toLowerCase().includes(searchLower) ||
        person.email.toLowerCase().includes(searchLower) ||
        person.department.toLowerCase().includes(searchLower);
      const matchesDepartment =
        selectedDepartment === "all" || person.departmentId === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });

    // Sort the results
    return filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "department":
          return a.department.localeCompare(b.department) || a.name.localeCompare(b.name);
        case "title":
          return a.title.localeCompare(b.title) || a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [transformedEmployees, searchQuery, selectedDepartment, sortBy]);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Build org tree using O(1) lookup - MEMOIZED
  const buildOrgTree = useMemo(() => {
    if (!ceo) return null;

    const buildNode = (person: any): any => {
      // O(1) lookup instead of O(n) filter
      const children = (childrenByManager.get(person.id) || []).map(buildNode);
      return { person, children, expanded: expandedNodes.has(person.id) };
    };

    return buildNode(ceo);
  }, [ceo, childrenByManager, expandedNodes]);

  const renderOrgNode = (node: any, level: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.person.id);

    return (
      <motion.div
        key={node.person.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: level * 0.1 }}
        className="flex flex-col items-center"
      >
        <motion.div
          className={`bg-[var(--bg-charcoal)] border rounded-xl p-4 cursor-pointer transition-all ${
            selectedPerson?.id === node.person.id
              ? "border-[var(--accent-ember)] shadow-lg shadow-[var(--accent-ember)]/10"
              : "border-[var(--border-subtle)] hover:border-[var(--accent-ember)]/30"
          }`}
          onClick={() => setSelectedPerson(node.person)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center text-white font-medium shadow-lg shadow-[var(--accent-ember)]/20">
                {node.person.avatar}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--bg-charcoal)] ${
                  statusColors[node.person.status as keyof typeof statusColors] || statusColors.offline
                }`}
              />
            </div>
            <div className="text-left">
              <h4 className="text-[var(--text-primary)] font-medium text-sm">{node.person.name}</h4>
              <p className="text-[var(--text-muted)] text-xs">{node.person.title}</p>
            </div>
            {hasChildren && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.person.id);
                }}
                className="ml-2 p-1 rounded hover:bg-[var(--bg-slate)]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 relative"
            >
              <div className="absolute top-0 left-1/2 w-px h-4 bg-[var(--border-default)] -translate-x-1/2" />
              <div className="flex gap-6 pt-4">
                {node.children.map((child: any, idx: number) => (
                  <div key={child.person.id} className="relative">
                    <div className="absolute top-0 left-1/2 w-px h-4 bg-[var(--border-default)] -translate-x-1/2" />
                    <div className="pt-4">{renderOrgNode(child, level + 1)}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const orgTree = buildOrgTree;

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />

      <main className="ml-16 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <FadeIn className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[var(--text-primary)] mb-2">People Directory</h1>
              <p className="text-[var(--text-muted)]">
                {loading ? "Loading..." : `${transformedEmployees.length} employees across the organization`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-[var(--text-muted)]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Buttons */}
              <div className="flex items-center gap-1 border-l border-[var(--border-subtle)] pl-4">
                <motion.button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)]"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Grid view"
                >
                  <Grid3X3 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)]"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="List view"
                >
                  <List className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => setViewMode("org")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "org"
                      ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)]"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Org chart"
                >
                  <Network className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </FadeIn>

          {/* Search and Filters */}
          <FadeIn delay={0.1} className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, title, department, or email..."
                className="w-full bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 focus:shadow-lg focus:shadow-[var(--accent-ember)]/5 transition-all"
              />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors cursor-pointer"
            >
              <option value="all">All Departments ({transformedEmployees.length})</option>
              {departments.map((dept: Department) => {
                const count = transformedEmployees.filter((e: any) => e.departmentId === dept.id).length;
                return (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({count})
                  </option>
                );
              })}
            </select>
          </FadeIn>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-ember)]" />
            </div>
          ) : viewMode === "org" ? (
            <FadeIn className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-8 overflow-x-auto">
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-8 flex items-center gap-2">
                <Network className="w-5 h-5 text-[var(--accent-ember)]" />
                Organization Chart
              </h2>
              <div className="flex justify-center min-h-[200px]">
                {orgTree ? (
                  renderOrgNode(orgTree)
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    <Network className="w-12 h-12 text-[var(--text-muted)]/30 mb-4" />
                    <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">
                      Organization chart unavailable
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]/70 max-w-md">
                      Unable to build the organization tree. Ensure there is a top-level employee (CEO/Manager) without a manager assigned.
                    </p>
                  </div>
                )}
              </div>
            </FadeIn>
          ) : (
            <div className="flex gap-6">
              {/* People List/Grid */}
              <div className="flex-1">
                {viewMode === "grid" ? (
                  <StaggerContainer className="grid grid-cols-3 gap-4">
                    {filteredPeople.map((person: any, index: number) => (
                      <StaggerItem key={person.id}>
                        <motion.div
                          onClick={() => setSelectedPerson(person)}
                          className={`bg-[var(--bg-charcoal)] border rounded-xl p-4 cursor-pointer transition-all ${
                            selectedPerson?.id === person.id
                              ? "border-[var(--accent-ember)] shadow-lg shadow-[var(--accent-ember)]/10"
                              : "border-[var(--border-subtle)] hover:border-[var(--accent-ember)]/30"
                          }`}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center text-white font-medium shadow-lg shadow-[var(--accent-ember)]/20">
                                {person.avatar}
                              </div>
                              <span
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--bg-charcoal)] ${
                                  statusColors[person.status as keyof typeof statusColors] || statusColors.offline
                                }`}
                              />
                            </div>
                            <div>
                              <h4 className="text-[var(--text-primary)] font-medium">{person.name}</h4>
                              <p className="text-sm text-[var(--text-muted)]">{person.title}</p>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-[var(--text-muted)]">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              {person.department}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {person.location}
                            </div>
                          </div>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                ) : (
                  <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl divide-y divide-[var(--border-subtle)]">
                    {filteredPeople.map((person: any, index: number) => (
                      <motion.div
                        key={person.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setSelectedPerson(person)}
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-[var(--bg-slate)] ${
                          selectedPerson?.id === person.id ? "bg-[var(--accent-ember)]/10" : ""
                        }`}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center text-white font-medium text-sm shadow-md shadow-[var(--accent-ember)]/20">
                            {person.avatar}
                          </div>
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-charcoal)] ${
                              statusColors[person.status as keyof typeof statusColors] || statusColors.offline
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[var(--text-primary)] font-medium">{person.name}</h4>
                          <p className="text-sm text-[var(--text-muted)]">{person.title}</p>
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">{person.department}</div>
                        <div className="text-sm text-[var(--text-muted)]">{person.location}</div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Person Detail Panel */}
              <AnimatePresence>
                {selectedPerson && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="w-80 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 flex-shrink-0 h-fit"
                  >
                    <div className="text-center mb-6">
                      <div className="relative inline-block">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center text-white text-2xl font-medium mx-auto shadow-xl shadow-[var(--accent-ember)]/25">
                          {selectedPerson.avatar}
                        </div>
                        <span
                          className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[var(--bg-charcoal)] ${
                            statusColors[selectedPerson.status as keyof typeof statusColors] || statusColors.offline
                          }`}
                        />
                      </div>
                      <h3 className="text-xl font-medium text-[var(--text-primary)] mt-4">{selectedPerson.name}</h3>
                      <p className="text-[var(--text-muted)]">{selectedPerson.title}</p>
                      <p className="text-sm text-[var(--text-muted)]">{selectedPerson.department}</p>
                    </div>

                    <div className="flex gap-2 mb-6">
                      <motion.button
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-white text-sm transition-colors shadow-lg shadow-[var(--accent-ember)]/20"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </motion.button>
                      <motion.button
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-slate)] text-[var(--text-primary)] text-sm transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule
                      </motion.button>
                    </div>

                    <div className="space-y-4">
                      {selectedPerson.email && (
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                          <a href={`mailto:${selectedPerson.email}`} className="text-[var(--accent-ember)] hover:underline">
                            {selectedPerson.email}
                          </a>
                        </div>
                      )}
                      {selectedPerson.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-[var(--text-muted)]" />
                          <span className="text-[var(--text-secondary)]">{selectedPerson.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-[var(--text-secondary)]">{selectedPerson.location}</span>
                      </div>
                    </div>

                    {selectedPerson.skills && selectedPerson.skills.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
                        <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPerson.skills.map((skill: string) => (
                            <span
                              key={skill}
                              className="px-2 py-1 rounded-full text-xs bg-[var(--bg-slate)] text-[var(--text-secondary)]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPerson.managerId && (
                      <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
                        <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Reports To</h4>
                        {(() => {
                          const manager = transformedEmployees.find((p: any) => p.id === selectedPerson.managerId);
                          return manager ? (
                            <motion.div
                              className="flex items-center gap-3 cursor-pointer hover:bg-[var(--bg-slate)] rounded-lg p-2 -mx-2"
                              onClick={() => setSelectedPerson(manager)}
                              whileHover={{ x: 4 }}
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center text-white text-xs font-medium">
                                {manager.avatar}
                              </div>
                              <div>
                                <p className="text-sm text-[var(--text-primary)]">{manager.name}</p>
                                <p className="text-xs text-[var(--text-muted)]">{manager.title}</p>
                              </div>
                            </motion.div>
                          ) : null;
                        })()}
                      </div>
                    )}

                    {(() => {
                      const reports = transformedEmployees.filter((p: any) => p.managerId === selectedPerson.id);
                      return reports.length > 0 ? (
                        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
                          <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
                            Direct Reports ({reports.length})
                          </h4>
                          <div className="space-y-2">
                            {reports.map((report: any) => (
                              <motion.div
                                key={report.id}
                                className="flex items-center gap-3 cursor-pointer hover:bg-[var(--bg-slate)] rounded-lg p-2 -mx-2"
                                onClick={() => setSelectedPerson(report)}
                                whileHover={{ x: 4 }}
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center text-white text-xs font-medium">
                                  {report.avatar}
                                </div>
                                <div>
                                  <p className="text-sm text-[var(--text-primary)]">{report.name}</p>
                                  <p className="text-xs text-[var(--text-muted)]">{report.title}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
