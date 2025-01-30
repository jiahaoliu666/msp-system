import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { CognitoService, LoginParams } from '@/services/auth/cognito';
import { useToast } from '@/context/ToastContext';
import { AdminInitiateAuthCommandOutput } from '@aws-sdk/client-cognito-identity-provider';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: LoginParams) => Promise<void>;
  logout: () => void;
  completeNewPasswordChallenge: (newPassword: string, session: string, email: string) => Promise<void>;
}

interface NewPasswordRequiredResponse {
  challengeName: "NEW_PASSWORD_REQUIRED";
  session: string;
  email: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  completeNewPasswordChallenge: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// 定義不需要驗證的頁面路徑
const PUBLIC_PATHS = ['/login', '/change-password', '/404'];

// 路由保護 hook
export function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const previousAuthState = useRef(isAuthenticated);

  useEffect(() => {
    // 如果還在載入中，不做任何處理
    if (isLoading) {
      return;
    }

    // 檢查當前頁面是否為登入頁面（包括帶有查詢參數的情況）
    const currentPath = router.pathname;  // 使用 pathname 而不是 asPath
    const isLoginPage = currentPath === '/login';
    
    // 如果是登入頁面或其他公開頁面，直接返回，不執行任何提示或重定向
    if (isLoginPage || PUBLIC_PATHS.includes(currentPath)) {
      return;
    }

    // 更新前一個認證狀態
    const wasAuthenticated = previousAuthState.current;
    previousAuthState.current = isAuthenticated;

    // 檢查是否為登出轉換（從已登入變為未登入）
    const isLogoutTransition = wasAuthenticated && !isAuthenticated;

    // 只在需要認證的頁面且未登入的情況下重定向
    if (!isAuthenticated && !isLogoutTransition) {
      // 檢查是否已經在登入頁面
      if (router.pathname === '/login') {
        return;
      }

      // 只有在非登入頁面時才顯示提示
      showToast('error', '請先登入');
      
      // 如果當前路徑不是根路徑，則添加 returnUrl
      const query = currentPath === '/' ? {} : { returnUrl: router.asPath };
      
      router.replace({
        pathname: '/login',
        query
      });
    }
  }, [isAuthenticated, isLoading, router, showToast]);

  return { isAuthenticated, isLoading };
}

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
      console.log('AuthContext: 開始登入流程...', { email });
      
      if (!email || !password) {
        console.error('AuthContext: 缺少必要的登入參數');
        throw new Error('請提供電子郵件和密碼');
      }

      console.log('AuthContext: 調用 CognitoService.login...');
      
      const response = await CognitoService.login({ email, password });

      // 檢查是否需要更改密碼
      if ('challengeName' in response && response.challengeName === 'NEW_PASSWORD_REQUIRED') {
        console.log('AuthContext: 需要更改密碼');
        if (!response.session) {
          throw new Error('系統錯誤：未收到有效的會話令牌');
        }
        router.push({
          pathname: '/change-password',
          query: {
            email: response.email,
            session: response.session
          }
        });
        return;
      }

      // 如果不是密碼更改挑戰，則必須是一個成功的認證響應
      if (!('AuthenticationResult' in response)) {
        throw new Error('系統錯誤：收到未知的響應類型');
      }
      
      console.log('AuthContext: 收到登入響應', {
        hasAuthResult: !!response.AuthenticationResult,
        hasAccessToken: !!response.AuthenticationResult?.AccessToken,
        hasIdToken: !!response.AuthenticationResult?.IdToken,
        hasRefreshToken: !!response.AuthenticationResult?.RefreshToken,
      });
      
      if (!response.AuthenticationResult?.AccessToken) {
        console.error('AuthContext: 驗證失敗 - 未收到有效的認證令牌');
        throw new Error('驗證失敗：未收到有效的認證令牌');
      }

      // 保存認證資訊
      const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;
      localStorage.setItem('authToken', AccessToken);
      localStorage.setItem('idToken', IdToken || '');
      localStorage.setItem('refreshToken', RefreshToken || '');
      
      // 保存用戶資訊
      const userInfo = { 
        email,
        accessToken: AccessToken,
        idToken: IdToken,
        refreshToken: RefreshToken,
        lastLoginTime: new Date().toISOString()
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      setUser(userInfo);
      
      console.log('AuthContext: 登入成功，準備重定向...');
      
      // 顯示成功訊息並重定向
      showToast('success', '登入成功');
      router.push('/');
    } catch (error: any) {
      console.error('AuthContext: 登入錯誤:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
        $metadata: error.$metadata
      });
      
      // 清除認證資訊
      localStorage.removeItem('authToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      setUser(null);
      
      // 重新拋出錯誤以便上層組件處理
      throw error;
    }
  };

  const completeNewPasswordChallenge = async (newPassword: string, session: string, email: string) => {
    try {
      console.log('AuthContext: 開始處理密碼更改挑戰...');
      
      const response = await CognitoService.completeNewPasswordChallenge({
        email,
        session,
        newPassword
      });

      if (!response.AuthenticationResult?.AccessToken) {
        throw new Error('密碼更改失敗：未收到有效的認證令牌');
      }

      // 保存認證資訊
      const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;
      localStorage.setItem('authToken', AccessToken);
      localStorage.setItem('idToken', IdToken || '');
      localStorage.setItem('refreshToken', RefreshToken || '');
      
      // 保存用戶資訊
      const userInfo = { 
        email,
        accessToken: AccessToken,
        idToken: IdToken,
        refreshToken: RefreshToken,
        lastLoginTime: new Date().toISOString()
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      setUser(userInfo);

      showToast('success', '密碼更改成功');
      router.push('/');
    } catch (error: any) {
      console.error('密碼更改失敗:', error);
      showToast('error', error.message || '密碼更改失敗，請稍後再試');
      throw error;
    }
  };

  const logout = () => {
    // 清除所有認證相關的 localStorage 數據
    localStorage.removeItem('authToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    localStorage.clear(); // 清除所有其他可能的數據
    
    // 重置用戶狀態
    setUser(null);
    
    // 顯示登出成功訊息
    showToast('success', '已成功登出');
    
    // 導向登入頁面，並添加 from=logout 參數
    router.push({
      pathname: '/login',
      query: { from: 'logout' }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        completeNewPasswordChallenge,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 