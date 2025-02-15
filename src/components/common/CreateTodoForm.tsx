import { useState, useEffect } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';

interface CreateTodoFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: string;
  tags: string[];
}

interface ValidationErrors {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  priority?: string;
}

export default function CreateTodoForm({ isOpen, onClose }: CreateTodoFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: '',
    tags: []
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [newTag, setNewTag] = useState('');
  const [showFeedback, setShowFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // 預設標籤選項
  const defaultTags = ['緊急', '重要', '例行', '待討論', '進行中'];

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = '請輸入標題';
      isValid = false;
    }

    if (!formData.priority) {
      newErrors.priority = '請選擇優先級';
      isValid = false;
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = '結束日期不能早於開始日期';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setShowFeedback({
        type: 'error',
        message: '請檢查表單填寫是否正確'
      });
      return;
    }

    try {
      // TODO: 實作提交邏輯
      console.log('提交表單:', formData);
      
      setShowFeedback({
        type: 'success',
        message: '待辦事項建立成功！'
      });

      // 3秒後關閉表單
      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);
    } catch (error) {
      setShowFeedback({
        type: 'error',
        message: '建立失敗，請稍後再試'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      priority: '',
      tags: []
    });
    setErrors({});
    setShowFeedback(null);
    setNewTag('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div 
          className="relative bg-background-primary rounded-xl shadow-xl max-w-lg w-full p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-text-primary">建立待辦事項</h2>
            <button
              onClick={handleClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          {showFeedback && (
            <div className={`mb-4 p-3 rounded-lg ${
              showFeedback.type === 'success' 
                ? 'bg-success-color/10 text-success-color' 
                : 'bg-error-color/10 text-error-color'
            }`}>
              {showFeedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 標題 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-1">
                標題 <span className="text-error-color">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full p-2 border rounded-lg bg-background-primary text-text-primary
                         focus:ring-2 focus:ring-accent-color focus:border-transparent
                         ${errors.title ? 'border-error-color' : 'border-border-color'}`}
                placeholder="請輸入標題"
              />
              {errors.title && <p className="mt-1 text-sm text-error-color">{errors.title}</p>}
            </div>

            {/* 描述 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">
                描述
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-border-color rounded-lg bg-background-primary
                         text-text-primary focus:ring-2 focus:ring-accent-color
                         focus:border-transparent min-h-[100px]"
                placeholder="請輸入待辦事項描述"
              />
            </div>

            {/* 日期區間 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-text-primary mb-1">
                  開始日期
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-2 border border-border-color rounded-lg bg-background-primary
                           text-text-primary focus:ring-2 focus:ring-accent-color focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-text-primary mb-1">
                  結束日期
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full p-2 border rounded-lg bg-background-primary text-text-primary
                           focus:ring-2 focus:ring-accent-color focus:border-transparent
                           ${errors.endDate ? 'border-error-color' : 'border-border-color'}`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-error-color">{errors.endDate}</p>}
              </div>
            </div>

            {/* 優先級 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                優先級 <span className="text-error-color">*</span>
              </label>
              <div className="flex space-x-4">
                {['high', 'medium', 'low'].map((priority) => (
                  <label key={priority} className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      checked={formData.priority === priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="form-radio h-4 w-4 text-accent-color"
                    />
                    <span className="ml-2 text-sm text-text-primary">
                      {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
                    </span>
                  </label>
                ))}
              </div>
              {errors.priority && <p className="mt-1 text-sm text-error-color">{errors.priority}</p>}
            </div>

            {/* 標籤 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                標籤
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-accent-color/10 text-accent-color rounded-full
                             flex items-center gap-1 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-error-color"
                    >
                      <FiX size={16} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="新增標籤"
                  className="flex-1 p-2 border border-border-color rounded-lg bg-background-primary
                           text-text-primary focus:ring-2 focus:ring-accent-color focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="p-2 bg-accent-color text-white rounded-lg hover:bg-accent-hover
                           transition-colors flex items-center justify-center"
                >
                  <FiPlus size={20} />
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
                    className="px-2 py-1 border border-border-color rounded-full text-sm
                             text-text-secondary hover:bg-hover-color transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 按鈕組 */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-border-color rounded-lg text-text-primary
                         hover:bg-hover-color transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent-color text-white rounded-lg hover:bg-accent-hover
                         transition-colors"
              >
                建立
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
