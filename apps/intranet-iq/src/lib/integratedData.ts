/**
 * Integrated Data Aggregator
 *
 * Central hub that aggregates data from all sources (dIQ platform + Apps Bar)
 * into unified types for search, dashboard, and chat integrations.
 */

import {
  mockNewsPosts,
  mockEvents,
  mockArticles,
  mockEmployees,
  mockChannels,
  mockRecentActivity,
} from './mockData';

import {
  mockSlackMessages,
  mockSlackChannels,
  mockJiraTickets,
  mockGitHubPRs,
  mockDriveFiles,
  mockZoomMeetings,
  mockConfluencePages,
  mockSalesforceOpportunities,
  mockFigmaProjects,
  mockNotionPages,
  mockLinkedInNotifications,
  mockAppIntegrations,
} from './mockAppsData';

import type {
  UnifiedSearchItem,
  UnifiedTask,
  UnifiedEvent,
  UnifiedActivity,
  UnifiedEmployee,
  UnifiedTaskList,
  UnifiedEventList,
  UnifiedActivityFeed,
  AggregatedAppData,
  AppSummary,
  DataSource,
  ContentType,
} from './unifiedTypes';

import {
  transformAllSlackMessagesToSearchItems,
  transformAllSlackChannelsToSearchItems,
  transformSlackMessageToActivity,
} from './dataTransformers/slackTransformer';

import {
  transformAllJiraTicketsToSearchItems,
  transformAllJiraTicketsToTasks,
  transformJiraTicketToActivity,
  getOpenJiraTasksForUser,
} from './dataTransformers/jiraTransformer';

import {
  transformAllGitHubPRsToSearchItems,
  transformAllGitHubPRsToTasks,
  transformGitHubPRToActivity,
  getPRsPendingReviewForUser,
  getOpenPRsForUser,
} from './dataTransformers/githubTransformer';

import {
  transformAllDriveFilesToSearchItems,
  transformDriveFileToActivity,
} from './dataTransformers/driveTransformer';

import {
  transformAllZoomMeetingsToSearchItems,
  transformAllZoomMeetingsToEvents,
  transformZoomMeetingToActivity,
  getUpcomingZoomMeetingsForUser,
  getLiveZoomMeetingsForUser,
} from './dataTransformers/zoomTransformer';

import {
  transformAllConfluencePagesToSearchItems,
  transformConfluencePageToActivity,
} from './dataTransformers/confluenceTransformer';

import {
  transformAllSalesforceOppsToSearchItems,
  transformSalesforceOppToActivity,
} from './dataTransformers/salesforceTransformer';

import {
  transformAllFigmaProjectsToSearchItems,
  transformFigmaProjectToActivity,
} from './dataTransformers/figmaTransformer';

import {
  transformAllNotionPagesToSearchItems,
  transformNotionPageToActivity,
} from './dataTransformers/notionTransformer';

import {
  transformAllLinkedInNotificationsToSearchItems,
  transformLinkedInNotificationToActivity,
} from './dataTransformers/linkedinTransformer';

import {
  transformAllNewsPostsToSearchItems,
  transformAllEventsToSearchItems,
  transformAllEventsToUnifiedEvents,
  transformAllArticlesToSearchItems,
  transformAllEmployeesToSearchItems,
  transformNewsPostToActivity,
  transformEventToActivity,
} from './dataTransformers/diqTransformer';

import { getAppPresenceForEmployee } from './crossReferences';

// =============================================================================
// SEARCH AGGREGATION
// =============================================================================

/**
 * Get all searchable items from all sources
 */
export function getAllSearchableItems(): UnifiedSearchItem[] {
  const items: UnifiedSearchItem[] = [];

  // dIQ platform data
  items.push(...transformAllNewsPostsToSearchItems(mockNewsPosts));
  items.push(...transformAllEventsToSearchItems(mockEvents));
  items.push(...transformAllArticlesToSearchItems(mockArticles));
  items.push(...transformAllEmployeesToSearchItems(mockEmployees));

  // App integrations
  items.push(...transformAllSlackMessagesToSearchItems(mockSlackMessages));
  items.push(...transformAllSlackChannelsToSearchItems(mockSlackChannels));
  items.push(...transformAllJiraTicketsToSearchItems(mockJiraTickets));
  items.push(...transformAllGitHubPRsToSearchItems(mockGitHubPRs));
  items.push(...transformAllDriveFilesToSearchItems(mockDriveFiles));
  items.push(...transformAllZoomMeetingsToSearchItems(mockZoomMeetings));
  items.push(...transformAllConfluencePagesToSearchItems(mockConfluencePages));
  items.push(...transformAllSalesforceOppsToSearchItems(mockSalesforceOpportunities));
  items.push(...transformAllFigmaProjectsToSearchItems(mockFigmaProjects));
  items.push(...transformAllNotionPagesToSearchItems(mockNotionPages));
  items.push(...transformAllLinkedInNotificationsToSearchItems(mockLinkedInNotifications));

  return items;
}

