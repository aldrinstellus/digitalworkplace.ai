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

interface FeedbackData {
  feedback: FeedbackEntry[];
  lastUpdated: string | null;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'feedback.json');

async function readFeedbackData(): Promise<FeedbackData> {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { feedback: [], lastUpdated: null };
  }
}

async function writeFeedbackData(data: FeedbackData): Promise<void> {
  data.lastUpdated = new Date().toISOString();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = await readFeedbackData();

    const stats = {
      total: data.feedback.length,
      positive: data.feedback.filter(f => f.rating === 'positive').length,
      negative: data.feedback.filter(f => f.rating === 'negative').length,
      lastUpdated: data.lastUpdated,
    };

    return NextResponse.json({
      stats,
      recentFeedback: data.feedback.slice(-10).reverse(),
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Failed to read feedback:', error);
    return NextResponse.json(
      { error: 'Failed to read feedback data' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, conversationId, rating, query, response, language } = body;

    if (!messageId || !rating || !['positive', 'negative'].includes(rating)) {
      return NextResponse.json(
        { error: 'Invalid feedback data. messageId and rating (positive/negative) are required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const feedbackEntry: FeedbackEntry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      messageId,
      conversationId: conversationId || 'unknown',
      rating,
      query: query || '',
      response: response || '',
      timestamp: new Date().toISOString(),
      language: language || 'en',
    };

    const data = await readFeedbackData();
    data.feedback.push(feedbackEntry);
    await writeFeedbackData(data);

    return NextResponse.json({
      success: true,
      feedbackId: feedbackEntry.id,
      message: rating === 'positive'
        ? 'Thank you for your positive feedback!'
        : 'Thank you for your feedback. We will work to improve.',
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Failed to save feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500, headers: corsHeaders }
    );
  }
}
