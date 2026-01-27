# Query Detection Standards

**Version**: 1.1.0
**Last Updated**: 2026-01-26
**Applies To**: ALL Digital Workplace AI Apps (dIQ, dCQ, dSQ)
**Status**: MANDATORY - These standards MUST be followed

---

## Overview

This document defines the global standards for query detection and semantic matching across all Digital Workplace AI applications. These standards prevent query collision, reduce false positives, and ensure consistent user experience.

**Reference Implementation**: `apps/support-iq/src/lib/semantic-matcher.ts`

---

## 1. Match Threshold

### Standard
| Setting | Value | Rationale |
|---------|-------|-----------|
| **Minimum Threshold** | **0.50 (50%)** | Prevents false positives |
| **Never Use** | < 0.50 | Causes query collision |

### Why 50%?
- 35% threshold caused "show team budget" to match "analytics dashboard"
- 50% threshold eliminates ambiguous matches while preserving valid ones
- Tested across 54+ query patterns with 100% accuracy

### Implementation
```typescript
const MATCH_THRESHOLD = 0.50; // NEVER lower than this

if (bestScore >= MATCH_THRESHOLD) {
  return match;
}
return null; // No match - let AI handle it
```

---

## 2. Compound Words

### Standard
All domain-specific multi-word phrases MUST be treated as compound words to prevent word-level collision.

### Why Compound Words?
Without compound words:
- "team budget" → tokens: ["team", "budget"]
- "analytics dashboard" → tokens: ["analytics", "dashboard"]
- Both share common patterns, causing false matches

With compound words:
- "team budget" → token: ["teambudget"]
- "analytics dashboard" → token: ["analyticsdashboard"]
- No collision possible

### Required Compound Words (Minimum)

```typescript
const COMPOUND_WORDS: Record<string, string> = {
  // Budget-related (PRIORITY - prevents analytics collision)
  'team budget': 'teambudget',
  'budget overview': 'budgetoverview',
  'budget allocation': 'budgetallocation',
  'budget status': 'budgetstatus',
  'budget utilization': 'budgetutilization',
  'budget tracking': 'budgettracking',
  'department budget': 'departmentbudget',
  'budget burn': 'budgetburn',
  'burn rate': 'burnrate',

  // Burndown variations
  'burn down': 'burndown',
  'sprint burndown': 'sprintburndown',
  'sprint burn down': 'sprintburndown',

  // Performance
  'top performers': 'topperformers',
  'bottom performers': 'bottomperformers',
  'team workload': 'teamworkload',
  'agent performance': 'agentperformance',
  'my performance': 'myperformance',

  // Code quality
  'code quality': 'codequality',
  'test coverage': 'testcoverage',
  'code coverage': 'codecoverage',
  'technical debt': 'technicaldebt',
  'tech debt': 'technicaldebt',
  'pull request': 'pullrequest',
  'code review': 'codereview',

  // Risk-related
  'customer risk': 'customerrisk',
  'churn risk': 'churnrisk',
  'at risk': 'atrisk',
  'risk analysis': 'riskanalysis',

  // Contract/Government
  'contract performance': 'contractperformance',
  'vendor compliance': 'vendorcompliance',
  'deliverable review': 'deliverablereview',
  'program health': 'programhealth',
  'stakeholder engagement': 'stakeholderengagement',

  // Resource/Capacity
  'resource capacity': 'resourcecapacity',
  'resource allocation': 'resourceallocation',
  'team velocity': 'teamvelocity',

  // Task management
  'task kanban': 'taskkanban',
  'kanban board': 'kanbanboard',
  'milestone tracking': 'milestonetracking',

  // Summary/Dashboard
  'executive summary': 'executivesummary',
  'analytics dashboard': 'analyticsdashboard',
  'detailed analytics': 'detailedanalytics',

  // Knowledge
  'knowledge base': 'knowledgebase',
  'knowledge article': 'knowledgearticle',
  'password reset': 'passwordreset',

  // Support
  'call prep': 'callprep',
  'similar tickets': 'similartickets',
  'ticket detail': 'ticketdetail',
  'ticket list': 'ticketlist',

  // Personal
  'my stats': 'mystats',
  'my dashboard': 'mydashboard',
  'my tickets': 'mytickets',
  'my workload': 'myworkload',

  // Updates
  'daily update': 'dailyupdate',
  'morning update': 'morningupdate',
  'status update': 'statusupdate',

  // Business
  'business review': 'businessreview',
  'product adoption': 'productadoption',
  'feature usage': 'featureusage',

  // SLA/Metrics
  'sla performance': 'slaperformance',
  'sla compliance': 'slacompliance',
  'dora metrics': 'dorametrics',

  // Customer
  'customer health': 'customerhealth',
  'customer success': 'customersuccess',

  // NPS & Sentiment (v1.1.0)
  'nps score': 'npsscore',
  'net promoter': 'netpromoter',
  'net promoter score': 'netpromoterscore',
  'sentiment analysis': 'sentimentanalysis',
  'customer sentiment': 'customersentiment',
  'customer feedback': 'customerfeedback',
  'promoter score': 'promoterscore',
  'survey results': 'surveyresults',
  'nps survey': 'npssurvey',
  'satisfaction score': 'satisfactionscore',
};
```

