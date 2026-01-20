# Elasticsearch Setup for dIQ

This document describes how to set up and use Elasticsearch for the dIQ enterprise search feature.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed
- dIQ project dependencies installed (`npm install`)

## Quick Start

### 1. Start Elasticsearch

```bash
cd /Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq

# Start Elasticsearch and Kibana
docker compose -f docker-compose.elasticsearch.yml up -d

# Check status
docker compose -f docker-compose.elasticsearch.yml ps
```

Wait for Elasticsearch to be ready (health check should pass):
```bash
curl http://localhost:9200/_cluster/health
```

### 2. Create Index and Sync Content

Start the dev server and use the API:

```bash
# Start dev server
npm run dev
```

Then create the index and sync content:

```bash
# Create index with mappings
curl -X POST http://localhost:3001/diq/api/elasticsearch/index \
  -H "Content-Type: application/json" \
  -d '{"action": "create-index"}'

# Full sync from Supabase
curl -X POST http://localhost:3001/diq/api/elasticsearch/index \
  -H "Content-Type: application/json" \
  -d '{"action": "full-sync"}'

# Or generate demo content (PRD: 100-500 items)
curl -X POST http://localhost:3001/diq/api/elasticsearch/index \
  -H "Content-Type: application/json" \
  -d '{"action": "generate-demo", "options": {"count": 200}}'
```

### 3. Test Search

```bash
# Test search
curl -X POST http://localhost:3001/diq/api/elasticsearch/search \
  -H "Content-Type: application/json" \
  -d '{"query": "company policies"}'
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         dIQ Search Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Query                                                      │
│      │                                                           │
│      ▼                                                           │
│  ┌─────────────────────────────────────────────┐                │
│  │            /api/search                       │                │
│  │  1. Check if Elasticsearch available         │                │
│  │  2. Route to ES or Supabase                  │                │
│  └─────────────────────────────────────────────┘                │
│      │                          │                                │
│      ▼                          ▼                                │
│  ┌──────────────┐        ┌──────────────┐                       │
│  │ Elasticsearch │        │   Supabase   │                       │
│  │   (Primary)   │        │  (Fallback)  │                       │
│  └──────────────┘        └──────────────┘                       │
│      │                          │                                │
│      │    ┌─────────────────────┘                                │
│      ▼    ▼                                                      │
│  ┌─────────────────────────────────────────────┐                │
│  │           OpenAI Embeddings                  │                │
│  │     (for semantic/hybrid search)             │                │
│  └─────────────────────────────────────────────┘                │
│      │                                                           │
│      ▼                                                           │
│  ┌─────────────────────────────────────────────┐                │
│  │           Claude AI Summary                  │                │
│  │     (optional, if ANTHROPIC_API_KEY set)     │                │
│  └─────────────────────────────────────────────┘                │
│      │                                                           │
│      ▼                                                           │
│  Search Results with:                                            │
│  - Relevance scores                                              │
│  - Highlighted matches                                           │
│  - Faceted aggregations                                          │
│  - AI-powered summary                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## API Reference

### Search API

**POST /api/elasticsearch/search**

```json
{
  "query": "search terms",
  "searchMode": "hybrid",       // "keyword", "semantic", "hybrid"
  "types": ["article", "faq"],  // Filter by content type
  "categories": ["HR"],         // Filter by category
  "departments": ["Engineering"], // Filter by department
  "page": 1,
  "pageSize": 20,
  "sort": "relevance",          // "relevance", "date_desc", "date_asc"
  "hybridWeight": 0.5           // 0-1, weight for semantic vs keyword
}
```

**Response:**
```json
{
  "success": true,
  "query": "search terms",
  "searchMethod": "hybrid",
  "results": [...],
  "total": 42,
  "took": 15,
  "aggregations": {
    "types": [{"key": "article", "count": 30}],
    "categories": [{"key": "HR", "count": 15}]
  },
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 3,
    "hasMore": true
  },
  "aiSummary": "Based on your search..."
}
```

### Autocomplete API

**GET /api/elasticsearch/search?q=comp&types=article,faq&limit=10**

```json
{
  "success": true,
  "suggestions": [
    {"id": "article-1", "title": "Company Policies", "type": "article"},
    {"id": "faq-2", "title": "Company Benefits FAQ", "type": "faq"}
  ]
}
```

### Index Management API

**GET /api/elasticsearch/index** - Get index stats

**POST /api/elasticsearch/index** - Index operations

| Action | Description |
|--------|-------------|
| `create-index` | Create index with mappings |
| `delete-index` | Delete the index |
| `full-sync` | Sync all content from Supabase |
| `index-item` | Index a single item |
| `remove-item` | Remove a single item |
| `generate-demo` | Generate demo content |
| `stats` | Get index statistics |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ELASTICSEARCH_URL` | Elasticsearch server URL | `http://localhost:9200` |
| `ELASTICSEARCH_API_KEY` | API key for cloud deployment | - |
| `ELASTICSEARCH_INDEX` | Index name | `diq-content` |

## Content Types

The following content types are indexed:

| Type | Source Table | Description |
|------|--------------|-------------|
| `article` | `diq.articles` | Knowledge base articles |
| `faq` | `knowledge_items` | FAQ entries |
| `news` | `diq.news_posts` | Company news |
| `event` | `diq.events` | Calendar events |
| `employee` | `diq.employees` | People directory |
| `workflow` | `diq.workflows` | Automation workflows |
| `document` | `knowledge_items` | General documents |

## Search Modes

### Keyword Search
Traditional full-text search using Elasticsearch's BM25 algorithm with:
- Multi-field matching (title, content, tags)
- Fuzzy matching for typos
- Edge n-gram for autocomplete

### Semantic Search
AI-powered semantic understanding using:
- OpenAI embeddings (text-embedding-3-small, 1536 dimensions)
- Cosine similarity scoring
- Dense vector search in Elasticsearch

### Hybrid Search (Recommended)
Combines keyword and semantic search:
- Configurable weight between modes
- Best of both approaches
- Default: 50% keyword, 50% semantic

## Troubleshooting

### Elasticsearch not starting
```bash
# Check logs
docker compose -f docker-compose.elasticsearch.yml logs elasticsearch

# Common fix: increase Docker memory
# Docker Desktop > Settings > Resources > Memory: 4GB+
```

### Index not found
```bash
# Create index first
curl -X POST http://localhost:3001/diq/api/elasticsearch/index \
  -H "Content-Type: application/json" \
  -d '{"action": "create-index"}'
```

### Search returns empty
```bash
# Check index stats
curl http://localhost:3001/diq/api/elasticsearch/index

# Sync content
curl -X POST http://localhost:3001/diq/api/elasticsearch/index \
  -H "Content-Type: application/json" \
  -d '{"action": "full-sync"}'
```

## Production Deployment

For production, consider using:

1. **Elastic Cloud** - Managed Elasticsearch service
2. **AWS OpenSearch** - AWS-managed alternative
3. **Self-hosted cluster** - Multi-node setup for HA

Update environment variables:
```env
ELASTICSEARCH_URL=https://your-cluster.es.cloud.es.io:9243
ELASTICSEARCH_API_KEY=your-base64-api-key
```
