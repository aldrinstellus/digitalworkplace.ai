/**
 * Streaming Chat API Route with Claude AI Integration
 * Uses Server-Sent Events (SSE) for real-time streaming responses
 *
 * Features:
 * - Real-time token streaming
 * - Conversation history context
 * - RAG context injection
 * - Progress events for UI feedback
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/lib/embeddings';

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

interface StreamEvent {
  type: 'start' | 'text' | 'sources' | 'metrics' | 'error' | 'done';
  data: unknown;
}

// Build conversation history from thread
async function buildConversationContext(
  threadId: string | undefined,
  currentMessage: string,
  limit: number = 20
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  if (!threadId) {
    return [{ role: 'user', content: currentMessage }];
  }

  try {
    const { data: messages, error } = await supabase
      .schema('diq')
      .from('chat_messages')
      .select('role, content')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error || !messages) {
      return [{ role: 'user', content: currentMessage }];
    }

    const conversationHistory = messages
      .filter((m): m is { role: 'user' | 'assistant'; content: string } =>
        m.role === 'user' || m.role === 'assistant'
      )
      .map(m => ({ role: m.role, content: m.content }));

    return [...conversationHistory, { role: 'user', content: currentMessage }];
  } catch {
    return [{ role: 'user', content: currentMessage }];
  }
}

// Calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// Fetch RAG context with vector search
async function getRAGContext(query: string, limit: number = 5): Promise<Source[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const sources: Source[] = [];

    // Search articles with embeddings
    const { data: articles } = await supabase
      .schema('diq')
      .from('articles')
      .select('id, title, content, slug, embedding')
      .eq('status', 'published')
      .not('embedding', 'is', null)
      .limit(limit * 2);

    if (articles) {
      const withSimilarity = articles
        .filter(a => a.embedding && Array.isArray(a.embedding))
        .map(a => ({
          ...a,
          similarity: cosineSimilarity(queryEmbedding, a.embedding as number[])
        }))
        .filter(a => a.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      withSimilarity.forEach(article => {
        sources.push({
          id: article.id,
          type: 'article',
          title: article.title || 'Untitled',
          url: `/diq/content/${article.slug || article.id}`,
          relevance: article.similarity,
          content: article.content?.slice(0, 500) || '',
        });
      });
    }

    // Search knowledge items
    const { data: knowledgeItems } = await supabase
      .from('knowledge_items')
      .select('id, title, content, type, source_url, embedding')
      .not('embedding', 'is', null)
      .limit(limit * 2);

    if (knowledgeItems) {
      const withSimilarity = knowledgeItems
        .filter(k => k.embedding && Array.isArray(k.embedding))
        .map(k => ({
          ...k,
          similarity: cosineSimilarity(queryEmbedding, k.embedding as number[])
        }))
        .filter(k => k.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      withSimilarity.forEach(item => {
        sources.push({
          id: item.id,
          type: item.type || 'document',
          title: item.title || 'Untitled',
          url: item.source_url || '/diq/content',
          relevance: item.similarity,
          content: item.content?.slice(0, 500) || '',
        });
      });
    }

    return sources.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
  } catch (error) {
    console.error('RAG error:', error);
    return [];
  }
}

// Build system prompt with RAG context
function buildSystemPrompt(style: string, sources: Source[]): string {
  const basePrompt = `You are an AI assistant for dIQ (Intranet IQ), a company intranet platform. Help employees find information, answer questions about company policies, and assist with work-related queries.

Guidelines:
1. Be accurate and cite sources when available
2. If uncertain, acknowledge it
3. Provide actionable information
4. Keep responses professional but friendly
`;

  const styleInstructions: Record<string, string> = {
    factual: '\nResponse style: Direct and precise. Focus on facts.',
    balanced: '\nResponse style: Clear with helpful context. Balance brevity with completeness.',
    creative: '\nResponse style: Engaging with examples. Make information memorable.',
  };

  const contextSection = sources.length > 0
    ? `\n\nRELEVANT KNOWLEDGE BASE CONTENT:\n${sources.map((s, i) => `[${i + 1}] ${s.title}:\n${s.content}\n`).join('\n')}`
    : '';

  return basePrompt + (styleInstructions[style] || styleInstructions.balanced) + contextSection;
}

// Format SSE message
function formatSSE(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const {
      message,
      threadId,
      model = 'claude-sonnet-4-20250514',
      responseStyle = 'balanced',
    } = await request.json();

    if (!message) {
      return new Response(
        formatSSE({ type: 'error', data: { error: 'Message is required' } }),
        {
          status: 400,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    }

    // Create a readable stream for SSE
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send start event
          controller.enqueue(encoder.encode(formatSSE({
            type: 'start',
            data: { threadId, model, timestamp: Date.now() }
          })));

          // Build conversation context
          const conversationHistory = await buildConversationContext(threadId, message, 20);

          // Fetch RAG context
          const sources = await getRAGContext(message, 5);

          // Send sources event
          controller.enqueue(encoder.encode(formatSSE({
            type: 'sources',
            data: sources.map(s => ({
              id: s.id,
              type: s.type,
              title: s.title,
              url: s.url,
              relevance: s.relevance,
            }))
          })));

          // Check for API key
          if (!process.env.ANTHROPIC_API_KEY) {
            // Demo mode - simulate streaming
            const demoResponse = "I'm your AI assistant for the Digital Workplace. I can help you find information about company policies, benefits, IT support, and more. What would you like to know?";

            for (const char of demoResponse) {
              controller.enqueue(encoder.encode(formatSSE({
                type: 'text',
                data: { text: char }
              })));
              await new Promise(resolve => setTimeout(resolve, 20)); // Simulate typing
            }

            controller.enqueue(encoder.encode(formatSSE({
              type: 'metrics',
              data: {
                responseTime: Date.now() - startTime,
                totalTokens: 0,
                demo: true,
              }
            })));

            controller.enqueue(encoder.encode(formatSSE({ type: 'done', data: {} })));
            controller.close();
            return;
          }

          // Real streaming with Claude
          const Anthropic = (await import('@anthropic-ai/sdk')).default;
          const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
          });

          const systemPrompt = buildSystemPrompt(responseStyle, sources);

          // Use streaming API
          const streamResponse = await anthropic.messages.stream({
            model,
            max_tokens: 2048,
            system: systemPrompt,
            messages: conversationHistory,
          });

          let fullResponse = '';
          let inputTokens = 0;
          let outputTokens = 0;

          // Stream text chunks
          for await (const event of streamResponse) {
            if (event.type === 'content_block_delta') {
              const delta = event.delta;
              if ('text' in delta) {
                fullResponse += delta.text;
                controller.enqueue(encoder.encode(formatSSE({
                  type: 'text',
                  data: { text: delta.text }
                })));
              }
            } else if (event.type === 'message_delta') {
              if (event.usage) {
                outputTokens = event.usage.output_tokens || 0;
              }
            } else if (event.type === 'message_start') {
              if (event.message?.usage) {
                inputTokens = event.message.usage.input_tokens || 0;
              }
            }
          }

          // Save to database if threadId provided
          if (threadId && fullResponse) {
            await supabase
              .schema('diq')
              .from('chat_messages')
              .insert({
                thread_id: threadId,
                role: 'assistant',
                content: fullResponse,
                sources: sources.map(s => ({
                  id: s.id,
                  type: s.type,
                  title: s.title,
                  url: s.url,
                  relevance: s.relevance,
                })),
                confidence: Math.min(95, 75 + sources.length * 4),
                tokens_used: outputTokens,
                llm_model: model,
                metadata: {},
              });
          }

          // Send metrics
          controller.enqueue(encoder.encode(formatSSE({
            type: 'metrics',
            data: {
              responseTime: Date.now() - startTime,
              totalTokens: inputTokens + outputTokens,
              inputTokens,
              outputTokens,
              confidence: Math.min(95, 75 + sources.length * 4),
            }
          })));

          // Send done event
          controller.enqueue(encoder.encode(formatSSE({ type: 'done', data: {} })));
          controller.close();

        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(formatSSE({
            type: 'error',
            data: { error: 'Streaming failed', message: String(error) }
          })));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });

  } catch (error) {
    console.error('Chat stream API error:', error);
    return new Response(
      formatSSE({ type: 'error', data: { error: 'Failed to process request' } }),
      {
        status: 500,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
}
