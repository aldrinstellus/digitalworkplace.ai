// Twilio SMS adapter for text message conversations

import twilio from 'twilio';
import { Language } from '../i18n';

const MessagingResponse = twilio.twiml.MessagingResponse;

// Initialize Twilio client for outbound messages
let twilioClient: twilio.Twilio | null = null;

function getTwilioClient(): twilio.Twilio {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required');
    }

    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

// SMS Configuration
const SMS_CONFIG = {
  maxMessageLength: 1600, // Max chars per SMS segment is 160, but Twilio concatenates up to ~1600
  optOutKeywords: ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'],
  optInKeywords: ['START', 'YES', 'UNSTOP'],
  helpKeywords: ['HELP', 'INFO', 'AYUDA'],
};

export interface SMSRequest {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia?: string;
  MediaUrl0?: string;
}

export function parseSMSRequest(body: Record<string, string>): SMSRequest {
  return {
    MessageSid: body.MessageSid || '',
    From: body.From || '',
    To: body.To || '',
    Body: body.Body || '',
    NumMedia: body.NumMedia,
    MediaUrl0: body.MediaUrl0,
  };
}

// Check for opt-out keywords
export function isOptOut(message: string): boolean {
  const upperMessage = message.trim().toUpperCase();
  return SMS_CONFIG.optOutKeywords.includes(upperMessage);
}

// Check for opt-in keywords
export function isOptIn(message: string): boolean {
  const upperMessage = message.trim().toUpperCase();
  return SMS_CONFIG.optInKeywords.includes(upperMessage);
}

// Check for help keywords
export function isHelpRequest(message: string): boolean {
  const upperMessage = message.trim().toUpperCase();
  return SMS_CONFIG.helpKeywords.includes(upperMessage);
}

export interface SMSResponseOptions {
  message: string;
  language?: Language;
}

// Generate TwiML response for incoming SMS
export function generateSMSResponse(options: SMSResponseOptions): string {
  const response = new MessagingResponse();

  // Truncate message if too long
  let message = options.message;
  if (message.length > SMS_CONFIG.maxMessageLength) {
    message = message.substring(0, SMS_CONFIG.maxMessageLength - 3) + '...';
  }

  response.message(message);
  return response.toString();
}

// Generate opt-out confirmation
export function generateOptOutResponse(language: Language): string {
  const response = new MessagingResponse();

  const message = language === 'es'
    ? 'Ha sido removido de los mensajes de texto de Chat Core IQ. Responda START para volver a recibir mensajes.'
    : 'You have been unsubscribed from Chat Core IQ text messages. Reply START to resubscribe.';

  response.message(message);
  return response.toString();
}

// Generate opt-in confirmation
export function generateOptInResponse(language: Language): string {
  const response = new MessagingResponse();

  const message = language === 'es'
    ? 'Bienvenido de nuevo! Ahora recibira mensajes de Chat Core IQ. Responda STOP para cancelar.'
    : 'Welcome back! You will now receive messages from Chat Core IQ. Reply STOP to unsubscribe.';

  response.message(message);
  return response.toString();
}

// Generate help response
export function generateHelpResponse(language: Language): string {
  const response = new MessagingResponse();

  const message = language === 'es'
    ? 'Chat Core IQ SMS: Pregunte sobre nuestros servicios. Responda STOP para cancelar.'
    : 'Chat Core IQ SMS: Ask about our services. Reply STOP to unsubscribe.';

  response.message(message);
  return response.toString();
}

// Generate welcome message for new users
export function generateWelcomeResponse(language: Language): string {
  const response = new MessagingResponse();

  const message = language === 'es'
    ? 'Hola! Soy el asistente virtual de Chat Core IQ. Como puedo ayudarle? Responda STOP para cancelar, HELP para ayuda.'
    : 'Hello! I am the Chat Core IQ virtual assistant. How can I help you? Reply STOP to unsubscribe, HELP for info.';

  response.message(message);
  return response.toString();
}

// Send outbound SMS (for notifications, escalation confirmations, etc.)
export async function sendSMS(to: string, message: string): Promise<string> {
  const client = getTwilioClient();
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!from) {
    throw new Error('TWILIO_PHONE_NUMBER is required for outbound SMS');
  }

  const result = await client.messages.create({
    body: message,
    from,
    to,
  });

  return result.sid;
}

// Validate E.164 phone number format
export function isValidPhoneNumber(phone: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}
