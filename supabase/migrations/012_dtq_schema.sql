-- =====================================================
-- dTQ (Test Pilot IQ) - Project-Specific Schema
-- =====================================================
-- This migration creates the dTQ-specific tables for
-- the AI-powered testing intelligence platform
-- =====================================================

-- Create dTQ schema (namespace)
CREATE SCHEMA IF NOT EXISTS dtq;

-- =====================================================
-- FEATURES (46 features across 10 categories)
-- =====================================================
CREATE TABLE IF NOT EXISTS dtq.features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    coverage INTEGER DEFAULT 0 CHECK (coverage >= 0 AND coverage <= 100),
    status TEXT CHECK (status IN ('fully_automated', 'partially_automated')),
    open_defects INTEGER DEFAULT 0,
    closed_defects INTEGER DEFAULT 0,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    pass_rate INTEGER DEFAULT 0 CHECK (pass_rate >= 0 AND pass_rate <= 100),
    impact_score INTEGER DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for category grouping
CREATE INDEX IF NOT EXISTS idx_dtq_features_category ON dtq.features(category);
CREATE INDEX IF NOT EXISTS idx_dtq_features_risk ON dtq.features(risk_score DESC);

-- =====================================================
-- TEST RUNS (execution history)
-- =====================================================
CREATE TABLE IF NOT EXISTS dtq.test_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id UUID REFERENCES dtq.features(id) ON DELETE SET NULL,
    feature_name TEXT NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT CHECK (status IN ('passed', 'failed', 'running')),
    total_tests INTEGER DEFAULT 0,
    passed_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0,
    source TEXT DEFAULT 'manual',
    external_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for recent runs
CREATE INDEX IF NOT EXISTS idx_dtq_test_runs_executed ON dtq.test_runs(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_dtq_test_runs_feature ON dtq.test_runs(feature_id);
CREATE INDEX IF NOT EXISTS idx_dtq_test_runs_status ON dtq.test_runs(status);

-- =====================================================
-- TEST ISSUES (failures/defects from test runs)
-- =====================================================
CREATE TABLE IF NOT EXISTS dtq.test_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_run_id UUID REFERENCES dtq.test_runs(id) ON DELETE CASCADE,
    test_case_name TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('high', 'medium', 'low')),
    error_message TEXT,
    stack_trace TEXT,
    external_issue_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for issues by run
CREATE INDEX IF NOT EXISTS idx_dtq_test_issues_run ON dtq.test_issues(test_run_id);
CREATE INDEX IF NOT EXISTS idx_dtq_test_issues_severity ON dtq.test_issues(severity);

-- =====================================================
-- DAILY METRICS (30-day historical data)
-- =====================================================
CREATE TABLE IF NOT EXISTS dtq.daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    pass_rate DECIMAL(5,2) DEFAULT 0,
    first_run_pass_rate DECIMAL(5,2) DEFAULT 0,
    defect_detection DECIMAL(5,2) DEFAULT 0,
    effectiveness DECIMAL(5,2) DEFAULT 0,
    automation_coverage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for date ordering
CREATE INDEX IF NOT EXISTS idx_dtq_daily_metrics_date ON dtq.daily_metrics(date DESC);

-- =====================================================
-- PERSONAS (3 persona types with role-specific views)
-- =====================================================
CREATE TABLE IF NOT EXISTS dtq.personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT UNIQUE CHECK (type IN ('csuite', 'manager', 'techlead')),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PERSONA METRICS (role-specific KPIs)
-- =====================================================
CREATE TABLE IF NOT EXISTS dtq.persona_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID REFERENCES dtq.personas(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT,
    description TEXT,
    trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
    trend_value TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for persona metrics
CREATE INDEX IF NOT EXISTS idx_dtq_persona_metrics_persona ON dtq.persona_metrics(persona_id, sort_order);

-- =====================================================
-- ROW LEVEL SECURITY (Public read for demo app)
-- =====================================================

-- Enable RLS
ALTER TABLE dtq.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtq.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtq.test_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtq.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtq.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtq.persona_metrics ENABLE ROW LEVEL SECURITY;

-- Allow public read access (demo app, no auth required)
CREATE POLICY "Public read features" ON dtq.features FOR SELECT USING (true);
CREATE POLICY "Public read test_runs" ON dtq.test_runs FOR SELECT USING (true);
CREATE POLICY "Public read test_issues" ON dtq.test_issues FOR SELECT USING (true);
CREATE POLICY "Public read daily_metrics" ON dtq.daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public read personas" ON dtq.personas FOR SELECT USING (true);
CREATE POLICY "Public read persona_metrics" ON dtq.persona_metrics FOR SELECT USING (true);

-- Allow inserts for simulation (via API with anon key)
CREATE POLICY "Allow insert test_runs" ON dtq.test_runs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert test_issues" ON dtq.test_issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update daily_metrics" ON dtq.daily_metrics FOR UPDATE USING (true);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

-- Use existing update_updated_at function from core schema
CREATE TRIGGER set_updated_at_dtq_features
BEFORE UPDATE ON dtq.features
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get summary metrics calculated from features
CREATE OR REPLACE FUNCTION dtq.get_summary_metrics()
RETURNS TABLE (
    total_features INTEGER,
    avg_coverage DECIMAL(5,2),
    automation_rate INTEGER,
    fully_automated INTEGER,
    high_risk INTEGER,
    medium_risk INTEGER,
    low_risk INTEGER,
    open_defects INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_features,
        ROUND(AVG(f.coverage)::DECIMAL, 2) as avg_coverage,
        ROUND((COUNT(*) FILTER (WHERE f.status = 'fully_automated')::DECIMAL / COUNT(*) * 100))::INTEGER as automation_rate,
        COUNT(*) FILTER (WHERE f.status = 'fully_automated')::INTEGER as fully_automated,
        COUNT(*) FILTER (WHERE f.risk_score >= 40)::INTEGER as high_risk,
        COUNT(*) FILTER (WHERE f.risk_score >= 20 AND f.risk_score < 40)::INTEGER as medium_risk,
        COUNT(*) FILTER (WHERE f.risk_score < 20)::INTEGER as low_risk,
        COALESCE(SUM(f.open_defects), 0)::INTEGER as open_defects
    FROM dtq.features f;
END;
$$ LANGUAGE plpgsql;

-- Get high-risk features
CREATE OR REPLACE FUNCTION dtq.get_high_risk_features(limit_count INTEGER DEFAULT 3)
RETURNS TABLE (
    id UUID,
    name TEXT,
    category TEXT,
    coverage INTEGER,
    risk_score INTEGER,
    open_defects INTEGER,
    pass_rate INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.name,
        f.category,
        f.coverage,
        f.risk_score,
        f.open_defects,
        f.pass_rate
    FROM dtq.features f
    WHERE f.risk_score >= 40
    ORDER BY f.risk_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get categories with aggregated stats
CREATE OR REPLACE FUNCTION dtq.get_categories()
RETURNS TABLE (
    category TEXT,
    feature_count INTEGER,
    avg_coverage DECIMAL(5,2),
    high_risk_count INTEGER,
    total_defects INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.category,
        COUNT(*)::INTEGER as feature_count,
        ROUND(AVG(f.coverage)::DECIMAL, 2) as avg_coverage,
        COUNT(*) FILTER (WHERE f.risk_score >= 40)::INTEGER as high_risk_count,
        COALESCE(SUM(f.open_defects), 0)::INTEGER as total_defects
    FROM dtq.features f
    GROUP BY f.category
    ORDER BY f.category;
END;
$$ LANGUAGE plpgsql;
