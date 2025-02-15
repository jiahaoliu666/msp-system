import React, { useState } from 'react';
import { IoWarning } from 'react-icons/io5';

interface CreateHandoverItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  category: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  attachments: File[];
}

export default function CreateHandoverItemForm({ isOpen, onClose, onSuccess }: CreateHandoverItemFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '內部交辦任務',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium',
    tags: [],
    attachments: []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [newTag, setNewTag] = useState('');

  // 預設分類選項
  const categories = [
    '內部交辦任務',
    '每日交接簽閱',
    '測試資源',
    '帳號相關',
    '系統管理',
    '客戶管理',
    '文件管理',
    '資產管理'
  ];

  // 預設標籤選項
  const defaultTags = ['交接', '重要', '帳號相關', '系統', '客戶', '文件', '設備'];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = '請輸入標題';
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = '請選擇分類';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = '請輸入描述';
      isValid = false;
    }

    if (!formData.assignee.trim()) {
      newErrors.assignee = '請指派負責人';
      isValid = false;
    }

    if (!formData.dueDate) {
      newErrors.dueDate = '請選擇到期日';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // TODO: 實作提交邏輯
      console.log('提交表單:', formData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
      // 重置表單
      setFormData({
        title: '',
        category: '內部交辦任務',
        description: '',
        assignee: '',
        dueDate: '',
        priority: 'medium',
        tags: [],
        attachments: []
      });
    } catch (error) {
      console.error('Error creating handover item:', error);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(file => file !== fileToRemove)
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '內部交辦任務',
      description: '',
      assignee: '',
      dueDate: '',
      priority: 'medium',
      tags: [],
      attachments: []
    });
    setErrors({});
    setNewTag('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 transform transition-all"
        >
          {/* 標題區域 */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-800">新增交接項目</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
              aria-label="關閉"
            >
              <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 標題 */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                標題 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="請輸入交接項目標題"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <IoWarning className="mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* 分類和優先級 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  分類 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <IoWarning className="mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  優先級 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
            </div>

            {/* 負責人和到期日 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  負責人 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="請輸入負責人姓名"
                />
                {errors.assignee && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <IoWarning className="mr-1" />
                    {errors.assignee}
                  </p>
                )}
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  到期日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
                {errors.dueDate && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <IoWarning className="mr-1" />
                    {errors.dueDate}
                  </p>
                )}
              </div>
            </div>

            {/* 描述 */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                placeholder="請詳細描述交接項目內容"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <IoWarning className="mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* 標籤 */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                標籤
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="新增標籤"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  新增
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {defaultTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!formData.tags.includes(tag)) {
                        setFormData(prev => ({
                          ...prev,
                          tags: [...prev.tags, tag]
                        }));
                      }
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-100"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 附件上傳 */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                附件
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-all duration-200">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>上傳檔案</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">或拖放檔案至此處</p>
                  </div>
                  <p className="text-xs text-gray-500">支援所有檔案類型</p>
                </div>
              </div>

              {/* 已上傳檔案列表 */}
              {formData.attachments.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {formData.attachments.map((file, index) => (
                    <li key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 按鈕組 */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-gray-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>取消</span>
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 focus:ring-2 focus:ring-blue-300 flex items-center space-x-2 shadow-lg shadow-blue-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>建立交接項目</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 