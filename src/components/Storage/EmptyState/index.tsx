import { EmptyStateProps } from '@/components/storage/types';

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
        : '您可以拖放檔案至此處上傳，或使用上方按鈕新增內容'}
    </p>
  </div>
);

export default EmptyState; 