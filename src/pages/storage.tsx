import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { testCORSConfiguration, getStorageQuota, reinitializeS3Client, checkS3Connection } from '@/services/storage/s3';
import { AWS_CONFIG } from '@/config/aws-config';
import { S3_CONFIG } from '@/config/s3-config';

// 引入組件
import FileList from '@/components/storage/FileList';
import EmptyState from '../components/storage/EmptyState';
import UploadProgress from '@/components/storage/UploadProgress';
import StatusBar from '@/components/storage/StatusBar';
import ContextMenu from '@/components/storage/ContextMenu';
import SearchFilter from '@/components/storage/SearchFilter';

// 引入 hooks
import { useFileManager } from '@/components/storage/hooks/useFileManager';
import { useUpload } from '@/components/storage/hooks/useUpload';
import { useFileOperations } from '@/components/storage/hooks/useFileOperations';
import { FileFilters, FileItem, FolderItem } from '@/components/storage/types';

// 排序配置接口
interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// 導入相關元件
import LoadingSpinner from '../components/common/LoadingSpinner';
import GridView from '../components/storage/FileList/GridView';
import ListView from '../components/storage/FileList/ListView';

interface FileManagerLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  parentPath: string | null;
  breadcrumbs: string[];
  viewMode: 'list' | 'grid';
  searchTerm: string;
  multiSelectMode: boolean;
  selectedItemsCount: number;
  totalObjects: number;
  onGoBack: () => void;
  onSetCurrentPath: (path: string) => void;
  onSetViewMode: (mode: 'list' | 'grid') => void;
  onSearchChange: (term: string) => void;
  onToggleMultiSelectMode: () => void;
  onCreateFolder: () => void;
  onUploadClick: () => void;
  onRefresh: () => void;
}

