-- =============================================
-- DSQ Schema - Support IQ Database Schema
-- =============================================
-- Version: 1.0.0
-- Created: 2025-01-19
-- Project: Digital Workplace AI - Support IQ (dSQ)
-- Schema: dsq
--
-- Tables:
--   - customers: Customer profiles
--   - tickets: Support tickets with embeddings
--   - ticket_messages: Ticket conversation threads
--   - conversations: Live chat sessions
--   - conversation_messages: Chat messages
--   - kb_categories: Knowledge base categories
--   - kb_articles: FAQ/Help articles with embeddings
--   - agents: Support agent profiles
--   - agent_metrics: Agent performance tracking
--   - escalations: Ticket escalation records
--   - canned_responses: Template replies with embeddings
--   - tags: Ticket classification tags
--   - sla_policies: SLA definitions
--   - analytics: Aggregated metrics
-- =============================================

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create DSQ schema
CREATE SCHEMA IF NOT EXISTS dsq;

-- =============================================
-- CUSTOMERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(100), -- External system ID (Zoho, etc.)
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(50),
    tier VARCHAR(50) DEFAULT 'standard', -- standard, premium, enterprise
    health_score INTEGER DEFAULT 50, -- 0-100
    risk_level VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical
    lifetime_value DECIMAL(12,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_contact_at TIMESTAMPTZ,
    UNIQUE(email)
);

CREATE INDEX idx_dsq_customers_email ON dsq.customers(email);
CREATE INDEX idx_dsq_customers_company ON dsq.customers(company);
CREATE INDEX idx_dsq_customers_tier ON dsq.customers(tier);
CREATE INDEX idx_dsq_customers_risk_level ON dsq.customers(risk_level);

-- =============================================
-- AGENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    external_id VARCHAR(100), -- Zoho agent ID
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'agent', -- agent, senior_agent, team_lead, manager
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'offline', -- available, busy, away, offline
    skills TEXT[] DEFAULT '{}',
    max_concurrent_tickets INTEGER DEFAULT 10,
    current_ticket_count INTEGER DEFAULT 0,
    performance_score DECIMAL(5,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ
);

CREATE INDEX idx_dsq_agents_status ON dsq.agents(status);
CREATE INDEX idx_dsq_agents_role ON dsq.agents(role);
CREATE INDEX idx_dsq_agents_department ON dsq.agents(department);

-- =============================================
-- SLA POLICIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.sla_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL, -- low, medium, high, urgent
    first_response_hours INTEGER NOT NULL,
    resolution_hours INTEGER NOT NULL,
    business_hours_only BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default SLA policies
INSERT INTO dsq.sla_policies (name, priority, first_response_hours, resolution_hours, business_hours_only) VALUES
    ('Low Priority SLA', 'low', 24, 72, true),
    ('Medium Priority SLA', 'medium', 8, 48, true),
    ('High Priority SLA', 'high', 4, 24, true),
    ('Urgent Priority SLA', 'urgent', 1, 8, false)
ON CONFLICT DO NOTHING;

