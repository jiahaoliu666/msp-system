import React, { useState, useEffect } from 'react';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { CustomerData } from '../services/customer';

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-color"></div>
      </div>
    );
  }

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
      <div className="bg-background-primary rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-color">
                <th className="px-6 py-3 text-left text-text-primary">客戶名稱</th>
                <th className="px-6 py-3 text-left text-text-primary">聯絡人</th>
                <th className="px-6 py-3 text-left text-text-primary">合約狀態</th>
                <th className="px-6 py-3 text-left text-text-primary">合約類型</th>
                <th className="px-6 py-3 text-left text-text-primary">上次登入</th>
                <th className="px-6 py-3 text-left text-text-primary">負責人</th>
                <th className="px-6 py-3 text-left text-text-primary">操作</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-border-color hover:bg-hover-color transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-text-primary">{customer.name}</div>
                        <div className="text-sm text-text-secondary">{customer.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-primary">{customer.contact}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-sm
                      ${customer.status === '使用中' ? 'bg-success-color/10 text-success-color' : 
                        customer.status === '待續約' ? 'bg-warning-color/10 text-warning-color' : 
                        'bg-error-color/10 text-error-color'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-primary">{customer.service}</td>
                  <td className="px-6 py-4 text-text-primary">{customer.lastActivity}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent-color/10 text-accent-color flex items-center justify-center">
                        {customer.manager.name.charAt(0)}
                      </div>
                      <span className="text-text-primary">{customer.manager.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-accent-color transition-colors">
                        <FiEye className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-accent-color transition-colors">
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-hover-color rounded-lg text-text-secondary hover:text-error-color transition-colors">
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  