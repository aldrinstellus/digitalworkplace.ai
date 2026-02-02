"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useTracking } from './useTracking';
import type { TrackingConfig, CrossAppNavigation } from './types';

interface TrackingContextType {
  sessionId: string | null;
  userId: string | null;
  isTracking: boolean;
  trackNavigation: (navigation: Omit<CrossAppNavigation, 'from_project_code' | 'from_page_path'>) => Promise<void>;
  endSession: () => Promise<void>;
}

const TrackingContext = createContext<TrackingContextType | null>(null);

interface TrackingProviderProps extends TrackingConfig {
  children: ReactNode;
}

export function TrackingProvider({
  children,
  projectCode,
  enabled = true,
  apiBaseUrl,
}: TrackingProviderProps) {
  const tracking = useTracking({ projectCode, enabled, apiBaseUrl });

  return (
    <TrackingContext.Provider value={tracking}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTrackingContext(): TrackingContextType {
  const context = useContext(TrackingContext);
  if (!context) {
    // Return a no-op version if not wrapped in provider
    return {
      sessionId: null,
      userId: null,
      isTracking: false,
      trackNavigation: async () => {},
      endSession: async () => {},
    };
  }
  return context;
}

// Hook to track cross-app navigation when clicking external links
export function useTrackAppLaunch() {
  const { trackNavigation, isTracking } = useTrackingContext();

  const trackAppLaunch = async (
    targetProjectCode: string,
    targetPath: string = '/dashboard'
  ) => {
    if (!isTracking) return;

    await trackNavigation({
      to_project_code: targetProjectCode,
      to_page_path: targetPath,
      navigation_type: 'click',
    });
  };

  return trackAppLaunch;
}
