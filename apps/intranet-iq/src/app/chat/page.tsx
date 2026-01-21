"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { TransparencyPane } from "@/components/chat/TransparencyPane";
import { ChatSpaces, type ChatSpace } from "@/components/chat/ChatSpaces";
import { FileUploadModal } from "@/components/chat/FileUploadModal";
import { SearchScopeToggle, type SearchScope } from "@/components/chat/SearchScopeToggle";
import { MentionInput } from "@/components/chat/MentionInput";
import { FadeIn, ScaleOnHover } from "@/lib/motion";
import {
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ExternalLink,
  ChevronDown,
  Mic,
  Paperclip,
  Settings2,
  Clock,
  FileText,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { useChatThreads, useChatMessages } from "@/lib/hooks/useSupabase";
import type { ChatThread, ChatMessage } from "@/lib/database.types";

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
  const { threads, loading: threadsLoading, createThread, setThreads } = useChatThreads();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const { messages, loading: messagesLoading, addMessage, setMessages } = useChatMessages(activeThreadId);

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
      const response = await fetch("/diq/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userQuery,
          threadId,
          model: selectedLLM.id === "claude-3" ? "claude-sonnet-4-20250514" : selectedLLM.id,
          responseStyle: responseStyle.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      // Add AI response to messages
      await addMessage(
        "assistant",
        data.message,
        {
          sources: data.sources || [],
          confidence: data.confidence || 85,
          llmModel: selectedLLM.id,
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
                {messages.map((message: ChatMessage, index: number) => (
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
                      <div className="text-[var(--text-primary)]/90 whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>

                      {/* Sources & Confidence */}
                      {message.role === "assistant" && message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[var(--text-muted)]">Sources</span>
                            {message.confidence && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--success)]/20 text-[var(--success)]">
                                {message.confidence}% confidence
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.sources.map((source: any, idx: number) => (
                              <a
                                key={idx}
                                href={source.url || "#"}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-slate)] hover:bg-[var(--bg-slate)]/80 text-xs text-[var(--accent-ember)] transition-colors"
                              >
                                <FileText className="w-3 h-3" />
                                {source.title}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        </div>
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
              {threads.map((thread: ChatThread, index: number) => (
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
                  <div className="flex items-center justify-between">
                    <div className="text-sm truncate flex-1">
                      {thread.title || "New conversation"}
                    </div>
                    <Trash2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 hover:opacity-100 hover:text-[var(--error)] transition-all" />
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">
                    {new Date(thread.updated_at).toLocaleDateString()}
                  </div>
                </motion.button>
              ))}
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

