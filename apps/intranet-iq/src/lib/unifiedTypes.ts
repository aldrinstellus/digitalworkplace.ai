/**
 * Unified Type Definitions for dIQ Full Ecosystem Integration
 *
 * This file defines common types that bridge the main dIQ platform data
 * (mockData.ts) with the Apps Bar integrations (mockAppsData.ts).
 */

// =============================================================================
// DATA SOURCE IDENTIFIERS
// =============================================================================

export type DataSource =
  | 'diq'           // Main dIQ platform
  | 'slack'         // Slack messages & channels
  | 'jira'          // Jira tickets
  | 'github'        // GitHub PRs & issues
  | 'drive'         // Google Drive files
  | 'zoom'          // Zoom meetings
  | 'confluence'    // Confluence pages
  | 'salesforce'    // Salesforce opportunities
  | 'figma'         // Figma projects
  | 'notion'        // Notion pages
  | 'linkedin'      // LinkedIn notifications
  | 'auzmor-office'; // Auzmor Office social intranet

export type ContentType =
  | 'article'           // dIQ knowledge base article
  | 'news'              // dIQ news post
  | 'event'             // dIQ event
  | 'person'            // dIQ employee
  | 'channel'           // dIQ channel
  | 'workflow'          // dIQ workflow
  | 'slack_message'     // Slack message
  | 'slack_channel'     // Slack channel
  | 'jira_ticket'       // Jira ticket
  | 'github_pr'         // GitHub pull request
  | 'github_issue'      // GitHub issue
  | 'drive_file'        // Google Drive file
  | 'zoom_meeting'      // Zoom meeting
  | 'confluence_page'   // Confluence page
  | 'salesforce_opp'    // Salesforce opportunity
  | 'figma_project'     // Figma project
  | 'notion_page'       // Notion page
  | 'linkedin_notif'    // LinkedIn notification
  | 'auzmor_office_post'; // Auzmor Office post

// =============================================================================
// UNIFIED SEARCH ITEM
// =============================================================================

