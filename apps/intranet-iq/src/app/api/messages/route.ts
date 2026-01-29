/**
 * Messages API
 * Handles direct messaging and group chat operations
 *
 * V2.0 Feature: Direct Messaging - EPIC 9
 *
 * GET /api/messages - Get conversations or messages
 * POST /api/messages - Create conversation or send message
 * PATCH /api/messages - Edit message or mark as read
 * DELETE /api/messages - Delete message or leave conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserContext } from '@/lib/rbac';
import {
  createConversation,
  getUserConversations,
  getConversation,
  leaveConversation,
  sendMessage,
  getMessages,
  markMessagesAsRead,
  editMessage,
  deleteMessage,
  setTypingIndicator,
  getTypingIndicators,
} from '@/lib/messaging';

/**
 * GET - Get conversations or messages
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userContext = await getUserContext(clerkUserId);
    if (!userContext) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('conversationId');
    const type = searchParams.get('type') as 'direct' | 'group' | null;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const before = searchParams.get('before');
    const after = searchParams.get('after');

    // Get typing indicators
    if (searchParams.get('typing') === 'true' && conversationId) {
      const indicators = await getTypingIndicators(conversationId);
      return NextResponse.json({ typing: indicators });
    }

    // Get messages for a specific conversation
    if (conversationId) {
      // Check for single conversation details
      if (searchParams.get('details') === 'true') {
        const conversation = await getConversation(userContext, conversationId);
        if (!conversation) {
          return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }
        return NextResponse.json(conversation);
      }

      // Get messages
      const result = await getMessages(userContext, conversationId, {
        limit,
        before: before || undefined,
        after: after || undefined,
      });
      return NextResponse.json(result);
    }

    // Get user's conversations
    const result = await getUserConversations(userContext, {
      type: type || undefined,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create conversation or send message
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userContext = await getUserContext(clerkUserId);
    if (!userContext) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create_conversation': {
        const { type, participants, name, description } = body;
        if (!type || !participants || !Array.isArray(participants)) {
          return NextResponse.json(
            { error: 'Missing required fields: type, participants' },
            { status: 400 }
          );
        }
        const conversation = await createConversation(userContext, {
          type,
          participants,
          name,
          description,
        });
        return NextResponse.json(conversation, { status: 201 });
      }

      case 'send_message': {
        const { conversationId, content, messageType, attachments, replyToId } = body;
        if (!conversationId || !content) {
          return NextResponse.json(
            { error: 'Missing required fields: conversationId, content' },
            { status: 400 }
          );
        }
        const message = await sendMessage(userContext, {
          conversationId,
          content,
          messageType,
          attachments,
          replyToId,
        });
        return NextResponse.json(message, { status: 201 });
      }

      case 'set_typing': {
        const { conversationId, isTyping } = body;
        if (!conversationId) {
          return NextResponse.json(
            { error: 'Missing required field: conversationId' },
            { status: 400 }
          );
        }
        await setTypingIndicator(userContext, conversationId, isTyping !== false);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Edit message or mark as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userContext = await getUserContext(clerkUserId);
    if (!userContext) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'edit_message': {
        const { messageId, content } = body;
        if (!messageId || !content) {
          return NextResponse.json(
            { error: 'Missing required fields: messageId, content' },
            { status: 400 }
          );
        }
        const message = await editMessage(userContext, messageId, content);
        return NextResponse.json(message);
      }

      case 'mark_read': {
        const { conversationId, messageIds } = body;
        if (!conversationId) {
          return NextResponse.json(
            { error: 'Missing required field: conversationId' },
            { status: 400 }
          );
        }
        await markMessagesAsRead(userContext, conversationId, messageIds);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in PATCH /api/messages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete message or leave conversation
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userContext = await getUserContext(clerkUserId);
    if (!userContext) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'delete_message': {
        const { messageId } = body;
        if (!messageId) {
          return NextResponse.json(
            { error: 'Missing required field: messageId' },
            { status: 400 }
          );
        }
        await deleteMessage(userContext, messageId);
        return NextResponse.json({ success: true });
      }

      case 'leave_conversation': {
        const { conversationId } = body;
        if (!conversationId) {
          return NextResponse.json(
            { error: 'Missing required field: conversationId' },
            { status: 400 }
          );
        }
        await leaveConversation(userContext, conversationId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in DELETE /api/messages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}
