# Supabase Database Reference - All Projects

---
## ⚠️ MASTER DATABASE REFERENCE (SINGLE SOURCE OF TRUTH)
---

**This document is the de facto standard for ALL Digital Workplace AI projects.**

Every subproject MUST reference this document. All database schemas, tables, and cross-project integrations are defined here.

### Projects Using This Database

| Project | Schema | Port | Status | CLAUDE.md |
|---------|--------|------|--------|-----------|
| **Main Dashboard** | `public` | 3000 | ✅ Active | `apps/main/CLAUDE.md` |
| **dIQ - Intranet IQ** | `diq` | 3001 | ✅ Active | `apps/intranet-iq/CLAUDE.md` |
| **dCQ - Chat Core IQ** | `dcq` | 3002 | ✅ Active | `apps/chat-core-iq/CLAUDE.md` |
| **dSQ - Support IQ** | `dsq` | 3003 | ⬜ Pending | `apps/support-iq/CLAUDE.md` |
| **dTQ - Test Pilot IQ** | `dtq` | 3004 | ⬜ Pending | `apps/test-pilot-iq/CLAUDE.md` |

### How Projects Are Interlinked

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                    ALL PROJECTS INTERLINKED VIA SUPABASE                            │
│                                                                                     │
│                         ┌─────────────────────────────┐                            │
│                         │    public.knowledge_items    │                            │
│                         │  ═══════════════════════════ │                            │
│                         │  CROSS-PROJECT SEARCH HUB   │                            │
│                         │  • Stores ALL searchable    │                            │
│                         │    content from ALL projects│                            │
│                         │  • embedding vector(384)    │                            │
│                         │  • Full-text search index   │                            │
│                         └──────────────┬──────────────┘                            │
│                                        │                                            │
│         ┌──────────────┬───────────────┼───────────────┬──────────────┐            │
│         │              │               │               │              │            │
│         ▼              ▼               ▼               ▼              ▼            │
│    ┌─────────┐   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐        │
│    │   dIQ   │   │   dSQ   │    │   dTQ   │    │   dCQ   │    │  FUTURE │        │
│    │ SCHEMA  │   │ SCHEMA  │    │ SCHEMA  │    │ SCHEMA  │    │ PROJECTS│        │
│    ├─────────┤   ├─────────┤    ├─────────┤    ├─────────┤    ├─────────┤        │
│    │articles │   │tickets  │    │test_cases│   │faqs     │    │   ...   │        │
│    │   ↓     │   │   ↓     │    │    ↓    │    │   ↓     │    │         │        │
│    │ SYNC    │   │ SYNC    │    │  SYNC   │    │ SYNC    │    │         │        │
│    └────┬────┘   └────┬────┘    └────┬────┘    └────┬────┘    └─────────┘        │
│         │              │               │               │                          │
│         └──────────────┴───────────────┴───────────────┘                          │
│                                  │                                                 │
│                                  ▼                                                 │
│                    ┌─────────────────────────────┐                                │
│                    │  UNIFIED SEARCH RESULTS     │                                │
│                    │  Query: "remote work policy"│                                │
│                    │  ├── dIQ article (0.89)     │                                │
│                    │  ├── dSQ FAQ (0.76)         │                                │
│                    │  └── dCQ intent (0.71)      │                                │
│                    └─────────────────────────────┘                                │
└────────────────────────────────────────────────────────────────────────────────────┘
```

### Interlinking Rules

1. **Every project has its own schema** (e.g., `diq`, `dsq`, `dtq`, `dcq`)
2. **Shared data lives in `public` schema** (users, projects, organizations)
3. **Searchable content syncs to `public.knowledge_items`** via triggers
4. **Cross-project search** queries `knowledge_items` with optional project filtering
5. **Same embedding model** (all-MiniLM-L6-v2, 384 dims) across ALL projects

---

## Overview

This document provides a complete reference for all Digital Workplace AI project databases in Supabase, including cross-project vector search integration.

**Current Status:** January 19, 2025
**Embedding Model:** all-MiniLM-L6-v2 (384 dimensions)
**Provider:** Local (transformers.js) - FREE

---

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Public Schema (Shared)](#public-schema-shared)
3. [dIQ - Intranet IQ](#diq---intranet-iq)
4. [dSQ - Support IQ](#dsq---support-iq)
5. [dTQ - Test Pilot IQ](#dtq---test-pilot-iq)
6. [dCQ - Chat Core IQ](#dcq---chat-core-iq)
7. [Cross-Project Vector Search](#cross-project-vector-search)
8. [Migration Templates](#migration-templates)
9. [Implementation Status](#implementation-status)

---

## Database Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE DATABASE STRUCTURE                              │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                      PUBLIC SCHEMA (Shared Core)                            ││
│  │                                                                             ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────────────┐ ││
│  │  │organizations│  │  projects   │  │          knowledge_items            │ ││
│  │  └─────────────┘  │  (dIQ,dSQ,  │  │  ┌─────────────────────────────────┐│ ││
│  │        │          │   dTQ,dCQ)  │  │  │ id, project_id, source_table,  ││ ││
│  │        │          └──────┬──────┘  │  │ source_id, title, content,     ││ ││
│  │        │                 │         │  │ embedding vector(384) ← VECTOR ││ ││
│  │        ▼                 │         │  │ searchable tsvector            ││ ││
│  │  ┌─────────────┐        │         │  └─────────────────────────────────┘│ ││
│  │  │   users     │◄───────┤         │       CROSS-PROJECT SEARCH HUB      │ ││
│  │  └─────────────┘        │         └─────────────────────────────────────┘ ││
│  │        │                │                          ▲                       ││
│  │        ▼                │         ┌────────────────┼────────────────┐     ││
│  │  ┌─────────────────┐    │         │                │                │     ││
│  │  │user_project_    │◄───┘    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐ ││
│  │  │    access       │         │  SYNC   │     │  SYNC   │     │  SYNC   │ ││
│  │  └─────────────────┘         └────┬────┘     └────┬────┘     └────┬────┘ ││
│  │                                   │               │               │       ││
│  └───────────────────────────────────┼───────────────┼───────────────┼───────┘│
│                                      │               │               │        │
│  ┌───────────────────┐  ┌───────────┴─────┐  ┌─────┴───────┐  ┌────┴──────┐ │
│  │   diq SCHEMA      │  │   dsq SCHEMA    │  │ dtq SCHEMA  │  │dcq SCHEMA │ │
│  │                   │  │                 │  │             │  │           │ │
│  │ • departments     │  │ • tickets       │  │ • projects  │  │ • bots    │ │
│  │ • employees       │  │ • conversations │  │ • test_cases│  │ • intents │ │
│  │ • articles ←VEC   │  │ • kb_articles   │  │ • test_runs │  │ • faqs    │ │
│  │ • chat_threads    │  │ • customers     │  │ • defects   │  │ • convos  │ │
│  │ • chat_messages   │  │ • agents        │  │ • reports   │  │ • analytics│ │
│  │ • workflows       │  │ • escalations   │  │ • suites    │  │           │ │
│  │ • news_posts      │  │ • analytics     │  │             │  │           │ │
│  │ • events          │  │                 │  │             │  │           │ │
│  └───────────────────┘  └─────────────────┘  └─────────────┘  └───────────┘ │
│                                                                              │
│  VEC = Has embedding column for semantic search                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Public Schema (Shared)

All projects share these core tables.

### organizations
```sql
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### projects
```sql
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,  -- 'dIQ', 'dSQ', 'dTQ', 'dCQ'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color_primary VARCHAR(7),
    color_secondary VARCHAR(7),
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-seeded data:
-- | code | name           | color_primary | color_secondary |
-- |------|----------------|---------------|-----------------|
-- | dIQ  | Intranet IQ    | #3b82f6       | #8b5cf6         |
-- | dSQ  | Support IQ     | #10b981       | #06b6d4         |
-- | dTQ  | Test Pilot IQ  | #f59e0b       | #ef4444         |
-- | dCQ  | Chat Core IQ   | #a855f7       | #ec4899         |
```

