/**
 * Recognitions API Route
 * Handles employee recognition and shout-outs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET - Fetch recognitions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId'); // Filter by recipient
    const authorId = searchParams.get('authorId'); // Filter by author
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query - fetch recognitions without cross-schema joins
    let query = supabase
      .schema('diq')
      .from('recognitions')
      .select(`
        *,
        recipients:recognition_recipients(user_id, acknowledged_at)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (authorId) {
      query = query.eq('author_id', authorId);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: recognitions, error } = await query;

    if (error) {
      console.error('Error fetching recognitions:', error);
      return NextResponse.json({ error: 'Failed to fetch recognitions' }, { status: 500 });
    }

    // Collect all user IDs for cross-schema enrichment
    const authorIds = [...new Set((recognitions || []).map(r => r.author_id).filter(Boolean))];
    const recipientUserIds = [...new Set((recognitions || []).flatMap(r =>
      (r.recipients || []).map((rec: { user_id: string }) => rec.user_id)
    ).filter(Boolean))];
    const allUserIds = [...new Set([...authorIds, ...recipientUserIds])];

    // Fetch user data from public.users
    let usersMap = new Map();
    if (allUserIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('id', allUserIds);
      usersMap = new Map((users || []).map(u => [u.id, u]));
    }

    // Enrich recognitions with user data
    const enrichedRecognitions = (recognitions || []).map(r => ({
      ...r,
      author: usersMap.get(r.author_id) || null,
      recipients: (r.recipients || []).map((rec: { user_id: string; acknowledged_at: string }) => ({
        ...rec,
        user: usersMap.get(rec.user_id) || null,
      })),
    }));

    // If filtering by recipient, filter in memory
    let filteredRecognitions = enrichedRecognitions;
    if (userId) {
      filteredRecognitions = enrichedRecognitions.filter(r =>
        r.recipients?.some((rec: { user: { id: string } | null }) => rec.user?.id === userId)
      );
    }

    return NextResponse.json({
      recognitions: filteredRecognitions,
      total: filteredRecognitions.length,
    });
  } catch (error) {
    console.error('Recognitions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a recognition
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      authorId,
      recipientIds,
      type = 'shoutout',
      message,
      tags,
      isPublic = true,
      createNewsPost = true,
    } = body;

    if (!authorId || !recipientIds?.length || !message) {
      return NextResponse.json(
        { error: 'authorId, recipientIds, and message are required' },
        { status: 400 }
      );
    }

    // Create news post if requested
    let postId: string | null = null;
    if (createNewsPost) {
      const { data: post, error: postError } = await supabase
        .schema('diq')
        .from('news_posts')
        .insert({
          author_id: authorId,
          content: message,
          type: 'post',
          visibility: isPublic ? 'all' : 'private',
          pinned: false,
          attachments: [],
          metadata: { isRecognition: true, tags },
          published_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (!postError && post) {
        postId = post.id;
      }
    }

    // Create recognition
    const { data: recognition, error: recError } = await supabase
      .schema('diq')
      .from('recognitions')
      .insert({
        author_id: authorId,
        post_id: postId,
        type,
        message,
        tags: tags || [],
        is_public: isPublic,
      })
      .select()
      .single();

    if (recError) {
      console.error('Error creating recognition:', recError);
      return NextResponse.json({ error: 'Failed to create recognition' }, { status: 500 });
    }

    // Add recipients
    const recipientRecords = recipientIds.map((userId: string) => ({
      recognition_id: recognition.id,
      user_id: userId,
    }));

    const { error: recipientError } = await supabase
      .schema('diq')
      .from('recognition_recipients')
      .insert(recipientRecords);

    if (recipientError) {
      console.error('Error adding recipients:', recipientError);
    }

    // Create notifications for recipients
    for (const recipientId of recipientIds) {
      await supabase
        .schema('diq')
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'mention',
          entity_type: 'recognition',
          entity_id: recognition.id,
          actor_id: authorId,
          title: 'You received a shout-out!',
          message: message.slice(0, 100),
          link: postId ? `/diq/news/${postId}` : '/diq/news',
        });
    }

    return NextResponse.json({
      recognition,
      postId,
      recipientCount: recipientIds.length,
    });
  } catch (error) {
    console.error('Recognitions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Acknowledge a recognition
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { recognitionId, userId } = body;

    if (!recognitionId || !userId) {
      return NextResponse.json(
        { error: 'recognitionId and userId are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .schema('diq')
      .from('recognition_recipients')
      .update({ acknowledged_at: new Date().toISOString() })
      .eq('recognition_id', recognitionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error acknowledging recognition:', error);
      return NextResponse.json({ error: 'Failed to acknowledge' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recognitions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
