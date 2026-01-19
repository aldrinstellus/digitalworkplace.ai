// SharePoint Integration Adapter for Chat Core IQ Chatbot
// Uses Microsoft Graph API to access SharePoint files
// ITN 2025-20 Section 3.2.5 (Optional)

export interface SharePointConfig {
  enabled: boolean;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  siteUrl: string; // e.g., "cityofdoral.sharepoint.com"
  siteName: string; // e.g., "DoralDocs"
  libraryName: string; // e.g., "Documents"
}

export interface SharePointFile {
  id: string;
  name: string;
  path: string;
  webUrl: string;
  size: number;
  mimeType: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  content?: string;
}

export interface SharePointFolder {
  id: string;
  name: string;
  path: string;
  webUrl: string;
  childCount: number;
}

export interface SharePointSearchResult {
  id: string;
  name: string;
  webUrl: string;
  snippet: string;
  relevanceScore: number;
}

// Microsoft Graph API Client for SharePoint
export class SharePointAdapter {
  private config: SharePointConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private siteId: string | null = null;
  private driveId: string | null = null;

  constructor(config: SharePointConfig) {
    this.config = config;
  }

  isEnabled(): boolean {
    return this.config.enabled && !!this.config.tenantId && !!this.config.clientId;
  }

  private async authenticate(): Promise<boolean> {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return true;
    }

