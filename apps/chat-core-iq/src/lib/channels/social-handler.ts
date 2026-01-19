// Shared handler for social media platforms (Facebook, Instagram, WhatsApp)

import { NextRequest, NextResponse } from 'next/server';
import {
  MetaPlatform,
  MetaWebhookBody,
  verifyWebhook,
  parseWebhookEvents,
  sendMessage,
  markSeen,
  showTyping,
  getAccessToken,
  getVerifyToken,
  getWhatsAppPhoneNumberId,
} from './meta-adapter';
import { processChat, logChannelConversation } from './chat-processor';
import { ChannelType } from './types';

// Map Meta platform to channel type
function getChannelType(platform: MetaPlatform): ChannelType {
  return platform as ChannelType;
}

// Handle webhook verification (GET request)
export async function handleWebhookVerification(
  request: NextRequest,
  platform: MetaPlatform
): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = getVerifyToken();
  const result = verifyWebhook(mode, token, challenge, verifyToken);

  if (result.valid) {
    console.log(`[${platform.toUpperCase()}] Webhook verified`);
    return new NextResponse(result.challenge, { status: 200 });
  }

  console.error(`[${platform.toUpperCase()}] Webhook verification failed`);
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// Handle incoming messages (POST request)
export async function handleIncomingMessage(
  request: NextRequest,
  platform: MetaPlatform
): Promise<NextResponse> {
  try {
    const body: MetaWebhookBody = await request.json();

    // Parse all message events
    const events = parseWebhookEvents(body);

    if (events.length === 0) {
      // Acknowledge non-message events
      return NextResponse.json({ status: 'ok' });
    }

    const accessToken = getAccessToken(platform);
    const phoneNumberId = platform === 'whatsapp' ? getWhatsAppPhoneNumberId() : undefined;
    const channelType = getChannelType(platform);

    // Process each message event
    for (const event of events) {
      console.log(`[${platform.toUpperCase()}] Message from ${event.senderId}: "${event.text}"`);

      // Show typing indicator (Facebook/Instagram only)
      markSeen(platform, event.senderId, accessToken).catch(() => {});
      showTyping(platform, event.senderId, accessToken).catch(() => {});

      try {
        // Process with AI
        const result = await processChat({
          channel: channelType,
          userId: event.senderId,
          message: event.text,
        });

        // Log the conversation
        logChannelConversation(
          channelType,
          event.senderId,
          event.text,
          result.message,
          result.language,
          result.sentiment,
          result.escalate
        ).catch(console.error);

        // Add escalation note if needed
        let responseMessage = result.message;
        if (result.escalate) {
          const escalationNote = result.language === 'es'
            ? '\n\nPara hablar con un agente, llame al 305-593-6700.'
            : '\n\nTo speak with a live agent, call 305-593-6700.';
          responseMessage += escalationNote;
        }

        // Send response
        const sendResult = await sendMessage({
          platform,
          recipientId: event.senderId,
          message: responseMessage,
          accessToken,
          phoneNumberId,
        });

        if (!sendResult.success) {
          console.error(`[${platform.toUpperCase()}] Failed to send response:`, sendResult.error);
        }
      } catch (error) {
        console.error(`[${platform.toUpperCase()}] Error processing message:`, error);

        // Send error message
        const errorMessage = 'I apologize, there was an issue processing your message. Please try again or call 305-593-6700.';
        await sendMessage({
          platform,
          recipientId: event.senderId,
          message: errorMessage,
          accessToken,
          phoneNumberId,
        });
      }
    }

    // Always return 200 to acknowledge webhook
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error(`[${platform.toUpperCase()}] Webhook error:`, error);
    // Still return 200 to prevent retries
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
