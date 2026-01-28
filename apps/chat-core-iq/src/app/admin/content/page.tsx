"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Pagination } from "@/components/ui/pagination";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiUrl } from "@/lib/utils";
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  X,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Database,
  HelpCircle,
  Check,
  Globe,
  Sparkles,
  Layers,
  Clock,
  Calendar,
  Settings,
  Zap,
  Loader2,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  AlertCircle,
  Upload,
  FileUp,
  File,
  FileType,
  Link,
  PlusCircle,
} from "lucide-react";

// Zod validation schema for FAQ
const faqSchema = z.object({
  question: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .max(500, "Question must be less than 500 characters"),
  answer: z
    .string()
    .min(20, "Answer must be at least 20 characters")
    .max(2000, "Answer must be less than 2000 characters"),
  category: z.string().min(1, "Category is required"),
  language: z.enum(["en", "es", "ht", "all"]),
  priority: z.enum(["low", "medium", "high"]),
  isActive: z.boolean(),
  url: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.startsWith("/") || val.startsWith("http"),
      "URL must start with '/' or 'http'"
    ),
});

const priorityColors = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-red-100 text-red-600",
};

type SortDirection = "asc" | "desc" | null;
type FaqSortKey = "question" | "category" | "priority" | "language" | "isActive" | "";

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === "asc") return <ArrowUp className="h-3.5 w-3.5 text-white" />;
  if (direction === "desc") return <ArrowDown className="h-3.5 w-3.5 text-white" />;
  return <ArrowUpDown className="h-3.5 w-3.5 text-white/60" />;
}

// Highlight matching text component
function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  // Safety check for undefined/null text
  if (!text) {
    return null;
  }
  if (!highlight.trim()) {
    return <>{text}</>;
  }
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-[#000034] rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// Animated counter component
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}

interface KnowledgeItem {
  title: string;
  url: string;
  section: string;
  content: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  language: "en" | "es" | "ht" | "all";
  priority: "low" | "medium" | "high";
  isActive: boolean;
  createdAt?: string;
  url?: string;
}

const categories = [
  "General",
  "Permits & Licensing",
  "Parks & Recreation",
  "Utilities",
  "Police Department",
  "Public Works",
  "Events",
  "Other",
];

interface AutoScrapeSettings {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  lastRun: string | null;
  nextRun: string | null;
}

interface UploadedDocument {
  id: string;
  filename: string;
  originalName: string;
  type: "pdf" | "docx" | "txt";
  size: number;
  chunks: number;
  uploadedAt: string;
}

interface CrawlerURL {
  id: string;
  url: string;
  fullUrl: string;
  title: string;
  section: string;
  enabled: boolean;
  isCustom: boolean;
  lastCrawled: string | null;
  lastStatus: "success" | "error" | "pending" | "never";
}

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  section: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

type TabKey = "knowledge" | "faqs" | "documents" | "crawler";
type KBSubTab = "scraped" | "custom";
type KBLanguage = "en" | "es" | "ht";

