/**
 * Access Request Detail API
 * Handles operations on specific access requests
 *
 * V2.0 Feature: Access Request Workflow - EPIC 5
 *
 * GET /api/access-requests/[id] - Get request details
 * PATCH /api/access-requests/[id] - Review (approve/deny) request
 * DELETE /api/access-requests/[id] - Cancel request
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserContext, ROLES } from '@/lib/rbac';
import {
  reviewAccessRequest,
  cancelAccessRequest,
} from '@/lib/access-requests';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * GET - Get access request details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { id } = await params;

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userContext = await getUserContext(clerkUserId);
    if (!userContext) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the request
    const { data: accessRequest, error } = await supabase
      .schema('diq')
      .from('access_requests')
      .select(`
        *,
        requester:requester_id(id, full_name, email, avatar_url),
        reviewer:reviewer_id(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error || !accessRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check authorization - user can see their own or admins can see all
    if (accessRequest.requester_id !== userContext.userId && !userContext.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json(accessRequest);
  } catch (error) {
    console.error('Error in GET /api/access-requests/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Review (approve/deny) an access request
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { id } = await params;

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userContext = await getUserContext(clerkUserId);
    if (!userContext) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has review permissions
    if (ROLES[userContext.role] < ROLES.manager) {
      return NextResponse.json(
        { error: 'Not authorized to review access requests' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, notes } = body;

    // Validate status
    if (!['approved', 'denied'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be "approved" or "denied"' },
        { status: 400 }
      );
    }

    const accessRequest = await reviewAccessRequest(userContext, id, {
      status,
      notes,
    });

    return NextResponse.json(accessRequest);
  } catch (error) {
    console.error('Error in PATCH /api/access-requests/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to review request' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Cancel an access request
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { id } = await params;

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userContext = await getUserContext(clerkUserId);
    if (!userContext) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const accessRequest = await cancelAccessRequest(userContext, id);

    return NextResponse.json(accessRequest);
  } catch (error) {
    console.error('Error in DELETE /api/access-requests/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel request' },
      { status: 500 }
    );
  }
}
