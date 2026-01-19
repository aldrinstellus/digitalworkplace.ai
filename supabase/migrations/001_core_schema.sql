-- =====================================================
-- Digital Workplace AI - Core Database Schema
-- =====================================================
-- This migration creates the foundational tables shared
-- across all projects (dIQ, dSQ, dTQ, dCQ)
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- =====================================================
-- ORGANIZATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROJECTS TABLE (dIQ, dSQ, dTQ, dCQ)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,  -- 'dIQ', 'dSQ', 'dTQ', 'dCQ'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color_primary VARCHAR(7),  -- Hex color
    color_secondary VARCHAR(7),
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the four Digital Workplace AI projects
INSERT INTO public.projects (code, name, description, color_primary, color_secondary) VALUES
    ('dIQ', 'Intranet IQ', 'AI-powered internal knowledge network', '#3b82f6', '#8b5cf6'),
    ('dSQ', 'Support IQ', 'Customer support automation', '#10b981', '#06b6d4'),
    ('dTQ', 'Test Pilot IQ', 'QA & testing intelligence', '#f59e0b', '#ef4444'),
    ('dCQ', 'Chat Core IQ', 'Conversational AI platform', '#a855f7', '#ec4899')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- USERS TABLE (extends Clerk data)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}',
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER PROJECT ACCESS (many-to-many)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_project_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES public.users(id),
    UNIQUE(user_id, project_id)
);

-- =====================================================
-- KNOWLEDGE ITEMS (Cross-project searchable content)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.knowledge_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    source_table VARCHAR(100) NOT NULL,  -- e.g., 'diq.articles', 'dsq.kb_articles'
    source_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,  -- 'article', 'document', 'faq', 'thread'
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    searchable TSVECTOR,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, source_table, source_id)
);

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_knowledge_items_searchable
ON public.knowledge_items USING GIN(searchable);

-- Create index for tag searches
CREATE INDEX IF NOT EXISTS idx_knowledge_items_tags
ON public.knowledge_items USING GIN(tags);

-- Trigger to auto-update searchable vector
CREATE OR REPLACE FUNCTION update_knowledge_searchable()
RETURNS TRIGGER AS $$
BEGIN
    NEW.searchable := to_tsvector('english',
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.content, '') || ' ' ||
        COALESCE(NEW.summary, '') || ' ' ||
        COALESCE(array_to_string(NEW.tags, ' '), '')
    );
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_knowledge_searchable
BEFORE INSERT OR UPDATE ON public.knowledge_items
FOR EACH ROW EXECUTE FUNCTION update_knowledge_searchable();

-- =====================================================
-- ACTIVITY LOG (Cross-project audit trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,  -- 'create', 'update', 'delete', 'view', 'search'
    entity_type VARCHAR(100),      -- 'article', 'chat', 'workflow'
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying recent activity
CREATE INDEX IF NOT EXISTS idx_activity_log_created
ON public.activity_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_log_user
ON public.activity_log(user_id, created_at DESC);

-- =====================================================
-- INTEGRATIONS (External service connections)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,  -- 'elasticsearch', 'openai', 'slack', etc.
    name VARCHAR(255) NOT NULL,
    config JSONB DEFAULT '{}',  -- Encrypted config stored here
    status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_project_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Projects are readable by all authenticated users
CREATE POLICY "Projects are viewable by authenticated users"
ON public.projects FOR SELECT
TO authenticated
USING (true);

-- Users can read their own data
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
TO authenticated
USING (clerk_id = auth.jwt()->>'sub');

-- Knowledge items visible based on project access
CREATE POLICY "Knowledge items based on project access"
ON public.knowledge_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_project_access upa
        JOIN public.users u ON u.id = upa.user_id
        WHERE upa.project_id = knowledge_items.project_id
        AND u.clerk_id = auth.jwt()->>'sub'
    )
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to search across all knowledge items
CREATE OR REPLACE FUNCTION search_knowledge(
    search_query TEXT,
    project_codes TEXT[] DEFAULT NULL,
    item_types TEXT[] DEFAULT NULL,
    max_results INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    project_code VARCHAR(10),
    type VARCHAR(50),
    title VARCHAR(500),
    summary TEXT,
    tags TEXT[],
    relevance REAL,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ki.id,
        p.code as project_code,
        ki.type,
        ki.title,
        ki.summary,
        ki.tags,
        ts_rank(ki.searchable, websearch_to_tsquery('english', search_query)) as relevance,
        ki.created_at
    FROM public.knowledge_items ki
    JOIN public.projects p ON p.id = ki.project_id
    WHERE
        ki.searchable @@ websearch_to_tsquery('english', search_query)
        AND (project_codes IS NULL OR p.code = ANY(project_codes))
        AND (item_types IS NULL OR ki.type = ANY(item_types))
    ORDER BY relevance DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's accessible projects
CREATE OR REPLACE FUNCTION get_user_projects(user_clerk_id TEXT)
RETURNS TABLE (
    project_id UUID,
    project_code VARCHAR(10),
    project_name VARCHAR(255),
    user_role VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.code,
        p.name,
        upa.role
    FROM public.projects p
    JOIN public.user_project_access upa ON upa.project_id = p.id
    JOIN public.users u ON u.id = upa.user_id
    WHERE u.clerk_id = user_clerk_id
    AND p.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at_organizations
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_projects
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_integrations
BEFORE UPDATE ON public.integrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
