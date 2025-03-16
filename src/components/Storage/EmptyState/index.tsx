import { EmptyStateProps } from '@/components/storage/types';

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  searchTerm, 
  onCreateFolder, 
  onClearFilter,
  isLoading 
}) => (
  <div className="flex flex-col items-center justify-center py-8 px-4 w-full">
    {isLoading ? (
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
          正在載入中...
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          請稍候，系統正在載入您的資料
        </p>
      </div>
    ) : (
      <>
        <div className="text-5xl mb-3">
          {type === 'search' ? '🔍' : '📂'}
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">
          {type === 'search' 
            ? `找不到與 "${searchTerm}" 相關的內容`
            : '此資料夾是空的'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 text-center max-w-md">
          {type === 'search'
            ? '請嘗試使用其他關鍵字搜尋，或檢查拼字是否正確'
            : '您可以拖放檔案至此處，或使用下方按鈕上傳檔案'}
        </p>
        {type === 'search' && onClearFilter && (
          <button
            onClick={onClearFilter}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                    transition-all duration-200 
                    shadow-md hover:shadow-lg flex items-center space-x-2 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>清除搜尋</span>
          </button>
        )}
        {type === 'folder' && (
          <div className="flex space-x-3">
            <button
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                      transition-all duration-200 
                      shadow-md hover:shadow-lg flex items-center space-x-2 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L7 8m4-4v12" />
              </svg>
              <span>上傳檔案</span>
            </button>
            
            {onCreateFolder && (
              <button
                onClick={onCreateFolder}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 
                        transition-all duration-200 
                        shadow-md hover:shadow-lg flex items-center space-x-2 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>新增資料夾</span>
              </button>
            )}
          </div>
        )}
      </>
    )}
  </div>
);

export default EmptyState; 