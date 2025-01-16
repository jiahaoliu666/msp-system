import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

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
            <option>低 - 可延後處理</option>
            <option>中 - 正常處理</option>
            <option>高 - 緊急處理</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">問題標題</label>
        <input
          type="text"
          className="w-full p-3 border border-border-color rounded-lg bg-background-primary text-text-primary focus:ring-2 focus:ring-accent-color focus:border-accent-color"
          placeholder="請簡要描述您遇到的問題"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">問題描述</label>
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
          <div className="w-32 h-32 rounded-2xl bg-accent-color/10 flex items-center justify-center text-6xl text-accent-color">
            👤
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">提摩超人</h2>
            <p className="text-text-secondary">teemo@metaage.com</p>
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

// 聊天機器人組件
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: '您好！我是 MetaAge 智能助理，很高興為您服務。請問有什麼我可以幫您的嗎？', time: '09:00' },
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
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-background-primary rounded-2xl shadow-2xl border border-border-color/20 flex flex-col overflow-hidden animate-slideUp">
          {/* 聊天視窗標題 */}
          <div className="p-4 bg-gradient-to-r from-accent-color to-info-color text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 p-1 flex items-center justify-center">
                <Image
                  src="/msp-logo.png"
                  alt="MSP Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-medium text-lg">MetaAge 智能助理</h3>
                <div className="flex items-center space-x-2 text-xs text-white/80">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                    線上為您服務
                  </span>
                  <span>|</span>
                  <span>回應時間：約 1 分鐘</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 聊天訊息區域 */}
          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-background-primary to-background-secondary" ref={chatWindowRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  {message.type === 'bot' && (
                    <div className="w-8 h-8 rounded-lg bg-accent-color/10 p-1 mr-2 flex-shrink-0">
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
                        ? 'bg-accent-color text-white rounded-2xl rounded-br-none shadow-lg'
                        : 'bg-white/80 text-text-primary rounded-2xl rounded-bl-none shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-line">{message.content}</div>
                    <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-white/70' : 'text-text-secondary'}`}>
                      {message.time}
                    </div>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-accent-color/10 ml-2 flex items-center justify-center flex-shrink-0">
                      👤
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 快速回覆選項 */}
          <div className="p-3 border-t border-border-color/10 bg-background-primary/50 backdrop-blur-sm">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-accent-color/20 scrollbar-track-transparent">
              {['系統使用問題', '帳號相關', '技術支援', '一般諮詢'].map((option) => (
                <button
                  key={option}
                  className="px-4 py-2 bg-background-secondary text-text-secondary rounded-full hover:bg-accent-color/10 hover:text-accent-color transition-colors whitespace-nowrap text-sm"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* 輸入區域 */}
          <div className="p-4 border-t border-border-color/20 bg-background-primary">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="輸入訊息..."
                  className="w-full px-4 py-3 bg-background-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-color text-text-primary pr-10"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-secondary hover:text-accent-color transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>
              <button className="p-3 bg-accent-color text-white rounded-xl hover:bg-accent-color/90 transition-colors shadow-lg hover:shadow-xl">
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
        className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { title: '合約時間', value: '2025/01/01 - 2025/12/31', icon: '⏱️', color: 'purple' },
                { title: '處理中的工單', value: '3', icon: '⚡', color: 'yellow' },
                { title: '已關閉的工單', value: '9', icon: '✅', color: 'green' },
                { title: '本月工單總數', value: '12', icon: '📊', color: 'blue' },
                
              ].map((stat) => (
                <div 
                  key={stat.title} 
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border-l-4 ${
                    stat.color === 'blue' ? 'border-blue-500 hover:border-blue-600' :
                    stat.color === 'yellow' ? 'border-yellow-500 hover:border-yellow-600' :
                    stat.color === 'green' ? 'border-green-500 hover:border-green-600' :
                    'border-purple-500 hover:border-purple-600'
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
    <>
      <Head>
        <title>MetaAge 工單系統</title>
      </Head>
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
              <a href="https://www.metaage.com.tw/" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/metaage-logo.png"
                  alt="MetaAge Logo" 
                  width={150}
                  height={100}
                  className="object-contain cursor-pointer"
                />
              </a>
            </div>
          </div>
        </div>

        {/* 主要內容區域 */}
        <div className="ml-72 flex-1 p-8">
          <div className="max-w-full">
            <div className="px-4">
              {renderContent()}
            </div>
          </div>
        </div>

        {/* 添加聊天機器人 */}
        <Chatbot />
      </div>
    </>
  );
}
