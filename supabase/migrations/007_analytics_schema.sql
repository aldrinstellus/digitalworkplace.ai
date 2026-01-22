-- =====================================================
-- Analytics Schema for Digital Workplace AI
-- Migration: 007_analytics_schema.sql
-- Created: 2026-01-22
-- Purpose: Track user sessions, page views, and cross-app navigation
-- =====================================================

-- =====================================================
-- 1. USER SESSIONS TABLE
-- Tracks login/logout sessions with duration and device info
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    clerk_id VARCHAR(255) NOT NULL,

    -- Session timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_seconds INTEGER DEFAULT 0,

    -- Device & browser info
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(100),
    os VARCHAR(100),

    -- Location (from IP geolocation)
    country VARCHAR(100),
    city VARCHAR(100),

    -- Session state
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_clerk_id ON public.user_sessions(clerk_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON public.user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_sessions_ended_at ON public.user_sessions(ended_at) WHERE ended_at IS NOT NULL;

-- =====================================================
-- 2. PAGE VIEWS TABLE
-- Tracks individual page visits with time-on-page
-- =====================================================
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.user_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Page info
    project_code VARCHAR(10) NOT NULL, -- 'main', 'dIQ', 'dSQ', 'dCQ', 'dTQ'
    page_path VARCHAR(500) NOT NULL,
    page_title VARCHAR(255),

    -- Referrer
    referrer VARCHAR(500),
    referrer_project_code VARCHAR(10),

    -- Timing
    entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    exited_at TIMESTAMPTZ,
    time_on_page_seconds INTEGER DEFAULT 0,

    -- Interaction metrics
    scroll_depth_percent INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON public.page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_project_code ON public.page_views(project_code);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_entered_at ON public.page_views(entered_at);
CREATE INDEX IF NOT EXISTS idx_page_views_project_entered ON public.page_views(project_code, entered_at);

-- =====================================================
-- 3. CROSS-APP NAVIGATION TABLE
-- Tracks navigation between different sub-apps
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cross_app_navigation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.user_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Navigation flow
    from_project_code VARCHAR(10) NOT NULL, -- 'main', 'dIQ', 'dSQ', 'dCQ', 'dTQ'
    from_page_path VARCHAR(500),
    to_project_code VARCHAR(10) NOT NULL,
    to_page_path VARCHAR(500),

    -- Timing
    navigated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    time_in_source_seconds INTEGER DEFAULT 0,

    -- Navigation type
    navigation_type VARCHAR(50) DEFAULT 'click', -- 'click', 'redirect', 'direct', 'back'

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for flow analysis
CREATE INDEX IF NOT EXISTS idx_cross_app_nav_session_id ON public.cross_app_navigation(session_id);
CREATE INDEX IF NOT EXISTS idx_cross_app_nav_user_id ON public.cross_app_navigation(user_id);
CREATE INDEX IF NOT EXISTS idx_cross_app_nav_from_to ON public.cross_app_navigation(from_project_code, to_project_code);
CREATE INDEX IF NOT EXISTS idx_cross_app_nav_navigated_at ON public.cross_app_navigation(navigated_at);

-- =====================================================
-- 4. ANALYTICS AGGREGATES TABLE (for faster dashboard queries)
-- Pre-computed daily aggregates
-- =====================================================
CREATE TABLE IF NOT EXISTS public.analytics_daily_aggregates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    project_code VARCHAR(10) NOT NULL,

    -- User metrics
    total_sessions INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,

    -- Time metrics
    total_time_seconds BIGINT DEFAULT 0,
    avg_session_duration_seconds INTEGER DEFAULT 0,

    -- Page metrics
    total_page_views INTEGER DEFAULT 0,
    unique_pages_viewed INTEGER DEFAULT 0,
    avg_pages_per_session DECIMAL(10, 2) DEFAULT 0,

    -- Engagement
    avg_scroll_depth DECIMAL(5, 2) DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,

    -- Cross-app
    inbound_navigations INTEGER DEFAULT 0,
    outbound_navigations INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure one row per date/project
    CONSTRAINT unique_daily_aggregate UNIQUE (date, project_code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_aggregates_date ON public.analytics_daily_aggregates(date);
CREATE INDEX IF NOT EXISTS idx_daily_aggregates_project ON public.analytics_daily_aggregates(project_code);
CREATE INDEX IF NOT EXISTS idx_daily_aggregates_date_project ON public.analytics_daily_aggregates(date, project_code);

-- =====================================================
-- 5. UPDATE TRIGGERS
-- Auto-update updated_at timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_sessions_updated_at ON public.user_sessions;
CREATE TRIGGER trigger_user_sessions_updated_at
    BEFORE UPDATE ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_updated_at();

DROP TRIGGER IF EXISTS trigger_daily_aggregates_updated_at ON public.analytics_daily_aggregates;
CREATE TRIGGER trigger_daily_aggregates_updated_at
    BEFORE UPDATE ON public.analytics_daily_aggregates
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_updated_at();

-- =====================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- Super admins can read all, users can insert their own data
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_app_navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_aggregates ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_clerk_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE clerk_id = user_clerk_id
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USER SESSIONS POLICIES
-- Super admins can read all sessions
CREATE POLICY "Super admins can read all sessions"
    ON public.user_sessions
    FOR SELECT
    USING (
        public.is_super_admin(auth.jwt() ->> 'sub')
        OR clerk_id = (auth.jwt() ->> 'sub')
    );

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
    ON public.user_sessions
    FOR INSERT
    WITH CHECK (clerk_id = (auth.jwt() ->> 'sub'));

-- Users can update their own sessions (for heartbeat, end time)
CREATE POLICY "Users can update own sessions"
    ON public.user_sessions
    FOR UPDATE
    USING (clerk_id = (auth.jwt() ->> 'sub'));

-- PAGE VIEWS POLICIES
-- Super admins can read all page views
CREATE POLICY "Super admins can read all page views"
    ON public.page_views
    FOR SELECT
    USING (
        public.is_super_admin(auth.jwt() ->> 'sub')
        OR user_id IN (SELECT id FROM public.users WHERE clerk_id = (auth.jwt() ->> 'sub'))
    );

-- Users can insert their own page views
CREATE POLICY "Users can insert own page views"
    ON public.page_views
    FOR INSERT
    WITH CHECK (
        user_id IN (SELECT id FROM public.users WHERE clerk_id = (auth.jwt() ->> 'sub'))
    );

-- Users can update their own page views
CREATE POLICY "Users can update own page views"
    ON public.page_views
    FOR UPDATE
    USING (
        user_id IN (SELECT id FROM public.users WHERE clerk_id = (auth.jwt() ->> 'sub'))
    );

-- CROSS-APP NAVIGATION POLICIES
-- Super admins can read all navigation
CREATE POLICY "Super admins can read all navigation"
    ON public.cross_app_navigation
    FOR SELECT
    USING (
        public.is_super_admin(auth.jwt() ->> 'sub')
        OR user_id IN (SELECT id FROM public.users WHERE clerk_id = (auth.jwt() ->> 'sub'))
    );

-- Users can insert their own navigation
CREATE POLICY "Users can insert own navigation"
    ON public.cross_app_navigation
    FOR INSERT
    WITH CHECK (
        user_id IN (SELECT id FROM public.users WHERE clerk_id = (auth.jwt() ->> 'sub'))
    );

-- DAILY AGGREGATES POLICIES
-- Only super admins can read aggregates
CREATE POLICY "Super admins can read aggregates"
    ON public.analytics_daily_aggregates
    FOR SELECT
    USING (public.is_super_admin(auth.jwt() ->> 'sub'));

-- Service role can insert/update aggregates (for background jobs)
CREATE POLICY "Service role can manage aggregates"
    ON public.analytics_daily_aggregates
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- 7. VIEWS FOR COMMON ANALYTICS QUERIES
-- =====================================================

-- Active users view (24h, 7d, 30d)
CREATE OR REPLACE VIEW public.v_active_users AS
SELECT
    COUNT(DISTINCT CASE WHEN us.last_heartbeat_at > NOW() - INTERVAL '24 hours' THEN us.user_id END) AS active_24h,
    COUNT(DISTINCT CASE WHEN us.last_heartbeat_at > NOW() - INTERVAL '7 days' THEN us.user_id END) AS active_7d,
    COUNT(DISTINCT CASE WHEN us.last_heartbeat_at > NOW() - INTERVAL '30 days' THEN us.user_id END) AS active_30d,
    (SELECT COUNT(*) FROM public.users) AS total_users
FROM public.user_sessions us;

-- App usage breakdown view
CREATE OR REPLACE VIEW public.v_app_usage_breakdown AS
SELECT
    pv.project_code,
    COUNT(*) AS total_views,
    COUNT(DISTINCT pv.user_id) AS unique_users,
    SUM(pv.time_on_page_seconds) AS total_time_seconds,
    AVG(pv.time_on_page_seconds) AS avg_time_per_view
FROM public.page_views pv
WHERE pv.entered_at > NOW() - INTERVAL '30 days'
GROUP BY pv.project_code
ORDER BY total_views DESC;

-- Cross-app flow summary view
CREATE OR REPLACE VIEW public.v_cross_app_flow AS
SELECT
    can.from_project_code,
    can.to_project_code,
    COUNT(*) AS navigation_count,
    AVG(can.time_in_source_seconds) AS avg_time_before_nav
FROM public.cross_app_navigation can
WHERE can.navigated_at > NOW() - INTERVAL '30 days'
GROUP BY can.from_project_code, can.to_project_code
ORDER BY navigation_count DESC;

-- =====================================================
-- 8. FUNCTION TO AGGREGATE DAILY STATS
-- Run via cron job or manually
-- =====================================================
CREATE OR REPLACE FUNCTION public.aggregate_daily_analytics(target_date DATE DEFAULT CURRENT_DATE - 1)
RETURNS void AS $$
DECLARE
    project RECORD;
BEGIN
    -- Loop through each project code
    FOR project IN SELECT DISTINCT project_code FROM public.page_views WHERE entered_at::DATE = target_date
    LOOP
        INSERT INTO public.analytics_daily_aggregates (
            date,
            project_code,
            total_sessions,
            unique_users,
            total_time_seconds,
            avg_session_duration_seconds,
            total_page_views,
            unique_pages_viewed,
            avg_pages_per_session,
            avg_scroll_depth,
            total_clicks,
            inbound_navigations,
            outbound_navigations
        )
        SELECT
            target_date,
            project.project_code,
            -- Sessions
            (SELECT COUNT(DISTINCT us.id) FROM public.user_sessions us
             INNER JOIN public.page_views pv ON us.id = pv.session_id
             WHERE pv.project_code = project.project_code AND pv.entered_at::DATE = target_date),
            -- Unique users
            COUNT(DISTINCT pv.user_id),
            -- Total time
            COALESCE(SUM(pv.time_on_page_seconds), 0),
            -- Avg session duration
            COALESCE(AVG(pv.time_on_page_seconds), 0)::INTEGER,
            -- Total page views
            COUNT(*),
            -- Unique pages
            COUNT(DISTINCT pv.page_path),
            -- Avg pages per session
            COALESCE(
                COUNT(*)::DECIMAL / NULLIF(
                    (SELECT COUNT(DISTINCT us.id) FROM public.user_sessions us
                     INNER JOIN public.page_views spv ON us.id = spv.session_id
                     WHERE spv.project_code = project.project_code AND spv.entered_at::DATE = target_date), 0
                ), 0
            ),
            -- Avg scroll depth
            COALESCE(AVG(pv.scroll_depth_percent), 0),
            -- Total clicks
            COALESCE(SUM(pv.click_count), 0),
            -- Inbound navigations
            (SELECT COUNT(*) FROM public.cross_app_navigation
             WHERE to_project_code = project.project_code AND navigated_at::DATE = target_date),
            -- Outbound navigations
            (SELECT COUNT(*) FROM public.cross_app_navigation
             WHERE from_project_code = project.project_code AND navigated_at::DATE = target_date)
        FROM public.page_views pv
        WHERE pv.project_code = project.project_code AND pv.entered_at::DATE = target_date
        ON CONFLICT (date, project_code)
        DO UPDATE SET
            total_sessions = EXCLUDED.total_sessions,
            unique_users = EXCLUDED.unique_users,
            total_time_seconds = EXCLUDED.total_time_seconds,
            avg_session_duration_seconds = EXCLUDED.avg_session_duration_seconds,
            total_page_views = EXCLUDED.total_page_views,
            unique_pages_viewed = EXCLUDED.unique_pages_viewed,
            avg_pages_per_session = EXCLUDED.avg_pages_per_session,
            avg_scroll_depth = EXCLUDED.avg_scroll_depth,
            total_clicks = EXCLUDED.total_clicks,
            inbound_navigations = EXCLUDED.inbound_navigations,
            outbound_navigations = EXCLUDED.outbound_navigations,
            updated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. GRANTS FOR SERVICE ROLE
-- =====================================================
GRANT ALL ON public.user_sessions TO service_role;
GRANT ALL ON public.page_views TO service_role;
GRANT ALL ON public.cross_app_navigation TO service_role;
GRANT ALL ON public.analytics_daily_aggregates TO service_role;
GRANT EXECUTE ON FUNCTION public.aggregate_daily_analytics TO service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
