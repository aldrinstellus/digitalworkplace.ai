/**
 * Access Request Workflow System
 * Handles access request/approval flows for RBAC
 *
 * V2.0 Feature: Access Request Workflow - EPIC 5
 */

import { createClient } from '@supabase/supabase-js';
import { Role, ROLES, UserContext } from './rbac';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// Types
// ============================================================================

export type AccessRequestStatus = 'pending' | 'approved' | 'denied' | 'cancelled' | 'expired';
export type AccessRequestType = 'role_upgrade' | 'department_access' | 'content_access' | 'workflow_access';

export interface AccessRequest {
  id: string;
  requester_id: string;
  request_type: AccessRequestType;
  current_value?: string;
  requested_value: string;
  reason: string;
  status: AccessRequestStatus;
  reviewer_id?: string;
  reviewer_notes?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  metadata?: Record<string, unknown>;
  // Joined data
  requester?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  reviewer?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface CreateAccessRequestInput {
  requestType: AccessRequestType;
  requestedValue: string;
  reason: string;
  currentValue?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ReviewAccessRequestInput {
  status: 'approved' | 'denied';
  notes?: string;
}

export interface AccessRequestStats {
  total: number;
  pending: number;
  approved: number;
  denied: number;
  cancelled: number;
  expired: number;
  avgReviewTimeHours: number;
}

// ============================================================================
// Request Creation
// ============================================================================

/**
 * Create a new access request
 */
export async function createAccessRequest(
  userContext: UserContext,
  input: CreateAccessRequestInput
): Promise<AccessRequest> {
  // Validate request type
  const validTypes: AccessRequestType[] = ['role_upgrade', 'department_access', 'content_access', 'workflow_access'];
  if (!validTypes.includes(input.requestType)) {
    throw new Error(`Invalid request type: ${input.requestType}`);
  }

  // For role upgrades, validate the requested role is higher than current
  if (input.requestType === 'role_upgrade') {
    const requestedRole = input.requestedValue as Role;
    if (!ROLES[requestedRole]) {
      throw new Error(`Invalid role: ${requestedRole}`);
    }
    if (ROLES[requestedRole] <= ROLES[userContext.role]) {
      throw new Error('Requested role must be higher than current role');
    }
    // Can't request super_admin directly
    if (requestedRole === 'super_admin') {
      throw new Error('Cannot request super_admin role through self-service');
    }
  }

  // Check for existing pending request of same type
  const { data: existingRequest } = await supabase
    .schema('diq')
    .from('access_requests')
    .select('id')
    .eq('requester_id', userContext.userId)
    .eq('request_type', input.requestType)
    .eq('status', 'pending')
    .maybeSingle();

  if (existingRequest) {
    throw new Error('You already have a pending request of this type');
  }

  // Create the request
  const { data, error } = await supabase
    .schema('diq')
    .from('access_requests')
    .insert({
      requester_id: userContext.userId,
      request_type: input.requestType,
      current_value: input.currentValue || userContext.role,
      requested_value: input.requestedValue,
      reason: input.reason,
      status: 'pending',
      expires_at: input.expiresAt,
      metadata: input.metadata,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating access request:', error);
    throw new Error('Failed to create access request');
  }

  // Send notification to admins (async, don't wait)
  notifyAdminsOfNewRequest(data).catch(console.error);

  return data;
}

/**
 * Cancel a pending request
 */
export async function cancelAccessRequest(
  userContext: UserContext,
  requestId: string
): Promise<AccessRequest> {
  // Get the request
  const { data: request, error: fetchError } = await supabase
    .schema('diq')
    .from('access_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError || !request) {
    throw new Error('Access request not found');
  }

  // Only requester can cancel their own request
  if (request.requester_id !== userContext.userId && !userContext.isAdmin) {
    throw new Error('Not authorized to cancel this request');
  }

  // Can only cancel pending requests
  if (request.status !== 'pending') {
    throw new Error('Can only cancel pending requests');
  }

  // Update status
  const { data, error } = await supabase
    .schema('diq')
    .from('access_requests')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select('*')
    .single();

  if (error) {
    throw new Error('Failed to cancel request');
  }

  return data;
}

// ============================================================================
// Request Review (Admin)
// ============================================================================

/**
 * Review (approve/deny) an access request
 */
export async function reviewAccessRequest(
  reviewerContext: UserContext,
  requestId: string,
  input: ReviewAccessRequestInput
): Promise<AccessRequest> {
  // Only managers and above can review requests
  if (ROLES[reviewerContext.role] < ROLES.manager) {
    throw new Error('Not authorized to review access requests');
  }

  // Get the request
  const { data: request, error: fetchError } = await supabase
    .schema('diq')
    .from('access_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError || !request) {
    throw new Error('Access request not found');
  }

  // Can only review pending requests
  if (request.status !== 'pending') {
    throw new Error('Can only review pending requests');
  }

  // Can't review own request
  if (request.requester_id === reviewerContext.userId) {
    throw new Error('Cannot review your own request');
  }

  // For role upgrades, reviewer must have higher role than requested
  if (request.request_type === 'role_upgrade') {
    const requestedRole = request.requested_value as Role;
    if (ROLES[reviewerContext.role] <= ROLES[requestedRole]) {
      throw new Error('You cannot approve a role higher than or equal to your own');
    }
  }

  const now = new Date().toISOString();

  // Update request status
  const { data, error } = await supabase
    .schema('diq')
    .from('access_requests')
    .update({
      status: input.status,
      reviewer_id: reviewerContext.userId,
      reviewer_notes: input.notes,
      reviewed_at: now,
      updated_at: now,
    })
    .eq('id', requestId)
    .select('*')
    .single();

  if (error) {
    throw new Error('Failed to update request');
  }

  // If approved, apply the change
  if (input.status === 'approved') {
    await applyAccessChange(request);
  }

  // Notify requester
  notifyRequesterOfReview(data, reviewerContext).catch(console.error);

  return data;
}

/**
 * Apply the approved access change
 */
async function applyAccessChange(request: AccessRequest): Promise<void> {
  switch (request.request_type) {
    case 'role_upgrade': {
      // Update user role
      const { error } = await supabase
        .from('users')
        .update({ role: request.requested_value })
        .eq('id', request.requester_id);

      if (error) {
        console.error('Failed to apply role upgrade:', error);
        throw new Error('Failed to apply role upgrade');
      }
      break;
    }

    case 'department_access': {
      // Add department membership
      const { error } = await supabase
        .schema('diq')
        .from('employee_departments')
        .insert({
          employee_id: request.requester_id,
          department_id: request.requested_value,
          is_primary: false,
        });

      if (error && !error.message.includes('duplicate')) {
        console.error('Failed to apply department access:', error);
        throw new Error('Failed to apply department access');
      }
      break;
    }

    case 'content_access': {
      // Add content permission
      const { error } = await supabase
        .schema('diq')
        .from('content_permissions')
        .insert({
          user_id: request.requester_id,
          content_id: request.requested_value,
          permission: 'view',
          granted_by: request.reviewer_id,
          expires_at: request.expires_at,
        });

      if (error && !error.message.includes('duplicate')) {
        console.error('Failed to apply content access:', error);
        throw new Error('Failed to apply content access');
      }
      break;
    }

    case 'workflow_access': {
      // Add workflow permission
      const { error } = await supabase
        .schema('diq')
        .from('workflow_permissions')
        .insert({
          user_id: request.requester_id,
          workflow_id: request.requested_value,
          permission: 'execute',
          granted_by: request.reviewer_id,
          expires_at: request.expires_at,
        });

      if (error && !error.message.includes('duplicate')) {
        console.error('Failed to apply workflow access:', error);
        throw new Error('Failed to apply workflow access');
      }
      break;
    }
  }

  // Log the change
  await supabase
    .schema('diq')
    .from('audit_logs')
    .insert({
      action: 'access_granted',
      entity_type: 'access_request',
      entity_id: request.id,
      user_id: request.reviewer_id,
      details: {
        request_type: request.request_type,
        requester_id: request.requester_id,
        old_value: request.current_value,
        new_value: request.requested_value,
      },
    });
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get access requests for a user (their own requests)
 */
export async function getUserAccessRequests(
  userContext: UserContext,
  options?: {
    status?: AccessRequestStatus;
    limit?: number;
    offset?: number;
  }
): Promise<{ requests: AccessRequest[]; total: number }> {
  let query = supabase
    .schema('diq')
    .from('access_requests')
    .select(`
      *,
      reviewer:reviewer_id(id, full_name, email, avatar_url)
    `, { count: 'exact' })
    .eq('requester_id', userContext.userId)
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching user access requests:', error);
    throw new Error('Failed to fetch access requests');
  }

  return {
    requests: data || [],
    total: count || 0,
  };
}

/**
 * Get pending requests for review (admin view)
 */
export async function getPendingAccessRequests(
  reviewerContext: UserContext,
  options?: {
    type?: AccessRequestType;
    limit?: number;
    offset?: number;
  }
): Promise<{ requests: AccessRequest[]; total: number }> {
  // Only managers and above can view pending requests
  if (ROLES[reviewerContext.role] < ROLES.manager) {
    throw new Error('Not authorized to view pending requests');
  }

  let query = supabase
    .schema('diq')
    .from('access_requests')
    .select(`
      *,
      requester:requester_id(id, full_name, email, avatar_url)
    `, { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: true }); // FIFO

  if (options?.type) {
    query = query.eq('request_type', options.type);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching pending access requests:', error);
    throw new Error('Failed to fetch pending requests');
  }

  return {
    requests: data || [],
    total: count || 0,
  };
}

/**
 * Get all access requests (admin view with filters)
 */
export async function getAllAccessRequests(
  adminContext: UserContext,
  options?: {
    status?: AccessRequestStatus;
    type?: AccessRequestType;
    requesterId?: string;
    reviewerId?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ requests: AccessRequest[]; total: number }> {
  // Only admins can view all requests
  if (!adminContext.isAdmin) {
    throw new Error('Not authorized to view all requests');
  }

  let query = supabase
    .schema('diq')
    .from('access_requests')
    .select(`
      *,
      requester:requester_id(id, full_name, email, avatar_url),
      reviewer:reviewer_id(id, full_name, email, avatar_url)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.type) {
    query = query.eq('request_type', options.type);
  }

  if (options?.requesterId) {
    query = query.eq('requester_id', options.requesterId);
  }

  if (options?.reviewerId) {
    query = query.eq('reviewer_id', options.reviewerId);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching all access requests:', error);
    throw new Error('Failed to fetch access requests');
  }

  return {
    requests: data || [],
    total: count || 0,
  };
}

/**
 * Get access request statistics
 */
export async function getAccessRequestStats(
  adminContext: UserContext
): Promise<AccessRequestStats> {
  if (!adminContext.isAdmin) {
    throw new Error('Not authorized to view statistics');
  }

  const { data, error } = await supabase
    .schema('diq')
    .from('access_requests')
    .select('status, created_at, reviewed_at');

  if (error) {
    console.error('Error fetching access request stats:', error);
    throw new Error('Failed to fetch statistics');
  }

  const stats: AccessRequestStats = {
    total: data?.length || 0,
    pending: 0,
    approved: 0,
    denied: 0,
    cancelled: 0,
    expired: 0,
    avgReviewTimeHours: 0,
  };

  let totalReviewTime = 0;
  let reviewedCount = 0;

  for (const request of data || []) {
    switch (request.status) {
      case 'pending': stats.pending++; break;
      case 'approved': stats.approved++; break;
      case 'denied': stats.denied++; break;
      case 'cancelled': stats.cancelled++; break;
      case 'expired': stats.expired++; break;
    }

    if (request.reviewed_at && request.created_at) {
      const reviewTime = new Date(request.reviewed_at).getTime() - new Date(request.created_at).getTime();
      totalReviewTime += reviewTime;
      reviewedCount++;
    }
  }

  if (reviewedCount > 0) {
    stats.avgReviewTimeHours = totalReviewTime / reviewedCount / (1000 * 60 * 60);
  }

  return stats;
}

// ============================================================================
// Notification Functions
// ============================================================================

/**
 * Notify admins of a new access request
 */
async function notifyAdminsOfNewRequest(request: AccessRequest): Promise<void> {
  try {
    // Get admin users
    const { data: admins } = await supabase
      .from('users')
      .select('id, email')
      .in('role', ['admin', 'super_admin', 'manager']);

    if (!admins || admins.length === 0) return;

    // Create notifications
    const notifications = admins.map(admin => ({
      user_id: admin.id,
      type: 'access_request',
      title: 'New Access Request',
      message: `A new ${request.request_type.replace('_', ' ')} request is awaiting review`,
      link: `/diq/admin/access-requests/${request.id}`,
      metadata: {
        request_id: request.id,
        request_type: request.request_type,
      },
    }));

    await supabase
      .schema('diq')
      .from('notifications')
      .insert(notifications);
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
}

/**
 * Notify requester of review decision
 */
async function notifyRequesterOfReview(
  request: AccessRequest,
  reviewer: UserContext
): Promise<void> {
  try {
    const statusText = request.status === 'approved' ? 'approved' : 'denied';

    await supabase
      .schema('diq')
      .from('notifications')
      .insert({
        user_id: request.requester_id,
        type: 'access_request_reviewed',
        title: `Access Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
        message: `Your ${request.request_type.replace('_', ' ')} request has been ${statusText}`,
        link: '/diq/settings?tab=access-requests',
        metadata: {
          request_id: request.id,
          request_type: request.request_type,
          status: request.status,
          reviewer_id: reviewer.userId,
        },
      });
  } catch (error) {
    console.error('Error notifying requester:', error);
  }
}

// ============================================================================
// Expiration Handler
// ============================================================================

/**
 * Expire old pending requests (run via cron)
 */
export async function expirePendingRequests(
  maxAgeDays: number = 30
): Promise<number> {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() - maxAgeDays);

  const { data, error } = await supabase
    .schema('diq')
    .from('access_requests')
    .update({
      status: 'expired',
      updated_at: new Date().toISOString(),
    })
    .eq('status', 'pending')
    .lt('created_at', expirationDate.toISOString())
    .select('id');

  if (error) {
    console.error('Error expiring requests:', error);
    return 0;
  }

  return data?.length || 0;
}
