"use client";

import { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { FadeIn, StaggerContainer, StaggerItem } from "@/lib/motion";
import { mockKBCategories, mockArticles, mockDepartments, type MockKBCategory, type MockArticle, type MockDepartment } from "@/lib/mockData";
import { ArticleEditor } from "@/components/content/ArticleEditor";
import { CreateContentModal } from "@/components/content/CreateContentModal";
import { VersionHistoryModal } from "@/components/content/VersionHistoryModal";
import { ArticleApprovalPanel } from "@/components/content/ArticleApprovalPanel";
import { FrameworkComparisonModal } from "@/components/content/FrameworkComparisonModal";
import DOMPurify from "isomorphic-dompurify";
import {
  Search,
  FolderOpen,
  FileText,
  Plus,
  ChevronRight,
  ChevronDown,
  Edit,
  Star,
  Clock,
  Tag,
  Eye,
  BookOpen,
  File,
  Share2,
  History,
  CheckCircle2,
  Loader2,
  ThumbsUp,
  Check,
  ClipboardCheck,
  Layers,
  Box,
  Zap,
  GitBranch,
  Code,
  ExternalLink,
  Scale,
  MessageSquare,
  Building2,
  Users,
  Lock,
  Globe,
  Folder,
  Cloud,
  Palette,
  StickyNote,
  Target,
  Video,
  Briefcase,
  Filter,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";
import { getExternalDocuments, getExternalDocumentCounts, type ExternalDocument } from "@/lib/integratedData";
import { SOURCE_DISPLAY, type DataSource } from "@/lib/unifiedTypes";
// Types imported from mockData

// Client type definition for multi-client isolation
interface Client {
  id: string;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
}

// Mock clients data
const CLIENTS: Client[] = [
  { id: "all", name: "All Clients", shortName: "All", color: "text-white", bgColor: "bg-white/20" },
  { id: "acme", name: "Acme Corp", shortName: "Acme", color: "text-blue-400", bgColor: "bg-blue-500/20" },
  { id: "techco", name: "TechCo Industries", shortName: "TechCo", color: "text-purple-400", bgColor: "bg-purple-500/20" },
  { id: "globalbank", name: "GlobalBank", shortName: "GBank", color: "text-green-400", bgColor: "bg-green-500/20" },
  { id: "healthplus", name: "HealthPlus", shortName: "Health+", color: "text-pink-400", bgColor: "bg-pink-500/20" },
];

// Framework type definition
interface Framework {
  id: string;
  name: string;
  description: string;
  icon: "code" | "zap" | "gitbranch" | "layers" | "box";
  color: string;
  articleCount: number;
  tags: string[];
  status: "active" | "deprecated" | "experimental";
  version?: string;
  docsUrl?: string;
  assignedClients: string[]; // Client IDs this framework is assigned to
}

// Mock frameworks data - in production this would come from the database
const FRAMEWORKS: Framework[] = [
  {
    id: "react-patterns",
    name: "React Patterns",
    description: "Best practices and design patterns for React development at scale",
    icon: "code",
    color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    articleCount: 15,
    tags: ["frontend", "react", "patterns"],
    status: "active",
    version: "2.1.0",
    docsUrl: "https://react.dev",
    assignedClients: ["acme", "techco"],
  },
  {
    id: "api-design",
    name: "REST API Guidelines",
    description: "Standards for designing and implementing RESTful APIs",
    icon: "zap",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    articleCount: 12,
    tags: ["backend", "api", "rest"],
    status: "active",
    version: "3.0.0",
    assignedClients: ["acme", "globalbank", "healthplus"],
  },
  {
    id: "microservices",
    name: "Microservices Architecture",
    description: "Patterns and practices for building distributed systems",
    icon: "layers",
    color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    articleCount: 18,
    tags: ["architecture", "backend", "distributed"],
    status: "active",
    assignedClients: ["techco", "globalbank"],
    version: "1.5.0",
  },
  {
    id: "data-pipeline",
    name: "Data Pipeline Framework",
    description: "ETL and data processing pipeline standards",
    icon: "gitbranch",
    color: "text-green-400 bg-green-400/10 border-green-400/20",
    articleCount: 8,
    tags: ["data", "etl", "analytics"],
    status: "active",
    version: "2.0.0",
    assignedClients: ["globalbank", "healthplus"],
  },
  {
    id: "testing-framework",
    name: "Testing Framework",
    description: "Unit, integration, and E2E testing standards",
    icon: "box",
    color: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    articleCount: 10,
    tags: ["testing", "quality", "automation"],
    status: "active",
    version: "1.3.0",
    assignedClients: ["acme", "techco", "globalbank", "healthplus"],
  },
  {
    id: "security-baseline",
    name: "Security Baseline",
    description: "Security standards and compliance requirements",
    icon: "layers",
    color: "text-red-400 bg-red-400/10 border-red-400/20",
    articleCount: 14,
    tags: ["security", "compliance", "baseline"],
    status: "active",
    version: "4.0.0",
    assignedClients: ["globalbank", "healthplus"],
  },
  {
    id: "legacy-patterns",
    name: "Legacy Integration",
    description: "Patterns for integrating with legacy systems (deprecated)",
    icon: "code",
    color: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    articleCount: 6,
    tags: ["legacy", "integration"],
    status: "deprecated",
    version: "1.0.0",
    assignedClients: ["acme"],
  },
  {
    id: "ai-ml-ops",
    name: "AI/ML Operations",
    description: "MLOps patterns and AI deployment standards (experimental)",
    icon: "zap",
    color: "text-pink-400 bg-pink-400/10 border-pink-400/20",
    articleCount: 5,
    tags: ["ai", "ml", "mlops"],
    status: "experimental",
    version: "0.9.0",
    assignedClients: ["techco"],
  },
];

// Framework icon mapping
const frameworkIcons = {
  code: Code,
  zap: Zap,
  gitbranch: GitBranch,
  layers: Layers,
  box: Box,
};

interface TreeItem {
  id: string;
  name: string;
  type: "folder" | "article";
  slug?: string;
  children?: TreeItem[];
  article?: MockArticle;
  category?: MockKBCategory;
}

interface TreeNodeProps {
  item: TreeItem;
  level: number;
  expandedFolders: Set<string>;
  selectedItem: string | null;
  onToggleFolder: (id: string) => void;
  onSelectItem: (id: string, item: TreeItem) => void;
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
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
            : "hover:bg-[var(--bg-slate)] text-[var(--text-secondary)]"
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => {
          if (isFolder) {
            onToggleFolder(item.id);
          }
          onSelectItem(item.id, item);
        }}
        whileHover={{ x: 2 }}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
            )}
            <FolderOpen
              className={`w-4 h-4 flex-shrink-0 ${
                isExpanded ? "text-[var(--accent-ember)]" : "text-[var(--accent-gold)]"
              }`}
            />
          </>
        ) : (
          <>
            <span className="w-4" />
            <FileText className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
          </>
        )}
        <span className="truncate text-sm">{item.name}</span>
        {item.article?.status === "draft" && (
          <span className="px-1.5 py-0.5 rounded text-xs bg-[var(--warning)]/20 text-[var(--warning)]">
            Draft
          </span>
        )}
      </motion.div>
      <AnimatePresence>
        {isFolder && isExpanded && item.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// App icons for external sources
const SOURCE_ICONS: Record<string, React.ReactNode> = {
  drive: <Folder className="w-4 h-4" />,
  confluence: <BookOpen className="w-4 h-4" />,
  notion: <StickyNote className="w-4 h-4" />,
  figma: <Palette className="w-4 h-4" />,
  slack: <MessageSquare className="w-4 h-4" />,
  jira: <Target className="w-4 h-4" />,
  github: <GitBranch className="w-4 h-4" />,
  zoom: <Video className="w-4 h-4" />,
  salesforce: <Cloud className="w-4 h-4" />,
  linkedin: <Briefcase className="w-4 h-4" />,
  'auzmor-office': <Building2 className="w-4 h-4" />,
};

const SOURCE_COLORS: Record<string, string> = {
  drive: '#4285F4',
  confluence: '#172B4D',
  notion: '#000000',
  figma: '#F24E1E',
  slack: '#4A154B',
  jira: '#0052CC',
  github: '#24292e',
  zoom: '#2D8CFF',
  salesforce: '#00A1E0',
  linkedin: '#0077B5',
  'auzmor-office': '#10b981',
};

function ContentPageInner() {
  const searchParams = useSearchParams();
  const urlView = searchParams.get("view");
  const [viewMode, setViewMode] = useState<"browse" | "recent" | "frameworks" | "external">(
    urlView === "recent" ? "recent" : urlView === "frameworks" ? "frameworks" : urlView === "external" ? "external" : "browse"
  );
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [frameworkFilter, setFrameworkFilter] = useState<"all" | "active" | "deprecated" | "experimental">("all");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [externalSourceFilter, setExternalSourceFilter] = useState<DataSource | 'all'>('all');
  const [externalDocuments, setExternalDocuments] = useState<ExternalDocument[]>([]);
  const [externalCounts, setExternalCounts] = useState<Record<string, number>>({});

  // Load external documents
  useEffect(() => {
    const docs = getExternalDocuments({
      sources: externalSourceFilter === 'all' ? undefined : [externalSourceFilter],
      sortBy: 'date',
      sortOrder: 'desc',
    });
    setExternalDocuments(docs);
    setExternalCounts(getExternalDocumentCounts());
  }, [externalSourceFilter]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "views">("name");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<TreeItem | null>(null);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showArticleEditor, setShowArticleEditor] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState<"category" | "article" | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showApprovalPanel, setShowApprovalPanel] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Framework comparison state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Use mock data for consistent IDs across the app
  const categories = mockKBCategories;
  const categoriesLoading = false;
  const articles = mockArticles;
  const articlesLoading = false;
  const departments = mockDepartments;
  const departmentsLoading = false;

  // Get recent articles (sorted by updated_at)
  const recentArticles = useMemo(() => {
    return [...articles]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 20);
  }, [articles]);

  // Filter frameworks based on selected filter and client
  const filteredFrameworks = useMemo(() => {
    let filtered = FRAMEWORKS;

    // Filter by status
    if (frameworkFilter !== "all") {
      filtered = filtered.filter(f => f.status === frameworkFilter);
    }

    // Filter by client
    if (selectedClient !== "all") {
      filtered = filtered.filter(f => f.assignedClients.includes(selectedClient));
    }

    return filtered;
  }, [frameworkFilter, selectedClient]);

  // Get the selected client object
  const selectedClientObj = CLIENTS.find(c => c.id === selectedClient) || CLIENTS[0];

  // Get frameworks selected for comparison
  const getSelectedComparisonFrameworks = (): Framework[] => {
    return FRAMEWORKS.filter(f => selectedForComparison.has(f.id));
  };

  // Toggle framework selection for comparison
  const toggleFrameworkForComparison = (frameworkId: string) => {
    setSelectedForComparison(prev => {
      const next = new Set(prev);
      if (next.has(frameworkId)) {
        next.delete(frameworkId);
      } else if (next.size < 2) {
        next.add(frameworkId);
      }
      return next;
    });
  };

  // Handle opening comparison modal
  const handleOpenComparison = () => {
    if (selectedForComparison.size === 2) {
      setShowComparisonModal(true);
    }
  };

  // Get articles for a specific framework (by tag matching)
  const getFrameworkArticles = (framework: Framework) => {
    return articles.filter(article => {
      const articleTags = (article.tags as string[]) || [];
      return framework.tags.some(tag => articleTags.includes(tag));
    });
  };

  // Handle article save
  const handleSaveArticle = async (data: {
    title: string;
    content: string;
    summary: string;
    tags: string[];
    status: string;
  }) => {
    // In production, save to Supabase
    console.log("Saving article:", data);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setShowArticleEditor(false);
  };

  // Handle create content
  const handleCreateContent = async (data: {
    name?: string;
    title?: string;
    slug: string;
    description?: string;
    departmentId?: string;
    categoryId?: string;
  }) => {
    // In production, create in Supabase
    console.log("Creating content:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // Handle version restore
  const handleVersionRestore = async (version: { id: string; content: string }) => {
    console.log("Restoring version:", version.id);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // Handle share
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  // Handle delete article
  const handleDeleteArticle = async () => {
    if (!selectedData?.article) return;

    setIsDeleting(true);
    try {
      // In production, call delete API
      const response = await fetch(`/diq/api/content/${selectedData.article.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Clear selection and close confirmation
        setSelectedData(null);
        setSelectedItem(null);
        setShowDeleteConfirm(false);
        // In production, would refresh the tree
        console.log("Article deleted:", selectedData.article.id);
      } else {
        console.error("Failed to delete article");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle bookmark toggle
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In production, save to user bookmarks in Supabase
  };

  const loading = categoriesLoading || articlesLoading || departmentsLoading;

  // Build tree structure from categories and articles
  const treeData = useMemo(() => {
    if (!categories.length && !articles.length) return [];

    // Group categories by department
    const deptMap = new Map<string, TreeItem>();

    // Create department folders
    departments.forEach((dept) => {
      deptMap.set(dept.id, {
        id: `dept-${dept.id}`,
        name: dept.name,
        type: "folder",
        children: [],
      });
    });

    // Add categories as subfolders
    categories.forEach((cat) => {
      const catItem: TreeItem = {
        id: `cat-${cat.id}`,
        name: cat.name,
        type: "folder",
        slug: cat.slug,
        category: cat,
        children: [],
      };

      // Find articles for this category and sort them
      const categoryArticles = articles.filter((a) => a.category_id === cat.id);
      const sortedCategoryArticles = [...categoryArticles].sort((a, b) => {
        switch (sortBy) {
          case "date":
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          case "views":
            return (b.view_count || 0) - (a.view_count || 0);
          case "name":
          default:
            return a.title.localeCompare(b.title);
        }
      });
      catItem.children = sortedCategoryArticles.map((article) => ({
        id: `article-${article.id}`,
        name: article.title,
        type: "article" as const,
        slug: article.slug,
        article,
      }));

      // Add to department folder or root
      if (cat.department_id && deptMap.has(cat.department_id)) {
        deptMap.get(cat.department_id)!.children!.push(catItem);
      } else {
        // Add to a "General" folder if no department
        if (!deptMap.has("general")) {
          deptMap.set("general", {
            id: "dept-general",
            name: "General",
            type: "folder",
            children: [],
          });
        }
        deptMap.get("general")!.children!.push(catItem);
      }
    });

    // Convert map to array and filter out empty departments
    return Array.from(deptMap.values()).filter(
      (dept) => dept.children && dept.children.length > 0
    );
  }, [categories, articles, departments, sortBy]);

  // Auto-expand first folder (using useEffect to avoid state update during render)
  const hasExpandedFirstFolderRef = useRef(false);
  useEffect(() => {
    if (treeData.length > 0 && expandedFolders.size === 0 && !hasExpandedFirstFolderRef.current) {
      hasExpandedFirstFolderRef.current = true;
      setExpandedFolders(new Set([treeData[0].id]));
    }
  }, [treeData, expandedFolders.size]);

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

  const handleSelectItem = (id: string, item: TreeItem) => {
    setSelectedItem(id);
    setSelectedData(item);
  };

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!searchQuery) return treeData;

    const filterItems = (items: TreeItem[]): TreeItem[] => {
      return items
        .map((item) => {
          if (item.type === "folder" && item.children) {
            const filteredChildren = filterItems(item.children);
            if (
              filteredChildren.length > 0 ||
              item.name.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
              return { ...item, children: filteredChildren };
            }
            return null;
          }
          if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return item;
          }
          return null;
        })
        .filter((item): item is TreeItem => item !== null);
    };

    return filterItems(treeData);
  }, [treeData, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />

      <main className="ml-16 h-screen flex">
        {/* Left Panel - Tree View */}
        <FadeIn className="w-80 border-r border-[var(--border-subtle)] flex flex-col bg-[var(--bg-charcoal)] flex-shrink-0 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-subtle)]">
            {/* Title Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--accent-ember)] flex-shrink-0" />
                <h2 className="text-sm font-medium text-[var(--text-primary)]">
                  {viewMode === "recent" ? "Recent" : "Knowledge Base Categories"}
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.button
                  onClick={() => setShowApprovalPanel(true)}
                  className="p-1.5 rounded-lg bg-[var(--warning)]/20 border border-[var(--warning)]/30 hover:bg-[var(--warning)]/30 text-[var(--warning)] transition-colors"
                  title="Pending Approvals"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                </motion.button>
                <div className="relative">
                  <motion.button
                    onClick={() => setShowNewMenu(!showNewMenu)}
                    className="p-1.5 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-white transition-colors"
                    title="Create New"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </motion.button>
                  <AnimatePresence>
                    {showNewMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNewMenu(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 top-9 w-44 bg-[var(--bg-charcoal)] border border-[var(--border-default)] rounded-lg shadow-xl z-50 overflow-hidden"
                        >
                          <button
                            onClick={() => {
                              setShowNewMenu(false);
                              setShowCreateModal("category");
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-slate)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            <FolderOpen className="w-4 h-4" />
                            New Category
                          </button>
                          <button
                            onClick={() => {
                              setShowNewMenu(false);
                              setSelectedData(null);
                              setShowArticleEditor(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-slate)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            New Article
                          </button>
                          <button
                            onClick={() => {
                              setShowNewMenu(false);
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = ".pdf,.doc,.docx,.txt,.md";
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) console.log("Uploading file:", file.name);
                              };
                              input.click();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-slate)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            <File className="w-4 h-4" />
                            Upload File
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-[var(--bg-slate)] rounded-lg p-0.5 mb-3">
              <motion.button
                onClick={() => setViewMode("browse")}
                className={`flex-1 px-2 py-1.5 text-xs rounded-md transition-colors ${
                  viewMode === "browse"
                    ? "bg-[var(--accent-ember)] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
                whileTap={{ scale: 0.98 }}
              >
                Browse
              </motion.button>
              <motion.button
                onClick={() => setViewMode("frameworks")}
                className={`flex-1 px-2 py-1.5 text-xs rounded-md transition-colors flex items-center justify-center gap-1 ${
                  viewMode === "frameworks"
                    ? "bg-[var(--accent-ember)] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <Layers className="w-3 h-3" />
                Frameworks
              </motion.button>
              <motion.button
                onClick={() => setViewMode("recent")}
                className={`flex-1 px-2 py-1.5 text-xs rounded-md transition-colors flex items-center justify-center gap-1 ${
                  viewMode === "recent"
                    ? "bg-[var(--accent-ember)] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <Clock className="w-3 h-3" />
                Recent
              </motion.button>
              <motion.button
                onClick={() => setViewMode("external")}
                className={`flex-1 px-2 py-1.5 text-xs rounded-md transition-colors flex items-center justify-center gap-1 ${
                  viewMode === "external"
                    ? "bg-[var(--accent-ember)] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <Globe className="w-3 h-3" />
                External
              </motion.button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-all"
              />
            </div>

            {/* Sort Options (visible in browse mode) */}
            {viewMode === "browse" && (
              <div className="flex items-center gap-2 mt-3">
                <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]">Sort:</span>
                <div className="flex items-center bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg p-0.5">
                  <button
                    onClick={() => setSortBy("name")}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      sortBy === "name"
                        ? "bg-[var(--accent-ember)] text-white"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Name
                  </button>
                  <button
                    onClick={() => setSortBy("date")}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      sortBy === "date"
                        ? "bg-[var(--accent-ember)] text-white"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Date
                  </button>
                  <button
                    onClick={() => setSortBy("views")}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      sortBy === "views"
                        ? "bg-[var(--accent-ember)] text-white"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Views
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tree View, Frameworks List, or Recent List */}
          <div className="flex-1 overflow-y-auto py-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-ember)]" />
              </div>
            ) : viewMode === "frameworks" ? (
              /* Frameworks List */
              <div className="px-2">
                {/* Framework Filter and Compare Toggle */}
                <div className="flex items-center justify-between gap-2 mb-3 px-2">
                  <div className="flex items-center gap-1">
                    {(["all", "active", "deprecated", "experimental"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setFrameworkFilter(filter)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors capitalize ${
                          frameworkFilter === filter
                            ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)]"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                  <motion.button
                    onClick={() => {
                      setComparisonMode(!comparisonMode);
                      if (comparisonMode) {
                        setSelectedForComparison(new Set());
                      }
                    }}
                    className={`px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                      comparisonMode
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)] border border-transparent"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Scale className="w-3 h-3" />
                    Compare
                  </motion.button>
                </div>

                {/* Compare Selected Button - appears when 2 frameworks selected */}
                <AnimatePresence>
                  {comparisonMode && selectedForComparison.size === 2 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-2 mb-3"
                    >
                      <motion.button
                        onClick={handleOpenComparison}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium shadow-lg shadow-emerald-500/20"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Scale className="w-4 h-4" />
                        Compare Selected (2)
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Comparison Mode Instructions */}
                {comparisonMode && selectedForComparison.size < 2 && (
                  <div className="px-2 mb-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs text-emerald-400">
                      Select {2 - selectedForComparison.size} more framework{selectedForComparison.size === 1 ? "" : "s"} to compare
                    </div>
                  </div>
                )}

                {filteredFrameworks.length === 0 ? (
                  <div className="text-center py-8">
                    <Layers className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--text-muted)]">No frameworks found</p>
                  </div>
                ) : (
                  <StaggerContainer>
                    {filteredFrameworks.map((framework) => {
                      const IconComponent = frameworkIcons[framework.icon];
                      const isSelectedForComparison = selectedForComparison.has(framework.id);
                      return (
                        <StaggerItem key={framework.id}>
                          <motion.div
                            onClick={() => {
                              if (comparisonMode) {
                                toggleFrameworkForComparison(framework.id);
                              } else {
                                setSelectedFramework(framework);
                                setSelectedItem(null);
                                setSelectedData(null);
                              }
                            }}
                            className={`flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-1 ${
                              isSelectedForComparison
                                ? "bg-emerald-500/20 border border-emerald-500/30"
                                : selectedFramework?.id === framework.id
                                ? "bg-[var(--accent-ember)]/20 border border-[var(--accent-ember)]/30"
                                : "hover:bg-[var(--bg-slate)] border border-transparent"
                            }`}
                            whileHover={{ x: 2 }}
                          >
                            {/* Comparison Mode Checkbox */}
                            {comparisonMode && (
                              <div
                                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isSelectedForComparison
                                    ? "bg-emerald-500 text-white"
                                    : "border border-[var(--border-default)] bg-[var(--bg-slate)]"
                                }`}
                              >
                                {isSelectedForComparison && <Check className="w-3 h-3" />}
                              </div>
                            )}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${framework.color}`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                                  {framework.name}
                                </span>
                                {framework.status === "deprecated" && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-500/20 text-gray-400">
                                    Deprecated
                                  </span>
                                )}
                                {framework.status === "experimental" && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-pink-500/20 text-pink-400">
                                    Beta
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                                <span>{framework.articleCount} articles</span>
                                {framework.version && (
                                  <span className="text-[var(--text-muted)]">v{framework.version}</span>
                                )}
                              </div>
                              {/* Client badges */}
                              {selectedClient === "all" && framework.assignedClients.length > 0 && (
                                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                  {framework.assignedClients.slice(0, 2).map((clientId) => {
                                    const client = CLIENTS.find(c => c.id === clientId);
                                    if (!client) return null;
                                    return (
                                      <span
                                        key={clientId}
                                        className={`text-[10px] px-1.5 py-0.5 rounded ${client.bgColor} ${client.color}`}
                                      >
                                        {client.shortName}
                                      </span>
                                    );
                                  })}
                                  {framework.assignedClients.length > 2 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[var(--text-muted)]">
                                      +{framework.assignedClients.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </StaggerItem>
                      );
                    })}
                  </StaggerContainer>
                )}
              </div>
            ) : viewMode === "recent" ? (
              /* Recent Documents List */
              recentArticles.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-muted)]">No recent documents</p>
                </div>
              ) : (
                <StaggerContainer className="px-2">
                  {recentArticles.map((article) => (
                    <StaggerItem key={article.id}>
                      <motion.div
                        onClick={() => {
                          setSelectedItem(`article-${article.id}`);
                          setSelectedData({
                            id: `article-${article.id}`,
                            name: article.title,
                            type: "article",
                            slug: article.slug,
                            article,
                          });
                          setSelectedFramework(null);
                        }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-1 ${
                          selectedItem === `article-${article.id}`
                            ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                            : "hover:bg-[var(--bg-slate)] text-[var(--text-secondary)]"
                        }`}
                        whileHover={{ x: 2 }}
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{article.title}</div>
                          <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                            <span>{new Date(article.updated_at).toLocaleDateString()}</span>
                            {article.status === "draft" && (
                              <span className="px-1 py-0.5 rounded text-xs bg-[var(--warning)]/20 text-[var(--warning)]">
                                Draft
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )
            ) : viewMode === "external" ? (
              /* External Documents List */
              <div className="px-2">
                {/* Source Filter */}
                <div className="flex items-center gap-1 flex-wrap mb-3 px-2">
                  <button
                    onClick={() => setExternalSourceFilter('all')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      externalSourceFilter === 'all'
                        ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)]"
                    }`}
                  >
                    All ({externalCounts.total || 0})
                  </button>
                  {(['drive', 'confluence', 'notion', 'figma'] as const).map((source) => (
                    <button
                      key={source}
                      onClick={() => setExternalSourceFilter(source)}
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                        externalSourceFilter === source
                          ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)]"
                      }`}
                    >
                      <span style={{ color: SOURCE_COLORS[source] }}>{SOURCE_ICONS[source]}</span>
                      <span className="capitalize">{source}</span>
                      <span className="text-[var(--text-muted)]">({externalCounts[source] || 0})</span>
                    </button>
                  ))}
                </div>

                {/* External Documents */}
                {externalDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--text-muted)]">No external documents</p>
                  </div>
                ) : (
                  <StaggerContainer>
                    {externalDocuments.map((doc) => (
                      <StaggerItem key={doc.id}>
                        <motion.a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-1 hover:bg-[var(--bg-slate)] text-[var(--text-secondary)] group"
                          whileHover={{ x: 2 }}
                        >
                          <span
                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${SOURCE_COLORS[doc.source]}20`, color: SOURCE_COLORS[doc.source] }}
                          >
                            {SOURCE_ICONS[doc.source] || <FileText className="w-4 h-4" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate group-hover:text-[var(--accent-ember)]">{doc.title}</div>
                            <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                              <span
                                className="px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: `${SOURCE_COLORS[doc.source]}15`, color: SOURCE_COLORS[doc.source] }}
                              >
                                {doc.sourceLabel}
                              </span>
                              <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-ember)] flex-shrink-0" />
                        </motion.a>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                )}
              </div>
            ) : filteredTree.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-muted)]">No content found</p>
              </div>
            ) : (
              filteredTree.map((item) => (
                <TreeNode
                  key={item.id}
                  item={item}
                  level={0}
                  expandedFolders={expandedFolders}
                  selectedItem={selectedItem}
                  onToggleFolder={toggleFolder}
                  onSelectItem={handleSelectItem}
                />
              ))
            )}
          </div>
        </FadeIn>

        {/* Right Panel - Content View */}
        <FadeIn className="flex-1 flex flex-col">
          {/* Framework Detail View */}
          {selectedFramework && viewMode === "frameworks" ? (
            <>
              {/* Framework Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-[var(--border-subtle)] p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <motion.div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center border ${selectedFramework.color}`}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      {(() => {
                        const IconComponent = frameworkIcons[selectedFramework.icon];
                        return <IconComponent className="w-7 h-7" />;
                      })()}
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-medium text-[var(--text-primary)]">
                          {selectedFramework.name}
                        </h1>
                        {selectedFramework.version && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--bg-slate)] text-[var(--text-muted)]">
                            v{selectedFramework.version}
                          </span>
                        )}
                        {selectedFramework.status === "active" && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--success)]/20 text-[var(--success)] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        )}
                        {selectedFramework.status === "deprecated" && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500/20 text-gray-400">
                            Deprecated
                          </span>
                        )}
                        {selectedFramework.status === "experimental" && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-pink-500/20 text-pink-400">
                            Experimental
                          </span>
                        )}
                      </div>
                      <p className="text-[var(--text-secondary)] text-sm max-w-xl">
                        {selectedFramework.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {selectedFramework.articleCount} articles
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedFramework.docsUrl && (
                      <motion.a
                        href={selectedFramework.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-ember)]/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Docs
                      </motion.a>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 mt-4">
                  <Tag className="w-4 h-4 text-[var(--text-muted)]" />
                  {selectedFramework.tags.map((tag) => (
                    <motion.span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs bg-[var(--accent-ember)]/10 text-[var(--accent-ember-soft)] border border-[var(--accent-ember)]/20"
                      whileHover={{ scale: 1.05 }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>

                {/* Assigned Clients */}
                {selectedFramework.assignedClients.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-muted)]">Assigned to:</span>
                    {selectedFramework.assignedClients.map((clientId) => {
                      const client = CLIENTS.find(c => c.id === clientId);
                      if (!client) return null;
                      return (
                        <motion.span
                          key={clientId}
                          className={`px-2 py-0.5 rounded text-xs ${client.bgColor} ${client.color}`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {client.name}
                        </motion.span>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Framework Articles */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex-1 overflow-y-auto p-6"
              >
                <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">
                  Related Articles
                </h2>
                {(() => {
                  const frameworkArticles = getFrameworkArticles(selectedFramework);
                  if (frameworkArticles.length === 0) {
                    return (
                      <div className="text-center py-12 bg-[var(--bg-charcoal)] rounded-xl border border-[var(--border-subtle)]">
                        <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                        <p className="text-[var(--text-muted)] mb-4">No articles tagged with this framework yet</p>
                        <motion.button
                          onClick={() => {
                            setSelectedData(null);
                            setShowArticleEditor(true);
                          }}
                          className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-white text-sm transition-colors shadow-lg shadow-[var(--accent-ember)]/20"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Create Article
                        </motion.button>
                      </div>
                    );
                  }
                  return (
                    <StaggerContainer className="grid grid-cols-2 gap-4">
                      {frameworkArticles.map((article) => (
                        <StaggerItem key={article.id}>
                          <motion.div
                            onClick={() => {
                              setSelectedFramework(null);
                              setSelectedItem(`article-${article.id}`);
                              setSelectedData({
                                id: `article-${article.id}`,
                                name: article.title,
                                type: "article",
                                slug: article.slug,
                                article,
                              });
                            }}
                            className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4 cursor-pointer hover:border-[var(--accent-ember)]/30 transition-all"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              <FileText className="w-6 h-6 text-[var(--accent-ember)]" />
                              {article.status === "published" ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--success)]/20 text-[var(--success)]">
                                  Published
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--warning)]/20 text-[var(--warning)]">
                                  Draft
                                </span>
                              )}
                              {/* Per-Document Access Control Badge */}
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                                <Users className="w-2.5 h-2.5" />
                                {article.id.charCodeAt(0) % 3 === 0 ? "Public" : article.id.charCodeAt(0) % 3 === 1 ? "Team Only" : "Restricted"}
                              </span>
                            </div>
                            <h3 className="text-[var(--text-primary)] font-medium mb-1 line-clamp-2">
                              {article.title}
                            </h3>
                            {article.summary && (
                              <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2">
                                {article.summary}
                              </p>
                            )}
                            <p className="text-xs text-[var(--text-muted)]">
                              Updated {new Date(article.updated_at).toLocaleDateString()}
                            </p>
                          </motion.div>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  );
                })()}
              </motion.div>
            </>
          ) : selectedData && selectedData.type === "article" && selectedData.article ? (
            <>
              {/* Breadcrumb Navigation */}
              <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-6 pt-4 pb-2"
              >
                <ol className="flex items-center gap-2 text-sm">
                  <li>
                    <button
                      onClick={() => {
                        setSelectedItem(null);
                        setSelectedData(null);
                        setViewMode("browse");
                      }}
                      className="text-[var(--text-muted)] hover:text-[var(--accent-ember)] transition-colors"
                    >
                      Knowledge Base
                    </button>
                  </li>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  {(() => {
                    // Find the parent category and department for breadcrumb
                    const article = selectedData.article;
                    const category = categories.find(c => c.id === article.category_id);
                    const department = departments.find(d => d.id === category?.department_id);

                    return (
                      <>
                        {department && (
                          <>
                            <li>
                              <button
                                onClick={() => {
                                  const deptId = `dept-${department.id}`;
                                  setSelectedItem(deptId);
                                  setExpandedFolders(prev => new Set([...prev, deptId]));
                                }}
                                className="text-[var(--text-muted)] hover:text-[var(--accent-ember)] transition-colors"
                              >
                                {department.name}
                              </button>
                            </li>
                            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                          </>
                        )}
                        {category && (
                          <>
                            <li>
                              <button
                                onClick={() => {
                                  const catId = `cat-${category.id}`;
                                  setSelectedItem(catId);
                                  if (department) {
                                    setExpandedFolders(prev => new Set([...prev, `dept-${department.id}`, catId]));
                                  }
                                }}
                                className="text-[var(--text-muted)] hover:text-[var(--accent-ember)] transition-colors"
                              >
                                {category.name}
                              </button>
                            </li>
                            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                          </>
                        )}
                        <li className="text-[var(--text-primary)] truncate max-w-[200px]">
                          {article.title}
                        </li>
                      </>
                    );
                  })()}
                </ol>
              </motion.nav>

              {/* Article Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-[var(--border-subtle)] p-6 pt-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-medium text-[var(--text-primary)]">
                        {selectedData.article.title}
                      </h1>
                      {selectedData.article.status === "published" && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--success)]/20 text-[var(--success)] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Published
                        </span>
                      )}
                      {selectedData.article.status === "draft" && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--warning)]/20 text-[var(--warning)]">
                          Draft
                        </span>
                      )}
                      {selectedData.article.status === "pending_review" && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]">
                          Pending Review
                        </span>
                      )}
                      {/* Per-Document Access Control */}
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                        {selectedData.article.id.charCodeAt(0) % 3 === 0 ? (
                          <>
                            <Globe className="w-3 h-3" />
                            Public Access
                          </>
                        ) : selectedData.article.id.charCodeAt(0) % 3 === 1 ? (
                          <>
                            <Users className="w-3 h-3" />
                            Team Only
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            Restricted
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(selectedData.article.updated_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {selectedData.article.view_count || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {selectedData.article.helpful_count || 0} helpful
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={handleBookmark}
                      className={`p-2 rounded-lg hover:bg-[var(--bg-slate)] transition-colors ${
                        isBookmarked ? "text-[var(--accent-gold)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      }`}
                      title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Star className={`w-5 h-5 ${isBookmarked ? "fill-[var(--accent-gold)]" : ""}`} />
                    </motion.button>
                    <motion.button
                      onClick={handleShare}
                      className="p-2 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors relative"
                      title="Copy link"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showShareToast ? <Check className="w-5 h-5 text-[var(--success)]" /> : <Share2 className="w-5 h-5" />}
                    </motion.button>
                    <motion.button
                      onClick={() => setShowVersionHistory(true)}
                      className="p-2 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      title="Version history"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <History className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                      title="Delete article"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => setShowArticleEditor(true)}
                      className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-white flex items-center gap-2 transition-colors shadow-lg shadow-[var(--accent-ember)]/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </motion.button>
                  </div>
                </div>

                {/* Tags */}
                {selectedData.article.tags && selectedData.article.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <Tag className="w-4 h-4 text-[var(--text-muted)]" />
                    {(selectedData.article.tags as string[]).map((tag: string) => (
                      <motion.span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-xs bg-[var(--accent-ember)]/10 text-[var(--accent-ember-soft)] border border-[var(--accent-ember)]/20"
                        whileHover={{ scale: 1.05 }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Article Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex-1 overflow-y-auto p-6"
              >
                <div className="max-w-3xl">
                  <div className="prose prose-invert prose-sm">
                    {selectedData.article.summary && (
                      <p className="text-lg text-[var(--text-secondary)] mb-6 italic">
                        {selectedData.article.summary}
                      </p>
                    )}
                    <div
                      className="text-[var(--text-secondary)] leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(selectedData.article.content || "<p>No content available.</p>"),
                      }}
                    />
                  </div>

                  {/* Discussion Link Footer */}
                  <div className="border-t border-white/10 pt-4 mt-6">
                    <motion.button
                      onClick={() => {
                        // Navigate to channels page with article reference
                        // In production, this would link to a specific discussion channel
                        const articleSlug = selectedData.article?.slug || selectedData.article?.id;
                        window.location.href = `/diq/channels?article=${articleSlug}`;
                      }}
                      className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors group"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Discuss this article</span>
                      {/* Mock discussion count - in production this would come from the database */}
                      {(() => {
                        // Generate a deterministic "discussion count" based on article id for demo
                        const discussionCount = selectedData.article?.id
                          ? (parseInt(selectedData.article.id.replace(/[^0-9]/g, '').slice(-2) || '0', 10) % 15)
                          : 0;
                        return discussionCount > 0 ? (
                          <span className="bg-emerald-500/20 px-2 rounded-full text-xs">
                            {discussionCount} comments
                          </span>
                        ) : null;
                      })()}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          ) : selectedData && selectedData.type === "folder" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-[var(--accent-gold)]/20 flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <FolderOpen className="w-6 h-6 text-[var(--accent-gold)]" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-medium text-[var(--text-primary)]">
                    {selectedData.name}
                  </h1>
                  <p className="text-sm text-[var(--text-muted)]">
                    {selectedData.children?.length || 0} items
                  </p>
                </div>
              </div>

              {selectedData.children && selectedData.children.length > 0 ? (
                <StaggerContainer className="grid grid-cols-3 gap-4">
                  {selectedData.children.map((child) => (
                    <StaggerItem key={child.id}>
                      <motion.div
                        onClick={() => {
                          handleSelectItem(child.id, child);
                          if (child.type === "folder") {
                            setExpandedFolders((prev) => new Set([...prev, child.id]));
                          }
                        }}
                        className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4 cursor-pointer hover:border-[var(--accent-ember)]/30 transition-all"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {child.type === "folder" ? (
                            <FolderOpen className="w-8 h-8 text-[var(--accent-gold)]" />
                          ) : (
                            <FileText className="w-8 h-8 text-[var(--accent-ember)]" />
                          )}
                        </div>
                        <h3 className="text-[var(--text-primary)] font-medium mb-1 truncate">
                          {child.name}
                        </h3>
                        {child.type === "article" && child.article && (
                          <p className="text-xs text-[var(--text-muted)]">
                            Updated {new Date(child.article.updated_at).toLocaleDateString()}
                          </p>
                        )}
                        {child.type === "folder" && (
                          <p className="text-xs text-[var(--text-muted)]">
                            {child.children?.length || 0} items
                          </p>
                        )}
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                  <p className="text-[var(--text-muted)]">This folder is empty</p>
                  <motion.button
                    onClick={() => setShowCreateModal("article")}
                    className="mt-4 px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-white text-sm transition-colors shadow-lg shadow-[var(--accent-ember)]/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add Content
                  </motion.button>
                </div>
              )}
            </motion.div>
          ) : viewMode === "frameworks" && !selectedFramework ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              {/* Framework Hub Header with Client Context Selector */}
              <div className="border-b border-[var(--border-subtle)] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-ember)]/20 to-purple-500/20 flex items-center justify-center border border-[var(--accent-ember)]/20">
                      <Layers className="w-6 h-6 text-[var(--accent-ember)]" />
                    </div>
                    <div>
                      <h1 className="text-xl font-medium text-[var(--text-primary)]">Framework Hub</h1>
                      <p className="text-sm text-[var(--text-muted)]">Enterprise frameworks and best practices</p>
                    </div>
                  </div>

                  {/* Client Context Selector */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-sm text-[var(--text-muted)]">Client Context:</span>
                    </div>
                    <select
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      className="bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50 cursor-pointer min-w-[180px]"
                    >
                      {CLIENTS.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Framework Hub Content */}
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-ember)]/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 border border-[var(--accent-ember)]/20">
                    <Layers className="w-10 h-10 text-[var(--accent-ember)]" />
                  </div>
                  <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">
                    {selectedClient !== "all" ? `${selectedClientObj.name} Frameworks` : "All Frameworks"}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mb-6">
                    {selectedClient !== "all"
                      ? `Showing frameworks assigned to ${selectedClientObj.name}. Select a framework from the list to view its documentation.`
                      : "Discover and explore enterprise frameworks, accelerators, and best practices. Select a framework from the list to view its documentation and related articles."}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Layers className="w-4 h-4 text-[var(--accent-ember)]" />
                      {filteredFrameworks.filter(f => f.status === "active").length} Active
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-pink-400" />
                      {filteredFrameworks.filter(f => f.status === "experimental").length} Experimental
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                      {filteredFrameworks.reduce((sum, f) => sum + f.articleCount, 0)} Articles
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : viewMode === "external" ? (
            /* External Documents View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              {/* External Sources Header */}
              <div className="border-b border-[var(--border-subtle)] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/20">
                      <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h1 className="text-xl font-medium text-[var(--text-primary)]">External Sources</h1>
                      <p className="text-sm text-[var(--text-muted)]">Documents from connected apps</p>
                    </div>
                  </div>

                  {/* Source Stats */}
                  <div className="flex items-center gap-4">
                    {(['drive', 'confluence', 'notion', 'figma'] as const).map((source) => (
                      <div
                        key={source}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-slate)]"
                      >
                        <span style={{ color: SOURCE_COLORS[source] }}>{SOURCE_ICONS[source]}</span>
                        <span className="text-sm text-[var(--text-secondary)] capitalize">{source}</span>
                        <span className="text-sm text-[var(--text-muted)]">({externalCounts[source] || 0})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* External Sources Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {externalDocuments.map((doc) => (
                    <motion.a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-4 rounded-xl bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] hover:border-[var(--accent-ember)]/50 transition-all"
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${SOURCE_COLORS[doc.source]}20`, color: SOURCE_COLORS[doc.source] }}
                        >
                          {SOURCE_ICONS[doc.source] || <FileText className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent-ember)] transition-colors">
                            {doc.title}
                          </h4>
                          {doc.description && (
                            <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                              {doc.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: `${SOURCE_COLORS[doc.source]}15`, color: SOURCE_COLORS[doc.source] }}
                            >
                              {doc.sourceLabel}
                            </span>
                            <span className="text-xs text-[var(--text-muted)]">
                              {new Date(doc.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-ember)] flex-shrink-0" />
                      </div>
                    </motion.a>
                  ))}
                </div>

                {externalDocuments.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <Globe className="w-16 h-16 text-[var(--border-subtle)] mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">
                        No external documents
                      </h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        Connect apps like Drive, Confluence, or Notion to see documents here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-[var(--border-subtle)] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">
                  Select an item
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Choose a folder or article from the tree view
                </p>
              </div>
            </motion.div>
          )}
        </FadeIn>
      </main>

      {/* Article Editor Modal */}
      {showArticleEditor && selectedData?.article && (
        <ArticleEditor
          article={{
            id: selectedData.article.id,
            title: selectedData.article.title,
            content: selectedData.article.content || "",
            summary: selectedData.article.summary || "",
            tags: (selectedData.article.tags as string[]) || [],
            status: selectedData.article.status,
          }}
          onSave={handleSaveArticle}
          onCancel={() => setShowArticleEditor(false)}
        />
      )}

      {/* New Article Editor (for creating) */}
      {showArticleEditor && !selectedData?.article && (
        <ArticleEditor
          onSave={handleSaveArticle}
          onCancel={() => setShowArticleEditor(false)}
        />
      )}

      {/* Create Content Modal */}
      {showCreateModal && (
        <CreateContentModal
          type={showCreateModal}
          departmentId={selectedData?.type === "folder" ? selectedData.id.replace("dept-", "") : undefined}
          parentId={selectedData?.type === "folder" && selectedData.id.startsWith("cat-") ? selectedData.id.replace("cat-", "") : undefined}
          onClose={() => setShowCreateModal(null)}
          onCreate={handleCreateContent}
          departments={departments}
          categories={categories}
        />
      )}

      {/* Version History Modal */}
      {showVersionHistory && selectedData?.article && (
        <VersionHistoryModal
          articleId={selectedData.article.id}
          currentTitle={selectedData.article.title}
          onClose={() => setShowVersionHistory(false)}
          onRestore={handleVersionRestore}
        />
      )}

      {/* Article Approval Panel */}
      <ArticleApprovalPanel
        isOpen={showApprovalPanel}
        onClose={() => setShowApprovalPanel(false)}
        onApprovalComplete={() => {
          // Refresh the articles list after approval
          window.location.reload();
        }}
      />

      {/* Framework Comparison Modal */}
      <AnimatePresence>
        {showComparisonModal && selectedForComparison.size === 2 && (() => {
          const frameworks = getSelectedComparisonFrameworks();
          return (
            <FrameworkComparisonModal
              frameworkA={frameworks[0]}
              frameworkB={frameworks[1]}
              onClose={() => {
                setShowComparisonModal(false);
                setComparisonMode(false);
                setSelectedForComparison(new Set());
              }}
            />
          );
        })()}
      </AnimatePresence>

      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-[var(--success)] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
          >
            <Check className="w-4 h-4" />
            Link copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selectedData?.article && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--bg-charcoal)] border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Delete Article</h3>
              </div>
              <p className="text-[var(--text-secondary)] mb-2">
                Are you sure you want to delete <span className="text-white font-medium">&quot;{selectedData.article.title}&quot;</span>?
              </p>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                This action cannot be undone. The article and all its version history will be permanently removed.
              </p>
              <div className="flex items-center justify-end gap-3">
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isDeleting}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDeleteArticle}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Loading fallback for Suspense
function ContentPageLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />
      <main className="ml-16 h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-ember)]" />
          <p className="text-[var(--text-muted)]">Loading content...</p>
        </div>
      </main>
    </div>
  );
}

// Export with Suspense wrapper for useSearchParams
export default function ContentPage() {
  return (
    <Suspense fallback={<ContentPageLoading />}>
      <ContentPageInner />
    </Suspense>
  );
}