// 自定義的檔案管理器布局組件
const FileManagerLayout: React.FC<FileManagerLayoutProps> = ({
  children,
  currentPath,
  parentPath,
  breadcrumbs,
  viewMode,
  searchTerm,
  multiSelectMode,
  selectedItemsCount,
  totalObjects,
  onGoBack,
  onSetCurrentPath,
  onSetViewMode,
  onSearchChange,
  onToggleMultiSelectMode,
  onCreateFolder,
  onUploadClick,
  onRefresh
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* 頂部工具列 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex flex-wrap items-center justify-between gap-4">
        {/* 返回按鈕、標題和多選操作按鈕區域 */}
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

          {/* 標題 - 移至此處 */}
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">物件 ({totalObjects})</span>
            <span className="mx-1">|</span>
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
          
          {/* 多選操作工具列 */}
          {multiSelectMode && (
            <div className="flex items-center space-x-2">
              {/* 主要操作按鈕組 */}
              <div className="flex items-center space-x-2 mr-4">
                <button 
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md 
                           text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                           focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  title="下載選中項目"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  下載
                </button>
                
                <button 
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium 
                           rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none 
                           focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
                  title="加入我的最愛"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  加入最愛
                </button>
              </div>

              {/* 次要操作按鈕組 */}
              <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-gray-700 pl-4">
                <button 
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 
                           text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 
                           bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                           transition-colors duration-200"
                  title="移動到其他資料夾"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  移動至
                </button>

                <button 
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 
                           text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 
                           bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                           transition-colors duration-200"
                  title="複製到其他資料夾"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  複製至
                </button>

                <button 
                  className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 
                           text-sm font-medium rounded-md text-red-700 dark:text-red-300 
                           bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 
                           transition-colors duration-200"
                  title="刪除選中項目"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  刪除
                </button>
              </div>

              {/* 取消選擇按鈕 */}
              <button
                onClick={onToggleMultiSelectMode}
                className="ml-2 p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 
                         dark:hover:text-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-blue-500 rounded-full 
                         transition-colors duration-200"
                title="取消選擇"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 高級搜尋與篩選 */}
        <div className="flex-grow max-w-xl flex items-center">
          <div className="flex-grow">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              onRefresh={onRefresh}
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
    handleCreateFolder,
    isDeleteConfirmOpen,
    itemToDelete,
    handleConfirmDelete,
    setIsDeleteConfirmOpen,
    setItemToDelete,
    isCreatingFolder,
    newFolderName,
    setIsCreatingFolder,
    setNewFolderName
  } = useFileOperations(currentPath, loadFiles);

  // 創建一個文件input引用，用於上傳功能
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // 文件上傳鉤子
  const {
    isUploading,
    uploadProgress,
    duplicateFile,
    handleUploadClick: originalHandleUploadClick,
    handleDuplicateFile,
    getRootProps,
    getInputProps,
    draggedOver,
    setDraggedOver,
    onDrop
  } = useUpload(currentPath, files, loadFiles);

  // 替換上傳點擊處理函數
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 處理文件選擇
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      onDrop(Array.from(selectedFiles));
    }
    // 重置 input 值，允許再次選擇相同檔案
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 狀態管理
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [filters, setFilters] = useState<FileFilters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'lastModified', direction: 'desc' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 計算總頁數
  const totalItems = filteredItems.files.length + filteredItems.folders.length;
  const totalFiles = filteredItems.files.length;
  const totalFolders = filteredItems.folders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // 檢查是否為空文件夾
  const isEmptyFolder = folders.length === 0 && files.length === 0;
  
  // 計算總物件數量
  const totalObjects = folders.length + files.length;

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

  // 選擇項目
  const handleSelectItem = (key: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedItems(newSelected);
  };

  // 全選/取消全選功能
  const handleSelectAll = () => {
    if (selectedItems.size === folders.length + files.length) {
      // 如果全部已選，則取消全選
      setSelectedItems(new Set());
    } else {
      // 否則全選
      const allItems = new Set<string>();
      // 添加所有資料夾
      folders.forEach(folder => {
        allItems.add(folder.name);
      });
      // 添加所有檔案
      files.forEach(file => {
        if (file.Key) {
          allItems.add(file.Key);
        }
      });
      setSelectedItems(allItems);
    }
  };

  // 搜尋函數
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };
  
  // 處理排序
  const onSort = (config: SortConfig) => {
    setSortConfig(config);
  };
  
  // 排序函數
  const handleSort = (key: string) => {
    // 實現排序邏輯
    if (sortConfig.key === key) {
      // 如果已經按照這個key排序，切換排序方向
      onSort({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // 如果是新的排序key，默認使用desc排序（最新到最舊）
      onSort({
        key,
        direction: 'desc'
      });
    }
  };

  // 添加刷新函數處理
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadFiles();
    } finally {
      // 無論成功或失敗，延遲一小段時間後再隱藏載入效果，提供更好的用戶體驗
      setTimeout(() => {
        setIsRefreshing(false);
      }, 800);
    }
  };

  // 自定義處理創建資料夾的函數，確保在UI中打開創建資料夾的對話框
  const handleCreateFolderClick = () => {
    setIsCreatingFolder(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {/* 檔案管理功能區塊 */}
          <FileManagerLayout
            currentPath={currentPath}
            parentPath={parentPath}
            breadcrumbs={breadcrumbs}
            viewMode={viewMode}
            searchTerm={searchTerm}
            multiSelectMode={selectedItems.size > 0}
            selectedItemsCount={selectedItems.size}
            totalObjects={totalObjects}
            onGoBack={handleGoBack}
            onSetCurrentPath={setCurrentPath}
            onSetViewMode={setViewMode}
            onSearchChange={handleSearch}
            onToggleMultiSelectMode={() => setSelectedItems(new Set())}
            onCreateFolder={handleCreateFolderClick}
            onUploadClick={handleUploadClick}
            onRefresh={handleRefresh}
          >
            {/* 隱藏的檔案上傳輸入框 */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileInputChange}
            />
            
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
              
              {/* 拖放覆蓋層 */}
              {draggedOver && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-10 border-2 border-blue-500 border-dashed rounded-lg">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl text-center">
                    <div className="text-blue-500 text-5xl mb-4">
                      <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">拖放檔案以上傳</h3>
                    <p className="text-gray-600 dark:text-gray-400">釋放滑鼠以開始上傳</p>
                  </div>
                </div>
              )}
              
              {/* 當有重複檔案時顯示確認對話框 */}
              {duplicateFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">檔案已存在</h3>
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      檔案「{duplicateFile.file.name}」已存在，請選擇操作:
                    </p>
                    <div className="flex flex-col space-y-2">
                      <button 
                        onClick={() => handleDuplicateFile('replace')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        替換現有檔案
                      </button>
                      <button 
                        onClick={() => handleDuplicateFile('keep-both')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        保留兩者 (使用新檔名)
                      </button>
                      <button 
                        onClick={() => handleDuplicateFile('skip')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        跳過此檔案
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 檔案列表顯示 */}
              <FileList
                files={filteredItems.files}
                folders={filteredItems.folders}
                currentPath={currentPath}
                selectedItems={selectedItems}
                viewMode={viewMode}
                searchTerm={searchTerm}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onSelectItem={handleSelectItem}
                onSelectAll={handleSelectAll}
                onEnterFolder={handleEnterFolder}
                onDeleteFolder={handleDeleteFolder}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onFilePreview={handleFilePreview}
                onContextMenu={handleContextMenu}
                onSort={handleSort}
                sortConfig={sortConfig}
                starredItems={[]}
                isEmptyFolder={isEmptyFolder}
                onCreateFolder={handleCreateFolder}
                isRefreshing={isRefreshing}
              />
            </div>
          </FileManagerLayout>
        </div>
      </div>

      {/* 刪除確認對話框 */}
      {isDeleteConfirmOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">確認刪除</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {itemToDelete.type === 'folder' && !itemToDelete.isEmpty ? (
                <>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-red-600 dark:text-red-400 font-medium">無法刪除非空資料夾</span>
                    </div>
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      請先刪除資料夾內的所有檔案後再嘗試刪除該資料夾。
                    </p>
                  </div>
                </>
              ) : (
                <>您確定要刪除此{itemToDelete.type === 'folder' ? '資料夾' : '檔案'}嗎？此操作無法撤銷。</>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
                         transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                關閉
              </button>
              {!(itemToDelete.type === 'folder' && !itemToDelete.isEmpty) && (
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                           transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  確認刪除
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 新增資料夾對話框 */}
      {isCreatingFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">新增資料夾</h3>
            <div className="mb-4">
              <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                資料夾名稱
              </label>
              <input
                type="text"
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700
                         text-gray-900 dark:text-white"
                placeholder="請輸入資料夾名稱"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
                         transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                取消
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                創建
              </button>
            </div>
          </div>
        </div>
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