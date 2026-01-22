/**
 * Notion Connector
 * Syncs pages and databases from Notion
 */

import { BaseConnector, ConnectorError } from '../base.connector';
import {
  ConnectorConfig,
  ConnectorItem,
  ConnectorCapabilities,
  ConnectorHealthCheck,
  ConnectorSearchParams,
  SyncResult,
} from '../types';

interface NotionUser {
  id: string;
  name: string;
  avatar_url?: string;
  type: 'person' | 'bot';
  person?: {
    email: string;
  };
}

interface NotionPage {
  id: string;
  object: 'page';
  created_time: string;
  last_edited_time: string;
  created_by: { id: string };
  last_edited_by: { id: string };
  archived: boolean;
  url: string;
  parent: {
    type: 'database_id' | 'page_id' | 'workspace';
    database_id?: string;
    page_id?: string;
  };
  properties: Record<string, NotionProperty>;
  icon?: {
    type: 'emoji' | 'file' | 'external';
    emoji?: string;
    file?: { url: string };
    external?: { url: string };
  };
}

interface NotionProperty {
  id: string;
  type: string;
  title?: Array<{ text: { content: string } }>;
  rich_text?: Array<{ text: { content: string } }>;
  [key: string]: unknown;
}

interface NotionBlock {
  id: string;
  object: 'block';
  type: string;
  has_children: boolean;
  archived: boolean;
  paragraph?: { rich_text: Array<{ text: { content: string } }> };
  heading_1?: { rich_text: Array<{ text: { content: string } }> };
  heading_2?: { rich_text: Array<{ text: { content: string } }> };
  heading_3?: { rich_text: Array<{ text: { content: string } }> };
  bulleted_list_item?: { rich_text: Array<{ text: { content: string } }> };
  numbered_list_item?: { rich_text: Array<{ text: { content: string } }> };
  toggle?: { rich_text: Array<{ text: { content: string } }> };
  code?: { rich_text: Array<{ text: { content: string } }>; language: string };
  quote?: { rich_text: Array<{ text: { content: string } }> };
  callout?: { rich_text: Array<{ text: { content: string } }> };
  [key: string]: unknown;
}

interface NotionSearchResponse {
  results: NotionPage[];
  next_cursor: string | null;
  has_more: boolean;
}

export class NotionConnector extends BaseConnector {
  private apiBaseUrl = 'https://api.notion.com/v1';
  private notionVersion = '2022-06-28';

  constructor(config: ConnectorConfig) {
    super(config);
  }

  getCapabilities(): ConnectorCapabilities {
    return {
      supports_full_sync: true,
      supports_incremental_sync: true,
      supports_realtime_updates: false,
      supports_webhooks: false,
      supported_content_types: ['page', 'database'],
      supports_search: true,
      supports_permissions: true,
      supports_attachments: false,
      supports_comments: true,
      supports_versions: false,
      rate_limit_requests_per_minute: 180,
      max_items_per_request: 100,
    };
  }

