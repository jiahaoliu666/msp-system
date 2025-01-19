import React, { useState } from 'react';
import Link from 'next/link';

interface HandoverItem {
  id: string;
  name: string;
  assignee: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  attachments: number;
  comments: number;
}

export default function HandoverItem() {
  const [view, setView] = useState<'board' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // 模擬數據
  const handoverItems: HandoverItem[] = [
    {
      id: 'HO-001',
      name: '系統管理權限交接',
      assignee: '王小明',
      dueDate: '2024/03/20',
      status: 'in_progress',
      progress: 75,
      category: '系統管理',
      description: '完成系統管理員權限的交接和文檔整理',
      priority: 'high',
      attachments: 3,
      comments: 5
    },
    {
      id: 'HO-002',
      name: '客戶資料交接',
      assignee: '李小華',
      dueDate: '2024/03/22',
      status: 'pending',
      progress: 0,
      category: '客戶管理',
      description: '整理並移交重要客戶聯繫資訊和歷史記錄',
      priority: 'medium',
      attachments: 2,
      comments: 1
    },
    {
      id: 'HO-003',
      name: '專案文件移交',
      assignee: '張小美',
      dueDate: '2024/03/25',
      status: 'completed',
      progress: 100,
      category: '文件管理',
      description: '移交所有進行中專案的相關文件和進度報告',
      priority: 'high',
      attachments: 8,
      comments: 12
    },
    {
      id: 'HO-004',
      name: '設備清單確認',
      assignee: '陳大文',
      dueDate: '2024/03/21',
      status: 'in_progress',
      progress: 45,
      category: '資產管理',
      description: '確認並更新公司設備清單和使用狀態',
      priority: 'low',
      attachments: 1,
      comments: 3
    }
  ];

  return (
    <div className="flex-1 bg-gray-100 p-8">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-blue-600 transition-colors duration-150">首頁</Link>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700">交接項目</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              交接項目
            </h1>
            <p className="text-gray-600 mt-1">管理和追蹤所有交接任務的進度</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增交接項目
            </button>
          </div>
        </div>
      </div>

      {/* 統計概覽 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: '待處理項目', value: '5', color: 'yellow', icon: '⏳' },
          { title: '進行中項目', value: '8', color: 'blue', icon: '🔄' },
          { title: '已完成項目', value: '12', color: 'green', icon: '✅' },
          { title: '即將到期', value: '3', color: 'red', icon: '⚠️' },
        ].map((stat) => (
          <div
            key={stat.title}
            className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border-l-4 ${
              stat.color === 'blue' ? 'border-blue-500' :
              stat.color === 'yellow' ? 'border-yellow-500' :
              stat.color === 'green' ? 'border-green-500' :
              'border-red-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 搜尋和篩選區 */}
      <div className="bg-white rounded-xl shadow-sm mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="搜尋交接項目..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <select className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">所有狀態</option>
            <option value="pending">待處理</option>
            <option value="in_progress">進行中</option>
            <option value="completed">已完成</option>
          </select>
          <select className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">所有分類</option>
            <option value="system">系統管理</option>
            <option value="customer">客戶管理</option>
            <option value="document">文件管理</option>
            <option value="asset">資產管理</option>
          </select>
          <select className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">負責人</option>
            <option value="team1">王小明</option>
            <option value="team2">李小華</option>
            <option value="team3">張小美</option>
          </select>
        </div>
      </div>

      {/* 視圖切換 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              view === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setView('board')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              view === 'board'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 交接項目列表 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="space-y-4">
            {handoverItems.map((item) => (
              <div key={item.id} className="group border rounded-xl hover:shadow-md transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${
                        item.status === 'completed' ? 'bg-green-400' :
                        item.status === 'in_progress' ? 'bg-blue-400' :
                        'bg-yellow-400'
                      }`}></div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">{item.id}</span>
                          <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.priority === 'high' ? 'bg-red-100 text-red-600' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {item.priority === 'high' ? '高優先級' :
                             item.priority === 'medium' ? '中優先級' :
                             '低優先級'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.description}
                        </p>
                        <div className="mt-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>進度</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-64">
                              <div
                                className={`h-2 rounded-full ${
                                  item.status === 'completed' ? 'bg-green-500' :
                                  item.status === 'in_progress' ? 'bg-blue-500' :
                                  'bg-yellow-500'
                                }`}
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                            <span>{item.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-8">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">負責人</div>
                        <div className="flex items-center mt-1 space-x-2">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                            {item.assignee.slice(0, 2)}
                          </div>
                          <span className="text-sm font-medium">{item.assignee}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">到期日</div>
                        <div className="text-sm font-medium mt-1">{item.dueDate}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center text-sm text-gray-500">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {item.attachments} 個附件
                      </span>
                      <span className="flex items-center text-sm text-gray-500">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        {item.comments} 則留言
                      </span>
                      <span className="flex items-center text-sm text-gray-500">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 分頁控制 */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              顯示 1 至 4 筆，共 8 筆
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border rounded-lg text-gray-600 hover:bg-gray-50">上一頁</button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded-lg">1</button>
              <button className="px-3 py-1 border rounded-lg text-gray-600 hover:bg-gray-50">2</button>
              <button className="px-3 py-1 border rounded-lg text-gray-600 hover:bg-gray-50">下一頁</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
