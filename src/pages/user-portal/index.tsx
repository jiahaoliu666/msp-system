import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// 麵包屑導航組件
const Breadcrumb = ({ activeTab }: { activeTab: string }) => {
  const getBreadcrumbText = (tab: string) => {
    const mapping: { [key: string]: string } = {
      home: '首頁',
      create: '建立工單',
      active: '處理中的工單',
      closed: '已關閉的工單',
      faq: '常見問題',
      profile: '我的資料'
    };
    return mapping[tab] || '首頁';
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-text-secondary mb-6">
      <span>使用者入口</span>
      <span>/</span>
      <span className="text-accent-color">{getBreadcrumbText(activeTab)}</span>
    </div>
  );
};

// 頁面標題組件
const PageTitle = ({ title, description }: { title: string; description?: string }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
    {description && <p className="mt-2 text-text-secondary">{description}</p>}
  </div>
);

// 統計卡片組件
const StatsCard = ({ icon, title, value }: { icon: string; title: string; value: string }) => (
  <div className="bg-background-primary p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border-color/10">
    <div className="flex items-start space-x-4">
      <div className="w-14 h-14 rounded-xl bg-accent-color/10 flex items-center justify-center text-2xl text-accent-color">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-text-primary">{value}</h3>
        <p className="text-sm text-text-secondary mt-1">{title}</p>
      </div>
    </div>
  </div>
);

// 建立工單表單組件
const CreateTicket = () => (
  <div>
    <PageTitle 
      title="建立工單" 
      description="請填寫以下表單，MetaAge MSP 支援團隊會盡快處理您的需求。"
    />
    <form className="space-y-6 bg-background-primary p-8 rounded-xl shadow-sm">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">服務類型</label>
          <select className="w-full p-3 border border-border-color rounded-lg bg-background-primary text-text-primary focus:ring-2 focus:ring-accent-color focus:border-accent-color">
            <option>技術支援</option>
            <option>系統問題</option>
            <option>帳號相關</option>
            <option>其他</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">問題優先級</label>
          <select className="w-full p-3 border border-border-color rounded-lg bg-background-primary text-text-primary focus:ring-2 focus:ring-accent-color focus:border-accent-color">
            <option>低</option>
            <option>中</option>
            <option>高</option>
            <option>緊急</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">問題標題</label>
        <input
          type="text"
          className="w-full p-3 border border-border-color rounded-lg bg-background-primary text-text-primary focus:ring-2 focus:ring-accent-color focus:border-accent-color"
          placeholder="請簡短描述問題..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">問題描述</label>
        <textarea
          rows={4}
          className="w-full p-3 border border-border-color rounded-lg bg-background-primary text-text-primary focus:ring-2 focus:ring-accent-color focus:border-accent-color"
          placeholder="請詳細描述您遇到的問題..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">附件上傳</label>
        <div className="border-2 border-dashed border-border-color rounded-lg p-6 text-center hover:border-accent-color transition-colors">
          <input type="file" className="hidden" id="file-upload" multiple />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="space-y-2">
              <div className="text-accent-color">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-sm text-text-secondary">
                <span className="text-accent-color">點擊上傳</span> 或拖放檔案
              </div>
              <p className="text-xs text-text-secondary">
                支援 PNG, JPG, PDF 檔案，單檔最大 10MB
              </p>
            </div>
          </label>
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-6 py-3 border border-border-color rounded-lg text-text-primary hover:bg-background-secondary transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-accent-color text-white rounded-lg hover:bg-accent-color/90 transition-colors"
        >
          提交工單
        </button>
      </div>
    </form>
  </div>
);

