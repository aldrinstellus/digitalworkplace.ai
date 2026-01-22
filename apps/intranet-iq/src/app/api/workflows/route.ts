import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for workflow data
// Note: Database columns are 'name' and 'type', but API accepts both formats
interface WorkflowStep {
  id?: string;
  workflow_id?: string;
  type?: string;
  name?: string;
  step_type?: string;  // Alias for type
  step_name?: string;  // Alias for name
  step_number: number;
  config: Record<string, unknown>;
  position_x?: number;
  position_y?: number;
  ui_config?: Record<string, unknown>;
}

interface WorkflowEdge {
  id?: string;
  workflow_id?: string;
  source_step_id: string;
  target_step_id: string;
  source_handle?: string;
  target_handle?: string;
  label?: string;
  animated?: boolean;
}

interface CreateWorkflowRequest {
  name: string;
  description?: string;
  trigger_type?: string;
  trigger_config?: Record<string, unknown>;
  is_active?: boolean;
  created_by?: string;
  steps?: WorkflowStep[];
  edges?: WorkflowEdge[];
  canvas_settings?: Record<string, unknown>;
}

interface UpdateWorkflowRequest extends Partial<CreateWorkflowRequest> {
  id: string;
}

// GET - Fetch all workflows with steps and edges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('id');

    // If specific workflow requested
    if (workflowId) {
      return await getWorkflowById(workflowId);
    }

    // Fetch all workflows from diq schema
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

    // Fetch workflow edges from diq schema
    const { data: edges, error: edgesError } = await supabase
      .schema('diq')
      .from('workflow_edges')
      .select('*');

    if (edgesError) {
      console.error('Edges fetch error:', edgesError);
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

    // Combine workflows with creator data, steps, and edges
    const enrichedWorkflows = workflows?.map(workflow => ({
      ...workflow,
      creator: workflow.created_by ? creators[workflow.created_by] || null : null,
      steps: steps?.filter(s => s.workflow_id === workflow.id) || [],
      edges: edges?.filter(e => e.workflow_id === workflow.id) || [],
      recent_executions: executions?.filter(e => e.workflow_id === workflow.id).slice(0, 5) || [],
    })) || [];

    return NextResponse.json({
      workflows: enrichedWorkflows,
      total_workflows: workflows?.length || 0,
      total_steps: steps?.length || 0,
      total_edges: edges?.length || 0,
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

// GET single workflow by ID
async function getWorkflowById(workflowId: string) {
  try {
    // Fetch workflow
    const { data: workflow, error: workflowError } = await supabase
      .schema('diq')
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (workflowError) {
      if (workflowError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }
      return NextResponse.json({ error: workflowError.message }, { status: 500 });
    }

    // Fetch steps
    const { data: steps } = await supabase
      .schema('diq')
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_number', { ascending: true });

    // Fetch edges
    const { data: edges } = await supabase
      .schema('diq')
      .from('workflow_edges')
      .select('*')
      .eq('workflow_id', workflowId);

    // Fetch creator
    let creator = null;
    if (workflow.created_by) {
      const { data: userData } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .eq('id', workflow.created_by)
        .single();
      creator = userData;
    }

    return NextResponse.json({
      ...workflow,
      creator,
      steps: steps || [],
      edges: edges || [],
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}

// POST - Create new workflow
export async function POST(request: NextRequest) {
  try {
    const body: CreateWorkflowRequest = await request.json();
    const { steps, edges, ...workflowData } = body;

    // Validate required fields
    if (!workflowData.name) {
      return NextResponse.json({ error: 'Workflow name is required' }, { status: 400 });
    }

    // Create workflow
    const { data: workflow, error: workflowError } = await supabase
      .schema('diq')
      .from('workflows')
      .insert({
        name: workflowData.name,
        description: workflowData.description || '',
        trigger_type: workflowData.trigger_type || 'manual',
        trigger_config: workflowData.trigger_config || {},
        is_active: workflowData.is_active ?? true,
        created_by: workflowData.created_by,
        canvas_settings: workflowData.canvas_settings || {},
      })
      .select()
      .single();

    if (workflowError) {
      console.error('Create workflow error:', workflowError);
      return NextResponse.json({ error: workflowError.message }, { status: 500 });
    }

    const workflowId = workflow.id;

    // Create steps if provided
    let createdSteps: WorkflowStep[] = [];
    if (steps && steps.length > 0) {
      const stepsToInsert = steps.map((step, index) => ({
        workflow_id: workflowId,
        // Database columns are 'type' and 'name', but API accepts step_type/step_name aliases
        type: step.step_type || step.type,
        name: step.step_name || step.name,
        step_number: step.step_number ?? index + 1,
        config: step.config || {},
        position_x: step.position_x ?? 0,
        position_y: step.position_y ?? 0,
        ui_config: step.ui_config || {},
      }));

      const { data: stepsData, error: stepsError } = await supabase
        .schema('diq')
        .from('workflow_steps')
        .insert(stepsToInsert)
        .select();

      if (stepsError) {
        console.error('Create steps error:', stepsError);
        // Rollback workflow creation
        await supabase.schema('diq').from('workflows').delete().eq('id', workflowId);
        return NextResponse.json({ error: stepsError.message }, { status: 500 });
      }

      createdSteps = stepsData || [];
    }

    // Create edges if provided
    let createdEdges: WorkflowEdge[] = [];
    if (edges && edges.length > 0) {
      // Map temporary step IDs to actual step IDs
      const edgesToInsert = edges.map(edge => ({
        id: edge.id || crypto.randomUUID(),  // Generate UUID if not provided
        workflow_id: workflowId,
        source_step_id: edge.source_step_id,
        target_step_id: edge.target_step_id,
        source_handle: edge.source_handle || 'output',
        target_handle: edge.target_handle || 'input',
        label: edge.label,
        animated: edge.animated ?? false,
      }));

      const { data: edgesData, error: edgesError } = await supabase
        .schema('diq')
        .from('workflow_edges')
        .insert(edgesToInsert)
        .select();

      if (edgesError) {
        console.error('Create edges error:', edgesError);
        // Note: edges are not critical, so we don't rollback
      }

      createdEdges = edgesData || [];
    }

    return NextResponse.json({
      ...workflow,
      steps: createdSteps,
      edges: createdEdges,
    }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

// PUT - Update existing workflow
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateWorkflowRequest = await request.json();
    const { id, steps, edges, ...workflowData } = body;

    console.log('=== PUT /api/workflows ===');
    console.log('ID:', id);
    console.log('Steps count:', steps?.length);
    console.log('Edges count:', edges?.length);
    console.log('Edges:', JSON.stringify(edges, null, 2));

    if (!id) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    // Update workflow
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (workflowData.name !== undefined) updateData.name = workflowData.name;
    if (workflowData.description !== undefined) updateData.description = workflowData.description;
    if (workflowData.trigger_type !== undefined) updateData.trigger_type = workflowData.trigger_type;
    if (workflowData.trigger_config !== undefined) updateData.trigger_config = workflowData.trigger_config;
    if (workflowData.is_active !== undefined) updateData.is_active = workflowData.is_active;
    if (workflowData.canvas_settings !== undefined) updateData.canvas_settings = workflowData.canvas_settings;

    const { data: workflow, error: workflowError } = await supabase
      .schema('diq')
      .from('workflows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (workflowError) {
      console.error('Update workflow error:', workflowError);
      return NextResponse.json({ error: workflowError.message }, { status: 500 });
    }

    // Update steps if provided (replace all)
    let updatedSteps: WorkflowStep[] = [];
    if (steps !== undefined) {
      // Delete existing steps
      await supabase
        .schema('diq')
        .from('workflow_steps')
        .delete()
        .eq('workflow_id', id);

      // Insert new steps
      if (steps.length > 0) {
        const stepsToInsert = steps.map((step, index) => ({
          id: step.id, // Preserve existing IDs if provided
          workflow_id: id,
          // Database columns are 'type' and 'name', but API accepts step_type/step_name aliases
          type: step.step_type || step.type,
          name: step.step_name || step.name,
          step_number: step.step_number ?? index + 1,
          config: step.config || {},
          next_step_on_success: (step as { next_step_on_success?: string }).next_step_on_success || null,
          next_step_on_failure: (step as { next_step_on_failure?: string }).next_step_on_failure || null,
          position_x: step.position_x ?? 0,
          position_y: step.position_y ?? 0,
          ui_config: step.ui_config || {},
        }));

        console.log('Inserting steps:', JSON.stringify(stepsToInsert, null, 2));

        const { data: stepsData, error: stepsError } = await supabase
          .schema('diq')
          .from('workflow_steps')
          .insert(stepsToInsert)
          .select();

        if (stepsError) {
          console.error('Update steps error:', stepsError);
          return NextResponse.json({ error: `Failed to save steps: ${stepsError.message}`, details: stepsError }, { status: 500 });
        }

        updatedSteps = stepsData || [];
      }
    }

    // Update edges if provided (replace all)
    let updatedEdges: WorkflowEdge[] = [];
    if (edges !== undefined) {
      // Delete existing edges
      await supabase
        .schema('diq')
        .from('workflow_edges')
        .delete()
        .eq('workflow_id', id);

      // Insert new edges
      if (edges.length > 0) {
        const edgesToInsert = edges.map(edge => ({
          id: edge.id || crypto.randomUUID(),  // Generate UUID if not provided
          workflow_id: id,
          source_step_id: edge.source_step_id,
          target_step_id: edge.target_step_id,
          source_handle: edge.source_handle || 'output',
          target_handle: edge.target_handle || 'input',
          label: edge.label,
          animated: edge.animated ?? false,
        }));

        console.log('Inserting edges:', JSON.stringify(edgesToInsert, null, 2));

        const { data: edgesData, error: edgesError } = await supabase
          .schema('diq')
          .from('workflow_edges')
          .insert(edgesToInsert)
          .select();

        if (edgesError) {
          console.error('Update edges error:', edgesError);
          return NextResponse.json({ error: `Failed to save edges: ${edgesError.message}`, details: edgesError }, { status: 500 });
        }

        updatedEdges = edgesData || [];
      }
    }

    // If steps/edges not provided, fetch existing
    if (steps === undefined) {
      const { data: existingSteps } = await supabase
        .schema('diq')
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', id)
        .order('step_number', { ascending: true });
      updatedSteps = existingSteps || [];
    }

    if (edges === undefined) {
      const { data: existingEdges } = await supabase
        .schema('diq')
        .from('workflow_edges')
        .select('*')
        .eq('workflow_id', id);
      updatedEdges = existingEdges || [];
    }

    return NextResponse.json({
      ...workflow,
      steps: updatedSteps,
      edges: updatedEdges,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

// DELETE - Delete workflow
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    // Delete workflow (cascade will delete steps and edges due to FK constraints)
    const { error: deleteError } = await supabase
      .schema('diq')
      .from('workflows')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete workflow error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
