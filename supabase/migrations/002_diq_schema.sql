-- =====================================================
-- dIQ (Intranet IQ) - Project-Specific Schema
-- =====================================================
-- This migration creates the dIQ-specific tables for
-- the AI-powered internal knowledge network
-- =====================================================

-- Create dIQ schema (namespace)
CREATE SCHEMA IF NOT EXISTS diq;

-- =====================================================
-- DEPARTMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES diq.departments(id),
    manager_id UUID REFERENCES public.users(id),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMPLOYEES (Extended user profiles for dIQ)
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES diq.departments(id),
    job_title VARCHAR(255),
    bio TEXT,
    phone VARCHAR(50),
    location VARCHAR(255),
    skills TEXT[] DEFAULT '{}',
    manager_id UUID REFERENCES diq.employees(id),
    hire_date DATE,
    profile_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- KNOWLEDGE BASE CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.kb_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES diq.kb_categories(id),
    department_id UUID REFERENCES diq.departments(id),
    icon VARCHAR(50),
    color VARCHAR(7),
    sort_order INT DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(slug, department_id)
);

-- =====================================================
-- KNOWLEDGE BASE ARTICLES
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES diq.kb_categories(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    author_id UUID NOT NULL REFERENCES public.users(id),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    view_count INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(slug)
);

-- Index for article search
CREATE INDEX IF NOT EXISTS idx_diq_articles_status
ON diq.articles(status);

CREATE INDEX IF NOT EXISTS idx_diq_articles_tags
ON diq.articles USING GIN(tags);

-- =====================================================
-- ARTICLE VERSIONS (History tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.article_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES diq.articles(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    edited_by UUID NOT NULL REFERENCES public.users(id),
    change_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(article_id, version_number)
);

-- =====================================================
-- AI CHAT THREADS
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.chat_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    llm_model VARCHAR(100) DEFAULT 'gpt-4',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user's threads
CREATE INDEX IF NOT EXISTS idx_diq_chat_threads_user
ON diq.chat_threads(user_id, created_at DESC);

-- =====================================================
-- CHAT MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES diq.chat_threads(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]',  -- Array of cited sources
    confidence DECIMAL(3,2),      -- 0.00 to 1.00
    tokens_used INT,
    llm_model VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for thread messages
CREATE INDEX IF NOT EXISTS idx_diq_chat_messages_thread
ON diq.chat_messages(thread_id, created_at);

-- =====================================================
-- SEARCH HISTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    results_count INT DEFAULT 0,
    clicked_results UUID[] DEFAULT '{}',
    session_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for search analytics
CREATE INDEX IF NOT EXISTS idx_diq_search_history_user
ON diq.search_history(user_id, created_at DESC);

-- =====================================================
-- AGENTIC WORKFLOWS
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES public.users(id),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    trigger_type VARCHAR(50),  -- 'manual', 'scheduled', 'event'
    trigger_config JSONB DEFAULT '{}',
    is_template BOOLEAN DEFAULT false,
    template_category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WORKFLOW STEPS
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES diq.workflows(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,  -- 'llm', 'search', 'condition', 'action', 'human'
    config JSONB NOT NULL DEFAULT '{}',
    next_step_on_success UUID REFERENCES diq.workflow_steps(id),
    next_step_on_failure UUID REFERENCES diq.workflow_steps(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workflow_id, step_number)
);

-- =====================================================
-- WORKFLOW EXECUTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES diq.workflows(id) ON DELETE CASCADE,
    triggered_by UUID REFERENCES public.users(id),
    status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    current_step_id UUID REFERENCES diq.workflow_steps(id),
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- =====================================================
-- NEWS FEED POSTS (EX Feature)
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.news_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.users(id),
    title VARCHAR(255),
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'post' CHECK (type IN ('post', 'announcement', 'event', 'poll')),
    department_id UUID REFERENCES diq.departments(id),
    visibility VARCHAR(50) DEFAULT 'all' CHECK (visibility IN ('all', 'department', 'private')),
    pinned BOOLEAN DEFAULT false,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NEWS FEED COMMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.news_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES diq.news_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id),
    parent_id UUID REFERENCES diq.news_comments(id),  -- For threaded replies
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EVENTS CALENDAR
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    organizer_id UUID NOT NULL REFERENCES public.users(id),
    department_id UUID REFERENCES diq.departments(id),
    location VARCHAR(255),
    location_type VARCHAR(50) DEFAULT 'in_person' CHECK (location_type IN ('in_person', 'virtual', 'hybrid')),
    meeting_url TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT false,
    recurrence_rule TEXT,  -- iCal RRULE format
    visibility VARCHAR(50) DEFAULT 'all',
    max_attendees INT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EVENT RSVPS
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES diq.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'maybe')),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- =====================================================
-- BOOKMARKS / SAVED ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,  -- 'article', 'post', 'employee', 'workflow'
    item_id UUID NOT NULL,
    notes TEXT,
    folder VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- =====================================================
-- USER SETTINGS (dIQ-specific)
-- =====================================================
CREATE TABLE IF NOT EXISTS diq.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    notification_prefs JSONB DEFAULT '{
        "email_digest": true,
        "news_mentions": true,
        "article_updates": true,
        "event_reminders": true
    }',
    appearance JSONB DEFAULT '{
        "theme": "dark",
        "sidebar_collapsed": false,
        "density": "comfortable"
    }',
    ai_prefs JSONB DEFAULT '{
        "default_llm": "gpt-4",
        "response_style": "balanced",
        "show_sources": true
    }',
    privacy JSONB DEFAULT '{
        "show_profile": true,
        "show_activity": true,
        "searchable": true
    }',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- ROW LEVEL SECURITY FOR dIQ TABLES
