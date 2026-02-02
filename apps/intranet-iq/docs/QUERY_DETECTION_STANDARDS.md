# dIQ - Query Detection Standards

**Version**: 2.7.3
**Last Updated**: 2026-02-02
**Applies To**: Intranet IQ (dIQ) Application
**Parent Document**: `/docs/QUERY_DETECTION_STANDARDS.md` (Global Standards)
**Status**: ACTIVE
**Integration**: Full Ecosystem Search (11 Apps) - 100% Integration Score
**Audit Status**: Verified (14 browser tests passed, all source filters functional)

---

## Overview

This document defines dIQ-specific query detection and semantic matching standards. It extends the global Query Detection Standards with Intranet IQ-specific configurations.

**Global Standards Reference**: `/docs/QUERY_DETECTION_STANDARDS.md`

---

## 1. dIQ Implementation Status

| Feature | Status | Implementation |
|---------|--------|----------------|
| **Vector Embeddings** | Active | OpenAI text-embedding-3-small |
| **Semantic Search** | Active | Elasticsearch + pgvector |
| **Match Threshold** | 0.50 | Per global standards |
| **Embedding Dimensions** | 1536 | Standard |

### Embedding Coverage
- **Knowledge Base Articles**: 212 articles (100% coverage)
- **News Posts**: 61 posts (indexed)
- **Events**: 49 events (indexed)
- **Employee Directory**: 60 employees (indexed)

---

## 2. dIQ-Specific Compound Words

In addition to global compound words, dIQ uses these domain-specific phrases:

```typescript
const DIQ_COMPOUND_WORDS: Record<string, string> = {
  // Knowledge Base
  'knowledge base': 'knowledgebase',
  'knowledge article': 'knowledgearticle',
  'kb article': 'kbarticle',
  'help article': 'helparticle',
  'how to': 'howto',

  // Employee/HR
  'employee directory': 'employeedirectory',
  'org chart': 'orgchart',
  'organization chart': 'organizationchart',
  'team member': 'teammember',
  'employee handbook': 'employeehandbook',
  'vacation policy': 'vacationpolicy',
  'pto policy': 'ptopolicy',
  'remote work': 'remotework',
  'work from home': 'workfromhome',
  'benefits enrollment': 'benefitsenrollment',

  // Workflows/Agents
  'workflow template': 'workflowtemplate',
  'agentic workflow': 'agenticworkflow',
  'approval workflow': 'approvalworkflow',
  'automation rule': 'automationrule',
  'pto request': 'ptorequest',
  'expense report': 'expensereport',
  'access request': 'accessrequest',

  // Content Types
  'news post': 'newspost',
  'company announcement': 'companyannouncement',
  'team update': 'teamupdate',
  'channel message': 'channelmessage',

  // AI Features
  'ai assistant': 'aiassistant',
  'ai chat': 'aichat',
  'ai summary': 'aisummary',
  'ai search': 'aisearch',

  // My Day / Productivity
  'my day': 'myday',
  'daily briefing': 'dailybriefing',
  'task list': 'tasklist',
  'to do': 'todo',
  'due today': 'duetoday',

  // Admin
  'user role': 'userrole',
  'permission group': 'permissiongroup',
  'audit log': 'auditlog',
  'system health': 'systemhealth',

  // Framework Hub
  'framework hub': 'frameworkhub',
  'best practices': 'bestpractices',
  'design pattern': 'designpattern',
  'api guidelines': 'apiguidelines',
};
```

---

## 3. dIQ-Specific Key Terms

```typescript
const DIQ_KEY_TERMS = [
  // Core Entities
  'article', 'knowledge', 'kb', 'content', 'document',
  'employee', 'directory', 'people', 'team', 'department',
  'news', 'event', 'channel', 'announcement',
  'workflow', 'agent', 'automation', 'approval',

  // Actions
  'search', 'find', 'browse', 'view', 'read', 'edit',
  'create', 'publish', 'approve', 'submit',

  // HR/Policy
  'policy', 'handbook', 'benefits', 'pto', 'vacation',
  'onboarding', 'offboarding', 'training',

  // AI Features
  'ai', 'assistant', 'chat', 'summarize', 'brief',

  // Admin
  'admin', 'permission', 'role', 'setting', 'analytics',

  // Framework
  'framework', 'pattern', 'guideline', 'standard',
];
```

