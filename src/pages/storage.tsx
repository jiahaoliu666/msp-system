import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { testCORSConfiguration, getStorageQuota, reinitializeS3Client } from '@/services/storage/s3';
import { AWS_CONFIG } from '@/config/aws-config';
import { S3_CONFIG } from '@/config/s3-config';

// 引入組件
import FileList from '@/components/storage/FileList';
import EmptyState from '@/components/storage/EmptyState';
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

export default function Storage() {
  // 狀態管理
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [isOnline, setIsOnline] = useState(true);
  const [showFileInfo, setShowFileInfo] = useState(false);
  const [fileInfoTarget, setFileInfoTarget] = useState<FileItem | FolderItem | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [storageQuota, setStorageQuota] = useState<{ used: number; total: number } | null>(null);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [taggedItem, setTaggedItem] = useState<string | null>(null);

  // 使用自定義 hooks
  const {
    files,
    folders,
    isLoading,
    error,
    currentPath,
    parentPath,
    selectedItems,
    totalSize,
    starredItems,
    breadcrumbs,
    recentFolders,
    loadFiles,
    handleRetry,
    handleEnterFolder,
    handleGoBack,
    handleSelectItem,
    handleSelectAll,
    toggleStarred,
    setCurrentPath,
    setSelectedItems,
    filteredItems,
    applyFilters
  } = useFileManager();

  const {
    isUploading,
    uploadProgress,
    uploadSpeed,
    uploadQueue,
    currentFileIndex,
    totalFiles,
    estimatedTimeRemaining,
    draggedOver,
    duplicateFile,
    onDrop,
    handleUploadClick,
    handleDuplicateFile,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    setDraggedOver,
    getRootProps,
    getInputProps,
    isDragActive
  } = useUpload(currentPath, files, loadFiles);

  const {
    selectedFile,
    previewFile,
    contextMenu,
    isDeleteConfirmOpen,
    itemToDelete,
    isCreatingFolder,
    isRenamingItem,
    newFolderName,
    newItemName,
    currentOperation,
    multiSelectMode,
    handleDownload,
    handleDelete,
    handleDeleteFolder,
    handleConfirmDelete,
    handleCreateFolder,
    handleFilePreview,
    handleContextMenu,
    handleContextMenuAction,
    handleRename,
    handleMove,
    handleCopy,
    handleShare,
    handleTag,
    handleStar,
    toggleMultiSelectMode,
    setSelectedFile,
    setPreviewFile,
    setContextMenu,
    setIsDeleteConfirmOpen,
    setItemToDelete,
    setIsCreatingFolder,
    setIsRenamingItem,
    setNewFolderName,
    setNewItemName,
    setCurrentOperation
  } = useFileOperations(currentPath, loadFiles);

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

  // 初始載入檔案
  useEffect(() => {
    console.log('開始加載檔案...');
    
    // 詳細診斷 AWS 配置
    console.log('AWS 連接配置詳細信息:', {
      region: AWS_CONFIG.region,
      endpoint: AWS_CONFIG.endpoint,
      bucket: S3_CONFIG.bucketName,
      accessKeyIdExists: !!AWS_CONFIG.credentials.accessKeyId,
      secretAccessKeyExists: !!AWS_CONFIG.credentials.secretAccessKey,
      // 顯示環境變數 (安全起見只顯示存在與否)
      envVars: {
        NEXT_PUBLIC_AWS_REGION: !!process.env.NEXT_PUBLIC_AWS_REGION,
        NEXT_PUBLIC_AWS_ACCESS_KEY_ID: !!process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
        NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY: !!process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
        NEXT_PUBLIC_S3_BUCKET_NAME: !!process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
        NEXT_PUBLIC_S3_ENDPOINT: process.env.NEXT_PUBLIC_S3_ENDPOINT
      }
    });
    
    // 測試 S3 連接
    const testS3Connection = async () => {
      try {
        console.log('正在測試 S3 連接...');
        await testCORSConfiguration();
        console.log('S3 連接測試成功');
      } catch (error) {
        console.error('S3 連接測試失敗:', error);
      }
    };
    
    testS3Connection();
    
    loadFiles()
      .then((result) => {
        console.log('檔案加載成功', result);
        handleApplyFilters();
      })
      .catch((error: Error) => {
        console.error('檔案加載失敗:', error);
        toast.error(`檔案加載失敗: ${error.message}`);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 篩選處理
  const handleApplyFilters = useCallback(() => {
    console.log("handleApplyFilters 被調用了"); // 添加日誌
    
    // 防禦性編程：如果 applyFilters 未定義或不是函數，使用本地過濾
    if (typeof applyFilters !== 'function') {
      console.error("applyFilters 不是一個函數！", applyFilters);
      
      // 本地實現基本過濾邏輯 (如果 applyFilters 無效)
      const localFilter = () => {
        console.log("使用本地過濾邏輯替代 applyFilters");
        // 可以在這裡實現簡單過濾邏輯，或者設置一個空的過濾結果
        const safeFilteredItems = { 
          files: files || [], 
          folders: folders || [] 
        };
        // 模擬 filteredItems 設置
        console.log("本地過濾結果:", safeFilteredItems);
      };
      
      localFilter();
      return;
    }
    
    const filters: FileFilters = {
      searchTerm,
      fileTypes: fileType ? [fileType] : undefined,
      dateRange: dateRange[0] || dateRange[1] ? dateRange : undefined,
      sortBy: sortConfig.key,
      sortDirection: sortConfig.direction as 'asc' | 'desc'
    };
    
    // 嘗試調用 applyFilters 並捕獲任何錯誤
    try {
      applyFilters(filters);
    } catch (error) {
      console.error("調用 applyFilters 時發生錯誤:", error);
      toast.error("過濾檔案時發生錯誤，請重試");
    }
  }, [searchTerm, fileType, dateRange, sortConfig, applyFilters, files, folders]);

  // 當篩選條件變更時應用篩選
  useEffect(() => {
    handleApplyFilters();
  }, [handleApplyFilters]);

  // 處理清除篩選條件
  const handleClearFilters = () => {
    setSearchTerm('');
    setFileType('');
    setDateRange([null, null]);
    setSortConfig({ key: 'name', direction: 'asc' });
  };

  // 開啟檔案信息面板
  const handleOpenFileInfo = (file: FileItem | FolderItem) => {
    setFileInfoTarget(file);
    setShowFileInfo(true);
  };

  // 關閉檔案信息面板
  const handleCloseFileInfo = () => {
    setShowFileInfo(false);
    setFileInfoTarget(null);
  };

  // 處理檔案標籤
  const handleTagsChange = async (tags: string[]) => {
    if (!fileInfoTarget) return;
    
    try {
      await handleTag(fileInfoTarget.Key || '', tags);
      toast.success('標籤更新成功');
    } catch (error) {
      console.error('更新標籤失敗:', error);
      toast.error('更新標籤失敗');
      throw error; // 將錯誤傳遞給 TagManager 以還原 UI
    }
  };

  // 處理移動檔案
  const handleMoveFile = () => {
    if (!fileInfoTarget) return;
    setShowMoveDialog(true);
  };

  // 處理重命名
  const handleRenameFile = () => {
    if (!fileInfoTarget) return;
    setIsRenamingItem(true);
    setNewItemName(fileInfoTarget.type === 'folder' 
      ? (fileInfoTarget as FolderItem).name 
      : (fileInfoTarget.Key?.split('/').pop() || ''));
  };

  // 處理分享檔案
  const handleShareFile = async () => {
    if (!fileInfoTarget || fileInfoTarget.type === 'folder') return;
    
    try {
      const shareUrl = await handleShare(fileInfoTarget.Key || '');
      navigator.clipboard.writeText(shareUrl);
      toast.success('分享連結已複製到剪貼簿');
    } catch (error) {
      console.error('分享檔案失敗:', error);
      toast.error('分享檔案失敗');
    }
  };

  // 渲染檔案列表或空狀態
  const renderFileList = () => {
    // 初始化 filteredItems 以防止它是 undefined
    const safeFilteredItems = filteredItems || { files: [], folders: [] };
    // 確保 starredItems 存在且可迭代
    const safeStarredItems = starredItems || new Set<string>();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">載入中...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-lg font-medium mb-2">{error}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
            可能是 AWS S3 連接問題。請檢查網絡連接或 AWS 認證是否有效。
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transform hover:scale-105 transition-all duration-200 
                       shadow-lg hover:shadow-xl flex items-center space-x-2 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>重試連接</span>
            </button>
            
            <button 
              onClick={() => {
                // 嘗試重新初始化 S3 客戶端並重新加載
                reinitializeS3Client();
                toast.info('正在重新初始化 S3 連接...');
                setTimeout(() => {
                  handleRetry();
                }, 1000);
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 
                       transform hover:scale-105 transition-all duration-200 
                       shadow-lg hover:shadow-xl flex items-center space-x-2 
                       focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>重置 S3 連接</span>
            </button>
          </div>
        </div>
      );
    }

    // 過濾後沒有結果
    if (searchTerm && safeFilteredItems.files.length === 0 && safeFilteredItems.folders.length === 0) {
      return (
        <EmptyState 
          type="search" 
          searchTerm={searchTerm}
          onClearFilter={handleClearFilters}
        />
      );
    }

    // 過濾後沒有結果 (僅篩選條件)
    if (!searchTerm && fileType && safeFilteredItems.files.length === 0 && safeFilteredItems.folders.length === 0) {
      return (
        <EmptyState 
          type="filter" 
          filterType={fileType}
          onClearFilter={handleClearFilters}
        />
      );
    }

    // 空資料夾
    if (files.length === 0 && folders.length === 0) {
      return (
        <EmptyState 
          type="folder" 
        />
      );
    }

    return (
      <div {...getRootProps({ className: 'outline-none' })}>
        <input {...getInputProps()} />
        <FileList
          files={safeFilteredItems.files}
          folders={safeFilteredItems.folders}
          currentPath={currentPath}
          selectedItems={selectedItems}
          starredItems={Array.from(safeStarredItems).map(key => {
            const file = safeFilteredItems.files.find(f => f.Key === key);
            if (file) return file;
            return { Key: key, type: 'unknown' } as FileItem;
          })}
          viewMode={viewMode}
          searchTerm={searchTerm}
          fileType={fileType}
          sortConfig={sortConfig}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onSelectItem={handleSelectItem}
          onEnterFolder={handleEnterFolder}
          onDeleteFolder={handleDeleteFolder}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onFilePreview={handleFilePreview}
          onContextMenu={handleContextMenu}
          onSort={key => setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
          }))}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* 頂部工具列 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex flex-wrap items-center justify-between gap-4">
        {/* 路徑導航 */}
        <div className="flex items-center space-x-2 flex-grow">
          <button
            onClick={handleGoBack}
            disabled={!parentPath}
            className={`p-2 rounded-lg ${
              parentPath
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
              onClick={() => setCurrentPath('')}
              className="hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
            >
              根目錄
            </button>
            
            {breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs.map((folder, index) => (
              <div key={index} className="flex items-center">
                <span className="mx-1">/</span>
                <button
                  onClick={() => setCurrentPath(folder)}
                  className="hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
                >
                  {folder.split('/').filter(Boolean).pop() || ''}
                </button>
              </div>
            )) : null}
          </div>
        </div>

        {/* 高級搜尋與篩選 */}
        <div className="flex-grow max-w-xl">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            fileType={fileType}
            onFileTypeChange={setFileType}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            sortConfig={sortConfig}
            onSortChange={key => setSortConfig(prevConfig => ({
              key,
              direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
            }))}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* 操作按鈕 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
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
          
          <button
            onClick={toggleMultiSelectMode}
            className={`p-2 rounded-lg ${
              multiSelectMode
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={multiSelectMode ? '關閉多選模式' : '開啟多選模式'}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
          
          <button
            onClick={handleUploadClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transform hover:scale-105 transition-all duration-200 
                     shadow-lg hover:shadow-xl flex items-center space-x-2 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>上傳</span>
          </button>
          
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 
                     rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 
                     transform hover:scale-105 transition-all duration-200 
                     shadow-md hover:shadow-lg flex items-center space-x-2 
                     focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <span>新增資料夾</span>
          </button>
        </div>
      </div>

      {/* 主要內容區 */}
      <div className={`flex-grow overflow-auto p-4 relative ${draggedOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
           onDragOver={() => setDraggedOver(true)}
           onDragLeave={() => setDraggedOver(false)}
           onDrop={() => setDraggedOver(false)}>
        
        {/* 拖放提示 */}
        {draggedOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 dark:bg-blue-900/30 backdrop-blur-sm z-10">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl text-center max-w-md transform scale-110 animate-pulse">
              <svg className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">拖放檔案以上傳</h3>
              <p className="text-gray-600 dark:text-gray-400">
                拖放您的檔案至此區域以開始上傳至目前資料夾
              </p>
            </div>
          </div>
        )}
        
        {renderFileList()}
      </div>

      {/* 狀態欄 */}
      <StatusBar
        selectedItems={selectedItems}
        totalItems={files.length + folders.length}
        totalSize={totalSize}
        uploadProgress={isUploading ? uploadProgress : undefined}
        currentOperation={currentOperation}
        storageQuota={storageQuota || undefined}
        isSearching={!!searchTerm || !!fileType || (dateRange[0] !== null || dateRange[1] !== null)}
      />

      {/* 檔案預覽 */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onShare={async () => {
            const url = await handleShare(previewFile.Key || '');
            navigator.clipboard.writeText(url);
            toast.success('分享連結已複製到剪貼簿');
          }}
          onVersions={async () => {
            // 版本歷史功能
            toast.info('版本歷史功能即將上線');
          }}
          onTag={(tags) => handleTag(previewFile.Key || '', tags)}
        />
      )}

      {/* 右鍵選單 */}
      {contextMenu && (
        <ContextMenu
          file={contextMenu.file}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onAction={handleContextMenuAction}
          availableActions={[
            'open', 'preview', 'download', 'share', 
            'rename', 'move', 'copy', 'delete', 
            'info', 'tag', 'star'
          ]}
        />
      )}

      {/* 刪除確認對話框 */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">確認刪除</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {itemToDelete?.type === 'folder' 
                ? '確定要刪除此資料夾及其所有內容嗎？此操作無法復原。' 
                : '確定要刪除此檔案嗎？此操作無法復原。'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 
                         rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增資料夾對話框 */}
      {isCreatingFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">新增資料夾</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="資料夾名稱"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600
                       mb-6"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 
                         rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                取消
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                建立
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 檔案重複處理對話框 */}
      {duplicateFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">檔案已存在</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              檔案 "{duplicateFile.file.name}" 已存在於目前資料夾中。請選擇處理方式：
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => handleDuplicateFile('replace')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-left"
              >
                取代現有檔案
              </button>
              <button
                onClick={() => handleDuplicateFile('keep-both')}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 
                         rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-left"
              >
                保留兩者 (重新命名為 "{duplicateFile.file.name.replace(/(\.[^.]+)?$/, ' (1)$1')}")
              </button>
              <button
                onClick={() => handleDuplicateFile('skip')}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 
                         rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-left"
              >
                跳過此檔案
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重命名對話框 */}
      {isRenamingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">重新命名</h3>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="新名稱"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600
                       mb-6"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsRenamingItem(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 
                         rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (fileInfoTarget) {
                    const oldPath = fileInfoTarget.Key || '';
                    const pathParts = oldPath.split('/');
                    pathParts.pop();
                    const newPath = [...pathParts, newItemName].join('/');
                    handleRename(oldPath, newPath);
                    setIsRenamingItem(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 檔案資訊面板 */}
      {showFileInfo && fileInfoTarget && (
        <FileInfo
          file={fileInfoTarget}
          onClose={handleCloseFileInfo}
          onTag={handleTagsChange}
          onRename={handleRenameFile}
          onMove={handleMoveFile}
          onShare={fileInfoTarget.type !== 'folder' ? handleShareFile : undefined}
        />
      )}

      {/* 移動檔案對話框 */}
      {showMoveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full shadow-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                移動{fileInfoTarget?.type === 'folder' ? '資料夾' : '檔案'}
              </h3>
              <button
                onClick={() => setShowMoveDialog(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              >
                <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <FolderSelector
              currentPath={currentPath}
              onPathChange={(path) => {
                if (fileInfoTarget) {
                  // 獲取源路徑
                  const sourcePath = fileInfoTarget.Key || '';
                  // 獲取檔案名
                  const fileName = sourcePath.split('/').pop() || '';
                  // 構建目標路徑
                  const targetPath = path + fileName;
                  
                  // 檢查是否嘗試移動到自身位置
                  if (sourcePath === targetPath) {
                    toast.info('檔案已在目標位置');
                  } else {
                    handleMove([sourcePath], targetPath);
                  }
                }
                setShowMoveDialog(false);
              }}
              recentFolders={recentFolders}
              excludePaths={fileInfoTarget?.type === 'folder' ? [fileInfoTarget.Key as string] : []}
              title={`選擇移動${fileInfoTarget?.type === 'folder' ? '資料夾' : '檔案'}的目標位置`}
            />
          </div>
        </div>
      )}

      {/* 上傳進度 */}
      {isUploading && (
        <UploadProgress 
          progress={uploadProgress} 
          fileName={uploadQueue[currentFileIndex]?.name}
          remainingFiles={totalFiles - currentFileIndex - 1}
          speed={uploadSpeed}
          remainingTime={estimatedTimeRemaining ?? undefined}
          onCancel={cancelUpload}
        />
      )}
    </div>
  );
}