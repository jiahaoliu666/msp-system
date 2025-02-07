import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '@/context/ToastContext';
import { CognitoService } from '@/services/auth/cognito';

interface ForgotPasswordResult {
  success: boolean;
  data?: any;
  error?: {
    name: string;
    message: string;
    originalError?: any;
  };
}

interface UserCheckResult {
  success: boolean;
  exists?: boolean;
  error?: {
    name: string;
    message: string;
  };
}

export default function ForgotPassword() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [cooldownInterval, setCooldownInterval] = useState<NodeJS.Timeout | null>(null);
  const [verificationAttempts, setVerificationAttempts] = useState<number>(0);
  const MAX_VERIFICATION_ATTEMPTS = 3; // 最大嘗試次數

  // 處理組件卸載時清理定時器
  useEffect(() => {
    return () => {
      if (cooldownInterval) {
        clearInterval(cooldownInterval);
      }
    };
  }, [cooldownInterval]);

  // 開始冷卻計時
  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setCooldownInterval(interval);
  };

  // 檢查密碼是否符合規則
  const checkPasswordRules = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };
  };

  const validatePassword = (password: string) => {
    const rules = checkPasswordRules(password);
    const errors = [];
    if (!rules.length) errors.push('密碼長度必須至少為 8 個字符');
    if (!rules.uppercase) errors.push('密碼必須包含至少一個大寫字母');
    if (!rules.lowercase) errors.push('密碼必須包含至少一個小寫字母');
    if (!rules.number) errors.push('密碼必須包含至少一個數字');
    if (!rules.special) errors.push('密碼必須包含至少一個特殊字符 (!@#$%^&*)');
    return errors;
  };

  // 發送驗證碼
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('開始處理發送驗證碼請求...');
    
    if (cooldown > 0) {
      showToast('error', `請等待 ${cooldown} 秒後再試`);
      return;
    }

    if (!email) {
      showToast('error', '請輸入電子郵件地址');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('error', '請輸入有效的電子郵件地址');
      return;
    }

    setLoading(true);

    try {
      console.log('檢查用戶是否存在...');
      // 檢查用戶是否存在
      const userCheckResult = await CognitoService.checkUserExists(email).catch((error) => {
        console.error('檢查用戶存在時發生錯誤:', error);
        return {
          success: false,
          error: {
            name: error.name || 'UnexpectedError',
            message: error.message || '檢查用戶時發生錯誤'
          }
        } as UserCheckResult;
      });
      
      console.log('用戶檢查結果:', userCheckResult);
      
      if (!userCheckResult.success) {
        if (userCheckResult.error?.name === 'LimitExceededException') {
          startCooldown(300); // 5 分鐘冷卻
        }
        showToast('error', userCheckResult.error?.message || '檢查用戶時發生錯誤');
        setLoading(false);
        return;
      }

      if (!userCheckResult.exists) {
        showToast('error', '找不到此電子郵件帳號');
        setLoading(false);
        return;
      }

      console.log('開始發送忘記密碼驗證碼...');
      const result = await CognitoService.forgotPassword({ email }).catch((error) => {
        console.error('發送驗證碼時發生錯誤:', error);
        return {
          success: false,
          error: {
            name: error.name || 'UnexpectedError',
            message: error.message || '發送驗證碼失敗，請稍後再試'
          }
        };
      });
      
      console.log('發送驗證碼結果:', result);
      
      if (!result.success) {
        showToast('error', result.error?.message || '發送驗證碼失敗');
        
        if (result.error?.name === 'LimitExceededException') {
          startCooldown(300); // 5 分鐘冷卻
          setCodeSent(false);
          setVerificationCode('');
          setNewPassword('');
          setConfirmPassword('');
        }
        setLoading(false);
        return;
      }

      setCodeSent(true);
      showToast('success', '驗證碼已發送到您的電子郵件');
      startCooldown(60); // 開始 60 秒冷卻時間
      
      // 清空驗證碼相關的狀態
      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error: any) {
      // 處理任何未預期的錯誤
      console.error('發送驗證碼時發生未預期的錯誤:', error);
      showToast('error', '發送驗證碼時發生未預期的錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 重設密碼
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
        showToast('error', '驗證碼輸入錯誤次數過多，請重新發送驗證碼');
        setCodeSent(false);
        setVerificationCode('');
        setNewPassword('');
        setConfirmPassword('');
        setVerificationAttempts(0);
        startCooldown(300); // 5分鐘冷卻時間
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('error', '兩次輸入的密碼不一致');
        return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
        showToast('error', passwordErrors[0]);
        return;
    }

    setLoading(true);

    try {
        const result = await CognitoService.confirmForgotPassword({
            email,
            code: verificationCode,
            newPassword
        });

        if (!result.success) {
            if (result.error) {
                switch (result.error.name) {
                    case 'CodeMismatchException':
                        setVerificationAttempts(prev => prev + 1);
                        const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - (verificationAttempts + 1);
                        showToast('error', `驗證碼錯誤，還剩 ${remainingAttempts} 次嘗試機會`);
                        setVerificationCode('');
                        break;
                        
                    case 'ExpiredCodeException':
                        showToast('error', '驗證碼已過期，將自動重新發送新的驗證碼');
                        setVerificationCode('');
                        setNewPassword('');
                        setConfirmPassword('');
                        // 自動重新發送驗證碼
                        const resendResult = await CognitoService.forgotPassword({ email });
                        if (resendResult.success) {
                            showToast('success', '新的驗證碼已發送到您的電子郵件');
                            setVerificationAttempts(0);
                            startCooldown(60);
                        } else {
                            showToast('error', '重新發送驗證碼失敗，請手動重試');
                            setCodeSent(false);
                        }
                        break;
                        
                    case 'LimitExceededException':
                        showToast('error', '請求次數過多，請稍後再試');
                        setCodeSent(false);
                        setVerificationCode('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setVerificationAttempts(0);
                        startCooldown(300);
                        break;
                        
                    default:
                        showToast('error', result.error.message || '重設密碼失敗，請稍後再試');
                }
            }
            setLoading(false);
            return;
        }

        showToast('success', '密碼重設成功');
        router.push('/login');
        
    } catch (error: any) {
        console.error('重設密碼時發生錯誤:', error);
        showToast('error', '重設密碼時發生錯誤，請稍後再試');
    } finally {
        setLoading(false);
    }
  };

  // 重新發送驗證碼
  const handleResendCode = async () => {
    if (cooldown > 0) {
        showToast('error', `請等待 ${cooldown} 秒後再試`);
        return;
    }

    setLoading(true);
    try {
        const result = await CognitoService.forgotPassword({ email });
        
        if (!result.success && result.error) {
            showToast('error', result.error.message);
            
            if (result.error.name === 'LimitExceededException') {
                startCooldown(300);
                setCodeSent(false);
                setVerificationCode('');
                setNewPassword('');
                setConfirmPassword('');
            }
            return;
        }

        // 重設驗證嘗試次數
        setVerificationAttempts(0);
        showToast('success', '新的驗證碼已發送到您的電子郵件');
        startCooldown(60);
        setVerificationCode('');
    } catch (error: any) {
        console.error('重新發送驗證碼失敗:', error);
        showToast('error', '發送驗證碼失敗，請稍後再試');
    } finally {
        setLoading(false);
    }
  };

  const passwordRules = checkPasswordRules(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const allRulesPassed = Object.values(passwordRules).every(rule => rule) && passwordsMatch;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <img
            src="/metaage-logo1.png"
            alt="Logo"
            className="h-12 mx-auto transform transition-transform duration-300 hover:scale-105"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            忘記密碼
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {!codeSent ? '請輸入您的電子郵件以接收驗證碼' : '請輸入驗證碼和新密碼'}
          </p>
        </div>

        {!codeSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendCode}>
            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                電子郵件
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white/50 backdrop-blur-sm"
                placeholder="請輸入您的電子郵件"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-300 ${
                  loading || cooldown > 0
                    ? 'bg-blue-400 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    發送中...
                  </div>
                ) : cooldown > 0 ? (
                  <div className="flex items-center justify-center group">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {cooldown} 秒後可重試
                  </div>
                ) : (
                  <div className="flex items-center justify-center group">
                    <svg className="w-5 h-5 mr-2 transform transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    發送驗證碼
                  </div>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-6">
              <div className="group">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  驗證碼
                </label>
                <input
                  id="code"
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className={`appearance-none relative block w-full px-4 py-3 border ${
                    verificationAttempts > 0 ? 'border-yellow-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white/50 backdrop-blur-sm`}
                  placeholder="請輸入驗證碼"
                />
                {verificationAttempts > 0 && (
                    <p className="mt-2 text-sm text-yellow-600">
                        <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        還剩 {MAX_VERIFICATION_ATTEMPTS - verificationAttempts} 次嘗試機會
                    </p>
                )}
              </div>

              <div className="group">
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  新密碼
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white/50 backdrop-blur-sm pr-10"
                    placeholder="請輸入新密碼"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="group">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  確認密碼
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white/50 backdrop-blur-sm pr-10"
                    placeholder="請再次輸入新密碼"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 backdrop-blur-sm p-6 rounded-lg space-y-3 border border-blue-100 shadow-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">密碼要求</span>
              </div>
              <div className="ml-7 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordRules.length ? 'bg-green-500' : 'bg-gray-300'
                  } transition-colors duration-200`}>
                    {passwordRules.length && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">至少 8 個字符</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordRules.uppercase ? 'bg-green-500' : 'bg-gray-300'
                  } transition-colors duration-200`}>
                    {passwordRules.uppercase && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">包含大寫字母</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordRules.lowercase ? 'bg-green-500' : 'bg-gray-300'
                  } transition-colors duration-200`}>
                    {passwordRules.lowercase && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">包含小寫字母</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordRules.number ? 'bg-green-500' : 'bg-gray-300'
                  } transition-colors duration-200`}>
                    {passwordRules.number && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">包含數字</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordRules.special ? 'bg-green-500' : 'bg-gray-300'
                  } transition-colors duration-200`}>
                    {passwordRules.special && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">包含特殊字符 (!@#$%^&*)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordsMatch ? 'bg-green-500' : (confirmPassword ? 'bg-red-500' : 'bg-gray-300')
                  } transition-colors duration-200`}>
                    {passwordsMatch && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {!passwordsMatch && confirmPassword && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${
                    !confirmPassword ? 'text-gray-600' : 
                    (passwordsMatch ? 'text-green-600' : 'text-red-600')
                  } transition-colors duration-200`}>
                    {!confirmPassword ? '密碼需要匹配' :
                     (passwordsMatch ? '密碼匹配' : '密碼不匹配')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !allRulesPassed}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-300 ${
                  loading || !allRulesPassed
                    ? 'bg-blue-400 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    處理中...
                  </div>
                ) : (
                  <div className="flex items-center justify-center group">
                    <svg className="w-5 h-5 mr-2 transform transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    {allRulesPassed ? '重設密碼' : '請符合所有密碼要求'}
                  </div>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading || cooldown > 0}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `${cooldown} 秒後可重新發送` : '重新發送驗證碼'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            返回登入
          </button>
        </div>
      </div>
    </div>
  );
} 