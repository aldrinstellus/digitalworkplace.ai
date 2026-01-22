import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/tracking/pageview - Track a page view
export async function POST(request: NextRequest) {
  try {
    const { userId: authClerkId } = await auth();

    if (!authClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId,
      sessionId,
      projectCode,
      pagePath,
      pageTitle,
      referrer,
      referrerProjectCode,
    } = body;

    if (!userId || !sessionId || !projectCode || !pagePath) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify session belongs to authenticated user
    const { data: session } = await supabaseAdmin
      .from('user_sessions')
      .select('clerk_id')
      .eq('id', sessionId)
      .single();

    if (!session || session.clerk_id !== authClerkId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 403 });
    }

    // Create page view
    const { data: pageView, error } = await supabaseAdmin
      .from('page_views')
      .insert({
        session_id: sessionId,
        user_id: userId,
        project_code: projectCode,
        page_path: pagePath,
        page_title: pageTitle || null,
        referrer: referrer || null,
        referrer_project_code: referrerProjectCode || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating page view:', error);
      return NextResponse.json({ error: 'Failed to track page view' }, { status: 500 });
    }

    return NextResponse.json({
      pageViewId: pageView.id,
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tracking/pageview - Update page view (end)
export async function PUT(request: NextRequest) {
  try {
    const { userId: authClerkId } = await auth();

    if (!authClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      pageViewId,
      timeOnPageSeconds,
      scrollDepthPercent,
      clickCount,
    } = body;

    if (!pageViewId) {
      return NextResponse.json({ error: 'Missing pageViewId' }, { status: 400 });
    }

    // Update page view
    const { error } = await supabaseAdmin
      .from('page_views')
      .update({
        exited_at: new Date().toISOString(),
        time_on_page_seconds: timeOnPageSeconds || 0,
        scroll_depth_percent: scrollDepthPercent || 0,
        click_count: clickCount || 0,
      })
      .eq('id', pageViewId);

    if (error) {
      console.error('Error updating page view:', error);
      return NextResponse.json({ error: 'Failed to update page view' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating page view:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
