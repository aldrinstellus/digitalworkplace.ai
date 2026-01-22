/**
 * SharePoint Connector
 * Syncs documents and lists from Microsoft SharePoint Online
 */

import { BaseConnector, ConnectorError } from '../base.connector';
import {
  ConnectorConfig,
  ConnectorItem,
  ConnectorCapabilities,
  ConnectorHealthCheck,
  ConnectorSearchParams,
  SyncResult,
  TokenRefreshResult,
} from '../types';

interface SharePointSite {
  id: string;
  name: string;
  displayName: string;
  webUrl: string;
}

interface SharePointDrive {
  id: string;
  name: string;
  driveType: string;
}

interface SharePointDriveItem {
  id: string;
  name: string;
  webUrl: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  size: number;
  file?: {
    mimeType: string;
    hashes?: {
      quickXorHash: string;
    };
  };
  folder?: {
    childCount: number;
  };
  createdBy?: {
    user?: {
      id: string;
      displayName: string;
      email?: string;
    };
  };
  lastModifiedBy?: {
    user?: {
      id: string;
      displayName: string;
    };
  };
  parentReference?: {
    path: string;
    driveId: string;
  };
  '@microsoft.graph.downloadUrl'?: string;
}

interface SharePointListItem {
  id: string;
  webUrl: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  fields: Record<string, unknown>;
}

interface GraphResponse<T> {
  value: T[];
  '@odata.nextLink'?: string;
  '@odata.deltaLink'?: string;
}

export class SharePointConnector extends BaseConnector {
  private siteUrl: string;
  private graphBaseUrl = 'https://graph.microsoft.com/v1.0';

  constructor(config: ConnectorConfig) {
    super(config);
    this.siteUrl = config.configuration.base_url || '';
  }

  getCapabilities(): ConnectorCapabilities {
    return {
      supports_full_sync: true,
      supports_incremental_sync: true,
      supports_realtime_updates: false,
      supports_webhooks: true,
      supported_content_types: ['document', 'page', 'list_item'],
      supports_search: true,
      supports_permissions: true,
      supports_attachments: false,
      supports_comments: false,
      supports_versions: true,
      rate_limit_requests_per_minute: 120,
      max_items_per_request: 100,
    };
  }

