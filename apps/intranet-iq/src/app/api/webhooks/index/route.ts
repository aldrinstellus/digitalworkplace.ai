/**
 * Real-time Indexing Webhook Endpoint
 * Handles webhook triggers for document indexing (<5 second latency)
 *
 * V2.0 Feature: Real-time Indexing - EPIC 1
 *
 * POST /api/webhooks/index
 * Body: {
 *   event: 'article.created' | 'article.updated' | 'article.deleted' | 'news.created' | ...
 *   payload: { ... document data ... }
 *   signature?: string (optional HMAC signature for security)
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  indexingQueue,
  queueArticleIndex,
  queueNewsIndex,
  queueEventIndex,
  queueDocumentDelete,
  processQueueImmediately,
} from '@/lib/indexing-queue';
import { createHmac } from 'crypto';

// ============================================================================
// Types
// ============================================================================

type WebhookEvent =
  | 'article.created'
  | 'article.updated'
  | 'article.deleted'
  | 'news.created'
  | 'news.updated'
  | 'news.deleted'
  | 'event.created'
  | 'event.updated'
  | 'event.deleted'
  | 'employee.created'
  | 'employee.updated'
  | 'employee.deleted'
  | 'workflow.created'
  | 'workflow.updated'
  | 'workflow.deleted'
  | 'batch.index'
  | 'batch.delete';

interface WebhookPayload {
  event: WebhookEvent;
  payload: Record<string, unknown> | Record<string, unknown>[];
  signature?: string;
  timestamp?: number;
  source?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const WEBHOOK_SECRET = process.env.INDEX_WEBHOOK_SECRET;
const SIGNATURE_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// Signature Verification
// ============================================================================

function verifySignature(payload: string, signature: string, timestamp: number): boolean {
  if (!WEBHOOK_SECRET) {
    // No secret configured, skip verification
    return true;
  }

  // Check timestamp tolerance
  const now = Date.now();
  if (Math.abs(now - timestamp) > SIGNATURE_TOLERANCE_MS) {
    console.warn('[Webhook] Signature timestamp out of tolerance');
    return false;
  }

  // Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = createHmac('sha256', WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');

  return signature === expectedSignature;
}

// ============================================================================
// Event Handlers
// ============================================================================

async function handleArticleEvent(
  event: 'created' | 'updated' | 'deleted',
  payload: Record<string, unknown>
): Promise<void> {
  if (event === 'deleted') {
    queueDocumentDelete(payload.id as string, 'high');
  } else {
    queueArticleIndex({
      id: payload.id as string,
      title: payload.title as string,
      content: payload.content as string,
      excerpt: payload.excerpt as string | undefined,
      category: payload.category as string | undefined,
      department: payload.department as string | undefined,
      author: payload.author as string | undefined,
      authorId: payload.author_id as string | undefined,
      tags: payload.tags as string[] | undefined,
      createdAt: payload.created_at as string,
      updatedAt: payload.updated_at as string,
      slug: payload.slug as string | undefined,
    }, event === 'created' ? 'high' : 'normal');
  }
}

async function handleNewsEvent(
  event: 'created' | 'updated' | 'deleted',
  payload: Record<string, unknown>
): Promise<void> {
  if (event === 'deleted') {
    queueDocumentDelete(payload.id as string, 'high');
  } else {
    queueNewsIndex({
      id: payload.id as string,
      title: payload.title as string,
      content: payload.content as string,
      excerpt: payload.excerpt as string | undefined,
      category: payload.category as string | undefined,
      author: payload.author as string | undefined,
      authorId: payload.author_id as string | undefined,
      tags: payload.tags as string[] | undefined,
      createdAt: payload.created_at as string,
      updatedAt: payload.updated_at as string,
    }, event === 'created' ? 'high' : 'normal');
  }
}

async function handleEventEvent(
  event: 'created' | 'updated' | 'deleted',
  payload: Record<string, unknown>
): Promise<void> {
  if (event === 'deleted') {
    queueDocumentDelete(payload.id as string, 'high');
  } else {
    queueEventIndex({
      id: payload.id as string,
      title: payload.title as string,
      description: payload.description as string,
      category: payload.category as string | undefined,
      department: payload.department as string | undefined,
      organizer: payload.organizer as string | undefined,
      organizerId: payload.organizer_id as string | undefined,
      tags: payload.tags as string[] | undefined,
      createdAt: payload.created_at as string,
      updatedAt: payload.updated_at as string,
    }, event === 'created' ? 'high' : 'normal');
  }
}

async function handleEmployeeEvent(
  event: 'created' | 'updated' | 'deleted',
  payload: Record<string, unknown>
): Promise<void> {
  if (event === 'deleted') {
    queueDocumentDelete(payload.id as string, 'high');
  } else {
    indexingQueue.add({
      id: payload.id as string,
      operation: 'index',
      document: {
        id: payload.id as string,
        title: payload.full_name as string || payload.name as string,
        content: `${payload.job_title || ''} ${payload.bio || ''} ${payload.skills?.toString() || ''}`,
        type: 'employee',
        department: payload.department as string | undefined,
        createdAt: payload.created_at as string,
        updatedAt: payload.updated_at as string,
        url: `/diq/people/${payload.id}`,
        metadata: {
          email: payload.email,
          phone: payload.phone,
          location: payload.location,
        },
      },
      priority: 'normal',
      source: 'webhook',
    });
  }
}

async function handleWorkflowEvent(
  event: 'created' | 'updated' | 'deleted',
  payload: Record<string, unknown>
): Promise<void> {
  if (event === 'deleted') {
    queueDocumentDelete(payload.id as string, 'normal');
  } else {
    indexingQueue.add({
      id: payload.id as string,
      operation: 'index',
      document: {
        id: payload.id as string,
        title: payload.name as string,
        content: payload.description as string || '',
        type: 'workflow',
        category: payload.category as string | undefined,
        tags: payload.tags as string[] | undefined,
        createdAt: payload.created_at as string,
        updatedAt: payload.updated_at as string,
        url: `/diq/agents/${payload.id}`,
      },
      priority: 'low',
      source: 'webhook',
    });
  }
}

async function handleBatchIndex(payload: Record<string, unknown>[]): Promise<void> {
  for (const item of payload) {
    const type = item.type as string;
    switch (type) {
      case 'article':
        await handleArticleEvent('created', item);
        break;
      case 'news':
        await handleNewsEvent('created', item);
        break;
      case 'event':
        await handleEventEvent('created', item);
        break;
      case 'employee':
        await handleEmployeeEvent('created', item);
        break;
      case 'workflow':
        await handleWorkflowEvent('created', item);
        break;
    }
  }
}

async function handleBatchDelete(payload: Record<string, unknown>[]): Promise<void> {
  for (const item of payload) {
    queueDocumentDelete(item.id as string, 'normal');
  }
}

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.text();
    const data: WebhookPayload = JSON.parse(body);

    // Verify signature if configured
    if (WEBHOOK_SECRET && data.signature && data.timestamp) {
      if (!verifySignature(body, data.signature, data.timestamp)) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const { event, payload } = data;

    // Route to appropriate handler
    const [entity, action] = event.split('.') as [string, string];

    switch (entity) {
      case 'article':
        await handleArticleEvent(
          action as 'created' | 'updated' | 'deleted',
          payload as Record<string, unknown>
        );
        break;
      case 'news':
        await handleNewsEvent(
          action as 'created' | 'updated' | 'deleted',
          payload as Record<string, unknown>
        );
        break;
      case 'event':
        await handleEventEvent(
          action as 'created' | 'updated' | 'deleted',
          payload as Record<string, unknown>
        );
        break;
      case 'employee':
        await handleEmployeeEvent(
          action as 'created' | 'updated' | 'deleted',
          payload as Record<string, unknown>
        );
        break;
      case 'workflow':
        await handleWorkflowEvent(
          action as 'created' | 'updated' | 'deleted',
          payload as Record<string, unknown>
        );
        break;
      case 'batch':
        if (action === 'index') {
          await handleBatchIndex(payload as Record<string, unknown>[]);
        } else if (action === 'delete') {
          await handleBatchDelete(payload as Record<string, unknown>[]);
        }
        break;
      default:
        return NextResponse.json(
          { error: `Unknown event type: ${event}` },
          { status: 400 }
        );
    }

    // Process queue immediately for real-time indexing
    const result = await processQueueImmediately();

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      event,
      queued: true,
      processed: result.itemsProcessed,
      failed: result.itemsFailed,
      duration,
      queueStatus: indexingQueue.getStatus(),
    });
  } catch (error) {
    console.error('[Webhook] Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/index
 * Returns queue status
 */
export async function GET() {
  try {
    const status = indexingQueue.getStatus();
    const items = indexingQueue.getItems(50);

    return NextResponse.json({
      status,
      items: items.map(item => ({
        id: item.id,
        operation: item.operation,
        priority: item.priority,
        source: item.source,
        retries: item.retries,
        timestamp: item.timestamp,
        age: Date.now() - item.timestamp,
      })),
    });
  } catch (error) {
    console.error('[Webhook] Error getting status:', error);
    return NextResponse.json(
      { error: 'Failed to get queue status' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/webhooks/index
 * Clears the queue (admin only)
 */
export async function DELETE() {
  try {
    indexingQueue.clear();
    return NextResponse.json({ success: true, message: 'Queue cleared' });
  } catch (error) {
    console.error('[Webhook] Error clearing queue:', error);
    return NextResponse.json(
      { error: 'Failed to clear queue' },
      { status: 500 }
    );
  }
}
