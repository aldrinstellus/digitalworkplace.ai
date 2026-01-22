/**
 * Channels API Route
 * Handles channels and messages for team collaboration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Channel {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_private: boolean;
  is_direct_message: boolean;
  creator_id?: string;
  department_id?: string;
  icon?: string;
  color?: string;
  settings: Record<string, unknown>;
  archived_at?: string;
  created_at: string;
  updated_at: string;
  unread_count?: number;
  member_count?: number;
  last_message?: ChannelMessage;
}

export interface ChannelMessage {
  id: string;
  channel_id: string;
  author_id: string;
  content: string;
  thread_id?: string;
  reply_to_id?: string;
  is_pinned: boolean;
  is_edited: boolean;
  edited_at?: string;
  attachments: Array<{
    type: string;
    url: string;
    name: string;
    size?: number;
  }>;
  mentions: string[];
  metadata: Record<string, unknown>;
  deleted_at?: string;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  reactions?: Array<{
    emoji: string;
    count: number;
    users: Array<{ id: string; full_name: string }>;
  }>;
}

// GET - Fetch channels or messages
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get('channelId');
    const userId = searchParams.get('userId');
    const slug = searchParams.get('slug');
    const messageId = searchParams.get('messageId');
    const threadId = searchParams.get('threadId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // For pagination

    // Get single message
    if (messageId) {
      const { data: message, error } = await supabase
        .schema('diq')
        .from('channel_messages')
        .select(`
          *,
          author:author_id(id, full_name, avatar_url)
        `)
        .eq('id', messageId)
        .is('deleted_at', null)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }

      return NextResponse.json({ message });
    }

    // Get channel by slug
    if (slug && !channelId) {
      const { data: channel, error } = await supabase
        .schema('diq')
        .from('channels')
        .select(`
          *,
          creator:creator_id(id, full_name, avatar_url),
          department:department_id(id, name)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
      }

      return NextResponse.json({ channel });
    }

    // Get messages for a channel
    if (channelId) {
      let query = supabase
        .schema('diq')
        .from('channel_messages')
        .select(`
          *,
          author:author_id(id, full_name, avatar_url)
        `)
        .eq('channel_id', channelId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Thread messages
      if (threadId) {
        query = query.eq('thread_id', threadId);
      } else {
        query = query.is('thread_id', null); // Only top-level messages
      }

      // Pagination
      if (before) {
        query = query.lt('created_at', before);
      }

      const { data: messages, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
      }

      // Reverse to show oldest first
      const orderedMessages = (messages || []).reverse();

      return NextResponse.json({
        messages: orderedMessages,
        hasMore: messages?.length === limit,
      });
    }

    // List channels for user
    if (userId) {
      // Get channels user is a member of
      const { data: memberships, error: memberError } = await supabase
        .schema('diq')
        .from('channel_members')
        .select('channel_id, last_read_at, is_muted, is_pinned')
        .eq('user_id', userId);

      if (memberError) {
        console.error('Error fetching memberships:', memberError);
        return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
      }

      const channelIds = memberships?.map(m => m.channel_id) || [];

      if (channelIds.length === 0) {
        // Return public channels if user has no memberships
        const { data: publicChannels } = await supabase
          .schema('diq')
          .from('channels')
          .select('*')
          .eq('is_private', false)
          .is('archived_at', null)
          .order('name');

        return NextResponse.json({ channels: publicChannels || [] });
      }

      const { data: channels, error: channelError } = await supabase
        .schema('diq')
        .from('channels')
        .select(`
          *,
          creator:creator_id(id, full_name, avatar_url)
        `)
        .in('id', channelIds)
        .is('archived_at', null)
        .order('name');

      if (channelError) {
        console.error('Error fetching channels:', channelError);
        return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
      }

      // Enrich with membership data
      const membershipMap = new Map(memberships?.map(m => [m.channel_id, m]));
      const enrichedChannels = channels?.map(ch => ({
        ...ch,
        is_muted: membershipMap.get(ch.id)?.is_muted || false,
        is_pinned: membershipMap.get(ch.id)?.is_pinned || false,
        last_read_at: membershipMap.get(ch.id)?.last_read_at,
      }));

      return NextResponse.json({ channels: enrichedChannels || [] });
    }

    // Return all public channels
    const { data: channels, error } = await supabase
      .schema('diq')
      .from('channels')
      .select('*')
      .eq('is_private', false)
      .is('archived_at', null)
      .order('name');

    if (error) {
      console.error('Error fetching channels:', error);
      return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
    }

    return NextResponse.json({ channels: channels || [] });
  } catch (error) {
    console.error('Channels API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create channel or send message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'message') {
      // Send a message
      const {
        channelId,
        authorId,
        content,
        threadId,
        replyToId,
        attachments = [],
        mentions = [],
      } = body;

      if (!channelId || !authorId || !content) {
        return NextResponse.json(
          { error: 'channelId, authorId, and content are required' },
          { status: 400 }
        );
      }

      const { data: message, error } = await supabase
        .schema('diq')
        .from('channel_messages')
        .insert({
          channel_id: channelId,
          author_id: authorId,
          content,
          thread_id: threadId,
          reply_to_id: replyToId,
          attachments,
          mentions,
        })
        .select(`
          *,
          author:author_id(id, full_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
      }

      // Update channel's updated_at
      await supabase
        .schema('diq')
        .from('channels')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', channelId);

      return NextResponse.json({ message });
    }

    if (action === 'join') {
      // Join a channel
      const { channelId, userId } = body;

      const { error } = await supabase
        .schema('diq')
        .from('channel_members')
        .upsert({
          channel_id: channelId,
          user_id: userId,
          role: 'member',
        });

      if (error) {
        console.error('Error joining channel:', error);
        return NextResponse.json({ error: 'Failed to join channel' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'leave') {
      // Leave a channel
      const { channelId, userId } = body;

      const { error } = await supabase
        .schema('diq')
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error leaving channel:', error);
        return NextResponse.json({ error: 'Failed to leave channel' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'markRead') {
      // Mark channel as read
      const { channelId, userId } = body;

      const { error } = await supabase
        .schema('diq')
        .from('channel_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('channel_id', channelId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error marking as read:', error);
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Create a channel
    const {
      name,
      description,
      isPrivate = false,
      creatorId,
      departmentId,
      icon,
      color,
      memberIds = [],
    } = body;

    if (!name || !creatorId) {
      return NextResponse.json(
        { error: 'name and creatorId are required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { data: channel, error } = await supabase
      .schema('diq')
      .from('channels')
      .insert({
        name,
        slug,
        description,
        is_private: isPrivate,
        creator_id: creatorId,
        department_id: departmentId,
        icon,
        color,
        settings: {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating channel:', error);
      return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
    }

    // Add creator and members
    const members = [creatorId, ...memberIds.filter((id: string) => id !== creatorId)];
    const memberRecords = members.map((userId: string, index: number) => ({
      channel_id: channel.id,
      user_id: userId,
      role: index === 0 ? 'owner' : 'member',
    }));

    await supabase
      .schema('diq')
      .from('channel_members')
      .insert(memberRecords);

    return NextResponse.json({ channel });
  } catch (error) {
    console.error('Channels API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update channel or message
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelId, messageId, content, isPinned } = body;

    if (messageId) {
      // Update message
      const updateData: Record<string, unknown> = {};
      if (content !== undefined) {
        updateData.content = content;
        updateData.is_edited = true;
        updateData.edited_at = new Date().toISOString();
      }
      if (isPinned !== undefined) {
        updateData.is_pinned = isPinned;
      }

      const { error } = await supabase
        .schema('diq')
        .from('channel_messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) {
        console.error('Error updating message:', error);
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (channelId) {
      // Update channel
      const { name, description, isPrivate, icon, color, settings } = body;
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (isPrivate !== undefined) updateData.is_private = isPrivate;
      if (icon) updateData.icon = icon;
      if (color) updateData.color = color;
      if (settings) updateData.settings = settings;

      const { error } = await supabase
        .schema('diq')
        .from('channels')
        .update(updateData)
        .eq('id', channelId);

      if (error) {
        console.error('Error updating channel:', error);
        return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'channelId or messageId required' }, { status: 400 });
  } catch (error) {
    console.error('Channels API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete channel or message
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get('channelId');
    const messageId = searchParams.get('messageId');

    if (messageId) {
      // Soft delete message
      const { error } = await supabase
        .schema('diq')
        .from('channel_messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (channelId) {
      // Archive channel (soft delete)
      const { error } = await supabase
        .schema('diq')
        .from('channels')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', channelId);

      if (error) {
        console.error('Error archiving channel:', error);
        return NextResponse.json({ error: 'Failed to archive channel' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'channelId or messageId required' }, { status: 400 });
  } catch (error) {
    console.error('Channels API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
