// SMS API endpoint - Twilio webhook for text message conversations

import { NextRequest, NextResponse } from 'next/server';
import {
  parseSMSRequest,
  generateSMSResponse,
  generateOptOutResponse,
  generateOptInResponse,
  generateHelpResponse,
  isOptOut,
  isOptIn,
  isHelpRequest,
} from '@/lib/channels/twilio-sms';
import { processChat, logChannelConversation } from '@/lib/channels/chat-processor';
import { detectLanguage } from '@/lib/i18n';

// TwiML response headers
const twimlHeaders = {
  'Content-Type': 'text/xml',
};

export async function POST(request: NextRequest) {
  try {
    // Parse form-urlencoded body from Twilio
    const formData = await request.formData();
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = value.toString();
    });

    const smsRequest = parseSMSRequest(body);
    const { From: senderPhone, Body: messageBody, MessageSid: messageSid } = smsRequest;

    console.log(`[SMS] Received from ${senderPhone}: "${messageBody}" (${messageSid})`);

    // Detect language for compliance responses
    const language = detectLanguage(messageBody);

    // Handle opt-out (TCPA compliance)
    if (isOptOut(messageBody)) {
      console.log(`[SMS] Opt-out from ${senderPhone}`);
      // In production: mark user as opted out in database
      return new NextResponse(generateOptOutResponse(language), { headers: twimlHeaders });
    }

    // Handle opt-in
    if (isOptIn(messageBody)) {
      console.log(`[SMS] Opt-in from ${senderPhone}`);
      // In production: mark user as opted in in database
      return new NextResponse(generateOptInResponse(language), { headers: twimlHeaders });
    }

    // Handle help request
    if (isHelpRequest(messageBody)) {
      console.log(`[SMS] Help request from ${senderPhone}`);
      return new NextResponse(generateHelpResponse(language), { headers: twimlHeaders });
    }

    // Process message with AI
    const result = await processChat({
      channel: 'sms',
      userId: senderPhone,
      message: messageBody,
    });

    // Log the conversation
    logChannelConversation(
      'sms',
      senderPhone,
      messageBody,
      result.message,
      result.language,
      result.sentiment,
      result.escalate
    ).catch(console.error);

    // Add escalation note if needed (English, Spanish, Haitian Creole)
    let responseMessage = result.message;
    if (result.escalate) {
      let escalationNote = '\n\nTo speak with a live agent, call 305-593-6700.';
      if (result.language === 'es') {
        escalationNote = '\n\nPara hablar con un agente, llame al 305-593-6700.';
      } else if (result.language === 'ht') {
        escalationNote = '\n\nPou pale ak yon ajan, rele 305-593-6700.';
      }
      responseMessage += escalationNote;
    }

    // Generate TwiML response
    const response = generateSMSResponse({
      message: responseMessage,
      language: result.language,
    });

    return new NextResponse(response, { headers: twimlHeaders });
  } catch (error) {
    console.error('[SMS] Error processing message:', error);

    // Return error response
    const errorResponse = generateSMSResponse({
      message: 'We apologize, there was an issue. Please try again or call 305-593-6700.',
    });

    return new NextResponse(errorResponse, { headers: twimlHeaders });
  }
}

// GET handler for Twilio verification
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Chat Core IQ SMS',
    description: 'Twilio SMS webhook for AI-powered text messaging',
  });
}
