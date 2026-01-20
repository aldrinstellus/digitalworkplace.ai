/**
 * Article Approval API Route
 * Handles approve, reject, and request_changes actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { getUserContext, canPerformAction } from '@/lib/rbac';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ApprovalRequest {
  articleId: string;
  action: 'approve' | 'reject' | 'request_changes';
  comment?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user context for permission check
    const userContext = await getUserContext(userId);
    if (!userContext) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can approve content
    if (!canPerformAction(userContext, 'approve')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to approve articles' },
        { status: 403 }
      );
    }

    // Parse request body
    const body: ApprovalRequest = await request.json();
    const { articleId, action, comment } = body;

    if (!articleId || !action) {
      return NextResponse.json(
        { error: 'articleId and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'request_changes'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve, reject, or request_changes' },
        { status: 400 }
      );
    }

    // Get the current article
    const { data: article, error: fetchError } = await supabase
      .schema('diq')
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check if article is in pending_review status
    if (article.status !== 'pending_review') {
      return NextResponse.json(
        { error: 'Article is not in pending review status' },
        { status: 400 }
      );
    }

    // Determine the new status based on action
    let newStatus: string;
    switch (action) {
      case 'approve':
        newStatus = 'published';
        break;
      case 'reject':
        newStatus = 'archived';
        break;
      case 'request_changes':
        newStatus = 'draft';
        break;
      default:
        newStatus = article.status;
    }

    // Update the article status
    const { data: updatedArticle, error: updateError } = await supabase
      .schema('diq')
      .from('articles')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        metadata: {
          ...article.metadata,
          approval_history: [
            ...(article.metadata?.approval_history || []),
            {
              action,
              comment,
              reviewer_id: userContext.userId,
              reviewer_email: userContext.email,
              timestamp: new Date().toISOString(),
            },
          ],
          last_review: {
            action,
            comment,
            reviewer_id: userContext.userId,
            timestamp: new Date().toISOString(),
          },
        },
      })
      .eq('id', articleId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating article:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log the activity
    try {
      // Get dIQ project ID
      const { data: projectData } = await supabase
        .from('projects')
        .select('id')
        .eq('code', 'dIQ')
        .single();

      if (projectData) {
        await supabase.from('activity_log').insert({
          user_id: userContext.userId,
          project_id: projectData.id,
          action: `${action}_article`,
          entity_type: 'article',
          entity_id: articleId,
          metadata: {
            article_title: article.title,
            comment,
            old_status: article.status,
            new_status: newStatus,
          },
        });
      }
    } catch (logError) {
      // Don't fail the request if logging fails
      console.warn('Failed to log activity:', logError);
    }

    return NextResponse.json({
      success: true,
      article: updatedArticle,
      action,
      newStatus,
      message: getActionMessage(action),
    });
  } catch (error) {
    console.error('Error in article approval API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getActionMessage(action: string): string {
  switch (action) {
    case 'approve':
      return 'Article has been approved and published';
    case 'reject':
      return 'Article has been rejected and archived';
    case 'request_changes':
      return 'Changes have been requested from the author';
    default:
      return 'Action completed';
  }
}
