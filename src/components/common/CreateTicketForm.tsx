import React, { useState, useRef } from 'react';
import { IoWarning } from "react-icons/io5";
import { MdPriorityHigh, MdDescription, MdBusinessCenter, MdSource, MdEngineering } from "react-icons/md";
import { BsTicketDetailed, BsBuilding, BsPaperclip } from "react-icons/bs";
import { FaRegClock } from "react-icons/fa";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticketData: {
    title: string;
    description: string;
    type: string;
    priority: string;
    organization: string;
    business: string;
    source: string;
    engineer: string;
    productName: string;
    eventType: string;
    attachments: File[];
  }) => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'maintenance',
    priority: 'medium',
    organization: '',
    business: '',
    source: '',
    engineer: '',
    productName: '',
    eventType: '',
    attachments: [] as File[],
  });

  const [showErrors, setShowErrors] = useState(false);
  const [touched, setTouched] = useState({
    title: false,
    description: false,
    organization: false,
    business: false,
    source: false,
    engineer: false,
    productName: false,
    eventType: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    
    // 檢查所有必填欄位
    const isValid = [
      'title',
      'description',
      'organization',
      'business',
      'source',
      'engineer',
      'productName',
      'eventType'
    ].every(field => formData[field as keyof typeof formData]);

    if (isValid) {
      onSubmit(formData);
      setFormData({
        title: '',
        description: '',
        type: 'maintenance',
        priority: 'medium',
        organization: '',
        business: '',
        source: '',
        engineer: '',
        productName: '',
        eventType: '',
        attachments: [],
      });
      setShowErrors(false);
      setTouched({
        title: false,
        description: false,
        organization: false,
        business: false,
        source: false,
        engineer: false,
        productName: false,
        eventType: false,
      });
      onClose();
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles],
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (formData.priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'maintenance',
      priority: 'medium',
      organization: '',
      business: '',
      source: '',
      engineer: '',
      productName: '',
      eventType: '',
      attachments: [],
    });
    setShowErrors(false);
    setTouched({
      title: false,
      description: false,
      organization: false,
      business: false,
      source: false,
      engineer: false,
      productName: false,
      eventType: false,
    });
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
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">建立新工單</h2>
              </div>
            </div>
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
            <div className="bg-white rounded-xl space-y-6">
              {/* 工單標題 */}
              <div className="group">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  工單標題 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 pl-10"
                    placeholder="請輸入標題"
                  />
                  <BsTicketDetailed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {showErrors && !formData.title && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <IoWarning className="mr-1" />
                    請輸入工單標題
                  </p>
                )}
              </div>

              {/* 客戶和來源並排 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 客戶 */}
                <div className="group">
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    客戶 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="organization"
                      required
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 pl-10"
                      placeholder="請輸入客戶名稱"
                    />
                    <BsBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {showErrors && !formData.organization && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <IoWarning className="mr-1" />
                      請輸入客戶名稱
                    </p>
                  )}
                </div>

                {/* 來源 */}
                <div className="group">
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    來自 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="source"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white appearance-none pl-10"
                    >
                      <option value="phone">話機</option>
                      <option value="email">電子郵件</option>
                      <option value="chat">其他通訊軟體</option>
                    </select>
                    <MdSource className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {showErrors && !formData.source && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <IoWarning className="mr-1" />
                      請選擇來源
                    </p>
                  )}
                </div>
              </div>

              {/* 工程師和業務並排 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 工程師 */}
                <div className="group">
                  <label htmlFor="engineer" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    工程師 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="engineer"
                      required
                      value={formData.engineer}
                      onChange={(e) => setFormData({ ...formData, engineer: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 pl-10"
                      placeholder="請輸入工程師資訊"
                    />
                    <MdEngineering className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {showErrors && !formData.engineer && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <IoWarning className="mr-1" />
                      請輸入工程師資訊
                    </p>
                  )}
                </div>

                {/* 業務 */}
                <div className="group">
                  <label htmlFor="business" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    業務 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="business"
                      required
                      value={formData.business}
                      onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 pl-10"
                      placeholder="請輸入業務名稱 or 無"
                    />
                    <MdBusinessCenter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {showErrors && !formData.business && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <IoWarning className="mr-1" />
                      請輸入業務名稱
                    </p>
                  )}
                </div>
              </div>

              {/* 工單類型和優先級並排 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 工單類型 */}
                <div className="group">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    工單類型 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white appearance-none pl-10"
                    >
                      <option value="maintenance">客戶進線</option>
                      <option value="consultation">技術諮詢</option>
                      <option value="incident">故障排除</option>
                      <option value="request">服務請求</option>
                      <option value="other">其他</option>
                    </select>
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 優先級 */}
                <div className="group">
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    優先級別 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white appearance-none pl-10"
                    >
                      <option value="high">高 - 緊急處理</option>
                      <option value="medium">中 - 正常處理</option>
                      <option value="low">低 - 可延後處理</option>
                    </select>
                    <MdPriorityHigh className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getPriorityColor(formData.priority)}`} />
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 產品名稱和事件類型並排 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 產品名稱 */}
                <div className="group">
                  <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    產品名稱 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="productName"
                      required
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 pl-10"
                      placeholder="請輸入產品名稱"
                    />
                    <MdBusinessCenter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {showErrors && !formData.productName && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <IoWarning className="mr-1" />
                      請輸入產品名稱
                    </p>
                  )}
                </div>

                {/* 事件類型 */}
                <div className="group">
                  <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    事件類型 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="eventType"
                      required
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 pl-10"
                    >
                      <option value="event">事件管理</option>
                      <option value="incident">事故管理</option>
                      <option value="problem">問題管理</option>
                      <option value="change">變更管理</option>
                    </select>
                    <MdDescription className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {showErrors && !formData.eventType && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <IoWarning className="mr-1" />
                      請輸入事件類型
                    </p>
                  )}
                </div>
              </div>

              {/* 詳細描述 */}
              <div className="group">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  工單描述 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                    placeholder="請詳細描述具體情況"
                  />
                </div>
                {showErrors && !formData.description && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <IoWarning className="mr-1" />
                    請輸入工單描述
                  </p>
                )}
              </div>

              {/* 附件上傳 */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  附件
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-all duration-200">
                  <div className="space-y-1 text-center">
                    <BsPaperclip className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>上傳檔案</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                      </label>
                      <p className="pl-1">或拖放檔案至此處</p>
                    </div>
                  </div>
                </div>

                {/* 已上傳檔案列表 */}
                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <BsPaperclip className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                <span>建立工單</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketModal; 