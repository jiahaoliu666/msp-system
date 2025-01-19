import Link from 'next/link';

export default function VersionRecord() {
    return (
      <div className="p-8">
        {/* 頁面標題與操作按鈕 */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600">首頁</Link>
            <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700">更版紀錄</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">更版紀錄</h1>
              <p className="text-gray-600 mt-1">查看系統更新歷程</p>
            </div>
          </div>
        </div>
  
        {/* 版本列表 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <div className="space-y-6">
              {[
                {
                  version: 'v2.1.0',
                  date: '2024/03/15',
                  type: '功能更新',
                  title: '新增批量客戶資料導入功能',
                  description: '本次更新主要針對客戶資料管理功能進行優化，新增了批量導入功能，並改善了整體使用體驗。',
                  changes: [
                    '新增批量客戶資料導入功能',
                    '優化客戶資料顯示介面',
                    '改善搜尋功能效能',
                    '修復已知問題'
                  ]
                },
                {
                  version: 'v2.0.9',
                  date: '2024/03/10',
                  type: '問題修復',
                  title: '修復報表匯出異常問題',
                  description: '此版本修復了多個已知問題，提升了系統穩定性。',
                  changes: [
                    '修復報表匯出格式異常問題',
                    '修正資料統計計算錯誤',
                    '改善系統回應速度'
                  ]
                },
                {
                  version: 'v2.0.8',
                  date: '2024/03/05',
                  type: '效能優化',
                  title: '系統效能優化更新',
                  description: '本次更新著重於系統效能的優化，提升了整體運行速度。',
                  changes: [
                    '優化資料庫查詢效能',
                    '改善頁面載入速度',
                    '減少記憶體使用量'
                  ]
                }
              ].map((version, index) => (
                <div key={index} className="border rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-bold text-gray-800">{version.version}</span>
                      <span className="text-sm text-gray-500">{version.date}</span>
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        version.type === '功能更新' ? 'bg-blue-100 text-blue-600' :
                        version.type === '問題修復' ? 'bg-red-100 text-red-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {version.type}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">{version.title}</h3>
                  <p className="text-gray-600 mb-4">{version.description}</p>
                  <div className="space-y-2">
                    {version.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  