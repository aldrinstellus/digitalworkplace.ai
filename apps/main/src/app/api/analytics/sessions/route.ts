import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super_admin
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('clerk_id', clerkId)
      .single();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = searchParams.get('end') || new Date().toISOString();
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch sessions with user details
    const { data: sessions, error } = await supabaseAdmin
      .from('user_sessions')
      .select(`
        id,
        user_id,
        started_at,
        ended_at,
        duration_seconds,
        device_type,
        browser,
        os,
        is_active,
        users!inner(email, full_name)
      `)
      .gte('started_at', start)
      .lte('started_at', end)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // Transform data
    const transformedSessions = (sessions || []).map((session: any) => ({
      id: session.id,
      user_id: session.user_id,
      user_email: session.users?.email || 'Unknown',
      user_name: session.users?.full_name || 'Unknown',
      started_at: session.started_at,
      ended_at: session.ended_at,
      duration_seconds: session.duration_seconds || 0,
      device_type: session.device_type || 'unknown',
      browser: session.browser || 'unknown',
      os: session.os || 'unknown',
      is_active: session.is_active,
    }));

    // Get total count
    const { count } = await supabaseAdmin
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', start)
      .lte('started_at', end);

    return NextResponse.json({
      data: transformedSessions,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0),
      },
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
