import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CognitoService, LoginParams } from '@/services/auth/cognito';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: LoginParams) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 檢查本地存儲的認證狀態
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // TODO: 驗證 token 有效性
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          setUser(userInfo);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async ({ email, password }: LoginParams) => {
    try {
      const response = await CognitoService.login({ email, password });
      const token = response.AuthenticationResult?.AccessToken;
      
      if (token) {
        localStorage.setItem('authToken', token);
        // TODO: 解析 JWT 獲取用戶信息或調用獲取用戶信息的 API
        const userInfo = { email }; // 簡化示例
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        setUser(userInfo);
        router.push('/'); // 登入成功後重定向到首頁
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 