/**
 * Search across all sources with optional filtering
 */
export function searchAllSources(
  query: string,
  options?: {
    sources?: DataSource[];
    types?: ContentType[];
    limit?: number;
  }
): UnifiedSearchItem[] {
  let items = getAllSearchableItems();

  // Filter by sources
  if (options?.sources?.length) {
    items = items.filter(item => options.sources!.includes(item.source));
  }

  // Filter by types
  if (options?.types?.length) {
    items = items.filter(item => options.types!.includes(item.type));
  }

  // Simple text search (in production, use vector search)
  const queryLower = query.toLowerCase();
  items = items.filter(item => {
    const searchText = `${item.title} ${item.description} ${item.content || ''} ${item.tags?.join(' ') || ''}`.toLowerCase();
    return searchText.includes(queryLower);
  });

  // Sort by relevance (simple: title match > description match > content match)
  items.sort((a, b) => {
    const aTitle = a.title.toLowerCase().includes(queryLower) ? 3 : 0;
    const bTitle = b.title.toLowerCase().includes(queryLower) ? 3 : 0;
    const aDesc = a.description.toLowerCase().includes(queryLower) ? 2 : 0;
    const bDesc = b.description.toLowerCase().includes(queryLower) ? 2 : 0;
    const aContent = (a.content || '').toLowerCase().includes(queryLower) ? 1 : 0;
    const bContent = (b.content || '').toLowerCase().includes(queryLower) ? 1 : 0;

    return (bTitle + bDesc + bContent) - (aTitle + aDesc + aContent);
  });

  // Apply limit
  if (options?.limit) {
    items = items.slice(0, options.limit);
  }

  return items;
}

/**
 * Get search facets (counts by source and type)
 */
export function getSearchFacets(): {
  sources: Array<{ source: DataSource; count: number }>;
  types: Array<{ type: ContentType; count: number }>;
} {
  const items = getAllSearchableItems();

  const sourceCounts = new Map<DataSource, number>();
  const typeCounts = new Map<ContentType, number>();

  for (const item of items) {
    sourceCounts.set(item.source, (sourceCounts.get(item.source) || 0) + 1);
    typeCounts.set(item.type, (typeCounts.get(item.type) || 0) + 1);
  }

  return {
    sources: Array.from(sourceCounts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
    types: Array.from(typeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
  };
}

// =============================================================================
// TASK AGGREGATION
// =============================================================================

/**
 * Get all tasks from all sources
 */
export function getAllTasks(): UnifiedTaskList {
  const tasks: UnifiedTask[] = [];

  // Jira tickets as tasks
  tasks.push(...transformAllJiraTicketsToTasks(mockJiraTickets));

  // GitHub PRs as tasks
  tasks.push(...transformAllGitHubPRsToTasks(mockGitHubPRs));

  // Calculate stats
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const stats = {
    total: tasks.length,
    byStatus: {
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      in_review: tasks.filter(t => t.status === 'in_review').length,
      done: tasks.filter(t => t.status === 'done').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
    },
    bySource: {
      diq: tasks.filter(t => t.source === 'diq').length,
      jira: tasks.filter(t => t.source === 'jira').length,
      github: tasks.filter(t => t.source === 'github').length,
      slack: 0,
      drive: 0,
      zoom: 0,
      confluence: 0,
      salesforce: 0,
      figma: 0,
      notion: 0,
      linkedin: 0,
    },
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length,
    dueToday: tasks.filter(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due >= today && due < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }).length,
    dueThisWeek: tasks.filter(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due >= today && due < weekEnd;
    }).length,
  };

  return { tasks, stats };
}

/**
 * Get tasks for a specific user
 */
