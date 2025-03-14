import { useState } from 'react';
import { FileInfoProps, FileItem, FolderItem } from '../types';
import TagManager from '../TagManager';
import { formatFileSize, formatDateTime } from '@/services/storage/s3';

const FileInfo: React.FC<FileInfoProps> = ({
  file,
  onClose,
  onTag,
  onRename,
  onMove,
  onShare
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'tags'>('info');
  
  // 獲取檔案類型圖標
  const getFileIcon = () => {
    const type = file.type.toLowerCase();
    
    if (file.type === 'folder') {
      return (
        <svg className="h-12 w-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
    }
    
    if (type.includes('image')) {
      return (
        <svg className="h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    
    if (type.includes('document') || type.includes('text') || type.includes('pdf')) {
      return (
        <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    
    if (type.includes('video')) {
      return (
        <svg className="h-12 w-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      );
    }
    
    if (type.includes('audio')) {
      return (
        <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    }
    
    // 預設圖標
    return (
      <svg className="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  // 獲取檔案名稱
  const getFileName = () => {
    if (file.type === 'folder') {
      return (file as FolderItem).name;
    }
    return (file as FileItem).Key?.split('/').pop() || '';
  };

  // 獲取上層資料夾
  const getParentFolder = () => {
    if (file.type === 'folder') {
      return (file as FolderItem).Key?.split('/').slice(0, -2).join('/') || '根目錄';
    }
    const pathParts = (file as FileItem).Key?.split('/') || [];
    if (pathParts.length <= 1) return '根目錄';
    return pathParts.slice(0, -1).join('/') || '根目錄';
  };

  // 獲取檔案大小
  const getFileSize = () => {
    if (file.type === 'folder') {
      return formatFileSize((file as FolderItem).size);
    }
    return (file as FileItem).Size !== undefined ? formatFileSize((file as FileItem).Size as number) : '未知';
  };

  // 獲取修改日期
  const getLastModified = () => {
    if (file.type === 'folder') {
      return formatDateTime((file as FolderItem).lastModified);
    }
    return (file as FileItem).LastModified ? formatDateTime((file as FileItem).LastModified as Date) : '未知';
  };

  // 確認是否有版本ID (只有檔案才有)
  const hasVersionId = () => {
    return file.type !== 'folder' && (file as FileItem).versionId !== undefined;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* 頂部欄 */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            檔案資訊
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          >
            <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 標籤頁 */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 text-sm font-medium flex-1 ${
              activeTab === 'info'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            基本資訊
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-4 py-2 text-sm font-medium flex-1 ${
              activeTab === 'tags'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            標籤管理
          </button>
        </div>

        {/* 內容區 */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* 檔案圖標和名稱 */}
              <div className="flex items-center">
                {getFileIcon()}
                <div className="ml-4 flex-1 min-w-0">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                    {getFileName()}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {file.type === 'folder' ? '資料夾' : file.type}
                  </p>
                </div>
                
                {file.isStarred && (
                  <span className="text-yellow-500">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </span>
                )}
              </div>

              {/* 檔案詳細資訊 */}
              <div className="grid grid-cols-1 gap-3 mt-4">
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">位置</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {getParentFolder()}
                  </span>
                </div>
                
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">大小</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {getFileSize()}
                  </span>
                </div>
                
                <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">修改日期</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {getLastModified()}
                  </span>
                </div>
                
                {file.type === 'folder' && (
                  <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">項目數量</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {(file as FolderItem).children || '未知'}
                    </span>
                  </div>
                )}
                
                {hasVersionId() && (
                  <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">版本 ID</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {(file as FileItem).versionId}
                    </span>
                  </div>
                )}
              </div>

              {/* 標籤面板 (簡要顯示) */}
              {file.tags && file.tags.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">標籤</h5>
                  <div className="flex flex-wrap gap-2">
                    {file.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 
                               rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="py-2">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">管理標籤</h5>
              <TagManager
                tags={file.tags || []}
                onTagsChange={(tags) => onTag(tags)}
                availableTags={[]}
              />
            </div>
          )}
        </div>

        {/* 底部操作區 */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between">
          <div className="flex space-x-2">
            <button
              onClick={onRename}
              className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 
                     border border-gray-300 dark:border-gray-600 rounded-md text-sm
                     hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              重新命名
            </button>
            
            <button
              onClick={onMove}
              className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 
                     border border-gray-300 dark:border-gray-600 rounded-md text-sm
                     hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              移動
            </button>
          </div>
          
          {onShare && (
            <button
              onClick={() => onShare()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              分享
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileInfo; 