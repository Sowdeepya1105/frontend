import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'fa-sem-auth';

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, user: null, ready: false });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAuth({ ...parsed, ready: true });
      } catch {
        setAuth({ token: null, user: null, ready: true });
      }
    } else {
      setAuth({ token: null, user: null, ready: true });
    }
  }, []);

  useEffect(() => {
    if (!auth.ready) return;
    if (auth.token && auth.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: auth.token, user: auth.user }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  const login = useCallback((token, user) => {
    setAuth({ token, user, ready: true });
  }, []);

  const logout = useCallback(() => {
    setAuth({ token: null, user: null, ready: true });
  }, []);

  useEffect(() => {
    window.appState = {
      authUser: auth.user,
      token: auth.token,
      users: [],
      projects: [],
      issues: [],
      comments: [],
      filters: {},
      analytics: {},
    };
  }, [auth.user, auth.token]);

  const value = useMemo(
    () => ({ token: auth.token, user: auth.user, ready: auth.ready, login, logout }),
    [auth, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
