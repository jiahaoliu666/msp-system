export default function CustomerManagement() {
    return (
      <div className="flex-1 bg-gray-100 p-8">
        {/* 頁面標題與操作按鈕 */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <a href="#" className="hover:text-blue-600">首頁</a>
            <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700">客戶管理</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">客戶管理</h1>
              <p className="text-gray-600 mt-1">管理所有客戶資料與互動記錄</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新增客戶
              </button>
            </div>
          </div>
        </div>
  
        {/* 搜尋和篩選區 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜尋客戶..."
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
                <option value="">客戶類型</option>
                <option value="enterprise">企業客戶</option>
                <option value="individual">個人客戶</option>
                <option value="government">政府單位</option>
              </select>
            </div>
            <div>
              <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">合約狀態</option>
                <option value="active">使用中</option>
                <option value="expired">已到期</option>
                <option value="pending">待簽約</option>
              </select>
            </div>
            <div>
              <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">服務類型</option>
                <option value="full">全方位服務</option>
                <option value="basic">基礎維護</option>
                <option value="custom">客製服務</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200">
                企業客戶 ✕
              </button>
              <button className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm hover:bg-green-200">
                使用中 ✕
              </button>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              清除所有篩選
            </button>
          </div>
        </div>
  
        {/* 客戶列表 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">客戶列表</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>共 150 個客戶</span>
                <select className="px-2 py-1 border rounded-md">
                  <option value="10">10 筆/頁</option>
                  <option value="20">20 筆/頁</option>
                  <option value="50">50 筆/頁</option>
                </select>
              </div>
            </div>
            
            {/* 表格標頭 */}
            <div className="border-t border-b border-gray-200">
              <div className="grid grid-cols-8 py-3 px-4 text-sm font-medium text-gray-500">
                <div className="col-span-2">客戶名稱</div>
                <div>聯絡人</div>
                <div>合約狀態</div>
                <div>服務類型</div>
                <div>最後互動</div>
                <div>負責人</div>
                <div>操作</div>
              </div>
            </div>
  
            {/* 表格內容 */}
            <div className="divide-y divide-gray-200">
              {[
                {
                  name: '台灣電子股份有限公司',
                  type: '企業客戶',
                  contact: '張小明',
                  status: '使用中',
                  service: '全方位服務',
                  lastContact: '2024/03/15',
                  manager: '王小華',
                },
                {
                  name: '創新科技有限公司',
                  type: '企業客戶',
                  contact: '李小明',
                  status: '待續約',
                  service: '基礎維護',
                  lastContact: '2024/03/14',
                  manager: '陳小明',
                },
                {
                  name: '未來網路科技',
                  type: '企業客戶',
                  contact: '王小美',
                  status: '使用中',
                  service: '客製服務',
                  lastContact: '2024/03/13',
                  manager: '林小華',
                },
                {
                  name: '數位金融服務',
                  type: '企業客戶',
                  contact: '陳小華',
                  status: '待簽約',
                  service: '全方位服務',
                  lastContact: '2024/03/12',
                  manager: '張小美',
                },
                {
                  name: '全球物流公司',
                  type: '企業客戶',
                  contact: '林小明',
                  status: '使用中',
                  service: '基礎維護',
                  lastContact: '2024/03/11',
                  manager: '李小華',
                },
              ].map((customer, index) => (
                <div key={index} className="grid grid-cols-8 py-4 px-4 hover:bg-gray-50">
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                        {customer.name.slice(0, 2)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.type}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-sm text-gray-900">{customer.contact}</div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      customer.status === '使用中' ? 'bg-green-100 text-green-600' :
                      customer.status === '待續約' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {customer.status}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="text-sm text-gray-900">{customer.service}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-sm text-gray-500">{customer.lastContact}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                        {customer.manager.slice(0, 1)}
                      </div>
                      <span className="ml-2 text-sm text-gray-900">{customer.manager}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
  
            {/* 分頁控制 */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                顯示 1 至 5 筆，共 150 筆
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">上一頁</button>
                <button className="px-3 py-1 bg-blue-500 text-white rounded-md">1</button>
                <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">3</button>
                <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">...</button>
                <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">15</button>
                <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">下一頁</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  