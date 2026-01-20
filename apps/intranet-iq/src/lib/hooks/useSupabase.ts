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
    async function fetchData() {
      try {
        // Use API route for cross-schema data
        const response = await fetch('/diq/api/people');
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        const data = await response.json();
        setDepartments(data.departments || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
    async function fetchData() {
      setLoading(true);
      try {
        // Use API route for cross-schema data
        const response = await fetch('/diq/api/people');
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        let filteredEmployees = data.employees || [];

        // Apply client-side filtering
        if (options?.departmentId) {
          filteredEmployees = filteredEmployees.filter(
            (e: any) => e.department_id === options.departmentId
          );
        }
        if (options?.limit) {
          filteredEmployees = filteredEmployees.slice(0, options.limit);
        }

        setEmployees(filteredEmployees);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
    async function fetchData() {
      setLoading(true);
      try {
        // Use API route for cross-schema data
        const response = await fetch('/diq/api/content');
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        const data = await response.json();
        let filteredArticles = data.articles || [];

        // Apply client-side filtering
        if (options?.categoryId) {
          filteredArticles = filteredArticles.filter(
            (a: any) => a.category_id === options.categoryId
          );
        }
        if (options?.status) {
          filteredArticles = filteredArticles.filter(
            (a: any) => a.status === options.status
          );
        }
        if (options?.limit) {
          filteredArticles = filteredArticles.slice(0, options.limit);
        }

        setArticles(filteredArticles);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
    async function fetchData() {
      try {
        // Use API route for cross-schema data
        const response = await fetch('/diq/api/content');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        let filteredCategories = data.categories || [];

        // Apply client-side filtering
        if (departmentId) {
          filteredCategories = filteredCategories.filter(
            (c: any) => c.department_id === departmentId
          );
        }

        setCategories(filteredCategories);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
    async function fetchData() {
      setLoading(true);
      try {
        // Use API route for cross-schema data
        const response = await fetch('/diq/api/workflows');
        if (!response.ok) {
          throw new Error('Failed to fetch workflows');
        }
        const data = await response.json();
        let filteredWorkflows = data.workflows || [];

        // Apply client-side filtering
        if (options?.status) {
          filteredWorkflows = filteredWorkflows.filter(
            (w: Workflow) => w.status === options.status
          );
        }
        if (options?.isTemplate !== undefined) {
          filteredWorkflows = filteredWorkflows.filter(
            (w: Workflow) => w.is_template === options.isTemplate
          );
        }

        setWorkflows(filteredWorkflows);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [options?.status, options?.isTemplate]);

  const updateWorkflow = async (workflowId: string, updates: Partial<Workflow>) => {
    // Optimistic update
    setWorkflows(prev =>
      prev.map(w => w.id === workflowId ? { ...w, ...updates } : w)
    );
    // In production, persist to Supabase:
    // await supabase.from('diq.workflows').update(updates).eq('id', workflowId);
  };

  const createWorkflow = async (workflow: Workflow) => {
    setWorkflows(prev => [workflow, ...prev]);
    // In production, persist to Supabase:
    // await supabase.from('diq.workflows').insert(workflow);
    return workflow;
  };

  return { workflows, loading, error, setWorkflows, updateWorkflow, createWorkflow };
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
    async function fetchData() {
      setLoading(true);
      try {
        // Use API route for cross-schema data
        const response = await fetch('/diq/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch news posts');
        }
        const data = await response.json();
        let filteredPosts = data.news_posts || [];

        // Apply client-side filtering
        if (options?.departmentId) {
          filteredPosts = filteredPosts.filter(
            (p: NewsPost) => p.department_id === options.departmentId
          );
        }
        if (options?.type) {
          filteredPosts = filteredPosts.filter(
            (p: NewsPost) => p.type === options.type
          );
        }
        if (options?.limit) {
          filteredPosts = filteredPosts.slice(0, options.limit);
        }

        setPosts(filteredPosts);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
    async function fetchData() {
      setLoading(true);
      try {
        // Use API route for cross-schema data
        const response = await fetch('/diq/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        let filteredEvents = data.events || [];

        // Apply client-side filtering
        if (options?.departmentId) {
          filteredEvents = filteredEvents.filter(
            (e: Event) => e.department_id === options.departmentId
          );
        }
        if (options?.limit) {
          filteredEvents = filteredEvents.slice(0, options.limit);
        }

        setEvents(filteredEvents);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
        offset?: number;
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
