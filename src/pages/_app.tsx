import React from 'react';
import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import '@/styles/toast.css';
import Link from 'next/link';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProvider, useThemeContext } from '@/context/ThemeContext';
import { LoadingProvider } from '@/context/LoadingContext';
import { AuthProvider, useAuth, useProtectedRoute } from '@/context/AuthContext';
import Sidebar from '@/components/common/Sidebar';
import CreateTicketModal from '@/components/common/CreateTicketForm';
import CreateTodoForm from '@/components/common/CreateTodoForm';
import ThemeToggle from '@/components/common/ThemeToggle';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { ToastProvider } from '@/context/ToastContext';
import { Toast } from '@/components/common/Toast';

// 配置 NProgress
NProgress.configure({ 
  showSpinner: false,
  trickleSpeed: 300,
  minimum: 0.2,
  easing: 'ease-out',
  speed: 500
});

// 主要內容組件
const AppContent: React.FC<AppProps> = ({ Component, pageProps }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);
  const [isTodoModalOpen, setIsTodoModalOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { logout, user, userRole } = useAuth();
  const { isLoading, isAuthenticated } = useProtectedRoute();
  const { theme } = useThemeContext();

  // 處理登出
  const handleLogout = () => {
    logout();
  };

  // 處理工單建立
  const handleCreateTicket = (ticketData: {
    title: string;
    description: string;
    type: string;
    priority: string;
    organization: string;
    business: string;
    source: string;
    engineer: string;
    attachments: File[];
  }) => {
    // TODO: 實作工單建立邏輯
    console.log('建立工單:', ticketData);
  };

  // 監聽路由變化
  React.useEffect(() => {
    const handleStart = () => NProgress.start();
    const handleComplete = () => NProgress.done();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // 監聽點擊外部關閉用戶選單
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 監聽螢幕尺寸變化
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 判斷是否為不需要驗證的頁面
  const isStandalonePage = [
    '/user-portal',
    '/login',
    '/404',
    '/change-password',
    '/forgot-password'
  ].includes(router.pathname);

  // 如果正在加載認證狀態，顯示加載中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-secondary">
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 border-4 border-accent-color border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary font-medium">載入中...</p>
        </div>
      </div>
    );
  }

  // 如果需要認證但未登入，不渲染頁面內容
  const PUBLIC_PATHS = ['/login', '/change-password', '/404', '/forgot-password'];
  const is404Page = router.pathname === '/404';
  if (!isAuthenticated && !PUBLIC_PATHS.includes(router.pathname) && !is404Page) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-secondary transition-colors duration-300">
      {/* 頂部導航區 */}
      {!isStandalonePage && (
        <nav className="fixed w-full top-0 z-50 bg-background-primary border-b border-border-color
                      shadow-sm transition-all duration-300">
          <div className="w-full px-4">
            <div className="flex items-center justify-between h-16">
              {/* 左側區域：漢堡按鈕、Logo 和搜尋框 */}
              <div className="flex items-center gap-4 flex-1">
                {/* 漢堡按鈕 */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="relative p-2 rounded-lg hover:bg-hover-color transition-all duration-200 
                           focus-effect group"
                  aria-label={isSidebarOpen ? '收合側邊欄' : '展開側邊欄'}
                >
                  <div className="w-6 flex flex-col items-center justify-center gap-[5px]">
                    <span className={`block h-[2px] bg-text-primary rounded-full transition-all duration-300 
                                   transform origin-center ${isSidebarOpen ? 'w-4 rotate-45 translate-y-[7px]' : 'w-6'}`} />
                    <span className={`block h-[2px] bg-text-primary rounded-full transition-all duration-300 
                                   transform ${isSidebarOpen ? 'w-0 opacity-0' : 'w-6 opacity-100'}`} />
                    <span className={`block h-[2px] bg-text-primary rounded-full transition-all duration-300 
                                   transform origin-center ${isSidebarOpen ? 'w-4 -rotate-45 -translate-y-[7px]' : 'w-6'}`} />
                  </div>
                </button>

                {/* Logo */}
                <Link 
                  href="/"
                  className="flex items-center gap-2 min-w-[180px] group"
                >
                  <img 
                    src="/msp-logo.png" 
                    alt="Logo" 
                    className="h-8 w-8 transition-all duration-300 group-hover:scale-110" 
                  />
                  <span className="text-lg font-bold text-text-primary whitespace-nowrap 
                                transition-colors duration-200 group-hover:text-accent-color">
                    MetaAge MSP
                  </span>
                </Link>

                {/* 搜尋框 */}
                <div className="relative flex-1 max-w-2xl hidden md:block">
                  <input
                    type="text"
                    placeholder="搜尋客戶、工單或待辦..."
                    className="w-full pl-10 pr-4 py-2 border border-border-color rounded-lg text-sm 
                             bg-background-primary text-text-primary placeholder-text-secondary
                             focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent 
                             transition-all duration-200"
                  />
                  <div className="absolute left-3 top-2.5 text-text-secondary">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 右側區域：快速建立、通知、深淺模式切換和用戶資訊 */}
              <div className="flex items-center gap-4">
                {/* 快速建立按鈕與下拉選單 */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 bg-accent-color text-white rounded-lg 
                                   hover:bg-accent-hover transition-all duration-200 shadow-sm hover:shadow
                                   focus-effect active-effect">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">快速建立</span>
                    <svg className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 下拉選單 */}
                  <div className="absolute right-0 mt-2 w-48 bg-background-primary rounded-lg shadow-lg py-1 
                                border border-border-color transform opacity-0 scale-95 invisible
                                transition-all duration-200 origin-top-right z-50
                                group-hover:opacity-100 group-hover:scale-100 group-hover:visible">
                    <button
                      onClick={() => setIsTicketModalOpen(true)}
                      className="w-full px-4 py-2 text-sm text-text-primary hover:bg-hover-color 
                               transition-colors duration-200 flex items-center group/item"
                    >
                      <svg className="h-4 w-4 mr-2 text-text-secondary group-hover/item:text-accent-color 
                                  transition-colors duration-200" 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      建立工單
                    </button>
                    <button
                      onClick={() => setIsTodoModalOpen(true)}
                      className="w-full px-4 py-2 text-sm text-text-primary hover:bg-hover-color 
                               transition-colors duration-200 flex items-center group/item"
                    >
                      <svg className="h-4 w-4 mr-2 text-text-secondary group-hover/item:text-accent-color 
                                  transition-colors duration-200" 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      建立待辦
                    </button>
                  </div>
                </div>

                {/* 通知圖標 */}
                <button className="relative p-2 rounded-lg hover:bg-hover-color transition-all duration-200 
                                focus-effect group">
                  <svg className="h-6 w-6 text-text-secondary group-hover:text-text-primary 
                              transition-colors duration-200" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error-color ring-2 ring-background-primary" />
                </button>

                {/* 深淺模式切換 */}
                <ThemeToggle />

                {/* 用戶資訊 */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 focus-effect rounded-lg p-1 hover:bg-hover-color 
                             transition-all duration-200"
                  >
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-medium text-text-primary">{userRole || '用戶'}</div>
                      <div className="text-xs text-text-secondary">{user?.email || ''}</div>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-accent-color to-accent-dark
                                text-white shadow-sm flex items-center justify-center font-medium
                                transition-transform duration-200 hover:scale-110">
                      {user?.email?.charAt(0).toUpperCase() || ''}
                    </div>
                  </button>

                  {/* 用戶選單 */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-background-primary rounded-lg shadow-lg 
                                  border border-border-color py-1 z-50 animate-fade-in">
                      <Link
                        href="/user-portal?tab=profile"
                        className="block px-4 py-2 text-sm text-text-primary hover:bg-hover-color 
                                 transition-colors duration-200 flex items-center group"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="h-4 w-4 mr-2 text-text-secondary group-hover:text-accent-color 
                                    transition-colors duration-200" 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        我的資料
                      </Link>
                      <Link
                        href="/user-portal"
                        className="block px-4 py-2 text-sm text-text-primary hover:bg-hover-color 
                                 transition-colors duration-200 flex items-center group"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="h-4 w-4 mr-2 text-text-secondary group-hover:text-accent-color 
                                    transition-colors duration-200" 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        切換 - 使用者介面
                      </Link>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-error-color hover:bg-error-light 
                                 transition-colors duration-200 flex items-center group"
                      >
                        <svg className="h-4 w-4 mr-2 text-error-color" 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        登出
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      <div className={`flex ${!isStandalonePage ? 'pt-16' : ''}`}>
        {/* 側邊欄 */}
        {!isStandalonePage && (
          <aside className={`fixed left-0 top-0 h-screen bg-background-primary
                          border-r border-border-color transition-all duration-300 z-40
                          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-0'}`}>
            <Sidebar isSidebarOpen={isSidebarOpen} />
          </aside>
        )}

        {/* 主內容區域 */}
        <main className={`flex-1 transition-all duration-300 
                       ${!isStandalonePage && isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <Component {...pageProps} />
        </main>
      </div>

      {/* 工單建立彈窗 */}
      {!isStandalonePage && (
        <>
          <CreateTicketModal
            isOpen={isTicketModalOpen}
            onClose={() => setIsTicketModalOpen(false)}
            onSubmit={handleCreateTicket}
          />
          <CreateTodoForm
            isOpen={isTodoModalOpen}
            onClose={() => setIsTodoModalOpen(false)}
          />
        </>
      )}
    </div>
  );
};

// 根組件
export default function App(props: AppProps) {
  return (
    <>
      <Head>
        <title>MetaAge MSP</title>
        <meta name="description" content="MetaAge MSP System - 專業的管理服務平台" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/msplogo.png" />
      </Head>
      <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={true}>
        <ThemeProvider>
          <LoadingProvider>
            <ToastProvider>
              <AuthProvider>
                <AppContent {...props} />
                <Toast />
              </AuthProvider>
            </ToastProvider>
          </LoadingProvider>
        </ThemeProvider>
      </NextThemesProvider>
    </>
  );
}
