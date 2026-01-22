import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface EdgeUpdate {
  source_step_id?: string;
  target_step_id?: string;
  source_handle?: string;
  target_handle?: string;
  label?: string;
  animated?: boolean;
}

// GET - Get edges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const edgeId = searchParams.get('id');
    const workflowId = searchParams.get('workflow_id');

    if (edgeId) {
      const { data: edge, error } = await supabase
        .schema('diq')
        .from('workflow_edges')
        .select('*')
        .eq('id', edgeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Edge not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(edge);
    }

    if (workflowId) {
      const { data: edges, error } = await supabase
        .schema('diq')
        .from('workflow_edges')
        .select('*')
        .eq('workflow_id', workflowId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ edges: edges || [] });
    }

    return NextResponse.json({ error: 'Edge ID or Workflow ID required' }, { status: 400 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch edge' },
      { status: 500 }
    );
  }
}

// POST - Create new edge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workflow_id,
      source_step_id,
      target_step_id,
      source_handle = 'output',
      target_handle = 'input',
      label,
      animated = false,
    } = body;

    if (!workflow_id || !source_step_id || !target_step_id) {
      return NextResponse.json(
        { error: 'workflow_id, source_step_id, and target_step_id are required' },
        { status: 400 }
      );
    }

    // Check for duplicate edges
    const { data: existing } = await supabase
      .schema('diq')
      .from('workflow_edges')
      .select('id')
      .eq('workflow_id', workflow_id)
      .eq('source_step_id', source_step_id)
      .eq('target_step_id', target_step_id)
      .eq('source_handle', source_handle)
      .eq('target_handle', target_handle)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Duplicate edge already exists' },
        { status: 409 }
      );
    }

    const { data: edge, error } = await supabase
      .schema('diq')
      .from('workflow_edges')
      .insert({
        workflow_id,
        source_step_id,
        target_step_id,
        source_handle,
        target_handle,
        label,
        animated,
      })
      .select()
      .single();

    if (error) {
      console.error('Create edge error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update workflow timestamp
    await supabase
      .schema('diq')
      .from('workflows')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', workflow_id);

    return NextResponse.json(edge, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to create edge' },
      { status: 500 }
    );
  }
}

// PUT - Update edge
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body as { id: string } & EdgeUpdate;

    if (!id) {
      return NextResponse.json({ error: 'Edge ID is required' }, { status: 400 });
    }

    const updateData: EdgeUpdate = {};
    if (updates.source_step_id !== undefined) updateData.source_step_id = updates.source_step_id;
    if (updates.target_step_id !== undefined) updateData.target_step_id = updates.target_step_id;
    if (updates.source_handle !== undefined) updateData.source_handle = updates.source_handle;
    if (updates.target_handle !== undefined) updateData.target_handle = updates.target_handle;
    if (updates.label !== undefined) updateData.label = updates.label;
    if (updates.animated !== undefined) updateData.animated = updates.animated;

    const { data: edge, error } = await supabase
      .schema('diq')
      .from('workflow_edges')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update edge error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update workflow timestamp
    if (edge) {
      await supabase
        .schema('diq')
        .from('workflows')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', edge.workflow_id);
    }

    return NextResponse.json(edge);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to update edge' },
      { status: 500 }
    );
  }
}

// DELETE - Delete edge
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Edge ID is required' }, { status: 400 });
    }

    // Get workflow_id before deleting
    const { data: edgeData } = await supabase
      .schema('diq')
      .from('workflow_edges')
      .select('workflow_id')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .schema('diq')
      .from('workflow_edges')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete edge error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update workflow timestamp
    if (edgeData) {
      await supabase
        .schema('diq')
        .from('workflows')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', edgeData.workflow_id);
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete edge' },
      { status: 500 }
    );
  }
}
