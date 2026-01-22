"use client";

import { ReactNode } from 'react';
import { TrackingProvider } from './TrackingProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <TrackingProvider projectCode="main" enabled={true}>
      {children}
    </TrackingProvider>
  );
}
