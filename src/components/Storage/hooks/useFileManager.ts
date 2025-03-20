import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { listFilesInFolder } from '@/services/storage/s3';
import { FileItem, FolderItem, FileManagerReturn, FileFilters } from '@/components/storage/types';

export const useFileManager = (): FileManagerReturn => {
  console.log("useFileManager hook 初始化");
  // 狀態管理
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [totalSize, setTotalSize] = useState<number>(0);
  const [filteredItems, setFilteredItems] = useState<{ files: FileItem[]; folders: FolderItem[] }>({ files: [], folders: [] });
  const [starredItems, setStarredItems] = useState<Set<string>>(new Set());
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [recentFolders, setRecentFolders] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [sortedFolders, setSortedFolders] = useState<FolderItem[]>([]);
  const [sortedFiles, setSortedFiles] = useState<FileItem[]>([]);

  const maxRetries = 3;
  const retryDelay = 2000;

  // 載入檔案列表
  const loadFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!navigator.onLine) {
        throw new Error('網路連線已斷開，請檢查您的網路狀態');
      }

      console.log('正在加載路徑:', currentPath);

      const { files: fileList, folders: folderList, parentPath: parent } = await listFilesInFolder(currentPath);
      
      console.log('檔案列表加載結果:', { 
        files: fileList.length, 
        folders: folderList.length, 
        currentPath, 
        parentPath: parent
      });
      
      // 處理文件，確保顯示相對於當前路徑的檔案名稱
      const processedFiles = fileList.map(file => {
        // 獲取原始路徑
        const originalKey = file.Key || '';
        // 計算在當前路徑下的相對路徑
        const relativePath = currentPath 
          ? originalKey.replace(currentPath + '/', '')
          : originalKey;
          
        return {
          ...file,
          Key: originalKey, // 保留原始完整路徑
          displayName: relativePath, // 添加顯示名稱
          type: getFileType(originalKey)
        };
      });
      
      // 排除可能帶有子路徑的文件（僅顯示當前層級的文件）
      const directFiles = processedFiles.filter(file => 
        !file.displayName.includes('/')
      );
      
      setFiles(directFiles);
      setFolders(folderList.map(folder => ({
        ...folder,
        type: 'folder' as const
      })));
      setParentPath(parent);
      
      // 添加日誌輸出
      console.log('設置 parentPath:', parent);
      console.log('當前路徑 currentPath:', currentPath);
      
      // 更新麵包屑
      updateBreadcrumbs(currentPath);
      
      // 更新最近訪問的資料夾
      updateRecentFolders(currentPath);
      
      setRetryCount(0);
      setIsRetrying(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '載入檔案列表失敗';
      console.error('載入檔案列表失敗:', error);
      
      // 處理網路相關錯誤
      if (!navigator.onLine || 
          errorMessage.includes('網路') || 
          errorMessage.includes('連線') || 
          errorMessage.includes('逾時')) {
        if (retryCount < maxRetries) {
          setIsRetrying(true);
          setRetryCount(prev => prev + 1);
          const nextRetryDelay = retryDelay * Math.pow(2, retryCount);
          toast.info(`正在重新連線... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => loadFiles(), nextRetryDelay);
        } else {
          setIsRetrying(false);
          setError(`${errorMessage} (已重試 ${maxRetries} 次)`);
          toast.error(errorMessage);
        }
      } else {
        setIsRetrying(false);
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      if (!isRetrying) {
        setIsLoading(false);
      }
    }
  }, [currentPath, retryCount, isRetrying, retryDelay, maxRetries]);

  // 重試處理
  const handleRetry = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    loadFiles();
  }, [loadFiles]);

  // 添加網路狀態監聽
  useEffect(() => {
    const handleOnline = () => {
      if (error && error.includes('網路')) {
        toast.info('網路已恢復連線');
        handleRetry();
      }
    };

    const handleOffline = () => {
      toast.error('網路連線已斷開');
      setError('網路連線已斷開，請檢查您的網路狀態');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error, handleRetry]);

  // 初始載入
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // 當路徑變化時重新載入檔案
  useEffect(() => {
    loadFiles();
  }, [currentPath, loadFiles]);

  // 計算總大小
  useEffect(() => {
    const size = files.reduce((sum, file) => sum + (file.Size || 0), 0);
    setTotalSize(size);
  }, [files]);

  // 最近訪問的資料夾
  useEffect(() => {
    if (currentPath) {
      setRecentFolders(prev => {
        const newRecentFolders = [currentPath, ...prev.filter(f => f !== currentPath)].slice(0, 5);
        return newRecentFolders;
      });
    }
  }, [currentPath]);

  // 進入資料夾
  const handleEnterFolder = (folderName: string) => {
    const newPath = currentPath 
      ? `${currentPath}/${folderName}`
      : folderName;
    setCurrentPath(newPath);
  };

  // 返回上層資料夾
  const handleGoBack = () => {
    console.log('handleGoBack 被調用，當前 parentPath:', parentPath);
    if (parentPath !== null) {
      console.log('設置當前路徑為:', parentPath);
      setCurrentPath(parentPath);
    }
  };

  // 選擇項目處理
  const handleSelectItem = (key: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedItems(newSelected);
  };

  // 全選/取消全選
  const handleSelectAll = () => {
    if (selectedItems.size > 0) {
      setSelectedItems(new Set());
    } else {
      const allItems = new Set([
        ...folders.map(f => `${currentPath}/${f.name}/`),
        ...files.map(f => `${currentPath}/${f.Key}`)
      ]);
      setSelectedItems(allItems);
    }
  };

  // 應用過濾器
  const applyFilters = useCallback((filters: FileFilters) => {
    console.log("原始 applyFilters 函數被調用，過濾條件:", filters);
    
    let filteredFiles = [...files];
    let filteredFolders = [...folders];

    // 搜尋詞過濾
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredFiles = filteredFiles.filter(file => 
        file.Key?.toLowerCase().includes(searchLower)
      );
      filteredFolders = filteredFolders.filter(folder => 
        folder.name.toLowerCase().includes(searchLower)
      );
    }

    // 檔案類型過濾
    if (filters.fileTypes && filters.fileTypes.length > 0) {
      filteredFiles = filteredFiles.filter(file => 
        filters.fileTypes?.includes(file.type || '')
      );
    }

    // 日期範圍過濾
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      filteredFiles = filteredFiles.filter(file => {
        const fileDate = file.LastModified;
        if (!fileDate) return false;
        
        if (startDate && endDate) {
          return fileDate >= startDate && fileDate <= endDate;
        } else if (startDate) {
          return fileDate >= startDate;
        } else if (endDate) {
          return fileDate <= endDate;
        }
        return true;
      });
    }

    // 排序
    if (filters.sortBy) {
      const direction = filters.sortDirection === 'desc' ? -1 : 1;
      filteredFiles.sort((a, b) => {
        switch (filters.sortBy) {
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
    }

    setFilteredItems({ files: filteredFiles, folders: filteredFolders });
  }, [files, folders]);

  // 初始化時立即設置 filteredItems
  useEffect(() => {
    // 確保文件加載後初始化過濾結果
    console.log("初始化 filteredItems", {files: files.length, folders: folders.length});
    setFilteredItems({files, folders});
  }, [files, folders]);

  // 切換星號標記
  const toggleStarred = useCallback(async (key: string) => {
    setStarredItems(prev => {
      const newStarred = new Set(prev);
      if (newStarred.has(key)) {
        newStarred.delete(key);
        toast.info('已取消標記');
      } else {
        newStarred.add(key);
        toast.success('已標記為星號');
      }
      return newStarred;
    });
  }, []);

  // 更新麵包屑
  const updateBreadcrumbs = (path: string) => {
    const pathParts = path.split('/').filter(Boolean);
    const crumbs: string[] = [];
    
    // 累積路徑部分
    let accumulatedPath = '';
    pathParts.forEach(part => {
      accumulatedPath += part + '/';
      crumbs.push(accumulatedPath);
    });
    
    setBreadcrumbs(crumbs);
  };
  
  // 更新最近訪問的資料夾
  const updateRecentFolders = (currentPath: string) => {
    if (!currentPath) return;
    
    // 從本地儲存獲取現有的最近資料夾
    const storedFolders = localStorage.getItem('recentFolders');
    let recent: string[] = storedFolders ? JSON.parse(storedFolders) : [];
    
    // 添加當前路徑，並去重
    if (!recent.includes(currentPath)) {
      recent = [currentPath, ...recent].slice(0, 5); // 保留最近5個
      localStorage.setItem('recentFolders', JSON.stringify(recent));
    }
    
    setRecentFolders(recent);
  };
  
  // 獲取檔案類型
  const getFileType = (filePath: string): string => {
    const extension = filePath.split('.').pop()?.toLowerCase() || '';
    
    const typeMap: Record<string, string> = {
      'pdf': 'pdf',
      'doc': 'document',
      'docx': 'document',
      'xls': 'spreadsheet',
      'xlsx': 'spreadsheet',
      'ppt': 'presentation',
      'pptx': 'presentation',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'mp4': 'video',
      'mov': 'video',
      'mp3': 'audio',
      'wav': 'audio',
      'zip': 'archive',
      'rar': 'archive',
      'txt': 'text',
    };
    
    return typeMap[extension] || 'unknown';
  };

  // 排序處理
  useEffect(() => {
    const sortItems = () => {
      // 創建排序函數
      const sortFn = (a: any, b: any) => {
        let valueA, valueB;
  
        if (sortConfig.key === 'name') {
          valueA = (a.name || a.Key || '').toLowerCase();
          valueB = (b.name || b.Key || '').toLowerCase();
        } else if (sortConfig.key === 'size') {
          valueA = a.Size || a.size || 0;
          valueB = b.Size || b.size || 0;
        } else if (sortConfig.key === 'lastModified') {
          // 對於修改時間，確保使用Date物件進行比較
          valueA = a.LastModified || a.lastModified || new Date(0);
          valueB = b.LastModified || b.lastModified || new Date(0);
          
          // 確保兩個值都是Date物件
          if (!(valueA instanceof Date)) valueA = new Date(valueA);
          if (!(valueB instanceof Date)) valueB = new Date(valueB);
        } else {
          valueA = a[sortConfig.key] || '';
          valueB = b[sortConfig.key] || '';
        }
  
        // 比較值並返回排序結果
        if (valueA < valueB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      };
  
      // 應用排序
      const sortedFolders = [...folders].sort(sortFn);
      const sortedFiles = [...files].sort(sortFn);
  
      // 設置排序後的項目
      setSortedFolders(sortedFolders);
      setSortedFiles(sortedFiles);
    };
  
    sortItems();
  }, [folders, files, sortConfig]);

  const returnObj = {
    files,
    folders,
    isLoading,
    error,
    currentPath,
    parentPath,
    selectedItems,
    totalSize,
    filteredItems,
    loadFiles,
    handleRetry,
    handleEnterFolder,
    handleGoBack,
    handleSelectItem,
    handleSelectAll,
    setCurrentPath,
    setSelectedItems,
    applyFilters,
    starredItems,
    toggleStarred,
    breadcrumbs,
    recentFolders,
    sortConfig,
    setSortConfig,
    sortedFolders,
    sortedFiles
  };
  
  console.log("useFileManager 返回前檢查:", {
    filesCount: files.length,
    foldersCount: folders.length,
    hasApplyFilters: typeof applyFilters === 'function',
    hasFilteredItems: !!filteredItems
  });
  
  // 調試輸出
  console.log("useFileManager 返回對象中 applyFilters 類型:", typeof returnObj.applyFilters);
  
  // 確保 applyFilters 始終是一個函數
  if (typeof returnObj.applyFilters !== 'function') {
    console.error("applyFilters 未正確初始化，設置為空函數");
    returnObj.applyFilters = (filters: FileFilters) => {
      console.log("使用備用 applyFilters 函數", filters);
      setFilteredItems({ files, folders });
    };
  }
  
  return returnObj;
}; 