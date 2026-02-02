/**
 * dIQ Data Transformer
 *
 * Transforms native dIQ platform data (news, events, articles, employees)
 * into unified types for consistency across the ecosystem.
 */

import type { MockNewsPost, MockEvent, MockArticle, MockEmployee } from '../mockData';
import type {
  UnifiedSearchItem,
  UnifiedEvent,
  UnifiedActivity,
  UnifiedEmployee,
  EventStatus,
  EventType,
  LocationType,
} from '../unifiedTypes';

// =============================================================================
// NEWS POST TRANSFORMERS
// =============================================================================

/**
 * Transform a dIQ news post to a unified search item
 */
export function transformNewsPostToSearchItem(post: MockNewsPost): UnifiedSearchItem {
  return {
    id: `diq-news-${post.id}`,
    type: 'news',
    source: 'diq',
    title: post.title,
    description: post.excerpt,
    content: post.content,
    excerpt: post.excerpt,
    url: `/diq/news/${post.id}`,
    createdAt: post.published_at,
    updatedAt: post.updated_at,
    author: {
      id: post.author_id,
      name: post.author_name,
      avatar: post.author_avatar,
    },
    tags: post.tags,
    metadata: {
      type: post.type,
      visibility: post.visibility,
      pinned: post.pinned,
      likesCount: post.likes_count,
      commentsCount: post.comments_count,
      viewsCount: post.views_count,
      departmentId: post.department_id,
      departmentName: post.department_name,
      authorRole: post.author_role,
      attachments: post.attachments,
    },
  };
}

/**
 * Transform a dIQ news post to activity
 */
export function transformNewsPostToActivity(post: MockNewsPost): UnifiedActivity {
  return {
    id: `diq-news-activity-${post.id}`,
    source: 'diq',
    type: post.type === 'announcement' ? 'announcement' : 'news',
    title: post.title,
    description: post.excerpt.slice(0, 100),
    actor: {
      id: post.author_id,
      name: post.author_name,
      avatar: post.author_avatar,
    },
    target: {
      id: post.id,
      type: 'news',
      title: post.title,
      url: `/diq/news/${post.id}`,
    },
    createdAt: post.published_at,
    metadata: {
      type: post.type,
      pinned: post.pinned,
      departmentName: post.department_name,
    },
  };
}

// =============================================================================
// EVENT TRANSFORMERS
// =============================================================================

/**
 * Map dIQ location type to unified location type
 */
function mapLocationType(locationType: MockEvent['location_type']): LocationType {
  return locationType;
}

/**
 * Determine event type from tags and description
 */
function inferEventType(event: MockEvent): EventType {
  const tags = event.tags.map(t => t.toLowerCase());
  const title = event.title.toLowerCase();

  if (tags.includes('all-hands') || title.includes('all-hands')) return 'allhands';
  if (tags.includes('offsite') || title.includes('offsite')) return 'offsite';
  if (tags.includes('training') || tags.includes('onboarding')) return 'training';
  if (tags.includes('social') || tags.includes('trivia')) return 'social';
  if (tags.includes('wellness') || title.includes('wellness')) return 'workshop';
  if (tags.includes('tech talk') || tags.includes('demo')) return 'workshop';

  return 'meeting';
}

/**
 * Determine event status from dates
 */
function inferEventStatus(event: MockEvent): EventStatus {
  const now = new Date();
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'ended';
}

/**
 * Transform a dIQ event to a unified search item
 */
export function transformEventToSearchItem(event: MockEvent): UnifiedSearchItem {
  return {
    id: `diq-event-${event.id}`,
    type: 'event',
    source: 'diq',
    title: event.title,
    description: event.description,
    content: `${event.title} ${event.description} ${event.location}`,
    excerpt: `${event.location} • ${new Date(event.start_time).toLocaleDateString()}`,
    url: `/diq/events/${event.id}`,
    createdAt: event.start_time,
    updatedAt: event.start_time,
    author: {
      id: event.organizer_id,
      name: event.organizer_name,
      avatar: event.organizer_avatar,
    },
    tags: event.tags,
    metadata: {
      locationType: event.location_type,
      location: event.location,
      meetingUrl: event.meeting_url,
      startTime: event.start_time,
      endTime: event.end_time,
      allDay: event.all_day,
      visibility: event.visibility,
      maxAttendees: event.max_attendees,
      currentAttendees: event.current_attendees,
      organizerRole: event.organizer_role,
      departmentName: event.department_name,
    },
  };
}

/**
 * Transform a dIQ event to a unified event
 */
export function transformEventToUnifiedEvent(event: MockEvent): UnifiedEvent {
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  let duration: string;
  if (event.all_day) {
    duration = 'All day';
  } else if (durationHours > 0 && durationMins > 0) {
    duration = `${durationHours}h ${durationMins}m`;
  } else if (durationHours > 0) {
    duration = `${durationHours} hour${durationHours > 1 ? 's' : ''}`;
  } else {
    duration = `${durationMins} min`;
  }

  return {
    id: `diq-unified-event-${event.id}`,
    source: 'diq',
    sourceId: event.id,
    title: event.title,
    description: event.description,
    type: inferEventType(event),
    status: inferEventStatus(event),
    locationType: mapLocationType(event.location_type),
    location: event.location,
    meetingUrl: event.meeting_url || undefined,
    startTime: event.start_time,
    endTime: event.end_time,
    duration,
    allDay: event.all_day,
    host: {
      id: event.organizer_id,
      name: event.organizer_name,
      avatar: event.organizer_avatar,
    },
    maxAttendees: event.max_attendees || undefined,
    currentAttendees: event.current_attendees,
    tags: event.tags,
    url: `/diq/events/${event.id}`,
    metadata: {
      organizer_role: event.organizer_role,
      department_name: event.department_name,
      visibility: event.visibility as 'all' | 'department' | 'private' | undefined,
    },
  };
}