-- =============================================
-- TAGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#6b7280', -- Hex color
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- KB CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.kb_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES dsq.kb_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    article_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- KB ARTICLES TABLE (with embedding)
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.kb_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES dsq.kb_categories(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    summary TEXT,
    author_id UUID REFERENCES dsq.agents(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, pending_review, published, archived
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    embedding vector(384), -- Semantic search embedding
    searchable TSVECTOR, -- Full-text search
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dsq_kb_articles_category ON dsq.kb_articles(category_id);
CREATE INDEX idx_dsq_kb_articles_status ON dsq.kb_articles(status);
CREATE INDEX idx_dsq_kb_articles_slug ON dsq.kb_articles(slug);
CREATE INDEX idx_dsq_kb_articles_tags ON dsq.kb_articles USING GIN(tags);
CREATE INDEX idx_dsq_kb_articles_searchable ON dsq.kb_articles USING GIN(searchable);
CREATE INDEX idx_dsq_kb_articles_embedding ON dsq.kb_articles
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- =============================================
-- TICKETS TABLE (with embedding)
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) NOT NULL UNIQUE, -- DESK-1001, etc.
    external_id VARCHAR(100), -- Zoho ticket ID
    customer_id UUID REFERENCES dsq.customers(id) ON DELETE SET NULL,
    assigned_agent_id UUID REFERENCES dsq.agents(id) ON DELETE SET NULL,
    sla_policy_id UUID REFERENCES dsq.sla_policies(id) ON DELETE SET NULL,
    subject VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open', -- open, pending, on_hold, resolved, closed
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    category VARCHAR(100),
    channel VARCHAR(50) DEFAULT 'email', -- email, chat, phone, web, api
    source VARCHAR(100), -- zoho, internal, api
    tags TEXT[] DEFAULT '{}',
    sentiment VARCHAR(20), -- positive, neutral, negative
    sentiment_score DECIMAL(3,2),
    first_response_at TIMESTAMPTZ,
    sla_first_response_due TIMESTAMPTZ,
    sla_resolution_due TIMESTAMPTZ,
    sla_breached BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    satisfaction_rating INTEGER, -- 1-5
    satisfaction_feedback TEXT,
    metadata JSONB DEFAULT '{}',
    embedding vector(384), -- Semantic search embedding
    searchable TSVECTOR, -- Full-text search
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

CREATE INDEX idx_dsq_tickets_number ON dsq.tickets(ticket_number);
CREATE INDEX idx_dsq_tickets_customer ON dsq.tickets(customer_id);
CREATE INDEX idx_dsq_tickets_agent ON dsq.tickets(assigned_agent_id);
CREATE INDEX idx_dsq_tickets_status ON dsq.tickets(status);
CREATE INDEX idx_dsq_tickets_priority ON dsq.tickets(priority);
CREATE INDEX idx_dsq_tickets_category ON dsq.tickets(category);
CREATE INDEX idx_dsq_tickets_channel ON dsq.tickets(channel);
CREATE INDEX idx_dsq_tickets_created ON dsq.tickets(created_at DESC);
CREATE INDEX idx_dsq_tickets_tags ON dsq.tickets USING GIN(tags);
CREATE INDEX idx_dsq_tickets_searchable ON dsq.tickets USING GIN(searchable);
CREATE INDEX idx_dsq_tickets_embedding ON dsq.tickets
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- =============================================
-- TICKET MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES dsq.tickets(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- customer, agent, system, ai
    sender_id UUID, -- customer_id or agent_id
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text', -- text, html, markdown
    is_internal BOOLEAN DEFAULT false, -- Internal note vs customer-visible
    is_ai_generated BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dsq_ticket_messages_ticket ON dsq.ticket_messages(ticket_id);
CREATE INDEX idx_dsq_ticket_messages_sender ON dsq.ticket_messages(sender_type, sender_id);
CREATE INDEX idx_dsq_ticket_messages_created ON dsq.ticket_messages(created_at);

-- =============================================
-- CONVERSATIONS TABLE (Live Chat)
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES dsq.tickets(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES dsq.customers(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES dsq.agents(id) ON DELETE SET NULL,
    channel VARCHAR(50) DEFAULT 'chat', -- chat, phone, video
    status VARCHAR(50) DEFAULT 'active', -- waiting, active, resolved, abandoned
    queue_position INTEGER,
    wait_time_seconds INTEGER,
    duration_seconds INTEGER,
    message_count INTEGER DEFAULT 0,
    satisfaction_rating INTEGER,
    metadata JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    agent_joined_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);

CREATE INDEX idx_dsq_conversations_customer ON dsq.conversations(customer_id);
CREATE INDEX idx_dsq_conversations_agent ON dsq.conversations(agent_id);
CREATE INDEX idx_dsq_conversations_status ON dsq.conversations(status);
CREATE INDEX idx_dsq_conversations_started ON dsq.conversations(started_at DESC);

-- =============================================
-- CONVERSATION MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES dsq.conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- customer, agent, bot, system
    sender_id UUID,
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text',
    is_ai_generated BOOLEAN DEFAULT false,
    confidence_score DECIMAL(3,2),
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dsq_conv_messages_conv ON dsq.conversation_messages(conversation_id);
CREATE INDEX idx_dsq_conv_messages_created ON dsq.conversation_messages(created_at);

-- =============================================
-- ESCALATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES dsq.tickets(id) ON DELETE CASCADE,
    from_agent_id UUID REFERENCES dsq.agents(id) ON DELETE SET NULL,
    to_agent_id UUID REFERENCES dsq.agents(id) ON DELETE SET NULL,
    to_team VARCHAR(100),
    escalation_type VARCHAR(50) NOT NULL, -- technical, manager, specialist, urgent
    reason TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'high',
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined, resolved
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_dsq_escalations_ticket ON dsq.escalations(ticket_id);
CREATE INDEX idx_dsq_escalations_to_agent ON dsq.escalations(to_agent_id);
CREATE INDEX idx_dsq_escalations_status ON dsq.escalations(status);

-- =============================================
-- CANNED RESPONSES TABLE (with embedding)
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.canned_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    shortcut VARCHAR(50), -- e.g., /greeting, /thanks
    category VARCHAR(100),
    content TEXT NOT NULL,
    content_html TEXT,
    tags TEXT[] DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES dsq.agents(id) ON DELETE SET NULL,
    embedding vector(384), -- For smart suggestions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dsq_canned_responses_shortcut ON dsq.canned_responses(shortcut);
CREATE INDEX idx_dsq_canned_responses_category ON dsq.canned_responses(category);
CREATE INDEX idx_dsq_canned_responses_embedding ON dsq.canned_responses
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- =============================================
-- AGENT METRICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.agent_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES dsq.agents(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tickets_assigned INTEGER DEFAULT 0,
    tickets_resolved INTEGER DEFAULT 0,
    tickets_escalated INTEGER DEFAULT 0,
    avg_first_response_minutes DECIMAL(10,2),
    avg_resolution_minutes DECIMAL(10,2),
    sla_compliance_rate DECIMAL(5,2),
    customer_satisfaction_avg DECIMAL(3,2),
    messages_sent INTEGER DEFAULT 0,
    ai_suggestions_accepted INTEGER DEFAULT 0,
    ai_suggestions_rejected INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, date)
);

CREATE INDEX idx_dsq_agent_metrics_agent ON dsq.agent_metrics(agent_id);
CREATE INDEX idx_dsq_agent_metrics_date ON dsq.agent_metrics(date DESC);

-- =============================================
-- ANALYTICS TABLE (Aggregated Metrics)
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    metric_type VARCHAR(100) NOT NULL, -- daily_summary, hourly_volume, etc.
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    dimensions JSONB DEFAULT '{}', -- For slicing: {channel: 'email', priority: 'high'}
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, metric_type, metric_name, dimensions)
);

