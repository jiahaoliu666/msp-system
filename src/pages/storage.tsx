import Link from 'next/link';

export default function Storage() {
  return (
    <div className="flex-1 bg-background-secondary p-8">
      {/* 頁面標題與麵包屑導航 */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-text-secondary mb-4">
          <Link href="/" className="hover:text-accent-color transition-colors">首頁</Link>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-text-primary">檔案儲存</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">檔案儲存</h1>
            <p className="text-text-secondary mt-1">管理與儲存重要文件檔案</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-accent-color text-white rounded-lg hover:bg-accent-hover transition-colors duration-150 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              上傳檔案
            </button>
          </div>
        </div>
      </div>

      {/* 儲存空間統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { title: '已使用空間', value: '2.5 GB', color: 'accent', icon: '💾' },
          { title: '剩餘空間', value: '7.5 GB', color: 'success', icon: '📊' },
          { title: '檔案總數', value: '128', color: 'warning', icon: '📁' },
          { title: '共享檔案', value: '45', color: 'info', icon: '🔗' },
        ].map((stat) => (
          <div key={stat.title} className={`bg-background-primary rounded-xl shadow-sm p-6 border-l-4 ${
            stat.color === 'accent' ? 'border-accent-color' :
            stat.color === 'success' ? 'border-success-color' :
            stat.color === 'warning' ? 'border-warning-color' :
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

      {/* 搜尋和篩選區 */}
      <div className="bg-background-primary rounded-xl shadow-sm mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <input
                type="text"
                placeholder="搜尋檔案..."
                className="w-full pl-10 pr-4 py-2 bg-background-primary border border-border-color rounded-lg
                       text-text-primary placeholder-text-secondary
                       focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5 text-text-secondary">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div>
              <select className="w-full px-3 py-2 bg-background-primary border border-border-color rounded-lg
                             text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color">
                <option value="">檔案類型</option>
                <option value="document">文件</option>
                <option value="image">圖片</option>
                <option value="video">影片</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <select className="w-full px-3 py-2 bg-background-primary border border-border-color rounded-lg
                             text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color">
                <option value="">排序方式</option>
                <option value="name">名稱</option>
                <option value="date">日期</option>
                <option value="size">大小</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 檔案列表 */}
      <div className="bg-background-primary rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-primary">檔案列表</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-accent-color transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-accent-color transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="px-6 py-3 text-left text-text-primary">檔案名稱</th>
                  <th className="px-6 py-3 text-left text-text-primary">類型</th>
                  <th className="px-6 py-3 text-left text-text-primary">大小</th>
                  <th className="px-6 py-3 text-left text-text-primary">上傳者</th>
                  <th className="px-6 py-3 text-left text-text-primary">上傳時間</th>
                  <th className="px-6 py-3 text-left text-text-primary">操作</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: '專案報告.docx', type: '文件', size: '2.5 MB', uploader: '王小明', date: '2024/03/15' },
                  { name: '系統架構圖.png', type: '圖片', size: '1.8 MB', uploader: '李小華', date: '2024/03/14' },
                  { name: '會議記錄.pdf', type: '文件', size: '3.2 MB', uploader: '張小美', date: '2024/03/13' },
                  { name: '教學影片.mp4', type: '影片', size: '158 MB', uploader: '陳大文', date: '2024/03/12' },
                ].map((file, index) => (
                  <tr key={index} className="border-b border-border-color hover:bg-hover-color transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {file.type === '文件' ? '📄' : file.type === '圖片' ? '🖼️' : '🎥'}
                        </span>
                        <span className="text-text-primary">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-primary">{file.type}</td>
                    <td className="px-6 py-4 text-text-primary">{file.size}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-accent-color/10 text-accent-color flex items-center justify-center">
                          {file.uploader.charAt(0)}
                        </div>
                        <span className="ml-2 text-text-primary">{file.uploader}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-primary">{file.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-accent-color transition-colors">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-accent-color transition-colors">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-error-color transition-colors">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分頁控制 */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-text-secondary">
              顯示 1 至 4 筆，共 128 筆
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">上一頁</button>
              <button className="px-3 py-1 bg-accent-color text-white rounded-lg">1</button>
              <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">2</button>
              <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">3</button>
              <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">...</button>
              <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">13</button>
              <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">下一頁</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
