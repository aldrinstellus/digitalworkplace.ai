/**
 * Chat API Route with Claude AI Integration
 * Handles AI chat with RAG (Retrieval Augmented Generation) from knowledge base
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Source {
  id: string;
  type: string;
  title: string;
  url?: string;
  relevance: number;
  content?: string;
}

// Fetch relevant context from knowledge base using direct queries
async function getRAGContext(query: string, limit: number = 5): Promise<Source[]> {
  try {
    const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 2);
    const sources: Source[] = [];

    // Search articles in diq schema using ilike for partial matching
    const { data: articles, error: artError } = await supabase
      .schema('diq')
      .from('articles')
      .select('id, title, content, slug')
      .or(searchTerms.map(term => `title.ilike.%${term}%,content.ilike.%${term}%`).join(','))
      .eq('status', 'published')
      .limit(limit);

    if (!artError && articles) {
      articles.forEach((article, idx) => {
        sources.push({
          id: article.id,
          type: 'article',
          title: article.title || 'Untitled Article',
          url: `/diq/content/${article.slug || article.id}`,
          relevance: 0.95 - (idx * 0.05),
          content: article.content?.slice(0, 500) || '',
        });
      });
    }

    // Also search knowledge items in public schema
    const { data: knowledgeItems, error: kiError } = await supabase
      .from('knowledge_items')
      .select('id, title, content, item_type, source_url')
      .or(searchTerms.map(term => `title.ilike.%${term}%,content.ilike.%${term}%`).join(','))
      .limit(limit);

    if (!kiError && knowledgeItems) {
      knowledgeItems.forEach((item, idx) => {
        sources.push({
          id: item.id,
          type: item.item_type || 'document',
          title: item.title || 'Untitled Document',
          url: item.source_url || '/diq/content',
          relevance: 0.90 - (idx * 0.05),
          content: item.content?.slice(0, 500) || '',
        });
      });
    }

    // Sort by relevance and return top sources
    return sources.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
  } catch (error) {
    console.error('Error fetching RAG context:', error);
    return [];
  }
}

// Build system prompt based on response style
function buildSystemPrompt(style: string, sources: Source[]): string {
  const basePrompt = `You are an AI assistant for a company intranet called dIQ (Intranet IQ). You help employees find information, answer questions about company policies, and provide assistance with work-related queries.

Your knowledge is grounded in the company's knowledge base. When answering questions:
1. Be accurate and cite sources when available
2. If you're not sure about something, say so
3. Provide actionable information when possible
4. Keep responses professional but friendly

`;

  const styleInstructions: Record<string, string> = {
    factual: 'Provide direct, precise answers with minimal elaboration. Focus on facts and data.',
    balanced: 'Provide clear answers with helpful context. Balance brevity with completeness.',
    creative: 'Provide engaging explanations with examples and analogies. Make information memorable.',
  };

  const contextSection = sources.length > 0
    ? `\n\nRELEVANT KNOWLEDGE BASE CONTENT:\n${sources.map((s, i) => `[${i + 1}] ${s.title}:\n${s.content}\n`).join('\n')}`
    : '';

  return basePrompt + (styleInstructions[style] || styleInstructions.balanced) + contextSection;
}

// Demo responses for when no API key is configured
const DEMO_RESPONSES: Record<string, string> = {
  default: "I'm your AI assistant for the Digital Workplace. I can help you find information about company policies, benefits, IT support, and more. What would you like to know?",
  greeting: "Hello! I'm the dIQ AI Assistant. I can help you with questions about company policies, benefits, IT support, onboarding, and more. How can I assist you today?",
  benefits: "Our benefits package includes comprehensive health insurance (PPO/HMO options), dental & vision coverage, 401(k) with 100% match up to 4%, unlimited PTO, and a $500 annual wellness stipend. Would you like more details about any specific benefit?",
  vpn: "To set up VPN access: 1) Download the VPN client from the IT portal, 2) Install and launch the application, 3) Enter your corporate credentials, 4) Select the nearest server, 5) Click Connect. If you have issues, contact IT support at #it-support on Slack.",
  password: "To reset your password: Go to the IT Portal, click 'Forgot Password', enter your email, and check for the reset link. Password requirements: minimum 12 characters, mix of uppercase/lowercase/numbers, change every 90 days.",
  onboarding: "Welcome! Your onboarding checklist: Week 1 - Complete HR paperwork, set up workstation, attend orientation. Week 2 - Complete security training, review policies. Weeks 3-4 - Shadow team members, start first tasks. Check the 'Onboarding Checklist' article for full details.",
  meeting: "Meeting best practices: Send agenda 24h in advance, start/end on time, take notes, assign action items, send summary within 24h. Remember: No meetings before 10am, and Focus Fridays have minimal meetings.",
  slack: "Slack etiquette: Use #general for announcements only, #random for casual chat, #help-* channels for support. Use threads for discussions, set status when away, use reactions for acknowledgment. Avoid @channel unless urgent.",
};

function getDemoResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.match(/\b(hi|hello|hey|good morning|good afternoon)\b/)) {
    return DEMO_RESPONSES.greeting;
  }
  if (lowerMessage.match(/\b(benefit|health|insurance|401k|pto|vacation)\b/)) {
    return DEMO_RESPONSES.benefits;
  }
  if (lowerMessage.match(/\b(vpn|remote|connect|network)\b/)) {
    return DEMO_RESPONSES.vpn;
  }
  if (lowerMessage.match(/\b(password|reset|login|locked)\b/)) {
    return DEMO_RESPONSES.password;
  }
  if (lowerMessage.match(/\b(new|onboard|start|first day|orientation)\b/)) {
    return DEMO_RESPONSES.onboarding;
  }
  if (lowerMessage.match(/\b(meeting|agenda|calendar|schedule)\b/)) {
    return DEMO_RESPONSES.meeting;
  }
  if (lowerMessage.match(/\b(slack|channel|message|chat)\b/)) {
    return DEMO_RESPONSES.slack;
  }

  return DEMO_RESPONSES.default;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const {
      message,
      threadId,
      model = 'claude-sonnet-4-20250514',
      responseStyle = 'balanced'
    } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch relevant context from knowledge base using direct queries
    const sources = await getRAGContext(message, 5);

    // Check if Anthropic API key is configured
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Build system prompt with RAG context and response style
        const systemPrompt = buildSystemPrompt(responseStyle, sources);

        const response = await anthropic.messages.create({
          model,
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: message }],
        });

        const assistantMessage =
          response.content[0].type === 'text' ? response.content[0].text : '';

        // Calculate metrics
        const responseTime = Date.now() - startTime;
        const totalTokens = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

        // Calculate confidence based on sources found
        const confidence = sources.length > 0
          ? Math.min(95, 75 + (sources.length * 4))
          : 70;

        return NextResponse.json({
          message: assistantMessage,
          sources: sources.map(s => ({
            id: s.id,
            type: s.type,
            title: s.title,
            url: s.url,
            relevance: s.relevance,
          })),
          confidence,
          model,
          tokensUsed: response.usage?.output_tokens || 0,
          metrics: {
            responseTime,
            totalTokens,
            inputTokens: response.usage?.input_tokens || 0,
            outputTokens: response.usage?.output_tokens || 0,
          },
          steps: [
            { id: '1', name: 'Parsing query', status: 'completed', duration: 50 },
            { id: '2', name: 'Searching knowledge base', status: 'completed', duration: Math.floor(responseTime * 0.2) },
            { id: '3', name: 'Generating response', status: 'completed', duration: Math.floor(responseTime * 0.8) },
          ],
        });
      } catch (apiError) {
        console.error('Anthropic API error, falling back to demo mode:', apiError);
      }
    }

    // Demo mode: Return contextual response based on message
    const demoResponse = getDemoResponse(message);
    const responseTime = Date.now() - startTime;

    // Add context-aware response if we found relevant articles
    let finalResponse = demoResponse;
    if (sources.length > 0) {
      finalResponse = `Based on our knowledge base, here's what I found:\n\n${demoResponse}\n\n📚 Related articles: ${sources.map(s => s.title).join(', ')}`;
    }

    return NextResponse.json({
      message: finalResponse,
      sources: sources.map(s => ({
        id: s.id,
        type: s.type,
        title: s.title,
        url: s.url,
        relevance: s.relevance,
      })),
      confidence: sources.length > 0 ? 75 : 60,
      model: 'demo-mode',
      tokensUsed: 0,
      demo: true,
      metrics: {
        responseTime,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
      },
      steps: [
        { id: '1', name: 'Parsing query', status: 'completed', duration: 20 },
        { id: '2', name: 'Searching knowledge base', status: 'completed', duration: Math.floor(responseTime * 0.3) },
        { id: '3', name: 'Generating response', status: 'completed', duration: Math.floor(responseTime * 0.7) },
      ],
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
