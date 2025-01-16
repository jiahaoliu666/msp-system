export default function TodoList() {
  return (
    <div className="flex-1 bg-gray-100 p-8">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <a href="#" className="hover:text-blue-600 transition-colors duration-150">首頁</a>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700">待辦事項</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="mr-3 text-3xl">📝</span>
              待辦事項
            </h1>
            <p className="text-gray-600 mt-1">管理您的個人和團隊待辦事項</p>
          </div>
          <div className="flex space-x-3">
            <button className="group px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <svg className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增待辦
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* 搜尋和篩選區 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <input
                  type="text"
                  placeholder="搜尋待辦事項..."
                  className="w-full pl-12 pr-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
                <div className="absolute left-4 top-3.5">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <select className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all duration-200">
                  <option value="">優先級</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div>
                <select className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all duration-200">
                  <option value="">狀態</option>
                  <option value="pending">待處理</option>
                  <option value="in-progress">進行中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
            </div>
          </div>

          {/* 分類標籤 */}
          <div className="flex flex-wrap gap-2">
            <span className="px-6 py-2.5 bg-blue-500 text-white rounded-lg text-sm cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">全部</span>
            <span className="px-6 py-2.5 bg-white text-gray-600 rounded-lg text-sm cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50">個人</span>
            <span className="px-6 py-2.5 bg-white text-gray-600 rounded-lg text-sm cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50">工作</span>
            <span className="px-6 py-2.5 bg-white text-gray-600 rounded-lg text-sm cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50">專案</span>
            <span className="px-6 py-2.5 bg-white text-gray-600 rounded-lg text-sm cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50">會議</span>
          </div>

          {/* 待辦事項列表 */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="mr-2">📋</span>
                  待辦事項列表
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="bg-blue-50 px-3 py-1 rounded-lg">共 12 筆待辦</span>
                  <select className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all duration-200">
                    <option value="20">20 筆/頁</option>
                    <option value="50">50 筆/頁</option>
                    <option value="100">100 筆/頁</option>
                  </select>
                </div>
              </div>

              {/* 待辦事項 */}
              <div className="space-y-4">
                {[
                  { title: '完成季度報告', deadline: '2024/03/20', priority: '高', category: '工作', status: '進行中', assignee: '王小明' },
                  { title: '客戶會議準備', deadline: '2024/03/21', priority: '中', category: '會議', status: '待處理', assignee: '李小華' },
                  { title: '系統更新測試', deadline: '2024/03/22', priority: '高', category: '專案', status: '待處理', assignee: '張小美' },
                  { title: '團隊週會', deadline: '2024/03/23', priority: '中', category: '會議', status: '待處理', assignee: '陳大文' },
                  { title: '文件審核', deadline: '2024/03/24', priority: '低', category: '工作', status: '已完成', assignee: '林小芳' },
                ].map((todo, index) => (
                  <div key={index} className="group flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500 cursor-pointer transition-all duration-200" 
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                            {todo.title}
                          </h3>
                          <span className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all duration-200 ${
                            todo.priority === '高' ? 'bg-red-100 text-red-600 group-hover:bg-red-200' :
                            todo.priority === '中' ? 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200' :
                            'bg-green-100 text-green-600 group-hover:bg-green-200'
                          }`}>
                            {todo.priority}優先級
                          </span>
                          <span className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 text-gray-600 group-hover:bg-gray-200 transition-all duration-200">
                            {todo.category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 mt-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {todo.deadline}
                          </div>
                          <span className="text-gray-300">|</span>
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {todo.assignee}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
                        todo.status === '進行中' ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200' :
                        todo.status === '待處理' ? 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200' :
                        'bg-green-100 text-green-600 group-hover:bg-green-200'
                      }`}>
                        {todo.status}
                      </span>
                      <div className="flex space-x-1">
                        <button className="p-2 hover:bg-white rounded-lg transition-colors duration-200 group-hover:text-blue-600">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg transition-colors duration-200 group-hover:text-red-600">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 分頁控制 */}
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                  顯示 1 至 5 筆，共 12 筆
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    上一頁
                  </button>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">1</button>
                  <button className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200">2</button>
                  <button className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200">3</button>
                  <button className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200 flex items-center">
                    下一頁
                    <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右側資訊區 */}
        <div className="space-y-6">
          {/* 待辦事項統計 */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              待辦統計
            </h3>
            <div className="space-y-4">
              {[
                { label: '待處理', value: 8, color: 'yellow' },
                { label: '進行中', value: 3, color: 'blue' },
                { label: '已完成', value: 15, color: 'green' },
              ].map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600">{stat.label}</span>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    stat.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                    stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    'bg-green-100 text-green-600'
                  }`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 即將到期 */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">⏰</span>
              即將到期
            </h3>
            <div className="space-y-3">
              {[
                { title: '完成季度報告', deadline: '今天 17:00', priority: '高' },
                { title: '客戶會議準備', deadline: '明天', priority: '中' },
                { title: '系統更新測試', deadline: '後天', priority: '高' },
              ].map((item, index) => (
                <div key={index} className="p-3 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-800">{item.title}</p>
                    <span className={`text-xs px-2 py-1 rounded-lg ${
                      item.priority === '高' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item.deadline}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
