/**
 * Local Embeddings using Transformers.js
 * Uses all-MiniLM-L6-v2 model (384 dimensions)
 * No API key required - runs locally
 *
 * IMPORTANT: Same model as dIQ for consistent cross-project search
 */

// Dynamic import to avoid issues with server-side rendering
let embeddingModel: any = null;

async function getEmbeddingPipeline() {
  if (embeddingModel) {
    return embeddingModel;
  }

  // Dynamically import transformers.js
  const { pipeline: createPipeline } = await import('@xenova/transformers');

  // Use all-MiniLM-L6-v2 - fast, small, and effective
  // Produces 384-dimensional embeddings (SAME AS dIQ)
  embeddingModel = await createPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  return embeddingModel;
}

/**
 * Generate embedding for text using local model
 * @param text - Text to embed
 * @returns 384-dimensional embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = await getEmbeddingPipeline();

  // Truncate text to avoid memory issues (max ~512 tokens)
  const truncatedText = text.substring(0, 2000);

  // Generate embedding
  const output = await model(truncatedText, { pooling: 'mean', normalize: true });

  // Convert to regular array
  return Array.from(output.data);
}

/**
 * Generate embeddings for multiple texts (batch processing)
 * @param texts - Array of texts to embed
 * @returns Array of 384-dimensional embedding vectors
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const model = await getEmbeddingPipeline();

  const embeddings: number[][] = [];

  for (const text of texts) {
    const truncatedText = text.substring(0, 2000);
    const output = await model(truncatedText, { pooling: 'mean', normalize: true });
    embeddings.push(Array.from(output.data));
  }

  return embeddings;
}

/**
 * Get embedding dimensions (384 for all-MiniLM-L6-v2)
 */
export function getEmbeddingDimensions(): number {
  return 384;
}
