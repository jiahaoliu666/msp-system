export default function PermissionSetting() {
  return (
    <div className="flex-1 bg-gray-100 p-8">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <a href="#" className="hover:text-blue-600">首頁</a>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700">權限設定</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">權限設定</h1>
            <p className="text-gray-600 mt-1">管理系統角色與權限配置</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增角色
            </button>
          </div>
        </div>
      </div>

      {/* 角色概況統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { title: '系統角色數', value: '5', color: 'blue', icon: '👥' },
          { title: '自訂角色數', value: '8', color: 'green', icon: '⚙️' },
          { title: '待審核權限', value: '3', color: 'yellow', icon: '⏳' },
          { title: '權限變更記錄', value: '24', color: 'purple', icon: '📝' },
        ].map((stat) => (
          <div key={stat.title} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
            stat.color === 'blue' ? 'border-blue-500' :
            stat.color === 'green' ? 'border-green-500' :
            stat.color === 'yellow' ? 'border-yellow-500' :
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

      {/* 角色列表與權限配置 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">角色與權限管理</h2>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                批量編輯
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">
                匯出設定
              </button>
            </div>
          </div>

          {/* 角色列表 */}
          <div className="space-y-4">
            {[
              {
                name: '系統管理員',
                description: '擁有系統最高權限',
                type: '系統角色',
                users: 3,
                lastModified: '2024/03/15',
                permissions: ['全部功能'],
              },
              {
                name: '部門主管',
                description: '可管理部門內所有功能',
                type: '系統角色',
                users: 8,
                lastModified: '2024/03/14',
                permissions: ['用戶管理', '報表查看', '工單處理'],
              },
              {
                name: '技術支援',
                description: '處理技術支援相關事務',
                type: '自訂角色',
                users: 12,
                lastModified: '2024/03/13',
                permissions: ['工單處理', '知識庫管理'],
              },
              {
                name: '一般使用者',
                description: '基本系統操作權限',
                type: '系統角色',
                users: 25,
                lastModified: '2024/03/12',
                permissions: ['基本查看', '工單提交'],
              },
            ].map((role, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">R</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          role.type === '系統角色' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {role.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {role.permissions.map((permission, pIndex) => (
                          <span key={pIndex} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">使用者數: {role.users}</div>
                    <div className="text-sm text-gray-500">最後修改: {role.lastModified}</div>
                    <div className="mt-2 flex space-x-2 justify-end">
                      <button className="text-blue-600 hover:text-blue-900 text-sm">編輯</button>
                      <button className="text-gray-600 hover:text-gray-900 text-sm">權限</button>
                      <button className="text-red-600 hover:text-red-900 text-sm">刪除</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 分頁控制 */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              顯示 1 至 4 筆，共 13 筆
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

      {/* 權限模組配置 */}
      <div className="mt-6 bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">權限模組配置</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                module: '使用者管理',
                permissions: ['查看列表', '新增使用者', '編輯資料', '刪除使用者', '重設密碼'],
              },
              {
                module: '客戶管理',
                permissions: ['查看客戶', '新增客戶', '編輯客戶', '刪除客戶', '匯出報表'],
              },
              {
                module: '工單系統',
                permissions: ['查看工單', '建立工單', '處理工單', '關閉工單', '工單報表'],
              },
              {
                module: '報表中心',
                permissions: ['查看報表', '匯出報表', '自訂報表', '排程報表'],
              },
              {
                module: '系統設定',
                permissions: ['基本設定', '進階設定', '安全設定', '備份設定'],
              },
              {
                module: '稽核記錄',
                permissions: ['查看記錄', '匯出記錄', '清除記錄'],
              },
            ].map((module, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-900">{module.module}</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    設定
                  </button>
                </div>
                <div className="space-y-2">
                  {module.permissions.map((permission, pIndex) => (
                    <div key={pIndex} className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        {permission}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
