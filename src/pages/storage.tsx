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
  fileType: string;
  dateRange: [Date | null, Date | null];
  sortConfig: { key: string; direction: string };
  multiSelectMode: boolean;
  onGoBack: () => void;
  onSetCurrentPath: (path: string) => void;
  onSetViewMode: (mode: 'list' | 'grid') => void;
  onSearchChange: (term: string) => void;
  onFileTypeChange: (type: string) => void;
  onDateRangeChange: (range: [Date | null, Date | null]) => void;
  onSortChange: (key: string) => void;
  onClearFilters: () => void;
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
  fileType,
  dateRange,
  sortConfig,
  multiSelectMode,
  onGoBack,
  onSetCurrentPath,
  onSetViewMode,
  onSearchChange,
  onFileTypeChange,
  onDateRangeChange,
  onSortChange,
  onClearFilters,
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
              onClick={() => onSetCurrentPath('')}
              className="hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
            >
              根目錄
            </button>
            
            {breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs.map((folder, index) => (
              <div key={index} className="flex items-center">
                <span className="mx-1">/</span>
                <button
                  onClick={() => onSetCurrentPath(folder)}
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
            onSearchChange={onSearchChange}
            fileType={fileType}
            onFileTypeChange={onFileTypeChange}
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            sortConfig={sortConfig}
            onSortChange={onSortChange}
            onClearFilters={onClearFilters}
          />
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
          
          <button
            onClick={onToggleMultiSelectMode}
            className={`p-2 rounded-lg ${
              multiSelectMode
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="多選模式"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
          
          <button
            onClick={onCreateFolder}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="新建資料夾"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          
          <button
            onClick={onUploadClick}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="上傳檔案"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L7 8m4-4v12" />
            </svg>
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
  const [error, setError] = useState<string | null>(null);

  // 使用自定義 hooks
  const {
    files,
    folders,
    isLoading,
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

  // 定義切換項目選擇函數
  const toggleItemSelection = (itemKey: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemKey)) {
      newSelected.delete(itemKey);
    } else {
      newSelected.add(itemKey);
    }
    setSelectedItems(newSelected);
  };

  // 渲染檔案列表或空狀態
  const renderFileList = () => {
    // 如果檔案正在加載
    if (isLoading) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    // 如果發生錯誤
    if (error) {
      return (
        <EmptyState 
          type="error" 
          errorMessage={error} 
          onRetry={handleRetry}
          onCreateFolder={() => setIsCreatingFolder(true)}
        />
      );
    }

    // 如果正在搜尋但沒有結果
    if (searchTerm && folders.length === 0 && files.length === 0) {
      return (
        <EmptyState 
          type="search" 
          searchTerm={searchTerm} 
          onClearFilter={handleClearFilters}
          onCreateFolder={() => setIsCreatingFolder(true)}
        />
      );
    }

    // 如果存在篩選條件但沒有結果
    if ((fileType || dateRange[0] !== null || dateRange[1] !== null) && folders.length === 0 && files.length === 0) {
      return (
        <EmptyState 
          type="filter" 
          filterType={fileType || '日期範圍'} 
          onClearFilter={handleClearFilters}
          onCreateFolder={() => setIsCreatingFolder(true)}
        />
      );
    }

    // 如果資料夾為空（沒有檔案也沒有資料夾）
    if (folders.length === 0 && files.length === 0) {
      return (
        <EmptyState 
          type="folder" 
          onCreateFolder={() => setIsCreatingFolder(true)}
        />
      );
    }

    // 渲染網格視圖或列表視圖
    if (viewMode === 'grid') {
      return (
        <GridView
          folders={folders}
          files={files}
          selectedItems={selectedItems}
          multiSelectMode={multiSelectMode}
          itemsPerPage={itemsPerPage}
          onSelectItem={toggleItemSelection}
          onEnterFolder={handleEnterFolder}
          onDeleteFolder={handleDeleteFolder}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onFilePreview={handleFilePreview}
          onContextMenu={handleContextMenu}
          onSort={(key: string) => setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
          }))}
        />
      );
    } else {
      return (
        <ListView
          folders={folders}
          files={files}
          selectedItems={selectedItems}
          multiSelectMode={multiSelectMode}
          sortConfig={sortConfig}
          itemsPerPage={itemsPerPage}
          onSelectItem={toggleItemSelection}
          onEnterFolder={handleEnterFolder}
          onDeleteFolder={handleDeleteFolder}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onFilePreview={handleFilePreview}
          onContextMenu={handleContextMenu}
          onSort={(key: string) => setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
          }))}
        />
      );
    }
  };

  return (
    <FileManagerLayout
      currentPath={currentPath}
      parentPath={parentPath}
      breadcrumbs={breadcrumbs}
      viewMode={viewMode}
      searchTerm={searchTerm}
      fileType={fileType}
      dateRange={dateRange}
      sortConfig={sortConfig}
      multiSelectMode={multiSelectMode}
      onGoBack={handleGoBack}
      onSetCurrentPath={setCurrentPath}
      onSetViewMode={setViewMode}
      onSearchChange={setSearchTerm}
      onFileTypeChange={setFileType}
      onDateRangeChange={setDateRange}
      onSortChange={key => setSortConfig(prevConfig => ({
        key,
        direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
      }))}
      onClearFilters={handleClearFilters}
      onToggleMultiSelectMode={toggleMultiSelectMode}
      onCreateFolder={() => setIsCreatingFolder(true)}
      onUploadClick={handleUploadClick}
    >
      {renderFileList()}
    </FileManagerLayout>
  );
}