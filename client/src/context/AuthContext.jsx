import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { meRequest } from '../api/auth';
import { clearToken, getToken, saveToken } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    meRequest()
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      setSession: ({ token, user: nextUser }) => {
        saveToken(token);
        setUser(nextUser);
      },
      updateUser: (nextUser) => setUser((current) => ({ ...(current || {}), ...nextUser })),
      logout: () => {
        clearToken();
        setUser(null);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
