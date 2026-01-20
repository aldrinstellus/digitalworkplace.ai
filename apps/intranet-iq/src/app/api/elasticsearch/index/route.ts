import { NextRequest, NextResponse } from "next/server";
import {
  createSearchIndex,
  deleteSearchIndex,
  getIndexStats,
  isElasticsearchAvailable,
  SearchableDocument,
} from "@/lib/elasticsearch";
import {
  fullSync,
  indexSingleItem,
  removeFromIndex,
  getIndexingStats,
  generateDemoContent,
} from "@/lib/elasticsearch-indexer";

/**
 * GET /api/elasticsearch/index
 * Get index statistics and status
 */
export async function GET() {
  try {
    const esAvailable = await isElasticsearchAvailable();

    if (!esAvailable) {
      return NextResponse.json({
        success: true,
        available: false,
        message: "Elasticsearch is not available. Please start the Elasticsearch service.",
        stats: null,
      });
    }

    const stats = await getIndexingStats();

    return NextResponse.json({
      success: true,
      available: true,
      stats,
    });
  } catch (error) {
    console.error("[Index API] Error getting stats:", error);
    return NextResponse.json(
      {
        error: "Failed to get index stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/elasticsearch/index
 * Indexing operations: sync, create, delete, index-item, remove-item, demo
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, options } = body;

    // Check Elasticsearch availability for most operations
    if (action !== "status") {
      const esAvailable = await isElasticsearchAvailable();
      if (!esAvailable) {
        return NextResponse.json(
          {
            error: "Elasticsearch unavailable",
            message: "Please ensure Elasticsearch is running",
          },
          { status: 503 }
        );
      }
    }

    switch (action) {
      case "sync":
      case "full-sync": {
        // Full sync from Supabase to Elasticsearch
        const syncOptions = {
          generateEmbeddings: options?.generateEmbeddings ?? false,
          batchSize: options?.batchSize ?? 100,
          types: options?.types as SearchableDocument["type"][] | undefined,
        };

        const result = await fullSync(syncOptions);

        return NextResponse.json({
          ...result,
          action: "full-sync",
        });
      }

      case "create-index": {
        // Create the search index with mappings
        await createSearchIndex();

        return NextResponse.json({
          success: true,
          action: "create-index",
          message: "Search index created successfully",
        });
      }

      case "delete-index": {
        // Delete the search index
        await deleteSearchIndex();

        return NextResponse.json({
          success: true,
          action: "delete-index",
          message: "Search index deleted successfully",
        });
      }

      case "index-item": {
        // Index a single item
        const { type, id, generateEmbeddings: genEmbed } = options || {};

        if (!type || !id) {
          return NextResponse.json(
            { error: "Missing type or id" },
            { status: 400 }
          );
        }

        const success = await indexSingleItem(type, id, genEmbed ?? false);

        return NextResponse.json({
          success,
          action: "index-item",
          type,
          id,
          message: success ? "Item indexed successfully" : "Failed to index item",
        });
      }

      case "remove-item": {
        // Remove a single item from index
        const { type: removeType, id: removeId } = options || {};

        if (!removeType || !removeId) {
          return NextResponse.json(
            { error: "Missing type or id" },
            { status: 400 }
          );
        }

        const removed = await removeFromIndex(removeType, removeId);

        return NextResponse.json({
          success: removed,
          action: "remove-item",
          type: removeType,
          id: removeId,
          message: removed ? "Item removed successfully" : "Failed to remove item",
        });
      }

      case "generate-demo": {
        // Generate demo content (PRD requirement: 100-500 mock items)
        const count = options?.count ?? 200;
        const result = await generateDemoContent(count);

        return NextResponse.json({
          ...result,
          action: "generate-demo",
        });
      }

      case "stats": {
        // Get current index statistics
        const stats = await getIndexStats();

        return NextResponse.json({
          success: true,
          action: "stats",
          stats,
        });
      }

      default:
        return NextResponse.json(
          {
            error: "Invalid action",
            validActions: [
              "sync",
              "full-sync",
              "create-index",
              "delete-index",
              "index-item",
              "remove-item",
              "generate-demo",
              "stats",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Index API] Error:", error);
    return NextResponse.json(
      {
        error: "Indexing operation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
