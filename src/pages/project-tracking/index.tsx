export default function ProjectTracking() {
  return (
    <div className="flex-1 bg-gray-100 p-8">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <a href="#" className="hover:text-blue-600">首頁</a>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700">專案追蹤</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">專案追蹤</h1>
            <p className="text-gray-600 mt-1">追蹤所有專案進度與里程碑</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增專案
            </button>
            <button className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-gray-600 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              篩選排序
            </button>
          </div>
        </div>
      </div>

      {/* 專案概況統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { title: '進行中專案', value: '12', color: 'blue', icon: '📊' },
          { title: '即將到期', value: '4', color: 'yellow', icon: '⚠️' },
          { title: '本月完成', value: '8', color: 'green', icon: '✅' },
          { title: '專案總預算', value: '2.5M', color: 'purple', icon: '💰' },
        ].map((stat) => (
          <div key={stat.title} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
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

      {/* 專案進度追蹤 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">重點專案進度</h2>
        <div className="space-y-4">
          {[
            { name: '雲端基礎架構升級', progress: 75, status: '進行中', dueDate: '2024/04/15' },
            { name: '資安防護系統建置', progress: 45, status: '進行中', dueDate: '2024/05/01' },
            { name: '企業數位轉型專案', progress: 90, status: '即將完成', dueDate: '2024/03/30' },
            { name: '資料中心擴充', progress: 30, status: '進行中', dueDate: '2024/06/30' },
          ].map((project, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">截止日期：{project.dueDate}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  project.status === '進行中' ? 'bg-blue-100 text-blue-600' :
                  project.status === '即將完成' ? 'bg-green-100 text-green-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      進度 {project.progress}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-gray-600">
                      {project.progress < 100 ? '進行中' : '已完成'}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                  <div
                    style={{ width: `${project.progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 專案列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">所有專案</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋專案..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-2.5">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <select className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">專案狀態</option>
                <option value="active">進行中</option>
                <option value="completed">已完成</option>
                <option value="pending">未開始</option>
              </select>
            </div>
          </div>

          {/* 專案表格 */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">專案名稱</th>
                  <th className="px-6 py-3">客戶</th>
                  <th className="px-6 py-3">負責人</th>
                  <th className="px-6 py-3">進度</th>
                  <th className="px-6 py-3">狀態</th>
                  <th className="px-6 py-3">截止日期</th>
                  <th className="px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  {
                    name: '企業資安升級專案',
                    client: '台灣電子股份有限公司',
                    manager: '王小明',
                    progress: 65,
                    status: '進行中',
                    dueDate: '2024/04/30',
                  },
                  {
                    name: '雲端遷移專案',
                    client: '創新科技有限公司',
                    manager: '李小華',
                    progress: 85,
                    status: '即將完成',
                    dueDate: '2024/03/25',
                  },
                  {
                    name: '網路基礎建設',
                    client: '未來網路科技',
                    manager: '張小美',
                    progress: 30,
                    status: '進行中',
                    dueDate: '2024/06/15',
                  },
                  {
                    name: '資料中心整合',
                    client: '數位金融服務',
                    manager: '陳小明',
                    progress: 15,
                    status: '剛開始',
                    dueDate: '2024/08/30',
                  },
                ].map((project, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">P{index + 1}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">專案編號: PRJ-2024{index + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{project.client}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium">{project.manager.slice(0, 1)}</span>
                        </div>
                        <span className="ml-2 text-sm text-gray-900">{project.manager}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <span className="text-xs font-semibold inline-block text-blue-600">
                            {project.progress}%
                          </span>
                        </div>
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                          <div
                            style={{ width: `${project.progress}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === '進行中' ? 'bg-blue-100 text-blue-800' :
                        project.status === '即將完成' ? 'bg-green-100 text-green-800' :
                        project.status === '剛開始' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {project.dueDate}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">詳情</button>
                        <button className="text-gray-600 hover:text-gray-900">編輯</button>
                        <button className="text-red-600 hover:text-red-900">刪除</button>
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
              顯示 1 至 4 筆，共 12 筆
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
    </div>
  );
}
