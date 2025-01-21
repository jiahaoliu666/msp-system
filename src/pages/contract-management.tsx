import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import CreateContractForm from '../components/UserManagement/CreateContractForm';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface Contract {
  contractId: string;
  contractName: string;
  contractType: string;
  description: string;
  startDate: string;
  endDate: string;
  contractStatus: string;
  createdAt: string;
  updatedAt: string;
  productName: string;
  remainingHours?: number;
}

export default function ContractManagement() {
  const router = useRouter();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState<string[]>([]);
  
  // 搜尋和篩選狀態
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');

  // 合約操作狀態
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Contract | null>(null);

  const [sortByTime, setSortByTime] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchContracts();
  }, []);

  // 處理 URL 參數
  useEffect(() => {
    const { contract } = router.query;
    if (contract && typeof contract === 'string') {
      setSearchTerm('');  // 清空搜尋條件
      setStatusFilter(''); // 清空狀態篩選
      setTypeFilter('');   // 清空類型篩選
      setProductFilter(''); // 清空產品篩選
      // 設置合約名稱篩選
      const decodedContract = decodeURIComponent(contract);
      setSearchTerm(decodedContract);
    }
  }, [router.query]);

  useEffect(() => {
    // 從合約中提取唯一的產品名稱列表
    const uniqueProducts = Array.from(new Set(contracts.map(contract => contract.productName))).filter(Boolean);
    setProductList(uniqueProducts);
  }, [contracts]);

  // 到期提醒區塊排序
  const sortedExpiringContracts = contracts
    .filter(contract => {
      const daysUntilExpire = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return daysUntilExpire <= 30 && daysUntilExpire > 0 && contract.contractStatus === '生效中';
    })
    .sort((a, b) => {
      const daysLeftA = Math.ceil((new Date(a.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      const daysLeftB = Math.ceil((new Date(b.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return daysLeftA - daysLeftB;
    });

  // 篩選合約列表
  const filteredContracts = contracts
    .filter(contract => {
      const matchesSearch = contract.contractName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contractId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || contract.contractStatus === statusFilter;
      const matchesType = !typeFilter || contract.contractType === typeFilter;
      const matchesProduct = !productFilter || contract.productName === productFilter;

      return matchesSearch && matchesStatus && matchesType && matchesProduct;
    })
    .sort((a, b) => {
      if (sortByTime === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortByTime === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortByTime === 'expiring-soon') {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      } else if (sortByTime === 'expiring-late') {
        return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
      } else if (sortByTime === 'remaining-hours-low') {
        return (a.remainingHours ?? 0) - (b.remainingHours ?? 0);
      } else if (sortByTime === 'remaining-hours-high') {
        return (b.remainingHours ?? 0) - (a.remainingHours ?? 0);
      } else if (sortByTime === 'status') {
        const statusOrder: Record<string, number> = {
          '生效中': 1,
          '待簽署': 2,
          '待續約': 3,
          '已到期': 4
        };
        return (statusOrder[a.contractStatus] || 999) - (statusOrder[b.contractStatus] || 999);
      }
      return 0;
    });

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
    totalAmount: contracts.length // 顯示合約數量
  };

  // 更新合約狀態的函數
  const updateContractStatus = async (contractId: string, newStatus: string, originalContract?: Contract) => {
    try {
      const client = new DynamoDBClient({
        region: process.env.NEXT_PUBLIC_AWS_REGION,
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
        }
      });

      const docClient = DynamoDBDocumentClient.from(client);

      // 先獲取當前合約資料
      const { Item } = await docClient.send(
        new GetCommand({
          TableName: "MetaAge-MSP-Contract-Management",
          Key: {
            contractId: contractId
          }
        })
      );

      if (Item) {
        const now = new Date();
        const utc8Time = new Date(now.getTime() + (8 * 60 * 60 * 1000));
        const formattedTime = utc8Time.toISOString().replace('Z', '+08:00');

        // 更新合約狀態
        await docClient.send(
          new PutCommand({
            TableName: "MetaAge-MSP-Contract-Management",
            Item: {
              ...Item,
              contractStatus: newStatus,
              updatedAt: formattedTime
            }
          })
        );

        // 重新獲取合約列表
        await fetchContracts();

        // 更新後再顯示合約詳細資訊
        const updatedContract = {
          ...Item,
          contractStatus: newStatus,
          updatedAt: formattedTime
        } as Contract;
        
        setSelectedContract(updatedContract);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error('Error updating contract status:', error);
      // 如果更新失敗，仍然顯示原始合約資訊
      if (originalContract) {
        setSelectedContract(originalContract);
        setIsViewModalOpen(true);
      }
    }
  };

  // 處理查看合約
  const handleView = (contract: Contract) => {
    // 檢查合約是否已到期
    const now = new Date();
    const endDate = new Date(contract.endDate);
    
    // 如果合約已到期且狀態不是"已到期"，則更新狀態
    if (now >= endDate && contract.contractStatus !== '已到期') {
      updateContractStatus(contract.contractId, '已到期', contract);
    } else {
      setSelectedContract(contract);
      setIsViewModalOpen(true);
    }
  };

  // 在 useEffect 中添加定期檢查合約狀態的邏輯
  useEffect(() => {
    const checkExpiredContracts = async () => {
      const now = new Date();
      const expiredContracts = contracts.filter(contract => 
        new Date(contract.endDate) <= now && contract.contractStatus !== '已到期'
      );

      // 更新所有已到期的合約
      for (const contract of expiredContracts) {
        await updateContractStatus(contract.contractId, '已到期');
      }
    };

    // 初次載入和每次合約列表更新時檢查
    if (contracts.length > 0) {
      checkExpiredContracts();
    }
  }, [contracts]);

  // 處理編輯合約
  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setEditFormData(contract);
    setIsEditModalOpen(true);
  };

  // 處理編輯表單變更
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
  };

  // 處理剩餘時數變更
  const handleRemainingHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditFormData(prev => prev ? {
      ...prev,
      remainingHours: value === '' ? undefined : Number(value)
    } : null);
  };

  // 處理更新合約
  const handleUpdateContract = async () => {
    if (!editFormData) return;

    try {
      const client = new DynamoDBClient({
        region: process.env.NEXT_PUBLIC_AWS_REGION,
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
        }
      });

      const docClient = DynamoDBDocumentClient.from(client);

      const now = new Date();
      const utc8Time = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      const formattedTime = utc8Time.toISOString().replace('Z', '+08:00');

      await docClient.send(
        new PutCommand({
          TableName: "MetaAge-MSP-Contract-Management",
          Item: {
            ...editFormData,
            remainingHours: editFormData.remainingHours === undefined ? 0 : Number(editFormData.remainingHours),
            updatedAt: formattedTime
          }
        })
      );

      setIsEditModalOpen(false);
      fetchContracts();
    } catch (error) {
      console.error('Error updating contract:', error);
      alert('更新合約時發生錯誤');
    }
  };

  // 處理刪除合約
  const handleDelete = async (contractId: string) => {
    if (window.confirm('確定要刪除此合約嗎？')) {
      try {
        const client = new DynamoDBClient({
          region: process.env.NEXT_PUBLIC_AWS_REGION,
          credentials: {
            accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
          }
        });

        const docClient = DynamoDBDocumentClient.from(client);

        await docClient.send(
          new DeleteCommand({
            TableName: "MetaAge-MSP-Contract-Management",
            Key: {
              contractId: contractId
            }
          })
        );

        // 重新獲取合約列表
        fetchContracts();
      } catch (error) {
        console.error('Error deleting contract:', error);
        alert('刪除合約時發生錯誤');
      }
    }
  };

  return (
    <div className="flex-1 bg-gray-100 p-8">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-blue-600">首頁</Link>
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
          { title: '合約總數', value: stats.totalAmount, color: 'blue', icon: '📊' },
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">有效合約30天內到期提醒</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>共 {sortedExpiringContracts.length} 份合約即將到期</span>
            {sortedExpiringContracts.length > 3 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border'
                  }`}
                >
                  上一頁
                </button>
                {Array.from({ length: Math.ceil(sortedExpiringContracts.length / 3) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage === Math.ceil(sortedExpiringContracts.length / 3)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === Math.ceil(sortedExpiringContracts.length / 3)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border'
                  }`}
                >
                  下一頁
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedExpiringContracts
            .slice((currentPage - 1) * 3, currentPage * 3)
            .map((contract, index) => {
              const daysLeft = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return (
                <div key={index} className={`border rounded-lg p-4 ${daysLeft <= 7 ? 'bg-red-50' : 'bg-yellow-50'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{contract.contractName}</h3>
                      <p className="text-sm text-gray-600">{contract.contractType}</p>
                      <p className="text-sm text-gray-500 mt-1">到期日：{contract.endDate}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      daysLeft <= 7 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      剩餘 {daysLeft} 天
                    </span>
                  </div>
                </div>
              );
            })}
          {!loading && sortedExpiringContracts.length === 0 && (
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
              placeholder="搜尋合約編號或名稱"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">合約狀態</option>
              <option value="生效中">生效中</option>
              <option value="待簽署">待簽署</option>
              <option value="待續約">待續約</option>
              <option value="已到期">已到期</option>
            </select>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">合約類型</option>
              <option value="帳務託管">帳務託管</option>
              <option value="5*8 雲顧問">5*8 雲顧問</option>
              <option value="7*24 雲託管">7*24 雲託管</option>
              <option value="內部合約">內部合約</option>
            </select>
          </div>
          <div>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">產品名稱</option>
              {productList.map((product, index) => (
                <option key={index} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={sortByTime}
              onChange={(e) => setSortByTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">排序方式</option>
              <option value="status">依狀態排序</option>
              <option value="oldest">建立時間 - 最舊到最新</option>
              <option value="newest">建立時間 - 最新到最舊</option>
              <option value="expiring-soon">到期日期 - 最近到最遠</option>
              <option value="expiring-late">到期日期 - 最遠到最近</option>
              <option value="remaining-hours-low">剩餘時數 - 最近到最遠</option>
              <option value="remaining-hours-high">剩餘時數 - 最遠到最近</option>
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
              <span>共 {filteredContracts.length} 份合約</span>
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
                    <th className="px-6 py-3 text-center">合約編號</th>
                    <th className="px-6 py-3 text-center">合約名稱</th>
                    <th className="px-6 py-3 text-center">合約類型</th>
                    <th className="px-6 py-3 text-center">產品名稱</th>
                    <th className="px-6 py-3 text-center">狀態</th>
                    <th className="px-6 py-3 text-center">到期日</th>
                    <th className="px-6 py-3 text-center">剩餘時數</th>
                    <th className="px-6 py-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContracts.map((contract, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 text-center">
                          {contract.contractId}
                        </div>
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
                            contract.contractStatus === '已到期' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {contract.contractStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">
                        {contract.endDate}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">
                        <div className="flex items-center justify-center">
                          <span className={`${(contract.remainingHours !== undefined && contract.remainingHours <= 10 && contract.remainingHours > 0) ? 'text-red-600 font-medium' : ''}`}>
                            {contract.remainingHours ?? 0} 小時
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleView(contract)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            查看
                          </button>
                          <button 
                            onClick={() => handleEdit(contract)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            編輯
                          </button>
                          <button 
                            onClick={() => handleDelete(contract.contractId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            刪除
                          </button>
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
                顯示 1 至 {Math.min(filteredContracts.length, 10)} 筆，共 {filteredContracts.length} 筆
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

      {/* 查看合約模態框 */}
      <Transition appear show={isViewModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsViewModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    合約詳細資訊
                  </Dialog.Title>
                  <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${
                    selectedContract?.contractStatus === '生效中' ? 'bg-green-100 text-green-800 border border-green-200' :
                    selectedContract?.contractStatus === '待續約' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    selectedContract?.contractStatus === '待簽署' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    selectedContract?.contractStatus === '已到期' ? 'bg-red-100 text-red-800 border border-red-200' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {selectedContract?.contractStatus}
                  </span>
                </div>
                {selectedContract && (
                  <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                      {/* 基本資訊區塊 */}
                      <div className="p-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          基本資訊
                        </h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">合約編號</label>
                            <p className="text-sm text-gray-900">{selectedContract.contractId}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">合約名稱</label>
                            <p className="text-sm text-gray-900">{selectedContract.contractName}</p>
                          </div>
                        </div>
                      </div>

                      {/* 服務內容區塊 */}
                      <div className="p-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                          服務內容
                        </h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">合約類型</label>
                            <p className="text-sm text-gray-900">{selectedContract.contractType}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">產品名稱</label>
                            <p className="text-sm text-gray-900">{selectedContract.productName}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">剩餘時數</label>
                            <p className={`text-sm ${(selectedContract.remainingHours !== undefined && selectedContract.remainingHours <= 10 && selectedContract.remainingHours > 0) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                              {selectedContract.remainingHours ?? 0} 小時
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 時間資訊區塊 */}
                      <div className="p-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          時間資訊
                        </h4>
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">開始日期</label>
                              <p className="text-sm text-gray-900">{selectedContract.startDate}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">到期日期</label>
                              <p className="text-sm text-gray-900">{selectedContract.endDate}</p>
                            </div>
                          </div>
                          <div>
                            <div className="mb-2">
                              <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                                {(() => {
                                  const start = new Date(selectedContract.startDate).getTime();
                                  const end = new Date(selectedContract.endDate).getTime();
                                  const now = new Date().getTime();
                                  const progress = ((now - start) / (end - start)) * 100;
                                  return (
                                    <div 
                                      className={`h-full transition-all duration-500 ${
                                        progress > 80 ? 'bg-red-500' : 
                                        progress > 50 ? 'bg-yellow-500' : 
                                        'bg-green-500'
                                      }`}
                                      style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                                    />
                                  );
                                })()}
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500">合約進度</span>
                              {(() => {
                                const end = new Date(selectedContract.endDate);
                                const now = new Date();
                                const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));
                                return (
                                  <span className={`font-medium ${
                                    daysLeft <= 30 ? 'text-red-600' :
                                    daysLeft <= 90 ? 'text-yellow-600' :
                                    'text-green-600'
                                  }`}>
                                    {daysLeft > 0 ? `距離到期還有 ${daysLeft} 天` : '已到期'}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 合約描述區塊 */}
                      <div className="p-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          合約描述
                        </h4>
                        <div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {selectedContract.description || '無描述'}
                          </p>
                        </div>
                      </div>

                      {/* 系統資訊 */}
                      <div className="p-6 bg-gray-50">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>建立時間：{selectedContract.createdAt.split('T').join(' ').split('.')[0]}</span>
                          <span>最後更新：{selectedContract.updatedAt.split('T').join(' ').split('.')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition-colors"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    關閉
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* 編輯合約模態框 */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsEditModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  編輯合約
                </Dialog.Title>
                {editFormData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">合約編號</label>
                        <input
                          type="text"
                          name="contractId"
                          value={editFormData.contractId}
                          disabled
                          className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">合約名稱</label>
                        <input
                          type="text"
                          name="contractName"
                          value={editFormData.contractName}
                          disabled
                          className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">合約類型</label>
                        <select
                          name="contractType"
                          value={editFormData.contractType}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="帳務託管">帳務託管</option>
                          <option value="5*8 雲顧問">5*8 雲顧問</option>
                          <option value="7*24 雲託管">7*24 雲託管</option>
                          <option value="內部合約">內部合約</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">產品名稱</label>
                        <select
                          name="productName"
                          value={editFormData.productName}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {productList.map((product, index) => (
                            <option key={index} value={product}>
                              {product}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
                        <input
                          type="date"
                          name="startDate"
                          value={editFormData.startDate}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">到期日期</label>
                        <input
                          type="date"
                          name="endDate"
                          value={editFormData.endDate}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
                        <select
                          name="contractStatus"
                          value={editFormData.contractStatus}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="生效中">生效中</option>
                          <option value="待簽署">待簽署</option>
                          <option value="待續約">待續約</option>
                          <option value="已到期">已到期</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">剩餘時數</label>
                        <input
                          type="number"
                          name="remainingHours"
                          value={editFormData.remainingHours === undefined ? '' : editFormData.remainingHours}
                          onChange={handleRemainingHoursChange}
                          min="0"
                          placeholder="請輸入剩餘時數"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                      <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditFormChange}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                )}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    onClick={handleUpdateContract}
                  >
                    保存
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* 新增合約表單 */}
      {isCreateFormOpen && (
        <CreateContractForm 
          isOpen={isCreateFormOpen}
          onClose={() => {
            setIsCreateFormOpen(false);
            fetchContracts();
          }}
          existingProducts={productList}
        />
      )}
    </div>
  );
}
  