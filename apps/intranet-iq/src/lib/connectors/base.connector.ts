/**
 * Base Connector Abstract Class
 * All external knowledge source connectors must extend this class
 */

import {
  ConnectorConfig,
  ConnectorItem,
  ConnectorCapabilities,
  ConnectorHealthCheck,
  ConnectorSearchParams,
  SyncResult,
  TokenRefreshResult,
  ConnectorWebhookEvent,
} from './types';

export abstract class BaseConnector {
  protected config: ConnectorConfig;
  protected rateLimiter: RateLimiter;

  constructor(config: ConnectorConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter(
      this.getCapabilities().rate_limit_requests_per_minute || 60
    );
  }

  // ==========================================
  // Abstract methods - must be implemented
  // ==========================================

  /**
   * Get connector capabilities
   */
  abstract getCapabilities(): ConnectorCapabilities;

  /**
   * Test connection and authentication
   */
  abstract testConnection(): Promise<ConnectorHealthCheck>;

  /**
   * Perform full sync of all content
   */
  abstract fullSync(): Promise<SyncResult>;

  /**
   * Perform incremental sync since last sync
   */
  abstract incrementalSync(cursor?: string): Promise<SyncResult>;

  /**
   * Fetch a single item by external ID
   */
  abstract fetchItem(externalId: string): Promise<ConnectorItem | null>;

  /**
   * Search content using connector's native search
   */
  abstract search(params: ConnectorSearchParams): Promise<ConnectorItem[]>;

  // ==========================================
  // Optional overrides
  // ==========================================

  /**
   * Refresh OAuth tokens if needed
   */
  async refreshTokens(): Promise<TokenRefreshResult | null> {
    // Default: no token refresh needed
    return null;
  }

  /**
   * Process incoming webhook event
   */
  async handleWebhook(event: ConnectorWebhookEvent): Promise<void> {
    // Default: no webhook handling
    console.log(`Webhook received for connector ${this.config.id}:`, event);
  }

  /**
   * Get the authorization header for API requests
   */
  protected getAuthHeader(): Record<string, string> {
    const { auth_type, auth_credentials } = this.config;

    switch (auth_type) {
      case 'bearer':
        return { Authorization: `Bearer ${auth_credentials.access_token}` };
      case 'oauth2':
        return { Authorization: `Bearer ${auth_credentials.access_token}` };
      case 'api_key':
        return { 'X-Api-Key': auth_credentials.api_key || '' };
      case 'basic':
        const encoded = Buffer.from(
          `${auth_credentials.username}:${auth_credentials.password}`
        ).toString('base64');
        return { Authorization: `Basic ${encoded}` };
      case 'custom':
        return auth_credentials.custom_headers || {};
      default:
        return {};
    }
  }

  /**
   * Make an authenticated API request with rate limiting
   */
  protected async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.rateLimiter.waitForSlot();

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh tokens
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          // Retry with new token
          return this.makeRequest(url, options);
        }
        throw new ConnectorError('Authentication failed', 'AUTH_FAILED', response.status);
      }

      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return this.makeRequest(url, options);
      }

      throw new ConnectorError(
        `Request failed: ${response.statusText}`,
        'REQUEST_FAILED',
        response.status
      );
    }

    return response.json();
  }

  /**
   * Generate sync hash for change detection
   */
  protected generateSyncHash(item: Partial<ConnectorItem>): string {
    const hashSource = JSON.stringify({
      title: item.title,
      content: item.content,
      updated_at: item.external_updated_at,
      metadata: item.metadata,
    });

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < hashSource.length; i++) {
      const char = hashSource.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Convert HTML to plain text
   */
  protected htmlToText(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract excerpt from content
   */
  protected extractExcerpt(content: string, maxLength: number = 200): string {
    const text = this.htmlToText(content);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Get connector ID
   */
  getId(): string {
    return this.config.id;
  }

  /**
   * Get connector type
   */
  getType(): string {
    return this.config.type;
  }

  /**
   * Get connector status
   */
  getStatus(): string {
    return this.config.status;
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): string | undefined {
    return this.config.last_sync_at;
  }
}

/**
 * Connector-specific error class
 */
export class ConnectorError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'ConnectorError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Simple rate limiter for API requests
 */
class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private lastRefill: number;
  private refillRate: number;

  constructor(requestsPerMinute: number) {
    this.maxTokens = requestsPerMinute;
    this.tokens = requestsPerMinute;
    this.lastRefill = Date.now();
    this.refillRate = requestsPerMinute / 60000; // tokens per millisecond
  }

  async waitForSlot(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Wait for a token to become available
    const waitTime = (1 - this.tokens) / this.refillRate;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    this.refill();
    this.tokens -= 1;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}
