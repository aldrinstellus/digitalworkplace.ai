/**
 * LLM Provider Module Index
 * Exports all LLM-related functionality
 *
 * V2.0 Feature: Multi-LLM Support (EPIC 2 & 6)
 */

// Types
export type {
  LLMProvider,
  LLMModel,
  LLMMessage,
  LLMTool,
  LLMToolCall,
  LLMToolResult,
  LLMStreamEvent,
  LLMUsage,
  LLMResponse,
  LLMRequestOptions,
  ConfidenceScore,
  LLMProviderConfig,
} from './types';

export {
  getProviderFromModel,
  getModelsForProvider,
  getDefaultModel,
  MODEL_DISPLAY_NAMES,
  PROVIDER_DISPLAY_NAMES,
} from './types';

// Provider base class
export { BaseLLMProvider, LLMProviderRegistry, llmRegistry } from './provider';

// Provider implementations
export { AnthropicProvider } from './anthropic';
export { OpenAIProvider } from './openai';

// Factory functions
export {
  initializeLLMProviders,
  getLLMProvider,
  getProviderForModel,
  generateLLMResponse,
  generateLLMStream,
  getAvailableProviders,
  isProviderAvailable,
  createProvider,
} from './factory';

// Confidence scoring
export {
  calculateConfidence,
  detectUncertaintyPhrases,
  detectCitations,
  estimateQueryComplexity,
  getConfidenceColor,
  getConfidenceIcon,
  getConfidenceLabel,
  getConfidenceTooltip,
} from './confidence';
