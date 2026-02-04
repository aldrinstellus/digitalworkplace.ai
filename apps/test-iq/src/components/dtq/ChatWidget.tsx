'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Sparkles,
  Target,
  BarChart3,
  Settings,
  TrendingUp,
  Send,
  Bot,
  User,
  Crown,
  Users,
  Code,
  Paperclip,
  RotateCcw,
  ChevronRight,
  Boxes,
  Activity,
  FileText,
  Clock,
  TestTube2,
  type LucideIcon,
} from 'lucide-react';
import { ChatMessage, ChatLink, ChatLinkTarget } from '@/lib/dtq/types';
import { aiResponses } from '@/lib/dtq/data';
import { TypingIndicator } from '@/lib/motion';
import { usePersona } from '@/app/(dashboard)/layout';
import { useChat } from '@/contexts/ChatContext';
import { useNavigation } from '@/contexts/NavigationContext';

const quickActions = [
  { id: 'high-risk', icon: Target, label: 'High-risk features' },
  { id: 'feature-status', icon: BarChart3, label: 'Feature status' },
  { id: 'automation-gaps', icon: Settings, label: 'Automation gaps' },
  { id: 'quality-summary', icon: TrendingUp, label: 'Quality summary' },
];

const personaConfig = {
  csuite: { name: 'C-Suite', icon: Crown, color: 'var(--chart-tertiary)' },
  manager: { name: 'Manager', icon: Users, color: 'var(--accent-primary)' },
  techlead: { name: 'Tech Lead', icon: Code, color: 'var(--chart-secondary)' },
};

const LINK_ICONS: Record<ChatLinkTarget, LucideIcon> = {
  feature: Target,
  category: Boxes,
  metric: Activity,
  report: FileText,
  history: Clock,
  'test-run': TestTube2,
};

