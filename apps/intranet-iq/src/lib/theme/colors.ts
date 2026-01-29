/**
 * CENTRALIZED COLOR SYSTEM - SINGLE SOURCE OF TRUTH
 * =============================================================================
 *
 * DO NOT hardcode colors anywhere in the application.
 * ALWAYS import from this file or use CSS variables from globals.css.
 *
 * Design System: Midnight Green
 * Primary Accent: Emerald (#10b981)
 *
 * @see /docs/COLOR_SYSTEM.md for usage guidelines
 * =============================================================================
 */

// =============================================================================
// CORE BRAND COLORS
// =============================================================================

export const BRAND = {
  // Primary accent - Emerald Green
  primary: '#10b981',
  primarySoft: '#34d399',
  primaryDark: '#059669',
  primaryLight: '#6ee7b7',

  // These map to CSS variables
  cssVar: {
    primary: 'var(--accent-ember)',
    primarySoft: 'var(--accent-ember-soft)',
    primaryDark: 'var(--accent-copper)',
    primaryLight: 'var(--accent-gold)',
  },
} as const;

// =============================================================================
// BACKGROUND COLORS
// =============================================================================

export const BACKGROUNDS = {
  // Core backgrounds
  obsidian: '#08080c',    // Primary page background
  charcoal: '#121218',    // Cards, elevated surfaces
  slate: '#1c1c24',       // Inputs, hover states
  elevated: '#252530',    // Modals, dropdowns

  // Variants for subtle differences
  charcoalDark: '#0f0f14',
  charcoalLight: '#1a1a1f',

  // CSS Variables (PREFER THESE)
  cssVar: {
    primary: 'var(--bg-obsidian)',
    secondary: 'var(--bg-charcoal)',
    tertiary: 'var(--bg-slate)',
  },
} as const;

// =============================================================================
// TEXT COLORS
// =============================================================================

export const TEXT = {
  primary: '#fafafa',
  secondary: 'rgba(250, 250, 250, 0.7)',
  muted: 'rgba(250, 250, 250, 0.5)',
  disabled: 'rgba(250, 250, 250, 0.3)',

  // CSS Variables (PREFER THESE)
  cssVar: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    muted: 'var(--text-muted)',
  },
} as const;

// =============================================================================
// BORDER COLORS
// =============================================================================

export const BORDERS = {
  subtle: 'rgba(255, 255, 255, 0.06)',
  default: 'rgba(255, 255, 255, 0.12)',
  strong: 'rgba(255, 255, 255, 0.20)',
  accent: 'rgba(16, 185, 129, 0.3)',

  // CSS Variables (PREFER THESE)
  cssVar: {
    subtle: 'var(--border-subtle)',
    default: 'var(--border-default)',
  },
} as const;

// =============================================================================
// SEMANTIC COLORS
// =============================================================================

export const SEMANTIC = {
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6',

  // With opacity variants
  successBg: 'rgba(34, 197, 94, 0.15)',
  warningBg: 'rgba(234, 179, 8, 0.15)',
  errorBg: 'rgba(239, 68, 68, 0.15)',
  infoBg: 'rgba(59, 130, 246, 0.15)',

  // CSS Variables (PREFER THESE)
  cssVar: {
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)',
  },
} as const;

// =============================================================================
// WORKFLOW NODE COLORS (Used in ReactFlow workflow builder)
// =============================================================================

export const WORKFLOW_NODES = {
  trigger: {
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.4)',
    tailwind: 'text-purple-400 bg-purple-500/15 border-purple-500/40',
  },
  search: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
    tailwind: 'text-blue-400 bg-blue-500/15 border-blue-500/40',
  },
  action: {
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.4)',
    tailwind: 'text-green-400 bg-green-500/15 border-green-500/40',
  },
  condition: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    tailwind: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40',
  },
  transform: {
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.4)',
    tailwind: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/40',
  },
  output: {
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.15)',
    border: 'rgba(251, 191, 36, 0.4)',
    tailwind: 'text-amber-400 bg-amber-500/15 border-amber-500/40',
  },
  approval: {
    color: '#14b8a6',
    bg: 'rgba(20, 184, 166, 0.15)',
    border: 'rgba(20, 184, 166, 0.4)',
    tailwind: 'text-teal-400 bg-teal-500/15 border-teal-500/40',
  },
  think: {
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.15)',
    border: 'rgba(236, 72, 153, 0.4)',
    tailwind: 'text-pink-400 bg-pink-500/15 border-pink-500/40',
  },
} as const;

// =============================================================================
// WIDGET/DASHBOARD COLORS
// =============================================================================

export const WIDGET_COLORS = {
  'quick-actions': {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    tailwind: 'text-blue-400 bg-blue-500/15',
  },
  news: {
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    tailwind: 'text-purple-400 bg-purple-500/15',
  },
  events: {
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
    tailwind: 'text-green-400 bg-green-500/15',
  },
  activity: {
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    tailwind: 'text-cyan-400 bg-cyan-500/15',
  },
  trending: {
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.15)',
    tailwind: 'text-yellow-400 bg-yellow-500/15',
  },
  meeting: {
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    tailwind: 'text-orange-400 bg-orange-500/15',
  },
  tasks: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    tailwind: 'text-emerald-400 bg-emerald-500/15',
  },
} as const;

