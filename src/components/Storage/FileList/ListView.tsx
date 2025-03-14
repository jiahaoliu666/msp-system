import React, { useState, useRef, useEffect } from 'react';
import { FileItem, FolderItem, ColumnWidths } from '@/components/storage/types';
import { formatFileSize, formatDateTime } from '@/services/storage/s3';

interface ListViewProps {
  folders: FolderItem[];
  files: FileItem[];
  currentPath: string;
  selectedItems: Set<string>;
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
  onContextMenu: (e: React.MouseEvent, file: FileItem) => void;
  onSort: (key: string) => void;
  columnWidths?: ColumnWidths;
  onColumnWidthChange?: (column: keyof ColumnWidths, width: number) => void;
}

const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  name: 40,
  type: 15,
  size: 15,
  lastModified: 20,
  actions: 10
};

const ListView: React.FC<ListViewProps> = ({
  folders,
  files,
  currentPath,
  selectedItems,
  sortConfig,
  onSelectItem,
  onEnterFolder,
  onDeleteFolder,
  onDownload,
  onDelete,
  onFilePreview,
  onContextMenu,
  onSort,
  columnWidths = DEFAULT_COLUMN_WIDTHS,
  onColumnWidthChange
}) => {
  const [resizingColumn, setResizingColumn] = useState<keyof ColumnWidths | null>(null);
  const [startX, setStartX] = useState<number>(0);
  const [startWidth, setStartWidth] = useState<number>(0);
  const tableRef = useRef<HTMLTableElement>(null);
  const [resizeLine, setResizeLine] = useState<{ visible: boolean; left: number }>({ visible: false, left: 0 });

  const handleResizeStart = (e: React.MouseEvent, column: keyof ColumnWidths) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(column);
    setStartX(e.clientX);
    setStartWidth(columnWidths[column]);
    setResizeLine({ visible: true, left: e.clientX });

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    
    document.body.style.cursor = 'col-resize';
    document.body.classList.add('table-column-resizing');
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingColumn) return;
    
    setResizeLine({ visible: true, left: e.clientX });
    
    const tableWidth = tableRef.current?.offsetWidth || 1000;
    const deltaX = e.clientX - startX;
    const deltaPercent = (deltaX / tableWidth) * 100;
    
    if (onColumnWidthChange) {
      const newWidth = Math.max(5, Math.min(70, startWidth + deltaPercent));
      onColumnWidthChange(resizingColumn, newWidth);
    }
  };

  const handleResizeEnd = () => {
    setResizingColumn(null);
    setResizeLine({ visible: false, left: 0 });
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = '';
    document.body.classList.remove('table-column-resizing');
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.classList.remove('table-column-resizing');
    };
  }, []);

  return (
    <div className="relative overflow-x-auto">
      {resizeLine.visible && (
        <div 
          className="column-resize-line" 
          style={{ left: `${resizeLine.left}px` }}
        />
      )}
      
      <table ref={tableRef} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="w-[40px] px-3 py-3 text-center align-middle">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </th>
            <th 
              className="relative px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer align-middle"
              style={{ width: `${columnWidths.name}%` }}
              onClick={() => onSort('name')}
            >
              <div className="flex items-center">
                <span>名稱</span>
                {sortConfig.key === 'name' && (
                  <span className="ml-2">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </div>
              <div 
                className="absolute right-0 top-0 h-full w-2 cursor-col-resize group z-10"
                onMouseDown={(e) => handleResizeStart(e, 'name')}
              >
                <div className="h-full w-1 bg-transparent group-hover:bg-blue-400 group-active:bg-blue-600"></div>
              </div>
            </th>
            <th 
              className="relative px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer align-middle"
              style={{ width: `${columnWidths.type}%` }}
              onClick={() => onSort('type')}
            >
              <div className="flex items-center">
                <span>類型</span>
                {sortConfig.key === 'type' && (
                  <span className="ml-2">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </div>
              <div 
                className="absolute right-0 top-0 h-full w-2 cursor-col-resize group z-10"
                onMouseDown={(e) => handleResizeStart(e, 'type')}
              >
                <div className="h-full w-1 bg-transparent group-hover:bg-blue-400 group-active:bg-blue-600"></div>
              </div>
            </th>
            <th 
              className="relative px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer align-middle"
              style={{ width: `${columnWidths.size}%` }}
              onClick={() => onSort('size')}
            >
              <div className="flex items-center">
                <span>大小</span>
                {sortConfig.key === 'size' && (
                  <span className="ml-2">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </div>
              <div 
                className="absolute right-0 top-0 h-full w-2 cursor-col-resize group z-10"
                onMouseDown={(e) => handleResizeStart(e, 'size')}
              >
                <div className="h-full w-1 bg-transparent group-hover:bg-blue-400 group-active:bg-blue-600"></div>
              </div>
            </th>
            <th 
              className="relative px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer align-middle"
              style={{ width: `${columnWidths.lastModified}%` }}
              onClick={() => onSort('date')}
            >
              <div className="flex items-center">
                <span>修改時間</span>
                {sortConfig.key === 'date' && (
                  <span className="ml-2">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </div>
              <div 
                className="absolute right-0 top-0 h-full w-2 cursor-col-resize group z-10"
                onMouseDown={(e) => handleResizeStart(e, 'lastModified')}
              >
                <div className="h-full w-1 bg-transparent group-hover:bg-blue-400 group-active:bg-blue-600"></div>
              </div>
            </th>
            <th 
              className="relative px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle"
              style={{ width: `${columnWidths.actions}%` }}
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {folders.map((folder, index) => (
            <tr
              key={`folder-${index}`}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150
                        ${selectedItems.has(folder.name) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              onClick={() => onSelectItem(folder.name)}
              onDoubleClick={() => onEnterFolder(folder.name)}
              onContextMenu={(e) => onContextMenu(e, folder as FileItem)}
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200 align-middle text-center">
                <input
                  type="checkbox"
                  checked={selectedItems.has(folder.name)}
                  onChange={() => onSelectItem(folder.name)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200 align-middle">
                <div className="flex items-center">
                  <span className="text-xl mr-3">📁</span>
                  <span className="truncate">{folder.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 align-middle">
                資料夾
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 align-middle">
                {formatFileSize(folder.size)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 align-middle">
                {folder.lastModified ? formatDateTime(folder.lastModified) : '-'}
              </td>
              <td className="px-4 py-3 text-right text-sm font-medium align-middle">
                <div className="flex justify-center space-x-2">
                  <button
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folder.name);
                    }}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
          
          {files.map((file, index) => (
            <tr
              key={`file-${index}`}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150
                        ${selectedItems.has(file.Key || '') ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              onClick={() => onSelectItem(file.Key || '')}
              onDoubleClick={() => onFilePreview(file)}
              onContextMenu={(e) => onContextMenu(e, file)}
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200 align-middle text-center">
                <input
                  type="checkbox"
                  checked={selectedItems.has(file.Key || '')}
                  onChange={() => onSelectItem(file.Key || '')}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200 align-middle">
                <div className="flex items-center">
                  <span className="text-xl mr-3">
                    {file.type === 'image' ? '🖼️' : file.type === 'document' ? '📄' : '📁'}
                  </span>
                  <span className="truncate">{file.Key?.split('/').pop() || ''}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 align-middle">
                {file.type || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 align-middle">
                {formatFileSize(file.Size || 0)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 align-middle">
                {file.LastModified ? formatDateTime(file.LastModified) : '-'}
              </td>
              <td className="px-4 py-3 text-center text-sm font-medium align-middle">
                <div className="flex justify-center space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(file.Key || '', file.Key?.split('/').pop() || '');
                    }}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L7 8m4-4v12" />
                    </svg>
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(file.Key || '');
                    }}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListView; 