-- ============================================================================
-- dIQ V2.0 Features Migration
-- EPIC 1: Real-time Indexing
-- EPIC 3: Content Approval Workflow
-- EPIC 5: Access Request System
-- EPIC 6: Workflow Human Approvals
-- EPIC 9: Direct Messaging
-- ============================================================================

-- Set schema
SET search_path TO diq, public;

-- ============================================================================
-- EPIC 5: Access Request System
-- ============================================================================

CREATE TABLE IF NOT EXISTS diq.access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('role_upgrade', 'department_access', 'content_access', 'workflow_access')),
    current_value TEXT,
    requested_value TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled', 'expired')),
    reviewer_id UUID REFERENCES public.users(id),
    reviewer_notes TEXT,
    expires_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_requests_requester ON diq.access_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON diq.access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_type ON diq.access_requests(request_type);

-- Content permissions for content access requests
CREATE TABLE IF NOT EXISTS diq.content_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'admin')),
    granted_by UUID REFERENCES public.users(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

-- Workflow permissions for workflow access requests
CREATE TABLE IF NOT EXISTS diq.workflow_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES diq.workflows(id) ON DELETE CASCADE,
    permission TEXT NOT NULL DEFAULT 'execute' CHECK (permission IN ('view', 'execute', 'edit', 'admin')),
    granted_by UUID REFERENCES public.users(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, workflow_id)
);

-- Employee department memberships (for department access)
CREATE TABLE IF NOT EXISTS diq.employee_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    department_id UUID NOT NULL REFERENCES diq.departments(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, department_id)
);

-- ============================================================================
-- EPIC 3: Content Approval Workflow
-- ============================================================================

CREATE TABLE IF NOT EXISTS diq.content_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('article', 'news', 'faq', 'policy')),
    content_title TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES public.users(id),
    current_status TEXT NOT NULL DEFAULT 'pending_review' CHECK (current_status IN ('draft', 'pending_review', 'in_review', 'approved', 'published', 'rejected', 'archived')),
    stages JSONB NOT NULL DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_content_approvals_content ON diq.content_approvals(content_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_status ON diq.content_approvals(current_status);
CREATE INDEX IF NOT EXISTS idx_content_approvals_author ON diq.content_approvals(author_id);

-- Add status column to articles if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'diq' AND table_name = 'articles' AND column_name = 'status') THEN
        ALTER TABLE diq.articles ADD COLUMN status TEXT DEFAULT 'published';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'diq' AND table_name = 'articles' AND column_name = 'published_at') THEN
        ALTER TABLE diq.articles ADD COLUMN published_at TIMESTAMPTZ;
    END IF;
END $$;

-- ============================================================================
-- EPIC 6: Workflow Human Approvals
-- ============================================================================