CREATE INDEX idx_dsq_analytics_date ON dsq.analytics(date DESC);
CREATE INDEX idx_dsq_analytics_type ON dsq.analytics(metric_type);
CREATE INDEX idx_dsq_analytics_dimensions ON dsq.analytics USING GIN(dimensions);

-- =============================================
-- ACTIVITY LOG TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dsq.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_type VARCHAR(20) NOT NULL, -- agent, customer, system, ai
    actor_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL, -- ticket, customer, article, etc.
    entity_id UUID,
    changes JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dsq_activity_entity ON dsq.activity_log(entity_type, entity_id);
CREATE INDEX idx_dsq_activity_actor ON dsq.activity_log(actor_type, actor_id);
CREATE INDEX idx_dsq_activity_created ON dsq.activity_log(created_at DESC);

-- =============================================
-- FUNCTIONS: Auto-update timestamps
-- =============================================
CREATE OR REPLACE FUNCTION dsq.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON dsq.customers
    FOR EACH ROW EXECUTE FUNCTION dsq.update_updated_at();

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON dsq.agents
    FOR EACH ROW EXECUTE FUNCTION dsq.update_updated_at();

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON dsq.tickets
    FOR EACH ROW EXECUTE FUNCTION dsq.update_updated_at();

CREATE TRIGGER update_kb_articles_updated_at
    BEFORE UPDATE ON dsq.kb_articles
    FOR EACH ROW EXECUTE FUNCTION dsq.update_updated_at();

CREATE TRIGGER update_canned_responses_updated_at
    BEFORE UPDATE ON dsq.canned_responses
    FOR EACH ROW EXECUTE FUNCTION dsq.update_updated_at();

