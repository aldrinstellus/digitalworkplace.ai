"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

interface SessionInfo {
  clerkId: string | null;
  sessionId: string | null;
  userEmail: string | null;
  userName: string | null;
  isSessionActive: boolean;
}

interface SessionContextType extends SessionInfo {
  getSessionStorageKey: (baseKey: string) => string;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Storage keys for session data
const SESSION_STORAGE_KEY = "dcq_session_info";
const SESSION_PREFIX = "dcq_session_";

// Get initial session from URL or localStorage (runs once during SSR/hydration)
function getInitialSession(): SessionInfo {
  if (typeof window === "undefined") {
    return { clerkId: null, sessionId: null, userEmail: null, userName: null, isSessionActive: false };
  }

  // Check URL params first (highest priority - fresh navigation from main app)
  const urlParams = new URLSearchParams(window.location.search);
  const urlClerkId = urlParams.get("clerk_id");
  const urlSessionId = urlParams.get("session_id");
  const urlUserEmail = urlParams.get("user_email");
  const urlUserName = urlParams.get("user_name");

  if (urlClerkId && urlSessionId) {
    return {
      clerkId: urlClerkId,
      sessionId: urlSessionId,
      userEmail: urlUserEmail,
      userName: urlUserName,
      isSessionActive: true,
    };
  }

  // Check localStorage for existing session (page reload scenario)
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as SessionInfo;
      if (parsed.clerkId && parsed.sessionId) {
        return parsed;
      }
    }
  } catch {
    // Ignore localStorage errors during initialization
  }

  return { clerkId: null, sessionId: null, userEmail: null, userName: null, isSessionActive: false };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>(() => getInitialSession());
  const initialized = useRef(false);

  // Handle side effects (URL cleanup, localStorage persistence, logging)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const urlClerkId = urlParams.get("clerk_id");
    const urlSessionId = urlParams.get("session_id");

    if (urlClerkId && urlSessionId) {
      // Persist to localStorage for page reloads within same session
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionInfo));
      } catch (e) {
        console.warn("[SessionContext] Could not persist session to localStorage:", e);
      }

      // Clean URL params after capturing them (keeps URL cleaner)
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, "", cleanUrl);

      console.log("[SessionContext] Session initialized from URL:", {
        clerkId: urlClerkId,
        sessionId: urlSessionId,
      });
    } else if (sessionInfo.isSessionActive) {
      console.log("[SessionContext] Session restored from localStorage:", {
        clerkId: sessionInfo.clerkId,
        sessionId: sessionInfo.sessionId,
      });
    } else {
      console.log("[SessionContext] No active session - public mode");
    }
  }, [sessionInfo]);

  /**
   * Get a storage key prefixed with session info for isolation.
   * This ensures session-specific settings don't affect global settings.
   *
   * @param baseKey The base key (e.g., "banner_settings")
   * @returns Session-prefixed key if in session, or the base key if not
   */
  const getSessionStorageKey = (baseKey: string): string => {
    if (sessionInfo.isSessionActive && sessionInfo.sessionId) {
      return `${SESSION_PREFIX}${sessionInfo.sessionId}_${baseKey}`;
    }
    return baseKey;
  };

  /**
   * Clear the current session (logout from session mode).
   * This removes session data from both state and localStorage.
   */
  const clearSession = () => {
    setSessionInfo({
      clerkId: null,
      sessionId: null,
      userEmail: null,
      userName: null,
      isSessionActive: false,
    });
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.warn("[SessionContext] Could not clear session from localStorage:", e);
    }
    console.log("[SessionContext] Session cleared");
  };

  return (
    <SessionContext.Provider
      value={{
        ...sessionInfo,
        getSessionStorageKey,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Hook to access session context.
 *
 * Usage:
 * ```tsx
 * const { isSessionActive, clerkId, sessionId, getSessionStorageKey } = useSession();
 *
 * // Check if user is in a session
 * if (isSessionActive) {
 *   // Save to session-specific storage
 *   const key = getSessionStorageKey("banner_settings");
 *   localStorage.setItem(key, JSON.stringify(settings));
 * }
 * ```
 */
export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

/**
 * Helper to check if a storage key is session-specific.
 */
export function isSessionKey(key: string): boolean {
  return key.startsWith(SESSION_PREFIX);
}

/**
 * Get all session-specific keys from localStorage.
 */
export function getSessionKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && isSessionKey(key)) {
        keys.push(key);
      }
    }
  } catch (e) {
    console.warn("[SessionContext] Could not enumerate localStorage keys:", e);
  }
  return keys;
}

/**
 * Clean up all session-specific data from localStorage.
 * Useful for admin cleanup or when sessions expire.
 */
export function clearAllSessionData(): void {
  const keys = getSessionKeys();
  keys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[SessionContext] Could not remove key ${key}:`, e);
    }
  });
  // Also clear the session info itself
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn("[SessionContext] Could not clear session info:", e);
  }
  console.log(`[SessionContext] Cleared ${keys.length} session keys`);
}
