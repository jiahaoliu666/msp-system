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
        
        {/* 科技網格背景 */}
        <div className="absolute inset-0 bg-tech-grid opacity-20"></div>
        
        {/* 電路板效果 */}
        <div className="absolute inset-0 circuit-pattern opacity-15"></div>
        
        {/* 3D透視網格 */}
        <div className="absolute inset-0 overflow-hidden perspective-1000">
          <div className="absolute top-0 left-0 w-full h-full transform-gpu rotate-x-60 scale-150 origin-center">
            <div className="w-full h-full border border-cyan-500/5 grid grid-cols-6 grid-rows-6">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={`grid-${i}`} className="border border-cyan-500/5"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 旋轉的幾何圖形 */}
        <div className="absolute inset-0 overflow-hidden">
          {/* 大型旋轉圓環 */}
          <div className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] border-2 border-cyan-500/10 rounded-full animate-rotate-slow"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] border-2 border-blue-500/10 rounded-full animate-rotate-medium" style={{ animationDirection: 'reverse' }}></div>
          
          {/* 低不透明度的幾何形狀 */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-cyan-500/10 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-80 h-80 rounded-full bg-indigo-600/10 blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* 六角形網絡節點 */}
          <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-cyan-400/30 animate-data-node" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-blue-400/30 animate-data-node" style={{ animationDelay: '1.5s', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
          <div className="absolute top-2/3 right-1/3 w-5 h-5 bg-indigo-400/30 animate-data-node" style={{ animationDelay: '2.5s', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
        </div>
        
        {/* 放射狀漸變光暈 */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)' }}></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 70% 60%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)' }}></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(14, 165, 233, 0.1) 0%, transparent 40%)' }}></div>
        
        {/* 掃描線效果 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute h-20 w-full left-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-scan-line"></div>
        </div>
        
        {/* 流動的數據流視覺效果 - 增強版 */}
        <div className="absolute inset-0">
          <div className="absolute h-px w-full top-1/5 left-0 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-data-flow"></div>
          <div className="absolute h-px w-full top-1/4 left-0 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-data-flow" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute h-px w-full top-1/3 left-0 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-data-flow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute h-px w-full top-1/2 left-0 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-data-flow" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute h-px w-full top-2/3 left-0 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-data-flow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute h-px w-full top-3/4 left-0 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-data-flow" style={{ animationDelay: '2.5s' }}></div>
          <div className="absolute h-px w-full top-4/5 left-0 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-data-flow" style={{ animationDelay: '3s' }}></div>
          
          {/* 垂直數據流 */}
          <div className="absolute w-px h-full top-0 left-1/4 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent animate-data-flow" style={{ animationDuration: '10s' }}></div>
          <div className="absolute w-px h-full top-0 left-2/3 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent animate-data-flow" style={{ animationDuration: '12s', animationDelay: '1s' }}></div>
        </div>
        
        {/* 數字矩陣效果 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/6 text-xs font-mono text-cyan-500/20 animate-matrix-fall whitespace-pre" style={{ animationDuration: '15s' }}>
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="animate-binary-fade" style={{ animationDelay: `${i * 0.2}s` }}>
                {Array.from({ length: 8 }).map((_, j) => Math.round(Math.random())).join('')}
              </div>
            ))}
          </div>
          <div className="absolute top-0 left-2/3 text-xs font-mono text-blue-500/20 animate-matrix-fall whitespace-pre" style={{ animationDuration: '20s', animationDelay: '2s' }}>
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i + 100} className="animate-binary-fade" style={{ animationDelay: `${i * 0.2}s` }}>
                {Array.from({ length: 8 }).map((_, j) => Math.round(Math.random())).join('')}
              </div>
            ))}
          </div>
        </div>
        
        {/* 浮動的科技圖標 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/6 right-1/6 text-cyan-500/20 animate-float-particle" style={{ animationDuration: '15s' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path>
              <line x1="8" y1="16" x2="8.01" y2="16"></line>
              <line x1="8" y1="20" x2="8.01" y2="20"></line>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
              <line x1="12" y1="22" x2="12.01" y2="22"></line>
              <line x1="16" y1="16" x2="16.01" y2="16"></line>
              <line x1="16" y1="20" x2="16.01" y2="20"></line>
            </svg>
          </div>
          <div className="absolute bottom-1/4 left-1/5 text-blue-500/20 animate-float-particle" style={{ animationDuration: '12s', animationDelay: '2s' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
          </div>
        </div>
        
        {/* 脈衝連接點 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-cyan-400/50 animate-circuit-pulse"></div>
          <div className="absolute top-2/3 left-2/3 w-2 h-2 rounded-full bg-blue-400/50 animate-circuit-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-indigo-400/50 animate-circuit-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* 連接線 */}
          <div className="absolute top-[calc(33.333%-1px)] left-[25%] w-[calc(25%-2px)] h-px bg-cyan-400/30"></div>
          <div className="absolute top-1/2 left-1/4 w-px h-[calc(16.667%-1px)] bg-cyan-400/30"></div>
          <div className="absolute top-1/2 left-[calc(50%-1px)] w-[calc(16.667%-1px)] h-px bg-blue-400/30"></div>
          <div className="absolute top-[calc(66.667%-1px)] left-[50%] w-[calc(16.667%-1px)] h-px bg-blue-400/30"></div>
        </div>
        
        {/* 懸浮的全息粒子效果 - 增強版 */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full animate-float-particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                backgroundColor: i % 3 === 0 ? 'rgba(56, 189, 248, 0.7)' : i % 3 === 1 ? 'rgba(59, 130, 246, 0.7)' : 'rgba(99, 102, 241, 0.7)',
                animationDuration: `${3 + Math.random() * 7}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>
        
        {/* 光暈效果 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-radial from-blue-500/5 via-transparent to-transparent blur-xl"></div>
        </div>
        
        {/* MetaAge 主要內容 */}
        <div className="relative z-10 text-center mt-[-80px]">
          <div className="mb-6">
            <img src="/metaage-logo1.png" alt="MetaAge Logo" className="h-32 mx-auto mb-6 filter drop-shadow-xl animate-glow" />
          </div>
          
          <div className="max-w-xl mx-auto relative">
            <div className="grid gap-5 mt-4">
              <FeatureItem icon={<FaShieldAlt />} text="全方位支持，成就客戶的下一步" />
              <FeatureItem icon={<FaHeadset />} text="24/7 專業技術支援服務" />
              <FeatureItem icon={<FaRocket />} text="助您企業數位轉型起飛" />
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-1/3 flex items-center justify-center p-8 sm:p-12 bg-gradient-to-br from-white/80 to-blue-50/80 dark:from-gray-900/90 dark:to-indigo-950/90 backdrop-blur-sm relative overflow-hidden">
        {/* 科技感背景元素 */}
        <div className="absolute inset-0 bg-tech-grid opacity-5 dark:opacity-10"></div>
        <div className="absolute inset-0 circuit-pattern opacity-5 dark:opacity-10"></div>
        
        {/* 微妙的光暈效果 */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-gradient-radial from-blue-400/5 via-transparent to-transparent blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full bg-gradient-radial from-cyan-400/5 via-transparent to-transparent blur-xl"></div>
        
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
            
            <div className="text-center mb-8 relative">
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
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300"></div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="relative w-full px-4 py-3 rounded-lg border border-gray-300/80 dark:border-gray-600/80 bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-sm backdrop-blur-sm input-glow"
                      placeholder="請輸入您的電子郵件"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    密碼
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300"></div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="relative w-full px-4 py-3 rounded-lg border border-gray-300/80 dark:border-gray-600/80 bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out pr-12 shadow-sm backdrop-blur-sm input-glow"
                      placeholder="請輸入您的密碼"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200 z-10"
                      aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                    >
                      {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative group mt-8">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`relative w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 button-glow ${loading ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-800"}`}
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
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 font-medium focus:outline-none focus:underline relative inline-block"
                >
                  <span className="relative z-10">忘記密碼？</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400/30 group-hover:w-full transition-all duration-300"></span>
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

