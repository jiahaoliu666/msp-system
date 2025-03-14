import { useState, useRef, useEffect } from 'react';
import { TagManagerProps } from '../types';

const TagManager: React.FC<TagManagerProps> = ({ 
  tags, 
  onTagsChange, 
  availableTags = [],
  onCreateTag
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localTags, setLocalTags] = useState<string[]>(tags);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // 監聽外部點擊以關閉建議列表
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 當外部tags變更時更新本地狀態
  useEffect(() => {
    setLocalTags(tags);
  }, [tags]);

  // 提交變更至父組件
  const handleSubmitChanges = async () => {
    try {
      await onTagsChange(localTags);
    } catch (error) {
      console.error('更新標籤時發生錯誤:', error);
      // 還原為原始標籤
      setLocalTags(tags);
    }
  };

  // 當本地標籤變更時自動提交
  useEffect(() => {
    if (JSON.stringify(localTags) !== JSON.stringify(tags)) {
      const timer = setTimeout(() => {
        handleSubmitChanges();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [localTags]); // eslint-disable-line react-hooks/exhaustive-deps

  // 加入標籤
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !localTags.includes(trimmedTag)) {
      const newTags = [...localTags, trimmedTag];
      setLocalTags(newTags);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  // 移除標籤
  const removeTag = (tagToRemove: string) => {
    setLocalTags(localTags.filter(tag => tag !== tagToRemove));
  };

  // 按鍵處理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && localTags.length > 0) {
      removeTag(localTags[localTags.length - 1]);
    }
  };

  // 創建新標籤
  const handleCreateNewTag = async () => {
    if (!inputValue.trim() || !onCreateTag) return;
    
    setIsCreatingTag(true);
    try {
      await onCreateTag(inputValue.trim());
      addTag(inputValue.trim());
    } catch (error) {
      console.error('創建新標籤時發生錯誤:', error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  // 過濾建議標籤
  const filteredSuggestions = availableTags
    .filter(tag => !localTags.includes(tag))
    .filter(tag => tag.toLowerCase().includes(inputValue.toLowerCase()))
    .slice(0, 5);  // 限制顯示數量

  // 標籤顏色生成
  const getTagColor = (tag: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    ];
    
    // 基於標籤名稱哈希碼選擇一個顏色
    const hash = tag.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-800 min-h-[100px]">
        {/* 現有標籤 */}
        {localTags.map(tag => (
          <div
            key={tag}
            className={`${getTagColor(tag)} px-3 py-1 rounded-full flex items-center text-sm`}
          >
            <span>{tag}</span>
            <button
              onClick={() => removeTag(tag)}
              className="ml-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        
        {/* 輸入新標籤 */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={localTags.length === 0 ? "輸入標籤..." : ""}
            className="px-2 py-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 w-full"
          />
          
          {/* 標籤建議 */}
          {showSuggestions && inputValue && (
            <div 
              ref={suggestionsRef} 
              className="absolute top-full left-0 z-10 mt-1 w-52 bg-white dark:bg-gray-800 shadow-lg
                      rounded-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto"
            >
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map(suggestion => (
                  <div
                    key={suggestion}
                    onClick={() => addTag(suggestion)}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    {suggestion}
                  </div>
                ))
              ) : (
                inputValue.trim() && onCreateTag ? (
                  <div className="px-3 py-3 text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">未找到匹配的標籤</div>
                    <button
                      onClick={handleCreateNewTag}
                      disabled={isCreatingTag}
                      className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isCreatingTag ? '創建中...' : `創建標籤 "${inputValue}"`}
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    無匹配標籤
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        按 Enter 新增標籤，點擊標籤以移除
      </div>
    </div>
  );
};

export default TagManager; 