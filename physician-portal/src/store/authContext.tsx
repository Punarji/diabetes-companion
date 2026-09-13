import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, saveToken, clearToken } from '../services/apiClient';

type Physician = {
  id: string;
  full_name: string;
  email: string;
  role: string;
};

type AuthContextValue = {
  physician: Physician | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [physician, setPhysician] = useState<Physician | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    apiClient
      .get('/api/v1/users/me')
      .then(({ data }) => setPhysician(data))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    const { data } = await apiClient.post('/api/v1/auth/login', form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    saveToken(data.access_token);

    const { data: me } = await apiClient.get('/api/v1/users/me');
    if (me.role !== 'physician') {
      clearToken();
      throw new Error('This portal is for physicians only. Please use the patient app instead.');
    }
    setPhysician(me);
  };

  const logout = () => {
    clearToken();
    setPhysician(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ physician, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
