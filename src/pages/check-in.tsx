import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Link from 'next/link';

export default function CheckIn() {
  const mockUser = {
    name: '王小明',
    department: 'IT部門',
    position: '系統工程師',
    shiftStart: '上午 09:00',
    shiftEnd: '下午 06:00'
  };

  const mockHistory = [
    { date: '2024-01-20', checkIn: '上午09:00:00', checkOut: '下午06:00:00', name: '王小明', status: 'completed', tasks: { keys: true, phone: true } },
    { date: '2024-01-19', checkIn: '上午08:45:00', checkOut: '下午05:30:00', name: '王小明', status: 'completed', tasks: { keys: true, phone: true } },
    { date: '2024-01-18', checkIn: '上午09:15:00', checkOut: '下午06:15:00', name: '王小明', status: 'completed', tasks: { keys: false, phone: true } },
    { date: '2024-01-17', checkIn: '-', checkOut: '-', name: '王小明', status: 'missed', tasks: { keys: false, phone: false } },
    { date: '2024-01-16', checkIn: '上午09:30:00', checkOut: '下午06:30:00', name: '王小明', status: 'completed', tasks: { keys: true, phone: true } },
  ];

  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [dailyTasks, setDailyTasks] = useState({
    keys: false,
    phone: false
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const period = hours < 12 ? '上午' : '下午';
    const formattedHours = hours % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${period}${formattedHours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
  };

  const handleTaskToggle = (task: 'keys' | 'phone') => {
    setDailyTasks(prev => ({
      ...prev,
      [task]: !prev[task]
    }));
  };

  return (
    <div className="flex-1 bg-background-secondary">
      {/* 頁面標題與麵包屑導航 */}
      <div className="p-8">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-blue-600">首頁</Link>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700">值班簽到</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">值班簽到</h1>
            <p className="text-gray-600 mt-1">管理與記錄值班人員的簽到狀態</p>
          </div>
        </div>
      </div>

      <div className="px-8 space-y-4 -mt-2">
        {/* 統計卡片區域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background-primary p-6 rounded-xl shadow-sm">
            <div className="text-text-secondary text-sm">本月簽到次數</div>
            <div className="mt-2 flex justify-between items-end">
              <div className="text-2xl font-bold text-text-primary">15</div>
              <div className="text-success-color text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>98%</span>
              </div>
            </div>
          </div>

          <div className="bg-background-primary p-6 rounded-xl shadow-sm">
            <div className="text-text-secondary text-sm">本月準時率</div>
            <div className="mt-2 flex justify-between items-end">
              <div className="text-2xl font-bold text-text-primary">95%</div>
              <div className="text-success-color text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>2.5%</span>
              </div>
            </div>
          </div>

          <div className="bg-background-primary p-6 rounded-xl shadow-sm">
            <div className="text-text-secondary text-sm">本月缺勤次數</div>
            <div className="mt-2 flex justify-between items-end">
              <div className="text-2xl font-bold text-text-primary">1</div>
              <div className="text-error-color text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span>1次</span>
              </div>
            </div>
          </div>
        </div>

        {/* 簽到表單區域 */}
        <div className="bg-background-primary rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側：用戶資訊 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">值班人員資訊</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-color/10 text-accent-color 
                                flex items-center justify-center font-bold text-lg">
                      {mockUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">{mockUser.name}</div>
                      <div className="text-sm text-text-secondary">{mockUser.department}</div>
                      <div className="text-sm text-text-secondary">
                        值班時間: {mockUser.shiftStart} - {mockUser.shiftEnd}
                      </div>
                    </div>
                  </div>
                  
                  {/* 每日任務檢查 */}
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-text-primary mb-2">每日任務檢查</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={dailyTasks.keys}
                          onChange={() => handleTaskToggle('keys')}
                          className="form-checkbox h-4 w-4 text-accent-color"
                        />
                        <span className="text-sm text-text-secondary">鑰匙檢查</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={dailyTasks.phone}
                          onChange={() => handleTaskToggle('phone')}
                          className="form-checkbox h-4 w-4 text-accent-color"
                        />
                        <span className="text-sm text-text-secondary">話機測試</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 中間：當前時間和日期 */}
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-text-primary mb-4">當前時間</h3>
              <div className="text-3xl font-bold text-accent-color">
                {currentTime.toLocaleTimeString('zh-TW', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <div className="text-text-secondary">
                {formatDate(currentTime)}
              </div>
            </div>

            {/* 右側：簽到操作 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">簽到狀態</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      簽到時間
                    </label>
                    <input
                      type="time"
                      className="w-full p-2 border border-border-color rounded-lg 
                               bg-background-primary text-text-primary
                               focus:ring-2 focus:ring-accent-color focus:border-transparent"
                      defaultValue="09:00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      簽退時間
                    </label>
                    <input
                      type="time"
                      className="w-full p-2 border border-border-color rounded-lg 
                               bg-background-primary text-text-primary
                               focus:ring-2 focus:ring-accent-color focus:border-transparent"
                      defaultValue="18:00"
                      disabled={!isCheckedOut}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckedOut(!isCheckedOut)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all
                    ${isCheckedOut 
                      ? 'bg-success-color text-white hover:bg-success-color/90'
                      : 'bg-accent-color text-white hover:bg-accent-hover'}`}
                >
                  {isCheckedOut ? '已簽退' : '簽退'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 日期篩選區域 */}
        <div className="bg-background-primary rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">紀錄查詢</h3>
            <div className="flex space-x-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">開始日期</label>
                <DatePicker
                  selected={startDate}
                  className="p-2 border border-border-color rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">結束日期</label>
                <DatePicker
                  selected={endDate}
                  className="p-2 border border-border-color rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 歷史記錄區域 */}
        <div className="bg-background-primary rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border-color">
            <h2 className="text-lg font-semibold text-text-primary">值班紀錄</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
              <thead className="bg-background-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    簽到時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    簽退時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    值班人員
                  </th>
                 
                </tr>
              </thead>
              <tbody className="bg-background-primary divide-y divide-border-color">
                {mockHistory.map((record, index) => (
                  <tr key={index} className="hover:bg-hover-color transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {record.checkIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {record.checkOut}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs
                        ${record.status === 'completed' 
                          ? 'bg-success-color/10 text-success-color' 
                          : 'bg-error-color/10 text-error-color'}`}>
                        {record.status === 'completed' ? '已簽退' : '未簽到'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-accent-color/10 text-accent-color 
                                    flex items-center justify-center font-medium">
                          {record.name.charAt(0)}
                        </div>
                        <span className="ml-2 text-sm text-text-primary">{record.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                     
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
