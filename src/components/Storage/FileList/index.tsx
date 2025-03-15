import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileItem, FolderItem, ColumnWidths } from '@/components/storage/types';
import { formatFileSize, formatDateTime, getFileTypeIcon } from '@/services/storage/s3';
import GridView from '@/components/storage/FileList/GridView';
import ListView from '@/components/storage/FileList/ListView';
import EmptyState from '../EmptyState';

interface FileListProps {
  files: FileItem[];
  folders: FolderItem[];
  currentPath: string;
  selectedItems: Set<string>;
  viewMode: 'list' | 'grid';
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  onSelectItem: (key: string) => void;
  onEnterFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onDownload: (key: string, fileName: string) => Promise<void>;
  onDelete: (key: string) => void;
  onFilePreview: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, file: FileItem) => void;
  onSort: (key: string) => void;
  starredItems: FileItem[];
  isEmptyFolder?: boolean;
  onCreateFolder?: () => void;
}

// 默認列寬
const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  name: 250,         // 名稱列寬度
  type: 100,         // 類型列寬度
  size: 100,         // 大小列寬度
  lastModified: 160, // 日期列寬度
  actions: 100,      // 操作列寬度
};

const STORAGE_KEY = 'fileListColumnWidths';

const FileList: React.FC<FileListProps> = ({
  files,
  folders,
  currentPath,
  selectedItems,
  viewMode,
  searchTerm,
  currentPage,
  itemsPerPage,
  onSelectItem,
  onEnterFolder,
  onDeleteFolder,
  onDownload,
  onDelete,
  onFilePreview,
  onContextMenu,
  onSort,
  starredItems,
  isEmptyFolder = false,
  onCreateFolder
}) => {
  // 欄位寬度狀態
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(DEFAULT_COLUMN_WIDTHS);
  const columnWidthsRef = useRef<ColumnWidths>(DEFAULT_COLUMN_WIDTHS);
  
  // 從本地存儲加載保存的欄位寬度設置
  useEffect(() => {
    try {
      const savedWidths = localStorage.getItem('fileList-columnWidths');
      console.log('加載保存的欄位寬度:', savedWidths);
      
      if (savedWidths) {
        const parsed = JSON.parse(savedWidths);
        setColumnWidths(parsed);
        columnWidthsRef.current = parsed;
      }
    } catch (e) {
      console.error('無法解析保存的欄位寬度', e);
    }
  }, []);

  // 處理欄位寬度變更
  const handleColumnWidthChange = useCallback((column: keyof ColumnWidths, width: number) => {
    console.log(`調整 ${column} 欄寬為: ${width}px`);
    
    // 更新引用值，用於即時調整
    columnWidthsRef.current = { 
      ...columnWidthsRef.current, 
      [column]: width 
    };
    
    // 更新狀態
    setColumnWidths(prev => {
      const newWidths = { ...prev, [column]: width };
      
      // 保存到本地存儲
      localStorage.setItem('fileList-columnWidths', JSON.stringify(newWidths));
      
      return newWidths;
    });
  }, []);

  // 重設欄位寬度
  const handleResetColumnWidths = useCallback(() => {
    console.log('重置欄位寬度到默認值');
    
    // 更新引用和狀態
    columnWidthsRef.current = DEFAULT_COLUMN_WIDTHS;
    setColumnWidths(DEFAULT_COLUMN_WIDTHS);
    
    // 清除本地存儲
    localStorage.removeItem('fileList-columnWidths');
  }, []);

  // 檔案篩選與排序
  const filteredFiles = files
    .filter(file => {
      const fileName = file.Key?.toLowerCase() || '';
      const searchMatch = fileName.includes(searchTerm.toLowerCase());
      return searchMatch;
    })
    .sort((a, b) => {
      return (a.Key || '').localeCompare(b.Key || '');
    });

  // 分頁處理
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 根據視圖模式顯示不同的檔案列表
  return (
    <>
      {viewMode === 'grid' ? (
        <div>
          {isEmptyFolder ? (
            <GridView
              folders={[]}
              files={[]}
              currentPath={currentPath}
              selectedItems={selectedItems}
              onSelectItem={onSelectItem}
              onEnterFolder={onEnterFolder}
              onDeleteFolder={onDeleteFolder}
              onDownload={onDownload}
              onDelete={onDelete}
              onFilePreview={onFilePreview}
              onContextMenu={onContextMenu}
              isEmptyFolder={true}
            />
          ) : (
            <GridView
              folders={folders}
              files={paginatedFiles}
              currentPath={currentPath}
              selectedItems={selectedItems}
              onSelectItem={onSelectItem}
              onEnterFolder={onEnterFolder}
              onDeleteFolder={onDeleteFolder}
              onDownload={onDownload}
              onDelete={onDelete}
              onFilePreview={onFilePreview}
              onContextMenu={onContextMenu}
            />
          )}
        </div>
      ) : (
        <div>
          {isEmptyFolder ? (
            <>
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleResetColumnWidths}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>重置欄位寬度</span>
                </button>
              </div>
              <ListView
                folders={[]}
                files={[]}
                currentPath={currentPath}
                selectedItems={selectedItems}
                sortConfig={{ key: 'name', direction: 'asc' }}
                onSelectItem={onSelectItem}
                onEnterFolder={onEnterFolder}
                onDeleteFolder={onDeleteFolder}
                onDownload={onDownload}
                onDelete={onDelete}
                onFilePreview={onFilePreview}
                onContextMenu={onContextMenu}
                onSort={onSort}
                columnWidths={columnWidths}
                onColumnWidthChange={handleColumnWidthChange}
                isEmptyFolder={true}
              />
            </>
          ) : (
            <>
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleResetColumnWidths}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>重置欄位寬度</span>
                </button>
              </div>
              <ListView
                folders={folders}
                files={paginatedFiles}
                currentPath={currentPath}
                selectedItems={selectedItems}
                sortConfig={{ key: 'name', direction: 'asc' }}
                onSelectItem={onSelectItem}
                onEnterFolder={onEnterFolder}
                onDeleteFolder={onDeleteFolder}
                onDownload={onDownload}
                onDelete={onDelete}
                onFilePreview={onFilePreview}
                onContextMenu={onContextMenu}
                onSort={onSort}
                columnWidths={columnWidths}
                onColumnWidthChange={handleColumnWidthChange}
              />
            </>
          )}
        </div>
      )}
    </>
  );
};

export default FileList; 