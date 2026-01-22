import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/tracking/session - Start a new session
export async function POST(request: NextRequest) {
  try {
    const { userId: authClerkId } = await auth();
    const body = await request.json();
    const { action, clerkId } = body;

    // Verify the request is from authenticated user
    if (!authClerkId || authClerkId !== clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'start') {
      // Get user from Supabase
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .single();

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Parse user agent for device info
      const userAgent = request.headers.get('user-agent') || '';
      const deviceInfo = parseUserAgent(userAgent);

      // Create new session
      const { data: session, error } = await supabaseAdmin
        .from('user_sessions')
        .insert({
          user_id: user.id,
          clerk_id: clerkId,
          user_agent: userAgent,
          device_type: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          is_active: true,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating session:', error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
      }

      return NextResponse.json({
        sessionId: session.id,
        userId: user.id,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in session tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tracking/session - Update session (heartbeat)
export async function PUT(request: NextRequest) {
  try {
    const { userId: authClerkId } = await auth();
    const body = await request.json();
    const { sessionId, action } = body;

    if (!authClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'heartbeat' && sessionId) {
      await supabaseAdmin
        .from('user_sessions')
        .update({
          last_heartbeat_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      return NextResponse.json({ success: true });
    }

    if (action === 'end' && sessionId) {
      // Get session start time
      const { data: session } = await supabaseAdmin
        .from('user_sessions')
        .select('started_at')
        .eq('id', sessionId)
        .single();

      if (session) {
        const startedAt = new Date(session.started_at);
        const durationSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);

        await supabaseAdmin
          .from('user_sessions')
          .update({
            ended_at: new Date().toISOString(),
            is_active: false,
            duration_seconds: durationSeconds,
          })
          .eq('id', sessionId);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper to parse user agent
function parseUserAgent(ua: string): { deviceType: string; browser: string; os: string } {
  // Device type detection
  let deviceType = 'desktop';
  if (/Mobi|Android/i.test(ua)) {
    deviceType = /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile';
  }

  // Browser detection
  let browser = 'unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
  }

  // OS detection
  let os = 'unknown';
  if (ua.includes('Windows')) {
    os = 'Windows';
  } else if (ua.includes('Mac')) {
    os = 'macOS';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
  }

  return { deviceType, browser, os };
}
