/**
 * LinkedIn Data Transformer
 *
 * Transforms LinkedIn notifications into unified dIQ types.
 */

import type { LinkedInNotification } from '../mockAppsData';
import type { UnifiedSearchItem, UnifiedActivity, UnifiedNotification } from '../unifiedTypes';

/**
 * Get notification type icon
 */
function getNotificationIcon(type: LinkedInNotification['type']): string {
  const icons: Record<LinkedInNotification['type'], string> = {
    'connection': '🤝',
    'message': '💬',
    'post': '📝',
    'job': '💼',
    'mention': '📣',
  };
  return icons[type] || '🔔';
}

/**
 * Transform a LinkedIn notification to a unified search item
 */
export function transformLinkedInNotificationToSearchItem(notif: LinkedInNotification): UnifiedSearchItem {
  return {
    id: `linkedin-${notif.id}`,
    type: 'linkedin_notif',
    source: 'linkedin',
    title: `${notif.from.name} ${notif.content}`,
    description: `${getNotificationIcon(notif.type)} ${notif.from.title} • ${notif.timestamp}`,
    content: `${notif.from.name} ${notif.content} ${notif.from.title}`,
    excerpt: notif.content,
    url: `/diq/integrations/linkedin/notifications/${notif.id}`,
    createdAt: notif.timestamp,
    updatedAt: notif.timestamp,
    author: {
      name: notif.from.name,
      avatar: notif.from.avatar,
    },
    tags: ['linkedin', notif.type],
    metadata: {
      type: notif.type,
      fromTitle: notif.from.title,
      read: notif.read,
    },
  };
}

/**
 * Transform a LinkedIn notification to activity
 */
export function transformLinkedInNotificationToActivity(notif: LinkedInNotification): UnifiedActivity {
  return {
    id: `linkedin-activity-${notif.id}`,
    source: 'linkedin',
    type: 'mention',
    title: `${notif.from.name} ${notif.content}`,
    description: `${getNotificationIcon(notif.type)} ${notif.from.title}`,
    actor: {
      name: notif.from.name,
      avatar: notif.from.avatar,
    },
    createdAt: notif.timestamp,
    isUnread: !notif.read,
    metadata: {
      type: notif.type,
      fromTitle: notif.from.title,
    },
  };
}

/**
 * Transform a LinkedIn notification to unified notification
 */
export function transformLinkedInToUnifiedNotification(notif: LinkedInNotification): UnifiedNotification {
  let notificationType: UnifiedNotification['type'];
  switch (notif.type) {
    case 'message':
      notificationType = 'message';
      break;
    case 'mention':
      notificationType = 'mention';
      break;
    case 'connection':
      notificationType = 'system';
      break;
    default:
      notificationType = 'system';
  }

  return {
    id: `linkedin-notif-${notif.id}`,
    source: 'linkedin',
    type: notificationType,
    title: `${getNotificationIcon(notif.type)} ${notif.from.name}`,
    body: notif.content,
    actor: {
      name: notif.from.name,
      avatar: notif.from.avatar,
    },
    createdAt: notif.timestamp,
    isRead: notif.read,
    url: `/diq/integrations/linkedin/notifications/${notif.id}`,
    priority: 'low',
  };
}

/**
 * Transform all LinkedIn notifications to search items
 */
export function transformAllLinkedInNotificationsToSearchItems(notifs: LinkedInNotification[]): UnifiedSearchItem[] {
  return notifs.map(transformLinkedInNotificationToSearchItem);
}

/**
 * Get unread LinkedIn notifications
 */
export function getUnreadLinkedInNotifications(notifs: LinkedInNotification[]): UnifiedNotification[] {
  return notifs
    .filter(n => !n.read)
    .map(transformLinkedInToUnifiedNotification);
}