export function getTasksForUser(userName: string): UnifiedTaskList {
  const allTasks = getAllTasks();

  const userTasks = allTasks.tasks.filter(t =>
    t.assignee?.name === userName
  );

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return {
    tasks: userTasks,
    stats: {
      total: userTasks.length,
      byStatus: {
        todo: userTasks.filter(t => t.status === 'todo').length,
        in_progress: userTasks.filter(t => t.status === 'in_progress').length,
        in_review: userTasks.filter(t => t.status === 'in_review').length,
        done: userTasks.filter(t => t.status === 'done').length,
        blocked: userTasks.filter(t => t.status === 'blocked').length,
        cancelled: userTasks.filter(t => t.status === 'cancelled').length,
      },
      bySource: {
        diq: userTasks.filter(t => t.source === 'diq').length,
        jira: userTasks.filter(t => t.source === 'jira').length,
        github: userTasks.filter(t => t.source === 'github').length,
        slack: 0,
        drive: 0,
        zoom: 0,
        confluence: 0,
        salesforce: 0,
        figma: 0,
        notion: 0,
        linkedin: 0,
      },
      overdue: userTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length,
      dueToday: userTasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        return due >= today && due < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      }).length,
      dueThisWeek: userTasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        return due >= today && due < weekEnd;
      }).length,
    },
  };
}

// =============================================================================
// EVENT AGGREGATION
// =============================================================================

/**
 * Get all events from all sources
 */
export function getAllEvents(): UnifiedEventList {
  const events: UnifiedEvent[] = [];

  // dIQ events
  events.push(...transformAllEventsToUnifiedEvents(mockEvents));

  // Zoom meetings
  events.push(...transformAllZoomMeetingsToEvents(mockZoomMeetings));

  // Sort by start time
  events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const stats = {
    total: events.length,
    today: events.filter(e => {
      const start = new Date(e.startTime);
      return start >= today && start < tomorrow;
    }).length,
    upcoming: events.filter(e => e.status === 'upcoming').length,
    live: events.filter(e => e.status === 'live').length,
    bySource: {
      diq: events.filter(e => e.source === 'diq').length,
      zoom: events.filter(e => e.source === 'zoom').length,
      slack: 0,
      jira: 0,
      github: 0,
      drive: 0,
      confluence: 0,
      salesforce: 0,
      figma: 0,
      notion: 0,
      linkedin: 0,
    },
  };

  return { events, stats };
}

/**
 * Get events for a specific user
 */
export function getEventsForUser(userName: string): UnifiedEventList {
  const allEvents = getAllEvents();

  const userEvents = allEvents.events.filter(e =>
    e.host?.name === userName ||
    e.participants?.some(p => p.name === userName)
  );

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    events: userEvents,
    stats: {
      total: userEvents.length,
      today: userEvents.filter(e => {
        const start = new Date(e.startTime);
        return start >= today && start < tomorrow;
      }).length,
      upcoming: userEvents.filter(e => e.status === 'upcoming').length,
      live: userEvents.filter(e => e.status === 'live').length,
      bySource: {
        diq: userEvents.filter(e => e.source === 'diq').length,
        zoom: userEvents.filter(e => e.source === 'zoom').length,
        slack: 0,
        jira: 0,
        github: 0,
        drive: 0,
        confluence: 0,
        salesforce: 0,
        figma: 0,
        notion: 0,
        linkedin: 0,
      },
    },
  };
}

// =============================================================================
// ACTIVITY AGGREGATION
// =============================================================================

/**
 * Get unified activity feed from all sources
 */
