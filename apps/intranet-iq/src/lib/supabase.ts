/**
 * dIQ Supabase Client
 * Configured for the Intranet IQ project
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// =============================================================================
// dIQ-SPECIFIC DATA ACCESS FUNCTIONS
// =============================================================================

/**
 * Get articles with optional filtering
 */
export async function getArticles(options?: {
  categoryId?: string;
  status?: 'draft' | 'pending_review' | 'published' | 'archived';
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .schema('diq')
    .from('articles')
    .select(`
      *,
      author:author_id(id, full_name, avatar_url),
      category:category_id(id, name, slug, color)
    `)
    .order('created_at', { ascending: false });

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  return query;
}

/**
 * Get article by slug
 */
export async function getArticleBySlug(slug: string) {
  return supabase
    .schema('diq')
    .from('articles')
    .select(`
      *,
      author:author_id(id, full_name, avatar_url),
      category:category_id(id, name, slug, color)
    `)
    .eq('slug', slug)
    .single();
}

/**
 * Get KB categories tree
 */
export async function getKBCategories(departmentId?: string) {
  let query = supabase
    .schema('diq')
    .from('kb_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (departmentId) {
    query = query.eq('department_id', departmentId);
  }

  return query;
}

/**
 * Get employee directory
 */
export async function getEmployees(options?: {
  departmentId?: string;
  search?: string;
  limit?: number;
}) {
  let query = supabase
    .schema('diq')
    .from('employees')
    .select(`
      *,
      user:user_id(id, full_name, email, avatar_url),
      department:department_id(id, name, slug)
    `)
    .order('user_id');

  if (options?.departmentId) {
    query = query.eq('department_id', options.departmentId);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return query;
}

/**
 * Get org chart
 */
export async function getOrgChart(departmentId?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc('diq.get_org_chart', {
    dept_id: departmentId || null,
  });
}

/**
 * Get user's chat threads
 */
export async function getChatThreads(userId: string) {
  return supabase
    .schema('diq')
    .from('chat_threads')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'deleted')
    .order('updated_at', { ascending: false });
}

/**
 * Get chat messages for a thread
 */
export async function getChatMessages(threadId: string) {
  return supabase
    .schema('diq')
    .from('chat_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
}

/**
 * Create a new chat thread
 */
export async function createChatThread(userId: string, title?: string, llmModel = 'gpt-4') {
  return supabase
    .schema('diq')
    .from('chat_threads')
    .insert({
      user_id: userId,
      title,
      llm_model: llmModel,
      status: 'active',
      metadata: {},
    })
    .select()
    .single();
}

/**
 * Add a message to a chat thread
 */
export async function addChatMessage(
  threadId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  options?: {
    sources?: object[];
    confidence?: number;
    tokensUsed?: number;
    llmModel?: string;
  }
) {
  return supabase
    .schema('diq')
    .from('chat_messages')
    .insert({
      thread_id: threadId,
      role,
      content,
      sources: options?.sources || [],
      confidence: options?.confidence || null,
      tokens_used: options?.tokensUsed || null,
      llm_model: options?.llmModel || null,
      metadata: {},
    })
    .select()
    .single();
}

/**
 * Get workflows
 */
export async function getWorkflows(options?: {
  createdBy?: string;
  status?: string;
  isTemplate?: boolean;
}) {
  let query = supabase
    .schema('diq')
    .from('workflows')
    .select(`
      *,
      creator:created_by(id, full_name, avatar_url)
    `)
    .order('updated_at', { ascending: false });

  if (options?.createdBy) {
    query = query.eq('created_by', options.createdBy);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.isTemplate !== undefined) {
    query = query.eq('is_template', options.isTemplate);
  }

  return query;
}

/**
 * Get workflow with steps
 */
export async function getWorkflowWithSteps(workflowId: string) {
  const [workflow, steps] = await Promise.all([
    supabase
      .schema('diq')
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single(),
    supabase
      .schema('diq')
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_number', { ascending: true }),
  ]);

  return { workflow, steps };
}

/**
 * Get news feed posts
 */
export async function getNewsPosts(options?: {
  departmentId?: string;
  type?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .schema('diq')
    .from('news_posts')
    .select(`
      *,
      author:author_id(id, full_name, avatar_url),
      department:department_id(id, name)
    `)
    .order('pinned', { ascending: false })
    .order('published_at', { ascending: false });

  if (options?.departmentId) {
    query = query.eq('department_id', options.departmentId);
  }

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  return query;
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(options?: {
  departmentId?: string;
  limit?: number;
}) {
  let query = supabase
    .schema('diq')
    .from('events')
    .select(`
      *,
      organizer:organizer_id(id, full_name, avatar_url),
      department:department_id(id, name)
    `)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true });

  if (options?.departmentId) {
    query = query.eq('department_id', options.departmentId);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return query;
}

/**
 * Get user's bookmarks
 */
export async function getUserBookmarks(userId: string, itemType?: string) {
  let query = supabase
    .schema('diq')
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (itemType) {
    query = query.eq('item_type', itemType);
  }

  return query;
}

/**
 * Add a bookmark
 */
export async function addBookmark(
  userId: string,
  itemType: 'article' | 'post' | 'employee' | 'workflow',
  itemId: string,
  options?: { notes?: string; folder?: string }
) {
  return supabase
    .schema('diq')
    .from('bookmarks')
    .insert({
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      notes: options?.notes || null,
      folder: options?.folder || null,
    })
    .select()
    .single();
}

/**
 * Remove a bookmark
 */
export async function removeBookmark(userId: string, itemType: string, itemId: string) {
  return supabase
    .schema('diq')
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId);
}

/**
 * Get user settings
 */
export async function getUserSettings(userId: string) {
  const { data, error } = await supabase
    .schema('diq')
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  // If no settings exist, return defaults
  if (error && error.code === 'PGRST116') {
    return {
      data: {
        notification_prefs: {
          email_digest: true,
          news_mentions: true,
          article_updates: true,
          event_reminders: true,
        },
        appearance: {
          theme: 'dark',
          sidebar_collapsed: false,
          density: 'comfortable',
        },
        ai_prefs: {
          default_llm: 'gpt-4',
          response_style: 'balanced',
          show_sources: true,
        },
        privacy: {
          show_profile: true,
          show_activity: true,
          searchable: true,
        },
      },
      error: null,
    };
  }

  return { data, error };
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  settings: Partial<{
    notification_prefs: object;
    appearance: object;
    ai_prefs: object;
    privacy: object;
  }>
) {
  return supabase
    .schema('diq')
    .from('user_settings')
    .upsert({
      user_id: userId,
      ...settings,
    })
    .select()
    .single();
}

/**
 * Search across knowledge items (cross-project)
 */
export async function searchKnowledge(
  query: string,
  options?: {
    projectCodes?: string[];
    itemTypes?: string[];
    maxResults?: number;
    offset?: number;
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc('search_knowledge', {
    search_query: query,
    project_codes: options?.projectCodes || null,
    item_types: options?.itemTypes || null,
    max_results: options?.maxResults || 20,
    result_offset: options?.offset || 0,
  });
}

/**
 * Search articles within dIQ
 */
export async function searchArticles(
  query: string,
  options?: {
    categorySlug?: string;
    maxResults?: number;
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc('diq.search_articles', {
    search_query: query,
    category_slug: options?.categorySlug || null,
    max_results: options?.maxResults || 20,
  });
}

/**
 * Log activity
 */
export async function logActivity(
  userId: string | null,
  action: string,
  options?: {
    entityType?: string;
    entityId?: string;
    metadata?: object;
  }
) {
  // Get dIQ project ID
  const { data: projectData } = await supabase
    .from('projects')
    .select('id')
    .eq('code', 'dIQ')
    .single();

  const projectId = (projectData as { id: string } | null)?.id;
  if (!projectId) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from('activity_log').insert({
    user_id: userId,
    project_id: projectId,
    action,
    entity_type: options?.entityType || null,
    entity_id: options?.entityId || null,
    metadata: options?.metadata || {},
  });
}

// =============================================================================
// DEPARTMENTS
// =============================================================================

/**
 * Get all departments
 */
export async function getDepartments() {
  return supabase
    .schema('diq')
    .from('departments')
    .select(`
      *,
      manager:manager_id(id, full_name, avatar_url)
    `)
    .order('name');
}

/**
 * Get department by slug
 */
export async function getDepartmentBySlug(slug: string) {
  return supabase
    .schema('diq')
    .from('departments')
    .select(`
      *,
      manager:manager_id(id, full_name, avatar_url)
    `)
    .eq('slug', slug)
    .single();
}

// =============================================================================
// SEMANTIC SEARCH (pgvector)
// =============================================================================

/**
 * Semantic search across knowledge items using vector similarity
 * Requires embeddings to be generated for content
 */
export async function searchKnowledgeSemantic(
  queryEmbedding: number[],
  options?: {
    matchThreshold?: number;
    matchCount?: number;
    projectCodes?: string[];
    itemTypes?: string[];
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc('search_knowledge_semantic', {
    query_embedding: queryEmbedding,
    match_threshold: options?.matchThreshold || 0.7,
    match_count: options?.matchCount || 10,
    filter_project_codes: options?.projectCodes || null,
    filter_item_types: options?.itemTypes || null,
  });
}

/**
 * Hybrid search combining keyword and vector similarity
 * Best of both worlds: keyword precision + semantic understanding
 */
export async function searchKnowledgeHybrid(
  searchQuery: string,
  queryEmbedding?: number[],
  options?: {
    matchCount?: number;
    projectCodes?: string[];
    itemTypes?: string[];
    semanticWeight?: number; // 0.0 = pure keyword, 1.0 = pure semantic
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc('search_knowledge_hybrid', {
    search_query: searchQuery,
    query_embedding: queryEmbedding || null,
    match_count: options?.matchCount || 20,
    filter_project_codes: options?.projectCodes || null,
    filter_item_types: options?.itemTypes || null,
    semantic_weight: options?.semanticWeight || 0.5,
  });
}

/**
 * Semantic search for dIQ articles
 */
export async function searchArticlesSemantic(
  queryEmbedding: number[],
  options?: {
    matchThreshold?: number;
    matchCount?: number;
    categorySlug?: string;
    status?: string;
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc('diq.search_articles_semantic', {
    query_embedding: queryEmbedding,
    match_threshold: options?.matchThreshold || 0.7,
    match_count: options?.matchCount || 10,
    filter_category_slug: options?.categorySlug || null,
    filter_status: options?.status || 'published',
  });
}

/**
 * Find similar articles based on content
 */
export async function findSimilarArticles(
  articleId: string,
  matchCount = 5
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc('diq.find_similar_articles', {
    article_id: articleId,
    match_count: matchCount,
  });
}

/**
 * Get RAG context for AI chat responses
 * Returns relevant content from articles and knowledge items
 */
export async function getChatContext(
  queryEmbedding: number[],
  options?: {
    maxTokens?: number;
    matchThreshold?: number;
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc('diq.get_chat_context', {
    query_embedding: queryEmbedding,
    max_tokens: options?.maxTokens || 4000,
    match_threshold: options?.matchThreshold || 0.7,
  });
}

/**
 * Get embedding coverage statistics
 */
export async function getEmbeddingStats() {
  return supabase
    .from('embedding_stats')
    .select('*');
}
