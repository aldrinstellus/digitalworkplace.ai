/**
 * File Processors for dIQ
 * Handles extraction and processing of various file types for AI context
 *
 * Supported formats:
 * - PDF (using pdf-parse)
 * - Plain text (.txt)
 * - Markdown (.md)
 * - JSON (.json)
 * - CSV (.csv)
 */

import { generateEmbedding } from './embeddings';

export interface ProcessedFile {
  filename: string;
  mimeType: string;
  content: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
    charCount: number;
    extractionMethod: string;
  };
  embedding?: number[];
  chunks?: ProcessedChunk[];
}

export interface ProcessedChunk {
  index: number;
  content: string;
  embedding?: number[];
}

const CHUNK_SIZE = 1000; // Characters per chunk for embedding
const CHUNK_OVERLAP = 200; // Overlap between chunks

/**
 * Process a file and extract its content
 */
export async function processFile(
  file: File | Blob,
  filename: string,
  options: {
    generateEmbeddings?: boolean;
    chunkContent?: boolean;
  } = {}
): Promise<ProcessedFile> {
  const mimeType = file.type || getMimeType(filename);
  let content = '';
  let metadata: ProcessedFile['metadata'] = {
    wordCount: 0,
    charCount: 0,
    extractionMethod: 'unknown',
  };

  switch (mimeType) {
    case 'application/pdf':
      const pdfResult = await extractPdfContent(file);
      content = pdfResult.content;
      metadata = {
        ...metadata,
        ...pdfResult.metadata,
        extractionMethod: 'pdf-parse',
      };
      break;

    case 'text/plain':
    case 'text/markdown':
      content = await file.text();
      metadata.extractionMethod = 'text-direct';
      break;

    case 'application/json':
      const jsonContent = await file.text();
      content = formatJsonForContext(jsonContent);
      metadata.extractionMethod = 'json-parse';
      break;

    case 'text/csv':
      const csvContent = await file.text();
      content = formatCsvForContext(csvContent);
      metadata.extractionMethod = 'csv-parse';
      break;

    default:
      // Try to read as text
      try {
        content = await file.text();
        metadata.extractionMethod = 'text-fallback';
      } catch {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }
  }

  // Calculate word and char counts
  metadata.wordCount = content.split(/\s+/).filter(Boolean).length;
  metadata.charCount = content.length;

  const result: ProcessedFile = {
    filename,
    mimeType,
    content,
    metadata,
  };

  // Generate embedding for the whole document (if small enough)
  if (options.generateEmbeddings && content.length <= 8000) {
    try {
      result.embedding = await generateEmbedding(content);
    } catch (error) {
      console.error('Error generating document embedding:', error);
    }
  }

  // Chunk content for large documents
  if (options.chunkContent && content.length > CHUNK_SIZE) {
    result.chunks = await chunkContent(content, options.generateEmbeddings);
  }

  return result;
}

/**
 * Extract content from PDF file
 */
async function extractPdfContent(file: File | Blob): Promise<{
  content: string;
  metadata: { pageCount: number };
}> {
  try {
    // Dynamic import of pdf-parse (server-side only)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try to use pdf-parse if available
    try {
      // Handle both CJS and ESM module formats
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParseModule = await import('pdf-parse') as any;
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const data = await pdfParse(buffer) as { text: string; numpages: number };

      return {
        content: data.text || '',
        metadata: {
          pageCount: data.numpages || 1,
        },
      };
    } catch {
      // Fallback: basic text extraction
      console.warn('pdf-parse not available, using basic extraction');

      // Very basic PDF text extraction (extracts visible text patterns)
      const text = buffer.toString('utf-8');
      const extractedText = extractBasicPdfText(text);

      return {
        content: extractedText,
        metadata: { pageCount: 1 },
      };
    }
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract PDF content');
  }
}

/**
 * Basic PDF text extraction fallback
 */
function extractBasicPdfText(pdfContent: string): string {
  // This is a very basic extraction that looks for text patterns in PDF
  // Real implementation should use pdf-parse or pdfjs-dist

  // Remove PDF binary markers and try to extract readable text
  const cleaned = pdfContent
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Look for text between common PDF text markers
  const textMatches = cleaned.match(/\(([^)]+)\)/g) || [];
  const extractedText = textMatches
    .map(match => match.slice(1, -1))
    .join(' ')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')');

  return extractedText || 'Unable to extract text content from PDF.';
}

/**
 * Format JSON content for AI context
 */
function formatJsonForContext(jsonString: string): string {
  try {
    const data = JSON.parse(jsonString);
    return formatObjectForContext(data);
  } catch {
    return jsonString;
  }
}

