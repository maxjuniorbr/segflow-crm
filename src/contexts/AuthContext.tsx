import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { storageService } from '../services/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    setUser(null);
  };

  useEffect(() => {
    let cancelled = false;
    const validateSession = async () => {
      try {
        const response = await api.get('/api/auth/validate', { suppressToast: true, redirectOnAuthError: false });
        if (cancelled) return;
        if (response?.user) {
          const sessionUser = { ...response.user, isAuthenticated: true };
          setUser(sessionUser);
        } else {
          clearSession();
        }
      } catch (error) {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    validateSession();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback((userData: User) => {
    const sessionUser = { ...userData, isAuthenticated: true };
    setUser(sessionUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await storageService.logout();
    } catch (error) {
      console.error('Erro ao encerrar sessão', error);
    } finally {
      sessionStorage.clear();
      clearSession();
    }
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
