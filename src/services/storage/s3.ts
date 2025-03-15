import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AWS_CONFIG } from '@/config/aws-config';
import { S3_CONFIG, getAllowedFileTypes, PREVIEW_CONFIG } from '@/config/s3-config';
import { FetchHttpHandler } from '@smithy/fetch-http-handler';

// S3 檔案類型介面
export interface S3File {
  Key: string;
  LastModified: Date;
  Size: number;
  ETag: string;
}

// 自定義錯誤訊息
const ErrorMessages = {
  BUCKET_NOT_CONFIGURED: '系統錯誤：儲存空間尚未正確配置',
  BUCKET_NOT_FOUND: '系統錯誤：找不到指定的儲存空間',
  PERMISSION_DENIED: '權限錯誤：沒有足夠的權限執行此操作',
  NETWORK_ERROR: '網路連線錯誤，請檢查您的網路狀態並重試',
  CONNECTION_ERROR: '連線至儲存服務失敗，系統將自動重試',
  FILE_TOO_LARGE: '檔案大小超過限制',
  INVALID_FILE_TYPE: '不支援的檔案類型',
  CORS_ERROR: '跨域存取錯誤，請聯絡系統管理員',
  TIMEOUT_ERROR: '連線逾時，請稍後重試',
  UNKNOWN_ERROR: '發生未知錯誤，請稍後再試'
};

// 錯誤處理函數
function handleS3Error(error: any): never {
  console.error('S3 操作錯誤:', error);
  
  // 網路錯誤處理
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    if (!navigator.onLine) {
      throw new Error(ErrorMessages.NETWORK_ERROR);
    }
    throw new Error(ErrorMessages.CONNECTION_ERROR);
  }

  // 超時錯誤處理
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    throw new Error(ErrorMessages.TIMEOUT_ERROR);
  }

  // CORS 錯誤處理
  if (error.name === 'TypeError' && error.message.includes('CORS')) {
    console.error('CORS 錯誤詳情:', error);
    throw new Error(ErrorMessages.CORS_ERROR);
  }

  // S3 特定錯誤處理
  if (error.name === 'NoSuchBucket') {
    throw new Error(ErrorMessages.BUCKET_NOT_FOUND);
  }
  
  if (error.name === 'AccessDenied' || error.$metadata?.httpStatusCode === 403) {
    throw new Error(ErrorMessages.PERMISSION_DENIED);
  }
  
  if (error.message?.includes('Bucket')) {
    throw new Error(ErrorMessages.BUCKET_NOT_CONFIGURED);
  }
  
  // 未知錯誤處理
  console.error('未知錯誤詳情:', error);
  throw new Error(ErrorMessages.UNKNOWN_ERROR);
}

// 驗證 S3 配置
function validateS3Config() {
  if (!S3_CONFIG.bucketName) {
    console.error('S3 bucket name is not configured');
    throw new Error(ErrorMessages.BUCKET_NOT_CONFIGURED);
  }
  
  if (!AWS_CONFIG.region) {
    console.error('AWS region is not configured');
    throw new Error(ErrorMessages.BUCKET_NOT_CONFIGURED);
  }
  
  if (!AWS_CONFIG.credentials.accessKeyId || !AWS_CONFIG.credentials.secretAccessKey) {
    console.error('AWS 認證信息缺失');
    throw new Error(ErrorMessages.PERMISSION_DENIED);
  }
  
  return true;
}

// 初始化 S3 客戶端
const s3Client = new S3Client({
  region: AWS_CONFIG.region,
  credentials: AWS_CONFIG.credentials,
  endpoint: AWS_CONFIG.endpoint,
  forcePathStyle: true,
  maxAttempts: AWS_CONFIG.maxAttempts,
  retryMode: AWS_CONFIG.retryMode,
  requestHandler: new FetchHttpHandler({
    requestTimeout: AWS_CONFIG.requestTimeout
  })
});

