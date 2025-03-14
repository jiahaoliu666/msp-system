import React from 'react';
import { FileItem, FolderItem } from '@/components/storage/types';
import { formatFileSize, getFileTypeIcon } from '@/services/storage/s3';

interface GridViewProps {
  folders: FolderItem[];
  files: FileItem[];
  currentPath: string;
  selectedItems: Set<string>;
  onSelectItem: (key: string) => void;
  onEnterFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onDownload: (key: string, fileName: string) => Promise<void>;
  onDelete: (key: string) => void;
  onFilePreview: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, file: FileItem) => void;
}

const GridView: React.FC<GridViewProps> = ({
  folders,
  files,
  currentPath,
  selectedItems,
  onSelectItem,
  onEnterFolder,
  onDeleteFolder,
  onDownload,
  onDelete,
  onFilePreview,
  onContextMenu
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {folders.map((folder: FolderItem, index: number) => (
        <div
          key={`folder-${index}`}
          className="relative group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                   dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 
                   hover:shadow-md transition-all duration-200"
          onContextMenu={(e) => onContextMenu(e, folder as FileItem)}
        >
          <div className="p-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center text-4xl mb-3 
                            text-blue-600 dark:text-blue-400">
                📁
              </div>
              <div className="w-full">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 
                              text-center truncate">
                  {folder.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                  {formatFileSize(folder.size)}
                </div>
              </div>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onDeleteFolder(folder.name)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                         text-gray-500 dark:text-gray-400 hover:text-red-600 
                         dark:hover:text-red-400 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <button
            onClick={() => onEnterFolder(folder.name)}
            className="absolute inset-0 w-full h-full cursor-pointer z-10"
          />
        </div>
      ))}
      {files.map((file: FileItem, index: number) => (
        <div
          key={`file-${index}`}
          className="relative group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                   dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 
                   hover:shadow-md transition-all duration-200"
          onContextMenu={(e) => onContextMenu(e, file)}
          onDoubleClick={() => onFilePreview(file)}
        >
          <div className="p-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center text-4xl mb-3 
                            text-gray-600 dark:text-gray-400">
                {getFileTypeIcon(file.Key?.split('/').pop() || '')}
              </div>
              <div className="w-full">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 
                              text-center truncate">
                  {file.Key?.split('/').pop() || ''}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                  {formatFileSize(file.Size || 0)}
                </div>
              </div>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 
                          transition-opacity flex space-x-1">
              <button
                onClick={() => onDownload(file.Key || '', file.Key?.split('/').pop() || '')}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                         text-gray-500 dark:text-gray-400 hover:text-blue-600 
                         dark:hover:text-blue-400 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L7 8m4-4v12" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(file.Key || '')}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                         text-gray-500 dark:text-gray-400 hover:text-red-600 
                         dark:hover:text-red-400 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridView; 