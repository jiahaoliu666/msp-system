// 檔案類型介面
export interface FileItem {
  Key?: string;
  LastModified?: Date;
  Size?: number;
  ETag?: string;
  type: string;
}

// 資料夾介面
export interface FolderItem {
  name: string;
  type: 'folder';
  size: number;
  lastModified: Date;
  Key?: string;
}

// 檔案預覽組件 Props
export interface FilePreviewProps {
  file: FileItem;
  onClose: () => void;
}

// 右鍵選單組件 Props
export interface ContextMenuProps {
  file: FileItem;
  position: { x: number; y: number };
  onClose: () => void;
  onAction: (action: string) => void;
}

// 狀態欄組件 Props
export interface StatusBarProps {
  selectedItems: Set<string>;
  totalItems: number;
  totalSize: number;
  uploadProgress?: number;
  currentOperation?: string;
}

// 空狀態組件 Props
export interface EmptyStateProps {
  type: 'search' | 'folder';
  searchTerm?: string;
}

// 上傳進度組件 Props
export interface UploadProgressProps {
  progress: number;
}

// 檔案管理 Hook 返回類型
export interface FileManagerReturn {
  files: FileItem[];
  folders: FolderItem[];
  isLoading: boolean;
  error: string | null;
  currentPath: string;
  parentPath: string | null;
  selectedItems: Set<string>;
  totalSize: number;
  loadFiles: () => Promise<void>;
  handleRetry: () => void;
  handleEnterFolder: (folderName: string) => void;
  handleGoBack: () => void;
  handleSelectItem: (key: string) => void;
  handleSelectAll: () => void;
  setCurrentPath: (path: string) => void;
  setSelectedItems: (items: Set<string>) => void;
}

// 檔案上傳 Hook 返回類型
export interface UploadReturn {
  isUploading: boolean;
  uploadProgress: number;
  draggedOver: boolean;
  duplicateFile: {
    file: File;
    existingKey: string;
    newKey: string;
  } | null;
  onDrop: (acceptedFiles: File[]) => Promise<void>;
  handleUploadClick: () => void;
  handleDuplicateFile: (action: 'replace' | 'keep-both' | 'skip') => Promise<void>;
  setDraggedOver: (isDraggedOver: boolean) => void;
  getRootProps: any;
  getInputProps: any;
  isDragActive: boolean;
}

// 檔案操作 Hook 返回類型
export interface FileOperationsReturn {
  selectedFile: FileItem | null;
  previewFile: FileItem | null;
  contextMenu: {
    file: FileItem;
    position: { x: number; y: number };
  } | null;
  isDeleteConfirmOpen: boolean;
  itemToDelete: {type: 'file' | 'folder', path: string} | null;
  isCreatingFolder: boolean;
  newFolderName: string;
  currentOperation: string;
  handleDownload: (key: string, fileName: string) => Promise<void>;
  handleDelete: (key: string) => Promise<void>;
  handleDeleteFolder: (folderName: string) => Promise<void>;
  handleConfirmDelete: () => Promise<void>;
  handleCreateFolder: () => Promise<void>;
  handleFilePreview: (file: FileItem) => void;
  handleContextMenu: (e: React.MouseEvent, file: FileItem) => void;
  handleContextMenuAction: (action: string) => Promise<void>;
  setSelectedFile: (file: FileItem | null) => void;
  setPreviewFile: (file: FileItem | null) => void;
  setContextMenu: (menu: {file: FileItem; position: {x: number; y: number}} | null) => void;
  setIsDeleteConfirmOpen: (isOpen: boolean) => void;
  setItemToDelete: (item: {type: 'file' | 'folder', path: string} | null) => void;
  setIsCreatingFolder: (isCreating: boolean) => void;
  setNewFolderName: (name: string) => void;
  setCurrentOperation: (operation: string) => void;
} 