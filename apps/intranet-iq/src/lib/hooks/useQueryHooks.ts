/**
 * Optimized React Query Hooks
 * - Automatic request deduplication
 * - Stale-while-revalidate caching
 * - Query-level filtering via API params
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { supabase } from "../supabase";
import type {
  Article,
  KBCategory,
  Employee,
  Department,
  Workflow,
  NewsPost,
  Event,
  User,
} from "../database.types";

// =============================================================================
// QUERY KEYS - Centralized for cache invalidation
// =============================================================================

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  content: (params?: ContentParams) => ["content", params] as const,
  people: (params?: PeopleParams) => ["people", params] as const,
  workflows: (params?: WorkflowParams) => ["workflows", params] as const,
  currentUser: ["currentUser"] as const,
};

// =============================================================================
// TYPES
// =============================================================================

interface ContentParams {
  categoryId?: string;
  status?: string;
  limit?: number;
  offset?: number;
  departmentId?: string;
}

interface PeopleParams {
  departmentId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

interface WorkflowParams {
  status?: string;
  isTemplate?: boolean;
}

interface DashboardData {
  news_posts: NewsPost[];
  events: Event[];
  stats: {
    articles: number;
    employees: number;
    active_workflows: number;
  };
}

interface ContentData {
  articles: Article[];
  categories: KBCategory[];
  userRole: string;
  isAdmin: boolean;
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

interface PeopleData {
  employees: Employee[];
  departments: Department[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

interface WorkflowData {
  workflows: Workflow[];
}

// =============================================================================
// API FETCHERS
// =============================================================================

async function fetchDashboard(params?: { newsLimit?: number; eventsLimit?: number }): Promise<DashboardData> {
  const searchParams = new URLSearchParams();
  if (params?.newsLimit) searchParams.set("newsLimit", params.newsLimit.toString());
  if (params?.eventsLimit) searchParams.set("eventsLimit", params.eventsLimit.toString());

  const url = `/diq/api/dashboard${searchParams.toString() ? `?${searchParams}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch dashboard data");
  return response.json();
}

async function fetchContent(params?: ContentParams): Promise<ContentData> {
  const searchParams = new URLSearchParams();
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.offset) searchParams.set("offset", params.offset.toString());
  if (params?.departmentId) searchParams.set("departmentId", params.departmentId);

  const url = `/diq/api/content${searchParams.toString() ? `?${searchParams}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch content");
  return response.json();
}

async function fetchPeople(params?: PeopleParams): Promise<PeopleData> {
  const searchParams = new URLSearchParams();
  if (params?.departmentId) searchParams.set("departmentId", params.departmentId);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.offset) searchParams.set("offset", params.offset.toString());

  const url = `/diq/api/people${searchParams.toString() ? `?${searchParams}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch people");
  return response.json();
}

async function fetchWorkflows(params?: WorkflowParams): Promise<WorkflowData> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.isTemplate !== undefined) searchParams.set("isTemplate", params.isTemplate.toString());

  const url = `/diq/api/workflows${searchParams.toString() ? `?${searchParams}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch workflows");
  return response.json();
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Dashboard data hook - news, events, stats
 * Uses stale-while-revalidate for instant loading on revisit
 */
