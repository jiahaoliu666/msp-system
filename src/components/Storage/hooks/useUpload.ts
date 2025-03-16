import { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { uploadFile, deleteFile, checkFileExists } from '@/services/storage/s3';
import { S3_CONFIG } from '@/config/s3-config';
import { formatFileSize } from '@/services/storage/s3';
import { FileItem, UploadReturn } from '@/components/storage/types';
import { useToastContext } from '@/context/ToastContext';
import { isFileTypeAllowed, getAllowedFileTypes } from '@/config/s3-config';

export const useUpload = (
  currentPath: string,
  files: FileItem[],
  loadFiles: () => Promise<{success: boolean, error?: string} | void>
): UploadReturn => {
  const { showToast } = useToastContext();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedOver, setDraggedOver] = useState(false);
  const [duplicateFile, setDuplicateFile] = useState<{
    file: File;
    existingKey: string;
    newKey: string;
  } | null>(null);

  // 添加缺少的狀態
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [uploadSpeed, setUploadSpeed] = useState<number>(0);
  const [uploadStartTime, setUploadStartTime] = useState<Date | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropAreaRef = useRef<HTMLDivElement | null>(null);

  // 檢查檔案類型是否允許上傳
  const validateFileTypes = (files: File[]): { valid: File[], invalid: File[] } => {
    const valid: File[] = [];
    const invalid: File[] = [];
    
    files.forEach(file => {
      if (isFileTypeAllowed(file.type)) {
        valid.push(file);
      } else {
        invalid.push(file);
      }
    });
    
    return { valid, invalid };
  };

  // 檢查檔案大小是否超過限制
  const validateFileSize = (files: File[]): { valid: File[], invalid: File[] } => {
    const maxSize = S3_CONFIG.maxFileSize;
    const valid: File[] = [];
    const invalid: File[] = [];
    
    files.forEach(file => {
      if (file.size <= maxSize) {
        valid.push(file);
      } else {
        invalid.push(file);
      }
    });
    
    return { valid, invalid };
  };
  
  // 處理檔案上傳
  const handleFileUpload = async (files: File[]): Promise<void> => {
    if (files.length === 0) return;
    
    // 驗證檔案類型
    const typeValidationResult = validateFileTypes(files);
    if (typeValidationResult.invalid.length > 0) {
      showToast('error', `不支援的檔案類型 (${typeValidationResult.invalid.length} 個檔案)。允許的類型：${getAllowedFileTypes().join(', ')}`);
      
      if (typeValidationResult.valid.length === 0) return;
    }
    
    // 驗證檔案大小
    const sizeValidationResult = validateFileSize(typeValidationResult.valid);
    if (sizeValidationResult.invalid.length > 0) {
      showToast('error', `檔案過大 (${sizeValidationResult.invalid.length} 個檔案)。大小限制：${(S3_CONFIG.maxFileSize / (1024 * 1024)).toFixed(0)}MB`);
      
      if (sizeValidationResult.valid.length === 0) return;
    }
    
    const validFiles = sizeValidationResult.valid;
    
    setUploadQueue(validFiles);
    setTotalFiles(validFiles.length);
    setCurrentFileIndex(0);
    setUploadStartTime(new Date());
    setIsUploading(true);
    
    try {
      for (let i = 0; i < validFiles.length; i++) {
        setCurrentFileIndex(i);
        const file = validFiles[i];
        
        // 檢查檔案是否已存在
        const fileName = file.name;
        // 確保正確構建檔案路徑，包含目錄分隔符
        const fileKey = currentPath.endsWith('/') 
          ? `${currentPath}${fileName}` 
          : `${currentPath}/${fileName}`;
        
        const fileExists = await checkFileExists(fileKey);
        
        if (fileExists) {
          // 設置重複檔案狀態，等待用戶決定
          setDuplicateFile({
            file,
            existingKey: fileKey,
            newKey: fileKey
          });
          
          // 等待用戶處理重複檔案
          await new Promise<void>(resolve => {
            const checkInterval = setInterval(() => {
              if (!duplicateFile) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 500);
          });
          
          // 如果用戶選擇跳過，則繼續下一個檔案
          if (duplicateFile === null) {
            continue;
          }
        }
        
        // 更新進度
        setUploadProgress(Math.round((i / validFiles.length) * 100));
        
        // 上傳檔案
        await uploadFile(file, fileKey);
      }
      
      setIsUploading(false);
      setUploadProgress(100);
      
      // 成功上傳後重新載入檔案列表
      await loadFiles();
      
      showToast('success', `已成功上傳 ${validFiles.length} 個檔案`);
    } catch (error) {
      console.error('上傳失敗:', error);
      setIsUploading(false);
      
      showToast('error', '檔案上傳過程中出現錯誤，請重試');
    } finally {
      // 清理狀態
      setTimeout(() => {
        setUploadProgress(0);
      }, 3000);
    }
  };

  // 處理重複檔案
  const handleDuplicateFile = async (action: 'replace' | 'keep-both' | 'skip') => {
    if (!duplicateFile) return;
    
    try {
      if (action === 'replace') {
        // 直接覆蓋，繼續上傳
        await uploadFile(duplicateFile.file, duplicateFile.existingKey);
      } else if (action === 'keep-both') {
        // 保留兩者，使用新檔名
        const fileName = duplicateFile.file.name;
        const fileExt = fileName.includes('.') ? `.${fileName.split('.').pop()}` : '';
        const fileNameWithoutExt = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
        const timestamp = new Date().getTime();
        const newFileName = `${fileNameWithoutExt}_${timestamp}${fileExt}`;
        // 確保正確構建檔案路徑，包含目錄分隔符
        const newKey = currentPath.endsWith('/') 
          ? `${currentPath}${newFileName}` 
          : `${currentPath}/${newFileName}`;
        
        await uploadFile(duplicateFile.file, newKey);
      }
      // skip: 不做任何事，繼續處理下一個檔案
      
      setDuplicateFile(null);
    } catch (error) {
      console.error('處理重複檔案失敗:', error);
      showToast('error', '處理重複檔案時出現錯誤');
    }
  };

  // 點擊上傳按鈕
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // 處理檔案選擇
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileUpload(Array.from(selectedFiles));
    }
    
    // 重置 input 值，允許再次選擇相同檔案
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 處理拖放上傳
  const onDrop = async (acceptedFiles: File[]) => {
    await handleFileUpload(acceptedFiles);
  };

  // 暫停上傳
  const pauseUpload = () => {
    // 待實現
    console.log('暫停上傳功能待實現');
  };

  // 繼續上傳
  const resumeUpload = () => {
    // 待實現
    console.log('繼續上傳功能待實現');
  };

  // 取消上傳
  const cancelUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadQueue([]);
  };
  
  // 監聽自定義拖放事件
  useEffect(() => {
    const handleCustomDrop = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.files) {
        const files = Array.from(customEvent.detail.files as FileList);
        handleFileUpload(files);
      }
    };
    
    document.addEventListener('file-drop', handleCustomDrop);
    
    return () => {
      document.removeEventListener('file-drop', handleCustomDrop);
    };
  }, [currentPath]); // eslint-disable-line react-hooks/exhaustive-deps

  // 利用 react-dropzone 提供的鉤子
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

  return {
    isUploading,
    uploadProgress,
    draggedOver,
    duplicateFile,
    onDrop,
    handleUploadClick,
    handleDuplicateFile,
    setDraggedOver,
    getRootProps,
    getInputProps,
    isDragActive,
    // 添加缺少的返回值
    uploadQueue,
    uploadSpeed,
    uploadStartTime,
    estimatedTimeRemaining,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    currentFileIndex,
    totalFiles
  };
}; 