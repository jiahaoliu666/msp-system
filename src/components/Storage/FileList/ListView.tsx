import React, { useState, useRef, useEffect } from 'react';
import { FileItem, FolderItem, ColumnWidths } from '@/components/storage/types';
import { formatFileSize, getFileTypeIcon } from '@/services/storage/s3';
import { formatFolderItemCount } from '@/config/s3-config';

interface ListViewProps {
  folders: FolderItem[];
  files: FileItem[];
  currentPath?: string;
  selectedItems: Set<string>;
  multiSelectMode?: boolean;
  itemsPerPage?: number;
  sortConfig: {
    key: string;
    direction: string;
  };
  onSelectItem: (key: string) => void;
  onEnterFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onDownload: (key: string, fileName: string) => Promise<void>;
  onDelete: (key: string) => void;
  onFilePreview: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, file: FileItem | FolderItem) => void;
  onSort: (key: string) => void;
  columnWidths?: ColumnWidths;
  onColumnWidthChange?: (column: keyof ColumnWidths, width: number) => void;
}

const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  name: 250,
  type: 100,
  size: 100,
  lastModified: 160,
  actions: 100
};

const ListView: React.FC<ListViewProps> = ({
  folders,
  files,
  currentPath,
  selectedItems,
  multiSelectMode,
  itemsPerPage,
  sortConfig = { key: 'name', direction: 'asc' },
  onSelectItem,
  onEnterFolder,
  onDeleteFolder,
  onDownload,
  onDelete,
  onFilePreview,
  onContextMenu,
  onSort = () => {},
  columnWidths = DEFAULT_COLUMN_WIDTHS,
  onColumnWidthChange
}) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const [resizeLine, setResizeLine] = useState({
    visible: false,
    position: 0,
    column: '' as keyof ColumnWidths,
    startX: 0,
    columnStartWidth: 0
  });

  const handleResizeStart = (e: React.MouseEvent, column: keyof ColumnWidths) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    
    setResizeLine({
      visible: true,
      position: e.clientX,
      column,
      startX,
      columnStartWidth: columnWidths[column]
    });
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  const handleResizeMove = (e: MouseEvent) => {
    e.preventDefault();
    
    if (resizeLine.visible) {
      const diffX = e.clientX - resizeLine.startX;
      const newWidth = Math.max(50, resizeLine.columnStartWidth + diffX);
      
      setResizeLine(prev => ({
        ...prev,
        position: e.clientX
      }));
      
      if (onColumnWidthChange) {
        onColumnWidthChange(resizeLine.column, newWidth);
      }
    }
  };
  
  const handleResizeEnd = () => {
    setResizeLine(prev => ({
      ...prev,
      visible: false
    }));
    
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };
  
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  return (
    <div className="relative overflow-x-auto shadow-md rounded-lg">
      {resizeLine.visible && (
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-50"
          style={{ left: `${resizeLine.position}px`, height: tableRef.current?.offsetHeight }}
        />
      )}
      
      <table ref={tableRef} className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
        <thead className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 select-none">
          <tr>
            <th 
              className="p-4 relative" 
              style={{ width: columnWidths.name }}
            >
              <div className="flex items-center">
                <span className="flex-grow">名稱</span>
              </div>
              {onColumnWidthChange && (
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'name')}
                  className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 flex items-center after:content-['⋮'] after:text-gray-400 after:text-xs"
                />
              )}
            </th>
            <th 
              className="p-4 relative" 
              style={{ width: columnWidths.lastModified }}
            >
              <div className="flex items-center">
                <span className="flex-grow">修改時間</span>
              </div>
              {onColumnWidthChange && (
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'lastModified')}
                  className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 flex items-center after:content-['⋮'] after:text-gray-400 after:text-xs"
                />
              )}
            </th>
            <th 
              className="p-4 relative" 
              style={{ width: columnWidths.type }}
            >
              <div className="flex items-center">
                <span className="flex-grow">類型</span>
              </div>
              {onColumnWidthChange && (
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'type')}
                  className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 flex items-center after:content-['⋮'] after:text-gray-400 after:text-xs"
                />
              )}
            </th>
            <th 
              className="p-4 relative" 
              style={{ width: columnWidths.size }}
            >
              <div className="flex items-center">
                <span className="flex-grow">大小</span>
              </div>
              {onColumnWidthChange && (
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'size')}
                  className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 flex items-center after:content-['⋮'] after:text-gray-400 after:text-xs"
                />
              )}
            </th>
            <th style={{ width: columnWidths.actions }} className="p-4 relative">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {folders.map((folder, index) => (
            <tr 
              key={`folder-${index}`}
              className={`bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedItems.has(folder.name) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
              }`}
              onClick={() => onSelectItem(folder.name)}
            >
              <td className="p-4 flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600 dark:text-blue-400 text-2xl">📁</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEnterFolder(folder.name);
                    }}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px]"
                    title={folder.name}
                  >
                    {folder.name}
                  </button>
                </div>
              </td>
              <td className="p-4 align-middle">
                {new Date(folder.lastModified).toLocaleString('zh-TW')}
              </td>
              <td className="p-4 align-middle">資料夾</td>
              <td className="p-4 align-middle">
                {folder.children !== undefined && folder.children > 0 
                  ? formatFolderItemCount(folder.children) 
                  : formatFolderItemCount(0)}
              </td>
              <td className="p-4 align-middle">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folder.name);
                    }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                           text-gray-500 dark:text-gray-400 hover:text-gray-700 
                           dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {files.map((file, index) => {
            const fileKey = file.Key || '';
            const fileName = file.displayName || fileKey.split('/').pop() || fileKey;
            
            return (
              <tr
                key={`file-${index}`}
                className={`bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedItems.has(fileKey) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
                onClick={() => onSelectItem(fileKey)}
                onContextMenu={(e) => onContextMenu(e, file)}
                onDoubleClick={() => onFilePreview(file)}
              >
                <td className="p-4 flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getFileTypeIcon(fileKey)}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFilePreview(file);
                      }}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px]"
                      title={fileName}
                    >
                      {fileName}
                    </button>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  {file.LastModified ? new Date(file.LastModified).toLocaleString('zh-TW') : '-'}
                </td>
                <td className="p-4 align-middle">
                  {file.type || fileKey.split('.').pop()?.toUpperCase() || 'Unknown'}
                </td>
                <td className="p-4 align-middle">{formatFileSize(file.Size || 0)}</td>
                <td className="p-4 align-middle">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(fileKey, fileName);
                      }}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                               text-gray-500 dark:text-gray-400 hover:text-gray-700 
                               dark:hover:text-gray-300 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L7 8m4-4v12" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(fileKey);
                      }}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                               text-gray-500 dark:text-gray-400 hover:text-gray-700 
                               dark:hover:text-gray-300 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ListView; 