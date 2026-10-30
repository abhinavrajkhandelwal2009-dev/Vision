import React, { createContext, useContext, useState, useEffect } from 'react';
import { SafeUser, UserRole } from '../server/types.ts';
import { api, getAuthToken, removeAuthToken } from '../services/api.ts';

interface AuthContextType {
  user: SafeUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; role?: UserRole }) => Promise<void>;
  logout: () => void;
  switchRoleDemo: (role: UserRole) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        // Automatically log in as default demo operator for seamless first-load experience
        try {
          const res = await api.login('operator@visionintel.ai', 'OperatorPass123!');
          setUser(res.user);
        } catch {
          // It's okay if not logged in
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const { user } = await api.getMe();
        setUser(user);
      } catch (e) {
        console.warn('Session expired or invalid token:', e);
        removeAuthToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (data: { email: string; password: string; fullName: string; role?: UserRole }) => {
    setError(null);
    try {
      const res = await api.register(data);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const switchRoleDemo = async (role: UserRole) => {
    setLoading(true);
    try {
      if (role === 'admin') {
        await login('admin@visionintel.ai', 'AdminPass123!');
      } else if (role === 'inspector') {
        await login('inspector@visionintel.ai', 'InspectPass123!');
      } else {
        await login('operator@visionintel.ai', 'OperatorPass123!');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        switchRoleDemo,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
