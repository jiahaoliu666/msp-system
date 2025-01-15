import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Link from 'next/link';
import Sidebar from '../components/common/Sidebar';
import CreateTicketModal from '../components/common/CreateTicketForm';

export default function App({ Component, pageProps }: AppProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航區 */}
      <nav className="bg-white shadow-md fixed w-full top-0 z-50">
        <div className="w-full px-4">
          <div className="flex items-center justify-between h-16">
            {/* 左側區域：漢堡按鈕、Logo 和搜尋框 */}
            <div className="flex items-center gap-4 flex-1">
              {/* 漢堡按鈕 */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <div className="w-6 h-5 relative transform transition-all duration-300">
                  <span className={`absolute h-0.5 w-6 bg-gray-600 transform transition-all duration-300 
                                ${isSidebarOpen ? 'rotate-45 translate-y-2.5' : 'translate-y-0'}`}></span>
                  <span className={`absolute h-0.5 w-6 bg-gray-600 transform transition-all duration-300 
                                ${isSidebarOpen ? 'opacity-0' : 'opacity-100'} top-2`}></span>
                  <span className={`absolute h-0.5 w-6 bg-gray-600 transform transition-all duration-300 
                                ${isSidebarOpen ? '-rotate-45 translate-y-2.5' : 'translate-y-4'}`}></span>
                </div>
              </button>

              {/* Logo */}
              <div className="flex items-center gap-2 min-w-[180px]">
                <img 
                  src="/msp-logo.png" 
                  alt="Logo" 
                  className="h-8 w-8 transition-all duration-300 hover:scale-110 bg-white" 
                />
                <Link href="/">
                  <span className="text-lg font-bold text-gray-800 whitespace-nowrap hover:text-blue-600 transition-colors duration-200">
                    MetaAge MSP 
                  </span>
                </Link>
              </div>

              {/* 搜尋框 */}
              <div className="relative flex-1 max-w-2xl hidden md:block">
                <input
                  type="text"
                  placeholder="搜尋客戶、工單或專案..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                           transition-all duration-200"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 右側區域：快速建立、通知和用戶資訊 */}
            <div className="flex items-center gap-4">
              {/* 快速建立按鈕與下拉選單 */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg 
                                hover:bg-blue-600 transition-all duration-200 whitespace-nowrap">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>快速建立</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* 下拉選單 */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 invisible group-hover:visible 
                              transition-all duration-200 opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-1">
                  <a 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTicketModalOpen(true);
                    }}
                    href="#" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    建立工單
                  </a>
                </div>
              </div>

              {/* 通知圖標 */}
              <button className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 relative">
                <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>

              {/* 用戶資訊 */}
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-700">管理員</div>
                  <div className="text-xs text-gray-500">admin@msp.com</div>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 
                              flex items-center justify-center text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* 側邊欄 */}
        <Sidebar isSidebarOpen={isSidebarOpen} />

        {/* 主內容區域 */}
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <Component {...pageProps} />
        </div>
      </div>

      {/* 工單建立彈窗 */}
      <CreateTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}
