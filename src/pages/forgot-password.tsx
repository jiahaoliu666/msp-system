import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useToast } from "@/context/ToastContext"
import { CognitoService } from "@/services/auth/cognito"
import { FaEye, FaEyeSlash } from "react-icons/fa"

interface ForgotPasswordResult {
  success: boolean
  data?: any
  error?: {
    name: string
    message: string
    originalError?: any
  }
}

interface UserCheckResult {
  success: boolean
  exists?: boolean
  error?: {
    name: string
    message: string
  }
}

export default function ForgotPassword() {
  const router = useRouter()
  const { showToast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [cooldownInterval, setCooldownInterval] = useState<NodeJS.Timeout | null>(null)
  const [verificationAttempts, setVerificationAttempts] = useState<number>(0)
  const MAX_VERIFICATION_ATTEMPTS = 3

  useEffect(() => {
    return () => {
      if (cooldownInterval) {
        clearInterval(cooldownInterval)
      }
    }
  }, [cooldownInterval])

  const startCooldown = (seconds: number) => {
    setCooldown(seconds)
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setCooldownInterval(interval)
  }

  const checkPasswordRules = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    }
  }

  const validatePassword = (password: string) => {
    const rules = checkPasswordRules(password)
    const errors = []
    if (!rules.length) errors.push("密碼長度必須至少為 8 個字符")
    if (!rules.uppercase) errors.push("密碼必須包含至少一個大寫字母")
    if (!rules.lowercase) errors.push("密碼必須包含至少一個小寫字母")
    if (!rules.number) errors.push("密碼必須包含至少一個數字")
    if (!rules.special) errors.push("密碼必須包含至少一個特殊字符 (!@#$%^&*)")
    return errors
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("開始處理發送驗證碼請求...")

    if (cooldown > 0) {
      showToast("error", `請等待 ${cooldown} 秒後再試`)
      return
    }

    if (!email) {
      showToast("error", "請輸入電子郵件地址")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("error", "請輸入有效的電子郵件地址")
      return
    }

    setLoading(true)

    try {
      console.log("檢查用戶是否存在...")
      // 檢查用戶是否存在
      const userCheckResult = await CognitoService.checkUserExists(email).catch((error) => {
        console.error("檢查用戶存在時發生錯誤:", error)
        return {
          success: false,
          error: {
            name: error.name || "UnexpectedError",
            message: error.message || "檢查用戶時發生錯誤",
          },
        } as UserCheckResult
      })

      console.log("用戶檢查結果:", userCheckResult)

      if (!userCheckResult.success) {
        if (userCheckResult.error?.name === "LimitExceededException") {
          startCooldown(300) // 5 分鐘冷卻
        }
        showToast("error", userCheckResult.error?.message || "檢查用戶時發生錯誤")
        setLoading(false)
        return
      }

      if (!userCheckResult.exists) {
        showToast("error", "找不到此電子郵件帳號")
        setLoading(false)
        return
      }

      console.log("開始發送忘記密碼驗證碼...")
      const result = await CognitoService.forgotPassword({ email }).catch((error) => {
        console.error("發送驗證碼時發生錯誤:", error)
        return {
          success: false,
          error: {
            name: error.name || "UnexpectedError",
            message: error.message || "發送驗證碼失敗，請稍後再試",
          },
        }
      })

      console.log("發送驗證碼結果:", result)

      if (!result.success) {
        showToast("error", result.error?.message || "發送驗證碼失敗")

        if (result.error?.name === "LimitExceededException") {
          startCooldown(300) // 5 分鐘冷卻
          setCodeSent(false)
          setVerificationCode("")
          setNewPassword("")
          setConfirmPassword("")
        }
        setLoading(false)
        return
      }

      setCodeSent(true)
      showToast("success", "驗證碼已發送到您的電子郵件")
      startCooldown(60) // 開始 60 秒冷卻時間

      // 清空驗證碼相關的狀態
      setVerificationCode("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      // 處理任何未預期的錯誤
      console.error("發送驗證碼時發生未預期的錯誤:", error)
      showToast("error", "發送驗證碼時發生未預期的錯誤，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      showToast("error", "驗證碼輸入錯誤次數過多，請重新發送驗證碼")
      setCodeSent(false)
      setVerificationCode("")
      setNewPassword("")
      setConfirmPassword("")
      setVerificationAttempts(0)
      startCooldown(300) // 5分鐘冷卻時間
      return
    }

    if (newPassword !== confirmPassword) {
      showToast("error", "兩次輸入的密碼不一致")
      return
    }

    const passwordErrors = validatePassword(newPassword)
    if (passwordErrors.length > 0) {
      showToast("error", passwordErrors[0])
      return
    }

    setLoading(true)

    try {
      const result = await CognitoService.confirmForgotPassword({
        email,
        code: verificationCode,
        newPassword,
      })

      if (!result.success) {
        if (result.error) {
          switch (result.error.name) {
            case "CodeMismatchException":
              setVerificationAttempts((prev) => prev + 1)
              const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - (verificationAttempts + 1)
              showToast("error", `驗證碼錯誤，還剩 ${remainingAttempts} 次嘗試機會`)
              setVerificationCode("")
              break

            case "ExpiredCodeException":
              showToast("error", "驗證碼已過期，將自動重新發送新的驗證碼")
              setVerificationCode("")
              setNewPassword("")
              setConfirmPassword("")
              // 自動重新發送驗證碼
              const resendResult = await CognitoService.forgotPassword({ email })
              if (resendResult.success) {
                showToast("success", "新的驗證碼已發送到您的電子郵件")
                setVerificationAttempts(0)
                startCooldown(60)
              } else {
                showToast("error", "重新發送驗證碼失敗，請手動重試")
                setCodeSent(false)
              }
              break

            case "LimitExceededException":
              showToast("error", "請求次數過多，請稍後再試")
              setCodeSent(false)
              setVerificationCode("")
              setNewPassword("")
              setConfirmPassword("")
              setVerificationAttempts(0)
              startCooldown(300)
              break

            default:
              showToast("error", result.error.message || "重設密碼失敗，請稍後再試")
          }
        }
        setLoading(false)
        return
      }

      showToast("success", "密碼重設成功")
      router.push("/login")
    } catch (error: any) {
      console.error("重設密碼時發生錯誤:", error)
      showToast("error", "重設密碼時發生錯誤，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (cooldown > 0) {
      showToast("error", `請等待 ${cooldown} 秒後再試`)
      return
    }

    setLoading(true)
    try {
      const result = await CognitoService.forgotPassword({ email })

      if (!result.success && result.error) {
        showToast("error", result.error.message)

        if (result.error.name === "LimitExceededException") {
          startCooldown(300)
          setCodeSent(false)
          setVerificationCode("")
          setNewPassword("")
          setConfirmPassword("")
        }
        return
      }

      // 重設驗證嘗試次數
      setVerificationAttempts(0)
      showToast("success", "新的驗證碼已發送到您的電子郵件")
      startCooldown(60)
      setVerificationCode("")
    } catch (error: any) {
      console.error("重新發送驗證碼失敗:", error)
      showToast("error", "發送驗證碼失敗，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  const passwordRules = checkPasswordRules(newPassword)
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword
  const allRulesPassed = Object.values(passwordRules).every((rule) => rule) && passwordsMatch

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
      {/* 右側 - 忘記密碼表單 */}
      <div className="w-full flex items-center justify-center p-8 sm:p-12 bg-gradient-to-br from-white/80 via-blue-50/60 to-indigo-50/80 dark:from-gray-900/90 dark:via-indigo-950/80 dark:to-blue-950/90 backdrop-blur-sm relative overflow-hidden">
        {/* 額外的漸層背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-indigo-500/5"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-cyan-500/5 via-transparent to-blue-500/5"></div>
        
        {/* 科技感背景元素 */}
        <div className="absolute inset-0 bg-tech-grid opacity-5 dark:opacity-10"></div>
        <div className="absolute inset-0 circuit-pattern opacity-5 dark:opacity-10"></div>
        
        {/* 微妙的光暈效果 */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-gradient-radial from-blue-400/10 via-transparent to-transparent blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full bg-gradient-radial from-cyan-400/10 via-transparent to-transparent blur-xl"></div>
        <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] rounded-full bg-gradient-radial from-indigo-400/5 via-transparent to-transparent blur-xl"></div>
        
        {/* 微妙的數據流線條 */}
        <div className="absolute right-10 top-0 h-full w-px bg-gradient-to-b from-transparent via-blue-400/10 to-transparent"></div>
        <div className="absolute left-1/4 bottom-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"></div>
        
        {/* 動態粒子效果 - 更加微妙 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <div 
              key={`particle-right-${i}`}
              className="absolute rounded-full animate-float-particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 1.5 + 0.5}px`,
                height: `${Math.random() * 1.5 + 0.5}px`,
                backgroundColor: i % 3 === 0 ? 'rgba(56, 189, 248, 0.4)' : i % 3 === 1 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(99, 102, 241, 0.4)',
                animationDuration: `${5 + Math.random() * 10}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: '0.4'
              }}
            ></div>
          ))}
        </div>
        
        {/* 掃描線效果 - 更加微妙 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute h-40 w-full left-0 bg-gradient-to-b from-transparent via-blue-500/2 to-transparent animate-scan-line" style={{ animationDuration: '8s' }}></div>
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl border border-gray-100/80 dark:border-gray-700/80 relative overflow-hidden">
            {/* 卡片內部的微妙邊框發光效果 */}
            <div className="absolute inset-0 border border-blue-500/5 dark:border-blue-400/10 rounded-2xl"></div>
            {/* 卡片內部的漸層背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-blue-50/40 dark:from-gray-800/40 dark:to-indigo-950/40 rounded-2xl"></div>
            
            <div className="text-center mb-8 relative">
              <img
                src="/metaage-logo1.png"
                alt="Logo"
                className="h-14 mx-auto transform transition-transform duration-300 hover:scale-105 mb-6"
              />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">忘記密碼</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{!codeSent ? "請輸入您的電子郵件以接收驗證碼" : "請輸入驗證碼和新密碼"}</p>
            </div>

            {!codeSent ? (
              <form onSubmit={handleSendCode} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    電子郵件
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300"></div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="relative w-full px-4 py-3 rounded-lg border border-gray-300/80 dark:border-gray-600/80 bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-sm backdrop-blur-sm input-glow"
                      placeholder="請輸入您的電子郵件"
                      required
                    />
                  </div>
                </div>

                <div className="relative group mt-8">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <button
                    type="submit"
                    disabled={loading || cooldown > 0}
                    className={`relative w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 button-glow ${loading || cooldown > 0 ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-800"}`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        發送中...
                      </div>
                    ) : cooldown > 0 ? (
                      `${cooldown} 秒後可重試`
                    ) : (
                      "發送驗證碼"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    驗證碼
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300"></div>
                    <input
                      id="code"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="relative w-full px-4 py-3 rounded-lg border border-gray-300/80 dark:border-gray-600/80 bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-sm backdrop-blur-sm input-glow"
                      placeholder="請輸入驗證碼"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    新密碼
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300"></div>
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="relative w-full px-4 py-3 rounded-lg border border-gray-300/80 dark:border-gray-600/80 bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out pr-12 shadow-sm backdrop-blur-sm input-glow"
                      placeholder="請輸入新密碼"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200 z-10"
                    >
                      {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    確認密碼
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300"></div>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="relative w-full px-4 py-3 rounded-lg border border-gray-300/80 dark:border-gray-600/80 bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out pr-12 shadow-sm backdrop-blur-sm input-glow"
                      placeholder="請再次輸入新密碼"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200 z-10"
                    >
                      {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2 border border-blue-100/80 dark:border-blue-800/30">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">密碼要求：</p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li className={passwordRules.length ? "text-green-600 dark:text-green-400" : ""}>• 至少 8 個字符</li>
                    <li className={passwordRules.uppercase ? "text-green-600 dark:text-green-400" : ""}>• 包含大寫字母</li>
                    <li className={passwordRules.lowercase ? "text-green-600 dark:text-green-400" : ""}>• 包含小寫字母</li>
                    <li className={passwordRules.number ? "text-green-600 dark:text-green-400" : ""}>• 包含數字</li>
                    <li className={passwordRules.special ? "text-green-600 dark:text-green-400" : ""}>• 包含特殊字符 (!@#$%^&*)</li>
                    <li className={passwordsMatch ? "text-green-600 dark:text-green-400" : ""}>• 密碼匹配</li>
                  </ul>
                </div>

                <div className="relative group mt-4">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <button
                    type="submit"
                    disabled={loading || !allRulesPassed}
                    className={`relative w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 button-glow ${loading || !allRulesPassed ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-800"}`}
                  >
                    {loading ? "處理中..." : allRulesPassed ? "重設密碼" : "請符合所有密碼要求"}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading || cooldown > 0}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:underline relative inline-block"
                  >
                    <span className="relative z-10">{cooldown > 0 ? `${cooldown} 秒後可重新發送` : "重新發送驗證碼"}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400/30 group-hover:w-full transition-all duration-300"></span>
                  </button>
                </div>
              </form>
            )}

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium focus:outline-none focus:underline relative inline-block"
              >
                <span className="relative z-10">返回登入</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-400/30 group-hover:w-full transition-all duration-300"></span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2025 MetaAge MSP. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