export default function ContentManagement() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>("knowledge");
  const [kbSubTab, setKbSubTab] = useState<KBSubTab>("scraped");
  const [kbLanguage, setKbLanguage] = useState<KBLanguage>("en");
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  // Custom entries state
  const [customEntries, setCustomEntries] = useState<KnowledgeEntry[]>([]);
  const [customEntriesLoading, setCustomEntriesLoading] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [customSearchTerm, setCustomSearchTerm] = useState("");
  const [entrySaving, setEntrySaving] = useState(false);
  const [expandedEntrySection, setExpandedEntrySection] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
  // Documents state
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [docSearchTerm, setDocSearchTerm] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  // Crawler state
  const [crawlerUrls, setCrawlerUrls] = useState<CrawlerURL[]>([]);
  const [crawlerLoading, setCrawlerLoading] = useState(false);
  const [crawlerSearchTerm, setCrawlerSearchTerm] = useState("");
  const [crawlerSectionFilter, setCrawlerSectionFilter] = useState("all");
  const [crawlerStatusFilter, setCrawlerStatusFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [expandedCrawlerSection, setExpandedCrawlerSection] = useState<string | null>(null);
  const [showCrawlerSettings, setShowCrawlerSettings] = useState(false);
  const [newCustomUrl, setNewCustomUrl] = useState("");
  const [newCustomSection, setNewCustomSection] = useState("Other");
  const [crawlerLanguage, setCrawlerLanguage] = useState<KBLanguage>("en");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [showAutoScrapeSettings, setShowAutoScrapeSettings] = useState(false);
  const [autoScrapeSettings, setAutoScrapeSettings] = useState<AutoScrapeSettings>({
    enabled: true,
    frequency: "weekly",
    lastRun: null,
    nextRun: null,
  });
  // FAQ filtering/sorting/bulk state
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterUrlType, setFilterUrlType] = useState<"all" | "global" | "page-specific">("all");
  const [sortKey, setSortKey] = useState<FaqSortKey>("question");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { confirm, DialogComponent } = useConfirmDialog();

  // Set date-dependent values after mount to avoid hydration mismatch
  useEffect(() => {
    setAutoScrapeSettings(prev => ({
      ...prev,
      lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  }, []);

  // Fetch knowledge base based on language
  const fetchKnowledge = useCallback(async (lang: KBLanguage = "en") => {
    setLoading(true);
    try {
      const kbFiles: Record<KBLanguage, string> = {
        en: "/knowledge-base.json",
        es: "/knowledge-base-es.json",
        ht: "/knowledge-base-ht.json"
      };
      const file = kbFiles[lang] || "/knowledge-base.json";
      const response = await fetch(apiUrl(file));
      if (response.ok) {
        const data = await response.json();
        setKnowledgeItems(data.pages || []);
      }
    } catch (error) {
      console.error("Failed to fetch knowledge base:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKnowledge(kbLanguage);
  }, [kbLanguage, fetchKnowledge]);

  // Fetch FAQs from API
  const fetchFaqs = useCallback(async () => {
    setFaqsLoading(true);
    try {
      const response = await fetch(apiUrl("/api/faqs"));
      if (response.ok) {
        const data = await response.json();
        // Map API response to local FAQ type
        const mappedFaqs: FAQ[] = data.faqs.map((faq: { id: string; question: string; answer: string; category: string; priority?: string; status?: string; isActive?: boolean; createdAt?: string; url?: string }) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          language: "all" as const,
          priority: (faq.priority as "low" | "medium" | "high") || "medium",
          isActive: faq.status === "active" || faq.isActive || false,
          createdAt: faq.createdAt,
          url: faq.url || "",
        }));
        setFaqs(mappedFaqs);
      }
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
      toast.error("Failed to load FAQs");
    } finally {
      setFaqsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // Fetch Custom Knowledge Entries from API
  const fetchCustomEntries = useCallback(async () => {
    setCustomEntriesLoading(true);
    try {
      const response = await fetch(apiUrl("/api/admin/knowledge"));
      if (response.ok) {
        const data = await response.json();
        setCustomEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Failed to fetch custom entries:", error);
      toast.error("Failed to load custom entries");
    } finally {
      setCustomEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomEntries();
  }, [fetchCustomEntries]);

  // Custom entries grouped by section
  const groupedCustomEntries = customEntries.reduce((acc, entry) => {
    const section = entry.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(entry);
    return acc;
  }, {} as Record<string, KnowledgeEntry[]>);

  // Filter custom entries by search
  const filteredCustomEntries = Object.entries(groupedCustomEntries).filter(([section, entries]) => {
    if (!customSearchTerm) return true;
    const search = customSearchTerm.toLowerCase();
    return (
      section.toLowerCase().includes(search) ||
      entries.some((entry) => entry.title.toLowerCase().includes(search) || entry.content?.toLowerCase().includes(search))
    );
  });

  // CRUD handlers for custom entries
  const handleSaveEntry = async (entry: Partial<KnowledgeEntry>) => {
    setEntrySaving(true);
    try {
      const isEditing = !!editingEntry;
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing ? { ...entry, id: editingEntry.id } : entry;

      const response = await fetch(apiUrl("/api/admin/knowledge"), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(isEditing ? "Entry updated successfully" : "Entry created successfully");
        setShowAddEntry(false);
        setEditingEntry(null);
        fetchCustomEntries();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to save entry");
      }
    } catch (error) {
      console.error("Failed to save entry:", error);
      toast.error("Failed to save entry");
    } finally {
      setEntrySaving(false);
    }
  };

  const handleDeleteEntry = (id: string) => {
    const entry = customEntries.find((e) => e.id === id);
    confirm({
      title: "Delete Entry",
      description: `Are you sure you want to delete "${entry?.title?.slice(0, 50)}..."? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/knowledge?id=${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            toast.success("Entry deleted successfully");
            fetchCustomEntries();
          } else {
            toast.error("Failed to delete entry");
          }
        } catch (error) {
          console.error("Failed to delete entry:", error);
          toast.error("Failed to delete entry");
        }
      },
    });
  };

  // Import knowledge entries from JSON file
  const handleImportEntries = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      let entries: Array<{ title: string; content: string; section: string; url?: string }>;

      // Parse JSON file
      try {
        const parsed = JSON.parse(text);
        // Handle both array format and object with entries/pages key
        if (Array.isArray(parsed)) {
          entries = parsed;
        } else if (parsed.entries) {
          entries = parsed.entries;
        } else if (parsed.pages) {
          entries = parsed.pages;
        } else {
          throw new Error("Invalid format");
        }
      } catch {
        toast.error("Invalid JSON format. Expected an array of entries or object with entries/pages key.");
        setImporting(false);
        if (importFileRef.current) importFileRef.current.value = "";
        return;
      }

      // Validate entries
      const validEntries = entries.filter(
        (e) => e.title && e.content && e.section
      );

      if (validEntries.length === 0) {
        toast.error("No valid entries found. Each entry needs title, content, and section.");
        setImporting(false);
        if (importFileRef.current) importFileRef.current.value = "";
        return;
      }

      // Import entries one by one
      let successCount = 0;
      let errorCount = 0;

      for (const entry of validEntries) {
        try {
          const response = await fetch(apiUrl("/api/admin/knowledge"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: entry.title,
              content: entry.content,
              section: entry.section,
              url: entry.url || "",
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
      }

      // Show results
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully imported ${successCount} entries`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.success(`Imported ${successCount} entries, ${errorCount} failed`);
      } else {
        toast.error("Failed to import entries");
      }

      // Refresh the list
      fetchCustomEntries();
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import entries");
    } finally {
      setImporting(false);
      if (importFileRef.current) importFileRef.current.value = "";
    }
  };

  const groupedKnowledge = knowledgeItems.reduce((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, KnowledgeItem[]>);

  const filteredSections = Object.entries(groupedKnowledge).filter(([section, items]) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      section.toLowerCase().includes(search) ||
      items.some((item) => item.title.toLowerCase().includes(search) || item.content?.toLowerCase().includes(search))
    );
  });

  const filteredFaqsBase = useMemo(() => {
    return faqs.filter((faq) => {
      if (filterCategory !== "all" && faq.category !== filterCategory) return false;
      if (filterStatus === "active" && !faq.isActive) return false;
      if (filterStatus === "inactive" && faq.isActive) return false;
      if (filterPriority !== "all" && faq.priority !== filterPriority) return false;
      if (filterUrlType === "global" && faq.url) return false;
      if (filterUrlType === "page-specific" && !faq.url) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return faq.question.toLowerCase().includes(search) || faq.answer.toLowerCase().includes(search) || (faq.url && faq.url.toLowerCase().includes(search));
    });
  }, [faqs, filterCategory, filterStatus, filterPriority, filterUrlType, searchTerm]);

  const handleFaqSort = (key: FaqSortKey) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey("");
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const filteredFaqs = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredFaqsBase;

    return [...filteredFaqsBase].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case "question":
          comparison = a.question.localeCompare(b.question);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "language":
          comparison = a.language.localeCompare(b.language);
          break;
        case "isActive":
          comparison = (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1;
          break;
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [filteredFaqsBase, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage);
  const paginatedFaqs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFaqs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFaqs, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, filterPriority]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  // FAQ stats
  const stats = {
    total: faqs.length,
    active: faqs.filter(f => f.isActive).length,
    inactive: faqs.filter(f => !f.isActive).length,
    highPriority: faqs.filter(f => f.priority === "high").length,
  };

  const handleSaveFaq = async (faq: FAQ) => {
    setSaving(true);
    try {
      const apiData = {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        priority: faq.priority,
        status: faq.isActive ? "active" : "inactive",
        url: faq.url || undefined, // Only include if set
      };

      if (editingFaq) {
        const response = await fetch(apiUrl("/api/faqs"), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        });
        if (response.ok) {
          await fetchFaqs();
          toast.success("FAQ updated successfully");
        } else {
          toast.error("Failed to update FAQ");
        }
      } else {
        const response = await fetch(apiUrl("/api/faqs"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        });
        if (response.ok) {
          await fetchFaqs();
          toast.success("FAQ created successfully");
        } else {
          toast.error("Failed to create FAQ");
        }
      }
      setEditingFaq(null);
      setShowAddFaq(false);
    } catch (error) {
      console.error("Failed to save FAQ:", error);
      toast.error("An error occurred while saving the FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = (id: string) => {
    const faq = faqs.find((f) => f.id === id);
    confirm({
      title: "Delete FAQ",
      description: `Are you sure you want to delete "${faq?.question?.slice(0, 50)}..."? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/faqs?id=${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            await fetchFaqs();
            toast.success("FAQ deleted successfully");
          } else {
            toast.error("Failed to delete FAQ");
          }
        } catch (error) {
          console.error("Failed to delete FAQ:", error);
          toast.error("An error occurred while deleting the FAQ");
        }
      },
    });
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredFaqs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFaqs.map((f) => f.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    confirm({
      title: "Delete Selected FAQs",
      description: `Are you sure you want to delete ${selectedIds.size} FAQ(s)? This action cannot be undone.`,
      confirmLabel: "Delete All",
      variant: "danger",
      onConfirm: async () => {
        try {
          const deletePromises = Array.from(selectedIds).map((id) =>
            fetch(`/api/faqs?id=${id}`, { method: "DELETE" })
          );
          await Promise.all(deletePromises);
          await fetchFaqs();
          setSelectedIds(new Set());
          toast.success(`${selectedIds.size} FAQ(s) deleted successfully`);
        } catch (error) {
          console.error("Failed to bulk delete:", error);
          toast.error("An error occurred while deleting FAQs");
        }
      },
    });
  };

  const handleBulkToggleStatus = async (activate: boolean) => {
    try {
      const updatePromises = Array.from(selectedIds).map((id) => {
        const faq = faqs.find((f) => f.id === id);
        return fetch(apiUrl("/api/faqs"), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            status: activate ? "active" : "inactive",
            question: faq?.question,
            answer: faq?.answer,
            category: faq?.category,
            priority: faq?.priority,
          }),
        });
      });
      await Promise.all(updatePromises);
      await fetchFaqs();
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size} FAQ(s) ${activate ? "activated" : "deactivated"}`);
    } catch (error) {
      console.error("Failed to bulk update:", error);
      toast.error("An error occurred while updating FAQs");
    }
  };

  const handleToggleStatus = async (id: string) => {
    const faq = faqs.find((f) => f.id === id);
    if (!faq) return;

    try {
      const response = await fetch(apiUrl("/api/faqs"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: faq.isActive ? "inactive" : "active",
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          priority: faq.priority,
        }),
      });
      if (response.ok) {
        await fetchFaqs();
        toast.success(`FAQ ${faq.isActive ? "deactivated" : "activated"} successfully`);
      } else {
        toast.error("Failed to update FAQ status");
      }
    } catch (error) {
      console.error("Failed to toggle FAQ status:", error);
      toast.error("An error occurred while updating the FAQ");
    }
  };

  const handleRefreshKnowledge = async () => {
    setLoading(true);
    try {
      const kbFiles: Record<KBLanguage, string> = {
        en: "/knowledge-base.json",
        es: "/knowledge-base-es.json",
        ht: "/knowledge-base-ht.json"
      };
      const file = kbFiles[kbLanguage] || "/knowledge-base.json";
      const response = await fetch(file, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setKnowledgeItems(data.pages || []);
      }
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setLoading(false);
    }
  };

  // Document handlers
  const fetchDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const response = await fetch(apiUrl("/api/admin/documents"));
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "documents") {
      fetchDocuments();
    }
  }, [activeTab, fetchDocuments]);

  const handleFileUpload = async (files: File[]) => {
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "text/plain"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|doc|txt)$/i)) {
        toast.error(`Invalid file type: ${file.name}. Only PDF, DOCX, and TXT are allowed.`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}. Maximum size is 10MB.`);
        continue;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        await new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.response);
            } else {
              reject(new Error(xhr.statusText));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.open("POST", "/api/documents");
          xhr.send(formData);
        });

        toast.success(`Uploaded: ${file.name}`);
        await fetchDocuments();
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error(`Failed to upload: ${file.name}`);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleDeleteDocument = (id: string, name: string) => {
    confirm({
      title: "Delete Document",
      description: `Are you sure you want to delete "${name}"? This will remove it from the knowledge base.`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/documents?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
          });
          if (response.ok) {
            await fetchDocuments();
            toast.success("Document deleted successfully");
          } else {
            toast.error("Failed to delete document");
          }
        } catch (error) {
          console.error("Delete failed:", error);
          toast.error("An error occurred while deleting the document");
        }
      },
    });
  };

  const handleBulkDeleteDocs = () => {
    confirm({
      title: "Delete Selected Documents",
      description: `Are you sure you want to delete ${selectedDocIds.size} document(s)? This will remove them from the knowledge base.`,
      confirmLabel: "Delete All",
      variant: "danger",
      onConfirm: async () => {
        try {
          for (const docId of selectedDocIds) {
            await fetch(`/api/admin/documents?id=${encodeURIComponent(docId)}`, {
              method: "DELETE",
            });
          }
          await fetchDocuments();
          setSelectedDocIds(new Set());
          toast.success(`${selectedDocIds.size} document(s) deleted successfully`);
        } catch (error) {
          console.error("Bulk delete failed:", error);
          toast.error("An error occurred while deleting documents");
        }
      },
    });
  };

  // Crawler handlers
  const fetchCrawlerUrls = useCallback(async (lang: KBLanguage = "en") => {
    setCrawlerLoading(true);
    try {
      const response = await fetch(`/api/admin/crawler/urls?lang=${lang}`);
      if (response.ok) {
        const data = await response.json();
        setCrawlerUrls(data.urls || []);
      } else {
        // Initialize from knowledge base if API doesn't exist yet
        const urls: CrawlerURL[] = knowledgeItems.map((item, idx) => ({
          id: `kb-${idx}`,
          url: item.url,
          fullUrl: `https://www.cityofdoral.com${item.url}`,
          title: item.title,
          section: item.section || "Other",
          enabled: true,
          isCustom: false,
          lastCrawled: autoScrapeSettings.lastRun,
          lastStatus: "success" as const,
        }));
        setCrawlerUrls(urls);
      }
    } catch {
      // Initialize from knowledge base on error
      const urls: CrawlerURL[] = knowledgeItems.map((item, idx) => ({
        id: `kb-${idx}`,
        url: item.url,
        fullUrl: `https://www.cityofdoral.com${item.url}`,
        title: item.title,
        section: item.section || "Other",
        enabled: true,
        isCustom: false,
        lastCrawled: autoScrapeSettings.lastRun,
        lastStatus: "success" as const,
      }));
      setCrawlerUrls(urls);
    } finally {
      setCrawlerLoading(false);
    }
  }, [knowledgeItems, autoScrapeSettings.lastRun]);

  useEffect(() => {
    if (activeTab === "crawler") {
      fetchCrawlerUrls(crawlerLanguage);
    }
  }, [activeTab, crawlerLanguage, fetchCrawlerUrls]);

  const handleToggleUrl = async (id: string) => {
    setCrawlerUrls(prev => prev.map(u =>
      u.id === id ? { ...u, enabled: !u.enabled } : u
    ));
    // Optionally persist to API
    try {
      await fetch(apiUrl("/api/admin/crawler/urls"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: !crawlerUrls.find(u => u.id === id)?.enabled }),
      });
    } catch {
      // Silently fail - state is already updated locally
    }
  };

  const handleToggleSectionUrls = async (section: string, enable: boolean) => {
    setCrawlerUrls(prev => prev.map(u =>
      u.section === section ? { ...u, enabled: enable } : u
    ));
    toast.success(`${enable ? "Enabled" : "Disabled"} all URLs in ${section}`);
    // Optionally persist to API
    try {
      await fetch(apiUrl("/api/admin/crawler/urls/bulk"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, enabled: enable }),
      });
    } catch {
      // Silently fail - state is already updated locally
    }
  };

  const handleAddCustomUrl = async () => {
    if (!newCustomUrl.trim()) return;

    const urlPath = newCustomUrl.replace(/^https?:\/\/[^/]+/, "");
    const newUrl: CrawlerURL = {
      id: `custom-${Date.now()}`,
      url: urlPath || newCustomUrl,
      fullUrl: newCustomUrl.startsWith("http") ? newCustomUrl : `https://www.cityofdoral.com${newCustomUrl}`,
      title: urlPath.split("/").pop()?.replace(/\.html?$/, "").replace(/-/g, " ") || "Custom Page",
      section: newCustomSection,
      enabled: true,
      isCustom: true,
      lastCrawled: null,
      lastStatus: "never",
    };

    setCrawlerUrls(prev => [...prev, newUrl]);
    setNewCustomUrl("");
    toast.success("Custom URL added");

    // Optionally persist to API
    try {
      await fetch(apiUrl("/api/admin/crawler/urls"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUrl),
      });
    } catch {
      // Silently fail - state is already updated locally
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {DialogComponent}
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[32px] font-bold text-[#000034] tracking-tight">{t("content.title")}</h1>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-6 w-6 text-amber-700" />
            </motion.div>
          </div>
          <p className="text-[#666666] mt-1 text-[15px]">{t("content.subtitle")}</p>
        </div>
      </motion.div>

      {/* Tab Navigation - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative flex gap-1 p-1.5 bg-gradient-to-r from-[#F3F4F6] to-[#E7EBF0] rounded-xl w-fit mb-6 shadow-inner"
      >
        {[
          { key: "knowledge", icon: Database, label: "Knowledge Base", count: knowledgeItems.length },
          { key: "faqs", icon: HelpCircle, label: "Custom FAQs", count: faqs.length },
          { key: "documents", icon: FileUp, label: "Documents", count: documents.length },
          { key: "crawler", icon: Globe, label: "Web Crawler", count: crawlerUrls.filter(u => u.enabled).length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? "text-[#000034]"
                : "text-[#666666] hover:text-[#363535]"
            }`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-white rounded-lg shadow-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <tab.icon className="h-4 w-4 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`relative z-10 ml-1 px-2 py-0.5 text-xs rounded-full transition-colors ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white"
                  : "bg-[#F5F9FD] text-[#1D4F91]"
              }`}
            >
              {tab.count}
            </motion.span>
          </button>
        ))}
      </motion.div>

      {/* Knowledge Base Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "knowledge" && (
          <motion.div
            key="knowledge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Scraped Pages", value: knowledgeItems.length, color: "from-blue-500 to-blue-600", icon: Globe },
                { label: "Custom Entries", value: customEntries.length, color: "from-purple-500 to-violet-600", icon: FileText },
                { label: "Total Sections", value: Object.keys(groupedKnowledge).length + Object.keys(groupedCustomEntries).length, color: "from-amber-500 to-orange-500", icon: Layers },
                { label: "Auto-Scrape", value: autoScrapeSettings.enabled ? "Active" : "Off", isText: true, color: autoScrapeSettings.enabled ? "from-green-500 to-emerald-600" : "from-gray-400 to-gray-500", icon: Zap },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl border border-[#E7EBF0] p-4 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-[#000034]">
                    {stat.isText ? stat.value : <AnimatedCounter value={stat.value as number} />}
                  </p>
                  <p className="text-sm text-[#666666]">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Sub-Tab Toggle */}
            <div className="flex gap-2 mb-6">
              {[
                { key: "scraped" as const, label: "Scraped Pages", icon: Globe, count: knowledgeItems.length },
                { key: "custom" as const, label: "Custom Entries", icon: FileText, count: customEntries.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setKbSubTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    kbSubTab === tab.key
                      ? "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white shadow-md"
                      : "bg-white border border-[#E7EBF0] text-[#363535] hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    kbSubTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Scraped Pages Sub-Tab */}
            {kbSubTab === "scraped" && (
              <>
            {/* Search and Actions Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-[#E7EBF0] p-4 mb-6 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
                  <input
                    type="text"
                    placeholder="Search pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  {/* Language Toggle */}
                  <div className="flex items-center h-10 bg-white border border-[#E7EBF0] rounded-lg overflow-hidden">
                    <button
                      onClick={() => setKbLanguage("en")}
                      className={`h-full px-4 text-sm font-medium transition-all flex items-center gap-2 ${
                        kbLanguage === "en"
                          ? "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white"
                          : "text-[#363535] hover:bg-gray-50"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setKbLanguage("es")}
                      className={`h-full px-4 text-sm font-medium transition-all flex items-center gap-2 ${
                        kbLanguage === "es"
                          ? "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white"
                          : "text-[#363535] hover:bg-gray-50"
                      }`}
                    >
                      ES
                    </button>
                    <button
                      onClick={() => setKbLanguage("ht")}
                      className={`h-full px-4 text-sm font-medium transition-all flex items-center gap-2 ${
                        kbLanguage === "ht"
                          ? "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white"
                          : "text-[#363535] hover:bg-gray-50"
                      }`}
                    >
                      HT
                    </button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAutoScrapeSettings(!showAutoScrapeSettings)}
                    className={`h-10 px-4 border rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      autoScrapeSettings.enabled
                        ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        : "bg-white border-[#E7EBF0] text-[#363535] hover:bg-gray-50"
                    }`}
                  >
                    <Zap className="h-4 w-4" />
                    Auto-Scrape {autoScrapeSettings.enabled ? "On" : "Off"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRefreshKnowledge}
                    disabled={loading}
                    className="h-10 px-5 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Scrape Now
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Auto-Scrape Settings Panel */}
            <AnimatePresence>
              {showAutoScrapeSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-lg p-6 mb-6 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#000034] flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#000080] to-[#1D4F91] flex items-center justify-center">
                        <Settings className="h-4 w-4 text-white" />
                      </div>
                      Auto-Scrape Settings
                    </h3>
                    <button
                      onClick={() => setShowAutoScrapeSettings(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4 text-[#666666]" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#363535] mb-2">Status</label>
                      <button
                        onClick={() => setAutoScrapeSettings({
                          ...autoScrapeSettings,
                          enabled: !autoScrapeSettings.enabled
                        })}
                        className={`w-full h-11 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          autoScrapeSettings.enabled
                            ? "bg-green-700 text-white hover:bg-green-800"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                      >
                        {autoScrapeSettings.enabled ? (
                          <>
                            <Check className="h-4 w-4" /> Enabled
                          </>
                        ) : (
                          <>Disabled</>
                        )}
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#363535] mb-2">Frequency</label>
                      <select
                        value={autoScrapeSettings.frequency}
                        onChange={(e) => setAutoScrapeSettings({
                          ...autoScrapeSettings,
                          frequency: e.target.value as "daily" | "weekly" | "monthly"
                        })}
                        className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm bg-white focus:outline-none focus:border-[#000080] cursor-pointer"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#363535] mb-2">Last Run</label>
                      <div className="h-11 px-4 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg flex items-center text-sm text-[#363535]">
                        <Clock className="h-4 w-4 text-[#666666] mr-2" />
                        {autoScrapeSettings.lastRun
                          ? new Date(autoScrapeSettings.lastRun).toLocaleDateString()
                          : "Never"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#363535] mb-2">Next Run</label>
                      <div className="h-11 px-4 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg flex items-center text-sm text-[#363535]">
                        <Calendar className="h-4 w-4 text-[#666666] mr-2" />
                        {autoScrapeSettings.enabled && autoScrapeSettings.nextRun
                          ? new Date(autoScrapeSettings.nextRun).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Knowledge Base Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden"
            >
              {loading ? (
                <div className="p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="h-8 w-8 text-[#000080] mx-auto mb-3" />
                  </motion.div>
                  <p className="text-[#666666] text-sm">Loading knowledge base...</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E7EBF0]">
                  {filteredSections.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      {kbLanguage === "ht" && knowledgeItems.length === 0 ? (
                        <>
                          <Globe className="h-12 w-12 mx-auto mb-4 text-amber-700" />
                          <h3 className="text-lg font-semibold text-[#000034] mb-2">
                            No Haitian Creole Pages Available
                          </h3>
                          <p className="text-[#666666] text-sm mb-4 max-w-md mx-auto">
                            The Haitian Creole version of the website has not been scraped yet.
                            You can add custom knowledge entries for HT content in the meantime.
                          </p>
                          <button
                            onClick={() => setKbSubTab("custom")}
                            className="px-4 py-2 bg-[#000080] text-white rounded-lg text-sm font-medium hover:bg-[#1D4F91] transition-colors"
                          >
                            Add Custom Entry
                          </button>
                        </>
                      ) : (
                        <>
                          <Database className="h-12 w-12 mx-auto mb-3 text-[#E7EBF0]" />
                          <p className="text-[#666666] text-sm">
                            {searchTerm ? "No pages match your search" : "No pages in knowledge base"}
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    filteredSections.map(([section, items], sectionIdx) => (
                      <motion.div
                        key={section}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: sectionIdx * 0.05 }}
                      >
                        <motion.button
                          whileHover={{ backgroundColor: "rgba(0, 0, 128, 0.03)" }}
                          onClick={() => setExpandedSection(expandedSection === section ? null : section)}
                          className="w-full px-6 py-4 flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{ rotate: expandedSection === section ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4 text-[#666666]" />
                            </motion.div>
                            <span className="font-medium text-[#000034]">
                              <HighlightText text={section} highlight={searchTerm} />
                            </span>
                            <span className="px-2.5 py-1 bg-gradient-to-r from-[#F3F4F6] to-[#E7EBF0] text-[#666666] text-xs rounded-full font-medium">
                              {items.length} pages
                            </span>
                          </div>
                        </motion.button>

                        <AnimatePresence>
                          {expandedSection === section && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-gradient-to-b from-[#F5F9FD] to-white border-t border-[#E7EBF0] overflow-hidden"
                            >
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gradient-to-r from-[#1D4F91] to-[#000080] text-white text-left text-sm">
                                    <th className="px-6 py-3 font-medium">Page Title</th>
                                    <th className="px-6 py-3 font-medium">URL</th>
                                    <th className="px-6 py-3 font-medium w-20">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E7EBF0]">
                                  {items.slice(0, 10).map((item, idx) => (
                                    <motion.tr
                                      key={idx}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.03 }}
                                      className={`${idx % 2 === 0 ? "bg-white" : "bg-[#F5F9FD]/50"} hover:bg-blue-50/50 transition-colors`}
                                    >
                                      <td className="px-6 py-3 text-sm text-[#363535] font-medium">
                                        <HighlightText text={item.title} highlight={searchTerm} />
                                      </td>
                                      <td className="px-6 py-3 text-sm text-[#666666] truncate max-w-[300px]">
                                        {item.url}
                                      </td>
                                      <td className="px-6 py-3">
                                        <motion.a
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          href={`https://www.cityofdoral.com${item.url}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center justify-center w-8 h-8 text-[#1D4F91] hover:bg-blue-100 rounded-lg transition-colors"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </motion.a>
                                      </td>
                                    </motion.tr>
                                  ))}
                                </tbody>
                              </table>
                              {items.length > 10 && (
                                <p className="text-center py-3 text-sm text-[#666666] bg-white border-t border-[#E7EBF0]">
                                  + {items.length - 10} more pages
                                </p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
              </>
            )}

            {/* Custom Entries Sub-Tab */}
            {kbSubTab === "custom" && (
              <>
                {/* Search and Add Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl border border-[#E7EBF0] p-4 mb-6 shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
                      <input
                        type="text"
                        placeholder="Search custom entries..."
                        value={customSearchTerm}
                        onChange={(e) => setCustomSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 transition-all"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => importFileRef.current?.click()}
                      disabled={importing}
                      className="h-10 px-4 bg-white border border-[#E7EBF0] text-[#363535] text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                    >
                      {importing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {importing ? "Importing..." : "Import"}
                    </motion.button>
                    <input
                      ref={importFileRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportEntries}
                      className="hidden"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setEditingEntry(null);
                        setShowAddEntry(true);
                      }}
                      className="h-10 px-5 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Entry
                    </motion.button>
                  </div>
                </motion.div>

                {/* Custom Entries List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden"
                >
                  {customEntriesLoading ? (
                    <div className="p-12 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw className="h-8 w-8 text-[#000080] mx-auto mb-3" />
                      </motion.div>
                      <p className="text-[#666666] text-sm">Loading custom entries...</p>
                    </div>
                  ) : customEntries.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-[#E7EBF0]" />
                      <p className="text-[#666666] text-sm mb-4">No custom entries yet</p>
                      <button
                        onClick={() => {
                          setEditingEntry(null);
                          setShowAddEntry(true);
                        }}
                        className="text-[#000080] text-sm font-medium hover:underline"
                      >
                        Create your first entry
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E7EBF0]">
                      {filteredCustomEntries.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                          <Search className="h-12 w-12 mx-auto mb-3 text-[#E7EBF0]" />
                          <p className="text-[#666666] text-sm">No entries match your search</p>
                        </div>
                      ) : (
                        filteredCustomEntries.map(([section, entries], sectionIdx) => (
                          <motion.div
                            key={section}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: sectionIdx * 0.05 }}
                          >
                            <button
                              onClick={() => setExpandedEntrySection(expandedEntrySection === section ? null : section)}
                              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F5F9FD] transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                                  <Layers className="h-5 w-5 text-white" />
                                </div>
                                <div className="text-left">
                                  <h3 className="font-semibold text-[#000034]">
                                    <HighlightText text={section} highlight={customSearchTerm} />
                                  </h3>
                                  <p className="text-sm text-[#666666]">{entries.length} entries</p>
                                </div>
                              </div>
                              <motion.div
                                animate={{ rotate: expandedEntrySection === section ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight className="h-5 w-5 text-[#6b6b6b]" />
                              </motion.div>
                            </button>

                            <AnimatePresence>
                              {expandedEntrySection === section && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden bg-[#F5F9FD] border-t border-[#E7EBF0]"
                                >
                                  <div className="divide-y divide-[#E7EBF0]">
                                    {entries.map((entry, entryIdx) => (
                                      <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: entryIdx * 0.05 }}
                                        className="px-6 py-4 bg-white hover:bg-gray-50"
                                      >
                                        <div className="flex items-start justify-between gap-4">
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-[#000034] mb-1">
                                              <HighlightText text={entry.title} highlight={customSearchTerm} />
                                            </h4>
                                            <p className="text-sm text-[#666666] line-clamp-2 mb-2">
                                              <HighlightText text={entry.content} highlight={customSearchTerm} />
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-[#6b6b6b]">
                                              <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(entry.updatedAt).toLocaleDateString()}
                                              </span>
                                              {entry.url && (
                                                <a
                                                  href={entry.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="flex items-center gap-1 text-[#1D4F91] hover:underline"
                                                >
                                                  <Link className="h-3 w-3" />
                                                  Reference
                                                </a>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <motion.button
                                              whileHover={{ scale: 1.1 }}
                                              whileTap={{ scale: 0.9 }}
                                              onClick={() => {
                                                setEditingEntry(entry);
                                                setShowAddEntry(true);
                                              }}
                                              className="p-2 text-[#1D4F91] hover:bg-blue-100 rounded-lg transition-colors"
                                            >
                                              <Edit2 className="h-4 w-4" />
                                            </motion.button>
                                            <motion.button
                                              whileHover={{ scale: 1.1 }}
                                              whileTap={{ scale: 0.9 }}
                                              onClick={() => handleDeleteEntry(entry.id)}
                                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </motion.button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}
                </motion.div>
              </>
            )}

            {/* Add/Edit Entry Modal */}
            <AnimatePresence>
              {showAddEntry && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                  onClick={() => {
                    setShowAddEntry(false);
                    setEditingEntry(null);
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                  >
                    <div className="p-6 border-b border-[#E7EBF0]">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#000034]">
                          {editingEntry ? "Edit Entry" : "Add New Entry"}
                        </h2>
                        <button
                          onClick={() => {
                            setShowAddEntry(false);
                            setEditingEntry(null);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5 text-[#666666]" />
                        </button>
                      </div>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleSaveEntry({
                          title: formData.get("title") as string,
                          content: formData.get("content") as string,
                          section: formData.get("section") as string,
                          url: formData.get("url") as string,
                        });
                      }}
                      className="p-6 space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-[#363535] mb-2">Title *</label>
                        <input
                          type="text"
                          name="title"
                          defaultValue={editingEntry?.title || ""}
                          required
                          className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10"
                          placeholder="Enter a descriptive title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#363535] mb-2">Section *</label>
                        <select
                          name="section"
                          defaultValue={editingEntry?.section || ""}
                          required
                          className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] cursor-pointer"
                        >
                          <option value="">Select a section</option>
                          <option value="Government">Government</option>
                          <option value="Residents">Residents</option>
                          <option value="Businesses">Businesses</option>
                          <option value="Visitors">Visitors</option>
                          <option value="Services">Services</option>
                          <option value="About">About</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#363535] mb-2">Content *</label>
                        <textarea
                          name="content"
                          defaultValue={editingEntry?.content || ""}
                          required
                          rows={6}
                          className="w-full px-4 py-3 border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 resize-none"
                          placeholder="Enter the knowledge base content..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#363535] mb-2">Reference URL (optional)</label>
                        <input
                          type="url"
                          name="url"
                          defaultValue={editingEntry?.url || ""}
                          className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10"
                          placeholder="https://example.com/reference"
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddEntry(false);
                            setEditingEntry(null);
                          }}
                          className="px-5 py-2.5 border border-[#E7EBF0] text-[#363535] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={entrySaving}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {entrySaving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              {editingEntry ? "Update Entry" : "Create Entry"}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* FAQs Tab */}
        {activeTab === "faqs" && (
          <motion.div
            key="faqs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total FAQs", value: stats.total, color: "from-blue-500 to-blue-600" },
                { label: "Active", value: stats.active, color: "from-green-500 to-emerald-600" },
                { label: "Inactive", value: stats.inactive, color: "from-gray-400 to-gray-500" },
                { label: "High Priority", value: stats.highPriority, color: "from-red-500 to-rose-600" },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl border border-[#E7EBF0] p-4 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <HelpCircle className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-[#000034]">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-sm text-[#666666]">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-[#E7EBF0] p-4 mb-6 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
                  <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#666]" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="h-10 px-3 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
                    className="h-10 px-3 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="h-10 px-3 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] cursor-pointer"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select
                    value={filterUrlType}
                    onChange={(e) => setFilterUrlType(e.target.value as "all" | "global" | "page-specific")}
                    className="h-10 px-3 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] cursor-pointer"
                  >
                    <option value="all">All Pages</option>
                    <option value="global">Global Only</option>
                    <option value="page-specific">Page-Specific</option>
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddFaq(true)}
                    className="h-10 px-5 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add FAQ
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* FAQ Editor */}
            <AnimatePresence>
              {(showAddFaq || editingFaq) && (
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-lg p-6 mb-6 overflow-hidden"
                >
                  <h3 className="font-semibold text-[#000034] mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#000080] to-[#1D4F91] flex items-center justify-center">
                      {editingFaq ? <Edit2 className="h-4 w-4 text-white" /> : <Plus className="h-4 w-4 text-white" />}
                    </div>
                    {editingFaq ? "Edit FAQ" : "Add New FAQ"}
                  </h3>
                  <FaqForm
                    faq={editingFaq || undefined}
                    onSave={handleSaveFaq}
                    onCancel={() => {
                      setEditingFaq(null);
                      setShowAddFaq(false);
                    }}
                    saving={saving}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* FAQ Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden"
            >
              {faqsLoading ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#1D4F91] to-[#000080] text-white text-left text-sm">
                      <th className="px-4 py-4 w-12"><Skeleton className="h-4 w-4 bg-white/20" /></th>
                      <th className="px-6 py-4 font-medium">Question</th>
                      <th className="px-6 py-4 font-medium w-36">Category</th>
                      <th className="px-6 py-4 font-medium w-32">Page URL</th>
                      <th className="px-6 py-4 font-medium w-24">Priority</th>
                      <th className="px-6 py-4 font-medium w-24">Language</th>
                      <th className="px-6 py-4 font-medium w-20">Status</th>
                      <th className="px-6 py-4 font-medium w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7EBF0]">
                    {[...Array(5)].map((_, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-4"><Skeleton className="h-4 w-4 bg-gray-200" /></td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-3/4 mb-2 bg-gray-200" />
                          <Skeleton className="h-3 w-full bg-gray-100" />
                        </td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full bg-gray-200" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-lg bg-gray-200" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full bg-gray-200" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-12 bg-gray-200" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full bg-gray-200" /></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-lg bg-gray-200" />
                            <Skeleton className="h-8 w-8 rounded-lg bg-gray-200" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <>
                  {/* Bulk Action Bar */}
                  <AnimatePresence>
                    {selectedIds.size > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-[#000080]/5 to-[#1D4F91]/5 border-b border-[#E7EBF0]"
                      >
                        <span className="text-sm font-medium text-[#000034]">
                          {selectedIds.size} item(s) selected
                        </span>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBulkToggleStatus(true)}
                            className="h-8 px-3 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Activate
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBulkToggleStatus(false)}
                            className="h-8 px-3 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Deactivate
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleBulkDelete}
                            className="h-8 px-3 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </motion.button>
                          <button
                            onClick={() => setSelectedIds(new Set())}
                            className="h-8 px-3 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#1D4F91] to-[#000080] text-white text-left text-sm">
                        <th className="px-4 py-4 w-12">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === filteredFaqs.length && filteredFaqs.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-white/30 text-white focus:ring-white/20 cursor-pointer"
                          />
                        </th>
                        <th
                          className="px-6 py-4 font-medium cursor-pointer hover:bg-white/10 transition-colors select-none"
                          onClick={() => handleFaqSort("question")}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Question</span>
                            <SortIcon direction={sortKey === "question" ? sortDirection : null} />
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 font-medium w-36 cursor-pointer hover:bg-white/10 transition-colors select-none"
                          onClick={() => handleFaqSort("category")}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Category</span>
                            <SortIcon direction={sortKey === "category" ? sortDirection : null} />
                          </div>
                        </th>
                        <th className="px-6 py-4 font-medium w-32">
                          <div className="flex items-center gap-1.5">
                            <span>Page URL</span>
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 font-medium w-24 cursor-pointer hover:bg-white/10 transition-colors select-none"
                          onClick={() => handleFaqSort("priority")}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Priority</span>
                            <SortIcon direction={sortKey === "priority" ? sortDirection : null} />
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 font-medium w-24 cursor-pointer hover:bg-white/10 transition-colors select-none"
                          onClick={() => handleFaqSort("language")}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Language</span>
                            <SortIcon direction={sortKey === "language" ? sortDirection : null} />
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 font-medium w-20 cursor-pointer hover:bg-white/10 transition-colors select-none"
                          onClick={() => handleFaqSort("isActive")}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Status</span>
                            <SortIcon direction={sortKey === "isActive" ? sortDirection : null} />
                          </div>
                        </th>
                        <th className="px-6 py-4 font-medium w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7EBF0]">
                      {filteredFaqs.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center">
                            <HelpCircle className="h-12 w-12 mx-auto mb-3 text-[#E7EBF0]" />
                            <p className="text-[#666666] text-sm">
                              {searchTerm || filterCategory !== "all" || filterStatus !== "all" || filterPriority !== "all" || filterUrlType !== "all"
                                ? "No FAQs match your filters"
                                : "No FAQs yet. Add your first one!"}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        paginatedFaqs.map((faq, idx) => (
                          <motion.tr
                            key={faq.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`${idx % 2 === 0 ? "bg-white" : "bg-[#F5F9FD]/50"} hover:bg-blue-50/50 transition-colors ${selectedIds.has(faq.id) ? "bg-blue-50/80" : ""}`}
                          >
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(faq.id)}
                                onChange={() => handleSelectOne(faq.id)}
                                className="w-4 h-4 rounded border-gray-300 text-[#000080] focus:ring-[#000080]/20 cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-[#000034]">
                                <HighlightText text={faq.question} highlight={searchTerm} />
                              </p>
                              <p className="text-xs text-[#666666] mt-1 line-clamp-1">
                                <HighlightText text={faq.answer} highlight={searchTerm} />
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1.5 bg-gradient-to-r from-[#F3F4F6] to-[#E7EBF0] text-[#363535] text-xs rounded-lg font-medium">
                                {faq.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {faq.url ? (
                                <a
                                  href={faq.url.startsWith("http") ? faq.url : `https://www.cityofdoral.com${faq.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg hover:bg-blue-100 transition-colors truncate max-w-[120px]"
                                  title={faq.url}
                                >
                                  <Link className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{faq.url.split("/").pop() || "Link"}</span>
                                </a>
                              ) : (
                                <span className="text-xs text-[#6b6b6b] italic">Global</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 text-xs rounded-lg font-medium capitalize flex items-center gap-1 w-fit ${priorityColors[faq.priority]}`}>
                                {faq.priority === "high" && <Star className="h-3 w-3" />}
                                {faq.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-[#666666]">
                                <Globe className="h-3.5 w-3.5" />
                                {faq.language === "all" ? "ALL" : faq.language === "ht" ? "HT" : faq.language.toUpperCase()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleStatus(faq.id)}
                                className="focus:outline-none"
                              >
                                {faq.isActive ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-lg font-medium border border-green-100 hover:bg-green-100 transition-colors">
                                    <Check className="h-3 w-3" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-gray-100 text-[#666666] text-xs rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                    Inactive
                                  </span>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setEditingFaq(faq)}
                                  className="w-8 h-8 flex items-center justify-center text-[#666666] hover:text-[#1D4F91] hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteFaq(faq.id)}
                                  className="w-8 h-8 flex items-center justify-center text-[#666666] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {/* Pagination */}
                  {filteredFaqs.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredFaqs.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={handlePageChange}
                      onItemsPerPageChange={handleItemsPerPageChange}
                    />
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <motion.div
            key="documents"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Documents", value: documents.length, color: "from-blue-500 to-blue-600", icon: FileText },
                { label: "PDFs", value: documents.filter(d => d.type === "pdf").length, color: "from-red-500 to-rose-600", icon: File },
                { label: "Word Docs", value: documents.filter(d => d.type === "docx").length, color: "from-blue-600 to-indigo-600", icon: FileType },
                { label: "Total Chunks", value: documents.reduce((acc, d) => acc + d.chunks, 0), color: "from-purple-500 to-violet-600", icon: Layers },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl border border-[#E7EBF0] p-4 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-[#000034]">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-sm text-[#666666]">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Upload Zone */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = Array.from(e.dataTransfer.files);
                  handleFileUpload(files);
                }}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragging
                    ? "border-[#000080] bg-blue-50/50"
                    : "border-[#E7EBF0] bg-white hover:border-[#000080]/50 hover:bg-[#F5F9FD]"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(Array.from(e.target.files));
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                      isDragging ? "bg-[#000080]" : "bg-gradient-to-br from-[#000080] to-[#1D4F91]"
                    }`}
                  >
                    <Upload className="h-8 w-8 text-white" />
                  </motion.div>
                  <p className="text-lg font-medium text-[#000034] mb-1">
                    {isDragging ? "Drop files here" : "Drag and drop files here"}
                  </p>
                  <p className="text-sm text-[#666666] mb-3">or click to browse</p>
                  <p className="text-xs text-[#6b6b6b]">PDF, DOCX, TXT (max 10MB each)</p>
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 text-[#000080] animate-spin mx-auto mb-2" />
                      <p className="text-sm text-[#000034]">Uploading... {uploadProgress}%</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-xl border border-[#E7EBF0] p-4 mb-6 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={docSearchTerm}
                    onChange={(e) => setDocSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 transition-all"
                  />
                </div>
                {selectedDocIds.size > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBulkDeleteDocs}
                    className="h-10 px-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedDocIds.size})
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Documents Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden"
            >
              {documentsLoading ? (
                <div className="p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="h-8 w-8 text-[#000080] mx-auto mb-3" />
                  </motion.div>
                  <p className="text-[#666666] text-sm">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <FileUp className="h-12 w-12 mx-auto mb-3 text-[#E7EBF0]" />
                  <p className="text-[#666666] text-sm">No documents uploaded yet</p>
                  <p className="text-xs text-[#6b6b6b] mt-1">Upload PDF, DOCX, or TXT files to enhance the knowledge base</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#1D4F91] to-[#000080] text-white text-left text-sm">
                      <th className="px-4 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedDocIds.size === documents.length && documents.length > 0}
                          onChange={() => {
                            if (selectedDocIds.size === documents.length) {
                              setSelectedDocIds(new Set());
                            } else {
                              setSelectedDocIds(new Set(documents.map(d => d.id)));
                            }
                          }}
                          className="w-4 h-4 rounded border-white/30"
                        />
                      </th>
                      <th className="px-6 py-4 font-medium">Document Name</th>
                      <th className="px-6 py-4 font-medium w-24">Type</th>
                      <th className="px-6 py-4 font-medium w-24">Size</th>
                      <th className="px-6 py-4 font-medium w-24">Chunks</th>
                      <th className="px-6 py-4 font-medium w-32">Uploaded</th>
                      <th className="px-6 py-4 font-medium w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7EBF0]">
                    {documents
                      .filter(d => docSearchTerm ? d.originalName.toLowerCase().includes(docSearchTerm.toLowerCase()) : true)
                      .map((doc, idx) => (
                        <motion.tr
                          key={doc.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className={`${idx % 2 === 0 ? "bg-white" : "bg-[#F5F9FD]/50"} hover:bg-blue-50/50 transition-colors ${selectedDocIds.has(doc.id) ? "bg-blue-50/80" : ""}`}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedDocIds.has(doc.id)}
                              onChange={() => {
                                const newSelected = new Set(selectedDocIds);
                                if (newSelected.has(doc.id)) {
                                  newSelected.delete(doc.id);
                                } else {
                                  newSelected.add(doc.id);
                                }
                                setSelectedDocIds(newSelected);
                              }}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                doc.type === "pdf" ? "bg-red-100 text-red-600" :
                                doc.type === "docx" ? "bg-blue-100 text-blue-600" :
                                "bg-gray-100 text-gray-600"
                              }`}>
                                {doc.type === "pdf" ? <File className="h-5 w-5" /> :
                                 doc.type === "docx" ? <FileType className="h-5 w-5" /> :
                                 <FileText className="h-5 w-5" />}
                              </div>
                              <span className="font-medium text-[#000034]">{doc.originalName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs rounded-lg font-medium uppercase ${
                              doc.type === "pdf" ? "bg-red-100 text-red-600" :
                              doc.type === "docx" ? "bg-blue-100 text-blue-600" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {doc.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#666666]">
                            {formatFileSize(doc.size)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-purple-100 text-purple-600 text-xs rounded-lg font-medium">
                              {doc.chunks} chunks
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#666666]">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteDocument(doc.id, doc.originalName)}
                              className="w-8 h-8 flex items-center justify-center text-[#666666] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Web Crawler Tab */}
        {activeTab === "crawler" && (
          <motion.div
            key="crawler"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total URLs", value: crawlerUrls.length, color: "from-blue-500 to-blue-600" },
                { label: "Enabled", value: crawlerUrls.filter(u => u.enabled).length, color: "from-green-500 to-emerald-600" },
                { label: "Disabled", value: crawlerUrls.filter(u => !u.enabled).length, color: "from-gray-400 to-gray-500" },
                { label: "Last Crawl", value: autoScrapeSettings.lastRun ? "12h ago" : "Never", isText: true, color: "from-amber-500 to-orange-500" },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl border border-[#E7EBF0] p-4 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-[#000034]">
                    {stat.isText ? stat.value : <AnimatedCounter value={stat.value as number} />}
                  </p>
                  <p className="text-sm text-[#666666]">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Search, Filters, and Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-[#E7EBF0] p-4 mb-6 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
                  <input
                    type="text"
                    placeholder="Search URLs..."
                    value={crawlerSearchTerm}
                    onChange={(e) => setCrawlerSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <select
                    value={crawlerSectionFilter}
                    onChange={(e) => setCrawlerSectionFilter(e.target.value)}
                    className="h-10 px-3 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] cursor-pointer"
                  >
                    <option value="all">All Sections</option>
                    {Array.from(new Set(crawlerUrls.map(u => u.section))).map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                  <select
                    value={crawlerStatusFilter}
                    onChange={(e) => setCrawlerStatusFilter(e.target.value as "all" | "enabled" | "disabled")}
                    className="h-10 px-3 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                  {/* Language Toggle */}
                  <div className="flex items-center h-10 bg-white border border-[#E7EBF0] rounded-lg overflow-hidden">
                    <button
                      onClick={() => setCrawlerLanguage("en")}
                      className={`h-full px-4 text-sm font-medium transition-all flex items-center gap-2 ${
                        crawlerLanguage === "en"
                          ? "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white"
                          : "text-[#363535] hover:bg-gray-50"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setCrawlerLanguage("es")}
                      className={`h-full px-4 text-sm font-medium transition-all flex items-center gap-2 ${
                        crawlerLanguage === "es"
                          ? "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white"
                          : "text-[#363535] hover:bg-gray-50"
                      }`}
                    >
                      ES
                    </button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCrawlerSettings(!showCrawlerSettings)}
                    className={`h-10 px-4 border rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      autoScrapeSettings.enabled
                        ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        : "bg-white border-[#E7EBF0] text-[#363535] hover:bg-gray-50"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    Auto-Scrape
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRefreshKnowledge}
                    disabled={loading}
                    className="h-10 px-5 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Scrape Now
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Auto-Scrape Settings Panel */}
            <AnimatePresence>
              {showCrawlerSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-lg p-6 mb-6 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#000034] flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#000080] to-[#1D4F91] flex items-center justify-center">
                        <Settings className="h-4 w-4 text-white" />
                      </div>
                      Auto-Scrape Settings
                    </h3>
                    <button
                      onClick={() => setShowCrawlerSettings(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4 text-[#666666]" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#363535] mb-2">Status</label>
                      <button
                        onClick={() => setAutoScrapeSettings({
                          ...autoScrapeSettings,
                          enabled: !autoScrapeSettings.enabled
                        })}
                        className={`w-full h-11 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          autoScrapeSettings.enabled
                            ? "bg-green-700 text-white hover:bg-green-800"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                      >
                        {autoScrapeSettings.enabled ? (
                          <>
                            <Check className="h-4 w-4" /> Enabled
                          </>
                        ) : (
                          <>Disabled</>
                        )}
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#363535] mb-2">Frequency</label>
                      <select
                        value={autoScrapeSettings.frequency}
                        onChange={(e) => setAutoScrapeSettings({
                          ...autoScrapeSettings,
                          frequency: e.target.value as "daily" | "weekly" | "monthly"
                        })}
                        className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm bg-white focus:outline-none focus:border-[#000080] cursor-pointer"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#363535] mb-2">Last Run</label>
                      <div className="h-11 px-4 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg flex items-center text-sm text-[#363535]">
                        <Clock className="h-4 w-4 text-[#666666] mr-2" />
                        {autoScrapeSettings.lastRun
                          ? new Date(autoScrapeSettings.lastRun).toLocaleDateString()
                          : "Never"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#363535] mb-2">Next Run</label>
                      <div className="h-11 px-4 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg flex items-center text-sm text-[#363535]">
                        <Calendar className="h-4 w-4 text-[#666666] mr-2" />
                        {autoScrapeSettings.enabled && autoScrapeSettings.nextRun
                          ? new Date(autoScrapeSettings.nextRun).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* URL List by Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden mb-6"
            >
              {crawlerLoading ? (
                <div className="p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="h-8 w-8 text-[#000080] mx-auto mb-3" />
                  </motion.div>
                  <p className="text-[#666666] text-sm">Loading crawler URLs...</p>
                </div>
              ) : crawlerUrls.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Globe className="h-12 w-12 mx-auto mb-3 text-[#E7EBF0]" />
                  <p className="text-[#666666] text-sm">No URLs configured for crawling</p>
                  <p className="text-xs text-[#6b6b6b] mt-1">URLs will be populated from the knowledge base</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E7EBF0]">
                  {Object.entries(
                    crawlerUrls
                      .filter(u => {
                        if (crawlerSectionFilter !== "all" && u.section !== crawlerSectionFilter) return false;
                        if (crawlerStatusFilter === "enabled" && !u.enabled) return false;
                        if (crawlerStatusFilter === "disabled" && u.enabled) return false;
                        if (crawlerSearchTerm && !u.url.toLowerCase().includes(crawlerSearchTerm.toLowerCase()) && !u.title.toLowerCase().includes(crawlerSearchTerm.toLowerCase())) return false;
                        return true;
                      })
                      .reduce((acc, url) => {
                        if (!acc[url.section]) acc[url.section] = [];
                        acc[url.section].push(url);
                        return acc;
                      }, {} as Record<string, CrawlerURL[]>)
                  ).map(([section, urls], sectionIdx) => (
                    <motion.div
                      key={section}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: sectionIdx * 0.05 }}
                    >
                      <motion.button
                        whileHover={{ backgroundColor: "rgba(0, 0, 128, 0.03)" }}
                        onClick={() => setExpandedCrawlerSection(expandedCrawlerSection === section ? null : section)}
                        className="w-full px-6 py-4 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ rotate: expandedCrawlerSection === section ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="h-4 w-4 text-[#666666]" />
                          </motion.div>
                          <span className="font-medium text-[#000034]">{section}</span>
                          <span className="px-2.5 py-1 bg-gradient-to-r from-[#F3F4F6] to-[#E7EBF0] text-[#666666] text-xs rounded-full font-medium">
                            {urls.length} URLs
                          </span>
                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                            urls.every(u => u.enabled) ? "bg-green-100 text-green-700" :
                            urls.every(u => !u.enabled) ? "bg-gray-100 text-gray-600" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {urls.filter(u => u.enabled).length}/{urls.length} enabled
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSectionUrls(section, !urls.every(u => u.enabled));
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            urls.every(u => u.enabled)
                              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {urls.every(u => u.enabled) ? "Disable All" : "Enable All"}
                        </motion.button>
                      </motion.button>

                      <AnimatePresence>
                        {expandedCrawlerSection === section && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gradient-to-b from-[#F5F9FD] to-white border-t border-[#E7EBF0] overflow-hidden"
                          >
                            <div className="divide-y divide-[#E7EBF0]">
                              {urls.map((url, idx) => (
                                <motion.div
                                  key={url.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.02 }}
                                  className={`px-6 py-3 flex items-center justify-between ${idx % 2 === 0 ? "bg-white" : "bg-[#F5F9FD]/50"}`}
                                >
                                  <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <button
                                      onClick={() => handleToggleUrl(url.id)}
                                      className={`flex-shrink-0 w-12 h-6 rounded-full transition-colors relative ${
                                        url.enabled ? "bg-green-500" : "bg-gray-300"
                                      }`}
                                    >
                                      <motion.div
                                        animate={{ x: url.enabled ? 24 : 2 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                                      />
                                    </button>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-[#000034] truncate">{url.title || url.url}</p>
                                      <p className="text-xs text-[#666666] truncate">{url.url}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    {url.lastCrawled && (
                                      <span className="text-xs text-[#6b6b6b]">Last: {formatTimeAgo(url.lastCrawled)}</span>
                                    )}
                                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                                      url.lastStatus === "success" ? "bg-green-100 text-green-700" :
                                      url.lastStatus === "error" ? "bg-red-100 text-red-600" :
                                      url.lastStatus === "pending" ? "bg-amber-100 text-amber-700" :
                                      "bg-gray-100 text-gray-500"
                                    }`}>
                                      {url.lastStatus === "never" ? "Not crawled" : url.lastStatus}
                                    </span>
                                    <motion.a
                                      whileHover={{ scale: 1.1 }}
                                      href={url.fullUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-8 h-8 flex items-center justify-center text-[#1D4F91] hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </motion.a>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Add Custom URL */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl border border-[#E7EBF0] p-4 shadow-sm"
            >
              <h4 className="text-sm font-medium text-[#000034] mb-3 flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-[#1D4F91]" />
                Add Custom URL
              </h4>
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
                  <input
                    type="text"
                    placeholder="https://www.cityofdoral.com/..."
                    value={newCustomUrl}
                    onChange={(e) => setNewCustomUrl(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 transition-all"
                  />
                </div>
                <select
                  value={newCustomSection}
                  onChange={(e) => setNewCustomSection(e.target.value)}
                  className="h-10 px-4 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] cursor-pointer"
                >
                  {["About", "Businesses", "Residents", "Government", "Services", "Other"].map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddCustomUrl}
                  disabled={!newCustomUrl.trim()}
                  className="h-10 px-5 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add URL
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return "Just now";
}

function FaqForm({
  faq,
  onSave,
  onCancel,
  saving = false,
}: {
  faq?: FAQ;
  onSave: (faq: FAQ) => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  const [formData, setFormData] = useState<FAQ>({
    id: faq?.id || "",
    question: faq?.question || "",
    answer: faq?.answer || "",
    category: faq?.category || "General",
    language: faq?.language || "all",
    priority: faq?.priority || "medium",
    isActive: faq?.isActive ?? true,
    createdAt: faq?.createdAt || new Date().toISOString(),
    url: faq?.url || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod
    const result = faqSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSave(formData);
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#363535] mb-2">Question</label>
        <input
          type="text"
          value={formData.question}
          onChange={(e) => {
            setFormData({ ...formData, question: e.target.value });
            clearError("question");
          }}
          className={`w-full h-11 px-4 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
            errors.question
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              : "border-[#E7EBF0] focus:border-[#000080] focus:ring-[#000080]/10"
          }`}
          placeholder="Enter the question..."
        />
        {errors.question && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.question}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#363535] mb-2">Answer</label>
        <textarea
          value={formData.answer}
          onChange={(e) => {
            setFormData({ ...formData, answer: e.target.value });
            clearError("answer");
          }}
          className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all min-h-[120px] resize-none ${
            errors.answer
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              : "border-[#E7EBF0] focus:border-[#000080] focus:ring-[#000080]/10"
          }`}
          placeholder="Enter the answer..."
        />
        {errors.answer && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.answer}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#363535] mb-2">
          Page URL <span className="text-[#6b6b6b] font-normal">(optional)</span>
        </label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
          <input
            type="text"
            value={formData.url || ""}
            onChange={(e) => {
              setFormData({ ...formData, url: e.target.value });
              clearError("url");
            }}
            className={`w-full h-11 pl-10 pr-4 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.url
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                : "border-[#E7EBF0] focus:border-[#000080] focus:ring-[#000080]/10"
            }`}
            placeholder="/Departments/Building-Department or leave empty for global FAQ"
          />
        </div>
        <p className="mt-1.5 text-xs text-[#666666]">
          Associate this FAQ with a specific page. Leave empty for site-wide FAQs.
        </p>
        {errors.url && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.url}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#363535] mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] cursor-pointer transition-all"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#363535] mb-2">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as "low" | "medium" | "high" })}
            className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] cursor-pointer transition-all"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#363535] mb-2">Language</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value as "en" | "es" | "ht" | "all" })}
            className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] cursor-pointer transition-all"
          >
            <option value="all">All Languages</option>
            <option value="en">English Only</option>
            <option value="es">Spanish Only</option>
            <option value="ht">Haitian Creole Only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#363535] mb-2">Status</label>
          <select
            value={formData.isActive ? "active" : "inactive"}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "active" })}
            className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] cursor-pointer transition-all"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="h-11 px-6 bg-white border border-[#E7EBF0] text-[#363535] text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
        >
          <X className="h-4 w-4 inline mr-2" />
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: saving ? 1 : 1.02, y: saving ? 0 : -2 }}
          whileTap={{ scale: saving ? 1 : 0.98 }}
          type="submit"
          disabled={saving}
          className="h-11 px-6 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#000080]/25 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save FAQ"}
        </motion.button>
      </div>
    </form>
  );
}