### users
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',  -- user, admin, super_admin
    organization_id UUID REFERENCES public.organizations(id),
    settings JSONB DEFAULT '{}',
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_project_access
```sql
CREATE TABLE public.user_project_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'viewer',  -- viewer, editor, admin
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES public.users(id),
    UNIQUE(user_id, project_id)
);
```

### knowledge_items (VECTOR SEARCH HUB)
```sql
CREATE TABLE public.knowledge_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    source_table VARCHAR(100) NOT NULL,  -- 'diq.articles', 'dsq.kb_articles', etc.
    source_id UUID NOT NULL,
    item_type VARCHAR(50) NOT NULL,       -- 'article', 'faq', 'ticket', etc.
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    searchable TSVECTOR,                  -- Full-text search
    embedding vector(384),                -- Semantic search ← VECTOR COLUMN
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_table, source_id)
);

-- Indexes
CREATE INDEX idx_knowledge_items_searchable ON public.knowledge_items USING GIN(searchable);
CREATE INDEX idx_knowledge_items_tags ON public.knowledge_items USING GIN(tags);
CREATE INDEX idx_knowledge_items_embedding ON public.knowledge_items
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
```

### activity_log
```sql
CREATE TABLE public.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    project_id UUID REFERENCES public.projects(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### integrations
```sql
CREATE TABLE public.integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id),
    organization_id UUID REFERENCES public.organizations(id),
    type VARCHAR(100) NOT NULL,  -- 'elasticsearch', 'openai', 'slack'
    name VARCHAR(255) NOT NULL,
    config JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'inactive',
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## dIQ - Intranet IQ

