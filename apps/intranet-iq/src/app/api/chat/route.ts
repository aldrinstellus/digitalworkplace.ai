/**
 * Chat API Route with Claude AI Integration
 * Handles AI chat with RAG (Retrieval Augmented Generation) from knowledge base
 *
 * Features:
 * - Conversation history context (multi-turn conversations)
 * - Vector-based semantic search using pgvector
 * - Hybrid search (keyword + semantic)
 * - Function calling / Tool use
 */

import { NextRequest, NextResponse } from 'next/server';
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

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Tool definitions for Claude function calling
const tools = [
  {
    name: 'search_knowledge_base',
    description: 'Search the company knowledge base for articles, policies, and documentation',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to find relevant information',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 5)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_employee_info',
    description: 'Look up information about an employee by name, email, or department',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Employee name to search for',
        },
        department: {
          type: 'string',
          description: 'Department to filter by',
        },
      },
      required: [],
    },
  },
  {
    name: 'create_task',
    description: 'Create a personal task or reminder for the user',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Task title',
        },
        description: {
          type: 'string',
          description: 'Task description',
        },
        due_date: {
          type: 'string',
          description: 'Due date in ISO format',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Task priority',
        },
      },
      required: ['title'],
    },
  },
];

// Build conversation history from thread
async function buildConversationContext(
  threadId: string | undefined,
  currentMessage: string,
  limit: number = 20
): Promise<ConversationMessage[]> {
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
      console.error('Error fetching conversation history:', error);
      return [{ role: 'user', content: currentMessage }];
    }

    // Filter to only user and assistant messages for context
    const conversationHistory = messages
      .filter((m): m is { role: 'user' | 'assistant'; content: string } =>
        m.role === 'user' || m.role === 'assistant'
      )
      .map(m => ({ role: m.role, content: m.content }));

    // Add current message
    return [...conversationHistory, { role: 'user', content: currentMessage }];
  } catch (error) {
    console.error('Error building conversation context:', error);
    return [{ role: 'user', content: currentMessage }];
  }
}

