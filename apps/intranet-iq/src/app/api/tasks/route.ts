/**
 * Tasks API Route
 * Personal task management for productivity
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  due_time?: string;
  project_id?: string;
  parent_id?: string;
  assignee_id?: string;
  tags: string[];
  completed_at?: string;
  reminder_at?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  subtasks?: Task[];
}

// GET - Fetch tasks
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const taskId = searchParams.get('id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const dueDate = searchParams.get('dueDate');
    const includeCompleted = searchParams.get('includeCompleted') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!userId && !taskId) {
      return NextResponse.json({ error: 'userId or taskId is required' }, { status: 400 });
    }

    // Get single task
    if (taskId) {
      const { data: task, error } = await supabase
        .schema('diq')
        .from('tasks')
        .select(`
          *,
          subtasks:tasks!parent_id(*)
        `)
        .eq('id', taskId)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      return NextResponse.json({ task });
    }

    // Build query - fetch tasks for user (owner or assignee)
    let query = supabase
      .schema('diq')
      .from('tasks')
      .select('*')
      .eq('user_id', userId) // Primary filter by user_id
      .is('parent_id', null) // Only top-level tasks
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    } else if (!includeCompleted) {
      query = query.in('status', ['todo', 'in_progress']);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (dueDate) {
      query = query.eq('due_date', dueDate);
    }

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    // Get subtasks for each task
    const taskIds = tasks?.map(t => t.id) || [];
    let subtasksMap: Record<string, Task[]> = {};

    if (taskIds.length > 0) {
      const { data: subtasks } = await supabase
        .schema('diq')
        .from('tasks')
        .select('*')
        .in('parent_id', taskIds)
        .order('created_at');

      subtasksMap = (subtasks || []).reduce((acc, st) => {
        if (!acc[st.parent_id]) acc[st.parent_id] = [];
        acc[st.parent_id].push(st);
        return acc;
      }, {} as Record<string, Task[]>);
    }

    const enrichedTasks = tasks?.map(t => ({
      ...t,
      subtasks: subtasksMap[t.id] || [],
    }));

    // Calculate stats
    const stats = {
      total: tasks?.length || 0,
      todo: tasks?.filter(t => t.status === 'todo').length || 0,
      inProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
      done: tasks?.filter(t => t.status === 'done').length || 0,
      overdue: tasks?.filter(t =>
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
      ).length || 0,
      dueToday: tasks?.filter(t => {
        if (!t.due_date) return false;
        const today = new Date().toISOString().split('T')[0];
        return t.due_date === today;
      }).length || 0,
    };

    return NextResponse.json({ tasks: enrichedTasks || [], stats });
  } catch (error) {
    console.error('Tasks API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      description,
      status = 'todo',
      priority = 'medium',
      dueDate,
      dueTime,
      projectId,
      parentId,
      assigneeId,
      tags = [],
      reminderAt,
    } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'userId and title are required' },
        { status: 400 }
      );
    }

    const { data: task, error } = await supabase
      .schema('diq')
      .from('tasks')
      .insert({
        user_id: userId,
        title,
        description,
        status,
        priority,
        due_date: dueDate,
        due_time: dueTime,
        project_id: projectId,
        parent_id: parentId,
        assignee_id: assigneeId,
        tags,
        reminder_at: reminderAt,
        metadata: {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    // Create notification if assigned to someone else
    if (assigneeId && assigneeId !== userId) {
      await supabase
        .schema('diq')
        .from('notifications')
        .insert({
          user_id: assigneeId,
          type: 'assignment',
          entity_type: 'task',
          entity_id: task.id,
          actor_id: userId,
          title: 'New task assigned to you',
          message: title,
          link: '/diq/my-day',
        });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Tasks API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a task
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, userId, ...updates } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Map update fields
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) {
      updateData.status = updates.status;
      if (updates.status === 'done') {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }
    }
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
    if (updates.dueTime !== undefined) updateData.due_time = updates.dueTime;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.assigneeId !== undefined) updateData.assignee_id = updates.assigneeId;
    if (updates.reminderAt !== undefined) updateData.reminder_at = updates.reminderAt;

    const { data: task, error } = await supabase
      .schema('diq')
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Tasks API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Delete subtasks first
    await supabase
      .schema('diq')
      .from('tasks')
      .delete()
      .eq('parent_id', taskId);

    // Delete task
    const { error } = await supabase
      .schema('diq')
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tasks API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
