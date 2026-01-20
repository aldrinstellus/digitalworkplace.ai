import { NextRequest, NextResponse } from "next/server";
import {
  search,
  searchHybrid,
  autocomplete,
  isElasticsearchAvailable,
  SearchOptions,
  SearchableDocument,
} from "@/lib/elasticsearch";
import { generateEmbedding } from "@/lib/embeddings";

/**
 * POST /api/elasticsearch/search
 * Enterprise search using Elasticsearch
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      searchMode = "keyword", // 'keyword', 'semantic', 'hybrid'
      types,
      categories,
      departments,
      tags,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 20,
      sort = "relevance",
      hybridWeight = 0.5,
    } = body;

    // Check Elasticsearch availability
    const esAvailable = await isElasticsearchAvailable();
    if (!esAvailable) {
      return NextResponse.json(
        {
          error: "Elasticsearch is not available",
          message: "Please ensure Elasticsearch is running and accessible",
        },
        { status: 503 }
      );
    }

    // Build search options
    const searchOptions: SearchOptions = {
      query: query || "",
      filters: {
        types,
        categories,
        departments,
        tags,
        dateFrom,
        dateTo,
      },
      from: (page - 1) * pageSize,
      size: pageSize,
      highlight: true,
      sort,
    };

    let results;
    let searchMethod = searchMode;

    // Handle different search modes
    if (searchMode === "hybrid" || searchMode === "semantic") {
      // Generate embedding for semantic/hybrid search
      if (query && query.trim()) {
        try {
          const embedding = await generateEmbedding(query);
          searchOptions.embedding = embedding;
          searchOptions.hybridWeight = hybridWeight;

          if (searchMode === "hybrid") {
            results = await searchHybrid(searchOptions);
          } else {
            // Pure semantic - use high hybrid weight
            searchOptions.hybridWeight = 0.9;
            results = await searchHybrid(searchOptions);
          }
        } catch (embeddingError) {
          console.error("[Search] Embedding generation failed, falling back to keyword:", embeddingError);
          searchMethod = "keyword";
          results = await search(searchOptions);
        }
      } else {
        // No query, just list/filter
        results = await search(searchOptions);
        searchMethod = "browse";
      }
    } else {
      // Pure keyword search
      results = await search(searchOptions);
    }

    // Generate AI summary if Claude API is configured
    let aiSummary = null;
    if (results.results.length > 0 && process.env.ANTHROPIC_API_KEY && query) {
      try {
        const Anthropic = (await import("@anthropic-ai/sdk")).default;
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const context = results.results
          .slice(0, 3)
          .map((r) => `- ${r.title}: ${r.excerpt || r.content.substring(0, 200)}`)
          .join("\n");

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 256,
          messages: [
            {
              role: "user",
              content: `Based on these search results for "${query}":\n\n${context}\n\nProvide a 1-2 sentence summary of what the user might find helpful. Be concise and helpful.`,
            },
          ],
        });

        aiSummary =
          response.content[0].type === "text" ? response.content[0].text : null;
      } catch (err) {
        console.error("[Search] AI summary generation failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      query,
      searchMethod,
      results: results.results,
      total: results.total,
      took: results.took,
      aggregations: results.aggregations,
      pagination: {
        page,
        pageSize,
        totalPages: Math.ceil(results.total / pageSize),
        hasMore: page * pageSize < results.total,
      },
      aiSummary,
    });
  } catch (error) {
    console.error("[Search API] Error:", error);
    return NextResponse.json(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/elasticsearch/search/autocomplete
 * Autocomplete suggestions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const types = searchParams.get("types")?.split(",") as SearchableDocument["type"][] | undefined;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Check Elasticsearch availability
    const esAvailable = await isElasticsearchAvailable();
    if (!esAvailable) {
      return NextResponse.json({ suggestions: [], error: "Elasticsearch unavailable" });
    }

    const suggestions = await autocomplete(query, { types, limit });

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("[Autocomplete API] Error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
