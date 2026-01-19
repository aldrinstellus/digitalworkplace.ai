// Document parser for PDF and DOCX files
// Extracts text content for indexing in knowledge base

export interface ParsedDocument {
  title: string;
  content: string;
  pages?: number;
  wordCount: number;
  format: 'pdf' | 'docx' | 'txt';
  metadata?: Record<string, unknown>;
}

export interface DocumentChunk {
  id: string;
  title: string;
  section: string;
  content: string;
  sourceFile: string;
  pageNumber?: number;
  chunkIndex: number;
}

// Parse PDF file
export async function parsePDF(buffer: Buffer, filename: string): Promise<ParsedDocument> {
  // Dynamic import for CommonJS module compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfModule = await import('pdf-parse') as any;
  const pdfParse = pdfModule.default || pdfModule;
  const data = await pdfParse(buffer);

  return {
    title: filename.replace(/\.pdf$/i, ''),
    content: data.text,
    pages: data.numpages,
    wordCount: data.text.split(/\s+/).length,
    format: 'pdf',
    metadata: {
      info: data.info,
      version: data.version,
    },
  };
}

// Parse DOCX file
export async function parseDOCX(buffer: Buffer, filename: string): Promise<ParsedDocument> {
  // Dynamic import for CommonJS module compatibility
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });

  return {
    title: filename.replace(/\.docx?$/i, ''),
    content: result.value,
    wordCount: result.value.split(/\s+/).length,
    format: 'docx',
    metadata: {
      messages: result.messages,
    },
  };
}

// Parse text file
export async function parseTXT(buffer: Buffer, filename: string): Promise<ParsedDocument> {
  const content = buffer.toString('utf-8');

  return {
    title: filename.replace(/\.txt$/i, ''),
    content,
    wordCount: content.split(/\s+/).length,
    format: 'txt',
  };
}

// Detect file type and parse accordingly
export async function parseDocument(buffer: Buffer, filename: string): Promise<ParsedDocument> {
  const ext = filename.toLowerCase().split('.').pop();

  switch (ext) {
    case 'pdf':
      return parsePDF(buffer, filename);
    case 'doc':
    case 'docx':
      return parseDOCX(buffer, filename);
    case 'txt':
      return parseTXT(buffer, filename);
    default:
      throw new Error(`Unsupported file format: ${ext}`);
  }
}

// Chunk document into smaller pieces for indexing
export function chunkDocument(
  doc: ParsedDocument,
  sourceFile: string,
  options: {
    maxChunkSize?: number;
    overlap?: number;
  } = {}
): DocumentChunk[] {
  const { maxChunkSize = 1000, overlap = 100 } = options;
  const chunks: DocumentChunk[] = [];

  // Split content by paragraphs first
  const paragraphs = doc.content.split(/\n\n+/).filter(p => p.trim().length > 0);

  let currentChunk = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    // If adding this paragraph exceeds max size, save current chunk
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        id: `${sourceFile}_chunk_${chunkIndex}`,
        title: doc.title,
        section: `Section ${chunkIndex + 1}`,
        content: currentChunk.trim(),
        sourceFile,
        chunkIndex,
      });

      // Keep overlap from previous chunk
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      currentChunk = overlapWords.join(' ') + ' ';
      chunkIndex++;
    }

    currentChunk += paragraph + '\n\n';
  }

  // Save final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `${sourceFile}_chunk_${chunkIndex}`,
      title: doc.title,
      section: `Section ${chunkIndex + 1}`,
      content: currentChunk.trim(),
      sourceFile,
      chunkIndex,
    });
  }

  return chunks;
}

// Convert chunks to knowledge base format
export function chunksToKnowledgeBase(
  chunks: DocumentChunk[],
  category: string,
  baseUrl?: string
): Array<{
  id: string;
  title: string;
  url: string;
  section: string;
  content: string;
  summary: string;
  keywords: string[];
  lastUpdated: string;
  language: string;
  category: string;
}> {
  return chunks.map(chunk => ({
    id: chunk.id,
    title: chunk.title,
    url: baseUrl || `document://${chunk.sourceFile}`,
    section: chunk.section,
    content: chunk.content,
    summary: chunk.content.substring(0, 200) + (chunk.content.length > 200 ? '...' : ''),
    keywords: extractKeywords(chunk.content),
    lastUpdated: new Date().toISOString(),
    language: detectDocumentLanguage(chunk.content),
    category,
  }));
}

// Simple keyword extraction
function extractKeywords(text: string): string[] {
  // Remove common words and punctuation
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'that', 'this', 'these',
    'those', 'it', 'its', 'you', 'your', 'we', 'our', 'they', 'their',
    'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'de', 'en', 'con',
    'por', 'para', 'que', 'es', 'son', 'del', 'al',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count word frequency
  const wordCount = new Map<string, number>();
  for (const word of words) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }

  // Return top 10 keywords
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

// Simple language detection
function detectDocumentLanguage(text: string): 'en' | 'es' {
  const spanishWords = ['el', 'la', 'de', 'que', 'en', 'los', 'del', 'las', 'por', 'con', 'para', 'una', 'son', 'este', 'como'];
  const lowerText = text.toLowerCase();
  let spanishCount = 0;

  for (const word of spanishWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) spanishCount += matches.length;
  }

  // If more than 2% of words are Spanish indicators, mark as Spanish
  const wordCount = text.split(/\s+/).length;
  return spanishCount / wordCount > 0.02 ? 'es' : 'en';
}
