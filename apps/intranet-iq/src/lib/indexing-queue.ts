/**
 * Real-time Indexing Queue System
 * Handles document indexing with batching and retry logic
 *
 * V2.0 Feature: Real-time Indexing (<5 second trigger) - EPIC 1
 */

import { SearchableDocument, indexDocumentsBulk, deleteDocumentsBulk } from './elasticsearch';
import { generateEmbedding } from './embeddings';

// ============================================================================
// Types
// ============================================================================

export type IndexOperation = 'index' | 'update' | 'delete';

export interface IndexQueueItem {
  id: string;
  operation: IndexOperation;
  document?: Partial<SearchableDocument>;
  timestamp: number;
  retries: number;
  priority: 'high' | 'normal' | 'low';
  source: string; // Source of the change (e.g., 'webhook', 'api', 'sync')
}

export interface IndexQueueStatus {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  lastProcessed?: string;
  averageProcessingTime: number;
}

export interface IndexJobResult {
  success: boolean;
  itemsProcessed: number;
  itemsFailed: number;
  errors: string[];
  duration: number;
}

// ============================================================================
// Queue Configuration
// ============================================================================

const BATCH_SIZE = 50;
const BATCH_INTERVAL_MS = 1000; // Process every 1 second
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

// ============================================================================
// In-memory Queue (for serverless - use Redis in production)
// ============================================================================

class IndexingQueue {
  private queue: IndexQueueItem[] = [];
  private processing: boolean = false;
  private stats = {
    completed: 0,
    failed: 0,
    totalProcessingTime: 0,
    processCount: 0,
  };
  private batchTimer: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, ((data: unknown) => void)[]> = new Map();

  /**
   * Add an item to the queue
   */
  add(item: Omit<IndexQueueItem, 'timestamp' | 'retries'>): void {
    const queueItem: IndexQueueItem = {
      ...item,
      timestamp: Date.now(),
      retries: 0,
    };

    // Remove any existing items for the same document
    this.queue = this.queue.filter(q => q.id !== item.id || q.operation !== item.operation);

    // Add to queue based on priority
    if (item.priority === 'high') {
      this.queue.unshift(queueItem);
    } else {
      this.queue.push(queueItem);
    }

    this.emit('item_added', queueItem);
    this.scheduleBatchProcessing();
  }

  /**
   * Add multiple items at once
   */
  addBatch(items: Omit<IndexQueueItem, 'timestamp' | 'retries'>[]): void {
    for (const item of items) {
      this.add(item);
    }
  }

  /**
   * Schedule batch processing
   */
  private scheduleBatchProcessing(): void {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(async () => {
      this.batchTimer = null;
      await this.processBatch();
    }, BATCH_INTERVAL_MS);
  }

  /**
   * Process a batch of items
   */
  async processBatch(): Promise<IndexJobResult> {
    if (this.processing || this.queue.length === 0) {
      return {
        success: true,
        itemsProcessed: 0,
        itemsFailed: 0,
        errors: [],
        duration: 0,
      };
    }

    this.processing = true;
    const startTime = Date.now();
    const errors: string[] = [];
    let itemsProcessed = 0;
    let itemsFailed = 0;

    try {
      // Get batch of items
      const batch = this.queue.splice(0, BATCH_SIZE);
      this.emit('batch_started', { count: batch.length });

      // Separate by operation
      const toIndex: SearchableDocument[] = [];
      const toDelete: string[] = [];

      for (const item of batch) {
        try {
          if (item.operation === 'delete') {
            toDelete.push(item.id);
          } else if (item.document) {
            // Generate embedding if content is available
            const doc = item.document as SearchableDocument;
            if (doc.content && !doc.embedding) {
              try {
                doc.embedding = await generateEmbedding(
                  `${doc.title || ''} ${doc.content}`.slice(0, 8000)
                );
              } catch (embError) {
                console.warn(`[IndexQueue] Failed to generate embedding for ${item.id}:`, embError);
                // Continue without embedding
              }
            }
            toIndex.push(doc);
          }
        } catch (itemError) {
          console.error(`[IndexQueue] Error processing item ${item.id}:`, itemError);
          if (item.retries < MAX_RETRIES) {
            // Re-queue for retry
            this.queue.push({
              ...item,
              retries: item.retries + 1,
            });
          } else {
            errors.push(`Failed to process ${item.id} after ${MAX_RETRIES} retries`);
            itemsFailed++;
          }
        }
      }

      // Execute bulk operations
      if (toIndex.length > 0) {
        const indexResult = await indexDocumentsBulk(toIndex);
        itemsProcessed += indexResult.indexed;
        itemsFailed += indexResult.errors;
        if (indexResult.errors > 0) {
          errors.push(`${indexResult.errors} documents failed to index`);
        }
      }

      if (toDelete.length > 0) {
        const deleted = await deleteDocumentsBulk(toDelete);
        itemsProcessed += deleted;
        if (deleted < toDelete.length) {
          const failedDeletes = toDelete.length - deleted;
          itemsFailed += failedDeletes;
          errors.push(`${failedDeletes} documents failed to delete`);
        }
      }

      // Update stats
      this.stats.completed += itemsProcessed;
      this.stats.failed += itemsFailed;

      const duration = Date.now() - startTime;
      this.stats.totalProcessingTime += duration;
      this.stats.processCount++;

      this.emit('batch_completed', {
        itemsProcessed,
        itemsFailed,
        duration,
      });

      // Schedule next batch if there are more items
      if (this.queue.length > 0) {
        this.scheduleBatchProcessing();
      }

      return {
        success: errors.length === 0,
        itemsProcessed,
        itemsFailed,
        errors,
        duration,
      };
    } catch (error) {
      console.error('[IndexQueue] Batch processing failed:', error);
      return {
        success: false,
        itemsProcessed,
        itemsFailed: this.queue.length,
        errors: [String(error)],
        duration: Date.now() - startTime,
      };
    } finally {
      this.processing = false;
    }
  }

