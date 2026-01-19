// Sentiment Analysis for Chat Core IQ Chatbot
// Detects user frustration for escalation to human support

export type SentimentCategory = 'positive' | 'neutral' | 'negative' | 'urgent';

export interface SentimentResult {
  category: SentimentCategory;
  score: number; // -1 to 1 (negative to positive)
  keywords: string[];
  shouldEscalate: boolean;
}

// Positive indicators (English, Spanish, and Haitian Creole)
const POSITIVE_WORDS = [
  // English
  'thank', 'thanks', 'great', 'excellent', 'wonderful', 'perfect', 'helpful',
  'appreciate', 'awesome', 'amazing', 'good', 'love', 'happy', 'pleased',
  // Spanish
  'gracias', 'excelente', 'maravilloso', 'perfecto', 'genial', 'increíble',
  'bueno', 'feliz', 'contento', 'agradecido', 'encanta',
  // Haitian Creole
  'mesi', 'ekselan', 'bon', 'pafè', 'kontan', 'renmen', 'apresye',
  'bèl', 'anfòm', 'estrawòdinè',
];

// Negative indicators
const NEGATIVE_WORDS = [
  // English
  'frustrated', 'angry', 'upset', 'annoyed', 'disappointed', 'terrible',
  'awful', 'horrible', 'useless', 'waste', 'ridiculous', 'unacceptable',
  'complaint', 'complain', 'problem', 'issue', 'wrong', 'bad', 'hate',
  'never', 'worst', 'stupid', 'incompetent',
  // Spanish
  'frustrado', 'enojado', 'molesto', 'decepcionado', 'terrible', 'horrible',
  'inútil', 'ridículo', 'inaceptable', 'queja', 'problema', 'malo', 'odio',
  'peor', 'estúpido', 'incompetente',
  // Haitian Creole
  'fristre', 'fache', 'dezapwente', 'terib', 'pwoblèm', 'move', 'rayi',
  'mal', 'pi mal', 'inyoran', 'enkonpetan',
];

// Urgent indicators - require immediate attention
const URGENT_WORDS = [
  // English
  'emergency', 'urgent', 'immediately', 'asap', 'help me', 'dangerous',
  'safety', 'threat', 'crime', 'accident', 'injured', 'hurt', 'fire',
  'flood', 'lawyer', 'sue', 'legal', 'manager', 'supervisor', 'escalate',
  'speak to someone', 'talk to human', 'real person',
  // Spanish
  'emergencia', 'urgente', 'inmediatamente', 'ayúdame', 'peligroso',
  'seguridad', 'amenaza', 'crimen', 'accidente', 'herido', 'fuego',
  'inundación', 'abogado', 'demandar', 'legal', 'gerente', 'supervisor',
  'hablar con alguien', 'persona real',
  // Haitian Creole
  'ijans', 'ijan', 'ede mwen', 'danje', 'sekirite', 'menas', 'krim',
  'aksidan', 'blese', 'dife', 'inondasyon', 'avoka', 'pouswiv', 'legal',
  'manadjè', 'sipèvizè', 'pale ak yon moun', 'moun reyèl',
];

// Intensifiers that amplify sentiment
const INTENSIFIERS = [
  // English
  'very', 'really', 'extremely', 'absolutely', 'completely', 'totally',
  'so', 'too', 'always', 'never',
  // Spanish
  'muy', 'realmente', 'extremadamente', 'absolutamente', 'completamente',
  'siempre', 'nunca',
  // Haitian Creole
  'trè', 'vrèman', 'totalman', 'toujou', 'janm', 'konplètman',
];

// Question patterns (neutral)
const QUESTION_PATTERNS = [
  /\?$/,
  /^(what|where|when|how|who|which|can|could|would|is|are|do|does)\b/i,
  /^(qué|dónde|cuándo|cómo|quién|cuál|puede|podría|es|son|hace)\b/i,
];

/**
 * Analyze sentiment of user message
 * Returns category, score, and escalation recommendation
 */
