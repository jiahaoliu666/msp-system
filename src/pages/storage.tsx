import { useState, useEffect, useCallback, useRef } from 'react';
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
  getFilePreviewUrl,
  testCORSConfiguration,
  createFolder,
  formatDateTime,
  S3File,
  moveFile,
  copyFile,
  renameFile,
  generateShareLink,
  getStorageQuota,
  batchOperation,
  isPreviewable
} from '@/services/storage/s3';
import { 
  formatFileSize, 
  getFileTypeIcon, 
  PREVIEW_CONFIG,
  CONTEXT_MENU_CONFIG,
  STATUS_BAR_CONFIG 
} from '@/config/s3-config';
import { S3_CONFIG } from '@/config/s3-config';

// 檔案類型介面
interface FileItem {
  Key?: string;
  LastModified?: Date;
  Size?: number;
  ETag?: string;
  type: string;
}

// 資料夾介面
interface FolderItem {
  name: string;
  type: 'folder';
  size: number;
  lastModified: Date;
  Key?: string;
}

// 空狀態組件
const EmptyState = ({ type, searchTerm }: { type: 'search' | 'folder', searchTerm?: string }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="text-7xl mb-6 animate-bounce-slow">
      {type === 'search' ? '🔍' : '📂'}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
      {type === 'search' 
        ? `找不到與 "${searchTerm}" 相關的內容`
        : '此資料夾是空的'}
    </h3>
    <p className="text-base text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
      {type === 'search'
        ? '請嘗試使用其他關鍵字搜尋，或檢查拼字是否正確'
        : '您可以拖放檔案至此處，或使用下方按鈕上傳檔案'}
    </p>
    {type === 'folder' && (
      <button
        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                 transform hover:scale-105 transition-all duration-200 
                 shadow-lg hover:shadow-xl flex items-center space-x-2 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>上傳檔案</span>
      </button>
    )}
  </div>
);

// 檔案上傳進度組件
const UploadProgress = ({ progress }: { progress: number }) => (
  <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-5 w-96
                  transform transition-all duration-300 ease-in-out
                  border border-gray-200 dark:border-gray-700">
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center space-x-3">
        <div className="animate-pulse">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3-3m3 3V8" />
          </svg>
        </div>
        <span className="font-medium text-gray-800 dark:text-gray-200">正在上傳檔案...</span>
      </div>
      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{progress}%</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300
                   transform origin-left scale-x-100"
        style={{ width: `${progress}%` }}
      />
    </div>
    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
      請勿關閉視窗，上傳完成後會自動更新
    </div>
  </div>
);

// 在需要處理 undefined 的地方直接進行檢查
const getFormattedSize = (size: number | undefined): string => {
  if (size === undefined || size === 0) return '0 B';
  return formatFileSize(size);
};

