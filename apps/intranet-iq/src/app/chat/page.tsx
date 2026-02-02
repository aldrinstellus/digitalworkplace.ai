"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { TransparencyPane } from "@/components/chat/TransparencyPane";
import { ChatSpaces, type ChatSpace } from "@/components/chat/ChatSpaces";
import { FileUploadModal } from "@/components/chat/FileUploadModal";
import { SearchScopeToggle, type SearchScope } from "@/components/chat/SearchScopeToggle";
import { MentionInput } from "@/components/chat/MentionInput";
import { FadeIn } from "@/lib/motion";
import {
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ChevronDown,
  Mic,
  Paperclip,
  Settings2,
  Clock,
  Plus,
  Trash2,
  Eye,
  GitBranch,
  Download,
  FileText,
  FileDown,
  Clipboard,
  Check,
  Filter,
  Wrench,
  MessageSquare,
  Target,
  Folder,
  Video,
  BookOpen,
  Cloud,
  Palette,
  StickyNote,
  Briefcase,
} from "lucide-react";
import { mockChatThreads, mockChatMessages } from "@/lib/mockData";
import type { ChatSource } from "@/lib/database.types";
import { SOURCE_DISPLAY, type DataSource } from "@/lib/unifiedTypes";

// App filter options for chat
const APP_FILTER_OPTIONS: Array<{ id: DataSource | 'all'; name: string; icon: React.ReactNode; color: string }> = [
  { id: 'all', name: 'All Apps', icon: <Sparkles className="w-4 h-4" />, color: '#10b981' },
  { id: 'slack', name: 'Slack', icon: <MessageSquare className="w-4 h-4" />, color: '#4A154B' },
  { id: 'jira', name: 'Jira', icon: <Target className="w-4 h-4" />, color: '#0052CC' },
  { id: 'github', name: 'GitHub', icon: <GitBranch className="w-4 h-4" />, color: '#24292e' },
  { id: 'drive', name: 'Drive', icon: <Folder className="w-4 h-4" />, color: '#4285F4' },
  { id: 'confluence', name: 'Confluence', icon: <BookOpen className="w-4 h-4" />, color: '#172B4D' },
  { id: 'zoom', name: 'Zoom', icon: <Video className="w-4 h-4" />, color: '#2D8CFF' },
  { id: 'salesforce', name: 'Salesforce', icon: <Cloud className="w-4 h-4" />, color: '#00A1E0' },
  { id: 'figma', name: 'Figma', icon: <Palette className="w-4 h-4" />, color: '#F24E1E' },
  { id: 'notion', name: 'Notion', icon: <StickyNote className="w-4 h-4" />, color: '#000000' },
  { id: 'linkedin', name: 'LinkedIn', icon: <Briefcase className="w-4 h-4" />, color: '#0077B5' },
];

// Extended types for chat page that work with mock data
interface ExtendedChatThread {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
  preview: string;
  model?: string;
  parent_thread_id?: string | null;
  branch_point_message_id?: string | null;
}

interface ExtendedChatMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  sources?: ChatSource[];
  confidence?: number;
  toolsUsed?: string[];
}
import { ConfidenceBadge } from "@/components/chat/ConfidenceBadge";
import { MessageContentWithCitations, SourcesFooter } from "@/components/chat/CitationLink";

const llmOptions = [
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
  { id: "claude-3", name: "Claude 3", provider: "Anthropic" },
  { id: "custom", name: "Custom Model", provider: "Internal" },
];

const responseStyles = [
  { id: "factual", name: "Factual", description: "Direct, precise answers" },
  { id: "balanced", name: "Balanced", description: "Clear with context" },
  { id: "creative", name: "Creative", description: "Engaging explanations" },
];

// Demo spaces data
const demoSpaces: ChatSpace[] = [
  { id: "1", name: "Engineering", description: "Engineering team discussions", memberCount: 24, isPublic: true, isFavorite: true },
  { id: "2", name: "Product", description: "Product planning and roadmap", memberCount: 12, isPublic: true },
  { id: "3", name: "HR Confidential", description: "HR team private space", memberCount: 5, isPublic: false },
];

