/**
 * Connectors API Route
 * Handles connector CRUD and sync operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  ConnectorFactory,
  ConnectorConfig,
  ConnectorType,
  SyncResult,
} from '@/lib/connectors';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET - List connectors or get single connector
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const connectorId = searchParams.get('id');
    const organizationId = searchParams.get('organizationId');
    const includeHealth = searchParams.get('includeHealth') === 'true';

    // Get available connector types (no auth required)
    if (searchParams.get('available') === 'true') {
      const connectors = ConnectorFactory.getAvailableConnectors();
      return NextResponse.json({ connectors });
    }

    // Get single connector
    if (connectorId) {
      const { data: connector, error } = await supabase
        .schema('diq')
        .from('connectors')
        .select('*')
        .eq('id', connectorId)
        .single();

      if (error || !connector) {
        return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
      }

      let health = null;
      if (includeHealth) {
        try {
          const instance = ConnectorFactory.create(connector as ConnectorConfig);
          health = await instance.testConnection();
        } catch (e) {
          health = {
            status: 'unhealthy',
            error: e instanceof Error ? e.message : 'Health check failed',
          };
        }
      }

      // Remove sensitive credentials from response
      const safeConnector = {
        ...connector,
        auth_credentials: {
          ...connector.auth_credentials,
          access_token: connector.auth_credentials?.access_token ? '***' : undefined,
          refresh_token: connector.auth_credentials?.refresh_token ? '***' : undefined,
          api_key: connector.auth_credentials?.api_key ? '***' : undefined,
          password: connector.auth_credentials?.password ? '***' : undefined,
        },
      };

      return NextResponse.json({ connector: safeConnector, health });
    }

    // List connectors for organization (or all if no organizationId provided)
    let query = supabase
      .schema('diq')
      .from('connectors')
      .select(`
        id,
        name,
        type,
        status,
        sync_frequency,
        last_sync_at,
        sync_stats,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data: connectors, error } = await query;

    if (error) {
      console.error('Error fetching connectors:', error);
      return NextResponse.json({ error: 'Failed to fetch connectors' }, { status: 500 });
    }

    return NextResponse.json({ connectors: connectors || [] });
  } catch (error) {
    console.error('Connectors API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create connector or perform actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Test connection
    if (action === 'test') {
      const { type, configuration, auth_credentials, auth_type } = body;

      if (!type || !configuration) {
        return NextResponse.json(
          { error: 'type and configuration are required' },
          { status: 400 }
        );
      }

      try {
        const tempConfig: ConnectorConfig = {
          id: 'test',
          name: 'Test Connection',
          type: type as ConnectorType,
          status: 'pending',
          organization_id: 'test',
          auth_type: auth_type || 'api_key',
          auth_credentials: auth_credentials || {},
          configuration,
          sync_frequency: 'manual',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'test',
        };

        const connector = ConnectorFactory.create(tempConfig);
        const health = await connector.testConnection();

        return NextResponse.json({
          success: health.status === 'healthy',
          health,
        });
      } catch (e) {
        return NextResponse.json({
          success: false,
          error: e instanceof Error ? e.message : 'Connection test failed',
        });
      }
    }

    // Trigger sync
    if (action === 'sync') {
      const { connectorId, full = false } = body;

      if (!connectorId) {
        return NextResponse.json(
          { error: 'connectorId is required' },
          { status: 400 }
        );
      }

      const { data: config, error: fetchError } = await supabase
        .schema('diq')
        .from('connectors')
        .select('*')
        .eq('id', connectorId)
        .single();

      if (fetchError || !config) {
        return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
      }

      // Update status to syncing
      await supabase
        .schema('diq')
        .from('connectors')
        .update({ status: 'syncing', updated_at: new Date().toISOString() })
        .eq('id', connectorId);

      try {
        const connector = ConnectorFactory.create(config as ConnectorConfig);
        const result: SyncResult = full
          ? await connector.fullSync()
          : await connector.incrementalSync(config.sync_cursor);

        // Update connector with sync results
        await supabase
          .schema('diq')
          .from('connectors')
          .update({
            status: result.status === 'failed' ? 'error' : 'active',
            last_sync_at: result.completed_at,
            sync_cursor: result.cursor,
            sync_stats: result.stats,
            updated_at: new Date().toISOString(),
          })
          .eq('id', connectorId);

        // Save synced items
        if (result.stats.new_items > 0 || result.stats.updated_items > 0) {
          // In a real implementation, save connector items to database
        }

        return NextResponse.json({ result });
      } catch (e) {
        // Update status to error
        await supabase
          .schema('diq')
          .from('connectors')
          .update({
            status: 'error',
            updated_at: new Date().toISOString(),
          })
          .eq('id', connectorId);

        return NextResponse.json({
          error: e instanceof Error ? e.message : 'Sync failed',
        }, { status: 500 });
      }
    }

    // Create new connector
    const {
      name,
      type,
      organizationId,
      kbSpaceId,
      authType,
      authCredentials,
      configuration,
      syncFrequency = 'daily',
      createdBy,
    } = body;

    if (!name || !type || !organizationId || !createdBy) {
      return NextResponse.json(
        { error: 'name, type, organizationId, and createdBy are required' },
        { status: 400 }
      );
    }

    // Validate connector type
    if (!ConnectorFactory.isSupported(type)) {
      return NextResponse.json(
        { error: `Unsupported connector type: ${type}` },
        { status: 400 }
      );
    }

    const { data: connector, error } = await supabase
      .schema('diq')
      .from('connectors')
      .insert({
        name,
        type,
        status: 'pending',
        organization_id: organizationId,
        kb_space_id: kbSpaceId,
        auth_type: authType || 'api_key',
        auth_credentials: authCredentials || {},
        configuration: configuration || {},
        sync_frequency: syncFrequency,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating connector:', error);
      return NextResponse.json({ error: 'Failed to create connector' }, { status: 500 });
    }

    return NextResponse.json({ connector });
  } catch (error) {
    console.error('Connectors API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update connector
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectorId, ...updates } = body;

    if (!connectorId) {
      return NextResponse.json({ error: 'connectorId is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.kbSpaceId !== undefined) updateData.kb_space_id = updates.kbSpaceId;
    if (updates.authCredentials !== undefined) updateData.auth_credentials = updates.authCredentials;
    if (updates.configuration !== undefined) updateData.configuration = updates.configuration;
    if (updates.syncFrequency !== undefined) updateData.sync_frequency = updates.syncFrequency;

    const { error } = await supabase
      .schema('diq')
      .from('connectors')
      .update(updateData)
      .eq('id', connectorId);

    if (error) {
      console.error('Error updating connector:', error);
      return NextResponse.json({ error: 'Failed to update connector' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Connectors API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete connector
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const connectorId = searchParams.get('id');

    if (!connectorId) {
      return NextResponse.json({ error: 'Connector ID is required' }, { status: 400 });
    }

    // Delete synced items first
    await supabase
      .schema('diq')
      .from('connector_items')
      .delete()
      .eq('connector_id', connectorId);

    // Delete connector
    const { error } = await supabase
      .schema('diq')
      .from('connectors')
      .delete()
      .eq('id', connectorId);

    if (error) {
      console.error('Error deleting connector:', error);
      return NextResponse.json({ error: 'Failed to delete connector' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Connectors API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
