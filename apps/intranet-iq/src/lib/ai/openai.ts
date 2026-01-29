/**
 * OpenAI Provider Implementation
 * Implements BaseLLMProvider for GPT models
 *
 * V2.0 Feature: Multi-LLM Support (EPIC 2 & 6)
 */

import { BaseLLMProvider } from './provider';
import {
  LLMMessage,
  LLMTool,
  LLMToolCall,
  LLMResponse,
  LLMRequestOptions,
  LLMStreamEvent,
  LLMModel,
  LLMProvider,
} from './types';

// OpenAI-specific types
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

interface OpenAIChoice {
  index: number;
  message: OpenAIMessage;
  finish_reason: 'stop' | 'tool_calls' | 'length' | 'content_filter';
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIStreamChoice {
  index: number;
  delta: {
    role?: string;
    content?: string | null;
    tool_calls?: Array<{
      index: number;
      id?: string;
      type?: 'function';
      function?: {
        name?: string;
        arguments?: string;
      };
    }>;
  };
  finish_reason: 'stop' | 'tool_calls' | 'length' | 'content_filter' | null;
}

interface OpenAIStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIStreamChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIProvider extends BaseLLMProvider {
  readonly providerName: LLMProvider = 'openai';
  private client: unknown;

  constructor(apiKey?: string, defaultModel: LLMModel = 'gpt-4o') {
    super(apiKey || process.env.OPENAI_API_KEY || '', defaultModel);
  }

