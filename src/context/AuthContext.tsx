import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CognitoService, LoginParams } from '@/services/auth/cognito';
import { useToast } from '@/context/ToastContext';

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
  const { showToast } = useToast();

  useEffect(() => {
    // 檢查本地存儲的認證狀態
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          setUser(userInfo);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async ({ email, password }: LoginParams) => {
    try {
      const response = await CognitoService.login({ email, password });
      
      if (!response.AuthenticationResult?.AccessToken) {
        throw new Error('驗證失敗：未收到有效的認證令牌');
      }

      // 保存認證資訊
      const { AccessToken } = response.AuthenticationResult;
      localStorage.setItem('authToken', AccessToken);
      
      // 保存用戶資訊
      const userInfo = { 
        email,
        token: AccessToken,
        lastLoginTime: new Date().toISOString()
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      setUser(userInfo);
      
      // 顯示成功訊息並重定向
      showToast('success', '登入成功');
      router.push('/');
    } catch (error: any) {
      // 清除認證資訊
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      setUser(null);
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