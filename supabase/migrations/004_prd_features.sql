-- Migration: PRD Feature Enhancements
-- Version: 004
-- Description: Add tables for channels, permissions, dashboard widgets, and favorites

-- ============================================
-- CHANNELS (Discussion Spaces)
-- ============================================

CREATE TABLE IF NOT EXISTS diq.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  department_id UUID REFERENCES diq.departments(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  visibility TEXT DEFAULT 'department' CHECK (visibility IN ('public', 'department', 'private')),
  is_archived BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diq.channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES diq.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

CREATE TABLE IF NOT EXISTS diq.channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES diq.channels(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES diq.channel_messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  reactions JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_channel_messages_channel ON diq.channel_messages(channel_id);
CREATE INDEX idx_channel_messages_parent ON diq.channel_messages(parent_id);
CREATE INDEX idx_channel_members_user ON diq.channel_members(user_id);

-- ============================================
-- PERMISSIONS MATRIX
-- ============================================

CREATE TABLE IF NOT EXISTS diq.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('article', 'channel', 'workflow', 'department', 'integration')),
  resource_id UUID,
  department_id UUID REFERENCES diq.departments(id) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_admin BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_permissions_role ON diq.permissions(role);
CREATE INDEX idx_permissions_resource ON diq.permissions(resource_type, resource_id);

-- ============================================
-- DASHBOARD WIDGETS (Customizable)
-- ============================================

CREATE TABLE IF NOT EXISTS diq.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN (
    'news_feed', 'events', 'activity', 'trending',
    'tasks', 'calendar', 'quick_actions', 'meetings',
    'bookmarks', 'team_updates', 'analytics', 'custom'
  )),
  title TEXT,
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "w": 1, "h": 1}',
  config JSONB DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dashboard_widgets_user ON diq.dashboard_widgets(user_id);

-- ============================================
-- FAVORITES / STARRED ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS diq.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('workflow', 'article', 'channel', 'employee', 'search_query')),
  item_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX idx_favorites_user ON diq.favorites(user_id);
CREATE INDEX idx_favorites_item ON diq.favorites(item_type, item_id);

-- ============================================
-- FEATURED ITEMS (Admin-curated)
-- ============================================

