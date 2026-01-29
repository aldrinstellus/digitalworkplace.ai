/**
 * Workflow Approvals API
 * Handles human-in-the-loop approval operations
 *
 * V2.0 Feature: Human Approval Nodes - EPIC 6
 *
 * GET /api/workflows/approvals - Get pending approvals for user
 * POST /api/workflows/approvals - Submit approval response
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserContext } from '@/lib/rbac';
import {
  getPendingApprovalsForUser,
  submitApprovalResponse,
  getApproval,
} from '@/lib/workflow/approval';

/**
 * GET - Get pending approvals for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userContext = await getUserContext(clerkUserId);
    if (!userContext) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check for specific approval ID
    const approvalId = searchParams.get('id');
    if (approvalId) {
      const approval = await getApproval(approvalId);
      if (!approval) {
        return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
      }
      // Check if user is an approver
      if (!approval.approvers.includes(userContext.userId) && !userContext.isAdmin) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
      return NextResponse.json(approval);
    }

    // Get pending approvals
    const result = await getPendingApprovalsForUser(userContext.userId, {
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/workflows/approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
      { status: 500 }
    );
  }
}

/**
 * POST - Submit an approval response
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userContext = await getUserContext(clerkUserId);
    if (!userContext) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { approvalId, action, comment } = body;

    // Validate required fields
    if (!approvalId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: approvalId, action' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const result = await submitApprovalResponse(
      approvalId,
      userContext.userId,
      action,
      comment
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/workflows/approvals:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit response' },
      { status: 500 }
    );
  }
}
