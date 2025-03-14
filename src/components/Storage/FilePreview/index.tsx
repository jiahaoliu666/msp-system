import { useState, useEffect } from 'react';
import { getFilePreviewUrl } from '@/services/storage/s3';
import { PREVIEW_CONFIG } from '@/config/s3-config';
import { formatFileSize, formatDateTime } from '@/services/storage/s3';
import { FilePreviewProps } from '@/components/storage/types';

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
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

export default FilePreview; 