CREATE TABLE IF NOT EXISTS diq.featured_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL CHECK (item_type IN ('workflow', 'article', 'channel')),
  item_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  featured_by UUID REFERENCES public.users(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_featured_items_type ON diq.featured_items(item_type);
CREATE INDEX idx_featured_items_active ON diq.featured_items(is_active);

-- ============================================
-- CHAT SPACES (Collaborative Chats)
-- ============================================

CREATE TABLE IF NOT EXISTS diq.chat_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diq.chat_space_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES diq.chat_spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

-- Link threads to spaces
ALTER TABLE diq.chat_threads ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES diq.chat_spaces(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_chat_threads_space ON diq.chat_threads(space_id);

-- ============================================
-- SCHEDULED WORKFLOWS
-- ============================================

CREATE TABLE IF NOT EXISTS diq.workflow_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES diq.workflows(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('once', 'hourly', 'daily', 'weekly', 'monthly', 'cron')),
  cron_expression TEXT,
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  run_count INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_schedules_next ON diq.workflow_schedules(next_run_at) WHERE is_active = true;

-- ============================================
-- INTEGRATIONS / APP CONNECTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS diq.app_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  category TEXT CHECK (category IN ('productivity', 'communication', 'storage', 'analytics', 'crm', 'hr', 'other')),
  description TEXT,
  auth_type TEXT CHECK (auth_type IN ('oauth2', 'api_key', 'basic', 'none')),
  config_schema JSONB DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diq.user_app_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES diq.app_connections(id) ON DELETE CASCADE,
  credentials JSONB DEFAULT '{}', -- encrypted in production
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

-- Insert default app connections for shortcuts bar
INSERT INTO diq.app_connections (name, slug, icon_url, category, description, auth_type, sort_order) VALUES
  ('Google Drive', 'google-drive', '/icons/google-drive.svg', 'storage', 'Access Google Drive files', 'oauth2', 1),
  ('Slack', 'slack', '/icons/slack.svg', 'communication', 'Connect with Slack', 'oauth2', 2),
  ('Zoom', 'zoom', '/icons/zoom.svg', 'communication', 'Join Zoom meetings', 'oauth2', 3),
  ('Salesforce', 'salesforce', '/icons/salesforce.svg', 'crm', 'Access Salesforce data', 'oauth2', 4),
  ('Confluence', 'confluence', '/icons/confluence.svg', 'productivity', 'Search Confluence docs', 'oauth2', 5),
  ('Jira', 'jira', '/icons/jira.svg', 'productivity', 'Track Jira issues', 'oauth2', 6),
  ('LinkedIn', 'linkedin', '/icons/linkedin.svg', 'communication', 'LinkedIn integration', 'oauth2', 7),
  ('GitHub', 'github', '/icons/github.svg', 'productivity', 'Access GitHub repos', 'oauth2', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- MEETINGS INTEGRATION
-- ============================================

CREATE TABLE IF NOT EXISTS diq.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  organizer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  meeting_url TEXT,
  provider TEXT CHECK (provider IN ('zoom', 'teams', 'meet', 'other')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  attendees JSONB DEFAULT '[]',
  external_id TEXT, -- ID from calendar provider
  source TEXT, -- 'google', 'outlook', 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meetings_start ON diq.meetings(start_time);
CREATE INDEX idx_meetings_organizer ON diq.meetings(organizer_id);

-- ============================================
-- SEARCH ANALYTICS (for faceted counts)
-- ============================================

CREATE TABLE IF NOT EXISTS diq.search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  result_counts JSONB DEFAULT '{}', -- {"article": 42, "employee": 15, ...}
  total_results INTEGER DEFAULT 0,
  search_method TEXT, -- 'keyword', 'semantic', 'hybrid'
  response_time_ms INTEGER,
  clicked_result_id UUID,
  clicked_result_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_analytics_user ON diq.search_analytics(user_id);
CREATE INDEX idx_search_analytics_query ON diq.search_analytics(query);
CREATE INDEX idx_search_analytics_created ON diq.search_analytics(created_at);

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Get search result counts by type
CREATE OR REPLACE FUNCTION diq.get_search_facet_counts(
  search_query TEXT,
  user_dept_id UUID DEFAULT NULL
)
RETURNS TABLE (
  result_type TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ki.type as result_type,
    COUNT(*)::BIGINT as count
  FROM public.knowledge_items ki
  WHERE
    ki.project_id = (SELECT id FROM public.projects WHERE code = 'dIQ')
    AND (
      ki.title ILIKE '%' || search_query || '%'
      OR ki.content ILIKE '%' || search_query || '%'
    )
  GROUP BY ki.type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Get user's favorite workflows
CREATE OR REPLACE FUNCTION diq.get_favorite_workflows(p_user_id UUID)
RETURNS SETOF diq.workflows AS $$
BEGIN
  RETURN QUERY
  SELECT w.*
  FROM diq.workflows w
  INNER JOIN diq.favorites f ON f.item_id = w.id AND f.item_type = 'workflow'
  WHERE f.user_id = p_user_id
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get featured workflows
CREATE OR REPLACE FUNCTION diq.get_featured_workflows()
RETURNS TABLE (
  workflow_id UUID,
  workflow_name TEXT,
  workflow_description TEXT,
  featured_title TEXT,
  featured_description TEXT,
  category TEXT,
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id as workflow_id,
    w.name as workflow_name,
    w.description as workflow_description,
    fi.title as featured_title,
    fi.description as featured_description,
    fi.category,
    fi.display_order
  FROM diq.featured_items fi
  INNER JOIN diq.workflows w ON w.id = fi.item_id
  WHERE fi.item_type = 'workflow'
    AND fi.is_active = true
    AND (fi.start_date IS NULL OR fi.start_date <= NOW())
    AND (fi.end_date IS NULL OR fi.end_date >= NOW())
  ORDER BY fi.display_order ASC;
END;
$$ LANGUAGE plpgsql;

-- Get upcoming meetings
CREATE OR REPLACE FUNCTION diq.get_upcoming_meetings(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS SETOF diq.meetings AS $$
BEGIN
  RETURN QUERY
  SELECT m.*
  FROM diq.meetings m
  WHERE m.start_time >= NOW()
    AND (
      m.organizer_id = p_user_id
      OR m.attendees @> jsonb_build_array(jsonb_build_object('user_id', p_user_id::TEXT))
    )
  ORDER BY m.start_time ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE diq.channels IS 'Discussion channels/spaces for team collaboration';
COMMENT ON TABLE diq.permissions IS 'Granular role-based permissions matrix';
COMMENT ON TABLE diq.dashboard_widgets IS 'User-customizable dashboard widget configurations';
COMMENT ON TABLE diq.favorites IS 'User-starred/favorited items across the platform';
COMMENT ON TABLE diq.featured_items IS 'Admin-curated featured content';
COMMENT ON TABLE diq.chat_spaces IS 'Collaborative chat spaces for team discussions';
COMMENT ON TABLE diq.workflow_schedules IS 'Scheduled workflow executions';
COMMENT ON TABLE diq.app_connections IS 'Third-party app integrations';
COMMENT ON TABLE diq.meetings IS 'Calendar meetings from integrated providers';
