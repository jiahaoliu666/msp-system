import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

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
      <Head>
        <title>登入 - MSP系統</title>
      </Head>
      
      <div className="flex min-h-screen">
        {/* 左側品牌區域 */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#1677ff] items-center justify-center p-12">
          <div className="max-w-lg">
            <div className="text-center">
              <div className="mb-8">
                <img 
                  src="/msp-logo.png" 
                  alt="Logo" 
                  className="h-24 w-24 mx-auto transition-all duration-300 hover:scale-110" 
                />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">MetaAge MSP</h1>
              <p className="text-lg text-white/90">
                專業的 MSP 管理系統，為您的企業提供全方位的 IT 服務支援
              </p>
            </div>
          </div>
        </div>

        {/* 右側登入表單區域 */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background-secondary">
          <div className="w-full max-w-md">
            <div className="text-center mb-8 lg:hidden">
              <img 
                src="/msp-logo.png" 
                alt="Logo" 
                className="h-16 w-16 mx-auto mb-4" 
              />
              <h1 className="text-2xl font-bold text-text-primary">MetaAge MSP</h1>
            </div>

            <div className="bg-background-primary p-8 rounded-2xl shadow-lg border border-border-color/10">
              <div className="text-center">
                <img 
                  src="/msp-logo.png" 
                  alt="Logo" 
                  className="h-16 w-16 mx-auto mb-6" 
                />
                <h2 className="text-2xl font-bold text-text-primary">
                  歡迎回來
                </h2>
                <p className="text-text-secondary mt-2">
                  請登入您的帳號以繼續
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                    電子郵件
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 border border-border-color rounded-lg bg-background-primary text-text-primary
                             focus:ring-2 focus:ring-[#1677ff] focus:border-transparent
                             placeholder-text-secondary"
                    placeholder="請輸入您的電子郵件"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                    密碼
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-3 border border-border-color rounded-lg bg-background-primary text-text-primary
                             focus:ring-2 focus:ring-[#1677ff] focus:border-transparent
                             placeholder-text-secondary"
                    placeholder="請輸入您的密碼"
                    required
                  />
                </div>

                {error && (
                  <div className="text-error-color text-sm p-3 bg-error-color/10 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 bg-[#1677ff] hover:bg-[#1668dc] text-white font-medium rounded-lg
                    transition-all duration-200 flex items-center justify-center
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

                <div className="flex items-center justify-between text-sm">
                  <Link href="/user-portal" className="text-[#1677ff] hover:text-[#1668dc] transition-colors">
                    使用者入口
                  </Link>
                  <button type="button" className="text-[#1677ff] hover:text-[#1668dc] transition-colors">
                    忘記密碼？
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 text-center text-sm text-text-secondary">
              <p>© 2024 MetaAge MSP. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