**Schema:** `diq`
**Status:** ✅ COMPLETE (Embeddings Working)
**Purpose:** AI-powered internal knowledge network

### Tables

| Table | Description | Has Embedding | Syncs to knowledge_items |
|-------|-------------|---------------|--------------------------|
| `departments` | Org structure | No | No |
| `employees` | User profiles | No | No |
| `kb_categories` | KB hierarchy | No | No |
| `articles` | Knowledge articles | ✅ Yes (384 dims) | ✅ Yes |
| `article_versions` | Version history | No | No |
| `chat_threads` | AI conversations | No | No |
| `chat_messages` | Chat messages | Optional | No |
| `search_history` | Query analytics | No | No |
| `workflows` | Automation flows | No | No |
| `workflow_steps` | Flow steps | No | No |
| `workflow_executions` | Run history | No | No |
| `news_posts` | News feed | Optional | Optional |
| `news_comments` | Comments | No | No |
| `events` | Calendar events | Optional | Optional |
| `event_rsvps` | RSVPs | No | No |
| `bookmarks` | Saved items | No | No |
| `user_settings` | Preferences | No | No |

### Key Tables Detail

#### diq.articles
```sql
CREATE TABLE diq.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES diq.kb_categories(id),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    author_id UUID NOT NULL REFERENCES public.users(id),
    status VARCHAR(50) DEFAULT 'draft',  -- draft, pending_review, published, archived
    published_at TIMESTAMPTZ,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    view_count INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    embedding vector(384),               -- ← VECTOR COLUMN
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW Index for semantic search
CREATE INDEX idx_diq_articles_embedding ON diq.articles
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
```

#### diq.chat_threads
```sql
CREATE TABLE diq.chat_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    llm_model VARCHAR(100) DEFAULT 'gpt-4',
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### diq.chat_messages
```sql
CREATE TABLE diq.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES diq.chat_threads(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,  -- user, assistant, system
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]',
    confidence DECIMAL(3,2),
    tokens_used INT,
    llm_model VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    embedding vector(384),      -- Optional for RAG
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## dSQ - Support IQ

