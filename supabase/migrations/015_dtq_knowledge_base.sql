-- =====================================================
-- dTQ (Test Pilot IQ) - Knowledge Base + Vector Search
-- =====================================================
-- Creates dtq.knowledge_base table with vector embeddings
-- for AI-powered semantic search and RAG chat.
-- Seeds all persona data: features, KPIs, test run
-- summaries, daily metrics summaries, and category summaries.
-- =====================================================

-- =====================================================
-- 1. CREATE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS dtq.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona TEXT NOT NULL CHECK (persona IN ('csuite', 'manager', 'techlead', 'shared')),
    item_type TEXT NOT NULL CHECK (item_type IN ('feature', 'test_run_summary', 'daily_metrics_summary', 'persona_kpi', 'category_summary')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. INDEXES
-- =====================================================

-- HNSW index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_dtq_kb_embedding_hnsw
    ON dtq.knowledge_base
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Btree indexes for filtering
CREATE INDEX IF NOT EXISTS idx_dtq_kb_persona ON dtq.knowledge_base (persona);
CREATE INDEX IF NOT EXISTS idx_dtq_kb_item_type ON dtq.knowledge_base (item_type);

-- GIN index for tags array search
CREATE INDEX IF NOT EXISTS idx_dtq_kb_tags ON dtq.knowledge_base USING GIN (tags);

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

ALTER TABLE dtq.knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for dtq.knowledge_base"
    ON dtq.knowledge_base FOR SELECT
    USING (true);

CREATE POLICY "Service role full access for dtq.knowledge_base"
    ON dtq.knowledge_base FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- 4. SEMANTIC SEARCH FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION dtq.search_knowledge_semantic(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 10,
    filter_persona text DEFAULT NULL,
    filter_types text[] DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    persona TEXT,
    item_type TEXT,
    title TEXT,
    content TEXT,
    summary TEXT,
    tags TEXT[],
    metadata JSONB,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kb.id,
        kb.persona,
        kb.item_type,
        kb.title,
        kb.content,
        kb.summary,
        kb.tags,
        kb.metadata,
        1 - (kb.embedding <=> query_embedding) AS similarity
    FROM dtq.knowledge_base kb
    WHERE
        kb.embedding IS NOT NULL
        AND 1 - (kb.embedding <=> query_embedding) > match_threshold
        AND (filter_persona IS NULL OR kb.persona IN (filter_persona, 'shared'))
        AND (filter_types IS NULL OR kb.item_type = ANY(filter_types))
    ORDER BY kb.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- =====================================================
-- 5. SEED DATA - C-Suite Features (16)
-- =====================================================

INSERT INTO dtq.knowledge_base (persona, item_type, title, content, summary, tags, metadata) VALUES

-- Revenue Platform
('csuite', 'feature', 'Payment Gateway', E'Feature: Payment Gateway\nCategory: Revenue Platform\nCoverage: 96%\nStatus: fully_automated\nRisk Score: 12 (Low)\nPass Rate: 98%\nImpact Score: 95\nOpen Defects: 0\nClosed Defects: 4\n\nPayment Gateway is a fully automated feature in the Revenue Platform category with excellent test coverage at 96%. With a low risk score of 12 and a 98% pass rate, this feature is in strong shape. No open defects remain.',
'Revenue Platform feature with 96% coverage, fully automated, low risk', ARRAY['csuite', 'Revenue Platform', 'fully_automated', 'low-risk'], '{"featureId": "cs-f1", "coverage": 96, "riskScore": 12, "passRate": 98}'::jsonb),

('csuite', 'feature', 'Subscription Billing', E'Feature: Subscription Billing\nCategory: Revenue Platform\nCoverage: 93%\nStatus: fully_automated\nRisk Score: 18 (Low)\nPass Rate: 96%\nImpact Score: 92\nOpen Defects: 1\nClosed Defects: 6\n\nSubscription Billing is fully automated with strong 93% coverage. Risk score is low at 18 with a 96% pass rate. One open defect needs attention.',
'Revenue Platform feature with 93% coverage, fully automated', ARRAY['csuite', 'Revenue Platform', 'fully_automated', 'low-risk'], '{"featureId": "cs-f2", "coverage": 93, "riskScore": 18, "passRate": 96}'::jsonb),

('csuite', 'feature', 'Revenue Analytics', E'Feature: Revenue Analytics\nCategory: Revenue Platform\nCoverage: 91%\nStatus: fully_automated\nRisk Score: 15 (Low)\nPass Rate: 97%\nImpact Score: 90\nOpen Defects: 0\nClosed Defects: 5\n\nRevenue Analytics delivers strong coverage at 91% with full automation. Low risk score of 15 and 97% pass rate indicate solid quality.',
'Revenue Platform feature with 91% coverage, fully automated', ARRAY['csuite', 'Revenue Platform', 'fully_automated', 'low-risk'], '{"featureId": "cs-f3", "coverage": 91, "riskScore": 15, "passRate": 97}'::jsonb),

('csuite', 'feature', 'Pricing Engine', E'Feature: Pricing Engine\nCategory: Revenue Platform\nCoverage: 88%\nStatus: partially_automated\nRisk Score: 22 (Medium)\nPass Rate: 94%\nImpact Score: 88\nOpen Defects: 1\nClosed Defects: 3\n\nPricing Engine has 88% coverage but is only partially automated. Medium risk score of 22 suggests room for improvement. One open defect.',
'Revenue Platform feature with 88% coverage, partially automated, medium risk', ARRAY['csuite', 'Revenue Platform', 'partially_automated', 'medium-risk'], '{"featureId": "cs-f4", "coverage": 88, "riskScore": 22, "passRate": 94}'::jsonb),

-- Customer Experience
('csuite', 'feature', 'Customer Portal', E'Feature: Customer Portal\nCategory: Customer Experience\nCoverage: 94%\nStatus: fully_automated\nRisk Score: 14 (Low)\nPass Rate: 97%\nImpact Score: 93\nOpen Defects: 0\nClosed Defects: 7\n\nCustomer Portal is fully automated with 94% coverage. Low risk at 14 with strong 97% pass rate.',
'Customer Experience feature with 94% coverage, fully automated', ARRAY['csuite', 'Customer Experience', 'fully_automated', 'low-risk'], '{"featureId": "cs-f5", "coverage": 94, "riskScore": 14, "passRate": 97}'::jsonb),

('csuite', 'feature', 'NPS Tracking', E'Feature: NPS Tracking\nCategory: Customer Experience\nCoverage: 89%\nStatus: partially_automated\nRisk Score: 20 (Medium)\nPass Rate: 93%\nImpact Score: 86\nOpen Defects: 1\nClosed Defects: 4\n\nNPS Tracking is partially automated at 89% coverage. Medium risk with one open defect.',
'Customer Experience feature with 89% coverage, partially automated', ARRAY['csuite', 'Customer Experience', 'partially_automated', 'medium-risk'], '{"featureId": "cs-f6", "coverage": 89, "riskScore": 20, "passRate": 93}'::jsonb),

('csuite', 'feature', 'Support Escalation', E'Feature: Support Escalation\nCategory: Customer Experience\nCoverage: 92%\nStatus: fully_automated\nRisk Score: 16 (Low)\nPass Rate: 96%\nImpact Score: 89\nOpen Defects: 0\nClosed Defects: 5\n\nSupport Escalation is fully automated with 92% coverage. Low risk and no open defects.',
'Customer Experience feature with 92% coverage, fully automated', ARRAY['csuite', 'Customer Experience', 'fully_automated', 'low-risk'], '{"featureId": "cs-f7", "coverage": 92, "riskScore": 16, "passRate": 96}'::jsonb),

('csuite', 'feature', 'Onboarding Journey', E'Feature: Onboarding Journey\nCategory: Customer Experience\nCoverage: 90%\nStatus: fully_automated\nRisk Score: 19 (Low)\nPass Rate: 95%\nImpact Score: 91\nOpen Defects: 1\nClosed Defects: 6\n\nOnboarding Journey is fully automated at 90% coverage. Low risk score of 19 with one open defect.',
'Customer Experience feature with 90% coverage, fully automated', ARRAY['csuite', 'Customer Experience', 'fully_automated', 'low-risk'], '{"featureId": "cs-f8", "coverage": 90, "riskScore": 19, "passRate": 95}'::jsonb),

-- Market Expansion
('csuite', 'feature', 'Multi-Region Deployment', E'Feature: Multi-Region Deployment\nCategory: Market Expansion\nCoverage: 87%\nStatus: partially_automated\nRisk Score: 24 (Medium)\nPass Rate: 92%\nImpact Score: 94\nOpen Defects: 1\nClosed Defects: 3\n\nMulti-Region Deployment is partially automated at 87%. Medium risk with high impact score of 94.',
'Market Expansion feature with 87% coverage, partially automated, high impact', ARRAY['csuite', 'Market Expansion', 'partially_automated', 'medium-risk'], '{"featureId": "cs-f9", "coverage": 87, "riskScore": 24, "passRate": 92}'::jsonb),

('csuite', 'feature', 'Localization Engine', E'Feature: Localization Engine\nCategory: Market Expansion\nCoverage: 85%\nStatus: partially_automated\nRisk Score: 28 (Medium)\nPass Rate: 90%\nImpact Score: 82\nOpen Defects: 2\nClosed Defects: 5\n\nLocalization Engine has 85% coverage with partial automation. Medium risk at 28 with 2 open defects.',
'Market Expansion feature with 85% coverage, partially automated', ARRAY['csuite', 'Market Expansion', 'partially_automated', 'medium-risk'], '{"featureId": "cs-f10", "coverage": 85, "riskScore": 28, "passRate": 90}'::jsonb),

('csuite', 'feature', 'Partner Integration', E'Feature: Partner Integration\nCategory: Market Expansion\nCoverage: 91%\nStatus: fully_automated\nRisk Score: 17 (Low)\nPass Rate: 95%\nImpact Score: 87\nOpen Defects: 0\nClosed Defects: 4\n\nPartner Integration is fully automated with 91% coverage. Low risk and no open defects.',
'Market Expansion feature with 91% coverage, fully automated', ARRAY['csuite', 'Market Expansion', 'fully_automated', 'low-risk'], '{"featureId": "cs-f11", "coverage": 91, "riskScore": 17, "passRate": 95}'::jsonb),

-- Strategic Compliance
('csuite', 'feature', 'SOC 2 Validation', E'Feature: SOC 2 Validation\nCategory: Strategic Compliance\nCoverage: 97%\nStatus: fully_automated\nRisk Score: 10 (Low)\nPass Rate: 99%\nImpact Score: 96\nOpen Defects: 0\nClosed Defects: 3\n\nSOC 2 Validation has excellent 97% coverage, fully automated. Very low risk at 10 with a 99% pass rate.',
'Strategic Compliance feature with 97% coverage, fully automated, very low risk', ARRAY['csuite', 'Strategic Compliance', 'fully_automated', 'low-risk'], '{"featureId": "cs-f12", "coverage": 97, "riskScore": 10, "passRate": 99}'::jsonb),

('csuite', 'feature', 'GDPR Data Handling', E'Feature: GDPR Data Handling\nCategory: Strategic Compliance\nCoverage: 95%\nStatus: fully_automated\nRisk Score: 13 (Low)\nPass Rate: 98%\nImpact Score: 94\nOpen Defects: 0\nClosed Defects: 5\n\nGDPR Data Handling is fully automated at 95% coverage. Low risk, no open defects.',
'Strategic Compliance feature with 95% coverage, fully automated', ARRAY['csuite', 'Strategic Compliance', 'fully_automated', 'low-risk'], '{"featureId": "cs-f13", "coverage": 95, "riskScore": 13, "passRate": 98}'::jsonb),

('csuite', 'feature', 'Audit Trail System', E'Feature: Audit Trail System\nCategory: Strategic Compliance\nCoverage: 93%\nStatus: fully_automated\nRisk Score: 16 (Low)\nPass Rate: 96%\nImpact Score: 91\nOpen Defects: 1\nClosed Defects: 4\n\nAudit Trail System is fully automated at 93% coverage with one open defect.',
'Strategic Compliance feature with 93% coverage, fully automated', ARRAY['csuite', 'Strategic Compliance', 'fully_automated', 'low-risk'], '{"featureId": "cs-f14", "coverage": 93, "riskScore": 16, "passRate": 96}'::jsonb),

-- Digital Transformation
('csuite', 'feature', 'AI Feature Pipeline', E'Feature: AI Feature Pipeline\nCategory: Digital Transformation\nCoverage: 82%\nStatus: partially_automated\nRisk Score: 30 (Medium)\nPass Rate: 89%\nImpact Score: 97\nOpen Defects: 2\nClosed Defects: 6\n\nAI Feature Pipeline has 82% coverage and is partially automated. Medium risk at 30 but very high impact score of 97. Two open defects need attention.',
'Digital Transformation feature with 82% coverage, high impact, medium risk', ARRAY['csuite', 'Digital Transformation', 'partially_automated', 'medium-risk'], '{"featureId": "cs-f15", "coverage": 82, "riskScore": 30, "passRate": 89}'::jsonb),

('csuite', 'feature', 'Legacy Migration', E'Feature: Legacy Migration\nCategory: Digital Transformation\nCoverage: 84%\nStatus: partially_automated\nRisk Score: 26 (Medium)\nPass Rate: 91%\nImpact Score: 85\nOpen Defects: 1\nClosed Defects: 5\n\nLegacy Migration is partially automated at 84% coverage. Medium risk with one open defect.',
'Digital Transformation feature with 84% coverage, partially automated', ARRAY['csuite', 'Digital Transformation', 'partially_automated', 'medium-risk'], '{"featureId": "cs-f16", "coverage": 84, "riskScore": 26, "passRate": 91}'::jsonb);

-- =====================================================
-- 6. SEED DATA - Manager Features (46) - from data.ts
-- =====================================================

INSERT INTO dtq.knowledge_base (persona, item_type, title, content, summary, tags, metadata) VALUES
-- Advanced / Enterprise (5)
('manager', 'feature', 'xAPI / LRS Integration', E'Feature: xAPI / LRS Integration\nCategory: Advanced / Enterprise\nCoverage: 92%\nStatus: fully_automated\nRisk Score: 45 (High)\nPass Rate: 94%\nImpact Score: 85\nOpen Defects: 1\nClosed Defects: 5\n\nxAPI / LRS Integration has 92% coverage but a high risk score of 45. Despite being fully automated, the elevated risk and one open defect suggest this feature needs monitoring.',
'Advanced / Enterprise feature with 92% coverage, high risk', ARRAY['manager', 'Advanced / Enterprise', 'fully_automated', 'high-risk'], '{"featureId": "f1", "coverage": 92, "riskScore": 45, "passRate": 94}'::jsonb),

('manager', 'feature', 'Multi-Tenant Configuration', E'Feature: Multi-Tenant Configuration\nCategory: Advanced / Enterprise\nCoverage: 88%\nStatus: partially_automated\nRisk Score: 32 (Medium)\nPass Rate: 91%\nImpact Score: 92\nOpen Defects: 2\nClosed Defects: 8\n\nMulti-Tenant Configuration is partially automated at 88%. Medium risk with 2 open defects and high impact score of 92.',
'Advanced / Enterprise feature with 88% coverage, medium risk, high impact', ARRAY['manager', 'Advanced / Enterprise', 'partially_automated', 'medium-risk'], '{"featureId": "f2", "coverage": 88, "riskScore": 32, "passRate": 91}'::jsonb),

('manager', 'feature', 'Advanced Compliance Tracking', E'Feature: Advanced Compliance Tracking\nCategory: Advanced / Enterprise\nCoverage: 95%\nStatus: fully_automated\nRisk Score: 18 (Low)\nPass Rate: 97%\nImpact Score: 88\nOpen Defects: 0\nClosed Defects: 4\n\nExcellent 95% coverage with full automation. Low risk, no open defects.',
'Advanced / Enterprise feature with 95% coverage, low risk', ARRAY['manager', 'Advanced / Enterprise', 'fully_automated', 'low-risk'], '{"featureId": "f3", "coverage": 95, "riskScore": 18, "passRate": 97}'::jsonb),

('manager', 'feature', 'Custom Branding Engine', E'Feature: Custom Branding Engine\nCategory: Advanced / Enterprise\nCoverage: 78%\nStatus: partially_automated\nRisk Score: 25 (Medium)\nPass Rate: 89%\nImpact Score: 65\nOpen Defects: 1\nClosed Defects: 6\n\nCustom Branding Engine has lower coverage at 78%. Partially automated with medium risk.',
'Advanced / Enterprise feature with 78% coverage, medium risk', ARRAY['manager', 'Advanced / Enterprise', 'partially_automated', 'medium-risk'], '{"featureId": "f4", "coverage": 78, "riskScore": 25, "passRate": 89}'::jsonb),

('manager', 'feature', 'Enterprise SSO', E'Feature: Enterprise SSO\nCategory: Advanced / Enterprise\nCoverage: 96%\nStatus: fully_automated\nRisk Score: 12 (Low)\nPass Rate: 98%\nImpact Score: 95\nOpen Defects: 0\nClosed Defects: 3\n\nEnterprise SSO has excellent 96% coverage, fully automated. Very low risk with no open defects.',
'Advanced / Enterprise feature with 96% coverage, low risk', ARRAY['manager', 'Advanced / Enterprise', 'fully_automated', 'low-risk'], '{"featureId": "f5", "coverage": 96, "riskScore": 12, "passRate": 98}'::jsonb),

-- Learning Experience (4)
('manager', 'feature', 'Adaptive Learning Paths', E'Feature: Adaptive Learning Paths\nCategory: Learning Experience\nCoverage: 85%\nStatus: partially_automated\nRisk Score: 38 (Medium)\nPass Rate: 88%\nImpact Score: 90\nOpen Defects: 3\nClosed Defects: 7\n\nAdaptive Learning Paths is partially automated at 85%. Medium risk at 38 with 3 open defects and high impact score of 90.',
'Learning Experience feature with 85% coverage, medium risk, 3 open defects', ARRAY['manager', 'Learning Experience', 'partially_automated', 'medium-risk'], '{"featureId": "f6", "coverage": 85, "riskScore": 38, "passRate": 88}'::jsonb),

('manager', 'feature', 'Personalized Recommendations', E'Feature: Personalized Recommendations\nCategory: Learning Experience\nCoverage: 91%\nStatus: fully_automated\nRisk Score: 22 (Medium)\nPass Rate: 93%\nImpact Score: 82\nOpen Defects: 1\nClosed Defects: 5',
'Learning Experience feature with 91% coverage, fully automated', ARRAY['manager', 'Learning Experience', 'fully_automated', 'medium-risk'], '{"featureId": "f7", "coverage": 91, "riskScore": 22, "passRate": 93}'::jsonb),

('manager', 'feature', 'Skill Gap Analysis', E'Feature: Skill Gap Analysis\nCategory: Learning Experience\nCoverage: 87%\nStatus: partially_automated\nRisk Score: 28 (Medium)\nPass Rate: 90%\nImpact Score: 78\nOpen Defects: 2\nClosed Defects: 9',
'Learning Experience feature with 87% coverage, medium risk', ARRAY['manager', 'Learning Experience', 'partially_automated', 'medium-risk'], '{"featureId": "f8", "coverage": 87, "riskScore": 28, "passRate": 90}'::jsonb),

('manager', 'feature', 'Learning Goals Tracking', E'Feature: Learning Goals Tracking\nCategory: Learning Experience\nCoverage: 93%\nStatus: fully_automated\nRisk Score: 15 (Low)\nPass Rate: 96%\nImpact Score: 75\nOpen Defects: 0\nClosed Defects: 4',
'Learning Experience feature with 93% coverage, low risk', ARRAY['manager', 'Learning Experience', 'fully_automated', 'low-risk'], '{"featureId": "f9", "coverage": 93, "riskScore": 15, "passRate": 96}'::jsonb),

-- Reporting & Analytics (5)
('manager', 'feature', 'Executive Dashboard', E'Feature: Executive Dashboard\nCategory: Reporting & Analytics\nCoverage: 94%\nStatus: fully_automated\nRisk Score: 20 (Medium)\nPass Rate: 95%\nImpact Score: 92\nOpen Defects: 1\nClosed Defects: 6',
'Reporting feature with 94% coverage, fully automated', ARRAY['manager', 'Reporting & Analytics', 'fully_automated', 'medium-risk'], '{"featureId": "f10", "coverage": 94, "riskScore": 20, "passRate": 95}'::jsonb),

('manager', 'feature', 'Custom Report Builder', E'Feature: Custom Report Builder\nCategory: Reporting & Analytics\nCoverage: 82%\nStatus: partially_automated\nRisk Score: 35 (Medium)\nPass Rate: 87%\nImpact Score: 85\nOpen Defects: 2\nClosed Defects: 8',
'Reporting feature with 82% coverage, medium risk', ARRAY['manager', 'Reporting & Analytics', 'partially_automated', 'medium-risk'], '{"featureId": "f11", "coverage": 82, "riskScore": 35, "passRate": 87}'::jsonb),

('manager', 'feature', 'Learning Analytics', E'Feature: Learning Analytics\nCategory: Reporting & Analytics\nCoverage: 89%\nStatus: partially_automated\nRisk Score: 42 (High)\nPass Rate: 91%\nImpact Score: 88\nOpen Defects: 1\nClosed Defects: 5\n\nLearning Analytics has a high risk score of 42 despite 89% coverage. Needs priority attention.',
'Reporting feature with 89% coverage, HIGH RISK', ARRAY['manager', 'Reporting & Analytics', 'partially_automated', 'high-risk'], '{"featureId": "f12", "coverage": 89, "riskScore": 42, "passRate": 91}'::jsonb),

('manager', 'feature', 'Compliance Reports', E'Feature: Compliance Reports\nCategory: Reporting & Analytics\nCoverage: 97%\nStatus: fully_automated\nRisk Score: 10 (Low)\nPass Rate: 99%\nImpact Score: 94\nOpen Defects: 0\nClosed Defects: 3',
'Reporting feature with 97% coverage, very low risk', ARRAY['manager', 'Reporting & Analytics', 'fully_automated', 'low-risk'], '{"featureId": "f13", "coverage": 97, "riskScore": 10, "passRate": 99}'::jsonb),

('manager', 'feature', 'Export Center', E'Feature: Export Center\nCategory: Reporting & Analytics\nCoverage: 90%\nStatus: fully_automated\nRisk Score: 16 (Low)\nPass Rate: 94%\nImpact Score: 70\nOpen Defects: 1\nClosed Defects: 4',
'Reporting feature with 90% coverage, low risk', ARRAY['manager', 'Reporting & Analytics', 'fully_automated', 'low-risk'], '{"featureId": "f14", "coverage": 90, "riskScore": 16, "passRate": 94}'::jsonb),

-- Course Catalog & Enrollment (4)
('manager', 'feature', 'Course Discovery', E'Feature: Course Discovery\nCategory: Course Catalog & Enrollment\nCoverage: 86%\nStatus: partially_automated\nRisk Score: 30 (Medium)\nPass Rate: 89%\nImpact Score: 85\nOpen Defects: 2\nClosed Defects: 7',
'Course Catalog feature with 86% coverage, medium risk', ARRAY['manager', 'Course Catalog & Enrollment', 'partially_automated', 'medium-risk'], '{"featureId": "f15", "coverage": 86, "riskScore": 30, "passRate": 89}'::jsonb),

('manager', 'feature', 'Self-Enrollment', E'Feature: Self-Enrollment\nCategory: Course Catalog & Enrollment\nCoverage: 95%\nStatus: fully_automated\nRisk Score: 14 (Low)\nPass Rate: 97%\nImpact Score: 90\nOpen Defects: 0\nClosed Defects: 5',
'Course Catalog feature with 95% coverage, low risk', ARRAY['manager', 'Course Catalog & Enrollment', 'fully_automated', 'low-risk'], '{"featureId": "f16", "coverage": 95, "riskScore": 14, "passRate": 97}'::jsonb),

('manager', 'feature', 'Manager-Assigned Learning', E'Feature: Manager-Assigned Learning\nCategory: Course Catalog & Enrollment\nCoverage: 88%\nStatus: partially_automated\nRisk Score: 24 (Medium)\nPass Rate: 92%\nImpact Score: 82\nOpen Defects: 1\nClosed Defects: 6',
'Course Catalog feature with 88% coverage, medium risk', ARRAY['manager', 'Course Catalog & Enrollment', 'partially_automated', 'medium-risk'], '{"featureId": "f17", "coverage": 88, "riskScore": 24, "passRate": 92}'::jsonb),

('manager', 'feature', 'Waitlist Management', E'Feature: Waitlist Management\nCategory: Course Catalog & Enrollment\nCoverage: 79%\nStatus: partially_automated\nRisk Score: 20 (Medium)\nPass Rate: 86%\nImpact Score: 60\nOpen Defects: 1\nClosed Defects: 4',
'Course Catalog feature with 79% coverage, medium risk', ARRAY['manager', 'Course Catalog & Enrollment', 'partially_automated', 'medium-risk'], '{"featureId": "f18", "coverage": 79, "riskScore": 20, "passRate": 86}'::jsonb),

-- Social & Collaboration (4)
('manager', 'feature', 'Discussion Forums', E'Feature: Discussion Forums\nCategory: Social & Collaboration\nCoverage: 83%\nStatus: partially_automated\nRisk Score: 26 (Medium)\nPass Rate: 88%\nImpact Score: 75\nOpen Defects: 2\nClosed Defects: 8',
'Social feature with 83% coverage, medium risk', ARRAY['manager', 'Social & Collaboration', 'partially_automated', 'medium-risk'], '{"featureId": "f19", "coverage": 83, "riskScore": 26, "passRate": 88}'::jsonb),

('manager', 'feature', 'Peer Reviews', E'Feature: Peer Reviews\nCategory: Social & Collaboration\nCoverage: 91%\nStatus: fully_automated\nRisk Score: 18 (Low)\nPass Rate: 93%\nImpact Score: 72\nOpen Defects: 1\nClosed Defects: 5',
'Social feature with 91% coverage, low risk', ARRAY['manager', 'Social & Collaboration', 'fully_automated', 'low-risk'], '{"featureId": "f20", "coverage": 91, "riskScore": 18, "passRate": 93}'::jsonb),

('manager', 'feature', 'Learning Groups', E'Feature: Learning Groups\nCategory: Social & Collaboration\nCoverage: 87%\nStatus: partially_automated\nRisk Score: 22 (Medium)\nPass Rate: 90%\nImpact Score: 68\nOpen Defects: 1\nClosed Defects: 6',
'Social feature with 87% coverage, medium risk', ARRAY['manager', 'Social & Collaboration', 'partially_automated', 'medium-risk'], '{"featureId": "f21", "coverage": 87, "riskScore": 22, "passRate": 90}'::jsonb),

('manager', 'feature', 'Social Sharing', E'Feature: Social Sharing\nCategory: Social & Collaboration\nCoverage: 76%\nStatus: partially_automated\nRisk Score: 15 (Low)\nPass Rate: 85%\nImpact Score: 55\nOpen Defects: 0\nClosed Defects: 3',
'Social feature with 76% coverage, low risk', ARRAY['manager', 'Social & Collaboration', 'partially_automated', 'low-risk'], '{"featureId": "f22", "coverage": 76, "riskScore": 15, "passRate": 85}'::jsonb),

-- Course Creation & Management (5)
('manager', 'feature', 'SCORM Import', E'Feature: SCORM Import\nCategory: Course Creation & Management\nCoverage: 94%\nStatus: fully_automated\nRisk Score: 19 (Low)\nPass Rate: 95%\nImpact Score: 88\nOpen Defects: 1\nClosed Defects: 7',
'Course Creation feature with 94% coverage, low risk', ARRAY['manager', 'Course Creation & Management', 'fully_automated', 'low-risk'], '{"featureId": "f23", "coverage": 94, "riskScore": 19, "passRate": 95}'::jsonb),

('manager', 'feature', 'Content Authoring', E'Feature: Content Authoring\nCategory: Course Creation & Management\nCoverage: 81%\nStatus: partially_automated\nRisk Score: 34 (Medium)\nPass Rate: 86%\nImpact Score: 92\nOpen Defects: 2\nClosed Defects: 9\n\nContent Authoring has lower coverage at 81% with medium risk. High impact score of 92 makes this a priority for automation.',
'Course Creation feature with 81% coverage, medium risk, high impact', ARRAY['manager', 'Course Creation & Management', 'partially_automated', 'medium-risk'], '{"featureId": "f24", "coverage": 81, "riskScore": 34, "passRate": 86}'::jsonb),

('manager', 'feature', 'Assessment Builder', E'Feature: Assessment Builder\nCategory: Course Creation & Management\nCoverage: 89%\nStatus: partially_automated\nRisk Score: 28 (Medium)\nPass Rate: 91%\nImpact Score: 85\nOpen Defects: 1\nClosed Defects: 5',
'Course Creation feature with 89% coverage, medium risk', ARRAY['manager', 'Course Creation & Management', 'partially_automated', 'medium-risk'], '{"featureId": "f25", "coverage": 89, "riskScore": 28, "passRate": 91}'::jsonb),

('manager', 'feature', 'Media Library', E'Feature: Media Library\nCategory: Course Creation & Management\nCoverage: 85%\nStatus: partially_automated\nRisk Score: 21 (Medium)\nPass Rate: 89%\nImpact Score: 78\nOpen Defects: 1\nClosed Defects: 4',
'Course Creation feature with 85% coverage, medium risk', ARRAY['manager', 'Course Creation & Management', 'partially_automated', 'medium-risk'], '{"featureId": "f26", "coverage": 85, "riskScore": 21, "passRate": 89}'::jsonb),

('manager', 'feature', 'Course Versioning', E'Feature: Course Versioning\nCategory: Course Creation & Management\nCoverage: 92%\nStatus: fully_automated\nRisk Score: 16 (Low)\nPass Rate: 94%\nImpact Score: 80\nOpen Defects: 0\nClosed Defects: 6',
'Course Creation feature with 92% coverage, low risk', ARRAY['manager', 'Course Creation & Management', 'fully_automated', 'low-risk'], '{"featureId": "f27", "coverage": 92, "riskScore": 16, "passRate": 94}'::jsonb),

-- Admin & Configuration (6)
('manager', 'feature', 'User Management', E'Feature: User Management\nCategory: Admin & Configuration\nCoverage: 96%\nStatus: fully_automated\nRisk Score: 12 (Low)\nPass Rate: 98%\nImpact Score: 95\nOpen Defects: 0\nClosed Defects: 4',
'Admin feature with 96% coverage, low risk', ARRAY['manager', 'Admin & Configuration', 'fully_automated', 'low-risk'], '{"featureId": "f28", "coverage": 96, "riskScore": 12, "passRate": 98}'::jsonb),

('manager', 'feature', 'Role-Based Access Control', E'Feature: Role-Based Access Control\nCategory: Admin & Configuration\nCoverage: 93%\nStatus: fully_automated\nRisk Score: 18 (Low)\nPass Rate: 96%\nImpact Score: 94\nOpen Defects: 1\nClosed Defects: 5',
'Admin feature with 93% coverage, low risk, high impact', ARRAY['manager', 'Admin & Configuration', 'fully_automated', 'low-risk'], '{"featureId": "f29", "coverage": 93, "riskScore": 18, "passRate": 96}'::jsonb),

('manager', 'feature', 'Notification Settings', E'Feature: Notification Settings\nCategory: Admin & Configuration\nCoverage: 84%\nStatus: partially_automated\nRisk Score: 22 (Medium)\nPass Rate: 88%\nImpact Score: 65\nOpen Defects: 1\nClosed Defects: 6',
'Admin feature with 84% coverage, medium risk', ARRAY['manager', 'Admin & Configuration', 'partially_automated', 'medium-risk'], '{"featureId": "f30", "coverage": 84, "riskScore": 22, "passRate": 88}'::jsonb),

('manager', 'feature', 'Integration Hub', E'Feature: Integration Hub\nCategory: Admin & Configuration\nCoverage: 78%\nStatus: partially_automated\nRisk Score: 36 (Medium)\nPass Rate: 85%\nImpact Score: 88\nOpen Defects: 2\nClosed Defects: 8\n\nIntegration Hub has lower 78% coverage with medium-high risk score of 36. Two open defects with high impact.',
'Admin feature with 78% coverage, medium-high risk', ARRAY['manager', 'Admin & Configuration', 'partially_automated', 'medium-risk'], '{"featureId": "f31", "coverage": 78, "riskScore": 36, "passRate": 85}'::jsonb),

('manager', 'feature', 'Audit Logs', E'Feature: Audit Logs\nCategory: Admin & Configuration\nCoverage: 97%\nStatus: fully_automated\nRisk Score: 10 (Low)\nPass Rate: 99%\nImpact Score: 90\nOpen Defects: 0\nClosed Defects: 3',
'Admin feature with 97% coverage, very low risk', ARRAY['manager', 'Admin & Configuration', 'fully_automated', 'low-risk'], '{"featureId": "f32", "coverage": 97, "riskScore": 10, "passRate": 99}'::jsonb),

('manager', 'feature', 'System Configuration', E'Feature: System Configuration\nCategory: Admin & Configuration\nCoverage: 88%\nStatus: partially_automated\nRisk Score: 24 (Medium)\nPass Rate: 91%\nImpact Score: 85\nOpen Defects: 1\nClosed Defects: 5',
'Admin feature with 88% coverage, medium risk', ARRAY['manager', 'Admin & Configuration', 'partially_automated', 'medium-risk'], '{"featureId": "f33", "coverage": 88, "riskScore": 24, "passRate": 91}'::jsonb),

-- Assessments & Certification (4)
('manager', 'feature', 'Quiz Engine', E'Feature: Quiz Engine\nCategory: Assessments & Certification\nCoverage: 92%\nStatus: fully_automated\nRisk Score: 20 (Medium)\nPass Rate: 94%\nImpact Score: 88\nOpen Defects: 1\nClosed Defects: 7',
'Assessment feature with 92% coverage, medium risk', ARRAY['manager', 'Assessments & Certification', 'fully_automated', 'medium-risk'], '{"featureId": "f34", "coverage": 92, "riskScore": 20, "passRate": 94}'::jsonb),

('manager', 'feature', 'Certification Paths', E'Feature: Certification Paths\nCategory: Assessments & Certification\nCoverage: 90%\nStatus: fully_automated\nRisk Score: 16 (Low)\nPass Rate: 93%\nImpact Score: 92\nOpen Defects: 0\nClosed Defects: 5',
'Assessment feature with 90% coverage, low risk', ARRAY['manager', 'Assessments & Certification', 'fully_automated', 'low-risk'], '{"featureId": "f35", "coverage": 90, "riskScore": 16, "passRate": 93}'::jsonb),

('manager', 'feature', 'Proctoring Support', E'Feature: Proctoring Support\nCategory: Assessments & Certification\nCoverage: 75%\nStatus: partially_automated\nRisk Score: 32 (Medium)\nPass Rate: 84%\nImpact Score: 78\nOpen Defects: 2\nClosed Defects: 4',
'Assessment feature with 75% coverage, medium risk', ARRAY['manager', 'Assessments & Certification', 'partially_automated', 'medium-risk'], '{"featureId": "f36", "coverage": 75, "riskScore": 32, "passRate": 84}'::jsonb),

('manager', 'feature', 'Certificate Designer', E'Feature: Certificate Designer\nCategory: Assessments & Certification\nCoverage: 86%\nStatus: partially_automated\nRisk Score: 18 (Low)\nPass Rate: 90%\nImpact Score: 70\nOpen Defects: 1\nClosed Defects: 6',
'Assessment feature with 86% coverage, low risk', ARRAY['manager', 'Assessments & Certification', 'partially_automated', 'low-risk'], '{"featureId": "f37", "coverage": 86, "riskScore": 18, "passRate": 90}'::jsonb),

-- Events & Live Sessions (4)
('manager', 'feature', 'Webinar Integration', E'Feature: Webinar Integration\nCategory: Events & Live Sessions\nCoverage: 82%\nStatus: partially_automated\nRisk Score: 28 (Medium)\nPass Rate: 87%\nImpact Score: 82\nOpen Defects: 1\nClosed Defects: 5',
'Events feature with 82% coverage, medium risk', ARRAY['manager', 'Events & Live Sessions', 'partially_automated', 'medium-risk'], '{"featureId": "f38", "coverage": 82, "riskScore": 28, "passRate": 87}'::jsonb),

('manager', 'feature', 'ILT Scheduling', E'Feature: ILT Scheduling\nCategory: Events & Live Sessions\nCoverage: 89%\nStatus: partially_automated\nRisk Score: 22 (Medium)\nPass Rate: 92%\nImpact Score: 85\nOpen Defects: 0\nClosed Defects: 7',
'Events feature with 89% coverage, medium risk', ARRAY['manager', 'Events & Live Sessions', 'partially_automated', 'medium-risk'], '{"featureId": "f39", "coverage": 89, "riskScore": 22, "passRate": 92}'::jsonb),

('manager', 'feature', 'Attendance Tracking', E'Feature: Attendance Tracking\nCategory: Events & Live Sessions\nCoverage: 94%\nStatus: fully_automated\nRisk Score: 14 (Low)\nPass Rate: 96%\nImpact Score: 78\nOpen Defects: 0\nClosed Defects: 4',
'Events feature with 94% coverage, low risk', ARRAY['manager', 'Events & Live Sessions', 'fully_automated', 'low-risk'], '{"featureId": "f40", "coverage": 94, "riskScore": 14, "passRate": 96}'::jsonb),

('manager', 'feature', 'Virtual Classroom', E'Feature: Virtual Classroom\nCategory: Events & Live Sessions\nCoverage: 77%\nStatus: partially_automated\nRisk Score: 38 (Medium)\nPass Rate: 85%\nImpact Score: 88\nOpen Defects: 2\nClosed Defects: 6\n\nVirtual Classroom has lower 77% coverage with elevated risk score of 38. Two open defects and high impact score make this a priority.',
'Events feature with 77% coverage, medium-high risk', ARRAY['manager', 'Events & Live Sessions', 'partially_automated', 'medium-risk'], '{"featureId": "f41", "coverage": 77, "riskScore": 38, "passRate": 85}'::jsonb),

-- Core User Journeys (5)
('manager', 'feature', 'User Onboarding', E'Feature: User Onboarding\nCategory: Core User Journeys\nCoverage: 91%\nStatus: fully_automated\nRisk Score: 24 (Medium)\nPass Rate: 93%\nImpact Score: 95\nOpen Defects: 1\nClosed Defects: 8',
'Core UJ feature with 91% coverage, high impact', ARRAY['manager', 'Core User Journeys', 'fully_automated', 'medium-risk'], '{"featureId": "f42", "coverage": 91, "riskScore": 24, "passRate": 93}'::jsonb),

('manager', 'feature', 'Course Completion Flow', E'Feature: Course Completion Flow\nCategory: Core User Journeys\nCoverage: 95%\nStatus: fully_automated\nRisk Score: 12 (Low)\nPass Rate: 97%\nImpact Score: 98\nOpen Defects: 0\nClosed Defects: 5\n\nCourse Completion Flow has excellent 95% coverage and the highest impact score of 98. Very low risk.',
'Core UJ feature with 95% coverage, highest impact, low risk', ARRAY['manager', 'Core User Journeys', 'fully_automated', 'low-risk'], '{"featureId": "f43", "coverage": 95, "riskScore": 12, "passRate": 97}'::jsonb),

('manager', 'feature', 'Profile Management', E'Feature: Profile Management\nCategory: Core User Journeys\nCoverage: 88%\nStatus: partially_automated\nRisk Score: 18 (Low)\nPass Rate: 91%\nImpact Score: 72\nOpen Defects: 1\nClosed Defects: 4',
'Core UJ feature with 88% coverage, low risk', ARRAY['manager', 'Core User Journeys', 'partially_automated', 'low-risk'], '{"featureId": "f44", "coverage": 88, "riskScore": 18, "passRate": 91}'::jsonb),

('manager', 'feature', 'Mobile Experience', E'Feature: Mobile Experience\nCategory: Core User Journeys\nCoverage: 79%\nStatus: partially_automated\nRisk Score: 42 (High)\nPass Rate: 86%\nImpact Score: 90\nOpen Defects: 3\nClosed Defects: 7\n\nMobile Experience has a HIGH risk score of 42 with only 79% coverage. Three open defects and high impact make this the top priority for attention.',
'Core UJ feature with 79% coverage, HIGH RISK, 3 open defects', ARRAY['manager', 'Core User Journeys', 'partially_automated', 'high-risk'], '{"featureId": "f45", "coverage": 79, "riskScore": 42, "passRate": 86}'::jsonb),

('manager', 'feature', 'Search & Discovery', E'Feature: Search & Discovery\nCategory: Core User Journeys\nCoverage: 84%\nStatus: partially_automated\nRisk Score: 30 (Medium)\nPass Rate: 88%\nImpact Score: 85\nOpen Defects: 2\nClosed Defects: 6',
'Core UJ feature with 84% coverage, medium risk', ARRAY['manager', 'Core User Journeys', 'partially_automated', 'medium-risk'], '{"featureId": "f46", "coverage": 84, "riskScore": 30, "passRate": 88}'::jsonb);

-- =====================================================
-- 7. SEED DATA - Tech Lead Features (18)
-- =====================================================

INSERT INTO dtq.knowledge_base (persona, item_type, title, content, summary, tags, metadata) VALUES
-- CI/CD Pipeline
('techlead', 'feature', 'Build Orchestration', E'Feature: Build Orchestration\nCategory: CI/CD Pipeline\nCoverage: 88%\nStatus: fully_automated\nRisk Score: 25 (Medium)\nPass Rate: 91%\nImpact Score: 90\nOpen Defects: 2\nClosed Defects: 8',
'CI/CD feature with 88% coverage, medium risk', ARRAY['techlead', 'CI/CD Pipeline', 'fully_automated', 'medium-risk'], '{"featureId": "tl-f1", "coverage": 88, "riskScore": 25, "passRate": 91}'::jsonb),

('techlead', 'feature', 'Deploy Pipeline', E'Feature: Deploy Pipeline\nCategory: CI/CD Pipeline\nCoverage: 85%\nStatus: partially_automated\nRisk Score: 32 (Medium)\nPass Rate: 88%\nImpact Score: 92\nOpen Defects: 3\nClosed Defects: 7',
'CI/CD feature with 85% coverage, medium risk, high impact', ARRAY['techlead', 'CI/CD Pipeline', 'partially_automated', 'medium-risk'], '{"featureId": "tl-f2", "coverage": 85, "riskScore": 32, "passRate": 88}'::jsonb),

('techlead', 'feature', 'Rollback Automation', E'Feature: Rollback Automation\nCategory: CI/CD Pipeline\nCoverage: 82%\nStatus: partially_automated\nRisk Score: 35 (Medium)\nPass Rate: 86%\nImpact Score: 88\nOpen Defects: 2\nClosed Defects: 5',
'CI/CD feature with 82% coverage, medium-high risk', ARRAY['techlead', 'CI/CD Pipeline', 'partially_automated', 'medium-risk'], '{"featureId": "tl-f3", "coverage": 82, "riskScore": 35, "passRate": 86}'::jsonb),

('techlead', 'feature', 'Feature Flags', E'Feature: Feature Flags\nCategory: CI/CD Pipeline\nCoverage: 90%\nStatus: fully_automated\nRisk Score: 20 (Medium)\nPass Rate: 93%\nImpact Score: 78\nOpen Defects: 1\nClosed Defects: 6',
'CI/CD feature with 90% coverage, medium risk', ARRAY['techlead', 'CI/CD Pipeline', 'fully_automated', 'medium-risk'], '{"featureId": "tl-f4", "coverage": 90, "riskScore": 20, "passRate": 93}'::jsonb),

-- API Infrastructure
('techlead', 'feature', 'REST API Gateway', E'Feature: REST API Gateway\nCategory: API Infrastructure\nCoverage: 92%\nStatus: fully_automated\nRisk Score: 18 (Low)\nPass Rate: 94%\nImpact Score: 95\nOpen Defects: 1\nClosed Defects: 9',
'API feature with 92% coverage, low risk, high impact', ARRAY['techlead', 'API Infrastructure', 'fully_automated', 'low-risk'], '{"featureId": "tl-f5", "coverage": 92, "riskScore": 18, "passRate": 94}'::jsonb),

('techlead', 'feature', 'GraphQL Layer', E'Feature: GraphQL Layer\nCategory: API Infrastructure\nCoverage: 79%\nStatus: partially_automated\nRisk Score: 38 (Medium)\nPass Rate: 85%\nImpact Score: 88\nOpen Defects: 3\nClosed Defects: 6\n\nGraphQL Layer has lower 79% coverage with elevated risk. Three open defects need attention.',
'API feature with 79% coverage, medium-high risk, 3 open defects', ARRAY['techlead', 'API Infrastructure', 'partially_automated', 'medium-risk'], '{"featureId": "tl-f6", "coverage": 79, "riskScore": 38, "passRate": 85}'::jsonb),

('techlead', 'feature', 'Rate Limiting', E'Feature: Rate Limiting\nCategory: API Infrastructure\nCoverage: 86%\nStatus: fully_automated\nRisk Score: 22 (Medium)\nPass Rate: 92%\nImpact Score: 82\nOpen Defects: 1\nClosed Defects: 4',
'API feature with 86% coverage, medium risk', ARRAY['techlead', 'API Infrastructure', 'fully_automated', 'medium-risk'], '{"featureId": "tl-f7", "coverage": 86, "riskScore": 22, "passRate": 92}'::jsonb),

('techlead', 'feature', 'API Versioning', E'Feature: API Versioning\nCategory: API Infrastructure\nCoverage: 83%\nStatus: partially_automated\nRisk Score: 28 (Medium)\nPass Rate: 89%\nImpact Score: 76\nOpen Defects: 2\nClosed Defects: 5',
'API feature with 83% coverage, medium risk', ARRAY['techlead', 'API Infrastructure', 'partially_automated', 'medium-risk'], '{"featureId": "tl-f8", "coverage": 83, "riskScore": 28, "passRate": 89}'::jsonb),

-- Performance Engineering
('techlead', 'feature', 'Load Testing Framework', E'Feature: Load Testing Framework\nCategory: Performance Engineering\nCoverage: 78%\nStatus: partially_automated\nRisk Score: 40 (High)\nPass Rate: 84%\nImpact Score: 90\nOpen Defects: 3\nClosed Defects: 7\n\nLoad Testing Framework has HIGH risk score of 40 with 78% coverage. Three open defects and high impact make this critical.',
'Performance feature with 78% coverage, HIGH RISK', ARRAY['techlead', 'Performance Engineering', 'partially_automated', 'high-risk'], '{"featureId": "tl-f9", "coverage": 78, "riskScore": 40, "passRate": 84}'::jsonb),

('techlead', 'feature', 'Memory Profiler', E'Feature: Memory Profiler\nCategory: Performance Engineering\nCoverage: 75%\nStatus: partially_automated\nRisk Score: 36 (Medium)\nPass Rate: 82%\nImpact Score: 85\nOpen Defects: 2\nClosed Defects: 4',
'Performance feature with 75% coverage, medium-high risk', ARRAY['techlead', 'Performance Engineering', 'partially_automated', 'medium-risk'], '{"featureId": "tl-f10", "coverage": 75, "riskScore": 36, "passRate": 82}'::jsonb),

('techlead', 'feature', 'CDN Optimization', E'Feature: CDN Optimization\nCategory: Performance Engineering\nCoverage: 91%\nStatus: fully_automated\nRisk Score: 15 (Low)\nPass Rate: 95%\nImpact Score: 80\nOpen Defects: 0\nClosed Defects: 5',
'Performance feature with 91% coverage, low risk', ARRAY['techlead', 'Performance Engineering', 'fully_automated', 'low-risk'], '{"featureId": "tl-f11", "coverage": 91, "riskScore": 15, "passRate": 95}'::jsonb),

-- Security Testing
('techlead', 'feature', 'Penetration Test Suite', E'Feature: Penetration Test Suite\nCategory: Security Testing\nCoverage: 70%\nStatus: partially_automated\nRisk Score: 45 (High)\nPass Rate: 80%\nImpact Score: 96\nOpen Defects: 4\nClosed Defects: 8\n\nPenetration Test Suite has the HIGHEST risk score of 45 with only 70% coverage. Four open defects and critical impact score of 96 make this the top priority.',
'Security feature with 70% coverage, HIGHEST RISK, 4 open defects', ARRAY['techlead', 'Security Testing', 'partially_automated', 'high-risk'], '{"featureId": "tl-f12", "coverage": 70, "riskScore": 45, "passRate": 80}'::jsonb),

('techlead', 'feature', 'Dependency Scanner', E'Feature: Dependency Scanner\nCategory: Security Testing\nCoverage: 93%\nStatus: fully_automated\nRisk Score: 16 (Low)\nPass Rate: 94%\nImpact Score: 88\nOpen Defects: 1\nClosed Defects: 6',
'Security feature with 93% coverage, low risk', ARRAY['techlead', 'Security Testing', 'fully_automated', 'low-risk'], '{"featureId": "tl-f13", "coverage": 93, "riskScore": 16, "passRate": 94}'::jsonb),

('techlead', 'feature', 'Auth Token Validation', E'Feature: Auth Token Validation\nCategory: Security Testing\nCoverage: 89%\nStatus: fully_automated\nRisk Score: 20 (Medium)\nPass Rate: 92%\nImpact Score: 94\nOpen Defects: 1\nClosed Defects: 5',
'Security feature with 89% coverage, medium risk', ARRAY['techlead', 'Security Testing', 'fully_automated', 'medium-risk'], '{"featureId": "tl-f14", "coverage": 89, "riskScore": 20, "passRate": 92}'::jsonb),

-- DevOps Automation
('techlead', 'feature', 'Container Orchestration', E'Feature: Container Orchestration\nCategory: DevOps Automation\nCoverage: 84%\nStatus: partially_automated\nRisk Score: 30 (Medium)\nPass Rate: 88%\nImpact Score: 92\nOpen Defects: 2\nClosed Defects: 7',
'DevOps feature with 84% coverage, medium risk, high impact', ARRAY['techlead', 'DevOps Automation', 'partially_automated', 'medium-risk'], '{"featureId": "tl-f15", "coverage": 84, "riskScore": 30, "passRate": 88}'::jsonb),

('techlead', 'feature', 'Log Aggregation', E'Feature: Log Aggregation\nCategory: DevOps Automation\nCoverage: 87%\nStatus: fully_automated\nRisk Score: 19 (Low)\nPass Rate: 91%\nImpact Score: 78\nOpen Defects: 1\nClosed Defects: 4',
'DevOps feature with 87% coverage, low risk', ARRAY['techlead', 'DevOps Automation', 'fully_automated', 'low-risk'], '{"featureId": "tl-f16", "coverage": 87, "riskScore": 19, "passRate": 91}'::jsonb),

('techlead', 'feature', 'Infra-as-Code', E'Feature: Infra-as-Code\nCategory: DevOps Automation\nCoverage: 81%\nStatus: partially_automated\nRisk Score: 33 (Medium)\nPass Rate: 86%\nImpact Score: 90\nOpen Defects: 2\nClosed Defects: 6',
'DevOps feature with 81% coverage, medium risk', ARRAY['techlead', 'DevOps Automation', 'partially_automated', 'medium-risk'], '{"featureId": "tl-f17", "coverage": 81, "riskScore": 33, "passRate": 86}'::jsonb),

('techlead', 'feature', 'Secrets Management', E'Feature: Secrets Management\nCategory: DevOps Automation\nCoverage: 96%\nStatus: fully_automated\nRisk Score: 10 (Low)\nPass Rate: 98%\nImpact Score: 95\nOpen Defects: 0\nClosed Defects: 3',
'DevOps feature with 96% coverage, very low risk', ARRAY['techlead', 'DevOps Automation', 'fully_automated', 'low-risk'], '{"featureId": "tl-f18", "coverage": 96, "riskScore": 10, "passRate": 98}'::jsonb);

-- =====================================================
-- 8. SEED DATA - Category Summaries
-- =====================================================

-- C-Suite Categories (5)
INSERT INTO dtq.knowledge_base (persona, item_type, title, content, summary, tags, metadata) VALUES
('csuite', 'category_summary', 'Category: Revenue Platform', E'Category: Revenue Platform\nFeatures: 4 (Payment Gateway, Subscription Billing, Revenue Analytics, Pricing Engine)\nAvg Coverage: 92%\nHigh-Risk Features: 0\nTotal Open Defects: 2\n\nThe Revenue Platform category has strong overall coverage at 92%. Three of four features are fully automated. Pricing Engine is partially automated and should be prioritized for full automation.',
'Revenue Platform: 4 features, 92% avg coverage', ARRAY['csuite', 'category-summary', 'Revenue Platform'], '{}'::jsonb),

('csuite', 'category_summary', 'Category: Customer Experience', E'Category: Customer Experience\nFeatures: 4 (Customer Portal, NPS Tracking, Support Escalation, Onboarding Journey)\nAvg Coverage: 91%\nHigh-Risk Features: 0\nTotal Open Defects: 2\n\nCustomer Experience category performs well at 91% average coverage. NPS Tracking is the only partially automated feature.',
'Customer Experience: 4 features, 91% avg coverage', ARRAY['csuite', 'category-summary', 'Customer Experience'], '{}'::jsonb),

('csuite', 'category_summary', 'Category: Market Expansion', E'Category: Market Expansion\nFeatures: 3 (Multi-Region Deployment, Localization Engine, Partner Integration)\nAvg Coverage: 88%\nHigh-Risk Features: 0\nTotal Open Defects: 3\n\nMarket Expansion has room for improvement. Two of three features are partially automated with 3 total open defects.',
'Market Expansion: 3 features, 88% avg coverage', ARRAY['csuite', 'category-summary', 'Market Expansion'], '{}'::jsonb),

('csuite', 'category_summary', 'Category: Strategic Compliance', E'Category: Strategic Compliance\nFeatures: 3 (SOC 2 Validation, GDPR Data Handling, Audit Trail System)\nAvg Coverage: 95%\nHigh-Risk Features: 0\nTotal Open Defects: 1\n\nStrategic Compliance is the strongest category with 95% avg coverage. All features are fully automated.',
'Strategic Compliance: 3 features, 95% avg coverage, strongest category', ARRAY['csuite', 'category-summary', 'Strategic Compliance'], '{}'::jsonb),

('csuite', 'category_summary', 'Category: Digital Transformation', E'Category: Digital Transformation\nFeatures: 2 (AI Feature Pipeline, Legacy Migration)\nAvg Coverage: 83%\nHigh-Risk Features: 0\nTotal Open Defects: 3\n\nDigital Transformation has the lowest coverage in the C-Suite view at 83%. Both features are partially automated. AI Feature Pipeline has the highest impact score (97) in the suite.',
'Digital Transformation: 2 features, 83% avg coverage, lowest in C-Suite', ARRAY['csuite', 'category-summary', 'Digital Transformation'], '{}'::jsonb);

-- Manager Categories (10)
INSERT INTO dtq.knowledge_base (persona, item_type, title, content, summary, tags, metadata) VALUES
('manager', 'category_summary', 'Category: Advanced / Enterprise', E'Category: Advanced / Enterprise\nFeatures: 5 (xAPI/LRS Integration, Multi-Tenant Config, Compliance Tracking, Custom Branding, Enterprise SSO)\nAvg Coverage: 90%\nHigh-Risk Features: 1 (xAPI/LRS Integration - risk 45)\nTotal Open Defects: 4\n\nStrong category but xAPI/LRS Integration has elevated risk score of 45.',
'Advanced / Enterprise: 5 features, 90% avg coverage, 1 high-risk', ARRAY['manager', 'category-summary', 'Advanced / Enterprise'], '{}'::jsonb),

('manager', 'category_summary', 'Category: Learning Experience', E'Category: Learning Experience\nFeatures: 4 (Adaptive Learning, Personalized Recommendations, Skill Gap Analysis, Learning Goals)\nAvg Coverage: 89%\nHigh-Risk Features: 0\nTotal Open Defects: 6\n\n6 open defects across 4 features, with Adaptive Learning Paths having the most (3).',
'Learning Experience: 4 features, 89% avg coverage, 6 open defects', ARRAY['manager', 'category-summary', 'Learning Experience'], '{}'::jsonb),

('manager', 'category_summary', 'Category: Reporting & Analytics', E'Category: Reporting & Analytics\nFeatures: 5 (Executive Dashboard, Custom Report Builder, Learning Analytics, Compliance Reports, Export Center)\nAvg Coverage: 90%\nHigh-Risk Features: 1 (Learning Analytics - risk 42)\nTotal Open Defects: 5\n\nLearning Analytics has a high risk score of 42 and needs priority attention.',
'Reporting & Analytics: 5 features, 90% avg coverage, 1 high-risk', ARRAY['manager', 'category-summary', 'Reporting & Analytics'], '{}'::jsonb),

('manager', 'category_summary', 'Category: Course Catalog & Enrollment', E'Category: Course Catalog & Enrollment\nFeatures: 4 (Course Discovery, Self-Enrollment, Manager-Assigned Learning, Waitlist Management)\nAvg Coverage: 87%\nHigh-Risk Features: 0\nTotal Open Defects: 4',
'Course Catalog: 4 features, 87% avg coverage', ARRAY['manager', 'category-summary', 'Course Catalog & Enrollment'], '{}'::jsonb),

('manager', 'category_summary', 'Category: Social & Collaboration', E'Category: Social & Collaboration\nFeatures: 4 (Discussion Forums, Peer Reviews, Learning Groups, Social Sharing)\nAvg Coverage: 84%\nHigh-Risk Features: 0\nTotal Open Defects: 4',
'Social & Collaboration: 4 features, 84% avg coverage', ARRAY['manager', 'category-summary', 'Social & Collaboration'], '{}'::jsonb),

('manager', 'category_summary', 'Category: Course Creation & Management', E'Category: Course Creation & Management\nFeatures: 5 (SCORM Import, Content Authoring, Assessment Builder, Media Library, Course Versioning)\nAvg Coverage: 88%\nHigh-Risk Features: 0\nTotal Open Defects: 5\n\nContent Authoring has the lowest coverage (81%) but highest impact (92) in this category.',
'Course Creation: 5 features, 88% avg coverage', ARRAY['manager', 'category-summary', 'Course Creation & Management'], '{}'::jsonb),

('manager', 'category_summary', 'Category: Admin & Configuration', E'Category: Admin & Configuration\nFeatures: 6 (User Mgmt, RBAC, Notification Settings, Integration Hub, Audit Logs, System Config)\nAvg Coverage: 89%\nHigh-Risk Features: 0\nTotal Open Defects: 5\n\nLargest category with 6 features. Audit Logs has excellent 97% coverage while Integration Hub has lowest at 78%.',
'Admin & Configuration: 6 features, 89% avg coverage', ARRAY['manager', 'category-summary', 'Admin & Configuration'], '{}'::jsonb),

('manager', 'category_summary', 'Category: Assessments & Certification', E'Category: Assessments & Certification\nFeatures: 4 (Quiz Engine, Certification Paths, Proctoring Support, Certificate Designer)\nAvg Coverage: 86%\nHigh-Risk Features: 0\nTotal Open Defects: 4\n\nProctoring Support has the lowest coverage (75%) in this category.',
'Assessments & Certification: 4 features, 86% avg coverage', ARRAY['manager', 'category-summary', 'Assessments & Certification'], '{}'::jsonb),

('manager', 'category_summary', 'Category: Events & Live Sessions', E'Category: Events & Live Sessions\nFeatures: 4 (Webinar Integration, ILT Scheduling, Attendance Tracking, Virtual Classroom)\nAvg Coverage: 86%\nHigh-Risk Features: 0\nTotal Open Defects: 3\n\nVirtual Classroom has the lowest coverage (77%) and highest risk (38) in this category.',
'Events & Live Sessions: 4 features, 86% avg coverage', ARRAY['manager', 'category-summary', 'Events & Live Sessions'], '{}'::jsonb),

('manager', 'category_summary', 'Category: Core User Journeys', E'Category: Core User Journeys\nFeatures: 5 (User Onboarding, Course Completion, Profile Management, Mobile Experience, Search & Discovery)\nAvg Coverage: 87%\nHigh-Risk Features: 1 (Mobile Experience - risk 42)\nTotal Open Defects: 7\n\nMobile Experience is the highest risk feature (42) across all manager features. Course Completion Flow has the highest impact score (98) in the entire system.',
'Core User Journeys: 5 features, 87% avg coverage, 1 high-risk', ARRAY['manager', 'category-summary', 'Core User Journeys'], '{}'::jsonb);

-- Tech Lead Categories (5)
INSERT INTO dtq.knowledge_base (persona, item_type, title, content, summary, tags, metadata) VALUES
('techlead', 'category_summary', 'Category: CI/CD Pipeline', E'Category: CI/CD Pipeline\nFeatures: 4 (Build Orchestration, Deploy Pipeline, Rollback Automation, Feature Flags)\nAvg Coverage: 86%\nHigh-Risk Features: 0\nTotal Open Defects: 8\n\nCI/CD Pipeline has 8 total open defects across 4 features. Rollback Automation has the highest risk (35).',
'CI/CD Pipeline: 4 features, 86% avg coverage, 8 open defects', ARRAY['techlead', 'category-summary', 'CI/CD Pipeline'], '{}'::jsonb),

('techlead', 'category_summary', 'Category: API Infrastructure', E'Category: API Infrastructure\nFeatures: 4 (REST API Gateway, GraphQL Layer, Rate Limiting, API Versioning)\nAvg Coverage: 85%\nHigh-Risk Features: 0\nTotal Open Defects: 7\n\nGraphQL Layer has the lowest coverage (79%) and highest risk (38) in this category.',
'API Infrastructure: 4 features, 85% avg coverage', ARRAY['techlead', 'category-summary', 'API Infrastructure'], '{}'::jsonb),

('techlead', 'category_summary', 'Category: Performance Engineering', E'Category: Performance Engineering\nFeatures: 3 (Load Testing Framework, Memory Profiler, CDN Optimization)\nAvg Coverage: 81%\nHigh-Risk Features: 1 (Load Testing Framework - risk 40)\nTotal Open Defects: 5\n\nLoad Testing Framework is high-risk with 40 score. This category has the lowest average coverage in the Tech Lead view.',
'Performance Engineering: 3 features, 81% avg coverage, 1 high-risk, lowest coverage', ARRAY['techlead', 'category-summary', 'Performance Engineering'], '{}'::jsonb),

('techlead', 'category_summary', 'Category: Security Testing', E'Category: Security Testing\nFeatures: 3 (Penetration Test Suite, Dependency Scanner, Auth Token Validation)\nAvg Coverage: 84%\nHigh-Risk Features: 1 (Penetration Test Suite - risk 45)\nTotal Open Defects: 6\n\nPenetration Test Suite has the HIGHEST risk score (45) across all Tech Lead features with only 70% coverage and 4 open defects.',
'Security Testing: 3 features, 84% avg coverage, 1 HIGH RISK', ARRAY['techlead', 'category-summary', 'Security Testing'], '{}'::jsonb),

('techlead', 'category_summary', 'Category: DevOps Automation', E'Category: DevOps Automation\nFeatures: 4 (Container Orchestration, Log Aggregation, Infra-as-Code, Secrets Management)\nAvg Coverage: 87%\nHigh-Risk Features: 0\nTotal Open Defects: 5\n\nSecrets Management has excellent 96% coverage. Infra-as-Code is the weakest at 81%.',
'DevOps Automation: 4 features, 87% avg coverage', ARRAY['techlead', 'category-summary', 'DevOps Automation'], '{}'::jsonb);

-- =====================================================
-- 9. SEED DATA - Persona KPIs
-- =====================================================

-- C-Suite KPIs (7)
INSERT INTO dtq.knowledge_base (persona, item_type, title, content, summary, tags, metadata) VALUES
('csuite', 'persona_kpi', 'Release Velocity', E'KPI: Release Velocity\nValue: +35%\nUnit: %\nDescription: More releases per quarter\nTrend: Up (+8%)\n\nRelease velocity has increased by 35%, meaning the team ships 35% more releases per quarter compared to baseline. The trend is positive with an additional 8% improvement recently.',
'Release velocity is up 35%, improving +8%', ARRAY['csuite', 'kpi', 'releaseVelocity'], '{"value": "+35", "unit": "%", "trend": "up", "trendValue": "+8%"}'::jsonb),

('csuite', 'persona_kpi', 'Mean Time to Market', E'KPI: Mean Time to Market\nValue: 12 days\nUnit: days\nDescription: For new features\nTrend: Down (-4 days)\n\nNew features now reach production in 12 days on average, down 4 days from previous period. This is a significant improvement in delivery speed.',
'Time to market is 12 days, improving by -4 days', ARRAY['csuite', 'kpi', 'timeToMarket'], '{"value": 12, "unit": "days", "trend": "down", "trendValue": "-4 days"}'::jsonb),

('csuite', 'persona_kpi', 'Automation ROI', E'KPI: Automation ROI\nValue: 285%\nUnit: %\nDescription: Cost savings from test automation\nTrend: Up (+45%)\n\nTest automation delivers 285% ROI in cost savings, up 45% from previous quarter. This accounts for reduced manual testing effort and faster feedback cycles.',
'Automation ROI is 285%, up +45%', ARRAY['csuite', 'kpi', 'automationROI'], '{"value": 285, "unit": "%", "trend": "up", "trendValue": "+45%"}'::jsonb),

('csuite', 'persona_kpi', 'Defect Escape Rate', E'KPI: Defect Escape Rate\nValue: 2.1%\nUnit: %\nDescription: Bugs reaching production\nTrend: Down (-0.8%)\n\nOnly 2.1% of defects escape to production, down 0.8% from previous period. This means testing catches 97.9% of issues before release.',
'Defect escape rate is 2.1%, improving by -0.8%', ARRAY['csuite', 'kpi', 'escapeRate'], '{"value": 2.1, "unit": "%", "trend": "down", "trendValue": "-0.8%"}'::jsonb),

('csuite', 'persona_kpi', 'Incidents Prevented', E'KPI: Incidents Prevented\nValue: 47\nUnit: count\nDescription: Customer-impacting incidents prevented by testing\nTrend: Up (+12)\n\nTesting has prevented 47 customer-impacting incidents, up 12 from the previous period.',
'47 customer incidents prevented, up +12', ARRAY['csuite', 'kpi', 'incidentsPrevented'], '{"value": 47, "unit": "count", "trend": "up", "trendValue": "+12"}'::jsonb),

('csuite', 'persona_kpi', 'Risk Reduction', E'KPI: Risk Reduction\nValue: 68%\nUnit: %\nDescription: Business impact weighted risk reduction\nTrend: Up (+15%)\n\nOverall business risk has been reduced by 68%, weighted by impact. This is up 15% from the previous period.',
'Risk reduction at 68%, up +15%', ARRAY['csuite', 'kpi', 'riskReduction'], '{"value": 68, "unit": "%", "trend": "up", "trendValue": "+15%"}'::jsonb),

('csuite', 'persona_kpi', 'Capacity Unlocked', E'KPI: Capacity Unlocked\nValue: 42%\nUnit: %\nDescription: QA time redirected to innovation\nTrend: Up (+8%)\n\n42% of QA capacity has been freed up for innovation work, up 8% from previous period. Automation handles routine testing.',
'42% QA capacity freed for innovation, up +8%', ARRAY['csuite', 'kpi', 'capacityUnlocked'], '{"value": 42, "unit": "%", "trend": "up", "trendValue": "+8%"}'::jsonb);

-- Manager KPIs (9)
INSERT INTO dtq.knowledge_base (persona, item_type, title, content, summary, tags, metadata) VALUES
('manager', 'persona_kpi', 'Test Pass Rate', E'KPI: Test Pass Rate\nValue: 94.2%\nUnit: %\nDescription: Last 30 days average\nTrend: Up (+2.3%)\n\nThe overall test pass rate is 94.2% averaged over the last 30 days, up 2.3% from the previous period.',
'Test pass rate at 94.2%, improving +2.3%', ARRAY['manager', 'kpi', 'passRate'], '{"value": 94.2, "unit": "%", "trend": "up", "trendValue": "+2.3%"}'::jsonb),

('manager', 'persona_kpi', 'Automated vs Manual', E'KPI: Automated vs Manual Ratio\nValue: 8.5:1\nUnit: ratio\nDescription: Test efficiency ratio\nTrend: Up (+0.5)\n\nFor every manual test, there are 8.5 automated tests. This ratio has improved by 0.5 from the previous period.',
'Automated to manual ratio is 8.5:1, up +0.5', ARRAY['manager', 'kpi', 'autoManualRatio'], '{"value": "8.5:1", "unit": "ratio", "trend": "up", "trendValue": "+0.5"}'::jsonb),

('manager', 'persona_kpi', 'Test Case Effectiveness', E'KPI: Test Case Effectiveness\nValue: 0.87\nUnit: score\nDescription: Defects found per test case\nTrend: Stable (0.0)\n\nTest case effectiveness score is 0.87, meaning each test case finds an average of 0.87 defects. This metric has been stable.',
'Test effectiveness at 0.87 score, stable', ARRAY['manager', 'kpi', 'effectiveness'], '{"value": 0.87, "unit": "score", "trend": "stable", "trendValue": "0.0"}'::jsonb),

('manager', 'persona_kpi', 'Regression Execution', E'KPI: Regression Execution\nValue: 42 min\nUnit: min\nDescription: Full suite duration\nTrend: Down (-8 min)\n\nFull regression suite now completes in 42 minutes, down 8 minutes from the previous period.',
'Regression suite runs in 42 min, improved by -8 min', ARRAY['manager', 'kpi', 'regressionTime'], '{"value": 42, "unit": "min", "trend": "down", "trendValue": "-8 min"}'::jsonb),

('manager', 'persona_kpi', 'First-Run Pass Rate', E'KPI: First-Run Pass Rate\nValue: 87.5%\nUnit: %\nDescription: New features pass rate on first test run\nTrend: Up (+4.2%)\n\n87.5% of new features pass their first test execution, up 4.2% from the previous period.',
'First-run pass rate at 87.5%, improving +4.2%', ARRAY['manager', 'kpi', 'firstRunPass'], '{"value": 87.5, "unit": "%", "trend": "up", "trendValue": "+4.2%"}'::jsonb),

('manager', 'persona_kpi', 'Escalation Rate', E'KPI: Escalation Rate\nValue: 12.3%\nUnit: %\nDescription: Automated tests escalated to manual review\nTrend: Down (-2.1%)\n\n12.3% of automated tests require manual review escalation, down 2.1% from previous period.',
'Escalation rate at 12.3%, improving by -2.1%', ARRAY['manager', 'kpi', 'escalationRate'], '{"value": 12.3, "unit": "%", "trend": "down", "trendValue": "-2.1%"}'::jsonb),

('manager', 'persona_kpi', 'Test Case Reuse', E'KPI: Test Case Reuse\nValue: 76.8%\nUnit: %\nDescription: Reuse rate across releases\nTrend: Up (+5.3%)\n\n76.8% of test cases are reused across releases, up 5.3%.',
'Test case reuse at 76.8%, up +5.3%', ARRAY['manager', 'kpi', 'testReuse'], '{"value": 76.8, "unit": "%", "trend": "up", "trendValue": "+5.3%"}'::jsonb),

('manager', 'persona_kpi', 'Blocker Defects', E'KPI: Blocker Defects\nValue: 3\nUnit: count\nDescription: Critical blocking issues\nTrend: Down (-2)\n\nThere are currently 3 blocker defects, down 2 from the previous period.',
'3 blocker defects, down -2', ARRAY['manager', 'kpi', 'blockerDefects'], '{"value": 3, "unit": "count", "trend": "down", "trendValue": "-2"}'::jsonb),

('manager', 'persona_kpi', 'Environment Uptime', E'KPI: Environment Uptime\nValue: 99.2%\nUnit: %\nDescription: Test environment stability\nTrend: Stable (0.0%)\n\nTest environments maintain 99.2% uptime, which has been stable.',
'Environment uptime at 99.2%, stable', ARRAY['manager', 'kpi', 'envUptime'], '{"value": 99.2, "unit": "%", "trend": "stable", "trendValue": "0.0%"}'::jsonb);

-- Tech Lead KPIs (8)
INSERT INTO dtq.knowledge_base (persona, item_type, title, content, summary, tags, metadata) VALUES
('techlead', 'persona_kpi', 'Flaky Test Rate', E'KPI: Flaky Test Rate\nValue: 3.2%\nUnit: %\nDescription: Tests with inconsistent results\nTrend: Down (-1.5%)\n\nOnly 3.2% of tests produce inconsistent results, down 1.5% from previous period.',
'Flaky test rate at 3.2%, improving by -1.5%', ARRAY['techlead', 'kpi', 'flakyRate'], '{"value": 3.2, "unit": "%", "trend": "down", "trendValue": "-1.5%"}'::jsonb),

('techlead', 'persona_kpi', 'Avg Execution Time', E'KPI: Avg Execution Time\nValue: 4.2 min\nUnit: min\nDescription: Per test suite\nTrend: Down (-0.8 min)\n\nAverage test suite execution time is 4.2 minutes, down 0.8 minutes.',
'Avg execution time 4.2 min, improved by -0.8 min', ARRAY['techlead', 'kpi', 'avgExecution'], '{"value": 4.2, "unit": "min", "trend": "down", "trendValue": "-0.8 min"}'::jsonb),

('techlead', 'persona_kpi', 'Token Usage Cost', E'KPI: Token Usage Cost\nValue: $0.42\nUnit: $\nDescription: Cost per agentic test run\nTrend: Down (-$0.15)\n\nEach agentic test run costs $0.42 in token usage, down $0.15 from previous period.',
'Token cost at $0.42 per run, improved by -$0.15', ARRAY['techlead', 'kpi', 'tokenCost'], '{"value": 0.42, "unit": "$", "trend": "down", "trendValue": "-$0.15"}'::jsonb),

('techlead', 'persona_kpi', 'Context Hit Rate', E'KPI: Context Hit Rate\nValue: 94.5%\nUnit: %\nDescription: AI context relevance score\nTrend: Up (+2.3%)\n\n94.5% of AI-generated test contexts are relevant to the test case, up 2.3%.',
'Context hit rate at 94.5%, up +2.3%', ARRAY['techlead', 'kpi', 'contextHitRate'], '{"value": 94.5, "unit": "%", "trend": "up", "trendValue": "+2.3%"}'::jsonb),

('techlead', 'persona_kpi', 'Tool Call Success', E'KPI: Tool Call Success\nValue: 97.8%\nUnit: %\nDescription: Click/type action accuracy\nTrend: Up (+1.2%)\n\n97.8% of automated tool calls (clicks, types) succeed, up 1.2%.',
'Tool call success at 97.8%, up +1.2%', ARRAY['techlead', 'kpi', 'toolCallSuccess'], '{"value": 97.8, "unit": "%", "trend": "up", "trendValue": "+1.2%"}'::jsonb),

('techlead', 'persona_kpi', 'Parallel Efficiency', E'KPI: Parallel Efficiency\nValue: 78.5%\nUnit: %\nDescription: Speed-up vs theoretical parallel maximum\nTrend: Up (+5%)\n\nParallel test execution achieves 78.5% of theoretical maximum speed-up, up 5%.',
'Parallel efficiency at 78.5%, up +5%', ARRAY['techlead', 'kpi', 'parallelEfficiency'], '{"value": 78.5, "unit": "%", "trend": "up", "trendValue": "+5%"}'::jsonb),

('techlead', 'persona_kpi', 'Automation Coverage', E'KPI: Automation Coverage\nValue: 93.3%\nUnit: %\nDescription: Code and requirements coverage\nTrend: Up (+2.1%)\n\n93.3% of code and requirements are covered by automated tests, up 2.1%.',
'Automation coverage at 93.3%, up +2.1%', ARRAY['techlead', 'kpi', 'automationCoverage'], '{"value": 93.3, "unit": "%", "trend": "up", "trendValue": "+2.1%"}'::jsonb),

('techlead', 'persona_kpi', 'Total Test Cases', E'KPI: Total Test Cases\nValue: 1,247\nUnit: count\nDescription: Active test cases in the suite\nTrend: Up (+86)\n\nThere are 1,247 active test cases, up 86 from the previous period.',
'1,247 active test cases, up +86', ARRAY['techlead', 'kpi', 'totalTests'], '{"value": 1247, "unit": "count", "trend": "up", "trendValue": "+86"}'::jsonb);

-- =====================================================
-- 10. SEED DATA - Test Run Summaries (1 per persona)
-- =====================================================

INSERT INTO dtq.knowledge_base (persona, item_type, title, content, summary, tags, metadata) VALUES
('csuite', 'test_run_summary', 'C-Suite Test Execution Summary', E'C-Suite Test Execution Summary\n\nTotal Test Runs: 40 (generated from 16 features)\nOverall Pass Rate: ~85%\nAvg Duration: 7 min per run\n\nTop Failing Areas:\n- AI Feature Pipeline (82% coverage, risk 30)\n- Localization Engine (85% coverage, 2 open defects)\n- Legacy Migration (84% coverage, risk 26)\n\nSeverity Breakdown:\n- High: ~30% of failures\n- Medium: ~45% of failures\n- Low: ~25% of failures\n\nThe C-Suite features focus on business-critical areas. Revenue Platform and Strategic Compliance are strong, while Digital Transformation needs more investment.',
'C-Suite: 40 test runs, ~85% pass rate, Digital Transformation needs attention', ARRAY['csuite', 'test-run-summary'], '{}'::jsonb),

('manager', 'test_run_summary', 'Manager Test Execution Summary', E'Manager Test Execution Summary\n\nTotal Test Runs: 40 (across 46 features)\nOverall Pass Rate: ~75% (10 of 40 runs failed)\nAvg Duration: 6.3 min per run\n\nTop Failing Features:\n1. Mobile Experience (4 failures, risk 42) - Element click issues, responsive layout problems\n2. Content Authoring (4 failures) - Rich text editor initialization failures\n3. Virtual Classroom (4 failures, risk 38) - Screen sharing issues\n4. xAPI/LRS Integration (3 failures, risk 45) - Timeout issues\n5. Course Discovery (2 failures) - Search API 500 errors\n\nSeverity Breakdown:\n- High: 5 issues (API failures, auth problems, camera access)\n- Medium: 4 issues (assertion failures, editor issues, screen share)\n- Low: 1 issue\n\nRecent Week Trends:\n- Pass rates improving from 91% to 97% over 30 days\n- Automation coverage growing steadily from 89% to 95%',
'Manager: 40 test runs, ~75% pass rate, Mobile Experience & xAPI are top risks', ARRAY['manager', 'test-run-summary'], '{}'::jsonb),

('techlead', 'test_run_summary', 'Tech Lead Test Execution Summary', E'Tech Lead Test Execution Summary\n\nTotal Test Runs: 40 (generated from 18 features)\nOverall Pass Rate: ~85%\nAvg Duration: 7.5 min per run\n\nTop Failing Areas:\n- Penetration Test Suite (70% coverage, risk 45, 4 open defects) - CRITICAL\n- Load Testing Framework (78% coverage, risk 40, 3 open defects)\n- GraphQL Layer (79% coverage, risk 38, 3 open defects)\n- Deploy Pipeline (85% coverage, risk 32, 3 open defects)\n\nSeverity Breakdown:\n- High: ~35% of failures\n- Medium: ~40% of failures\n- Low: ~25% of failures\n\nThe security testing category needs immediate attention. Penetration Test Suite is the highest-risk feature across all Tech Lead features.',
'Tech Lead: 40 test runs, ~85% pass rate, Security testing needs attention', ARRAY['techlead', 'test-run-summary'], '{}'::jsonb);

-- =====================================================
-- 11. SEED DATA - Daily Metrics Summaries (1 per persona)
-- =====================================================

INSERT INTO dtq.knowledge_base (persona, item_type, title, content, summary, tags, metadata) VALUES
('csuite', 'daily_metrics_summary', 'C-Suite 30-Day Metrics Overview', E'C-Suite 30-Day Metrics Overview\n\nAvg Pass Rate: 95.5% (range: 93-98%)\nAvg First-Run Pass Rate: 92% (range: 89-95%)\nAvg Defect Detection: 89.5% (range: 86-93%)\nAvg Effectiveness: 93% (range: 90-96%)\nAvg Automation Coverage: 93.5% (range: 91-96%)\n\nTrends (30 days):\n- Pass Rate: Steadily improving from 93% to 98%\n- Automation Coverage: Growing from 91% to 96%\n- All metrics show positive upward trajectory\n\nThe C-Suite metrics reflect the highest-performing view, emphasizing business-critical automation and quality.',
'C-Suite metrics strong: 95.5% pass rate, all trending up', ARRAY['csuite', 'metrics-summary'], '{}'::jsonb),

('manager', 'daily_metrics_summary', 'Manager 30-Day Metrics Overview', E'Manager 30-Day Metrics Overview\n\nAvg Pass Rate: 94.3% (range: 91-97%)\nAvg First-Run Pass Rate: 89.7% (range: 85-93%)\nAvg Defect Detection: 86.3% (range: 82-90%)\nAvg Effectiveness: 92.3% (range: 88-96%)\nAvg Automation Coverage: 92.5% (range: 89-95%)\n\nTrends (30 days):\n- Pass Rate: Steady improvement from 91% to 97%\n- Automation Coverage: Growing from 89% to 95%\n- First-Run Pass Rate: Notable improvement from 85% to 93%\n- Defect Detection: Improving from 82% to 90%\n\nOperational health is strong with consistent improvement across all key metrics.',
'Manager metrics healthy: 94.3% pass rate, steady improvement', ARRAY['manager', 'metrics-summary'], '{}'::jsonb),

('techlead', 'daily_metrics_summary', 'Tech Lead 30-Day Metrics Overview', E'Tech Lead 30-Day Metrics Overview\n\nAvg Pass Rate: 91.5% (range: 88-95%)\nAvg First-Run Pass Rate: 86.5% (range: 82-91%)\nAvg Defect Detection: 84% (range: 80-88%)\nAvg Effectiveness: 89% (range: 85-93%)\nAvg Automation Coverage: 89.5% (range: 86-93%)\n\nTrends (30 days):\n- Pass Rate: Improving from 88% to 95%\n- Automation Coverage: Growing from 86% to 93%\n- All metrics show upward trend\n\nTech Lead metrics reflect deeper technical testing with lower baselines but strong improvement trajectory.',
'Tech Lead metrics solid: 91.5% pass rate, strong improvement trajectory', ARRAY['techlead', 'metrics-summary'], '{}'::jsonb);

-- =====================================================
-- 12. SYNC TO public.knowledge_items
-- =====================================================

DO $$
DECLARE
    project_uuid UUID;
    kb_record RECORD;
BEGIN
    -- Get or create dTQ project
    SELECT id INTO project_uuid FROM public.projects WHERE code = 'dTQ';

    IF project_uuid IS NULL THEN
        INSERT INTO public.projects (code, name, description, status)
        VALUES ('dTQ', 'Test Pilot IQ', 'AI-powered testing intelligence platform', 'active')
        RETURNING id INTO project_uuid;
    END IF;

    -- Sync features and category summaries to public.knowledge_items
    FOR kb_record IN
        SELECT * FROM dtq.knowledge_base
        WHERE item_type IN ('feature', 'category_summary')
    LOOP
        INSERT INTO public.knowledge_items (
            project_id,
            source_table,
            source_id,
            type,
            title,
            content,
            summary,
            tags
        )
        VALUES (
            project_uuid,
            'dtq.knowledge_base',
            kb_record.id,
            kb_record.item_type,
            kb_record.title,
            kb_record.content,
            kb_record.summary,
            kb_record.tags
        )
        ON CONFLICT (project_id, source_table, source_id)
        DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            summary = EXCLUDED.summary,
            tags = EXCLUDED.tags,
            updated_at = NOW();
    END LOOP;
END $$;

-- =====================================================
-- 13. UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION dtq.update_knowledge_base_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_kb_timestamp
    BEFORE UPDATE ON dtq.knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION dtq.update_knowledge_base_timestamp();
