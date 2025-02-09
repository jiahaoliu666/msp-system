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
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md m-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl">
          <div className="text-center mb-8">
          <img
            src="/metaage-logo1.png"
            alt="Logo"
            className="h-12 mx-auto transform transition-transform duration-300 hover:scale-105 mb-4"
          />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">忘記密碼</h2>
            <p className="text-gray-600">{!codeSent ? "請輸入您的電子郵件以接收驗證碼" : "請輸入驗證碼和新密碼"}</p>
          </div>

          {!codeSent ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  電子郵件
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                  placeholder="請輸入您的電子郵件"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading || cooldown > 0 ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-800"}`}
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
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  驗證碼
                </label>
                <input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                  placeholder="請輸入驗證碼"
                  required
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                  新密碼
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out pr-12"
                    placeholder="請輸入新密碼"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                  確認密碼
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out pr-12"
                    placeholder="請再次輸入新密碼"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-gray-700">密碼要求：</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className={passwordRules.length ? "text-green-600" : ""}>• 至少 8 個字符</li>
                  <li className={passwordRules.uppercase ? "text-green-600" : ""}>• 包含大寫字母</li>
                  <li className={passwordRules.lowercase ? "text-green-600" : ""}>• 包含小寫字母</li>
                  <li className={passwordRules.number ? "text-green-600" : ""}>• 包含數字</li>
                  <li className={passwordRules.special ? "text-green-600" : ""}>• 包含特殊字符 (!@#$%^&*)</li>
                  <li className={passwordsMatch ? "text-green-600" : ""}>• 密碼匹配</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || !allRulesPassed}
                className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading || !allRulesPassed ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-800"}`}
              >
                {loading ? "處理中..." : allRulesPassed ? "重設密碼" : "請符合所有密碼要求"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading || cooldown > 0}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cooldown > 0 ? `${cooldown} 秒後可重新發送` : "重新發送驗證碼"}
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium"
            >
              返回登入
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

