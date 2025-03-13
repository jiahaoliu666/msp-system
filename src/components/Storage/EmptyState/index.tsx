import { EmptyStateProps } from '../types';

const EmptyState: React.FC<EmptyStateProps> = ({ type, searchTerm }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="text-7xl mb-6 animate-bounce-slow">
      {type === 'search' ? '🔍' : '📂'}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
      {type === 'search' 
        ? `找不到與 "${searchTerm}" 相關的內容`
        : '此資料夾是空的'}
    </h3>
    <p className="text-base text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
      {type === 'search'
        ? '請嘗試使用其他關鍵字搜尋，或檢查拼字是否正確'
        : '您可以拖放檔案至此處，或使用下方按鈕上傳檔案'}
    </p>
    {type === 'folder' && (
      <button
        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                 transform hover:scale-105 transition-all duration-200 
                 shadow-lg hover:shadow-xl flex items-center space-x-2 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>上傳檔案</span>
      </button>
    )}
  </div>
);

export default EmptyState; 