"use client";

import React, { createContext, useContext, useCallback, useEffect, useRef, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_KEY = 'dw_analytics_session';
const PROJECT_CODE = 'dCQ';
const MAIN_APP_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://digitalworkplace-ai.vercel.app';

interface TrackingState {
  sessionId: string | null;
  userId: string | null;
  isTracking: boolean;
}

interface TrackingContextType {
  sessionId: string | null;
  userId: string | null;
  isTracking: boolean;
  trackNavigation: (to_project_code: string, to_page_path: string) => Promise<void>;
}

const TrackingContext = createContext<TrackingContextType | null>(null);

export function TrackingWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const stateRef = useRef<TrackingState>({
    sessionId: null,
    userId: null,
    isTracking: false,
  });
  const lastPathRef = useRef<string | null>(null);
  const pageEnteredAtRef = useRef<number>(Date.now());

  // Initialize session from shared storage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      try {
        const { sessionId, userId, expiresAt } = JSON.parse(storedSession);
        if (new Date(expiresAt) > new Date()) {
          stateRef.current = { sessionId, userId, isTracking: true };
        }
      } catch {
        // Invalid session, will be created by main app
      }
    }
  }, []);

  // Track page views on pathname change
  useEffect(() => {
    if (!stateRef.current.isTracking || !pathname) return;
    if (pathname === lastPathRef.current) return;

    const trackView = async () => {
      pageEnteredAtRef.current = Date.now();

      if (stateRef.current.userId && stateRef.current.sessionId) {
        try {
          await fetch(`${MAIN_APP_URL}/api/tracking/pageview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              userId: stateRef.current.userId,
              sessionId: stateRef.current.sessionId,
              projectCode: PROJECT_CODE,
              pagePath: pathname,
              pageTitle: typeof document !== 'undefined' ? document.title : '',
              referrer: lastPathRef.current ? `${PROJECT_CODE}:${lastPathRef.current}` : document.referrer,
            }),
          });
        } catch (err) {
          console.warn('Failed to track page view:', err);
        }
      }

      lastPathRef.current = pathname;
    };

    trackView();
  }, [pathname]);

  const trackNavigation = useCallback(async (to_project_code: string, to_page_path: string) => {
    if (!stateRef.current.userId || !stateRef.current.sessionId) return;

    try {
      const timeInSourceSeconds = Math.floor((Date.now() - pageEnteredAtRef.current) / 1000);

      await fetch(`${MAIN_APP_URL}/api/tracking/navigation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: stateRef.current.userId,
          sessionId: stateRef.current.sessionId,
          from_project_code: PROJECT_CODE,
          from_page_path: pathname,
          to_project_code,
          to_page_path,
          time_in_source_seconds: timeInSourceSeconds,
          navigation_type: 'click',
        }),
      });
    } catch (err) {
      console.warn('Failed to track navigation:', err);
    }
  }, [pathname]);

  return (
    <TrackingContext.Provider
      value={{
        sessionId: stateRef.current.sessionId,
        userId: stateRef.current.userId,
        isTracking: stateRef.current.isTracking,
        trackNavigation,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(TrackingContext);
  return context || {
    sessionId: null,
    userId: null,
    isTracking: false,
    trackNavigation: async () => {},
  };
}
