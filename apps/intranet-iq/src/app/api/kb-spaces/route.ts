/**
 * KB Spaces API Route
 * Handles multi-tenant knowledge base space management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface KBSpace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'internal' | 'external' | 'hybrid';
  organization_id: string;
  isolation_level: 'organization' | 'department' | 'team';
  enabled_connectors: string[];
  settings: Record<string, unknown>;
  status: 'active' | 'archived' | 'disabled';
  icon?: string;
  color?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  item_count?: number;
}

// GET - List KB spaces or get single space
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const spaceId = searchParams.get('id');
    const slug = searchParams.get('slug');
    const organizationId = searchParams.get('organizationId');
    const userId = searchParams.get('userId');
    const includeStats = searchParams.get('includeStats') === 'true';

    // Get single space by ID
    if (spaceId) {
      const { data: space, error } = await supabase
        .schema('diq')
        .from('kb_spaces')
        .select(`
          *,
          creator:created_by(id, full_name, avatar_url)
        `)
        .eq('id', spaceId)
        .single();

      if (error || !space) {
        return NextResponse.json({ error: 'Space not found' }, { status: 404 });
      }

      // Get member count and item count
      if (includeStats) {
        const [membersResult, itemsResult] = await Promise.all([
          supabase
            .schema('diq')
            .from('kb_space_members')
            .select('*', { count: 'exact', head: true })
            .eq('kb_space_id', spaceId),
          supabase
            .schema('diq')
            .from('kb_space_items')
            .select('*', { count: 'exact', head: true })
            .eq('kb_space_id', spaceId),
        ]);

        return NextResponse.json({
          space: {
            ...space,
            member_count: membersResult.count || 0,
            item_count: itemsResult.count || 0,
          },
        });
      }

      return NextResponse.json({ space });
    }

    // Get space by slug
    if (slug) {
      let query = supabase
        .schema('diq')
        .from('kb_spaces')
        .select('*')
        .eq('slug', slug);

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data: space, error } = await query.single();

      if (error || !space) {
        return NextResponse.json({ error: 'Space not found' }, { status: 404 });
      }

      return NextResponse.json({ space });
    }

    // List spaces for user
    if (userId) {
      // Get spaces the user is a member of
      const { data: memberships } = await supabase
        .schema('diq')
        .from('kb_space_members')
        .select('kb_space_id, role')
        .eq('user_id', userId);

      const spaceIds = memberships?.map(m => m.kb_space_id) || [];

      if (spaceIds.length === 0) {
        // Return public spaces if user has no memberships
        const { data: publicSpaces } = await supabase
          .schema('diq')
          .from('kb_spaces')
          .select('*')
          .eq('status', 'active')
          .order('name');

        return NextResponse.json({ spaces: publicSpaces || [] });
      }

      const { data: spaces } = await supabase
        .schema('diq')
        .from('kb_spaces')
        .select('*')
        .in('id', spaceIds)
        .eq('status', 'active')
        .order('name');

      // Add role to each space
      const membershipMap = new Map(memberships?.map(m => [m.kb_space_id, m.role]));
      const enrichedSpaces = spaces?.map(s => ({
        ...s,
        user_role: membershipMap.get(s.id) || 'viewer',
      }));

      return NextResponse.json({ spaces: enrichedSpaces || [] });
    }

    // List spaces for organization
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId or userId is required' },
        { status: 400 }
      );
    }

    const { data: spaces, error } = await supabase
      .schema('diq')
      .from('kb_spaces')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Error fetching spaces:', error);
      return NextResponse.json({ error: 'Failed to fetch spaces' }, { status: 500 });
    }

    return NextResponse.json({ spaces: spaces || [] });
  } catch (error) {
    console.error('KB Spaces API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create space or manage membership
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Add member to space
    if (action === 'addMember') {
      const { spaceId, userId, role = 'viewer', invitedBy } = body;

      if (!spaceId || !userId) {
        return NextResponse.json(
          { error: 'spaceId and userId are required' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .schema('diq')
        .from('kb_space_members')
        .upsert({
          kb_space_id: spaceId,
          user_id: userId,
          role,
          invited_by: invitedBy,
        });

      if (error) {
        console.error('Error adding member:', error);
        return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Remove member from space
    if (action === 'removeMember') {
      const { spaceId, userId } = body;

      if (!spaceId || !userId) {
        return NextResponse.json(
          { error: 'spaceId and userId are required' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .schema('diq')
        .from('kb_space_members')
        .delete()
        .eq('kb_space_id', spaceId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing member:', error);
        return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Add item to space
    if (action === 'addItem') {
      const { spaceId, knowledgeItemId, addedBy } = body;

      if (!spaceId || !knowledgeItemId) {
        return NextResponse.json(
          { error: 'spaceId and knowledgeItemId are required' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .schema('diq')
        .from('kb_space_items')
        .upsert({
          kb_space_id: spaceId,
          knowledge_item_id: knowledgeItemId,
          added_by: addedBy,
        });

      if (error) {
        console.error('Error adding item:', error);
        return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Remove item from space
    if (action === 'removeItem') {
      const { spaceId, knowledgeItemId } = body;

      if (!spaceId || !knowledgeItemId) {
        return NextResponse.json(
          { error: 'spaceId and knowledgeItemId are required' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .schema('diq')
        .from('kb_space_items')
        .delete()
        .eq('kb_space_id', spaceId)
        .eq('knowledge_item_id', knowledgeItemId);

      if (error) {
        console.error('Error removing item:', error);
        return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Create new KB space
    const {
      name,
      description,
      type = 'internal',
      organizationId,
      isolationLevel = 'organization',
      enabledConnectors = [],
      settings = {},
      icon,
      color,
      createdBy,
      initialMembers = [],
    } = body;

    if (!name || !organizationId || !createdBy) {
      return NextResponse.json(
        { error: 'name, organizationId, and createdBy are required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { data: space, error } = await supabase
      .schema('diq')
      .from('kb_spaces')
      .insert({
        name,
        slug,
        description,
        type,
        organization_id: organizationId,
        isolation_level: isolationLevel,
        enabled_connectors: enabledConnectors,
        settings,
        icon,
        color,
        created_by: createdBy,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        return NextResponse.json(
          { error: 'A space with this name already exists' },
          { status: 400 }
        );
      }
      console.error('Error creating space:', error);
      return NextResponse.json({ error: 'Failed to create space' }, { status: 500 });
    }

    // Add creator as admin
    await supabase
      .schema('diq')
      .from('kb_space_members')
      .insert({
        kb_space_id: space.id,
        user_id: createdBy,
        role: 'admin',
      });

    // Add initial members
    if (initialMembers.length > 0) {
      const memberRecords = initialMembers.map((m: { userId: string; role?: string }) => ({
        kb_space_id: space.id,
        user_id: m.userId,
        role: m.role || 'viewer',
        invited_by: createdBy,
      }));

      await supabase.schema('diq').from('kb_space_members').insert(memberRecords);
    }

    return NextResponse.json({ space });
  } catch (error) {
    console.error('KB Spaces API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update KB space
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { spaceId, ...updates } = body;

    if (!spaceId) {
      return NextResponse.json({ error: 'spaceId is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.isolationLevel !== undefined) updateData.isolation_level = updates.isolationLevel;
    if (updates.enabledConnectors !== undefined)
      updateData.enabled_connectors = updates.enabledConnectors;
    if (updates.settings !== undefined) updateData.settings = updates.settings;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.color !== undefined) updateData.color = updates.color;

    // Update slug if name changes
    if (updates.name) {
      updateData.slug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const { error } = await supabase
      .schema('diq')
      .from('kb_spaces')
      .update(updateData)
      .eq('id', spaceId);

    if (error) {
      console.error('Error updating space:', error);
      return NextResponse.json({ error: 'Failed to update space' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('KB Spaces API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete or archive KB space
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const spaceId = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';

    if (!spaceId) {
      return NextResponse.json({ error: 'Space ID is required' }, { status: 400 });
    }

    if (permanent) {
      // Permanently delete (cascade will handle members and items)
      const { error } = await supabase
        .schema('diq')
        .from('kb_spaces')
        .delete()
        .eq('id', spaceId);

      if (error) {
        console.error('Error deleting space:', error);
        return NextResponse.json({ error: 'Failed to delete space' }, { status: 500 });
      }
    } else {
      // Archive instead of delete
      const { error } = await supabase
        .schema('diq')
        .from('kb_spaces')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString(),
        })
        .eq('id', spaceId);

      if (error) {
        console.error('Error archiving space:', error);
        return NextResponse.json({ error: 'Failed to archive space' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('KB Spaces API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
