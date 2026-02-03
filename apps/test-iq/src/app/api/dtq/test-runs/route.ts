import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/dtq/test-runs - List test runs with issues
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '40');

    // Fetch test runs
    const { data: runs, error: runsError } = await supabase
      .from('test_runs')
      .select('*')
      .order('executed_at', { ascending: false })
      .limit(limit);

    if (runsError) {
      console.error('Error fetching test runs:', runsError);
      return NextResponse.json({ error: runsError.message }, { status: 500 });
    }

    // Fetch issues for all runs
    const runIds = runs?.map((r) => r.id) || [];
    const { data: issues, error: issuesError } = await supabase
      .from('test_issues')
      .select('*')
      .in('test_run_id', runIds);

    if (issuesError) {
      console.error('Error fetching issues:', issuesError);
    }

    // Group issues by test run
    const issuesByRun = (issues || []).reduce(
      (acc, issue) => {
        if (!acc[issue.test_run_id]) {
          acc[issue.test_run_id] = [];
        }
        acc[issue.test_run_id].push({
          id: issue.id,
          testCaseName: issue.test_case_name,
          severity: issue.severity,
          errorMessage: issue.error_message,
          stackTrace: issue.stack_trace,
        });
        return acc;
      },
      {} as Record<string, unknown[]>
    );

    // Transform and combine
    const transformedRuns = runs?.map((r) => ({
      id: r.id,
      featureId: r.feature_id,
      featureName: r.feature_name,
      executedAt: r.executed_at,
      status: r.status,
      totalTests: r.total_tests,
      passedTests: r.passed_tests,
      failedTests: r.failed_tests,
      duration: r.duration,
      issues: issuesByRun[r.id] || [],
    }));

    return NextResponse.json(transformedRuns || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/dtq/test-runs - Create a new test run (for simulation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Insert test run
    const { data: run, error: runError } = await supabase
      .from('test_runs')
      .insert({
        feature_id: body.featureId,
        feature_name: body.featureName,
        executed_at: body.executedAt || new Date().toISOString(),
        status: body.status,
        total_tests: body.totalTests,
        passed_tests: body.passedTests,
        failed_tests: body.failedTests,
        duration: body.duration,
        source: body.source || 'simulation',
      })
      .select()
      .single();

    if (runError) {
      console.error('Error creating test run:', runError);
      return NextResponse.json({ error: runError.message }, { status: 500 });
    }

    // Insert issues if any
    if (body.issues && body.issues.length > 0) {
      const issuesData = body.issues.map(
        (issue: {
          testCaseName: string;
          severity: string;
          errorMessage: string;
          stackTrace: string;
        }) => ({
          test_run_id: run.id,
          test_case_name: issue.testCaseName,
          severity: issue.severity,
          error_message: issue.errorMessage,
          stack_trace: issue.stackTrace,
        })
      );

      const { error: issuesError } = await supabase
        .from('test_issues')
        .insert(issuesData);

      if (issuesError) {
        console.error('Error creating issues:', issuesError);
      }
    }

    return NextResponse.json({
      id: run.id,
      featureId: run.feature_id,
      featureName: run.feature_name,
      executedAt: run.executed_at,
      status: run.status,
      totalTests: run.total_tests,
      passedTests: run.passed_tests,
      failedTests: run.failed_tests,
      duration: run.duration,
      issues: body.issues || [],
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
