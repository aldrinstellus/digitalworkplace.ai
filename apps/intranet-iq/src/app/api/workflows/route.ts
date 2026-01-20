import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // Fetch workflows from diq schema
    const { data: workflows, error: workflowsError } = await supabase
      .schema('diq')
      .from('workflows')
      .select('*')
      .order('updated_at', { ascending: false });

    if (workflowsError) {
      console.error('Workflows fetch error:', workflowsError);
      return NextResponse.json({ error: workflowsError.message }, { status: 500 });
    }

    // Fetch workflow steps from diq schema
    const { data: steps, error: stepsError } = await supabase
      .schema('diq')
      .from('workflow_steps')
      .select('*')
      .order('step_number', { ascending: true });

    if (stepsError) {
      console.error('Steps fetch error:', stepsError);
    }

    // Fetch workflow executions from diq schema
    const { data: executions, error: executionsError } = await supabase
      .schema('diq')
      .from('workflow_executions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(100);

    if (executionsError) {
      console.error('Executions fetch error:', executionsError);
    }

    // Get unique creator IDs
    const creatorIds = [...new Set(workflows?.map(w => w.created_by).filter(Boolean))];

    // Fetch creators from public.users
    let creators: Record<string, { id: string; full_name: string; avatar_url: string | null }> = {};
    if (creatorIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('id', creatorIds);

      if (usersData) {
        creators = usersData.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as typeof creators);
      }
    }

    // Combine workflows with creator data and steps
    const enrichedWorkflows = workflows?.map(workflow => ({
      ...workflow,
      creator: workflow.created_by ? creators[workflow.created_by] || null : null,
      steps: steps?.filter(s => s.workflow_id === workflow.id) || [],
      recent_executions: executions?.filter(e => e.workflow_id === workflow.id).slice(0, 5) || [],
    })) || [];

    return NextResponse.json({
      workflows: enrichedWorkflows,
      total_workflows: workflows?.length || 0,
      total_steps: steps?.length || 0,
      total_executions: executions?.length || 0,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}
