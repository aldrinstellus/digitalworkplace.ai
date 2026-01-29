/**
 * Theme System - Central Export
 * =============================================================================
 *
 * Import all theme utilities from here:
 *
 * ```typescript
 * import { BRAND, SEMANTIC, WORKFLOW_NODES, getStatusColor } from '@/lib/theme';
 * ```
 *
 * =============================================================================
 */

export * from './colors';

// Re-export common utilities for convenience
export {
  BRAND,
  BACKGROUNDS,
  TEXT,
  BORDERS,
  SEMANTIC,
  WORKFLOW_NODES,
  WIDGET_COLORS,
  ROLE_COLORS,
  CONTENT_COLORS,
  CHART_COLORS,
  PRIORITY_COLORS,
  STATUS_COLORS,
  hexToRgba,
  getWorkflowNodeColors,
  getRoleColor,
  getContentTypeColor,
  getStatusColor,
  getPriorityColor,
} from './colors';
