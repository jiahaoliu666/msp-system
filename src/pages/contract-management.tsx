import { useState, useEffect } from 'react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import CreateContractForm from '../components/UserManagement/CreateContractForm';

interface Contract {
  contractName: string;
  contractType: string;
  description: string;
  startDate: string;
  endDate: string;
  contractStatus: string;
  createdAt: string;
  updatedAt: string;
  productName: string;
}

export default function ContractManagement() {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState<string[]>([]);

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    // 從合約中提取唯一的產品名稱列表
    const uniqueProducts = Array.from(new Set(contracts.map(contract => contract.productName))).filter(Boolean);
    setProductList(uniqueProducts);
  }, [contracts]);

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
          TableName: "MetaAge-MSP-Contract-Management"
        })
      );

      setContracts(Items as Contract[]);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  // 計算統計數據
  const stats = {
    activeContracts: contracts.filter(c => c.contractStatus === '生效中').length,
    expiringContracts: contracts.filter(c => {
      const daysUntilExpire = Math.ceil((new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return daysUntilExpire <= 30 && daysUntilExpire > 0;
    }).length,
    pendingRenewal: contracts.filter(c => c.contractStatus === '待續約').length,
    totalAmount: contracts.length // 這裡應該根據實際合約金額計算，目前僅顯示合約數量
  };

  return (
    <div className="flex-1 bg-gray-100 p-8">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <a href="#" className="hover:text-blue-600">首頁</a>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700">合約管理</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">合約管理</h1>
            <p className="text-gray-600 mt-1">管理所有客戶合約與續約狀態</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsCreateFormOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 flex items-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增合約
            </button>
          </div>
        </div>
      </div>
  
      {/* 合約概況統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { title: '有效合約', value: stats.activeContracts, color: 'green', icon: '📄' },
          { title: '即將到期', value: stats.expiringContracts, color: 'yellow', icon: '⚠️' },
          { title: '待續約確認', value: stats.pendingRenewal, color: 'red', icon: '🔔' },
          { title: '合約總數', value: stats.totalAmount, color: 'blue', icon: '💰' },
        ].map((stat) => (
          <div key={stat.title} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
            stat.color === 'green' ? 'border-green-500' :
            stat.color === 'yellow' ? 'border-yellow-500' :
            stat.color === 'red' ? 'border-red-500' :
            'border-blue-500'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>
  
      {/* 到期提醒區塊 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">合約30天內到期提醒</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contracts
            .filter(contract => {
              const daysUntilExpire = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return daysUntilExpire <= 30 && daysUntilExpire > 0;
            })
            .map((contract, index) => {
              const daysLeft = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return (
                <div key={index} className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">合約名稱：{contract.contractName}</h3>
                      <p className="text-sm text-gray-600">合約類型：{contract.contractType}</p>
                      <p className="text-sm text-gray-500 mt-1">到期日：{contract.endDate}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      剩餘 {daysLeft} 天
                    </span>
                  </div>
                </div>
              );
            })}
          {!loading && contracts.filter(contract => {
            const daysUntilExpire = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
            return daysUntilExpire <= 30 && daysUntilExpire > 0;
          }).length === 0 && (
            <div className="col-span-3 text-center py-8">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-2 text-sm">目前沒有即將到期的合約</p>
              </div>
            </div>
          )}
        </div>
      </div>
  
      {/* 搜尋和篩選區 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋合約..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div>
            <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">合約狀態</option>
              <option value="active">生效中</option>
              <option value="pending">待簽署</option>
              <option value="expired">已到期</option>
              <option value="terminated">已終止</option>
            </select>
          </div>
          <div>
            <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">合約類型</option>
              <option value="service">帳務託管</option>
              <option value="maintenance-8">5*8 雲顧問</option>
              <option value="maintenance-24">7*24 雲託管</option>
            </select>
          </div>
          <div>
            <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">產品名稱</option>
              {productList.map((product, index) => (
                <option key={index} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
  
      {/* 合約列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">合約列表</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>共 {contracts.length} 份合約</span>
              <select className="px-2 py-1 border rounded-md">
                <option value="10">10 筆/頁</option>
                <option value="20">20 筆/頁</option>
                <option value="50">50 筆/頁</option>
              </select>
            </div>
          </div>
  
          {/* 合約表格 */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-500">載入中...</p>
              </div>
            ) : contracts.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 text-center">項次</th>
                    <th className="px-6 py-3 text-center">合約名稱</th>
                    <th className="px-6 py-3 text-center">合約類型</th>
                    <th className="px-6 py-3 text-center">產品名稱</th>
                    <th className="px-6 py-3 text-center">狀態</th>
                    <th className="px-6 py-3 text-center">到期日</th>
                    <th className="px-6 py-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contracts.map((contract, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 text-center">
                          {contract.contractName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 text-center">
                          {contract.contractType}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 text-center">
                          {contract.productName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            contract.contractStatus === '生效中' ? 'bg-green-100 text-green-800' :
                            contract.contractStatus === '待續約' ? 'bg-yellow-100 text-yellow-800' :
                            contract.contractStatus === '待簽署' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {contract.contractStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">
                        {contract.endDate}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex justify-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">查看</button>
                          <button className="text-gray-600 hover:text-gray-900">編輯</button>
                          <button className="text-red-600 hover:text-red-900">刪除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">尚無合約資料</h3>
                  <p className="mt-1 text-sm text-gray-500">點擊新增合約按鈕開始建立您的第一份合約。</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setIsCreateFormOpen(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      新增合約
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
  
          {/* 分頁控制 - 只在有合約時顯示 */}
          {!loading && contracts.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                顯示 1 至 {Math.min(contracts.length, 10)} 筆，共 {contracts.length} 筆
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">上一頁</button>
                <button className="px-3 py-1 bg-blue-500 text-white rounded-md">1</button>
                <button className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50">下一頁</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 新增合約表單 */}
      {isCreateFormOpen && (
        <CreateContractForm 
          isOpen={isCreateFormOpen}
          onClose={() => {
            setIsCreateFormOpen(false);
            fetchContracts(); // 關閉表單後重新獲取合約列表
          }}
        />
      )}
    </div>
  );
}
  