export default function OperationRecord() {
  return (
    <div className="flex-1 bg-gray-100 p-8">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <a href="#" className="hover:text-blue-600">首頁</a>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700">操作紀錄</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">操作紀錄</h1>
            <p className="text-gray-600 mt-1">查看系統操作日誌與稽核記錄</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-gray-600 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              匯出記錄
            </button>
          </div>
        </div>
      </div>

      {/* 操作統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { title: '今日操作數', value: '328', color: 'blue', icon: '📊' },
          { title: '異常操作', value: '3', color: 'red', icon: '⚠️' },
          { title: '系統更新', value: '12', color: 'green', icon: '🔄' },
          { title: '安全警報', value: '5', color: 'yellow', icon: '🔔' },
        ].map((stat) => (
          <div key={stat.title} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
            stat.color === 'blue' ? 'border-blue-500' :
            stat.color === 'red' ? 'border-red-500' :
            stat.color === 'green' ? 'border-green-500' :
            'border-yellow-500'
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

      {/* 搜尋和篩選區 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="搜尋操作記錄..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div>
            <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">操作類型</option>
              <option value="login">登入登出</option>
              <option value="data">資料操作</option>
              <option value="system">系統設定</option>
              <option value="security">安全相關</option>
            </select>
          </div>
          <div>
            <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">操作結果</option>
              <option value="success">成功</option>
              <option value="fail">失敗</option>
              <option value="warning">警告</option>
            </select>
          </div>
          <div>
            <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">操作人員</option>
              <option value="admin">系統管理員</option>
              <option value="user">一般使用者</option>
              <option value="system">系統自動</option>
            </select>
          </div>
          <div>
            <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">時間範圍</option>
              <option value="today">今天</option>
              <option value="week">本週</option>
              <option value="month">本月</option>
              <option value="custom">自訂範圍</option>
            </select>
          </div>
        </div>
      </div>

      {/* 操作記錄列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">操作記錄列表</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>共 328 筆記錄</span>
              <select className="px-2 py-1 border rounded-md">
                <option value="20">20 筆/頁</option>
                <option value="50">50 筆/頁</option>
                <option value="100">100 筆/頁</option>
              </select>
            </div>
          </div>

          {/* 記錄列表 */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">操作時間</th>
                  <th className="px-6 py-3">操作人員</th>
                  <th className="px-6 py-3">IP 位址</th>
                  <th className="px-6 py-3">操作類型</th>
                  <th className="px-6 py-3">操作內容</th>
                  <th className="px-6 py-3">結果</th>
                  <th className="px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  {
                    time: '2024/03/15 15:30:22',
                    user: '王小明',
                    ip: '192.168.1.100',
                    type: '登入系統',
                    content: '使用者登入',
                    result: '成功',
                  },
                  {
                    time: '2024/03/15 15:28:15',
                    user: '系統',
                    ip: '192.168.1.1',
                    type: '系統更新',
                    content: '系統自動備份',
                    result: '成功',
                  },
                  {
                    time: '2024/03/15 15:25:33',
                    user: '李小華',
                    ip: '192.168.1.101',
                    type: '資料操作',
                    content: '修改客戶資料',
                    result: '成功',
                  },
                  {
                    time: '2024/03/15 15:20:45',
                    user: '張小美',
                    ip: '192.168.1.102',
                    type: '安全警報',
                    content: '嘗試訪問未授權頁面',
                    result: '警告',
                  },
                  {
                    time: '2024/03/15 15:15:12',
                    user: '陳大文',
                    ip: '192.168.1.103',
                    type: '登入系統',
                    content: '密碼錯誤',
                    result: '失敗',
                  },
                ].map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {record.user === '系統' ? 'S' : record.user.slice(0, 1)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{record.user}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.content}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.result === '成功' ? 'bg-green-100 text-green-800' :
                        record.result === '失敗' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.result}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">詳情</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分頁控制 */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              顯示 1 至 5 筆，共 328 筆
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">上一頁</button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded-md">1</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">2</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">3</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">...</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">66</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">下一頁</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
