import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from './api';

interface User {
  id: number;
  email: string;
  motivation_type: string;
  // 他のユーザープロファイル情報
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      // TODO: トークンを検証し、ユーザー情報を取得するAPIコールを追加
      // 例: api.get('/auth/users/me').then(response => setUser(response.data));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/token', 
        `username=${email}&password=${password}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      setToken(access_token);

      // ユーザー情報を取得
      const userResponse = await api.get<User>('/auth/users/me');
      setUser(userResponse.data);

    } catch (error) {
      console.error('Login failed:', error);
      logout(); // ログイン失敗時はログアウト状態にする
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
