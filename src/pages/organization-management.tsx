export default function OrganizationManagement() {
  return (
    <div className="flex-1 bg-background-secondary p-8">
      {/* 頁面標題與麵包屑導航 */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-text-secondary mb-4">
          <a href="#" className="hover:text-accent-color transition-colors">首頁</a>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-text-primary">組織管理</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">組織管理</h1>
            <p className="text-text-secondary mt-1">管理客戶的組織架構與人員配置</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-accent-color text-white rounded-lg hover:bg-accent-hover transition-colors duration-150 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增組織
            </button>
          </div>
        </div>
      </div>

      {/* 組織概況統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { title: '組織數', value: '15', color: 'accent', icon: '🏢' },
          { title: '總用戶數', value: '342', color: 'success', icon: '👥' },
          { title: '本月新增', value: '3', color: 'warning', icon: '📈' },
          { title: '活躍組織', value: '12', color: 'info', icon: '✨' },
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

      {/* 組織管理列表 */}
      <div className="bg-background-primary rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-primary">組織列表</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋組織..."
                  className="w-64 pl-10 pr-4 py-2 border border-border-color rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-accent-color"
                />
                <div className="absolute left-3 top-2.5">
                  <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="px-6 py-3 text-left text-text-primary">組織名稱</th>
                  <th className="px-6 py-3 text-left text-text-primary">負責人</th>
                  <th className="px-6 py-3 text-left text-text-primary">用戶數</th>
                  <th className="px-6 py-3 text-left text-text-primary">授權數量</th>
                  <th className="px-6 py-3 text-left text-text-primary">建立時間</th>
                  <th className="px-6 py-3 text-left text-text-primary">操作</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: '台灣微軟股份有限公司',
                    manager: '張志明',
                    members: 73,
                    licenses: 100,
                    createdAt: '2023/01/15',
                  },
                  {
                    name: '聯發科技股份有限公司',
                    manager: '李小華',
                    members: 45,
                    licenses: 50,
                    createdAt: '2023/02/01',
                  },
                  {
                    name: '鴻海精密工業',
                    manager: '王大明',
                    members: 120,
                    licenses: 150,
                    createdAt: '2023/03/10',
                  },
                ].map((org, index) => (
                  <tr key={index} className="border-b border-border-color hover:bg-hover-color transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🏢</span>
                        <span className="font-medium text-text-primary">{org.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-accent-color/10 text-accent-color flex items-center justify-center">
                          {org.manager.charAt(0)}
                        </div>
                        <span className="ml-2 text-text-primary">{org.manager}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-primary">{org.members} / {org.licenses}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-success-color/10 text-success-color rounded">
                        {org.licenses} 個
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {org.createdAt}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-accent-color transition-colors">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-accent-color transition-colors">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-error-color transition-colors">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分頁控制 */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-text-secondary">
              顯示 1 至 3 筆，共 15 筆
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">上一頁</button>
              <button className="px-3 py-1 bg-accent-color text-white rounded-lg">1</button>
              <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">2</button>
              <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">下一頁</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
