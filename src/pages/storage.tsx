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
  // UI狀態
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // 狀態管理
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

  // 應用篩選條件
  useEffect(() => {
    try {
      const filters: FileFilters = {
        searchTerm,
        fileTypes: undefined,
        dateRange: undefined,
        sortBy: 'name',
        sortDirection: 'asc'
      };
      
      applyFilters(filters);
    } catch (err) {
      console.error("篩選檔案時發生錯誤:", err);
      toast.error("過濾檔案時發生錯誤，請重試");
    }
  }, [searchTerm, applyFilters]);

  // 處理清除篩選條件
  const handleClearFilters = () => {
    setSearchTerm('');
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

  // 處理項目選擇
  const toggleItemSelection = (itemKey: string) => {
    handleSelectItem(itemKey);
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
        onSelectItem={toggleItemSelection}
        onEnterFolder={handleEnterFolder}
        onDeleteFolder={handleDeleteFolder}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onFilePreview={handleFilePreview}
        onContextMenu={handleContextMenu}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onSort={() => {}}
        starredItems={[]}
        isEmptyFolder={folders.length === 0 && files.length === 0}
        onCreateFolder={() => setIsCreatingFolder(true)}
      />
    );
  };

  return (
    <FileManagerLayout
      currentPath={currentPath}
      parentPath={parentPath}
      breadcrumbs={breadcrumbs}
      viewMode={viewMode}
      searchTerm={searchTerm}
      multiSelectMode={multiSelectMode}
      onGoBack={handleGoBack}
      onSetCurrentPath={setCurrentPath}
      onSetViewMode={setViewMode}
      onSearchChange={setSearchTerm}
      onToggleMultiSelectMode={toggleMultiSelectMode}
      onCreateFolder={() => setIsCreatingFolder(true)}
      onUploadClick={handleUploadClick}
    >
      {renderFileList()}
    </FileManagerLayout>
  );
}