import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaShieldAlt, FaHeadset, FaRocket } from 'react-icons/fa';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // TODO: 實作登入邏輯
      router.push('/');
    } catch (err) {
      setError('登入失敗，請檢查您的帳號密碼');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen">
        {/* 左側品牌區域 */}
        <div className="hidden lg:flex lg:w-[65%] items-center justify-center p-12 relative overflow-hidden"
             style={{
               background: 'linear-gradient(135deg, #1a365d 0%, #3182ce 100%)',
             }}>
          {/* 背景裝飾元素 */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_60%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1)_0%,transparent_40%)]"></div>
          </div>
          
          <div className="relative max-w-2xl z-10 w-full">
            <div className="text-left max-w-xl mx-auto">
              {/* Logo - 移除特效 */}
              <div className="mb-6 text-center">
                <img 
                  src="/metaage-logo1.png" 
                  alt="Logo" 
                  className="h-24 w-96 mx-auto" 
                />
              </div>
              <p className="text-2xl text-blue-100 mb-16 font-light tracking-wide text-center">
                專業可靠的 IT 解決方案
              </p>
              
              {/* 特色區塊 - 調整寬度和對齊 */}
              <div className="grid gap-6 mt-16 max-w-lg mx-auto">
                <div className="flex items-center bg-gradient-to-r from-blue-600/10 to-blue-400/10 p-5 rounded-xl backdrop-blur-sm
                              border border-white/10">
                  <div className="flex items-center w-full">
                    <div className="flex items-center justify-center w-7 h-7">
                      <FaShieldAlt className="w-6 h-6 text-blue-100" />
                    </div>
                    <p className="text-lg font-medium tracking-wide text-blue-50 ml-5 mt-3 leading-none">全方位支持，成就客戶的下一步</p>
                  </div>
                </div>
                <div className="flex items-center bg-gradient-to-r from-blue-600/10 to-blue-400/10 p-5 rounded-xl backdrop-blur-sm
                              border border-white/10">
                  <div className="flex items-center w-full">
                    <div className="flex items-center justify-center w-7 h-7">
                      <FaHeadset className="w-6 h-6 text-blue-100" />
                    </div>
                    <p className="text-lg font-medium tracking-wide text-blue-50 ml-5 mt-3 leading-none">24/7 專業技術支援服務</p>
                  </div>
                </div>
                <div className="flex items-center bg-gradient-to-r from-blue-600/10 to-blue-400/10 p-5 rounded-xl backdrop-blur-sm
                              border border-white/10">
                  <div className="flex items-center w-full">
                    <div className="flex items-center justify-center w-7 h-7">
                      <FaRocket className="w-6 h-6 text-blue-100" />
                    </div>
                    <p className="text-lg font-medium tracking-wide text-blue-50 ml-5 mt-3 leading-none">助您企業數位轉型起飛</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右側登入表單區域 */}
        <div className="w-full lg:w-[35%] flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gray-50/30"></div>
          <div className="w-full max-w-md mx-auto px-8 py-12 relative z-10">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                  歡迎回來
                </h2>
                <p className="text-gray-600 mt-2">
                  請登入您的帳號以繼續
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    電子郵件
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-800
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder-gray-400 transition-all duration-200
                             hover:border-blue-400"
                    placeholder="請輸入您的電子郵件"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    密碼
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-800
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder-gray-400 transition-all duration-200
                             hover:border-blue-400"
                    placeholder="請輸入您的密碼"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm p-3 bg-red-50 rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                    text-white font-medium rounded-xl transition-all duration-200 
                    transform hover:translate-y-[-1px] hover:shadow-lg
                    flex items-center justify-center
                    ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      登入中...
                    </>
                  ) : '登入'}
                </button>

                <div className="text-center">
                  <button type="button" 
                          className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
                    忘記密碼？
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>© 2025 MetaAge MSP. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
