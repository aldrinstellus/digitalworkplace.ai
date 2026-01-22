/**
 * Google Drive Connector
 * Syncs documents from Google Drive and Shared Drives
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

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  parents?: string[];
  trashed: boolean;
  owners?: Array<{
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  }>;
  lastModifyingUser?: {
    displayName: string;
    emailAddress: string;
  };
  exportLinks?: Record<string, string>;
  md5Checksum?: string;
}

interface GoogleDriveFileList {
  files: GoogleDriveFile[];
  nextPageToken?: string;
}

interface GoogleDriveChange {
  kind: string;
  type: string;
  fileId?: string;
  removed?: boolean;
  file?: GoogleDriveFile;
}

interface GoogleDriveChanges {
  changes: GoogleDriveChange[];
  nextPageToken?: string;
  newStartPageToken?: string;
}

// MIME types we can extract text from
const EXPORTABLE_MIME_TYPES: Record<string, string> = {
  'application/vnd.google-apps.document': 'text/plain',
  'application/vnd.google-apps.spreadsheet': 'text/csv',
  'application/vnd.google-apps.presentation': 'text/plain',
};

const SUPPORTED_MIME_TYPES = [
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.google-apps.presentation',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/html',
];

export class GoogleDriveConnector extends BaseConnector {
  private apiBaseUrl = 'https://www.googleapis.com/drive/v3';
  private uploadUrl = 'https://www.googleapis.com/upload/drive/v3';

  constructor(config: ConnectorConfig) {
    super(config);
  }

  getCapabilities(): ConnectorCapabilities {
    return {
      supports_full_sync: true,
      supports_incremental_sync: true,
      supports_realtime_updates: false,
      supports_webhooks: true,
      supported_content_types: ['document', 'spreadsheet', 'presentation', 'pdf'],
      supports_search: true,
      supports_permissions: true,
      supports_attachments: false,
      supports_comments: true,
      supports_versions: true,
      rate_limit_requests_per_minute: 100,
      max_items_per_request: 100,
    };
  }

  async refreshTokens(): Promise<TokenRefreshResult | null> {
    const { auth_credentials, configuration } = this.config;

    if (!auth_credentials.refresh_token) {
      return null;
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';

    const body = new URLSearchParams({
      client_id: configuration.client_id as string,
      client_secret: auth_credentials.password || '',
      refresh_token: auth_credentials.refresh_token,
      grant_type: 'refresh_token',
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

    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
    this.config.auth_credentials.token_expires_at = expiresAt;

    return {
      access_token: data.access_token,
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

      // Test auth by getting about info
      const response = await fetch(`${this.apiBaseUrl}/about?fields=user`, {
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
          const retryResponse = await fetch(`${this.apiBaseUrl}/about?fields=user`, {
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

      // Test list files capability
      const listResponse = await fetch(
        `${this.apiBaseUrl}/files?pageSize=1`,
        { headers: this.getAuthHeader() }
      );

      if (listResponse.ok) {
        checks.permissions = {
          status: 'pass',
          scopes: ['drive.readonly'],
        };
      }

      // Check storage quota
      const quotaResponse = await fetch(
        `${this.apiBaseUrl}/about?fields=storageQuota`,
        { headers: this.getAuthHeader() }
      );

      if (quotaResponse.ok) {
        const quota = await quotaResponse.json();
        const usage = parseInt(quota.storageQuota?.usage || '0');
        const limit = parseInt(quota.storageQuota?.limit || '0');

        if (limit > 0) {
          const percentUsed = (usage / limit) * 100;
          checks.quota = {
            status: percentUsed > 90 ? 'warn' : 'pass',
            remaining: limit - usage,
            limit,
          };
        }
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
          'Unable to connect to Google Drive. Please verify your OAuth credentials.',
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
      // Build query for supported files
      const mimeQuery = SUPPORTED_MIME_TYPES.map(
        m => `mimeType='${m}'`
      ).join(' or ');

      let pageToken: string | undefined;
      let query = `(${mimeQuery}) and trashed=false`;

      // If folder specified, limit to that folder
      const folderId = this.config.configuration.folder_id;
      if (folderId) {
        query += ` and '${folderId}' in parents`;
      }

      do {
        const files = await this.listFiles(query, pageToken);
        totalDiscovered += files.files.length;

        for (const file of files.files) {
          try {
            const item = await this.convertFileToItem(file);
            newItems++;
            // In real implementation, save to database
          } catch (err) {
            errors.push({
              external_id: file.id,
              title: file.name,
              error: err instanceof Error ? err.message : 'Unknown error',
            });
          }
        }

        pageToken = files.nextPageToken;
      } while (pageToken);

      // Get start page token for future incremental syncs
      const startPageToken = await this.getStartPageToken();

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
        cursor: startPageToken,
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
      const pageToken = cursor || this.config.sync_cursor || (await this.getStartPageToken());

      const changes = await this.getChanges(pageToken);
      totalDiscovered = changes.changes.length;

      for (const change of changes.changes) {
        if (!change.fileId) continue;

        if (change.removed || change.file?.trashed) {
          deletedItems++;
          continue;
        }

        if (!change.file) continue;

        // Check if supported type
        if (!SUPPORTED_MIME_TYPES.includes(change.file.mimeType)) continue;

        try {
          const item = await this.convertFileToItem(change.file);

          // Determine new vs updated
          const createdTime = new Date(change.file.createdTime);
          const lastSync = this.config.last_sync_at
            ? new Date(this.config.last_sync_at)
            : new Date(0);

          if (createdTime > lastSync) {
            newItems++;
          } else {
            updatedItems++;
          }
        } catch (err) {
          errors.push({
            external_id: change.fileId,
            title: change.file.name,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      newCursor = changes.newStartPageToken;

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
        has_more: !!changes.nextPageToken,
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
      const fields =
        'id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size,parents,trashed,owners,lastModifyingUser,exportLinks,md5Checksum';
      const file = await this.makeRequest<GoogleDriveFile>(
        `${this.apiBaseUrl}/files/${externalId}?fields=${fields}`
      );

      if (file.trashed) return null;

      return this.convertFileToItem(file);
    } catch (error) {
      if (error instanceof ConnectorError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async search(params: ConnectorSearchParams): Promise<ConnectorItem[]> {
    const queryParts: string[] = [];

    // Full text search
    if (params.query) {
      queryParts.push(`fullText contains '${params.query.replace(/'/g, "\\'")}'`);
    }

    // MIME type filter
    if (params.content_types?.length) {
      const mimeQuery = params.content_types
        .map(t => `mimeType='${t}'`)
        .join(' or ');
      queryParts.push(`(${mimeQuery})`);
    } else {
      const mimeQuery = SUPPORTED_MIME_TYPES.map(m => `mimeType='${m}'`).join(' or ');
      queryParts.push(`(${mimeQuery})`);
    }

    queryParts.push('trashed=false');

    // Date filter
    if (params.updated_after) {
      queryParts.push(`modifiedTime > '${params.updated_after}'`);
    }

    const query = queryParts.join(' and ');
    const files = await this.listFiles(query, undefined, params.limit || 25);

    const items: ConnectorItem[] = [];
    for (const file of files.files) {
      try {
        items.push(await this.convertFileToItem(file));
      } catch {
        // Skip failed files
      }
    }

    return items;
  }

  // ==========================================
  // Private helper methods
  // ==========================================

  private async listFiles(
    query: string,
    pageToken?: string,
    pageSize: number = 100
  ): Promise<GoogleDriveFileList> {
    const url = new URL(`${this.apiBaseUrl}/files`);
    url.searchParams.set('q', query);
    url.searchParams.set('pageSize', String(pageSize));
    url.searchParams.set(
      'fields',
      'nextPageToken,files(id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size,parents,trashed,owners,lastModifyingUser,exportLinks,md5Checksum)'
    );

    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    return this.makeRequest<GoogleDriveFileList>(url.toString());
  }

  private async getStartPageToken(): Promise<string> {
    const response = await this.makeRequest<{ startPageToken: string }>(
      `${this.apiBaseUrl}/changes/startPageToken`
    );
    return response.startPageToken;
  }

  private async getChanges(pageToken: string): Promise<GoogleDriveChanges> {
    const url = new URL(`${this.apiBaseUrl}/changes`);
    url.searchParams.set('pageToken', pageToken);
    url.searchParams.set('pageSize', '100');
    url.searchParams.set(
      'fields',
      'nextPageToken,newStartPageToken,changes(kind,type,fileId,removed,file(id,name,mimeType,webViewLink,createdTime,modifiedTime,size,trashed,owners,lastModifyingUser))'
    );

    return this.makeRequest<GoogleDriveChanges>(url.toString());
  }

  private async getFileContent(file: GoogleDriveFile): Promise<string> {
    // Check if it's a Google Docs type that can be exported
    const exportMimeType = EXPORTABLE_MIME_TYPES[file.mimeType];

    if (exportMimeType) {
      // Export Google Docs file
      const url = `${this.apiBaseUrl}/files/${file.id}/export?mimeType=${encodeURIComponent(exportMimeType)}`;
      const response = await fetch(url, { headers: this.getAuthHeader() });

      if (!response.ok) {
        throw new ConnectorError(
          'Failed to export file content',
          'EXPORT_FAILED',
          response.status
        );
      }

      return response.text();
    }

    // For text-based files, download directly
    if (
      file.mimeType.startsWith('text/') ||
      file.mimeType === 'application/json'
    ) {
      const url = `${this.apiBaseUrl}/files/${file.id}?alt=media`;
      const response = await fetch(url, { headers: this.getAuthHeader() });

      if (!response.ok) {
        throw new ConnectorError(
          'Failed to download file content',
          'DOWNLOAD_FAILED',
          response.status
        );
      }

      return response.text();
    }

    // For other files (PDF, etc.), return placeholder
    return `[File: ${file.name}]`;
  }

  private async convertFileToItem(file: GoogleDriveFile): Promise<ConnectorItem> {
    // Determine content type
    let contentType: 'html' | 'markdown' | 'text' | 'pdf' | 'doc' = 'text';

    if (file.mimeType.includes('pdf')) {
      contentType = 'pdf';
    } else if (
      file.mimeType.includes('word') ||
      file.mimeType === 'application/vnd.google-apps.document'
    ) {
      contentType = 'doc';
    } else if (file.mimeType.includes('html')) {
      contentType = 'html';
    }

    // Try to get content for supported types
    let content = `Document: ${file.name}`;
    try {
      content = await this.getFileContent(file);
    } catch {
      // Use placeholder if content extraction fails
    }

    return {
      id: `gdrive-${file.id}`,
      connector_id: this.config.id,
      external_id: file.id,

      title: file.name,
      content,
      content_type: contentType,
      excerpt: this.extractExcerpt(content),

      source_url: file.webViewLink || file.webContentLink,
      source_path: file.parents?.[0] || '/',
      source_type: file.mimeType,

      author: file.owners?.[0]
        ? {
            id: file.owners[0].emailAddress,
            name: file.owners[0].displayName,
            email: file.owners[0].emailAddress,
            avatar_url: file.owners[0].photoLink,
          }
        : undefined,

      external_created_at: file.createdTime,
      external_updated_at: file.modifiedTime,
      synced_at: new Date().toISOString(),

      sync_hash: this.generateSyncHash({
        title: file.name,
        content,
        external_updated_at: file.modifiedTime,
        metadata: { md5: file.md5Checksum },
      }),
      sync_status: 'synced',

      metadata: {
        mime_type: file.mimeType,
        size_bytes: file.size ? parseInt(file.size) : undefined,
        md5_checksum: file.md5Checksum,
        last_modified_by: file.lastModifyingUser?.displayName,
      },
    };
  }
}