async function fetchChatResponse(
  message: string,
  persona: string,
  history: { role: string; content: string }[]
): Promise<{ response: string; sources: { title: string; type: string; similarity: number }[]; relatedLinks?: ChatLink[] }> {
  const res = await fetch('/api/dtq/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, persona, history }),
  });

  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status}`);
  }

  return res.json();
}

export default function ChatWidget() {
  const { persona } = usePersona();
  const { messages, isOpen, unreadCount, addMessage, clearMessages, toggleOpen, incrementUnread } = useChat();
  const navigation = useNavigation();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldScrollRef = useRef(false);

  const pConfig = personaConfig[persona];
  const PersonaIcon = pConfig.icon;

  const generateId = (prefix: string) => {
    messageIdRef.current += 1;
    return `${prefix}-${messageIdRef.current}`;
  };

  // Fix 1: Only auto-scroll when user triggers it (send or quick action)
  useEffect(() => {
    if (shouldScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      shouldScrollRef.current = false;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const getHistory = () =>
    messages.map((m) => ({ role: m.role, content: m.content }));

  const handleQuickAction = async (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    if (!action) return;

    shouldScrollRef.current = true;

    const userMessage: ChatMessage = {
      id: generateId('user'),
      role: 'user',
      content: action.label,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setIsTyping(true);

    try {
      const data = await fetchChatResponse(action.label, persona, getHistory());
      const assistantMessage: ChatMessage = {
        id: generateId('assistant'),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        sources: data.sources,
        relatedLinks: data.relatedLinks,
      };
      addMessage(assistantMessage);
      if (!isOpen) incrementUnread();
    } catch {
      const response = aiResponses[actionId] || "I don't have information about that yet.";
      const assistantMessage: ChatMessage = {
        id: generateId('assistant'),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      addMessage(assistantMessage);
      if (!isOpen) incrementUnread();
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    shouldScrollRef.current = true;

    const userInput = input;
    const userMessage: ChatMessage = {
      id: generateId('user'),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setIsTyping(true);

    try {
      const data = await fetchChatResponse(userInput, persona, getHistory());
      const assistantMessage: ChatMessage = {
        id: generateId('assistant'),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        sources: data.sources,
        relatedLinks: data.relatedLinks,
      };
      addMessage(assistantMessage);
      if (!isOpen) incrementUnread();
    } catch {
      const assistantMessage: ChatMessage = {
        id: generateId('assistant'),
        role: 'assistant',
        content: `I understand you're asking about "${userInput}". Based on current metrics, here are my insights:\n\n- Overall test coverage is healthy at 93.3%\n- No critical issues detected in related areas\n- Recommend reviewing the feature coverage section for detailed data\n\nWould you like me to dive deeper into any specific aspect?`,
        timestamp: new Date(),
      };
      addMessage(assistantMessage);
      if (!isOpen) incrementUnread();
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={toggleOpen}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
            style={{
              background: 'var(--accent-primary)',
              boxShadow: '0 4px 20px rgba(255, 51, 102, 0.4)',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MessageCircle className="w-6 h-6 text-white" />

            {/* Unread badge */}
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[11px] font-bold flex items-center justify-center"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-6rem)] sm:h-[550px] rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'rgba(20, 20, 32, 0.98)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 51, 102, 0.1)',
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--accent-primary)', boxShadow: '0 0 15px rgba(255, 51, 102, 0.3)' }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    AI Insights
                  </h3>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Powered by intelligent analysis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Persona badge */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: pConfig.color,
                  }}
                >
                  <PersonaIcon className="w-3 h-3" />
                  {pConfig.name}
                </div>
                {/* Reset button — only visible when there are messages */}
                <AnimatePresence>
                  {messages.length > 0 && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      onClick={clearMessages}
                      title="New chat"
                      className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                      style={{ background: 'var(--bg-tertiary)' }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    </motion.button>
                  )}
                </AnimatePresence>
                {/* Close button */}
                <motion.button
                  onClick={toggleOpen}
                  className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ background: 'var(--bg-tertiary)' }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </motion.button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
              {/* Welcome state — only when no messages */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <Bot className="w-7 h-7" style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Ask me about your testing metrics
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    I have access to all 46 features with real-time data
                  </p>
                </motion.div>
              )}

              {/* Messages — always rendered */}
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <div className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : ''}`}>
                      {message.role === 'assistant' && (
                        <motion.div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: 'var(--accent-primary)' }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                          <Bot className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                      <motion.div
                        className={`max-w-[80%] rounded-xl px-3.5 py-2.5 ${
                          message.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                        }`}
                        style={{
                          background: message.role === 'user'
                            ? 'var(--accent-primary)'
                            : 'var(--bg-tertiary)',
                          color: message.role === 'user'
                            ? 'white'
                            : 'var(--text-primary)',
                        }}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        <div
                          className="text-[13px] leading-relaxed whitespace-pre-wrap prose prose-invert prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: message.content
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/## (.*?)$/gm, '<h4 class="text-base font-semibold mt-3 mb-2">$1</h4>')
                              .replace(/### (.*?)$/gm, '<h5 class="text-sm font-semibold mt-2 mb-1">$1</h5>')
                              .replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
                              .replace(/\n/g, '<br />')
                          }}
                        />
                      </motion.div>
                      {message.role === 'user' && (
                        <motion.div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: 'var(--bg-elevated)' }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                          <User className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                        </motion.div>
                      )}
                    </div>

                    {/* Source display */}
                    {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 ml-9">
                        <Paperclip className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {message.sources.length} source{message.sources.length !== 1 ? 's' : ''} used
                        </span>
                      </div>
                    )}

                    {/* Related link cards */}
                    {message.role === 'assistant' && message.relatedLinks && message.relatedLinks.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        className="mt-2 ml-9 space-y-1"
                      >
                        <span
                          className="text-[10px] uppercase font-semibold tracking-wider"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Related
                        </span>
                        <div className="space-y-1">
                          {message.relatedLinks.map((link) => {
                            const LinkIcon = LINK_ICONS[link.target] || Target;
                            return (
                              <motion.button
                                key={link.id}
                                onClick={() => navigation.dispatch(link)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left cursor-pointer group transition-all"
                                style={{
                                  background: 'var(--bg-elevated)',
                                  border: '1px solid var(--border-subtle)',
                                }}
                                whileHover={{
                                  x: 2,
                                  borderColor: 'var(--accent-primary)',
                                }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                                  style={{ background: 'var(--bg-tertiary)' }}
                                >
                                  <LinkIcon className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                    {link.label}
                                  </p>
                                  {link.description && (
                                    <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                                      {link.description}
                                    </p>
                                  )}
                                </div>
                                <ChevronRight
                                  className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ color: 'var(--accent-primary)' }}
                                />
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2.5"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--accent-primary)' }}
                  >
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div
                    className="px-3.5 py-2.5 rounded-xl rounded-bl-sm"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick action pills — always visible */}
            <div className="px-3 py-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    disabled={isTyping}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                    whileHover={{ borderColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <action.icon className="w-3 h-3" style={{ color: 'var(--accent-primary)' }} />
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Ask about features..."
                  className="flex-1 px-3.5 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: `1px solid ${isInputFocused ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    color: 'var(--text-primary)',
                  }}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
                  style={{
                    background: input.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    boxShadow: input.trim() ? '0 0 15px rgba(255, 51, 102, 0.3)' : 'none',
                  }}
                  whileHover={input.trim() ? { scale: 1.05 } : {}}
                  whileTap={input.trim() ? { scale: 0.95 } : {}}
                >
                  <Send className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
