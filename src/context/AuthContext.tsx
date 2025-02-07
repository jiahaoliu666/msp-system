import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { CognitoService, LoginParams } from '@/services/auth/cognito';
import { useToast } from '@/context/ToastContext';
import { AdminInitiateAuthCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { AWS_CONFIG } from '@/config/aws-config';
import { DB_CONFIG } from '@/config/db-config';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: LoginParams) => Promise<void>;
  logout: () => void;
  completeNewPasswordChallenge: (newPassword: string, session: string, email: string) => Promise<void>;
  userRole: string | null;
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
  userRole: null,
});

export const useAuth = () => useContext(AuthContext);

// 定義不需要驗證的頁面路徑
const PUBLIC_PATHS = ['/login', '/404', '/change-password', '/forgot-password'];
// 定義客戶角色只能訪問的頁面
const CUSTOMER_PATHS = ['/user-portal'];

// 路由保護 hook
export function useProtectedRoute() {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const previousAuthState = useRef(isAuthenticated);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const currentPath = router.pathname;
    const isLoginPage = currentPath === '/login';
    const isRootPath = currentPath === '/';
    
    if (isLoginPage || PUBLIC_PATHS.includes(currentPath)) {
      return;
    }

    const wasAuthenticated = previousAuthState.current;
    previousAuthState.current = isAuthenticated;
    const isLogoutTransition = wasAuthenticated && !isAuthenticated;

    if (!isAuthenticated && !isLogoutTransition) {
      if (router.pathname === '/login') {
        return;
      }

      if (!isRootPath) {
        showToast('error', '請先登入');
      }
      
      const query = isRootPath ? {} : { returnUrl: router.asPath };
      router.replace({
        pathname: '/login',
        query
      });
      return;
    }

    // 檢查客戶角色的訪問權限
    if (isAuthenticated && userRole === '客戶') {
      if (!CUSTOMER_PATHS.includes(currentPath)) {
        showToast('error', '您沒有權限訪問此頁面');
        router.replace('/user-portal');
      }
    }
  }, [isAuthenticated, isLoading, router, showToast, userRole]);

  return { isAuthenticated, isLoading, userRole };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  // 檢查用戶角色
  const checkUserRole = async (email: string) => {
    try {
      const dynamodb = new DynamoDB({ ...AWS_CONFIG });
      const params = {
        TableName: DB_CONFIG.tables.USER_MANAGEMENT,
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': { S: email }
        }
      };

      const response = await dynamodb.query(params);
      if (response.Items && response.Items.length > 0) {
        const role = response.Items[0].role?.S || null;
        setUserRole(role);
        return role;
      }
      return null;
    } catch (error) {
      console.error('檢查用戶角色失敗:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          setUser(userInfo);
          if (userInfo.email) {
            await checkUserRole(userInfo.email);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        setUser(null);
        setUserRole(null);
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

      const response = await CognitoService.login({ email, password });

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

      if (!('AuthenticationResult' in response)) {
        throw new Error('系統錯誤：收到未知的響應類型');
      }

      if (!response.AuthenticationResult) {
        throw new Error('系統錯誤：未收到認證結果');
      }

      const { AccessToken = '', IdToken = '', RefreshToken = '' } = response.AuthenticationResult;
      
      if (!AccessToken) {
        throw new Error('系統錯誤：未收到有效的認證令牌');
      }

      localStorage.setItem('authToken', AccessToken);
      localStorage.setItem('idToken', IdToken);
      localStorage.setItem('refreshToken', RefreshToken);
      
      const userInfo = { 
        email,
        accessToken: AccessToken,
        idToken: IdToken,
        refreshToken: RefreshToken,
        lastLoginTime: new Date().toISOString()
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      setUser(userInfo);

      // 檢查用戶角色並根據角色重定向
      const role = await checkUserRole(email);
      if (role === '客戶') {
        router.push('/user-portal');
      } else {
        router.push('/');
      }
      
      showToast('success', '登入成功');

    } catch (error: any) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      setUser(null);
      setUserRole(null);
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
        userRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 