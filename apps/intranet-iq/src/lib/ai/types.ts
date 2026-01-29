/**
 * LLM Provider Types
 * Defines the interface for multi-model LLM support
 *
 * V2.0 Feature: Multi-LLM Support (EPIC 2 & 6)
 */

export type LLMProvider = 'anthropic' | 'openai';

export type LLMModel =
  // Anthropic models
  | 'claude-sonnet-4-20250514'
  | 'claude-opus-4-20250514'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  // OpenAI models
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

export interface LLMToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface LLMToolResult {
  tool_use_id: string;
  content: string;
}

export interface LLMStreamEvent {
  type: 'start' | 'text' | 'tool_use' | 'tool_result' | 'done' | 'error';
  data: {
    text?: string;
    toolCall?: LLMToolCall;
    toolResult?: LLMToolResult;
    error?: string;
    usage?: LLMUsage;
  };
}

export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface LLMResponse {
  content: string;
  toolCalls?: LLMToolCall[];
  usage: LLMUsage;
  model: LLMModel;
  stopReason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence';
}

export interface LLMRequestOptions {
  model: LLMModel;
  messages: LLMMessage[];
  systemPrompt?: string;
  tools?: LLMTool[];
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface ConfidenceScore {
  level: 'high' | 'medium' | 'low';
  score: number; // 0-100
  factors: {
    sourceQuality: number;
    sourceCount: number;
    relevanceScore: number;
    modelConfidence: number;
  };
}

export interface LLMProviderConfig {
  provider: LLMProvider;
  apiKey: string;
  defaultModel: LLMModel;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Get provider from model name
 */
export function getProviderFromModel(model: LLMModel): LLMProvider {
  if (model.startsWith('claude') || model.startsWith('claude-')) {
    return 'anthropic';
  }
  if (model.startsWith('gpt')) {
    return 'openai';
  }
  throw new Error(`Unknown model: ${model}`);
}

/**
 * Get available models for a provider
 */
export function getModelsForProvider(provider: LLMProvider): LLMModel[] {
  if (provider === 'anthropic') {
    return [
      'claude-sonnet-4-20250514',
      'claude-opus-4-20250514',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
    ];
  }
  if (provider === 'openai') {
    return [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
    ];
  }
  return [];
}

/**
 * Get default model for a provider
 */
export function getDefaultModel(provider: LLMProvider): LLMModel {
  if (provider === 'anthropic') {
    return 'claude-sonnet-4-20250514';
  }
  if (provider === 'openai') {
    return 'gpt-4o';
  }
  throw new Error(`Unknown provider: ${provider}`);
}

/**
 * Model display names for UI
 */
export const MODEL_DISPLAY_NAMES: Record<LLMModel, string> = {
  'claude-sonnet-4-20250514': 'Claude Sonnet 4',
  'claude-opus-4-20250514': 'Claude Opus 4',
  'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
  'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo',
};

/**
 * Provider display names for UI
 */
export const PROVIDER_DISPLAY_NAMES: Record<LLMProvider, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
};
