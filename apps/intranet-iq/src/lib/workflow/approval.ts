/**
 * Workflow Human Approval System
 * Handles human-in-the-loop approval nodes for workflows
 *
 * V2.0 Feature: Human Approval Nodes - EPIC 6
 */

import { createClient } from '@supabase/supabase-js';
import type { ApprovalConfig } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// Types
// ============================================================================

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'timeout' | 'escalated' | 'cancelled';

export interface WorkflowApproval {
  id: string;
  execution_id: string;
  workflow_id: string;
  step_id: string;
  status: ApprovalStatus;
  title: string;
  description?: string;
  instructions?: string;
  input_data: Record<string, unknown>;
  approvers: string[];
  required_approvals: number;
  current_approvals: number;
  current_rejections: number;
  responses: ApprovalResponse[];
  timeout_at?: string;
  timeout_action?: 'approve' | 'reject' | 'escalate';
  escalate_to?: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  metadata?: Record<string, unknown>;
}

export interface ApprovalResponse {
  user_id: string;
  user_name?: string;
  action: 'approve' | 'reject';
  comment?: string;
  responded_at: string;
}

export interface CreateApprovalInput {
  executionId: string;
  workflowId: string;
  stepId: string;
  config: ApprovalConfig;
  inputData: Record<string, unknown>;
}

export interface ApprovalResult {
  approved: boolean;
  status: ApprovalStatus;
  responses: ApprovalResponse[];
  completedAt?: string;
}

// ============================================================================
// Approval Creation
// ============================================================================

/**
 * Create a pending approval request
 */
