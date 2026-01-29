/**
 * AI Confidence Scoring Module
 * Calculates confidence levels for AI responses based on sources and context
 *
 * V2.0 Feature: Confidence Scoring (EPIC 2)
 */

import { ConfidenceScore } from './types';

interface Source {
  id: string;
  type: string;
  title: string;
  url?: string;
  relevance: number;
  content?: string;
}

interface ConfidenceFactors {
  sources: Source[];
  hasToolResults: boolean;
  queryComplexity: 'simple' | 'moderate' | 'complex';
  modelResponse?: {
    length: number;
    hasCitations: boolean;
    hasUncertaintyPhrases: boolean;
  };
}

/**
 * Phrases that indicate uncertainty in AI responses
 */
const UNCERTAINTY_PHRASES = [
  'i\'m not sure',
  'i don\'t know',
  'i cannot find',
  'there is no information',
  'i couldn\'t find',
  'unclear',
  'uncertain',
  'may not be',
  'might not',
  'possibly',
  'perhaps',
  'it seems',
  'it appears',
  'based on limited',
];

/**
 * Calculate comprehensive confidence score
 */
export function calculateConfidence(factors: ConfidenceFactors): ConfidenceScore {
  const { sources, hasToolResults, queryComplexity, modelResponse } = factors;

  // 1. Source quality score (0-100)
  const sourceQualityScore = calculateSourceQuality(sources);

  // 2. Source count score (0-100)
  const sourceCountScore = calculateSourceCountScore(sources.length);

  // 3. Average relevance score (0-100)
  const avgRelevance = sources.length > 0
    ? sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length
    : 0;
  const relevanceScore = avgRelevance * 100;

  // 4. Model confidence score (0-100)
  const modelConfidenceScore = calculateModelConfidence(
    hasToolResults,
    queryComplexity,
    modelResponse
  );

  // 5. Weighted combination
  const weights = {
    sourceQuality: 0.30,
    sourceCount: 0.20,
    relevance: 0.25,
    modelConfidence: 0.25,
  };

  const totalScore = Math.round(
    sourceQualityScore * weights.sourceQuality +
    sourceCountScore * weights.sourceCount +
    relevanceScore * weights.relevance +
    modelConfidenceScore * weights.modelConfidence
  );

  // Determine confidence level
  let level: 'high' | 'medium' | 'low';
  if (totalScore >= 75) {
    level = 'high';
  } else if (totalScore >= 50) {
    level = 'medium';
  } else {
    level = 'low';
  }

  return {
    level,
    score: Math.min(100, Math.max(0, totalScore)),
    factors: {
      sourceQuality: sourceQualityScore,
      sourceCount: sourceCountScore,
      relevanceScore,
      modelConfidence: modelConfidenceScore,
    },
  };
}

/**
 * Calculate source quality based on type and attributes
 */
function calculateSourceQuality(sources: Source[]): number {
  if (sources.length === 0) return 30; // Base score for no sources

  const typeWeights: Record<string, number> = {
    article: 1.0,      // Knowledge base articles are highest quality
    policy: 1.0,       // Company policies
    document: 0.9,     // Official documents
    faq: 0.85,         // FAQ entries
    wiki: 0.8,         // Wiki pages
    confluence: 0.85,  // Confluence docs
    sharepoint: 0.85,  // SharePoint docs
    notion: 0.8,       // Notion pages
    google_drive: 0.75, // Google Drive files
    external: 0.6,     // External sources
    default: 0.7,
  };

  let totalWeight = 0;
  let weightedRelevance = 0;

  for (const source of sources) {
    const typeWeight = typeWeights[source.type] || typeWeights.default;
    const effectiveWeight = typeWeight * source.relevance;
    totalWeight += effectiveWeight;
    weightedRelevance += effectiveWeight * 100;
  }

  return totalWeight > 0 ? Math.round(weightedRelevance / totalWeight) : 30;
}

/**
 * Calculate score based on number of sources
 */
