import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth';
import type { User } from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  registerEventOrganizer: (data: {
    fullName: string;
    email: string;
    phone: string;
    organizationName: string;
    password: string;
    agreeTerms: boolean;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.login({ username, password, rememberMe });
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerEventOrganizer = async (data: {
    fullName: string;
    email: string;
    phone: string;
    organizationName: string;
    password: string;
    agreeTerms: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.registerEventOrganizer(data);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout().catch((err) => {
      console.error('Logout failed:', err);
    });
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    registerEventOrganizer,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 