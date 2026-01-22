/**
 * Connector Factory
 * Factory for creating and managing connector instances
 */

import { BaseConnector } from './base.connector';
import { ConnectorConfig, ConnectorType, ConnectorRegistration } from './types';

// Import implementations
import { ConfluenceConnector } from './implementations/confluence.connector';
import { SharePointConnector } from './implementations/sharepoint.connector';
import { NotionConnector } from './implementations/notion.connector';
import { GoogleDriveConnector } from './implementations/google-drive.connector';

/**
 * Connector registry with metadata for UI
 */
const connectorRegistry: Map<ConnectorType, {
  implementation: new (config: ConnectorConfig) => BaseConnector;
  registration: ConnectorRegistration;
}> = new Map();

// Register built-in connectors
connectorRegistry.set('confluence', {
  implementation: ConfluenceConnector,
  registration: {
    type: 'confluence',
    name: 'Confluence',
    description: 'Sync pages and spaces from Atlassian Confluence',
    icon: 'confluence',
    capabilities: {
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
    },
    requiredFields: [
      {
        key: 'base_url',
        label: 'Confluence URL',
        type: 'url',
        required: true,
        placeholder: 'https://your-domain.atlassian.net/wiki',
        helpText: 'Your Confluence Cloud or Server URL',
      },
      {
        key: 'username',
        label: 'Email',
        type: 'text',
        required: true,
        placeholder: 'user@company.com',
        helpText: 'Your Atlassian account email',
      },
      {
        key: 'api_key',
        label: 'API Token',
        type: 'password',
        required: true,
        helpText: 'Generate at https://id.atlassian.com/manage/api-tokens',
      },
      {
        key: 'space_keys',
        label: 'Space Keys',
        type: 'text',
        required: false,
        placeholder: 'HR,IT,DOCS (comma-separated)',
        helpText: 'Leave empty to sync all spaces',
      },
    ],
  },
});

connectorRegistry.set('sharepoint', {
  implementation: SharePointConnector,
  registration: {
    type: 'sharepoint',
    name: 'SharePoint',
    description: 'Sync documents and lists from Microsoft SharePoint',
    icon: 'sharepoint',
    capabilities: {
      supports_full_sync: true,
      supports_incremental_sync: true,
      supports_realtime_updates: false,
      supports_webhooks: true,
      supported_content_types: ['document', 'page', 'list_item'],
      supports_search: true,
      supports_permissions: true,
      supports_attachments: true,
      supports_comments: false,
      supports_versions: true,
      rate_limit_requests_per_minute: 120,
      max_items_per_request: 100,
    },
    requiredFields: [
      {
        key: 'site_url',
        label: 'SharePoint Site URL',
        type: 'url',
        required: true,
        placeholder: 'https://company.sharepoint.com/sites/intranet',
      },
      {
        key: 'client_id',
        label: 'Client ID',
        type: 'text',
        required: true,
        helpText: 'Azure AD App Registration Client ID',
      },
      {
        key: 'client_secret',
        label: 'Client Secret',
        type: 'password',
        required: true,
      },
      {
        key: 'tenant_id',
        label: 'Tenant ID',
        type: 'text',
        required: true,
      },
    ],
  },
});

connectorRegistry.set('notion', {
  implementation: NotionConnector,
  registration: {
    type: 'notion',
    name: 'Notion',
    description: 'Sync pages and databases from Notion',
    icon: 'notion',
    capabilities: {
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
    },
    requiredFields: [
      {
        key: 'api_key',
        label: 'Integration Token',
        type: 'password',
        required: true,
        helpText: 'Create at https://www.notion.so/my-integrations',
      },
      {
        key: 'root_page_id',
        label: 'Root Page ID',
        type: 'text',
        required: false,
        placeholder: 'Optional - sync specific page and children',
      },
    ],
  },
});

connectorRegistry.set('google_drive', {
  implementation: GoogleDriveConnector,
  registration: {
    type: 'google_drive',
    name: 'Google Drive',
    description: 'Sync documents from Google Drive and Shared Drives',
    icon: 'google-drive',
    capabilities: {
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
    },
    requiredFields: [
      {
        key: 'client_id',
        label: 'OAuth Client ID',
        type: 'text',
        required: true,
      },
      {
        key: 'client_secret',
        label: 'OAuth Client Secret',
        type: 'password',
        required: true,
      },
      {
        key: 'folder_id',
        label: 'Root Folder ID',
        type: 'text',
        required: false,
        placeholder: 'Leave empty to sync entire drive',
      },
    ],
  },
});

/**
 * Connector Factory Class
 */
export class ConnectorFactory {
  /**
   * Create a connector instance from config
   */
  static create(config: ConnectorConfig): BaseConnector {
    const registration = connectorRegistry.get(config.type);

    if (!registration) {
      throw new Error(`Unknown connector type: ${config.type}`);
    }

    return new registration.implementation(config);
  }

  /**
   * Get all available connector registrations
   */
  static getAvailableConnectors(): ConnectorRegistration[] {
    return Array.from(connectorRegistry.values()).map(r => r.registration);
  }

  /**
   * Get registration for a specific connector type
   */
  static getRegistration(type: ConnectorType): ConnectorRegistration | undefined {
    return connectorRegistry.get(type)?.registration;
  }

  /**
   * Check if a connector type is supported
   */
  static isSupported(type: ConnectorType): boolean {
    return connectorRegistry.has(type);
  }

  /**
   * Register a custom connector
   */
  static registerConnector(
    type: ConnectorType,
    implementation: new (config: ConnectorConfig) => BaseConnector,
    registration: ConnectorRegistration
  ): void {
    connectorRegistry.set(type, { implementation, registration });
  }
}

/**
 * Connector Manager - handles multiple connectors for an organization
 */
export class ConnectorManager {
  private connectors: Map<string, BaseConnector> = new Map();

  /**
   * Initialize a connector from config
   */
  async initializeConnector(config: ConnectorConfig): Promise<BaseConnector> {
    const connector = ConnectorFactory.create(config);
    this.connectors.set(config.id, connector);
    return connector;
  }

  /**
   * Get a connector by ID
   */
  getConnector(id: string): BaseConnector | undefined {
    return this.connectors.get(id);
  }

  /**
   * Remove a connector
   */
  removeConnector(id: string): boolean {
    return this.connectors.delete(id);
  }

  /**
   * Get all initialized connectors
   */
  getAllConnectors(): BaseConnector[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Test all connectors health
   */
  async healthCheckAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const [id, connector] of this.connectors) {
      try {
        const health = await connector.testConnection();
        results.set(id, health.status === 'healthy');
      } catch {
        results.set(id, false);
      }
    }

    return results;
  }

  /**
   * Sync all active connectors
   */
  async syncAll(incremental: boolean = true): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const [id, connector] of this.connectors) {
      if (connector.getStatus() !== 'active') continue;

      try {
        if (incremental) {
          await connector.incrementalSync();
        } else {
          await connector.fullSync();
        }
        results.set(id, true);
      } catch {
        results.set(id, false);
      }
    }

    return results;
  }
}
