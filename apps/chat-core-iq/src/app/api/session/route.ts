// Cross-channel session management API
// Handles session transfer between channels (IVR to web, SMS to web, etc.)
// ITN 3.2.6 - IVR Integration with session continuity

import { NextRequest, NextResponse } from 'next/server';
import {
  generateCrossChannelToken,
  redeemCrossChannelToken,
  getSessionById,
} from '@/lib/channels/session-manager';
import { ChannelType } from '@/lib/channels/types';

// CORS headers for cross-origin requests from chat widget
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// Generate a cross-channel transfer token
// POST /api/session/token - Generate token for current channel session
// POST /api/session/redeem - Redeem token to transfer session to new channel
// GET /api/session/:id - Get session by ID

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'generate') {
      // Generate a transfer token
      const { channel, userId } = body as {
        action: string;
        channel: ChannelType;
        userId: string;
      };

      if (!channel || !userId) {
        return NextResponse.json(
          { error: 'channel and userId are required' },
          { status: 400, headers: corsHeaders }
        );
      }

      const token = await generateCrossChannelToken(channel, userId);

      return NextResponse.json({
        success: true,
        token,
        expiresIn: '30 minutes',
        instructions: {
          en: `To continue this conversation on our website, enter this code: ${token}`,
          es: `Para continuar esta conversacion en nuestro sitio web, ingrese este codigo: ${token}`,
          ht: `Pou kontinye konvèsasyon sa a sou sit entènèt nou an, antre kòd sa a: ${token}`,
        },
      }, { headers: corsHeaders });
    }

    if (action === 'redeem') {
      // Redeem a transfer token
      const { token, targetChannel, targetUserId } = body as {
        action: string;
        token: string;
        targetChannel: ChannelType;
        targetUserId: string;
      };

      if (!token || !targetChannel || !targetUserId) {
        return NextResponse.json(
          { error: 'token, targetChannel, and targetUserId are required' },
          { status: 400, headers: corsHeaders }
        );
      }

      console.log('[Session API] Redeeming token:', token, 'for', targetChannel, targetUserId);
      const session = await redeemCrossChannelToken(token, targetChannel, targetUserId);

      if (!session) {
        console.log('[Session API] Token invalid/expired/used:', token);
        return NextResponse.json(
          { error: 'Invalid, expired, or already used token' },
          { status: 400, headers: corsHeaders }
        );
      }

      console.log('[Session API] Token redeemed successfully, messages:', session.messages.length);
      return NextResponse.json({
        success: true,
        sessionId: session.sessionId,
        language: session.language,
        messageCount: session.messages.length,
        messages: session.messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        })),
      }, { headers: corsHeaders });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "generate" or "redeem"' },
      { status: 400, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Session API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process session request' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Get session by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const session = await getSessionById(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        channel: session.channel,
        language: session.language,
        startTime: session.startTime,
        lastActivity: session.lastActivity,
        messageCount: session.messages.length,
        linkedSessionId: session.linkedSessionId,
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[Session API] Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500, headers: corsHeaders }
    );
  }
}
