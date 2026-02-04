'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
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

  // Expire stale actions via a timer instead of inside useMemo
  useEffect(() => {
    if (!pendingAction) return;

    const elapsed = Date.now() - pendingAction.timestamp;
    if (elapsed >= ACTION_TTL_MS) {
      queueMicrotask(() => setPendingAction(null));
      return;
    }

    const timer = setTimeout(() => {
      setPendingAction(null);
    }, ACTION_TTL_MS - elapsed);

    return () => clearTimeout(timer);
  }, [pendingAction]);

  const value = useMemo(
    () => ({ pendingAction, dispatch, clearAction }),
    [pendingAction, dispatch, clearAction]
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}
