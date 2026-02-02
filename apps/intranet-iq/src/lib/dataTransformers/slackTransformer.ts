/**
 * Slack Data Transformer
 *
 * Transforms Slack messages and channels into unified dIQ types.
 */

import type { SlackMessage, SlackChannel } from '../mockAppsData';
import type { UnifiedSearchItem, UnifiedActivity, UnifiedNotification } from '../unifiedTypes';
import { findEmployeeByName } from '../crossReferences';

/**
 * Transform a Slack message to a unified search item
 */
export function transformSlackMessageToSearchItem(message: SlackMessage): UnifiedSearchItem {
  const employee = findEmployeeByName(message.user.name);

  return {
    id: `slack-msg-${message.id}`,
    type: 'slack_message',
    source: 'slack',
    title: `Message in #${message.channel}`,
    description: message.content.slice(0, 200) + (message.content.length > 200 ? '...' : ''),
    content: message.content,
    excerpt: message.content.slice(0, 100),
    url: `/diq/integrations/slack/channels/${message.channelId}?msg=${message.id}`,
    createdAt: message.timestamp,
    updatedAt: message.timestamp,
    author: {
      id: employee?.id,
      name: message.user.name,
      avatar: message.user.avatar,
      email: employee?.email,
    },
    tags: [message.channel, 'slack'],
    metadata: {
      channelId: message.channelId,
      channelName: message.channel,
      reactions: message.reactions,
      thread: message.thread,
      attachments: message.attachments,
      isEdited: message.isEdited,
      userStatus: message.user.status,
      userTitle: message.user.title,
    },
  };
}

/**
 * Transform a Slack channel to a unified search item
 */
export function transformSlackChannelToSearchItem(channel: SlackChannel): UnifiedSearchItem {
  return {
    id: `slack-ch-${channel.id}`,
    type: 'slack_channel',
    source: 'slack',
    title: `#${channel.name}`,
    description: channel.description,
    content: `${channel.description}\nLast message: ${channel.lastMessage}`,
    excerpt: channel.description,
    url: `/diq/integrations/slack/channels/${channel.id}`,
    createdAt: channel.lastMessageTime,
    updatedAt: channel.lastMessageTime,
    tags: ['slack', 'channel'],
    metadata: {
      memberCount: channel.memberCount,
      isPrivate: channel.isPrivate,
      unreadCount: channel.unreadCount,
      lastMessage: channel.lastMessage,
      lastMessageTime: channel.lastMessageTime,
    },
  };
}

/**
 * Transform a Slack message to a unified activity item
 */
export function transformSlackMessageToActivity(message: SlackMessage): UnifiedActivity {
  const employee = findEmployeeByName(message.user.name);

  // Determine activity type based on message content
  let activityType: UnifiedActivity['type'] = 'message';
  if (message.thread && message.thread.replyCount > 0) {
    activityType = 'message';
  }

  return {
    id: `slack-activity-${message.id}`,
    source: 'slack',
    type: activityType,
    title: `New message in #${message.channel}`,
    description: message.content.slice(0, 100) + (message.content.length > 100 ? '...' : ''),
    actor: {
      id: employee?.id,
      name: message.user.name,
      avatar: message.user.avatar,
      email: employee?.email,
    },
    target: {
      id: message.channelId,
      type: 'slack_channel',
      title: `#${message.channel}`,
      url: `/diq/integrations/slack/channels/${message.channelId}`,
    },
    createdAt: message.timestamp,
    metadata: {
      reactions: message.reactions,
      thread: message.thread,
    },
  };
}

/**
 * Transform Slack mentions to notifications
 */
export function transformSlackMentionToNotification(
  message: SlackMessage,
  mentionedEmployeeId: string
): UnifiedNotification {
  const actor = findEmployeeByName(message.user.name);

  return {
    id: `slack-notif-${message.id}`,
    source: 'slack',
    type: 'mention',
    title: `${message.user.name} mentioned you`,
    body: message.content.slice(0, 150),
    actor: {
      name: message.user.name,
      avatar: message.user.avatar,
    },
    target: {
      id: message.id,
      type: 'slack_message',
      title: `Message in #${message.channel}`,
      url: `/diq/integrations/slack/channels/${message.channelId}?msg=${message.id}`,
    },
    createdAt: message.timestamp,
    isRead: false,
    url: `/diq/integrations/slack/channels/${message.channelId}?msg=${message.id}`,
    priority: 'normal',
  };
}

/**
 * Transform all Slack messages to search items
 */
export function transformAllSlackMessagesToSearchItems(messages: SlackMessage[]): UnifiedSearchItem[] {
  return messages.map(transformSlackMessageToSearchItem);
}

/**
 * Transform all Slack channels to search items
 */
export function transformAllSlackChannelsToSearchItems(channels: SlackChannel[]): UnifiedSearchItem[] {
  return channels.map(transformSlackChannelToSearchItem);
}
