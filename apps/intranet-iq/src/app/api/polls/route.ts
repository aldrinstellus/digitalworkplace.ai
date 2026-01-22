/**
 * Polls API Route
 * Handles creating, voting, and managing polls
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Poll {
  id: string;
  post_id?: string;
  creator_id: string;
  question: string;
  description?: string;
  is_multiple_choice: boolean;
  is_anonymous: boolean;
  allow_add_options: boolean;
  status: 'draft' | 'active' | 'closed';
  expires_at?: string;
  closed_at?: string;
  created_at: string;
  options?: PollOption[];
  creator?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  description?: string;
  sort_order: number;
  vote_count?: number;
  percentage?: number;
  hasVoted?: boolean;
}

// GET - Fetch polls or poll results
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pollId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (pollId) {
      // Get single poll with results
      const { data: poll, error: pollError } = await supabase
        .schema('diq')
        .from('polls')
        .select(`
          *,
          creator:creator_id(id, full_name, avatar_url),
          options:poll_options(*)
        `)
        .eq('id', pollId)
        .single();

      if (pollError || !poll) {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
      }

      // Get vote counts for each option
      const { data: votes } = await supabase
        .schema('diq')
        .from('poll_votes')
        .select('option_id')
        .eq('poll_id', pollId);

      const voteCounts: Record<string, number> = {};
      const totalVotes = votes?.length || 0;

      for (const vote of votes || []) {
        voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1;
      }

      // Get user's votes if userId provided
      let userVotes: string[] = [];
      if (userId) {
        const { data: userVoteData } = await supabase
          .schema('diq')
          .from('poll_votes')
          .select('option_id')
          .eq('poll_id', pollId)
          .eq('user_id', userId);
        userVotes = userVoteData?.map(v => v.option_id) || [];
      }

      // Enrich options with vote data
      const enrichedOptions = poll.options?.map((opt: PollOption) => ({
        ...opt,
        vote_count: voteCounts[opt.id] || 0,
        percentage: totalVotes > 0
          ? Math.round(((voteCounts[opt.id] || 0) / totalVotes) * 100)
          : 0,
        hasVoted: userVotes.includes(opt.id),
      }));

      return NextResponse.json({
        poll: { ...poll, options: enrichedOptions },
        totalVotes,
        userVotes,
      });
    }

    // List polls
    let query = supabase
      .schema('diq')
      .from('polls')
      .select(`
        *,
        creator:creator_id(id, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: polls, error } = await query;

    if (error) {
      console.error('Error fetching polls:', error);
      return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 });
    }

    return NextResponse.json({ polls: polls || [] });
  } catch (error) {
    console.error('Polls API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a poll or vote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'vote') {
      // Handle voting
      const { pollId, optionId, optionIds, userId } = body;

      if (!pollId || !userId || (!optionId && !optionIds?.length)) {
        return NextResponse.json(
          { error: 'pollId, userId, and optionId(s) are required' },
          { status: 400 }
        );
      }

      // Check if poll is active
      const { data: poll } = await supabase
        .schema('diq')
        .from('polls')
        .select('status, is_multiple_choice, expires_at')
        .eq('id', pollId)
        .single();

      if (!poll || poll.status !== 'active') {
        return NextResponse.json({ error: 'Poll is not active' }, { status: 400 });
      }

      if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Poll has expired' }, { status: 400 });
      }

      // Remove existing votes if not multiple choice
      if (!poll.is_multiple_choice) {
        await supabase
          .schema('diq')
          .from('poll_votes')
          .delete()
          .eq('poll_id', pollId)
          .eq('user_id', userId);
      }

      // Add votes
      const optionsToVote = optionIds || [optionId];
      const voteRecords = optionsToVote.map((opt: string) => ({
        poll_id: pollId,
        option_id: opt,
        user_id: userId,
      }));

      const { error: voteError } = await supabase
        .schema('diq')
        .from('poll_votes')
        .upsert(voteRecords, { onConflict: 'poll_id,option_id,user_id' });

      if (voteError) {
        console.error('Error voting:', voteError);
        return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
      }

      return NextResponse.json({ success: true, votedOptions: optionsToVote });
    }

    // Create poll
    const {
      creatorId,
      question,
      description,
      options,
      isMultipleChoice = false,
      isAnonymous = false,
      allowAddOptions = false,
      expiresAt,
      createNewsPost = false,
    } = body;

    if (!creatorId || !question || !options?.length) {
      return NextResponse.json(
        { error: 'creatorId, question, and options are required' },
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
          author_id: creatorId,
          content: question,
          type: 'poll',
          visibility: 'all',
          pinned: false,
          attachments: [],
          metadata: { isPoll: true },
          published_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (!postError && post) {
        postId = post.id;
      }
    }

    // Create poll
    const { data: poll, error: pollError } = await supabase
      .schema('diq')
      .from('polls')
      .insert({
        post_id: postId,
        creator_id: creatorId,
        question,
        description,
        is_multiple_choice: isMultipleChoice,
        is_anonymous: isAnonymous,
        allow_add_options: allowAddOptions,
        status: 'active',
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (pollError) {
      console.error('Error creating poll:', pollError);
      return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 });
    }

    // Create options
    const optionRecords = options.map((opt: string | { text: string }, index: number) => ({
      poll_id: poll.id,
      text: typeof opt === 'string' ? opt : opt.text,
      sort_order: index,
    }));

    const { error: optionsError } = await supabase
      .schema('diq')
      .from('poll_options')
      .insert(optionRecords);

    if (optionsError) {
      console.error('Error creating options:', optionsError);
    }

    return NextResponse.json({ poll, postId });
  } catch (error) {
    console.error('Polls API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update poll status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { pollId, status, creatorId } = body;

    if (!pollId || !status) {
      return NextResponse.json(
        { error: 'pollId and status are required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status };
    if (status === 'closed') {
      updateData.closed_at = new Date().toISOString();
    }

    let query = supabase
      .schema('diq')
      .from('polls')
      .update(updateData)
      .eq('id', pollId);

    // Only creator can update
    if (creatorId) {
      query = query.eq('creator_id', creatorId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error updating poll:', error);
      return NextResponse.json({ error: 'Failed to update poll' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Polls API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
