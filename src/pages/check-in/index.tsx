import { useState, useEffect } from 'react';

export default function CheckIn() {
  const mockUser = {
    name: '王小明',
    department: 'IT部門',
    position: '系統工程師'
  };

  const mockHistory = [
    { date: '2024-01-20', checkIn: '上午09:00:00', checkOut: '下午06:00:00', name: '王小明', status: 'completed' },
    { date: '2024-01-19', checkIn: '上午08:45:00', checkOut: '下午05:30:00', name: '王小明', status: 'completed' },
    { date: '2024-01-18', checkIn: '上午09:15:00', checkOut: '下午06:15:00', name: '王小明', status: 'completed' },
    { date: '2024-01-17', checkIn: '-', checkOut: '-', name: '王小明', status: 'missed' },
    { date: '2024-01-16', checkIn: '上午09:30:00', checkOut: '下午06:30:00', name: '王小明', status: 'completed' },
  ];

  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  return (
    <div className="flex-1 bg-background-secondary">
      {/* 頁面標題與麵包屑導航 */}
      <div className="px-8 py-6">
        <div className="flex items-center text-sm text-gray-500">
          <a href="#" className="hover:text-blue-600">首頁</a>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>值班簽到</span>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">值班簽到</h1>
            <p className="mt-1 text-sm text-gray-500">管理與記錄值班人員的簽到狀態</p>
          </div>
        </div>
      </div>

      <div className="px-8 space-y-4">
        {/* 簽到表單區域 */}
        <div className="bg-background-primary rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側：用戶資訊 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">值班人員資訊</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-color/10 text-accent-color 
                                flex items-center justify-center font-bold text-lg">
                      {mockUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">{mockUser.name}</div>
                      <div className="text-sm text-text-secondary">{mockUser.department}</div>
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
                <button
                  onClick={() => setIsCheckedOut(!isCheckedOut)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all
                    ${isCheckedOut 
                      ? 'bg-background-secondary text-text-primary hover:bg-hover-color'
                      : 'bg-accent-color text-white hover:bg-accent-hover'}`}
                >
                  {isCheckedOut ? '已簽退' : '簽退'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 歷史記錄區域 */}
        <div className="bg-background-primary rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border-color">
            <h2 className="text-lg font-semibold text-text-primary">本週簽到記錄</h2>
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
                        {record.status === 'completed' ? '已簽到' : '未簽到'}
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