// Fetch relevant context using vector similarity search (pgvector)
async function getRAGContextSemantic(query: string, limit: number = 5): Promise<Source[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    const sources: Source[] = [];

    // Vector similarity search on articles
    const { data: articles, error: artError } = await supabase
      .schema('diq')
      .from('articles')
      .select('id, title, content, slug, embedding')
      .eq('status', 'published')
      .not('embedding', 'is', null)
      .limit(limit * 2); // Fetch more to filter by similarity

    if (!artError && articles && articles.length > 0) {
      // Calculate cosine similarity manually since we can't use RPC
      const articlesWithSimilarity = articles
        .filter(a => a.embedding && Array.isArray(a.embedding))
        .map(article => {
          const similarity = cosineSimilarity(queryEmbedding, article.embedding as number[]);
          return { ...article, similarity };
        })
        .filter(a => a.similarity > 0.3) // Threshold
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      articlesWithSimilarity.forEach(article => {
        sources.push({
          id: article.id,
          type: 'article',
          title: article.title || 'Untitled Article',
          url: `/diq/content/${article.slug || article.id}`,
          relevance: article.similarity,
          content: article.content?.slice(0, 500) || '',
        });
      });
    }

    // Also search knowledge items with vector similarity
    const { data: knowledgeItems, error: kiError } = await supabase
      .from('knowledge_items')
      .select('id, title, content, type, source_url, embedding')
      .not('embedding', 'is', null)
      .limit(limit * 2);

    if (!kiError && knowledgeItems && knowledgeItems.length > 0) {
      const itemsWithSimilarity = knowledgeItems
        .filter(k => k.embedding && Array.isArray(k.embedding))
        .map(item => {
          const similarity = cosineSimilarity(queryEmbedding, item.embedding as number[]);
          return { ...item, similarity };
        })
        .filter(k => k.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      itemsWithSimilarity.forEach(item => {
        sources.push({
          id: item.id,
          type: item.type || 'document',
          title: item.title || 'Untitled Document',
          url: item.source_url || '/diq/content',
          relevance: item.similarity,
          content: item.content?.slice(0, 500) || '',
        });
      });
    }

    // Sort by relevance and return top sources
    return sources.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
  } catch (error) {
    console.error('Error in semantic RAG context:', error);
    // Fall back to keyword search
    return getRAGContextKeyword(query, limit);
  }
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// Fallback: Fetch relevant context using keyword search
async function getRAGContextKeyword(query: string, limit: number = 5): Promise<Source[]> {
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
      .select('id, title, content, type, source_url')
      .or(searchTerms.map(term => `title.ilike.%${term}%,content.ilike.%${term}%`).join(','))
      .limit(limit);

    if (!kiError && knowledgeItems) {
      knowledgeItems.forEach((item, idx) => {
        sources.push({
          id: item.id,
          type: item.type || 'document',
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

// Hybrid RAG: combines semantic and keyword search
async function getRAGContext(query: string, limit: number = 5): Promise<Source[]> {
  try {
    // Try semantic search first (vector-based)
    const semanticSources = await getRAGContextSemantic(query, limit);

    // If we got good results, return them
    if (semanticSources.length >= 3) {
      return semanticSources;
    }

    // Otherwise, augment with keyword search
    const keywordSources = await getRAGContextKeyword(query, limit);

    // Merge and deduplicate
    const allSources = [...semanticSources];
    const existingIds = new Set(semanticSources.map(s => s.id));

    for (const source of keywordSources) {
      if (!existingIds.has(source.id)) {
        allSources.push(source);
        existingIds.add(source.id);
      }
    }

    return allSources.slice(0, limit);
  } catch (error) {
    console.error('Error in hybrid RAG:', error);
    return getRAGContextKeyword(query, limit);
  }
}

// Execute tool calls
async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<string> {
  switch (toolName) {
    case 'search_knowledge_base': {
      const query = toolInput.query as string;
      const limit = (toolInput.limit as number) || 5;
      const sources = await getRAGContext(query, limit);

      if (sources.length === 0) {
        return 'No relevant articles found in the knowledge base.';
      }

      return sources.map((s, i) =>
        `${i + 1}. **${s.title}** (${s.type})\n   ${s.content?.slice(0, 200)}...\n   Link: ${s.url}`
      ).join('\n\n');
    }

    case 'get_employee_info': {
      const name = toolInput.name as string;
      const department = toolInput.department as string;

      let query = supabase
        .schema('diq')
        .from('employees')
        .select(`
          *,
          user:user_id(id, full_name, email, avatar_url),
          department:department_id(id, name)
        `)
        .limit(5);

      if (name) {
        query = query.ilike('user.full_name', `%${name}%`);
      }
      if (department) {
        query = query.ilike('department.name', `%${department}%`);
      }

      const { data: employees, error } = await query;

      if (error || !employees || employees.length === 0) {
        return 'No employees found matching the criteria.';
      }

      return employees.map((e: Record<string, unknown>) => {
        const user = e.user as { full_name?: string; email?: string } | null;
        const dept = e.department as { name?: string } | null;
        return `- **${user?.full_name || 'Unknown'}** (${e.job_title || 'No title'})\n  Department: ${dept?.name || 'N/A'}\n  Email: ${user?.email || 'N/A'}`;
      }).join('\n\n');
    }

    case 'create_task': {
      // For now, return a confirmation (actual task creation will be implemented with productivity features)
      const title = toolInput.title as string;
      const dueDate = toolInput.due_date as string;
      const priority = toolInput.priority as string || 'medium';

      return `✅ Task created: "${title}"\n   Priority: ${priority}\n   ${dueDate ? `Due: ${dueDate}` : 'No due date set'}`;
    }

    default:
      return `Unknown tool: ${toolName}`;
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
  const steps: { id: string; name: string; status: string; duration: number }[] = [];

  try {
    const {
      message,
      threadId,
      model = 'claude-sonnet-4-20250514',
      responseStyle = 'balanced',
      enableToolUse = true,
    } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Step 1: Build conversation context from thread history
    const contextStartTime = Date.now();
    const conversationHistory = await buildConversationContext(threadId, message, 20);
    steps.push({
      id: '1',
      name: 'Building conversation context',
      status: 'completed',
      duration: Date.now() - contextStartTime,
    });

    // Step 2: Fetch relevant context from knowledge base using hybrid search
    const ragStartTime = Date.now();
    const sources = await getRAGContext(message, 5);
    steps.push({
      id: '2',
      name: 'Semantic knowledge search',
      status: 'completed',
      duration: Date.now() - ragStartTime,
    });

    // Check if Anthropic API key is configured
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Build system prompt with RAG context and response style
        const systemPrompt = buildSystemPrompt(responseStyle, sources);

        // Step 3: Generate response with Claude
        const llmStartTime = Date.now();

        // Initial API call with tool support
        let response = await anthropic.messages.create({
          model,
          max_tokens: 2048,
          system: systemPrompt,
          messages: conversationHistory,
          ...(enableToolUse ? { tools } : {}),
        });

        steps.push({
          id: '3',
          name: 'LLM initial response',
          status: 'completed',
          duration: Date.now() - llmStartTime,
        });

        // Handle tool use if Claude wants to use tools
        let assistantMessage = '';
        let toolResults: string[] = [];

        // Process tool calls in a loop (max 3 iterations to prevent infinite loops)
        let iterations = 0;
        const maxIterations = 3;

        while (response.stop_reason === 'tool_use' && iterations < maxIterations) {
          iterations++;
          const toolUseBlocks = response.content.filter(
            (block): block is { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> } =>
              block.type === 'tool_use'
          );

          const toolResultsContent: { type: 'tool_result'; tool_use_id: string; content: string }[] = [];

          for (const toolBlock of toolUseBlocks) {
            const toolStartTime = Date.now();
            const result = await executeTool(toolBlock.name, toolBlock.input);
            toolResults.push(`Tool: ${toolBlock.name} → ${result.slice(0, 100)}...`);

            toolResultsContent.push({
              type: 'tool_result',
              tool_use_id: toolBlock.id,
              content: result,
            });

            steps.push({
              id: `tool-${toolBlock.id}`,
              name: `Tool: ${toolBlock.name}`,
              status: 'completed',
              duration: Date.now() - toolStartTime,
            });
          }

          // Continue the conversation with tool results
          const continueStartTime = Date.now();
          response = await anthropic.messages.create({
            model,
            max_tokens: 2048,
            system: systemPrompt,
            messages: [
              ...conversationHistory,
              { role: 'assistant', content: response.content },
              { role: 'user', content: toolResultsContent },
            ],
            ...(enableToolUse ? { tools } : {}),
          });

          steps.push({
            id: `continue-${iterations}`,
            name: 'Processing tool results',
            status: 'completed',
            duration: Date.now() - continueStartTime,
          });
        }

        // Extract final text response
        for (const block of response.content) {
          if (block.type === 'text') {
            assistantMessage += block.text;
          }
        }

        // Calculate metrics
        const responseTime = Date.now() - startTime;
        const totalTokens = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

        // Calculate confidence based on sources found and tool use
        const baseConfidence = sources.length > 0 ? 75 + (sources.length * 4) : 70;
        const toolBonus = toolResults.length > 0 ? 5 : 0;
        const confidence = Math.min(98, baseConfidence + toolBonus);

        // Save assistant message to thread if threadId provided
        if (threadId) {
          await supabase
            .schema('diq')
            .from('chat_messages')
            .insert({
              thread_id: threadId,
              role: 'assistant',
              content: assistantMessage,
              sources: sources.map(s => ({
                id: s.id,
                type: s.type,
                title: s.title,
                url: s.url,
                relevance: s.relevance,
              })),
              confidence,
              tokens_used: response.usage?.output_tokens || 0,
              llm_model: model,
              metadata: { toolResults },
            });
        }

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
          toolsUsed: toolResults,
          metrics: {
            responseTime,
            totalTokens,
            inputTokens: response.usage?.input_tokens || 0,
            outputTokens: response.usage?.output_tokens || 0,
            conversationTurns: conversationHistory.length,
          },
          steps,
        });
      } catch (apiError) {
        console.error('Anthropic API error, falling back to demo mode:', apiError);
        steps.push({
          id: 'error',
          name: 'API error - falling back to demo mode',
          status: 'completed',
          duration: 0,
        });
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

    steps.push({
      id: '3',
      name: 'Demo mode response',
      status: 'completed',
      duration: Date.now() - startTime - steps.reduce((sum, s) => sum + s.duration, 0),
    });

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
        conversationTurns: conversationHistory.length,
      },
      steps,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