export async function createApprovalRequest(
  input: CreateApprovalInput
): Promise<WorkflowApproval> {
  const { executionId, workflowId, stepId, config, inputData } = input;

  // Resolve approvers based on config
  const approverIds = await resolveApprovers(config.approvers);

  if (approverIds.length === 0) {
    throw new Error('No approvers configured for approval step');
  }

  // Calculate timeout
  let timeoutAt: string | undefined;
  if (config.timeout?.duration) {
    const timeout = new Date();
    timeout.setHours(timeout.getHours() + config.timeout.duration);
    timeoutAt = timeout.toISOString();
  }

  // Determine required approvals
  const requiredApprovals = config.approvalType === 'any'
    ? 1
    : config.approvalType === 'multiple'
      ? (config.requiredApprovals || Math.ceil(approverIds.length / 2))
      : approverIds.length; // 'single' requires all

  // Create approval record
  const { data, error } = await supabase
    .schema('diq')
    .from('workflow_approvals')
    .insert({
      execution_id: executionId,
      workflow_id: workflowId,
      step_id: stepId,
      status: 'pending',
      title: config.title || 'Workflow Approval Required',
      description: config.description,
      instructions: config.instructions,
      input_data: inputData,
      approvers: approverIds,
      required_approvals: requiredApprovals,
      current_approvals: 0,
      current_rejections: 0,
      responses: [],
      timeout_at: timeoutAt,
      timeout_action: config.timeout?.action,
      escalate_to: config.timeout?.escalateTo,
      metadata: config.metadata,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating approval request:', error);
    throw new Error('Failed to create approval request');
  }

  // Update execution status to 'waiting_approval'
  await supabase
    .schema('diq')
    .from('workflow_executions')
    .update({
      status: 'waiting_approval',
      current_step_id: stepId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', executionId);

  // Send notifications
  if (config.notifications?.onRequest !== false) {
    await notifyApprovers(data, config.notifications?.channels || ['in_app']);
  }

  return data;
}

/**
 * Resolve approver IDs from config
 */
async function resolveApprovers(config: ApprovalConfig['approvers']): Promise<string[]> {
  const approverIds: string[] = [];

  switch (config.type) {
    case 'user':
      // Direct user IDs
      approverIds.push(...config.ids);
      break;

    case 'role': {
      // Get users with specified roles
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .in('role', config.ids);
      if (users) {
        approverIds.push(...users.map(u => u.id));
      }
      break;
    }

    case 'department': {
      // Get employees in specified departments
      const { data: employees } = await supabase
        .schema('diq')
        .from('employees')
        .select('user_id')
        .in('department_id', config.ids);
      if (employees) {
        approverIds.push(...employees.map(e => e.user_id).filter(Boolean));
      }
      break;
    }
  }

  return [...new Set(approverIds)]; // Remove duplicates
}

// ============================================================================
// Approval Processing
// ============================================================================

/**
 * Submit an approval response
 */
export async function submitApprovalResponse(
  approvalId: string,
  userId: string,
  action: 'approve' | 'reject',
  comment?: string
): Promise<ApprovalResult> {
  // Get the approval request
  const { data: approval, error: fetchError } = await supabase
    .schema('diq')
    .from('workflow_approvals')
    .select('*')
    .eq('id', approvalId)
    .single();

  if (fetchError || !approval) {
    throw new Error('Approval request not found');
  }

  // Check if user is an approver
  if (!approval.approvers.includes(userId)) {
    throw new Error('User is not an authorized approver');
  }

  // Check if already responded
  const existingResponse = approval.responses.find(
    (r: ApprovalResponse) => r.user_id === userId
  );
  if (existingResponse) {
    throw new Error('User has already responded');
  }

  // Check if already completed
  if (approval.status !== 'pending') {
    throw new Error('Approval request is no longer pending');
  }

  // Get user name
  const { data: user } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', userId)
    .single();

  // Add response
  const newResponse: ApprovalResponse = {
    user_id: userId,
    user_name: user?.full_name,
    action,
    comment,
    responded_at: new Date().toISOString(),
  };

  const responses = [...approval.responses, newResponse];
  const currentApprovals = action === 'approve'
    ? approval.current_approvals + 1
    : approval.current_approvals;
  const currentRejections = action === 'reject'
    ? approval.current_rejections + 1
    : approval.current_rejections;

  // Determine if approval is complete
  let status: ApprovalStatus = 'pending';
  let completedAt: string | undefined;

  if (currentApprovals >= approval.required_approvals) {
    status = 'approved';
    completedAt = new Date().toISOString();
  } else if (currentRejections > (approval.approvers.length - approval.required_approvals)) {
    // Too many rejections to reach required approvals
    status = 'rejected';
    completedAt = new Date().toISOString();
  }

  // Update approval record
  const { error: updateError } = await supabase
    .schema('diq')
    .from('workflow_approvals')
    .update({
      status,
      current_approvals: currentApprovals,
      current_rejections: currentRejections,
      responses,
      completed_at: completedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', approvalId);

  if (updateError) {
    throw new Error('Failed to update approval');
  }

  // If completed, resume workflow execution
  if (status !== 'pending') {
    await resumeWorkflowExecution(approval.execution_id, status === 'approved');
  }

  return {
    approved: status === 'approved',
    status,
    responses,
    completedAt,
  };
}

/**
 * Process approval timeout
 */
export async function processApprovalTimeout(approvalId: string): Promise<void> {
  const { data: approval, error } = await supabase
    .schema('diq')
    .from('workflow_approvals')
    .select('*')
    .eq('id', approvalId)
    .eq('status', 'pending')
    .single();

  if (error || !approval) {
    return; // Already processed or not found
  }

  // Check if actually timed out
  if (approval.timeout_at && new Date(approval.timeout_at) <= new Date()) {
    const timeoutAction = approval.timeout_action || 'reject';
    const newStatus: ApprovalStatus = 'timeout';

    if (timeoutAction === 'escalate' && approval.escalate_to?.length) {
      // Escalate to new approvers
      const { error: escalateError } = await supabase
        .schema('diq')
        .from('workflow_approvals')
        .update({
          status: 'escalated',
          approvers: approval.escalate_to,
          timeout_at: null, // Clear timeout for escalated request
          updated_at: new Date().toISOString(),
        })
        .eq('id', approvalId);

      if (!escalateError) {
        // Notify new approvers
        await notifyApprovers({ ...approval, approvers: approval.escalate_to }, ['in_app', 'email']);
        return;
      }
    }

    // Update to timeout status
    await supabase
      .schema('diq')
      .from('workflow_approvals')
      .update({
        status: newStatus,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', approvalId);

    // Resume workflow based on timeout action
    const approved = timeoutAction === 'approve';
    await resumeWorkflowExecution(approval.execution_id, approved);
  }
}

/**
 * Cancel a pending approval
 */
export async function cancelApproval(
  approvalId: string,
  reason?: string
): Promise<void> {
  const { error } = await supabase
    .schema('diq')
    .from('workflow_approvals')
    .update({
      status: 'cancelled',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: { cancellation_reason: reason },
    })
    .eq('id', approvalId)
    .eq('status', 'pending');

  if (error) {
    throw new Error('Failed to cancel approval');
  }
}

// ============================================================================
// Workflow Resumption
// ============================================================================

/**
 * Resume workflow execution after approval
 */
async function resumeWorkflowExecution(
  executionId: string,
  approved: boolean
): Promise<void> {
  // Update execution status
  await supabase
    .schema('diq')
    .from('workflow_executions')
    .update({
      status: 'running',
      updated_at: new Date().toISOString(),
      metadata: {
        approval_result: approved ? 'approved' : 'rejected',
        resumed_at: new Date().toISOString(),
      },
    })
    .eq('id', executionId);

  // The workflow executor will pick this up on next poll
  // or we can trigger it via a webhook
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    await fetch(`${baseUrl}/diq/api/workflows/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        executionId,
        approved,
      }),
    });
  } catch (error) {
    console.error('Failed to trigger workflow resume:', error);
    // Non-critical - execution will be picked up by polling
  }
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get pending approvals for a user
 */
export async function getPendingApprovalsForUser(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ approvals: WorkflowApproval[]; total: number }> {
  const { data, error, count } = await supabase
    .schema('diq')
    .from('workflow_approvals')
    .select('*', { count: 'exact' })
    .eq('status', 'pending')
    .contains('approvers', [userId])
    .order('created_at', { ascending: true })
    .range(
      options?.offset || 0,
      (options?.offset || 0) + (options?.limit || 20) - 1
    );

  if (error) {
    throw new Error('Failed to fetch pending approvals');
  }

  // Filter out already responded
  const pendingForUser = (data || []).filter(
    approval => !approval.responses.some((r: ApprovalResponse) => r.user_id === userId)
  );

  return {
    approvals: pendingForUser,
    total: count || 0,
  };
}

/**
 * Get approval by ID
 */
export async function getApproval(approvalId: string): Promise<WorkflowApproval | null> {
  const { data, error } = await supabase
    .schema('diq')
    .from('workflow_approvals')
    .select('*')
    .eq('id', approvalId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Get approvals for a workflow execution
 */
export async function getExecutionApprovals(
  executionId: string
): Promise<WorkflowApproval[]> {
  const { data, error } = await supabase
    .schema('diq')
    .from('workflow_approvals')
    .select('*')
    .eq('execution_id', executionId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error('Failed to fetch execution approvals');
  }

  return data || [];
}

// ============================================================================
// Notifications
// ============================================================================

/**
 * Notify approvers of pending approval
 */
async function notifyApprovers(
  approval: WorkflowApproval,
  channels: ('email' | 'in_app' | 'slack')[]
): Promise<void> {
  const notifications = approval.approvers.map(userId => ({
    user_id: userId,
    type: 'workflow_approval',
    title: `Approval Required: ${approval.title}`,
    message: approval.description || 'A workflow is waiting for your approval',
    link: `/diq/approvals/${approval.id}`,
    metadata: {
      approval_id: approval.id,
      workflow_id: approval.workflow_id,
      execution_id: approval.execution_id,
    },
  }));

  // In-app notifications
  if (channels.includes('in_app')) {
    await supabase
      .schema('diq')
      .from('notifications')
      .insert(notifications);
  }

  // Email notifications would be handled by a separate service
  // Slack notifications would use the Slack API
}
