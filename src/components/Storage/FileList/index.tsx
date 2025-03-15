import React, { useState, useEffect } from 'react';
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
  fileType: string;
  sortConfig: {
    key: string;
    direction: string;
  };
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
  fileType,
  sortConfig,
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
  starredItems
}) => {
  // 欄位寬度狀態
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(DEFAULT_COLUMN_WIDTHS);
  
  // 本地存儲欄位寬度，持久化用戶設置
  useEffect(() => {
    // 從本地存儲加載保存的欄位寬度設置
    const savedWidths = localStorage.getItem('fileList-columnWidths');
    if (savedWidths) {
      try {
        const parsed = JSON.parse(savedWidths);
        setColumnWidths(parsed);
      } catch (e) {
        console.error('無法解析保存的欄位寬度', e);
      }
    }
  }, []);

  // 處理欄位寬度變更
  const handleColumnWidthChange = (column: keyof ColumnWidths, width: number) => {
    const newWidths = { ...columnWidths, [column]: width };
    setColumnWidths(newWidths);
    
    // 保存到本地存儲
    localStorage.setItem('fileList-columnWidths', JSON.stringify(newWidths));
  };

  // 重設欄位寬度
  const handleResetColumnWidths = () => {
    setColumnWidths(DEFAULT_COLUMN_WIDTHS);
    localStorage.removeItem('fileList-columnWidths');
  };

  // 檔案篩選與排序
  const filteredFiles = files
    .filter(file => {
      const fileName = file.Key?.toLowerCase() || '';
      const searchMatch = fileName.includes(searchTerm.toLowerCase());
      const typeMatch = !fileType || file.type === fileType;
      return searchMatch && typeMatch;
    })
    .sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      switch (sortConfig.key) {
        case 'name':
          return direction * (a.Key || '').localeCompare(b.Key || '');
        case 'date':
          return direction * ((b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0));
        case 'size':
          return direction * ((b.Size || 0) - (a.Size || 0));
        case 'type':
          return direction * (a.type || '').localeCompare(b.type || '');
        default:
          return 0;
      }
    });

  // 分頁處理
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 根據視圖模式顯示不同的檔案列表
  return (
    <>
      {((folders.length === 0 && files.length === 0) || filteredFiles.length === 0) ? (
        <EmptyState 
          type={searchTerm ? 'search' : 'folder'} 
          searchTerm={searchTerm} 
        />
      ) : viewMode === 'grid' ? (
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
      ) : (
        <ListView
          folders={folders}
          files={paginatedFiles}
          currentPath={currentPath}
          selectedItems={selectedItems}
          sortConfig={sortConfig}
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
      )}
    </>
  );
};

export default FileList; 