---

## 4. Search API Integration

### Enterprise Search (`/api/search`)

dIQ uses a hybrid search combining:
1. **Keyword Search** - Elasticsearch full-text
2. **Semantic Search** - pgvector embeddings
3. **Federated Search** - External connectors (Confluence, SharePoint, etc.)

```typescript
// Search configuration
const SEARCH_CONFIG = {
  // Weights for result scoring
  keywordWeight: 0.4,
  semanticWeight: 0.6,

  // Minimum scores
  keywordThreshold: 0.3,
  semanticThreshold: 0.5,  // Per global standard

  // Result limits
  maxResults: 50,
  federatedTimeout: 5000,  // 5 seconds
};
```

### AI Summarization (`/api/search/summarize`)

Uses Claude (Anthropic) for result summarization:
- Model: claude-sonnet-4-20250514
- Max tokens: 256
- Temperature: 0.3 (deterministic)

---

## 5. Content Indexing

### Elasticsearch Configuration

dIQ indexes content to Elasticsearch for fast retrieval:

| Index | Documents | Fields |
|-------|-----------|--------|
| `diq_articles` | 212 | title, content, summary, tags |
| `diq_employees` | 60 | name, title, department, skills |
| `diq_news` | 61 | title, content, author |
| `diq_events` | 49 | title, description, date |

### Vector Embedding Storage

Embeddings stored in Supabase pgvector:

```sql
-- Article embeddings
CREATE TABLE diq.article_embeddings (
  id UUID PRIMARY KEY,
  article_id UUID REFERENCES diq.articles(id),
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search index
CREATE INDEX ON diq.article_embeddings USING ivfflat (embedding vector_cosine_ops);
```

---

## 6. AI Assistant Query Handling

The AI Assistant (`/diq/chat`) uses function calling for structured queries:

### Supported Functions
| Function | Description | Triggers |
|----------|-------------|----------|
| `search_knowledge_base` | KB article search | "find article about...", "search kb..." |
| `search_people` | Employee lookup | "who is...", "find employee..." |
| `get_events` | Event retrieval | "upcoming events", "events this week" |
| `get_news` | News retrieval | "latest news", "company announcements" |
| `execute_workflow` | Trigger workflow | "submit PTO", "request access" |

### RAG Configuration

```typescript
const RAG_CONFIG = {
  // Context window
  maxContextChunks: 5,
  chunkSize: 500,
  overlapSize: 50,

  // Source citation
  includeSourceLinks: true,
  maxSourcesShown: 3,

  // Confidence
  minimumConfidence: 0.6,
  showConfidenceScore: true,
};
```

---

## 7. Testing & Validation

### Required Test Queries

Test these queries against expected results:

```typescript
const DIQ_TEST_QUERIES = [
  // Knowledge Base
  { query: "vacation policy", expected: "kb_article" },
  { query: "employee handbook", expected: "kb_article" },
  { query: "how to reset password", expected: "kb_article" },

  // People Search
  { query: "who is the engineering lead", expected: "employee" },
  { query: "find sarah from marketing", expected: "employee" },

  // Events
  { query: "upcoming team events", expected: "event" },
  { query: "town hall meeting", expected: "event" },

  // News
  { query: "latest company news", expected: "news" },
  { query: "recent announcements", expected: "news" },

  // Workflows
  { query: "submit PTO request", expected: "workflow" },
  { query: "request software access", expected: "workflow" },
];
```

### Validation Script

```bash
# Run query detection tests
curl -X POST http://localhost:3001/diq/api/search/validate \
  -H "Content-Type: application/json" \
  -d '{"queries": [...testQueries]}'
```

---

## 8. Performance Metrics

### Target SLAs

| Metric | Target | Current |
|--------|--------|---------|
| Search Response Time | < 200ms | ~150ms |
| Semantic Match Time | < 100ms | ~80ms |
| AI Summary Generation | < 3s | ~2s |
| Federated Search | < 5s | ~3s |

### Monitoring

