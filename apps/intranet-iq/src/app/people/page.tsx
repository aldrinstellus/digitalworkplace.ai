"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Search,
  Users,
  MapPin,
  Mail,
  Phone,
  ChevronDown,
  ChevronRight,
  Building2,
  User,
  MessageSquare,
  Calendar,
  ExternalLink,
  Grid3X3,
  List,
  Network,
} from "lucide-react";

interface Person {
  id: string;
  name: string;
  title: string;
  department: string;
  location: string;
  email: string;
  phone: string;
  avatar: string;
  status: "online" | "away" | "offline";
  reports?: string[];
  manager?: string;
}

interface OrgNode {
  person: Person;
  children: OrgNode[];
  expanded?: boolean;
}

const samplePeople: Person[] = [
  {
    id: "1",
    name: "James Morrison",
    title: "CEO",
    department: "Executive",
    location: "San Francisco, CA",
    email: "james.morrison@company.com",
    phone: "+1 (555) 100-0001",
    avatar: "JM",
    status: "online",
    reports: ["2", "3", "4", "5"],
  },
  {
    id: "2",
    name: "Sarah Chen",
    title: "VP of Engineering",
    department: "Engineering",
    location: "San Francisco, CA",
    email: "sarah.chen@company.com",
    phone: "+1 (555) 100-0002",
    avatar: "SC",
    status: "online",
    manager: "1",
    reports: ["6", "7"],
  },
  {
    id: "3",
    name: "Michael Park",
    title: "VP of Marketing",
    department: "Marketing",
    location: "New York, NY",
    email: "michael.park@company.com",
    phone: "+1 (555) 100-0003",
    avatar: "MP",
    status: "away",
    manager: "1",
    reports: ["8"],
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    title: "VP of Sales",
    department: "Sales",
    location: "Chicago, IL",
    email: "emily.rodriguez@company.com",
    phone: "+1 (555) 100-0004",
    avatar: "ER",
    status: "online",
    manager: "1",
  },
  {
    id: "5",
    name: "David Kim",
    title: "VP of HR",
    department: "Human Resources",
    location: "San Francisco, CA",
    email: "david.kim@company.com",
    phone: "+1 (555) 100-0005",
    avatar: "DK",
    status: "offline",
    manager: "1",
  },
  {
    id: "6",
    name: "Alex Thompson",
    title: "Engineering Manager",
    department: "Engineering",
    location: "Austin, TX",
    email: "alex.thompson@company.com",
    phone: "+1 (555) 100-0006",
    avatar: "AT",
    status: "online",
    manager: "2",
  },
  {
    id: "7",
    name: "Lisa Wang",
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "Remote",
    email: "lisa.wang@company.com",
    phone: "+1 (555) 100-0007",
    avatar: "LW",
    status: "online",
    manager: "2",
  },
  {
    id: "8",
    name: "Robert Johnson",
    title: "Marketing Manager",
    department: "Marketing",
    location: "New York, NY",
    email: "robert.johnson@company.com",
    phone: "+1 (555) 100-0008",
    avatar: "RJ",
    status: "away",
    manager: "3",
  },
];

const departments = [
  { name: "All Departments", count: 8 },
  { name: "Engineering", count: 3 },
  { name: "Marketing", count: 2 },
  { name: "Sales", count: 1 },
  { name: "Human Resources", count: 1 },
  { name: "Executive", count: 1 },
];

type ViewMode = "grid" | "list" | "org";

const statusColors = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  offline: "bg-gray-500",
};