  private async getClient() {
    if (!this.client) {
      const OpenAI = (await import('openai')).default;
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
    return this.client as import('openai').default;
  }

  /**
   * Convert generic tools to OpenAI format
   */
  convertTools(tools: LLMTool[]): OpenAITool[] {
    return tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema,
      },
    }));
  }

  /**
   * Convert generic messages to OpenAI format
   */
  convertMessages(messages: LLMMessage[], systemPrompt?: string): OpenAIMessage[] {
    const result: OpenAIMessage[] = [];

    // Add system prompt if provided
    if (systemPrompt) {
      result.push({ role: 'system', content: systemPrompt });
    }

    // Add conversation messages
    for (const msg of messages) {
      if (msg.role === 'system' && !systemPrompt) {
        // Only add system messages if no separate system prompt
        result.push({ role: 'system', content: msg.content || '' });
      } else if (msg.role !== 'system') {
        result.push({ role: msg.role, content: msg.content || '' });
      }
    }

    return result;
  }

  /**
   * Generate a response (non-streaming)
   */
  async generate(options: LLMRequestOptions): Promise<LLMResponse> {
    const client = await this.getClient();

    const openaiMessages = this.convertMessages(options.messages, options.systemPrompt);
    const openaiTools = options.tools ? this.convertTools(options.tools) : undefined;

    const response = await client.chat.completions.create({
      model: options.model || this.defaultModel,
      messages: openaiMessages as Parameters<typeof client.chat.completions.create>[0]['messages'],
      max_tokens: options.maxTokens || 2048,
      ...(openaiTools && openaiTools.length > 0 ? { tools: openaiTools as Parameters<typeof client.chat.completions.create>[0]['tools'] } : {}),
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
    }) as OpenAIResponse;

    const choice = response.choices[0];
    const toolCalls: LLMToolCall[] = [];

    // Extract tool calls if any
    if (choice.message.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        toolCalls.push({
          id: toolCall.id,
          name: toolCall.function.name,
          input: JSON.parse(toolCall.function.arguments),
        });
      }
    }

    // Map OpenAI finish reasons to our format
    const stopReasonMap: Record<string, LLMResponse['stopReason']> = {
      stop: 'end_turn',
      tool_calls: 'tool_use',
      length: 'max_tokens',
      content_filter: 'stop_sequence',
    };

    return {
      content: choice.message.content || '',
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
      model: options.model || this.defaultModel,
      stopReason: stopReasonMap[choice.finish_reason] || 'end_turn',
    };
  }

  /**
   * Generate a streaming response
   */
  async *generateStream(
    options: LLMRequestOptions
  ): AsyncGenerator<LLMStreamEvent, void, unknown> {
    const client = await this.getClient();

    const openaiMessages = this.convertMessages(options.messages, options.systemPrompt);
    const openaiTools = options.tools ? this.convertTools(options.tools) : undefined;

    yield { type: 'start', data: {} };

    const stream = await client.chat.completions.create({
      model: options.model || this.defaultModel,
      messages: openaiMessages as Parameters<typeof client.chat.completions.create>[0]['messages'],
      max_tokens: options.maxTokens || 2048,
      stream: true,
      stream_options: { include_usage: true },
      ...(openaiTools && openaiTools.length > 0 ? { tools: openaiTools as Parameters<typeof client.chat.completions.create>[0]['tools'] } : {}),
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
    });

    let inputTokens = 0;
    let outputTokens = 0;
    const toolCallsAccumulator: Map<number, { id: string; name: string; arguments: string }> = new Map();

    for await (const chunk of stream as AsyncIterable<OpenAIStreamChunk>) {
      // Handle usage info
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens;
        outputTokens = chunk.usage.completion_tokens;
      }

      const choice = chunk.choices?.[0];
      if (!choice) continue;

      // Handle text content
      if (choice.delta.content) {
        yield { type: 'text', data: { text: choice.delta.content } };
      }

      // Handle tool calls
      if (choice.delta.tool_calls) {
        for (const toolCall of choice.delta.tool_calls) {
          const existing = toolCallsAccumulator.get(toolCall.index);
          if (!existing) {
            toolCallsAccumulator.set(toolCall.index, {
              id: toolCall.id || '',
              name: toolCall.function?.name || '',
              arguments: toolCall.function?.arguments || '',
            });
          } else {
            if (toolCall.id) existing.id = toolCall.id;
            if (toolCall.function?.name) existing.name = toolCall.function.name;
            if (toolCall.function?.arguments) existing.arguments += toolCall.function.arguments;
          }
        }
      }

      // Emit accumulated tool calls when done
      if (choice.finish_reason === 'tool_calls') {
        for (const [, toolCall] of toolCallsAccumulator) {
          yield {
            type: 'tool_use',
            data: {
              toolCall: {
                id: toolCall.id,
                name: toolCall.name,
                input: JSON.parse(toolCall.arguments || '{}'),
              },
            },
          };
        }
      }
    }

    yield {
      type: 'done',
      data: {
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
      },
    };
  }

  /**
   * Handle tool use - continue conversation with tool results
   */
  async handleToolUse(
    toolCalls: LLMToolCall[],
    executor: (name: string, input: Record<string, unknown>) => Promise<string>,
    options?: Omit<LLMRequestOptions, 'tools'>
  ): Promise<LLMResponse> {
    const client = await this.getClient();

    // Execute all tool calls
    const toolResults = await Promise.all(
      toolCalls.map(async (call) => {
        const result = await executor(call.name, call.input);
        return {
          role: 'tool' as const,
          tool_call_id: call.id,
          content: result,
        };
      })
    );

    // Build messages with tool results
    const messages = [
      ...(options?.messages ? this.convertMessages(options.messages, options.systemPrompt) : []),
      {
        role: 'assistant' as const,
        content: '',
        tool_calls: toolCalls.map(call => ({
          id: call.id,
          type: 'function' as const,
          function: {
            name: call.name,
            arguments: JSON.stringify(call.input),
          },
        })),
      },
      ...toolResults,
    ];

    const response = await client.chat.completions.create({
      model: options?.model || this.defaultModel,
      messages: messages as Parameters<typeof client.chat.completions.create>[0]['messages'],
      max_tokens: options?.maxTokens || 2048,
    }) as OpenAIResponse;

    const choice = response.choices[0];

    return {
      content: choice.message.content || '',
      usage: {
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
      model: options?.model || this.defaultModel,
      stopReason: choice.finish_reason === 'stop' ? 'end_turn' : 'max_tokens',
    };
  }
}