export interface UnifiedSearchItem {
  id: string;
  type: ContentType;
  source: DataSource;
  title: string;
  description: string;
  content?: string;           // Full searchable content
  excerpt?: string;           // Short preview
  url: string;                // Internal or external URL
  createdAt: string;
  updatedAt: string;
  author?: {
    id?: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  tags?: string[];
  metadata?: Record<string, unknown>;  // Source-specific metadata
  relevanceScore?: number;             // For search results
  highlights?: string[];               // Search term highlights
}

// =============================================================================
// UNIFIED TASK
// =============================================================================

export type TaskPriority = 'lowest' | 'low' | 'medium' | 'high' | 'highest' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked' | 'cancelled';

export interface UnifiedTask {
  id: string;
  source: DataSource;
  sourceId: string;           // Original ID from source system
  sourceKey?: string;         // e.g., "DIQ-1234" for Jira, "#2847" for GitHub
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: {
    id?: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  reporter?: {
    id?: string;
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  labels?: string[];
  url: string;
  // Source-specific metadata
  metadata?: {
    // Jira-specific
    project?: string;
    sprint?: string;
    storyPoints?: number;
    type?: 'bug' | 'story' | 'task' | 'epic' | 'subtask';
    // GitHub-specific
    prNumber?: number;
    branch?: { from: string; to: string };
    commits?: number;
    additions?: number;
    deletions?: number;
    changedFiles?: number;
    reviewers?: Array<{ name: string; avatar: string; status: 'approved' | 'changes-requested' | 'pending' }>;
    checks?: Array<{ name: string; status: 'passed' | 'failed' | 'pending' }>;
    // dIQ-specific
    subtasks?: Array<{ id: string; title: string; completed: boolean }>;
  };
  comments?: Array<{
    user: string;
    content: string;
    timestamp: string;
    isReview?: boolean;
  }>;
}

// =============================================================================
// UNIFIED EVENT
// =============================================================================

export type EventType = 'meeting' | 'event' | 'workshop' | 'training' | 'offsite' | 'allhands' | 'social';
export type EventStatus = 'upcoming' | 'live' | 'ended' | 'cancelled';
export type LocationType = 'in_person' | 'virtual' | 'hybrid';

export interface UnifiedEvent {
  id: string;
  source: DataSource;
  sourceId: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  locationType: LocationType;
  location?: string;
  meetingUrl?: string;
  startTime: string;
  endTime?: string;
  duration?: string;          // Human-readable duration (e.g., "1 hour")
  allDay?: boolean;
  host?: {
    id?: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  participants?: Array<{
    id?: string;
    name: string;
    avatar?: string;
    status?: 'joined' | 'invited' | 'declined' | 'tentative';
  }>;
  maxAttendees?: number;
  currentAttendees?: number;
  tags?: string[];
  url: string;
  // Source-specific metadata
  metadata?: {
    // Zoom-specific
    recording?: { url: string; duration: string };
    notes?: string;
    // dIQ-specific
    organizer_role?: string;
    department_name?: string;
    visibility?: 'all' | 'department' | 'private';
  };
}

// =============================================================================
// UNIFIED ACTIVITY
// =============================================================================

export type ActivityType =
  | 'news'
  | 'event'
  | 'article'
  | 'channel'
  | 'recognition'
  | 'announcement'
  | 'message'
  | 'ticket_created'
  | 'ticket_updated'
  | 'ticket_closed'
  | 'pr_opened'
  | 'pr_merged'
  | 'pr_reviewed'
  | 'file_shared'
  | 'file_updated'
  | 'meeting_started'
  | 'meeting_ended'
  | 'page_updated'
  | 'deal_closed'
  | 'design_updated'
  | 'mention';

export interface UnifiedActivity {
  id: string;
  source: DataSource;
  type: ActivityType;
  title: string;
  description: string;
  actor: {
    id?: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  target?: {
    id: string;
    type: ContentType;
    title: string;
    url: string;
  };
  createdAt: string;
  isUnread?: boolean;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// UNIFIED EMPLOYEE (with app presence)
// =============================================================================

export interface UnifiedEmployee {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  jobTitle: string;
  department: {
    id: string;
    name: string;
  };
  location?: string;
  timezone?: string;
  hireDate?: string;
  bio?: string;
  skills?: string[];
  manager?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: 'online' | 'away' | 'busy' | 'offline' | 'dnd';

  // App presence across integrations
  appPresence?: {
    slack?: {
      userId?: string;
      status: 'online' | 'away' | 'dnd' | 'offline';
      statusText?: string;
      lastActive?: string;
    };
    jira?: {
      userId?: string;
      assignedTickets: number;
      inProgressTickets: number;
    };
    github?: {
      username?: string;
      openPRs: number;
      pendingReviews: number;
    };
    zoom?: {
      currentMeeting?: string;
      inMeeting: boolean;
    };
    salesforce?: {
      openOpportunities: number;
      pipelineValue: number;
    };
  };
}

// =============================================================================
// APP SUMMARY DATA (for dashboard widgets)
// =============================================================================

export interface AppSummary {
  id: DataSource;
  name: string;
  icon: string;
  color: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  unreadCount: number;
  quickStats: Array<{ label: string; value: string | number }>;
}

// =============================================================================
// UNIFIED NOTIFICATION
// =============================================================================

export interface UnifiedNotification {
  id: string;
  source: DataSource;
  type: 'mention' | 'message' | 'assignment' | 'review_request' | 'comment' | 'share' | 'reminder' | 'system';
  title: string;
  body: string;
  actor?: {
    name: string;
    avatar?: string;
  };
  target?: {
    id: string;
    type: ContentType;
    title: string;
    url: string;
  };
  createdAt: string;
  isRead: boolean;
  url?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

// =============================================================================
// AGGREGATED DATA STRUCTURES
// =============================================================================

export interface UnifiedSearchResults {
  query: string;
  totalResults: number;
  results: UnifiedSearchItem[];
  facets?: {
    sources: Array<{ source: DataSource; count: number }>;
    types: Array<{ type: ContentType; count: number }>;
  };
  searchMethod?: 'semantic' | 'keyword' | 'hybrid';
  aiSummary?: string;
}

export interface UnifiedTaskList {
  tasks: UnifiedTask[];
  stats: {
    total: number;
    byStatus: Record<TaskStatus, number>;
    bySource: Record<DataSource, number>;
    overdue: number;
    dueToday: number;
    dueThisWeek: number;
  };
}

export interface UnifiedEventList {
  events: UnifiedEvent[];
  stats: {
    total: number;
    today: number;
    upcoming: number;
    live: number;
    bySource: Record<DataSource, number>;
  };
}

export interface UnifiedActivityFeed {
  activities: UnifiedActivity[];
  hasMore: boolean;
  nextCursor?: string;
  unreadCount: number;
}

export interface AggregatedAppData {
  slack: {
    unreadCount: number;
    channels: number;
    directMessages: number;
    mentions: number;
  };
  jira: {
    assigned: number;
    inProgress: number;
    toReview: number;
    blocked: number;
  };
  github: {
    openPRs: number;
    pendingReviews: number;
    issues: number;
  };
  drive: {
    recent: number;
    shared: number;
    starred: number;
  };
  zoom: {
    today: number;
    upcoming: number;
    recordings: number;
    inMeeting: boolean;
  };
  confluence: {
    updated: number;
    watching: number;
    drafts: number;
  };
  salesforce: {
    pipeline: number;
    deals: number;
    tasks: number;
  };
  figma: {
    projects: number;
    comments: number;
    updates: number;
  };
  notion: {
    pages: number;
    databases: number;
    shared: number;
  };
  linkedin: {
    messages: number;
    notifications: number;
    connections: number;
  };
  'auzmor-office': {
    posts: number;
    channels: number;
    users: number;
    unreadCount: number;
  };
}

// =============================================================================
// HELPER TYPE GUARDS
// =============================================================================

export function isSlackSource(item: UnifiedSearchItem): boolean {
  return item.source === 'slack';
}

export function isJiraSource(item: UnifiedSearchItem): boolean {
  return item.source === 'jira';
}

export function isGitHubSource(item: UnifiedSearchItem): boolean {
  return item.source === 'github';
}

export function isDiqSource(item: UnifiedSearchItem): boolean {
  return item.source === 'diq';
}

export function isTaskType(item: UnifiedSearchItem): item is UnifiedSearchItem & { type: 'jira_ticket' | 'github_pr' } {
  return item.type === 'jira_ticket' || item.type === 'github_pr';
}

export function isEventType(item: UnifiedSearchItem): item is UnifiedSearchItem & { type: 'event' | 'zoom_meeting' } {
  return item.type === 'event' || item.type === 'zoom_meeting';
}

// =============================================================================
// SOURCE DISPLAY METADATA
// =============================================================================

export const SOURCE_DISPLAY: Record<DataSource, { name: string; icon: string; color: string }> = {
  diq: { name: 'dIQ', icon: '📊', color: '#10b981' },
  slack: { name: 'Slack', icon: '💬', color: '#4A154B' },
  jira: { name: 'Jira', icon: '🎯', color: '#0052CC' },
  github: { name: 'GitHub', icon: '🐙', color: '#24292e' },
  drive: { name: 'Google Drive', icon: '📁', color: '#4285F4' },
  zoom: { name: 'Zoom', icon: '🎥', color: '#2D8CFF' },
  confluence: { name: 'Confluence', icon: '📝', color: '#172B4D' },
  salesforce: { name: 'Salesforce', icon: '☁️', color: '#00A1E0' },
  figma: { name: 'Figma', icon: '🎨', color: '#F24E1E' },
  notion: { name: 'Notion', icon: '📓', color: '#000000' },
  linkedin: { name: 'LinkedIn', icon: '💼', color: '#0077B5' },
  'auzmor-office': { name: 'Auzmor Office', icon: '🏢', color: '#10b981' },
};

export const CONTENT_TYPE_DISPLAY: Record<ContentType, { name: string; icon: string }> = {
  article: { name: 'Article', icon: '📄' },
  news: { name: 'News', icon: '📰' },
  event: { name: 'Event', icon: '📅' },
  person: { name: 'Person', icon: '👤' },
  channel: { name: 'Channel', icon: '#️⃣' },
  workflow: { name: 'Workflow', icon: '⚡' },
  slack_message: { name: 'Slack Message', icon: '💬' },
  slack_channel: { name: 'Slack Channel', icon: '#️⃣' },
  jira_ticket: { name: 'Jira Ticket', icon: '🎫' },
  github_pr: { name: 'Pull Request', icon: '🔀' },
  github_issue: { name: 'Issue', icon: '🐛' },
  drive_file: { name: 'File', icon: '📁' },
  zoom_meeting: { name: 'Meeting', icon: '🎥' },
  confluence_page: { name: 'Confluence Page', icon: '📝' },
  salesforce_opp: { name: 'Opportunity', icon: '💰' },
  figma_project: { name: 'Figma Project', icon: '🎨' },
  notion_page: { name: 'Notion Page', icon: '📓' },
  linkedin_notif: { name: 'LinkedIn', icon: '💼' },
  auzmor_office_post: { name: 'Auzmor Office Post', icon: '🏢' },
};
