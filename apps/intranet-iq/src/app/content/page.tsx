"use client";

import { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { FadeIn, StaggerContainer, StaggerItem } from "@/lib/motion";
import { useKBCategories, useArticles, useDepartments } from "@/lib/hooks/useSupabase";
import { ArticleEditor } from "@/components/content/ArticleEditor";
import { CreateContentModal } from "@/components/content/CreateContentModal";
import { VersionHistoryModal } from "@/components/content/VersionHistoryModal";
import { ArticleApprovalPanel } from "@/components/content/ArticleApprovalPanel";
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
  Link2,
  Check,
  ClipboardCheck,
} from "lucide-react";
import type { KBCategory, Article } from "@/lib/database.types";

interface TreeItem {
  id: string;
  name: string;
  type: "folder" | "article";
  slug?: string;
  children?: TreeItem[];
  article?: Article;
  category?: KBCategory;
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

function ContentPageInner() {
  const searchParams = useSearchParams();
  const urlView = searchParams.get("view");
  const [viewMode, setViewMode] = useState<"browse" | "recent">(urlView === "recent" ? "recent" : "browse");

  const [searchQuery, setSearchQuery] = useState("");
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

  const { categories, loading: categoriesLoading } = useKBCategories();
  const { articles, loading: articlesLoading } = useArticles();
  const { departments, loading: departmentsLoading } = useDepartments();

  // Get recent articles (sorted by updated_at)
  const recentArticles = useMemo(() => {
    return [...articles]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 20);
  }, [articles]);

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

      // Find articles for this category
      const categoryArticles = articles.filter((a) => a.category_id === cat.id);
      catItem.children = categoryArticles.map((article) => ({
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
  }, [categories, articles, departments]);

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
                  {viewMode === "recent" ? "Recent" : "Knowledge Base"}
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
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                  viewMode === "browse"
                    ? "bg-[var(--accent-ember)] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
                whileTap={{ scale: 0.98 }}
              >
                Browse
              </motion.button>
              <motion.button
                onClick={() => setViewMode("recent")}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors flex items-center justify-center gap-1 ${
                  viewMode === "recent"
                    ? "bg-[var(--accent-ember)] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <Clock className="w-3 h-3" />
                Recent
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
          </div>

          {/* Tree View or Recent List */}
          <div className="flex-1 overflow-y-auto py-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-ember)]" />
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
          {selectedData && selectedData.type === "article" && selectedData.article ? (
            <>
              {/* Article Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-[var(--border-subtle)] p-6"
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