export function getAllActivity(limit: number = 50): UnifiedActivityFeed {
  const activities: UnifiedActivity[] = [];

  // dIQ native activities
  for (const post of mockNewsPosts.slice(0, 5)) {
    activities.push(transformNewsPostToActivity(post));
  }

  for (const event of mockEvents.slice(0, 3)) {
    activities.push(transformEventToActivity(event));
  }

  // Slack messages
  for (const message of mockSlackMessages.slice(0, 5)) {
    activities.push(transformSlackMessageToActivity(message));
  }

  // Jira tickets
  for (const ticket of mockJiraTickets.slice(0, 3)) {
    activities.push(transformJiraTicketToActivity(ticket));
  }

  // GitHub PRs
  for (const pr of mockGitHubPRs) {
    if (pr.status === 'merged') {
      activities.push(transformGitHubPRToActivity(pr, 'pr_merged'));
    } else if (pr.status === 'open') {
      activities.push(transformGitHubPRToActivity(pr, 'pr_opened'));
    }
  }

  // Drive files
  for (const file of mockDriveFiles.slice(0, 3)) {
    activities.push(transformDriveFileToActivity(file));
  }

  // Zoom meetings
  for (const meeting of mockZoomMeetings.filter(m => m.status !== 'upcoming')) {
    const activityType = meeting.status === 'live' ? 'meeting_started' : 'meeting_ended';
    activities.push(transformZoomMeetingToActivity(meeting, activityType));
  }

  // Confluence pages
  for (const page of mockConfluencePages.slice(0, 2)) {
    activities.push(transformConfluencePageToActivity(page));
  }

  // Salesforce (only closed deals for activity)
  for (const opp of mockSalesforceOpportunities.filter(o => o.stage === 'closed-won')) {
    activities.push(transformSalesforceOppToActivity(opp));
  }

  // Figma projects
  for (const project of mockFigmaProjects.slice(0, 2)) {
    activities.push(transformFigmaProjectToActivity(project));
  }

  // Sort by date (most recent first)
  activities.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Apply limit
  const limitedActivities = activities.slice(0, limit);

  return {
    activities: limitedActivities,
    hasMore: activities.length > limit,
    unreadCount: activities.filter(a => a.isUnread).length,
  };
}

// =============================================================================
// APP DATA AGGREGATION
// =============================================================================

/**
 * Get aggregated stats from all apps
 */
export function getAggregatedAppData(): AggregatedAppData {
  return {
    slack: {
      unreadCount: mockSlackChannels.reduce((sum, ch) => sum + ch.unreadCount, 0),
      channels: mockSlackChannels.length,
      directMessages: 5, // Mock value
      mentions: 3, // Mock value
    },
    jira: {
      assigned: mockJiraTickets.length,
      inProgress: mockJiraTickets.filter(t => t.status === 'in-progress').length,
      toReview: mockJiraTickets.filter(t => t.status === 'in-review').length,
      blocked: mockJiraTickets.filter(t => t.status === 'blocked').length,
    },
    github: {
      openPRs: mockGitHubPRs.filter(pr => pr.status === 'open').length,
      pendingReviews: mockGitHubPRs.filter(pr =>
        pr.reviewers.some(r => r.status === 'pending')
      ).length,
      issues: 7, // Mock value
    },
    drive: {
      recent: mockDriveFiles.length,
      shared: mockDriveFiles.filter(f => f.sharedWith.length > 0).length,
      starred: mockDriveFiles.filter(f => f.starred).length,
    },
    zoom: {
      today: mockZoomMeetings.filter(m =>
        m.startTime.includes('Today')
      ).length,
      upcoming: mockZoomMeetings.filter(m => m.status === 'upcoming').length,
      recordings: mockZoomMeetings.filter(m => m.recording).length,
      inMeeting: mockZoomMeetings.some(m => m.status === 'live'),
    },
    confluence: {
      updated: mockConfluencePages.length,
      watching: 15, // Mock value
      drafts: 3, // Mock value
    },
    salesforce: {
      pipeline: mockSalesforceOpportunities
        .filter(o => !o.stage.includes('closed'))
        .reduce((sum, o) => sum + o.amount, 0),
      deals: mockSalesforceOpportunities.filter(o => !o.stage.includes('closed')).length,
      tasks: 6, // Mock value
    },
    figma: {
      projects: mockFigmaProjects.length,
      comments: mockFigmaProjects.reduce((sum, p) => sum + p.comments, 0),
      updates: mockFigmaProjects.filter(p => p.status === 'in-progress').length,
    },
    notion: {
      pages: mockNotionPages.length,
      databases: mockNotionPages.filter(p => p.type === 'database').length,
      shared: mockNotionPages.filter(p => p.shared).length,
    },
    linkedin: {
      messages: mockLinkedInNotifications.filter(n => n.type === 'message').length,
      notifications: mockLinkedInNotifications.filter(n => !n.read).length,
      connections: 847, // Mock value
    },
  };
}

/**
 * Get app summaries for dashboard widgets
 */