/**
 * Recursively format object for readable context
 */
function formatObjectForContext(obj: unknown, indent = 0): string {
  const prefix = '  '.repeat(indent);

  if (obj === null || obj === undefined) {
    return `${prefix}(empty)`;
  }

  if (typeof obj !== 'object') {
    return `${prefix}${String(obj)}`;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return `${prefix}(empty array)`;
    return obj.map((item, i) =>
      `${prefix}${i + 1}. ${formatObjectForContext(item, 0)}`
    ).join('\n');
  }

  const entries = Object.entries(obj as Record<string, unknown>);
  if (entries.length === 0) return `${prefix}(empty object)`;

  return entries.map(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return `${prefix}${key}:\n${formatObjectForContext(value, indent + 1)}`;
    }
    return `${prefix}${key}: ${String(value)}`;
  }).join('\n');
}

/**
 * Format CSV content for AI context
 */
function formatCsvForContext(csvString: string): string {
  const lines = csvString.trim().split('\n');
  if (lines.length === 0) return '';

  // Parse CSV (basic implementation)
  const parseRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of row) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(parseRow);

  // Format as readable text
  let result = `Table with ${rows.length} rows and ${headers.length} columns:\n`;
  result += `Columns: ${headers.join(', ')}\n\n`;

  // Show first 10 rows
  const sampleRows = rows.slice(0, 10);
  sampleRows.forEach((row, i) => {
    result += `Row ${i + 1}:\n`;
    headers.forEach((header, j) => {
      result += `  ${header}: ${row[j] || '(empty)'}\n`;
    });
    result += '\n';
  });

  if (rows.length > 10) {
    result += `... and ${rows.length - 10} more rows\n`;
  }

  return result;
}

/**
 * Chunk content for embedding
 */
async function chunkContent(
  content: string,
  generateEmbeddings = false
): Promise<ProcessedChunk[]> {
  const chunks: ProcessedChunk[] = [];
  let index = 0;
  let position = 0;

  while (position < content.length) {
    // Find a good breaking point (end of sentence or paragraph)
    let endPosition = Math.min(position + CHUNK_SIZE, content.length);

    // Try to break at sentence end
    if (endPosition < content.length) {
      const searchArea = content.substring(position + CHUNK_SIZE - 100, endPosition + 100);
      const sentenceEnd = searchArea.search(/[.!?]\s/);
      if (sentenceEnd > 0) {
        endPosition = position + CHUNK_SIZE - 100 + sentenceEnd + 2;
      }
    }

    const chunkContent = content.substring(position, endPosition).trim();

    if (chunkContent.length > 0) {
      const chunk: ProcessedChunk = {
        index,
        content: chunkContent,
      };

      if (generateEmbeddings) {
        try {
          chunk.embedding = await generateEmbedding(chunkContent);
        } catch (error) {
          console.error(`Error generating embedding for chunk ${index}:`, error);
        }
      }

      chunks.push(chunk);
      index++;
    }

    // Move position with overlap
    position = endPosition - CHUNK_OVERLAP;
    if (position >= content.length) break;
  }

  return chunks;
}

/**
 * Get MIME type from filename
 */
function getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    txt: 'text/plain',
    md: 'text/markdown',
    markdown: 'text/markdown',
    json: 'application/json',
    csv: 'text/csv',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  return mimeTypes[extension || ''] || 'application/octet-stream';
}

/**
 * Summarize file content for quick reference
 */
export function summarizeContent(content: string, maxLength = 500): string {
  if (content.length <= maxLength) return content;

  // Try to find a good breaking point
  const truncated = content.substring(0, maxLength);
  const lastSentenceEnd = truncated.lastIndexOf('. ');

  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1) + '...';
  }

  return truncated.trim() + '...';
}

/**
 * Extract key terms from content for search
 */
export function extractKeyTerms(content: string, maxTerms = 10): string[] {
  // Simple keyword extraction based on frequency
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);

  const frequency: Record<string, number> = {};
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
    'how', 'its', 'let', 'may', 'new', 'now', 'old', 'see', 'way', 'who',
    'boy', 'did', 'own', 'say', 'she', 'too', 'use', 'that', 'with', 'have',
    'this', 'will', 'your', 'from', 'they', 'been', 'call', 'come', 'could',
    'make', 'more', 'over', 'such', 'than', 'them', 'then', 'these', 'what',
    'when', 'which', 'would', 'about', 'after', 'being', 'their', 'there',
    'other', 'should', 'through',
  ]);

  for (const word of words) {
    if (!stopWords.has(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxTerms)
    .map(([word]) => word);
}
