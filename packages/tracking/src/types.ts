/**
 * Tracking types for Digital Workplace AI
 */

export interface TrackingConfig {
  projectCode: string;
  enabled?: boolean;
  apiBaseUrl?: string;
}

export interface SessionData {
  id: string;
  user_id: string;
  clerk_id: string;
  started_at: string;
  last_heartbeat_at: string;
  is_active: boolean;
  device_type: string;
  browser: string;
  os: string;
}

export interface PageViewData {
  id: string;
  session_id: string;
  user_id: string;
  project_code: string;
  page_path: string;
  page_title: string;
  entered_at: string;
  time_on_page_seconds: number;
}

export interface CrossAppNavigation {
  from_project_code: string;
  from_page_path: string;
  to_project_code: string;
  to_page_path: string;
  navigation_type: 'click' | 'redirect' | 'direct' | 'back';
}

export interface TrackingState {
  sessionId: string | null;
  userId: string | null;
  isTracking: boolean;
}
