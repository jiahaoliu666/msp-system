import React from 'react';
import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import Link from 'next/link';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProvider } from '@/context/ThemeContext';
import { LoadingProvider } from '@/context/LoadingContext';
import Sidebar from '@/components/common/Sidebar';
import CreateTicketModal from '@/components/common/CreateTicketForm';
import CreateTodoForm from '@/components/common/CreateTodoForm';
import ThemeToggle from '@/components/common/ThemeToggle';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// 配置 NProgress
NProgress.configure({ 
  showSpinner: false,
  trickleSpeed: 400,
  minimum: 0.2,
  easing: 'ease-out',
  speed: 700
});

// 主要內容組件
const AppContent: React.FC<AppProps> = ({ Component, pageProps }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);
  const [isTodoModalOpen, setIsTodoModalOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 監聽路由變化
  React.useEffect(() => {
    const handleStart = () => {
      NProgress.start();
    };

    const handleComplete = () => {
      NProgress.done();
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // 判斷是否為不需要顯示導航的頁面
  const isStandalonePage = router.pathname === '/user-portal' || 
                          router.pathname === '/login' || 
                          router.pathname === '/404';

  // 點擊外部關閉用戶選單
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleLogout = () => {
    // TODO: 實作登出邏輯
    console.log('登出');
  };

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* 頂部導航區 */}
      {!isStandalonePage && (
        <nav className="bg-background-primary border-b border-border-color fixed w-full top-0 z-[50]">
          <div className="w-full px-4">
            <div className="flex items-center justify-between h-16">
              {/* 左側區域：漢堡按鈕、Logo 和搜尋框 */}
              <div className="flex items-center gap-4 flex-1">
                {/* 漢堡按鈕 */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-hover-color transition-all duration-200 relative w-10 h-10 flex items-center justify-center group"
                >
                  <div className="w-6 flex flex-col items-center justify-center gap-[5px]">
                    <span className={`block h-[2px] bg-text-primary rounded-full transition-all duration-300 ease-in-out transform origin-center
                      ${isSidebarOpen ? 'w-4 rotate-45 translate-y-[7px]' : 'w-6'}`}></span>
                    <span className={`block h-[2px] bg-text-primary rounded-full transition-all duration-300 ease-in-out transform
                      ${isSidebarOpen ? 'w-0 opacity-0' : 'w-6 opacity-100'}`}></span>
                    <span className={`block h-[2px] bg-text-primary rounded-full transition-all duration-300 ease-in-out transform origin-center
                      ${isSidebarOpen ? 'w-4 -rotate-45 -translate-y-[7px]' : 'w-6'}`}></span>
                  </div>
                </button>

                {/* Logo */}
                <div className="flex items-center gap-2 min-w-[180px]">
                  <img 
                    src="/msp-logo.png" 
                    alt="Logo" 
                    className="h-8 w-8 transition-all duration-300 hover:scale-110 bg-background-primary" 
                  />
                  <Link href="/">
                    <span className="text-lg font-bold text-text-primary whitespace-nowrap hover:text-accent-color transition-colors duration-200">
                      MetaAge MSP 
                    </span>
                  </Link>
                </div>

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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 右側區域：快速建立、通知、深淺模式切換和用戶資訊 */}
              <div className="flex items-center gap-4">
                {/* 快速建立按鈕與下拉選單 */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 bg-accent-color text-white rounded-lg 
                                        hover:bg-accent-hover transition-all duration-200 whitespace-nowrap">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>快速建立</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* 下拉選單 */}
                  <div className="absolute right-0 mt-2 w-48 bg-background-primary rounded-lg shadow-lg py-1 z-[60] invisible group-hover:visible 
                                      transition-all duration-200 opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-1">
                    <a 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsTicketModalOpen(true);
                      }}
                      href="#" 
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-hover-color flex items-center"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      建立工單
                    </a>
                    <a 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsTodoModalOpen(true);
                      }}
                      href="#" 
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-hover-color flex items-center"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      建立待辦
                    </a>
                  </div>
                </div>

                {/* 通知圖標 */}
                <button className="p-2 rounded-full hover:bg-hover-color transition-all duration-200 relative">
                  <svg className="h-6 w-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-error-color ring-2 ring-background-primary"></span>
                </button>

                {/* 深淺模式切換 */}
                <ThemeToggle />

                {/* 用戶資訊 */}
                <div className="relative" ref={userMenuRef}>
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-medium text-text-primary">管理員</div>
                      <div className="text-xs text-text-secondary">admin@metaage.com.tw</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-accent-color to-accent-hover 
                                        flex items-center justify-center text-white">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* 用戶選單 */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-background-primary rounded-lg shadow-lg py-1 z-[60]
                                  border border-border-color">
                      <Link
                        href="/user-portal"
                        className="block px-4 py-2 text-sm text-text-primary hover:bg-hover-color flex items-center"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        我的資料
                      </Link>
                      <Link
                        href="/user-portal"
                        className="block px-4 py-2 text-sm text-text-primary hover:bg-hover-color flex items-center"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className="w-full text-left px-4 py-2 text-sm text-error-color hover:bg-hover-color flex items-center"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        {!isStandalonePage && <Sidebar isSidebarOpen={isSidebarOpen} />}

        {/* 主內容區域 */}
        <div className={`flex-1 transition-all duration-300 ${!isStandalonePage && isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <Component {...pageProps} />
        </div>
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
        <meta name="description" content="MetaAge MSP System" />
      </Head>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <ThemeProvider>
          <LoadingProvider>
            <AppContent {...props} />
          </LoadingProvider>
        </ThemeProvider>
      </NextThemesProvider>
    </>
  );
}
