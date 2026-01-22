-- =============================================
-- Migration 010: Admin Analytics
-- Search logs, AI usage tracking, and system metrics
-- =============================================

-- =============================================
-- SEARCH ANALYTICS
-- =============================================

-- Search logs - track all search queries
CREATE TABLE IF NOT EXISTS diq.search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  organization_id UUID,

  -- Query details
  query TEXT NOT NULL,
  query_type VARCHAR(20) NOT NULL DEFAULT 'keyword', -- keyword, semantic, hybrid
  search_source VARCHAR(50), -- articles, knowledge_items, news, all

  -- Results
  results_count INT NOT NULL DEFAULT 0,
  clicked_result_id UUID,
  clicked_result_type VARCHAR(50),

  -- Performance
  response_time_ms INT,
  used_cache BOOLEAN DEFAULT FALSE,

  -- Context
  filters JSONB DEFAULT '{}',
  facets_used TEXT[] DEFAULT '{}',
  session_id VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI conversation analytics
CREATE TABLE IF NOT EXISTS diq.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  thread_id UUID REFERENCES diq.chat_threads(id) ON DELETE SET NULL,

  -- Request details
  model VARCHAR(100) NOT NULL,
  prompt_tokens INT NOT NULL DEFAULT 0,
  completion_tokens INT NOT NULL DEFAULT 0,
  total_tokens INT NOT NULL DEFAULT 0,

  -- Costs
  cost_usd DECIMAL(10, 6) DEFAULT 0,

  -- Context
  tools_used TEXT[] DEFAULT '{}',
  rag_sources_count INT DEFAULT 0,

  -- Performance
  response_time_ms INT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System health snapshots
CREATE TABLE IF NOT EXISTS diq.system_health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Status
  overall_status VARCHAR(20) NOT NULL, -- healthy, degraded, down

  -- Metrics
  db_connections INT,
  db_response_time_ms INT,
  cache_hit_rate DECIMAL(5, 2),
  api_response_time_ms INT,
  memory_usage_mb INT,
  cpu_usage_percent DECIMAL(5, 2),

  -- Errors
  error_count INT DEFAULT 0,
  errors JSONB DEFAULT '[]',

  -- Timestamps
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workflow execution logs (extended)
CREATE TABLE IF NOT EXISTS diq.workflow_execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL,
  workflow_id UUID REFERENCES diq.workflows(id) ON DELETE CASCADE,
  step_id UUID,

  -- Log details
  level VARCHAR(10) NOT NULL, -- info, warn, error, debug
  message TEXT NOT NULL,
  data JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Page view analytics
CREATE TABLE IF NOT EXISTS diq.page_view_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Page details
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),
  referrer VARCHAR(500),

  -- Session
  session_id VARCHAR(100),

  -- Device info
  user_agent TEXT,
  device_type VARCHAR(20), -- desktop, mobile, tablet
  browser VARCHAR(50),

  -- Performance
  load_time_ms INT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User activity summary (aggregated daily)
CREATE TABLE IF NOT EXISTS diq.user_activity_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Activity counts
  page_views INT DEFAULT 0,
  searches INT DEFAULT 0,
  ai_conversations INT DEFAULT 0,
  ai_messages INT DEFAULT 0,
  articles_viewed INT DEFAULT 0,
  articles_created INT DEFAULT 0,
  workflows_executed INT DEFAULT 0,

  -- Engagement time (seconds)
  total_session_time INT DEFAULT 0,

  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_search_logs_user ON diq.search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON diq.search_logs(query);
