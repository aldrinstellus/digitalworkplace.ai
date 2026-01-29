/**
 * Anthropic Claude Provider Implementation
 * Implements BaseLLMProvider for Claude models
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

// Anthropic-specific types
interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: 'text'; text: string } | { type: 'tool_use'; id: string; name: string; input: unknown } | { type: 'tool_result'; tool_use_id: string; content: string }>;
}

interface AnthropicTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface AnthropicContentBlock {
  type: 'text' | 'tool_use';
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: AnthropicContentBlock[];
  model: string;
  stop_reason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence';
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicProvider extends BaseLLMProvider {
  readonly providerName: LLMProvider = 'anthropic';
  private client: unknown;

  constructor(apiKey?: string, defaultModel: LLMModel = 'claude-sonnet-4-20250514') {
    super(apiKey || process.env.ANTHROPIC_API_KEY || '', defaultModel);
  }

  private async getClient() {
    if (!this.client) {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      this.client = new Anthropic({ apiKey: this.apiKey });
    }
    return this.client as import('@anthropic-ai/sdk').default;
  }

  /**
   * Convert generic tools to Anthropic format
   */
  convertTools(tools: LLMTool[]): AnthropicTool[] {
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema,
    }));
  }

  /**
   * Convert generic messages to Anthropic format
   */
  convertMessages(messages: LLMMessage[], _systemPrompt?: string): AnthropicMessage[] {
    // Filter out system messages (handled separately in Anthropic)
    return messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
  }

  /**
   * Generate a response (non-streaming)
   */
  async generate(options: LLMRequestOptions): Promise<LLMResponse> {
    const client = await this.getClient();

    const anthropicMessages = this.convertMessages(options.messages, options.systemPrompt);
    const anthropicTools = options.tools ? this.convertTools(options.tools) : undefined;

    const response = await client.messages.create({
      model: options.model || this.defaultModel,
      max_tokens: options.maxTokens || 2048,
      system: options.systemPrompt,
      messages: anthropicMessages,
      ...(anthropicTools && anthropicTools.length > 0 ? { tools: anthropicTools } : {}),
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
    }) as AnthropicResponse;

    // Extract text content and tool calls
    let content = '';
    const toolCalls: LLMToolCall[] = [];

    for (const block of response.content) {
      if (block.type === 'text' && block.text) {
        content += block.text;
      } else if (block.type === 'tool_use' && block.id && block.name) {
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: block.input || {},
        });
      }
    }

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      model: options.model || this.defaultModel,
      stopReason: response.stop_reason,
    };
  }

  /**
   * Generate a streaming response
   */
  async *generateStream(
    options: LLMRequestOptions
  ): AsyncGenerator<LLMStreamEvent, void, unknown> {
    const client = await this.getClient();

    const anthropicMessages = this.convertMessages(options.messages, options.systemPrompt);
    const anthropicTools = options.tools ? this.convertTools(options.tools) : undefined;

    yield { type: 'start', data: {} };

    const stream = await client.messages.stream({
      model: options.model || this.defaultModel,
      max_tokens: options.maxTokens || 2048,
      system: options.systemPrompt,
      messages: anthropicMessages,
      ...(anthropicTools && anthropicTools.length > 0 ? { tools: anthropicTools } : {}),
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
    });

    let inputTokens = 0;
    let outputTokens = 0;

    for await (const event of stream) {
      if (event.type === 'message_start') {
        if (event.message?.usage) {
          inputTokens = event.message.usage.input_tokens || 0;
        }
      } else if (event.type === 'content_block_delta') {
        const delta = event.delta as { type?: string; text?: string };
        if (delta.type === 'text_delta' && delta.text) {
          yield { type: 'text', data: { text: delta.text } };
        }
      } else if (event.type === 'content_block_start') {
        const block = event.content_block as { type?: string; id?: string; name?: string; input?: Record<string, unknown> };
        if (block.type === 'tool_use' && block.id && block.name) {
          yield {
            type: 'tool_use',
            data: {
              toolCall: {
                id: block.id,
                name: block.name,
                input: block.input || {},
              },
            },
          };
        }
      } else if (event.type === 'message_delta') {
        if (event.usage) {
          outputTokens = event.usage.output_tokens || 0;
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
          type: 'tool_result' as const,
          tool_use_id: call.id,
          content: result,
        };
      })
    );

    // Build messages with tool results
    const messages: AnthropicMessage[] = [
      ...(options?.messages ? this.convertMessages(options.messages) : []),
      {
        role: 'assistant',
        content: toolCalls.map(call => ({
          type: 'tool_use' as const,
          id: call.id,
          name: call.name,
          input: call.input,
        })),
      },
      {
        role: 'user',
        content: toolResults,
      },
    ];

    const response = await client.messages.create({
      model: options?.model || this.defaultModel,
      max_tokens: options?.maxTokens || 2048,
      system: options?.systemPrompt,
      messages,
    }) as AnthropicResponse;

    // Extract text content
    let content = '';
    for (const block of response.content) {
      if (block.type === 'text' && block.text) {
        content += block.text;
      }
    }

    return {
      content,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      model: options?.model || this.defaultModel,
      stopReason: response.stop_reason,
    };
  }
}
