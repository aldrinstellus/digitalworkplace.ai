-- =============================================
-- Migration 009: Framework Integration
-- Connectors, KB Spaces, and Knowledge Items
-- =============================================

-- =============================================
-- CONNECTORS
-- =============================================

-- Connectors table - stores external data source configurations
CREATE TABLE IF NOT EXISTS diq.connectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- confluence, sharepoint, notion, google_drive, etc.
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- active, inactive, error, syncing, pending
  organization_id UUID NOT NULL,
  kb_space_id UUID REFERENCES diq.kb_spaces(id) ON DELETE SET NULL,

  -- Authentication
  auth_type VARCHAR(20) NOT NULL DEFAULT 'api_key', -- oauth2, api_key, basic, bearer, custom
  auth_credentials JSONB DEFAULT '{}', -- encrypted tokens, keys, etc.

  -- Configuration
  configuration JSONB DEFAULT '{}', -- connector-specific settings

  -- Sync settings
  sync_frequency VARCHAR(20) NOT NULL DEFAULT 'daily', -- realtime, hourly, daily, weekly, manual
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  sync_cursor TEXT, -- for incremental sync
  sync_stats JSONB DEFAULT '{}', -- sync statistics

  -- Metadata
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Connector items - synced content from external sources
CREATE TABLE IF NOT EXISTS diq.connector_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connector_id UUID NOT NULL REFERENCES diq.connectors(id) ON DELETE CASCADE,
  external_id VARCHAR(500) NOT NULL,
  kb_item_id UUID REFERENCES diq.knowledge_items(id) ON DELETE SET NULL,

  -- Content
  title VARCHAR(500) NOT NULL,
  content TEXT,
  content_type VARCHAR(20) DEFAULT 'text', -- html, markdown, text, pdf, doc
  excerpt TEXT,

  -- Source metadata
  source_url TEXT,
  source_path TEXT,
  source_type VARCHAR(50),
  author_id VARCHAR(255),
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  author_avatar_url TEXT,

  -- Timestamps
  external_created_at TIMESTAMPTZ,
  external_updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Sync tracking
  sync_hash VARCHAR(100) NOT NULL,
  sync_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, synced, failed, deleted
  sync_error TEXT,

  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- Permissions
  permissions JSONB DEFAULT '{"public": true}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint for connector + external ID
  CONSTRAINT unique_connector_external_id UNIQUE (connector_id, external_id)
);

-- =============================================
-- KB SPACES
-- =============================================

-- KB Spaces - multi-tenant knowledge base spaces
CREATE TABLE IF NOT EXISTS diq.kb_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'internal', -- internal, external, hybrid

  -- Organization/tenant
  organization_id UUID NOT NULL,

  -- Isolation settings
  isolation_level VARCHAR(20) NOT NULL DEFAULT 'organization', -- organization, department, team

  -- Features
  enabled_connectors TEXT[] DEFAULT '{}', -- allowed connector types
  settings JSONB DEFAULT '{}',

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, archived, disabled

  -- Metadata
  icon VARCHAR(50),
  color VARCHAR(20),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_space_slug_org UNIQUE (organization_id, slug)
);

-- KB Space members - access control for spaces
CREATE TABLE IF NOT EXISTS diq.kb_space_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kb_space_id UUID NOT NULL REFERENCES diq.kb_spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer', -- admin, editor, viewer
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_by UUID REFERENCES public.users(id),

  CONSTRAINT unique_space_member UNIQUE (kb_space_id, user_id)
);

-- KB Space items - links knowledge items to spaces
CREATE TABLE IF NOT EXISTS diq.kb_space_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kb_space_id UUID NOT NULL REFERENCES diq.kb_spaces(id) ON DELETE CASCADE,
  knowledge_item_id UUID NOT NULL REFERENCES diq.knowledge_items(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID REFERENCES public.users(id),

  CONSTRAINT unique_space_item UNIQUE (kb_space_id, knowledge_item_id)
);

-- =============================================
-- KNOWLEDGE ITEMS (Unified)
-- =============================================