-- =====================================================

-- Enable RLS
ALTER TABLE diq.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.user_settings ENABLE ROW LEVEL SECURITY;

-- Articles: Published articles visible to all, drafts only to author
CREATE POLICY "Published articles visible to all"
ON diq.articles FOR SELECT
TO authenticated
USING (status = 'published' OR author_id = (
    SELECT id FROM public.users WHERE clerk_id = auth.jwt()->>'sub'
));

-- Chat threads: Users see only their own
CREATE POLICY "Users see own chat threads"
ON diq.chat_threads FOR ALL
TO authenticated
USING (user_id = (
    SELECT id FROM public.users WHERE clerk_id = auth.jwt()->>'sub'
));

-- Bookmarks: Users see only their own
CREATE POLICY "Users see own bookmarks"
ON diq.bookmarks FOR ALL
TO authenticated
USING (user_id = (
    SELECT id FROM public.users WHERE clerk_id = auth.jwt()->>'sub'
));

-- User settings: Users see only their own
CREATE POLICY "Users see own settings"
ON diq.user_settings FOR ALL
TO authenticated
USING (user_id = (
    SELECT id FROM public.users WHERE clerk_id = auth.jwt()->>'sub'
));

-- =====================================================
-- TRIGGERS FOR SYNCING TO KNOWLEDGE_ITEMS
-- =====================================================

-- Sync published articles to knowledge_items
CREATE OR REPLACE FUNCTION sync_article_to_knowledge()
RETURNS TRIGGER AS $$
DECLARE
    project_uuid UUID;
BEGIN
    -- Get dIQ project ID
    SELECT id INTO project_uuid FROM public.projects WHERE code = 'dIQ';

    IF NEW.status = 'published' THEN
        INSERT INTO public.knowledge_items (
            project_id, source_table, source_id, type,
            title, content, summary, tags, created_by
        )
        VALUES (
            project_uuid, 'diq.articles', NEW.id, 'article',
            NEW.title, NEW.content, NEW.summary, NEW.tags, NEW.author_id
        )
        ON CONFLICT (project_id, source_table, source_id)
        DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            summary = EXCLUDED.summary,
            tags = EXCLUDED.tags;
    ELSIF OLD.status = 'published' AND NEW.status != 'published' THEN
        -- Remove from knowledge_items if unpublished
        DELETE FROM public.knowledge_items
        WHERE source_table = 'diq.articles' AND source_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_article
AFTER INSERT OR UPDATE ON diq.articles
FOR EACH ROW EXECUTE FUNCTION sync_article_to_knowledge();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get org chart for a department
CREATE OR REPLACE FUNCTION diq.get_org_chart(dept_id UUID DEFAULT NULL)
RETURNS TABLE (
    employee_id UUID,
    user_id UUID,
    full_name VARCHAR(255),
    job_title VARCHAR(255),
    department_name VARCHAR(255),
    manager_id UUID,
    level INT
) AS $$
WITH RECURSIVE org_tree AS (
    -- Root level (no manager or specified dept heads)
    SELECT
        e.id as employee_id,
        e.user_id,
        u.full_name,
        e.job_title,
        d.name as department_name,
        e.manager_id,
        0 as level
    FROM diq.employees e
    JOIN public.users u ON u.id = e.user_id
    LEFT JOIN diq.departments d ON d.id = e.department_id
    WHERE e.manager_id IS NULL
    AND (dept_id IS NULL OR e.department_id = dept_id)

    UNION ALL

    -- Recursive: employees who report to above
    SELECT
        e.id,
        e.user_id,
        u.full_name,
        e.job_title,
        d.name,
        e.manager_id,
        ot.level + 1
    FROM diq.employees e
    JOIN public.users u ON u.id = e.user_id
    LEFT JOIN diq.departments d ON d.id = e.department_id
    JOIN org_tree ot ON e.manager_id = ot.employee_id
)
SELECT * FROM org_tree ORDER BY level, department_name, full_name;
$$ LANGUAGE sql;

-- Search articles
CREATE OR REPLACE FUNCTION diq.search_articles(
    search_query TEXT,
    category_slug TEXT DEFAULT NULL,
    max_results INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(500),
    summary TEXT,
    category_name VARCHAR(255),
    author_name VARCHAR(255),
    published_at TIMESTAMPTZ,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.title,
        a.summary,
        c.name as category_name,
        u.full_name as author_name,
        a.published_at,
        ts_rank(
            to_tsvector('english', a.title || ' ' || COALESCE(a.content, '') || ' ' || COALESCE(a.summary, '')),
            websearch_to_tsquery('english', search_query)
        ) as relevance
    FROM diq.articles a
    LEFT JOIN diq.kb_categories c ON c.id = a.category_id
    LEFT JOIN public.users u ON u.id = a.author_id
    WHERE
        a.status = 'published'
        AND to_tsvector('english', a.title || ' ' || COALESCE(a.content, '') || ' ' || COALESCE(a.summary, ''))
            @@ websearch_to_tsquery('english', search_query)
        AND (category_slug IS NULL OR c.slug = category_slug)
    ORDER BY relevance DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================
CREATE TRIGGER set_updated_at_departments
BEFORE UPDATE ON diq.departments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_employees
BEFORE UPDATE ON diq.employees
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_articles
BEFORE UPDATE ON diq.articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_chat_threads
BEFORE UPDATE ON diq.chat_threads
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_workflows
BEFORE UPDATE ON diq.workflows
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_news_posts
BEFORE UPDATE ON diq.news_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_events
BEFORE UPDATE ON diq.events
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_user_settings
BEFORE UPDATE ON diq.user_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
