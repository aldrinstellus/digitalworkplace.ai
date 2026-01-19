"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Search,
  FolderOpen,
  FileText,
  Plus,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Star,
  Clock,
  User,
  Tag,
  Eye,
  Lock,
  Building2,
  BookOpen,
  File,
  Image,
  Video,
  Link2,
  Download,
  Share2,
  History,
  CheckCircle2,
} from "lucide-react";

interface KBItem {
  id: string;
  name: string;
  type: "folder" | "article" | "file";
  department?: string;
  children?: KBItem[];
  updatedAt?: string;
  updatedBy?: string;
  status?: "draft" | "published" | "archived";
  tags?: string[];
  views?: number;
  isLocked?: boolean;
}

const sampleKBStructure: KBItem[] = [
  {
    id: "1",
    name: "Engineering",
    type: "folder",
    department: "Engineering",
    children: [
      {
        id: "1-1",
        name: "Development Guidelines",
        type: "folder",
        children: [
          {
            id: "1-1-1",
            name: "Code Review Standards",
            type: "article",
            updatedAt: "2 hours ago",
            updatedBy: "Sarah Chen",
            status: "published",
            tags: ["development", "standards"],
            views: 234,
          },
          {
            id: "1-1-2",
            name: "Git Workflow",
            type: "article",
            updatedAt: "Yesterday",
            updatedBy: "Alex Thompson",
            status: "published",
            tags: ["git", "workflow"],
            views: 156,
          },
        ],
      },
      {
        id: "1-2",
        name: "Architecture Documents",
        type: "folder",
        children: [
          {
            id: "1-2-1",
            name: "System Architecture Overview",
            type: "article",
            updatedAt: "1 week ago",
            updatedBy: "Sarah Chen",
            status: "published",
            tags: ["architecture", "system"],
            views: 89,
          },
        ],
      },
      {
        id: "1-3",
        name: "API Documentation",
        type: "article",
        updatedAt: "3 days ago",
        updatedBy: "Lisa Wang",
        status: "published",
        tags: ["api", "documentation"],
        views: 412,
      },
    ],
  },
  {
    id: "2",
    name: "Human Resources",
    type: "folder",
    department: "HR",
    children: [
      {
        id: "2-1",
        name: "Policies",
        type: "folder",
        children: [
          {
            id: "2-1-1",
            name: "Employee Handbook",
            type: "article",
            updatedAt: "1 month ago",
            updatedBy: "David Kim",
            status: "published",
            tags: ["policy", "handbook"],
            views: 892,
          },
          {
            id: "2-1-2",
            name: "Vacation Policy",
            type: "article",
            updatedAt: "2 weeks ago",
            updatedBy: "David Kim",
            status: "published",
            tags: ["policy", "vacation"],
            views: 567,
          },
        ],
      },
      {
        id: "2-2",
        name: "Benefits Guide",
        type: "article",
        updatedAt: "1 week ago",
        updatedBy: "David Kim",
        status: "published",
        tags: ["benefits", "guide"],
        views: 345,
      },
    ],
  },
  {
    id: "3",
    name: "Marketing",
    type: "folder",
    department: "Marketing",
    children: [
      {
        id: "3-1",
        name: "Brand Guidelines",
        type: "article",
        updatedAt: "3 days ago",
        updatedBy: "Michael Park",
        status: "published",
        tags: ["brand", "guidelines"],
        views: 234,
      },
      {
        id: "3-2",
        name: "Campaign Templates",
        type: "folder",
        children: [
          {
            id: "3-2-1",
            name: "Email Templates",
            type: "article",
            updatedAt: "1 week ago",
            updatedBy: "Robert Johnson",
            status: "draft",
            tags: ["email", "templates"],
            views: 78,
          },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Sales",
    type: "folder",
    department: "Sales",
    children: [
      {
        id: "4-1",
        name: "Sales Playbook",
        type: "article",
        updatedAt: "5 days ago",
        updatedBy: "Emily Rodriguez",
        status: "published",
        tags: ["sales", "playbook"],
        views: 456,
        isLocked: true,
      },
    ],
  },
];

interface TreeNodeProps {
  item: KBItem;
  level: number;
  expandedFolders: Set<string>;
  selectedItem: string | null;
  onToggleFolder: (id: string) => void;
  onSelectItem: (id: string) => void;
}

function TreeNode({
  item,
  level,
  expandedFolders,
  selectedItem,
  onToggleFolder,
  onSelectItem,
}: TreeNodeProps) {
  const isExpanded = expandedFolders.has(item.id);
  const isFolder = item.type === "folder";
  const isSelected = selectedItem === item.id;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? "bg-blue-500/20 text-blue-400"
            : "hover:bg-white/5 text-white/70"
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => {
          if (isFolder) {
            onToggleFolder(item.id);
          }
          onSelectItem(item.id);
        }}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
            )}
            <FolderOpen className={`w-4 h-4 flex-shrink-0 ${isExpanded ? "text-blue-400" : "text-yellow-400"}`} />
          </>
        ) : (
          <>
            <span className="w-4" />
            <FileText className="w-4 h-4 text-white/40 flex-shrink-0" />
          </>
        )}
        <span className="truncate text-sm">{item.name}</span>
        {item.status === "draft" && (
          <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">
            Draft
          </span>
        )}
        {item.isLocked && <Lock className="w-3 h-3 text-white/30" />}
      </div>
      {isFolder && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              level={level + 1}
              expandedFolders={expandedFolders}
              selectedItem={selectedItem}
              onToggleFolder={onToggleFolder}
              onSelectItem={onSelectItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function findItem(items: KBItem[], id: string): KBItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItem(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["1", "2"])
  );
  const [selectedItem, setSelectedItem] = useState<string | null>("1-1-1");
  const [showNewMenu, setShowNewMenu] = useState(false);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selected = selectedItem ? findItem(sampleKBStructure, selectedItem) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />

      <main className="ml-16 h-screen flex">
        {/* Left Panel - Tree View */}
        <div className="w-80 border-r border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Knowledge Base
              </h2>
              <div className="relative">
                <button
                  onClick={() => setShowNewMenu(!showNewMenu)}
                  className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {showNewMenu && (
                  <div className="absolute right-0 top-10 w-48 bg-[#1a1a1f] border border-white/10 rounded-lg shadow-xl z-50">
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">
                      <FolderOpen className="w-4 h-4" />
                      New Folder
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">
                      <FileText className="w-4 h-4" />
                      New Article
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">
                      <File className="w-4 h-4" />
                      Upload File
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search knowledge base..."
                className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Tree View */}
          <div className="flex-1 overflow-y-auto py-2">
            {sampleKBStructure.map((item) => (
              <TreeNode
                key={item.id}
                item={item}
                level={0}
                expandedFolders={expandedFolders}
                selectedItem={selectedItem}
                onToggleFolder={toggleFolder}
                onSelectItem={setSelectedItem}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Content View */}
        <div className="flex-1 flex flex-col">
          {selected && selected.type === "article" ? (
            <>
              {/* Article Header */}
              <div className="border-b border-white/10 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-medium text-white">
                        {selected.name}
                      </h1>
                      {selected.status === "published" && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Published
                        </span>
                      )}
                      {selected.status === "draft" && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {selected.updatedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selected.updatedAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {selected.views} views
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                      <Star className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                      <History className="w-5 h-5" />
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-colors">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {selected.tags && (
                  <div className="flex items-center gap-2 mt-4">
                    <Tag className="w-4 h-4 text-white/40" />
                    {selected.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Article Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl">
                  <div className="prose prose-invert prose-sm">
                    <p className="text-white/70 leading-relaxed">
                      This is a sample article content area. In the production
                      version, this would display the full rich text content of
                      the knowledge base article, including:
                    </p>
                    <ul className="text-white/60 space-y-2 mt-4">
                      <li>Formatted text with headings and paragraphs</li>
                      <li>Code blocks and syntax highlighting</li>
                      <li>Images and embedded media</li>
                      <li>Tables and lists</li>
                      <li>Links to related articles</li>
                      <li>Inline comments and annotations</li>
                    </ul>

                    <h2 className="text-lg font-medium text-white mt-8 mb-4">
                      Overview
                    </h2>
                    <p className="text-white/70 leading-relaxed">
                      The content would be stored in a structured format and
                      rendered using a rich text editor. Users with appropriate
                      permissions can edit the content directly in the browser.
                    </p>

                    <h2 className="text-lg font-medium text-white mt-8 mb-4">
                      Getting Started
                    </h2>
                    <p className="text-white/70 leading-relaxed">
                      To get started, review the related documentation and
                      follow the step-by-step guide below. Make sure you have
                      the necessary permissions to access all referenced
                      materials.
                    </p>

                    <div className="bg-[#0f0f14] border border-white/10 rounded-lg p-4 mt-6">
                      <code className="text-sm text-blue-400">
                        // Example code block
                        <br />
                        const guidelines = await fetchGuidelines();
                        <br />
                        applyStandards(guidelines);
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : selected && selected.type === "folder" ? (
            <div className="flex-1 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-xl font-medium text-white">
                    {selected.name}
                  </h1>
                  <p className="text-sm text-white/50">
                    {selected.children?.length || 0} items
                  </p>
                </div>
              </div>

              {selected.children && selected.children.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {selected.children.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => {
                        setSelectedItem(child.id);
                        if (child.type === "folder") {
                          setExpandedFolders((prev) => new Set([...prev, child.id]));
                        }
                      }}
                      className="bg-[#0f0f14] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-blue-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {child.type === "folder" ? (
                          <FolderOpen className="w-8 h-8 text-yellow-400" />
                        ) : (
                          <FileText className="w-8 h-8 text-blue-400" />
                        )}
                      </div>
                      <h3 className="text-white font-medium mb-1 truncate">
                        {child.name}
                      </h3>
                      {child.type === "article" && (
                        <p className="text-xs text-white/40">
                          Updated {child.updatedAt}
                        </p>
                      )}
                      {child.type === "folder" && (
                        <p className="text-xs text-white/40">
                          {child.children?.length || 0} items
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">This folder is empty</p>
                  <button className="mt-4 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors">
                    Add Content
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/50 mb-2">
                  Select an item
                </h3>
                <p className="text-sm text-white/30">
                  Choose a folder or article from the tree view
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
