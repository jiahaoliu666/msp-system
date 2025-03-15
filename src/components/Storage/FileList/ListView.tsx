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
  const headerRowRef = useRef<HTMLTableRowElement>(null);
  const resizing = useRef(false);
  const lastPositionRef = useRef(0);
  const [precisionMode, setPrecisionMode] = useState(false);

  // 定義移動和釋放事件處理器的引用，確保正確移除
  const moveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const upHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);

  // 預計算列的索引順序
  const columnOrder: (keyof ColumnWidths)[] = ['name', 'lastModified', 'type', 'size', 'actions'];
  const getColumnIndex = (columnName: keyof ColumnWidths): number => {
    return columnOrder.indexOf(columnName);
  };

  // 移除固定減速係數，改用基於速度的適應性控制
  const handleResizeStart = (e: React.MouseEvent, column: keyof ColumnWidths) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 強制重置所有狀態，確保可以進行新的拖動操作
    resizing.current = false;
    
    // 確保之前的事件處理器已被清理
    if (moveHandlerRef.current) {
      document.removeEventListener('mousemove', moveHandlerRef.current);
      moveHandlerRef.current = null;
    }
    if (upHandlerRef.current) {
      document.removeEventListener('mouseup', upHandlerRef.current);
      upHandlerRef.current = null;
    }
    
    // 清理之前的視覺狀態
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.classList.remove('cursor-precision');
    setPrecisionMode(false);
    
    const startX = e.clientX;
    lastPositionRef.current = startX;
    console.log('開始調整欄位寬度:', column, '初始寬度:', columnWidths[column]);
    
    // 使用普通變數追蹤當前寬度
    let currentColumnWidth = columnWidths[column];
    
    // 設置正在調整標誌
    resizing.current = true;
    
    // 預先獲取目標列元素，避免重複查詢DOM
    const columnIndex = getColumnIndex(column);
    let targetColumnElement: HTMLTableHeaderCellElement | null = null;
    
    if (tableRef.current && headerRowRef.current) {
      const headerCells = headerRowRef.current.querySelectorAll('th');
      if (columnIndex >= 0 && columnIndex < headerCells.length) {
        targetColumnElement = headerCells[columnIndex] as HTMLTableHeaderCellElement;
      }
    }
    
    // 設定拖動處理函數 - 直接反應滑鼠移動
    const handleMove = (moveEvent: MouseEvent) => {
      if (!resizing.current) return;
      
      // 這裡添加preventDefault以確保拖動時不會選中文字等
      moveEvent.preventDefault();
      
      // 計算移動距離
      const currentX = moveEvent.clientX;
      const moveDistance = currentX - lastPositionRef.current;
      
      // 檢查是否需要進入精確模式
      const isPrecisionMode = moveEvent.shiftKey;
      if (isPrecisionMode !== precisionMode) {
        setPrecisionMode(isPrecisionMode);
        if (isPrecisionMode) {
          document.body.classList.add('cursor-precision');
        } else {
          document.body.classList.remove('cursor-precision');
        }
      }
      
      // 直接使用滑鼠移動距離計算新寬度
      let adjustedDiff = moveDistance;
      
      // 按住Shift鍵時進入精確模式，減慢速度
      if (isPrecisionMode) {
        // 在精確模式下減慢速度為原來的1/10
        adjustedDiff = moveDistance * 0.1;
      }
      
      // 直接計算新寬度，完全基於滑鼠移動距離
      const newWidth = Math.max(50, currentColumnWidth + adjustedDiff);
      
      // 立即更新DOM以獲得即時反應
      if (targetColumnElement) {
        targetColumnElement.style.width = `${newWidth}px`;
        currentColumnWidth = newWidth;
      }
      
      // 更新最後位置
      lastPositionRef.current = currentX;
    };
    
    // 設定結束拖動處理
    const handleUp = (upEvent: MouseEvent) => {
      // 防止重複處理
      if (!resizing.current) return;
      
      upEvent.preventDefault();
      upEvent.stopPropagation();
      
      // 重置調整標誌
      resizing.current = false;
      
      // 移除事件監聽器
      if (moveHandlerRef.current) {
        document.removeEventListener('mousemove', moveHandlerRef.current);
        moveHandlerRef.current = null;
      }
      if (upHandlerRef.current) {
        document.removeEventListener('mouseup', upHandlerRef.current);
        upHandlerRef.current = null;
      }
      
      // 恢復游標和用戶選擇
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.classList.remove('cursor-precision');
      setPrecisionMode(false);
      
      // 在拖動結束時才通知父組件寬度變化
      if (onColumnWidthChange && currentColumnWidth !== columnWidths[column]) {
        onColumnWidthChange(column, currentColumnWidth);
        console.log('完成欄位寬度調整:', column, '新寬度:', currentColumnWidth);
      }
      
      // 確保所有狀態重置完成，允許下一次拖動
      setTimeout(() => {
        console.log('拖動狀態重置完成，可以進行下一次拖動');
      }, 10);
    };
    
    // 保存事件處理器的引用，以便正確移除
    moveHandlerRef.current = handleMove;
    upHandlerRef.current = handleUp;
    
    // 設置調整過程中的視覺樣式
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    
    // 使用標準方式綁定事件，確保能夠正確移除
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };
  
  // 確保在組件卸載時清理所有事件監聽器
  useEffect(() => {
    return () => {
      if (moveHandlerRef.current) {
        document.removeEventListener('mousemove', moveHandlerRef.current);
      }
      if (upHandlerRef.current) {
        document.removeEventListener('mouseup', upHandlerRef.current);
      }
    };
  }, []);

  // 更新精確模式游標樣式
  useEffect(() => {
    // 添加精確游標樣式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .cursor-precision {
        cursor: ew-resize !important;
      }
      .cursor-precision::after {
        content: "精確模式";
        position: fixed;
        bottom: 15px;
        right: 15px;
        background: rgba(59, 130, 246, 0.9);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      // 清理樣式
      document.head.removeChild(styleElement);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      resizing.current = false;
    };
  }, []);

  // 簡化Shift鍵監聽邏輯，移至handleMove中直接處理
  useEffect(() => {
    return () => {
      document.body.classList.remove('cursor-precision');
    };
  }, []);

  return (
    <div className="relative overflow-x-auto shadow-md rounded-lg">
      <table 
        ref={tableRef} 
        className={`w-full text-sm text-left text-gray-700 dark:text-gray-300`}
        title={precisionMode ? "精確調整模式（Shift鍵已啟用）" : "按住Shift鍵以啟用精確調整模式"}
      >
        <thead className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 select-none">
          <tr ref={headerRowRef}>
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
                  className="absolute right-0 top-0 h-full w-6 cursor-col-resize flex items-center justify-center z-20 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="拖動調整欄位寬度"
                >
                  <div className="w-0.5 h-4/5 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 hover:w-1" />
                </div>
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
                  className="absolute right-0 top-0 h-full w-6 cursor-col-resize flex items-center justify-center z-20 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="拖動調整欄位寬度"
                >
                  <div className="w-0.5 h-4/5 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 hover:w-1" />
                </div>
              )}
            </th>
            <th 
              className="p-4 relative" 
              style={{ width: columnWidths.type }}
            >
              <div className="flex items-center">
                <span className="flex-grow">檔案類型</span>
              </div>
              {onColumnWidthChange && (
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'type')}
                  className="absolute right-0 top-0 h-full w-6 cursor-col-resize flex items-center justify-center z-20 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="拖動調整欄位寬度"
                >
                  <div className="w-0.5 h-4/5 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 hover:w-1" />
                </div>
              )}
            </th>
            <th 
              className="p-4 relative" 
              style={{ width: columnWidths.size }}
            >
              <div className="flex items-center">
                <span className="flex-grow">檔案大小</span>
              </div>
              {onColumnWidthChange && (
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'size')}
                  className="absolute right-0 top-0 h-full w-6 cursor-col-resize flex items-center justify-center z-20 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="拖動調整欄位寬度"
                >
                  <div className="w-0.5 h-4/5 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 hover:w-1" />
                </div>
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
                  <div className="flex space-x-2">
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