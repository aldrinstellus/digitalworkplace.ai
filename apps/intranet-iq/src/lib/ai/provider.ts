/**
 * LLM Provider Interface
 * Abstract base class for LLM providers
 *
 * V2.0 Feature: Multi-LLM Support (EPIC 2 & 6)
 */

import {
  LLMMessage,
  LLMTool,
  LLMToolCall,
  LLMResponse,
  LLMRequestOptions,
  LLMStreamEvent,
  LLMModel,
  LLMProvider,
  ConfidenceScore,
} from './types';

/**
 * Abstract LLM Provider Interface
 * All LLM implementations must extend this class
 */
export abstract class BaseLLMProvider {
  protected apiKey: string;
  protected defaultModel: LLMModel;
  abstract readonly providerName: LLMProvider;

  constructor(apiKey: string, defaultModel: LLMModel) {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  /**
   * Generate a response (non-streaming)
   */
  abstract generate(options: LLMRequestOptions): Promise<LLMResponse>;

  /**
   * Generate a streaming response
   */
  abstract generateStream(
    options: LLMRequestOptions
  ): AsyncGenerator<LLMStreamEvent, void, unknown>;

  /**
   * Convert tool definitions to provider-specific format
   */
  abstract convertTools(tools: LLMTool[]): unknown;

  /**
   * Convert messages to provider-specific format
   */
  abstract convertMessages(messages: LLMMessage[], systemPrompt?: string): unknown;

  /**
   * Execute a tool call and return result
   */
  abstract handleToolUse(
    toolCalls: LLMToolCall[],
    executor: (name: string, input: Record<string, unknown>) => Promise<string>
  ): Promise<LLMResponse>;

  /**
   * Check if the provider is available (API key configured)
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get the default model for this provider
   */
  getDefaultModel(): LLMModel {
    return this.defaultModel;
  }

  /**
   * Calculate confidence score based on response and sources
   */
  calculateConfidence(
    sourceCount: number,
    avgRelevance: number,
    hasToolResults: boolean
  ): ConfidenceScore {
    // Base score calculation
    const sourceQuality = Math.min(100, avgRelevance * 100);
    const sourceCountScore = Math.min(100, sourceCount * 20); // 5 sources = 100
    const toolBonus = hasToolResults ? 10 : 0;

    // Weighted average
    const score = Math.round(
      sourceQuality * 0.4 +
      sourceCountScore * 0.3 +
      50 * 0.2 + // Base model confidence
      toolBonus * 0.1
    );

    // Determine level
    let level: 'high' | 'medium' | 'low';
    if (score >= 75) {
      level = 'high';
    } else if (score >= 50) {
      level = 'medium';
    } else {
      level = 'low';
    }

    return {
      level,
      score,
      factors: {
        sourceQuality,
        sourceCount: sourceCountScore,
        relevanceScore: avgRelevance * 100,
        modelConfidence: 50 + toolBonus,
      },
    };
  }
}

/**
 * LLM Provider Registry
 * Manages multiple provider instances
 */
export class LLMProviderRegistry {
  private providers: Map<LLMProvider, BaseLLMProvider> = new Map();
  private defaultProvider: LLMProvider = 'anthropic';

  /**
   * Register a provider
   */
  register(provider: BaseLLMProvider): void {
    this.providers.set(provider.providerName, provider);
  }

  /**
   * Get a provider by name
   */
  get(name: LLMProvider): BaseLLMProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get the default provider
   */
  getDefault(): BaseLLMProvider | undefined {
    return this.providers.get(this.defaultProvider);
  }

  /**
   * Set the default provider
   */
  setDefault(name: LLMProvider): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider ${name} not registered`);
    }
    this.defaultProvider = name;
  }

  /**
   * Get all available providers
   */
  getAvailable(): LLMProvider[] {
    return Array.from(this.providers.entries())
      .filter(([, provider]) => provider.isAvailable())
      .map(([name]) => name);
  }

  /**
   * Check if a provider is available
   */
  isAvailable(name: LLMProvider): boolean {
    const provider = this.providers.get(name);
    return provider?.isAvailable() ?? false;
  }

  /**
   * Get provider for a specific model
   */
  getProviderForModel(model: LLMModel): BaseLLMProvider | undefined {
    if (model.startsWith('claude')) {
      return this.providers.get('anthropic');
    }
    if (model.startsWith('gpt')) {
      return this.providers.get('openai');
    }
    return undefined;
  }
}

// Singleton registry instance
export const llmRegistry = new LLMProviderRegistry();
