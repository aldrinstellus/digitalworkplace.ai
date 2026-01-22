/**
 * Connector Framework - Main Entry Point
 * Exports all connector types, factory, and utilities
 */

// Types
export * from './types';

// Base class
export { BaseConnector, ConnectorError } from './base.connector';

// Factory
export { ConnectorFactory, ConnectorManager } from './factory';

// Implementations
export { ConfluenceConnector } from './implementations/confluence.connector';
export { SharePointConnector } from './implementations/sharepoint.connector';
export { NotionConnector } from './implementations/notion.connector';
export { GoogleDriveConnector } from './implementations/google-drive.connector';
