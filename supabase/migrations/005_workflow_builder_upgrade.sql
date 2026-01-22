-- =====================================================
-- Workflow Builder Upgrade Migration
-- =====================================================
-- Adds position tracking and edge table for ReactFlow-based
-- workflow builder in dIQ
-- =====================================================

-- =====================================================
-- ADD POSITION COLUMNS TO WORKFLOW_STEPS
-- =====================================================

-- Add position_x column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'diq'
        AND table_name = 'workflow_steps'
        AND column_name = 'position_x'
    ) THEN
        ALTER TABLE diq.workflow_steps
        ADD COLUMN position_x REAL DEFAULT 0;
    END IF;
END $$;

-- Add position_y column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'diq'
        AND table_name = 'workflow_steps'
        AND column_name = 'position_y'
    ) THEN
        ALTER TABLE diq.workflow_steps
        ADD COLUMN position_y REAL DEFAULT 0;
    END IF;
END $$;

-- Add ui_config column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'diq'
        AND table_name = 'workflow_steps'
        AND column_name = 'ui_config'
    ) THEN
        ALTER TABLE diq.workflow_steps
        ADD COLUMN ui_config JSONB DEFAULT '{}';
    END IF;
END $$;

-- =====================================================
-- CREATE WORKFLOW_EDGES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS diq.workflow_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES diq.workflows(id) ON DELETE CASCADE,
    source_step_id UUID NOT NULL REFERENCES diq.workflow_steps(id) ON DELETE CASCADE,
    target_step_id UUID NOT NULL REFERENCES diq.workflow_steps(id) ON DELETE CASCADE,
    source_handle VARCHAR(50) DEFAULT 'output',
    target_handle VARCHAR(50) DEFAULT 'input',
    label VARCHAR(255),
    edge_type VARCHAR(50) DEFAULT 'default',
    animated BOOLEAN DEFAULT FALSE,
    style JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate edges
    UNIQUE(workflow_id, source_step_id, target_step_id, source_handle, target_handle)
);

-- Create indexes for workflow_edges
CREATE INDEX IF NOT EXISTS idx_workflow_edges_workflow_id
ON diq.workflow_edges(workflow_id);

CREATE INDEX IF NOT EXISTS idx_workflow_edges_source_step_id
ON diq.workflow_edges(source_step_id);

CREATE INDEX IF NOT EXISTS idx_workflow_edges_target_step_id
ON diq.workflow_edges(target_step_id);

-- =====================================================
-- ADD WORKFLOW CANVAS SETTINGS
-- =====================================================

-- Add canvas_settings column to workflows if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'diq'
        AND table_name = 'workflows'
        AND column_name = 'canvas_settings'
    ) THEN
        ALTER TABLE diq.workflows
        ADD COLUMN canvas_settings JSONB DEFAULT '{
            "viewport": {"x": 0, "y": 0, "zoom": 1},
            "gridEnabled": true,
            "snapToGrid": true
        }';
    END IF;
END $$;

-- =====================================================
-- ENABLE RLS ON NEW TABLE
-- =====================================================

ALTER TABLE diq.workflow_edges ENABLE ROW LEVEL SECURITY;

-- Create policy for workflow_edges (inherits from workflow access)
CREATE POLICY "Users can manage edges of their workflows"
ON diq.workflow_edges FOR ALL
TO authenticated
USING (
    workflow_id IN (
        SELECT id FROM diq.workflows
        WHERE created_by = (
            SELECT id FROM public.users WHERE clerk_id = auth.jwt()->>'sub'
        )
    )
);

