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

      const { files: fileList, folders: folderList, parentPath: parent } = await listFilesInFolder(currentPath);
      
      setFiles(fileList.map(file => ({
        ...file,
        type: file.Key?.split('.').pop() || 'unknown'
      })));
      setFolders(folderList.map(folder => ({
        ...folder,
        type: 'folder' as const
      })));
      setParentPath(parent);
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

  // 計算總大小
  useEffect(() => {
    const size = files.reduce((sum, file) => sum + (file.Size || 0), 0);
    setTotalSize(size);
  }, [files]);

  // 處理麵包屑
  useEffect(() => {
    if (!currentPath) {
      setBreadcrumbs([]);
      return;
    }
    
    const pathParts = currentPath.split('/').filter(Boolean);
    const breadcrumbPaths: string[] = [];
    
    let currentBreadcrumb = '';
    for (const part of pathParts) {
      currentBreadcrumb = currentBreadcrumb ? `${currentBreadcrumb}/${part}` : part;
      breadcrumbPaths.push(currentBreadcrumb);
    }
    
    setBreadcrumbs(breadcrumbPaths);
  }, [currentPath]);

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
    if (parentPath !== null) {
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
    recentFolders
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