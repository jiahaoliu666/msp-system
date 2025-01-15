export default function PermissionSetting() {
  return (
    <div className="flex-1 bg-background-secondary p-8">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-text-secondary mb-4">
          <a href="#" className="hover:text-accent-color transition-colors">首頁</a>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-text-primary">權限設定</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">權限設定</h1>
            <p className="text-text-secondary mt-1">管理系統角色與權限配置</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-accent-color text-white rounded-lg hover:bg-accent-hover transition-colors duration-150 flex items-center">
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
          { title: '系統角色數', value: '5', color: 'accent', icon: '👥' },
          { title: '自訂角色數', value: '8', color: 'success', icon: '⚙️' },
          { title: '待審核權限', value: '3', color: 'warning', icon: '⏳' },
          { title: '權限變更記錄', value: '24', color: 'info', icon: '📝' },
        ].map((stat) => (
          <div key={stat.title} className={`bg-background-primary rounded-xl shadow-sm p-6 border-l-4 ${
            stat.color === 'accent' ? 'border-accent-color' :
            stat.color === 'success' ? 'border-success-color' :
            stat.color === 'warning' ? 'border-warning-color' :
            'border-info-color'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-secondary text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold text-text-primary mt-1">{stat.value}</h3>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 角色列表與權限配置 */}
      <div className="bg-background-primary rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-primary">角色與權限管理</h2>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm text-accent-color hover:text-accent-hover transition-colors">
                批量編輯
              </button>
              <button className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary transition-colors">
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
              <div key={index} className="border border-border-color rounded-xl p-4 hover:bg-hover-color transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-lg bg-accent-color/10 flex items-center justify-center">
                      <span className="text-accent-color font-medium">R</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-text-primary">{role.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          role.type === '系統角色' ? 'bg-accent-color/10 text-accent-color' : 'bg-success-color/10 text-success-color'
                        }`}>
                          {role.type}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{role.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {role.permissions.map((permission, pIndex) => (
                          <span key={pIndex} className="px-2 py-1 text-xs bg-hover-color text-text-secondary rounded-lg">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-text-secondary">使用者數: {role.users}</div>
                    <div className="text-sm text-text-secondary">最後修改: {role.lastModified}</div>
                    <div className="mt-2 flex space-x-2 justify-end">
                      <button className="text-accent-color hover:text-accent-hover text-sm transition-colors">編輯</button>
                      <button className="text-text-secondary hover:text-text-primary text-sm transition-colors">權限</button>
                      <button className="text-error-color hover:text-error-hover text-sm transition-colors">刪除</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 分頁控制 */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-text-secondary">
              顯示 1 至 4 筆，共 13 筆
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">上一頁</button>
              <button className="px-3 py-1 bg-accent-color text-white rounded-lg">1</button>
              <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">2</button>
              <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">3</button>
              <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">下一頁</button>
            </div>
          </div>
        </div>
      </div>

      {/* 權限模組配置 */}
      <div className="mt-6 bg-background-primary rounded-xl shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">權限模組配置</h2>
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
              <div key={index} className="border border-border-color rounded-xl p-4 hover:shadow-sm transition-all duration-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-text-primary">{module.module}</h3>
                  <button className="text-sm text-accent-color hover:text-accent-hover transition-colors">
                    設定
                  </button>
                </div>
                <div className="space-y-2">
                  {module.permissions.map((permission, pIndex) => (
                    <div key={pIndex} className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-accent-color rounded border-border-color"
                      />
                      <label className="ml-2 text-sm text-text-primary">
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
