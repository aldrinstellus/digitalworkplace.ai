"use client";

import { useState, useMemo, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useKBCategories, useArticles, useDepartments } from "@/lib/hooks/useSupabase";
import { ArticleEditor } from "@/components/content/ArticleEditor";
import { CreateContentModal } from "@/components/content/CreateContentModal";
import { VersionHistoryModal } from "@/components/content/VersionHistoryModal";
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
          onSelectItem(item.id, item);
        }}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
            )}
            <FolderOpen
              className={`w-4 h-4 flex-shrink-0 ${
                isExpanded ? "text-blue-400" : "text-yellow-400"
              }`}
            />
          </>
        ) : (
          <>
            <span className="w-4" />
            <FileText className="w-4 h-4 text-white/40 flex-shrink-0" />
          </>
        )}
        <span className="truncate text-sm">{item.name}</span>
        {item.article?.status === "draft" && (
          <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">
            Draft
          </span>
        )}
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

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<TreeItem | null>(null);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showArticleEditor, setShowArticleEditor] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState<"category" | "article" | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const { categories, loading: categoriesLoading } = useKBCategories();
  const { articles, loading: articlesLoading } = useArticles();
  const { departments, loading: departmentsLoading } = useDepartments();

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

  // Auto-expand first folder (sync during render)
  const hasExpandedFirstFolderRef = useRef(false);
  if (treeData.length > 0 && expandedFolders.size === 0 && !hasExpandedFirstFolderRef.current) {
    hasExpandedFirstFolderRef.current = true;
    setExpandedFolders(new Set([treeData[0].id]));
  }

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
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNewMenu(false)} />
                    <div className="absolute right-0 top-10 w-48 bg-[#1a1a1f] border border-white/10 rounded-lg shadow-xl z-50">
                      <button
                        onClick={() => {
                          setShowNewMenu(false);
                          setShowCreateModal("category");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                      >
                        <FolderOpen className="w-4 h-4" />
                        New Category
                      </button>
                      <button
                        onClick={() => {
                          setShowNewMenu(false);
                          setShowCreateModal("article");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                      >
                        <FileText className="w-4 h-4" />
                        New Article
                      </button>
                      <button
                        onClick={() => {
                          setShowNewMenu(false);
                          // In production, open file upload dialog
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = ".pdf,.doc,.docx,.txt,.md";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) console.log("Uploading file:", file.name);
                          };
                          input.click();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                      >
                        <File className="w-4 h-4" />
                        Upload File
                      </button>
                    </div>
                  </>
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : filteredTree.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/40">No content found</p>
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
        </div>

        {/* Right Panel - Content View */}
        <div className="flex-1 flex flex-col">
          {selectedData && selectedData.type === "article" && selectedData.article ? (
            <>
              {/* Article Header */}
              <div className="border-b border-white/10 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-medium text-white">
                        {selectedData.article.title}
                      </h1>
                      {selectedData.article.status === "published" && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Published
                        </span>
                      )}
                      {selectedData.article.status === "draft" && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                          Draft
                        </span>
                      )}
                      {selectedData.article.status === "pending_review" && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">
                          Pending Review
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/50">
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
                    <button
                      onClick={handleBookmark}
                      className={`p-2 rounded-lg hover:bg-white/5 transition-colors ${
                        isBookmarked ? "text-yellow-400" : "text-white/50 hover:text-white"
                      }`}
                      title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                    >
                      <Star className={`w-5 h-5 ${isBookmarked ? "fill-yellow-400" : ""}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors relative"
                      title="Copy link"
                    >
                      {showShareToast ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setShowVersionHistory(true)}
                      className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                      title="Version history"
                    >
                      <History className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowArticleEditor(true)}
                      className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {selectedData.article.tags && selectedData.article.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <Tag className="w-4 h-4 text-white/40" />
                    {(selectedData.article.tags as string[]).map((tag: string) => (
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
                    {selectedData.article.summary && (
                      <p className="text-lg text-white/70 mb-6 italic">
                        {selectedData.article.summary}
                      </p>
                    )}
                    <div
                      className="text-white/70 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(selectedData.article.content || "<p>No content available.</p>"),
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : selectedData && selectedData.type === "folder" ? (
            <div className="flex-1 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-xl font-medium text-white">
                    {selectedData.name}
                  </h1>
                  <p className="text-sm text-white/50">
                    {selectedData.children?.length || 0} items
                  </p>
                </div>
              </div>

              {selectedData.children && selectedData.children.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {selectedData.children.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => {
                        handleSelectItem(child.id, child);
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
                      {child.type === "article" && child.article && (
                        <p className="text-xs text-white/40">
                          Updated {new Date(child.article.updated_at).toLocaleDateString()}
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
                  <button
                    onClick={() => setShowCreateModal("article")}
                    className="mt-4 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors"
                  >
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

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Check className="w-4 h-4" />
          Link copied to clipboard
        </div>
      )}
    </div>
  );
}
