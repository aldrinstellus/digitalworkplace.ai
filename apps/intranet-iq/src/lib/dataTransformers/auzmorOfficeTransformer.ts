/**
 * Auzmor Office Data Transformer
 *
 * Transforms Auzmor Office posts, users, and channels into unified dIQ types.
 */

import type { AuzmorOfficePost, AuzmorOfficeUser, AuzmorOfficeChannel } from '../mockAppsData';
import type { UnifiedSearchItem, UnifiedActivity } from '../unifiedTypes';

/**
 * Transform an Auzmor Office post to a unified search item
 */
export function transformAuzmorOfficePostToSearchItem(post: AuzmorOfficePost): UnifiedSearchItem {
  return {
    id: `auzmor-office-post-${post.id}`,
    type: 'auzmor_office_post',
    source: 'auzmor-office',
    title: `Post by ${post.author.name}`,
    description: post.content.slice(0, 200) + (post.content.length > 200 ? '...' : ''),
    content: post.content,
    excerpt: post.content.slice(0, 100),
    url: `/diq/apps/auzmor-office?post=${post.id}`,
    createdAt: post.timestamp,
    updatedAt: post.timestamp,
    author: {
      id: post.author.id,
      name: post.author.name,
      avatar: post.author.avatar,
    },
    tags: ['auzmor-office', post.type, post.author.department.toLowerCase()],
    metadata: {
      postType: post.type,
      department: post.author.department,
      title: post.author.title,
      likes: post.likes,
      comments: post.comments,
      images: post.images,
      pinned: post.pinned,
      reactions: post.reactions,
    },
  };
}

/**
 * Transform an Auzmor Office user to a unified search item
 */
export function transformAuzmorOfficeUserToSearchItem(user: AuzmorOfficeUser): UnifiedSearchItem {
  return {
    id: `auzmor-office-user-${user.id}`,
    type: 'person',
    source: 'auzmor-office',
    title: user.name,
    description: `${user.title} • ${user.department}`,
    content: `${user.name} - ${user.title} at ${user.department}. Located in ${user.location}.`,
    excerpt: user.title,
    url: `/diq/apps/auzmor-office?user=${user.id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
    },
    tags: ['auzmor-office', 'user', user.department.toLowerCase()],
    metadata: {
      department: user.department,
      email: user.email,
      status: user.status,
      location: user.location,
      timezone: user.timezone,
    },
  };
}

/**
 * Transform an Auzmor Office channel to a unified search item
 */
export function transformAuzmorOfficeChannelToSearchItem(channel: AuzmorOfficeChannel): UnifiedSearchItem {
  return {
    id: `auzmor-office-channel-${channel.id}`,
    type: 'channel',
    source: 'auzmor-office',
    title: `#${channel.name}`,
    description: channel.description,
    content: `${channel.name} - ${channel.description}. ${channel.members} members.`,
    excerpt: channel.description,
    url: `/diq/apps/auzmor-office?channel=${channel.id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['auzmor-office', 'channel'],
    metadata: {
      memberCount: channel.members,
      unreadCount: channel.unread,
      isPrivate: channel.isPrivate,
      lastActivity: channel.lastActivity,
    },
  };
}

/**
 * Transform an Auzmor Office post to a unified activity item
 */
export function transformAuzmorOfficePostToActivity(post: AuzmorOfficePost): UnifiedActivity {
  let activityType: UnifiedActivity['type'] = 'news'; // Default to 'news' for updates/posts
  if (post.type === 'announcement') activityType = 'news';
  if (post.type === 'shoutout') activityType = 'recognition';
  if (post.type === 'celebration') activityType = 'recognition';

  return {
    id: `auzmor-office-activity-${post.id}`,
    source: 'auzmor-office',
    type: activityType,
    title: post.type === 'shoutout'
      ? `${post.author.name} gave a shoutout`
      : post.type === 'announcement'
      ? `${post.author.name} posted an announcement`
      : `${post.author.name} shared an update`,
    description: post.content.slice(0, 100) + (post.content.length > 100 ? '...' : ''),
    actor: {
      id: post.author.id,
      name: post.author.name,
      avatar: post.author.avatar,
    },
    target: {
      id: post.id,
      type: 'auzmor_office_post',
      title: `Post in Auzmor Office`,
      url: `/diq/apps/auzmor-office?post=${post.id}`,
    },
    createdAt: post.timestamp,
    metadata: {
      postType: post.type,
      likes: post.likes,
      comments: post.comments,
      reactions: post.reactions,
    },
  };
}

/**
 * Transform all Auzmor Office posts to search items
 */
export function transformAllAuzmorOfficePostsToSearchItems(posts: AuzmorOfficePost[]): UnifiedSearchItem[] {
  return posts.map(transformAuzmorOfficePostToSearchItem);
}

/**
 * Transform all Auzmor Office users to search items
 */
export function transformAllAuzmorOfficeUsersToSearchItems(users: AuzmorOfficeUser[]): UnifiedSearchItem[] {
  return users.map(transformAuzmorOfficeUserToSearchItem);
}

/**
 * Transform all Auzmor Office channels to search items
 */
export function transformAllAuzmorOfficeChannelsToSearchItems(channels: AuzmorOfficeChannel[]): UnifiedSearchItem[] {
  return channels.map(transformAuzmorOfficeChannelToSearchItem);
}
