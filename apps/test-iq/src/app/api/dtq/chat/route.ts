import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings';
import { createClient } from '@supabase/supabase-js';

// Persona display names
const PERSONA_TITLES: Record<string, string> = {
  csuite: 'C-Suite Executive',
  manager: 'QA Manager',
  techlead: 'Tech Lead / Engineer',
};

// Fallback responses when API keys are not configured (demo mode)
const DEMO_RESPONSES: Record<string, string> = {
  'high-risk': `## High-Risk Features Requiring Attention

Based on current metrics, here are the features that need immediate focus:

1. **xAPI / LRS Integration** (Manager) — Risk Score: 45, Coverage: 92%, 1 open defect
2. **Mobile Experience** (Manager) — Risk Score: 42, Coverage: 79%, 3 open defects
3. **Learning Analytics** (Manager) — Risk Score: 42, Coverage: 89%
4. **Penetration Test Suite** (Tech Lead) — Risk Score: 45, Coverage: 70%, 4 open defects
5. **Load Testing Framework** (Tech Lead) — Risk Score: 40, Coverage: 78%

### Recommended Actions:
- Prioritize automation for partially automated high-risk features
- Address open defects before next release
- Schedule targeted regression testing for high-impact areas`,

  'feature-status': `## Feature Coverage Summary

**Overall Statistics:**
- Total Features: 80 across all personas
- Average Coverage: ~88%
- Fully Automated: ~50% of features

**By Persona:**
- **C-Suite**: 16 features, 91% avg coverage
- **Manager**: 46 features, 88% avg coverage
- **Tech Lead**: 18 features, 85% avg coverage

### Areas for Improvement:
- Focus on categories with < 85% coverage
- Review partially automated features for full automation potential`,

  'automation-gaps': `## Automation Coverage Opportunities

**Current State:**
- Many features are only partially automated
- Highest gaps in Performance Engineering (Tech Lead) and Digital Transformation (C-Suite)

**Top Opportunities:**
- **Penetration Test Suite**: 70% coverage — 30% gap
- **Memory Profiler**: 75% coverage — 25% gap
- **Proctoring Support**: 75% coverage — 25% gap
- **Social Sharing**: 76% coverage — 24% gap
- **Virtual Classroom**: 77% coverage — 23% gap

### Recommendations:
- Prioritize high-impact features for full automation
- Consider AI-assisted test generation for complex scenarios
- Target 95% automation coverage by end of quarter`,

  'quality-summary': `## Executive Quality Summary

**Key Performance Indicators:**
- Test Pass Rate: **94-96%** (30-day avg, varies by persona)
- Automation Coverage: **89-95%**
- Open Defects: Distributed across all personas

**Risk Assessment:**
- High Risk: 4 features across all personas
- Medium Risk: ~40 features
- Low Risk: ~36 features

**Trend Analysis:**
Quality metrics show positive momentum with consistent improvement in pass rates and reduced defect escape rate.

### Strategic Recommendations:
1. Continue investment in automation infrastructure
2. Address high-risk features before major releases
3. Implement proactive monitoring for production defects`,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, persona = 'manager', history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Demo mode: no API keys configured
    if (!anthropicKey || !openaiKey || !supabaseUrl) {
      return handleDemoMode(message);
    }

    // --- RAG: Generate query embedding and search knowledge base ---
    let ragContext = '';
    const sources: { title: string; type: string; similarity: number }[] = [];

    try {
      const queryEmbedding = await generateEmbedding(message);

      // Use public schema — dtq schema is not exposed via PostgREST.
      // public.search_dtq_knowledge_semantic is a SECURITY DEFINER wrapper that queries dtq.knowledge_base.
      const supabase = createClient(supabaseUrl, supabaseKey!);

      const { data: matches, error: searchError } = await supabase.rpc(
        'search_dtq_knowledge_semantic',
        {
          query_embedding: JSON.stringify(queryEmbedding),
          match_threshold: 0.5,
          match_count: 8,
          filter_persona: persona,
          filter_types: null,
        }
      );

      if (searchError) {
        console.warn('RAG search error:', searchError.message);
      }

      if (!searchError && matches && matches.length > 0) {
        ragContext = matches
          .map(
            (m: { title: string; item_type: string; content: string; similarity: number }, i: number) =>
              `[${i + 1}] ${m.title} (${m.item_type}, similarity: ${(m.similarity * 100).toFixed(1)}%)\n${m.content}`
          )
          .join('\n\n---\n\n');

        sources.push(
          ...matches.map((m: { title: string; item_type: string; similarity: number }) => ({
            title: m.title,
            type: m.item_type,
            similarity: Math.round(m.similarity * 100) / 100,
          }))
        );
      }
    } catch (embeddingError) {
      console.warn('RAG search failed, proceeding without context:', embeddingError);
    }

    // --- Build system prompt ---
    const personaTitle = PERSONA_TITLES[persona] || 'QA Professional';
    const systemPrompt = buildSystemPrompt(persona, personaTitle, ragContext);

    // --- Build messages for Claude ---
    const claudeMessages = [
      ...history.slice(-10).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // --- Call Claude API ---
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: claudeMessages,
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', claudeResponse.status, errorText);
      return handleDemoMode(message);
    }

    const claudeData = await claudeResponse.json();
    const responseText =
      claudeData.content?.[0]?.text || "I wasn't able to generate a response. Please try again.";

    return NextResponse.json({
      response: responseText,
      sources,
      model: 'claude-sonnet-4-20250514',
      persona,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(persona: string, personaTitle: string, ragContext: string): string {
  let prompt = `You are Test Pilot IQ, an AI-powered testing intelligence assistant for a QA and testing platform.
You help ${personaTitle} users analyze QA metrics, test coverage, risk areas, and testing strategy.

Current persona: ${persona} (${personaTitle})

Guidelines:
- Reference specific features, metrics, and data points from the knowledge base context
- Provide actionable recommendations backed by data
- Format responses with markdown (headers, bold, lists)
- Be concise but thorough — aim for 150-300 words
- If the context doesn't contain relevant information, say so honestly
- Use the persona context to tailor your language (executives want ROI/strategy, managers want operational metrics, tech leads want technical details)`;

  if (ragContext) {
    prompt += `\n\nUse the following knowledge base context to answer the user's question:\n\n${ragContext}`;
  } else {
    prompt += `\n\nNo specific knowledge base context was found for this query. Provide general testing intelligence guidance based on your expertise.`;
  }

  return prompt;
}

function handleDemoMode(message: string): NextResponse {
  const messageLower = message.toLowerCase();

  // Match quick actions
  if (messageLower.includes('high-risk') || messageLower.includes('high risk')) {
    return NextResponse.json({
      response: DEMO_RESPONSES['high-risk'],
      sources: [],
      model: 'demo',
      persona: 'shared',
    });
  }
  if (messageLower.includes('feature status') || messageLower.includes('feature coverage')) {
    return NextResponse.json({
      response: DEMO_RESPONSES['feature-status'],
      sources: [],
      model: 'demo',
      persona: 'shared',
    });
  }
  if (messageLower.includes('automation') || messageLower.includes('coverage gap')) {
    return NextResponse.json({
      response: DEMO_RESPONSES['automation-gaps'],
      sources: [],
      model: 'demo',
      persona: 'shared',
    });
  }
  if (
    messageLower.includes('quality') ||
    messageLower.includes('summary') ||
    messageLower.includes('executive')
  ) {
    return NextResponse.json({
      response: DEMO_RESPONSES['quality-summary'],
      sources: [],
      model: 'demo',
      persona: 'shared',
    });
  }

  // Generic fallback
  return NextResponse.json({
    response: `Based on current testing metrics, here are my insights on "${message}":\n\n- Overall test coverage is healthy across all personas\n- No critical blockers detected in the related areas\n- Recommend reviewing the feature coverage section for detailed data\n\n*Note: Running in demo mode. Configure ANTHROPIC_API_KEY and OPENAI_API_KEY for full AI-powered responses with RAG.*`,
    sources: [],
    model: 'demo',
    persona: 'shared',
  });
}