```typescript
// Track search performance
const searchMetrics = {
  totalQueries: counter('diq_search_total'),
  responseTime: histogram('diq_search_duration_ms'),
  semanticScore: histogram('diq_semantic_score'),
  resultCount: histogram('diq_result_count'),
};
```

---

## 9. File Locations

### Implementation Files

```
/apps/intranet-iq/src/lib/
├── elasticsearch.ts           # ES client & queries
├── embeddings.ts             # Vector embedding generation
├── search/
│   └── federated-search.ts   # Connector aggregation
└── ai/
    └── anthropic.ts          # Claude integration

/apps/intranet-iq/src/app/api/search/
├── route.ts                  # Main search endpoint
├── summarize/route.ts        # AI summarization
├── autocomplete/route.ts     # Search suggestions
└── federated/route.ts        # External sources
```

### Configuration Files

```
/apps/intranet-iq/
├── CLAUDE.md                 # Project instructions
├── docs/QUERY_DETECTION_STANDARDS.md  # This file
└── docs/ELASTICSEARCH_SETUP.md        # ES setup guide
```

---

## 10. Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Low relevance scores | Missing embeddings | Re-index articles |
| Slow search | ES not optimized | Check index settings |
| No AI summary | API key missing | Check ANTHROPIC_API_KEY |
| Federated timeout | Connector down | Check connector health |

### Debug Commands

```bash
# Check ES health
curl http://localhost:9200/_cluster/health

# Check embedding count
curl http://localhost:3001/diq/api/admin/stats | jq '.embeddings'

# Test semantic match
curl -X POST http://localhost:3001/diq/api/search \
  -d '{"query": "vacation policy", "debug": true}'
```

---

## 11. Chat AI App Filter (v2.7.0)

### App-Specific Query UI

The Chat AI now supports filtering queries by specific app sources:

```typescript
// App filter options
const APP_FILTER_OPTIONS = [
  { id: 'all', name: 'All Apps', icon: Grid3X3 },
  { id: 'diq', name: 'dIQ Knowledge', icon: FileText },
  { id: 'slack', name: 'Slack', icon: MessageSquare },
  { id: 'jira', name: 'Jira', icon: Target },
  { id: 'github', name: 'GitHub', icon: GitBranch },
  { id: 'drive', name: 'Google Drive', icon: Folder },
  { id: 'zoom', name: 'Zoom', icon: Video },
  { id: 'confluence', name: 'Confluence', icon: BookOpen },
  { id: 'salesforce', name: 'Salesforce', icon: Cloud },
  { id: 'figma', name: 'Figma', icon: Palette },
  { id: 'notion', name: 'Notion', icon: StickyNote },
  { id: 'linkedin', name: 'LinkedIn', icon: Briefcase },
];
```

### App Context Injection

The AI system prompt now includes dynamic workspace stats:

```typescript
// Context injected into system prompt
const appContext = getContextForChat(query, { appFilter: selectedAppFilter });

// System prompt includes:
// - Slack: X unread messages, Y channels
// - Jira: X open tickets, Y in progress
// - GitHub: X open PRs, Y awaiting review
// - Zoom: X upcoming meetings
```

### Source Attribution

All AI responses now include app-specific source badges:

| Source Type | Icon | Color |
|-------------|------|-------|
| diq | FileText | #10b981 |
| slack | MessageSquare | #4A154B |
| jira | Target | #0052CC |
| github | GitBranch | #24292e |
| drive | Folder | #4285F4 |
| zoom | Video | #2D8CFF |
| confluence | BookOpen | #172B4D |
| salesforce | Cloud | #00A1E0 |
| figma | Palette | #F24E1E |
| notion | StickyNote | #000000 |
| linkedin | Briefcase | #0077B5 |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.7.0 | 2026-02-02 | Chat AI app filter, source attribution, 100% integration |
| 2.0.0 | 2026-02-02 | Full ecosystem search (10 apps) |
| 1.0.0 | 2026-01-29 | Initial release with dIQ-specific standards |

---

**Parent Document**: `/docs/QUERY_DETECTION_STANDARDS.md`
**Maintained by**: Digital Workplace AI Team
