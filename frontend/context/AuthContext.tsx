import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getCookie, deleteCookie } from '@/lib/cookies';

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      return res.data;
    } catch (err) {
      setUser(null);
      throw err;
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        await refreshUser();
      } catch (err) {
        // Not logged in
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    await refreshUser();
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      // Clear all cookies and local storage
      deleteCookie('token');
      deleteCookie('user');
      deleteCookie('role');
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      sessionStorage.clear();
      router.push('/signin');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
