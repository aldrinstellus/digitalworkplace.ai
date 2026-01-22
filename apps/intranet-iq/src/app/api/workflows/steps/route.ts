import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface StepUpdate {
  step_type?: string;
  step_name?: string;
  step_number?: number;
  config?: Record<string, unknown>;
  position_x?: number;
  position_y?: number;
  ui_config?: Record<string, unknown>;
}

// GET - Get step by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stepId = searchParams.get('id');
    const workflowId = searchParams.get('workflow_id');

    if (stepId) {
      const { data: step, error } = await supabase
        .schema('diq')
        .from('workflow_steps')
        .select('*')
        .eq('id', stepId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Step not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(step);
    }

    if (workflowId) {
      const { data: steps, error } = await supabase
        .schema('diq')
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_number', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ steps: steps || [] });
    }

    return NextResponse.json({ error: 'Step ID or Workflow ID required' }, { status: 400 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch step' },
      { status: 500 }
    );
  }
}

// POST - Create new step
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflow_id, step_type, step_name, step_number, config, position_x, position_y, ui_config } = body;

    if (!workflow_id || !step_type || !step_name) {
      return NextResponse.json(
        { error: 'workflow_id, step_type, and step_name are required' },
        { status: 400 }
      );
    }

    // If step_number not provided, get max and add 1
    let actualStepNumber = step_number;
    if (actualStepNumber === undefined) {
      const { data: existingSteps } = await supabase
        .schema('diq')
        .from('workflow_steps')
        .select('step_number')
        .eq('workflow_id', workflow_id)
        .order('step_number', { ascending: false })
        .limit(1);

      actualStepNumber = existingSteps && existingSteps.length > 0
        ? existingSteps[0].step_number + 1
        : 1;
    }

    const { data: step, error } = await supabase
      .schema('diq')
      .from('workflow_steps')
      .insert({
        workflow_id,
        step_type,
        step_name,
        step_number: actualStepNumber,
        config: config || {},
        position_x: position_x ?? 0,
        position_y: position_y ?? 0,
        ui_config: ui_config || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Create step error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update workflow timestamp
    await supabase
      .schema('diq')
      .from('workflows')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', workflow_id);

    return NextResponse.json(step, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to create step' },
      { status: 500 }
    );
  }
}

// PUT - Update step
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body as { id: string } & StepUpdate;

    if (!id) {
      return NextResponse.json({ error: 'Step ID is required' }, { status: 400 });
    }

    const updateData: StepUpdate = {};
    if (updates.step_type !== undefined) updateData.step_type = updates.step_type;
    if (updates.step_name !== undefined) updateData.step_name = updates.step_name;
    if (updates.step_number !== undefined) updateData.step_number = updates.step_number;
    if (updates.config !== undefined) updateData.config = updates.config;
    if (updates.position_x !== undefined) updateData.position_x = updates.position_x;
    if (updates.position_y !== undefined) updateData.position_y = updates.position_y;
    if (updates.ui_config !== undefined) updateData.ui_config = updates.ui_config;

    const { data: step, error } = await supabase
      .schema('diq')
      .from('workflow_steps')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update step error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update workflow timestamp
    if (step) {
      await supabase
        .schema('diq')
        .from('workflows')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', step.workflow_id);
    }

    return NextResponse.json(step);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to update step' },
      { status: 500 }
    );
  }
}

// PATCH - Update step position (lightweight update)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, position_x, position_y } = body;

    if (!id) {
      return NextResponse.json({ error: 'Step ID is required' }, { status: 400 });
    }

    const updateData: { position_x?: number; position_y?: number } = {};
    if (position_x !== undefined) updateData.position_x = position_x;
    if (position_y !== undefined) updateData.position_y = position_y;

    const { data: step, error } = await supabase
      .schema('diq')
      .from('workflow_steps')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update step position error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(step);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to update step position' },
      { status: 500 }
    );
  }
}

// DELETE - Delete step
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Step ID is required' }, { status: 400 });
    }

    // Get workflow_id before deleting
    const { data: stepData } = await supabase
      .schema('diq')
      .from('workflow_steps')
      .select('workflow_id')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .schema('diq')
      .from('workflow_steps')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete step error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update workflow timestamp
    if (stepData) {
      await supabase
        .schema('diq')
        .from('workflows')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', stepData.workflow_id);
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete step' },
      { status: 500 }
    );
  }
}
