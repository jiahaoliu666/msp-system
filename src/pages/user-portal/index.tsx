import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

// 頁面標題組件
const PageTitle = ({ title, description }: { title: string; description?: string }) => (
  <div className="mb-12">
    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent tracking-tight leading-[1.6]">
      {title}
    </h1>
    {description && (
      <p className="text-lg text-slate-600 leading-relaxed">
        {description}
      </p>
    )}
  </div>
);

// 統計卡片組件
const StatsCard = ({ icon, title, value }: { icon: string; title: string; value: string }) => (
  <div className="bg-background-primary p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border-color/10 hover:border-accent-color/30 hover:scale-[1.02] cursor-pointer">
    <div className="flex items-start space-x-5">
      <div className="w-16 h-16 rounded-2xl bg-accent-color/10 flex items-center justify-center text-3xl text-accent-color">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-text-primary bg-gradient-to-r from-accent-color to-info-color bg-clip-text text-transparent">{value}</h3>
        <p className="text-base text-text-secondary mt-2">{title}</p>
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
            <option>一般諮詢</option>
            <option>系統故障</option>
            <option>帳號相關</option>
            <option>其他</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">問題優先級</label>
          <select className="w-full p-3 border border-border-color rounded-lg bg-background-primary text-text-primary focus:ring-2 focus:ring-accent-color focus:border-accent-color">
            <option>低 - 可延後處理</option>
            <option>中 - 正常處理</option>
            <option>高 - 緊急處理</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">標題</label>
        <input
          type="text"
          className="w-full p-3 border border-border-color rounded-lg bg-background-primary text-text-primary focus:ring-2 focus:ring-accent-color focus:border-accent-color"
          placeholder="請簡要描述您遇到的問題"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">描述</label>
        <textarea
          rows={4}
          className="w-full p-3 border border-border-color rounded-lg bg-background-primary text-text-primary focus:ring-2 focus:ring-accent-color focus:border-accent-color"
          placeholder="請詳細描述您遇到的問題"
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

// 視圖切換組件
const ViewToggle = ({ view, setView }: { view: 'grid' | 'list'; setView: (view: 'grid' | 'list') => void }) => (
  <div className="flex items-center space-x-2 mb-6">
    <button
      onClick={() => setView('list')}
      className={`p-2 rounded-lg transition-all duration-200 ${
        view === 'list'
          ? 'bg-accent-color text-white'
          : 'bg-background-primary text-text-secondary hover:bg-accent-color/10'
      }`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <button
      onClick={() => setView('grid')}
      className={`p-2 rounded-lg transition-all duration-200 ${
        view === 'grid'
          ? 'bg-accent-color text-white'
          : 'bg-background-primary text-text-secondary hover:bg-accent-color/10'
      }`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    </button>
  </div>
);

// 工單列表組件
const TicketList = ({ tickets, status }: { tickets: any[]; status: 'active' | 'closed' }) => {
  const [view, setView] = useState<'grid' | 'list'>('list');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-text-secondary">
            共 {tickets.length} 個工單
          </span>
        </div>
        <ViewToggle view={view} setView={setView} />
      </div>
      <div className={view === 'grid' ? 'grid grid-cols-2 gap-6' : 'space-y-4'}>
        {tickets.map((ticket, index) => (
          <div
            key={index}
            className={`bg-background-primary ${
              view === 'grid' ? 'p-6' : 'p-4'
            } rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-border-color/10`}
          >
            <div className="flex flex-col h-full">
              <div className={`flex items-center justify-between ${view === 'grid' ? 'mb-4' : 'mb-2'}`}>
                <h3 className="text-lg font-bold text-text-primary">工單 #{ticket.id}</h3>
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  status === 'active'
                    ? 'bg-warning-color/15 text-warning-color'
                    : 'bg-success-color/15 text-success-color'
                }`}>
                  {status === 'active' ? '處理中' : '已解決'}
                </span>
              </div>
              <p className={`text-text-secondary ${view === 'grid' ? 'mb-4' : 'mb-2'} flex-grow`}>{ticket.title}</p>
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
    </div>
  );
};

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
          <div className="w-28 h-28 rounded-3xl bg-accent-color/15 flex items-center justify-center text-5xl text-accent-color shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            👤
          </div>
          <div>
            <h2 className="mt-5 text-xl font-bold text-text-primary">JiaHao</h2>
            <p className="text-text-secondary">Liu</p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="px-3 py-1 bg-success-color/15 text-success-color rounded-full text-sm">系統管理員</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">基本資料</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">名</label>
                <input
                  type="text"
                  value="JiaHao"
                  className="w-full p-3 border border-border-color rounded-lg bg-background-primary"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">性</label>
                <input
                  type="text"
                  value="Liu"
                  className="w-full p-3 border border-border-color rounded-lg bg-background-primary"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">組織</label>
                <input
                  type="text"
                  value="METAAGE"
                  className="w-full p-3 border border-border-color rounded-lg bg-background-primary"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                <input
                  type="email"
                  value="teemo@metaage.com"
                  className="w-full p-3 border border-border-color rounded-lg bg-background-primary"
                  disabled
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">其他資訊</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">電話</label>
                <input
                  type="tel"
                  placeholder="請輸入電話號碼"
                  className="w-full p-3 border border-border-color rounded-lg bg-background-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">地理位置</label>
                <select className="w-full p-3 border border-border-color rounded-lg bg-background-primary">
                  <option>METAAGE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">職責</label>
                <input
                  type="text"
                  placeholder="請輸入職責"
                  className="w-full p-3 border border-border-color rounded-lg bg-background-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">經理</label>
                <input
                  type="text"
                  placeholder="請輸入經理姓名"
                  className="w-full p-3 border border-border-color rounded-lg bg-background-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 安全設定區塊 */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">安全設定</h3>
          <div className="grid grid-cols-2 gap-6">
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

        <div className="flex justify-end space-x-4 mt-6">
          <button className="px-6 py-3 bg-accent-color text-white rounded-lg hover:bg-accent-color/90 transition-colors">
            儲存變更
          </button>
        </div>
      </div>
    </div>
  </div>
);

// 聊天機器人組件
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: '您好！我是 MetaAge MSP 智能助理，很高興為您服務。請問有什麼我可以幫您的嗎？', time: '09:00' },
    { type: 'bot', content: '您可以詢問我關於：\n1. 系統使用問題\n2. 帳號相關問題\n3. 技術支援需求\n4. 一般諮詢', time: '09:00' }
  ]);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen && (
        <div className="absolute bottom-24 right-0 w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200/50 flex flex-col overflow-hidden animate-slideUp">
          {/* 聊天視窗標題 */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 p-1.5 flex items-center justify-center">
                  <Image
                    src="/msp-logo.png"
                    alt="MSP Logo"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-white">MetaAge 智能助理</h3>
                  <div className="flex items-center space-x-2 text-xs text-white/90">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>
                      線上為您服務
                    </span>
                    <span className="text-white/60">|</span>
                    <span className="text-white/90">回應時間：約 1 分鐘</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 聊天訊息區域 */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50" ref={chatWindowRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  {message.type === 'bot' && (
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 p-1 mr-3 flex-shrink-0">
                      <Image
                        src="/msp-logo.png"
                        alt="Bot Avatar"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-4 ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white rounded-2xl rounded-br-none shadow-sm'
                        : 'bg-white text-slate-800 rounded-2xl rounded-bl-none shadow-sm border border-slate-200/50'
                    }`}
                  >
                    <div className="whitespace-pre-line text-sm">{message.content}</div>
                    <div className={`text-xs mt-1.5 ${message.type === 'user' ? 'text-white/80' : 'text-slate-500'}`}>
                      {message.time}
                    </div>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 ml-3 flex items-center justify-center flex-shrink-0">
                      👤
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 快速回覆選項 */}
          <div className="p-4 border-t border-slate-200/50 bg-white">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {['系統使用問題', '帳號相關', '技術支援', '一般諮詢'].map((option) => (
                <button
                  key={option}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-colors whitespace-nowrap text-sm font-medium"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* 輸入區域 */}
          <div className="p-4 border-t border-slate-200/50 bg-white">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="輸入訊息..."
                  className="w-full px-4 py-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 pr-10 text-sm"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>
              <button className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 聊天機器人開關按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 border border-slate-200/50"
      >
        <Image
          src="/msp-logo.png"
          alt="MSP Logo"
          width={40}
          height={40}
          className="object-contain"
        />
      </button>
    </div>
  );
};

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
              {[
                { title: '合約時間', value: '2025/01/01 - 2025/12/31', icon: '⏱️', color: 'purple' },
                { title: '處理中的工單', value: '3', icon: '⚡', color: 'yellow' },
                { title: '已關閉的工單', value: '9', icon: '✅', color: 'green' },
                { title: '本月工單總數', value: '12', icon: '📊', color: 'blue' },
              ].map((stat) => (
                <div 
                  key={stat.title} 
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-8 border-l-4 hover:scale-[1.02] cursor-pointer ${
                    stat.color === 'blue' ? 'border-blue-500 hover:border-blue-600' :
                    stat.color === 'yellow' ? 'border-amber-500 hover:border-amber-600' :
                    stat.color === 'green' ? 'border-emerald-500 hover:border-emerald-600' :
                    'border-violet-500 hover:border-violet-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                      <div className="flex items-center mt-2">
                        <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                      </div>
                    </div>
                    <span className="text-2xl transform transition-transform duration-200 hover:scale-110 cursor-pointer">{stat.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 快速操作卡片 */}
            <div className="grid grid-cols-2 gap-8">
              {/* 建立工單 */}
              <div 
                onClick={() => setActiveTab('create')}
                className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-[1.02] border border-slate-200/50 hover:border-blue-500/30"
              >
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 rounded-2xl bg-accent-color/10 text-accent-color flex items-center justify-center group-hover:bg-accent-color group-hover:text-white transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-[1.02] border border-slate-200/50 hover:border-blue-500/30"
              >
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-amber-500 transition-colors">處理中的工單</h3>
                    <p className="text-sm text-slate-600">追蹤工單處理狀態，與 MetaAge MSP 支援團隊進行溝通</p>
                  </div>
                </div>
              </div>

              {/* 已關閉的工單 */}
              <div 
                onClick={() => setActiveTab('closed')}
                className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-[1.02] border border-slate-200/50 hover:border-blue-500/30"
              >
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-emerald-500 transition-colors">已關閉的工單</h3>
                    <p className="text-sm text-slate-600">查看歷史工單記錄，了解過往的服務內容與解決方案</p>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div 
                onClick={() => setActiveTab('faq')}
                className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-[1.02] border border-slate-200/50 hover:border-blue-500/30"
              >
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-violet-500 transition-colors">常見問題</h3>
                    <p className="text-sm text-slate-600">瀏覽常見問題解答，快速找到您需要的協助</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Head>
        <title>MetaAge 工單系統</title>
      </Head>
      <div className="flex min-h-screen bg-slate-50/80">
        {/* 左側側邊欄 */}
        <div className="w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 fixed h-screen flex flex-col backdrop-blur-xl">
          {/* 使用者資訊區 */}
          <div className="p-8 border-b border-white/5 bg-gradient-to-r from-slate-900 to-slate-800">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center text-5xl text-blue-300 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                👤
              </div>
              <h2 className="mt-5 text-xl font-bold text-white/90">提摩超人</h2>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="mt-1 text-sm text-slate-300 hover:text-blue-300 hover:underline cursor-pointer flex items-center"
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
                  <div className="absolute z-10 mt-2 w-48 -left-8 bg-slate-800 rounded-xl shadow-lg border border-slate-700 py-2">
                    <div className="px-4 py-2 border-b border-slate-700">
                      <p className="text-xs text-slate-400">登入身份</p>
                      <p className="text-sm font-medium text-slate-200">系統管理員</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => setActiveTab('profile')}
                        className="w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover:text-blue-300 flex items-center"
                      >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        我的資料
                      </button>
                      <Link
                        href="/"
                        className="w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover:text-blue-300 flex items-center"
                      >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        後台管理
                      </Link>
                    </div>
                    <div className="border-t border-slate-700 py-1">
                      <button className="w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        登出
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 導航選單 */}
          <nav className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('home')}
                className={`w-full flex items-center px-6 py-4 rounded-xl transition-all duration-300
                  ${activeTab === 'home'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white font-medium shadow-lg'
                  : 'text-white/70 hover:bg-white/5 hover:text-blue-300'
                }`}
              >
                <span className="mr-4 text-2xl">🏠</span>
                <span className="text-base">首頁</span>
              </button>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-6 py-4 rounded-xl transition-all duration-300
                    ${activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white font-medium shadow-lg'
                    : 'text-white/70 hover:bg-white/5 hover:text-blue-300'
                  }`}
                >
                  <span className="mr-4 text-2xl">{item.icon}</span>
                  <span className="text-base">{item.name}</span>
                </button>
              ))}
              <button
                onClick={() => setActiveTab('faq')}
                className={`w-full flex items-center px-6 py-4 rounded-xl transition-all duration-300
                  ${activeTab === 'faq'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white font-medium shadow-lg'
                  : 'text-white/70 hover:bg-white/5 hover:text-blue-300'
                }`}
              >
                <span className="mr-4 text-2xl">❓</span>
                <span className="text-base">FAQ</span>
              </button>
            </div>
          </nav>

          {/* Metaage Logo */}
          <div className="p-4 border-t border-white/5">
            <div className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-b from-white/5 to-transparent rounded-xl">
              <a href="https://www.metaage.com.tw/" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/metaage-logo.png"
                  alt="MetaAge Logo" 
                  width={150}
                  height={100}
                  className="object-contain cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                />
              </a>
            </div>
          </div>
        </div>

        {/* 主要內容區域 */}
        <div className="ml-80 flex-1 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
          <div className="h-full p-8">
            {renderContent()}
          </div>
        </div>

        {/* 添加聊天機器人 */}
        <Chatbot />
      </div>
    </>
  );
}
