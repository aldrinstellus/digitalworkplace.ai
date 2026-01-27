"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import {
  endSession,
  endPageView,
  setupBeaconTracking,
  setCurrentSessionId,
  CrossAppNavigation,
} from '@/lib/tracking';

interface UseTrackingOptions {
  projectCode: string;
  enabled?: boolean;
}

interface TrackingState {
  sessionId: string | null;
  userId: string | null;
  isTracking: boolean;
}

const SESSION_KEY = 'dw_analytics_session';

export function useTracking({ projectCode, enabled = true }: UseTrackingOptions) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  // Use useState for values returned to components (must not access ref during render)
  const [trackingState, setTrackingState] = useState<TrackingState>({
    sessionId: null,
    userId: null,
    isTracking: false,
  });
  // Use refs for internal state that doesn't need to trigger re-renders
  const stateRef = useRef<TrackingState>(trackingState);
  const lastPathRef = useRef<string | null>(null);
  const scrollDepthRef = useRef<number>(0);
  const clickCountRef = useRef<number>(0);

  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = trackingState;
  }, [trackingState]);

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

  // Initialize session
  useEffect(() => {
    if (!enabled || !isLoaded || !user) return;

    const initSession = async () => {
      // Check for existing session in localStorage
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        try {
          const { sessionId, userId, expiresAt } = JSON.parse(storedSession);
          if (new Date(expiresAt) > new Date() && userId === user.id) {
            // Resume existing session
            setCurrentSessionId(sessionId);
            const newState = { sessionId, userId, isTracking: true };
            stateRef.current = newState;
            setTrackingState(newState);
            return;
          }
        } catch {
          localStorage.removeItem(SESSION_KEY);
        }
      }

      // Get user ID from Supabase
      const response = await fetch('/api/tracking/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          clerkId: user.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.sessionId && data.userId) {
          const newState = {
            sessionId: data.sessionId,
            userId: data.userId,
            isTracking: true,
          };
          stateRef.current = newState;
          setTrackingState(newState);

          // Store session with 24h expiry
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          localStorage.setItem(SESSION_KEY, JSON.stringify({
            sessionId: data.sessionId,
            userId: data.userId,
            expiresAt: expiresAt.toISOString(),
          }));

          // Setup beacon for session end
          setupBeaconTracking(data.userId, data.sessionId);
        }
      }
    };

    initSession();

    // Cleanup on unmount
    return () => {
      if (stateRef.current.sessionId) {
        endPageView(scrollDepthRef.current, clickCountRef.current);
      }
    };
  }, [enabled, isLoaded, user]);

  // Track page views on pathname change
  useEffect(() => {
    if (!enabled || !stateRef.current.isTracking || !pathname) return;
    if (pathname === lastPathRef.current) return;

    const trackView = async () => {
      // End previous page view
      if (lastPathRef.current && stateRef.current.userId) {
        await endPageView(scrollDepthRef.current, clickCountRef.current);
      }

      // Reset metrics for new page
      scrollDepthRef.current = 0;
      clickCountRef.current = 0;

      // Track new page view
      if (stateRef.current.userId) {
        await fetch('/api/tracking/pageview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: stateRef.current.userId,
            sessionId: stateRef.current.sessionId,
            projectCode,
            pagePath: pathname,
            pageTitle: document.title,
            referrer: lastPathRef.current ? `${projectCode}:${lastPathRef.current}` : document.referrer,
          }),
        });
      }

      lastPathRef.current = pathname;
    };

    trackView();
  }, [enabled, pathname, projectCode]);

  // Manual navigation tracking function
  const trackNavigation = useCallback(async (navigation: Omit<CrossAppNavigation, 'from_project_code' | 'from_page_path'>) => {
    if (!enabled || !stateRef.current.userId) return;

    await fetch('/api/tracking/navigation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: stateRef.current.userId,
        sessionId: stateRef.current.sessionId,
        from_project_code: projectCode,
        from_page_path: pathname,
        ...navigation,
      }),
    });
  }, [enabled, projectCode, pathname]);

  // End session function
  const endCurrentSession = useCallback(async () => {
    if (!stateRef.current.sessionId) return;

    await endPageView(scrollDepthRef.current, clickCountRef.current);
    await endSession(stateRef.current.sessionId);
    localStorage.removeItem(SESSION_KEY);
    const newState = { sessionId: null, userId: null, isTracking: false };
    stateRef.current = newState;
    setTrackingState(newState);
  }, []);

  return {
    sessionId: trackingState.sessionId,
    userId: trackingState.userId,
    isTracking: trackingState.isTracking,
    trackNavigation,
    endSession: endCurrentSession,
  };
}