### Implementation
```typescript
function normalizeQuery(query: string): string {
  let normalized = query.toLowerCase().trim();

  // Replace compound words BEFORE splitting into tokens
  // Sort by length descending to match longer phrases first
  const sortedCompounds = Object.entries(COMPOUND_WORDS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [compound, replacement] of sortedCompounds) {
    normalized = normalized.replace(new RegExp(compound, 'gi'), replacement);
  }

  // Then tokenize...
  return normalized;
}
```

---

## 3. Key Term Handling

### Standard
- Define domain-specific key terms
- Apply **PENALTY** when query has a key term that target doesn't have
- Apply **BONUS** when key terms match
- Apply **EXTRA BONUS** when ALL query key terms are matched

### Key Terms (Minimum Set)
```typescript
const KEY_TERMS = [
  // Core entities
  'ticket', 'dashboard', 'performance', 'sprint', 'burndown',
  'status', 'team', 'workload', 'risk', 'compliance',

  // Integrations
  'zoho', 'desk',

  // Government/Contract
  'contract', 'deliverable', 'vendor', 'stakeholder', 'velocity',

  // Budget-specific (prevents analytics collision)
  'budget', 'allocation', 'utilization', 'spending', 'burn', 'rate',

  // Metrics
  'sla', 'dora', 'metric', 'kpi',

  // Support
  'agent', 'customer', 'escalation', 'resolution',

  // Project
  'milestone', 'blocker', 'kanban',

  // Code
  'code', 'review', 'quality', 'coverage', 'deployment',

  // Analytics (lower priority than specific terms)
  'analytics', 'summary', 'executive',

  // NPS & Sentiment (v1.1.0)
  'nps', 'promoter', 'sentiment', 'feedback', 'survey', 'satisfaction',
];
```

### Scoring Algorithm
```typescript
let keyTermBonus = 0;
let queryKeyTerms = 0;
let matchedKeyTerms = 0;

for (const term of KEY_TERMS) {
  const queryHasTerm = normalizedQuery.includes(term);
  const targetHasTerm = normalizedTarget.includes(term);

  if (queryHasTerm) {
    queryKeyTerms++;
    if (targetHasTerm) {
      matchedKeyTerms++;
      keyTermBonus += 0.12;  // BONUS for match
    } else {
      keyTermBonus -= 0.08;  // PENALTY for mismatch
    }
  }
}

// Extra bonus for matching ALL key terms in query
if (queryKeyTerms > 0 && matchedKeyTerms === queryKeyTerms) {
  keyTermBonus += 0.15;
}

// Clamp between 0 and 0.4
keyTermBonus = Math.max(0, Math.min(keyTermBonus, 0.4));
```

---

## 4. Stop Words

### Standard
- Do NOT remove meaningful action words
- Only remove true grammatical stop words

### Words to KEEP (Do NOT Remove)
```typescript
// These were previously removed, causing over-normalization
// KEEP THESE in the query:
'show', 'me', 'my', 'get', 'find', 'open', 'display'
```

### Words to Remove
```typescript
const STOP_WORDS = new Set([
  // Articles
  'the', 'a', 'an',

  // Verbs (generic)
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'must',

  // Prepositions
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'under',

  // Conjunctions
  'and', 'but', 'if', 'or', 'because', 'until', 'while',

  // Other
  'please', 'just', 'very', 'only', 'also',
  'i', 'we', 'our', 'you', 'your',
]);
```

### Why This Matters
- "show team budget" with 'show' removed → "team budget"
- "show analytics" with 'show' removed → "analytics"
- Both become too similar, causing collision
- Keeping 'show' preserves the action context

---

## 5. Algorithm Weights

### Standard Scoring Formula
```typescript
const finalScore =
  (jaccardScore * 0.35) +      // Token overlap
  (levenshteinScore * 0.15) +  // String similarity
  containmentBonus +            // Substring matching (0.25 max)
  keyTermBonus +                // Key term scoring (0.4 max)
  coverageBonus;                // Token coverage (0.15 max)

return Math.min(finalScore, 1.0);
```

### Component Breakdown
| Component | Weight | Purpose |
|-----------|--------|---------|
| **Jaccard** | 0.35 | Token set overlap |
| **Levenshtein** | 0.15 | Fuzzy string matching |
| **Containment** | 0.25 max | Substring bonus |
| **Key Terms** | 0.40 max | Domain-specific matching |
| **Coverage** | 0.15 max | Query token coverage |

---

## 6. Vector Embeddings (Preferred)

### Standard
When available, prefer real vector embeddings over text similarity.

### Current App Status
| App | Method | Status |
|-----|--------|--------|
| **dIQ** (Intranet IQ) | OpenAI text-embedding-3-small | Real embeddings |
| **dCQ** (Chat Core IQ) | OpenAI text-embedding-3-small | Real embeddings |
| **dSQ** (Support IQ) | Enhanced text matching | v1.2.4 fixed |