export function getAppSummaries(): AppSummary[] {
  return mockAppIntegrations.map(app => ({
    id: app.id as DataSource,
    name: app.name,
    icon: app.icon,
    color: app.color,
    status: app.status,
    lastSync: app.lastSync,
    unreadCount: app.unreadCount,
    quickStats: app.quickStats,
  }));
}

// =============================================================================
// EMPLOYEE DATA AGGREGATION
// =============================================================================

/**
 * Get all employees with their app presence data
 */
export function getAllEmployeesWithAppData(): UnifiedEmployee[] {
  return mockEmployees.map(emp => ({
    id: emp.id,
    userId: emp.user_id,
    fullName: emp.full_name,
    email: emp.email,
    phone: emp.phone,
    avatar: emp.avatar,
    jobTitle: emp.job_title,
    department: {
      id: emp.department_id,
      name: emp.department_name,
    },
    location: emp.location,
    timezone: emp.timezone,
    hireDate: emp.hire_date,
    bio: emp.bio,
    skills: emp.skills,
    manager: emp.manager_id && emp.manager_name ? {
      id: emp.manager_id,
      name: emp.manager_name,
    } : undefined,
    status: emp.status,
    appPresence: getAppPresenceForEmployee(emp.id),
  }));
}

/**
 * Get a single employee with full app presence data
 */
export function getEmployeeWithAppData(employeeId: string): UnifiedEmployee | undefined {
  const employee = mockEmployees.find(e => e.id === employeeId);
  if (!employee) return undefined;

  return {
    id: employee.id,
    userId: employee.user_id,
    fullName: employee.full_name,
    email: employee.email,
    phone: employee.phone,
    avatar: employee.avatar,
    jobTitle: employee.job_title,
    department: {
      id: employee.department_id,
      name: employee.department_name,
    },
    location: employee.location,
    timezone: employee.timezone,
    hireDate: employee.hire_date,
    bio: employee.bio,
    skills: employee.skills,
    manager: employee.manager_id && employee.manager_name ? {
      id: employee.manager_id,
      name: employee.manager_name,
    } : undefined,
    status: employee.status,
    appPresence: getAppPresenceForEmployee(employee.id),
  };
}

// =============================================================================
// UNREAD COUNTS AGGREGATION
// =============================================================================

/**
 * Get total unread counts across all apps
 */
export function getTotalUnreadCounts(): {
  total: number;
  byApp: Record<string, number>;
} {
  const appData = getAggregatedAppData();

  const byApp: Record<string, number> = {
    slack: appData.slack.unreadCount,
    jira: appData.jira.toReview,
    github: appData.github.pendingReviews,
    drive: 0,
    zoom: appData.zoom.upcoming,
    confluence: 0,
    salesforce: 0,
    figma: 0,
    notion: 0,
    linkedin: appData.linkedin.notifications,
  };

  const total = Object.values(byApp).reduce((sum, count) => sum + count, 0);

  return { total, byApp };
}

// =============================================================================
// EXTERNAL DOCUMENTS AGGREGATION
// =============================================================================

/**
 * Represents an external document from connected apps
 */
