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
    <div className="p-6 md:p-8 bg-gray-50/30">
      {/* 頁面標題與麵包屑導航 */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-blue-600 transition-colors duration-200 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            首頁
          </Link>
          <svg className="h-4 w-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-medium">值班簽到</span>
        </div>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">值班簽到系統</h1>
            <p className="text-gray-600 mt-1 text-sm">管理與記錄值班人員的簽到狀態</p>
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center transition-all duration-200 shadow-sm hover:shadow">
                <span className="mr-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                本週
                <svg className="h-4 w-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 統計卡片區域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border-l-4 border-blue-500 hover:border-blue-600 group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-gray-500 text-sm font-medium">本月簽到次數</p>
              <h3 className="text-2xl font-bold text-gray-800">15</h3>
            </div>
            <span className="text-2xl">📊</span>
          </div>
          <div className="mt-4 text-sm text-green-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>98% 準時率</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border-l-4 border-green-500 hover:border-green-600 group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-gray-500 text-sm font-medium">本月準時率</p>
              <h3 className="text-2xl font-bold text-gray-800">95%</h3>
            </div>
            <span className="text-2xl">📈</span>
          </div>
          <div className="mt-4 text-sm text-green-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>提升 2.5%</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border-l-4 border-yellow-500 hover:border-yellow-600 group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-gray-500 text-sm font-medium">本月缺勤次數</p>
              <h3 className="text-2xl font-bold text-gray-800">1</h3>
            </div>
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="mt-4 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span>較上月增加 1 次</span>
          </div>
        </div>
      </div>

      {/* 簽到表單區域 */}
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 mb-8">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左側：用戶資訊 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">值班人員資訊</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 
                                flex items-center justify-center font-bold text-xl shadow-sm">
                      {mockUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{mockUser.name}</div>
                      <div className="text-sm text-gray-500">{mockUser.department}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        值班時間：{mockUser.shiftStart} - {mockUser.shiftEnd}
                      </div>
                    </div>
                  </div>
                  
                  {/* 每日任務檢查 */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">每日任務檢查</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors duration-200">
                        <input
                          type="checkbox"
                          checked={dailyTasks.keys}
                          onChange={() => handleTaskToggle('keys')}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">鑰匙檢查</span>
                      </label>
                      <label className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors duration-200">
                        <input
                          type="checkbox"
                          checked={dailyTasks.phone}
                          onChange={() => handleTaskToggle('phone')}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">話機測試</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 中間：當前時間和日期 */}
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">當前時間</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {currentTime.toLocaleTimeString('zh-TW', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <div className="text-gray-500">
                {formatDate(currentTime)}
              </div>
            </div>

            {/* 右側：簽到操作 */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">簽到狀態</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      簽到時間
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg 
                               bg-white text-gray-800 placeholder-gray-400
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                               transition-all duration-200"
                      defaultValue="09:00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      簽退時間
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg 
                               bg-white text-gray-800 placeholder-gray-400
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                               transition-all duration-200"
                      defaultValue="18:00"
                      disabled={!isCheckedOut}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckedOut(!isCheckedOut)}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200
                    ${isCheckedOut 
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-blue-500 hover:bg-blue-600'} 
                    shadow-sm hover:shadow-md`}
                >
                  {isCheckedOut ? '已簽退' : '簽退'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 日期篩選區域 */}
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">紀錄查詢</h3>
            <div className="flex space-x-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">開始日期</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => date && setStartDate(date)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">結束日期</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => date && setEndDate(date)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 歷史記錄區域 */}
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">值班紀錄</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  簽到時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  簽退時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  值班人員
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockHistory.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.checkOut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full
                      ${record.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'}`}>
                      {record.status === 'completed' ? '已簽退' : '未簽到'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 
                                  flex items-center justify-center font-medium">
                        {record.name.charAt(0)}
                      </div>
                      <span className="ml-3 text-sm text-gray-900">{record.name}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              顯示 1 至 5 筆，共 24 筆
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-200 text-sm font-medium">
                上一頁
              </button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200">
                1
              </button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-200 text-sm font-medium">
                2
              </button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-200 text-sm font-medium">
                3
              </button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-200 text-sm font-medium">
                下一頁
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