    try {
      const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        scope: 'https://graph.microsoft.com/.default',
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!response.ok) {
        console.error('[SharePoint] Authentication failed:', response.status);
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = new Date(Date.now() + (data.expires_in - 300) * 1000);
      return true;
    } catch (error) {
      console.error('[SharePoint] Authentication error:', error);
      return false;
    }
  }

  private async getSiteId(): Promise<string | null> {
    if (this.siteId) return this.siteId;

    if (!await this.authenticate()) return null;

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/sites/${this.config.siteUrl}:/sites/${this.config.siteName}`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` },
        }
      );

      if (!response.ok) {
        console.error('[SharePoint] Get site ID failed:', response.status);
        return null;
      }

      const data = await response.json();
      this.siteId = data.id;
      return this.siteId;
    } catch (error) {
      console.error('[SharePoint] Get site ID error:', error);
      return null;
    }
  }

  private async getDriveId(): Promise<string | null> {
    if (this.driveId) return this.driveId;

    const siteId = await this.getSiteId();
    if (!siteId) return null;

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/sites/${siteId}/drives`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` },
        }
      );

      if (!response.ok) {
        console.error('[SharePoint] Get drives failed:', response.status);
        return null;
      }

      const data = await response.json();
      // Find the document library by name
      const library = data.value.find(
        (d: { name: string }) => d.name === this.config.libraryName
      );

      if (library) {
        this.driveId = library.id;
        return this.driveId;
      }

      // Default to first drive if library not found
      if (data.value.length > 0) {
        this.driveId = data.value[0].id;
        return this.driveId;
      }

      return null;
    } catch (error) {
      console.error('[SharePoint] Get drive ID error:', error);
      return null;
    }
  }

  // List files in a folder
  async listFiles(folderPath: string = ''): Promise<SharePointFile[]> {
    if (!this.isEnabled()) return [];

    const driveId = await this.getDriveId();
    if (!driveId) return [];

    try {
      const pathSegment = folderPath ? `:/${folderPath}:/children` : '/root/children';
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${driveId}${pathSegment}`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` },
        }
      );

      if (!response.ok) {
        console.error('[SharePoint] List files failed:', response.status);
        return [];
      }

      const data = await response.json();
      return data.value
        .filter((item: { file?: object }) => item.file) // Only files, not folders
        .map((item: {
          id: string;
          name: string;
          parentReference?: { path?: string };
          webUrl: string;
          size: number;
          file?: { mimeType: string };
          createdDateTime: string;
          lastModifiedDateTime: string;
        }) => ({
          id: item.id,
          name: item.name,
          path: item.parentReference?.path || '',
          webUrl: item.webUrl,
          size: item.size,
          mimeType: item.file?.mimeType || 'application/octet-stream',
          createdDateTime: item.createdDateTime,
          lastModifiedDateTime: item.lastModifiedDateTime,
        }));
    } catch (error) {
      console.error('[SharePoint] List files error:', error);
      return [];
    }
  }

  // List folders
  async listFolders(folderPath: string = ''): Promise<SharePointFolder[]> {
    if (!this.isEnabled()) return [];

    const driveId = await this.getDriveId();
    if (!driveId) return [];

    try {
      const pathSegment = folderPath ? `:/${folderPath}:/children` : '/root/children';
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${driveId}${pathSegment}`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` },
        }
      );

      if (!response.ok) {
        console.error('[SharePoint] List folders failed:', response.status);
        return [];
      }

      const data = await response.json();
      return data.value
        .filter((item: { folder?: object }) => item.folder) // Only folders
        .map((item: {
          id: string;
          name: string;
          parentReference?: { path?: string };
          webUrl: string;
          folder?: { childCount: number };
        }) => ({
          id: item.id,
          name: item.name,
          path: item.parentReference?.path || '',
          webUrl: item.webUrl,
          childCount: item.folder?.childCount || 0,
        }));
    } catch (error) {
      console.error('[SharePoint] List folders error:', error);
      return [];
    }
  }

  // Download file content
  async downloadFile(fileId: string): Promise<Buffer | null> {
    if (!this.isEnabled()) return null;

    const driveId = await this.getDriveId();
    if (!driveId) return null;

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/content`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` },
        }
      );

      if (!response.ok) {
        console.error('[SharePoint] Download file failed:', response.status);
        return null;
      }

      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      console.error('[SharePoint] Download file error:', error);
      return null;
    }
  }

  // Get file metadata
  async getFile(fileId: string): Promise<SharePointFile | null> {
    if (!this.isEnabled()) return null;

    const driveId = await this.getDriveId();
    if (!driveId) return null;

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` },
        }
      );

      if (!response.ok) {
        console.error('[SharePoint] Get file failed:', response.status);
        return null;
      }

      const item = await response.json();
      return {
        id: item.id,
        name: item.name,
        path: item.parentReference?.path || '',
        webUrl: item.webUrl,
        size: item.size,
        mimeType: item.file?.mimeType || 'application/octet-stream',
        createdDateTime: item.createdDateTime,
        lastModifiedDateTime: item.lastModifiedDateTime,
      };
    } catch (error) {
      console.error('[SharePoint] Get file error:', error);
      return null;
    }
  }

  // Search files in SharePoint
  async searchFiles(query: string, limit: number = 25): Promise<SharePointSearchResult[]> {
    if (!this.isEnabled()) return [];

    if (!await this.authenticate()) return [];

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/search/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [{
              entityTypes: ['driveItem'],
              query: { queryString: query },
              from: 0,
              size: limit,
            }],
          }),
        }
      );

      if (!response.ok) {
        console.error('[SharePoint] Search failed:', response.status);
        return [];
      }

      const data = await response.json();
      const hits = data.value?.[0]?.hitsContainers?.[0]?.hits || [];

      return hits.map((hit: {
        resource: { id: string; name: string; webUrl: string };
        summary?: string;
        rank?: number;
      }) => ({
        id: hit.resource.id,
        name: hit.resource.name,
        webUrl: hit.resource.webUrl,
        snippet: hit.summary || '',
        relevanceScore: hit.rank || 0,
      }));
    } catch (error) {
      console.error('[SharePoint] Search error:', error);
      return [];
    }
  }

  // Get supported file types for parsing
  getSupportedFileTypes(): string[] {
    return [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/plain',
      'text/html',
    ];
  }

  // Check if file type is supported for parsing
  isFileTypeSupported(mimeType: string): boolean {
    return this.getSupportedFileTypes().includes(mimeType);
  }

  // Test connection to SharePoint
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isEnabled()) {
      return { success: false, message: 'SharePoint integration is not enabled' };
    }

    const authenticated = await this.authenticate();
    if (!authenticated) {
      return { success: false, message: 'Authentication failed' };
    }

    const siteId = await this.getSiteId();
    if (!siteId) {
      return { success: false, message: 'Could not access SharePoint site' };
    }

    const driveId = await this.getDriveId();
    if (!driveId) {
      return { success: false, message: 'Could not access document library' };
    }

    return { success: true, message: 'Successfully connected to SharePoint' };
  }
}

// Factory function to create SharePoint adapter from environment variables
export function createSharePointAdapter(): SharePointAdapter {
  const config: SharePointConfig = {
    enabled: process.env.SHAREPOINT_ENABLED === 'true',
    tenantId: process.env.SHAREPOINT_TENANT_ID || '',
    clientId: process.env.SHAREPOINT_CLIENT_ID || '',
    clientSecret: process.env.SHAREPOINT_CLIENT_SECRET || '',
    siteUrl: process.env.SHAREPOINT_SITE_URL || '',
    siteName: process.env.SHAREPOINT_SITE_NAME || '',
    libraryName: process.env.SHAREPOINT_LIBRARY_NAME || 'Documents',
  };

  return new SharePointAdapter(config);
}

// Export singleton for app-wide use
let sharePointAdapterInstance: SharePointAdapter | null = null;

export function getSharePointAdapter(): SharePointAdapter {
  if (!sharePointAdapterInstance) {
    sharePointAdapterInstance = createSharePointAdapter();
  }
  return sharePointAdapterInstance;
}
