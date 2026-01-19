import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ConversationEntry {
  id: string;
  sessionId: string;
  startTime: string;
  endTime: string | null;
  messages: Message[];
  language: string;
  sentiment: string;
  escalated: boolean;
  feedbackGiven: boolean;
  userAgent: string;
  referrer: string;
}

interface ConversationData {
  conversations: ConversationEntry[];
  lastUpdated: string | null;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'conversations.json');

async function readConversationData(): Promise<ConversationData> {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { conversations: [], lastUpdated: null };
  }
}

async function writeConversationData(data: ConversationData): Promise<void> {
  data.lastUpdated = new Date().toISOString();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const data = await readConversationData();

    const stats = {
      total: data.conversations.length,
      escalated: data.conversations.filter(c => c.escalated).length,
      withFeedback: data.conversations.filter(c => c.feedbackGiven).length,
      byLanguage: {
        en: data.conversations.filter(c => c.language === 'en').length,
        es: data.conversations.filter(c => c.language === 'es').length,
        ht: data.conversations.filter(c => c.language === 'ht').length,
      },
      bySentiment: {
        positive: data.conversations.filter(c => c.sentiment === 'positive').length,
        neutral: data.conversations.filter(c => c.sentiment === 'neutral').length,
        negative: data.conversations.filter(c => c.sentiment === 'negative').length,
      },
      lastUpdated: data.lastUpdated,
    };

    const conversations = data.conversations
      .slice()
      .reverse()
      .slice(offset, offset + limit);

    return NextResponse.json({
      stats,
      conversations,
      pagination: {
        total: data.conversations.length,
        limit,
        offset,
        hasMore: offset + limit < data.conversations.length,
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Failed to read conversations:', error);
    return NextResponse.json(
      { error: 'Failed to read conversation data' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      messages,
      language,
      sentiment,
      escalated,
      feedbackGiven,
      userAgent,
      referrer,
    } = body;

    if (!sessionId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid data. sessionId and messages array are required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const conversationEntry: ConversationEntry = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      startTime: messages[0]?.timestamp || new Date().toISOString(),
      endTime: messages[messages.length - 1]?.timestamp || new Date().toISOString(),
      messages: messages.map((m: Message) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp || new Date().toISOString(),
      })),
      language: language || 'en',
      sentiment: sentiment || 'neutral',
      escalated: escalated || false,
      feedbackGiven: feedbackGiven || false,
      userAgent: userAgent || 'unknown',
      referrer: referrer || 'unknown',
    };

    const data = await readConversationData();
    data.conversations.push(conversationEntry);
    await writeConversationData(data);

    return NextResponse.json({
      success: true,
      conversationId: conversationEntry.id,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Failed to save conversation:', error);
    return NextResponse.json(
      { error: 'Failed to save conversation' },
      { status: 500, headers: corsHeaders }
    );
  }
}
