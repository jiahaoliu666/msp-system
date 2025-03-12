"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { FaShieldAlt, FaHeadset, FaRocket, FaEye, FaEyeSlash } from "react-icons/fa"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import React from "react"

interface IconProps {
  className?: string
}

export default function Login() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const checkAuthStatus = () => {
      if (router.query.from === "logout") {
        return
      }

      const token = localStorage.getItem("authToken")
      if (token || isAuthenticated) {
        console.log("用戶已登入，重定向到首頁或返回頁面")
        const returnUrl = router.query.returnUrl as string
        router.replace(returnUrl || "/")
      }
    }

    checkAuthStatus()
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log("開始處理登入表單提交...", {
      hasEmail: !!formData.email,
      hasPassword: !!formData.password,
    })

    if (!formData.email || !formData.password) {
      showToast("error", "請填寫電子郵件和密碼")
      setLoading(false)
      return
    }

    try {
      console.log("嘗試登入...", {
        email: formData.email,
        passwordLength: formData.password.length,
      })

      await login({
        email: formData.email,
        password: formData.password,
      })

      console.log("登入成功")
    } catch (err: any) {
      console.error("登入錯誤:", {
        name: err.name,
        message: err.message,
        code: err.__type || err.code,
        stack: err.stack,
        $metadata: err.$metadata,
      })

      const errorType = err.__type || err.code || err.name

      switch (errorType) {
        case "UserDisabled":
          showToast("error", "此用戶暫停使用中，請洽詢系統管理員")
          break
        case "NotAuthorizedException":
          if (err.message === "User is disabled.") {
            showToast("error", "此用戶暫停使用中，請洽詢系統管理員")
          } else {
            showToast("error", "電子郵件或密碼錯誤")
          }
          break
        case "UserNotConfirmedException":
          showToast("warning", "帳號尚未驗證，請查收電子郵件進行驗證")
          break
        case "UserNotFoundException":
          showToast("error", "找不到此帳號")
          break
        case "InvalidParameterException":
          showToast("error", "請檢查輸入的電子郵件密碼格式是否正確")
          break
        case "TooManyRequestsException":
          showToast("error", "登入嘗試次數過多，請稍後再試")
          break
        case "UnrecognizedClientException":
          showToast("error", "系統認證問題，請聯繫系統管理員")
          break
        case "PasswordResetRequiredException":
          showToast("warning", "需要重設密碼，請聯繫系統管理員")
          break
        case "InvalidClientTokenId":
          showToast("error", "無效的應用程式用戶端 ID，請聯繫系統管理員")
          break
        case "ResourceNotFoundException":
          showToast("error", "找不到用戶池資源，請聯繫系統管理員")
          break
        default:
          if (err.message && err.message.includes("系統配置錯誤")) {
            showToast("error", err.message)
          } else {
            showToast("error", "系統錯誤，請稍後再試")
            console.error("未處理的錯誤類型:", err)
          }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    router.push("/forgot-password")
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
      {/* Left side - Futuristic Cybersecurity Visual */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/3 bg-gradient-to-br from-blue-900 to-indigo-950 items-center justify-center p-12 relative overflow-hidden">
        {/* 背景層 - 深邃的深藍色背景 */}
        <div className="absolute inset-0 bg-[#050b2e] opacity-90"></div>
        
        {/* 低不透明度的幾何形狀 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-cyan-500/10 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-80 h-80 rounded-full bg-indigo-600/10 blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* 數字化連接線條 */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)' }}></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 70% 60%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)' }}></div>
        
        {/* 流動的數據流視覺效果 */}
        <div className="absolute inset-0">
          <div className="absolute h-px w-full top-1/4 left-0 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-data-flow"></div>
          <div className="absolute h-px w-full top-1/3 left-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-data-flow" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute h-px w-full top-1/2 left-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-data-flow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute h-px w-full top-2/3 left-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-data-flow" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute h-px w-full top-3/4 left-0 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-data-flow" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* 懸浮的全息粒子效果 */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyan-400/70 animate-float-particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${3 + Math.random() * 7}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>
        
        {/* MetaAge 主要內容 */}
        <div className="relative z-10 text-center">
          <div className="mb-10">
            <img src="/metaage-logo1.png" alt="MetaAge Logo" className="h-32 mx-auto mb-8 filter drop-shadow-xl" />
          </div>
          
          <div className="max-w-xl mx-auto relative">
            <div className="grid gap-6 mt-8">
              <FeatureItem icon={<FaShieldAlt />} text="全方位支持，成就客戶的下一步" />
              <FeatureItem icon={<FaHeadset />} text="24/7 專業技術支援服務" />
              <FeatureItem icon={<FaRocket />} text="助您企業數位轉型起飛" />
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-1/3 flex items-center justify-center p-8 sm:p-12 bg-gradient-to-br from-white/80 to-blue-50/80 dark:from-gray-900/90 dark:to-indigo-950/90 backdrop-blur-sm">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <img
                src="/metaage-logo1.png"
                alt="Logo"
                className="h-14 mx-auto transform transition-transform duration-300 hover:scale-105 mb-6 lg:hidden"
              />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">歡迎回來</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">請登入您的帳號以繼續</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    電子郵件
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-sm"
                      placeholder="請輸入您的電子郵件"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    密碼
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out pr-12 shadow-sm"
                      placeholder="請輸入您的密碼"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200"
                      aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                    >
                      {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-800"}`}
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
                    登入中...
                  </div>
                ) : (
                  "登入"
                )}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 font-medium focus:outline-none focus:underline"
                >
                  忘記密碼？
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2025 MetaAge MSP. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon, text }: { icon: React.ReactElement<IconProps>; text: string }) {
  return (
    <div className="flex items-center bg-white/10 rounded-xl p-5 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:transform hover:scale-102 hover:shadow-lg border border-white/10">
      <div className="flex-shrink-0 text-cyan-300 flex items-center justify-center bg-blue-700/30 p-4 rounded-lg mr-5">
        {React.cloneElement(icon, { className: "w-7 h-7" })}
      </div>
      <div className="flex-none w-3/5">
        <p className="text-lg font-medium text-white">{text}</p>
      </div>
    </div>
  )
}

