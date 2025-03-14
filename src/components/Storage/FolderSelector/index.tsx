import { useState, useEffect } from 'react';
import { FolderSelectorProps } from '../types';
import { listFilesInFolder } from '@/services/storage/s3';

const FolderSelector: React.FC<FolderSelectorProps> = ({
  currentPath,
  onPathChange,
  recentFolders = [],
  excludePaths = [],
  title = '選擇目標資料夾'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [folders, setFolders] = useState<Array<{ name: string; path: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ name: string; path: string }>>([]);

  // 加載當前路徑下的資料夾
  const loadFolders = async (path: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await listFilesInFolder(path);
      
      // 過濾出資料夾並排除指定的路徑
      const filteredFolders = result.folders
        .filter(folder => !excludePaths.includes(path + folder.name + '/'))
        .map(folder => ({
          name: folder.name,
          path: path + folder.name + '/'
        }));
      
      setFolders(filteredFolders);
      
      // 更新階層導覽
      updateBreadcrumbs(path);
    } catch (err) {
      console.error('載入資料夾失敗:', err);
      setError('載入資料夾失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  // 更新階層導覽
  const updateBreadcrumbs = (path: string) => {
    const parts = path.split('/').filter(Boolean);
    const crumbs = [{ name: '根目錄', path: '' }];
    
    let currentPath = '';
    parts.forEach(part => {
      currentPath += part + '/';
      crumbs.push({ name: part, path: currentPath });
    });
    
    setBreadcrumbs(crumbs);
  };

  // 初始載入
  useEffect(() => {
    loadFolders(currentPath);
  }, [currentPath]); // eslint-disable-line react-hooks/exhaustive-deps

  // 處理資料夾點擊
  const handleFolderClick = (folderPath: string) => {
    onPathChange(folderPath);
  };

  // 處理導覽點擊
  const handleBreadcrumbClick = (path: string) => {
    onPathChange(path);
  };

  // 選擇當前資料夾
  const handleSelectCurrent = () => {
    // 已經在目標資料夾，直接關閉
    onPathChange(currentPath);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
      {/* 標題 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      </div>

      {/* 導覽列 */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700 flex items-center overflow-x-auto whitespace-nowrap">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center">
            {index > 0 && (
              <svg className="h-4 w-4 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            <button
              onClick={() => handleBreadcrumbClick(crumb.path)}
              className={`text-sm ${
                index === breadcrumbs.length - 1
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* 最近使用的資料夾 */}
      {recentFolders.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">最近使用的資料夾</h4>
          <div className="space-y-1">
            {recentFolders.map(folder => {
              const folderName = folder.split('/').filter(Boolean).pop() || '根目錄';
              return (
                <button
                  key={folder}
                  onClick={() => handleFolderClick(folder)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 
                         text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <svg className="h-4 w-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="truncate">{folderName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 資料夾列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-32 text-red-500">
            <div className="text-center mb-2">{error}</div>
            <button
              onClick={() => loadFolders(currentPath)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              重試
            </button>
          </div>
        ) : folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <svg className="h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
            <div className="text-center">此資料夾內沒有其他資料夾</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {folders.map(folder => (
              <button
                key={folder.path}
                onClick={() => handleFolderClick(folder.path)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 
                       text-gray-700 dark:text-gray-300 flex items-center"
              >
                <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="truncate">{folder.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 底部按鈕 */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex justify-between">
        <button
          onClick={handleSelectCurrent}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          選擇當前資料夾
        </button>
      </div>
    </div>
  );
};

export default FolderSelector; 