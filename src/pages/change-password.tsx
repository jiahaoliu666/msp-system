import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ChangePassword() {
  const router = useRouter();
  const { completeNewPasswordChallenge } = useAuth();
  const { showToast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { email, session } = router.query;

  useEffect(() => {
    if (!email || !session) {
      showToast('error', '無效的請求參數');
      router.push('/login');
    }
  }, [email, session, router, showToast]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 驗證密碼
      const passwordErrors = validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        setError(passwordErrors.join('\n'));
        showToast('error', '密碼不符合要求');
        setLoading(false);
        return;
      }

      // 確認密碼是否匹配
      if (newPassword !== confirmPassword) {
        setError('兩次輸入的密碼不一致');
        showToast('error', '兩次輸入的密碼不一致');
        setLoading(false);
        return;
      }

      try {
        // 更改密碼
        await completeNewPasswordChallenge(
          newPassword,
          session as string,
          email as string
        );

        showToast('success', '密碼更改成功');
        router.push('/');
      } catch (err: any) {
        console.error('密碼更改失敗:', err);
        
        // 處理 NotAuthorizedException
        if (err.name === 'NotAuthorizedException') {
          setError('登入階段已過期，請重新登入');
          showToast('error', '登入階段已過期，請重新登入');
          // 延遲 2 秒後跳轉到登入頁面
          setTimeout(() => {
            router.push({
              pathname: '/login',
              query: { message: '登入階段已過期，請重新登入' }
            });
          }, 2000);
          return;
        }

        // 處理其他錯誤
        const errorMessages = {
          InvalidPasswordException: '密碼格式不正確，請確認是否符合所有要求',
          LimitExceededException: '嘗試次數過多，請稍後再試',
          ExpiredCodeException: '驗證碼已過期，請重新登入',
          CodeMismatchException: '驗證碼錯誤',
          TooManyFailedAttemptsException: '嘗試次數過多，帳號已被暫時鎖定',
          TooManyRequestsException: '請求次數過多，請稍後再試',
          InternalErrorException: '系統發生錯誤，請稍後再試',
          default: '密碼更改失敗，請稍後再試'
        };

        const errorMessage = errorMessages[err.name as keyof typeof errorMessages] || errorMessages.default;
        setError(errorMessage);
        showToast('error', errorMessage);
      } finally {
        setLoading(false);
      }
    } catch (err: any) {
      console.error('密碼驗證失敗:', err);
      setError('發生錯誤，請稍後再試');
      showToast('error', '發生錯誤，請稍後再試');
      setLoading(false);
    }
  };

  const passwordRules = checkPasswordRules(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const allRulesPassed = Object.values(passwordRules).every(rule => rule) && passwordsMatch;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl border border-gray-100">
        <div className="space-y-6">
          <img
            src="/metaage-logo1.png"
            alt="Logo"
            className="h-12 mx-auto transform transition-transform duration-300 hover:scale-105"
          />
          <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            更改密碼
          </h2>
          <p className="text-center text-sm text-gray-600">
            請設置符合安全要求的新密碼
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="group">
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                新密碼
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  name="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white/50 backdrop-blur-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white/50 backdrop-blur-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-100 shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </h3>
                </div>
              </div>
            </div>
          )}

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
                  {allRulesPassed ? '更改密碼' : '請符合所有密碼要求'}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 