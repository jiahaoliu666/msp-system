import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

interface CreateOrganizationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateOrganizationForm({ isOpen, onClose, onSuccess }: CreateOrganizationFormProps) {
  const [formData, setFormData] = useState({
    organizationName: '',
    contractName: '',
    description: ''
  });

  const [contractList, setContractList] = useState<string[]>([]);

  // 獲取合約列表
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const client = new DynamoDBClient({
          region: process.env.NEXT_PUBLIC_AWS_REGION,
          credentials: {
            accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
          }
        });

        const docClient = DynamoDBDocumentClient.from(client);

        const { Items = [] } = await docClient.send(
          new ScanCommand({
            TableName: "MetaAge-MSP-Contract-Management",
            ProjectionExpression: "contractName"
          })
        );

        const contractNames = Items.map(item => item.contractName);
        setContractList(contractNames);
      } catch (error) {
        console.error('Error fetching contracts:', error);
      }
    };

    fetchContracts();
  }, []);

  // 生成組織編號
  const generateOrganizationId = () => {
    const date = new Date();
    // 轉換為台北時區 (UTC+8)
    const taipeiDate = new Date(date.getTime() + (8 * 60 * 60 * 1000));
    
    const year = taipeiDate.getUTCFullYear();
    const month = String(taipeiDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(taipeiDate.getUTCDate()).padStart(2, '0');
    const hours = String(taipeiDate.getUTCHours()).padStart(2, '0');
    const minutes = String(taipeiDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(taipeiDate.getUTCSeconds()).padStart(2, '0');

    return `ORG-${year}${month}${day}${hours}${minutes}${seconds}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

      // 取得當前台北時間
      const now = new Date();
      // 設定為台北時區 (UTC+8)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      
      // 格式化時間為 "YYYY-MM-DD HH:mm:ss" 格式
      const formattedTime = now.toLocaleString('zh-TW', options)
        .replace(/\//g, '-');

      const params = {
        TableName: "MetaAge-MSP-Organization-Management",
        Item: {
          organizationName: formData.organizationName,
          contractName: formData.contractName,
          description: formData.description,
          createdAt: formattedTime,
          updatedAt: formattedTime,
          members: 0,
          status: 'active'
        }
      };

      await docClient.send(new PutCommand(params));
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
      setFormData({
        organizationName: '',
        contractName: '',
        description: ''
      });
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('建立組織時發生錯誤，請稍後再試。');
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
            <h2 className="text-2xl font-bold text-gray-800">建立新組織</h2>
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
              {/* 組織名稱 */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  組織名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  required
                  placeholder="請輸入組織名稱"
                />
              </div>

              {/* 合約名稱 */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  合約名稱 <span className="text-red-500">*</span>
                </label>
                <select
                  name="contractName"
                  value={formData.contractName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  required
                >
                  <option value="">請選擇合約</option>
                  {contractList.map((contractName, index) => (
                    <option key={index} value={contractName}>
                      {contractName}
                    </option>
                  ))}
                </select>
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
                  placeholder="請輸入組織描述"
                  required
                />
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
                <span>建立組織</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