/**
 * Transform a dIQ event to activity
 */
export function transformEventToActivity(event: MockEvent): UnifiedActivity {
  return {
    id: `diq-event-activity-${event.id}`,
    source: 'diq',
    type: 'event',
    title: event.title,
    description: `${event.location} • ${new Date(event.start_time).toLocaleDateString()}`,
    actor: {
      id: event.organizer_id,
      name: event.organizer_name,
      avatar: event.organizer_avatar,
    },
    target: {
      id: event.id,
      type: 'event',
      title: event.title,
      url: `/diq/events/${event.id}`,
    },
    createdAt: event.start_time,
    metadata: {
      locationType: event.location_type,
      visibility: event.visibility,
    },
  };
}

// =============================================================================
// ARTICLE TRANSFORMERS
// =============================================================================

/**
 * Transform a dIQ article to a unified search item
 */
export function transformArticleToSearchItem(article: MockArticle): UnifiedSearchItem {
  return {
    id: `diq-article-${article.id}`,
    type: 'article',
    source: 'diq',
    title: article.title,
    description: article.excerpt,
    content: article.content,
    excerpt: article.excerpt,
    url: `/diq/content/${article.id}`,
    createdAt: article.published_at,
    updatedAt: article.updated_at,
    author: {
      id: article.author_id,
      name: article.author_name,
      avatar: article.author_avatar,
    },
    tags: article.tags,
    metadata: {
      slug: article.slug,
      summary: article.summary,
      categoryId: article.category_id,
      categoryName: article.category_name,
      status: article.status,
      viewCount: article.view_count,
      helpfulCount: article.helpful_count,
    },
  };
}

/**
 * Transform a dIQ article to activity
 */
export function transformArticleToActivity(article: MockArticle): UnifiedActivity {
  return {
    id: `diq-article-activity-${article.id}`,
    source: 'diq',
    type: 'article',
    title: `Updated: ${article.title}`,
    description: article.excerpt.slice(0, 100),
    actor: {
      id: article.author_id,
      name: article.author_name,
      avatar: article.author_avatar,
    },
    target: {
      id: article.id,
      type: 'article',
      title: article.title,
      url: `/diq/content/${article.id}`,
    },
    createdAt: article.updated_at,
    metadata: {
      categoryName: article.category_name,
      viewCount: article.view_count,
    },
  };
}

// =============================================================================
// EMPLOYEE TRANSFORMERS
// =============================================================================

/**
 * Transform a dIQ employee to a unified search item
 */
export function transformEmployeeToSearchItem(employee: MockEmployee): UnifiedSearchItem {
  return {
    id: `diq-person-${employee.id}`,
    type: 'person',
    source: 'diq',
    title: employee.full_name,
    description: `${employee.job_title} • ${employee.department_name}`,
    content: `${employee.full_name} ${employee.job_title} ${employee.department_name} ${employee.bio} ${employee.skills.join(' ')}`,
    excerpt: employee.job_title,
    url: `/diq/people/${employee.id}`,
    createdAt: employee.hire_date,
    updatedAt: employee.hire_date,
    author: {
      id: employee.id,
      name: employee.full_name,
      avatar: employee.avatar,
      email: employee.email,
    },
    tags: [...employee.skills, employee.department_name],
    metadata: {
      email: employee.email,
      phone: employee.phone,
      location: employee.location,
      timezone: employee.timezone,
      status: employee.status,
      managerId: employee.manager_id,
      managerName: employee.manager_name,
      departmentId: employee.department_id,
    },
  };
}

/**
 * Transform a dIQ employee to unified employee type
 */
export function transformEmployeeToUnifiedEmployee(employee: MockEmployee): UnifiedEmployee {
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
  };
}

// =============================================================================
// BATCH TRANSFORMERS
// =============================================================================

export function transformAllNewsPostsToSearchItems(posts: MockNewsPost[]): UnifiedSearchItem[] {
  return posts.map(transformNewsPostToSearchItem);
}

export function transformAllEventsToSearchItems(events: MockEvent[]): UnifiedSearchItem[] {
  return events.map(transformEventToSearchItem);
}

export function transformAllEventsToUnifiedEvents(events: MockEvent[]): UnifiedEvent[] {
  return events.map(transformEventToUnifiedEvent);
}

export function transformAllArticlesToSearchItems(articles: MockArticle[]): UnifiedSearchItem[] {
  return articles.map(transformArticleToSearchItem);
}

export function transformAllEmployeesToSearchItems(employees: MockEmployee[]): UnifiedSearchItem[] {
  return employees.map(transformEmployeeToSearchItem);
}
