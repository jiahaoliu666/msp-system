export default function UserManagement() {
  return (
    <div className="flex-1 bg-gray-100 p-8">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <a href="#" className="hover:text-blue-600">首頁</a>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700">使用者管理</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">使用者管理</h1>
            <p className="text-gray-600 mt-1">管理系統使用者帳號與權限設定</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增使用者
            </button>
          </div>
        </div>
      </div>

      {/* 使用者概況統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { title: '總使用者數', value: '48', color: 'blue', icon: '👥' },
          { title: '本月新增', value: '12', color: 'green', icon: '📈' },
          { title: '待審核帳號', value: '3', color: 'yellow', icon: '⏳' },
          { title: '停用帳號', value: '2', color: 'red', icon: '🚫' },
        ].map((stat) => (
          <div key={stat.title} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
            stat.color === 'blue' ? 'border-blue-500' :
            stat.color === 'green' ? 'border-green-500' :
            stat.color === 'yellow' ? 'border-yellow-500' :
            'border-red-500'
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

      {/* 最近活動記錄 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">最近活動記錄</h2>
        <div className="space-y-4">
          {[
            { user: '王小明', action: '登入系統', time: '2024/03/15 14:30', status: '成功' },
            { user: '李小華', action: '修改權限', time: '2024/03/15 13:45', status: '成功' },
            { user: '張小美', action: '重設密碼', time: '2024/03/15 11:20', status: '失敗' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">{activity.user.slice(0, 1)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{activity.time}</p>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  activity.status === '成功' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 搜尋和篩選區 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋使用者..."
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
              <option value="">帳號狀態</option>
              <option value="active">使用中</option>
              <option value="pending">待審核</option>
              <option value="disabled">已停用</option>
            </select>
          </div>
          <div>
            <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">使用者角色</option>
              <option value="admin">系統管理員</option>
              <option value="manager">部門主管</option>
              <option value="user">一般使用者</option>
            </select>
          </div>
          <div>
            <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">部門</option>
              <option value="it">資訊部</option>
              <option value="sales">業務部</option>
              <option value="support">技術支援部</option>
              <option value="finance">財務部</option>
            </select>
          </div>
        </div>
      </div>

      {/* 使用者列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">使用者列表</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>共 48 位使用者</span>
              <select className="px-2 py-1 border rounded-md">
                <option value="10">10 筆/頁</option>
                <option value="20">20 筆/頁</option>
                <option value="50">50 筆/頁</option>
              </select>
            </div>
          </div>

          {/* 使用者表格 */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">使用者資訊</th>
                  <th className="px-6 py-3">部門/職稱</th>
                  <th className="px-6 py-3">角色</th>
                  <th className="px-6 py-3">狀態</th>
                  <th className="px-6 py-3">最後登入</th>
                  <th className="px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  {
                    name: '王小明',
                    email: 'wang@example.com',
                    department: '資訊部',
                    title: '資深工程師',
                    role: '系統管理員',
                    status: '使用中',
                    lastLogin: '2024/03/15 14:30',
                  },
                  {
                    name: '李小華',
                    email: 'lee@example.com',
                    department: '業務部',
                    title: '業務主管',
                    role: '部門主管',
                    status: '使用中',
                    lastLogin: '2024/03/15 13:45',
                  },
                  {
                    name: '張小美',
                    email: 'chang@example.com',
                    department: '技術支援部',
                    title: '技術支援工程師',
                    role: '一般使用者',
                    status: '待審核',
                    lastLogin: '尚未登入',
                  },
                  {
                    name: '陳大文',
                    email: 'chen@example.com',
                    department: '財務部',
                    title: '財務專員',
                    role: '一般使用者',
                    status: '已停用',
                    lastLogin: '2024/03/10 09:15',
                  },
                ].map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{user.name.slice(0, 1)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.department}</div>
                      <div className="text-sm text-gray-500">{user.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === '使用中' ? 'bg-green-100 text-green-800' :
                        user.status === '待審核' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">編輯</button>
                        <button className="text-gray-600 hover:text-gray-900">權限</button>
                        {user.status === '使用中' ? (
                          <button className="text-red-600 hover:text-red-900">停用</button>
                        ) : (
                          <button className="text-green-600 hover:text-green-900">啟用</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分頁控制 */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              顯示 1 至 4 筆，共 48 筆
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">上一頁</button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded-md">1</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">2</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">3</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">...</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">5</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">下一頁</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
