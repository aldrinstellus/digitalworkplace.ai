-- =====================================================
-- Workflow RLS Policies Migration
-- =====================================================
-- NOTE: This migration was split into two parts:
-- 1. workflow_builder_upgrade - creates workflow_edges table and position columns
-- 2. grant_workflow_permissions - grants table permissions
-- Both were applied via Supabase MCP on 2026-01-22
-- =====================================================

-- This file is kept for reference. See the Supabase migrations list for applied versions.
