'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ChatLink, NavigationAction } from '@/lib/dtq/types';

interface NavigationContextType {
  pendingAction: NavigationAction | null;
  dispatch: (link: ChatLink) => void;
  clearAction: (actionId: string) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  pendingAction: null,
  dispatch: () => {},
  clearAction: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

const ACTION_TTL_MS = 30_000;

const PAGE_ROUTES: Record<string, string> = {
  dashboard: '/dashboard',
  reports: '/reports',
  history: '/history',
};

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [pendingAction, setPendingAction] = useState<NavigationAction | null>(null);
  const router = useRouter();

  const dispatch = useCallback((link: ChatLink) => {
    const action: NavigationAction = {
      id: `nav-${Date.now()}`,
      link,
      timestamp: Date.now(),
    };

    const targetRoute = PAGE_ROUTES[link.page];
    if (targetRoute) {
      router.push(targetRoute);
    }

    setPendingAction(action);
  }, [router]);

  const clearAction = useCallback((actionId: string) => {
    setPendingAction(prev => (prev?.id === actionId ? null : prev));
  }, []);

  const value = useMemo(() => {
    // Expire stale actions
    if (pendingAction && Date.now() - pendingAction.timestamp > ACTION_TTL_MS) {
      return { pendingAction: null, dispatch, clearAction };
    }
    return { pendingAction, dispatch, clearAction };
  }, [pendingAction, dispatch, clearAction]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}
