// IVR Demo Session API - manages demo sessions for transfer code testing

import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateSession,
  addMessageToSession,
  generateCrossChannelTokenWithMessages,
} from '@/lib/channels/session-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, role, content, messages, language } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (action === 'add-message') {
      // Create session if needed and add message
      await getOrCreateSession('ivr', userId, 'en');
      await addMessageToSession('ivr', userId, role || 'assistant', content || '');

      return NextResponse.json({ success: true });
    }

    if (action === 'generate-token') {
      // Generate cross-channel transfer token with provided messages
      // This solves serverless session persistence issues by passing messages directly
      const token = await generateCrossChannelTokenWithMessages(
        'ivr',
        userId,
        messages || [], // Client passes conversation history directly
        language || 'en'
      );
      return NextResponse.json({ success: true, token });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[IVR Demo Session] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
