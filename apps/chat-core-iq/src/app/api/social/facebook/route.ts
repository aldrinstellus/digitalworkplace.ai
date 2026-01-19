// Facebook Messenger webhook endpoint

import { NextRequest } from 'next/server';
import { handleWebhookVerification, handleIncomingMessage } from '@/lib/channels/social-handler';

// Webhook verification (Meta sends GET request)
export async function GET(request: NextRequest) {
  return handleWebhookVerification(request, 'facebook');
}

// Incoming message handler
export async function POST(request: NextRequest) {
  return handleIncomingMessage(request, 'facebook');
}