// 檔案預覽組件
const FilePreview: React.FC<{
  file: FileItem;
  onClose: () => void;
}> = ({ file, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const url = await getFilePreviewUrl(file.Key || '');
        setPreviewUrl(url);
      } catch (error) {
        setError('無法載入預覽');
        console.error('預覽載入失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [file]);

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">載入中...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-red-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-lg font-medium">{error}</div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">請稍後再試或聯絡系統管理員</div>
        </div>
      );
    }

    const extension = file.Key?.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type;

    if (PREVIEW_CONFIG.supportedTypes.images.includes(mimeType)) {
      return (
        <div className="relative group">
          <img 
            src={previewUrl} 
            alt={file.Key} 
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg"></div>
        </div>
      );
    }

    if (PREVIEW_CONFIG.supportedTypes.documents.includes(mimeType)) {
      return (
        <iframe 
          src={previewUrl} 
          className="w-full h-[70vh] border-0 rounded-lg shadow-lg"
          title={file.Key}
        />
      );
    }

    if (PREVIEW_CONFIG.supportedTypes.videos.includes(mimeType)) {
      return (
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <video 
            src={previewUrl} 
            controls 
            className="max-w-full max-h-[70vh] bg-black"
          >
            您的瀏覽器不支援影片播放
          </video>
        </div>
      );
    }

    if (PREVIEW_CONFIG.supportedTypes.audio.includes(mimeType)) {
      return (
        <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <svg className="w-20 h-20 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <audio 
            src={previewUrl} 
            controls 
            className="w-full"
          >
            您的瀏覽器不支援音訊播放
          </audio>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-600 dark:text-gray-400">
        <svg className="w-20 h-20 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-lg font-medium">不支援此檔案類型的預覽</div>
        <div className="mt-2 text-sm">您可以下載檔案後在本機開啟</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-5xl w-full max-h-[90vh] 
                    transform transition-all duration-300 ease-out scale-100 opacity-100
                    border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{file.Key}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {formatFileSize(file.Size || 0)} · {formatDateTime(file.LastModified || new Date())}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors
                     text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="preview-content overflow-auto max-h-[calc(90vh-120px)] rounded-lg">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

// 右鍵選單組件
const ContextMenu: React.FC<{
  file: FileItem;
  position: { x: number; y: number };
  onClose: () => void;
  onAction: (action: string) => void;
}> = ({ file, position, onClose, onAction }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAction = (action: string) => {
    onAction(action);
    onClose();
  };

  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - (menuRef.current?.offsetWidth || 0) - 16),
    y: Math.min(position.y, window.innerHeight - (menuRef.current?.offsetHeight || 0) - 16)
  };

  const menuItems = [
    {
      id: 'preview',
      label: '預覽',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      id: 'download',
      label: '下載',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L7 8m4-4v12" />
        </svg>
      )
    },
    {
      id: 'copy-link',
      label: '複製連結',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    {
      id: 'share-email',
      label: '透過電子郵件分享',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'rename',
      label: '重新命名',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      id: 'delete',
      label: '刪除',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      danger: true
    }
  ];

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 w-56
                transform transition-all duration-100 ease-out scale-100 opacity-100
                border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700"
      style={{ 
        top: adjustedPosition.y,
        left: adjustedPosition.x,
        zIndex: 1000
      }}
    >
      {menuItems.map((item, index) => (
        <button
          key={item.id}
          onClick={() => handleAction(item.id)}
          className={`w-full px-4 py-2 text-left flex items-center space-x-3
                    ${item.danger 
                      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'}
                    transition-colors duration-150 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700/50`}
        >
          <span className={`flex-shrink-0 ${item.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {item.icon}
          </span>
          <span className="flex-grow">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

// 狀態欄組件
const StatusBar: React.FC<{
  selectedItems: Set<string>;
  totalItems: number;
  totalSize: number;
  uploadProgress?: number;
  currentOperation?: string;
}> = ({ selectedItems, totalItems, totalSize, uploadProgress, currentOperation }) => {
  const [quota, setQuota] = useState<{ used: number; total: number } | null>(null);

  useEffect(() => {
    const loadQuota = async () => {
      try {
        const quotaData = await getStorageQuota();
        setQuota(quotaData);
      } catch (error) {
        console.error('無法載入儲存空間資訊:', error);
      }
    };

    if (STATUS_BAR_CONFIG.showQuota) {
      loadQuota();
      const interval = setInterval(loadQuota, STATUS_BAR_CONFIG.refreshInterval);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t 
                    border-gray-200 dark:border-gray-700 px-4 py-2 z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              已選擇: {selectedItems.size} / {totalItems} 個項目
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              總大小: {formatFileSize(totalSize)}
            </span>
            {quota && STATUS_BAR_CONFIG.showQuota && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  儲存空間: {formatFileSize(quota.used)} / {formatFileSize(quota.total)}
                </span>
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${(quota.used / quota.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-6">
            {uploadProgress !== undefined && STATUS_BAR_CONFIG.showUploadProgress && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  上傳進度: {uploadProgress}%
                </span>
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            {currentOperation && STATUS_BAR_CONFIG.showOperationStatus && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentOperation}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Storage() {
  // 狀態管理
  const [files, setFiles] = useState<FileItem[]>([]);
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedOver, setDraggedOver] = useState(false);
  const [duplicateFile, setDuplicateFile] = useState<{
    file: File;
    existingKey: string;
    newKey: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    file: FileItem;
    position: { x: number; y: number };
  } | null>(null);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [totalSize, setTotalSize] = useState<number>(0);

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

  // 計算總大小
  useEffect(() => {
    const size = files.reduce((sum, file) => sum + (file.Size || 0), 0);
    setTotalSize(size);
  }, [files]);

  // 檔案上傳處理
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.error('請選擇要上傳的檔案');
      return;
    }

    // 檢查檔案大小
    const oversizedFiles = acceptedFiles.filter(file => file.size > S3_CONFIG.maxFileSize);
    if (oversizedFiles.length > 0) {
      toast.error(`以下檔案超過大小限制 (${getFormattedSize(S3_CONFIG.maxFileSize)}):\n${oversizedFiles.map(f => f.name).join('\n')}`);
      return;
    }

    // 檢查檔案類型
    const allowedTypes = Object.values(S3_CONFIG.allowedFileTypes).flat();
    const invalidFiles = acceptedFiles.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error(`不支援的檔案類型:\n${invalidFiles.map(f => f.name).join('\n')}`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const progress = Math.round((i / acceptedFiles.length) * 100);
        setUploadProgress(progress);

        // 檢查是否有同名檔案
        const fileName = file.name;
        const existingFile = files.find(f => f.Key === fileName);
        
        if (existingFile) {
          // 如果有同名檔案，設置重複檔案狀態並等待用戶選擇
          setDuplicateFile({
            file,
            existingKey: existingFile.Key || '',
            newKey: fileName
          });
          // 等待用戶選擇
          await new Promise(resolve => {
            const unsubscribe = setInterval(() => {
              if (!duplicateFile) {
                clearInterval(unsubscribe);
                resolve(true);
              }
            }, 100);
          });
          continue;
        }

        const key = `${currentPath ? currentPath + '/' : ''}${fileName}`;
        await uploadFile(file, key);
      }

      setUploadProgress(100);
      toast.success(`成功上傳 ${acceptedFiles.length} 個檔案`);
      loadFiles();
    } catch (error) {
      toast.error('檔案上傳失敗');
      console.error('檔案上傳失敗:', error);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [currentPath, loadFiles, files, duplicateFile]);

  // 處理檔案重複的選擇
  const handleDuplicateFile = async (action: 'replace' | 'keep-both' | 'skip') => {
    if (!duplicateFile) return;

    try {
      const { file, existingKey, newKey } = duplicateFile;
      
      switch (action) {
        case 'replace':
          // 刪除舊檔案並上傳新檔案
          await deleteFile(existingKey);
          await uploadFile(file, `${currentPath ? currentPath + '/' : ''}${newKey}`);
          break;
        case 'keep-both':
          // 使用新的檔名上傳
          const ext = newKey.split('.').pop();
          const baseName = newKey.slice(0, -(ext?.length || 0) - 1);
          const newFileName = `${baseName} (${new Date().getTime()}).${ext}`;
          await uploadFile(file, `${currentPath ? currentPath + '/' : ''}${newFileName}`);
          break;
        case 'skip':
          // 不做任何事
          break;
      }

      setDuplicateFile(null);
      loadFiles();
    } catch (error) {
      toast.error('處理重複檔案失敗');
      console.error('處理重複檔案失敗:', error);
    }
  };

  // 設置檔案拖放區域
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.values(S3_CONFIG.allowedFileTypes).flat().reduce((acc, type) => ({
      ...acc,
      [type]: []
    }), {}),
    maxSize: S3_CONFIG.maxFileSize,
    onDragEnter: () => setDraggedOver(true),
    onDragLeave: () => setDraggedOver(false),
    onDropAccepted: () => setDraggedOver(false),
    onDropRejected: () => {
      setDraggedOver(false);
      toast.error('不支援的檔案類型或檔案過大');
    },
    noClick: true
  });

  // 檔案上傳按鈕點擊處理
  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = Object.values(S3_CONFIG.allowedFileTypes).flat().join(',');
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      await onDrop(files);
    };
    input.click();
  };

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

  // 全部刪除處理
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
        
        toast.success('全部刪除成功');
        setSelectedItems(new Set());
        loadFiles();
      } catch (error) {
        toast.error('全部刪除失敗');
        console.error('全部刪除失敗:', error);
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

  // 檔案預覽處理
  const handleFilePreview = (file: FileItem) => {
    setSelectedFile(file);
  };

  // 檔案選單處理
  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setSelectedFile(file);
    setShowFileMenu(true);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  // 排序處理
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 處理右鍵菜單動作
  const handleContextMenuAction = async (action: string) => {
    if (!contextMenu?.file) return;

    const file = contextMenu.file;
    setCurrentOperation(`正在處理: ${action}`);

    try {
      switch (action) {
        case 'preview':
          if (isPreviewable(file.Key || '')) {
            setPreviewFile(file);
          } else {
            toast.warning('此檔案類型不支援預覽');
          }
          break;

        case 'download':
          await handleDownload(file.Key || '', file.Key?.split('/').pop() || '');
          break;

        case 'copy-link':
          const shareUrl = await generateShareLink(file.Key || '');
          await navigator.clipboard.writeText(shareUrl);
          toast.success('已複製分享連結');
          break;

        case 'share-email':
          const mailtoUrl = `mailto:?subject=分享檔案：${file.Key}&body=請使用以下連結下載檔案：%0D%0A${await generateShareLink(file.Key || '')}`;
          window.open(mailtoUrl);
          break;

        case 'move':
          // 實現移動檔案的邏輯
          break;

        case 'copy':
          // 實現複製檔案的邏輯
          break;

        case 'rename':
          // 實現重命名的邏輯
          break;

        case 'delete':
          setItemToDelete({
            type: file.type === 'folder' ? 'folder' : 'file',
            path: file.Key || ''
          });
          setIsDeleteConfirmOpen(true);
          break;
      }
    } catch (error) {
      toast.error('操作失敗');
      console.error('操作失敗:', error);
    } finally {
      setCurrentOperation('');
    }
  };

  // 檔案列表渲染
  const renderFileList = () => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {folders.map((folder: FolderItem, index: number) => (
            <div
              key={`folder-${index}`}
              className="relative group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                               dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 
                               hover:shadow-md transition-all duration-200"
              onContextMenu={(e) => handleContextMenu(e, folder as FileItem)}
            >
              <div className="p-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 flex items-center justify-center text-4xl mb-3 
                                        text-blue-600 dark:text-blue-400">
                    📁
                  </div>
                  <div className="w-full">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 
                                          text-center truncate">
                      {folder.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                      {getFormattedSize(folder.size)}
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDeleteFolder(folder.name)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                                     text-gray-500 dark:text-gray-400 hover:text-red-600 
                                     dark:hover:text-red-400 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleEnterFolder(folder.name)}
                className="absolute inset-0 w-full h-full cursor-pointer z-10"
              />
            </div>
          ))}
          {paginatedFiles.map((file: FileItem, index: number) => (
            <div
              key={`file-${index}`}
              className="relative group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                               dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 
                               hover:shadow-md transition-all duration-200"
              onContextMenu={(e) => handleContextMenu(e, file)}
              onDoubleClick={() => handleFilePreview(file)}
            >
              <div className="p-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 flex items-center justify-center text-4xl mb-3 
                                        text-gray-600 dark:text-gray-400">
                    {getFileTypeIcon(file.Key?.split('/').pop() || '')}
                  </div>
                  <div className="w-full">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 
                                          text-center truncate">
                      {file.Key?.split('/').pop() || ''}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                      {getFormattedSize(file.Size)}
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 
                                      transition-opacity flex space-x-1">
                  <button
                    onClick={() => handleDownload(file.Key || '', file.Key?.split('/').pop() || '')}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                                     text-gray-500 dark:text-gray-400 hover:text-blue-600 
                                     dark:hover:text-blue-400 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L7 8m4-4v12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete({
                        type: 'file',
                        path: file.Key || ''
                      });
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                                     text-gray-500 dark:text-gray-400 hover:text-red-600 
                                     dark:hover:text-red-400 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="w-[40px] px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedItems.size > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 
                                 focus:ring-blue-500 dark:border-gray-600 
                                 dark:bg-gray-700 dark:checked:border-blue-500 
                                 dark:checked:bg-blue-500 dark:focus:ring-offset-gray-800"
              />
            </th>
            <th 
              onClick={() => handleSort('name')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 
                               dark:text-gray-400 uppercase tracking-wider cursor-pointer 
                               hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex items-center space-x-1">
                <span>名稱</span>
                {sortConfig.key === 'name' && (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d={sortConfig.direction === 'asc' 
                            ? "M8 7l4-4m0 0l4 4m-4-4v18" 
                            : "M16 17l-4 4m0 0l-4-4m4 4V3"} 
                    />
                  </svg>
                )}
              </div>
            </th>
            <th 
              onClick={() => handleSort('type')}
              className="w-[120px] px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-hover-color"
            >
              <div className="flex items-center space-x-1">
                <span>類型</span>
                {sortConfig.key === 'type' && (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={sortConfig.direction === 'asc' 
                        ? "M8 7l4-4m0 0l4 4m-4-4v18" 
                        : "M16 17l-4 4m0 0l-4-4m4 4V3"} 
                    />
                  </svg>
                )}
              </div>
            </th>
            <th 
              onClick={() => handleSort('size')}
              className="w-[120px] px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-hover-color"
            >
              <div className="flex items-center space-x-1">
                <span>大小</span>
                {sortConfig.key === 'size' && (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={sortConfig.direction === 'asc' 
                        ? "M8 7l4-4m0 0l4 4m-4-4v18" 
                        : "M16 17l-4 4m0 0l-4-4m4 4V3"} 
                    />
                  </svg>
                )}
              </div>
            </th>
            <th 
              onClick={() => handleSort('date')}
              className="w-[180px] px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-hover-color"
            >
              <div className="flex items-center space-x-1">
                <span>修改時間</span>
                {sortConfig.key === 'date' && (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={sortConfig.direction === 'asc' 
                        ? "M8 7l4-4m0 0l4 4m-4-4v18" 
                        : "M16 17l-4 4m0 0l-4-4m4 4V3"} 
                    />
                  </svg>
                )}
              </div>
            </th>
            <th className="w-[120px] px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {/* 資料夾列表 */}
          {folders.map((folder, index) => (
            <tr 
              key={`folder-${index}`} 
              className="group hover:bg-hover-color transition-colors"
              onContextMenu={(e) => handleContextMenu(e, { ...folder, type: 'folder' } as FileItem)}
            >
              <td className="px-6 py-4 align-middle">
                <input
                  type="checkbox"
                  checked={selectedItems.has(`${currentPath}/${folder.name}/`)}
                  onChange={() => handleSelectItem(`${currentPath}/${folder.name}/`)}
                  className="rounded border-border-color text-accent-color focus:ring-accent-color"
                />
              </td>
              <td className="px-6 py-4 align-middle">
                <button
                  onClick={() => handleEnterFolder(folder.name)}
                  className="flex items-center text-accent-color hover:underline"
                >
                  <span className="font-medium">{folder.name}</span>
                </button>
              </td>
              <td className="px-6 py-4 align-middle text-text-secondary">資料夾</td>
              <td className="px-6 py-4 align-middle text-text-secondary">{getFormattedSize(folder.size)}</td>
              <td className="px-6 py-4 align-middle text-text-secondary">
                {formatDateTime(folder.lastModified)}
              </td>
              <td className="px-6 py-4 align-middle">
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDeleteFolder(folder.name)}
                    className="p-2 hover:bg-background-secondary rounded-lg text-text-secondary hover:text-error-color transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {/* 檔案列表 */}
          {paginatedFiles.map((file, index) => (
            <tr 
              key={index} 
              className="group hover:bg-hover-color transition-colors"
              onContextMenu={(e) => handleContextMenu(e, file)}
              onDoubleClick={() => handleFilePreview(file)}
            >
              <td className="px-6 py-4 align-middle">
                <input
                  type="checkbox"
                  checked={selectedItems.has(`${currentPath}/${file.Key}`)}
                  onChange={() => handleSelectItem(`${currentPath}/${file.Key}`)}
                  className="rounded border-border-color text-accent-color focus:ring-accent-color"
                />
              </td>
              <td className="px-6 py-4 align-middle">
                <div className="flex items-center">
                  <span className="font-medium text-text-primary">{file.Key?.split('/').pop() || ''}</span>
                </div>
              </td>
              <td className="px-6 py-4 align-middle text-text-secondary">{file.type.toUpperCase()}</td>
              <td className="px-6 py-4 align-middle text-text-secondary">{getFormattedSize(file.Size)}</td>
              <td className="px-6 py-4 align-middle text-text-secondary">
                {file.LastModified ? formatDateTime(file.LastModified) : '-'}
              </td>
              <td className="px-6 py-4 align-middle">
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(file.Key || '', file.Key?.split('/').pop() || '')}
                    className="p-2 hover:bg-background-secondary rounded-lg text-text-secondary hover:text-accent-color transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L7 8m4-4v12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete({
                        type: 'file',
                        path: file.Key || ''
                      });
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="p-2 hover:bg-background-secondary rounded-lg text-text-secondary hover:text-error-color transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頁面標題與麵包屑導航 */}
        <div className="py-6">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">首頁</Link>
            <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 dark:text-gray-100">檔案儲存</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">檔案儲存</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">管理與儲存重要文件檔案</p>
            </div>
          </div>
        </div>

        {/* 資料夾路徑導航 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <div className="px-4 py-3 flex items-center space-x-2 overflow-x-auto 
                         scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <button
              onClick={() => setCurrentPath('')}
              className="text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                根目錄
              </span>
            </button>
            {currentPath.split('/').map((folder, index, array) => (
              <div key={index} className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <button
                  onClick={() => setCurrentPath(array.slice(0, index + 1).join('/'))}
                  className="text-blue-600 dark:text-blue-400 hover:underline ml-2 whitespace-nowrap"
                >
                  {folder}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 工具列 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {parentPath !== null && (
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 
                           text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 
                           dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 
                           transition-colors duration-200 focus:outline-none focus:ring-2 
                           focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  返回上層
                </button>
              )}
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                         text-white rounded-lg shadow-sm transition-colors duration-200 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                新增資料夾
              </button>
              <div {...getRootProps()} className="relative">
                <input {...getInputProps()} />
                <button
                  onClick={handleUploadClick}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                           text-white rounded-lg shadow-sm transition-colors duration-200 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L7 8m4-4v12" />
                  </svg>
                  上傳檔案
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜尋檔案..."
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50 dark:bg-gray-700 border 
                           border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           dark:text-gray-200 dark:placeholder-gray-400"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 
                         dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 
                         focus:ring-blue-500 dark:text-gray-200"
              >
                <option value="">所有類型</option>
                <option value="pdf">PDF</option>
                <option value="doc">Word</option>
                <option value="xls">Excel</option>
                <option value="image">圖片</option>
                <option value="video">影片</option>
              </select>
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 批次操作按鈕 */}
        {selectedItems.size > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 
                         border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-gray-900 dark:text-gray-100">
                  已選擇 {selectedItems.size} 個項目
                </span>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                           dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  取消選擇
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                           transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 
                           focus:ring-offset-2"
                >
                  全部刪除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 檔案列表區域 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
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
              ) : searchTerm && filteredFiles.length === 0 && folders.length === 0 ? (
                <EmptyState type="search" searchTerm={searchTerm} />
              ) : files.length === 0 && folders.length === 0 ? (
                <EmptyState type="folder" />
              ) : (
                renderFileList()
              )}
            </div>
          </div>
        </div>

        {/* 分頁控制 */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === 1
                    ? 'bg-background-secondary text-text-secondary cursor-not-allowed'
                    : 'bg-background-primary text-text-primary hover:bg-hover-color'
                }`}
              >
                首頁
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === 1
                    ? 'bg-background-secondary text-text-secondary cursor-not-allowed'
                    : 'bg-background-primary text-text-primary hover:bg-hover-color'
                }`}
              >
                上一頁
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage - 2 + i;
                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-accent-color text-white'
                          : 'bg-background-primary text-text-primary hover:bg-hover-color'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === totalPages
                    ? 'bg-background-secondary text-text-secondary cursor-not-allowed'
                    : 'bg-background-primary text-text-primary hover:bg-hover-color'
                }`}
              >
                下一頁
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === totalPages
                    ? 'bg-background-secondary text-text-secondary cursor-not-allowed'
                    : 'bg-background-primary text-text-primary hover:bg-hover-color'
                }`}
              >
                末頁
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 其他彈出層和對話框保持不變 */}
      {showFileMenu && selectedFile && (
        <div
          className="fixed bg-background-primary rounded-lg shadow-lg py-2 z-50"
          style={{ top: menuPosition.y, left: menuPosition.x }}
        >
          <button
            onClick={() => {
              handleDownload(selectedFile.Key || '', selectedFile.Key?.split('/').pop() || '');
              setShowFileMenu(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-hover-color"
          >
            下載
          </button>
          <button
            onClick={() => {
              setItemToDelete({
                type: selectedFile.type === 'folder' ? 'folder' : 'file',
                path: selectedFile.Key || ''
              });
              setIsDeleteConfirmOpen(true);
              setShowFileMenu(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-hover-color text-error-color"
          >
            刪除
          </button>
        </div>
      )}
      {isCreatingFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-[480px]
                         transform transition-all duration-300 ease-out scale-100 opacity-100
                         border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">建立新資料夾</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="輸入資料夾名稱"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 
                       dark:border-gray-600 rounded-lg mb-6 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 dark:text-gray-200 dark:placeholder-gray-400"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                         dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:ring-offset-2"
              >
                建立
              </button>
            </div>
          </div>
        </div>
      )}
      {draggedOver && (
        <div className="fixed inset-0 bg-blue-600/5 backdrop-blur-sm border-2 border-blue-500 
                       border-dashed z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-2xl 
                         transform scale-105 transition-transform border border-gray-200 
                         dark:border-gray-700">
            <div className="text-6xl mb-4 animate-bounce">📥</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              放開以上傳檔案到 {currentPath || '根目錄'}
            </h3>
            <p className="text-text-secondary">
              支援的檔案類型：PDF、Word、Excel、圖片、影片<br />
              單檔最大限制：{getFormattedSize(S3_CONFIG.maxFileSize)}
            </p>
          </div>
        </div>
      )}
      {isUploading && <UploadProgress progress={uploadProgress} />}
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
      {duplicateFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background-primary rounded-xl p-6 w-[480px]">
            <h3 className="text-xl font-bold mb-4">檔案已存在</h3>
            <p className="text-text-primary mb-6">
              資料夾中已存在相同名稱的檔案「{duplicateFile.newKey}」，請選擇處理方式：
            </p>
            <div className="space-y-4">
              <button
                onClick={() => handleDuplicateFile('replace')}
                className="w-full px-4 py-3 bg-accent-color text-white rounded-lg hover:bg-accent-hover transition-colors flex items-center justify-between"
              >
                <span>取代現有檔案</span>
                <span className="text-sm opacity-75">現有檔案將被刪除</span>
              </button>
              <button
                onClick={() => handleDuplicateFile('keep-both')}
                className="w-full px-4 py-3 bg-background-secondary text-text-primary rounded-lg hover:bg-hover-color transition-colors flex items-center justify-between"
              >
                <span>保留兩個檔案</span>
                <span className="text-sm opacity-75">新檔案將使用不同名稱</span>
              </button>
              <button
                onClick={() => handleDuplicateFile('skip')}
                className="w-full px-4 py-3 bg-background-secondary text-text-primary rounded-lg hover:bg-hover-color transition-colors flex items-center justify-between"
              >
                <span>跳過</span>
                <span className="text-sm opacity-75">保留現有檔案</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
      {contextMenu && (
        <ContextMenu
          file={contextMenu.file}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onAction={handleContextMenuAction}
        />
      )}

      {/* 狀態欄 */}
      <StatusBar
        selectedItems={selectedItems}
        totalItems={files.length + folders.length}
        totalSize={totalSize}
        uploadProgress={isUploading ? uploadProgress : undefined}
        currentOperation={currentOperation}
      />
    </div>
  );
}