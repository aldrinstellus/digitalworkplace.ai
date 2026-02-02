/**
 * Figma Data Transformer
 *
 * Transforms Figma projects into unified dIQ types.
 */

import type { FigmaProject } from '../mockAppsData';
import type { UnifiedSearchItem, UnifiedActivity } from '../unifiedTypes';
import { findEmployeeByName } from '../crossReferences';

/**
 * Get status indicator
 */
function getStatusIndicator(status: FigmaProject['status']): string {
  const indicators: Record<FigmaProject['status'], string> = {
    'in-progress': '🟡',
    'review': '🟠',
    'approved': '✅',
    'archived': '📦',
  };
  return indicators[status] || '⚪';
}

/**
 * Transform a Figma project to a unified search item
 */
export function transformFigmaProjectToSearchItem(project: FigmaProject): UnifiedSearchItem {
  const lastEditor = findEmployeeByName(project.lastModifiedBy);

  return {
    id: `figma-${project.id}`,
    type: 'figma_project',
    source: 'figma',
    title: project.name,
    description: `${getStatusIndicator(project.status)} ${project.status} • ${project.viewers} viewers • ${project.comments} comments`,
    content: `${project.name} ${project.editors.map(e => e.name).join(' ')}`,
    excerpt: `${project.thumbnail} Modified ${project.lastModified}`,
    url: `/diq/integrations/figma/projects/${project.id}`,
    createdAt: project.lastModified,
    updatedAt: project.lastModified,
    author: {
      id: lastEditor?.id,
      name: project.lastModifiedBy,
      avatar: lastEditor?.avatar,
      email: lastEditor?.email,
    },
    tags: ['figma', 'design', project.status],
    metadata: {
      thumbnail: project.thumbnail,
      status: project.status,
      editors: project.editors,
      viewers: project.viewers,
      comments: project.comments,
    },
  };
}

/**
 * Transform a Figma project update to activity
 */
export function transformFigmaProjectToActivity(project: FigmaProject): UnifiedActivity {
  const actor = findEmployeeByName(project.lastModifiedBy);

  return {
    id: `figma-activity-${project.id}`,
    source: 'figma',
    type: 'design_updated',
    title: `Updated: ${project.name}`,
    description: `${getStatusIndicator(project.status)} ${project.status} • ${project.comments} comments`,
    actor: {
      id: actor?.id,
      name: project.lastModifiedBy,
      avatar: actor?.avatar,
      email: actor?.email,
    },
    target: {
      id: project.id,
      type: 'figma_project',
      title: project.name,
      url: `/diq/integrations/figma/projects/${project.id}`,
    },
    createdAt: project.lastModified,
    metadata: {
      status: project.status,
      viewers: project.viewers,
      comments: project.comments,
    },
  };
}

/**
 * Transform all Figma projects to search items
 */
export function transformAllFigmaProjectsToSearchItems(projects: FigmaProject[]): UnifiedSearchItem[] {
  return projects.map(transformFigmaProjectToSearchItem);
}

/**
 * Get Figma projects for a user (as editor)
 */
export function getFigmaProjectsForUser(projects: FigmaProject[], userName: string): UnifiedSearchItem[] {
  return projects
    .filter(p => p.editors.some(e => e.name === userName))
    .map(transformFigmaProjectToSearchItem);
}
