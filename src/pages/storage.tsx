import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { testCORSConfiguration, getStorageQuota, reinitializeS3Client, checkS3Connection } from '@/services/storage/s3';
import { AWS_CONFIG } from '@/config/aws-config';
import { S3_CONFIG } from '@/config/s3-config';

// 引入組件
import FileList from '@/components/storage/FileList';
import EmptyState from '../components/storage/EmptyState';
import UploadProgress from '@/components/storage/UploadProgress';
import StatusBar from '@/components/storage/StatusBar';
import FilePreview from '@/components/storage/FilePreview';
import ContextMenu from '@/components/storage/ContextMenu';
import SearchFilter from '@/components/storage/SearchFilter';
import FileInfo from '@/components/storage/FileInfo';
import TagManager from '@/components/storage/TagManager';
import FolderSelector from '@/components/storage/FolderSelector';

// 引入 hooks
import { useFileManager } from '@/components/storage/hooks/useFileManager';
import { useUpload } from '@/components/storage/hooks/useUpload';
import { useFileOperations } from '@/components/storage/hooks/useFileOperations';
import { FileFilters, FileItem, FolderItem } from '@/components/storage/types';

// 導入相關元件
import LoadingSpinner from '../components/common/LoadingSpinner';
import GridView from '../components/storage/FileList/GridView';
import ListView from '../components/storage/FileList/ListView';

