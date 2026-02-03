-- =====================================================
-- dTQ (Test Pilot IQ) - Knowledge Base Integration
-- =====================================================
-- Syncs dtq.features to public.knowledge_items for
-- cross-project search functionality
-- =====================================================

-- =====================================================
-- SYNC TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION dtq.sync_feature_to_knowledge()
RETURNS TRIGGER AS $$
DECLARE
    project_uuid UUID;
BEGIN
    -- Get dTQ project ID (create if not exists)
    SELECT id INTO project_uuid FROM public.projects WHERE code = 'dTQ';

    IF project_uuid IS NULL THEN
        INSERT INTO public.projects (code, name, description, status)
        VALUES ('dTQ', 'Test Pilot IQ', 'AI-powered testing intelligence platform', 'active')
        RETURNING id INTO project_uuid;
    END IF;

    -- Insert or update in knowledge_items
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
        'dtq.features',
        NEW.id,
        'feature',
        NEW.name,
        'Feature: ' || NEW.name || E'\nCategory: ' || NEW.category || E'\nCoverage: ' || NEW.coverage || '%' || E'\nStatus: ' || NEW.status || E'\nRisk Score: ' || NEW.risk_score || E'\nPass Rate: ' || NEW.pass_rate || '%',
        'Testing feature in ' || NEW.category || ' category with ' || NEW.coverage || '% automation coverage',
        ARRAY[NEW.category, NEW.status,
            CASE
                WHEN NEW.risk_score >= 40 THEN 'high-risk'
                WHEN NEW.risk_score >= 20 THEN 'medium-risk'
                ELSE 'low-risk'
            END
        ]
    )
    ON CONFLICT (project_id, source_table, source_id)
    DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        summary = EXCLUDED.summary,
        tags = EXCLUDED.tags,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TRIGGER
-- =====================================================

DROP TRIGGER IF EXISTS trigger_sync_feature_to_knowledge ON dtq.features;

CREATE TRIGGER trigger_sync_feature_to_knowledge
AFTER INSERT OR UPDATE ON dtq.features
FOR EACH ROW EXECUTE FUNCTION dtq.sync_feature_to_knowledge();

-- =====================================================
-- INITIAL SYNC (for existing features)
-- =====================================================

-- Sync all existing features to knowledge_items
DO $$
DECLARE
    project_uuid UUID;
    feature_record RECORD;
BEGIN
    -- Get or create dTQ project
    SELECT id INTO project_uuid FROM public.projects WHERE code = 'dTQ';

    IF project_uuid IS NULL THEN
        INSERT INTO public.projects (code, name, description, status)
        VALUES ('dTQ', 'Test Pilot IQ', 'AI-powered testing intelligence platform', 'active')
        RETURNING id INTO project_uuid;
    END IF;

    -- Sync each feature
    FOR feature_record IN SELECT * FROM dtq.features LOOP
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
            'dtq.features',
            feature_record.id,
            'feature',
            feature_record.name,
            'Feature: ' || feature_record.name || E'\nCategory: ' || feature_record.category || E'\nCoverage: ' || feature_record.coverage || '%' || E'\nStatus: ' || feature_record.status || E'\nRisk Score: ' || feature_record.risk_score || E'\nPass Rate: ' || feature_record.pass_rate || '%',
            'Testing feature in ' || feature_record.category || ' category with ' || feature_record.coverage || '% automation coverage',
            ARRAY[feature_record.category, feature_record.status,
                CASE
                    WHEN feature_record.risk_score >= 40 THEN 'high-risk'
                    WHEN feature_record.risk_score >= 20 THEN 'medium-risk'
                    ELSE 'low-risk'
                END
            ]
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