-- Unified knowledge items table
CREATE TABLE IF NOT EXISTS diq.knowledge_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Source tracking
  source_type VARCHAR(50) NOT NULL, -- internal, connector, upload
  source_id VARCHAR(500), -- connector_item_id, article_id, upload_id
  source_connector_id UUID REFERENCES diq.connectors(id) ON DELETE SET NULL,

  -- Content
  title VARCHAR(500) NOT NULL,
  content TEXT,
  content_type VARCHAR(20) DEFAULT 'text',
  excerpt TEXT,

  -- Classification
  category_id UUID REFERENCES diq.kb_categories(id) ON DELETE SET NULL,
  department_id UUID REFERENCES diq.departments(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',

  -- Search
  embedding vector(1536), -- for semantic search
  search_vector tsvector, -- for full-text search

  -- URLs
  source_url TEXT,
  internal_url TEXT,

  -- Author
  author_id UUID REFERENCES public.users(id),
  author_name VARCHAR(255),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, published, archived
  visibility VARCHAR(20) NOT NULL DEFAULT 'organization', -- public, organization, department, private

  -- Metrics
  view_count INT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  share_count INT DEFAULT 0,

  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- FRAMEWORKS AND PRODUCTS
-- =============================================

-- Frameworks registry
CREATE TABLE IF NOT EXISTS diq.frameworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50), -- methodology, standard, toolkit
  version VARCHAR(20),

  -- Components
  components JSONB DEFAULT '[]', -- framework components/modules
  documentation_url TEXT,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SaaS products catalog
CREATE TABLE IF NOT EXISTS diq.saas_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50),
  vendor VARCHAR(255),

  -- URLs
  website_url TEXT,
  documentation_url TEXT,

  -- Integration
  connector_id UUID REFERENCES diq.connectors(id) ON DELETE SET NULL,
  has_connector BOOLEAN DEFAULT FALSE,

  -- Compliance
  compliance_status VARCHAR(20) DEFAULT 'unknown', -- approved, pending, rejected
  compliance_notes TEXT,

  -- Metadata
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_connectors_org ON diq.connectors(organization_id);
CREATE INDEX IF NOT EXISTS idx_connectors_type ON diq.connectors(type);
CREATE INDEX IF NOT EXISTS idx_connectors_status ON diq.connectors(status);

CREATE INDEX IF NOT EXISTS idx_connector_items_connector ON diq.connector_items(connector_id);
CREATE INDEX IF NOT EXISTS idx_connector_items_external ON diq.connector_items(external_id);
CREATE INDEX IF NOT EXISTS idx_connector_items_sync_status ON diq.connector_items(sync_status);

CREATE INDEX IF NOT EXISTS idx_kb_spaces_org ON diq.kb_spaces(organization_id);
CREATE INDEX IF NOT EXISTS idx_kb_spaces_slug ON diq.kb_spaces(slug);

