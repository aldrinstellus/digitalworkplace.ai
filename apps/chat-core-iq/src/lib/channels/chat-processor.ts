// Shared chat processor for all channels (Web, IVR, SMS, Social)
// Reuses the same RAG + LLM pipeline with LLM fallback support

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { detectLanguage, getSystemPrompt, Language } from '@/lib/i18n';
import { analyzeSentiment } from '@/lib/sentiment';
import { ChannelType, ChannelResponse } from './types';
import { getSessionHistory, addMessageToSession, updateSessionLanguage } from './session-manager';

// Lazy initialization for LLM clients
let openai: OpenAI | null = null;
let anthropic: Anthropic | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

function getAnthropic(): Anthropic | null {
  if (!anthropic && process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

interface KnowledgeResult {
  id: string;
  title: string;
  section: string;
  url: string;
  content: string;
  summary: string;
  score: number;
}

async function getKnowledgeContext(query: string, limit = 5, domain?: string): Promise<KnowledgeResult[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002/dcq';
    const response = await fetch(`${baseUrl}/api/knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit, includeContent: true, domain }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch {
    return [];
  }
}

function buildContextString(results: KnowledgeResult[]): string {
  if (results.length === 0) {
    return 'No specific information found in the knowledge base for this query.';
  }
  return results
    .map((r, i) => `[Source ${i + 1}: ${r.title}]\n${r.content}\n`)
    .join('\n---\n');
}

export interface ProcessChatOptions {
  channel: ChannelType;
  userId: string;
  message: string;
  requestedLanguage?: Language;
  domain?: string; // For multi-URL support (doralpd.com vs cityofdoral.com)
}

export async function processChat(options: ProcessChatOptions): Promise<ChannelResponse> {
  const { channel, userId, message, requestedLanguage, domain } = options;

  // Get conversation history for session continuity
  const history = await getSessionHistory(channel, userId);

  // Add user message to session
  await addMessageToSession(channel, userId, 'user', message);

  // Detect language
  const detectedLanguage = requestedLanguage || detectLanguage(message);
  await updateSessionLanguage(channel, userId, detectedLanguage);

  // Analyze sentiment
  const sentiment = analyzeSentiment(message);

  // Fetch relevant knowledge (with domain filtering for multi-URL support)
  const knowledgeResults = await getKnowledgeContext(message, 5, domain);
  const contextString = buildContextString(knowledgeResults);

  // Build system prompt
  const systemPrompt = getSystemPrompt(detectedLanguage, contextString, sentiment);

  // Prepare messages for OpenAI (include history for context)
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ];

  const maxTokens = channel === 'sms' ? 320 : 1000;
  let assistantMessage: string;

  // Try Claude first (primary), fallback to OpenAI if needed (ITN 3.2.3 LLM Support)
  const claudeClient = getAnthropic();
  if (claudeClient) {
    try {
      const claudeMessages = history.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      claudeMessages.push({ role: 'user', content: message });

      const claudeResponse = await claudeClient.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: claudeMessages,
      });

      assistantMessage = claudeResponse.content[0].type === 'text'
        ? claudeResponse.content[0].text
        : '';
    } catch (claudeError) {
      console.error('Claude API error, attempting OpenAI fallback:', claudeError);

      // Try OpenAI fallback
      try {
        const completion = await getOpenAI().chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: maxTokens,
        });
        assistantMessage = completion.choices[0]?.message?.content || '';
      } catch (openaiError) {
        console.error('OpenAI fallback also failed:', openaiError);
        assistantMessage = '';
      }
    }
  } else {
    // No Claude key, try OpenAI
    try {
      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
      });
      assistantMessage = completion.choices[0]?.message?.content || '';
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      assistantMessage = '';
    }
  }

  // Default message if both LLMs failed (English, Spanish, Haitian Creole)
  if (!assistantMessage) {
    if (detectedLanguage === 'es') {
      assistantMessage = 'Lo siento, no pude procesar su solicitud. Por favor intente de nuevo.';
    } else if (detectedLanguage === 'ht') {
      assistantMessage = 'Eskize mwen, mwen pa t kapab trete demann ou an. Tanpri eseye ankò.';
    } else {
      assistantMessage = 'I apologize, I could not process your request. Please try again.';
    }
  }

  // Add assistant message to session
  await addMessageToSession(channel, userId, 'assistant', assistantMessage);

  // Prepare sources
  const sources = knowledgeResults.map(r => ({
    title: r.title,
    url: r.url,
  }));

  const escalate = sentiment.category === 'negative' || sentiment.category === 'urgent';

  return {
    message: assistantMessage,
    language: detectedLanguage,
    sentiment: sentiment.category,
    sources,
    escalate,
    conversationId: `${channel}_${userId}_${Date.now()}`,
  };
}

// Log channel conversation for analytics
export async function logChannelConversation(
  channel: ChannelType,
  userId: string,
  userMessage: string,
  assistantMessage: string,
  language: string,
  sentiment: string,
  escalated: boolean
): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002/dcq';
    await fetch(`${baseUrl}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel,
        userId,
        userMessage,
        assistantMessage,
        language,
        sentiment,
        escalated,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Failed to log channel conversation:', error);
  }
}