export function analyzeSentiment(text: string): SentimentResult {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  let positiveScore = 0;
  let negativeScore = 0;
  let urgentScore = 0;
  const foundKeywords: string[] = [];

  // Check for urgent words first (highest priority)
  for (const word of URGENT_WORDS) {
    if (lowerText.includes(word)) {
      urgentScore += 2;
      foundKeywords.push(word);
    }
  }

  // Check for positive words
  for (const word of POSITIVE_WORDS) {
    if (lowerText.includes(word)) {
      positiveScore += 1;
      foundKeywords.push(word);
    }
  }

  // Check for negative words
  for (const word of NEGATIVE_WORDS) {
    if (lowerText.includes(word)) {
      negativeScore += 1;
      foundKeywords.push(word);
    }
  }

  // Check for intensifiers (amplify existing sentiment)
  let intensifierCount = 0;
  for (const intensifier of INTENSIFIERS) {
    if (words.includes(intensifier)) {
      intensifierCount++;
    }
  }

  // Apply intensifier multiplier
  if (intensifierCount > 0) {
    const multiplier = 1 + (intensifierCount * 0.25);
    positiveScore *= multiplier;
    negativeScore *= multiplier;
    urgentScore *= multiplier;
  }

  // Check if it's just a question (neutral)
  const isQuestion = QUESTION_PATTERNS.some(pattern => pattern.test(text));
  if (isQuestion && positiveScore === 0 && negativeScore === 0 && urgentScore === 0) {
    return {
      category: 'neutral',
      score: 0,
      keywords: [],
      shouldEscalate: false,
    };
  }

  // Determine category
  let category: SentimentCategory;
  let score: number;

  // Intensified negative sentiment (e.g., "very frustrated") should be treated more seriously
  const hasIntensifiedNegative = intensifierCount > 0 && negativeScore > 0;

  if (urgentScore >= 2) {
    category = 'urgent';
    score = -0.9;
  } else if (negativeScore > positiveScore && (negativeScore >= 2 || hasIntensifiedNegative)) {
    category = 'negative';
    score = Math.max(-1, -0.3 * negativeScore);
  } else if (positiveScore > negativeScore && positiveScore >= 1) {
    category = 'positive';
    score = Math.min(1, 0.3 * positiveScore);
  } else {
    category = 'neutral';
    score = 0;
  }

  // Determine if escalation is needed
  // Escalate on urgent, strongly negative (>=3), or intensified negative sentiment
  const shouldEscalate = category === 'urgent' ||
    (category === 'negative' && (negativeScore >= 3 || hasIntensifiedNegative));

  return {
    category,
    score: Math.round(score * 100) / 100, // Round to 2 decimals
    keywords: [...new Set(foundKeywords)], // Remove duplicates
    shouldEscalate,
  };
}

/**
 * Get escalation message based on language
 */
export function getEscalationMessage(language: 'en' | 'es' | 'ht'): string {
  if (language === 'es') {
    return 'Entiendo que puede estar frustrado. ¿Le gustaría hablar con un representante? Por favor contacte a nuestro equipo de soporte.';
  }
  if (language === 'ht') {
    return 'Mwen konprann ou ka fristre. Èske ou ta renmen pale ak yon reprezantan? Tanpri kontakte ekip sipò nou an.';
  }
  return 'I understand you may be frustrated. Would you like to speak with a representative? Please contact our support team.';
}

/**
 * Log sentiment for analytics (can be extended to store in DB)
 */
export function logSentiment(
  sessionId: string,
  message: string,
  result: SentimentResult
): void {
  // For now, just log to console
  // This can be extended to store in a database for Power BI integration
  console.log('[Sentiment]', {
    sessionId,
    timestamp: new Date().toISOString(),
    message: message.substring(0, 100), // Truncate for privacy
    category: result.category,
    score: result.score,
    shouldEscalate: result.shouldEscalate,
  });
}
