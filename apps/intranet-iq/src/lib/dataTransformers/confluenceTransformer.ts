/**
 * Confluence Data Transformer
 *
 * Transforms Confluence pages into unified dIQ types.
 */

import type { ConfluencePage } from '../mockAppsData';
import type { UnifiedSearchItem, UnifiedActivity } from '../unifiedTypes';
import { findEmployeeByName } from '../crossReferences';

/**
 * Transform a Confluence page to a unified search item
 */
export function transformConfluencePageToSearchItem(page: ConfluencePage): UnifiedSearchItem {
  const author = findEmployeeByName(page.author.name);

  return {
    id: `confluence-${page.id}`,
    type: 'confluence_page',
    source: 'confluence',
    title: page.title,
    description: page.content.slice(0, 200) + (page.content.length > 200 ? '...' : ''),
    content: page.content,
    excerpt: `${page.space} • ${page.views} views • ${page.likes} likes`,
    url: `/diq/integrations/confluence/pages/${page.id}`,
    createdAt: page.lastUpdated,
    updatedAt: page.lastUpdated,
    author: {
      id: author?.id,
      name: page.author.name,
      avatar: page.author.avatar,
      email: author?.email,
    },
    tags: [...page.labels, page.space, 'confluence'],
    metadata: {
      space: page.space,
      likes: page.likes,
      views: page.views,
      comments: page.comments,
      lastUpdatedBy: page.lastUpdatedBy,
    },
  };
}

/**
 * Transform a Confluence page update to activity
 */
export function transformConfluencePageToActivity(page: ConfluencePage): UnifiedActivity {
  const actor = findEmployeeByName(page.lastUpdatedBy);

  return {
    id: `confluence-activity-${page.id}`,
    source: 'confluence',
    type: 'page_updated',
    title: `Updated: ${page.title}`,
    description: `${page.space} • Last updated ${page.lastUpdated}`,
    actor: {
      id: actor?.id,
      name: page.lastUpdatedBy,
      avatar: actor?.avatar,
      email: actor?.email,
    },
    target: {
      id: page.id,
      type: 'confluence_page',
      title: page.title,
      url: `/diq/integrations/confluence/pages/${page.id}`,
    },
    createdAt: page.lastUpdated,
    metadata: {
      space: page.space,
      likes: page.likes,
      views: page.views,
      comments: page.comments,
    },
  };
}

/**
 * Transform all Confluence pages to search items
 */
export function transformAllConfluencePagesToSearchItems(pages: ConfluencePage[]): UnifiedSearchItem[] {
  return pages.map(transformConfluencePageToSearchItem);
}

/**
 * Get Confluence pages by space
 */
export function getConfluencePagesBySpace(pages: ConfluencePage[], space: string): UnifiedSearchItem[] {
  return pages
    .filter(p => p.space.toLowerCase() === space.toLowerCase())
    .map(transformConfluencePageToSearchItem);
}

/**
 * Get Confluence pages authored by user
 */
export function getConfluencePagesForUser(pages: ConfluencePage[], userName: string): UnifiedSearchItem[] {
  return pages
    .filter(p => p.author.name === userName || p.lastUpdatedBy === userName)
    .map(transformConfluencePageToSearchItem);
}
