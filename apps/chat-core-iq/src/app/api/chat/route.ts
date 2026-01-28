import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { detectLanguage, getSystemPrompt, Language } from '@/lib/i18n';
import { analyzeSentiment } from '@/lib/sentiment';
import { getSettings } from '@/lib/data-store';
import { promises as fs } from 'fs';
import path from 'path';

// Workflow imports
import {
  detectWorkflowIntent,
  isWorkflowCommand,
  matchFAQWithAction,
} from '@/lib/workflow-matcher';
import {
  getWorkflowType,
  isInWorkflow,
  setLanguage as setStateLanguage,
  clearWorkflow
} from '@/lib/conversation-state';
import {
  startAppointmentFlow,
  handleSelectService,
  handleSelectDate,
  handleSelectTime,
  confirmAppointment,
  cancelAppointmentFlow,
  processAppointmentStep
} from '@/lib/workflows/appointment-flow';
import {
  startServiceRequestFlow,
  handleCategorySelection,
  processServiceRequestStep,
  cancelServiceRequestFlow
} from '@/lib/workflows/service-request-flow';
import { processFAQAction, ActionButton } from '@/lib/workflows/faq-actions';

// Tyler Technologies Integration
import {
  handleTylerQuery,
  detectTylerQuery,
  TylerQueryResult
} from '@/lib/tyler-integration';

// Allowed origins for chat widget
const ALLOWED_ORIGINS = [
  'https://dcq.digitalworkplace.ai',
  'https://www.digitalworkplace.ai',
  'https://digitalworkplace-ai.vercel.app',
  'https://www.cityofdoral.com',
  'https://cityofdoral.com',
  'http://localhost:3000',
  'http://localhost:3002',
];

// Get CORS headers with dynamic origin validation
function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin');

  // Check if origin is in allowed list
  const isAllowed = origin && ALLOWED_ORIGINS.some(allowed =>
    origin === allowed || origin.startsWith(allowed)
  );

  // In development or if origin is allowed, reflect the origin
  // Otherwise use the first allowed origin (prevents open CORS)
  const allowedOrigin = isAllowed && origin ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Legacy static headers for backwards compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS preflight request
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) });
}

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;
let anthropic: Anthropic | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
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

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ConversationLogEntry {
  id: string;
  sessionId: string;
  startTime: string;
  endTime: string;
  messages: Array<{ role: string; content: string; timestamp: string }>;
  language: string;
  sentiment: string;
  escalated: boolean;
  feedbackGiven: boolean;
  userAgent: string;
  referrer: string;
}

interface WorkflowState {
  active: boolean;
  type: string;
  step: number;
  stepName?: string;
}

interface ChatResponse {
  message: string;
  language: string;
  sentiment: string;
  sentimentScore: number;
  sources: Array<{ title: string; url: string; section: string }>;
  escalate: boolean;
  conversationId: string;
  actions?: ActionButton[];
  workflowState?: WorkflowState;
}

const CONVERSATIONS_FILE = path.join(process.cwd(), 'data', 'conversations.json');

