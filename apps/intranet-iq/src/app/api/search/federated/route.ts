/**
 * Federated Search API Route
 * Search across all knowledge sources with unified results
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  federatedSearch,
  FederatedSearchParams,
  SearchSource,
  highlightMatches,
} from '@/lib/search/federated-search';

// POST - Perform federated search
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      query,
      userId,
      organizationId,
      kbSpaceIds,
      sources,
      contentTypes,
      limit = 20,
      offset = 0,
      minScore = 0.1,
      includeConnectors = true,
      semanticSearch = true,
      highlight = true,
    } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Validate sources if provided
    const validSources: SearchSource[] = [
      'internal_kb',
      'articles',
      'connectors',
      'knowledge_items',
      'news',
      'employees',
    ];

    if (sources && !sources.every((s: string) => validSources.includes(s as SearchSource))) {
      return NextResponse.json(
        { error: 'Invalid source type provided' },
        { status: 400 }
      );
    }

    // Perform search
    const searchParams: FederatedSearchParams = {
      query: query.trim(),
      userId,
      organizationId,
      kbSpaceIds,
      sources: sources || ['articles', 'knowledge_items', 'news'],
      contentTypes,
      limit,
      offset,
      minScore,
      includeConnectors,
      semanticSearch,
    };

    const result = await federatedSearch(searchParams);

    // Add highlights if requested
    if (highlight) {
      for (const item of result.results) {
        item.highlight = {
          title: highlightMatches(item.title, query),
          content: item.excerpt ? highlightMatches(item.excerpt, query) : undefined,
        };
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Federated search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Simple search with query params
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const sources = searchParams.get('sources')?.split(',') as SearchSource[] | undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const semantic = searchParams.get('semantic') !== 'false';

    const searchConfig: FederatedSearchParams = {
      query: query.trim(),
      userId: searchParams.get('userId') || undefined,
      organizationId: searchParams.get('organizationId') || undefined,
      sources: sources || ['articles', 'knowledge_items', 'news'],
      limit,
      offset,
      semanticSearch: semantic,
      includeConnectors: searchParams.get('includeConnectors') === 'true',
    };

    const result = await federatedSearch(searchConfig);

    // Add highlights
    for (const item of result.results) {
      item.highlight = {
        title: highlightMatches(item.title, query),
        content: item.excerpt ? highlightMatches(item.excerpt, query) : undefined,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Federated search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
