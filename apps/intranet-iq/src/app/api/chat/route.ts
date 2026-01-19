import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabase, getChatContext } from '@/lib/supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, threadId, model = 'claude-sonnet-4-20250514' } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get RAG context if we have embeddings
    let context = '';
    let sources: { type: string; id: string; title: string }[] = [];

    // For now, we'll use keyword search since we don't have embeddings yet
    // In production, you'd generate an embedding for the query and use semantic search
    const { data: searchResults } = await supabase
      .schema('diq')
      .from('articles')
      .select('id, title, summary, content')
      .eq('status', 'published')
      .textSearch('title', message.split(' ').slice(0, 3).join(' & '), { type: 'websearch' })
      .limit(3);

    if (searchResults && searchResults.length > 0) {
      context = searchResults
        .map((r) => `### ${r.title}\n${r.summary || r.content?.substring(0, 500)}`)
        .join('\n\n');
      sources = searchResults.map((r) => ({
        type: 'article',
        id: r.id,
        title: r.title,
      }));
    }

    // Build the system prompt with context
    const systemPrompt = `You are an AI assistant for Digital Workplace AI's Intranet IQ platform.
You help employees find information, answer questions about company policies, and assist with work tasks.

Be helpful, professional, and concise. If you're not sure about something, say so.
When citing information from the knowledge base, mention the source.

${context ? `Here is relevant information from our knowledge base:\n\n${context}` : ''}`;

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    });

    const assistantMessage =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Save to database if threadId provided
    if (threadId) {
      // Save user message
      await supabase.schema('diq').from('chat_messages').insert({
        thread_id: threadId,
        role: 'user',
        content: message,
      });

      // Save assistant message
      await supabase.schema('diq').from('chat_messages').insert({
        thread_id: threadId,
        role: 'assistant',
        content: assistantMessage,
        sources: sources,
        tokens_used: response.usage.output_tokens,
        llm_model: model,
      });
    }

    return NextResponse.json({
      message: assistantMessage,
      sources,
      model,
      tokensUsed: response.usage.output_tokens,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
