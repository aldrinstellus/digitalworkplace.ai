"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
  Send,
  Bot,
  User,
  MessageCircle,
  X,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Globe,
  Phone,
  AlertTriangle,
  Trash2,
  Zap,
  FileText,
  Search,
  MapPin,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { type Language, getLabels } from "@/lib/i18n";
import { apiUrl } from "@/lib/utils";

interface Source {
  title: string;
  url: string;
  section: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
  sentiment?: string;
  escalate?: boolean;
  feedback?: "positive" | "negative" | null;
}

export default function ChatPage() {
  const [language, setLanguage] = useState<Language>("en");
  const labels = getLabels(language);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize with empty messages to avoid hydration mismatch
  const [messages, setMessages] = useState<Message[]>([]);

  // Set initial welcome message after hydration
  useEffect(() => {
    setIsHydrated(true);  
    setMessages([  
      {
        id: "welcome",
        role: "assistant",
        content: getLabels(language).welcome,
        timestamp: new Date(),
      },
    ]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages[0]?.id === "welcome") {
        newMessages[0] = {
          ...newMessages[0],
          content: getLabels(language).welcome,
        };
      }
      return newMessages;
    });
  }, [language]);

  // Hide suggestions after user sends first message
  useEffect(() => {
    if (messages.length > 1) {
      setShowSuggestions(false);
    }
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          language,
        }),
      });

      const data = await response.json();

      // Update language if response detected a different one
      if (data.language && data.language !== language) {
        setLanguage(data.language);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.message ||
          (language === "es"
            ? "Lo siento, hubo un problema. Por favor intente de nuevo."
            : "I apologize, but I encountered an issue. Please try again."),
        timestamp: new Date(),
        sources: data.sources,
        sentiment: data.sentiment,
        escalate: data.escalate,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          language === "es"
            ? "Lo siento, tengo problemas para conectarme. Por favor intente de nuevo."
            : "I apologize, but I'm having trouble connecting. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, feedback } : m
      )
    );
    // TODO: Send feedback to analytics API
    console.log("Feedback:", { messageId, feedback });
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "es" : "en"));
  };

  const clearConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: labels.welcome,
        timestamp: new Date(),
      },
    ]);
    setShowSuggestions(true);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    setQuickActionsOpen(false);
    inputRef.current?.focus();
  };

  const quickActions = [
    { icon: FileText, label: language === "es" ? "Reportar" : "Report Issue", action: language === "es" ? "Quiero reportar un problema" : "I want to report an issue" },
    { icon: Search, label: language === "es" ? "Buscar" : "Find Service", action: language === "es" ? "Buscar un servicio" : "Find a city service" },
    { icon: MapPin, label: language === "es" ? "Direcciones" : "Directions", action: language === "es" ? "¿Cómo llego al ayuntamiento?" : "How do I get to City Hall?" },
  ];

  // Shorter suggestions for compact chips
  const shortSuggestions = language === "es"
    ? ["Horario ayuntamiento?", "Permiso construcción?", "Próximos eventos?", "Ubicación parques?"]
    : ["City Hall hours?", "Building permit?", "Upcoming events?", "Park locations?"];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-[#1e3a5f] hover:bg-[#2a4a73] shadow-lg"
          aria-label={language === "es" ? "Abrir chat" : "Open chat"}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2a4a73] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[700px] flex flex-col shadow-2xl overflow-hidden rounded-2xl">
        {/* Compact Header - 56px */}
        <div className="bg-[#1e3a5f] text-white px-4 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
              <Bot className="h-5 w-5 text-[#1e3a5f]" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-semibold text-[15px] leading-tight">{labels.title}</h1>
              <p className="text-[11px] text-blue-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                {labels.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="h-8 w-8 p-0 text-white hover:bg-white/10"
              aria-label={`${labels.language}: ${language === "en" ? labels.spanish : labels.english}`}
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
            </Button>
            {/* Clear Chat */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="h-8 w-8 p-0 text-white hover:bg-white/10"
              aria-label={language === "es" ? "Limpiar chat" : "Clear chat"}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
            {/* Close */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-white hover:bg-white/10"
              aria-label={language === "es" ? "Cerrar chat" : "Close chat"}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area - Maximized */}
        <div ref={scrollRef} className="flex-1 min-h-0 bg-gray-50/50 overflow-y-auto" aria-live="polite">
          <div className="px-4 py-3 space-y-3" role="log" aria-label={language === "es" ? "Historial del chat" : "Chat history"}>
            {messages.map((message) => (
              <div key={message.id} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div
                  className={`flex gap-2.5 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar
                    className={`h-7 w-7 flex-shrink-0 ${
                      message.role === "assistant"
                        ? "bg-[#1e3a5f]"
                        : "bg-gray-200"
                    } flex items-center justify-center`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4 text-white" aria-hidden="true" />
                    ) : (
                      <User className="h-4 w-4 text-gray-600" aria-hidden="true" />
                    )}
                  </Avatar>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                      message.role === "user"
                        ? "bg-[#1e3a5f] text-white rounded-tr-md"
                        : "bg-white text-gray-800 rounded-tl-md shadow-sm border border-gray-100"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    {isHydrated && (
                      <p
                        className={`text-[10px] mt-1 ${
                          message.role === "user" ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString('en-US', {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sources - Compact */}
                {message.sources && message.sources.length > 0 && (
                  <div className="ml-10 mt-1.5">
                    <div className="flex flex-wrap gap-1">
                      {message.sources.slice(0, 3).map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full hover:bg-[#1e3a5f] hover:text-white focus:bg-[#1e3a5f] focus:text-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 transition-colors"
                        >
                          <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                          {source.title.length > 25
                            ? source.title.substring(0, 25) + "..."
                            : source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Escalation Alert - Compact */}
                {message.escalate && (
                  <div className="ml-10 mt-1.5 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="text-xs font-medium">{labels.escalateMessage}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1.5 h-7 text-xs text-amber-700 border-amber-300 hover:bg-amber-100"
                      onClick={() => window.location.href = "tel:+13055936725"}
                    >
                      <Phone className="h-3 w-3 mr-1" aria-hidden="true" />
                      {labels.escalate}
                    </Button>
                  </div>
                )}

                {/* Feedback Buttons - Inline */}
                {message.role === "assistant" && message.id !== "welcome" && (
                  <div className="ml-10 mt-1 flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">{labels.feedback}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-5 w-5 p-0 ${
                        message.feedback === "positive"
                          ? "text-green-600"
                          : "text-gray-500 hover:text-green-600"
                      }`}
                      onClick={() => handleFeedback(message.id, "positive")}
                      aria-label={labels.yes}
                      aria-pressed={message.feedback === "positive"}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-5 w-5 p-0 ${
                        message.feedback === "negative"
                          ? "text-red-600"
                          : "text-gray-500 hover:text-red-600"
                      }`}
                      onClick={() => handleFeedback(message.id, "negative")}
                      aria-label={labels.no}
                      aria-pressed={message.feedback === "negative"}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5 animate-in fade-in duration-200">
                <Avatar className="h-7 w-7 bg-[#1e3a5f] flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" aria-hidden="true" />
                </Avatar>
                <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#1e3a5f] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-[#1e3a5f] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-[#1e3a5f] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Suggestions - Above Input */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out bg-gradient-to-t from-white to-gray-50/80 ${
            showSuggestions ? "max-h-12 py-2 opacity-100" : "max-h-0 py-0 opacity-0"
          }`}
        >
          <div className="px-4">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
              {shortSuggestions.map((question) => (
                <button
                  key={question}
                  onClick={() => {
                    setInput(question);
                    inputRef.current?.focus();
                  }}
                  className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition-colors whitespace-nowrap"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible Quick Actions */}
        <div
          className={`overflow-hidden transition-all duration-250 ease-out bg-white border-t border-gray-100 ${
            quickActionsOpen ? "max-h-14 py-2" : "max-h-0 py-0"
          }`}
        >
          <div className="px-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:border-[#1e3a5f] hover:bg-blue-50 hover:text-[#1e3a5f] transition-colors"
                >
                  <action.icon className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Area - Compact */}
        <form onSubmit={handleSubmit} className="px-4 py-2.5 border-t border-gray-100 bg-white relative">
          {/* Quick Actions Toggle */}
          <button
            type="button"
            onClick={() => setQuickActionsOpen(!quickActionsOpen)}
            className={`absolute -top-7 left-4 flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border bg-white shadow-sm transition-all ${
              quickActionsOpen
                ? "border-[#1e3a5f] text-[#1e3a5f]"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <Zap className="h-3 w-3" />
            <span>{language === "es" ? "Acciones" : "Actions"}</span>
            <ChevronUp className={`h-3 w-3 transition-transform ${quickActionsOpen ? "" : "rotate-180"}`} />
          </button>

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={labels.placeholder}
              className="flex-1 h-10 text-sm rounded-xl border-gray-200 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]/20"
              disabled={isLoading}
              aria-label={labels.placeholder}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-10 w-10 p-0 rounded-xl bg-[#1e3a5f] hover:bg-[#2a4a73]"
              aria-label={labels.send}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">
            {labels.disclaimer}
          </p>
        </form>

        {/* Admin Link - Floating */}
        <Link
          href="/admin"
          className="absolute bottom-20 right-4 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          {labels.admin}
        </Link>
      </Card>
    </main>
  );
}
