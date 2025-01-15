export default function TicketSystem() {
  return (
    <div className="flex-1 bg-background-secondary p-8">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-text-secondary mb-4">
          <a href="#" className="hover:text-accent-color transition-colors">首頁</a>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-text-primary">工單系統</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">工單系統</h1>
            <p className="text-text-secondary mt-1">管理與追蹤所有客戶支援工單</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-accent-color text-white rounded-lg hover:bg-accent-hover transition-colors duration-150 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              建立工單
            </button>
          </div>
        </div>
      </div>

      {/* 工單統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: '待處理工單', value: '23', color: 'accent', icon: '🔧' },
          { title: '進行中工單', value: '15', color: 'warning', icon: '⚡' },
          { title: '本月完成', value: '45', color: 'success', icon: '✅' },
          { title: '平均處理時間', value: '4.2h', color: 'info', icon: '⏱️' },
        ].map((stat) => (
          <div key={stat.title} 
               className={`bg-background-primary rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border-l-4
                         ${stat.color === 'accent' ? 'border-accent-color' :
                           stat.color === 'warning' ? 'border-warning-color' :
                           stat.color === 'success' ? 'border-success-color' :
                           'border-info-color'}`}>
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

      {/* 搜尋和篩選區 */}
      <div className="bg-background-primary p-6 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋工單..."
              className="w-full pl-10 pr-4 py-2 border border-border-color rounded-lg text-sm
                       bg-background-primary text-text-primary placeholder-text-secondary
                       focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent
                       transition-all duration-200"
            />
            <div className="absolute left-3 top-2.5">
              <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <select className="bg-background-primary border border-border-color rounded-lg px-4 py-2 text-sm
                          text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color
                          transition-all duration-200">
            <option value="">工單狀態</option>
            <option value="pending">待處理</option>
            <option value="in_progress">處理中</option>
            <option value="completed">已完成</option>
          </select>
          <select className="bg-background-primary border border-border-color rounded-lg px-4 py-2 text-sm
                          text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color
                          transition-all duration-200">
            <option value="">優先級別</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
          <select className="bg-background-primary border border-border-color rounded-lg px-4 py-2 text-sm
                          text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color
                          transition-all duration-200">
            <option value="">處理人員</option>
            <option value="team1">技術團隊一</option>
            <option value="team2">技術團隊二</option>
            <option value="team3">技術團隊三</option>
          </select>
        </div>
      </div>

      {/* 工單列表 */}
      <div className="bg-background-primary rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-text-primary">工單列表</h2>
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <span className="bg-accent-color/10 px-3 py-1 rounded-lg">共 89 筆工單</span>
              <select className="bg-background-primary border border-border-color rounded-lg px-3 py-1.5
                              text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color
                              transition-all duration-200">
                <option value="20">20 筆/頁</option>
                <option value="50">50 筆/頁</option>
                <option value="100">100 筆/頁</option>
              </select>
            </div>
          </div>

          {/* 工單列表內容 */}
          <div className="space-y-4">
            {[
              {
                id: 'TK-2024031501',
                title: '系統效能優化服務',
                client: '台灣電子股份有限公司',
                priority: '高',
                status: '處理中',
                assignee: '王小明',
                createTime: '2024/03/15 09:30',
                deadline: '2024/03/16 18:00',
              },
              {
                id: 'TK-2024031502',
                title: '資安防護系統更新',
                client: '創新科技有限公司',
                priority: '中',
                status: '待處理',
                assignee: '李小華',
                createTime: '2024/03/15 10:15',
                deadline: '2024/03/17 12:00',
              }
            ].map((ticket) => (
              <div key={ticket.id} className="border border-border-color rounded-lg hover:shadow-md transition-all duration-200">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className={`mt-1 h-3 w-3 rounded-full ${
                        ticket.status === '處理中' ? 'bg-warning-color' :
                        ticket.status === '待處理' ? 'bg-error-color' :
                        'bg-success-color'
                      }`}></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-text-secondary">{ticket.id}</span>
                          <h3 className="text-lg font-medium text-text-primary">{ticket.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            ticket.priority === '高' ? 'bg-error-color/10 text-error-color' :
                            ticket.priority === '中' ? 'bg-warning-color/10 text-warning-color' :
                            'bg-success-color/10 text-success-color'
                          }`}>
                            {ticket.priority}優先級
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-text-secondary">
                          {ticket.client}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-text-secondary">處理人員</div>
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-accent-color/10 flex items-center justify-center text-xs text-accent-color">
                            {ticket.assignee.slice(0, 1)}
                          </div>
                          <span className="text-sm font-medium text-text-primary">{ticket.assignee}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-text-secondary">截止時間</div>
                        <div className="text-sm font-medium text-text-primary">{ticket.deadline.split(' ')[1]}</div>
                        <div className="text-xs text-text-secondary">{ticket.deadline.split(' ')[0]}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex space-x-4 text-sm text-text-secondary">
                      <span>建立時間：{ticket.createTime}</span>
                      <span>•</span>
                      <span>狀態：{ticket.status}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm text-accent-color hover:bg-accent-color/10 rounded-md transition-colors">
                        查看詳情
                      </button>
                      <button className="px-3 py-1 text-sm text-text-secondary hover:bg-hover-color rounded-md transition-colors">
                        更新狀態
                      </button>
                      <button className="px-3 py-1 text-sm text-text-secondary hover:bg-hover-color rounded-md transition-colors">
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
            <div className="text-sm text-text-secondary">
              顯示 1 至 2 筆，共 89 筆
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-border-color rounded-md text-text-secondary hover:bg-hover-color transition-colors">
                上一頁
              </button>
              <button className="px-3 py-1 bg-accent-color text-white rounded-md">1</button>
              <button className="px-3 py-1 border border-border-color rounded-md text-text-secondary hover:bg-hover-color transition-colors">2</button>
              <button className="px-3 py-1 border border-border-color rounded-md text-text-secondary hover:bg-hover-color transition-colors">3</button>
              <button className="px-3 py-1 border border-border-color rounded-md text-text-secondary hover:bg-hover-color transition-colors">...</button>
              <button className="px-3 py-1 border border-border-color rounded-md text-text-secondary hover:bg-hover-color transition-colors">9</button>
              <button className="px-3 py-1 border border-border-color rounded-md text-text-secondary hover:bg-hover-color transition-colors">下一頁</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