**Schema:** `dsq`
**Status:** ⬜ PENDING
**Purpose:** Customer support automation

### Proposed Tables

| Table | Description | Has Embedding | Syncs to knowledge_items |
|-------|-------------|---------------|--------------------------|
| `customers` | Customer profiles | No | No |
| `tickets` | Support tickets | ✅ Yes | ✅ Yes |
| `ticket_messages` | Ticket replies | Optional | No |
| `conversations` | Chat sessions | No | No |
| `conversation_messages` | Chat messages | Optional | No |
| `kb_categories` | FAQ categories | No | No |
| `kb_articles` | FAQ/Help articles | ✅ Yes | ✅ Yes |
| `agents` | Support agents | No | No |
| `escalations` | Escalation rules | No | No |
| `canned_responses` | Template replies | ✅ Yes | No |
| `tags` | Ticket tags | No | No |
| `sla_policies` | SLA definitions | No | No |
| `analytics` | Metrics data | No | No |

### Key Tables SQL

```sql
-- Create schema
CREATE SCHEMA IF NOT EXISTS dsq;

-- Customers
CREATE TABLE dsq.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets (with embedding)
CREATE TABLE dsq.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES dsq.customers(id),
    assigned_agent_id UUID REFERENCES public.users(id),
    subject VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',  -- open, pending, resolved, closed
    priority VARCHAR(20) DEFAULT 'medium',  -- low, medium, high, urgent
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    embedding vector(384),              -- ← VECTOR COLUMN
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_dsq_tickets_embedding ON dsq.tickets
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- KB Articles (with embedding)
CREATE TABLE dsq.kb_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    is_public BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'published',
    view_count INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    embedding vector(384),              -- ← VECTOR COLUMN
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dsq_kb_articles_embedding ON dsq.kb_articles
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Canned Responses (with embedding for smart suggestions)
CREATE TABLE dsq.canned_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    shortcut VARCHAR(50),
    usage_count INT DEFAULT 0,
    embedding vector(384),              -- ← VECTOR COLUMN
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## dTQ - Test Pilot IQ

**Schema:** `dtq`
**Status:** ⬜ PENDING
**Purpose:** QA & testing intelligence

### Proposed Tables

| Table | Description | Has Embedding | Syncs to knowledge_items |
|-------|-------------|---------------|--------------------------|
| `projects` | Test projects | No | No |
| `test_suites` | Test collections | No | No |
| `test_cases` | Individual tests | ✅ Yes | ✅ Yes |
| `test_steps` | Test steps | No | No |
| `test_runs` | Execution runs | No | No |
| `test_results` | Run results | No | No |
| `defects` | Bug reports | ✅ Yes | ✅ Yes |
| `defect_comments` | Bug comments | No | No |
| `requirements` | Requirements | ✅ Yes | ✅ Yes |
| `coverage_matrix` | Req coverage | No | No |
| `environments` | Test envs | No | No |
| `reports` | Test reports | Optional | Optional |

### Key Tables SQL

```sql
-- Create schema
CREATE SCHEMA IF NOT EXISTS dtq;

