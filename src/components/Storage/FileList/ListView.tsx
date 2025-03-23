import React, { useState, useRef, useEffect } from 'react';
import { FileItem, FolderItem, ColumnWidths } from '@/components/storage/types';
import { formatFileSize, formatDateTime, getFileTypeIcon } from '@/services/storage/s3';
import { S3_CONFIG, formatFolderItemCount } from '@/config/s3-config';
import EmptyState from '../EmptyState';
import { useAuth } from '@/context/AuthContext';

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
  onSelectAll: () => void;
  onEnterFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onDownload: (key: string, fileName: string) => Promise<void>;
  onDelete: (key: string) => void;
  onFilePreview: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, file: FileItem | FolderItem) => void;
  onSort: (key: string) => void;
  columnWidths?: ColumnWidths;
  onColumnWidthChange?: (column: keyof ColumnWidths, width: number) => void;
  isEmptyFolder?: boolean;
  onCreateFolder?: () => void;
  isRefreshing?: boolean;
}

const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  name: 300,         // 名稱列寬度
  lastModified: 180, // 日期列寬度
  modifier: 150,     // 修改者列寬度
  type: 100,         // 類型列寬度
  size: 100,         // 大小列寬度
};

const ListView: React.FC<ListViewProps> = ({
  folders,
  files,
  currentPath,
  selectedItems,
  multiSelectMode,
  itemsPerPage,
  sortConfig = { key: 'lastModified', direction: 'desc' },
  onSelectItem,
  onSelectAll,
  onEnterFolder,
  onDeleteFolder,
  onDownload,
  onDelete,
  onFilePreview,
  onContextMenu,
  onSort = () => {},
  columnWidths = DEFAULT_COLUMN_WIDTHS,
  onColumnWidthChange,
  isEmptyFolder,
  onCreateFolder,
  isRefreshing = false
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
  const columnOrder: (keyof ColumnWidths)[] = ['name', 'lastModified', 'modifier', 'type', 'size'];
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
      
      // 使用 requestAnimationFrame 優化視覺更新
      requestAnimationFrame(() => {
        // 立即更新DOM以獲得即時反應
        if (targetColumnElement) {
          targetColumnElement.style.width = `${newWidth}px`;
          currentColumnWidth = newWidth;
        }
      });
      
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

  // 在檔案元件中獲取當前登入用戶
  const { user } = useAuth();
  const currentUser = user?.email 
    ? user.email.split('@')[0] // 只取郵件地址的前綴，去掉 @domain.com 部分
    : '系統';
  
  // 在檔案元件中加入獲取S3直接URL的函數
  const getFilePreviewUrl = (fileKey: string): string => {
    // 使用 AWS SDK v3 的方式構建 S3 對象直接 URL
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'metaage-msp-bucket';
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-northeast-1';
    const encodedKey = encodeURIComponent(fileKey);
    
    // 構建 S3 直接URL
    return `https://${bucketName}.s3.${region}.amazonaws.com/${encodedKey}`;
  };
  
  // 添加檔案點擊處理函數
  const handleFileClick = (file: FileItem, event: React.MouseEvent) => {
    // 如果是多選模式，則調用選擇函數
    if (multiSelectMode) {
      onSelectItem(file.Key || '');
      return;
    }
    
    // 如果是點擊操作按鈕區域，則不進行預覽
    const target = event.target as HTMLElement;
    if (target.closest('.file-actions')) {
      return;
    }
    
    // 檢查是否按下 Ctrl 鍵（Windows）或 Command 鍵（Mac）
    if (event.ctrlKey || event.metaKey) {
      // 在新標籤頁中打開 S3 直接鏈接
      const url = getFilePreviewUrl(file.Key || '');
      window.open(url, '_blank');
    } else {
      // 否則顯示內部預覽
      onFilePreview(file);
    }
  };
  
  // 獲取格式化的修改者名稱（去除郵件地址的域名部分）
  const getFormattedModifier = (modifier: string | undefined): string => {
    if (!modifier) return '未知';
    
    // 如果是郵件地址，只顯示用戶名部分
    if (modifier.includes('@')) {
      return modifier.split('@')[0];
    }
    
    return modifier;
  };

  return (
    <div className="relative overflow-x-auto border border-gray-300 dark:border-gray-600 shadow-lg rounded-xl bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-xl mx-auto my-4 max-w-full">
      <table 
        ref={tableRef} 
        className={`w-full text-sm text-left text-gray-700 dark:text-gray-300 table-fixed`}
      >
        <thead className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 select-none border-b border-gray-200 dark:border-gray-700">
          <tr ref={headerRowRef}>
            <th className="p-4 relative" style={{ width: columnWidths.name }}>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                  onChange={onSelectAll}
                  checked={selectedItems.size > 0 && selectedItems.size === (folders.length + files.length)}
                />
                <span className="ml-3 flex-grow font-medium">項目名稱</span>
                {onColumnWidthChange && (
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'name')}
                    onDoubleClick={() => onColumnWidthChange('name', DEFAULT_COLUMN_WIDTHS.name)}
                    className="absolute right-0 top-0 h-full w-6 cursor-col-resize flex items-center justify-center z-20 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="拖動調整欄位寬度 (雙擊重置)"
                  >
                    <div className="w-0.5 h-4/5 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 hover:w-1" />
                  </div>
                )}
              </div>
            </th>
            <th className="p-4 relative" style={{ width: columnWidths.lastModified }}>
              <div className="flex items-center">
                <span className="flex-grow font-medium">修改時間</span>
                <button 
                  onClick={() => onSort('lastModified')}
                  className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {sortConfig.key === 'lastModified' && (
                    <span className="text-blue-600">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
                {onColumnWidthChange && (
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'lastModified')}
                    onDoubleClick={() => onColumnWidthChange('lastModified', DEFAULT_COLUMN_WIDTHS.lastModified)}
                    className="absolute right-0 top-0 h-full w-6 cursor-col-resize flex items-center justify-center z-20 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="拖動調整欄位寬度 (雙擊重置)"
                  >
                    <div className="w-0.5 h-4/5 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 hover:w-1" />
                  </div>
                )}
              </div>
            </th>
            <th className="p-4 relative" style={{ width: columnWidths.modifier }}>
              <div className="flex items-center">
                <span className="flex-grow font-medium">修改者</span>
                {onColumnWidthChange && (
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'modifier')}
                    onDoubleClick={() => onColumnWidthChange('modifier', DEFAULT_COLUMN_WIDTHS.modifier)}
                    className="absolute right-0 top-0 h-full w-6 cursor-col-resize flex items-center justify-center z-20 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="拖動調整欄位寬度 (雙擊重置)"
                  >
                    <div className="w-0.5 h-4/5 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 hover:w-1" />
                  </div>
                )}
              </div>
            </th>
            <th className="p-4 relative" style={{ width: columnWidths.type }}>
              <div className="flex items-center">
                <span className="flex-grow font-medium">類型</span>
                {onColumnWidthChange && (
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'type')}
                    onDoubleClick={() => onColumnWidthChange('type', DEFAULT_COLUMN_WIDTHS.type)}
                    className="absolute right-0 top-0 h-full w-6 cursor-col-resize flex items-center justify-center z-20 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="拖動調整欄位寬度 (雙擊重置)"
                  >
                    <div className="w-0.5 h-4/5 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 hover:w-1" />
                  </div>
                )}
              </div>
            </th>
            <th className="p-4 relative" style={{ width: columnWidths.size }}>
              <div className="flex items-center">
                <span className="flex-grow font-medium">大小</span>
                <button 
                  onClick={() => onSort('size')}
                  className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {sortConfig.key === 'size' && (
                    <span className="text-blue-600">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
                {onColumnWidthChange && (
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'size')}
                    onDoubleClick={() => onColumnWidthChange('size', DEFAULT_COLUMN_WIDTHS.size)}
                    className="absolute right-0 top-0 h-full w-6 cursor-col-resize flex items-center justify-center z-20 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="拖動調整欄位寬度 (雙擊重置)"
                  >
                    <div className="w-0.5 h-4/5 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 hover:w-1" />
                  </div>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {folders.map((folder, index) => (
            <tr
              key={`folder-${index}`}
              className={`group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
                selectedItems.has(folder.name) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
              }`}
            >
              <td className="p-4">
                <div className="flex items-center space-x-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(folder.name)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelectItem(folder.name);
                    }}
                    className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => onEnterFolder(folder.name)}
                    className="flex items-center space-x-3 min-w-0 flex-1 focus:outline-none"
                  >
                    <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium truncate hover:underline">
                      {folder.name}
                    </span>
                  </button>
                </div>
              </td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {formatDateTime(folder.lastModified)}
              </td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {getFormattedModifier(currentUser)}
              </td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                資料夾
              </td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {folder.children ? `${folder.children} 個項目` : '-'}
              </td>
            </tr>
          ))}

          {files.map((file, index) => {
            const fileKey = file.Key || '';
            const fileName = file.displayName || fileKey.split('/').pop() || fileKey;
            
            return (
              <tr
                key={`file-${index}`}
                className={`group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
                  selectedItems.has(fileKey) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
                onClick={(e) => handleFileClick(file, e)}
                onContextMenu={(e) => onContextMenu(e, file)}
              >
                <td className="p-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(fileKey)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelectItem(fileKey);
                      }}
                      className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="flex-shrink-0 text-gray-400">
                        {getFileTypeIcon(fileKey)}
                      </div>
                      <span className="font-medium truncate">{fileName}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(file.LastModified || new Date())}
                </td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {getFormattedModifier(file.modifier)}
                </td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {file.type || '未知'}
                </td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {formatFileSize(file.Size || 0)}
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