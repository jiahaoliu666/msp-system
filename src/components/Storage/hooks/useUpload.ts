import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { uploadFile, deleteFile } from '@/services/storage/s3';
import { S3_CONFIG } from '@/config/s3-config';
import { formatFileSize } from '@/config/s3-config';
import { FileItem, UploadReturn } from '@/components/storage/types';

export const useUpload = (
  currentPath: string,
  files: FileItem[],
  loadFiles: () => Promise<void>
): UploadReturn => {
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

  // 暫停上傳
  const pauseUpload = () => {
    setIsPaused(true);
    toast.info('上傳已暫停');
  };

  // 繼續上傳
  const resumeUpload = () => {
    setIsPaused(false);
    toast.info('上傳已繼續');
  };

  // 取消上傳
  const cancelUpload = () => {
    setIsUploading(false);
    setUploadQueue([]);
    setUploadProgress(0);
    setCurrentFileIndex(0);
    setTotalFiles(0);
    toast.info('上傳已取消');
  };

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