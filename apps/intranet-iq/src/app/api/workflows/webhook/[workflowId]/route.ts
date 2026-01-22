/**
 * Workflow Webhook Trigger API Route
 * Handle incoming webhook requests to trigger workflows
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleWebhookTrigger } from '@/lib/workflow/executor';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST - Trigger workflow via webhook
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params;

    // Verify workflow exists and has webhook trigger
    const { data: workflow, error: workflowError } = await supabase
      .schema('diq')
      .from('workflows')
      .select('id, name, trigger_type, trigger_config, is_active')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    if (!workflow.is_active) {
      return NextResponse.json(
        { error: 'Workflow is not active' },
        { status: 400 }
      );
    }

    if (workflow.trigger_type !== 'webhook') {
      return NextResponse.json(
        { error: 'Workflow is not configured for webhook triggers' },
        { status: 400 }
      );
    }

    // Optional: Verify webhook secret
    const webhookConfig = workflow.trigger_config as { secret?: string; allowedIPs?: string[] };
    if (webhookConfig.secret) {
      const providedSecret = request.headers.get('x-webhook-secret');
      if (providedSecret !== webhookConfig.secret) {
        return NextResponse.json(
          { error: 'Invalid webhook secret' },
          { status: 401 }
        );
      }
    }

    // Optional: IP whitelist check
    if (webhookConfig.allowedIPs && webhookConfig.allowedIPs.length > 0) {
      const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                       request.headers.get('x-real-ip') ||
                       'unknown';
      if (!webhookConfig.allowedIPs.includes(clientIP)) {
        return NextResponse.json(
          { error: 'IP not allowed' },
          { status: 403 }
        );
      }
    }

    // Parse request body
    let payload: Record<string, unknown> = {};
    try {
      payload = await request.json();
    } catch {
      // Body might be empty or not JSON
    }

    // Extract relevant headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Only include safe headers
      if (!['authorization', 'cookie', 'x-webhook-secret'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Execute workflow
    const result = await handleWebhookTrigger(workflowId, payload, headers);

    // Return result based on status
    if (result.status === 'completed') {
      return NextResponse.json({
        success: true,
        executionId: result.executionId,
        output: result.output,
        duration: result.duration,
      });
    } else {
      return NextResponse.json({
        success: false,
        executionId: result.executionId,
        error: result.error,
        duration: result.duration,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Webhook trigger error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook trigger failed' },
      { status: 500 }
    );
  }
}

// GET - Health check for webhook endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params;

    const { data: workflow, error } = await supabase
      .schema('diq')
      .from('workflows')
      .select('id, name, trigger_type, is_active')
      .eq('id', workflowId)
      .single();

    if (error || !workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      workflowId: workflow.id,
      workflowName: workflow.name,
      triggerType: workflow.trigger_type,
      isActive: workflow.is_active,
      webhookEnabled: workflow.trigger_type === 'webhook',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}
