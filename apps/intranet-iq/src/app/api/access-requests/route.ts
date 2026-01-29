/**
 * Access Requests API
 * Handles CRUD operations for access requests
 *
 * V2.0 Feature: Access Request Workflow - EPIC 5
 *
 * GET /api/access-requests - Get requests (user's own or all for admin)
 * POST /api/access-requests - Create a new request
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserContext } from '@/lib/rbac';
import {
  createAccessRequest,
  getUserAccessRequests,
  getPendingAccessRequests,
  getAllAccessRequests,
  getAccessRequestStats,
  AccessRequestStatus,
  AccessRequestType,
} from '@/lib/access-requests';

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
    const view = searchParams.get('view') || 'my'; // 'my', 'pending', 'all'
    const status = searchParams.get('status') as AccessRequestStatus | null;
    const type = searchParams.get('type') as AccessRequestType | null;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Stats request
    if (searchParams.get('stats') === 'true') {
      const stats = await getAccessRequestStats(userContext);
      return NextResponse.json(stats);
    }

    let result;

    switch (view) {
      case 'pending':
        result = await getPendingAccessRequests(userContext, {
          type: type || undefined,
          limit,
          offset,
        });
        break;

      case 'all':
        result = await getAllAccessRequests(userContext, {
          status: status || undefined,
          type: type || undefined,
          limit,
          offset,
        });
        break;

      case 'my':
      default:
        result = await getUserAccessRequests(userContext, {
          status: status || undefined,
          limit,
          offset,
        });
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/access-requests:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

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
    const {
      requestType,
      requestedValue,
      reason,
      currentValue,
      expiresAt,
      metadata,
    } = body;

    // Validate required fields
    if (!requestType || !requestedValue || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: requestType, requestedValue, reason' },
        { status: 400 }
      );
    }

    const accessRequest = await createAccessRequest(userContext, {
      requestType,
      requestedValue,
      reason,
      currentValue,
      expiresAt,
      metadata,
    });

    return NextResponse.json(accessRequest, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/access-requests:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create request' },
      { status: error instanceof Error && error.message.includes('pending') ? 409 : 500 }
    );
  }
}
