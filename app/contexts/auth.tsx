import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth';
import type { User } from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  registerUser: (data: {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    password: string;
    agreeTerms: boolean;
  }) => Promise<void>;
  registerEventOrganizer: (data: {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    organizerName: string;
    password: string;
    agreeTerms: boolean;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUserData: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk refresh data user dari server
  const refreshUserData = async (): Promise<User> => {
    try {
      console.log('Refreshing user data...');
      setLoading(true);
      const userData = await authService.getCurrentUser();
      console.log('User data refreshed:', userData);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh user data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        if (authService.isAuthenticated()) {
          console.log('Token exists, fetching user data...');
          try {
            const userData = await authService.getCurrentUser();
            console.log('User data received:', userData);
            setUser(userData);
          } catch (fetchErr) {
            console.error('Error fetching user data:', fetchErr);
            
            // Mencoba membaca dari localStorage sebagai fallback
            const storedUserData = localStorage.getItem('userData');
            if (storedUserData) {
              try {
                console.log('Using cached user data');
                const parsedUserData = JSON.parse(storedUserData) as User;
                setUser(parsedUserData);
              } catch (parseErr) {
                console.error('Error parsing stored user data:', parseErr);
                setError('Failed to load user data');
              }
            } else {
              setError('Failed to fetch user data');
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
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
      console.log('Logging in...');
      const userData = await authService.login({ username, password, rememberMe });
      console.log('Login successful, user data:', userData);
      setUser(userData);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk registrasi pengguna biasa
  const registerUser = async (data: {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    password: string;
    agreeTerms: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.registerUser({
        ...data,
        role: 'user'
      });
      console.log('User registration successful, user data:', userData);
      setUser(userData);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerEventOrganizer = async (data: {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    organizerName: string;
    password: string;
    agreeTerms: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.registerEventOrganizer({
        ...data,
        role: 'eventOrganizer'
      });
      console.log('Registration successful, user data:', userData);
      setUser(userData);
    } catch (err) {
      console.error('Registration error:', err);
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
    registerUser,
    registerEventOrganizer,
    logout,
    isAuthenticated: !!user,
    refreshUserData
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