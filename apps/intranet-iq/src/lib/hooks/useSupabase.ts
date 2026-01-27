/**
 * dIQ Supabase Hooks - OPTIMIZED with React Query
 *
 * This file re-exports the optimized React Query hooks for backwards compatibility.
 * All hooks now use React Query for:
 * - Automatic request deduplication
 * - Stale-while-revalidate caching
 * - Server-side filtering via API params
 */

"use client";

// Re-export all hooks from the optimized React Query implementation
export {
  useCurrentUser,
  useDepartments,
  useEmployees,
  useArticles,
  useKBCategories,
  useWorkflows,
  useNewsPosts,
  useUpcomingEvents,
  useDashboard,
  useDashboardStats,
  useContent,
  usePeople,
  usePrefetch,
  useInvalidateQueries,
  queryKeys,
} from "./useQueryHooks";

// Keep legacy hooks that aren't migrated yet
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  supabase,
  getChatThreads,
  getChatMessages,
  createChatThread,
  addChatMessage,
  getUserSettings,
  updateUserSettings,
  logActivity,
} from "../supabase";
import type {
  ChatThread,
  ChatMessage,
  UserSettings,
  SearchResult,
  User,
} from "../database.types";

// Import useCurrentUser from query hooks
import { useCurrentUser } from "./useQueryHooks";

// =============================================================================
// CHAT HOOKS (Not migrated - complex state management)
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
        mode?: 'keyword' | 'semantic' | 'hybrid';
      }
    ) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/diq/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            searchType: options?.mode || 'semantic',
            contentTypes: options?.itemTypes || ['article', 'news', 'event'],
            limit: options?.maxResults || 20,
            threshold: 0.3,
            useElasticsearch: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data = await response.json();

        const transformedResults: SearchResult[] = (data.results || []).map((item: any) => {
          // Normalize relevance score to 0-1 range
          // API returns relevanceScore as integer (0-100), or similarity as decimal (0-1)
          const rawScore = item.relevanceScore || item.score || item.similarity || item.combined_score || 0;
          const normalizedRelevance = rawScore > 1 ? rawScore / 100 : rawScore;

          return {
            id: item.id,
            title: item.title,
            content: item.content,
            summary: item.summary || item.highlights?.[0] || '',
            type: item.type || 'article',
            source: item.source || 'knowledge_base',
            url: item.url,
            score: rawScore,
            relevance: normalizedRelevance,
            created_at: item.created_at,
            metadata: item.metadata,
          };
        });

        setResults(transformedResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
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