// 檢查並確保 S3 連接可用
export async function checkS3Connection(): Promise<boolean> {
  try {
    // 驗證配置
    validateS3Config();
    
    // 嘗試列出儲存空間內容
    const command = new ListObjectsV2Command({
      Bucket: S3_CONFIG.bucketName,
      MaxKeys: 1
    });
    
    await s3Client.send(command);
    console.log('S3 連接測試成功');
    return true;
  } catch (error) {
    console.error('S3 連接測試失敗:', error);
    return false;
  }
}

// 將檔案轉換為 Buffer
async function fileToBuffer(file: File): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(Buffer.from(reader.result));
      } else {
        reject(new Error('Failed to convert file to buffer'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

// 獲取檔案列表
export async function listFiles(prefix = '', maxKeys = 1000): Promise<S3File[]> {
  try {
    validateS3Config();
    
    const command = new ListObjectsV2Command({
      Bucket: S3_CONFIG.bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });
    
    const response = await s3Client.send(command);
    if (!response.Contents) {
      return [];
    }
    return response.Contents as S3File[];
  } catch (error: any) {
    console.error('S3 列表錯誤:', error);
    if (error.name === '$metadata' && error.$metadata?.httpStatusCode === 403) {
      throw new Error(ErrorMessages.PERMISSION_DENIED);
    }
    handleS3Error(error);
  }
}

// 上傳檔案
export async function uploadFile(file: File, key: string): Promise<boolean> {
  try {
    validateS3Config();
    
    // 檢查檔案類型
    const allowedTypes = getAllowedFileTypes();
    if (!allowedTypes.includes(file.type)) {
      throw new Error(ErrorMessages.INVALID_FILE_TYPE);
    }

    // 檢查檔案大小
    if (file.size > S3_CONFIG.maxFileSize) {
      throw new Error(ErrorMessages.FILE_TOO_LARGE);
    }

    // 檢查網路連接
    if (!navigator.onLine) {
      throw new Error('網路連線已斷開，請檢查您的網路狀態');
    }

    // 將檔案轉換為 Buffer
    const buffer = await fileToBuffer(file);

    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ContentLength: buffer.length,
      Metadata: {
        'original-filename': encodeURIComponent(file.name),
        'upload-date': new Date().toISOString(),
      }
    });

    let retryCount = 0;
    const maxRetries = 3;
    const baseDelay = 1000;
    
    while (retryCount < maxRetries) {
      try {
        if (!navigator.onLine) {
          throw new Error('網路連線已斷開');
        }

        console.log(`開始上傳檔案 (嘗試 ${retryCount + 1}/${maxRetries}):`, {
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          fileType: file.type,
          bucket: S3_CONFIG.bucketName,
          key: key
        });

        await s3Client.send(command);
        console.log('檔案上傳成功:', key);
        return true;
      } catch (uploadError: any) {
        retryCount++;
        const delay = baseDelay * Math.pow(2, retryCount - 1);

        console.error(`上傳失敗 (嘗試 ${retryCount}/${maxRetries}):`, {
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          error: uploadError.message,
          errorName: uploadError.name,
          httpStatusCode: uploadError.$metadata?.httpStatusCode
        });

        if (retryCount === maxRetries) {
          if (uploadError.name === 'NetworkError' || 
              uploadError.message?.includes('Failed to fetch') ||
              uploadError.message?.includes('Network request failed') ||
              !navigator.onLine) {
            throw new Error('網路連線錯誤，請檢查您的網路狀態並重試');
          }
          if (uploadError.$metadata?.httpStatusCode === 403) {
            throw new Error('沒有權限執行此操作，請確認您的存取權限');
          }
          if (uploadError.$metadata?.httpStatusCode === 404) {
            throw new Error('找不到指定的儲存空間，請確認配置是否正確');
          }
          throw new Error(`檔案上傳失敗: ${uploadError.message}`);
        }

        console.log(`等待 ${delay}ms 後重試...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return false;
  } catch (error: any) {
    console.error('檔案上傳錯誤:', {
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      error: error.message,
      bucket: S3_CONFIG.bucketName,
      endpoint: AWS_CONFIG.endpoint
    });
    
    if (error.message.includes('Failed to convert file to buffer')) {
      throw new Error('檔案處理失敗，請重試');
    }
    
    handleS3Error(error);
  }
}

// 刪除檔案
export async function deleteFile(key: string): Promise<boolean> {
  try {
    validateS3Config();
    
    const command = new DeleteObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    handleS3Error(error);
  }
}

// 獲取檔案下載連結
export async function getFileDownloadUrl(key: string): Promise<string> {
  try {
    validateS3Config();
    
    const command = new GetObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    handleS3Error(error);
  }
}

// 格式化檔案大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 獲取檔案類型圖示
export function getFileTypeIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return '🖼️';
    case 'mp4':
    case 'mov':
    case 'avi':
      return '🎥';
    default:
      return '📁';
  }
}

// 測試 CORS 配置
export async function testCORSConfiguration(): Promise<boolean> {
  try {
    console.log('開始測試 S3 CORS 配置...');
    console.log('S3 配置信息:', {
      bucketName: S3_CONFIG.bucketName,
      region: AWS_CONFIG.region,
      endpoint: AWS_CONFIG.endpoint,
      hasCredentials: !!(AWS_CONFIG.credentials?.accessKeyId && AWS_CONFIG.credentials?.secretAccessKey)
    });
    
    validateS3Config();
    
    // 檢查網路連接
    if (!navigator.onLine) {
      throw new Error(ErrorMessages.NETWORK_ERROR);
    }

    // 使用簡單的列表請求測試 CORS
    const command = new ListObjectsV2Command({
      Bucket: S3_CONFIG.bucketName,
      MaxKeys: 1
    });

    try {
      console.log('發送 S3 列表請求...');
      const response = await s3Client.send(command);
      console.log('S3 CORS 測試成功，響應:', response);
      return true;
    } catch (error: any) {
      console.error('S3 CORS 測試請求失敗:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        metadata: error.$metadata
      });
      
      // 輸出更多診斷信息
      if (error.$metadata) {
        console.error('S3 請求元數據:', {
          httpStatusCode: error.$metadata.httpStatusCode,
          requestId: error.$metadata.requestId,
          attempts: error.$metadata.attempts,
          totalRetryDelay: error.$metadata.totalRetryDelay
        });
      }
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        if (!navigator.onLine) {
          throw new Error(ErrorMessages.NETWORK_ERROR);
        }
        console.error('請求失敗，可能是 CORS 或網路問題');
        throw new Error(`${ErrorMessages.CORS_ERROR} - 詳細信息: ${error.message}`);
      }

      if (error.$metadata?.httpStatusCode === 403) {
        console.error('權限錯誤 - 可能是 AWS 認證無效或過期');
        throw new Error(`${ErrorMessages.PERMISSION_DENIED} - 請檢查 AWS 認證是否有效`);
      }
      
      if (error.$metadata?.httpStatusCode === 404) {
        console.error('資源不存在 - 可能是儲存桶名稱錯誤');
        throw new Error(`找不到儲存桶 '${S3_CONFIG.bucketName}' - 請檢查儲存桶名稱是否正確`);
      }
      
      throw new Error(`S3 連接測試失敗: ${error.message || '未知錯誤'}`);
    }
  } catch (error: any) {
    console.error('測試 S3 CORS 配置失敗:', error);
    throw new Error(`S3 連接測試失敗: ${error.message || '未知錯誤'}`);
  }
}

// 建立資料夾
export async function createFolder(folderPath: string): Promise<boolean> {
  try {
    validateS3Config();
    
    // 移除開頭和結尾的斜線
    folderPath = folderPath.replace(/^\/+|\/+$/g, '');
    
    // 驗證資料夾名稱
    const folderName = folderPath.split('/').pop() || '';
    if (folderName.length > S3_CONFIG.maxFolderNameLength) {
      throw new Error(`資料夾名稱不能超過 ${S3_CONFIG.maxFolderNameLength} 個字元`);
    }
    
    if (S3_CONFIG.forbiddenFolderChars.some(char => folderName.includes(char))) {
      throw new Error(`資料夾名稱不能包含以下字元: ${S3_CONFIG.forbiddenFolderChars.join(' ')}`);
    }
    
    // 檢查資料夾深度
    const depth = folderPath.split('/').length;
    if (depth > S3_CONFIG.maxFolderDepth) {
      throw new Error(`資料夾層級不能超過 ${S3_CONFIG.maxFolderDepth} 層`);
    }

    // 在 S3 中建立空的資料夾標記檔案
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      Key: `${folderPath}/`,
      Body: '',
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    handleS3Error(error);
    return false;
  }
}

// 格式化日期時間
export function formatDateTime(date: Date): string {
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 計算資料夾大小
async function getFolderSize(folderPrefix: string): Promise<number> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: S3_CONFIG.bucketName,
      Prefix: folderPrefix
    });

    const response = await s3Client.send(command);
    return (response.Contents || [])
      .reduce((total, item) => total + (item.Size || 0), 0);
  } catch (error) {
    console.error('計算資料夾大小失敗:', error);
    return 0;
  }
}

// 列出指定路徑下的檔案和資料夾
export async function listFilesInFolder(folderPath: string = ''): Promise<{
  files: S3File[];
  folders: Array<{
    name: string;
    size: number;
    lastModified: Date;
    children?: number;
  }>;
  currentPath: string;
  parentPath: string | null;
}> {
  try {
    validateS3Config();
    
    // 標準化路徑 - 移除前後斜線但保留中間的斜線
    folderPath = folderPath.trim().replace(/^\/+|\/+$/g, '');
    const prefix = folderPath ? `${folderPath}/` : '';
    
    console.log('正在列出資料夾路徑:', prefix, '原始路徑:', folderPath);
    
    const command = new ListObjectsV2Command({
      Bucket: S3_CONFIG.bucketName,
      Prefix: prefix,
      Delimiter: S3_CONFIG.folderDelimiter,
      MaxKeys: 1000  // 確保獲取足夠多的結果
    });

    const response = await s3Client.send(command);
    console.log('S3 回應結果:', { 
      CommonPrefixes: response.CommonPrefixes?.length || 0, 
      Contents: response.Contents?.length || 0 
    });
    
    // 處理資料夾
    const folderPromises = (response.CommonPrefixes || [])
      .map(async (prefix) => {
        if (!prefix.Prefix) return null;
        
        const folderPath = prefix.Prefix;
        // 提取資料夾名稱 - 從完整路徑中去除前綴，獲取資料夾名稱
        const pathParts = folderPath.split('/').filter(Boolean);
        const folderName = pathParts[pathParts.length - 1] || '';
        
        console.log('處理資料夾:', { folderPath, folderName });
        
        // 獲取資料夾大小
        const size = await getFolderSize(folderPath);
        
        // 獲取資料夾內的項目數量，用於顯示 "X 個項目"
        const folderItems = await s3Client.send(new ListObjectsV2Command({
          Bucket: S3_CONFIG.bucketName,
          Prefix: folderPath,
          Delimiter: S3_CONFIG.folderDelimiter,
        }));
        
        const itemCount = (folderItems.Contents?.length || 0) + (folderItems.CommonPrefixes?.length || 0);
        
        // 獲取資料夾最後修改時間（使用資料夾內最新的檔案時間）
        const folderContents = await s3Client.send(new ListObjectsV2Command({
          Bucket: S3_CONFIG.bucketName,
          Prefix: folderPath,
          MaxKeys: 1000
        }));
        
        const lastModified = (folderContents.Contents || []).length > 0
          ? (folderContents.Contents || [])
              .reduce((latest, item) => {
                const itemDate = item.LastModified || new Date(0);
                return itemDate > latest ? itemDate : latest;
              }, new Date(0))
          : new Date();  // 如果沒有檔案，使用當前時間

        return {
          name: folderName,
          size,
          lastModified,
          children: itemCount // 添加項目數量
        };
      });

    const folders = (await Promise.all(folderPromises)).filter(Boolean) as Array<{
      name: string;
      size: number;
      lastModified: Date;
      children?: number;
    }>;
    
    // 處理檔案（排除資料夾標記檔案，保留完整路徑）
    const files = (response.Contents || [])
      .filter(item => {
        // 排除資料夾標記和當前資料夾的標記
        return item.Key && 
               !item.Key.endsWith('/') && 
               item.Key !== prefix;
      })
      .map(item => {
        // 添加除錯信息
        console.log('處理檔案:', item.Key);
        return {
          ...item,
          // 保留原始的完整路徑
          Key: item.Key || ''
        };
      }) as S3File[];

    console.log(`找到 ${files.length} 個檔案和 ${folders.length} 個資料夾`);

    // 計算父資料夾路徑
    let parentPath: string | null = null;
    if (folderPath) {
      const pathParts = folderPath.split('/').filter(Boolean);
      if (pathParts.length > 1) {
        // 如果是多層目錄，返回上一層路徑
        parentPath = pathParts.slice(0, -1).join('/');
      } else if (pathParts.length === 1) {
        // 如果是第一級目錄，父路徑為空字串（根目錄）
        parentPath = '';
      }
      // 如果沒有路徑部分（根目錄），保持 parentPath 為 null
    }
    
    console.log('listFilesInFolder 計算的 parentPath:', parentPath, '原始路徑:', folderPath);

    return {
      files,
      folders,
      currentPath: folderPath,
      parentPath
    };
  } catch (error) {
    console.error('列出資料夾內容時發生錯誤:', error);
    handleS3Error(error);
    return {
      files: [],
      folders: [],
      currentPath: folderPath,
      parentPath: null
    };
  }
}

// 刪除資料夾及其內容
export async function deleteFolder(folderPath: string): Promise<boolean> {
  try {
    validateS3Config();
    
    // 標準化路徑
    folderPath = folderPath.replace(/^\/+|\/+$/g, '');
    const prefix = `${folderPath}/`;
    
    // 列出資料夾內所有檔案
    const command = new ListObjectsV2Command({
      Bucket: S3_CONFIG.bucketName,
      Prefix: prefix
    });

    const response = await s3Client.send(command);
    const objects = response.Contents || [];
    
    if (objects.length === 0) {
      return true;
    }

    // 批次刪除所有檔案
    const deletePromises = objects.map(obj => {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: S3_CONFIG.bucketName,
        Key: obj.Key || ''
      });
      return s3Client.send(deleteCommand);
    });

    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    handleS3Error(error);
    return false;
  }
}

// 批次刪除檔案
export async function deleteMultipleFiles(keys: string[]): Promise<boolean> {
  try {
    validateS3Config();
    
    const deletePromises = keys.map(key => {
      const command = new DeleteObjectCommand({
        Bucket: S3_CONFIG.bucketName,
        Key: key
      });
      return s3Client.send(command);
    });

    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    handleS3Error(error);
    return false;
  }
}

// 獲取檔案預覽 URL
export async function getFilePreviewUrl(key: string): Promise<string> {
  try {
    validateS3Config();
    
    const command = new GetObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      Key: key,
      ResponseContentDisposition: 'inline'
    });

    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600,
    });
    return signedUrl;
  } catch (error) {
    handleS3Error(error);
    return '';
  }
}

// 生成分享連結
export async function generateShareLink(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    validateS3Config();
    
    const command = new GetObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      Key: key
    });

    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn
    });
    return signedUrl;
  } catch (error) {
    handleS3Error(error);
    return '';
  }
}

// 移動檔案
export async function moveFile(sourceKey: string, destinationKey: string): Promise<boolean> {
  try {
    validateS3Config();
    
    // 複製檔案到新位置
    const copyCommand = new CopyObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      CopySource: `${S3_CONFIG.bucketName}/${sourceKey}`,
      Key: destinationKey
    });
    
    await s3Client.send(copyCommand);
    
    // 刪除原始檔案
    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      Key: sourceKey
    });
    
    await s3Client.send(deleteCommand);
    return true;
  } catch (error) {
    handleS3Error(error);
    return false;
  }
}

// 複製檔案
export async function copyFile(sourceKey: string, destinationKey: string): Promise<boolean> {
  try {
    validateS3Config();
    
    const command = new CopyObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      CopySource: `${S3_CONFIG.bucketName}/${sourceKey}`,
      Key: destinationKey
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    handleS3Error(error);
    return false;
  }
}

// 重命名檔案
export async function renameFile(oldKey: string, newKey: string): Promise<boolean> {
  return await moveFile(oldKey, newKey);
}

// 獲取儲存空間配額
export async function getStorageQuota(): Promise<{
  used: number;
  total: number;
}> {
  try {
    validateS3Config();
    
    const command = new ListObjectsV2Command({
      Bucket: S3_CONFIG.bucketName
    });
    
    const response = await s3Client.send(command);
    const totalSize = (response.Contents || [])
      .reduce((sum, item) => sum + (item.Size || 0), 0);
    
    return {
      used: totalSize,
      total: 1024 * 1024 * 1024 * 1024 // 1TB 或從配置中獲取
    };
  } catch (error) {
    handleS3Error(error);
    return {
      used: 0,
      total: 0
    };
  }
}

// 批次操作函數
export async function batchOperation(
  keys: string[],
  operation: 'move' | 'copy' | 'delete',
  destination?: string
): Promise<boolean> {
  try {
    validateS3Config();
    
    const operations = keys.map(key => {
      switch (operation) {
        case 'move':
          return moveFile(key, `${destination}/${key.split('/').pop()}`);
        case 'copy':
          return copyFile(key, `${destination}/${key.split('/').pop()}`);
        case 'delete':
          return deleteFile(key);
      }
    });
    
    const results = await Promise.all(operations);
    return results.every(result => result);
  } catch (error) {
    handleS3Error(error);
    return false;
  }
}

// 檢查檔案是否可預覽
export function isPreviewable(key: string): boolean {
  const extension = key.split('.').pop()?.toLowerCase() || '';
  const mimeType = getMimeType(extension);
  
  return Object.values(PREVIEW_CONFIG.supportedTypes)
    .flat()
    .includes(mimeType);
}

// 獲取 MIME 類型
function getMimeType(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav'
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}

// 重新初始化 S3 客戶端，以修復連接問題
export function reinitializeS3Client(config?: {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  endpoint?: string;
}): boolean {
  try {
    console.log('正在重新初始化 S3 客戶端...');
    
    // 更新配置
    if (config) {
      if (config.accessKeyId) AWS_CONFIG.credentials.accessKeyId = config.accessKeyId;
      if (config.secretAccessKey) AWS_CONFIG.credentials.secretAccessKey = config.secretAccessKey;
      if (config.region) AWS_CONFIG.region = config.region;
      if (config.endpoint) AWS_CONFIG.endpoint = config.endpoint;
    }
    
    // 重新建立客戶端
    const newClient = new S3Client({
      region: AWS_CONFIG.region,
      credentials: {
        accessKeyId: AWS_CONFIG.credentials.accessKeyId,
        secretAccessKey: AWS_CONFIG.credentials.secretAccessKey
      },
      endpoint: AWS_CONFIG.endpoint,
      forcePathStyle: true,
      maxAttempts: AWS_CONFIG.maxAttempts,
      retryMode: AWS_CONFIG.retryMode,
      requestHandler: new FetchHttpHandler({
        requestTimeout: AWS_CONFIG.requestTimeout
      })
    });
    
    // 替換全局客戶端
    Object.assign(s3Client, newClient);
    
    console.log('S3 客戶端重新初始化成功');
    return true;
  } catch (error) {
    console.error('S3 客戶端重新初始化失敗:', error);
    return false;
  }
} 