  protected getAuthHeader(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.auth_credentials.api_key}`,
      'Notion-Version': this.notionVersion,
    };
  }

  async testConnection(): Promise<ConnectorHealthCheck> {
    const timestamp = new Date().toISOString();
    const checks: ConnectorHealthCheck['checks'] = {
      authentication: { status: 'fail' },
      connectivity: { status: 'fail' },
      permissions: { status: 'fail' },
      quota: { status: 'pass' },
    };

    try {
      const startTime = Date.now();

      // Test connection by listing users (requires integration access)
      const response = await fetch(`${this.apiBaseUrl}/users/me`, {
        headers: this.getAuthHeader(),
      });

      checks.connectivity = {
        status: 'pass',
        latency_ms: Date.now() - startTime,
      };

      if (!response.ok) {
        if (response.status === 401) {
          return {
            connector_id: this.config.id,
            status: 'unhealthy',
            timestamp,
            checks,
            recommendations: ['Invalid API token. Please check your Notion integration token.'],
          };
        }
        throw new Error(`HTTP ${response.status}`);
      }

      checks.authentication = { status: 'pass' };

      // Test search capability
      const searchResponse = await fetch(`${this.apiBaseUrl}/search`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 1 }),
      });

      if (searchResponse.ok) {
        checks.permissions = { status: 'pass', scopes: ['read_content'] };
      }

      return {
        connector_id: this.config.id,
        status: 'healthy',
        timestamp,
        checks,
      };
    } catch (error) {
      return {
        connector_id: this.config.id,
        status: 'unhealthy',
        timestamp,
        checks,
        recommendations: [
          'Unable to connect to Notion. Please verify your integration token and permissions.',
        ],
      };
    }
  }

  async fullSync(): Promise<SyncResult> {
    const startTime = new Date();
    const errors: SyncResult['errors'] = [];
    let totalDiscovered = 0;
    let newItems = 0;

    try {
      // Get all pages via search
      let hasMore = true;
      let cursor: string | null = null;

      while (hasMore) {
        const response = await this.searchPages(cursor);
        totalDiscovered += response.results.length;

        for (const page of response.results) {
          if (page.archived) continue;

          try {
            const content = await this.getPageContent(page.id);
            const item = await this.convertPageToItem(page, content);
            newItems++;
            // In real implementation, save to database
          } catch (err) {
            errors.push({
              external_id: page.id,
              title: this.getPageTitle(page),
              error: err instanceof Error ? err.message : 'Unknown error',
            });
          }
        }

        hasMore = response.has_more;
        cursor = response.next_cursor;
      }

      return {
        connector_id: this.config.id,
        status: errors.length === 0 ? 'success' : 'partial',
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime.getTime(),
        stats: {
          total_discovered: totalDiscovered,
          new_items: newItems,
          updated_items: 0,
          deleted_items: 0,
          failed_items: errors.length,
          unchanged_items: 0,
        },
        errors,
        has_more: false,
      };
    } catch (error) {
      return {
        connector_id: this.config.id,
        status: 'failed',
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime.getTime(),
        stats: {
          total_discovered: 0,
          new_items: 0,
          updated_items: 0,
          deleted_items: 0,
          failed_items: 1,
          unchanged_items: 0,
        },
        errors: [
          {
            external_id: 'sync',
            error: error instanceof Error ? error.message : 'Sync failed',
          },
        ],
        has_more: false,
      };
    }
  }

  async incrementalSync(cursor?: string): Promise<SyncResult> {
    const startTime = new Date();
    const errors: SyncResult['errors'] = [];
    let totalDiscovered = 0;
    let newItems = 0;
    let updatedItems = 0;

    try {
      const lastSync = this.config.last_sync_at || new Date(0).toISOString();

      // Search for recently edited pages
      let hasMore = true;
      let searchCursor: string | null = null;

      while (hasMore) {
        const response = await this.searchPages(searchCursor, {
          filter: {
            property: 'object',
            value: 'page',
          },
          sort: {
            direction: 'descending',
            timestamp: 'last_edited_time',
          },
        });

        for (const page of response.results) {
          // Stop if we've gone past last sync time
          if (new Date(page.last_edited_time) < new Date(lastSync)) {
            hasMore = false;
            break;
          }

          if (page.archived) continue;

          totalDiscovered++;

          try {
            const content = await this.getPageContent(page.id);
            const item = await this.convertPageToItem(page, content);

            // Check if new or updated
            if (new Date(page.created_time) > new Date(lastSync)) {
              newItems++;
            } else {
              updatedItems++;
            }
          } catch (err) {
            errors.push({
              external_id: page.id,
              title: this.getPageTitle(page),
              error: err instanceof Error ? err.message : 'Unknown error',
            });
          }
        }

        if (hasMore) {
          hasMore = response.has_more;
          searchCursor = response.next_cursor;
        }
      }

      return {
        connector_id: this.config.id,
        status: errors.length === 0 ? 'success' : 'partial',
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime.getTime(),
        stats: {
          total_discovered: totalDiscovered,
          new_items: newItems,
          updated_items: updatedItems,
          deleted_items: 0,
          failed_items: errors.length,
          unchanged_items: 0,
        },
        errors,
        cursor: new Date().toISOString(),
        has_more: false,
      };
    } catch (error) {
      return {
        connector_id: this.config.id,
        status: 'failed',
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime.getTime(),
        stats: {
          total_discovered: 0,
          new_items: 0,
          updated_items: 0,
          deleted_items: 0,
          failed_items: 1,
          unchanged_items: 0,
        },
        errors: [
          {
            external_id: 'sync',
            error: error instanceof Error ? error.message : 'Incremental sync failed',
          },
        ],
        has_more: false,
      };
    }
  }

  async fetchItem(externalId: string): Promise<ConnectorItem | null> {
    try {
      const page = await this.makeRequest<NotionPage>(
        `${this.apiBaseUrl}/pages/${externalId}`
      );
      const content = await this.getPageContent(externalId);
      return this.convertPageToItem(page, content);
    } catch (error) {
      if (error instanceof ConnectorError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async search(params: ConnectorSearchParams): Promise<ConnectorItem[]> {
    const response = await this.makeRequest<NotionSearchResponse>(
      `${this.apiBaseUrl}/search`,
      {
        method: 'POST',
        body: JSON.stringify({
          query: params.query,
          page_size: params.limit || 25,
          filter: {
            property: 'object',
            value: 'page',
          },
        }),
      }
    );

    const items: ConnectorItem[] = [];

    for (const page of response.results) {
      if (page.archived) continue;

      try {
        const content = await this.getPageContent(page.id);
        items.push(await this.convertPageToItem(page, content));
      } catch {
        // Skip failed pages in search results
      }
    }

    return items;
  }

  // ==========================================
  // Private helper methods
  // ==========================================

  private async searchPages(
    cursor: string | null,
    options?: {
      filter?: { property: string; value: string };
      sort?: { direction: string; timestamp: string };
    }
  ): Promise<NotionSearchResponse> {
    const body: Record<string, unknown> = {
      page_size: 100,
      filter: {
        property: 'object',
        value: 'page',
      },
    };

    if (cursor) {
      body.start_cursor = cursor;
    }

    if (options?.filter) {
      body.filter = options.filter;
    }

    if (options?.sort) {
      body.sort = options.sort;
    }

    return this.makeRequest<NotionSearchResponse>(`${this.apiBaseUrl}/search`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  private async getPageContent(pageId: string): Promise<string> {
    const blocks = await this.getBlocks(pageId);
    return this.blocksToMarkdown(blocks);
  }

  private async getBlocks(blockId: string): Promise<NotionBlock[]> {
    const blocks: NotionBlock[] = [];
    let cursor: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(`${this.apiBaseUrl}/blocks/${blockId}/children`);
      url.searchParams.set('page_size', '100');
      if (cursor) {
        url.searchParams.set('start_cursor', cursor);
      }

      const response = await this.makeRequest<{
        results: NotionBlock[];
        next_cursor: string | null;
        has_more: boolean;
      }>(url.toString());

      blocks.push(...response.results);

      // Get children recursively
      for (const block of response.results) {
        if (block.has_children) {
          const children = await this.getBlocks(block.id);
          blocks.push(...children);
        }
      }

      hasMore = response.has_more;
      cursor = response.next_cursor;
    }

    return blocks;
  }

  private blocksToMarkdown(blocks: NotionBlock[]): string {
    const lines: string[] = [];

    for (const block of blocks) {
      const text = this.extractBlockText(block);

      switch (block.type) {
        case 'paragraph':
          lines.push(text);
          break;
        case 'heading_1':
          lines.push(`# ${text}`);
          break;
        case 'heading_2':
          lines.push(`## ${text}`);
          break;
        case 'heading_3':
          lines.push(`### ${text}`);
          break;
        case 'bulleted_list_item':
          lines.push(`- ${text}`);
          break;
        case 'numbered_list_item':
          lines.push(`1. ${text}`);
          break;
        case 'toggle':
          lines.push(`<details><summary>${text}</summary></details>`);
          break;
        case 'code':
          const lang = block.code?.language || '';
          lines.push(`\`\`\`${lang}\n${text}\n\`\`\``);
          break;
        case 'quote':
          lines.push(`> ${text}`);
          break;
        case 'callout':
          lines.push(`> **Note:** ${text}`);
          break;
        case 'divider':
          lines.push('---');
          break;
        default:
          if (text) lines.push(text);
      }
    }

    return lines.join('\n\n');
  }

  private extractBlockText(block: NotionBlock): string {
    const blockContent =
      block.paragraph ||
      block.heading_1 ||
      block.heading_2 ||
      block.heading_3 ||
      block.bulleted_list_item ||
      block.numbered_list_item ||
      block.toggle ||
      block.code ||
      block.quote ||
      block.callout;

    if (!blockContent?.rich_text) return '';

    return blockContent.rich_text.map(rt => rt.text?.content || '').join('');
  }

  private getPageTitle(page: NotionPage): string {
    // Find title property
    for (const [, prop] of Object.entries(page.properties)) {
      if (prop.type === 'title' && prop.title) {
        return prop.title.map(t => t.text?.content || '').join('');
      }
    }
    return 'Untitled';
  }

  private async convertPageToItem(
    page: NotionPage,
    content: string
  ): Promise<ConnectorItem> {
    const title = this.getPageTitle(page);

    return {
      id: `notion-${page.id}`,
      connector_id: this.config.id,
      external_id: page.id,

      title,
      content,
      content_type: 'markdown',
      excerpt: this.extractExcerpt(content),

      source_url: page.url,
      source_path: page.parent.page_id || page.parent.database_id || 'workspace',
      source_type: 'page',

      author: {
        id: page.created_by.id,
        name: 'Notion User',
      },

      external_created_at: page.created_time,
      external_updated_at: page.last_edited_time,
      synced_at: new Date().toISOString(),

      sync_hash: this.generateSyncHash({
        title,
        content,
        external_updated_at: page.last_edited_time,
      }),
      sync_status: 'synced',

      metadata: {
        icon: page.icon?.emoji || page.icon?.external?.url,
        parent_type: page.parent.type,
        parent_id: page.parent.page_id || page.parent.database_id,
      },
    };
  }
}
