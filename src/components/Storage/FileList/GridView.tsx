import React from 'react';
import { FileItem, FolderItem } from '@/components/storage/types';
import { formatFileSize, getFileTypeIcon } from '@/services/storage/s3';
import { formatFolderItemCount } from '@/config/s3-config';
import EmptyState from '../EmptyState';

interface GridViewProps {
  folders: FolderItem[];
  files: FileItem[];
  currentPath?: string;
  selectedItems: Set<string>;
  multiSelectMode?: boolean;
  itemsPerPage?: number;
  onSelectItem: (key: string) => void;
  onEnterFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onDownload: (key: string, fileName: string) => Promise<void>;
  onDelete: (key: string) => void;
  onFilePreview: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, file: FileItem | FolderItem) => void;
  onSort?: (key: string) => void;
  isEmptyFolder?: boolean;
  onCreateFolder?: () => void;
  isRefreshing?: boolean;
}

const GridView: React.FC<GridViewProps> = ({
  folders,
  files,
  currentPath,
  selectedItems,
  multiSelectMode,
  itemsPerPage,
  onSelectItem,
  onEnterFolder,
  onDeleteFolder,
  onDownload,
  onDelete,
  onFilePreview,
  onContextMenu,
  isEmptyFolder,
  onCreateFolder,
  isRefreshing = false
}) => {
  // 獲取S3直接URL的函數
  const getFilePreviewUrl = (fileKey: string): string => {
    // 使用 AWS SDK v3 的方式構建 S3 對象直接 URL
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'metaage-msp-bucket';
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-northeast-1';
    const encodedKey = encodeURIComponent(fileKey);
    
    // 構建 S3 直接URL
    return `https://${bucketName}.s3.${region}.amazonaws.com/${encodedKey}`;
  };
  
  // 處理檔案點擊
  const handleFileClick = (fileKey: string, event: React.MouseEvent) => {
    // 如果是多選模式，則調用選擇函數
    if (multiSelectMode) {
      onSelectItem(fileKey);
      return;
    }
    
    // 如果是點擊操作按鈕區域，則不進行預覽
    const target = event.target as HTMLElement;
    if (target.closest('.action-button-always-visible')) {
      return;
    }
    
    // 在新標籤頁中打開 S3 直接鏈接
    const url = getFilePreviewUrl(fileKey);
    window.open(url, '_blank');
  };
  
  if (isEmptyFolder) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-6">
        <EmptyState 
          type="folder" 
          onCreateFolder={onCreateFolder}
          isLoading={isRefreshing}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {folders.map((folder: FolderItem, index: number) => (
        <div
          key={`folder-${index}`}
          className="relative group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                   dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 
                   hover:shadow-md transition-all duration-200"
          onContextMenu={(e) => onContextMenu(e, folder)}
        >
          <div className="p-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center text-4xl mb-3 
                            text-blue-600 dark:text-blue-400">
                📁
              </div>
              <div className="w-full">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 
                              mb-1 text-center truncate" title={folder.name}>
                  {folder.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {formatFolderItemCount(folder.children || 0)}
                </div>
              </div>
            </div>
            <div className="absolute top-2 right-2 opacity-100 z-20 action-button-always-visible">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if(window.confirm(`確定要刪除資料夾 "${folder.name}" 嗎？`)) {
                    onDeleteFolder(folder.name);
                  }
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                         text-gray-500 dark:text-gray-400 hover:text-red-600 
                         dark:hover:text-red-400 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <button
            onClick={() => onEnterFolder(folder.name)}
            className="absolute inset-0 w-full h-full cursor-pointer z-10"
          />
        </div>
      ))}
      {files.map((file: FileItem, index: number) => {
        const fileKey: string = file.Key || '';
        const fileName: string = file.displayName || 
          (fileKey ? fileKey.split('/').pop() || fileKey : '');
        
        return (
          <div
            key={`file-${index}`}
            className={`relative group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                      dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 
                      hover:shadow-md transition-all duration-200 ${
                        selectedItems.has(fileKey) ? 'ring-2 ring-blue-500' : ''
                      }`}
            onClick={(e) => handleFileClick(fileKey, e)}
            onContextMenu={(e) => onContextMenu(e, file)}
          >
            <div className="p-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 flex items-center justify-center text-4xl mb-3">
                  {getFileTypeIcon(fileKey)}
                </div>
                <div className="w-full">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 
                                mb-1 text-center truncate" title={fileName}>
                    {fileName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {formatFileSize(file.Size || 0)}
                  </div>
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-100 z-20 action-button-always-visible">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm(`確定要刪除檔案 "${fileName}" 嗎？`)) {
                      onDelete(fileKey);
                    }
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                           text-gray-500 dark:text-gray-400 hover:text-red-600 
                           dark:hover:text-red-400 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GridView; 