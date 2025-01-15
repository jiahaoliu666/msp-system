export default function ContractManagement() {
  return (
    <div className="flex-1 bg-gray-100 p-8">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <a href="#" className="hover:text-blue-600">首頁</a>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700">合約管理</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">合約管理</h1>
            <p className="text-gray-600 mt-1">管理所有客戶合約與續約狀態</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增合約
            </button>
          </div>
        </div>
      </div>

      {/* 合約概況統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { title: '有效合約', value: '126', color: 'green', icon: '📄' },
          { title: '即將到期', value: '8', color: 'yellow', icon: '⚠️' },
          { title: '待續約確認', value: '5', color: 'red', icon: '🔔' },
          { title: '本月合約金額', value: '1.2M', color: 'blue', icon: '💰' },
        ].map((stat) => (
          <div key={stat.title} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
            stat.color === 'green' ? 'border-green-500' :
            stat.color === 'yellow' ? 'border-yellow-500' :
            stat.color === 'red' ? 'border-red-500' :
            'border-blue-500'
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

      {/* 到期提醒區塊 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">合約到期提醒</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { client: '台灣電子股份有限公司', type: '維護合約', expireDate: '2024/04/15', daysLeft: 14 },
            { client: '創新科技有限公司', type: '技術支援', expireDate: '2024/04/01', daysLeft: 7 },
            { client: '未來網路科技', type: '顧問服務', expireDate: '2024/03/30', daysLeft: 3 },
          ].map((reminder, index) => (
            <div key={index} className="border rounded-lg p-4 bg-yellow-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{reminder.client}</h3>
                  <p className="text-sm text-gray-600">{reminder.type}</p>
                  <p className="text-sm text-gray-500 mt-1">到期日：{reminder.expireDate}</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  剩餘 {reminder.daysLeft} 天
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 搜尋和篩選區 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋合約..."
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
              <option value="">合約狀態</option>
              <option value="active">生效中</option>
              <option value="pending">待簽署</option>
              <option value="expired">已到期</option>
              <option value="terminated">已終止</option>
            </select>
          </div>
          <div>
            <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">合約類型</option>
              <option value="maintenance">維護合約</option>
              <option value="service">服務合約</option>
              <option value="license">授權合約</option>
              <option value="consulting">顧問合約</option>
            </select>
          </div>
          <div>
            <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">付款週期</option>
              <option value="monthly">月付</option>
              <option value="quarterly">季付</option>
              <option value="yearly">年付</option>
            </select>
          </div>
          <div>
            <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">金額範圍</option>
              <option value="0-100k">10萬以下</option>
              <option value="100k-500k">10-50萬</option>
              <option value="500k-1m">50-100萬</option>
              <option value="1m+">100萬以上</option>
            </select>
          </div>
        </div>
      </div>

      {/* 合約列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">合約列表</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>共 126 份合約</span>
              <select className="px-2 py-1 border rounded-md">
                <option value="10">10 筆/頁</option>
                <option value="20">20 筆/頁</option>
                <option value="50">50 筆/頁</option>
              </select>
            </div>
          </div>

          {/* 合約表格 */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">合約資訊</th>
                  <th className="px-6 py-3">客戶名稱</th>
                  <th className="px-6 py-3">合約金額</th>
                  <th className="px-6 py-3">付款週期</th>
                  <th className="px-6 py-3">狀態</th>
                  <th className="px-6 py-3">到期日</th>
                  <th className="px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  {
                    id: 'CT-2024001',
                    name: '年度維護合約',
                    client: '台灣電子股份有限公司',
                    amount: '1,200,000',
                    cycle: '季付',
                    status: '生效中',
                    expireDate: '2024/12/31',
                    type: '維護合約',
                  },
                  {
                    id: 'CT-2024002',
                    name: '技術顧問服務',
                    client: '創新科技有限公司',
                    amount: '800,000',
                    cycle: '月付',
                    status: '待續約',
                    expireDate: '2024/04/01',
                    type: '顧問合約',
                  },
                  {
                    id: 'CT-2024003',
                    name: '軟體授權合約',
                    client: '未來網路科技',
                    amount: '500,000',
                    cycle: '年付',
                    status: '生效中',
                    expireDate: '2024/09/30',
                    type: '授權合約',
                  },
                  {
                    id: 'CT-2024004',
                    name: '資安服務合約',
                    client: '數位金融服務',
                    amount: '960,000',
                    cycle: '季付',
                    status: '待簽署',
                    expireDate: '2025/03/31',
                    type: '服務合約',
                  },
                ].map((contract, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">CT</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{contract.name}</div>
                          <div className="text-sm text-gray-500">{contract.id}</div>
                          <div className="text-xs text-gray-500">{contract.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{contract.client}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">NT$ {contract.amount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{contract.cycle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        contract.status === '生效中' ? 'bg-green-100 text-green-800' :
                        contract.status === '待續約' ? 'bg-yellow-100 text-yellow-800' :
                        contract.status === '待簽署' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {contract.expireDate}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">查看</button>
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
              顯示 1 至 4 筆，共 126 筆
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">上一頁</button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded-md">1</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">2</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">3</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">...</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">13</button>
              <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">下一頁</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
