/**
 * Content Approval API
 * Handles KB content approval workflow
 *
 * V2.0 Feature: KB Multi-Stage Approval - EPIC 3
 *
 * GET /api/content/approval - Get pending approvals
 * POST /api/content/approval - Submit content for review
 * PATCH /api/content/approval - Update approval status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserContext } from '@/lib/rbac';
import {
  submitForReview,
  startReview,
  completeReview,
  approveAndPublish,
  getPendingApprovals,
  getContentApprovalHistory,
} from '@/lib/content-approval';

/**
 * GET - Get pending approvals or approval history
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
    const contentId = searchParams.get('contentId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get history for specific content
    if (contentId) {
      const history = await getContentApprovalHistory(contentId);
      return NextResponse.json({ history });
    }

    // Get pending approvals
    const result = await getPendingApprovals(userContext, {
      status: status as any,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/content/approval:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
      { status: 500 }
    );
  }
}

/**
 * POST - Submit content for review
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
    const { contentId, contentType, reviewerId, notes } = body;

    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: contentId, contentType' },
        { status: 400 }
      );
    }

    const approval = await submitForReview(userContext, {
      contentId,
      contentType,
      reviewerId,
      notes,
    });

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/content/approval:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit for review' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update approval status (start review, complete review, approve, publish)
 */
export async function PATCH(request: NextRequest) {
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
    const { approvalId, action, notes, nextReviewerId, autoPublish } = body;

    if (!approvalId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: approvalId, action' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'start_review':
        result = await startReview(userContext, approvalId);
        break;

      case 'approve':
      case 'reject':
      case 'request_changes':
        result = await completeReview(userContext, approvalId, {
          action,
          notes,
          nextReviewerId,
        });
        break;

      case 'final_approve':
        result = await approveAndPublish(userContext, approvalId, autoPublish, notes);
        break;

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PATCH /api/content/approval:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update approval' },
      { status: 500 }
    );
  }
}
