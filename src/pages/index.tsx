import React from 'react';
import CreateTicketModal from '../components/common/CreateTicketForm';
import { useThemeContext } from '@/context/ThemeContext';

export default function Home() {
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);
  const { theme } = useThemeContext();

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
    <div className="p-6 md:p-8 bg-background-secondary transition-colors duration-300">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-text-secondary mb-4">
          <a href="#" className="hover:text-accent-color transition-colors duration-200 
                                flex items-center gap-1 focus-effect rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            首頁
          </a>
          <svg className="h-4 w-4 mx-2 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-text-primary font-medium">總覽</span>
        </div>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">總覽儀表板</h1>
            <p className="text-text-secondary mt-1 text-sm">歡迎回來！這是您的即時系統概況。</p>
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <button className="px-4 py-2 bg-background-primary border border-border-color rounded-lg 
                               hover:bg-hover-color text-text-primary flex items-center transition-all 
                               duration-200 shadow-sm hover:shadow focus-effect active-effect">
                <span className="mr-2">
                  <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                本週
                <svg className="h-4 w-4 ml-2 transform transition-transform duration-200 text-text-secondary" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <button className="p-2 bg-background-primary border border-border-color rounded-lg 
                             hover:bg-hover-color text-text-secondary transition-all duration-200 
                             shadow-sm hover:shadow focus-effect active-effect">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 快速統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            title: '待處理工單', 
            value: '23', 
            icon: '🔧',
            color: 'blue'
          },
          { 
            title: '待辦事項', 
            value: '2', 
            icon: '📝',
            color: 'green'
          },
          { 
            title: '在線客戶', 
            value: '12', 
            icon: '👥',
            color: 'yellow'
          },
          { 
            title: '在線人員', 
            value: '8', 
            icon: '👨‍💼',
            color: 'purple'
          },
        ].map((stat) => (
          <div 
            key={stat.title} 
            className={`bg-background-primary rounded-lg shadow-sm hover:shadow-md transition-all 
                       duration-200 p-6 border-l-4 group animate-fade-in ${
              stat.color === 'blue' ? 'border-accent-color hover:border-accent-hover' :
              stat.color === 'yellow' ? 'border-warning-color hover:border-warning-color' :
              stat.color === 'green' ? 'border-success-color hover:border-success-color' :
              'border-purple-500 hover:border-purple-600'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-secondary text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-text-primary">
                  {stat.value}
                </h3>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主要內容卡片 - 最近活動 */}
        <div className="lg:col-span-2 bg-background-primary rounded-lg shadow-sm hover:shadow-md 
                       transition-all duration-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-text-primary">最近活動</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs font-medium rounded-full bg-accent-light 
                                   text-accent-color cursor-pointer hover:bg-accent-light/80 
                                   transition-colors duration-200">
                    全部
                  </button>
                  <button className="px-3 py-1 text-xs font-medium rounded-full bg-background-secondary 
                                   text-text-secondary cursor-pointer hover:bg-hover-color 
                                   transition-colors duration-200">
                    工單
                  </button>
                  <button className="px-3 py-1 text-xs font-medium rounded-full bg-background-secondary 
                                   text-text-secondary cursor-pointer hover:bg-hover-color 
                                   transition-colors duration-200">
                    合約
                  </button>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-border-color rounded-lg hover:bg-hover-color 
                                 transition-colors duration-200 flex items-center text-text-primary 
                                 text-sm font-medium shadow-sm hover:shadow focus-effect active-effect">
                  <svg className="h-4 w-4 mr-2 text-text-secondary" fill="none" stroke="currentColor" 
                       viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
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
                <div key={index} className="group flex items-center justify-between p-4 hover:bg-hover-color 
                                          rounded-lg transition-all duration-200 border border-transparent 
                                          hover:border-border-color animate-fade-in">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ring-4 ${
                      activity.status === '待處理' ? 'bg-warning-color ring-warning-light' :
                      activity.status === '進行中' ? 'bg-accent-color ring-accent-light' :
                      activity.status === '已完成' ? 'bg-success-color ring-success-light' : 
                      'bg-text-secondary ring-background-secondary'
                    }`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-text-primary group-hover:text-accent-color 
                                     transition-colors duration-200">
                          {activity.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          activity.priority === '高' ? 'bg-error-light text-error-color' :
                          activity.priority === '中' ? 'bg-warning-light text-warning-color' :
                          'bg-success-light text-success-color'
                        }`}>
                          {activity.priority}優先級
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-text-secondary">{activity.client}</p>
                        <span className="text-border-color">•</span>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" 
                               viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p className="text-sm text-text-secondary">{activity.assignee}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      activity.type === '合約' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' :
                      activity.type === '工單' ? 'bg-accent-light text-accent-color' :
                      activity.type === '會議' ? 'bg-success-light text-success-color' :
                      activity.type === '需求' ? 'bg-warning-light text-warning-color' :
                      'bg-background-secondary text-text-secondary'
                    }`}>
                      {activity.type}
                    </span>
                    <span className="text-sm text-text-secondary">{activity.time}</span>
                    <button className="p-1 hover:bg-background-secondary rounded-lg 
                                     transition-colors duration-200 group focus-effect">
                      <svg className="h-5 w-5 text-text-secondary group-hover:text-text-primary" 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 分頁控制 */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                顯示 1 至 5 筆，共 24 筆
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-border-color rounded-lg text-text-primary 
                                 hover:bg-hover-color transition-all duration-200 text-sm font-medium 
                                 focus-effect active-effect">
                  上一頁
                </button>
                <button className="px-3 py-1 bg-accent-color text-white rounded-lg text-sm font-medium 
                                 hover:bg-accent-hover transition-colors duration-200 focus-effect 
                                 active-effect">
                  1
                </button>
                <button className="px-3 py-1 border border-border-color rounded-lg text-text-primary 
                                 hover:bg-hover-color transition-all duration-200 text-sm font-medium 
                                 focus-effect active-effect">
                  2
                </button>
                <button className="px-3 py-1 border border-border-color rounded-lg text-text-primary 
                                 hover:bg-hover-color transition-all duration-200 text-sm font-medium 
                                 focus-effect active-effect">
                  3
                </button>
                <button className="px-3 py-1 border border-border-color rounded-lg text-text-primary 
                                 hover:bg-hover-color transition-all duration-200 text-sm font-medium 
                                 focus-effect active-effect">
                  下一頁
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 側邊資訊區 */}
        <div className="space-y-6">
          {/* 待辦事項 */}
          <div className="bg-background-primary rounded-lg shadow-sm hover:shadow-md transition-all 
                         duration-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-text-primary">待辦事項</h2>
              <button className="text-accent-color hover:text-accent-hover text-sm focus-effect">
                查看全部
              </button>
            </div>
            <div className="space-y-3">
              {[
                { text: '完成季度報告', deadline: '今天 17:00', priority: '高' },
                { text: '客戶滿意度調查', deadline: '明天', priority: '中' },
                { text: '系統更新通知', deadline: '後天', priority: '低' },
              ].map((todo, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-hover-color rounded-lg 
                                          transition-colors duration-200 group">
                  <input 
                    type="checkbox" 
                    className="rounded text-accent-color focus:ring-accent-color transition-colors 
                              duration-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-text-primary group-hover:text-accent-color 
                                  transition-colors duration-200">
                        {todo.text}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        todo.priority === '高' ? 'bg-error-light text-error-color' :
                        todo.priority === '中' ? 'bg-warning-light text-warning-color' :
                        'bg-success-light text-success-color'
                      }`}>
                        {todo.priority}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">截止：{todo.deadline}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-accent-color hover:text-accent-hover flex items-center 
                             focus-effect">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增待辦事項
            </button>
          </div>

          {/* 人員在線狀態 */}
          <div className="bg-background-primary rounded-lg shadow-sm hover:shadow-md transition-all 
                         duration-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-text-primary">人員在線狀態</h2>
              <span className="text-sm text-text-secondary">5/8 在線</span>
            </div>
            <div className="space-y-4">
              {[
                { name: '陳小明', role: '技術主管', status: '線上', time: '1小時' },
                { name: '王大明', role: '客服專員', status: '忙碌', time: '30分鐘' },
                { name: '林小華', role: '業務經理', status: '離線', time: '2小時' },
                { name: '張小芳', role: '專案經理', status: '線上', time: '15分鐘' },
                { name: '李小美', role: '系統工程師', status: '線上', time: '45分鐘' },
              ].map((member, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-hover-color 
                                          rounded-lg transition-colors duration-200 group">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="h-8 w-8 rounded-lg bg-accent-light text-accent-color flex 
                                    items-center justify-center font-medium group-hover:scale-110 
                                    transition-transform duration-200">
                        {member.name.charAt(0)}
                      </div>
                      <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 
                                     border-background-primary transition-colors duration-200 ${
                        member.status === '線上' ? 'bg-success-color' :
                        member.status === '忙碌' ? 'bg-warning-color' :
                        'bg-text-secondary'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary group-hover:text-accent-color 
                                  transition-colors duration-200">
                        {member.name}
                      </p>
                      <p className="text-xs text-text-secondary">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.status === '線上' ? 'bg-success-light text-success-color' :
                      member.status === '忙碌' ? 'bg-warning-light text-warning-color' :
                      'bg-background-secondary text-text-secondary'
                    }`}>
                      {member.status}
                    </span>
                    <p className="text-xs text-text-secondary mt-1">最後更新：{member.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        
          {/* 近期活動日曆 */}
          <div className="bg-background-primary rounded-lg shadow-sm hover:shadow-md transition-all 
                         duration-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-text-primary">近期活動</h2>
              <div className="flex space-x-2">
                <button className="p-1 rounded hover:bg-hover-color transition-colors duration-200 
                                 focus-effect">
                  <svg className="h-5 w-5 text-text-secondary hover:text-text-primary" fill="none" 
                       stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-1 rounded hover:bg-hover-color transition-colors duration-200 
                                 focus-effect">
                  <svg className="h-5 w-5 text-text-secondary hover:text-text-primary" fill="none" 
                       stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 5l7 7-7 7" />
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
                    <div className="w-16 text-sm font-medium text-text-primary">{day.date}</div>
                    <div className="flex-1 h-px bg-border-color" />
                  </div>
                  <div className="ml-16 space-y-2">
                    {day.events.map((event, eventIndex) => (
                      <div key={eventIndex} className="flex items-center space-x-3">
                        <span className="text-sm text-text-secondary">{event.time}</span>
                        <div className="flex-1 p-2 rounded-lg bg-background-secondary hover:bg-hover-color 
                                      transition-colors duration-200 group">
                          <p className="text-sm font-medium text-text-primary group-hover:text-accent-color 
                                      transition-colors duration-200">
                            {event.title}
                          </p>
                          <p className="text-xs text-text-secondary">{event.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 text-sm text-accent-color hover:text-accent-hover 
                             flex items-center justify-center border border-border-color rounded-lg 
                             hover:bg-hover-color transition-all duration-200 focus-effect active-effect">
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

