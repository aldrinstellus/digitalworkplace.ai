/**
 * Knowledge Base Content Approval Workflow
 * Multi-stage approval system for KB articles
 *
 * V2.0 Feature: KB Multi-Stage Approval - EPIC 3
 *
 * Workflow: Draft → Review → Approve → Publish
 */

import { createClient } from '@supabase/supabase-js';
import { UserContext, ROLES } from './rbac';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// Types
// ============================================================================

export type ContentStatus = 'draft' | 'pending_review' | 'in_review' | 'approved' | 'published' | 'rejected' | 'archived';

export interface ContentApprovalStage {
  stage: 'review' | 'approval' | 'publication';
  status: 'pending' | 'completed' | 'skipped' | 'rejected';
  assignee_id?: string;
  assignee_name?: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
}

export interface ContentApprovalRequest {
  id: string;
  content_id: string;
  content_type: 'article' | 'news' | 'faq' | 'policy';
  content_title: string;
  author_id: string;
  current_status: ContentStatus;
  stages: ContentApprovalStage[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  metadata?: Record<string, unknown>;
  // Joined data
  author?: {
    id: string;
    full_name: string;
    email: string;
  };
  content?: {
    id: string;
    title: string;
    excerpt?: string;
    category?: string;
  };
}

export interface SubmitForReviewInput {
  contentId: string;
  contentType: 'article' | 'news' | 'faq' | 'policy';
  reviewerId?: string; // Optional specific reviewer
  notes?: string;
}

export interface ReviewDecisionInput {
  action: 'approve' | 'reject' | 'request_changes';
  notes?: string;
  nextReviewerId?: string; // For multi-level approval
}

export interface ContentApprovalConfig {
  requireReview: boolean;
  requireApproval: boolean;
  autoPublishOnApproval: boolean;
  reviewerRoles: string[];
  approverRoles: string[];
  notifyAuthor: boolean;
  notifyReviewers: boolean;
}

// Default configuration
const DEFAULT_CONFIG: ContentApprovalConfig = {
  requireReview: true,
  requireApproval: true,
  autoPublishOnApproval: false,
  reviewerRoles: ['editor', 'manager', 'admin', 'super_admin'],
  approverRoles: ['manager', 'admin', 'super_admin'],
  notifyAuthor: true,
  notifyReviewers: true,
};

// ============================================================================
// Workflow Functions
// ============================================================================

/**
 * Submit content for review
 */
export async function submitForReview(
  userContext: UserContext,
  input: SubmitForReviewInput
): Promise<ContentApprovalRequest> {
  const { contentId, contentType, reviewerId, notes } = input;

  // Get content details
  const { data: content, error: contentError } = await supabase
    .schema('diq')
    .from('articles')
    .select('id, title, author_id, status')
    .eq('id', contentId)
    .single();

  if (contentError || !content) {
    throw new Error('Content not found');
  }

  // Verify user is the author or has edit permissions
  if (content.author_id !== userContext.userId && ROLES[userContext.role] < ROLES.editor) {
    throw new Error('Not authorized to submit this content for review');
  }

  // Check if already in review
  if (content.status !== 'draft') {
    throw new Error('Content must be in draft status to submit for review');
  }

  // Create approval request
  const stages: ContentApprovalStage[] = [
    {
      stage: 'review',
      status: 'pending',
      assignee_id: reviewerId,
      started_at: new Date().toISOString(),
    },
    {
      stage: 'approval',
      status: 'pending',
    },
    {
      stage: 'publication',
      status: 'pending',
    },
  ];

  const { data: approvalRequest, error: insertError } = await supabase
    .schema('diq')
    .from('content_approvals')
    .insert({
      content_id: contentId,
      content_type: contentType,
      content_title: content.title,
      author_id: content.author_id,
      current_status: 'pending_review',
      stages,
      metadata: { submission_notes: notes },
    })
    .select('*')
    .single();

  if (insertError) {
    console.error('Error creating approval request:', insertError);
    throw new Error('Failed to submit for review');
  }

  // Update content status
  await supabase
    .schema('diq')
    .from('articles')
    .update({
      status: 'pending_review',
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId);

  // Notify reviewers
  await notifyReviewers(approvalRequest, 'New content pending review');

  // Log the action
  await logApprovalAction(contentId, 'submitted_for_review', userContext.userId, notes);

  return approvalRequest;
}

/**
 * Start reviewing content
 */
export async function startReview(
  userContext: UserContext,
  approvalId: string
): Promise<ContentApprovalRequest> {
  // Check reviewer permissions
  if (!DEFAULT_CONFIG.reviewerRoles.includes(userContext.role)) {
    throw new Error('Not authorized to review content');
  }

  // Get approval request
  const { data: approval, error } = await supabase
    .schema('diq')
    .from('content_approvals')
    .select('*')
    .eq('id', approvalId)
    .single();

  if (error || !approval) {
    throw new Error('Approval request not found');
  }

  if (approval.current_status !== 'pending_review') {
    throw new Error('Content is not pending review');
  }

  // Update stages
  const stages = [...approval.stages];
  const reviewStage = stages.find(s => s.stage === 'review');
  if (reviewStage) {
    reviewStage.status = 'completed';
    reviewStage.assignee_id = userContext.userId;
    reviewStage.completed_at = new Date().toISOString();
  }

  // Update approval request
  const { data: updated, error: updateError } = await supabase
    .schema('diq')
    .from('content_approvals')
    .update({
      current_status: 'in_review',
      stages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', approvalId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error('Failed to start review');
  }

  // Update content status
  await supabase
    .schema('diq')
    .from('articles')
    .update({
      status: 'in_review',
      updated_at: new Date().toISOString(),
    })
    .eq('id', approval.content_id);

  // Log the action
  await logApprovalAction(approval.content_id, 'review_started', userContext.userId);

  return updated;
}

/**
 * Complete review with decision
 */
export async function completeReview(
  userContext: UserContext,
  approvalId: string,
  decision: ReviewDecisionInput
): Promise<ContentApprovalRequest> {
  // Check reviewer permissions
  if (!DEFAULT_CONFIG.reviewerRoles.includes(userContext.role)) {
    throw new Error('Not authorized to review content');
  }

  // Get approval request
  const { data: approval, error } = await supabase
    .schema('diq')
    .from('content_approvals')
    .select('*')
    .eq('id', approvalId)
    .single();

  if (error || !approval) {
    throw new Error('Approval request not found');
  }

  if (approval.current_status !== 'in_review') {
    throw new Error('Content is not in review');
  }

  const stages = [...approval.stages];
  const reviewStage = stages.find(s => s.stage === 'review');
  const approvalStage = stages.find(s => s.stage === 'approval');

  let newStatus: ContentStatus;

  switch (decision.action) {
    case 'approve':
      // Move to approval stage
      if (reviewStage) {
        reviewStage.status = 'completed';
        reviewStage.notes = decision.notes;
      }
      if (approvalStage) {
        approvalStage.status = 'pending';
        approvalStage.started_at = new Date().toISOString();
        approvalStage.assignee_id = decision.nextReviewerId;
      }
      newStatus = 'approved';
      break;

    case 'reject':
      if (reviewStage) {
        reviewStage.status = 'rejected';
        reviewStage.notes = decision.notes;
      }
      newStatus = 'rejected';
      break;

    case 'request_changes':
      if (reviewStage) {
        reviewStage.status = 'pending';
        reviewStage.notes = decision.notes;
      }
      newStatus = 'draft'; // Send back to draft
      break;

    default:
      throw new Error('Invalid decision action');
  }

  // Update approval request
  const { data: updated, error: updateError } = await supabase
    .schema('diq')
    .from('content_approvals')
    .update({
      current_status: newStatus,
      stages,
      updated_at: new Date().toISOString(),
      ...(decision.action === 'reject' ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', approvalId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error('Failed to complete review');
  }

  // Update content status
  await supabase
    .schema('diq')
    .from('articles')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', approval.content_id);

  // Notify author
  if (DEFAULT_CONFIG.notifyAuthor) {
    await notifyAuthor(approval, decision.action, decision.notes);
  }

  // If approved, notify approvers
  if (decision.action === 'approve' && DEFAULT_CONFIG.notifyReviewers) {
    await notifyApprovers(updated, 'Content ready for final approval');
  }

  // Log the action
  await logApprovalAction(
    approval.content_id,
    `review_${decision.action}`,
    userContext.userId,
    decision.notes
  );

  return updated;
}

/**
 * Final approval and optional publish
 */
export async function approveAndPublish(
  userContext: UserContext,
  approvalId: string,
  autoPublish: boolean = false,
  notes?: string
): Promise<ContentApprovalRequest> {
  // Check approver permissions
  if (!DEFAULT_CONFIG.approverRoles.includes(userContext.role)) {
    throw new Error('Not authorized to approve content');
  }

  // Get approval request
  const { data: approval, error } = await supabase
    .schema('diq')
    .from('content_approvals')
    .select('*')
    .eq('id', approvalId)
    .single();

  if (error || !approval) {
    throw new Error('Approval request not found');
  }

  if (approval.current_status !== 'approved') {
    throw new Error('Content must be approved before publishing');
  }

  const stages = [...approval.stages];
  const approvalStage = stages.find(s => s.stage === 'approval');
  const publicationStage = stages.find(s => s.stage === 'publication');

  if (approvalStage) {
    approvalStage.status = 'completed';
    approvalStage.assignee_id = userContext.userId;
    approvalStage.completed_at = new Date().toISOString();
    approvalStage.notes = notes;
  }

  let newStatus: ContentStatus = 'approved';

  if (autoPublish || DEFAULT_CONFIG.autoPublishOnApproval) {
    if (publicationStage) {
      publicationStage.status = 'completed';
      publicationStage.assignee_id = userContext.userId;
      publicationStage.completed_at = new Date().toISOString();
    }
    newStatus = 'published';
  }

  // Update approval request
  const { data: updated, error: updateError } = await supabase
    .schema('diq')
    .from('content_approvals')
    .update({
      current_status: newStatus,
      stages,
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .eq('id', approvalId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error('Failed to approve content');
  }

  // Update content status
  await supabase
    .schema('diq')
    .from('articles')
    .update({
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', approval.content_id);

  // Notify author
  if (DEFAULT_CONFIG.notifyAuthor) {
    await notifyAuthor(approval, newStatus === 'published' ? 'published' : 'approved', notes);
  }

  // Log the action
  await logApprovalAction(
    approval.content_id,
    newStatus === 'published' ? 'published' : 'final_approval',
    userContext.userId,
    notes
  );

  return updated;
}

/**
 * Publish approved content
 */
export async function publishContent(
  userContext: UserContext,
  contentId: string
): Promise<void> {
  // Check permissions
  if (!DEFAULT_CONFIG.approverRoles.includes(userContext.role)) {
    throw new Error('Not authorized to publish content');
  }

  // Get content
  const { data: content, error } = await supabase
    .schema('diq')
    .from('articles')
    .select('id, status')
    .eq('id', contentId)
    .single();

  if (error || !content) {
    throw new Error('Content not found');
  }

  if (content.status !== 'approved') {
    throw new Error('Content must be approved before publishing');
  }

  // Update content status
  await supabase
    .schema('diq')
    .from('articles')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId);

  // Update any pending approval request
  await supabase
    .schema('diq')
    .from('content_approvals')
    .update({
      current_status: 'published',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('content_id', contentId)
    .eq('current_status', 'approved');

  // Log the action
  await logApprovalAction(contentId, 'published', userContext.userId);
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get pending approvals for a reviewer
 */
export async function getPendingApprovals(
  userContext: UserContext,
  options?: { status?: ContentStatus; limit?: number; offset?: number }
): Promise<{ approvals: ContentApprovalRequest[]; total: number }> {
  // Check reviewer permissions
  const isReviewer = DEFAULT_CONFIG.reviewerRoles.includes(userContext.role);
  const isApprover = DEFAULT_CONFIG.approverRoles.includes(userContext.role);

  if (!isReviewer && !isApprover) {
    return { approvals: [], total: 0 };
  }

  let query = supabase
    .schema('diq')
    .from('content_approvals')
    .select(`
      *,
      author:author_id(id, full_name, email)
    `, { count: 'exact' })
    .order('created_at', { ascending: true });

  // Filter by role
  if (isReviewer && !isApprover) {
    query = query.in('current_status', ['pending_review', 'in_review']);
  } else if (isApprover && !isReviewer) {
    query = query.eq('current_status', 'approved');
  } else {
    query = query.in('current_status', ['pending_review', 'in_review', 'approved']);
  }

  if (options?.status) {
    query = query.eq('current_status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error('Failed to fetch pending approvals');
  }

  return {
    approvals: data || [],
    total: count || 0,
  };
}

/**
 * Get approval history for content
 */
export async function getContentApprovalHistory(
  contentId: string
): Promise<ContentApprovalRequest[]> {
  const { data, error } = await supabase
    .schema('diq')
    .from('content_approvals')
    .select(`
      *,
      author:author_id(id, full_name, email)
    `)
    .eq('content_id', contentId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch approval history');
  }

  return data || [];
}

// ============================================================================
// Helper Functions
// ============================================================================

async function notifyReviewers(approval: ContentApprovalRequest, message: string): Promise<void> {
  // Get users with reviewer roles
  const { data: reviewers } = await supabase
    .from('users')
    .select('id')
    .in('role', DEFAULT_CONFIG.reviewerRoles);

  if (!reviewers || reviewers.length === 0) return;

  const notifications = reviewers.map(r => ({
    user_id: r.id,
    type: 'content_review',
    title: 'Content Review Required',
    message: `${message}: "${approval.content_title}"`,
    link: `/diq/admin/content-review/${approval.id}`,
    metadata: {
      approval_id: approval.id,
      content_id: approval.content_id,
      content_type: approval.content_type,
    },
  }));

  await supabase.schema('diq').from('notifications').insert(notifications);
}

async function notifyApprovers(approval: ContentApprovalRequest, message: string): Promise<void> {
  const { data: approvers } = await supabase
    .from('users')
    .select('id')
    .in('role', DEFAULT_CONFIG.approverRoles);

  if (!approvers || approvers.length === 0) return;

  const notifications = approvers.map(a => ({
    user_id: a.id,
    type: 'content_approval',
    title: 'Content Approval Required',
    message: `${message}: "${approval.content_title}"`,
    link: `/diq/admin/content-review/${approval.id}`,
    metadata: {
      approval_id: approval.id,
      content_id: approval.content_id,
      content_type: approval.content_type,
    },
  }));

  await supabase.schema('diq').from('notifications').insert(notifications);
}

async function notifyAuthor(
  approval: ContentApprovalRequest,
  action: string,
  notes?: string
): Promise<void> {
  const actionMessages: Record<string, string> = {
    approve: 'Your content has been approved and is ready for publication',
    reject: 'Your content was not approved',
    request_changes: 'Changes have been requested for your content',
    published: 'Your content has been published',
    approved: 'Your content has been approved',
  };

  await supabase.schema('diq').from('notifications').insert({
    user_id: approval.author_id,
    type: 'content_status',
    title: `Content ${action.charAt(0).toUpperCase() + action.slice(1)}`,
    message: actionMessages[action] || `Your content status has changed to: ${action}`,
    link: `/diq/content/${approval.content_id}`,
    metadata: {
      approval_id: approval.id,
      content_id: approval.content_id,
      action,
      notes,
    },
  });
}

async function logApprovalAction(
  contentId: string,
  action: string,
  userId: string,
  notes?: string
): Promise<void> {
  await supabase.schema('diq').from('audit_logs').insert({
    action,
    entity_type: 'article',
    entity_id: contentId,
    user_id: userId,
    details: { notes },
  });
}
