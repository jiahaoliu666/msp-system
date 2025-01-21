import Link from 'next/link';
import { useState } from 'react';

export default function ChatRoom() {
  const [message, setMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState('direct'); // 'direct' | 'group'
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const mockMessages = [
    { id: 1, sender: '王小明', content: '早安，請問有收到昨天的報告嗎？', time: '09:15', isMe: false, avatar: '王', status: 'read' },
    { id: 2, sender: '我', content: '有的，我已經看過了，整體看起來不錯！', time: '09:20', isMe: true, status: 'read' },
    { id: 3, sender: '王小明', content: '太好了！那我們下午開會時可以討論一下細節', time: '09:22', isMe: false, avatar: '王', status: 'read' },
    { id: 4, sender: '我', content: '好的，沒問題！', time: '09:25', isMe: true, status: 'sent' },
    { id: 5, sender: '王小明', content: '順便提醒一下，下週二的客戶會議要準備簡報喔！', time: '09:30', isMe: false, avatar: '王', status: 'read' },
    { id: 6, sender: '我', content: '收到，我會提前準備好的！', time: '09:32', isMe: true, status: 'sent' },
  ];

  const mockChats = [
    { id: 1, name: '王小明', avatar: '王', unread: 3, lastMessage: '好的，沒問題！', time: '09:25', online: true, type: 'direct' },
    { id: 2, name: '技術部群組', avatar: '技', unread: 5, lastMessage: '[文件] Q1系統報告.pdf', time: '09:20', members: 8, type: 'group' },
    { id: 3, name: '李小華', avatar: '李', unread: 0, lastMessage: '專案進度更新', time: '昨天', online: false, type: 'direct' },
    { id: 4, name: '產品研發群組', avatar: '產', unread: 2, lastMessage: '新功能討論', time: '昨天', members: 12, type: 'group' },
  ];

  const mockTags = [
    { id: 1, name: '重要客戶', color: 'red' },
    { id: 2, name: 'VIP', color: 'gold' },
    { id: 3, name: '合作夥伴', color: 'blue' },
  ];

  const mockFiles = [
    { id: 1, name: 'Q1系統報告.pdf', type: 'pdf', size: '2.5 MB', date: '2024/03/15' },
    { id: 2, name: '會議記錄.docx', type: 'doc', size: '1.2 MB', date: '2024/03/14' },
    { id: 3, name: '系統架構圖.png', type: 'image', size: '3.8 MB', date: '2024/03/13' },
  ];

  return (
    <div className="flex-1 bg-background-secondary h-screen flex">
      {/* 左側聊天列表 */}
      <div className="w-80 bg-background-primary border-r border-border-color flex flex-col">
        {/* 搜尋區域 */}
        <div className="p-4 border-b border-border-color">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋對話..."
              className="w-full pl-10 pr-4 py-2 bg-background-secondary rounded-lg
                     text-text-primary placeholder-text-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent-color"
            />
            <div className="absolute left-3 top-2.5 text-text-secondary">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 分類標籤 */}
        <div className="flex p-2 gap-2 border-b border-border-color">
          <button
            onClick={() => setSelectedChat('direct')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                     ${selectedChat === 'direct'
                ? 'bg-accent-color text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-hover-color'
              }`}
          >
            私人訊息
          </button>
          <button
            onClick={() => setSelectedChat('group')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                     ${selectedChat === 'group'
                ? 'bg-accent-color text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-hover-color'
              }`}
          >
            群組
          </button>
        </div>

        {/* 聊天列表 */}
        <div className="flex-1 overflow-y-auto">
          {mockChats
            .filter(chat => chat.type === selectedChat)
            .map((chat) => (
              <div
                key={chat.id}
                className="p-4 hover:bg-hover-color cursor-pointer transition-colors border-b border-border-color"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-accent-color/10 flex items-center justify-center text-lg text-accent-color">
                      {chat.avatar}
                    </div>
                    {chat.type === 'direct' && chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success-color rounded-full border-2 border-background-primary"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-text-primary truncate">{chat.name}</h3>
                      <span className="text-xs text-text-secondary">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-text-secondary truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="bg-accent-color text-white text-xs px-2 py-1 rounded-full">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 中間聊天區域 */}
      <div className="flex-1 flex flex-col">
        {/* 聊天室標題 */}
        <div className="bg-background-primary p-4 shadow-sm flex items-center justify-between border-b border-border-color">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-text-secondary">
              <Link href="/" className="hover:text-accent-color transition-colors">首頁</Link>
              <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-text-primary">聊天對話</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-accent-color/10 flex items-center justify-center text-lg text-accent-color">
                王
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary">王小明</h1>
                <p className="text-sm text-success-color">● 線上</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* 聊天內容區域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 日期分隔線 */}
          <div className="flex items-center justify-center">
            <div className="bg-background-primary px-4 py-1 rounded-full text-xs text-text-secondary">
              2024年3月15日
            </div>
          </div>

          {mockMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end space-x-2 max-w-[70%] ${msg.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!msg.isMe && (
                  <div className="w-8 h-8 rounded-full bg-accent-color/10 flex-shrink-0 flex items-center justify-center text-sm text-accent-color">
                    {msg.avatar}
                  </div>
                )}
                <div className={`${msg.isMe ? 'bg-accent-color text-white' : 'bg-background-primary'} rounded-lg p-3 shadow-sm`}>
                  {!msg.isMe && <div className="text-sm font-medium text-text-primary mb-1">{msg.sender}</div>}
                  <div className="text-sm">{msg.content}</div>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <span className={`text-xs ${msg.isMe ? 'text-white/80' : 'text-text-secondary'}`}>{msg.time}</span>
                    {msg.isMe && (
                      <span className="text-xs text-white/80">
                        {msg.status === 'sent' ? '✓' : '✓✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 輸入區域 */}
        <div className="bg-background-primary p-4 border-t border-border-color">
          <div className="flex items-center space-x-2 mb-2">
            <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-hover-color rounded-lg text-text-secondary transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="輸入訊息..."
              className="flex-1 bg-background-secondary rounded-lg px-4 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-color"
            />
            <button className="p-2 bg-accent-color hover:bg-accent-hover text-white rounded-lg transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 右側資訊面板 */}
      <div className="w-80 bg-background-primary border-l border-border-color overflow-y-auto">
        <div className="p-6">
          {/* 用戶資訊 */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-accent-color/10 mx-auto flex items-center justify-center text-2xl text-accent-color">
              王
            </div>
            <h2 className="text-lg font-bold text-text-primary mt-3">王小明</h2>
            <p className="text-sm text-text-secondary">技術部 - 系統工程師</p>
            <div className="flex justify-center space-x-2 mt-4">
              <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>
          </div>

          {/* 標籤區域 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-text-primary">標籤</h3>
              <button className="text-sm text-accent-color hover:text-accent-hover">
                新增標籤
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {mockTags.map((tag) => (
                <span
                  key={tag.id}
                  className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity
                    ${tag.color === 'red' ? 'bg-red-100 text-red-600' :
                      tag.color === 'gold' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>

          {/* 共享檔案 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-text-primary">共享檔案</h3>
              <button className="text-sm text-accent-color hover:text-accent-hover">
                查看全部
              </button>
            </div>
            <div className="space-y-2">
              {mockFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center p-2 hover:bg-hover-color rounded-lg transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent-color/10 flex items-center justify-center text-accent-color mr-3">
                    {file.type === 'pdf' ? '📄' : file.type === 'doc' ? '📝' : '🖼️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-text-primary truncate">{file.name}</h4>
                    <p className="text-xs text-text-secondary">{file.size} • {file.date}</p>
                  </div>
                  <button className="p-1.5 hover:bg-accent-color/10 rounded-lg text-text-secondary transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 聯絡資訊 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-text-primary">聯絡資訊</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <span className="text-text-secondary w-20">電子郵件</span>
                <span className="text-text-primary">wang@example.com</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-text-secondary w-20">手機</span>
                <span className="text-text-primary">0912-345-678</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-text-secondary w-20">分機</span>
                <span className="text-text-primary">1234</span>
              </div>
            </div>
          </div>

          {/* 快速操作 */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-text-primary mb-3">快速操作</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-sm text-text-primary bg-background-secondary hover:bg-hover-color rounded-lg transition-colors flex items-center justify-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                查看相關工單
              </button>
              <button className="w-full px-4 py-2 text-sm text-text-primary bg-background-secondary hover:bg-hover-color rounded-lg transition-colors flex items-center justify-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                安排會議
              </button>
              <button className="w-full px-4 py-2 text-sm text-text-primary bg-background-secondary hover:bg-hover-color rounded-lg transition-colors flex items-center justify-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                分享檔案
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 