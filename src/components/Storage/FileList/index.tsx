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
  onSelectAll: () => void;
  onEnterFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onDownload: (key: string, fileName: string) => Promise<void>;
  onDelete: (key: string) => void;
  onFilePreview: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, file: FileItem) => void;
  onSort: (key: string) => void;
  sortConfig?: {
    key: string;
    direction: string;
  };
  starredItems: FileItem[];
  isEmptyFolder?: boolean;
  onCreateFolder?: () => void;
  isRefreshing?: boolean;
}

// 默認列寬
const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  name: 300,         // 名稱列寬度
  type: 100,         // 類型列寬度
  size: 100,         // 大小列寬度
  lastModified: 180, // 日期列寬度
  modifier: 150,     // 修改者列寬度
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
  onSelectAll,
  onEnterFolder,
  onDeleteFolder,
  onDownload,
  onDelete,
  onFilePreview,
  onContextMenu,
  onSort,
  sortConfig = { key: 'lastModified', direction: 'desc' },
  starredItems,
  isEmptyFolder = false,
  onCreateFolder,
  isRefreshing = false
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const dropAreaRef = useRef<HTMLDivElement>(null);

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

  // 拖放區域事件處理
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 確保只有當滑鼠離開整個區域時才設置為 false
    if (dropAreaRef.current && !dropAreaRef.current.contains(e.relatedTarget as Node)) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    // 傳播 drop 事件到父元件，由 useUpload hook 處理
    const customEvent = new CustomEvent('file-drop', { 
      bubbles: true,
      detail: { files: e.dataTransfer.files }
    });
    dropAreaRef.current?.dispatchEvent(customEvent);
  };

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

  // 計算分頁後的檔案列表
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

  // 共用的視圖屬性
  const commonViewProps = {
    files: paginatedFiles,
    folders,
    currentPath,
    selectedItems,
    onSelectItem,
    onSelectAll,
    onEnterFolder,
    onDeleteFolder,
    onDownload,
    onDelete,
    onFilePreview,
    onContextMenu,
    isEmptyFolder,
    onCreateFolder,
    isRefreshing
  };

  let ViewComponent;
  if (viewMode === 'list') {
    ViewComponent = (
      <ListView
        {...commonViewProps}
        onSort={onSort}
        sortConfig={sortConfig}
        columnWidths={columnWidths}
        onColumnWidthChange={handleColumnWidthChange}
        multiSelectMode={selectedItems.size > 0}
      />
    );
  } else {
    ViewComponent = (
      <GridView
        {...commonViewProps}
        multiSelectMode={selectedItems.size > 0}
      />
    );
  }

  return (
    <div 
      ref={dropAreaRef}
      className={`relative w-full h-full min-h-[400px] rounded-xl 
                ${isDragActive ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 拖放提示覆蓋層 */}
      {isDragActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 backdrop-blur-sm rounded-xl z-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center transform transition-all duration-200 border-2 border-dashed border-blue-500">
            <div className="text-6xl mb-4">📥</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">放開以上傳檔案</h3>
            <p className="text-gray-600 dark:text-gray-400">檔案將上傳至當前資料夾</p>
          </div>
        </div>
      )}
      
      {/* 檔案列表或內嵌式空狀態 */}
      {ViewComponent}
    </div>
  );
};

export default FileList; 