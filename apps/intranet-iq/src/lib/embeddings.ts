/**
 * OpenAI Embeddings using text-embedding-3-small
 * Produces 1536-dimensional embeddings
 * Optimized for Vercel serverless deployment
 *
 * IMPORTANT: Same model used across all subprojects (dIQ, dCQ, dSQ)
 * for consistent cross-project semantic search
 */

const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;
const _MAX_INPUT_TOKENS = 8191; // Model limit (reserved for future use)
const MAX_TEXT_LENGTH = 8000; // Safe character limit (~2 tokens per char)

interface OpenAIEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    index: number;
    embedding: number[];
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate embedding for text using OpenAI API
 * @param text - Text to embed
 * @returns 1536-dimensional embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  // Truncate text to avoid token limit
  const truncatedText = text.substring(0, MAX_TEXT_LENGTH).trim();

  if (!truncatedText) {
    throw new Error('Cannot generate embedding for empty text');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: truncatedText,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorBody}`);
  }

  const data: OpenAIEmbeddingResponse = await response.json();

  if (!data.data || data.data.length === 0) {
    throw new Error('No embedding returned from OpenAI API');
  }

  return data.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts (batch processing)
 * OpenAI supports batch embedding in a single request
 * @param texts - Array of texts to embed
 * @returns Array of 1536-dimensional embedding vectors
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  if (texts.length === 0) {
    return [];
  }

  // Truncate each text and filter empty ones
  const truncatedTexts = texts
    .map(text => text.substring(0, MAX_TEXT_LENGTH).trim())
    .filter(text => text.length > 0);

  if (truncatedTexts.length === 0) {
    throw new Error('No valid texts to embed after filtering');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: truncatedTexts,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorBody}`);
  }

  const data: OpenAIEmbeddingResponse = await response.json();

  // Sort by index to ensure correct order
  const sortedEmbeddings = data.data
    .sort((a, b) => a.index - b.index)
    .map(item => item.embedding);

  return sortedEmbeddings;
}

/**
 * Get embedding dimensions (1536 for text-embedding-3-small)
 */
export function getEmbeddingDimensions(): number {
  return EMBEDDING_DIMENSIONS;
}

/**
 * Get the embedding model name
 */
export function getEmbeddingModel(): string {
  return OPENAI_EMBEDDING_MODEL;
}
