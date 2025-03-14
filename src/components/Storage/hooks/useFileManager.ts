import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { listFilesInFolder } from '@/services/storage/s3';
import { FileItem, FolderItem, FileManagerReturn } from '@/components/storage/types';

export const useFileManager = (): FileManagerReturn => {
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

  return {
    files,
    folders,
    isLoading,
    error,
    currentPath,
    parentPath,
    selectedItems,
    totalSize,
    loadFiles,
    handleRetry,
    handleEnterFolder,
    handleGoBack,
    handleSelectItem,
    handleSelectAll,
    setCurrentPath,
    setSelectedItems
  };
}; 