// 檔案類型介面
export interface FileItem {
  Key?: string;
  LastModified?: Date;
  Size?: number;
  ETag?: string;
  type: string;
  isStarred?: boolean;   // 新增: 星號標記檔案
  tags?: string[];       // 新增: 檔案標籤
  shareUrl?: string;     // 新增: 分享連結
  versionId?: string;    // 新增: 版本ID，用於版本控制
}

// 資料夾介面
export interface FolderItem {
  name: string;
  type: 'folder';
  size: number;
  lastModified: Date;
  Key?: string;
  isStarred?: boolean;   // 新增: 星號標記資料夾
  tags?: string[];       // 新增: 資料夾標籤
  children?: number;     // 新增: 子項目數量
}

// 檔案預覽組件 Props
export interface FilePreviewProps {
  file: FileItem;
  onClose: () => void;
  onShare?: () => Promise<void>;    // 新增: 分享功能
  onVersions?: () => Promise<void>; // 新增: 查看版本歷史
  onTag?: (tags: string[]) => Promise<void>; // 新增: 標籤管理
}

// 右鍵選單組件 Props
export interface ContextMenuProps {
  file: FileItem | FolderItem;
  position: { x: number; y: number };
  onClose: () => void;
  onAction: (action: string) => void;
  availableActions?: string[];  // 新增: 可用操作列表
}

// 狀態欄組件 Props
export interface StatusBarProps {
  selectedItems: Set<string>;
  totalItems: number;
  totalSize: number;
  uploadProgress?: number;
  currentOperation?: string;
  storageQuota?: {    // 新增: 儲存空間配額
    used: number;
    total: number;
  };
  isSearching?: boolean; // 新增: 是否正在搜尋
}

// 空狀態組件 Props
export interface EmptyStateProps {
  type: 'search' | 'folder' | 'filter' | 'error'; // 新增: 更多空狀態類型
  searchTerm?: string;
  filterType?: string;
  errorMessage?: string;
  onClearFilter?: () => void;  // 新增: 清除篩選條件
  onRetry?: () => void;        // 新增: 重試操作
}

// 上傳進度組件 Props
export interface UploadProgressProps {
  progress: number;
  fileName?: string;       // 新增: 當前上傳檔案名稱
  remainingFiles?: number; // 新增: 剩餘檔案數量
  speed?: number;          // 新增: 上傳速度
  remainingTime?: number;  // 新增: 預估剩餘時間
  onCancel?: () => void;   // 新增: 取消上傳
}

// 搜尋與篩選 Props
export interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  fileType: string;
  onFileTypeChange: (type: string) => void;
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (range: [Date | null, Date | null]) => void;
  sortConfig: { key: string; direction: string };
  onSortChange: (key: string) => void;
  onClearFilters: () => void;
}

// 標籤管理 Props
export interface TagManagerProps {
  tags: string[];
  onTagsChange: (tags: string[]) => Promise<void>;
  availableTags?: string[];
  onCreateTag?: (tag: string) => Promise<void>;
}

// 檔案版本 Props
export interface FileVersionProps {
  fileKey: string;
  versions: Array<{
    versionId: string;
    lastModified: Date;
    size: number;
  }>;
  onRestore: (versionId: string) => Promise<void>;
  onDelete: (versionId: string) => Promise<void>;
  onDownload: (versionId: string) => Promise<void>;
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
  filteredItems: {
    files: FileItem[];
    folders: FolderItem[];
  };
  loadFiles: () => Promise<void>;
  handleRetry: () => void;
  handleEnterFolder: (folderName: string) => void;
  handleGoBack: () => void;
  handleSelectItem: (key: string) => void;
  handleSelectAll: () => void;
  setCurrentPath: (path: string) => void;
  setSelectedItems: (items: Set<string>) => void;
  applyFilters: (filters: FileFilters) => void;
  // 新增功能
  starredItems: Set<string>;
  toggleStarred: (key: string) => Promise<void>;
  breadcrumbs: string[];
  recentFolders: string[];
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
  // 新增功能
  uploadQueue: File[];
  uploadSpeed: number;
  uploadStartTime: Date | null;
  estimatedTimeRemaining: number | null;
  pauseUpload: () => void;
  resumeUpload: () => void;
  cancelUpload: () => void;
  currentFileIndex: number;
  totalFiles: number;
}

// 檔案操作 Hook 返回類型
export interface FileOperationsReturn {
  selectedFile: FileItem | null;
  previewFile: FileItem | null;
  contextMenu: {
    file: FileItem | FolderItem;
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
  handleContextMenu: (e: React.MouseEvent, file: FileItem | FolderItem) => void;
  handleContextMenuAction: (action: string) => Promise<void>;
  setSelectedFile: (file: FileItem | null) => void;
  setPreviewFile: (file: FileItem | null) => void;
  setContextMenu: (menu: {file: FileItem | FolderItem; position: {x: number; y: number}} | null) => void;
  setIsDeleteConfirmOpen: (isOpen: boolean) => void;
  setItemToDelete: (item: {type: 'file' | 'folder', path: string} | null) => void;
  setIsCreatingFolder: (isCreating: boolean) => void;
  setNewFolderName: (name: string) => void;
  setCurrentOperation: (operation: string) => void;
  // 新增功能
  isRenamingItem: boolean;
  newItemName: string;
  handleRename: (oldPath: string, newPath: string) => Promise<void>;
  handleMove: (sourcePaths: string[], destinationPath: string) => Promise<void>;
  handleCopy: (sourcePaths: string[], destinationPath: string) => Promise<void>;
  handleShare: (key: string) => Promise<string>;
  handleTag: (key: string, tags: string[]) => Promise<void>;
  handleStar: (key: string) => Promise<void>;
  setIsRenamingItem: (isRenaming: boolean) => void;
  setNewItemName: (name: string) => void;
  selectedItems: string[];
  multiSelectMode: boolean;
  toggleMultiSelectMode: () => void;
}

// 新增: 檔案篩選條件介面
export interface FileFilters {
  searchTerm?: string;
  fileTypes?: string[];
  dateRange?: [Date | null, Date | null];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// 新增: 欄位寬度設置
export interface ColumnWidths {
  name: number;
  type: number;
  size: number;
  lastModified: number;
  actions: number;
}

// 新增: 欄位寬度配置 Props
export interface ColumnWidthsConfigProps {
  columnWidths: ColumnWidths;
  onColumnWidthChange: (column: keyof ColumnWidths, width: number) => void;
  onResetColumnWidths: () => void;
}

// 新增: 資料夾選擇器 Props
export interface FolderSelectorProps {
  currentPath: string;
  onPathChange: (path: string) => void;
  recentFolders?: string[];
  excludePaths?: string[];
  title?: string;
}

// 新增: 檔案資訊面板 Props
export interface FileInfoProps {
  file: FileItem | FolderItem;
  onClose: () => void;
  onTag: (tags: string[]) => Promise<void>;
  onRename: () => void;
  onMove: () => void;
  onShare?: () => Promise<void>;
} 