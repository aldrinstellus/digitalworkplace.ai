// SharePoint Integration API for Chat Core IQ Chatbot
// ITN 2025-20 Section 3.2.5 (Optional)

import { NextRequest, NextResponse } from 'next/server';
import { getSharePointAdapter } from '@/lib/integrations/sharepoint-adapter';
import { parseDocument } from '@/lib/document-parser';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/sharepoint - Check SharePoint status and list files
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'status';
  const path = searchParams.get('path') || '';
  const query = searchParams.get('query') || '';

  const adapter = getSharePointAdapter();

  switch (action) {
    case 'status':
      return NextResponse.json({
        enabled: adapter.isEnabled(),
        supportedTypes: adapter.getSupportedFileTypes(),
      }, { headers: corsHeaders });

    case 'list_files':
      if (!adapter.isEnabled()) {
        return NextResponse.json({
          success: false,
          error: 'SharePoint integration is not enabled',
        }, { status: 400, headers: corsHeaders });
      }
      const files = await adapter.listFiles(path);
      return NextResponse.json({
        success: true,
        files,
        path,
      }, { headers: corsHeaders });

    case 'list_folders':
      if (!adapter.isEnabled()) {
        return NextResponse.json({
          success: false,
          error: 'SharePoint integration is not enabled',
        }, { status: 400, headers: corsHeaders });
      }
      const folders = await adapter.listFolders(path);
      return NextResponse.json({
        success: true,
        folders,
        path,
      }, { headers: corsHeaders });

    case 'search':
      if (!adapter.isEnabled()) {
        return NextResponse.json({
          success: false,
          error: 'SharePoint integration is not enabled',
        }, { status: 400, headers: corsHeaders });
      }
      if (!query) {
        return NextResponse.json({
          success: false,
          error: 'Query parameter is required for search',
        }, { status: 400, headers: corsHeaders });
      }
      const searchResults = await adapter.searchFiles(query);
      return NextResponse.json({
        success: true,
        results: searchResults,
        query,
      }, { headers: corsHeaders });

    default:
      return NextResponse.json({
        success: false,
        error: 'Invalid action',
        validActions: ['status', 'list_files', 'list_folders', 'search'],
      }, { status: 400, headers: corsHeaders });
  }
}

// POST /api/sharepoint - Sync SharePoint files to knowledge base
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const adapter = getSharePointAdapter();

    if (!adapter.isEnabled()) {
      return NextResponse.json({
        success: false,
        error: 'SharePoint integration is not enabled',
        message: 'Configure SHAREPOINT_ENABLED and credentials in environment variables',
      }, { status: 400, headers: corsHeaders });
    }

    switch (action) {
      case 'test_connection': {
        const result = await adapter.testConnection();
        return NextResponse.json({
          success: result.success,
          message: result.message,
        }, { headers: corsHeaders });
      }

      case 'parse_file': {
        if (!data?.fileId) {
          return NextResponse.json({
            success: false,
            error: 'fileId is required',
          }, { status: 400, headers: corsHeaders });
        }

        const file = await adapter.getFile(data.fileId);
        if (!file) {
          return NextResponse.json({
            success: false,
            error: 'File not found',
          }, { status: 404, headers: corsHeaders });
        }

        if (!adapter.isFileTypeSupported(file.mimeType)) {
          return NextResponse.json({
            success: false,
            error: `File type ${file.mimeType} is not supported for parsing`,
            supportedTypes: adapter.getSupportedFileTypes(),
          }, { status: 400, headers: corsHeaders });
        }

        const content = await adapter.downloadFile(data.fileId);
        if (!content) {
          return NextResponse.json({
            success: false,
            error: 'Failed to download file',
          }, { status: 500, headers: corsHeaders });
        }

        // Parse the document
        const parsed = await parseDocument(content, file.name);

        return NextResponse.json({
          success: true,
          file: {
            id: file.id,
            name: file.name,
            path: file.path,
            webUrl: file.webUrl,
            mimeType: file.mimeType,
          },
          parsed: {
            title: parsed.title,
            content: parsed.content.substring(0, 5000), // Limit for response
            contentLength: parsed.content.length,
            metadata: parsed.metadata,
          },
        }, { headers: corsHeaders });
      }

      case 'sync_folder': {
        const folderPath = data?.path || '';
        const files = await adapter.listFiles(folderPath);

        const results = {
          total: files.length,
          supported: 0,
          parsed: 0,
          errors: [] as string[],
        };

        const parsedFiles = [];

        for (const file of files) {
          if (adapter.isFileTypeSupported(file.mimeType)) {
            results.supported++;

            try {
              const content = await adapter.downloadFile(file.id);
              if (content) {
                const parsed = await parseDocument(content, file.name);

                parsedFiles.push({
                  id: file.id,
                  name: file.name,
                  webUrl: file.webUrl,
                  title: parsed.title,
                  contentPreview: parsed.content.substring(0, 500),
                  contentLength: parsed.content.length,
                });

                results.parsed++;
              }
            } catch (error) {
              results.errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Parse error'}`);
            }
          }
        }

        return NextResponse.json({
          success: true,
          results,
          parsedFiles,
        }, { headers: corsHeaders });
      }

      case 'add_to_knowledge_base': {
        // This would add parsed SharePoint files to the knowledge base
        // For now, return instructions on manual integration
        return NextResponse.json({
          success: true,
          message: 'SharePoint file parsing complete',
          instructions: [
            '1. Use sync_folder action to get parsed files',
            '2. Review parsed content for accuracy',
            '3. Add entries to /public/knowledge-base.json',
            '4. Run npm run build to regenerate embeddings',
          ],
          note: 'Automatic knowledge base integration can be enabled in admin settings',
        }, { headers: corsHeaders });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          validActions: ['test_connection', 'parse_file', 'sync_folder', 'add_to_knowledge_base'],
        }, { status: 400, headers: corsHeaders });
    }
  } catch (error) {
    console.error('[SharePoint API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500, headers: corsHeaders });
  }
}