export default function PeoplePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["1", "2"]));

  const filteredPeople = samplePeople.filter((person) => {
    const matchesSearch =
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "All Departments" ||
      person.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const buildOrgTree = (people: Person[]): OrgNode | null => {
    const ceo = people.find((p) => !p.manager);
    if (!ceo) return null;

    const buildNode = (person: Person): OrgNode => {
      const children = people
        .filter((p) => p.manager === person.id)
        .map(buildNode);
      return { person, children, expanded: expandedNodes.has(person.id) };
    };

    return buildNode(ceo);
  };

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

  const renderOrgNode = (node: OrgNode, level: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.person.id);

    return (
      <div key={node.person.id} className="flex flex-col items-center">
        <div
          className={`bg-[#0f0f14] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-blue-500/30 transition-colors ${
            selectedPerson?.id === node.person.id ? "border-blue-500" : ""
          }`}
          onClick={() => setSelectedPerson(node.person)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                {node.person.avatar}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f0f14] ${
                  statusColors[node.person.status]
                }`}
              />
            </div>
            <div className="text-left">
              <h4 className="text-white font-medium text-sm">{node.person.name}</h4>
              <p className="text-white/50 text-xs">{node.person.title}</p>
            </div>
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.person.id);
                }}
                className="ml-2 p-1 rounded hover:bg-white/10"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-white/50" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white/50" />
                )}
              </button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-4 relative">
            <div className="absolute top-0 left-1/2 w-px h-4 bg-white/20 -translate-x-1/2" />
            <div className="flex gap-6 pt-4">
              {node.children.map((child, idx) => (
                <div key={child.person.id} className="relative">
                  {idx === 0 && node.children.length > 1 && (
                    <div className="absolute top-0 left-1/2 right-0 h-px bg-white/20" style={{ width: `${(node.children.length - 1) * 100}%` }} />
                  )}
                  <div className="absolute top-0 left-1/2 w-px h-4 bg-white/20 -translate-x-1/2" />
                  <div className="pt-4">
                    {renderOrgNode(child, level + 1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const orgTree = buildOrgTree(samplePeople);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />

      <main className="ml-16 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-medium text-white mb-2">
                People Directory
              </h1>
              <p className="text-white/50">
                {samplePeople.length} employees across the organization
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("org")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "org"
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Network className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, title, or email..."
                className="w-full bg-[#0f0f14] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-[#0f0f14] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept.name} value={dept.name}>
                  {dept.name} ({dept.count})
                </option>
              ))}
            </select>
          </div>

          {/* Content based on view mode */}
          {viewMode === "org" ? (
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-8 overflow-x-auto">
              <h2 className="text-lg font-medium text-white mb-8 flex items-center gap-2">
                <Network className="w-5 h-5 text-blue-400" />
                Organization Chart
              </h2>
              <div className="flex justify-center">
                {orgTree && renderOrgNode(orgTree)}
              </div>
            </div>
          ) : (
            <div className="flex gap-6">
              {/* People List/Grid */}
              <div className="flex-1">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-3 gap-4">
                    {filteredPeople.map((person) => (
                      <div
                        key={person.id}
                        onClick={() => setSelectedPerson(person)}
                        className={`bg-[#0f0f14] border rounded-xl p-4 cursor-pointer transition-all hover:border-blue-500/30 ${
                          selectedPerson?.id === person.id
                            ? "border-blue-500"
                            : "border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                              {person.avatar}
                            </div>
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f0f14] ${
                                statusColors[person.status]
                              }`}
                            />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">
                              {person.name}
                            </h4>
                            <p className="text-sm text-white/50">{person.title}</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-white/40">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {person.department}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {person.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#0f0f14] border border-white/10 rounded-xl divide-y divide-white/10">
                    {filteredPeople.map((person) => (
                      <div
                        key={person.id}
                        onClick={() => setSelectedPerson(person)}
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-white/5 ${
                          selectedPerson?.id === person.id ? "bg-blue-500/10" : ""
                        }`}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                            {person.avatar}
                          </div>
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0f0f14] ${
                              statusColors[person.status]
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{person.name}</h4>
                          <p className="text-sm text-white/50">{person.title}</p>
                        </div>
                        <div className="text-sm text-white/40">{person.department}</div>
                        <div className="text-sm text-white/40">{person.location}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Person Detail Panel */}
              {selectedPerson && (
                <div className="w-80 bg-[#0f0f14] border border-white/10 rounded-xl p-6 flex-shrink-0 h-fit">
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-medium mx-auto">
                        {selectedPerson.avatar}
                      </div>
                      <span
                        className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#0f0f14] ${
                          statusColors[selectedPerson.status]
                        }`}
                      />
                    </div>
                    <h3 className="text-xl font-medium text-white mt-4">
                      {selectedPerson.name}
                    </h3>
                    <p className="text-white/50">{selectedPerson.title}</p>
                    <p className="text-sm text-white/40">{selectedPerson.department}</p>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white text-sm transition-colors">
                      <Calendar className="w-4 h-4" />
                      Schedule
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-white/40" />
                      <a
                        href={`mailto:${selectedPerson.email}`}
                        className="text-blue-400 hover:underline"
                      >
                        {selectedPerson.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-white/40" />
                      <span className="text-white/70">{selectedPerson.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-white/40" />
                      <span className="text-white/70">{selectedPerson.location}</span>
                    </div>
                  </div>

                  {selectedPerson.manager && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">
                        Reports To
                      </h4>
                      <div className="flex items-center gap-3">
                        {(() => {
                          const manager = samplePeople.find(
                            (p) => p.id === selectedPerson.manager
                          );
                          return manager ? (
                            <>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                {manager.avatar}
                              </div>
                              <div>
                                <p className="text-sm text-white">{manager.name}</p>
                                <p className="text-xs text-white/50">{manager.title}</p>
                              </div>
                            </>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  )}

                  {selectedPerson.reports && selectedPerson.reports.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">
                        Direct Reports ({selectedPerson.reports.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedPerson.reports.map((reportId) => {
                          const report = samplePeople.find((p) => p.id === reportId);
                          return report ? (
                            <div
                              key={report.id}
                              className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-lg p-2 -mx-2"
                              onClick={() => setSelectedPerson(report)}
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                {report.avatar}
                              </div>
                              <div>
                                <p className="text-sm text-white">{report.name}</p>
                                <p className="text-xs text-white/50">{report.title}</p>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
