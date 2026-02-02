/**
 * Jira Data Transformer
 *
 * Transforms Jira tickets into unified dIQ types.
 */

import type { JiraTicket } from '../mockAppsData';
import type { UnifiedSearchItem, UnifiedTask, UnifiedActivity, TaskStatus, TaskPriority } from '../unifiedTypes';
import { findEmployeeByName } from '../crossReferences';

/**
 * Map Jira status to unified task status
 */
function mapJiraStatus(status: JiraTicket['status']): TaskStatus {
  const statusMap: Record<JiraTicket['status'], TaskStatus> = {
    'todo': 'todo',
    'in-progress': 'in_progress',
    'in-review': 'in_review',
    'done': 'done',
    'blocked': 'blocked',
  };
  return statusMap[status] || 'todo';
}

/**
 * Map Jira priority to unified task priority
 */
function mapJiraPriority(priority: JiraTicket['priority']): TaskPriority {
  const priorityMap: Record<JiraTicket['priority'], TaskPriority> = {
    'highest': 'highest',
    'high': 'high',
    'medium': 'medium',
    'low': 'low',
    'lowest': 'lowest',
  };
  return priorityMap[priority] || 'medium';
}

/**
 * Transform a Jira ticket to a unified search item
 */
export function transformJiraTicketToSearchItem(ticket: JiraTicket): UnifiedSearchItem {
  const assignee = findEmployeeByName(ticket.assignee.name);

  return {
    id: `jira-${ticket.id}`,
    type: 'jira_ticket',
    source: 'jira',
    title: `${ticket.key}: ${ticket.summary}`,
    description: ticket.description.slice(0, 300) + (ticket.description.length > 300 ? '...' : ''),
    content: ticket.description,
    excerpt: ticket.summary,
    url: `/diq/integrations/jira/tickets/${ticket.key}`,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    author: {
      id: assignee?.id,
      name: ticket.assignee.name,
      avatar: ticket.assignee.avatar,
      email: assignee?.email,
    },
    tags: [...ticket.labels, ticket.type, ticket.status, 'jira'],
    metadata: {
      key: ticket.key,
      type: ticket.type,
      status: ticket.status,
      priority: ticket.priority,
      project: ticket.project,
      sprint: ticket.sprint,
      storyPoints: ticket.storyPoints,
      dueDate: ticket.dueDate,
      reporter: ticket.reporter,
      commentCount: ticket.comments.length,
    },
  };
}

/**
 * Transform a Jira ticket to a unified task
 */
export function transformJiraTicketToTask(ticket: JiraTicket): UnifiedTask {
  const assignee = findEmployeeByName(ticket.assignee.name);
  const reporter = findEmployeeByName(ticket.reporter.name);

  return {
    id: `jira-task-${ticket.id}`,
    source: 'jira',
    sourceId: ticket.id,
    sourceKey: ticket.key,
    title: ticket.summary,
    description: ticket.description,
    status: mapJiraStatus(ticket.status),
    priority: mapJiraPriority(ticket.priority),
    assignee: {
      id: assignee?.id,
      name: ticket.assignee.name,
      avatar: ticket.assignee.avatar,
      email: assignee?.email,
    },
    reporter: {
      id: reporter?.id,
      name: ticket.reporter.name,
      avatar: ticket.reporter.avatar,
    },
    dueDate: ticket.dueDate,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    labels: ticket.labels,
    url: `/diq/integrations/jira/tickets/${ticket.key}`,
    metadata: {
      project: ticket.project,
      sprint: ticket.sprint,
      storyPoints: ticket.storyPoints,
      type: ticket.type,
    },
    comments: ticket.comments,
  };
}

/**
 * Transform a Jira ticket update to a unified activity item
 */
export function transformJiraTicketToActivity(
  ticket: JiraTicket,
  activityType: 'ticket_created' | 'ticket_updated' | 'ticket_closed' = 'ticket_updated'
): UnifiedActivity {
  const actor = findEmployeeByName(ticket.assignee.name);

  let title: string;
  let description: string;

  switch (activityType) {
    case 'ticket_created':
      title = `Created ${ticket.key}: ${ticket.summary}`;
      description = `New ${ticket.type} created in ${ticket.project}`;
      break;
    case 'ticket_closed':
      title = `Closed ${ticket.key}: ${ticket.summary}`;
      description = `${ticket.type} marked as done`;
      break;
    default:
      title = `Updated ${ticket.key}: ${ticket.summary}`;
      description = `Status: ${ticket.status} | Priority: ${ticket.priority}`;
  }

  return {
    id: `jira-activity-${ticket.id}-${activityType}`,
    source: 'jira',
    type: activityType,
    title,
    description,
    actor: {
      id: actor?.id,
      name: ticket.assignee.name,
      avatar: ticket.assignee.avatar,
      email: actor?.email,
    },
    target: {
      id: ticket.id,
      type: 'jira_ticket',
      title: `${ticket.key}: ${ticket.summary}`,
      url: `/diq/integrations/jira/tickets/${ticket.key}`,
    },
    createdAt: ticket.updatedAt,
    metadata: {
      ticketKey: ticket.key,
      ticketType: ticket.type,
      status: ticket.status,
      priority: ticket.priority,
      project: ticket.project,
    },
  };
}

/**
 * Transform all Jira tickets to search items
 */
export function transformAllJiraTicketsToSearchItems(tickets: JiraTicket[]): UnifiedSearchItem[] {
  return tickets.map(transformJiraTicketToSearchItem);
}

/**
 * Transform all Jira tickets to unified tasks
 */
export function transformAllJiraTicketsToTasks(tickets: JiraTicket[]): UnifiedTask[] {
  return tickets.map(transformJiraTicketToTask);
}

/**
 * Get open Jira tasks for a specific user
 */
export function getOpenJiraTasksForUser(tickets: JiraTicket[], userName: string): UnifiedTask[] {
  return tickets
    .filter(t => t.assignee.name === userName && t.status !== 'done')
    .map(transformJiraTicketToTask);
}
