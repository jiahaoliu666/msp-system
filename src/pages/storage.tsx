import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { testCORSConfiguration } from '@/services/storage/s3';

// 引入組件
import FileList from '@/components/Storage/FileList';
import EmptyState from '@/components/Storage/EmptyState';
import UploadProgress from '@/components/Storage/UploadProgress';
import StatusBar from '@/components/Storage/StatusBar';
import FilePreview from '@/components/Storage/FilePreview';
import ContextMenu from '@/components/Storage/ContextMenu';

// 引入 hooks
import { useFileManager } from '@/components/Storage/hooks/useFileManager';
import { useUpload } from '@/components/Storage/hooks/useUpload';
import { useFileOperations } from '@/components/Storage/hooks/useFileOperations';

export default function Storage() {
  // 狀態管理
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [isOnline, setIsOnline] = useState(true);

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
    loadFiles,
    handleRetry,
    handleEnterFolder,
    handleGoBack,
    handleSelectItem,
    handleSelectAll,
    setCurrentPath,
    setSelectedItems
  } = useFileManager();

  const {
    isUploading,
    uploadProgress,
    draggedOver,
    duplicateFile,
    onDrop,
    handleUploadClick,
    handleDuplicateFile,
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
    newFolderName,
    currentOperation,
    handleDownload,
    handleDelete,
    handleDeleteFolder,
    handleConfirmDelete,
    handleCreateFolder,
    handleFilePreview,
    handleContextMenu,
    handleContextMenuAction,
    setSelectedFile,
    setPreviewFile,
    setContextMenu,
    setIsDeleteConfirmOpen,
    setItemToDelete,
    setIsCreatingFolder,
    setNewFolderName,
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
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 檢查 CORS 設定
  useEffect(() => {
    const checkCORSConfig = async () => {
      try {
        await testCORSConfiguration();
      } catch (error) {
        console.error('CORS 設定檢查失敗:', error);
        toast.error('CORS 設定檢查失敗，部分功能可能無法使用');
      }
    };

    checkCORSConfig();
  }, []);

  // 排序處理
  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 渲染檔案列表或空狀態
  const renderFileList = () => {
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
          <div className="text-lg font-medium">{error}</div>
          <button 
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transform hover:scale-105 transition-all duration-200 
                     shadow-lg hover:shadow-xl flex items-center space-x-2 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>重試</span>
          </button>
        </div>
      );
    }

    if (files.length === 0 && folders.length === 0) {
      return (
        <EmptyState 
          type={searchTerm ? 'search' : 'folder'} 
          searchTerm={searchTerm} 
        />
      );
    }

    return (
      <div {...getRootProps({ className: 'outline-none' })}>
        <input {...getInputProps()} />
        <FileList
          files={files}
          folders={folders}
          currentPath={currentPath}
          selectedItems={selectedItems}
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
          onSort={handleSort}
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
            
            {currentPath.split('/').filter(Boolean).map((folder, index, array) => (
              <div key={index} className="flex items-center">
                <span className="mx-1">/</span>
                <button
                  onClick={() => {
                    const path = array.slice(0, index + 1).join('/') + '/';
                    setCurrentPath(path);
                  }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
                >
                  {folder}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 搜尋欄 */}
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="搜尋檔案..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
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
      <div className={`flex-grow overflow-auto p-4 ${draggedOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
           onDragOver={() => setDraggedOver(true)}
           onDragLeave={() => setDraggedOver(false)}
           onDrop={() => setDraggedOver(false)}>
        {renderFileList()}
      </div>

      {/* 狀態欄 */}
      <StatusBar
        selectedItems={selectedItems}
        totalItems={files.length + folders.length}
        totalSize={totalSize}
        uploadProgress={isUploading ? uploadProgress : undefined}
        currentOperation={currentOperation}
      />

      {/* 檔案預覽 */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
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

      {/* 上傳進度 */}
      {isUploading && <UploadProgress progress={uploadProgress} />}
    </div>
  );
}