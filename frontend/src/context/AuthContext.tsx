import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { setToken, getToken } from '../api/client';
import type { User } from '../types';
import { showToast } from '../components/Toast';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: (reason?: string) => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const USER_KEY = 'duhuza_user';
const LAST_ACTIVITY_KEY = 'duhuza_last_activity';

// 10 minutes session inactivity timeout (600,000 ms)
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
// Warning at 9 minutes (60 seconds before logout)
const WARNING_TIMEOUT_MS = 9 * 60 * 1000;

function loadUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => (getToken() ? loadUser() : null));
  const warningShownRef = useRef(false);
  const lastEventTimeRef = useRef(Date.now());

  const logout = useCallback((reason?: string) => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    setUser(null);

    if (reason === 'inactivity') {
      sessionStorage.setItem('duhuza_logout_reason', 'inactivity');
      showToast('Session expired after 10 minutes of inactivity. Please log in again.', 'info');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?reason=inactivity';
      }
    }
  }, []);

  const login = useCallback((token: string, u: User) => {
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    lastEventTimeRef.current = Date.now();
    warningShownRef.current = false;
    sessionStorage.removeItem('duhuza_logout_reason');
    setUser(u);
  }, []);

  const updateUser = useCallback((updatedFields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  useEffect(() => {
    if (getToken() && !user) {
      setUser(loadUser());
    }
  }, [user]);

  // =========================================================================
  // Inactivity Auto-Logout Tracker (10 Minutes Inactivity)
  // =========================================================================
  useEffect(() => {
    if (!user) return;

    const recordActivity = () => {
      const now = Date.now();
      // Throttle storage writes to once every 5 seconds
      if (now - lastEventTimeRef.current > 5000) {
        lastEventTimeRef.current = now;
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
        if (warningShownRef.current) {
          warningShownRef.current = false;
        }
      }
    };

    // User activity event listeners
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((evt) => window.addEventListener(evt, recordActivity, { passive: true }));

    // Periodic check every 10 seconds
    const interval = setInterval(() => {
      const storedLastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || lastEventTimeRef.current;
      const idleTime = Date.now() - storedLastActivity;

      if (idleTime >= INACTIVITY_TIMEOUT_MS) {
        clearInterval(interval);
        logout('inactivity');
      } else if (idleTime >= WARNING_TIMEOUT_MS && !warningShownRef.current) {
        warningShownRef.current = true;
        showToast('Inactivity Notice: You will be logged out in 60 seconds. Move mouse or press any key to stay active.', 'info');
      }
    }, 10000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, recordActivity));
      clearInterval(interval);
    };
  }, [user, logout]);

  const value = useMemo(
    () => ({ user, isLoading: false, login, logout, updateUser }),
    [user, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useAuthOptional() {
  return useContext(AuthContext);
}
