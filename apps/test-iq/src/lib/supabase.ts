import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client (uses public schema — dtq schema is accessed via views and RPC functions)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for dtq schema (accessed via public views: dtq_features, dtq_test_runs, etc.)
export interface DbFeature {
  id: string;
  name: string;
  category: string;
  coverage: number;
  status: 'fully_automated' | 'partially_automated';
  open_defects: number;
  closed_defects: number;
  risk_score: number;
  pass_rate: number;
  impact_score: number;
  created_at: string;
  updated_at: string;
}

export interface DbTestRun {
  id: string;
  feature_id: string;
  feature_name: string;
  executed_at: string;
  status: 'passed' | 'failed' | 'running';
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  duration: number;
  source: string;
  external_id: string | null;
  created_at: string;
}

export interface DbTestIssue {
  id: string;
  test_run_id: string;
  test_case_name: string;
  severity: 'high' | 'medium' | 'low';
  error_message: string | null;
  stack_trace: string | null;
  external_issue_key: string | null;
  created_at: string;
}

export interface DbDailyMetric {
  id: string;
  date: string;
  pass_rate: number;
  first_run_pass_rate: number;
  defect_detection: number;
  effectiveness: number;
  automation_coverage: number;
  created_at: string;
}

export interface DbPersona {
  id: string; // persona type: csuite, manager, techlead
  name: string;
  title: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface DbPersonaMetric {
  id: string;
  persona_id: string;
  metric_key: string;
  label: string;
  value: string;
  unit: string;
  description: string;
  trend: 'up' | 'down' | 'stable';
  trend_value: string;
  display_order: number;
  created_at: string;
}

// Fetch functions (use public schema views: dtq_features, dtq_test_runs, etc.)
export async function fetchFeatures(): Promise<DbFeature[]> {
  const { data, error } = await supabase
    .from('dtq_features')
    .select('*')
    .order('category', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchTestRuns(limit = 40): Promise<DbTestRun[]> {
  const { data, error } = await supabase
    .from('dtq_test_runs')
    .select('*')
    .order('executed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function fetchTestIssues(testRunId: string): Promise<DbTestIssue[]> {
  const { data, error } = await supabase.from('dtq_test_issues').select('*').eq('test_run_id', testRunId);

  if (error) throw error;
  return data || [];
}

export async function fetchDailyMetrics(days = 30): Promise<DbDailyMetric[]> {
  const { data, error } = await supabase
    .from('dtq_daily_metrics')
    .select('*')
    .order('date', { ascending: true })
    .limit(days);

  if (error) throw error;
  return data || [];
}

export async function fetchPersonas(): Promise<DbPersona[]> {
  const { data, error } = await supabase.from('dtq_personas').select('*');

  if (error) throw error;
  return data || [];
}

export async function fetchPersonaMetrics(personaId?: string): Promise<DbPersonaMetric[]> {
  let query = supabase.from('dtq_persona_metrics').select('*').order('display_order', { ascending: true });

  if (personaId) {
    query = query.eq('persona_id', personaId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// Insert functions for real-time simulation (via SECURITY DEFINER RPC functions)
export async function insertTestRun(
  run: Omit<DbTestRun, 'id' | 'created_at'>
): Promise<DbTestRun> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('insert_dtq_test_run', {
    p_feature_id: run.feature_id,
    p_feature_name: run.feature_name,
    p_executed_at: run.executed_at,
    p_status: run.status,
    p_total_tests: run.total_tests,
    p_passed_tests: run.passed_tests,
    p_failed_tests: run.failed_tests,
    p_duration: run.duration,
    p_source: run.source || 'simulation',
  });

  if (error) throw error;
  return data;
}

export async function insertTestIssue(
  issue: Omit<DbTestIssue, 'id' | 'created_at'>
): Promise<DbTestIssue> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('insert_dtq_test_issues', {
    p_issues: [issue],
  });

  if (error) throw error;
  return data;
}

// Subscribe to real-time changes
export function subscribeToTestRuns(callback: (run: DbTestRun) => void) {
  return supabase
    .channel('test_runs_changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'dtq', table: 'test_runs' }, (payload) =>
      callback(payload.new as DbTestRun)
    )
    .subscribe();
}

// Subscribe to feature updates
export function subscribeToFeatures(callback: (feature: DbFeature) => void) {
  return supabase
    .channel('features_changes')
    .on('postgres_changes', { event: '*', schema: 'dtq', table: 'features' }, (payload) =>
      callback(payload.new as DbFeature)
    )
    .subscribe();
}
