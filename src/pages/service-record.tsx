import Link from 'next/link';

export default function ServiceRecord() {
    return (
      <div className="flex-1 bg-gray-100 p-8">
        {/* 頁面標題與操作按鈕 */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600">首頁</Link>
            <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700">服務記錄</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">服務記錄</h1>
              <p className="text-gray-600 mt-1">管理您個人所有客戶服務工單與維護記錄</p>
            </div>
          </div>
        </div>
  
        {/* 服務概況統計 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { title: '待處理工單', value: '23', color: 'blue', icon: '🔧' },
            { title: '處理中工單', value: '15', color: 'yellow', icon: '⚡' },
            { title: '本月完成', value: '45', color: 'green', icon: '✅' },
            { title: '平均處理時間', value: '4.2h', color: 'purple', icon: '⏱️' },
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
  
        {/* 搜尋和篩選區 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜尋工單..."
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
                <option value="">工單狀態</option>
                <option value="pending">待處理</option>
                <option value="in_progress">處理中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
            <div>
              <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">優先級別</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <div>
              <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">服務類型</option>
                <option value="maintenance">定期維護</option>
                <option value="repair">故障維修</option>
                <option value="installation">安裝設定</option>
                <option value="consulting">技術諮詢</option>
              </select>
            </div>
            <div>
              <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">處理人員</option>
                <option value="team1">技術團隊一</option>
                <option value="team2">技術團隊二</option>
                <option value="team3">技術團隊三</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm hover:bg-yellow-200">
                待處理 ✕
              </button>
              <button className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200">
                高優先級 ✕
              </button>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              清除所有篩選
            </button>
          </div>
        </div>
  
        {/* 工單列表 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">工單列表</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>共 89 個工單</span>
                <select className="px-2 py-1 border rounded-md">
                  <option value="10">10 筆/頁</option>
                  <option value="20">20 筆/頁</option>
                  <option value="50">50 筆/頁</option>
                </select>
              </div>
            </div>
  
            {/* 工單列表內容 */}
            <div className="space-y-4">
              {[
                {
                  id: 'SR-2024031501',
                  title: '系統效能優化服務',
                  client: '台灣電子股份有限公司',
                  type: '定期維護',
                  priority: '高',
                  status: '處理中',
                  assignee: '王小明',
                  createTime: '2024/03/15 09:30',
                  deadline: '2024/03/16 18:00',
                },
                {
                  id: 'SR-2024031502',
                  title: '資安防護系統更新',
                  client: '創新科技有限公司',
                  type: '故障維修',
                  priority: '中',
                  status: '待處理',
                  assignee: '李小華',
                  createTime: '2024/03/15 10:15',
                  deadline: '2024/03/17 12:00',
                },
                {
                  id: 'SR-2024031503',
                  title: '網路設備維護',
                  client: '未來網路科技',
                  type: '安裝設定',
                  priority: '低',
                  status: '已完成',
                  assignee: '張小美',
                  createTime: '2024/03/15 11:00',
                  deadline: '2024/03/15 17:00',
                },
                {
                  id: 'SR-2024031504',
                  title: '伺服器異常排除',
                  client: '數位金融服務',
                  type: '故障維修',
                  priority: '高',
                  status: '處理中',
                  assignee: '陳小明',
                  createTime: '2024/03/15 13:45',
                  deadline: '2024/03/15 16:00',
                },
              ].map((ticket, index) => (
                <div key={index} className="border rounded-lg hover:shadow-md transition-shadow duration-200">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4">
                        <div className={`mt-1 h-3 w-3 rounded-full ${
                          ticket.status === '處理中' ? 'bg-yellow-400' :
                          ticket.status === '待處理' ? 'bg-red-400' :
                          'bg-green-400'
                        }`}></div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{ticket.id}</span>
                            <h3 className="text-lg font-medium text-gray-900">{ticket.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              ticket.priority === '高' ? 'bg-red-100 text-red-600' :
                              ticket.priority === '中' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {ticket.priority}優先級
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {ticket.client} • {ticket.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">處理人員</div>
                          <div className="flex items-center space-x-2">
                            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                              {ticket.assignee.slice(0, 1)}
                            </div>
                            <span className="text-sm font-medium">{ticket.assignee}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">截止時間</div>
                          <div className="text-sm font-medium">{ticket.deadline.split(' ')[1]}</div>
                          <div className="text-xs text-gray-500">{ticket.deadline.split(' ')[0]}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex space-x-4 text-sm text-gray-500">
                        <span>建立時間：{ticket.createTime}</span>
                        <span>•</span>
                        <span>狀態：{ticket.status}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
                          查看詳情
                        </button>
                        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                          更新狀態
                        </button>
                        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                          指派人員
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
  
            {/* 分頁控制 */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                顯示 1 至 4 筆，共 89 筆
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">上一頁</button>
                <button className="px-3 py-1 bg-blue-500 text-white rounded-md">1</button>
                <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">3</button>
                <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">...</button>
                <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">9</button>
                <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">下一頁</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  