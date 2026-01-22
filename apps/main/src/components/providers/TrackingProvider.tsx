"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useTracking } from '@/hooks/useTracking';

interface TrackingContextType {
  sessionId: string | null;
  userId: string | null;
  isTracking: boolean;
  trackNavigation: (navigation: {
    to_project_code: string;
    to_page_path: string;
    navigation_type: 'click' | 'redirect' | 'direct' | 'back';
  }) => Promise<void>;
  endSession: () => Promise<void>;
}

const TrackingContext = createContext<TrackingContextType | null>(null);

interface TrackingProviderProps {
  children: ReactNode;
  projectCode?: string;
  enabled?: boolean;
}

export function TrackingProvider({
  children,
  projectCode = 'main',
  enabled = true,
}: TrackingProviderProps) {
  const tracking = useTracking({ projectCode, enabled });

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
