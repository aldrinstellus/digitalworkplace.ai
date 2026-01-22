/**
 * Reactions API Route
 * Handles emoji reactions on posts, comments, and messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Reaction {
  id: string;
  entity_type: 'post' | 'comment' | 'article' | 'message';
  entity_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  users: Array<{
    id: string;
    full_name: string;
    avatar_url: string;
  }>;
  hasReacted: boolean;
}

// GET - Fetch reactions for an entity
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const userId = searchParams.get('userId'); // To check if user has reacted
    const grouped = searchParams.get('grouped') === 'true';

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType and entityId are required' },
        { status: 400 }
      );
    }

    const { data: reactions, error } = await supabase
      .schema('diq')
      .from('reactions')
      .select(`
        *,
        user:user_id(id, full_name, avatar_url)
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching reactions:', error);
      return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
    }

    if (grouped) {
      // Group reactions by emoji
      const groupedReactions: Record<string, ReactionSummary> = {};

      for (const reaction of reactions || []) {
        const emoji = reaction.emoji;
        if (!groupedReactions[emoji]) {
          groupedReactions[emoji] = {
            emoji,
            count: 0,
            users: [],
            hasReacted: false,
          };
        }
        groupedReactions[emoji].count++;
        if (reaction.user) {
          groupedReactions[emoji].users.push(reaction.user);
        }
        if (userId && reaction.user_id === userId) {
          groupedReactions[emoji].hasReacted = true;
        }
      }

      return NextResponse.json({
        reactions: Object.values(groupedReactions),
        total: reactions?.length || 0,
      });
    }

    return NextResponse.json({
      reactions: reactions || [],
      total: reactions?.length || 0,
    });
  } catch (error) {
    console.error('Reactions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add a reaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityType, entityId, userId, emoji } = body;

    if (!entityType || !entityId || !userId || !emoji) {
      return NextResponse.json(
        { error: 'entityType, entityId, userId, and emoji are required' },
        { status: 400 }
      );
    }

    // Check if reaction already exists (toggle behavior)
    const { data: existing } = await supabase
      .schema('diq')
      .from('reactions')
      .select('id')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
      .single();

    if (existing) {
      // Remove existing reaction (toggle off)
      const { error: deleteError } = await supabase
        .schema('diq')
        .from('reactions')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('Error removing reaction:', deleteError);
        return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
      }

      return NextResponse.json({ action: 'removed', reactionId: existing.id });
    }

    // Add new reaction
    const { data: reaction, error } = await supabase
      .schema('diq')
      .from('reactions')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        user_id: userId,
        emoji,
      })
      .select(`
        *,
        user:user_id(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error adding reaction:', error);
      return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
    }

    return NextResponse.json({ action: 'added', reaction });
  } catch (error) {
    console.error('Reactions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a reaction
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reactionId = searchParams.get('id');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const userId = searchParams.get('userId');
    const emoji = searchParams.get('emoji');

    if (reactionId) {
      // Delete by ID
      const { error } = await supabase
        .schema('diq')
        .from('reactions')
        .delete()
        .eq('id', reactionId);

      if (error) {
        console.error('Error deleting reaction:', error);
        return NextResponse.json({ error: 'Failed to delete reaction' }, { status: 500 });
      }
    } else if (entityType && entityId && userId && emoji) {
      // Delete by entity + user + emoji
      const { error } = await supabase
        .schema('diq')
        .from('reactions')
        .delete()
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('user_id', userId)
        .eq('emoji', emoji);

      if (error) {
        console.error('Error deleting reaction:', error);
        return NextResponse.json({ error: 'Failed to delete reaction' }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        { error: 'Either reactionId or (entityType, entityId, userId, emoji) required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reactions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
