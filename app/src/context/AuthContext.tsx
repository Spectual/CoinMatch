import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { fetchProfile, loginRequest, logoutRequest } from '../api';

interface AuthUser {
  name: string;
  email: string;
  role?: string;
}

interface StoredSession {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'coinmatch:session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLoading(false);
      return;
    }

    async function restoreSession() {
      try {
        const parsed = JSON.parse(raw!) as StoredSession;
        setToken(parsed.token);
        setUser(parsed.user);
        try {
          const profile = await fetchProfile(parsed.token);
          setUser(profile);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: parsed.token, user: profile }));
        } catch (profileError) {
          console.warn('Failed to refresh profile', profileError);
        }
      } catch (error) {
        console.warn('Failed to restore session', error);
        window.localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession().catch((error) => {
      console.error('Unexpected error restoring session', error);
    setLoading(false);
    });
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    const response = await loginRequest(email, password);
    setToken(response.token);
    setUser(response.user);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: response.token, user: response.user }));
  };

  const logout = async () => {
    if (token) {
      try {
        await logoutRequest(token);
      } catch (error) {
        console.warn('Failed to notify server about logout', error);
      }
    }
    setToken(null);
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