async function logConversation(entry: ConversationLogEntry): Promise<void> {
  try {
    let data: { conversations: ConversationLogEntry[]; lastUpdated: string | null } = { conversations: [], lastUpdated: null };
    try {
      const content = await fs.readFile(CONVERSATIONS_FILE, 'utf-8');
      data = JSON.parse(content);
    } catch {
      // File doesn't exist, use default
    }
    data.conversations.push(entry);
    data.lastUpdated = new Date().toISOString();
    await fs.writeFile(CONVERSATIONS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to log conversation:', error);
  }
}

// Fetch relevant context from knowledge base
async function getKnowledgeContext(query: string, limit = 5, domain?: string): Promise<KnowledgeResult[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002/dcq';
    const response = await fetch(`${baseUrl}/api/knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit, includeContent: true, domain }),
    });

    if (!response.ok) {
      console.error('Knowledge API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Failed to fetch knowledge context:', error);
    return [];
  }
}

// Build context string from knowledge results
function buildContextString(results: KnowledgeResult[]): string {
  if (results.length === 0) {
    return 'No specific information found in the knowledge base for this query.';
  }

  return results
    .map((r, i) => `[Source ${i + 1}: ${r.title}]\n${r.content}\n`)
    .join('\n---\n');
}

// Get localized message based on language
function getLocalizedMessage(result: { message: string; messageEs?: string; messageHt?: string }, language: Language): string {
  if (language === 'ht' && result.messageHt) return result.messageHt;
  if (language === 'es' && result.messageEs) return result.messageEs;
  return result.message;
}

// Process workflow commands (button clicks)
async function processWorkflowCommand(
  sessionId: string,
  command: { command: string; payload?: string },
  language: Language
): Promise<ChatResponse | null> {
  switch (command.command) {
    case 'start-appointment': {
      const result = await startAppointmentFlow(sessionId, language, command.payload);
      return {
        message: getLocalizedMessage(result, language),
        language,
        sentiment: 'neutral',
        sentimentScore: 0,
        sources: [],
        escalate: false,
        conversationId: '',
        actions: result.actions,
        workflowState: result.workflowState
      };
    }

    case 'start-service-request': {
      const result = await startServiceRequestFlow(sessionId, language);
      return {
        message: getLocalizedMessage(result, language),
        language,
        sentiment: 'neutral',
        sentimentScore: 0,
        sources: [],
        escalate: false,
        conversationId: '',
        actions: result.actions,
        workflowState: result.workflowState
      };
    }

    case 'select-service': {
      if (command.payload) {
        const result = await handleSelectService(sessionId, command.payload, language);
        return {
          message: getLocalizedMessage(result, language),
          language,
          sentiment: 'neutral',
          sentimentScore: 0,
          sources: [],
          escalate: false,
          conversationId: '',
          actions: result.actions,
          workflowState: result.workflowState
        };
      }
      break;
    }

    case 'select-date': {
      if (command.payload) {
        const result = await handleSelectDate(sessionId, command.payload, language);
        return {
          message: getLocalizedMessage(result, language),
          language,
          sentiment: 'neutral',
          sentimentScore: 0,
          sources: [],
          escalate: false,
          conversationId: '',
          actions: result.actions,
          workflowState: result.workflowState
        };
      }
      break;
    }

    case 'select-time': {
      if (command.payload) {
        const result = await handleSelectTime(sessionId, command.payload, language);
        return {
          message: getLocalizedMessage(result, language),
          language,
          sentiment: 'neutral',
          sentimentScore: 0,
          sources: [],
          escalate: false,
          conversationId: '',
          actions: result.actions,
          workflowState: result.workflowState
        };
      }
      break;
    }

    case 'select-option': {
      if (command.payload) {
        const workflowType = getWorkflowType(sessionId);

        // Handle confirmation
        if (command.payload === 'confirm') {
          if (workflowType === 'appointment') {
            const result = await confirmAppointment(sessionId, language);
            return {
              message: getLocalizedMessage(result, language),
              language,
              sentiment: 'positive',
              sentimentScore: 0.8,
              sources: [],
              escalate: false,
              conversationId: '',
              actions: result.actions,
              workflowState: result.workflowState
            };
          }
          // Service request confirmation is handled in processServiceRequestStep
        }

        // Handle category selection for service requests
        if (workflowType === 'service-request' && command.payload.startsWith('route-')) {
          const result = await handleCategorySelection(sessionId, command.payload, language);
          return {
            message: getLocalizedMessage(result, language),
            language,
            sentiment: 'neutral',
            sentimentScore: 0,
            sources: [],
            escalate: false,
            conversationId: '',
            actions: result.actions,
            workflowState: result.workflowState
          };
        }

        // Handle skip location
        if (command.payload === 'skip-location') {
          const result = await processServiceRequestStep(sessionId, 'skip-location', language);
          return {
            message: getLocalizedMessage(result, language),
            language,
            sentiment: 'neutral',
            sentimentScore: 0,
            sources: [],
            escalate: false,
            conversationId: '',
            actions: result.actions,
            workflowState: result.workflowState
          };
        }
      }
      break;
    }

    case 'cancel-workflow': {
      const workflowType = getWorkflowType(sessionId);
      if (workflowType === 'appointment') {
        const result = cancelAppointmentFlow(sessionId, language);
        return {
          message: getLocalizedMessage(result, language),
          language,
          sentiment: 'neutral',
          sentimentScore: 0,
          sources: [],
          escalate: false,
          conversationId: '',
          actions: result.actions,
          workflowState: result.workflowState
        };
      } else if (workflowType === 'service-request') {
        const result = cancelServiceRequestFlow(sessionId, language);
        return {
          message: getLocalizedMessage(result, language),
          language,
          sentiment: 'neutral',
          sentimentScore: 0,
          sources: [],
          escalate: false,
          conversationId: '',
          actions: result.actions,
          workflowState: result.workflowState
        };
      }
      clearWorkflow(sessionId);
      break;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, language: requestedLanguage, domain, sessionId: providedSessionId, isIVR } = body;

    // Load admin settings for LLM and behavior configuration
    const settings = await getSettings();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get the last user message for context retrieval
    const lastUserMessage = messages
      .filter((m: ChatMessage) => m.role === 'user')
      .pop();

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400, headers: corsHeaders }
      );
    }

    const userQuery = lastUserMessage.content;

    // Detect language from user message (use enabled languages from config)
    const detectedLanguage = (requestedLanguage || detectLanguage(userQuery)) as Language;

    // Session management
    const sessionId = providedSessionId || `session_${Date.now()}`;
    setStateLanguage(sessionId, detectedLanguage);

    // Check for workflow command (button click)
    const command = isWorkflowCommand(userQuery);
    if (command) {
      const workflowResponse = await processWorkflowCommand(sessionId, command, detectedLanguage);
      if (workflowResponse) {
        workflowResponse.conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return NextResponse.json(workflowResponse, { headers: getCorsHeaders(request) });
      }
    }

    // Check if user is in an active workflow
    if (isInWorkflow(sessionId)) {
      const workflowType = getWorkflowType(sessionId);

      if (workflowType === 'appointment') {
        const result = await processAppointmentStep(sessionId, userQuery, detectedLanguage);
        return NextResponse.json({
          message: getLocalizedMessage(result, detectedLanguage),
          language: detectedLanguage,
          sentiment: 'neutral',
          sentimentScore: 0,
          sources: [],
          escalate: false,
          conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          actions: result.actions,
          workflowState: result.workflowState
        }, { headers: getCorsHeaders(request) });
      }

      if (workflowType === 'service-request') {
        const result = await processServiceRequestStep(sessionId, userQuery, detectedLanguage);
        return NextResponse.json({
          message: getLocalizedMessage(result, detectedLanguage),
          language: detectedLanguage,
          sentiment: 'neutral',
          sentimentScore: 0,
          sources: [],
          escalate: false,
          conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          actions: result.actions,
          workflowState: result.workflowState
        }, { headers: getCorsHeaders(request) });
      }
    }

    // Detect workflow intent from natural language
    const workflowIntent = await detectWorkflowIntent(userQuery);

    if (workflowIntent) {
      // Handle appointment intent
      if (workflowIntent.type === 'appointment' && workflowIntent.confidence > 0.5) {
        const result = await startAppointmentFlow(sessionId, detectedLanguage);
        return NextResponse.json({
          message: getLocalizedMessage(result, detectedLanguage),
          language: detectedLanguage,
          sentiment: 'neutral',
          sentimentScore: 0,
          sources: [],
          escalate: false,
          conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          actions: result.actions,
          workflowState: result.workflowState
        }, { headers: getCorsHeaders(request) });
      }

      // Handle service request intent (with routing rule match)
      if (workflowIntent.type === 'service-request' && workflowIntent.data?.routingRule) {
        const routingData = workflowIntent.data.routingRule as {
          id: string;
          name: string;
          department: string;
          priority: 'low' | 'medium' | 'high';
          slaHours: number;
        };
        const result = await startServiceRequestFlow(sessionId, detectedLanguage, {
          rule: {
            id: routingData.id,
            name: routingData.name,
            targetDepartment: routingData.department,
            priority: routingData.priority,
            slaHours: routingData.slaHours,
            category: '',
            keywords: [],
            autoAssign: false,
            isActive: true
          },
          initialMessage: userQuery
        });
        return NextResponse.json({
          message: getLocalizedMessage(result, detectedLanguage),
          language: detectedLanguage,
          sentiment: 'neutral',
          sentimentScore: 0,
          sources: [],
          escalate: false,
          conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          actions: result.actions,
          workflowState: result.workflowState
        }, { headers: getCorsHeaders(request) });
      }
    }

    // ========================================================================
    // TYLER TECHNOLOGIES INTEGRATION
    // Check if this is a property/land records query that should use Tyler
    // ========================================================================
    const tylerQueryType = detectTylerQuery(userQuery);
    if (tylerQueryType !== 'not-tyler-related') {
      try {
        const tylerResult: TylerQueryResult | null = await handleTylerQuery(userQuery);

        if (tylerResult) {
          // Format Tyler actions for the response
          const tylerActions: ActionButton[] = (tylerResult.relatedActions || [])
            .filter(action => action.type === 'link' && action.url)
            .map(action => ({
              type: 'link' as const,
              label: action.label,
              data: { url: action.url },
              variant: 'secondary' as const
            }));

          // Build sources from Tyler data
          const tylerSources = tylerResult.sources.map(source => ({
            title: source,
            url: 'https://www.tylertech.com',
            section: 'Tyler-Integration'
          }));

          const response: ChatResponse = {
            message: tylerResult.formattedResponse,
            language: detectedLanguage,
            sentiment: 'neutral',
            sentimentScore: 0,
            sources: tylerSources,
            escalate: false,
            conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            actions: tylerActions.length > 0 ? tylerActions : undefined,
            workflowState: { active: false, type: 'tyler-query', step: 0 }
          };

          // Log the Tyler query
          const timestamp = new Date().toISOString();
          const logEntry: ConversationLogEntry = {
            id: response.conversationId,
            sessionId,
            startTime: timestamp,
            endTime: timestamp,
            messages: [
              ...messages.map((m: ChatMessage) => ({
                role: m.role,
                content: m.content,
                timestamp,
              })),
              {
                role: 'assistant',
                content: tylerResult.formattedResponse,
                timestamp,
              },
            ],
            language: detectedLanguage,
            sentiment: 'neutral',
            escalated: false,
            feedbackGiven: false,
            userAgent: request.headers.get('user-agent') || 'unknown',
            referrer: request.headers.get('referer') || 'unknown',
          };
          logConversation(logEntry).catch(console.error);

          return NextResponse.json(response, { headers: getCorsHeaders(request) });
        }
      } catch (tylerError) {
        console.error('[Tyler] Query handling error:', tylerError);
        // Fall through to normal processing if Tyler fails
      }
    }

    // Analyze sentiment (if enabled in admin settings)
    const sentiment = settings.chatbot.enableSentimentAnalysis
      ? analyzeSentiment(userQuery)
      : { category: 'neutral' as const, score: 0, confidence: 1 };

    // Fetch relevant knowledge (with domain filtering for multi-URL support)
    const knowledgeResults = await getKnowledgeContext(userQuery, 5, domain);
    const contextString = buildContextString(knowledgeResults);

    // Check for FAQ with workflow action
    let faqActions: ActionButton[] = [];
    const faqMatch = await matchFAQWithAction(userQuery);
    if (faqMatch && faqMatch.workflowAction) {
      const actionResult = processFAQAction(faqMatch, detectedLanguage);
      if (actionResult) {
        faqActions = actionResult.actions;
      }
    }

    // Build system prompt with context
    let systemPrompt = getSystemPrompt(detectedLanguage, contextString, sentiment);

    // For IVR calls, add instructions for structured, concise responses
    if (isIVR) {
      const ivrInstructions = `
IMPORTANT: This is a phone IVR call. Follow this EXACT response format:

**FORMAT RULES:**
1. Start with 1-2 short sentences that directly answer or introduce the topic
2. Then use bullet points (•) for key details, each bullet being one brief phrase
3. Keep total response to 3-5 bullet points maximum
4. End with a brief closing sentence

**EXAMPLE FORMAT:**
"City Hall is open Monday through Friday. Here are the details:
• Hours: 8 AM to 5 PM
• Address: 8401 NW 53rd Terrace
• Phone: 305-593-6725
• Closed on federal holidays
I hope that helps!"

**ADDITIONAL RULES:**
- Be direct and conversational
- No lengthy paragraphs
- Each bullet should be scannable when spoken aloud
- For complex topics, give the most important 3-4 points
- Do NOT suggest pressing buttons or mention transfer codes - that is handled separately
`;
      systemPrompt = ivrInstructions + '\n\n' + systemPrompt;
    }

    // Prepare messages for OpenAI
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: ChatMessage) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    let assistantMessage: string;

    // Get LLM settings from admin panel
    const llmSettings = settings.llm;
    const temperature = llmSettings.temperature;
    const maxTokens = llmSettings.maxTokens;

    // Map model names to API model IDs
    const getClaudeModel = (model: string): string => {
      if (model === 'claude-3-opus') return 'claude-3-opus-20240229';
      if (model === 'claude-3-sonnet') return 'claude-3-sonnet-20240229';
      return 'claude-3-haiku-20240307'; // default
    };

    const getOpenAIModel = (model: string): string => {
      if (model === 'gpt-4o') return 'gpt-4o';
      return 'gpt-4o-mini'; // default
    };

    // Determine which LLM to use based on admin settings
    const useClaude = llmSettings.primaryLLM.startsWith('claude');
    const useOpenAIFallback = llmSettings.backupLLM.startsWith('gpt') || llmSettings.backupLLM === 'gpt-4o' || llmSettings.backupLLM === 'gpt-4o-mini';
    const useClaudeFallback = llmSettings.backupLLM.startsWith('claude');

    // Try primary LLM first, then fallback (ITN 3.2.3 LLM Support)
    if (useClaude) {
      const claudeClient = getAnthropic();
      if (claudeClient) {
        try {
          const claudeMessages = messages.map((m: ChatMessage) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));

          const claudeResponse = await claudeClient.messages.create({
            model: getClaudeModel(llmSettings.primaryLLM),
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: claudeMessages,
          });

          assistantMessage = claudeResponse.content[0].type === 'text'
            ? claudeResponse.content[0].text
            : '';
        } catch (claudeError) {
          console.error('Claude API error, attempting fallback:', claudeError);
          assistantMessage = '';
        }
      } else {
        assistantMessage = '';
      }
    } else {
      // OpenAI is primary
      try {
        const completion = await getOpenAI().chat.completions.create({
          model: getOpenAIModel(llmSettings.primaryLLM),
          messages: openaiMessages,
          temperature,
          max_tokens: maxTokens,
        });
        assistantMessage = completion.choices[0]?.message?.content || '';
      } catch (openaiError) {
        console.error('OpenAI API error, attempting fallback:', openaiError);
        assistantMessage = '';
      }
    }

    // Try fallback if primary failed
    if (!assistantMessage && llmSettings.backupLLM !== 'none') {
      if (useOpenAIFallback) {
        try {
          const completion = await getOpenAI().chat.completions.create({
            model: getOpenAIModel(llmSettings.backupLLM),
            messages: openaiMessages,
            temperature,
            max_tokens: maxTokens,
          });
          assistantMessage = completion.choices[0]?.message?.content || '';
        } catch (openaiError) {
          console.error('OpenAI fallback failed:', openaiError);
        }
      } else if (useClaudeFallback) {
        const claudeClient = getAnthropic();
        if (claudeClient) {
          try {
            const claudeMessages = messages.map((m: ChatMessage) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            }));

            const claudeResponse = await claudeClient.messages.create({
              model: getClaudeModel(llmSettings.backupLLM),
              max_tokens: maxTokens,
              system: systemPrompt,
              messages: claudeMessages,
            });

            assistantMessage = claudeResponse.content[0].type === 'text'
              ? claudeResponse.content[0].text
              : '';
          } catch (claudeError) {
            console.error('Claude fallback failed:', claudeError);
          }
        }
      }
    }

    // Default message if both LLMs failed
    if (!assistantMessage) {
      const fallbackMessages: Record<Language, string> = {
        en: 'I apologize, I could not process your request. Please try again.',
        es: 'Lo siento, no pude procesar su solicitud. Por favor intente de nuevo.',
        ht: 'Eskize mwen, mwen pa t kapab trete demann ou an. Tanpri eseye ankò.'
      };
      assistantMessage = fallbackMessages[detectedLanguage] || fallbackMessages.en;
    }

    // Prepare sources for response
    const sources = knowledgeResults.map(r => ({
      title: r.title,
      url: r.url,
      section: r.section,
    }));

    // Determine if should escalate based on admin settings
    const escalate = settings.chatbot.autoEscalateNegative &&
      (sentiment.category === 'negative' || sentiment.category === 'urgent');

    // Log conversation for audit trail (ITN 3.1.3)
    const timestamp = new Date().toISOString();
    const logEntry: ConversationLogEntry = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      startTime: timestamp,
      endTime: timestamp,
      messages: [
        ...messages.map((m: ChatMessage) => ({
          role: m.role,
          content: m.content,
          timestamp,
        })),
        {
          role: 'assistant',
          content: assistantMessage,
          timestamp,
        },
      ],
      language: detectedLanguage,
      sentiment: sentiment.category,
      escalated: escalate,
      feedbackGiven: false,
      userAgent: request.headers.get('user-agent') || 'unknown',
      referrer: request.headers.get('referer') || 'unknown',
    };

    // Log asynchronously (don't block response)
    logConversation(logEntry).catch(console.error);

    // Build response with optional actions
    const response: ChatResponse = {
      message: assistantMessage,
      language: detectedLanguage,
      sentiment: sentiment.category,
      sentimentScore: sentiment.score,
      sources,
      escalate,
      conversationId: logEntry.id,
    };

    // Include FAQ actions if available
    if (faqActions.length > 0) {
      response.actions = faqActions;
      response.workflowState = { active: false, type: 'none', step: 0 };
    }

    return NextResponse.json(response, { headers: getCorsHeaders(request) });
  } catch (error) {
    console.error('Chat API error:', error);

    // Check if it's an OpenAI API key issue
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        {
          error: 'OpenAI API configuration error',
          message: 'The AI service is not properly configured. Please contact support.'
        },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'I apologize, but I encountered an issue. Please try again.'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
