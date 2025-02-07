import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { CognitoService, LoginParams } from '@/services/auth/cognito';
import { useToast } from '@/context/ToastContext';
import { AdminInitiateAuthCommandOutput, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { AWS_CONFIG } from '@/config/aws-config';
import { DB_CONFIG } from '@/config/db-config';
import { COGNITO_CONFIG } from '@/config/cognito-config';
import { cognitoClient } from '@/config/cognito-config';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
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
  login: async ({ email, password }) => { throw new Error('Context not initialized') },
  logout: () => { throw new Error('Context not initialized') },
  completeNewPasswordChallenge: async (newPassword, session, email) => { 
    throw new Error('Context not initialized') 
  },
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

      if (!isRootPath && !router.query.from) {
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
  const statusCheckInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  // 檢查用戶狀態
  const checkUserStatus = async (email: string) => {
    try {
      if (!email) return;
      
      const command = new AdminGetUserCommand({
        UserPoolId: COGNITO_CONFIG.userPoolId,
        Username: email
      });

      const response = await cognitoClient.send(command);
      
      if (response.Enabled === false) {
        console.log('用戶已被停用，執行強制登出...');
        handleDisabledUser();
      }
    } catch (error: any) {
      console.error('檢查用戶狀態失敗:', error);
      if (error.name === 'UserNotFoundException') {
        handleDeletedUser();
      }
    }
  };

  // 處理用戶被停用的情況
  const handleDisabledUser = () => {
    // 清除所有認證相關的 localStorage 數據
    localStorage.removeItem('authToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    localStorage.clear();
    
    // 停止定期檢查
    stopStatusCheck();
    
    // 重置用戶狀態
    setUser(null);
    setUserRole(null);

    // 顯示停用訊息
    showToast('error', '此用戶暫停使用中，請洽詢系統管理員');
    
    // 導向登入頁面，添加 from=disabled 參數
    router.push({
      pathname: '/login',
      query: { from: 'disabled' }
    });
  };

  // 處理用戶被刪除的情況
  const handleDeletedUser = () => {
    // 清除所有認證相關的 localStorage 數據
    localStorage.removeItem('authToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    localStorage.clear();
    
    // 停止定期檢查
    stopStatusCheck();
    
    // 重置用戶狀態
    setUser(null);
    setUserRole(null);

    // 顯示刪除訊息
    showToast('error', '用戶帳號已被刪除，系統將自動登出');
    
    // 導向登入頁面
    router.push('/login');
  };

  // 開始定期檢查用戶狀態
  const startStatusCheck = (email: string) => {
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }
    
    // 每 5 分鐘檢查一次用戶狀態
    statusCheckInterval.current = setInterval(() => {
      checkUserStatus(email);
    }, 5 * 60 * 1000);
  };

  // 停止定期檢查
  const stopStatusCheck = () => {
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
      statusCheckInterval.current = undefined;
    }
  };

  // 檢查用戶角色
  const checkUserRole = async (email: string) => {
    try {
      const client = new DynamoDBClient({
        region: AWS_CONFIG.region,
        credentials: AWS_CONFIG.credentials
      });

      const docClient = DynamoDBDocumentClient.from(client);
      
      const command = new QueryCommand({
        TableName: DB_CONFIG.tables.USER_MANAGEMENT,
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        }
      });

      const response = await docClient.send(command);

      if (response.Items && response.Items.length > 0) {
        const role = response.Items[0].role || null;
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
            // 初始檢查用戶狀態
            await checkUserStatus(userInfo.email);
            // 開始定期檢查
            startStatusCheck(userInfo.email);
          }
        } else {
          setUser(null);
          setUserRole(null);
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

    return () => {
      stopStatusCheck();
    };
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

      // 開始定期檢查用戶狀態
      startStatusCheck(email);

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
      stopStatusCheck();
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
    localStorage.clear();
    
    // 停止定期檢查
    stopStatusCheck();
    
    // 重置用戶狀態
    setUser(null);
    setUserRole(null);
    
    // 顯示登出成功訊息
    showToast('success', '已成功登出');
    
    // 導向登入頁面
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