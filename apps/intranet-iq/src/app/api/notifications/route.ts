/**
 * Notifications API Route
 * Handles fetching, creating, and managing user notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Notification {
  id: string;
  user_id: string;
  type: 'mention' | 'reaction' | 'comment' | 'assignment' | 'system' | 'reminder';
  entity_type?: string;
  entity_id?: string;
  actor_id?: string;
  actor?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  title: string;
  message?: string;
  link?: string;
  read: boolean;
  read_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// GET - Fetch notifications for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Build query
    let query = supabase
      .schema('diq')
      .from('notifications')
      .select(`
        *,
        actor:actor_id(id, full_name, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: notifications, error, count } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .schema('diq')
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    return NextResponse.json({
      notifications: notifications || [],
      total: count || 0,
      unreadCount: unreadCount || 0,
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      entityType,
      entityId,
      actorId,
      title,
      message,
      link,
      metadata,
    } = body;

    if (!userId || !type || !title) {
      return NextResponse.json(
        { error: 'userId, type, and title are required' },
        { status: 400 }
      );
    }

    const { data: notification, error } = await supabase
      .schema('diq')
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        entity_type: entityType,
        entity_id: entityId,
        actor_id: actorId,
        title,
        message,
        link,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, notificationIds, userId, markAll } = body;

    if (markAll && userId) {
      // Mark all notifications as read for a user
      const { error } = await supabase
        .schema('diq')
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all as read:', error);
        return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId) {
      // Mark single notification as read
      const { error } = await supabase
        .schema('diq')
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark multiple notifications as read
      const { error } = await supabase
        .schema('diq')
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .in('id', notificationIds);

      if (error) {
        console.error('Error marking notifications as read:', error);
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
      }

      return NextResponse.json({ success: true, count: notificationIds.length });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a notification
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .schema('diq')
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