-- =====================================================
-- CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get complete workflow with steps and edges
CREATE OR REPLACE FUNCTION diq.get_workflow_with_details(p_workflow_id UUID)
RETURNS TABLE (
    workflow JSONB,
    steps JSONB,
    edges JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        row_to_json(w.*)::JSONB as workflow,
        COALESCE(
            (
                SELECT json_agg(row_to_json(s.*) ORDER BY s.step_number)::JSONB
                FROM diq.workflow_steps s
                WHERE s.workflow_id = p_workflow_id
            ),
            '[]'::JSONB
        ) as steps,
        COALESCE(
            (
                SELECT json_agg(row_to_json(e.*))::JSONB
                FROM diq.workflow_edges e
                WHERE e.workflow_id = p_workflow_id
            ),
            '[]'::JSONB
        ) as edges
    FROM diq.workflows w
    WHERE w.id = p_workflow_id;
END;
$$ LANGUAGE plpgsql;

-- Function to save workflow steps with positions
CREATE OR REPLACE FUNCTION diq.upsert_workflow_step(
    p_id UUID,
    p_workflow_id UUID,
    p_step_number INT,
    p_name VARCHAR(255),
    p_type VARCHAR(50),
    p_config JSONB,
    p_next_step_on_success UUID,
    p_next_step_on_failure UUID,
    p_position_x REAL,
    p_position_y REAL,
    p_ui_config JSONB
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO diq.workflow_steps (
        id, workflow_id, step_number, name, type, config,
        next_step_on_success, next_step_on_failure,
        position_x, position_y, ui_config
    )
    VALUES (
        COALESCE(p_id, uuid_generate_v4()),
        p_workflow_id, p_step_number, p_name, p_type, p_config,
        p_next_step_on_success, p_next_step_on_failure,
        p_position_x, p_position_y, p_ui_config
    )
    ON CONFLICT (id) DO UPDATE SET
        step_number = EXCLUDED.step_number,
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        config = EXCLUDED.config,
        next_step_on_success = EXCLUDED.next_step_on_success,
        next_step_on_failure = EXCLUDED.next_step_on_failure,
        position_x = EXCLUDED.position_x,
        position_y = EXCLUDED.position_y,
        ui_config = EXCLUDED.ui_config
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Function to save workflow edges
CREATE OR REPLACE FUNCTION diq.upsert_workflow_edge(
    p_id UUID,
    p_workflow_id UUID,
    p_source_step_id UUID,
    p_target_step_id UUID,
    p_source_handle VARCHAR(50),
    p_target_handle VARCHAR(50),
    p_label VARCHAR(255),
    p_animated BOOLEAN
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO diq.workflow_edges (
        id, workflow_id, source_step_id, target_step_id,
        source_handle, target_handle, label, animated
    )
    VALUES (
        COALESCE(p_id, uuid_generate_v4()),
        p_workflow_id, p_source_step_id, p_target_step_id,
        p_source_handle, p_target_handle, p_label, p_animated
    )
    ON CONFLICT (workflow_id, source_step_id, target_step_id, source_handle, target_handle) DO UPDATE SET
        label = EXCLUDED.label,
        animated = EXCLUDED.animated
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UPDATE EXISTING WORKFLOWS WITH DEFAULT POSITIONS
-- =====================================================

-- Update existing workflow_steps with sequential positions if they have default (0,0) positions
DO $$
DECLARE
    v_workflow_id UUID;
    v_step RECORD;
    v_x_pos REAL := 100;
    v_y_pos REAL := 200;
    v_x_spacing REAL := 320;
BEGIN
    -- Loop through each workflow
    FOR v_workflow_id IN SELECT DISTINCT workflow_id FROM diq.workflow_steps
    LOOP
        v_x_pos := 100;

        -- Update each step's position if it's still at default (0,0)
        FOR v_step IN
            SELECT id FROM diq.workflow_steps
            WHERE workflow_id = v_workflow_id
            AND position_x = 0 AND position_y = 0
            ORDER BY step_number
        LOOP
            UPDATE diq.workflow_steps
            SET position_x = v_x_pos, position_y = v_y_pos
            WHERE id = v_step.id;

            v_x_pos := v_x_pos + v_x_spacing;
        END LOOP;
    END LOOP;
END $$;

-- =====================================================
-- MIGRATE EXISTING CONNECTIONS TO EDGES TABLE
-- =====================================================

-- Create edges from existing next_step_on_success connections
INSERT INTO diq.workflow_edges (workflow_id, source_step_id, target_step_id, source_handle, target_handle)
SELECT DISTINCT
    s.workflow_id,
    s.id as source_step_id,
    s.next_step_on_success as target_step_id,
    'output' as source_handle,
    'input' as target_handle
FROM diq.workflow_steps s
WHERE s.next_step_on_success IS NOT NULL
ON CONFLICT (workflow_id, source_step_id, target_step_id, source_handle, target_handle) DO NOTHING;

-- Create edges from existing next_step_on_failure connections
INSERT INTO diq.workflow_edges (workflow_id, source_step_id, target_step_id, source_handle, target_handle, label)
SELECT DISTINCT
    s.workflow_id,
    s.id as source_step_id,
    s.next_step_on_failure as target_step_id,
    'false' as source_handle,
    'input' as target_handle,
    'Failure' as label
FROM diq.workflow_steps s
WHERE s.next_step_on_failure IS NOT NULL
ON CONFLICT (workflow_id, source_step_id, target_step_id, source_handle, target_handle) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE diq.workflow_edges IS 'Stores connections between workflow steps for ReactFlow visualization';
COMMENT ON COLUMN diq.workflow_steps.position_x IS 'X coordinate of node position in ReactFlow canvas';
COMMENT ON COLUMN diq.workflow_steps.position_y IS 'Y coordinate of node position in ReactFlow canvas';
COMMENT ON COLUMN diq.workflow_steps.ui_config IS 'UI-specific configuration (colors, labels, etc.)';
COMMENT ON COLUMN diq.workflows.canvas_settings IS 'ReactFlow canvas settings (viewport, zoom, grid)';
