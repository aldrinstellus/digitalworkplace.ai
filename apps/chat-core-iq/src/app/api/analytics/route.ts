import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
  channel?: 'web' | 'ivr' | 'sms' | 'facebook' | 'instagram' | 'whatsapp';
}

interface FeedbackEntry {
  id: string;
  messageId: string;
  conversationId: string;
  rating: 'positive' | 'negative';
  query: string;
  response: string;
  timestamp: string;
  language: string;
}

interface ConversationData {
  conversations: ConversationEntry[];
  lastUpdated: string | null;
}

interface FeedbackData {
  feedback: FeedbackEntry[];
  lastUpdated: string | null;
}

const CONVERSATIONS_FILE = path.join(process.cwd(), 'data', 'conversations.json');
const FEEDBACK_FILE = path.join(process.cwd(), 'data', 'feedback.json');

async function readConversationData(): Promise<ConversationData> {
  try {
    const content = await fs.readFile(CONVERSATIONS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { conversations: [], lastUpdated: null };
  }
}

async function readFeedbackData(): Promise<FeedbackData> {
  try {
    const content = await fs.readFile(FEEDBACK_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { feedback: [], lastUpdated: null };
  }
}

function calculateDuration(startTime: string, endTime: string | null): number {
  if (!endTime) return 0;
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / 1000);
}

function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const days = parseInt(searchParams.get('days') || '30');

    const [conversationData, feedbackData] = await Promise.all([
      readConversationData(),
      readFeedbackData(),
    ]);

    const { start } = getDateRange(days);

    const filteredConversations = conversationData.conversations.filter(
      c => new Date(c.startTime) >= start
    );
    const filteredFeedback = feedbackData.feedback.filter(
      f => new Date(f.timestamp) >= start
    );

    const totalConversations = filteredConversations.length;
    const totalMessages = filteredConversations.reduce(
      (sum, c) => sum + c.messages.length, 0
    );
    const avgMessagesPerConversation = totalConversations > 0
      ? Math.round(totalMessages / totalConversations * 10) / 10
      : 0;

    const avgDuration = totalConversations > 0
      ? Math.round(
          filteredConversations.reduce(
            (sum, c) => sum + calculateDuration(c.startTime, c.endTime), 0
          ) / totalConversations
        )
      : 0;

    const escalationRate = totalConversations > 0
      ? Math.round(
          (filteredConversations.filter(c => c.escalated).length / totalConversations) * 100
        )
      : 0;

    const positiveRatings = filteredFeedback.filter(f => f.rating === 'positive').length;
    const totalRatings = filteredFeedback.length;
    const satisfactionRate = totalRatings > 0
      ? Math.round((positiveRatings / totalRatings) * 100)
      : 0;

    const languageDistribution = {
      en: filteredConversations.filter(c => c.language === 'en').length,
      es: filteredConversations.filter(c => c.language === 'es').length,
      ht: filteredConversations.filter(c => c.language === 'ht').length,
    };

    const sentimentDistribution = {
      positive: filteredConversations.filter(c => c.sentiment === 'positive').length,
      neutral: filteredConversations.filter(c => c.sentiment === 'neutral').length,
      negative: filteredConversations.filter(c => c.sentiment === 'negative').length,
    };

    // Channel distribution for multi-channel analytics
    const channelDistribution = {
      web: filteredConversations.filter(c => !c.channel || c.channel === 'web').length,
      ivr: filteredConversations.filter(c => c.channel === 'ivr').length,
      sms: filteredConversations.filter(c => c.channel === 'sms').length,
      facebook: filteredConversations.filter(c => c.channel === 'facebook').length,
      instagram: filteredConversations.filter(c => c.channel === 'instagram').length,
      whatsapp: filteredConversations.filter(c => c.channel === 'whatsapp').length,
    };

    const dailyStats: Record<string, { conversations: number; messages: number; escalated: number }> = {};
    filteredConversations.forEach(c => {
      const date = new Date(c.startTime).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { conversations: 0, messages: 0, escalated: 0 };
      }
      dailyStats[date].conversations++;
      dailyStats[date].messages += c.messages.length;
      if (c.escalated) dailyStats[date].escalated++;
    });

    const analytics = {
      metadata: {
        reportGeneratedAt: new Date().toISOString(),
        dateRange: {
          start: start.toISOString(),
          end: new Date().toISOString(),
          days,
        },
        exportFormat: 'Power BI Compatible JSON',
      },
      summary: {
        totalConversations,
        totalMessages,
        avgMessagesPerConversation,
        avgDurationSeconds: avgDuration,
        escalationRate,
        satisfactionRate,
        feedbackResponses: totalRatings,
      },
      distributions: {
        language: languageDistribution,
        sentiment: sentimentDistribution,
        channel: channelDistribution,
      },
      dailyMetrics: Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        ...stats,
      })).sort((a, b) => a.date.localeCompare(b.date)),
      feedback: {
        total: totalRatings,
        positive: positiveRatings,
        negative: totalRatings - positiveRatings,
        satisfactionPercentage: satisfactionRate,
      },
    };

    if (format === 'csv') {
      const csvRows = [
        ['date', 'conversations', 'messages', 'escalated'].join(','),
        ...analytics.dailyMetrics.map(d =>
          [d.date, d.conversations, d.messages, d.escalated].join(',')
        ),
      ];
      return new NextResponse(csvRows.join('\n'), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="chatbot-analytics-${days}days.csv"`,
        },
      });
    }

    // If format=json explicitly requested, trigger download
    if (format === 'json') {
      return new NextResponse(JSON.stringify(analytics, null, 2), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="chatbot-analytics-${days}days.json"`,
        },
      });
    }

    // Default: return JSON for API consumption (no download)
    return NextResponse.json(analytics, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to generate analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500, headers: corsHeaders }
    );
  }
}
