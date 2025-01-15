export default function SystemSettings() {
  return (
    <div className="flex-1 bg-gray-100 p-8">
      {/* 頁面標題 */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <a href="#" className="hover:text-blue-600">首頁</a>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700">系統設定</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">系統設定</h1>
            <p className="text-gray-600 mt-1">管理系統基本設定與進階配置</p>
          </div>
        </div>
      </div>

      {/* 設定區塊 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本設定 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">基本設定</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    系統名稱
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MSP CRM 系統"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    系統描述
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="系統簡介描述"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    系統 Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <button className="px-4 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50">
                      上傳圖片
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      時區設定
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>(GMT+08:00) 台北</option>
                      <option>(GMT+09:00) 東京</option>
                      <option>(GMT+00:00) 倫敦</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      日期格式
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>YYYY/MM/DD</option>
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 安全設定 */}
          <div className="bg-white rounded-lg shadow-md mt-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">安全設定</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    密碼政策
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300" />
                      <label className="ml-2 text-sm text-gray-700">
                        要求至少 8 個字元
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300" />
                      <label className="ml-2 text-sm text-gray-700">
                        必須包含大小寫字母
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300" />
                      <label className="ml-2 text-sm text-gray-700">
                        必須包含數字
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300" />
                      <label className="ml-2 text-sm text-gray-700">
                        必須包含特殊字元
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    登入安全
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300" />
                      <label className="ml-2 text-sm text-gray-700">
                        啟用雙因素認證
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300" />
                      <label className="ml-2 text-sm text-gray-700">
                        登入失敗鎖定帳號
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300" />
                      <label className="ml-2 text-sm text-gray-700">
                        強制定期更換密碼
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session 設定
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        閒置超時時間
                      </label>
                      <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>15 分鐘</option>
                        <option>30 分鐘</option>
                        <option>1 小時</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        最大登入裝置數
                      </label>
                      <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>1 台</option>
                        <option>2 台</option>
                        <option>3 台</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右側設定區塊 */}
        <div className="space-y-6">
          {/* 通知設定 */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">通知設定</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電子郵件通知
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">系統更新通知</label>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">安全警報通知</label>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">報表生成通知</label>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LINE 通知
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">工單狀態更新</label>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">緊急事件通知</label>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 備份設定 */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">備份設定</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    自動備份
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>每日備份</option>
                    <option>每週備份</option>
                    <option>每月備份</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    備份保留時間
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>7 天</option>
                    <option>30 天</option>
                    <option>90 天</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    備份儲存位置
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>本地儲存</option>
                    <option>雲端儲存</option>
                    <option>混合儲存</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 儲存按鈕 */}
      <div className="mt-6 flex justify-end space-x-3">
        <button className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50">
          取消
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          儲存設定
        </button>
      </div>
    </div>
  );
}
