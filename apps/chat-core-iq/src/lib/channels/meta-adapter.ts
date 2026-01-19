// Meta platforms adapter (Facebook Messenger, Instagram DM, WhatsApp Business)
// All Meta platforms use the Graph API with similar message formats

export type MetaPlatform = 'facebook' | 'instagram' | 'whatsapp';

// Meta webhook verification
export function verifyWebhook(
  mode: string | null,
  token: string | null,
  challenge: string | null,
  verifyToken: string
): { valid: boolean; challenge?: string } {
  if (mode === 'subscribe' && token === verifyToken) {
    return { valid: true, challenge: challenge || '' };
  }
  return { valid: false };
}

// Parse incoming webhook event
export interface MetaMessageEvent {
  platform: MetaPlatform;
  senderId: string;
  recipientId: string;
  messageId: string;
  text: string;
  timestamp: number;
  isEcho?: boolean;
}

export interface MetaWebhookBody {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    messaging?: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: {
        mid: string;
        text?: string;
        is_echo?: boolean;
      };
    }>;
    changes?: Array<{
      value: {
        messaging_product?: string;
        metadata?: { phone_number_id: string };
        contacts?: Array<{ wa_id: string; profile?: { name: string } }>;
        messages?: Array<{
          id: string;
          from: string;
          timestamp: string;
          type: string;
          text?: { body: string };
        }>;
      };
      field: string;
    }>;
  }>;
}

export function parseWebhookEvents(body: MetaWebhookBody): MetaMessageEvent[] {
  const events: MetaMessageEvent[] = [];

  // Determine platform type from webhook object
  const platform: MetaPlatform =
    body.object === 'whatsapp_business_account' ? 'whatsapp' :
    body.object === 'instagram' ? 'instagram' : 'facebook';

  for (const entry of body.entry || []) {
    // Facebook & Instagram: messaging array
    if (entry.messaging) {
      for (const msg of entry.messaging) {
        if (msg.message && msg.message.text && !msg.message.is_echo) {
          events.push({
            platform: platform === 'whatsapp' ? 'facebook' : platform,
            senderId: msg.sender.id,
            recipientId: msg.recipient.id,
            messageId: msg.message.mid,
            text: msg.message.text,
            timestamp: msg.timestamp,
            isEcho: msg.message.is_echo,
          });
        }
      }
    }

    // WhatsApp: changes array
    if (entry.changes) {
      for (const change of entry.changes) {
        if (change.field === 'messages' && change.value.messages) {
          for (const msg of change.value.messages) {
            if (msg.type === 'text' && msg.text?.body) {
              events.push({
                platform: 'whatsapp',
                senderId: msg.from,
                recipientId: change.value.metadata?.phone_number_id || entry.id,
                messageId: msg.id,
                text: msg.text.body,
                timestamp: parseInt(msg.timestamp) * 1000,
              });
            }
          }
        }
      }
    }
  }

  return events;
}

// Send message via Graph API
export interface SendMessageOptions {
  platform: MetaPlatform;
  recipientId: string;
  message: string;
  accessToken: string;
  phoneNumberId?: string; // Required for WhatsApp
}

export async function sendMessage(options: SendMessageOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { platform, recipientId, message, accessToken, phoneNumberId } = options;

  try {
    let url: string;
    let body: Record<string, unknown>;

    if (platform === 'whatsapp') {
      // WhatsApp Cloud API
      url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
      body = {
        messaging_product: 'whatsapp',
        to: recipientId,
        type: 'text',
        text: { body: message },
      };
    } else {
      // Facebook Messenger / Instagram
      url = `https://graph.facebook.com/v18.0/me/messages`;
      body = {
        recipient: { id: recipientId },
        message: { text: message },
        messaging_type: 'RESPONSE',
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[${platform.toUpperCase()}] Send error:`, data);
      return { success: false, error: data.error?.message || 'Unknown error' };
    }

    return {
      success: true,
      messageId: data.message_id || data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error(`[${platform.toUpperCase()}] Send exception:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Mark message as seen (typing indicator)
export async function markSeen(
  platform: MetaPlatform,
  senderId: string,
  accessToken: string
): Promise<void> {
  if (platform === 'whatsapp') return; // WhatsApp doesn't support this

  try {
    await fetch('https://graph.facebook.com/v18.0/me/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        recipient: { id: senderId },
        sender_action: 'mark_seen',
      }),
    });
  } catch {
    // Ignore errors for sender actions
  }
}

// Show typing indicator
export async function showTyping(
  platform: MetaPlatform,
  senderId: string,
  accessToken: string
): Promise<void> {
  if (platform === 'whatsapp') return; // WhatsApp doesn't support this

  try {
    await fetch('https://graph.facebook.com/v18.0/me/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        recipient: { id: senderId },
        sender_action: 'typing_on',
      }),
    });
  } catch {
    // Ignore errors for sender actions
  }
}

// Get access token for platform
export function getAccessToken(platform: MetaPlatform): string {
  switch (platform) {
    case 'facebook':
      return process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
    case 'instagram':
      return process.env.INSTAGRAM_ACCESS_TOKEN || '';
    case 'whatsapp':
      return process.env.WHATSAPP_ACCESS_TOKEN || '';
    default:
      return '';
  }
}

// Get verify token (same token for all Meta platforms)
export function getVerifyToken(): string {
  return process.env.META_WEBHOOK_VERIFY_TOKEN || '';
}

// Get phone number ID for WhatsApp
export function getWhatsAppPhoneNumberId(): string {
  return process.env.WHATSAPP_PHONE_NUMBER_ID || '';
}
