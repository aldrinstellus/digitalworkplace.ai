// Document parsing API endpoint
// Upload PDF/DOCX files and index them into the knowledge base

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  parseDocument,
  chunkDocument,
  chunksToKnowledgeBase,
} from '@/lib/document-parser';

const KNOWLEDGE_BASE_FILE = path.join(process.cwd(), 'public', 'knowledge-base.json');

interface KnowledgeBaseEntry {
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
}

interface KnowledgeBase {
  entries?: KnowledgeBaseEntry[];
  pages?: KnowledgeBaseEntry[];
  lastUpdated?: string;
  version?: string;
  language?: string;
}

// Load knowledge base
async function loadKnowledgeBase(): Promise<KnowledgeBase> {
  try {
    const content = await fs.readFile(KNOWLEDGE_BASE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { entries: [], lastUpdated: new Date().toISOString(), version: '1.0' };
  }
}

// Save knowledge base
async function saveKnowledgeBase(kb: KnowledgeBase): Promise<void> {
  kb.lastUpdated = new Date().toISOString();
  await fs.writeFile(KNOWLEDGE_BASE_FILE, JSON.stringify(kb, null, 2));
}

// POST: Upload and parse document
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string || 'Documents';
    const baseUrl = formData.get('baseUrl') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    const filename = file.name.toLowerCase();
    if (!filename.endsWith('.pdf') && !filename.endsWith('.docx') && !filename.endsWith('.doc') && !filename.endsWith('.txt')) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, DOCX, or TXT files.' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    console.log(`[DOCS] Parsing document: ${file.name} (${file.size} bytes)`);

    // Parse document
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsedDoc = await parseDocument(buffer, file.name);

    // Chunk document
    const chunks = chunkDocument(parsedDoc, file.name, {
      maxChunkSize: 1000,
      overlap: 100,
    });

    // Convert to knowledge base format
    const entries = chunksToKnowledgeBase(chunks, category, baseUrl);

    // Load existing knowledge base
    const kb = await loadKnowledgeBase();

    // Remove existing entries from this file (in case of re-upload)
    const filePrefix = file.name.replace(/\.[^/.]+$/, '');
    const allEntries = kb.entries || kb.pages || [];
    const filteredEntries = allEntries.filter(e => !e.id.startsWith(filePrefix));

    // Add new entries
    filteredEntries.push(...entries);

    // Update the appropriate property
    if (kb.entries) {
      kb.entries = filteredEntries;
    } else {
      kb.pages = filteredEntries;
    }

    // Save updated knowledge base
    await saveKnowledgeBase(kb);

    console.log(`[DOCS] Added ${entries.length} entries to knowledge base from ${file.name}`);

    return NextResponse.json({
      success: true,
      document: {
        title: parsedDoc.title,
        format: parsedDoc.format,
        pages: parsedDoc.pages,
        wordCount: parsedDoc.wordCount,
      },
      chunks: entries.length,
      message: `Successfully indexed ${entries.length} sections from ${file.name}`,
    });
  } catch (error) {
    console.error('[DOCS] Error parsing document:', error);
    return NextResponse.json(
      { error: 'Failed to parse document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET: List indexed documents
export async function GET() {
  try {
    const kb = await loadKnowledgeBase();

    // Support both 'entries' and 'pages' formats
    const allEntries = kb.entries || kb.pages || [];

    // Group entries by source file
    const documents = new Map<string, { title: string; chunks: number; category: string }>();

    for (const entry of allEntries) {
      if (entry.id.includes('_chunk_')) {
        const sourceFile = entry.id.split('_chunk_')[0];
        if (!documents.has(sourceFile)) {
          documents.set(sourceFile, {
            title: entry.title,
            chunks: 0,
            category: entry.category || entry.section || 'General',
          });
        }
        documents.get(sourceFile)!.chunks++;
      }
    }

    return NextResponse.json({
      documents: Array.from(documents.entries()).map(([file, info]) => ({
        file,
        ...info,
      })),
      totalEntries: allEntries.length,
      lastUpdated: kb.lastUpdated || new Date().toISOString(),
    });
  } catch (error) {
    console.error('[DOCS] Error listing documents:', error);
    return NextResponse.json({ error: 'Failed to list documents' }, { status: 500 });
  }
}

// DELETE: Remove document from knowledge base
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePrefix = searchParams.get('file');

    if (!filePrefix) {
      return NextResponse.json({ error: 'File parameter required' }, { status: 400 });
    }

    const kb = await loadKnowledgeBase();
    const allEntries = kb.entries || kb.pages || [];
    const originalCount = allEntries.length;

    // Remove entries from this file
    const filteredEntries = allEntries.filter(e => !e.id.startsWith(filePrefix));

    // Update the appropriate property
    if (kb.entries) {
      kb.entries = filteredEntries;
    } else {
      kb.pages = filteredEntries;
    }

    const removedCount = originalCount - filteredEntries.length;

    if (removedCount === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await saveKnowledgeBase(kb);

    console.log(`[DOCS] Removed ${removedCount} entries for ${filePrefix}`);

    return NextResponse.json({
      success: true,
      removed: removedCount,
      message: `Removed ${removedCount} sections from knowledge base`,
    });
  } catch (error) {
    console.error('[DOCS] Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
