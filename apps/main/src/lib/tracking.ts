/**
 * Tracking Utilities for Digital Workplace AI
 * Handles session tracking, page views, and cross-app navigation
 */

import { supabase } from './supabase';

// Types
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

// Device detection utilities
export function getDeviceInfo(): { deviceType: string; browser: string; os: string } {
  if (typeof window === 'undefined') {
    return { deviceType: 'unknown', browser: 'unknown', os: 'unknown' };
  }

  const ua = navigator.userAgent;

  // Device type detection
  let deviceType = 'desktop';
  if (/Mobi|Android/i.test(ua)) {
    deviceType = /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile';
  }

  // Browser detection
  let browser = 'unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
  }

  // OS detection
  let os = 'unknown';
  if (ua.includes('Windows')) {
    os = 'Windows';
  } else if (ua.includes('Mac')) {
    os = 'macOS';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
  }

  return { deviceType, browser, os };
}

// Session management
let currentSessionId: string | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

export async function startSession(
  userId: string,
  clerkId: string
): Promise<string | null> {
  try {
    const deviceInfo = getDeviceInfo();

    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        clerk_id: clerkId,
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : null,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        is_active: true,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error starting session:', error);
      return null;
    }

    currentSessionId = data.id;

    // Start heartbeat every 30 seconds
    startHeartbeat();

    return data.id;
  } catch (err) {
    console.error('Error starting session:', err);
    return null;
  }
}

function startHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  heartbeatInterval = setInterval(async () => {
    if (currentSessionId) {
      await updateSessionHeartbeat(currentSessionId);
    }
  }, 30000); // 30 seconds
}

async function updateSessionHeartbeat(sessionId: string): Promise<void> {
  try {
    await supabase
      .from('user_sessions')
      .update({
        last_heartbeat_at: new Date().toISOString(),
      })
      .eq('id', sessionId);
  } catch (err) {
    console.error('Error updating heartbeat:', err);
  }
}

export async function endSession(sessionId?: string): Promise<void> {
  const id = sessionId || currentSessionId;
  if (!id) return;

  try {
    // Calculate duration from started_at to now
    const { data: session } = await supabase
      .from('user_sessions')
      .select('started_at')
      .eq('id', id)
      .single();

    if (session) {
      const startedAt = new Date(session.started_at);
      const durationSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);

      await supabase
        .from('user_sessions')
        .update({
          ended_at: new Date().toISOString(),
          is_active: false,
          duration_seconds: durationSeconds,
        })
        .eq('id', id);
    }

    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }

    currentSessionId = null;
  } catch (err) {
    console.error('Error ending session:', err);
  }
}

// Page view tracking
let currentPageViewId: string | null = null;
let pageEnteredAt: number = Date.now();

export async function trackPageView(
  userId: string,
  projectCode: string,
  pagePath: string,
  pageTitle: string,
  referrer?: string,
  referrerProjectCode?: string
): Promise<string | null> {
  if (!currentSessionId) {
    console.warn('No active session for page view tracking');
    return null;
  }

  try {
    // First, end the previous page view if exists
    if (currentPageViewId) {
      await endPageView();
    }

    const { data, error } = await supabase
      .from('page_views')
      .insert({
        session_id: currentSessionId,
        user_id: userId,
        project_code: projectCode,
        page_path: pagePath,
        page_title: pageTitle,
        referrer: referrer,
        referrer_project_code: referrerProjectCode,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error tracking page view:', error);
      return null;
    }

    currentPageViewId = data.id;
    pageEnteredAt = Date.now();

    return data.id;
  } catch (err) {
    console.error('Error tracking page view:', err);
    return null;
  }
}

export async function endPageView(
  scrollDepthPercent?: number,
  clickCount?: number
): Promise<void> {
  if (!currentPageViewId) return;

  try {
    const timeOnPageSeconds = Math.floor((Date.now() - pageEnteredAt) / 1000);

    await supabase
      .from('page_views')
      .update({
        exited_at: new Date().toISOString(),
        time_on_page_seconds: timeOnPageSeconds,
        scroll_depth_percent: scrollDepthPercent || 0,
        click_count: clickCount || 0,
      })
      .eq('id', currentPageViewId);

    currentPageViewId = null;
  } catch (err) {
    console.error('Error ending page view:', err);
  }
}

// Cross-app navigation tracking
export async function trackCrossAppNavigation(
  userId: string,
  navigation: CrossAppNavigation
): Promise<void> {
  if (!currentSessionId) {
    console.warn('No active session for navigation tracking');
    return;
  }

  try {
    const timeInSourceSeconds = Math.floor((Date.now() - pageEnteredAt) / 1000);

    await supabase.from('cross_app_navigation').insert({
      session_id: currentSessionId,
      user_id: userId,
      from_project_code: navigation.from_project_code,
      from_page_path: navigation.from_page_path,
      to_project_code: navigation.to_project_code,
      to_page_path: navigation.to_page_path,
      navigation_type: navigation.navigation_type,
      time_in_source_seconds: timeInSourceSeconds,
    });
  } catch (err) {
    console.error('Error tracking cross-app navigation:', err);
  }
}

// Use sendBeacon for reliable session end on page close
export function setupBeaconTracking(userId: string, sessionId: string): (() => void) | undefined {
  if (typeof window === 'undefined') return undefined;

  const handleUnload = () => {
    const data = JSON.stringify({
      session_id: sessionId,
      user_id: userId,
      ended_at: new Date().toISOString(),
    });

    // Use sendBeacon for reliable delivery
    navigator.sendBeacon('/api/tracking/session/end', data);
  };

  window.addEventListener('beforeunload', handleUnload);
  window.addEventListener('pagehide', handleUnload);

  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleUnload);
    window.removeEventListener('pagehide', handleUnload);
  };
}

// Get current session ID (for external use)
export function getCurrentSessionId(): string | null {
  return currentSessionId;
}

// Set session ID (for resuming sessions)
export function setCurrentSessionId(sessionId: string): void {
  currentSessionId = sessionId;
  startHeartbeat();
}