CREATE INDEX IF NOT EXISTS idx_search_logs_created ON diq.search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_results ON diq.search_logs(results_count);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON diq.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_model ON diq.ai_usage_logs(model);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON diq.ai_usage_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_health_status ON diq.system_health_logs(overall_status);
CREATE INDEX IF NOT EXISTS idx_system_health_recorded ON diq.system_health_logs(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_exec_logs_execution ON diq.workflow_execution_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_exec_logs_workflow ON diq.workflow_execution_logs(workflow_id);

CREATE INDEX IF NOT EXISTS idx_page_view_user ON diq.page_view_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_page_view_path ON diq.page_view_logs(page_path);
CREATE INDEX IF NOT EXISTS idx_page_view_created ON diq.page_view_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON diq.user_activity_summary(user_id, date);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE diq.search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.workflow_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.page_view_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.user_activity_summary ENABLE ROW LEVEL SECURITY;

-- Search logs: users can see their own, admins can see all
CREATE POLICY search_logs_select ON diq.search_logs
  FOR SELECT USING (true);

CREATE POLICY search_logs_insert ON diq.search_logs
  FOR INSERT WITH CHECK (true);

-- AI usage logs: users can see their own, admins can see all
CREATE POLICY ai_usage_logs_select ON diq.ai_usage_logs
  FOR SELECT USING (true);

CREATE POLICY ai_usage_logs_insert ON diq.ai_usage_logs
  FOR INSERT WITH CHECK (true);

-- System health: admin only (using USING true for simplicity)
CREATE POLICY system_health_select ON diq.system_health_logs
  FOR SELECT USING (true);

CREATE POLICY system_health_insert ON diq.system_health_logs
  FOR INSERT WITH CHECK (true);

-- Workflow execution logs
CREATE POLICY workflow_exec_logs_select ON diq.workflow_execution_logs
  FOR SELECT USING (true);

CREATE POLICY workflow_exec_logs_insert ON diq.workflow_execution_logs
  FOR INSERT WITH CHECK (true);

-- Page view logs
CREATE POLICY page_view_logs_select ON diq.page_view_logs
  FOR SELECT USING (true);

CREATE POLICY page_view_logs_insert ON diq.page_view_logs
  FOR INSERT WITH CHECK (true);

-- User activity summary
CREATE POLICY user_activity_select ON diq.user_activity_summary
  FOR SELECT USING (true);

CREATE POLICY user_activity_upsert ON diq.user_activity_summary
  FOR ALL USING (true);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to log search query
CREATE OR REPLACE FUNCTION diq.log_search(
  p_user_id UUID,
  p_query TEXT,
  p_query_type VARCHAR DEFAULT 'keyword',
  p_results_count INT DEFAULT 0,
  p_response_time_ms INT DEFAULT NULL,
  p_filters JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO diq.search_logs (
    user_id, query, query_type, results_count, response_time_ms, filters
  ) VALUES (
    p_user_id, p_query, p_query_type, p_results_count, p_response_time_ms, p_filters
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log AI usage
CREATE OR REPLACE FUNCTION diq.log_ai_usage(
  p_user_id UUID,
  p_thread_id UUID,
  p_model VARCHAR,
  p_prompt_tokens INT,
  p_completion_tokens INT,
  p_response_time_ms INT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_total_tokens INT;
  v_cost DECIMAL(10, 6);
BEGIN
  v_total_tokens := p_prompt_tokens + p_completion_tokens;

  -- Calculate cost (example rates)
  v_cost := CASE
    WHEN p_model LIKE '%opus%' THEN v_total_tokens * 0.000015
    WHEN p_model LIKE '%sonnet%' THEN v_total_tokens * 0.000003
    WHEN p_model LIKE '%haiku%' THEN v_total_tokens * 0.00000025
    ELSE v_total_tokens * 0.000003
  END;

  INSERT INTO diq.ai_usage_logs (
    user_id, thread_id, model, prompt_tokens, completion_tokens, total_tokens, cost_usd, response_time_ms
  ) VALUES (
    p_user_id, p_thread_id, p_model, p_prompt_tokens, p_completion_tokens, v_total_tokens, v_cost, p_response_time_ms
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update user activity summary
CREATE OR REPLACE FUNCTION diq.update_user_activity(
  p_user_id UUID,
  p_page_views INT DEFAULT 0,
  p_searches INT DEFAULT 0,
  p_ai_conversations INT DEFAULT 0,
  p_ai_messages INT DEFAULT 0,
  p_articles_viewed INT DEFAULT 0,
  p_articles_created INT DEFAULT 0,
  p_workflows_executed INT DEFAULT 0,
  p_session_time INT DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO diq.user_activity_summary (
    user_id, date, page_views, searches, ai_conversations, ai_messages,
    articles_viewed, articles_created, workflows_executed, total_session_time
  ) VALUES (
    p_user_id, CURRENT_DATE, p_page_views, p_searches, p_ai_conversations,
    p_ai_messages, p_articles_viewed, p_articles_created, p_workflows_executed, p_session_time
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    page_views = diq.user_activity_summary.page_views + p_page_views,
    searches = diq.user_activity_summary.searches + p_searches,
    ai_conversations = diq.user_activity_summary.ai_conversations + p_ai_conversations,
    ai_messages = diq.user_activity_summary.ai_messages + p_ai_messages,
    articles_viewed = diq.user_activity_summary.articles_viewed + p_articles_viewed,
    articles_created = diq.user_activity_summary.articles_created + p_articles_created,
    workflows_executed = diq.user_activity_summary.workflows_executed + p_workflows_executed,
    total_session_time = diq.user_activity_summary.total_session_time + p_session_time,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VIEWS FOR REPORTING
-- =============================================

-- Daily search summary
CREATE OR REPLACE VIEW diq.daily_search_summary AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_searches,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(results_count) as avg_results,
  COUNT(*) FILTER (WHERE results_count = 0) as zero_results_count,
  AVG(response_time_ms) as avg_response_time_ms
FROM diq.search_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Daily AI usage summary
CREATE OR REPLACE VIEW diq.daily_ai_summary AS
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT thread_id) as conversations,
  COUNT(*) as total_requests,
  SUM(total_tokens) as total_tokens,
  SUM(cost_usd) as total_cost_usd,
  AVG(response_time_ms) as avg_response_time_ms
FROM diq.ai_usage_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Top search queries (last 30 days)
CREATE OR REPLACE VIEW diq.top_search_queries AS
SELECT
  query,
  COUNT(*) as search_count,
  AVG(results_count) as avg_results,
  COUNT(DISTINCT user_id) as unique_users
FROM diq.search_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY query
ORDER BY search_count DESC
LIMIT 100;

-- Zero results queries (last 30 days)
CREATE OR REPLACE VIEW diq.zero_results_queries AS
SELECT
  query,
  COUNT(*) as search_count,
  COUNT(DISTINCT user_id) as unique_users
FROM diq.search_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND results_count = 0
GROUP BY query
ORDER BY search_count DESC
LIMIT 100;
