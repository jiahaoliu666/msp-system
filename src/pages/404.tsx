import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 錯誤代碼 */}
        <div className="relative">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
            404
          </h1>
          <div className="absolute -bottom-2 w-full">
            <div className="h-2 w-full bg-gradient-to-r from-blue-600/20 to-blue-400/20 rounded-full"></div>
          </div>
        </div>

        {/* 錯誤訊息 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            找不到您要的頁面
          </h2>
          <p className="text-gray-600">
            您所尋找的頁面可能已被移除、名稱已更改或暫時無法使用
          </p>
        </div>
      </div>
    </div>
  );
} 