// 工單列表組件
const TicketList = ({ tickets, status }: { tickets: any[]; status: 'active' | 'closed' }) => (
  <div className="grid grid-cols-2 gap-6">
    {tickets.map((ticket, index) => (
      <div key={index} className="bg-background-primary p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-border-color/10">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary">工單 #{ticket.id}</h3>
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              status === 'active' 
                ? 'bg-warning-color/15 text-warning-color' 
                : 'bg-success-color/15 text-success-color'
            }`}>
              {status === 'active' ? '處理中' : '已解決'}
            </span>
          </div>
          <p className="text-text-secondary mb-4 flex-grow">{ticket.title}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <span className="flex items-center bg-background-secondary px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {ticket.date}
              </span>
              <span className="flex items-center bg-background-secondary px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {ticket.comments} 則回覆
              </span>
            </div>
            <button className="flex items-center text-accent-color hover:text-accent-color/80 bg-accent-color/5 px-4 py-2 rounded-lg hover:bg-accent-color/10 transition-all duration-200">
              查看詳情
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ActiveTickets = () => {
  const activeTickets = [
    { id: '2024001', title: '系統問題：無法登入後台管理系統', date: '2024/03/15', comments: 3 },
    { id: '2024002', title: '技術支援：API 整合問題', date: '2024/03/14', comments: 5 },
    { id: '2024003', title: '帳號相關：需要增加使用者權限', date: '2024/03/13', comments: 2 },
  ];

  return (
    <div>
      <PageTitle 
        title="處理中的工單" 
        description="這裡列出所有正在處理中的工單，您可以即時追蹤處理進度。"
      />
      <TicketList tickets={activeTickets} status="active" />
    </div>
  );
};

const ClosedTickets = () => {
  const closedTickets = [
    { id: '2024001', title: '帳號相關：重設密碼請求', date: '2024/03/10', comments: 4 },
    { id: '2024002', title: '系統問題：檔案上傳失敗', date: '2024/03/09', comments: 3 },
    { id: '2024003', title: '技術支援：網站載入速度優化', date: '2024/03/08', comments: 6 },
  ];

  return (
    <div>
      <PageTitle 
        title="已關閉的工單" 
        description="這裡列出所有已解決並關閉的工單記錄。"
      />
      <TicketList tickets={closedTickets} status="closed" />
    </div>
  );
};

const FAQ = () => (
  <div>
    <PageTitle 
      title="常見問題" 
      description="這裡列出了最常見的問題和解答，希望能幫助您快速解決問題。"
    />
    <div className="grid grid-cols-2 gap-8">
      {[
        { title: '帳號設定', icon: '👤', color: 'accent-color' },
        { title: '系統使用', icon: '⚙️', color: 'warning-color' },
        { title: '技術支援', icon: '🔧', color: 'success-color' },
        { title: '服務政策', icon: '📋', color: 'info-color' }
      ].map((category) => (
        <div key={category.title} className="bg-background-primary p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border-color/10">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-12 h-12 rounded-xl bg-${category.color}/10 flex items-center justify-center text-2xl`}>
              {category.icon}
            </div>
            <h3 className="text-xl font-bold text-text-primary">{category.title}</h3>
          </div>
          <ul className="space-y-3">
            {[1, 2, 3].map((item) => (
              <li key={item} className="group">
                <button className="w-full text-left p-4 rounded-xl text-text-secondary group-hover:bg-accent-color/5 group-hover:text-accent-color transition-all duration-200 flex items-center justify-between">
                  <span>如何{category.title}相關問題 #{item}？</span>
                  <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const Profile = () => (
  <div>
    <PageTitle 
      title="我的資料" 
      description="查看和管理您的個人資料設定。"
    />
    <div className="bg-background-primary p-8 rounded-xl shadow-lg">
      <div className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="w-32 h-32 rounded-2xl bg-accent-color/10 flex items-center justify-center text-6xl text-accent-color">
            👤
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">提摩超人</h2>
            <p className="text-text-secondary">teemo@metaage.com</p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="px-3 py-1 bg-success-color/15 text-success-color rounded-full text-sm">系統管理員</span>
              <span className="px-3 py-1 bg-info-color/15 text-info-color rounded-full text-sm">在線</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">基本資料</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">姓名</label>
                <input
                  type="text"
                  value="提摩超人"
                  className="w-full p-3 border border-border-color rounded-lg bg-background-primary"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">電子郵件</label>
                <input
                  type="email"
                  value="teemo@metaage.com"
                  className="w-full p-3 border border-border-color rounded-lg bg-background-primary"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">部門</label>
                <input
                  type="text"
                  value="資訊部"
                  className="w-full p-3 border border-border-color rounded-lg bg-background-primary"
                  disabled
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">安全設定</h3>
            <div className="space-y-4">
              <button className="w-full p-4 border border-border-color rounded-lg hover:bg-accent-color/5 transition-colors flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-text-primary font-medium">修改密碼</div>
                    <div className="text-sm text-text-secondary">上次更新：2024/03/01</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button className="w-full p-4 border border-border-color rounded-lg hover:bg-accent-color/5 transition-colors flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-text-primary font-medium">雙重認證</div>
                    <div className="text-sm text-text-secondary">未啟用</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function UserPortal() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    { id: 'create', name: '建立工單', icon: '➕' },
    { id: 'active', name: '處理中的工單', icon: '🔄' },
    { id: 'closed', name: '已關閉的工單', icon: '✅' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return <CreateTicket />;
      case 'active':
        return <ActiveTickets />;
      case 'closed':
        return <ClosedTickets />;
      case 'faq':
        return <FAQ />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <div>
            <PageTitle 
              title="歡迎使用 MetaAge MSP 工單系統" 
              description="在這裡，您可以輕鬆管理您的服務請求和追蹤工單狀態。"
            />
            
            {/* 統計概覽 */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <StatsCard icon="📊" title="本月工單總數" value="12" />
              <StatsCard icon="⚡" title="處理中工單" value="3" />
              <StatsCard icon="✅" title="已解決工單" value="9" />
              <StatsCard icon="⏱️" title="平均處理時間" value="2.5天" />
            </div>

            {/* 快速操作卡片 */}
            <div className="grid grid-cols-2 gap-6">
              {/* 建立工單 */}
              <div 
                onClick={() => setActiveTab('create')}
                className="bg-background-primary p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start space-x-5">
                  <div className="w-12 h-12 rounded-xl bg-accent-color/10 text-accent-color flex items-center justify-center group-hover:bg-accent-color group-hover:text-white transition-all duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent-color transition-colors">建立工單</h3>
                    <p className="text-sm text-text-secondary">需要幫助嗎？選擇服務內容，輸入您所遇到的問題，即可送出工單給 MetaAge MSP 支援團隊</p>
                  </div>
                </div>
              </div>

              {/* 處理中的工單 */}
              <div 
                onClick={() => setActiveTab('active')}
                className="bg-background-primary p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start space-x-5">
                  <div className="w-12 h-12 rounded-xl bg-warning-color/10 text-warning-color flex items-center justify-center group-hover:bg-warning-color group-hover:text-white transition-all duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-warning-color transition-colors">處理中的工單</h3>
                    <p className="text-sm text-text-secondary">追蹤工單處理狀態，與 MetaAge MSP 支援團隊進行溝通</p>
                  </div>
                </div>
              </div>

              {/* 已關閉的工單 */}
              <div 
                onClick={() => setActiveTab('closed')}
                className="bg-background-primary p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start space-x-5">
                  <div className="w-12 h-12 rounded-xl bg-success-color/10 text-success-color flex items-center justify-center group-hover:bg-success-color group-hover:text-white transition-all duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-success-color transition-colors">已關閉的工單</h3>
                    <p className="text-sm text-text-secondary">查看歷史工單記錄，了解過往的服務內容與解決方案</p>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div 
                onClick={() => setActiveTab('faq')}
                className="bg-background-primary p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start space-x-5">
                  <div className="w-12 h-12 rounded-xl bg-info-color/10 text-info-color flex items-center justify-center group-hover:bg-info-color group-hover:text-white transition-all duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-info-color transition-colors">常見問題</h3>
                    <p className="text-sm text-text-secondary">瀏覽常見問題解答，快速找到您需要的協助</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background-secondary">
      {/* 左側側邊欄 */}
      <div className="w-72 bg-background-primary border-r border-border-color/20 fixed h-screen flex flex-col">
        {/* 使用者資訊區 */}
        <div className="p-6 border-b border-border-color/20">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl bg-accent-color/10 flex items-center justify-center text-4xl text-accent-color shadow-md">
              👤
            </div>
            <h2 className="mt-4 text-lg font-bold text-text-primary">提摩超人</h2>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="mt-1 text-sm text-text-secondary hover:underline cursor-pointer flex items-center"
              >
                teemo@metaage.com
                <svg
                  className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* 下拉選單 */}
              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 w-48 -left-8 bg-background-primary rounded-xl shadow-lg border border-border-color/20 py-2">
                  <div className="px-4 py-2 border-b border-border-color/20">
                    <p className="text-xs text-text-secondary">登入身份</p>
                    <p className="text-sm font-medium text-text-primary">系統管理員</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="w-full px-4 py-2 text-sm text-text-primary hover:bg-accent-color/5 hover:text-accent-color flex items-center"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      我的資料
                    </button>
                    <Link
                      href="/"
                      className="w-full px-4 py-2 text-sm text-text-primary hover:bg-accent-color/5 hover:text-accent-color flex items-center"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      後台管理
                    </Link>
                  </div>
                  <div className="border-t border-border-color/20 py-1">
                    <button className="w-full px-4 py-2 text-sm text-error-color hover:bg-error-color/5 flex items-center">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      登出
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 px-4 py-1.5 bg-success-color/15 rounded-full text-success-color text-sm font-medium flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-success-color mr-2"></span>
              在線
            </div>
          </div>
        </div>

        {/* 導航選單 */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center px-5 py-3.5 rounded-xl transition-all duration-200
                ${activeTab === 'home'
                ? 'bg-accent-color/15 text-accent-color font-medium shadow-sm'
                : 'text-text-primary hover:bg-accent-color/10 hover:text-accent-color'
              }`}
            >
              <span className="mr-4 text-2xl">🏠</span>
              <span className="text-base">首頁</span>
            </button>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-5 py-3.5 rounded-xl transition-all duration-200
                  ${activeTab === item.id
                  ? 'bg-accent-color/15 text-accent-color font-medium shadow-sm'
                  : 'text-text-primary hover:bg-accent-color/10 hover:text-accent-color'
                }`}
              >
                <span className="mr-4 text-2xl">{item.icon}</span>
                <span className="text-base">{item.name}</span>
              </button>
            ))}
            <button
              onClick={() => setActiveTab('faq')}
              className={`w-full flex items-center px-5 py-3.5 rounded-xl transition-all duration-200
                ${activeTab === 'faq'
                ? 'bg-accent-color/15 text-accent-color font-medium shadow-sm'
                : 'text-text-primary hover:bg-accent-color/10 hover:text-accent-color'
              }`}
            >
              <span className="mr-4 text-2xl">❓</span>
              <span className="text-base">FAQ</span>
            </button>
          </div>
        </nav>

        {/* Metaage Logo */}
        <div className="p-4 border-t border-border-color/20">
          <div className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-b from-accent-color/5 to-info-color/5 rounded-xl">
            <svg className="w-12 h-12 text-accent-color" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span className="text-xl font-bold bg-gradient-to-r from-accent-color to-info-color bg-clip-text text-transparent">
              MetaAge
            </span>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="ml-72 flex-1 p-8">
        <div className="max-w-full">
          <div className="mb-8">
            <Breadcrumb activeTab={activeTab} />
          </div>
          <div className="px-4">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
