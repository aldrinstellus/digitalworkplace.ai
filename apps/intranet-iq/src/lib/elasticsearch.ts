/**
 * Elasticsearch Client Configuration and Helper Functions
 * For dIQ - Intranet IQ Enterprise Search
 */

import { Client, estypes } from "@elastic/elasticsearch";

// ============================================================================
// Types
// ============================================================================

export interface SearchableDocument {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  type: "article" | "document" | "faq" | "news" | "event" | "employee" | "workflow";
  category?: string;
  department?: string;
  author?: string;
  authorId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  url?: string;
  metadata?: Record<string, unknown>;
  // For hybrid search with embeddings
  embedding?: number[];
}

export interface SearchOptions {
  query: string;
  filters?: {
    types?: SearchableDocument["type"][];
    categories?: string[];
    departments?: string[];
    authors?: string[];
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
  };
  from?: number;
  size?: number;
  highlight?: boolean;
  sort?: "relevance" | "date_desc" | "date_asc";
  // For hybrid search
  embedding?: number[];
  hybridWeight?: number; // 0-1, weight for semantic vs keyword (0 = all keyword, 1 = all semantic)
}

export interface SearchResult {
  id: string;
  score: number;
  title: string;
  content: string;
  excerpt?: string;
  type: SearchableDocument["type"];
  category?: string;
  department?: string;
  author?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  url?: string;
  highlights?: {
    title?: string[];
    content?: string[];
  };
  metadata?: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number; // milliseconds
  aggregations?: {
    types?: { key: string; count: number }[];
    categories?: { key: string; count: number }[];
    departments?: { key: string; count: number }[];
    tags?: { key: string; count: number }[];
  };
}

export interface IndexStats {
  totalDocuments: number;
  byType: Record<string, number>;
  lastIndexed?: string;
  indexSize: string;
  health: "green" | "yellow" | "red";
}

// ============================================================================
// Client Configuration
// ============================================================================

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || "http://localhost:9200";
const ELASTICSEARCH_API_KEY = process.env.ELASTICSEARCH_API_KEY;
const ELASTICSEARCH_INDEX = process.env.ELASTICSEARCH_INDEX || "diq-content";

let client: Client | null = null;

/**
 * Get or create Elasticsearch client instance (singleton)
 */
export function getElasticsearchClient(): Client {
  if (!client) {
    const clientConfig: { node: string; auth?: { apiKey: string } } = {
      node: ELASTICSEARCH_URL,
    };

    if (ELASTICSEARCH_API_KEY) {
      clientConfig.auth = { apiKey: ELASTICSEARCH_API_KEY };
    }

    client = new Client(clientConfig);
  }
  return client;
}

/**
 * Check if Elasticsearch is available
 */
export async function isElasticsearchAvailable(): Promise<boolean> {
  try {
    const es = getElasticsearchClient();
    const response = await es.ping();
    return response === true;
  } catch {
    return false;
  }
}

// ============================================================================
// Index Management
// ============================================================================

/**
 * Create or update the search index with proper mappings
 */
