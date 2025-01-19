import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

interface CreateContractFormProps {
  isOpen: boolean;
  onClose: () => void;
  existingProducts: string[];
}

const contractTypeOptions = [
  { value: 'service', label: '帳務託管' },
  { value: 'maintenance-8', label: '5*8 雲顧問' },
  { value: 'maintenance-24', label: '7*24 雲託管' },
  { value: 'internal', label: '內部合約' }
];

export default function CreateContractForm({ isOpen, onClose, existingProducts }: CreateContractFormProps) {
  const [formData, setFormData] = useState({
    contractName: '',
    contractType: '',
    productName: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const [productName, setProductName] = useState('');
  const [productList, setProductList] = useState<string[]>([]);
  const [showProductInput, setShowProductInput] = useState(false);
  const [showProductManage, setShowProductManage] = useState(false);
  const [existingProductSet, setExistingProductSet] = useState<Set<string>>(new Set());

  // 生成合約編號
  const generateContractId = () => {
    const date = new Date();
    // 轉換為台北時區 (UTC+8)
    const taipeiDate = new Date(date.getTime() + (8 * 60 * 60 * 1000));
    
    const year = taipeiDate.getUTCFullYear();
    const month = String(taipeiDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(taipeiDate.getUTCDate()).padStart(2, '0');
    const hours = String(taipeiDate.getUTCHours()).padStart(2, '0');
    const minutes = String(taipeiDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(taipeiDate.getUTCSeconds()).padStart(2, '0');

    return `MSP-${year}${month}${day}${hours}${minutes}${seconds}`;
  };

  // 初始化產品列表和已存在產品集合
  useEffect(() => {
    setProductList(existingProducts);
    setExistingProductSet(new Set(existingProducts));
  }, [existingProducts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProduct = () => {
    if (productName.trim() && !productList.includes(productName.trim())) {
      setProductList(prev => [...prev, productName.trim()]);
      setProductName('');
      setShowProductInput(false);
    }
  };

  const handleRemoveProduct = (productToRemove: string) => {
    // 如果是已存在的產品，不允許刪除
    if (existingProductSet.has(productToRemove)) {
      return;
    }
    setProductList(prev => prev.filter(product => product !== productToRemove));
    if (formData.productName === productToRemove) {
      setFormData(prev => ({ ...prev, productName: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const client = new DynamoDBClient({
        region: process.env.NEXT_PUBLIC_AWS_REGION,
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
        }
      });

      const docClient = DynamoDBDocumentClient.from(client);

      // 取得當前 UTC+8 時間
      const now = new Date();
      const utc8Time = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      const formattedTime = utc8Time.toISOString().replace('Z', '+08:00');

      // 生成合約編號
      const contractId = generateContractId();

      const params = {
        TableName: "MetaAge-MSP-Contract-Management",
        Item: {
          contractId: contractId,
          contractName: formData.contractName,
          contractType: formData.contractType,
          productName: formData.productName,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          contractStatus: '待簽署',
          createdAt: formattedTime,
          updatedAt: formattedTime
        }
      };

      await docClient.send(new PutCommand(params));
      
      onClose();
      setFormData({
        contractName: '',
        contractType: '',
        productName: '',
        description: '',
        startDate: '',
        endDate: ''
      });
    } catch (error) {
      console.error('Error creating contract:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 標題區域 */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-800">建立新合約</h2>
            <button
              onClick={onClose}
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
              {/* 合約名稱 */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  合約名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contractName"
                  value={formData.contractName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  required
                  placeholder="請輸入合約名稱"
                />
              </div>

              {/* 合約類型 */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  合約類型 <span className="text-red-500">*</span>
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                  required
                >
                  <option value="">請選擇合約類型</option>
                  {contractTypeOptions.map(option => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 產品名稱 */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  產品名稱 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {/* 產品選擇區 */}
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <select
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-700 appearance-none"
                        required
                      >
                        <option value="" className="text-gray-500">請選擇產品名稱</option>
                        {productList.map((product, index) => (
                          <option key={index} value={product} className="text-gray-700">
                            {product}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProductInput(true)}
                      className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-150 flex items-center space-x-1 min-w-[88px] justify-center shadow-sm"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>新增</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProductManage(true)}
                      className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-150 flex items-center space-x-1 min-w-[88px] justify-center shadow-sm"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      <span>管理</span>
                    </button>
                  </div>

                  {/* 新增產品輸入區 */}
                  {showProductInput && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          新增產品
                        </label>
                        <input
                          type="text"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder="請輸入產品名稱"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          autoFocus
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handleAddProduct}
                          disabled={!productName.trim() || productList.includes(productName.trim())}
                          className={`flex-1 py-2 rounded-lg transition-colors duration-150 flex items-center justify-center space-x-1
                            ${productName.trim() && !productList.includes(productName.trim())
                              ? 'bg-green-500 hover:bg-green-600 text-white' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>確認新增</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowProductInput(false);
                            setProductName('');
                          }}
                          className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-150 flex items-center justify-center space-x-1"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>取消</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 產品管理區 */}
                  {showProductManage && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-600">
                          管理產品列表
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowProductManage(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {productList.length > 0 ? (
                          productList.map((product, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-2 bg-white rounded-lg border ${
                                existingProductSet.has(product) ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">{product}</span>
                                {existingProductSet.has(product) && (
                                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                    使用中
                                  </span>
                                )}
                              </div>
                              {!existingProductSet.has(product) && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProduct(product)}
                                  className="text-red-400 hover:text-red-600 p-1"
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            尚無產品，請點擊新增按鈕添加產品
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 描述 */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                  placeholder="請輸入合約描述"
                  required
                />
              </div>

              {/* 日期區域 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 開始日期 */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    開始日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    required
                  />
                </div>

                {/* 到期日期 */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    到期日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 按鈕組 */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
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
                <span>建立合約</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