function calculateSourceCountScore(count: number): number {
  // Optimal is 3-5 sources, diminishing returns after
  if (count === 0) return 20;
  if (count === 1) return 50;
  if (count === 2) return 70;
  if (count >= 3 && count <= 5) return 100;
  if (count > 5) return 90; // Slightly lower for too many sources (may indicate ambiguity)
  return 50;
}

/**
 * Calculate model confidence based on response characteristics
 */
function calculateModelConfidence(
  hasToolResults: boolean,
  queryComplexity: 'simple' | 'moderate' | 'complex',
  modelResponse?: { length: number; hasCitations: boolean; hasUncertaintyPhrases: boolean }
): number {
  let score = 60; // Base score

  // Tool results add confidence
  if (hasToolResults) {
    score += 15;
  }

  // Query complexity affects base confidence
  const complexityAdjustment = {
    simple: 10,
    moderate: 0,
    complex: -10,
  };
  score += complexityAdjustment[queryComplexity];

  // Response characteristics
  if (modelResponse) {
    // Citations increase confidence
    if (modelResponse.hasCitations) {
      score += 10;
    }

    // Uncertainty phrases decrease confidence
    if (modelResponse.hasUncertaintyPhrases) {
      score -= 15;
    }

    // Very short responses may indicate limited knowledge
    if (modelResponse.length < 100) {
      score -= 5;
    }
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Detect uncertainty phrases in response text
 */
export function detectUncertaintyPhrases(text: string): boolean {
  const lowerText = text.toLowerCase();
  return UNCERTAINTY_PHRASES.some(phrase => lowerText.includes(phrase));
}

/**
 * Detect if response contains citations
 */
export function detectCitations(text: string): boolean {
  // Look for common citation patterns
  const citationPatterns = [
    /\[\d+\]/,           // [1], [2], etc.
    /\(source:/i,        // (source: ...)
    /according to/i,     // According to...
    /as mentioned in/i,  // As mentioned in...
    /from the/i,         // From the...
    /per the/i,          // Per the...
    /based on/i,         // Based on...
  ];

  return citationPatterns.some(pattern => pattern.test(text));
}

/**
 * Estimate query complexity
 */
export function estimateQueryComplexity(query: string): 'simple' | 'moderate' | 'complex' {
  const wordCount = query.split(/\s+/).length;
  const hasMultipleQuestions = (query.match(/\?/g) || []).length > 1;
  const hasComparison = /compare|versus|vs\.|difference|between/i.test(query);
  const hasAnalysis = /why|how|explain|analyze|evaluate/i.test(query);

  // Complex queries
  if (hasMultipleQuestions || hasComparison || (hasAnalysis && wordCount > 15)) {
    return 'complex';
  }

  // Moderate queries
  if (hasAnalysis || wordCount > 10) {
    return 'moderate';
  }

  // Simple queries
  return 'simple';
}

/**
 * Get confidence level color for UI
 */
export function getConfidenceColor(level: 'high' | 'medium' | 'low'): string {
  const colors = {
    high: '#22c55e',   // Green
    medium: '#f59e0b', // Amber
    low: '#ef4444',    // Red
  };
  return colors[level];
}

/**
 * Get confidence level icon name for UI
 */
export function getConfidenceIcon(level: 'high' | 'medium' | 'low'): string {
  const icons = {
    high: 'check-circle',
    medium: 'alert-circle',
    low: 'x-circle',
  };
  return icons[level];
}

/**
 * Get confidence level label for UI
 */
export function getConfidenceLabel(level: 'high' | 'medium' | 'low'): string {
  const labels = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
  };
  return labels[level];
}

/**
 * Get confidence tooltip text
 */
export function getConfidenceTooltip(confidence: ConfidenceScore): string {
  const { level, score, factors } = confidence;

  return `${getConfidenceLabel(level)} (${score}%)

Breakdown:
• Source Quality: ${Math.round(factors.sourceQuality)}%
• Source Count: ${Math.round(factors.sourceCount)}%
• Relevance: ${Math.round(factors.relevanceScore)}%
• Model Confidence: ${Math.round(factors.modelConfidence)}%`;
}