### Embedding Configuration
```typescript
// For apps using real embeddings
const EMBEDDING_CONFIG = {
  model: 'text-embedding-3-small',
  dimensions: 1536,
  provider: 'openai',
};
```

---

## 7. Testing & Validation

### Required Test Utility
Every app implementing query detection MUST have a validation function:

```typescript
function validateMatch(
  query: string,
  personaId: string,
  expectedWidgetType: string
): { success: boolean; actualWidgetType: string | null; score: number } {
  const match = findSemanticMatch(query, personaId);
  const debug = debugSemanticMatch(query, personaId);
  const topMatch = debug[0];

  return {
    success: match?.widgetType === expectedWidgetType,
    actualWidgetType: match?.widgetType || null,
    score: topMatch?.score || 0,
  };
}
```

### Debug Function
```typescript
function debugSemanticMatch(
  query: string,
  personaId: string
): { pattern: string; score: number; example: string; widgetType: string }[] {
  // Returns all patterns sorted by score for debugging
}
```

### Test Coverage Requirements
- Test ALL query patterns against expected widgets
- Verify no false positives (wrong widget for query)
- Verify no false negatives (no match when should match)
- Document any edge cases

---

## 8. Implementation Checklist

### For New Apps
- [ ] Set match threshold to 0.50 minimum
- [ ] Implement compound word normalization
- [ ] Define domain-specific key terms
- [ ] Configure stop words (keep action words)
- [ ] Implement scoring algorithm with correct weights
- [ ] Add `validateMatch()` test utility
- [ ] Test all query patterns

### For Existing Apps
- [ ] Audit current match threshold (raise if < 0.50)
- [ ] Add missing compound words
- [ ] Add key term penalty system
- [ ] Remove action words from stop words
- [ ] Verify algorithm weights
- [ ] Run full spectrum test

---

## 9. File Locations

### Reference Implementation
```
/apps/support-iq/src/lib/semantic-matcher.ts    # Full implementation
/apps/support-iq/src/lib/semantic-query-patterns.ts  # Pattern definitions
```

### This Document
```
/docs/QUERY_DETECTION_STANDARDS.md   # This file (canonical)
```

### Related Documents
```
/docs/PGVECTOR_BEST_PRACTICES.md     # Vector embedding standards
/docs/SUPABASE_DATABASE_REFERENCE.md # Database schema
/CLAUDE.md                           # Root project instructions
```

---

## 10. Deployment & Cache Configuration

### Cache Prevention (CRITICAL)

**Problem**: After deploying code changes, users may see stale content due to browser caching.

**Solution**: All Digital Workplace AI apps MUST configure cache-busting headers.

### Required Configuration (`next.config.ts`)

```typescript
const nextConfig: NextConfig = {
  // Force cache busting on each build - prevents stale JavaScript
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  // Cache control headers - prevent browser caching of HTML pages
  async headers() {
    return [
      // ... other headers (security, etc.)
      {
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
};
```

### What Gets Cached (Intentionally)
| Path Pattern | Caching | Reason |
|--------------|---------|--------|
| `_next/static/*` | ✅ Cached | Hashed JS/CSS bundles (content-addressable) |
| `_next/image/*` | ✅ Cached | Optimized images |
| `favicon.ico` | ✅ Cached | Static icon |

### What Does NOT Get Cached
| Path Pattern | Caching | Reason |
|--------------|---------|--------|
| All other routes | ❌ No cache | Fresh content on every request |
| HTML pages | ❌ No cache | Always get latest deployment |
| API routes | ❌ No cache | Real-time data |

### App Status
| App | Config File | Status |
|-----|-------------|--------|
| **Main** | `apps/main/next.config.ts` | ✅ Configured |
| **dSQ** | `apps/support-iq/next.config.ts` | ✅ Configured |
| **dIQ** | `apps/intranet-iq/next.config.ts` | ✅ Configured |
| **dCQ** | `apps/chat-core-iq/next.config.ts` | ✅ Configured |

### Verification
```bash
# Check response headers for no-cache
curl -I https://dsq.digitalworkplace.ai/dsq/demo/atc-executive

# Expected header:
# cache-control: no-store, must-revalidate
# or: cache-control: public, max-age=0, must-revalidate
```

---

## 11. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-01-26 | Added Section 10: Deployment & Cache Configuration |
| 1.1.0 | 2026-01-26 | Added NPS & Sentiment compound words and key terms (dSQ v1.2.5) |
| 1.0.0 | 2026-01-26 | Initial release - extracted from dSQ v1.2.4 fix |

---

## Quick Reference Card

```
QUERY DETECTION STANDARDS - QUICK REFERENCE
============================================

THRESHOLD:     0.50 (50%) minimum - NEVER lower
COMPOUNDS:     Multi-word phrases → single tokens
KEY TERMS:     +0.12 match, -0.08 mismatch, +0.15 all matched
STOP WORDS:    KEEP: show, me, my, get, find, open, display
WEIGHTS:       jaccard(0.35) + levenshtein(0.15) + containment + keyTerms + coverage

REFERENCE:     apps/support-iq/src/lib/semantic-matcher.ts
```

---

*Maintained by: Digital Workplace AI Team*
*Contact: See root CLAUDE.md for project contacts*