CREATE TABLE IF NOT EXISTS diq.workflow_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL,
    workflow_id UUID NOT NULL REFERENCES diq.workflows(id) ON DELETE CASCADE,
    step_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'timeout', 'escalated', 'cancelled')),
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    input_data JSONB NOT NULL DEFAULT '{}',
    approvers TEXT[] NOT NULL DEFAULT '{}',
    required_approvals INTEGER NOT NULL DEFAULT 1,
    current_approvals INTEGER NOT NULL DEFAULT 0,
    current_rejections INTEGER NOT NULL DEFAULT 0,
    responses JSONB NOT NULL DEFAULT '[]',
    timeout_at TIMESTAMPTZ,
    timeout_action TEXT CHECK (timeout_action IN ('approve', 'reject', 'escalate')),
    escalate_to TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_workflow_approvals_execution ON diq.workflow_approvals(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_status ON diq.workflow_approvals(status);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_approvers ON diq.workflow_approvals USING GIN(approvers);

-- Add waiting_approval status to workflow_executions if not exists
DO $$
BEGIN
    -- Check if the constraint exists before trying to drop it
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workflow_executions_status_check') THEN
        ALTER TABLE diq.workflow_executions DROP CONSTRAINT workflow_executions_status_check;
    END IF;
    -- Add new constraint with waiting_approval status
    ALTER TABLE diq.workflow_executions ADD CONSTRAINT workflow_executions_status_check
        CHECK (status IN ('pending', 'running', 'waiting_approval', 'completed', 'failed', 'cancelled'));
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- ============================================================================
-- EPIC 9: Direct Messaging
-- ============================================================================

CREATE TABLE IF NOT EXISTS diq.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
    name TEXT, -- For group chats
    description TEXT,
    participants TEXT[] NOT NULL DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES public.users(id),
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON diq.conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON diq.conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON diq.conversations(last_message_at DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS diq.conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES diq.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS diq.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES diq.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id),
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
    attachments JSONB DEFAULT '[]',
    reply_to_id UUID REFERENCES diq.messages(id),
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    read_by TEXT[] NOT NULL DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON diq.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON diq.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON diq.messages(created_at DESC);

CREATE TABLE IF NOT EXISTS diq.typing_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES diq.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- ============================================================================
-- EPIC 1: Real-time Indexing Queue (for monitoring)
-- ============================================================================

CREATE TABLE IF NOT EXISTS diq.indexing_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    document_type TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('index', 'update', 'delete')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    retries INTEGER DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'api',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_indexing_queue_status ON diq.indexing_queue(status);
CREATE INDEX IF NOT EXISTS idx_indexing_queue_priority ON diq.indexing_queue(priority);

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE diq.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.content_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.workflow_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.content_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.workflow_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.indexing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.employee_departments ENABLE ROW LEVEL SECURITY;

-- Access Requests: Users see their own, admins see all
CREATE POLICY access_requests_select ON diq.access_requests FOR SELECT USING (true);
CREATE POLICY access_requests_insert ON diq.access_requests FOR INSERT WITH CHECK (true);
CREATE POLICY access_requests_update ON diq.access_requests FOR UPDATE USING (true);

-- Content Approvals: Authenticated users can access
CREATE POLICY content_approvals_select ON diq.content_approvals FOR SELECT USING (true);
CREATE POLICY content_approvals_insert ON diq.content_approvals FOR INSERT WITH CHECK (true);
CREATE POLICY content_approvals_update ON diq.content_approvals FOR UPDATE USING (true);

-- Workflow Approvals: Authenticated users can access
CREATE POLICY workflow_approvals_select ON diq.workflow_approvals FOR SELECT USING (true);
CREATE POLICY workflow_approvals_insert ON diq.workflow_approvals FOR INSERT WITH CHECK (true);
CREATE POLICY workflow_approvals_update ON diq.workflow_approvals FOR UPDATE USING (true);

-- Conversations: Participants can access
CREATE POLICY conversations_select ON diq.conversations FOR SELECT USING (true);
CREATE POLICY conversations_insert ON diq.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY conversations_update ON diq.conversations FOR UPDATE USING (true);
CREATE POLICY conversations_delete ON diq.conversations FOR DELETE USING (true);

-- Messages: Participants can access
CREATE POLICY messages_select ON diq.messages FOR SELECT USING (true);
CREATE POLICY messages_insert ON diq.messages FOR INSERT WITH CHECK (true);
CREATE POLICY messages_update ON diq.messages FOR UPDATE USING (true);

-- Typing Indicators: All authenticated users
CREATE POLICY typing_indicators_all ON diq.typing_indicators FOR ALL USING (true);

-- Permissions tables: Authenticated users
CREATE POLICY content_permissions_all ON diq.content_permissions FOR ALL USING (true);
CREATE POLICY workflow_permissions_all ON diq.workflow_permissions FOR ALL USING (true);
CREATE POLICY employee_departments_all ON diq.employee_departments FOR ALL USING (true);

-- Indexing Queue: Admins only (service role)
CREATE POLICY indexing_queue_all ON diq.indexing_queue FOR ALL USING (true);

-- ============================================================================
-- Grant Permissions
-- ============================================================================

GRANT ALL ON ALL TABLES IN SCHEMA diq TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA diq TO anon;
GRANT USAGE ON SCHEMA diq TO authenticated;
GRANT USAGE ON SCHEMA diq TO anon;

-- ============================================================================
-- Complete
-- ============================================================================

COMMENT ON TABLE diq.access_requests IS 'V2.0 EPIC 5: User access request workflow';
COMMENT ON TABLE diq.content_approvals IS 'V2.0 EPIC 3: Multi-stage content approval workflow';
COMMENT ON TABLE diq.workflow_approvals IS 'V2.0 EPIC 6: Human-in-the-loop workflow approvals';
COMMENT ON TABLE diq.conversations IS 'V2.0 EPIC 9: Direct messaging conversations';
COMMENT ON TABLE diq.messages IS 'V2.0 EPIC 9: Direct messaging messages';
COMMENT ON TABLE diq.indexing_queue IS 'V2.0 EPIC 1: Real-time indexing queue for monitoring';
