import { AWS_CONFIG } from './aws-config';

export const S3_CONFIG = {
  // 基本配置
  bucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || '',
  region: AWS_CONFIG.region,
  
  // 上傳配置
  uploadPath: 'uploads/',
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxConcurrentUploads: 3,
  
  // 資料夾配置
  folderDelimiter: '/',
  defaultRootFolder: 'uploads',
  maxFolderNameLength: 255,
  maxFolderDepth: 10,
  forbiddenFolderChars: ['<', '>', ':', '"', '/', '\\', '|', '?', '*'],
  
  // 共享檔案配置
  sharedFolderPath: 'shared/',
  
  // 檔案大小顯示配置
  sizeDisplayMode: 'itemCount', // 'fileSize' 或 'itemCount'
  
  // 允許的檔案類型配置
  allowedFileTypes: {
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    images: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    videos: [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo'
    ]
  },
  
  // 檔案預覽配置
  previewConfig: {
    imageMaxSize: 5 * 1024 * 1024, // 5MB
    thumbnailSize: {
      width: 100,
      height: 100
    }
  },
  
  // 下載配置
  downloadConfig: {
    signedUrlExpiration: 3600, // 1小時
    maxConcurrentDownloads: 3
  },
  
  // 快取配置
  cacheControl: {
    public: 'public, max-age=31536000', // 1年
    private: 'private, max-age=3600' // 1小時
  },
  
  // 檔案類型圖示配置
  fileTypeIcons: {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    txt: '📝',
    image: '🖼️',
    video: '🎥',
    default: '📁'
  }
};

// 預覽配置
export const PREVIEW_CONFIG = {
  supportedTypes: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    videos: ['video/mp4', 'video/quicktime'],
    audio: ['audio/mpeg', 'audio/wav']
  },
  maxPreviewSize: 10 * 1024 * 1024, // 10MB
  thumbnailSize: {
    width: 200,
    height: 200
  },
  previewWindow: {
    width: '80vw',
    height: '80vh'
  }
};

// 右鍵菜單配置
export const CONTEXT_MENU_CONFIG = {
  items: [
    {
      id: 'preview',
      label: '預覽',
      icon: '👁️',
      supportedTypes: [...PREVIEW_CONFIG.supportedTypes.images, ...PREVIEW_CONFIG.supportedTypes.documents]
    },
    {
      id: 'download',
      label: '下載',
      icon: '⬇️',
      supportedTypes: 'all'
    },
    {
      id: 'share',
      label: '分享',
      icon: '🔗',
      supportedTypes: 'all',
      children: [
        {
          id: 'copy-link',
          label: '複製連結',
          icon: '📋'
        },
        {
          id: 'share-email',
          label: '透過郵件分享',
          icon: '📧'
        }
      ]
    },
    {
      id: 'move',
      label: '移動到',
      icon: '📦',
      supportedTypes: 'all'
    },
    {
      id: 'copy',
      label: '複製到',
      icon: '📋',
      supportedTypes: 'all'
    },
    {
      id: 'rename',
      label: '重命名',
      icon: '✏️',
      supportedTypes: 'all'
    },
    {
      id: 'delete',
      label: '刪除',
      icon: '🗑️',
      supportedTypes: 'all',
      divider: true
    }
  ],
  position: {
    offset: 5,
    preventOverflow: true
  }
};

// 狀態欄配置
export const STATUS_BAR_CONFIG = {
  refreshInterval: 5000, // 5秒更新一次
  showQuota: true,
  showUploadProgress: true,
  showOperationStatus: true
};

// 新增：格式化資料夾項目數量
export const formatFolderItemCount = (count: number): string => {
  return `${count} 個項目`;
};

// 導出 S3 配置的函數
export function validateS3Config() {
  // 檢查必要配置是否存在
  if (!S3_CONFIG.bucketName) {
    console.warn('S3 bucket name is not configured');
    return false;
  }
  
  if (!AWS_CONFIG.region) {
    console.warn('AWS region is not configured');
    return false;
  }
  
  return true;
}

// 獲取允許的檔案類型列表
export const getAllowedFileTypes = (): string[] => {
  return Object.values(S3_CONFIG.allowedFileTypes).flat();
};

// 驗證檔案類型是否允許
export const isFileTypeAllowed = (mimeType: string): boolean => {
  const allowedTypes = getAllowedFileTypes();
  return allowedTypes.includes(mimeType) || allowedTypes.includes('*/*');
};

// 獲取檔案類型對應的圖示
export const getFileTypeIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return S3_CONFIG.fileTypeIcons[extension as keyof typeof S3_CONFIG.fileTypeIcons] || S3_CONFIG.fileTypeIcons.default;
}; 