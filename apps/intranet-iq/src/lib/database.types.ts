/**
 * dIQ Database Types
 * Auto-generated types for Supabase tables
 */

// =============================================================================
// PUBLIC SCHEMA TYPES (Shared across all projects)
// =============================================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  code: 'dIQ' | 'dSQ' | 'dTQ' | 'dCQ';
  name: string;
  description: string | null;
  color_primary: string | null;
  color_secondary: string | null;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'super_admin';
  organization_id: string | null;
  settings: Record<string, unknown>;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProjectAccess {
  id: string;
  user_id: string;
  project_id: string;
  role: 'viewer' | 'editor' | 'admin';
  granted_at: string;
  granted_by: string | null;
}

export interface KnowledgeItem {
  id: string;
  project_id: string;
  source_table: string;
  source_id: string;
  type: 'article' | 'document' | 'faq' | 'thread';
  title: string;
  content: string | null;
  summary: string | null;
  metadata: Record<string, unknown>;
  tags: string[];
  embedding?: number[] | null;  // pgvector embedding (1536 dimensions)
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  project_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Integration {
  id: string;
  project_id: string | null;
  organization_id: string | null;
  type: string;
  name: string;
  config: Record<string, unknown>;
  status: 'active' | 'inactive' | 'error';
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// dIQ SCHEMA TYPES
// =============================================================================

export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  manager_id: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id: string;
  department_id: string | null;
  job_title: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  skills: string[];
  manager_id: string | null;
  hire_date: string | null;
  profile_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EmployeeWithUser extends Employee {
  user: User;
  department?: Department;
  manager?: Employee & { user: User };
}

export interface KBCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  department_id: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  author_id: string;
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  published_at: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  view_count: number;
  helpful_count: number;
  embedding?: number[] | null;  // pgvector embedding (1536 dimensions)
  created_at: string;
  updated_at: string;
}

export interface ArticleWithAuthor extends Article {
  author: User;
  category?: KBCategory;
}

export interface ArticleVersion {
  id: string;
  article_id: string;
  version_number: number;
  title: string;
  content: string;
  summary: string | null;
  edited_by: string;
  change_summary: string | null;
  created_at: string;
}

export interface ChatThread {
  id: string;
  user_id: string;
  title: string | null;
  llm_model: string;
  status: 'active' | 'archived' | 'deleted';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources: ChatSource[];
  confidence: number | null;
  tokens_used: number | null;
  llm_model: string | null;
  metadata: Record<string, unknown>;
  embedding?: number[] | null;  // pgvector embedding for RAG retrieval
  created_at: string;
}

export interface ChatSource {
  id: string;
  type: 'article' | 'document' | 'web';
  title: string;
  url?: string;
  snippet?: string;
  relevance?: number;
}

export interface SearchHistoryEntry {
  id: string;
  user_id: string | null;
  query: string;
  filters: Record<string, unknown>;
  results_count: number;
  clicked_results: string[];
  session_id: string | null;
  created_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  trigger_type: string | null;
  trigger_config: Record<string, unknown>;
  is_template: boolean;
  template_category: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_number: number;
  name: string;
  type: 'llm' | 'search' | 'condition' | 'action' | 'human';
  config: Record<string, unknown>;
  next_step_on_success: string | null;
  next_step_on_failure: string | null;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  triggered_by: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  current_step_id: string | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface NewsPost {
  id: string;
  author_id: string;
  title: string | null;
  content: string;
  type: 'post' | 'announcement' | 'event' | 'poll';
  department_id: string | null;
  visibility: 'all' | 'department' | 'private';
  pinned: boolean;
  likes_count: number;
  comments_count: number;
  attachments: NewsAttachment[];
  metadata: Record<string, unknown>;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface NewsAttachment {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name?: string;
  size?: number;
}

export interface NewsPostWithAuthor extends NewsPost {
  author: User;
  department?: Department;
}

export interface NewsComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  organizer_id: string;
  department_id: string | null;
  location: string | null;
  location_type: 'in_person' | 'virtual' | 'hybrid';
  meeting_url: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  recurrence_rule: string | null;
  visibility: string;
  max_attendees: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'maybe';
  responded_at: string | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  item_type: 'article' | 'post' | 'employee' | 'workflow';
  item_id: string;
  notes: string | null;
  folder: string | null;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  notification_prefs: {
    email_digest: boolean;
    news_mentions: boolean;
    article_updates: boolean;
    event_reminders: boolean;
  };
  appearance: {
    theme: 'dark' | 'light' | 'system';
    sidebar_collapsed: boolean;
    density: 'compact' | 'comfortable' | 'spacious';
    dashboardWidgets?: Array<{
      id: string;
      type: string;
      title: string;
      visible: boolean;
      order: number;
      size?: string;
    }>;
  };
  ai_prefs: {
    default_llm: string;
    response_style: 'factual' | 'balanced' | 'creative';
    show_sources: boolean;
  };
  privacy: {
    show_profile: boolean;
    show_activity: boolean;
    searchable: boolean;
  };
  created_at: string;
  updated_at: string;
}

// =============================================================================
// FUNCTION RETURN TYPES
// =============================================================================

export interface SearchResult {
  id: string;
  project_code: string;
  type: string;
  title: string;
  summary: string | null;
  tags: string[];
  relevance: number;
  created_at: string;
}

export interface OrgChartNode {
  employee_id: string;
  user_id: string;
  full_name: string;
  job_title: string | null;
  department_name: string | null;
  manager_id: string | null;
  level: number;
}

export interface ArticleSearchResult {
  id: string;
  title: string;
  summary: string | null;
  category_name: string | null;
  author_name: string | null;
  published_at: string | null;
  relevance: number;
}

// =============================================================================
// SEMANTIC SEARCH TYPES (pgvector)
// =============================================================================

export interface SemanticSearchResult {
  id: string;
  title: string;
  summary: string | null;
  slug: string;
  category_name: string | null;
  department_name: string | null;
  similarity: number;
}

export interface HybridSearchResult {
  id: string;
  project_code: string;
  item_type: string;
  title: string;
  summary: string | null;
  combined_score: number;
  keyword_score: number;
  semantic_score: number;
}

export interface SimilarArticleResult {
  id: string;
  title: string;
  summary: string | null;
  slug: string;
  category_name: string | null;
  similarity: number;
}

export interface EmbeddingStats {
  table_name: string;
  total_rows: number;
  with_embeddings: number;
  without_embeddings: number;
  coverage_percent: number;
}

// =============================================================================
// DATABASE SCHEMA TYPE (for Supabase client)
// =============================================================================

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_project_access: {
        Row: UserProjectAccess;
        Insert: Omit<UserProjectAccess, 'id' | 'granted_at'>;
        Update: Partial<Omit<UserProjectAccess, 'id' | 'granted_at'>>;
      };
      knowledge_items: {
        Row: KnowledgeItem;
        Insert: Omit<KnowledgeItem, 'id' | 'created_at' | 'updated_at' | 'searchable'>;
        Update: Partial<Omit<KnowledgeItem, 'id' | 'created_at' | 'updated_at' | 'searchable'>>;
      };
      activity_log: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, 'id' | 'created_at'>;
        Update: never;
      };
      integrations: {
        Row: Integration;
        Insert: Omit<Integration, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Integration, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Functions: {
      search_knowledge: {
        Args: {
          search_query: string;
          project_codes?: string[];
          item_types?: string[];
          max_results?: number;
        };
        Returns: SearchResult[];
      };
      get_user_projects: {
        Args: {
          user_clerk_id: string;
        };
        Returns: {
          project_id: string;
          project_code: string;
          project_name: string;
          user_role: string;
        }[];
      };
    };
  };
  diq: {
    Tables: {
      departments: {
        Row: Department;
        Insert: Omit<Department, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Department, 'id' | 'created_at' | 'updated_at'>>;
      };
      employees: {
        Row: Employee;
        Insert: Omit<Employee, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>;
      };
      kb_categories: {
        Row: KBCategory;
        Insert: Omit<KBCategory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<KBCategory, 'id' | 'created_at' | 'updated_at'>>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'helpful_count'>;
        Update: Partial<Omit<Article, 'id' | 'created_at' | 'updated_at'>>;
      };
      article_versions: {
        Row: ArticleVersion;
        Insert: Omit<ArticleVersion, 'id' | 'created_at'>;
        Update: never;
      };
      chat_threads: {
        Row: ChatThread;
        Insert: Omit<ChatThread, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ChatThread, 'id' | 'created_at' | 'updated_at'>>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, 'id' | 'created_at'>;
        Update: never;
      };
      search_history: {
        Row: SearchHistoryEntry;
        Insert: Omit<SearchHistoryEntry, 'id' | 'created_at'>;
        Update: never;
      };
      workflows: {
        Row: Workflow;
        Insert: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Workflow, 'id' | 'created_at' | 'updated_at'>>;
      };
      workflow_steps: {
        Row: WorkflowStep;
        Insert: Omit<WorkflowStep, 'id' | 'created_at'>;
        Update: Partial<Omit<WorkflowStep, 'id' | 'created_at'>>;
      };
      workflow_executions: {
        Row: WorkflowExecution;
        Insert: Omit<WorkflowExecution, 'id' | 'started_at'>;
        Update: Partial<Omit<WorkflowExecution, 'id' | 'started_at'>>;
      };
      news_posts: {
        Row: NewsPost;
        Insert: Omit<NewsPost, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count'>;
        Update: Partial<Omit<NewsPost, 'id' | 'created_at' | 'updated_at'>>;
      };
      news_comments: {
        Row: NewsComment;
        Insert: Omit<NewsComment, 'id' | 'created_at' | 'updated_at' | 'likes_count'>;
        Update: Partial<Omit<NewsComment, 'id' | 'created_at' | 'updated_at'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>;
      };
      event_rsvps: {
        Row: EventRSVP;
        Insert: Omit<EventRSVP, 'id' | 'created_at'>;
        Update: Partial<Omit<EventRSVP, 'id' | 'created_at'>>;
      };
      bookmarks: {
        Row: Bookmark;
        Insert: Omit<Bookmark, 'id' | 'created_at'>;
        Update: Partial<Omit<Bookmark, 'id' | 'created_at'>>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Functions: {
      get_org_chart: {
        Args: {
          dept_id?: string;
        };
        Returns: OrgChartNode[];
      };
      search_articles: {
        Args: {
          search_query: string;
          category_slug?: string;
          max_results?: number;
        };
        Returns: ArticleSearchResult[];
      };
    };
  };
}