-- =============================================
-- FUNCTIONS: Full-text search triggers
-- =============================================
CREATE OR REPLACE FUNCTION dsq.update_ticket_searchable()
RETURNS TRIGGER AS $$
BEGIN
    NEW.searchable := to_tsvector('english',
        COALESCE(NEW.subject, '') || ' ' ||
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.ticket_number, '') || ' ' ||
        COALESCE(array_to_string(NEW.tags, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_searchable
    BEFORE INSERT OR UPDATE ON dsq.tickets
    FOR EACH ROW EXECUTE FUNCTION dsq.update_ticket_searchable();

CREATE OR REPLACE FUNCTION dsq.update_kb_article_searchable()
RETURNS TRIGGER AS $$
BEGIN
    NEW.searchable := to_tsvector('english',
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.content, '') || ' ' ||
        COALESCE(NEW.summary, '') || ' ' ||
        COALESCE(array_to_string(NEW.tags, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kb_articles_searchable
    BEFORE INSERT OR UPDATE ON dsq.kb_articles
    FOR EACH ROW EXECUTE FUNCTION dsq.update_kb_article_searchable();

-- =============================================
-- FUNCTION: Sync to knowledge_items
-- =============================================
CREATE OR REPLACE FUNCTION dsq.sync_kb_article_to_knowledge()
RETURNS TRIGGER AS $$
DECLARE
    project_uuid UUID;
BEGIN
    -- Get the dSQ project ID
    SELECT id INTO project_uuid FROM public.projects WHERE code = 'dSQ';

    IF project_uuid IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.status = 'published' THEN
        INSERT INTO public.knowledge_items (
            project_id, source_table, source_id, item_type,
            title, content, summary, tags, embedding, created_at, updated_at
        )
        VALUES (
            project_uuid, 'dsq.kb_articles', NEW.id, 'article',
            NEW.title, NEW.content, NEW.summary, NEW.tags, NEW.embedding, NEW.created_at, NOW()
        )
        ON CONFLICT (source_table, source_id)
        DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            summary = EXCLUDED.summary,
            tags = EXCLUDED.tags,
            embedding = EXCLUDED.embedding,
            updated_at = NOW();
    ELSIF OLD IS NOT NULL AND OLD.status = 'published' AND NEW.status != 'published' THEN
        DELETE FROM public.knowledge_items
        WHERE source_table = 'dsq.kb_articles' AND source_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_kb_articles_to_knowledge
    AFTER INSERT OR UPDATE ON dsq.kb_articles
    FOR EACH ROW EXECUTE FUNCTION dsq.sync_kb_article_to_knowledge();

-- =============================================
-- FUNCTION: Generate ticket number
-- =============================================
CREATE OR REPLACE FUNCTION dsq.generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 6) AS INTEGER)), 999) + 1
    INTO next_num
    FROM dsq.tickets
    WHERE ticket_number LIKE 'DESK-%';

    NEW.ticket_number := 'DESK-' || LPAD(next_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_ticket_number
    BEFORE INSERT ON dsq.tickets
    FOR EACH ROW
    WHEN (NEW.ticket_number IS NULL)
    EXECUTE FUNCTION dsq.generate_ticket_number();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE dsq.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsq.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsq.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsq.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsq.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsq.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsq.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsq.escalations ENABLE ROW LEVEL SECURITY;

-- Public read access for published KB articles
CREATE POLICY "Public can view published articles" ON dsq.kb_articles
    FOR SELECT USING (status = 'published' AND is_public = true);

-- Authenticated users can view all data (for demo)
CREATE POLICY "Authenticated can view all customers" ON dsq.customers
    FOR ALL USING (true);

CREATE POLICY "Authenticated can view all tickets" ON dsq.tickets
    FOR ALL USING (true);

CREATE POLICY "Authenticated can view all ticket messages" ON dsq.ticket_messages
    FOR ALL USING (true);

CREATE POLICY "Authenticated can view all conversations" ON dsq.conversations
    FOR ALL USING (true);

CREATE POLICY "Authenticated can view all conversation messages" ON dsq.conversation_messages
    FOR ALL USING (true);

CREATE POLICY "Authenticated can view all agents" ON dsq.agents
    FOR ALL USING (true);

CREATE POLICY "Authenticated can view all kb articles" ON dsq.kb_articles
    FOR ALL USING (true);

CREATE POLICY "Authenticated can view all escalations" ON dsq.escalations
    FOR ALL USING (true);

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON SCHEMA dsq IS 'Support IQ (dSQ) - Customer support automation schema';
COMMENT ON TABLE dsq.customers IS 'Customer profiles with health scoring';
COMMENT ON TABLE dsq.tickets IS 'Support tickets with semantic search embeddings';
COMMENT ON TABLE dsq.kb_articles IS 'Knowledge base articles with semantic search';
COMMENT ON TABLE dsq.agents IS 'Support agent profiles and status tracking';
COMMENT ON TABLE dsq.escalations IS 'Ticket escalation tracking';
COMMENT ON TABLE dsq.analytics IS 'Aggregated support metrics for dashboards';
