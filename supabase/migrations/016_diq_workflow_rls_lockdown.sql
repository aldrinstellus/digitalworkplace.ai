-- 016_diq_workflow_rls_lockdown.sql
-- Lock down Row-Level Security on diq.workflows* tables so the anon role
-- cannot write workflows. The workflow executor runs user-supplied JS via
-- `new Function()` (apps/intranet-iq/src/lib/workflow/executor.ts), so any
-- path that lets unauthenticated users INSERT workflows + trigger execution
-- is an RCE chain.
--
-- The API layer was hardened first (5be1f13/e5b9932 add Clerk auth() check
-- to POST/PUT/DELETE + execute routes). This migration is defense-in-depth
-- at the DB layer in case a future code path forgets to gate.
--
-- Companion to docs/security-audit-2026-05-16.md High finding #1.
--
-- SAFE TO APPLY: only enables/refines RLS policies, never drops data.

-- Ensure RLS is enabled on every workflow table.
ALTER TABLE diq.workflows           ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.workflow_steps      ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.workflow_edges      ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.workflow_executions ENABLE ROW LEVEL SECURITY;

-- Drop any pre-existing permissive anon policies. If they don't exist this
-- is a no-op (IF EXISTS makes it idempotent).
DROP POLICY IF EXISTS "anon can read workflows"          ON diq.workflows;
DROP POLICY IF EXISTS "anon can write workflows"         ON diq.workflows;
DROP POLICY IF EXISTS "anon can read workflow_steps"     ON diq.workflow_steps;
DROP POLICY IF EXISTS "anon can write workflow_steps"    ON diq.workflow_steps;
DROP POLICY IF EXISTS "anon can read workflow_edges"     ON diq.workflow_edges;
DROP POLICY IF EXISTS "anon can write workflow_edges"    ON diq.workflow_edges;
DROP POLICY IF EXISTS "anon can read workflow_executions" ON diq.workflow_executions;
DROP POLICY IF EXISTS "anon can write workflow_executions" ON diq.workflow_executions;

-- READ — allow anon to SELECT (the dIQ /diq/agents page lists workflows for
-- demo viewers; this preserves that). If you want to lock reads too, change
-- TO anon to TO authenticated below.
CREATE POLICY "anon read workflows"          ON diq.workflows           FOR SELECT TO anon USING (true);
CREATE POLICY "anon read workflow_steps"     ON diq.workflow_steps      FOR SELECT TO anon USING (true);
CREATE POLICY "anon read workflow_edges"     ON diq.workflow_edges      FOR SELECT TO anon USING (true);
CREATE POLICY "anon read workflow_executions" ON diq.workflow_executions FOR SELECT TO anon USING (true);

-- WRITE — only authenticated. Anon has NO INSERT/UPDATE/DELETE policy,
-- so attempts will fail by default (default-deny under RLS).
CREATE POLICY "authenticated write workflows"          ON diq.workflows           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated write workflow_steps"     ON diq.workflow_steps      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated write workflow_edges"     ON diq.workflow_edges      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated write workflow_executions" ON diq.workflow_executions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Service-role bypasses RLS by design, so server-side admin operations
-- (e.g. analytics, migrations) continue to work without any policy change.

-- Verify: after applying, the following should FAIL when run as anon role:
--   INSERT INTO diq.workflows (name) VALUES ('test');
-- And the following should SUCCEED when run as authenticated role.
