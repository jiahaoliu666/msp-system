import React from 'react';
import { FileItem, FolderItem } from '@/components/storage/types';
import { formatFileSize, formatDateTime } from '@/services/storage/s3';

interface ListViewProps {
  folders: FolderItem[];
  files: FileItem[];
  currentPath: string;
  selectedItems: Set<string>;
  sortConfig: {
    key: string;
    direction: string;
  };
  onSelectItem: (key: string) => void;
  onEnterFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onDownload: (key: string, fileName: string) => Promise<void>;
  onDelete: (key: string) => void;
  onFilePreview: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, file: FileItem) => void;
  onSort: (key: string) => void;
}

const ListView: React.FC<ListViewProps> = ({
  folders,
  files,
  currentPath,
  selectedItems,
  sortConfig,
  onSelectItem,
  onEnterFolder,
  onDeleteFolder,
  onDownload,
  onDelete,
  onFilePreview,
  onContextMenu,
  onSort
}) => {
  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-900">
        <tr>
          <th className="w-[40px] px-6 py-3 text-left">
            <input
              type="checkbox"
              checked={selectedItems.size > 0}
              onChange={() => {/* 全選/取消全選的處理會在父組件中 */}}
              className="rounded border-gray-300 text-blue-600 
                       focus:ring-blue-500 dark:border-gray-600 
                       dark:bg-gray-700 dark:checked:border-blue-500 
                       dark:checked:bg-blue-500 dark:focus:ring-offset-gray-800"
            />
          </th>
          <th 
            onClick={() => onSort('name')}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 
                     dark:text-gray-400 uppercase tracking-wider cursor-pointer 
                     hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="flex items-center space-x-1">
              <span>名稱</span>
              {sortConfig.key === 'name' && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={sortConfig.direction === 'asc' 
                          ? "M8 7l4-4m0 0l4 4m-4-4v18" 
                          : "M16 17l-4 4m0 0l-4-4m4 4V3"} 
                  />
                </svg>
              )}
            </div>
          </th>
          <th 
            onClick={() => onSort('type')}
            className="w-[120px] px-6 py-3 text-left text-xs font-medium text-gray-500 
                     dark:text-gray-400 uppercase tracking-wider cursor-pointer 
                     hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="flex items-center space-x-1">
              <span>類型</span>
              {sortConfig.key === 'type' && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={sortConfig.direction === 'asc' 
                      ? "M8 7l4-4m0 0l4 4m-4-4v18" 
                      : "M16 17l-4 4m0 0l-4-4m4 4V3"} 
                  />
                </svg>
              )}
            </div>
          </th>
          <th 
            onClick={() => onSort('size')}
            className="w-[120px] px-6 py-3 text-left text-xs font-medium text-gray-500 
                     dark:text-gray-400 uppercase tracking-wider cursor-pointer 
                     hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="flex items-center space-x-1">
              <span>大小</span>
              {sortConfig.key === 'size' && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={sortConfig.direction === 'asc' 
                      ? "M8 7l4-4m0 0l4 4m-4-4v18" 
                      : "M16 17l-4 4m0 0l-4-4m4 4V3"} 
                  />
                </svg>
              )}
            </div>
          </th>
          <th 
            onClick={() => onSort('date')}
            className="w-[180px] px-6 py-3 text-left text-xs font-medium text-gray-500 
                     dark:text-gray-400 uppercase tracking-wider cursor-pointer 
                     hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="flex items-center space-x-1">
              <span>修改時間</span>
              {sortConfig.key === 'date' && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={sortConfig.direction === 'asc' 
                      ? "M8 7l4-4m0 0l4 4m-4-4v18" 
                      : "M16 17l-4 4m0 0l-4-4m4 4V3"} 
                  />
                </svg>
              )}
            </div>
          </th>
          <th className="w-[120px] px-6 py-3 text-left text-xs font-medium text-gray-500 
                        dark:text-gray-400 uppercase tracking-wider">操作</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* 資料夾列表 */}
        {folders.map((folder, index) => (
          <tr 
            key={`folder-${index}`} 
            className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onContextMenu={(e) => onContextMenu(e, { ...folder, type: 'folder' } as FileItem)}
          >
            <td className="px-6 py-4 align-middle">
              <input
                type="checkbox"
                checked={selectedItems.has(`${currentPath}/${folder.name}/`)}
                onChange={() => onSelectItem(`${currentPath}/${folder.name}/`)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 
                         dark:border-gray-600 dark:bg-gray-700 dark:checked:border-blue-500 
                         dark:checked:bg-blue-500 dark:focus:ring-offset-gray-800"
              />
            </td>
            <td className="px-6 py-4 align-middle">
              <button
                onClick={() => onEnterFolder(folder.name)}
                className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span className="font-medium">{folder.name}</span>
              </button>
            </td>
            <td className="px-6 py-4 align-middle text-gray-500 dark:text-gray-400">資料夾</td>
            <td className="px-6 py-4 align-middle text-gray-500 dark:text-gray-400">{formatFileSize(folder.size)}</td>
            <td className="px-6 py-4 align-middle text-gray-500 dark:text-gray-400">
              {formatDateTime(folder.lastModified)}
            </td>
            <td className="px-6 py-4 align-middle">
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onDeleteFolder(folder.name)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                           text-gray-500 dark:text-gray-400 hover:text-red-600 
                           dark:hover:text-red-400 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        ))}

        {/* 檔案列表 */}
        {files.map((file, index) => (
          <tr 
            key={`file-${index}`} 
            className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onContextMenu={(e) => onContextMenu(e, file)}
            onDoubleClick={() => onFilePreview(file)}
          >
            <td className="px-6 py-4 align-middle">
              <input
                type="checkbox"
                checked={selectedItems.has(`${currentPath}/${file.Key}`)}
                onChange={() => onSelectItem(`${currentPath}/${file.Key}`)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 
                         dark:border-gray-600 dark:bg-gray-700 dark:checked:border-blue-500 
                         dark:checked:bg-blue-500 dark:focus:ring-offset-gray-800"
              />
            </td>
            <td className="px-6 py-4 align-middle">
              <div className="flex items-center">
                <span className="font-medium text-gray-900 dark:text-gray-100">{file.Key?.split('/').pop() || ''}</span>
              </div>
            </td>
            <td className="px-6 py-4 align-middle text-gray-500 dark:text-gray-400">{file.type.toUpperCase()}</td>
            <td className="px-6 py-4 align-middle text-gray-500 dark:text-gray-400">{formatFileSize(file.Size || 0)}</td>
            <td className="px-6 py-4 align-middle text-gray-500 dark:text-gray-400">
              {file.LastModified ? formatDateTime(file.LastModified) : '-'}
            </td>
            <td className="px-6 py-4 align-middle">
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onDownload(file.Key || '', file.Key?.split('/').pop() || '')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                           text-gray-500 dark:text-gray-400 hover:text-blue-600 
                           dark:hover:text-blue-400 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L7 8m4-4v12" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(file.Key || '')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                           text-gray-500 dark:text-gray-400 hover:text-red-600 
                           dark:hover:text-red-400 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ListView; 