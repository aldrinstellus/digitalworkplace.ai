"use client";

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { TrackingConfig, TrackingState, CrossAppNavigation } from './types';

const SESSION_KEY = 'dw_analytics_session';
const MAIN_APP_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://digitalworkplace-ai.vercel.app';

interface UseTrackingReturn {
  sessionId: string | null;
  userId: string | null;
  isTracking: boolean;
  trackNavigation: (navigation: Omit<CrossAppNavigation, 'from_project_code' | 'from_page_path'>) => Promise<void>;
  endSession: () => Promise<void>;
}

// Device detection utilities
function getDeviceInfo(): { deviceType: string; browser: string; os: string } {
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

export function useTracking(config: TrackingConfig): UseTrackingReturn {
  const { projectCode, enabled = true, apiBaseUrl = MAIN_APP_URL } = config;
  const pathname = usePathname();

  const stateRef = useRef<TrackingState>({
    sessionId: null,
    userId: null,
    isTracking: false,
  });
  const lastPathRef = useRef<string | null>(null);
  const scrollDepthRef = useRef<number>(0);
  const clickCountRef = useRef<number>(0);
  const pageEnteredAtRef = useRef<number>(Date.now());

  // Track scroll depth
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      scrollDepthRef.current = Math.max(scrollDepthRef.current, scrollPercent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled]);

  // Track clicks
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleClick = () => {
      clickCountRef.current++;
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [enabled]);

  // Initialize session from shared storage
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const initSession = async () => {
      // Check for existing session in localStorage (shared across sub-apps via same domain)
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        try {
          const { sessionId, userId, expiresAt } = JSON.parse(storedSession);
          if (new Date(expiresAt) > new Date()) {
            // Resume existing session
            stateRef.current = { sessionId, userId, isTracking: true };
            return;
          }
        } catch {
          localStorage.removeItem(SESSION_KEY);
        }
      }

      // No valid session found - sub-apps don't create sessions
      // They rely on main app to create the session
      stateRef.current.isTracking = false;
    };

    initSession();
  }, [enabled]);

  // Track page views on pathname change
  useEffect(() => {
    if (!enabled || !stateRef.current.isTracking || !pathname) return;
    if (pathname === lastPathRef.current) return;

    const trackView = async () => {
      // Reset metrics for new page
      scrollDepthRef.current = 0;
      clickCountRef.current = 0;
      pageEnteredAtRef.current = Date.now();

      // Track new page view via main app API
      if (stateRef.current.userId && stateRef.current.sessionId) {
        try {
          await fetch(`${apiBaseUrl}/api/tracking/pageview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              userId: stateRef.current.userId,
              sessionId: stateRef.current.sessionId,
              projectCode,
              pagePath: pathname,
              pageTitle: typeof document !== 'undefined' ? document.title : '',
              referrer: lastPathRef.current ? `${projectCode}:${lastPathRef.current}` : document.referrer,
            }),
          });
        } catch (err) {
          console.warn('Failed to track page view:', err);
        }
      }

      lastPathRef.current = pathname;
    };

    trackView();
  }, [enabled, pathname, projectCode, apiBaseUrl]);

  // Manual navigation tracking function
  const trackNavigation = useCallback(async (
    navigation: Omit<CrossAppNavigation, 'from_project_code' | 'from_page_path'>
  ) => {
    if (!enabled || !stateRef.current.userId || !stateRef.current.sessionId) return;

    try {
      const timeInSourceSeconds = Math.floor((Date.now() - pageEnteredAtRef.current) / 1000);

      await fetch(`${apiBaseUrl}/api/tracking/navigation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: stateRef.current.userId,
          sessionId: stateRef.current.sessionId,
          from_project_code: projectCode,
          from_page_path: pathname,
          time_in_source_seconds: timeInSourceSeconds,
          ...navigation,
        }),
      });
    } catch (err) {
      console.warn('Failed to track navigation:', err);
    }
  }, [enabled, projectCode, pathname, apiBaseUrl]);

  // End session function (called by main app)
  const endSession = useCallback(async () => {
    if (!stateRef.current.sessionId) return;

    localStorage.removeItem(SESSION_KEY);
    stateRef.current = { sessionId: null, userId: null, isTracking: false };
  }, []);

  return {
    sessionId: stateRef.current.sessionId,
    userId: stateRef.current.userId,
    isTracking: stateRef.current.isTracking,
    trackNavigation,
    endSession,
  };
}
