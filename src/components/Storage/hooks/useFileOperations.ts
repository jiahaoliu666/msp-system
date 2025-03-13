import { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  deleteFile, 
  deleteFolder, 
  getFileDownloadUrl, 
  createFolder,
  generateShareLink,
  isPreviewable
} from '@/services/storage/s3';
import { FileItem, FileOperationsReturn } from '../types';

export const useFileOperations = (
  currentPath: string,
  loadFiles: () => Promise<void>
): FileOperationsReturn => {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    file: FileItem;
    position: { x: number; y: number };
  } | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'file' | 'folder', path: string} | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [currentOperation, setCurrentOperation] = useState<string>('');

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

  // 檔案預覽處理
  const handleFilePreview = (file: FileItem) => {
    setSelectedFile(file);
  };

  // 檔案選單處理
  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setSelectedFile(file);
    setContextMenu({
      file,
      position: { x: e.clientX, y: e.clientY }
    });
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

  return {
    selectedFile,
    previewFile,
    contextMenu,
    isDeleteConfirmOpen,
    itemToDelete,
    isCreatingFolder,
    newFolderName,
    currentOperation,
    handleDownload,
    handleDelete,
    handleDeleteFolder,
    handleConfirmDelete,
    handleCreateFolder,
    handleFilePreview,
    handleContextMenu,
    handleContextMenuAction,
    setSelectedFile,
    setPreviewFile,
    setContextMenu,
    setIsDeleteConfirmOpen,
    setItemToDelete,
    setIsCreatingFolder,
    setNewFolderName,
    setCurrentOperation
  };
}; 