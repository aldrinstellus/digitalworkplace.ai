/**
 * LLM Provider Factory
 * Creates and manages LLM provider instances
 *
 * V2.0 Feature: Multi-LLM Support (EPIC 2 & 6)
 */

import { BaseLLMProvider, llmRegistry } from './provider';
import { AnthropicProvider } from './anthropic';
import { OpenAIProvider } from './openai';
import {
  LLMProvider,
  LLMModel,
  LLMRequestOptions,
  LLMResponse,
  LLMStreamEvent,
  getProviderFromModel,
} from './types';

/**
 * Initialize all available LLM providers
 * Call this once at application startup
 */
export function initializeLLMProviders(): void {
  // Register Anthropic provider
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    const anthropicProvider = new AnthropicProvider(anthropicKey);
    llmRegistry.register(anthropicProvider);
  }

  // Register OpenAI provider
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const openaiProvider = new OpenAIProvider(openaiKey);
    llmRegistry.register(openaiProvider);
  }

  // Set default provider (prefer Anthropic if available)
  if (anthropicKey) {
    llmRegistry.setDefault('anthropic');
  } else if (openaiKey) {
    llmRegistry.setDefault('openai');
  }
}

/**
 * Get an LLM provider instance
 */
export function getLLMProvider(provider?: LLMProvider): BaseLLMProvider {
  // Initialize providers if not done yet
  if (llmRegistry.getAvailable().length === 0) {
    initializeLLMProviders();
  }

  if (provider) {
    const instance = llmRegistry.get(provider);
    if (!instance) {
      throw new Error(`LLM provider ${provider} not available`);
    }
    return instance;
  }

  const defaultProvider = llmRegistry.getDefault();
  if (!defaultProvider) {
    throw new Error('No LLM providers configured');
  }
  return defaultProvider;
}

/**
 * Get the provider for a specific model
 */
export function getProviderForModel(model: LLMModel): BaseLLMProvider {
  // Initialize providers if not done yet
  if (llmRegistry.getAvailable().length === 0) {
    initializeLLMProviders();
  }

  const providerName = getProviderFromModel(model);
  const provider = llmRegistry.get(providerName);

  if (!provider || !provider.isAvailable()) {
    throw new Error(`Provider ${providerName} for model ${model} is not available`);
  }

  return provider;
}

/**
 * Generate a response using the appropriate provider
 */
export async function generateLLMResponse(
  options: LLMRequestOptions
): Promise<LLMResponse> {
  const provider = getProviderForModel(options.model);
  return provider.generate(options);
}

/**
 * Generate a streaming response using the appropriate provider
 */
export async function* generateLLMStream(
  options: LLMRequestOptions
): AsyncGenerator<LLMStreamEvent, void, unknown> {
  const provider = getProviderForModel(options.model);
  yield* provider.generateStream(options);
}

/**
 * Check which providers are available
 */
export function getAvailableProviders(): LLMProvider[] {
  if (llmRegistry.getAvailable().length === 0) {
    initializeLLMProviders();
  }
  return llmRegistry.getAvailable();
}

/**
 * Check if a specific provider is available
 */
export function isProviderAvailable(provider: LLMProvider): boolean {
  if (llmRegistry.getAvailable().length === 0) {
    initializeLLMProviders();
  }
  return llmRegistry.isAvailable(provider);
}

/**
 * Create a new provider instance (for testing or custom configurations)
 */
export function createProvider(
  provider: LLMProvider,
  apiKey: string,
  defaultModel?: LLMModel
): BaseLLMProvider {
  if (provider === 'anthropic') {
    return new AnthropicProvider(apiKey, defaultModel || 'claude-sonnet-4-20250514');
  }
  if (provider === 'openai') {
    return new OpenAIProvider(apiKey, defaultModel || 'gpt-4o');
  }
  throw new Error(`Unknown provider: ${provider}`);
}
