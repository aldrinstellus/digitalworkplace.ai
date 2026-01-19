import { supabase } from './supabase';

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface UserData {
  id: string;
  clerk_id: string | null;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Get user role from Supabase by email
 */
export async function getUserByEmail(email: string): Promise<UserData | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserData;
}

/**
 * Get user role from Supabase by Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<UserData | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserData;
}

/**
 * Create or update user in Supabase with Clerk ID
 */
export async function syncUserWithClerk(
  email: string,
  clerkId: string,
  fullName?: string,
  avatarUrl?: string
): Promise<UserData | null> {
  // First, check if user exists by email
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    // Update existing user with Clerk ID
    const { data, error } = await supabase
      .from('users')
      .update({
        clerk_id: clerkId,
        full_name: fullName || existingUser.full_name,
        avatar_url: avatarUrl || existingUser.avatar_url,
      })
      .eq('email', email)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating user:', error);
      // Return existing user data even if update fails (RLS might block updates)
      return existingUser;
    }

    // Return updated data or fall back to existing user
    return (data as UserData) || existingUser;
  }

  // Create new user
  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      clerk_id: clerkId,
      full_name: fullName,
      avatar_url: avatarUrl,
      role: 'user',
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating user:', error);
    // If insert fails, try to get the user again (might have been created by another request)
    return await getUserByEmail(email);
  }

  return data as UserData;
}

/**
 * Check if user is a super admin
 */
export async function isSuperAdmin(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  return user?.role === 'super_admin';
}

/**
 * Check if user is an admin (admin or super_admin)
 */
export async function isAdmin(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  return user?.role === 'admin' || user?.role === 'super_admin';
}

/**
 * Get all users (for super admin)
 */
export async function getAllUsers(): Promise<UserData[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data as UserData[];
}

/**
 * Update user role (for super admin)
 */
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    return false;
  }

  return true;
}
