import React from 'react';
import CreateTicketModal from '../components/common/CreateTicketForm';

export default function Home() {
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);

  const handleCreateTicket = (ticketData: {
    title: string;
    description: string;
    type: string;
    priority: string;
  }) => {
    // TODO: 實作工單建立邏輯
    console.log('建立工單:', ticketData);
  };

  return (
    <div className="p-8">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <a href="#" className="hover:text-blue-600 transition-colors duration-200">首頁</a>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700">總覽</span>
        </div>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">總覽</h1>
            <p className="text-gray-600 mt-1">提摩超人，歡迎回來！</p>
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-600 flex items-center transition-all duration-200 shadow-sm hover:shadow-md">
                <span className="mr-2">📅</span>
                本週
                <svg className="h-5 w-5 ml-2 transform transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <button className="p-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-600 transition-all duration-200 shadow-sm hover:shadow-md">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 快速統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: '在線客戶', value: '12', icon: '👥', color: 'blue' },
          { title: '待處理工單', value: '23', icon: '🔧', color: 'yellow' },
          { title: '待辦事項', value: '2', icon: '📝', color: 'green' },
          { title: '在線人員', value: '8', icon: '👤', color: 'purple' },
        ].map((stat) => (
          <div 
            key={stat.title} 
            className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border-l-4 ${
              stat.color === 'blue' ? 'border-blue-500 hover:border-blue-600' :
              stat.color === 'yellow' ? 'border-yellow-500 hover:border-yellow-600' :
              stat.color === 'green' ? 'border-green-500 hover:border-green-600' :
              'border-purple-500 hover:border-purple-600'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <div className="flex items-center mt-2">
                  <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                </div>
              </div>
              <span className="text-2xl transform transition-transform duration-200 hover:scale-110 cursor-pointer">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主要內容卡片 - 最近活動 */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-gray-800">最近活動</h2>
                <div className="flex space-x-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200">全部</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200">工單</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200">合約</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  篩選
                </button>
              </div>
            </div>

            {/* 活動列表 */}
            <div className="space-y-4">
              {[
                { title: '新客戶合約簽署', client: '台灣電子股份有限公司', type: '合約', time: '2小時前', status: '待處理', priority: '高', assignee: '王小明' },
                { title: '系統維護工單', client: '全球科技有限公司', type: '工單', time: '4小時前', status: '進行中', priority: '中', assignee: '李小華' },
                { title: '季度服務檢討會議', client: '創新軟體公司', type: '會議', time: '昨天', status: '已完成', priority: '低', assignee: '張小芳' },
                { title: '設備更新需求', client: '未來網路公司', type: '需求', time: '2天前', status: '待確認', priority: '中', assignee: '陳小明' },
                { title: '資安稽核報告', client: '數位金融公司', type: '報告', time: '3天前', status: '已完成', priority: '高', assignee: '林小美' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === '待處理' ? 'bg-yellow-400' :
                      activity.status === '進行中' ? 'bg-blue-400' :
                      activity.status === '已完成' ? 'bg-green-400' : 'bg-gray-400'
                    }`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-800">{activity.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activity.priority === '高' ? 'bg-red-100 text-red-600' :
                          activity.priority === '中' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {activity.priority}優先級
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-500">{activity.client}</p>
                        <span className="text-gray-300">|</span>
                        <p className="text-sm text-gray-500">負責人：{activity.assignee}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      {activity.type}
                    </span>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 分頁控制 */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                顯示 1 至 5 筆，共 24 筆
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

        {/* 側邊資訊區 */}
        <div className="space-y-8">
          {/* 待辦事項 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">待辦事項</h2>
              <button className="text-blue-500 hover:text-blue-600 text-sm">
                查看全部
              </button>
            </div>
            <div className="space-y-3">
              {[
                { text: '完成季度報告', deadline: '今天 17:00', priority: '高' },
                { text: '客戶滿意度調查', deadline: '明天', priority: '中' },
                { text: '系統更新通知', deadline: '後天', priority: '低' },
              ].map((todo, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-800">{todo.text}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        todo.priority === '高' ? 'bg-red-100 text-red-600' :
                        todo.priority === '中' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {todo.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">截止：{todo.deadline}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-blue-500 hover:text-blue-600 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增待辦事項
            </button>
          </div>

          {/* 人員在線狀態 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">人員在線狀態</h2>
              <span className="text-sm text-gray-500">5/8 在線</span>
            </div>
            <div className="space-y-4">
              {[
                { name: '陳小明', role: '技術主管', status: '線上', time: '1小時' },
                { name: '王大明', role: '客服專員', status: '忙碌', time: '30分鐘' },
                { name: '林小華', role: '業務經理', status: '離線', time: '2小時' },
                { name: '張小芳', role: '專案經理', status: '線上', time: '15分鐘' },
                { name: '李小美', role: '系統工程師', status: '線上', time: '45分鐘' },
              ].map((member, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {member.name.charAt(0)}
                      </div>
                      <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        member.status === '線上' ? 'bg-green-400' :
                        member.status === '忙碌' ? 'bg-yellow-400' :
                        'bg-gray-400'
                      }`}></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.status === '線上' ? 'bg-green-100 text-green-600' :
                      member.status === '忙碌' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {member.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">最後更新：{member.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        
          {/* 新增：近期活動日曆 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">近期活動</h2>
              <div className="flex space-x-2">
                <button className="p-1 rounded hover:bg-gray-100">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-1 rounded hover:bg-gray-100">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { date: '今天', events: [
                  { time: '10:00', title: '客戶會議', type: '會議' },
                  { time: '14:30', title: '系統維護', type: '工作' },
                ]},
                { date: '明天', events: [
                  { time: '09:30', title: '團隊週會', type: '會議' },
                  { time: '15:00', title: '客戶培訓', type: '培訓' },
                ]},
              ].map((day, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-16 text-sm font-medium text-gray-600">{day.date}</div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  <div className="ml-16 space-y-2">
                    {day.events.map((event, eventIndex) => (
                      <div key={eventIndex} className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">{event.time}</span>
                        <div className="flex-1 p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                          <p className="text-sm font-medium text-gray-800">{event.title}</p>
                          <p className="text-xs text-gray-500">{event.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 text-sm text-blue-500 hover:text-blue-600 flex items-center justify-center border border-blue-200 rounded-md hover:bg-blue-50">
              查看完整行事曆
            </button>
          </div>
        </div>
      </div>

      {/* 工單建立彈窗 */}
      <CreateTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}
