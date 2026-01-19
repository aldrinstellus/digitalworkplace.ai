/**
 * dIQ Supabase Hooks
 * React hooks for data fetching with Supabase
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  supabase,
  getArticles,
  getKBCategories,
  getEmployees,
  getDepartments,
  getChatThreads,
  getChatMessages,
  createChatThread,
  addChatMessage,
  getWorkflows,
  getNewsPosts,
  getUpcomingEvents,
  getUserSettings,
  updateUserSettings,
  searchKnowledge,
  logActivity,
} from "../supabase";
import type {
  Article,
  KBCategory,
  Employee,
  Department,
  ChatThread,
  ChatMessage,
  Workflow,
  NewsPost,
  Event,
  UserSettings,
  SearchResult,
  User,
} from "../database.types";

// =============================================================================
// USER HOOK
// =============================================================================

export function useCurrentUser() {
  const { user: clerkUser, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      if (!isLoaded) return;
      if (!clerkUser) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("clerk_id", clerkUser.id)
        .single();

      if (!error && data) {
        setDbUser(data);
      }
      setLoading(false);
    }

    fetchUser();
  }, [clerkUser, isLoaded]);

  return { user: dbUser, clerkUser, loading, isLoaded };
}

// =============================================================================
// DEPARTMENTS HOOK
// =============================================================================

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      const { data, error } = await getDepartments();
      if (error) {
        setError(error.message);
      } else {
        setDepartments(data || []);
      }
      setLoading(false);
    }
    fetch();
  }, []);

  return { departments, loading, error };
}

// =============================================================================
// EMPLOYEES HOOK
// =============================================================================

export function useEmployees(options?: {
  departmentId?: string;
  search?: string;
  limit?: number;
}) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data, error } = await getEmployees(options);
      if (error) {
        setError(error.message);
      } else {
        setEmployees(data || []);
      }
      setLoading(false);
    }
    fetch();
  }, [options?.departmentId, options?.search, options?.limit]);

  return { employees, loading, error };
}

// =============================================================================
// ARTICLES HOOK
// =============================================================================

export function useArticles(options?: {
  categoryId?: string;
  status?: "draft" | "pending_review" | "published" | "archived";
  limit?: number;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data, error } = await getArticles(options);
      if (error) {
        setError(error.message);
      } else {
        setArticles(data || []);
      }
      setLoading(false);
    }
    fetch();
  }, [options?.categoryId, options?.status, options?.limit]);

  return { articles, loading, error, setArticles };
}

// =============================================================================
// KB CATEGORIES HOOK
// =============================================================================

export function useKBCategories(departmentId?: string) {
  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      const { data, error } = await getKBCategories(departmentId);
      if (error) {
        setError(error.message);
      } else {
        setCategories(data || []);
      }
      setLoading(false);
    }
    fetch();
  }, [departmentId]);

  return { categories, loading, error };
}

// =============================================================================
// CHAT HOOKS
// =============================================================================

export function useChatThreads() {
  const { user } = useCurrentUser();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await getChatThreads(user.id);
      if (error) {
        setError(error.message);
      } else {
        setThreads(data || []);
      }
      setLoading(false);
    }
    fetch();
  }, [user]);

  const createThread = useCallback(
    async (title?: string, llmModel = "claude-3") => {
      if (!user) return null;
      const { data, error } = await createChatThread(user.id, title, llmModel);
      if (error) {
        setError(error.message);
        return null;
      }
      if (data) {
        setThreads((prev) => [data, ...prev]);
      }
      return data;
    },
    [user]
  );

  return { threads, loading, error, createThread, setThreads };
}

export function useChatMessages(threadId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      if (!threadId) {
        setMessages([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await getChatMessages(threadId);
      if (error) {
        setError(error.message);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    }
    fetch();
  }, [threadId]);

  const addMessage = useCallback(
    async (
      role: "user" | "assistant" | "system",
      content: string,
      options?: {
        sources?: object[];
        confidence?: number;
        tokensUsed?: number;
        llmModel?: string;
      }
    ) => {
      if (!threadId) return null;
      const { data, error } = await addChatMessage(
        threadId,
        role,
        content,
        options
      );
      if (error) {
        setError(error.message);
        return null;
      }
      if (data) {
        setMessages((prev) => [...prev, data]);
      }
      return data;
    },
    [threadId]
  );

  return { messages, loading, error, addMessage, setMessages };
}

// =============================================================================
// WORKFLOWS HOOK
// =============================================================================

export function useWorkflows(options?: {
  status?: string;
  isTemplate?: boolean;
}) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data, error } = await getWorkflows(options);
      if (error) {
        setError(error.message);
      } else {
        setWorkflows(data || []);
      }
      setLoading(false);
    }
    fetch();
  }, [options?.status, options?.isTemplate]);

  return { workflows, loading, error, setWorkflows };
}

// =============================================================================
// NEWS POSTS HOOK
// =============================================================================

export function useNewsPosts(options?: {
  departmentId?: string;
  type?: string;
  limit?: number;
}) {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data, error } = await getNewsPosts(options);
      if (error) {
        setError(error.message);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    }
    fetch();
  }, [options?.departmentId, options?.type, options?.limit]);

  return { posts, loading, error, setPosts };
}

// =============================================================================
// EVENTS HOOK
// =============================================================================

export function useUpcomingEvents(options?: {
  departmentId?: string;
  limit?: number;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data, error } = await getUpcomingEvents(options);
      if (error) {
        setError(error.message);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    }
    fetch();
  }, [options?.departmentId, options?.limit]);

  return { events, loading, error, setEvents };
}

// =============================================================================
// USER SETTINGS HOOK
// =============================================================================

export function useUserSettings() {
  const { user } = useCurrentUser();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await getUserSettings(user.id);
      if (error) {
        setError(error.message);
      } else {
        setSettings(data as UserSettings);
      }
      setLoading(false);
    }
    fetch();
  }, [user]);

  const updateSettings = useCallback(
    async (
      newSettings: Partial<{
        notification_prefs: object;
        appearance: object;
        ai_prefs: object;
        privacy: object;
      }>
    ) => {
      if (!user) return null;
      const { data, error } = await updateUserSettings(user.id, newSettings);
      if (error) {
        setError(error.message);
        return null;
      }
      if (data) {
        setSettings(data as UserSettings);
      }
      return data;
    },
    [user]
  );

  return { settings, loading, error, updateSettings };
}

// =============================================================================
// SEARCH HOOK
// =============================================================================

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (
      query: string,
      options?: {
        projectCodes?: string[];
        itemTypes?: string[];
        maxResults?: number;
      }
    ) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error } = await searchKnowledge(query, options);
      if (error) {
        setError(error.message);
        setResults([]);
      } else {
        setResults(data || []);
      }
      setLoading(false);
    },
    []
  );

  return { results, loading, error, search };
}

// =============================================================================
// ACTIVITY LOGGING HOOK
// =============================================================================

export function useActivityLog() {
  const { user } = useCurrentUser();

  const log = useCallback(
    async (
      action: string,
      options?: {
        entityType?: string;
        entityId?: string;
        metadata?: object;
      }
    ) => {
      await logActivity(user?.id || null, action, options);
    },
    [user]
  );

  return { log };
}

// =============================================================================
// RECENT ACTIVITY HOOK (for dashboard)
// =============================================================================

export function useRecentActivity(limit = 10) {
  const { user } = useCurrentUser();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!user) {
        setLoading(false);
        return;
      }

      // Get dIQ project ID first
      const { data: projectData } = await supabase
        .from("projects")
        .select("id")
        .eq("code", "dIQ")
        .single();

      const projectId = (projectData as { id: string } | null)?.id;
      if (!projectId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("activity_log")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(limit);

      setActivities(data || []);
      setLoading(false);
    }
    fetch();
  }, [user, limit]);

  return { activities, loading };
}
