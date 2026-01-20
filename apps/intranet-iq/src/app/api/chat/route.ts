import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  try {
    const { message, threadId, model = 'claude-sonnet-4-20250514' } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Search for relevant articles using the RPC function
    let sources: { type: string; id: string; title: string }[] = [];
    let context = '';

    try {
      const { data: searchResults } = await supabase.rpc('search_diq_articles', {
        search_query: message,
        category_slug: null,
        max_results: 3,
      });

      if (searchResults && searchResults.length > 0) {
        context = searchResults
          .map((r: any) => `### ${r.title}\n${r.summary || r.content?.substring(0, 500)}`)
          .join('\n\n');
        sources = searchResults.map((r: any) => ({
          type: 'article',
          id: r.id,
          title: r.title,
        }));
      }
    } catch (searchError) {
      console.warn('Search failed, continuing without context:', searchError);
    }

    // Check if Anthropic API key is configured
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const systemPrompt = `You are an AI assistant for Digital Workplace AI's Intranet IQ platform.
You help employees find information, answer questions about company policies, and assist with work tasks.

Be helpful, professional, and concise. If you're not sure about something, say so.
When citing information from the knowledge base, mention the source.

${context ? `Here is relevant information from our knowledge base:\n\n${context}` : ''}`;

        const response = await anthropic.messages.create({
          model,
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: message }],
        });

        const assistantMessage =
          response.content[0].type === 'text' ? response.content[0].text : '';

        return NextResponse.json({
          message: assistantMessage,
          sources,
          model,
          tokensUsed: response.usage.output_tokens,
        });
      } catch (apiError) {
        console.error('Anthropic API error, falling back to demo mode:', apiError);
      }
    }

    // Demo mode: Return contextual response based on message
    const demoResponse = getDemoResponse(message);

    // Add context-aware response if we found relevant articles
    let finalResponse = demoResponse;
    if (sources.length > 0) {
      finalResponse = `Based on our knowledge base, here's what I found:\n\n${demoResponse}\n\n📚 Related articles: ${sources.map(s => s.title).join(', ')}`;
    }

    return NextResponse.json({
      message: finalResponse,
      sources,
      model: 'demo-mode',
      tokensUsed: 0,
      demo: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
