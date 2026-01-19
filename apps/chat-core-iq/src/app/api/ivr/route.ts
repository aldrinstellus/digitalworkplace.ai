// IVR (Interactive Voice Response) API endpoint
// Handles incoming Twilio voice calls with AI responses

import { NextRequest, NextResponse } from 'next/server';
import {
  generateGreeting,
  generateError,
  parseIVRRequest,
} from '@/lib/channels/twilio-ivr';

// TwiML response headers
const twimlHeaders = {
  'Content-Type': 'text/xml',
};

// Handle incoming call (initial greeting)
export async function POST(request: NextRequest) {
  try {
    // Parse form-urlencoded body from Twilio
    const formData = await request.formData();
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = value.toString();
    });

    const ivrRequest = parseIVRRequest(body);
    const callSid = ivrRequest.CallSid;
    const callerPhone = ivrRequest.From;

    console.log(`[IVR] New call from ${callerPhone}, CallSid: ${callSid}`);

    // Return initial greeting
    const greeting = generateGreeting({ language: 'en' });
    return new NextResponse(greeting, { headers: twimlHeaders });
  } catch (error) {
    console.error('[IVR] Error in initial greeting:', error);
    return new NextResponse(generateError('en'), { headers: twimlHeaders });
  }
}

// GET handler for Twilio verification
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Chat Core IQ IVR',
    description: 'Twilio Voice webhook for AI-powered IVR',
  });
}