CREATE INDEX IF NOT EXISTS idx_kb_space_members_space ON diq.kb_space_members(kb_space_id);
CREATE INDEX IF NOT EXISTS idx_kb_space_members_user ON diq.kb_space_members(user_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_items_source ON diq.knowledge_items(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_category ON diq.knowledge_items(category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_status ON diq.knowledge_items(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_embedding ON diq.knowledge_items USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_knowledge_items_fts ON diq.knowledge_items USING gin(search_vector);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update search vector for knowledge items
CREATE OR REPLACE FUNCTION diq.update_knowledge_item_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_knowledge_item_search_vector ON diq.knowledge_items;
CREATE TRIGGER trigger_knowledge_item_search_vector
  BEFORE INSERT OR UPDATE ON diq.knowledge_items
  FOR EACH ROW
  EXECUTE FUNCTION diq.update_knowledge_item_search_vector();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE diq.connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.connector_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.kb_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.kb_space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.kb_space_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.saas_products ENABLE ROW LEVEL SECURITY;

-- Connectors: users can view connectors in their organization
CREATE POLICY connectors_select_policy ON diq.connectors
  FOR SELECT USING (true);

CREATE POLICY connectors_insert_policy ON diq.connectors
  FOR INSERT WITH CHECK (true);

CREATE POLICY connectors_update_policy ON diq.connectors
  FOR UPDATE USING (true);

CREATE POLICY connectors_delete_policy ON diq.connectors
  FOR DELETE USING (true);

-- Connector items: accessible via connector
CREATE POLICY connector_items_select_policy ON diq.connector_items
  FOR SELECT USING (true);

-- KB Spaces: members can access their spaces
CREATE POLICY kb_spaces_select_policy ON diq.kb_spaces
  FOR SELECT USING (true);

CREATE POLICY kb_spaces_insert_policy ON diq.kb_spaces
  FOR INSERT WITH CHECK (true);

CREATE POLICY kb_spaces_update_policy ON diq.kb_spaces
  FOR UPDATE USING (true);

CREATE POLICY kb_spaces_delete_policy ON diq.kb_spaces
  FOR DELETE USING (true);

-- KB Space members
CREATE POLICY kb_space_members_policy ON diq.kb_space_members
  FOR ALL USING (true);

-- KB Space items
CREATE POLICY kb_space_items_policy ON diq.kb_space_items
  FOR ALL USING (true);

-- Knowledge items: based on visibility
CREATE POLICY knowledge_items_select_policy ON diq.knowledge_items
  FOR SELECT USING (status = 'published' OR visibility = 'public');

CREATE POLICY knowledge_items_insert_policy ON diq.knowledge_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY knowledge_items_update_policy ON diq.knowledge_items
  FOR UPDATE USING (true);

-- Frameworks: public read
CREATE POLICY frameworks_select_policy ON diq.frameworks
  FOR SELECT USING (true);

-- SaaS products: public read
CREATE POLICY saas_products_select_policy ON diq.saas_products
  FOR SELECT USING (true);

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample KB space
INSERT INTO diq.kb_spaces (id, name, slug, description, type, organization_id, isolation_level, enabled_connectors, status)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Company Knowledge', 'company-knowledge', 'Main company knowledge base', 'internal', 'f47ac10b-58cc-4372-a567-0e02b2c3d471', 'organization', ARRAY['confluence', 'sharepoint', 'notion', 'google_drive'], 'active'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Engineering Docs', 'engineering-docs', 'Technical documentation for engineering team', 'hybrid', 'f47ac10b-58cc-4372-a567-0e02b2c3d471', 'department', ARRAY['confluence', 'github'], 'active')
ON CONFLICT DO NOTHING;

-- Insert sample frameworks
INSERT INTO diq.frameworks (name, slug, description, category, version, status, components)
VALUES
  ('ITIL 4', 'itil-4', 'IT Infrastructure Library best practices framework', 'methodology', '4.0', 'active', '["Service Strategy", "Service Design", "Service Transition", "Service Operation", "Continual Improvement"]'::jsonb),
  ('Agile', 'agile', 'Agile software development methodology', 'methodology', '2.0', 'active', '["Scrum", "Kanban", "XP", "Lean"]'::jsonb),
  ('ISO 27001', 'iso-27001', 'Information security management standard', 'standard', '2022', 'active', '["Context", "Leadership", "Planning", "Support", "Operation", "Performance", "Improvement"]'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert sample SaaS products
INSERT INTO diq.saas_products (name, slug, description, category, vendor, website_url, compliance_status, has_connector)
VALUES
  ('Confluence', 'confluence', 'Team collaboration and documentation platform', 'Collaboration', 'Atlassian', 'https://www.atlassian.com/software/confluence', 'approved', true),
  ('SharePoint', 'sharepoint', 'Document management and collaboration platform', 'Collaboration', 'Microsoft', 'https://www.microsoft.com/sharepoint', 'approved', true),
  ('Notion', 'notion', 'All-in-one workspace for notes and docs', 'Productivity', 'Notion Labs', 'https://www.notion.so', 'approved', true),
  ('Google Drive', 'google-drive', 'Cloud storage and file sharing', 'Storage', 'Google', 'https://drive.google.com', 'approved', true),
  ('Slack', 'slack', 'Team communication and messaging', 'Communication', 'Salesforce', 'https://slack.com', 'approved', false),
  ('Jira', 'jira', 'Project tracking and issue management', 'Project Management', 'Atlassian', 'https://www.atlassian.com/software/jira', 'approved', false)
ON CONFLICT DO NOTHING;