export default function ChatPage() {
  // Use mock data instead of Supabase hooks
  const [threads, setThreads] = useState<ExtendedChatThread[]>(
    mockChatThreads.map(t => ({ ...t, title: t.title || null, model: "claude-3", parent_thread_id: null, branch_point_message_id: null }))
  );
  const threadsLoading = false;
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const messagesLoading = false;

  // Mock thread functions
  const createThread = async (title?: string, model?: string) => {
    const newThread = {
      id: `thread-${Date.now()}`,
      title: title || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      message_count: 0,
      preview: "",
      model: model || "claude-3",
      parent_thread_id: null,
      branch_point_message_id: null,
    };
    setThreads(prev => [newThread, ...prev]);
    return newThread;
  };

  const createBranch = async (parentThreadId: string, messageId: string, model?: string) => {
    const parentThread = threads.find(t => t.id === parentThreadId);
    const newThread = {
      id: `thread-branch-${Date.now()}`,
      title: `Branch of ${parentThread?.title || "Chat"}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      message_count: 0,
      preview: "",
      model: model || "claude-3",
      parent_thread_id: parentThreadId,
      branch_point_message_id: messageId,
    };
    setThreads(prev => [newThread, ...prev]);
    // Return messages up to the branch point
    const branchMessages = messages.filter(m => {
      const msgIndex = messages.findIndex(msg => msg.id === messageId);
      return messages.indexOf(m) <= msgIndex;
    });
    return { thread: newThread, messages: branchMessages };
  };

  const isBranch = (thread: { parent_thread_id?: string | null }) => !!thread.parent_thread_id;
  const getParentThreadId = (thread: { parent_thread_id?: string | null }) => thread.parent_thread_id || null;

  // Load messages when active thread changes
  useEffect(() => {
    if (activeThreadId) {
      const threadMessages = mockChatMessages
        .filter(m => m.thread_id === activeThreadId)
        .map(m => ({ ...m, sources: [] as ChatSource[], confidence: 85 }));
      setMessages(threadMessages);
    } else {
      setMessages([]);
    }
  }, [activeThreadId]);

  const addMessage = async (role: "user" | "assistant", content: string, metadata?: { sources?: ChatSource[]; confidence?: number; llmModel?: string; toolsUsed?: string[] }) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      thread_id: activeThreadId || "",
      role,
      content,
      created_at: new Date().toISOString(),
      sources: metadata?.sources || [],
      confidence: metadata?.confidence || 85,
      toolsUsed: metadata?.toolsUsed || [],
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState(llmOptions[1]);
  const [responseStyle, setResponseStyle] = useState(responseStyles[1]);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitializedThreadRef = useRef(false);

  // New feature states
  const [showTransparency, setShowTransparency] = useState(false);
  const [searchScope, setSearchScope] = useState<SearchScope>("company");
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [spaces] = useState<ChatSpace[]>(demoSpaces);

  // App filter for chat queries
  const [selectedAppFilter, setSelectedAppFilter] = useState<DataSource | 'all'>('all');
  const [showAppFilter, setShowAppFilter] = useState(false);

  // Transparency pane data (simulated)
  const [transparencyData, setTransparencyData] = useState({
    sources: [] as { id: string; title: string; type: string; url?: string; relevance?: number }[],
    steps: [] as { id: string; name: string; status: "completed" | "running" | "pending"; duration?: number }[],
    isProcessing: false,
    totalTokens: 0,
    responseTime: 0,
  });

  // Track last user query for regeneration
  const [lastUserQuery, setLastUserQuery] = useState<string | null>(null);

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Check for voice support on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        setVoiceSupported(true);
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((result: any) => result[0].transcript)
            .join("");
          setInput(transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  // Set first thread as active when threads load (sync during render)
  if (threads.length > 0 && !activeThreadId && !hasInitializedThreadRef.current) {
    hasInitializedThreadRef.current = true;
    setActiveThreadId(threads[0].id);
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = useCallback(async () => {
    const thread = await createThread(undefined, selectedLLM.id);
    if (thread) {
      setActiveThreadId(thread.id);
      setMessages([]);
    }
  }, [createThread, selectedLLM.id, setMessages]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    // Create thread if none exists
    let threadId = activeThreadId;
    if (!threadId) {
      const thread = await createThread(input.slice(0, 50), selectedLLM.id);
      if (thread) {
        threadId = thread.id;
        setActiveThreadId(thread.id);
      } else {
        return;
      }
    }

    // Add user message
    const userMessage = await addMessage("user", input);
    if (!userMessage) return;

    const userQuery = input;
    setLastUserQuery(userQuery);
    setInput("");
    setIsTyping(true);

    // Update transparency data to show processing
    setTransparencyData({
      sources: [],
      steps: [
        { id: "1", name: "Parsing query", status: "running" },
        { id: "2", name: "Searching knowledge base", status: "pending" },
        { id: "3", name: "Generating response", status: "pending" },
      ],
      isProcessing: true,
      totalTokens: 0,
      responseTime: 0,
    });

    try {
      // Call the Chat API with Claude integration
      // Include app filter if not 'all'
      const requestBody: Record<string, unknown> = {
        message: userQuery,
        threadId,
        model: selectedLLM.id === "claude-3" ? "claude-sonnet-4-20250514" : selectedLLM.id,
        responseStyle: responseStyle.id,
      };

      // Add app filter if a specific app is selected
      if (selectedAppFilter !== 'all') {
        requestBody.appFilter = selectedAppFilter;
      }

      const response = await fetch("/diq/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      // Add AI response to messages with tools used info
      await addMessage(
        "assistant",
        data.message,
        {
          sources: data.sources || [],
          confidence: data.confidence || 85,
          llmModel: selectedLLM.id,
          toolsUsed: data.toolsUsed || [],
        }
      );

      // Update transparency data with results from API
      setTransparencyData({
        sources: data.sources || [],
        steps: data.steps || [
          { id: "1", name: "Parsing query", status: "completed", duration: 120 },
          { id: "2", name: "Searching knowledge base", status: "completed", duration: 450 },
          { id: "3", name: "Generating response", status: "completed", duration: 890 },
        ],
        isProcessing: false,
        totalTokens: data.metrics?.totalTokens || data.tokensUsed || 0,
        responseTime: data.metrics?.responseTime || 1000,
      });

      // Update thread title if it's the first message
      if (threads.find(t => t.id === threadId)?.title === null) {
        setThreads(prev => prev.map(t =>
          t.id === threadId ? { ...t, title: userQuery.slice(0, 50) } : t
        ));
      }
    } catch (error) {
      console.error("Chat API error:", error);
      // Fallback to demo response on error
      await addMessage(
        "assistant",
        "I apologize, but I encountered an error processing your request. Please try again.",
        {
          sources: [],
          confidence: 0,
          llmModel: selectedLLM.id,
        }
      );

      setTransparencyData({
        sources: [],
        steps: [
          { id: "1", name: "Parsing query", status: "completed", duration: 50 },
          { id: "2", name: "Error occurred", status: "completed", duration: 0 },
        ],
        isProcessing: false,
        totalTokens: 0,
        responseTime: 0,
      });
    }

    setIsTyping(false);
  }, [input, activeThreadId, createThread, addMessage, selectedLLM.id, responseStyle.id, threads, setThreads]);

  const handleRegenerate = useCallback(async (messageId: string) => {
    if (!lastUserQuery || isTyping) return;

    // Find the message to regenerate and remove it
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Remove the message from the display (in production, this would also delete from DB)
    setMessages(prev => prev.filter(m => m.id !== messageId));
    setIsTyping(true);

    // Update transparency data to show processing
    setTransparencyData({
      sources: [],
      steps: [
        { id: "1", name: "Regenerating response", status: "running" },
        { id: "2", name: "Searching knowledge base", status: "pending" },
        { id: "3", name: "Generating new response", status: "pending" },
      ],
      isProcessing: true,
      totalTokens: 0,
      responseTime: 0,
    });

    try {
      // Call the Chat API with Claude integration
      const response = await fetch("/diq/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: lastUserQuery,
          threadId: activeThreadId,
          model: selectedLLM.id === "claude-3" ? "claude-sonnet-4-20250514" : selectedLLM.id,
          responseStyle: responseStyle.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate response");
      }

      await addMessage(
        "assistant",
        data.message + "\n\n_(Regenerated response)_",
        {
          sources: data.sources || [],
          confidence: data.confidence || 88,
          llmModel: selectedLLM.id,
        }
      );

      setTransparencyData({
        sources: data.sources || [],
        steps: data.steps || [
          { id: "1", name: "Regenerating response", status: "completed", duration: 150 },
          { id: "2", name: "Searching knowledge base", status: "completed", duration: 480 },
          { id: "3", name: "Generating new response", status: "completed", duration: 920 },
        ],
        isProcessing: false,
        totalTokens: data.metrics?.totalTokens || data.tokensUsed || 0,
        responseTime: data.metrics?.responseTime || 1000,
      });
    } catch (error) {
      console.error("Regenerate API error:", error);
      await addMessage(
        "assistant",
        "I apologize, but I couldn't regenerate the response. Please try again.",
        {
          sources: [],
          confidence: 0,
          llmModel: selectedLLM.id,
        }
      );

      setTransparencyData({
        sources: [],
        steps: [
          { id: "1", name: "Regenerating response", status: "completed", duration: 50 },
          { id: "2", name: "Error occurred", status: "completed", duration: 0 },
        ],
        isProcessing: false,
        totalTokens: 0,
        responseTime: 0,
      });
    }

    setIsTyping(false);
  }, [lastUserQuery, isTyping, messages, setMessages, addMessage, responseStyle.id, selectedLLM.id, activeThreadId]);

  // Handle branching from a specific message
  const handleBranchFromMessage = useCallback(async (messageId: string) => {
    if (!activeThreadId || isTyping) return;

    const result = await createBranch(activeThreadId, messageId, selectedLLM.id);
    if (result) {
      // Switch to the new branched thread
      setActiveThreadId(result.thread.id);
      setMessages(result.messages);
    }
  }, [activeThreadId, isTyping, createBranch, selectedLLM.id, setMessages]);

  // Get current thread for export
  const currentThread = threads.find(t => t.id === activeThreadId);

  // Export conversation as Markdown
  const exportAsMarkdown = useCallback(() => {
    if (!currentThread || messages.length === 0) return;

    const threadTitle = currentThread.title || "Chat Export";
    const date = new Date().toISOString().split("T")[0];

    let markdown = `# ${threadTitle}\n`;
    markdown += `**Date:** ${date}\n`;
    markdown += `**Model:** ${selectedLLM.name}\n\n`;
    markdown += `---\n\n`;

    messages.forEach((msg) => {
      const timestamp = new Date(msg.created_at).toLocaleString();
      const role = msg.role === "user" ? "User" : "Assistant";
      markdown += `## ${role}\n`;
      markdown += `*${timestamp}*\n\n`;
      markdown += `${msg.content}\n\n`;

      // Add sources if available
      if (msg.role === "assistant" && msg.sources && msg.sources.length > 0) {
        markdown += `**Sources:**\n`;
        msg.sources.forEach((source: ChatSource, idx: number) => {
          markdown += `${idx + 1}. ${source.title}${source.url ? ` - ${source.url}` : ""}\n`;
        });
        markdown += `\n`;
      }

      markdown += `---\n\n`;
    });

    // Create and download file
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${threadTitle.replace(/[^a-z0-9]/gi, "_")}_${date}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportMenu(false);
    setExportSuccess("Markdown");
    setTimeout(() => setExportSuccess(null), 3000);
  }, [currentThread, messages, selectedLLM.name]);

  // Export conversation as PDF (using print dialog)
  const exportAsPDF = useCallback(() => {
    if (!currentThread || messages.length === 0) return;

    const threadTitle = currentThread.title || "Chat Export";
    const date = new Date().toISOString().split("T")[0];

    // Create printable HTML
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${threadTitle}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #fff; color: #1a1a1a; }
          h1 { color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
          .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
          .message { margin-bottom: 24px; padding: 16px; border-radius: 8px; }
          .message.user { background: #f0fdf4; border-left: 4px solid #10b981; }
          .message.assistant { background: #f8fafc; border-left: 4px solid #64748b; }
          .role { font-weight: 600; color: #10b981; margin-bottom: 8px; }
          .message.assistant .role { color: #64748b; }
          .timestamp { font-size: 12px; color: #94a3b8; margin-bottom: 8px; }
          .content { white-space: pre-wrap; line-height: 1.6; }
          .sources { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
          .sources a { color: #10b981; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>${threadTitle}</h1>
        <div class="meta">
          <strong>Date:</strong> ${date}<br/>
          <strong>Model:</strong> ${selectedLLM.name}
        </div>
    `;

    messages.forEach((msg) => {
      const timestamp = new Date(msg.created_at).toLocaleString();
      const role = msg.role === "user" ? "User" : "Assistant";
      html += `
        <div class="message ${msg.role}">
          <div class="role">${role}</div>
          <div class="timestamp">${timestamp}</div>
          <div class="content">${msg.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
      `;

      if (msg.role === "assistant" && msg.sources && msg.sources.length > 0) {
        html += `<div class="sources"><strong>Sources:</strong><br/>`;
        msg.sources.forEach((source: ChatSource, idx: number) => {
          html += `${idx + 1}. ${source.title}${source.url ? ` - <a href="${source.url}">${source.url}</a>` : ""}<br/>`;
        });
        html += `</div>`;
      }

      html += `</div>`;
    });

    html += `</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    // Trigger print after content loads
    setTimeout(() => {
      printWindow.print();
    }, 250);

    setShowExportMenu(false);
    setExportSuccess("PDF");
    setTimeout(() => setExportSuccess(null), 3000);
  }, [currentThread, messages, selectedLLM.name]);

  // Copy conversation to clipboard
  const copyToClipboard = useCallback(async () => {
    if (!currentThread || messages.length === 0) return;

    const threadTitle = currentThread.title || "Chat Export";
    let text = `${threadTitle}\n${"=".repeat(threadTitle.length)}\n\n`;

    messages.forEach((msg) => {
      const timestamp = new Date(msg.created_at).toLocaleString();
      const role = msg.role === "user" ? "User" : "Assistant";
      text += `[${role}] (${timestamp})\n`;
      text += `${msg.content}\n\n`;
    });

    try {
      await navigator.clipboard.writeText(text);
      setShowExportMenu(false);
      setExportSuccess("Clipboard");
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [currentThread, messages]);

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />

      <main className="ml-16 h-screen flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <FadeIn>
            <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center shadow-lg shadow-[var(--accent-ember)]/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-medium text-[var(--text-primary)]">AI Assistant</h1>
                  <p className="text-sm text-[var(--text-muted)]">
                    Powered by {selectedLLM.name} ({selectedLLM.provider})
                  </p>
                </div>
              </div>

            <div className="flex items-center gap-2">
              {/* Search Scope Toggle */}
              <SearchScopeToggle
                scope={searchScope}
                onScopeChange={setSearchScope}
                activeSpaceName={spaces.find(s => s.id === activeSpaceId)?.name}
              />

              {/* App Filter Dropdown */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowAppFilter(!showAppFilter)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    selectedAppFilter !== 'all'
                      ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)] border-[var(--accent-ember)]/30"
                      : "bg-[var(--bg-slate)] hover:bg-[var(--bg-slate)]/80 text-[var(--text-secondary)] border-[var(--border-subtle)]"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Filter className="w-4 h-4" />
                  {selectedAppFilter === 'all' ? 'All Apps' : APP_FILTER_OPTIONS.find(a => a.id === selectedAppFilter)?.name}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAppFilter ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {showAppFilter && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-12 w-56 bg-[var(--bg-charcoal)] border border-[var(--border-default)] rounded-xl shadow-xl z-50 p-2 max-h-80 overflow-y-auto"
                    >
                      {APP_FILTER_OPTIONS.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => {
                            setSelectedAppFilter(app.id);
                            setShowAppFilter(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedAppFilter === app.id
                              ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-slate)]"
                          }`}
                        >
                          <span
                            className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center"
                            style={{ backgroundColor: `${app.color}20`, color: app.color }}
                          >
                            {app.icon}
                          </span>
                          <span className="flex-1 text-left">{app.name}</span>
                          {selectedAppFilter === app.id && (
                            <Check className="w-4 h-4 text-[var(--accent-ember)]" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Show Work Button */}
              <motion.button
                onClick={() => setShowTransparency(!showTransparency)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  showTransparency
                    ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)] border-[var(--accent-ember)]/30"
                    : "bg-[var(--bg-slate)] hover:bg-[var(--bg-slate)]/80 text-[var(--text-secondary)] border-[var(--border-subtle)]"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Eye className="w-4 h-4" />
                Show work
              </motion.button>

              {/* Export Button */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={messages.length === 0}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    showExportMenu
                      ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)] border-[var(--accent-ember)]/30"
                      : "bg-[var(--bg-slate)] hover:bg-[var(--bg-slate)]/80 text-[var(--text-secondary)] border-[var(--border-subtle)]"
                  }`}
                  whileHover={{ scale: messages.length > 0 ? 1.02 : 1 }}
                  whileTap={{ scale: messages.length > 0 ? 0.98 : 1 }}
                >
                  {exportSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-[var(--success)]" />
                      <span className="text-[var(--success)]">Exported!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-12 w-48 bg-[var(--bg-charcoal)] border border-[var(--border-default)] rounded-xl shadow-xl z-50 p-2"
                    >
                      <button
                        onClick={exportAsPDF}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-slate)] transition-colors"
                      >
                        <FileDown className="w-4 h-4" />
                        Export as PDF
                      </button>
                      <button
                        onClick={exportAsMarkdown}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-slate)] transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Export as Markdown
                      </button>
                      <button
                        onClick={copyToClipboard}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-slate)] transition-colors"
                      >
                        <Clipboard className="w-4 h-4" />
                        Copy to Clipboard
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* LLM Selector */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-slate)] hover:bg-[var(--bg-slate)]/80 border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings2 className="w-4 h-4" />
                  Settings
                  <ChevronDown className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-12 w-72 bg-[var(--bg-charcoal)] border border-[var(--border-default)] rounded-xl shadow-xl z-50 p-4"
                    >
                      <div className="mb-4">
                        <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                          Model
                        </label>
                        <div className="mt-2 space-y-1">
                          {llmOptions.map((llm) => (
                            <button
                              key={llm.id}
                              onClick={() => setSelectedLLM(llm)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                selectedLLM.id === llm.id
                                  ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-slate)]"
                              }`}
                            >
                              <span>{llm.name}</span>
                              <span className="text-xs text-[var(--text-muted)]">{llm.provider}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                          Response Style
                        </label>
                        <div className="mt-2 space-y-1">
                          {responseStyles.map((style) => (
                            <button
                              key={style.id}
                              onClick={() => setResponseStyle(style)}
                              className={`w-full flex flex-col items-start px-3 py-2 rounded-lg text-sm transition-colors ${
                                responseStyle.id === style.id
                                  ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-slate)]"
                              }`}
                            >
                              <span>{style.name}</span>
                              <span className="text-xs text-[var(--text-muted)]">{style.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                className="p-2 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Clock className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          </FadeIn>

          {/* Transparency Pane */}
          <AnimatePresence>
            {showTransparency && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-[var(--border-subtle)] overflow-hidden"
              >
                <TransparencyPane
                  sources={transparencyData.sources}
                  steps={transparencyData.steps}
                  isProcessing={transparencyData.isProcessing}
                  totalTokens={transparencyData.totalTokens}
                  responseTime={transparencyData.responseTime}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {messagesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-ember)]" />
              </div>
            ) : messages.length === 0 ? (
              <FadeIn className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-ember)]/20 to-[var(--accent-copper)]/10 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-[var(--accent-ember)]" />
                </div>
                <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">Start a conversation</h3>
                <p className="text-sm text-[var(--text-muted)]/70 max-w-md">
                  Ask questions about your organization, search knowledge bases, or get help with tasks.
                </p>
              </FadeIn>
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.map((message: ExtendedChatMessage, index: number) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                    className={`flex gap-4 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[var(--accent-ember)]/20">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-2xl ${
                        message.role === "user"
                          ? "bg-[var(--accent-ember)]/15 border border-[var(--accent-ember)]/30"
                          : "bg-[var(--bg-charcoal)] border border-[var(--border-subtle)]"
                      } rounded-2xl px-4 py-3`}
                    >
                      {/* Message Content with Inline Citations */}
                      {message.role === "assistant" && message.sources && message.sources.length > 0 ? (
                        <MessageContentWithCitations
                          content={message.content}
                          sources={message.sources as ChatSource[]}
                        />
                      ) : (
                        <div className="text-[var(--text-primary)]/90 whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                      )}

                      {/* Confidence Badge, Tools Used, and Sources Footer - for assistant messages */}
                      {message.role === "assistant" && (
                        <>
                          {/* Confidence indicator */}
                          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[var(--text-muted)]">Confidence</span>
                              <ConfidenceBadge sources={message.sources} />
                            </div>
                          </div>

                          {/* Tools Used Indicator */}
                          {message.toolsUsed && message.toolsUsed.length > 0 && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Tools used:</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {message.toolsUsed.map((tool, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-full bg-[var(--bg-slate)] text-[var(--text-secondary)]"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sources Footer with numbered list */}
                          {message.sources && message.sources.length > 0 && (
                            <SourcesFooter sources={message.sources as ChatSource[]} />
                          )}
                        </>
                      )}

                      {/* Actions */}
                      {message.role === "assistant" && (
                        <div className="mt-3 flex items-center gap-2">
                          <motion.button
                            onClick={() => navigator.clipboard.writeText(message.content)}
                            className="p-1.5 rounded hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                            title="Copy response"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Copy className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleRegenerate(message.id)}
                            disabled={isTyping}
                            className="p-1.5 rounded hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--accent-ember)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Regenerate response"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <RefreshCw className={`w-4 h-4 ${isTyping ? "animate-spin" : ""}`} />
                          </motion.button>
                          <motion.button
                            onClick={() => handleBranchFromMessage(message.id)}
                            disabled={isTyping}
                            className="p-1.5 rounded hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--accent-gold)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Branch from here"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <GitBranch className="w-4 h-4" />
                          </motion.button>
                          <div className="flex items-center gap-1 ml-2">
                            <motion.button
                              className="p-1.5 rounded hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--success)] transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              className="p-1.5 rounded hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-[var(--text-muted)]">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-slate)] flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-[var(--text-secondary)]" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[var(--accent-ember)]/20">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-[var(--accent-ember)] rounded-full animate-bounce" />
                        <span
                          className="w-2 h-2 bg-[var(--accent-ember)] rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <span
                          className="w-2 h-2 bg-[var(--accent-ember)] rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                      <span className="text-sm text-[var(--text-muted)]">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <FadeIn delay={0.2}>
            <div className="border-t border-[var(--border-subtle)] px-6 py-4">
              <div className="max-w-4xl mx-auto">
                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-2xl p-3 focus-within:border-[var(--accent-ember)]/50 focus-within:shadow-lg focus-within:shadow-[var(--accent-ember)]/5 transition-all">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <MentionInput
                        value={input}
                        onChange={setInput}
                        onSend={handleSend}
                        placeholder="Ask anything about your organization... Use @ to mention people or docs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => setShowFileUpload(true)}
                        className="p-2 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Paperclip className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={toggleVoiceInput}
                        disabled={!voiceSupported}
                        className={`p-2 rounded-lg transition-colors ${
                          isListening
                            ? "bg-[var(--error)]/20 text-[var(--error)] hover:bg-[var(--error)]/30"
                            : "hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                        } ${!voiceSupported ? "opacity-50 cursor-not-allowed" : ""}`}
                        title={voiceSupported ? (isListening ? "Stop listening" : "Start voice input") : "Voice input not supported"}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Mic className={`w-5 h-5 ${isListening ? "animate-pulse" : ""}`} />
                      </motion.button>
                      <motion.button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] disabled:opacity-50 disabled:hover:bg-[var(--accent-ember)] text-white transition-colors shadow-lg shadow-[var(--accent-ember)]/20"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Send className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[var(--accent-gold)]" />
                      Grounded in your knowledge base
                    </span>
                    <span>Press Enter to send, Shift+Enter for new line</span>
                  </div>
                  <span className="text-[var(--accent-ember)]">{selectedLLM.name}</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Right Panel - Chat History & Spaces */}
        <FadeIn delay={0.1} className="w-72 border-l border-[var(--border-subtle)] bg-[var(--bg-charcoal)] p-4 hidden lg:flex flex-col">
          {/* Spaces Section */}
          <ChatSpaces
            spaces={spaces}
            activeSpaceId={activeSpaceId ?? undefined}
            onSelectSpace={(spaceId) => {
              setActiveSpaceId(spaceId);
              if (spaceId) {
                setSearchScope("space");
              }
            }}
            onCreateSpace={() => {
              // In production, this would open a create space modal
              console.log("Create space");
            }}
          />

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--text-primary)]">Chat History</h3>
            <motion.button
              onClick={handleNewChat}
              className="p-1.5 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-white transition-colors shadow-md shadow-[var(--accent-ember)]/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>

          {threadsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-10 bg-[var(--bg-slate)] rounded-lg" />
                </div>
              ))}
            </div>
          ) : threads.length > 0 ? (
            <div className="space-y-2 flex-1 overflow-y-auto">
              {threads.map((thread: ExtendedChatThread, index: number) => {
                const threadIsBranch = isBranch(thread);
                const parentId = getParentThreadId(thread);
                const parentThread = parentId ? threads.find(t => t.id === parentId) : null;

                return (
                  <motion.button
                    key={thread.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors group ${
                      activeThreadId === thread.id
                        ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                        : "hover:bg-[var(--bg-slate)] text-[var(--text-muted)]"
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {threadIsBranch && (
                          <GitBranch className="w-3.5 h-3.5 text-[var(--accent-gold)] flex-shrink-0" />
                        )}
                        <div className="text-sm truncate">
                          {thread.title || "New conversation"}
                        </div>
                      </div>
                      <Trash2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 hover:opacity-100 hover:text-[var(--error)] transition-all flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(thread.updated_at).toLocaleDateString()}
                      </span>
                      {threadIsBranch && parentThread && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] truncate max-w-[100px]">
                          Branch of: {parentThread.title?.slice(0, 15) || "Chat"}...
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-[var(--text-muted)] text-center">
                No chat history yet.<br />Start a new conversation!
              </p>
            </div>
          )}
        </FadeIn>
      </main>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onUpload={(files) => {
          console.log("Uploaded files:", files);
          setShowFileUpload(false);
        }}
      />
    </div>
  );
}

