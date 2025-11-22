import { useEffect, useCallback, useRef, useState } from 'react';
import {
  isSessionValid,
  getSessionTimeRemaining,
  updateSessionActivity,
  clearSession,
} from '../lib/auth';
import { config } from '../lib/config';

interface UseSessionTimeoutOptions {
  onTimeout: () => void;
  onWarning?: () => void;
  warningThresholdMs?: number;
}

interface UseSessionTimeoutReturn {
  timeRemaining: number;
  isWarning: boolean;
  extendSession: () => void;
  resetSession: () => void;
}

const WARNING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes before timeout

export const useSessionTimeout = (options: UseSessionTimeoutOptions): UseSessionTimeoutReturn => {
  const { onTimeout, onWarning, warningThresholdMs = WARNING_THRESHOLD_MS } = options;

  const [timeRemaining, setTimeRemaining] = useState(getSessionTimeRemaining());
  const [isWarning, setIsWarning] = useState(false);
  const warningTriggered = useRef(false);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Activity events to track
  const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

  // Update activity timestamp on user interaction
  const handleActivity = useCallback(() => {
    if (isSessionValid()) {
      updateSessionActivity();
      setTimeRemaining(getSessionTimeRemaining());
      setIsWarning(false);
      warningTriggered.current = false;
    }
  }, []);

  // Extend session manually (e.g., from a "Stay logged in" button)
  const extendSession = useCallback(() => {
    handleActivity();
  }, [handleActivity]);

  // Reset session (logout)
  const resetSession = useCallback(() => {
    clearSession();
    setTimeRemaining(0);
    setIsWarning(false);
    warningTriggered.current = false;
  }, []);

  // Check session validity periodically
  useEffect(() => {
    const checkSession = () => {
      const remaining = getSessionTimeRemaining();
      setTimeRemaining(remaining);

      // Session has expired
      if (!isSessionValid() || remaining <= 0) {
        clearSession();
        onTimeout();
        return;
      }

      // Session is about to expire - show warning
      if (remaining <= warningThresholdMs && !warningTriggered.current) {
        setIsWarning(true);
        warningTriggered.current = true;
        onWarning?.();
      }
    };

    // Check every 10 seconds
    checkIntervalRef.current = setInterval(checkSession, 10000);

    // Initial check
    checkSession();

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [onTimeout, onWarning, warningThresholdMs]);

  // Add activity listeners
  useEffect(() => {
    // Throttle activity handler to avoid excessive updates
    let lastActivityTime = Date.now();
    const throttledHandler = () => {
      const now = Date.now();
      // Only update every 30 seconds
      if (now - lastActivityTime >= 30000) {
        lastActivityTime = now;
        handleActivity();
      }
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, throttledHandler, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, throttledHandler);
      });
    };
  }, [handleActivity]);

  return {
    timeRemaining,
    isWarning,
    extendSession,
    resetSession,
  };
};

// Format remaining time for display
export const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return '0:00';

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default useSessionTimeout;