// =============================================================================
// ROLE COLORS (User roles in admin)
// =============================================================================

export const ROLE_COLORS = {
  super_admin: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    tailwind: 'text-red-400 bg-red-500/15',
    badge: 'bg-red-500',
  },
  admin: {
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    tailwind: 'text-orange-400 bg-orange-500/15',
    badge: 'bg-orange-500',
  },
  editor: {
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
    tailwind: 'text-green-400 bg-green-500/15',
    badge: 'bg-green-500',
  },
  contributor: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    tailwind: 'text-blue-400 bg-blue-500/15',
    badge: 'bg-blue-500',
  },
  viewer: {
    color: '#6b7280',
    bg: 'rgba(107, 114, 128, 0.15)',
    tailwind: 'text-gray-400 bg-gray-500/15',
    badge: 'bg-gray-500',
  },
} as const;

// =============================================================================
// CONTENT TYPE COLORS (Search results, documents, etc.)
// =============================================================================

export const CONTENT_COLORS = {
  article: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.3)',
    tailwind: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  },
  document: {
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.3)',
    tailwind: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
  },
  event: {
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.3)',
    tailwind: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
  },
  employee: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.3)',
    tailwind: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  },
  workflow: {
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.3)',
    tailwind: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
  },
  faq: {
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.3)',
    tailwind: 'text-green-400 bg-green-500/15 border-green-500/30',
  },
} as const;

// =============================================================================
// CHART/ANALYTICS COLORS
// =============================================================================

export const CHART_COLORS = {
  primary: '#10b981',   // Emerald
  secondary: '#3b82f6', // Blue
  tertiary: '#a855f7',  // Purple
  quaternary: '#f59e0b', // Amber
  quinary: '#ec4899',   // Pink

  // For multi-series charts
  series: [
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#a855f7', // Purple
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#ef4444', // Red
    '#84cc16', // Lime
  ],
} as const;

// =============================================================================
// PRIORITY COLORS (Tasks, issues)
// =============================================================================

export const PRIORITY_COLORS = {
  urgent: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.5)',
    tailwind: 'text-red-400 bg-red-500/15 border-red-500/50',
  },
  high: {
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.5)',
    tailwind: 'text-orange-400 bg-orange-500/15 border-orange-500/50',
  },
  medium: {
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'rgba(234, 179, 8, 0.5)',
    tailwind: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/50',
  },
  low: {
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.5)',
    tailwind: 'text-green-400 bg-green-500/15 border-green-500/50',
  },
} as const;

// =============================================================================
// STATUS COLORS
// =============================================================================

export const STATUS_COLORS = {
  active: {
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
    tailwind: 'text-green-400 bg-green-500/15',
  },
  pending: {
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.15)',
    tailwind: 'text-yellow-400 bg-yellow-500/15',
  },
  inactive: {
    color: '#6b7280',
    bg: 'rgba(107, 114, 128, 0.15)',
    tailwind: 'text-gray-400 bg-gray-500/15',
  },
  error: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    tailwind: 'text-red-400 bg-red-500/15',
  },
  paused: {
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    tailwind: 'text-orange-400 bg-orange-500/15',
  },
  draft: {
    color: '#6b7280',
    bg: 'rgba(107, 114, 128, 0.15)',
    tailwind: 'text-gray-400 bg-gray-500/15',
  },
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get color with opacity
 * @param hex - Hex color (e.g., '#10b981')
 * @param opacity - Opacity 0-1 (e.g., 0.15)
 */
export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get workflow node colors by type
 */
export function getWorkflowNodeColors(type: keyof typeof WORKFLOW_NODES) {
  return WORKFLOW_NODES[type] || WORKFLOW_NODES.action;
}

/**
 * Get role color configuration
 */
export function getRoleColor(role: string) {
  const normalizedRole = role.toLowerCase().replace(/\s+/g, '_');
  return ROLE_COLORS[normalizedRole as keyof typeof ROLE_COLORS] || ROLE_COLORS.viewer;
}

/**
 * Get content type colors
 */
export function getContentTypeColor(type: string) {
  return CONTENT_COLORS[type as keyof typeof CONTENT_COLORS] || CONTENT_COLORS.article;
}

/**
 * Get status colors
 */
export function getStatusColor(status: string) {
  const normalizedStatus = status.toLowerCase();
  return STATUS_COLORS[normalizedStatus as keyof typeof STATUS_COLORS] || STATUS_COLORS.inactive;
}

/**
 * Get priority colors
 */
export function getPriorityColor(priority: string) {
  const normalizedPriority = priority.toLowerCase();
  return PRIORITY_COLORS[normalizedPriority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type WorkflowNodeType = keyof typeof WORKFLOW_NODES;
export type WidgetType = keyof typeof WIDGET_COLORS;
export type RoleType = keyof typeof ROLE_COLORS;
export type ContentType = keyof typeof CONTENT_COLORS;
export type StatusType = keyof typeof STATUS_COLORS;
export type PriorityType = keyof typeof PRIORITY_COLORS;
