import { User } from '../types/types';

// ==================== PASSWORD UTILITIES ====================

/**
 * Simple password hashing for demo purposes
 * In production, use bcrypt on the server-side
 */
export const hashPassword = (password: string): string => {
  // Simple hash for demo - in production use bcrypt on server
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `demo_hash_${Math.abs(hash).toString(16)}`;
};

/**
 * Demo password verification
 * In production, this would be done server-side
 */
export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash || password.length >= 6; // Allow any 6+ char password for demo
};

// ==================== SESSION MANAGEMENT ====================

const SESSION_KEY = 'mwrd_session';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

interface SessionData {
  userId: string;
  email: string;
  role: string;
  loginAt: number;
  lastActivity: number;
  expiresAt: number;
}

export const createSession = (user: User): SessionData => {
  const now = Date.now();
  const session: SessionData = {
    userId: user.id,
    email: user.email,
    role: user.role,
    loginAt: now,
    lastActivity: now,
    expiresAt: now + SESSION_TIMEOUT_MS,
  };

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage may not be available
  }

  return session;
};

export const getSession = (): SessionData | null => {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const session: SessionData = JSON.parse(stored);

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

export const updateSessionActivity = (): void => {
  const session = getSession();
  if (session) {
    session.lastActivity = Date.now();
    session.expiresAt = Date.now() + SESSION_TIMEOUT_MS;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage errors
    }
  }
};

export const clearSession = (): void => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
};

export const isSessionValid = (): boolean => {
  const session = getSession();
  return session !== null && Date.now() < session.expiresAt;
};

export const getSessionTimeRemaining = (): number => {
  const session = getSession();
  if (!session) return 0;
  return Math.max(0, session.expiresAt - Date.now());
};

// ==================== LOGIN ATTEMPT TRACKING ====================

const LOGIN_ATTEMPTS_KEY = 'mwrd_login_attempts';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface LoginAttempts {
  count: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

export const getLoginAttempts = (email: string): LoginAttempts => {
  try {
    const stored = localStorage.getItem(`${LOGIN_ATTEMPTS_KEY}_${email}`);
    if (!stored) {
      return { count: 0, lastAttempt: 0, lockedUntil: null };
    }
    return JSON.parse(stored);
  } catch {
    return { count: 0, lastAttempt: 0, lockedUntil: null };
  }
};

export const recordLoginAttempt = (email: string, success: boolean): void => {
  const attempts = getLoginAttempts(email);

  if (success) {
    // Clear attempts on successful login
    try {
      localStorage.removeItem(`${LOGIN_ATTEMPTS_KEY}_${email}`);
    } catch {
      // Ignore errors
    }
    return;
  }

  attempts.count += 1;
  attempts.lastAttempt = Date.now();

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  }

  try {
    localStorage.setItem(`${LOGIN_ATTEMPTS_KEY}_${email}`, JSON.stringify(attempts));
  } catch {
    // Ignore storage errors
  }
};

export const isAccountLocked = (email: string): { locked: boolean; remainingMs: number } => {
  const attempts = getLoginAttempts(email);

  if (!attempts.lockedUntil) {
    return { locked: false, remainingMs: 0 };
  }

  const remaining = attempts.lockedUntil - Date.now();

  if (remaining <= 0) {
    // Lockout expired, clear attempts
    try {
      localStorage.removeItem(`${LOGIN_ATTEMPTS_KEY}_${email}`);
    } catch {
      // Ignore errors
    }
    return { locked: false, remainingMs: 0 };
  }

  return { locked: true, remainingMs: remaining };
};

export const getRemainingAttempts = (email: string): number => {
  const attempts = getLoginAttempts(email);
  return Math.max(0, MAX_LOGIN_ATTEMPTS - attempts.count);
};