  async refreshTokens(): Promise<TokenRefreshResult | null> {
    const { auth_credentials, configuration } = this.config;

    if (!auth_credentials.refresh_token) {
      return null;
    }

    const tokenUrl = `https://login.microsoftonline.com/${configuration.tenant_id}/oauth2/v2.0/token`;

    const body = new URLSearchParams({
      client_id: configuration.client_id as string,
      client_secret: auth_credentials.password || '',
      refresh_token: auth_credentials.refresh_token,
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/.default',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new ConnectorError('Token refresh failed', 'TOKEN_REFRESH_FAILED', response.status);
    }

    const data = await response.json();

    // Update config with new tokens
    this.config.auth_credentials.access_token = data.access_token;
    if (data.refresh_token) {
      this.config.auth_credentials.refresh_token = data.refresh_token;
    }

    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
    this.config.auth_credentials.token_expires_at = expiresAt;

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: expiresAt,
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

      // Test auth by getting current user
      const meUrl = `${this.graphBaseUrl}/me`;
      const response = await fetch(meUrl, {
        headers: this.getAuthHeader(),
      });

      checks.connectivity = {
        status: 'pass',
        latency_ms: Date.now() - startTime,
      };

      if (!response.ok) {
        if (response.status === 401) {
          // Try refresh
          await this.refreshTokens();
          const retryResponse = await fetch(meUrl, {
            headers: this.getAuthHeader(),
          });
          if (!retryResponse.ok) {
            return {
              connector_id: this.config.id,
              status: 'unhealthy',
              timestamp,
              checks,
              recommendations: ['Authentication failed. Please re-authorize the connector.'],
            };
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      }

      checks.authentication = { status: 'pass' };

      // Test site access
      const siteResponse = await this.getSite();
      if (siteResponse) {
        checks.permissions = {
          status: 'pass',
          scopes: ['Sites.Read.All', 'Files.Read.All'],
        };
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
          'Unable to connect to SharePoint. Please verify your Azure AD app permissions.',
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
      // Get site
      const site = await this.getSite();
      if (!site) {
        throw new Error('Could not access SharePoint site');
      }

      // Get all drives
      const drives = await this.getDrives(site.id);

      for (const drive of drives) {
        // Get all items in drive
        const items = await this.getDriveItems(drive.id);
        totalDiscovered += items.length;

        for (const item of items) {
          if (item.folder) continue; // Skip folders

          try {
            const connectorItem = await this.convertDriveItemToItem(item, site);
            newItems++;
            // In real implementation, save to database
          } catch (err) {
            errors.push({
              external_id: item.id,
              title: item.name,
              error: err instanceof Error ? err.message : 'Unknown error',
            });
          }
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
    let deletedItems = 0;
    let newCursor: string | undefined;

    try {
      const site = await this.getSite();
      if (!site) {
        throw new Error('Could not access SharePoint site');
      }

      const drives = await this.getDrives(site.id);

      for (const drive of drives) {
        // Use delta query for incremental sync
        const deltaUrl = cursor
          ? cursor
          : `${this.graphBaseUrl}/drives/${drive.id}/root/delta`;

        let nextLink: string | undefined = deltaUrl;

        while (nextLink) {
          const response = await this.makeRequest<{
            value: Array<SharePointDriveItem & { deleted?: { state: string } }>;
            '@odata.nextLink'?: string;
            '@odata.deltaLink'?: string;
          }>(nextLink);

          totalDiscovered += response.value.length;

          for (const item of response.value) {
            if (item.deleted) {
              deletedItems++;
              continue;
            }

            if (item.folder) continue;

            try {
              const connectorItem = await this.convertDriveItemToItem(item, site);
              // Determine new vs updated based on created date
              const created = new Date(item.createdDateTime);
              const lastSync = this.config.last_sync_at
                ? new Date(this.config.last_sync_at)
                : new Date(0);

              if (created > lastSync) {
                newItems++;
              } else {
                updatedItems++;
              }
            } catch (err) {
              errors.push({
                external_id: item.id,
                title: item.name,
                error: err instanceof Error ? err.message : 'Unknown error',
              });
            }
          }

          nextLink = response['@odata.nextLink'];
          if (response['@odata.deltaLink']) {
            newCursor = response['@odata.deltaLink'];
          }
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
          deleted_items: deletedItems,
          failed_items: errors.length,
          unchanged_items: 0,
        },
        errors,
        cursor: newCursor,
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
      const [driveId, itemId] = externalId.split(':');
      const url = `${this.graphBaseUrl}/drives/${driveId}/items/${itemId}`;
      const item = await this.makeRequest<SharePointDriveItem>(url);
      const site = await this.getSite();
      return site ? this.convertDriveItemToItem(item, site) : null;
    } catch (error) {
      if (error instanceof ConnectorError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async search(params: ConnectorSearchParams): Promise<ConnectorItem[]> {
    const site = await this.getSite();
    if (!site) return [];

    const searchUrl = `${this.graphBaseUrl}/sites/${site.id}/drive/root/search(q='${encodeURIComponent(params.query)}')`;
    const response = await this.makeRequest<GraphResponse<SharePointDriveItem>>(searchUrl);

    const items: ConnectorItem[] = [];
    for (const item of response.value.slice(0, params.limit || 25)) {
      if (item.folder) continue;
      items.push(await this.convertDriveItemToItem(item, site));
    }

    return items;
  }

  // ==========================================
  // Private helper methods
  // ==========================================

  private async getSite(): Promise<SharePointSite | null> {
    try {
      // Parse site URL to get hostname and path
      const url = new URL(this.siteUrl);
      const sitePath = url.pathname.replace(/\/$/, '');

      const siteUrl = `${this.graphBaseUrl}/sites/${url.hostname}:${sitePath}`;
      return await this.makeRequest<SharePointSite>(siteUrl);
    } catch {
      return null;
    }
  }

  private async getDrives(siteId: string): Promise<SharePointDrive[]> {
    const url = `${this.graphBaseUrl}/sites/${siteId}/drives`;
    const response = await this.makeRequest<GraphResponse<SharePointDrive>>(url);
    return response.value;
  }

  private async getDriveItems(driveId: string): Promise<SharePointDriveItem[]> {
    const items: SharePointDriveItem[] = [];
    let nextLink: string | undefined = `${this.graphBaseUrl}/drives/${driveId}/root/children`;

    while (nextLink) {
      const response = await this.makeRequest<GraphResponse<SharePointDriveItem>>(nextLink);
      items.push(...response.value);

      // Recursively get children of folders
      for (const item of response.value) {
        if (item.folder && item.folder.childCount > 0) {
          const childItems = await this.getFolderItems(driveId, item.id);
          items.push(...childItems);
        }
      }

      nextLink = response['@odata.nextLink'];
    }

    return items;
  }

  private async getFolderItems(driveId: string, folderId: string): Promise<SharePointDriveItem[]> {
    const items: SharePointDriveItem[] = [];
    let nextLink: string | undefined = `${this.graphBaseUrl}/drives/${driveId}/items/${folderId}/children`;

    while (nextLink) {
      const response = await this.makeRequest<GraphResponse<SharePointDriveItem>>(nextLink);
      items.push(...response.value);

      // Recursive
      for (const item of response.value) {
        if (item.folder && item.folder.childCount > 0) {
          const childItems = await this.getFolderItems(driveId, item.id);
          items.push(...childItems);
        }
      }

      nextLink = response['@odata.nextLink'];
    }

    return items;
  }

  private async convertDriveItemToItem(
    item: SharePointDriveItem,
    site: SharePointSite
  ): Promise<ConnectorItem> {
    // Determine content type
    let contentType: 'html' | 'markdown' | 'text' | 'pdf' | 'doc' = 'text';
    const mimeType = item.file?.mimeType || '';

    if (mimeType.includes('pdf')) contentType = 'pdf';
    else if (mimeType.includes('word') || mimeType.includes('document')) contentType = 'doc';
    else if (mimeType.includes('html')) contentType = 'html';

    // For documents, we would normally extract text content
    // For now, use the filename as content placeholder
    const content = `Document: ${item.name}`;

    return {
      id: `sharepoint-${item.parentReference?.driveId}:${item.id}`,
      connector_id: this.config.id,
      external_id: `${item.parentReference?.driveId}:${item.id}`,

      title: item.name,
      content,
      content_type: contentType,
      excerpt: `SharePoint document: ${item.name}`,

      source_url: item.webUrl,
      source_path: item.parentReference?.path || '/',
      source_type: 'document',

      author: item.createdBy?.user
        ? {
            id: item.createdBy.user.id,
            name: item.createdBy.user.displayName,
            email: item.createdBy.user.email,
          }
        : undefined,

      external_created_at: item.createdDateTime,
      external_updated_at: item.lastModifiedDateTime,
      synced_at: new Date().toISOString(),

      sync_hash: this.generateSyncHash({
        title: item.name,
        content,
        external_updated_at: item.lastModifiedDateTime,
      }),
      sync_status: 'synced',

      metadata: {
        site_name: site.displayName,
        mime_type: mimeType,
        size_bytes: item.size,
        hash: item.file?.hashes?.quickXorHash,
      },
    };
  }
}
