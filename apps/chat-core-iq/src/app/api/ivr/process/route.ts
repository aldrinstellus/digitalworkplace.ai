// IVR Process endpoint - handles speech input and generates AI responses

import { NextRequest, NextResponse } from 'next/server';
import {
  generateResponse,
  generateEscalation,
  generateError,
  generateGoodbye,
  generateTransferCode,
  parseIVRRequest,
} from '@/lib/channels/twilio-ivr';
import { processChat, logChannelConversation } from '@/lib/channels/chat-processor';
import { detectLanguage } from '@/lib/i18n';
import { generateCrossChannelToken } from '@/lib/channels/session-manager';

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

    const ivrRequest = parseIVRRequest(body);
    const callerPhone = ivrRequest.From;
    const speechResult = ivrRequest.SpeechResult;
    const digits = ivrRequest.Digits;

    console.log(`[IVR] Processing input from ${callerPhone}`);
    console.log(`[IVR] Speech: "${speechResult}", Digits: "${digits}"`);

    // Handle DTMF digit input
    if (digits === '1') {
      // User pressed 1 - escalate to live agent
      console.log(`[IVR] User requested escalation`);
      return new NextResponse(generateEscalation('en'), { headers: twimlHeaders });
    }

    if (digits === '2') {
      // User pressed 2 - transfer to website with code
      console.log(`[IVR] User requested transfer to website`);
      const transferCode = await generateCrossChannelToken('ivr', callerPhone);
      return new NextResponse(generateTransferCode('en', transferCode), { headers: twimlHeaders });
    }

    if (digits === '0' || digits === '9') {
      // User pressed 0 or 9 - goodbye
      console.log(`[IVR] User ended call`);
      return new NextResponse(generateGoodbye('en'), { headers: twimlHeaders });
    }

    // Handle speech input
    if (!speechResult || speechResult.trim() === '') {
      // No speech detected - ask again
      return new NextResponse(
        generateResponse({
          message: 'I did not catch that. Please try again.',
          language: 'en',
          escalate: false,
        }),
        { headers: twimlHeaders }
      );
    }

    // Check for goodbye phrases (English, Spanish, Haitian Creole)
    const goodbyePhrases = ['goodbye', 'bye', 'thank you', 'thanks', 'adios', 'gracias', 'mesi', 'orevwa', 'adye'];
    if (goodbyePhrases.some(phrase => speechResult.toLowerCase().includes(phrase))) {
      const language = detectLanguage(speechResult);
      return new NextResponse(generateGoodbye(language), { headers: twimlHeaders });
    }

    // Check for escalation phrases (English, Spanish, Haitian Creole)
    const escalatePhrases = ['agent', 'human', 'person', 'representative', 'agente', 'persona', 'ajan', 'moun', 'repwezan'];
    if (escalatePhrases.some(phrase => speechResult.toLowerCase().includes(phrase))) {
      const language = detectLanguage(speechResult);
      return new NextResponse(generateEscalation(language), { headers: twimlHeaders });
    }

    // Check for website/transfer phrases (English, Spanish, Haitian Creole)
    const transferPhrases = ['website', 'web', 'online', 'transfer', 'continue online', 'sitio web', 'en linea', 'transferir', 'sit web', 'sou entènèt', 'transfere'];
    if (transferPhrases.some(phrase => speechResult.toLowerCase().includes(phrase))) {
      const language = detectLanguage(speechResult);
      console.log(`[IVR] User requested transfer to website (speech)`);
      const transferCode = await generateCrossChannelToken('ivr', callerPhone);
      return new NextResponse(generateTransferCode(language, transferCode), { headers: twimlHeaders });
    }

    // Process with AI
    const result = await processChat({
      channel: 'ivr',
      userId: callerPhone,
      message: speechResult,
    });

    // Log the conversation
    logChannelConversation(
      'ivr',
      callerPhone,
      speechResult,
      result.message,
      result.language,
      result.sentiment,
      result.escalate
    ).catch(console.error);

    // Generate TwiML response
    const response = generateResponse({
      message: result.message,
      language: result.language,
      escalate: result.escalate,
      sources: result.sources,
    });

    return new NextResponse(response, { headers: twimlHeaders });
  } catch (error) {
    console.error('[IVR] Error processing speech:', error);
    return new NextResponse(generateError('en'), { headers: twimlHeaders });
  }
}