-- Test Projects
CREATE TABLE dtq.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test Cases (with embedding)
CREATE TABLE dtq.test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES dtq.projects(id),
    suite_id UUID,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    preconditions TEXT,
    expected_result TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    test_type VARCHAR(50),  -- functional, regression, smoke, etc.
    status VARCHAR(50) DEFAULT 'active',
    tags TEXT[] DEFAULT '{}',
    embedding vector(384),              -- ← VECTOR COLUMN
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dtq_test_cases_embedding ON dtq.test_cases
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Defects (with embedding)
CREATE TABLE dtq.defects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES dtq.projects(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    steps_to_reproduce TEXT,
    expected_behavior TEXT,
    actual_behavior TEXT,
    severity VARCHAR(20),  -- critical, major, minor, trivial
    priority VARCHAR(20),
    status VARCHAR(50) DEFAULT 'open',
    reported_by UUID REFERENCES public.users(id),
    assigned_to UUID REFERENCES public.users(id),
    tags TEXT[] DEFAULT '{}',
    embedding vector(384),              -- ← VECTOR COLUMN
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dtq_defects_embedding ON dtq.defects
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Requirements (with embedding)
CREATE TABLE dtq.requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES dtq.projects(id),
    req_id VARCHAR(50) NOT NULL,  -- REQ-001
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    parent_id UUID REFERENCES dtq.requirements(id),
    embedding vector(384),              -- ← VECTOR COLUMN
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dtq_requirements_embedding ON dtq.requirements
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
```

---

## dCQ - Chat Core IQ

**Schema:** `dcq`
**Status:** ✅ COMPLETE (28 tables, embeddings working, sync triggers active)
**Purpose:** Conversational AI platform with IVR, chatbot, and admin functionality

### Tables (28 total)

| Table | Description | Has Embedding | Syncs to knowledge_items |
|-------|-------------|---------------|--------------------------|
| `bots` | Chatbot configs | No | No |
| `intents` | Intent definitions | ✅ Yes (384 dims) | No |
| `entities` | Entity types | No | No |
| `training_phrases` | NLU training | ✅ Yes (384 dims) | No |
| `intent_responses` | Bot responses | No | No |
| `faqs` | FAQ pairs | ✅ Yes (384 dims) | ✅ Yes |
| `conversations` | Chat sessions | No | No |
| `messages` | Chat messages | ✅ Yes (384 dims) | No |
| `fallback_logs` | Unhandled queries | ✅ Yes (384 dims) | No |
| `feedback` | User ratings | No | No |
| `settings` | Bot/app settings | No | No |
| `announcements` | Public notices | No | No |
| `escalations` | Human handoff | No | No |
| `appointments` | Scheduled meetings | No | No |
| `service_requests` | Service tickets | No | No |
| `knowledge_entries` | KB content | ✅ Yes (384 dims) | ✅ Yes |
| `documents` | Uploaded files | No | No |
| `crawler_urls` | Web crawl config | No | No |
| `audit_logs` | Activity tracking | No | No |
| `notifications` | Admin alerts | No | No |
| `cross_channel_tokens` | IVR↔Web transfer | No | No |
| `channels` | Channel configs | No | No |
| `workflow_categories` | Workflow groups | No | No |
| `workflow_types` | Workflow definitions | No | No |
| `routing_rules` | Intent routing | No | No |
| `languages` | Multi-lang support | No | No |
| `banner_settings` | UI banners | No | No |
| `analytics` | Usage metrics | No | No |

### Key Tables SQL

```sql
-- Create schema
CREATE SCHEMA IF NOT EXISTS dcq;

-- Bots
CREATE TABLE dcq.bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(50) DEFAULT 'draft',
    config JSONB DEFAULT '{}',
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intents (with embedding)
CREATE TABLE dcq.intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES dcq.bots(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_fallback BOOLEAN DEFAULT false,
    embedding vector(384),              -- ← VECTOR COLUMN
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dcq_intents_embedding ON dcq.intents
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Training Phrases (with embedding)
CREATE TABLE dcq.training_phrases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intent_id UUID REFERENCES dcq.intents(id),
    phrase TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    embedding vector(384),              -- ← VECTOR COLUMN
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dcq_training_phrases_embedding ON dcq.training_phrases
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- FAQs (with embedding)
CREATE TABLE dcq.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES dcq.bots(id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    view_count INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    embedding vector(384),              -- ← VECTOR COLUMN
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dcq_faqs_embedding ON dcq.faqs
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Fallback Logs (with embedding for pattern detection)
CREATE TABLE dcq.fallback_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES dcq.bots(id),
    user_input TEXT NOT NULL,
    session_id VARCHAR(100),
    channel VARCHAR(50),
    embedding vector(384),              -- ← VECTOR COLUMN
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dcq_fallback_logs_embedding ON dcq.fallback_logs
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
```

---

## Cross-Project Vector Search

### How It Works

1. **Source tables** (e.g., `diq.articles`) have their own embedding column
2. **Sync triggers** copy data + embeddings to `public.knowledge_items`
3. **Cross-project search** queries `knowledge_items` for unified results

### Sync Trigger Template

```sql
-- Template for syncing to knowledge_items
CREATE OR REPLACE FUNCTION sync_[table]_to_knowledge()
RETURNS TRIGGER AS $$
DECLARE
    project_uuid UUID;
BEGIN
    SELECT id INTO project_uuid FROM public.projects WHERE code = '[PROJECT_CODE]';

    IF NEW.status = 'published' THEN
        INSERT INTO public.knowledge_items (
            project_id, source_table, source_id, item_type,
            title, content, summary, tags, embedding, created_by
        )
        VALUES (
            project_uuid, '[schema].[table]', NEW.id, '[item_type]',
            NEW.title, NEW.content, NEW.summary, NEW.tags, NEW.embedding, NEW.author_id
        )
        ON CONFLICT (source_table, source_id)
        DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            summary = EXCLUDED.summary,
            tags = EXCLUDED.tags,
            embedding = EXCLUDED.embedding,
            updated_at = NOW();
    ELSIF OLD.status = 'published' AND NEW.status != 'published' THEN
        DELETE FROM public.knowledge_items
        WHERE source_table = '[schema].[table]' AND source_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Cross-Project Search Functions

```sql
-- Semantic search across all projects
CREATE OR REPLACE FUNCTION search_all_projects_semantic(
    query_embedding vector(384),
    match_threshold float DEFAULT 0.3,
    match_count int DEFAULT 20,
    project_codes text[] DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    project_code varchar,
    item_type varchar,
    title varchar,
    summary text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ki.id,
        p.code as project_code,
        ki.item_type,
        ki.title,
        ki.summary,
        1 - (ki.embedding <=> query_embedding) as similarity
    FROM public.knowledge_items ki
    JOIN public.projects p ON ki.project_id = p.id
    WHERE
        ki.embedding IS NOT NULL
        AND 1 - (ki.embedding <=> query_embedding) > match_threshold
        AND (project_codes IS NULL OR p.code = ANY(project_codes))
    ORDER BY ki.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Hybrid search (keyword + semantic)
CREATE OR REPLACE FUNCTION search_all_projects_hybrid(
    search_query text,
    query_embedding vector(384),
    keyword_weight float DEFAULT 0.3,
    semantic_weight float DEFAULT 0.7,
    match_threshold float DEFAULT 0.3,
    match_count int DEFAULT 20,
    project_codes text[] DEFAULT NULL,
    item_types text[] DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    project_code varchar,
    item_type varchar,
    title text,
    summary text,
    combined_score float,
    keyword_score float,
    semantic_score float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ki.id,
        p.code::varchar as project_code,
        ki.item_type::varchar,
        ki.title::text,
        ki.summary::text,
        (COALESCE(ts_rank(ki.searchable, plainto_tsquery('english', search_query)), 0) * keyword_weight +
         COALESCE(1 - (ki.embedding <=> query_embedding), 0) * semantic_weight) as combined_score,
        COALESCE(ts_rank(ki.searchable, plainto_tsquery('english', search_query)), 0)::float as keyword_score,
        COALESCE(1 - (ki.embedding <=> query_embedding), 0)::float as semantic_score
    FROM public.knowledge_items ki
    JOIN public.projects p ON ki.project_id = p.id
    WHERE
        (ki.searchable @@ plainto_tsquery('english', search_query) OR ki.embedding IS NOT NULL)
        AND (project_codes IS NULL OR p.code = ANY(project_codes))
        AND (item_types IS NULL OR ki.item_type = ANY(item_types))
    ORDER BY combined_score DESC
    LIMIT match_count;
END;
$$;
```

---

## Migration Templates

### Adding Embeddings to New Table

```sql
-- Step 1: Add embedding column
ALTER TABLE [schema].[table]
ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Step 2: Create HNSW index
CREATE INDEX IF NOT EXISTS idx_[schema]_[table]_embedding
ON [schema].[table]
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Step 3: Create sync trigger (if syncing to knowledge_items)
-- See sync trigger template above
```

### Migration File Naming

```
supabase/migrations/
├── 001_core_schema.sql         # Public schema
├── 002_diq_schema.sql          # dIQ tables
├── 003_pgvector_embeddings.sql # pgvector setup
├── 004_dsq_schema.sql          # dSQ tables (future)
├── 005_dtq_schema.sql          # dTQ tables (future)
├── 006_dcq_schema.sql          # dCQ tables (future)
└── 007_embedding_updates.sql   # Dimension changes, etc.
```

---

## Implementation Status

### Summary Table

| Project | Schema | Tables Created | Embeddings Setup | Sync to knowledge_items | API Routes |
|---------|--------|----------------|------------------|------------------------|------------|
| **dIQ** | `diq` | ✅ Complete | ✅ 384 dims | ⚠️ Partial | ✅ Working |
| **dSQ** | `dsq` | ⬜ Pending | ⬜ Pending | ⬜ Pending | ⬜ Pending |
| **dTQ** | `dtq` | ⬜ Pending | ⬜ Pending | ⬜ Pending | ⬜ Pending |
| **dCQ** | `dcq` | ✅ Complete (28) | ✅ 384 dims (6 tables) | ✅ Complete | ✅ Library Created |

### dIQ Embedding Details

| Table | Embedding Column | Dimensions | Coverage | Indexed |
|-------|-----------------|------------|----------|---------|
| `diq.articles` | ✅ Yes | 384 | 100% | ✅ HNSW |
| `diq.chat_messages` | ✅ Yes | 384 | 0% | ✅ HNSW |
| `public.knowledge_items` | ✅ Yes | 384 | Partial | ✅ HNSW |

### dCQ Embedding Details

| Table | Embedding Column | Dimensions | Coverage | Indexed |
|-------|-----------------|------------|----------|---------|
| `dcq.faqs` | ✅ Yes | 384 | Pending | ✅ HNSW |
| `dcq.intents` | ✅ Yes | 384 | Pending | ✅ HNSW |
| `dcq.training_phrases` | ✅ Yes | 384 | Pending | ✅ HNSW |
| `dcq.messages` | ✅ Yes | 384 | Pending | ✅ HNSW |
| `dcq.knowledge_entries` | ✅ Yes | 384 | Pending | ✅ HNSW |
| `dcq.fallback_logs` | ✅ Yes | 384 | Pending | ✅ HNSW |

### Next Steps

1. ~~**dCQ (Chat Core IQ)**~~ - ✅ COMPLETE (Jan 19, 2025)
2. **dSQ (Support IQ)** - Next priority
3. **dTQ (Test Pilot IQ)** - After dSQ
4. **Cross-project sync** - After all schemas created

---

## Quick Reference

### Embedding Configuration

```typescript
// All projects use the same embedding config
{
  model: 'Xenova/all-MiniLM-L6-v2',
  dimensions: 384,
  provider: 'local (transformers.js)',
  cost: 'FREE'
}
```

### Database Connection

```typescript
// apps/[project]/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only
```

---

*Last Updated: January 19, 2025*
*Version: 1.1.0 - dCQ schema complete*
*Applies to: dIQ, dSQ, dTQ, dCQ*
