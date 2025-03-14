import { useState, useEffect } from 'react';
import { FileItem, FolderItem, ColumnWidths } from '@/components/storage/types';
import { formatFileSize, formatDateTime, getFileTypeIcon } from '@/services/storage/s3';
import GridView from '@/components/storage/FileList/GridView';
import ListView from '@/components/storage/FileList/ListView';

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

// 預設欄位寬度設定
const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  name: 40, // 百分比
  type: 15,
  size: 15,
  lastModified: 20,
  actions: 10
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
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(() => {
    try {
      // 從 localStorage 中讀取欄位寬度設定，如果沒有則使用預設值
      const savedWidths = localStorage.getItem(STORAGE_KEY);
      if (savedWidths) {
        const parsed = JSON.parse(savedWidths);
        // 驗證讀取的值是否完整
        if (parsed && typeof parsed === 'object' && 
            'name' in parsed && 
            'type' in parsed && 
            'size' in parsed && 
            'lastModified' in parsed && 
            'actions' in parsed) {
          // 確保所有值都是數字並且總和為 100
          const total = Object.values(parsed).reduce<number>((sum, val) => sum + (Number(val) || 0), 0);
          if (Math.abs(total - 100) < 0.1) { // 允許小數點誤差
            return parsed as ColumnWidths;
          }
        }
      }
    } catch (error) {
      console.error('解析儲存的欄位寬度失敗:', error);
    }
    return DEFAULT_COLUMN_WIDTHS;
  });

  // 當欄位寬度改變時保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnWidths));
    } catch (error) {
      console.error('儲存欄位寬度失敗:', error);
    }
  }, [columnWidths]);

  // 處理欄位寬度變更
  const handleColumnWidthChange = (column: keyof ColumnWidths, width: number) => {
    // 計算所有欄位新的總寬度
    const totalOtherWidths = Object.entries(columnWidths)
      .filter(([key]) => key !== column)
      .reduce((sum, [_, value]) => sum + value, 0);
    
    // 計算剩餘可分配的寬度
    const availableWidth = 100 - width;
    
    // 按比例調整其他欄位的寬度
    const adjustedWidths = { ...columnWidths };
    adjustedWidths[column] = width;

    // 按照原始比例分配剩餘寬度給其他欄位
    Object.keys(columnWidths).forEach(key => {
      if (key !== column) {
        const colKey = key as keyof ColumnWidths;
        const originalRatio = columnWidths[colKey] / totalOtherWidths;
        adjustedWidths[colKey] = Math.max(5, Number((availableWidth * originalRatio).toFixed(1)));
      }
    });

    // 確保總寬度為 100%
    const total = Object.values(adjustedWidths).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 100) > 0.1) {
      // 如果總寬度不為 100%，按比例調整
      const factor = 100 / total;
      Object.keys(adjustedWidths).forEach(key => {
        const colKey = key as keyof ColumnWidths;
        adjustedWidths[colKey] = Number((adjustedWidths[colKey] * factor).toFixed(1));
      });
    }

    setColumnWidths(adjustedWidths);
  };

  // 重置欄位寬度為預設值
  const handleResetColumnWidths = () => {
    setColumnWidths({ ...DEFAULT_COLUMN_WIDTHS });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('移除儲存的欄位寬度失敗:', error);
    }
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

  return (
    <div className="flex flex-col">
      {/* 欄位寬度調整按鈕 - 只在列表模式顯示 */}
      {viewMode === 'list' && (
        <div className="mb-3 flex justify-end">
          <button
            onClick={handleResetColumnWidths}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                     hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            重置欄位寬度
          </button>
        </div>
      )}

      {viewMode === 'grid' ? (
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
    </div>
  );
};

export default FileList; 