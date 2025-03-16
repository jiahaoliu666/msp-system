import { useState, useEffect } from 'react';
import { SearchFilterProps } from '../types';

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  isRefreshing = false
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // 處理搜尋輸入變更
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  // 處理搜尋提交
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearchTerm);
  };

  // 處理刷新按鈕點擊
  const handleRefresh = () => {
    if (onRefresh && !isRefreshing) {
      onRefresh();
    }
  };

  // 延遲搜尋 (在用戶停止輸入後自動搜尋)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        onSearchChange(localSearchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearchChange, searchTerm]);

  return (
    <div className="relative w-full">
      {/* 搜索欄 */}
      <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
        {/* 重整按鈕 */}
        {onRefresh && (
          <button
            type="button"
            onClick={handleRefresh}
            className={`p-2 ${isRefreshing ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'} 
                     text-gray-600 dark:text-gray-300 rounded-lg
                     hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRefreshing ? 'cursor-not-allowed' : ''}`}
            disabled={isRefreshing}
            title="重新整理"
          >
            <svg 
              className={`h-5 w-5 ${isRefreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>
        )}
        
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="搜尋檔案..."
            value={localSearchTerm}
            onChange={handleSearchInputChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600
                    transition-all duration-200"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {localSearchTerm && (
            <button
              type="button"
              onClick={() => {
                setLocalSearchTerm('');
                onSearchChange('');
              }}
              className="absolute inset-y-0 right-10 flex items-center pr-2"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchFilter; 