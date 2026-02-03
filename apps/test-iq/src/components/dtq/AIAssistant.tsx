'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Target,
  BarChart3,
  Settings,
  TrendingUp,
  Send,
  Bot,
  User,
} from 'lucide-react';
import { ChatMessage } from '@/lib/dtq/types';
import { aiResponses } from '@/lib/dtq/data';
import { TypingIndicator } from '@/lib/motion';

const quickActions = [
  { id: 'high-risk', icon: Target, label: 'High-risk features', sublabel: 'Show features needing attention' },
  { id: 'feature-status', icon: BarChart3, label: 'Feature status', sublabel: 'Check specific feature metrics' },
  { id: 'automation-gaps', icon: Settings, label: 'Automation gaps', sublabel: 'Find coverage opportunities' },
  { id: 'quality-summary', icon: TrendingUp, label: 'Quality summary', sublabel: 'Get executive overview' },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  const generateId = (prefix: string) => {
    messageIdRef.current += 1;
    return `${prefix}-${messageIdRef.current}`;
  };

  // Smooth auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleQuickAction = async (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    if (!action) return;

    const userMessage: ChatMessage = {
      id: generateId('user'),
      role: 'user',
      content: action.label,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const response = aiResponses[actionId] || "I don't have information about that yet.";
    const assistantMessage: ChatMessage = {
      id: generateId('assistant'),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId('user'),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate response
    await new Promise(resolve => setTimeout(resolve, 1000));

    const assistantMessage: ChatMessage = {
      id: generateId('assistant'),
      role: 'assistant',
      content: `I understand you're asking about "${input}". Based on current metrics, here are my insights:\n\n- Overall test coverage is healthy at 93.3%\n- No critical issues detected in related areas\n- Recommend reviewing the feature coverage section for detailed data\n\nWould you like me to dive deeper into any specific aspect?`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="glass-card rounded-xl overflow-hidden flex flex-col h-[500px]"
    >
      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent-primary)' }}
            animate={{
              boxShadow: [
                '0 0 10px rgba(255, 51, 102, 0.3)',
                '0 0 20px rgba(255, 51, 102, 0.5)',
                '0 0 10px rgba(255, 51, 102, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              AI Insights Assistant
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Powered by intelligent analysis
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--bg-elevated)' }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bot className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
            </motion.div>
            <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Ask me about your testing metrics
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              I have access to all 46 features with real-time data
            </p>

            {/* Quick Actions with hover effects */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {quickActions.map((action, idx) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleQuickAction(action.id)}
                  className="text-left p-3 rounded-lg transition-all hover:scale-[1.02] group"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  whileHover={{
                    boxShadow: '0 0 20px rgba(255, 51, 102, 0.15)',
                    borderColor: 'var(--border-accent)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <action.icon
                      className="w-4 h-4 transition-colors"
                      style={{ color: 'var(--accent-primary)' }}
                    />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {action.label}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {action.sublabel}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <motion.div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'var(--accent-primary)' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <Bot className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                  <motion.div
                    className={`max-w-[80%] rounded-xl p-4 ${
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
                      className="text-sm whitespace-pre-wrap prose prose-invert prose-sm max-w-none"
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
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'var(--bg-elevated)' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pink themed typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-3"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--accent-primary)' }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div
                  className="px-4 py-3 rounded-xl rounded-bl-sm"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input with pulse effect when ready */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Ask about specific features, metrics, or trends..."
            className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none transition-all input-glow"
            style={{
              background: 'var(--bg-tertiary)',
              border: `1px solid ${isInputFocused ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              color: 'var(--text-primary)',
            }}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
            style={{
              background: input.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            }}
            whileHover={input.trim() ? { scale: 1.05 } : {}}
            whileTap={input.trim() ? { scale: 0.95 } : {}}
            animate={
              input.trim()
                ? {
                    boxShadow: [
                      '0 0 10px rgba(255, 51, 102, 0.3)',
                      '0 0 20px rgba(255, 51, 102, 0.5)',
                      '0 0 10px rgba(255, 51, 102, 0.3)',
                    ],
                  }
                : { boxShadow: 'none' }
            }
            transition={
              input.trim()
                ? { boxShadow: { duration: 1.5, repeat: Infinity } }
                : {}
            }
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