  /**
   * Get queue status
   */
  getStatus(): IndexQueueStatus {
    const avgTime = this.stats.processCount > 0
      ? this.stats.totalProcessingTime / this.stats.processCount
      : 0;

    return {
      pending: this.queue.length,
      processing: this.processing ? 1 : 0,
      completed: this.stats.completed,
      failed: this.stats.failed,
      averageProcessingTime: avgTime,
    };
  }

  /**
   * Get queue items (for admin dashboard)
   */
  getItems(limit: number = 100): IndexQueueItem[] {
    return this.queue.slice(0, limit);
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    this.emit('queue_cleared', {});
  }

  /**
   * Event emitter
   */
  on(event: string, callback: (data: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(data);
        } catch (error) {
          console.error(`[IndexQueue] Event listener error for ${event}:`, error);
        }
      }
    }
  }
}

// Singleton instance
export const indexingQueue = new IndexingQueue();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Queue an article for indexing
 */
export function queueArticleIndex(article: {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  department?: string;
  author?: string;
  authorId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  slug?: string;
}, priority: 'high' | 'normal' | 'low' = 'normal'): void {
  indexingQueue.add({
    id: article.id,
    operation: 'index',
    document: {
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      type: 'article',
      category: article.category,
      department: article.department,
      author: article.author,
      authorId: article.authorId,
      tags: article.tags,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      url: `/diq/content/${article.slug || article.id}`,
    },
    priority,
    source: 'api',
  });
}

/**
 * Queue a news post for indexing
 */
export function queueNewsIndex(news: {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  author?: string;
  authorId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}, priority: 'high' | 'normal' | 'low' = 'normal'): void {
  indexingQueue.add({
    id: news.id,
    operation: 'index',
    document: {
      id: news.id,
      title: news.title,
      content: news.content,
      excerpt: news.excerpt,
      type: 'news',
      category: news.category,
      author: news.author,
      authorId: news.authorId,
      tags: news.tags,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
      url: `/diq/news/${news.id}`,
    },
    priority,
    source: 'api',
  });
}

/**
 * Queue an event for indexing
 */
export function queueEventIndex(event: {
  id: string;
  title: string;
  description: string;
  category?: string;
  department?: string;
  organizer?: string;
  organizerId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}, priority: 'high' | 'normal' | 'low' = 'normal'): void {
  indexingQueue.add({
    id: event.id,
    operation: 'index',
    document: {
      id: event.id,
      title: event.title,
      content: event.description,
      type: 'event',
      category: event.category,
      department: event.department,
      author: event.organizer,
      authorId: event.organizerId,
      tags: event.tags,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      url: `/diq/events/${event.id}`,
    },
    priority,
    source: 'api',
  });
}

/**
 * Queue a document for deletion
 */
export function queueDocumentDelete(id: string, priority: 'high' | 'normal' | 'low' = 'normal'): void {
  indexingQueue.add({
    id,
    operation: 'delete',
    priority,
    source: 'api',
  });
}

/**
 * Force immediate processing of the queue
 */
export async function processQueueImmediately(): Promise<IndexJobResult> {
  return indexingQueue.processBatch();
}
