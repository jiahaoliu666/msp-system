import { useState } from 'react';
import { FileItem, FolderItem } from '@/components/storage/types';
import { formatFileSize, formatDateTime, getFileTypeIcon } from '@/services/storage/s3';
import GridView from '@/components/storage/FileList/GridView';
import ListView from '@/components/storage/FileList/ListView';

interface FileListProps {
  files: FileItem[];
  folders: FolderItem[];
  currentPath: string;
  selectedItems: Set<string>;
  viewMode: 'list' | 'grid';
  searchTerm: string;
  fileType: string;
  sortConfig: {
    key: string;
    direction: string;
  };
  currentPage: number;
  itemsPerPage: number;
  onSelectItem: (key: string) => void;
  onEnterFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onDownload: (key: string, fileName: string) => Promise<void>;
  onDelete: (key: string) => void;
  onFilePreview: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, file: FileItem) => void;
  onSort: (key: string) => void;
  starredItems: FileItem[];
}

const FileList: React.FC<FileListProps> = ({
  files,
  folders,
  currentPath,
  selectedItems,
  viewMode,
  searchTerm,
  fileType,
  sortConfig,
  currentPage,
  itemsPerPage,
  onSelectItem,
  onEnterFolder,
  onDeleteFolder,
  onDownload,
  onDelete,
  onFilePreview,
  onContextMenu,
  onSort,
  starredItems
}) => {
  // 檔案篩選與排序
  const filteredFiles = files
    .filter(file => {
      const fileName = file.Key?.toLowerCase() || '';
      const searchMatch = fileName.includes(searchTerm.toLowerCase());
      const typeMatch = !fileType || file.type === fileType;
      return searchMatch && typeMatch;
    })
    .sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      switch (sortConfig.key) {
        case 'name':
          return direction * (a.Key || '').localeCompare(b.Key || '');
        case 'date':
          return direction * ((b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0));
        case 'size':
          return direction * ((b.Size || 0) - (a.Size || 0));
        case 'type':
          return direction * (a.type || '').localeCompare(b.type || '');
        default:
          return 0;
      }
    });

  // 分頁處理
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return viewMode === 'grid' ? (
    <GridView
      folders={folders}
      files={paginatedFiles}
      currentPath={currentPath}
      selectedItems={selectedItems}
      onSelectItem={onSelectItem}
      onEnterFolder={onEnterFolder}
      onDeleteFolder={onDeleteFolder}
      onDownload={onDownload}
      onDelete={onDelete}
      onFilePreview={onFilePreview}
      onContextMenu={onContextMenu}
    />
  ) : (
    <ListView
      folders={folders}
      files={paginatedFiles}
      currentPath={currentPath}
      selectedItems={selectedItems}
      sortConfig={sortConfig}
      onSelectItem={onSelectItem}
      onEnterFolder={onEnterFolder}
      onDeleteFolder={onDeleteFolder}
      onDownload={onDownload}
      onDelete={onDelete}
      onFilePreview={onFilePreview}
      onContextMenu={onContextMenu}
      onSort={onSort}
    />
  );
};

export default FileList; 