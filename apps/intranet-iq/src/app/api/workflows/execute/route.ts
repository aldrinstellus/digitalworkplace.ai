/**
 * Workflow Execution API Route
 * Execute workflows manually or via API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowExecutor } from '@/lib/workflow/executor';

// POST - Execute a workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, input = {}, userId, organizationId } = body;

    if (!workflowId) {
      return NextResponse.json(
        { error: 'workflowId is required' },
        { status: 400 }
      );
    }

    const executor = getWorkflowExecutor();
    const result = await executor.execute(workflowId, input, {
      userId,
      organizationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Execution failed' },
      { status: 500 }
    );
  }
}

// GET - Get execution status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');

    if (!executionId) {
      return NextResponse.json(
        { error: 'executionId is required' },
        { status: 400 }
      );
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: execution, error } = await supabase
      .schema('diq')
      .from('workflow_executions')
      .select('*')
      .eq('id', executionId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(execution);
  } catch (error) {
    console.error('Get execution error:', error);
    return NextResponse.json(
      { error: 'Failed to get execution status' },
      { status: 500 }
    );
  }
}