// 自定義的檔案管理器布局組件
const FileManagerLayout: React.FC<{
  children: React.ReactNode;
  currentPath: string;
  parentPath: string | null;
  breadcrumbs: string[];
  viewMode: 'list' | 'grid';
  searchTerm: string;
  multiSelectMode: boolean;
  onGoBack: () => void;
  onSetCurrentPath: (path: string) => void;
  onSetViewMode: (mode: 'list' | 'grid') => void;
  onSearchChange: (term: string) => void;
  onToggleMultiSelectMode: () => void;
  onCreateFolder: () => void;
  onUploadClick: () => void;
}> = ({
  children,
  currentPath,
  parentPath,
  breadcrumbs,
  viewMode,
  searchTerm,
  multiSelectMode,
  onGoBack,
  onSetCurrentPath,
  onSetViewMode,
  onSearchChange,
  onToggleMultiSelectMode,
  onCreateFolder,
  onUploadClick
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* 頂部工具列 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex flex-wrap items-center justify-between gap-4">
        {/* 路徑導航 */}
        <div className="flex items-center space-x-2 flex-grow">
          <button
            onClick={onGoBack}
            disabled={parentPath === null}
            className={`p-2 rounded-lg ${
              parentPath !== null
                ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => onSetCurrentPath('')}
              className="hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
            >
              根目錄
            </button>
            
            {breadcrumbs && breadcrumbs.length > 0 && (
              <span className="mx-1">/</span>
            )}
            
            {breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs.map((folder, index) => (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => onSetCurrentPath(folder)}
                  className="hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
                >
                  {folder.split('/').filter(Boolean).pop() || ''}
                </button>
                {index < breadcrumbs.length - 1 && <span className="mx-1">/</span>}
              </div>
            )) : null}
          </div>
        </div>

        {/* 高級搜尋與篩選 */}
        <div className="flex-grow max-w-xl flex items-center">
          <div className="flex-grow">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
            />
          </div>
          
          {/* 主要操作按鈕 - 更顯眼的位置 */}
          <div className="flex items-center ml-4 space-x-2">
            <button
              onClick={onCreateFolder}
              className="px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg flex items-center space-x-1 transition-all duration-200 shadow-sm"
              title="新建資料夾"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">新增資料夾</span>
            </button>
            
            <button
              onClick={onUploadClick}
              className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center space-x-1 transition-all duration-200 shadow-sm"
              title="上傳檔案"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L7 8m4-4v12" />
              </svg>
              <span className="text-sm font-medium">上傳檔案</span>
            </button>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSetViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title={viewMode === 'list' ? '切換到網格視圖' : '切換到列表視圖'}
          >
            {viewMode === 'list' ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* 主要內容區域 */}
      <div className="flex-grow overflow-auto p-6">
        {children}
      </div>
    </div>
  );
};

export default function Storage() {
  // 文件管理器鉤子
  const {
    files,
    folders,
    isLoading,
    error,
    currentPath,
    parentPath,
    selectedItems,
    totalSize,
    loadFiles,
    handleRetry,
    handleEnterFolder,
    handleGoBack,
    setCurrentPath,
    setSelectedItems,
    breadcrumbs,
    filteredItems
  } = useFileManager();

  // 文件操作鉤子
  const {
    selectedFile,
    previewFile,
    contextMenu,
    handleDownload,
    handleDelete,
    handleDeleteFolder,
    handleFilePreview,
    handleContextMenu,
    handleContextMenuAction,
    setPreviewFile,
    setContextMenu,
    multiSelectMode,
    toggleMultiSelectMode,
    currentOperation,
    handleCreateFolder
  } = useFileOperations(currentPath, loadFiles);

  // 文件上傳鉤子
  const {
    isUploading,
    uploadProgress,
    duplicateFile,
    handleUploadClick,
    handleDuplicateFile,
    getRootProps,
    getInputProps
  } = useUpload(currentPath, files, loadFiles);

  // 視圖模式狀態 (list / grid)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  
  // 搜尋詞狀態
  const [searchTerm, setSearchTerm] = useState('');
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // 計算總頁數
  const totalItems = filteredItems.files.length + filteredItems.folders.length;
  const totalFiles = filteredItems.files.length;
  const totalFolders = filteredItems.folders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // 檢查是否為空文件夾
  const isEmptyFolder = folders.length === 0 && files.length === 0;

  // 狀態管理
  const [isOnline, setIsOnline] = useState(true);
  const [showFileInfo, setShowFileInfo] = useState(false);
  const [fileInfoTarget, setFileInfoTarget] = useState<FileItem | FolderItem | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [storageQuota, setStorageQuota] = useState<{ used: number; total: number } | null>(null);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [taggedItem, setTaggedItem] = useState<string | null>(null);

  // 網路狀態監聽
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('網路連線已恢復');
      loadFiles();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('網路連線已斷開，部分功能可能無法使用');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadFiles]);

  // S3 初始化和連接檢查
  useEffect(() => {
    const initializeS3Connection = async () => {
      try {
        // 檢查連接狀態
        const isConnected = await checkS3Connection();
        
        if (!isConnected) {
          console.log('S3 連接失敗，嘗試重新初始化...');
          const reinitialized = reinitializeS3Client();
          
          if (!reinitialized) {
            console.error('S3 客戶端重新初始化失敗');
            toast.error('無法連接到檔案儲存服務，請重新整理頁面或聯繫系統管理員');
            return;
          }
        }
        
        // 加載文件
        await loadFiles();
        
        // 加載儲存空間配額
        try {
          const quota = await getStorageQuota();
          setStorageQuota(quota);
        } catch (error) {
          console.error('獲取儲存空間配額失敗:', error);
        }
      } catch (error) {
        console.error('S3 連接初始化失敗:', error);
        toast.error('檔案儲存服務暫時不可用，請稍後再試');
      }
    };
    
    initializeS3Connection();
  }, []);

  // 檢查 CORS 設定
  useEffect(() => {
    const checkCORSConfig = async () => {
      try {
        console.log('開始檢查 CORS 配置...');
        const result = await testCORSConfiguration();
        console.log('CORS 配置檢查結果:', result);
      } catch (error: any) {
        console.error('CORS 設定檢查失敗:', error);
        toast.error(`CORS 設定檢查失敗: ${error.message}，部分功能可能無法使用`);
      }
    };

    checkCORSConfig();
  }, []);

  // 載入儲存空間配額
  useEffect(() => {
    const loadStorageQuota = async () => {
      try {
        const quota = await getStorageQuota();
        setStorageQuota(quota);
      } catch (error) {
        console.error('獲取儲存空間配額失敗:', error);
      }
    };

    loadStorageQuota();
    
    // 每隔 5 分鐘更新一次
    const intervalId = setInterval(loadStorageQuota, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // UI效果
  useEffect(() => {
    document.body.style.overflowY = showFileInfo ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflowY = 'auto';
    };
  }, [showFileInfo]);

  // 當搜尋條件變更時，重置分頁
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 載入儲存空間配額
  useEffect(() => {
    const loadStorageQuota = async () => {
      try {
        const quota = await getStorageQuota();
        setStorageQuota(quota);
      } catch (error) {
        console.error('獲取儲存空間配額失敗:', error);
      }
    };

    loadStorageQuota();
    
    // 每隔 5 分鐘更新一次
    const intervalId = setInterval(loadStorageQuota, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // 載入儲存空間配額
  useEffect(() => {
    const loadStorageQuota = async () => {
      try {
        const quota = await getStorageQuota();
        setStorageQuota(quota);
      } catch (error) {
        console.error('獲取儲存空間配額失敗:', error);
      }
    };

    loadStorageQuota();
    
    // 每隔 5 分鐘更新一次
    const intervalId = setInterval(loadStorageQuota, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // 檔案資訊
  const handleOpenFileInfo = (file: FileItem | FolderItem) => {
    setFileInfoTarget(file);
    setShowFileInfo(true);
  };

  // 關閉檔案資訊
  const handleCloseFileInfo = () => {
    setShowFileInfo(false);
  };

  // 標籤變更
  const handleTagsChange = async (tags: string[]) => {
    if (!taggedItem) return;
    
    try {
      // 這裡可以實現標籤更新邏輯
      console.log('更新標籤:', taggedItem, tags);
      setIsTagManagerOpen(false);
    } catch (error) {
      console.error('標籤更新失敗:', error);
    }
  };

  // 移動檔案
  const handleMoveFile = () => {
    setShowMoveDialog(true);
  };

  // 重命名檔案
  const handleRenameFile = () => {
    if (!selectedFile) return;
    // 這裡可以實現重命名邏輯
    console.log('重命名檔案:', selectedFile);
  };

  // 分享檔案
  const handleShareFile = async () => {
    // 這裡可以實現檔案分享邏輯
    console.log('分享檔案');
  };

  // 渲染檔案列表
  const renderFileList = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="mt-4 text-gray-600 dark:text-gray-400">載入中...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <div className="text-center mb-4">{error}</div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
          >
            重試
          </button>
        </div>
      );
    }

    // 搜尋結果為空時顯示相應的提示
    if (searchTerm && filteredItems.folders.length === 0 && filteredItems.files.length === 0) {
      return <EmptyState type="search" searchTerm={searchTerm} onClearFilter={() => setSearchTerm('')} />;
    }

    // 始終顯示檔案列表，即使為空
    return (
      <FileList
        files={filteredItems.files}
        folders={filteredItems.folders}
        currentPath={currentPath}
        selectedItems={selectedItems}
        viewMode={viewMode}
        searchTerm={searchTerm}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onSelectItem={(key) => {
          const newSelected = new Set(selectedItems);
          if (newSelected.has(key)) {
            newSelected.delete(key);
          } else {
            newSelected.add(key);
          }
          setSelectedItems(newSelected);
        }}
        onEnterFolder={handleEnterFolder}
        onDeleteFolder={handleDeleteFolder}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onFilePreview={handleFilePreview}
        onContextMenu={handleContextMenu}
        onSort={handleSort}
        starredItems={[]}
        isEmptyFolder={isEmptyFolder}
        onCreateFolder={handleCreateFolder}
      />
    );
  };

  // 搜尋函數
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };
  
  // 排序函數
  const handleSort = (key: string) => {
    // 實現排序邏輯
    console.log('排序依據:', key);
  };

  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="container-responsive py-6 flex flex-col h-full">
          <div className="flex flex-col space-y-6 flex-1">
            {/* 檔案管理功能區塊 */}
            <FileManagerLayout
              children={
                <>
                  {/* 檔案拖放上傳區域 */}
                  <div 
                    {...getRootProps()}
                    className="relative w-full h-full"
                  >
                    <input {...getInputProps()} />
                    
                    {/* 顯示拖放上傳進度 */}
                    {isUploading && (
                      <UploadProgress progress={uploadProgress} />
                    )}
                    
                    {/* 檔案重複處理對話框 */}
                    {duplicateFile && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-96 max-w-full">
                          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">檔案已存在</h3>
                          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                            檔案「{duplicateFile.file.name}」已存在，請選擇處理方式：
                          </p>
                          <div className="space-y-2">
                            <button
                              onClick={() => handleDuplicateFile('replace')}
                              className="w-full py-2 px-4 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 
                                      hover:bg-red-200 dark:hover:bg-red-900/70 rounded-lg transition-colors"
                            >
                              覆蓋現有檔案
                            </button>
                            <button
                              onClick={() => handleDuplicateFile('keep-both')}
                              className="w-full py-2 px-4 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 
                                      hover:bg-blue-200 dark:hover:bg-blue-900/70 rounded-lg transition-colors"
                            >
                              保留兩者（重新命名）
                            </button>
                            <button
                              onClick={() => handleDuplicateFile('skip')}
                              className="w-full py-2 px-4 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 
                                      hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              跳過此檔案
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 檔案列表 */}
                    <FileList
                      files={filteredItems.files}
                      folders={filteredItems.folders}
                      currentPath={currentPath}
                      selectedItems={selectedItems}
                      viewMode={viewMode}
                      searchTerm={searchTerm}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      onSelectItem={(key) => {
                        const newSelected = new Set(selectedItems);
                        if (newSelected.has(key)) {
                          newSelected.delete(key);
                        } else {
                          newSelected.add(key);
                        }
                        setSelectedItems(newSelected);
                      }}
                      onEnterFolder={handleEnterFolder}
                      onDeleteFolder={handleDeleteFolder}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      onFilePreview={handleFilePreview}
                      onContextMenu={handleContextMenu}
                      onSort={handleSort}
                      starredItems={[]}
                      isEmptyFolder={isEmptyFolder}
                      onCreateFolder={handleCreateFolder}
                    />
                  </div>

                  {/* 分頁控制 */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 text-sm rounded-md ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                        }`}
                      >
                        上一頁
                      </button>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        第 {currentPage} 頁，共 {totalPages} 頁
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 text-sm rounded-md ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                        }`}
                      >
                        下一頁
                      </button>
                    </div>
                  )}
                </>
              }
              currentPath={currentPath}
              parentPath={parentPath}
              breadcrumbs={breadcrumbs}
              viewMode={viewMode}
              searchTerm={searchTerm}
              multiSelectMode={multiSelectMode}
              onGoBack={handleGoBack}
              onSetCurrentPath={setCurrentPath}
              onSetViewMode={setViewMode}
              onSearchChange={handleSearch}
              onToggleMultiSelectMode={toggleMultiSelectMode}
              onCreateFolder={handleCreateFolder}
              onUploadClick={handleUploadClick}
            />
          </div>
        </div>
      </div>

      {/* 檔案預覽 */}
      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}

      {/* 右鍵選單 */}
      {contextMenu && (
        <ContextMenu
          file={contextMenu.file}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onAction={handleContextMenuAction}
        />
      )}

      {/* 狀態欄 */}
      <StatusBar
        selectedItems={selectedItems}
        totalItems={totalItems}
        totalSize={totalSize}
        uploadProgress={isUploading ? uploadProgress : undefined}
        currentOperation={currentOperation}
      />
    </div>
  );
}