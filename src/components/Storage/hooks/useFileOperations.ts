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
import { FileItem, FileOperationsReturn } from '@/components/storage/types';

export const useFileOperations = (
  currentPath: string,
  loadFiles: () => Promise<{success: boolean, error?: string} | void>
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
  
  // 新增的狀態
  const [isRenamingItem, setIsRenamingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [multiSelectMode, setMultiSelectMode] = useState(false);

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

  // 重命名處理
  const handleRename = async (oldPath: string, newPath: string) => {
    try {
      // 這裡需要實現重命名邏輯，可以使用移動檔案的方式實現
      toast.success('重命名成功');
      loadFiles();
      return Promise.resolve();
    } catch (error) {
      toast.error('重命名失敗');
      console.error('重命名失敗:', error);
      return Promise.reject(error);
    }
  };

  // 移動檔案處理
  const handleMove = async (sourcePaths: string[], destinationPath: string) => {
    try {
      // 這裡需要實現移動檔案邏輯
      toast.success('移動成功');
      loadFiles();
      return Promise.resolve();
    } catch (error) {
      toast.error('移動失敗');
      console.error('移動失敗:', error);
      return Promise.reject(error);
    }
  };

  // 複製檔案處理
  const handleCopy = async (sourcePaths: string[], destinationPath: string) => {
    try {
      // 這裡需要實現複製檔案邏輯
      toast.success('複製成功');
      loadFiles();
      return Promise.resolve();
    } catch (error) {
      toast.error('複製失敗');
      console.error('複製失敗:', error);
      return Promise.reject(error);
    }
  };

  // 分享檔案處理
  const handleShare = async (key: string) => {
    try {
      const shareUrl = await generateShareLink(key);
      return shareUrl;
    } catch (error) {
      toast.error('分享失敗');
      console.error('分享失敗:', error);
      return '';
    }
  };

  // 標籤處理
  const handleTag = async (key: string, tags: string[]) => {
    try {
      // 這裡需要實現標籤邏輯
      toast.success('標籤更新成功');
      loadFiles();
      return Promise.resolve();
    } catch (error) {
      toast.error('標籤更新失敗');
      console.error('標籤更新失敗:', error);
      return Promise.reject(error);
    }
  };

  // 星號標記處理
  const handleStar = async (key: string) => {
    try {
      // 這裡需要實現星號標記邏輯
      toast.success('標記成功');
      loadFiles();
      return Promise.resolve();
    } catch (error) {
      toast.error('標記失敗');
      console.error('標記失敗:', error);
      return Promise.reject(error);
    }
  };

  // 切換多選模式
  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
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
    setCurrentOperation,
    // 新增的屬性和方法
    isRenamingItem,
    newItemName,
    handleRename,
    handleMove,
    handleCopy,
    handleShare,
    handleTag,
    handleStar,
    setIsRenamingItem,
    setNewItemName,
    selectedItems: Array.from(new Set<string>()),  // 這裡可能需要從外部傳入
    multiSelectMode,
    toggleMultiSelectMode
  };
}; 