export async function createSearchIndex(): Promise<boolean> {
  const es = getElasticsearchClient();

  try {
    const indexExists = await es.indices.exists({ index: ELASTICSEARCH_INDEX });

    if (!indexExists) {
      await es.indices.create({
        index: ELASTICSEARCH_INDEX,
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          analysis: {
            analyzer: {
              content_analyzer: {
                type: "custom",
                tokenizer: "standard",
                filter: ["lowercase", "snowball", "word_delimiter_graph"],
              },
              autocomplete_analyzer: {
                type: "custom",
                tokenizer: "standard",
                filter: ["lowercase", "edge_ngram_filter"],
              },
            },
            filter: {
              edge_ngram_filter: {
                type: "edge_ngram",
                min_gram: 2,
                max_gram: 15,
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: "keyword" },
            title: {
              type: "text",
              analyzer: "content_analyzer",
              fields: {
                autocomplete: {
                  type: "text",
                  analyzer: "autocomplete_analyzer",
                  search_analyzer: "standard",
                },
                keyword: { type: "keyword" },
              },
            },
            content: {
              type: "text",
              analyzer: "content_analyzer",
            },
            excerpt: {
              type: "text",
              analyzer: "content_analyzer",
            },
            type: { type: "keyword" },
            category: { type: "keyword" },
            department: { type: "keyword" },
            author: {
              type: "text",
              fields: { keyword: { type: "keyword" } },
            },
            authorId: { type: "keyword" },
            tags: { type: "keyword" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
            url: { type: "keyword" },
            metadata: { type: "object", enabled: false },
            // Dense vector for hybrid search (1536 dimensions for OpenAI embeddings)
            embedding: {
              type: "dense_vector",
              dims: 1536,
              index: true,
              similarity: "cosine",
            },
          },
        },
      });

      console.log(`[Elasticsearch] Created index: ${ELASTICSEARCH_INDEX}`);
      return true;
    }

    console.log(`[Elasticsearch] Index already exists: ${ELASTICSEARCH_INDEX}`);
    return true;
  } catch (error) {
    console.error("[Elasticsearch] Failed to create index:", error);
    throw error;
  }
}

/**
 * Delete the search index
 */
export async function deleteSearchIndex(): Promise<boolean> {
  const es = getElasticsearchClient();

  try {
    await es.indices.delete({ index: ELASTICSEARCH_INDEX });
    console.log(`[Elasticsearch] Deleted index: ${ELASTICSEARCH_INDEX}`);
    return true;
  } catch (error) {
    console.error("[Elasticsearch] Failed to delete index:", error);
    throw error;
  }
}

/**
 * Get index statistics
 */
export async function getIndexStats(): Promise<IndexStats> {
  const es = getElasticsearchClient();

  try {
    const [health, stats, countByType] = await Promise.all([
      es.cluster.health({ index: ELASTICSEARCH_INDEX }),
      es.indices.stats({ index: ELASTICSEARCH_INDEX }),
      es.search({
        index: ELASTICSEARCH_INDEX,
        size: 0,
        aggs: {
          types: {
            terms: { field: "type", size: 20 },
          },
        },
      }),
    ]);

    const indexStats = stats.indices?.[ELASTICSEARCH_INDEX];
    const totalDocs = indexStats?.primaries?.docs?.count ?? 0;
    const sizeBytes = indexStats?.primaries?.store?.size_in_bytes ?? 0;

    const typeAggs = countByType.aggregations?.types as estypes.AggregationsStringTermsAggregate | undefined;
    const byType: Record<string, number> = {};
    if (typeAggs?.buckets && Array.isArray(typeAggs.buckets)) {
      for (const bucket of typeAggs.buckets) {
        byType[bucket.key as string] = bucket.doc_count;
      }
    }

    return {
      totalDocuments: totalDocs,
      byType,
      indexSize: formatBytes(sizeBytes),
      health: health.status as "green" | "yellow" | "red",
    };
  } catch (error) {
    console.error("[Elasticsearch] Failed to get index stats:", error);
    throw error;
  }
}

// ============================================================================
// Document Operations
// ============================================================================

/**
 * Index a single document
 */
export async function indexDocument(doc: SearchableDocument): Promise<boolean> {
  const es = getElasticsearchClient();

  try {
    await es.index({
      index: ELASTICSEARCH_INDEX,
      id: doc.id,
      document: doc,
      refresh: true,
    });
    return true;
  } catch (error) {
    console.error("[Elasticsearch] Failed to index document:", error);
    throw error;
  }
}

/**
 * Index multiple documents (bulk operation)
 */
export async function indexDocumentsBulk(
  docs: SearchableDocument[]
): Promise<{ indexed: number; errors: number }> {
  const es = getElasticsearchClient();

  if (docs.length === 0) {
    return { indexed: 0, errors: 0 };
  }

  try {
    const operations = docs.flatMap((doc) => [
      { index: { _index: ELASTICSEARCH_INDEX, _id: doc.id } },
      doc,
    ]);

    const response = await es.bulk({
      operations,
      refresh: true,
    });

    let errors = 0;
    if (response.errors) {
      for (const item of response.items) {
        if (item.index?.error) {
          console.error("[Elasticsearch] Bulk index error:", item.index.error);
          errors++;
        }
      }
    }

    return {
      indexed: docs.length - errors,
      errors,
    };
  } catch (error) {
    console.error("[Elasticsearch] Failed to bulk index documents:", error);
    throw error;
  }
}

/**
 * Update a document
 */
export async function updateDocument(
  id: string,
  updates: Partial<SearchableDocument>
): Promise<boolean> {
  const es = getElasticsearchClient();

  try {
    await es.update({
      index: ELASTICSEARCH_INDEX,
      id,
      doc: updates,
      refresh: true,
    });
    return true;
  } catch (error) {
    console.error("[Elasticsearch] Failed to update document:", error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<boolean> {
  const es = getElasticsearchClient();

  try {
    await es.delete({
      index: ELASTICSEARCH_INDEX,
      id,
      refresh: true,
    });
    return true;
  } catch (error) {
    console.error("[Elasticsearch] Failed to delete document:", error);
    throw error;
  }
}

/**
 * Delete multiple documents by IDs
 */
export async function deleteDocumentsBulk(ids: string[]): Promise<number> {
  const es = getElasticsearchClient();

  if (ids.length === 0) {
    return 0;
  }

  try {
    const operations = ids.flatMap((id) => [
      { delete: { _index: ELASTICSEARCH_INDEX, _id: id } },
    ]);

    const response = await es.bulk({
      operations,
      refresh: true,
    });

    let deleted = 0;
    for (const item of response.items) {
      if (item.delete?.result === "deleted") {
        deleted++;
      }
    }

    return deleted;
  } catch (error) {
    console.error("[Elasticsearch] Failed to bulk delete documents:", error);
    throw error;
  }
}

/**
 * Get a document by ID
 */
export async function getDocument(id: string): Promise<SearchableDocument | null> {
  const es = getElasticsearchClient();

  try {
    const response = await es.get({
      index: ELASTICSEARCH_INDEX,
      id,
    });

    return response._source as SearchableDocument;
  } catch (error: unknown) {
    if ((error as { statusCode?: number })?.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

// ============================================================================
// Search Operations
// ============================================================================

/**
 * Perform a search query
 */
export async function search(options: SearchOptions): Promise<SearchResponse> {
  const es = getElasticsearchClient();
  const { query, filters, from = 0, size = 20, highlight = true, sort = "relevance" } = options;

  try {
    // Build query
    const must: estypes.QueryDslQueryContainer[] = [];
    const filter: estypes.QueryDslQueryContainer[] = [];

    // Main text query
    if (query && query.trim()) {
      must.push({
        multi_match: {
          query: query.trim(),
          fields: ["title^3", "title.autocomplete^2", "content", "excerpt", "tags^2"],
          type: "best_fields",
          fuzziness: "AUTO",
        },
      });
    }

    // Filters
    if (filters?.types?.length) {
      filter.push({ terms: { type: filters.types } });
    }
    if (filters?.categories?.length) {
      filter.push({ terms: { category: filters.categories } });
    }
    if (filters?.departments?.length) {
      filter.push({ terms: { department: filters.departments } });
    }
    if (filters?.authors?.length) {
      filter.push({ terms: { "author.keyword": filters.authors } });
    }
    if (filters?.tags?.length) {
      filter.push({ terms: { tags: filters.tags } });
    }
    if (filters?.dateFrom || filters?.dateTo) {
      const range: { gte?: string; lte?: string } = {};
      if (filters.dateFrom) range.gte = filters.dateFrom;
      if (filters.dateTo) range.lte = filters.dateTo;
      filter.push({ range: { updatedAt: range } });
    }

    // Build sort
    let sortOption: estypes.Sort = [];
    switch (sort) {
      case "date_desc":
        sortOption = [{ updatedAt: { order: "desc" } }, "_score"];
        break;
      case "date_asc":
        sortOption = [{ updatedAt: { order: "asc" } }, "_score"];
        break;
      default:
        sortOption = ["_score", { updatedAt: { order: "desc" } }];
    }

    // Build highlight
    const highlightConfig: estypes.SearchHighlight | undefined = highlight
      ? {
          fields: {
            title: { number_of_fragments: 1, fragment_size: 200 },
            content: { number_of_fragments: 3, fragment_size: 150 },
          },
          pre_tags: ["<mark>"],
          post_tags: ["</mark>"],
        }
      : undefined;

    const response = await es.search({
      index: ELASTICSEARCH_INDEX,
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter: filter.length > 0 ? filter : undefined,
        },
      },
      from,
      size,
      sort: sortOption,
      highlight: highlightConfig,
      aggs: {
        types: { terms: { field: "type", size: 10 } },
        categories: { terms: { field: "category", size: 20 } },
        departments: { terms: { field: "department", size: 20 } },
        tags: { terms: { field: "tags", size: 30 } },
      },
    });

    // Parse results
    const hits = response.hits.hits;
    const results: SearchResult[] = hits.map((hit) => {
      const source = hit._source as SearchableDocument;
      return {
        id: source.id,
        score: hit._score ?? 0,
        title: source.title,
        content: source.content,
        excerpt: source.excerpt,
        type: source.type,
        category: source.category,
        department: source.department,
        author: source.author,
        tags: source.tags,
        createdAt: source.createdAt,
        updatedAt: source.updatedAt,
        url: source.url,
        metadata: source.metadata,
        highlights: {
          title: hit.highlight?.title,
          content: hit.highlight?.content,
        },
      };
    });

    // Parse aggregations
    const typeAggs = response.aggregations?.types as estypes.AggregationsStringTermsAggregate | undefined;
    const categoryAggs = response.aggregations?.categories as estypes.AggregationsStringTermsAggregate | undefined;
    const departmentAggs = response.aggregations?.departments as estypes.AggregationsStringTermsAggregate | undefined;
    const tagAggs = response.aggregations?.tags as estypes.AggregationsStringTermsAggregate | undefined;

    const aggregations = {
      types: Array.isArray(typeAggs?.buckets)
        ? typeAggs.buckets.map((b) => ({ key: b.key as string, count: b.doc_count }))
        : undefined,
      categories: Array.isArray(categoryAggs?.buckets)
        ? categoryAggs.buckets.map((b) => ({ key: b.key as string, count: b.doc_count }))
        : undefined,
      departments: Array.isArray(departmentAggs?.buckets)
        ? departmentAggs.buckets.map((b) => ({ key: b.key as string, count: b.doc_count }))
        : undefined,
      tags: Array.isArray(tagAggs?.buckets)
        ? tagAggs.buckets.map((b) => ({ key: b.key as string, count: b.doc_count }))
        : undefined,
    };

    const total =
      typeof response.hits.total === "number"
        ? response.hits.total
        : response.hits.total?.value ?? 0;

    return {
      results,
      total,
      took: response.took,
      aggregations,
    };
  } catch (error) {
    console.error("[Elasticsearch] Search failed:", error);
    throw error;
  }
}

/**
 * Perform a hybrid search (keyword + semantic)
 */
export async function searchHybrid(options: SearchOptions): Promise<SearchResponse> {
  const es = getElasticsearchClient();
  const {
    query,
    embedding,
    hybridWeight = 0.5,
    filters,
    from = 0,
    size = 20,
    highlight = true,
  } = options;

  if (!embedding) {
    // Fall back to regular search if no embedding provided
    return search(options);
  }

  try {
    const filter: estypes.QueryDslQueryContainer[] = [];

    // Filters
    if (filters?.types?.length) {
      filter.push({ terms: { type: filters.types } });
    }
    if (filters?.categories?.length) {
      filter.push({ terms: { category: filters.categories } });
    }
    if (filters?.departments?.length) {
      filter.push({ terms: { department: filters.departments } });
    }

    // Use script_score to combine keyword and vector scores
    const response = await es.search({
      index: ELASTICSEARCH_INDEX,
      query: {
        script_score: {
          query: {
            bool: {
              must: query
                ? [
                    {
                      multi_match: {
                        query: query.trim(),
                        fields: ["title^3", "content", "excerpt"],
                        type: "best_fields",
                        fuzziness: "AUTO",
                      },
                    },
                  ]
                : [{ match_all: {} }],
              filter: filter.length > 0 ? filter : undefined,
            },
          },
          script: {
            source: `
              double keywordScore = _score;
              double vectorScore = cosineSimilarity(params.embedding, 'embedding') + 1.0;
              return (1 - params.weight) * keywordScore + params.weight * vectorScore * 10;
            `,
            params: {
              embedding,
              weight: hybridWeight,
            },
          },
        },
      },
      from,
      size,
      highlight: highlight
        ? {
            fields: {
              title: { number_of_fragments: 1, fragment_size: 200 },
              content: { number_of_fragments: 3, fragment_size: 150 },
            },
            pre_tags: ["<mark>"],
            post_tags: ["</mark>"],
          }
        : undefined,
      aggs: {
        types: { terms: { field: "type", size: 10 } },
        categories: { terms: { field: "category", size: 20 } },
        departments: { terms: { field: "department", size: 20 } },
      },
    });

    // Parse results (same as regular search)
    const hits = response.hits.hits;
    const results: SearchResult[] = hits.map((hit) => {
      const source = hit._source as SearchableDocument;
      return {
        id: source.id,
        score: hit._score ?? 0,
        title: source.title,
        content: source.content,
        excerpt: source.excerpt,
        type: source.type,
        category: source.category,
        department: source.department,
        author: source.author,
        tags: source.tags,
        createdAt: source.createdAt,
        updatedAt: source.updatedAt,
        url: source.url,
        metadata: source.metadata,
        highlights: {
          title: hit.highlight?.title,
          content: hit.highlight?.content,
        },
      };
    });

    const total =
      typeof response.hits.total === "number"
        ? response.hits.total
        : response.hits.total?.value ?? 0;

    return {
      results,
      total,
      took: response.took,
    };
  } catch (error) {
    console.error("[Elasticsearch] Hybrid search failed:", error);
    throw error;
  }
}

/**
 * Get autocomplete suggestions
 */
export async function autocomplete(
  query: string,
  options?: { types?: SearchableDocument["type"][]; limit?: number }
): Promise<{ id: string; title: string; type: string }[]> {
  const es = getElasticsearchClient();
  const { types, limit = 10 } = options || {};

  try {
    const filter: estypes.QueryDslQueryContainer[] = [];
    if (types?.length) {
      filter.push({ terms: { type: types } });
    }

    const response = await es.search({
      index: ELASTICSEARCH_INDEX,
      query: {
        bool: {
          must: [
            {
              match: {
                "title.autocomplete": {
                  query,
                  operator: "and",
                },
              },
            },
          ],
          filter: filter.length > 0 ? filter : undefined,
        },
      },
      size: limit,
      _source: ["id", "title", "type"],
    });

    return response.hits.hits.map((hit) => {
      const source = hit._source as { id: string; title: string; type: string };
      return {
        id: source.id,
        title: source.title,
        type: source.type,
      };
    });
  } catch (error) {
    console.error("[Elasticsearch] Autocomplete failed:", error);
    throw error;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export { ELASTICSEARCH_INDEX };
