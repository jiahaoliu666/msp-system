import { useState, useEffect } from 'react';
import { getStorageQuota, formatFileSize } from '@/services/storage/s3';
import { STATUS_BAR_CONFIG } from '@/config/s3-config';
import { StatusBarProps } from '@/components/storage/types';

const StatusBar: React.FC<StatusBarProps> = ({ 
  selectedItems, 
  totalItems, 
  totalSize, 
  uploadProgress, 
  currentOperation 
}) => {
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
                  總儲存容量: {formatFileSize(quota.used)}
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

export default StatusBar; 