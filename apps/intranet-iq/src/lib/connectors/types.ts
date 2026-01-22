/**
 * Connector Framework Types
 * Type definitions for external knowledge source integrations
 */

// Supported connector types
export type ConnectorType =
  | 'confluence'
  | 'sharepoint'
  | 'notion'
  | 'google_drive'
  | 'jira'
  | 'slack'
  | 'github'
  | 'zendesk'
  | 'servicenow'
  | 'custom';

// Connector status
export type ConnectorStatus = 'active' | 'inactive' | 'error' | 'syncing' | 'pending';

// Authentication types
export type AuthType = 'oauth2' | 'api_key' | 'basic' | 'bearer' | 'custom';

// Sync frequency options
export type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';

/**
 * Base connector configuration stored in database
 */
export interface ConnectorConfig {
  id: string;
  name: string;
  type: ConnectorType;
  status: ConnectorStatus;
  organization_id: string;
  kb_space_id?: string;

  // Authentication
  auth_type: AuthType;
  auth_credentials: {
    // OAuth2
    access_token?: string;
    refresh_token?: string;
    token_expires_at?: string;
    // API Key
    api_key?: string;
    // Basic Auth
    username?: string;
    password?: string;
    // Custom
    custom_headers?: Record<string, string>;
  };

  // Configuration
  configuration: {
    base_url?: string;
    workspace_id?: string;
    site_id?: string;
    folder_id?: string;
    project_key?: string;
    include_patterns?: string[];
    exclude_patterns?: string[];
    content_types?: string[];
    max_depth?: number;
    batch_size?: number;
    // OAuth2 configuration
    client_id?: string;
    client_secret?: string;
    redirect_uri?: string;
    // SharePoint specific
    tenant_id?: string;
    drive_id?: string;
  };

  // Sync settings
  sync_frequency: SyncFrequency;
  last_sync_at?: string;
  next_sync_at?: string;
  sync_cursor?: string;
  sync_stats?: {
    total_items: number;
    synced_items: number;
    failed_items: number;
    last_duration_ms: number;
  };

  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
}

/**
 * Item from external connector to be synced to knowledge base
 */
export interface ConnectorItem {
  id: string;
  connector_id: string;
  external_id: string;
  kb_item_id?: string;

  // Content
  title: string;
  content: string;
  content_type: 'html' | 'markdown' | 'text' | 'pdf' | 'doc';
  excerpt?: string;

  // Source metadata
  source_url?: string;
  source_path?: string;
  source_type?: string;
  author?: {
    id: string;
    name: string;
    email?: string;
    avatar_url?: string;
  };

  // Timestamps
  external_created_at?: string;
  external_updated_at?: string;
  synced_at: string;

  // Sync tracking
  sync_hash: string;
  sync_status: 'pending' | 'synced' | 'failed' | 'deleted';
  sync_error?: string;

  // Additional metadata
  metadata: Record<string, unknown>;
  tags?: string[];
  permissions?: {
    public: boolean;
    allowed_users?: string[];
    allowed_groups?: string[];
  };
}

/**
 * Sync operation result
 */
export interface SyncResult {
  connector_id: string;
  status: 'success' | 'partial' | 'failed';
  started_at: string;
  completed_at: string;
  duration_ms: number;

  stats: {
    total_discovered: number;
    new_items: number;
    updated_items: number;
    deleted_items: number;
    failed_items: number;
    unchanged_items: number;
  };

  errors: Array<{
    external_id: string;
    title?: string;
    error: string;
    code?: string;
  }>;

  cursor?: string;
  has_more: boolean;
}

/**
 * Connector capabilities
 */
export interface ConnectorCapabilities {
  // Content capabilities
  supports_full_sync: boolean;
  supports_incremental_sync: boolean;
  supports_realtime_updates: boolean;
  supports_webhooks: boolean;

  // Content types
  supported_content_types: string[];

  // Features
  supports_search: boolean;
  supports_permissions: boolean;
  supports_attachments: boolean;
  supports_comments: boolean;
  supports_versions: boolean;

  // Limits
  rate_limit_requests_per_minute?: number;
  max_items_per_request?: number;
  max_content_size_bytes?: number;
}

/**
 * Search parameters for connector-native search
 */
export interface ConnectorSearchParams {
  query: string;
  limit?: number;
  offset?: number;
  content_types?: string[];
  updated_after?: string;
  updated_before?: string;
  author_id?: string;
  path_prefix?: string;
}

/**
 * Connector health check result
 */
export interface ConnectorHealthCheck {
  connector_id: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;

  checks: {
    authentication: { status: 'pass' | 'fail'; message?: string };
    connectivity: { status: 'pass' | 'fail'; latency_ms?: number };
    permissions: { status: 'pass' | 'fail'; scopes?: string[] };
    quota: { status: 'pass' | 'warn' | 'fail'; remaining?: number; limit?: number };
  };

  recommendations?: string[];
}

/**
 * Webhook event from external service
 */
export interface ConnectorWebhookEvent {
  id: string;
  connector_id: string;
  event_type: 'created' | 'updated' | 'deleted' | 'moved' | 'permissions_changed';
  external_id: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

/**
 * Token refresh result
 */
export interface TokenRefreshResult {
  access_token: string;
  refresh_token?: string;
  expires_at: string;
}

/**
 * Connector factory registration
 */
export interface ConnectorRegistration {
  type: ConnectorType;
  name: string;
  description: string;
  icon: string;
  capabilities: ConnectorCapabilities;
  requiredFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'select';
    required: boolean;
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
    helpText?: string;
  }>;
}