export function useDashboard(params?: { newsLimit?: number; eventsLimit?: number }) {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => fetchDashboard(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * News posts hook - extracts from dashboard data
 */
export function useNewsPosts(options?: { limit?: number }) {
  const { data, isLoading, error } = useDashboard({ newsLimit: options?.limit || 10 });

  return {
    posts: data?.news_posts || [],
    loading: isLoading,
    error: error?.message || null,
  };
}

/**
 * Events hook - extracts from dashboard data
 */
export function useUpcomingEvents(options?: { limit?: number }) {
  const { data, isLoading, error } = useDashboard({ eventsLimit: options?.limit || 10 });

  return {
    events: data?.events || [],
    loading: isLoading,
    error: error?.message || null,
  };
}

/**
 * Dashboard stats hook
 */
export function useDashboardStats() {
  const { data, isLoading, error } = useDashboard();

  return {
    stats: data?.stats || { articles: 0, employees: 0, active_workflows: 0 },
    loading: isLoading,
    error: error?.message || null,
  };
}

/**
 * Content hook - articles with server-side filtering
 */
export function useContent(params?: ContentParams) {
  return useQuery({
    queryKey: queryKeys.content(params),
    queryFn: () => fetchContent(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Articles hook - extracts from content data
 */
export function useArticles(options?: {
  categoryId?: string;
  status?: "draft" | "pending_review" | "published" | "archived";
  limit?: number;
}) {
  const { data, isLoading, error, refetch } = useContent({
    categoryId: options?.categoryId,
    status: options?.status,
    limit: options?.limit,
  });

  return {
    articles: data?.articles || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
    setArticles: () => {}, // For backwards compatibility
  };
}

/**
 * KB Categories hook - extracts from content data
 */
export function useKBCategories(departmentId?: string) {
  const { data, isLoading, error } = useContent({ departmentId });

  return {
    categories: data?.categories || [],
    loading: isLoading,
    error: error?.message || null,
  };
}

/**
 * People hook - employees with server-side filtering
 */
export function usePeople(params?: PeopleParams) {
  return useQuery({
    queryKey: queryKeys.people(params),
    queryFn: () => fetchPeople(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Employees hook - extracts from people data
 */
export function useEmployees(options?: {
  departmentId?: string;
  search?: string;
  limit?: number;
}) {
  const { data, isLoading, error, refetch } = usePeople({
    departmentId: options?.departmentId,
    search: options?.search,
    limit: options?.limit,
  });

  return {
    employees: data?.employees || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Departments hook - extracts from people data
 */
export function useDepartments() {
  const { data, isLoading, error } = usePeople();

  return {
    departments: data?.departments || [],
    loading: isLoading,
    error: error?.message || null,
  };
}

/**
 * Workflows hook with server-side filtering
 */
export function useWorkflows(options?: {
  status?: string;
  isTemplate?: boolean;
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.workflows(options),
    queryFn: () => fetchWorkflows(options),
    staleTime: 30 * 1000,
  });

  const queryClient = useQueryClient();

  const updateWorkflow = async (workflowId: string, updates: Partial<Workflow>) => {
    // Optimistic update
    queryClient.setQueryData(queryKeys.workflows(options), (old: WorkflowData | undefined) => {
      if (!old) return old;
      return {
        ...old,
        workflows: old.workflows.map((w) =>
          w.id === workflowId ? { ...w, ...updates } : w
        ),
      };
    });
  };

  const createWorkflow = async (workflow: Workflow) => {
    queryClient.setQueryData(queryKeys.workflows(options), (old: WorkflowData | undefined) => {
      if (!old) return { workflows: [workflow] };
      return {
        ...old,
        workflows: [workflow, ...old.workflows],
      };
    });
    return workflow;
  };

  return {
    workflows: data?.workflows || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
    setWorkflows: () => {}, // For backwards compatibility
    updateWorkflow,
    createWorkflow,
  };
}

/**
 * Current user hook
 */
export function useCurrentUser() {
  const { user: clerkUser, isLoaded } = useUser();

  const { data: dbUser, isLoading } = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      if (!clerkUser) return null;
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("clerk_id", clerkUser.id)
        .single();
      if (error) throw error;
      return data as User;
    },
    enabled: isLoaded && !!clerkUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: dbUser,
    clerkUser,
    loading: !isLoaded || isLoading,
    isLoaded,
  };
}

/**
 * Hook to prefetch data for faster navigation
 */
export function usePrefetch() {
  const queryClient = useQueryClient();

  return {
    prefetchDashboard: () => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard,
        queryFn: () => fetchDashboard(),
      });
    },
    prefetchContent: (params?: ContentParams) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.content(params),
        queryFn: () => fetchContent(params),
      });
    },
    prefetchPeople: (params?: PeopleParams) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.people(params),
        queryFn: () => fetchPeople(params),
      });
    },
  };
}

/**
 * Hook for invalidating caches after mutations
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateDashboard: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
    invalidateContent: () => queryClient.invalidateQueries({ queryKey: ["content"] }),
    invalidatePeople: () => queryClient.invalidateQueries({ queryKey: ["people"] }),
    invalidateWorkflows: () => queryClient.invalidateQueries({ queryKey: ["workflows"] }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}
