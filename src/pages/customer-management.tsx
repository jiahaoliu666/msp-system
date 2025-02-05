import React, { useState, useEffect } from 'react';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { DynamoDB } from 'aws-sdk';
import { DB_CONFIG } from '../config/db-config';

const dynamoDB = new DynamoDB.DocumentClient();

export interface CustomerData {
  customerName: string;  // 分區索引
  email: string;
  type: string;
  status: string;
  service: string;
  lastActivity: string;
  manager: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const customerService = {
  async getAllCustomers(): Promise<CustomerData[]> {
    try {
      // 1. 獲取客戶資料
      const customerParams = {
        TableName: DB_CONFIG.tables.CUSTOMER_MANAGEMENT,
        ProjectionExpression: "customerName, email, #type, #status, service, lastActivity, #manager, createdAt, updatedAt",
        ExpressionAttributeNames: {
          "#type": "type",
          "#status": "status",
          "#manager": "manager"
        }
      };

      const customerResult = await dynamoDB.scan(customerParams).promise();
      const customers = (customerResult.Items || []) as CustomerData[];

      // 2. 獲取組織資料
      const orgParams = {
        TableName: DB_CONFIG.tables.ORGANIZATION_MANAGEMENT,
        ProjectionExpression: "organizationName, contractName"
      };

      const orgResult = await dynamoDB.scan(orgParams).promise();
      const organizations = orgResult.Items || [];

      // 3. 獲取合約資料
      const contractParams = {
        TableName: DB_CONFIG.tables.CONTRACT_MANAGEMENT,
        ProjectionExpression: "contractName, contractType, contractStatus"
      };

      const contractResult = await dynamoDB.scan(contractParams).promise();
      const contracts = contractResult.Items || [];

      // 建立合約名稱到合約資訊的映射
      const contractInfoMap = new Map(
        contracts.map(contract => [
          contract.contractName, 
          {
            type: contract.contractType,
            status: contract.contractStatus
          }
        ])
      );

      // 建立組織名稱到合約名稱的映射
      const orgContractMap = new Map(
        organizations.map(org => [org.organizationName, org.contractName])
      );

      // 更新客戶資料，加入對應的合約類型和狀態
      const updatedCustomers = customers.map(customer => {
        const contractName = orgContractMap.get(customer.customerName);
        const contractInfo = contractName ? contractInfoMap.get(contractName) : null;
        
        return {
          ...customer,
          service: contractInfo?.type || '未知', // 使用合約類型替換 service 欄位
          status: contractInfo?.status || '未知' // 使用合約狀態替換 status 欄位
        };
      });
      
      // 根據 customerName 排序
      return updatedCustomers.sort((a, b) => a.customerName.localeCompare(b.customerName));
    } catch (error) {
      console.error('獲取客戶數據失敗:', error);
      throw error;
    }
  }
};

const CustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [contractStatus, setContractStatus] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        if (!response.ok) {
          throw new Error('獲取客戶數據失敗');
        }
        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '獲取客戶數據失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-error-color">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-background-secondary">
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-blue-600 transition-colors duration-150">首頁</Link>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700">客戶管理</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            客戶管理
            </h1>
            <p className="text-gray-600 mt-1">管理所有客戶資料與互動記錄</p>
          </div>
          
        </div>
      </div>
      {/* 搜尋和篩選區 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="搜尋客戶..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background-primary border border-border-color rounded-lg
                     text-text-primary placeholder-text-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent
                     transition-all duration-200"
          />
          <div className="absolute left-3 top-2.5 text-text-secondary">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <select
          value={customerType}
          onChange={(e) => setCustomerType(e.target.value)}
          className="bg-background-primary border border-border-color rounded-lg px-4 py-2
                   text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color
                   focus:border-transparent transition-all duration-200"
        >
          <option value="">客戶類型</option>
          <option value="enterprise">企業客戶</option>
          <option value="individual">個人客戶</option>
        </select>

        <select
          value={contractStatus}
          onChange={(e) => setContractStatus(e.target.value)}
          className="bg-background-primary border border-border-color rounded-lg px-4 py-2
                   text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color
                   focus:border-transparent transition-all duration-200"
        >
          <option value="">合約狀態</option>
          <option value="active">使用中</option>
          <option value="pending">待續約</option>
          <option value="expired">已到期</option>
        </select>

        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="bg-background-primary border border-border-color rounded-lg px-4 py-2
                   text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color
                   focus:border-transparent transition-all duration-200"
        >
          <option value="">合約類型</option>
          <option value="full">全方位服務</option>
          <option value="basic">基礎維護</option>
          <option value="custom">客製服務</option>
        </select>
      </div>

      {/* 篩選標籤 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {customerType && (
          <span className="px-3 py-1 bg-accent-color/10 text-accent-color rounded-full
                        flex items-center gap-2 text-sm">
            企業客戶
            <button onClick={() => setCustomerType('')} className="hover:text-accent-hover">
              ×
            </button>
          </span>
        )}
        {contractStatus && (
          <span className="px-3 py-1 bg-accent-color/10 text-accent-color rounded-full
                        flex items-center gap-2 text-sm">
            使用中
            <button onClick={() => setContractStatus('')} className="hover:text-accent-hover">
              ×
            </button>
          </span>
        )}
      </div>

      {/* 客戶列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 text-center">項次</th>
                  <th className="px-6 py-3 text-center">客戶名稱</th>
                  <th className="px-6 py-3 text-center">合約類型</th>
                  <th className="px-6 py-3 text-center">合約狀態</th>
                  <th className="px-6 py-3 text-center">最後登入</th>
                  <th className="px-6 py-3 text-center">負責人</th>
                  <th className="px-6 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium">目前沒有客戶資料</p>
                        <p className="text-sm">請新增客戶或調整搜尋條件</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer, index) => (
                    <tr key={customer.customerName} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-center text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <Link
                            href={`/user-management?organization=${encodeURIComponent(customer.customerName)}`}
                            className="font-medium text-text-primary hover:text-blue-600 cursor-pointer"
                          >
                            {customer.customerName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">
                        {customer.service}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          customer.status === '生效中' 
                            ? 'bg-green-100 text-green-600' 
                            : customer.status === '待簽署'
                            ? 'bg-blue-100 text-blue-600'
                            : customer.status === '待續約'
                            ? 'bg-yellow-100 text-yellow-600'
                            : customer.status === '已到期'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">
                        {customer.lastActivity}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <span className="ml-2 text-sm text-gray-900">{customer.manager.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-center">
                        <div className="flex justify-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            查看
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            編輯
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 分頁 */}
      <div className="mt-6 flex justify-between items-center text-text-secondary">
        <div>顯示 1 至 5 筆，共 150 筆</div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-border-color rounded-lg hover:bg-hover-color transition-colors">
            上一頁
          </button>
          <div className="flex items-center">
            <button className="px-4 py-2 bg-accent-color text-white rounded-lg">1</button>
            <button className="px-4 py-2 hover:bg-hover-color rounded-lg">2</button>
            <button className="px-4 py-2 hover:bg-hover-color rounded-lg">3</button>
            <span className="px-4 py-2">...</span>
            <button className="px-4 py-2 hover:bg-hover-color rounded-lg">15</button>
          </div>
          <button className="px-4 py-2 border border-border-color rounded-lg hover:bg-hover-color transition-colors">
            下一頁
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;
  