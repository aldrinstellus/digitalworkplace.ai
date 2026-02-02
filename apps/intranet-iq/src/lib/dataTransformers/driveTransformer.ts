/**
 * Google Drive Data Transformer
 *
 * Transforms Google Drive files into unified dIQ types.
 */

import type { DriveFile } from '../mockAppsData';
import type { UnifiedSearchItem, UnifiedActivity } from '../unifiedTypes';
import { findEmployeeByName } from '../crossReferences';

/**
 * Get file type icon
 */
function getFileTypeIcon(type: DriveFile['type']): string {
  const icons: Record<DriveFile['type'], string> = {
    'document': '📄',
    'spreadsheet': '📊',
    'presentation': '📽️',
    'folder': '📁',
    'pdf': '📕',
    'image': '🖼️',
  };
  return icons[type] || '📄';
}

/**
 * Transform a Drive file to a unified search item
 */
export function transformDriveFileToSearchItem(file: DriveFile): UnifiedSearchItem {
  const owner = findEmployeeByName(file.owner.name);

  return {
    id: `drive-${file.id}`,
    type: 'drive_file',
    source: 'drive',
    title: file.name,
    description: `${getFileTypeIcon(file.type)} ${file.type.charAt(0).toUpperCase() + file.type.slice(1)} • ${file.size} • Modified ${file.lastModified}`,
    content: `${file.name} ${file.path} ${file.sharedWith.join(' ')}`,
    excerpt: `${file.path}/${file.name}`,
    url: `/diq/integrations/drive/files/${file.id}`,
    createdAt: file.lastModified,
    updatedAt: file.lastModified,
    author: {
      id: owner?.id,
      name: file.owner.name,
      avatar: file.owner.avatar,
      email: owner?.email,
    },
    tags: [file.type, 'drive', ...file.sharedWith],
    metadata: {
      fileType: file.type,
      size: file.size,
      path: file.path,
      starred: file.starred,
      sharedWith: file.sharedWith,
      lastModifiedBy: file.lastModifiedBy,
    },
  };
}

/**
 * Transform a Drive file share/update to activity
 */
export function transformDriveFileToActivity(
  file: DriveFile,
  activityType: 'file_shared' | 'file_updated' = 'file_updated'
): UnifiedActivity {
  const actor = findEmployeeByName(file.lastModifiedBy);

  const title = activityType === 'file_shared'
    ? `Shared ${file.name}`
    : `Updated ${file.name}`;

  const description = activityType === 'file_shared'
    ? `Shared with ${file.sharedWith.join(', ')}`
    : `Last modified ${file.lastModified}`;

  return {
    id: `drive-activity-${file.id}-${activityType}`,
    source: 'drive',
    type: activityType,
    title,
    description,
    actor: {
      id: actor?.id,
      name: file.lastModifiedBy,
      avatar: actor?.avatar,
      email: actor?.email,
    },
    target: {
      id: file.id,
      type: 'drive_file',
      title: file.name,
      url: `/diq/integrations/drive/files/${file.id}`,
    },
    createdAt: file.lastModified,
    metadata: {
      fileType: file.type,
      size: file.size,
      path: file.path,
      sharedWith: file.sharedWith,
    },
  };
}

/**
 * Transform all Drive files to search items
 */
export function transformAllDriveFilesToSearchItems(files: DriveFile[]): UnifiedSearchItem[] {
  return files.map(transformDriveFileToSearchItem);
}

/**
 * Get recent Drive files for a user
 */
export function getRecentDriveFilesForUser(files: DriveFile[], userName: string): UnifiedSearchItem[] {
  return files
    .filter(f =>
      f.owner.name === userName ||
      f.lastModifiedBy === userName ||
      f.sharedWith.includes(userName)
    )
    .map(transformDriveFileToSearchItem);
}

/**
 * Get starred Drive files for a user
 */
export function getStarredDriveFilesForUser(files: DriveFile[], userName: string): UnifiedSearchItem[] {
  return files
    .filter(f => f.starred && (
      f.owner.name === userName ||
      f.sharedWith.includes(userName)
    ))
    .map(transformDriveFileToSearchItem);
}
