import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/tracking/session/end - End session via sendBeacon
// This endpoint doesn't require auth because sendBeacon can't set headers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, user_id, ended_at } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Get session start time
    const { data: session } = await supabaseAdmin
      .from('user_sessions')
      .select('started_at, user_id')
      .eq('id', session_id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify user_id matches (basic security check)
    if (user_id && session.user_id !== user_id) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 403 });
    }

    // Calculate duration
    const startedAt = new Date(session.started_at);
    const endedAtDate = ended_at ? new Date(ended_at) : new Date();
    const durationSeconds = Math.floor((endedAtDate.getTime() - startedAt.getTime()) / 1000);

    // Update session
    await supabaseAdmin
      .from('user_sessions')
      .update({
        ended_at: endedAtDate.toISOString(),
        is_active: false,
        duration_seconds: durationSeconds,
      })
      .eq('id', session_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
