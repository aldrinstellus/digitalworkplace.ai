/**
 * Confluence Connector
 * Syncs pages and spaces from Atlassian Confluence Cloud/Server
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

interface ConfluenceSpace {
  id: number;
  key: string;
  name: string;
  type: string;
  status: string;
  _links: {
    webui: string;
  };
}

interface ConfluencePage {
  id: string;
  type: string;
  status: string;
  title: string;
  space: {
    key: string;
    name: string;
  };
  history: {
    createdBy: {
      accountId: string;
      displayName: string;
      email?: string;
      profilePicture?: {
        path: string;
      };
    };
    createdDate: string;
    lastUpdated: {
      when: string;
      by: {
        accountId: string;
        displayName: string;
      };
    };
  };
  body?: {
    storage?: {
      value: string;
    };
    view?: {
      value: string;
    };
  };
  _links: {
    webui: string;
    self: string;
  };
}

interface ConfluenceSearchResult {
  results: ConfluencePage[];
  start: number;
  limit: number;
  size: number;
  _links: {
    next?: string;
  };
}

export class ConfluenceConnector extends BaseConnector {
  private baseUrl: string;

  constructor(config: ConnectorConfig) {
    super(config);
    this.baseUrl = config.configuration.base_url || '';
  }

  getCapabilities(): ConnectorCapabilities {
    return {
      supports_full_sync: true,
      supports_incremental_sync: true,
      supports_realtime_updates: false,
      supports_webhooks: true,
      supported_content_types: ['page', 'blogpost', 'attachment'],
      supports_search: true,
      supports_permissions: true,
      supports_attachments: true,
      supports_comments: true,
      supports_versions: true,
      rate_limit_requests_per_minute: 60,
      max_items_per_request: 100,
    };
  }

  protected getAuthHeader(): Record<string, string> {
    const { auth_credentials } = this.config;
    const encoded = Buffer.from(
      `${auth_credentials.username}:${auth_credentials.api_key}`
    ).toString('base64');
    return { Authorization: `Basic ${encoded}` };
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

      // Test connectivity and auth by fetching current user
      const response = await fetch(`${this.baseUrl}/rest/api/user/current`, {
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
            recommendations: ['Invalid API credentials. Please check your email and API token.'],
          };
        }
        throw new Error(`HTTP ${response.status}`);
      }

      checks.authentication = { status: 'pass' };

      // Test permissions by fetching spaces
      const spacesResponse = await fetch(
        `${this.baseUrl}/rest/api/space?limit=1`,
        { headers: this.getAuthHeader() }
      );

      if (spacesResponse.ok) {
        checks.permissions = { status: 'pass', scopes: ['read:confluence-content'] };
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
          'Unable to connect to Confluence. Please check your URL and network connectivity.',
        ],
      };
    }
  }

  async fullSync(): Promise<SyncResult> {
    const startTime = new Date();
    const errors: SyncResult['errors'] = [];
    let totalDiscovered = 0;
    let newItems = 0;
    let updatedItems = 0;

    try {
      // Get all spaces or specified spaces
      const spaces = await this.getSpaces();

      for (const space of spaces) {
        // Fetch all pages in space
        let start = 0;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
          const pages = await this.getSpacePages(space.key, start, limit);
          totalDiscovered += pages.results.length;

          for (const page of pages.results) {
            try {
              const item = await this.convertPageToItem(page);
              // In a real implementation, save to database here
              newItems++;
            } catch (err) {
              errors.push({
                external_id: page.id,
                title: page.title,
                error: err instanceof Error ? err.message : 'Unknown error',
              });
            }
          }

          hasMore = !!pages._links.next;
          start += limit;
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
          total_discovered: totalDiscovered,
          new_items: newItems,
          updated_items: updatedItems,
          deleted_items: 0,
          failed_items: errors.length,
          unchanged_items: 0,
        },
        errors: [
          ...errors,
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
      // Use CQL to find recently modified content
      const lastSync = cursor || this.config.last_sync_at || new Date(0).toISOString();
      const lastSyncDate = new Date(lastSync);

      // Format date for CQL
      const cqlDate = lastSyncDate.toISOString().split('T')[0];

      const searchUrl = new URL(`${this.baseUrl}/rest/api/content/search`);
      searchUrl.searchParams.set('cql', `lastModified >= "${cqlDate}" order by lastModified asc`);
      searchUrl.searchParams.set('expand', 'body.storage,history,space');
      searchUrl.searchParams.set('limit', '100');

      const response = await this.makeRequest<ConfluenceSearchResult>(searchUrl.toString());
      totalDiscovered = response.results.length;

      for (const page of response.results) {
        try {
          const item = await this.convertPageToItem(page);
          // Determine if new or updated based on created date
          const createdDate = new Date(page.history.createdDate);
          if (createdDate > lastSyncDate) {
            newItems++;
          } else {
            updatedItems++;
          }
        } catch (err) {
          errors.push({
            external_id: page.id,
            title: page.title,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
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
        has_more: !!response._links.next,
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
      const url = `${this.baseUrl}/rest/api/content/${externalId}?expand=body.storage,history,space`;
      const page = await this.makeRequest<ConfluencePage>(url);
      return this.convertPageToItem(page);
    } catch (error) {
      if (error instanceof ConnectorError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async search(params: ConnectorSearchParams): Promise<ConnectorItem[]> {
    const cqlParts: string[] = [];

    // Text search
    if (params.query) {
      cqlParts.push(`text ~ "${params.query}"`);
    }

    // Content type filter
    if (params.content_types?.length) {
      const types = params.content_types.map(t => `type = "${t}"`).join(' or ');
      cqlParts.push(`(${types})`);
    }

    // Date filters
    if (params.updated_after) {
      cqlParts.push(`lastModified >= "${params.updated_after.split('T')[0]}"`);
    }

    // Space filter
    if (params.path_prefix) {
      cqlParts.push(`space.key = "${params.path_prefix}"`);
    }

    const cql = cqlParts.join(' and ') || 'type = page';

    const searchUrl = new URL(`${this.baseUrl}/rest/api/content/search`);
    searchUrl.searchParams.set('cql', cql);
    searchUrl.searchParams.set('expand', 'body.storage,history,space');
    searchUrl.searchParams.set('limit', String(params.limit || 25));
    searchUrl.searchParams.set('start', String(params.offset || 0));

    const response = await this.makeRequest<ConfluenceSearchResult>(searchUrl.toString());

    const items: ConnectorItem[] = [];
    for (const page of response.results) {
      items.push(await this.convertPageToItem(page));
    }

    return items;
  }

  // ==========================================
  // Private helper methods
  // ==========================================

  private async getSpaces(): Promise<ConfluenceSpace[]> {
    const configSpaceKeys = this.config.configuration.include_patterns;

    if (configSpaceKeys?.length) {
      // Fetch specific spaces
      const spaces: ConfluenceSpace[] = [];
      for (const key of configSpaceKeys) {
        try {
          const space = await this.makeRequest<ConfluenceSpace>(
            `${this.baseUrl}/rest/api/space/${key}`
          );
          spaces.push(space);
        } catch {
          // Skip spaces that don't exist or we don't have access to
        }
      }
      return spaces;
    }

    // Fetch all spaces
    const allSpaces: ConfluenceSpace[] = [];
    let start = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await this.makeRequest<{
        results: ConfluenceSpace[];
        _links: { next?: string };
      }>(`${this.baseUrl}/rest/api/space?start=${start}&limit=${limit}`);

      allSpaces.push(...response.results);
      hasMore = !!response._links.next;
      start += limit;
    }

    return allSpaces;
  }

  private async getSpacePages(
    spaceKey: string,
    start: number,
    limit: number
  ): Promise<ConfluenceSearchResult> {
    const url = new URL(`${this.baseUrl}/rest/api/content`);
    url.searchParams.set('spaceKey', spaceKey);
    url.searchParams.set('type', 'page');
    url.searchParams.set('expand', 'body.storage,history');
    url.searchParams.set('start', String(start));
    url.searchParams.set('limit', String(limit));

    return this.makeRequest<ConfluenceSearchResult>(url.toString());
  }

  private async convertPageToItem(page: ConfluencePage): Promise<ConnectorItem> {
    const content = page.body?.storage?.value || page.body?.view?.value || '';

    return {
      id: `confluence-${page.id}`,
      connector_id: this.config.id,
      external_id: page.id,

      title: page.title,
      content: content,
      content_type: 'html',
      excerpt: this.extractExcerpt(content),

      source_url: `${this.baseUrl}${page._links.webui}`,
      source_path: `${page.space.key}/${page.title}`,
      source_type: page.type,

      author: {
        id: page.history.createdBy.accountId,
        name: page.history.createdBy.displayName,
        email: page.history.createdBy.email,
        avatar_url: page.history.createdBy.profilePicture?.path
          ? `${this.baseUrl}${page.history.createdBy.profilePicture.path}`
          : undefined,
      },

      external_created_at: page.history.createdDate,
      external_updated_at: page.history.lastUpdated.when,
      synced_at: new Date().toISOString(),

      sync_hash: this.generateSyncHash({
        title: page.title,
        content,
        external_updated_at: page.history.lastUpdated.when,
      }),
      sync_status: 'synced',

      metadata: {
        space_key: page.space.key,
        space_name: page.space.name,
        status: page.status,
      },

      tags: [page.space.key],
    };
  }
}
