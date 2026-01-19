"use client";

import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
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
  LinkIcon,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: { title: string; url: string }[];
  confidence?: number;
}

const sampleMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "What is our company's vacation policy?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    role: "assistant",
    content: `Based on the HR Knowledge Base, here's a summary of our vacation policy:

**Annual Leave Entitlement:**
- Full-time employees: 20 days per year
- Part-time employees: Pro-rated based on hours
- Additional days after 5 years of service

**Key Points:**
1. Leave requests should be submitted at least 2 weeks in advance
2. Maximum consecutive days: 15 working days
3. Unused days can carry over (max 5 days) to the next year

**Holiday Scheduling:**
- Peak periods (Dec-Jan) require 4 weeks notice
- Team coverage must be maintained

Would you like more details on any specific aspect?`,
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    sources: [
      { title: "HR Policy Handbook 2025", url: "/content/hr-policies" },
      { title: "Employee Benefits Guide", url: "/content/benefits" },
    ],
    confidence: 94,
  },
];

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState(llmOptions[1]);
  const [responseStyle, setResponseStyle] = useState(responseStyles[1]);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I understand your question. Let me search through the knowledge base and provide you with a comprehensive answer...\n\nThis is a demo response. In production, this would connect to your selected LLM and be grounded in your organization's indexed data, knowledge bases, and employee experience content.",
        timestamp: new Date(),
        sources: [
          { title: "Internal Documentation", url: "/content/docs" },
        ],
        confidence: 87,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />

      <main className="ml-16 h-screen flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-medium text-white">AI Assistant</h1>
                <p className="text-sm text-white/50">
                  Powered by {selectedLLM.name} ({selectedLLM.provider})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* LLM Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white/70 transition-colors"
                >
                  <Settings2 className="w-4 h-4" />
                  Settings
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showSettings && (
                  <div className="absolute right-0 top-12 w-72 bg-[#0f0f14] border border-white/10 rounded-xl shadow-xl z-50 p-4">
                    <div className="mb-4">
                      <label className="text-xs text-white/50 uppercase tracking-wider">
                        Model
                      </label>
                      <div className="mt-2 space-y-1">
                        {llmOptions.map((llm) => (
                          <button
                            key={llm.id}
                            onClick={() => setSelectedLLM(llm)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedLLM.id === llm.id
                                ? "bg-blue-500/20 text-blue-400"
                                : "text-white/70 hover:bg-white/5"
                            }`}
                          >
                            <span>{llm.name}</span>
                            <span className="text-xs text-white/40">
                              {llm.provider}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider">
                        Response Style
                      </label>
                      <div className="mt-2 space-y-1">
                        {responseStyles.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setResponseStyle(style)}
                            className={`w-full flex flex-col items-start px-3 py-2 rounded-lg text-sm transition-colors ${
                              responseStyle.id === style.id
                                ? "bg-blue-500/20 text-blue-400"
                                : "text-white/70 hover:bg-white/5"
                            }`}
                          >
                            <span>{style.name}</span>
                            <span className="text-xs text-white/40">
                              {style.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button className="p-2 rounded-lg hover:bg-white/5 text-white/60 transition-colors">
                <Clock className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-2xl ${
                    message.role === "user"
                      ? "bg-blue-500/20 border border-blue-500/30"
                      : "bg-[#0f0f14] border border-white/10"
                  } rounded-2xl px-4 py-3`}
                >
                  <div className="text-white/90 whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>

                  {/* Sources & Confidence */}
                  {message.role === "assistant" && message.sources && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/40">Sources</span>
                        {message.confidence && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                            {message.confidence}% confidence
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-xs text-blue-400 transition-colors"
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
                      <button className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-1 ml-2">
                        <button className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-green-400 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-white/30">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white/70" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#0f0f14] border border-white/10 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                      <span
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <span
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span className="text-sm text-white/50">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#0f0f14] border border-white/10 rounded-2xl p-3 focus-within:border-blue-500/50 transition-colors">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Ask anything about your organization..."
                      className="w-full bg-transparent text-white placeholder-white/40 outline-none resize-none text-sm leading-relaxed min-h-[24px] max-h-[120px]"
                      rows={1}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors">
                      <Mic className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 text-white transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-white/30">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Grounded in your knowledge base
                  </span>
                  <span>Press Enter to send, Shift+Enter for new line</span>
                </div>
                <span>{selectedLLM.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - History (collapsible) */}
        <div className="w-72 border-l border-white/10 bg-[#0f0f14] p-4 hidden lg:block">
          <h3 className="text-sm font-medium text-white mb-4">Recent Chats</h3>
          <div className="space-y-2">
            {[
              { title: "Vacation policy question", time: "Just now" },
              { title: "Q4 sales targets", time: "2 hours ago" },
              { title: "Engineering roadmap", time: "Yesterday" },
              { title: "Expense reimbursement", time: "2 days ago" },
            ].map((chat, idx) => (
              <button
                key={idx}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  idx === 0
                    ? "bg-blue-500/20 text-blue-400"
                    : "hover:bg-white/5 text-white/60"
                }`}
              >
                <div className="text-sm truncate">{chat.title}</div>
                <div className="text-xs text-white/40 mt-0.5">{chat.time}</div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
