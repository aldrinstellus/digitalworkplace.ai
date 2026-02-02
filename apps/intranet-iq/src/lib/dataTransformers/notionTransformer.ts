/**
 * Notion Data Transformer
 *
 * Transforms Notion pages into unified dIQ types.
 */

import type { NotionPage } from '../mockAppsData';
import type { UnifiedSearchItem, UnifiedActivity } from '../unifiedTypes';
import { findEmployeeByName } from '../crossReferences';

/**
 * Get page type label
 */
function getTypeLabel(type: NotionPage['type']): string {
  const labels: Record<NotionPage['type'], string> = {
    'page': '📄 Page',
    'database': '📊 Database',
    'wiki': '📚 Wiki',
    'meeting-notes': '📝 Meeting Notes',
  };
  return labels[type] || '📄 Page';
}

/**
 * Transform a Notion page to a unified search item
 */
export function transformNotionPageToSearchItem(page: NotionPage): UnifiedSearchItem {
  const lastEditor = findEmployeeByName(page.lastEditedBy);

  return {
    id: `notion-${page.id}`,
    type: 'notion_page',
    source: 'notion',
    title: `${page.icon} ${page.title}`,
    description: `${getTypeLabel(page.type)} • ${page.workspace} • Modified ${page.lastEdited}`,
    content: `${page.title} ${page.workspace} ${page.type}`,
    excerpt: `${page.workspace} workspace`,
    url: `/diq/integrations/notion/pages/${page.id}`,
    createdAt: page.lastEdited,
    updatedAt: page.lastEdited,
    author: {
      id: lastEditor?.id,
      name: page.lastEditedBy,
      avatar: lastEditor?.avatar,
      email: lastEditor?.email,
    },
    tags: ['notion', page.type, page.workspace],
    metadata: {
      icon: page.icon,
      workspace: page.workspace,
      type: page.type,
      shared: page.shared,
    },
  };
}

/**
 * Transform a Notion page update to activity
 */
export function transformNotionPageToActivity(page: NotionPage): UnifiedActivity {
  const actor = findEmployeeByName(page.lastEditedBy);

  return {
    id: `notion-activity-${page.id}`,
    source: 'notion',
    type: 'page_updated',
    title: `Updated: ${page.icon} ${page.title}`,
    description: `${page.workspace} • ${getTypeLabel(page.type)}`,
    actor: {
      id: actor?.id,
      name: page.lastEditedBy,
      avatar: actor?.avatar,
      email: actor?.email,
    },
    target: {
      id: page.id,
      type: 'notion_page',
      title: `${page.icon} ${page.title}`,
      url: `/diq/integrations/notion/pages/${page.id}`,
    },
    createdAt: page.lastEdited,
    metadata: {
      workspace: page.workspace,
      type: page.type,
      shared: page.shared,
    },
  };
}

/**
 * Transform all Notion pages to search items
 */
export function transformAllNotionPagesToSearchItems(pages: NotionPage[]): UnifiedSearchItem[] {
  return pages.map(transformNotionPageToSearchItem);
}

/**
 * Get Notion pages by workspace
 */
export function getNotionPagesByWorkspace(pages: NotionPage[], workspace: string): UnifiedSearchItem[] {
  return pages
    .filter(p => p.workspace.toLowerCase() === workspace.toLowerCase())
    .map(transformNotionPageToSearchItem);
}

/**
 * Get Notion pages edited by user
 */
export function getNotionPagesForUser(pages: NotionPage[], userName: string): UnifiedSearchItem[] {
  return pages
    .filter(p => p.lastEditedBy === userName || p.lastEditedBy === 'You')
    .map(transformNotionPageToSearchItem);
}
