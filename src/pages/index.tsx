export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 快速訪問欄 */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm hover:text-blue-200 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                首頁
              </a>
              <a href="#" className="text-sm hover:text-blue-200 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                行事曆
              </a>
              <a href="#" className="text-sm hover:text-blue-200 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                訊息中心
              </a>
              <a href="#" className="text-sm hover:text-blue-200 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                工作區
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm hover:text-blue-200">幫助中心</a>
              <span className="text-blue-300">|</span>
              <a href="#" className="text-sm hover:text-blue-200">聯絡支援</a>
              <span className="text-blue-300">|</span>
              <div className="flex items-center">
                <span className="h-2 w-2 bg-green-400 rounded-full mr-2"></span>
                <span className="text-sm">系統正常運行中</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 頂部導航區 */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <img src="/msplogo.png" alt="Logo" className="h-8 w-8" />
                <span className="text-xl font-semibold text-gray-800">
                  MetaAge MSP 
                </span>
              </div>
              {/* 搜尋框 */}
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜尋客戶、工單或專案..."
                    className="w-96 pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute left-3 top-2.5">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* 快速操作按鈕 */}
              <div className="relative group">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  快速建立
                  <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* 下拉選單 */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block">
                  <div className="py-1">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="mr-2">📝</span> 新增工單
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="mr-2">👥</span> 新增客戶
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="mr-2">📅</span> 建立會議
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="mr-2">📋</span> 新增專案
                    </a>
                  </div>
                </div>
              </div>
              {/* 通知圖標 */}
              <div className="relative">
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                </button>
              </div>
              {/* 使用者資訊 */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">管理員</div>
                  <div className="text-xs text-gray-500">admin@msp.com</div>
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* 側邊導航列 */}
        <div className="w-64 bg-white shadow-lg h-[calc(100vh-4rem)]">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {/* 主要功能區 */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                主要功能
              </div>
              {[
                { name: '儀表板', icon: '📊', badge: '', link: '/' },
                { name: '客戶管理', icon: '👥', badge: '12', link: '/customer-management' },
                { name: '服務記錄', icon: '📝', badge: '3', link: '/service-record' },
                { name: '專案追蹤', icon: '📌', badge: '5', link: '/project-tracking' },
                { name: '工單系統', icon: '🎫', badge: '8', link: '/ticket-system' },
                { name: '合約管理', icon: '📋', badge: '', link: '/contract-management' },
                { name: '資產管理', icon: '💻', badge: '2', link: '/asset-management' },
                { name: '知識庫', icon: '📚', badge: '', link: '/knowledge-base' },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md cursor-pointer transition-colors duration-150"
                >
                  <div className="flex items-center">
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}

              {/* 系統管理區 */}
              <div className="mt-8 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                系統管理
              </div>
              {[
                { name: '使用者管理', icon: '👤', link: '/user-management' },
                { name: '權限設定', icon: '🔒', link: '/permission-setting' },
                { name: '系統設定', icon: '⚙️', link: '/system-settings' },
                { name: '操作記錄', icon: '📜', link: '/operation-record' },
                { name: '報表中心', icon: '📊', link: '/report-center' },
                { name: '系統整合', icon: '🔄', link: '/system-integration' },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md cursor-pointer transition-colors duration-150"
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </a>
              ))}
            </div>
          </nav>
        </div>

        {/* 主內容區域 */}
        <div className="flex-1 p-8">
          {/* 頁面標題與操作按鈕 */}
          <div className="mb-8">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <a href="#" className="hover:text-blue-600">首頁</a>
              <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-700">儀表板</span>
            </div>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">儀表板總覽</h1>
                <p className="text-gray-600 mt-1">歡迎回來，這是您的即時營運概況</p>
              </div>
              <div className="flex space-x-3">
                <div className="relative">
                  <button className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-gray-600 flex items-center">
                    <span className="mr-2">📅</span>
                    本週
                    <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <button className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-gray-600 flex items-center">
                  <span className="mr-2">⬇️</span>
                  匯出報表
                </button>
                <button className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-gray-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 快速統計卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { title: '活躍客戶', value: '126', icon: '📈',  color: 'blue',  },
              { title: '待處理工單', value: '23', icon: '🔧',  color: 'yellow',  },
              { title: '待辦事項', value: '2', icon: '💰', color: 'green',  },
              { title: '客戶滿意度', value: '4.8', icon: '⭐',  color: 'purple', },
            ].map((stat) => (
              <div key={stat.title} className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border-l-4 ${
                stat.color === 'blue' ? 'border-blue-500' :
                stat.color === 'yellow' ? 'border-yellow-500' :
                stat.color === 'green' ? 'border-green-500' :
                'border-purple-500'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 主要內容卡片 - 最近活動 */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-bold text-gray-800">最近活動</h2>
                    <div className="flex space-x-2">
                      <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200">全部</span>
                      <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200">工單</span>
                      <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200">合約</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 flex items-center">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      新增工單
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 flex items-center">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      篩選
                    </button>
                  </div>
                </div>

                {/* 活動列表 */}
                <div className="space-y-4">
                  {[
                    { title: '新客戶合約簽署', client: '台灣電子股份有限公司', type: '合約', time: '2小時前', status: '待處理', priority: '高', assignee: '王小明' },
                    { title: '系統維護工單', client: '全球科技有限公司', type: '工單', time: '4小時前', status: '進行中', priority: '中', assignee: '李小華' },
                    { title: '季度服務檢討會議', client: '創新軟體公司', type: '會議', time: '昨天', status: '已完成', priority: '低', assignee: '張小芳' },
                    { title: '設備更新需求', client: '未來網路公司', type: '需求', time: '2天前', status: '待確認', priority: '中', assignee: '陳小明' },
                    { title: '資安稽核報告', client: '數位金融公司', type: '報告', time: '3天前', status: '已完成', priority: '高', assignee: '林小美' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === '待處理' ? 'bg-yellow-400' :
                          activity.status === '進行中' ? 'bg-blue-400' :
                          activity.status === '已完成' ? 'bg-green-400' : 'bg-gray-400'
                        }`} />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-800">{activity.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              activity.priority === '高' ? 'bg-red-100 text-red-600' :
                              activity.priority === '中' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {activity.priority}優先級
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-sm text-gray-500">{activity.client}</p>
                            <span className="text-gray-300">|</span>
                            <p className="text-sm text-gray-500">負責人：{activity.assignee}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                          {activity.type}
                        </span>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                        <button className="p-1 hover:bg-gray-100 rounded-full">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 分頁控制 */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    顯示 1 至 5 筆，共 24 筆
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">上一頁</button>
                    <button className="px-3 py-1 bg-blue-500 text-white rounded-md">1</button>
                    <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">2</button>
                    <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">3</button>
                    <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">下一頁</button>
                  </div>
                </div>
              </div>
            </div>

            {/* 側邊資訊區 */}
            <div className="space-y-8">
              {/* 快速操作區 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">快速操作</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: '新增客戶', icon: '👥', color: 'blue' },
                    { name: '建立工單', icon: '🎫', color: 'green' },
                    { name: '排程會議', icon: '📅', color: 'purple' },
                    { name: '發送通知', icon: '📢', color: 'yellow' },
                  ].map((action) => (
                    <button
                      key={action.name}
                      className={`p-4 rounded-lg border-2 hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${
                        action.color === 'blue' ? 'border-blue-200 hover:border-blue-400' :
                        action.color === 'green' ? 'border-green-200 hover:border-green-400' :
                        action.color === 'purple' ? 'border-purple-200 hover:border-purple-400' :
                        'border-yellow-200 hover:border-yellow-400'
                      }`}
                    >
                      <span className="text-2xl">{action.icon}</span>
                      <span className="text-sm text-gray-600">{action.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 待辦事項 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">待辦事項</h2>
                  <button className="text-blue-500 hover:text-blue-600 text-sm">
                    查看全部
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { text: '完成季度報告', deadline: '今天 17:00', priority: '高' },
                    { text: '客戶滿意度調查', deadline: '明天', priority: '中' },
                    { text: '系統更新通知', deadline: '後天', priority: '低' },
                  ].map((todo, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                      <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-800">{todo.text}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            todo.priority === '高' ? 'bg-red-100 text-red-600' :
                            todo.priority === '中' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {todo.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">截止：{todo.deadline}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 text-sm text-blue-500 hover:text-blue-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  新增待辦事項
                </button>
              </div>

              {/* 團隊在線狀態 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">團隊在線狀態</h2>
                  <span className="text-sm text-gray-500">5/8 在線</span>
                </div>
                <div className="space-y-4">
                  {[
                    { name: '陳小明', role: '技術主管', status: '線上', time: '1小時' },
                    { name: '王大明', role: '客服專員', status: '忙碌', time: '30分鐘' },
                    { name: '林小華', role: '業務經理', status: '離線', time: '2小時' },
                    { name: '張小芳', role: '專案經理', status: '線上', time: '15分鐘' },
                    { name: '李小美', role: '系統工程師', status: '線上', time: '45分鐘' },
                  ].map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {member.name.charAt(0)}
                          </div>
                          <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                            member.status === '線上' ? 'bg-green-400' :
                            member.status === '忙碌' ? 'bg-yellow-400' :
                            'bg-gray-400'
                          }`}></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.status === '線上' ? 'bg-green-100 text-green-600' :
                          member.status === '忙碌' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {member.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">最後更新：{member.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 系統公告 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">系統公告</h2>
                  <button className="text-blue-500 hover:text-blue-600 text-sm">
                    所有公告
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { title: '系統維護通知', content: '系統將於本週六凌晨 2-4 點進行例行維護', time: '2小時前', type: '維護' },
                    { title: '新功能上線公告', content: '客戶管理模組新增批量導入功能', time: '1天前', type: '更新' },
                    { title: '資安更新提醒', content: '請所有用戶更新密碼', time: '2天前', type: '安全' },
                  ].map((announcement, index) => (
                    <div key={index} className="p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-800">{announcement.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              announcement.type === '維護' ? 'bg-blue-100 text-blue-600' :
                              announcement.type === '更新' ? 'bg-green-100 text-green-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {announcement.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">{announcement.time}</span>
                        <button className="text-sm text-blue-500 hover:text-blue-600">
                          查看詳情
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 最近文件 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">最近文件</h2>
                  <button className="text-blue-500 hover:text-blue-600 text-sm">
                    查看全部
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: '客戶需求文件.pdf', type: 'PDF', size: '2.3 MB', time: '3小時前' },
                    { name: '專案報價單.xlsx', type: 'Excel', size: '1.8 MB', time: '昨天' },
                    { name: '系統架構圖.png', type: '圖片', size: '4.5 MB', time: '2天前' },
                  ].map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {file.type === 'PDF' ? '📄' : file.type === 'Excel' ? '📊' : '🖼️'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.size} • {file.time}</p>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded-full">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 系統資源監控 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">系統資源監控</h2>
                  <span className="text-sm text-gray-500">最後更新：1分鐘前</span>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'CPU 使用率', value: '45%', status: 'normal' },
                    { name: '記憶體使用', value: '68%', status: 'warning' },
                    { name: '儲存空間', value: '32%', status: 'normal' },
                  ].map((resource, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{resource.name}</span>
                        <span className={`text-sm ${
                          resource.status === 'normal' ? 'text-green-500' :
                          resource.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                        }`}>{resource.value}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            resource.status === 'normal' ? 'bg-green-500' :
                            resource.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: resource.value }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 新增：重要指標追蹤 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">重要指標追蹤</h2>
                  <button className="text-blue-500 hover:text-blue-600 text-sm">
                    設定目標
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { name: '客戶續約率', current: 85, target: 90, unit: '%' },
                    { name: '問題解決時間', current: 4.2, target: 4, unit: '小時' },
                    { name: '新客戶開發', current: 12, target: 15, unit: '家' },
                  ].map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{metric.name}</span>
                        <span className="text-sm font-medium">
                          {metric.current}{metric.unit} / {metric.target}{metric.unit}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(metric.current / metric.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 新增：近期活動日曆 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">近期活動</h2>
                  <div className="flex space-x-2">
                    <button className="p-1 rounded hover:bg-gray-100">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="p-1 rounded hover:bg-gray-100">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { date: '今天', events: [
                      { time: '10:00', title: '客戶會議', type: '會議' },
                      { time: '14:30', title: '系統維護', type: '工作' },
                    ]},
                    { date: '明天', events: [
                      { time: '09:30', title: '團隊週會', type: '會議' },
                      { time: '15:00', title: '客戶培訓', type: '培訓' },
                    ]},
                  ].map((day, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-16 text-sm font-medium text-gray-600">{day.date}</div>
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>
                      <div className="ml-16 space-y-2">
                        {day.events.map((event, eventIndex) => (
                          <div key={eventIndex} className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500">{event.time}</span>
                            <div className="flex-1 p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                              <p className="text-sm font-medium text-gray-800">{event.title}</p>
                              <p className="text-xs text-gray-500">{event.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full py-2 text-sm text-blue-500 hover:text-blue-600 flex items-center justify-center border border-blue-200 rounded-md hover:bg-blue-50">
                  查看完整行事曆
                </button>
              </div>

              {/* 新增：系統更新日誌 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">系統更新日誌</h2>
                  <span className="text-sm text-gray-500">版本 2.1.0</span>
                </div>
                <div className="space-y-4">
                  {[
                    { version: '2.1.0', date: '2024/03/15', type: '功能更新', content: '新增批量客戶資料導入功能' },
                    { version: '2.0.9', date: '2024/03/10', type: '問題修復', content: '修復報表匯出異常問題' },
                    { version: '2.0.8', date: '2024/03/05', type: '效能優化', content: '提升系統整體運行效能' },
                  ].map((log, index) => (
                    <div key={index} className="p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-800">v{log.version}</span>
                          <span className="text-xs text-gray-500">{log.date}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          log.type === '功能更新' ? 'bg-blue-100 text-blue-600' :
                          log.type === '問題修復' ? 'bg-red-100 text-red-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {log.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{log.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
