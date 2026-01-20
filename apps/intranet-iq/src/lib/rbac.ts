/**
 * Role-Based Access Control (RBAC) for dIQ
 * Handles user permissions and content filtering based on roles
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User roles hierarchy (higher number = more permissions)
export const ROLES = {
  guest: 0,
  user: 1,
  contributor: 2,
  editor: 3,
  manager: 4,
  admin: 5,
  super_admin: 6,
} as const;

export type Role = keyof typeof ROLES;

// Content access levels
export const ACCESS_LEVELS = {
  public: 0,        // Everyone can view
  internal: 1,      // All logged-in users
  department: 2,    // Same department only
  confidential: 3,  // Managers and above
  restricted: 4,    // Admins only
} as const;

export type AccessLevel = keyof typeof ACCESS_LEVELS;

export interface UserContext {
  userId: string;
  email: string;
  role: Role;
  departmentId?: string;
  departmentIds?: string[];  // User may belong to multiple departments
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * Get user context from Clerk user ID
 */
export async function getUserContext(clerkUserId?: string, email?: string): Promise<UserContext | null> {
  if (!clerkUserId && !email) {
    return null;
  }

  try {
    // First try to get from public.users
    let query = supabase.from('users').select('*');

    if (clerkUserId) {
      query = query.eq('clerk_id', clerkUserId);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      return null;
    }

    // Get employee record if exists (for department info)
    const { data: employee } = await supabase
      .schema('diq')
      .from('employees')
      .select('id, department_id')
      .eq('email', user.email)
      .single();

    const role = (user.role as Role) || 'user';

    return {
      userId: user.id,
      email: user.email,
      role,
      departmentId: employee?.department_id || undefined,
      isAdmin: ROLES[role] >= ROLES.admin,
      isSuperAdmin: role === 'super_admin',
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return null;
  }
}

/**
 * Check if user can access content based on access level
 */
export function canAccessContent(
  userContext: UserContext | null,
  contentAccessLevel: AccessLevel,
  contentDepartmentId?: string
): boolean {
  // Guests can only access public content
  if (!userContext) {
    return contentAccessLevel === 'public';
  }

  // Super admins can access everything
  if (userContext.isSuperAdmin) {
    return true;
  }

  // Admins can access everything except super_admin restricted
  if (userContext.isAdmin) {
    return contentAccessLevel !== 'restricted';
  }

  const userRoleLevel = ROLES[userContext.role];
  const contentLevel = ACCESS_LEVELS[contentAccessLevel];

  switch (contentAccessLevel) {
    case 'public':
      return true;

    case 'internal':
      return userRoleLevel >= ROLES.user;

    case 'department':
      // User must be in the same department
      if (!contentDepartmentId || !userContext.departmentId) {
        return false;
      }
      return userContext.departmentId === contentDepartmentId ||
        userContext.departmentIds?.includes(contentDepartmentId) || false;

    case 'confidential':
      // Managers and above can access confidential content
      return userRoleLevel >= ROLES.manager;

    case 'restricted':
      // Admins only (handled above)
      return false;

    default:
      return false;
  }
}

/**
 * Build access filter clause for Supabase queries
 */
export function buildAccessFilter(userContext: UserContext | null): {
  accessLevels: string[];
  departmentIds: string[];
} {
  if (!userContext) {
    return {
      accessLevels: ['public'],
      departmentIds: [],
    };
  }

  if (userContext.isSuperAdmin || userContext.isAdmin) {
    return {
      accessLevels: ['public', 'internal', 'department', 'confidential', 'restricted'],
      departmentIds: [], // No department filter for admins
    };
  }

  const accessLevels: string[] = ['public'];
  const roleLevel = ROLES[userContext.role];

  // All logged-in users can see internal content
  if (roleLevel >= ROLES.user) {
    accessLevels.push('internal');
  }

  // Add department-level access if user has a department
  if (userContext.departmentId) {
    accessLevels.push('department');
  }

  // Managers and above can see confidential
  if (roleLevel >= ROLES.manager) {
    accessLevels.push('confidential');
  }

  return {
    accessLevels,
    departmentIds: userContext.departmentId ? [userContext.departmentId] : [],
  };
}

/**
 * Filter array of content items based on user access
 */
export function filterContentByAccess<T extends {
  access_level?: string;
  department_id?: string;
}>(
  items: T[],
  userContext: UserContext | null
): T[] {
  return items.filter((item) => {
    const accessLevel = (item.access_level as AccessLevel) || 'internal';
    return canAccessContent(userContext, accessLevel, item.department_id);
  });
}

/**
 * Check if user can perform action on content
 */
export function canPerformAction(
  userContext: UserContext | null,
  action: 'create' | 'edit' | 'delete' | 'publish' | 'approve',
  contentAuthorId?: string,
  contentDepartmentId?: string
): boolean {
  if (!userContext) {
    return false;
  }

  // Super admins can do everything
  if (userContext.isSuperAdmin) {
    return true;
  }

  const roleLevel = ROLES[userContext.role];

  switch (action) {
    case 'create':
      // Contributors and above can create
      return roleLevel >= ROLES.contributor;

    case 'edit':
      // Can edit own content, or editors+ can edit any
      if (contentAuthorId === userContext.userId) {
        return true;
      }
      return roleLevel >= ROLES.editor;

    case 'delete':
      // Can delete own content, or managers+ can delete any
      if (contentAuthorId === userContext.userId) {
        return roleLevel >= ROLES.contributor;
      }
      return roleLevel >= ROLES.manager;

    case 'publish':
      // Editors and above can publish
      return roleLevel >= ROLES.editor;

    case 'approve':
      // Managers and above can approve
      return roleLevel >= ROLES.manager;

    default:
      return false;
  }
}

/**
 * Get visible departments for user
 */
export async function getVisibleDepartments(userContext: UserContext | null): Promise<string[]> {
  if (!userContext) {
    // Guests see public departments
    const { data } = await supabase
      .schema('diq')
      .from('departments')
      .select('id')
      .eq('is_public', true);
    return data?.map(d => d.id) || [];
  }

  if (userContext.isAdmin || userContext.isSuperAdmin) {
    // Admins see all departments
    const { data } = await supabase
      .schema('diq')
      .from('departments')
      .select('id');
    return data?.map(d => d.id) || [];
  }

  // Regular users see their department and public departments
  const { data } = await supabase
    .schema('diq')
    .from('departments')
    .select('id')
    .or(`is_public.eq.true${userContext.departmentId ? `,id.eq.${userContext.departmentId}` : ''}`);

  return data?.map(d => d.id) || [];
}
