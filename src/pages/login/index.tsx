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
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left side - Branding and Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/3 bg-gradient-to-br from-blue-500 to-indigo-700 items-center justify-center p-12">
        <div className="max-w-2xl mb-16">
          <div className="text-center mb-12">
            <img src="/metaage-logo1.png" alt="MetaAge Logo" className="h-24 mx-auto mb-8 filter drop-shadow-lg" />
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">專業可靠的 IT 解決方案</h1>
            <p className="text-xl text-blue-100">助您企業數位轉型，成就卓越未來</p>
          </div>

          <div className="grid gap-8 mt-16">
            <FeatureItem icon={<FaShieldAlt />} text="全方位支持，成就客戶的下一步" />
            <FeatureItem icon={<FaHeadset />} text="24/7 專業技術支援服務" />
            <FeatureItem icon={<FaRocket />} text="助您企業數位轉型起飛" />
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-1/3 flex items-center justify-center p-8 sm:p-12 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl">
            <div className="text-center mb-8">
              <img
                src="/metaage-logo1.png"
                alt="Logo"
                className="h-12 mx-auto transform transition-transform duration-300 hover:scale-105 mb-4 lg:hidden"
              />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">歡迎回來</h2>
              <p className="text-gray-600 mb-8">請登入您的帳號以繼續</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  電子郵件
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                  placeholder="請輸入您的電子郵件"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  密碼
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out pr-12"
                    placeholder="請輸入您的密碼"
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

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium focus:outline-none focus:underline"
                >
                  忘記密碼？
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>© 2025 MetaAge MSP. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon, text }: { icon: React.ReactElement<IconProps>; text: string }) {
  return (
    <div className="flex items-center space-x-4 bg-white bg-opacity-10 rounded-lg p-4 transition-all duration-300 hover:bg-opacity-20 hover:transform hover:scale-105">
      <div className="flex-shrink-0 text-blue-100 flex items-center">{React.cloneElement(icon, { className: "w-8 h-12" })}</div>
      <div className="flex items-center translate-y-[1px] ">
        <p className="text-lg font-medium text-white ">{text}</p>
      </div>
    </div>
  )
}

