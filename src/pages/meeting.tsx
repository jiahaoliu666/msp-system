import Link from 'next/link';

export default function Meeting() {
    return (
      <div className="flex-1 bg-background-secondary p-8">
        {/* 頁面標題與麵包屑導航 */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-text-secondary mb-4">
            <Link href="/" className="hover:text-accent-color transition-colors">首頁</Link>
            <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-text-primary">會議排程</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">會議排程</h1>
              <p className="text-text-secondary mt-1">管理與安排團隊會議時程</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-accent-color text-white rounded-lg hover:bg-accent-hover transition-colors duration-150 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新增會議
              </button>
            </div>
          </div>
        </div>
  
        {/* 會議概況統計 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { title: '今日會議', value: '3', color: 'accent', icon: '📅' },
            { title: '待確認會議', value: '5', color: 'warning', icon: '⏳' },
            { title: '本週會議', value: '12', color: 'success', icon: '📊' },
            { title: '會議室使用率', value: '75%', color: 'info', icon: '📈' },
          ].map((stat) => (
            <div key={stat.title} className={`bg-background-primary rounded-xl shadow-sm p-6 border-l-4 ${
              stat.color === 'accent' ? 'border-accent-color' :
              stat.color === 'warning' ? 'border-warning-color' :
              stat.color === 'success' ? 'border-success-color' :
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
  
        {/* 今日會議概覽 */}
        <div className="bg-background-primary rounded-xl shadow-sm mb-6">
          <div className="p-6 border-b border-border-color">
            <h2 className="text-lg font-semibold text-text-primary">今日會議</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                {
                  title: '週一晨會',
                  time: '09:00 - 10:00',
                  room: '會議室 A',
                  organizer: '王小明',
                  attendees: ['李小華', '張小美', '陳大文'],
                  status: 'upcoming'
                },
                {
                  title: '專案進度報告',
                  time: '14:00 - 15:00',
                  room: '線上會議',
                  organizer: '李小華',
                  attendees: ['王小明', '張小美', '陳大文', '林小芳'],
                  status: 'in-progress'
                },
                {
                  title: '客戶需求討論',
                  time: '16:00 - 17:00',
                  room: '會議室 B',
                  organizer: '張小美',
                  attendees: ['王小明', '李小華'],
                  status: 'completed'
                }
              ].map((meeting, index) => (
                <div key={index} className="bg-background-secondary rounded-lg p-4 hover:bg-hover-color transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 rounded-lg bg-accent-color/10 flex items-center justify-center">
                        <span className="text-accent-color font-medium">M</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-text-primary">{meeting.title}</h3>
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center text-sm text-text-secondary">
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {meeting.time}
                          </div>
                          <div className="flex items-center text-sm text-text-secondary">
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {meeting.room}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        meeting.status === 'upcoming' ? 'bg-info-color/10 text-info-color' :
                        meeting.status === 'in-progress' ? 'bg-warning-color/10 text-warning-color' :
                        'bg-success-color/10 text-success-color'
                      }`}>
                        {meeting.status === 'upcoming' ? '即將開始' :
                         meeting.status === 'in-progress' ? '進行中' :
                         '已結束'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-text-secondary">主持人：</span>
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-accent-color/10 flex items-center justify-center">
                            <span className="text-xs text-accent-color">{meeting.organizer.charAt(0)}</span>
                          </div>
                          <span className="ml-2 text-sm text-text-primary">{meeting.organizer}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          {meeting.attendees.slice(0, 3).map((attendee, index) => (
                            <div key={index} className="h-6 w-6 rounded-full bg-accent-color/10 flex items-center justify-center ring-2 ring-background-primary">
                              <span className="text-xs text-accent-color">{attendee.charAt(0)}</span>
                            </div>
                          ))}
                          {meeting.attendees.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-accent-color/10 flex items-center justify-center ring-2 ring-background-primary">
                              <span className="text-xs text-accent-color">+{meeting.attendees.length - 3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
  
      </div>
    );
  }
  