/**
 * Scheduled Workflow Trigger API Route
 * Process scheduled workflows (called by cron job)
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleScheduledTrigger } from '@/lib/workflow/executor';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cron expression parser (simplified)
function shouldRunNow(cronExpression: string, now: Date): boolean {
  // Simple cron parsing: minute hour day month weekday
  // Supports: * (any), specific numbers, */n (every n)
  const parts = cronExpression.split(' ');
  if (parts.length !== 5) return false;

  const [minute, hour, day, month, weekday] = parts;
  const currentMinute = now.getMinutes();
  const currentHour = now.getHours();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentWeekday = now.getDay();

  const matchesPart = (pattern: string, value: number): boolean => {
    if (pattern === '*') return true;
    if (pattern.startsWith('*/')) {
      const interval = parseInt(pattern.slice(2), 10);
      return value % interval === 0;
    }
    if (pattern.includes(',')) {
      return pattern.split(',').map(Number).includes(value);
    }
    if (pattern.includes('-')) {
      const [start, end] = pattern.split('-').map(Number);
      return value >= start && value <= end;
    }
    return parseInt(pattern, 10) === value;
  };

  return (
    matchesPart(minute, currentMinute) &&
    matchesPart(hour, currentHour) &&
    matchesPart(day, currentDay) &&
    matchesPart(month, currentMonth) &&
    matchesPart(weekday, currentWeekday)
  );
}

// POST - Process all scheduled workflows (called by cron)
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (optional security measure)
    const cronSecret = request.headers.get('x-cron-secret');
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Invalid cron secret' },
        { status: 401 }
      );
    }

    const now = new Date();

    // Fetch all active scheduled workflows
    const { data: workflows, error: fetchError } = await supabase
      .schema('diq')
      .from('workflows')
      .select('id, name, trigger_type, trigger_config')
      .eq('is_active', true)
      .eq('trigger_type', 'scheduled');

    if (fetchError) {
      console.error('Failed to fetch scheduled workflows:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch workflows' },
        { status: 500 }
      );
    }

    const results: {
      workflowId: string;
      workflowName: string;
      executed: boolean;
      executionId?: string;
      status?: string;
      error?: string;
    }[] = [];

    // Process each workflow
    for (const workflow of workflows || []) {
      const config = workflow.trigger_config as {
        cron?: string;
        interval?: number;
        timezone?: string;
      };

      // Check if workflow should run now
      let shouldRun = false;

      if (config.cron) {
        shouldRun = shouldRunNow(config.cron, now);
      } else if (config.interval) {
        // Interval-based: check last execution time
        const { data: lastExecution } = await supabase
          .schema('diq')
          .from('workflow_executions')
          .select('completed_at')
          .eq('workflow_id', workflow.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();

        if (!lastExecution) {
          shouldRun = true;
        } else {
          const lastRunTime = new Date(lastExecution.completed_at).getTime();
          const intervalMs = config.interval * 1000; // interval in seconds
          shouldRun = now.getTime() - lastRunTime >= intervalMs;
        }
      }

      if (shouldRun) {
        try {
          const result = await handleScheduledTrigger(workflow.id, now);
          results.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            executed: true,
            executionId: result.executionId,
            status: result.status,
          });
        } catch (error) {
          results.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            executed: true,
            error: error instanceof Error ? error.message : 'Execution failed',
          });
        }
      } else {
        results.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          executed: false,
        });
      }
    }

    return NextResponse.json({
      processedAt: now.toISOString(),
      totalWorkflows: workflows?.length || 0,
      executedCount: results.filter(r => r.executed).length,
      results,
    });
  } catch (error) {
    console.error('Scheduled trigger processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
}

// GET - Get scheduled workflow status
export async function GET(request: NextRequest) {
  try {
    // Fetch all scheduled workflows with their last execution
    const { data: workflows, error } = await supabase
      .schema('diq')
      .from('workflows')
      .select(`
        id,
        name,
        trigger_type,
        trigger_config,
        is_active,
        updated_at
      `)
      .eq('trigger_type', 'scheduled')
      .order('name');

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch workflows' },
        { status: 500 }
      );
    }

    // Get last execution for each workflow
    const workflowIds = workflows?.map(w => w.id) || [];
    const { data: executions } = await supabase
      .schema('diq')
      .from('workflow_executions')
      .select('workflow_id, status, completed_at')
      .in('workflow_id', workflowIds)
      .order('completed_at', { ascending: false });

    // Group executions by workflow
    const lastExecutionMap = new Map<string, { status: string; completed_at: string }>();
    for (const exec of executions || []) {
      if (!lastExecutionMap.has(exec.workflow_id)) {
        lastExecutionMap.set(exec.workflow_id, {
          status: exec.status,
          completed_at: exec.completed_at,
        });
      }
    }

    const enrichedWorkflows = workflows?.map(w => ({
      ...w,
      lastExecution: lastExecutionMap.get(w.id) || null,
    }));

    return NextResponse.json({
      workflows: enrichedWorkflows,
      total: workflows?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get scheduled workflows' },
      { status: 500 }
    );
  }
}
