import { UploadProgressProps } from '../types';

const UploadProgress: React.FC<UploadProgressProps> = ({ progress }) => (
  <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-5 w-96
                  transform transition-all duration-300 ease-in-out
                  border border-gray-200 dark:border-gray-700">
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center space-x-3">
        <div className="animate-pulse">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3-3m3 3V8" />
          </svg>
        </div>
        <span className="font-medium text-gray-800 dark:text-gray-200">正在上傳檔案...</span>
      </div>
      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{progress}%</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300
                   transform origin-left scale-x-100"
        style={{ width: `${progress}%` }}
      />
    </div>
    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
      請勿關閉視窗，上傳完成後會自動更新
    </div>
  </div>
);

export default UploadProgress; 