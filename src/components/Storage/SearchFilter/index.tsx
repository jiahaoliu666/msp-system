import { useState, useEffect, useRef } from 'react';
import { SearchFilterProps } from '../types';

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  fileType,
  onFileTypeChange,
  dateRange,
  onDateRangeChange,
  sortConfig,
  onSortChange,
  onClearFilters
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 檢查是否有任何篩選條件已啟用
  useEffect(() => {
    setIsFilterActive(
      !!fileType || 
      (dateRange[0] !== null || dateRange[1] !== null) || 
      sortConfig.key !== 'name' || 
      sortConfig.direction !== 'asc'
    );
  }, [fileType, dateRange, sortConfig]);

  // 處理點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAdvancedOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 處理搜尋輸入變更
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  // 處理搜尋提交
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearchTerm);
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

  // 日期轉換為字符串
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // 日期輸入處理
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : null;
    onDateRangeChange([newDate, dateRange[1]]);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : null;
    onDateRangeChange([dateRange[0], newDate]);
  };

  // 檔案類型選項
  const fileTypeOptions = [
    { value: '', label: '所有檔案' },
    { value: 'image', label: '圖片' },
    { value: 'document', label: '文件' },
    { value: 'video', label: '影片' },
    { value: 'audio', label: '音訊' },
    { value: 'archive', label: '壓縮檔' },
    { value: 'application', label: '應用程式' },
    { value: 'other', label: '其他' }
  ];

  // 排序選項
  const sortOptions = [
    { value: 'name', label: '名稱' },
    { value: 'size', label: '大小' },
    { value: 'date', label: '修改日期' },
    { value: 'type', label: '類型' }
  ];

  // 重置篩選條件
  const handleReset = () => {
    onClearFilters();
    setIsAdvancedOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* 搜索欄 */}
      <form onSubmit={handleSearchSubmit} className="flex items-center">
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
        
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className={`relative ml-2 p-2 rounded-lg transition-all duration-200 
            ${isFilterActive 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          {isFilterActive && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-gray-800"></span>
          )}
        </button>
      </form>

      {/* 高級篩選下拉選單 */}
      {isAdvancedOpen && (
        <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">高級篩選</h3>
            <button
              onClick={handleReset}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              重置所有篩選條件
            </button>
          </div>
          
          <div className="space-y-4">
            {/* 檔案類型選擇 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                檔案類型
              </label>
              <select
                value={fileType}
                onChange={(e) => onFileTypeChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md
                       text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {fileTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 日期範圍 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                日期範圍
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">從</label>
                  <input
                    type="date"
                    value={formatDate(dateRange[0])}
                    onChange={handleStartDateChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md
                           text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">至</label>
                  <input
                    type="date"
                    value={formatDate(dateRange[1])}
                    onChange={handleEndDateChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md
                           text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* 排序 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                排序方式
              </label>
              <div className="flex items-center space-x-3">
                <select
                  value={sortConfig.key}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="flex-grow px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md
                         text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={() => onSortChange(sortConfig.key)}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md"
                >
                  {sortConfig.direction === 'asc' ? (
                    <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsAdvancedOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       shadow-md hover:shadow-lg transition-all duration-200"
            >
              套用篩選條件
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter; 