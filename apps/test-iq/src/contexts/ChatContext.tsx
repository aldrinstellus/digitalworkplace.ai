'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { ChatMessage } from '@/lib/dtq/types';

interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  unreadCount: number;
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  incrementUnread: () => void;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  isOpen: false,
  unreadCount: 0,
  addMessage: () => {},
  clearMessages: () => {},
  toggleOpen: () => {},
  setOpen: () => {},
  incrementUnread: () => {},
});

export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  }, []);

  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) setUnreadCount(0);
  }, []);

  const incrementUnread = useCallback(() => {
    setUnreadCount(prev => prev + 1);
  }, []);

  const value = useMemo(() => ({
    messages,
    isOpen,
    unreadCount,
    addMessage,
    clearMessages,
    toggleOpen,
    setOpen,
    incrementUnread,
  }), [messages, isOpen, unreadCount, addMessage, clearMessages, toggleOpen, setOpen, incrementUnread]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
