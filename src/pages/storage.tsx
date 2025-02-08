import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { 
  listFilesInFolder,
  uploadFile, 
  deleteFile, 
  deleteFolder,
  deleteMultipleFiles,
  getFileDownloadUrl, 
  getStorageStats, 
  testCORSConfiguration,
  createFolder,
  formatDateTime,
  S3File 
} from '@/services/storage/s3';
import { formatFileSize, getFileTypeIcon } from '@/config/s3-config';
import { S3_CONFIG } from '@/config/s3-config';

// 檔案類型介面
interface FileItem extends S3File {
  type: string;
}

// 資料夾介面
interface FolderItem {
  name: string;
  size: number;
  lastModified: Date;
}

// 儲存統計介面
interface StorageStats {
  usedSpace: string;
  totalSpace: string;
  fileCount: number;
  sharedCount: number;
}

export default function Storage() {
  // 狀態管理
  const [files, setFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState<StorageStats>({
    usedSpace: '0 B',
    totalSpace: '0 B',
    fileCount: 0,
    sharedCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const maxRetries = 3;
  const retryDelay = 2000;
  const [currentPath, setCurrentPath] = useState('');
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'file' | 'folder', path: string} | null>(null);

  // 載入檔案列表
  const loadFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 檢查網路連接
      if (!navigator.onLine) {
        throw new Error('網路連線已斷開，請檢查您的網路狀態');
      }

      const { files: fileList, folders: folderList, parentPath: parent } = await listFilesInFolder(currentPath);
      const stats = await getStorageStats();
      
      setFiles(fileList.map(file => ({
        ...file,
        type: file.Key.split('.').pop() || 'unknown'
      })));
      setFolders(folderList);
      setParentPath(parent);
      setStats(stats);
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

  // 檢查 CORS 配置
  useEffect(() => {
    const checkCORSConfig = async () => {
      try {
        const isValid = await testCORSConfiguration();
        if (!isValid) {
          toast.error('CORS 配置檢查失敗，部分功能可能無法正常使用');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'CORS 配置檢查失敗';
        console.error('CORS 配置檢查失敗:', error);
        
        if (errorMessage.includes('網路') || errorMessage.includes('連線')) {
          toast.error(`${errorMessage}，請檢查網路連接`);
        } else if (errorMessage.includes('CORS')) {
          toast.error(`${errorMessage}，請聯絡系統管理員`);
        } else {
          toast.error(errorMessage);
        }
      }
    };

    if (navigator.onLine) {
      checkCORSConfig();
    }
  }, []);

  // 初始載入
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // 檔案上傳處理
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.error('請選擇要上傳的檔案');
      return;
    }

    // 檢查檔案大小
    const oversizedFiles = acceptedFiles.filter(file => file.size > S3_CONFIG.maxFileSize);
    if (oversizedFiles.length > 0) {
      toast.error(`以下檔案超過大小限制 (${formatFileSize(S3_CONFIG.maxFileSize)}):\n${oversizedFiles.map(f => f.name).join('\n')}`);
      return;
    }

    // 檢查檔案類型
    const allowedTypes = Object.values(S3_CONFIG.allowedFileTypes).flat();
    const invalidFiles = acceptedFiles.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error(`不支援的檔案類型:\n${invalidFiles.map(f => f.name).join('\n')}`);
      return;
    }

    // 顯示上傳進度
    toast.info(`開始上傳 ${acceptedFiles.length} 個檔案...`);
    
    const uploadPromises = acceptedFiles.map(async (file) => {
      try {
        const key = `${Date.now()}-${file.name}`;
        await uploadFile(file, key);
        toast.success(`檔案 ${file.name} 上傳成功`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `檔案 ${file.name} 上傳失敗`;
        if (errorMessage.includes('網路') || errorMessage.includes('連線') || errorMessage.includes('逾時')) {
          toast.error(`${file.name} 上傳失敗: ${errorMessage}，請重試`);
        } else {
          toast.error(errorMessage);
        }
        throw error;
      }
    });

    try {
      await Promise.all(uploadPromises);
      loadFiles(); // 重新載入檔案列表
    } catch (error) {
      console.error('部分檔案上傳失敗:', error);
    }
  }, [loadFiles]);

  // 設置檔案拖放區域
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: Object.values(S3_CONFIG.allowedFileTypes).flat().reduce((acc, type) => ({
      ...acc,
      [type]: []
    }), {}),
    maxSize: S3_CONFIG.maxFileSize,
    noClick: true, // 禁用點擊打開檔案選擇器
    noKeyboard: true // 禁用鍵盤打開檔案選擇器
  });

  // 檔案下載處理
  const handleDownload = async (key: string, fileName: string) => {
    try {
      const url = await getFileDownloadUrl(key);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '檔案下載失敗');
      console.error('檔案下載失敗:', error);
    }
  };

  // 檔案刪除處理
  const handleDelete = async (key: string) => {
    if (window.confirm('確定要刪除此檔案嗎？')) {
      try {
        await deleteFile(key);
        toast.success('檔案刪除成功');
        loadFiles(); // 重新載入檔案列表
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '檔案刪除失敗');
        console.error('檔案刪除失敗:', error);
      }
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

  // 批次刪除處理
  const handleBatchDelete = async () => {
    if (selectedItems.size === 0) return;

    if (window.confirm(`確定要刪除選中的 ${selectedItems.size} 個項目嗎？`)) {
      try {
        const itemsArray = Array.from(selectedItems);
        const folderItems = itemsArray.filter(item => item.endsWith('/'));
        const fileItems = itemsArray.filter(item => !item.endsWith('/'));

        // 刪除資料夾
        const folderPromises = folderItems.map(folder => 
          deleteFolder(folder.slice(0, -1))
        );

        // 刪除檔案
        const filePromises = fileItems.length > 0 ? 
          [deleteMultipleFiles(fileItems)] : [];

        await Promise.all([...folderPromises, ...filePromises]);
        
        toast.success('批次刪除成功');
        setSelectedItems(new Set());
        loadFiles();
      } catch (error) {
        toast.error('批次刪除失敗');
        console.error('批次刪除失敗:', error);
      }
    }
  };

  // 刪除資料夾處理
  const handleDeleteFolder = async (folderName: string) => {
    setItemToDelete({
      type: 'folder',
      path: currentPath ? `${currentPath}/${folderName}` : folderName
    });
    setIsDeleteConfirmOpen(true);
  };

  // 確認刪除處理
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      let success = false;
      if (itemToDelete.type === 'folder') {
        success = await deleteFolder(itemToDelete.path);
      } else {
        success = await deleteFile(itemToDelete.path);
      }

      if (success) {
        toast.success(`${itemToDelete.type === 'folder' ? '資料夾' : '檔案'}刪除成功`);
        loadFiles();
      }
    } catch (error) {
      toast.error(`${itemToDelete.type === 'folder' ? '資料夾' : '檔案'}刪除失敗`);
      console.error('刪除失敗:', error);
    } finally {
      setIsDeleteConfirmOpen(false);
      setItemToDelete(null);
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
      switch (sortBy) {
        case 'name':
          return (a.Key || '').localeCompare(b.Key || '');
        case 'date':
          return (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0);
        case 'size':
          return (b.Size || 0) - (a.Size || 0);
        default:
          return 0;
      }
    });

  // 分頁處理
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 建立資料夾
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('請輸入資料夾名稱');
      return;
    }

    try {
      const folderPath = currentPath 
        ? `${currentPath}/${newFolderName.trim()}`
        : newFolderName.trim();

      const success = await createFolder(folderPath);
      if (success) {
        toast.success('資料夾建立成功');
        setNewFolderName('');
        setIsCreatingFolder(false);
        loadFiles();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '建立資料夾失敗');
    }
  };

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

  return (
    <div className="flex-1 bg-background-secondary p-8">
      {/* 頁面標題與麵包屑導航 */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-text-secondary mb-4">
          <Link href="/" className="hover:text-accent-color transition-colors">首頁</Link>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-text-primary">檔案儲存</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">檔案儲存</h1>
            <p className="text-text-secondary mt-1">管理與儲存重要文件檔案</p>
          </div>
          <div className="flex items-center space-x-4">
            <div {...getRootProps()} className="relative flex-1">
              <input {...getInputProps()} />
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isDragActive ? 'border-accent-color bg-accent-color/10' : 'border-border-color'
              }`}>
                {isDragActive ? (
                  <p className="text-accent-color">拖放檔案至此上傳</p>
                ) : (
                  <p className="text-text-secondary">
                    拖放檔案至此，或
                    <button
                      onClick={open}
                      className="text-accent-color hover:text-accent-hover mx-1"
                    >
                      點擊選擇檔案
                    </button>
                    上傳
                  </p>
                )}
                <p className="text-sm text-text-secondary mt-2">
                  支援的檔案類型：PDF、Word、Excel、圖片、影片<br />
                  單檔最大限制：{formatFileSize(S3_CONFIG.maxFileSize)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 資料夾路徑導航 */}
      <div className="bg-background-primary rounded-xl shadow-sm mb-6 p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPath('')}
            className="text-accent-color hover:underline"
          >
            根目錄
          </button>
          {currentPath.split('/').map((folder, index, array) => (
            <div key={index} className="flex items-center">
              <span className="mx-2 text-text-secondary">/</span>
              <button
                onClick={() => setCurrentPath(array.slice(0, index + 1).join('/'))}
                className="text-accent-color hover:underline"
              >
                {folder}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-4">
          {parentPath !== null && (
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-background-primary text-text-primary rounded-lg hover:bg-hover-color transition-colors flex items-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
              返回上層
            </button>
          )}
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="px-4 py-2 bg-accent-color text-white rounded-lg hover:bg-accent-hover transition-colors flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            新增資料夾
          </button>
        </div>
      </div>

      {/* 建立資料夾對話框 */}
      {isCreatingFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background-primary rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4">建立新資料夾</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="輸入資料夾名稱"
              className="w-full px-3 py-2 border border-border-color rounded-lg mb-4
                     focus:outline-none focus:ring-2 focus:ring-accent-color"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-text-primary hover:bg-hover-color rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-accent-color text-white rounded-lg hover:bg-accent-hover transition-colors"
              >
                建立
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批次操作按鈕 */}
      {selectedItems.size > 0 && (
        <div className="mb-4 flex justify-between items-center bg-background-primary rounded-xl p-4">
          <div className="flex items-center">
            <span className="text-text-primary">已選擇 {selectedItems.size} 個項目</span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedItems(new Set())}
              className="px-4 py-2 text-text-primary hover:bg-hover-color rounded-lg transition-colors"
            >
              取消選擇
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-4 py-2 bg-error-color text-white rounded-lg hover:bg-error-hover transition-colors"
            >
              批次刪除
            </button>
          </div>
        </div>
      )}

      {/* 儲存空間統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { title: '已使用空間', value: stats.usedSpace, color: 'accent', icon: '💾' },
          { title: '剩餘空間', value: stats.totalSpace, color: 'success', icon: '📊' },
          { title: '檔案總數', value: stats.fileCount.toString(), color: 'warning', icon: '📁' },
          { title: '共享檔案', value: stats.sharedCount.toString(), color: 'info', icon: '🔗' },
        ].map((stat) => (
          <div key={stat.title} className={`bg-background-primary rounded-xl shadow-sm p-6 border-l-4 ${
            stat.color === 'accent' ? 'border-accent-color' :
            stat.color === 'success' ? 'border-success-color' :
            stat.color === 'warning' ? 'border-warning-color' :
            'border-info-color'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-secondary text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold text-text-primary mt-1">{stat.value}</h3>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 搜尋和篩選區 */}
      <div className="bg-background-primary rounded-xl shadow-sm mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <input
                type="text"
                placeholder="搜尋檔案..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background-primary border border-border-color rounded-lg
                       text-text-primary placeholder-text-secondary
                       focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5 text-text-secondary">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full px-3 py-2 bg-background-primary border border-border-color rounded-lg
                             text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                <option value="">所有類型</option>
                <option value="pdf">PDF</option>
                <option value="doc">Word</option>
                <option value="xls">Excel</option>
                <option value="jpg">圖片</option>
                <option value="mp4">影片</option>
              </select>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-background-primary border border-border-color rounded-lg
                             text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                <option value="name">名稱</option>
                <option value="date">日期</option>
                <option value="size">大小</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 檔案列表 */}
      <div className="bg-background-primary rounded-xl shadow-sm">
        <div className="p-6">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color mb-4"></div>
                {isRetrying && (
                  <p className="text-text-secondary">
                    正在重新連線... ({retryCount}/{maxRetries})
                  </p>
                )}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-error-color mb-4">{error}</div>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-accent-color text-white rounded-lg hover:bg-accent-hover transition-colors"
                >
                  重試
                </button>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-border-color">
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.size > 0}
                        onChange={handleSelectAll}
                        className="rounded border-border-color text-accent-color focus:ring-accent-color"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-text-primary">名稱</th>
                    <th className="px-6 py-3 text-left text-text-primary">類型</th>
                    <th className="px-6 py-3 text-left text-text-primary">大小</th>
                    <th className="px-6 py-3 text-left text-text-primary">修改時間</th>
                    <th className="px-6 py-3 text-left text-text-primary">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 資料夾列表 */}
                  {folders.map((folder, index) => {
                    const folderPath = `${currentPath}/${folder.name}/`;
                    return (
                      <tr key={`folder-${index}`} className="border-b border-border-color hover:bg-hover-color transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(folderPath)}
                            onChange={() => handleSelectItem(folderPath)}
                            className="rounded border-border-color text-accent-color focus:ring-accent-color"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleEnterFolder(folder.name)}
                            className="flex items-center text-accent-color hover:underline"
                          >
                            <span>{folder.name}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-text-primary">資料夾</td>
                        <td className="px-6 py-4 text-text-primary">{formatFileSize(folder.size)}</td>
                        <td className="px-6 py-4 text-text-primary">
                          {formatDateTime(folder.lastModified)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEnterFolder(folder.name)}
                              className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-accent-color transition-colors"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteFolder(folder.name)}
                              className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-error-color transition-colors"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* 檔案列表 */}
                  {paginatedFiles.map((file, index) => {
                    const fileName = file.Key?.split('/').pop() || '';
                    const filePath = `${currentPath}/${file.Key}`;
                    return (
                      <tr key={index} className="border-b border-border-color hover:bg-hover-color transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(filePath)}
                            onChange={() => handleSelectItem(filePath)}
                            className="rounded border-border-color text-accent-color focus:ring-accent-color"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-text-primary">{fileName}</span>
                        </td>
                        <td className="px-6 py-4 text-text-primary">{file.type.toUpperCase()}</td>
                        <td className="px-6 py-4 text-text-primary">{formatFileSize(file.Size)}</td>
                        <td className="px-6 py-4 text-text-primary">
                          {file.LastModified ? formatDateTime(file.LastModified) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDownload(file.Key || '', fileName)}
                              className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-accent-color transition-colors"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setItemToDelete({type: 'file', path: file.Key || ''});
                                setIsDeleteConfirmOpen(true);
                              }}
                              className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-error-color transition-colors"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* 分頁控制 */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-text-secondary">
              顯示 {(currentPage - 1) * itemsPerPage + 1} 至 {Math.min(currentPage * itemsPerPage, filteredFiles.length)} 筆，共 {filteredFiles.length} 筆
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors disabled:opacity-50"
              >
                上一頁
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === pageNumber
                        ? 'bg-accent-color text-white'
                        : 'border border-border-color text-text-secondary hover:bg-hover-color'
                    } transition-colors`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="px-3 py-1">...</span>}
              {totalPages > 5 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-3 py-1 rounded-lg border border-border-color text-text-secondary hover:bg-hover-color transition-colors`}
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors disabled:opacity-50"
              >
                下一頁
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 刪除確認對話框 */}
      {isDeleteConfirmOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background-primary rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4">確認刪除</h3>
            <p className="text-text-primary mb-6">
              確定要刪除此{itemToDelete.type === 'folder' ? '資料夾' : '檔案'}嗎？
              {itemToDelete.type === 'folder' && '（包含資料夾內的所有檔案）'}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 text-text-primary hover:bg-hover-color rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-error-color text-white rounded-lg hover:bg-error-hover transition-colors"
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