export interface ExternalDocument {
  id: string;
  title: string;
  description?: string;
  source: DataSource;
  sourceLabel: string;
  type: ContentType;
  url?: string;
  updatedAt: string;
  createdAt?: string;
  author?: string;
  thumbnail?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Get all external documents from connected apps (Drive, Confluence, Notion, etc.)
 * Used by the Content Browser's External Sources tab
 */
export function getExternalDocuments(options?: {
  sources?: DataSource[];
  limit?: number;
  sortBy?: 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}): ExternalDocument[] {
  const documents: ExternalDocument[] = [];

  // Google Drive files
  const driveEnabled = !options?.sources || options.sources.includes('drive');
  if (driveEnabled) {
    mockDriveFiles.forEach(file => {
      documents.push({
        id: `drive-${file.id}`,
        title: file.name,
        description: `${file.type} • ${file.path}`,
        source: 'drive',
        sourceLabel: 'Google Drive',
        type: 'drive_file',
        url: `https://drive.google.com/file/${file.id}`,
        updatedAt: file.lastModified,
        author: file.owner.name,
        metadata: {
          fileType: file.type,
          size: file.size,
          starred: file.starred,
          sharedWith: file.sharedWith,
        },
      });
    });
  }

  // Confluence pages
  const confluenceEnabled = !options?.sources || options.sources.includes('confluence');
  if (confluenceEnabled) {
    mockConfluencePages.forEach(page => {
      documents.push({
        id: `confluence-${page.id}`,
        title: page.title,
        description: page.content.substring(0, 150) + '...',
        source: 'confluence',
        sourceLabel: 'Confluence',
        type: 'confluence_page',
        url: `https://confluence.company.com/wiki/spaces/${page.space}/pages/${page.id}`,
        updatedAt: page.lastUpdated,
        author: page.author.name,
        metadata: {
          space: page.space,
          labels: page.labels,
          views: page.views,
          likes: page.likes,
        },
      });
    });
  }

  // Notion pages
  const notionEnabled = !options?.sources || options.sources.includes('notion');
  if (notionEnabled) {
    mockNotionPages.forEach(page => {
      documents.push({
        id: `notion-${page.id}`,
        title: page.title,
        description: `${page.type} in ${page.workspace}`,
        source: 'notion',
        sourceLabel: 'Notion',
        type: 'notion_page',
        url: `https://notion.so/${page.id}`,
        updatedAt: page.lastEdited,
        author: page.lastEditedBy,
        thumbnail: page.icon,
        metadata: {
          type: page.type,
          workspace: page.workspace,
          shared: page.shared,
        },
      });
    });
  }

  // Figma projects (design documents)
  const figmaEnabled = !options?.sources || options.sources.includes('figma');
  if (figmaEnabled) {
    mockFigmaProjects.forEach(project => {
      documents.push({
        id: `figma-${project.id}`,
        title: project.name,
        description: `${project.status} • ${project.editors.length} editors`,
        source: 'figma',
        sourceLabel: 'Figma',
        type: 'figma_project',
        url: `https://figma.com/file/${project.id}`,
        updatedAt: project.lastModified,
        thumbnail: project.thumbnail,
        metadata: {
          status: project.status,
          editors: project.editors,
          viewers: project.viewers,
          comments: project.comments,
        },
      });
    });
  }

  // Sort documents
  const sortBy = options?.sortBy || 'date';
  const sortOrder = options?.sortOrder || 'desc';

  documents.sort((a, b) => {
    if (sortBy === 'title') {
      return sortOrder === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    // Sort by date
    const dateA = new Date(a.updatedAt).getTime();
    const dateB = new Date(b.updatedAt).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Apply limit
  if (options?.limit) {
    return documents.slice(0, options.limit);
  }

  return documents;
}

/**
 * Get external documents grouped by source
 */
export function getExternalDocumentsBySource(): Record<DataSource, ExternalDocument[]> {
  const allDocs = getExternalDocuments();
  const grouped: Partial<Record<DataSource, ExternalDocument[]>> = {};

  allDocs.forEach(doc => {
    if (!grouped[doc.source]) {
      grouped[doc.source] = [];
    }
    grouped[doc.source]!.push(doc);
  });

  return grouped as Record<DataSource, ExternalDocument[]>;
}

/**
 * Get counts of external documents by source
 */
export function getExternalDocumentCounts(): Record<string, number> {
  return {
    drive: mockDriveFiles.length,
    confluence: mockConfluencePages.length,
    notion: mockNotionPages.length,
    figma: mockFigmaProjects.length,
    total: mockDriveFiles.length + mockConfluencePages.length + mockNotionPages.length + mockFigmaProjects.length,
  };
}

// =============================================================================
// CONTEXT FOR AI CHAT
// =============================================================================

/**
 * Get context data for AI chat (RAG enhancement)
 * @param query - Search query
 * @param options - Optional filtering options
 * @param options.appFilter - Filter results to a specific app source ('all' for no filter)
 */
export function getContextForChat(query: string, options?: { appFilter?: DataSource | 'all' }): {
  relevantItems: UnifiedSearchItem[];
  appContext: AggregatedAppData;
  recentActivity: UnifiedActivity[];
} {
  // Determine sources to search based on appFilter
  const sources = options?.appFilter && options.appFilter !== 'all'
    ? [options.appFilter]
    : undefined;

  // Search for relevant items (filtered by app if specified)
  const relevantItems = searchAllSources(query, { limit: 10, sources });

  // Get current app state
  const appContext = getAggregatedAppData();

  // Get recent activity
  const recentActivity = getAllActivity(10).activities;

  return {
    relevantItems,
    appContext,
    recentActivity,
  };
}
