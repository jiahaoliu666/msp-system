import Link from 'next/link';
import CreateOrganizationForm from '../components/UserManagement/CreateOrganizationForm';
import { useState, useEffect, Fragment } from 'react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { Dialog, Transition } from '@headlessui/react';

interface Organization {
  name: string;
  contractName: string;
  contractType: string;
  contractStatus: string;
  manager: string;
  members: number;
  createdAt: string;
}

export default function OrganizationManagement() {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [stats, setStats] = useState({
    totalOrgs: 0,
    totalUsers: 0,
    newOrgsThisMonth: 0,
    activeOrgs: 0
  });

  const fetchOrganizationsWithContracts = async () => {
    try {
      const client = new DynamoDBClient({
        region: process.env.NEXT_PUBLIC_AWS_REGION,
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
        }
      });

      const docClient = DynamoDBDocumentClient.from(client);

      // 獲取合約資訊
      const { Items: contracts = [] } = await docClient.send(
        new ScanCommand({
          TableName: "MetaAge-MSP-Contract-Management",
          ProjectionExpression: "contractName, contractType, contractStatus"
        })
      );

      // 建立有效合約名稱的集合（狀態為生效中的合約）
      const activeContractNames = new Set(
        contracts
          .filter(contract => contract.contractStatus === '生效中')
          .map(contract => contract.contractName)
      );

      // 建立合約資訊映射（用於獲取合約類型等資訊）
      const contractInfoMap = new Map(
        contracts.map(contract => [
          contract.contractName,
          {
            type: contract.contractType,
            status: contract.contractStatus
          }
        ])
      );

      // 獲取組織資料
      const { Items: organizations = [] } = await docClient.send(
        new ScanCommand({
          TableName: "MetaAge-MSP-Organization-Management"
        })
      );

      // 整合組織資料和合約類型
      const updatedOrganizations = organizations.map(org => {
        const contractInfo = contractInfoMap.get(org.contractName) || { type: '未知', status: '未知' };
        return {
          name: org.organizationName,
          contractName: org.contractName,
          contractType: contractInfo.type,
          contractStatus: contractInfo.status,
          manager: org.manager || '',
          members: org.members || 0,
          createdAt: org.createdAt || ''
        };
      });

      // 計算統計數據
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // 計算有效組織數量（直接根據合約名稱和狀態判斷）
      const validOrganizations = updatedOrganizations.filter(org => 
        activeContractNames.has(org.contractName)
      );

      const newStats = {
        totalOrgs: updatedOrganizations.length,
        totalUsers: updatedOrganizations.reduce((sum, org) => sum + org.members, 0),
        newOrgsThisMonth: updatedOrganizations.filter(org => {
          const createdDate = new Date(org.createdAt);
          return createdDate >= firstDayOfMonth;
        }).length,
        activeOrgs: validOrganizations.length
      };

      setStats(newStats);
      setOrganizations(updatedOrganizations);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchOrganizationsWithContracts();
  }, []);

  const handleView = (org: Organization) => {
    setSelectedOrganization(org);
    setIsViewModalOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrganization(org);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (name: string) => {
    if (window.confirm('確定要刪除此組織嗎？')) {
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
            TableName: "MetaAge-MSP-Organization-Management",
            Key: {
              organizationName: name
            }
          })
        );

        // 重新獲取組織列表
        fetchOrganizationsWithContracts();
      } catch (error) {
        console.error('Error deleting organization:', error);
        alert('刪除組織時發生錯誤');
      }
    }
  };

  return (
    <div className="flex-1 bg-background-secondary p-8">
      {/* 頁面標題與麵包屑導航 */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-text-secondary mb-4">
          <Link href="/" className="hover:text-accent-color transition-colors">首頁</Link>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-text-primary">組織管理</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">組織管理</h1>
            <p className="text-text-secondary mt-1">管理客戶的組織架構與人員配置</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsCreateFormOpen(true)}
              className="px-4 py-2 bg-accent-color text-white rounded-lg hover:bg-accent-hover transition-colors duration-150 flex items-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增組織
            </button>
          </div>
        </div>
      </div>

      {/* 組織概況統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { title: '組織總數', value: stats.totalOrgs.toString(), color: 'accent', icon: '🏢' },
          { title: '總用戶數', value: stats.totalUsers.toString(), color: 'success', icon: '👥' },
          { 
            title: '有效組織', 
            value: stats.activeOrgs.toString(), 
            color: 'info', 
            icon: '✨',
            tooltip: '當組織的合約狀態為「生效中」時，該組織即被視為有效組織'
          },
          { title: '本月新增', value: stats.newOrgsThisMonth.toString(), color: 'warning', icon: '📈' },
        ].map((stat) => (
          <div 
            key={stat.title} 
            className={`relative group bg-background-primary rounded-xl shadow-sm p-6 border-l-4 ${
              stat.color === 'accent' ? 'border-accent-color' :
              stat.color === 'success' ? 'border-success-color' :
              stat.color === 'warning' ? 'border-warning-color' :
              'border-info-color'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-secondary text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold text-text-primary mt-1">{stat.value}</h3>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            {stat.tooltip && (
              <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap">
                {stat.tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-solid border-t-gray-900 border-t-8 border-x-transparent border-x-8 border-b-0"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 組織管理列表 */}
      <div className="bg-background-primary rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-primary">組織列表</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋組織..."
                  className="w-64 pl-10 pr-4 py-2 border border-border-color rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-accent-color"
                />
                <div className="absolute left-3 top-2.5">
                  <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {organizations.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-border-color">
                    <th className="px-6 py-3 text-center text-text-primary">組織名稱</th>
                    <th className="px-6 py-3 text-center text-text-primary">合約名稱</th>
                    <th className="px-6 py-3 text-center text-text-primary">合約類型</th>
                    <th className="px-6 py-3 text-center text-text-primary">負責人</th>
                    <th className="px-6 py-3 text-center text-text-primary">用戶數</th>
                    <th className="px-6 py-3 text-center text-text-primary">建立時間</th>
                    <th className="px-6 py-3 text-center text-text-primary">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((org, index) => (
                    <tr key={index} className="border-b border-border-color hover:bg-hover-color transition-colors">
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center justify-center">
                          <span className="font-medium text-text-primary">{org.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center justify-center">
                          <span className="text-text-primary">{org.contractName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center justify-center">
                          <span className="text-text-primary">{org.contractType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center justify-center">
                          <span className="text-text-primary">{org.manager}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <span className="text-text-primary">{org.members}</span>
                      </td>
                      <td className="px-6 py-4 text-center align-middle text-text-secondary">
                        {org.createdAt}
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleView(org)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            查看
                          </button>
                          <button 
                            onClick={() => handleEdit(org)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            編輯
                          </button>
                          <button 
                            onClick={() => handleDelete(org.name)}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">尚無組織資料</h3>
                  <p className="mt-1 text-sm text-gray-500">點擊新增組織按鈕開始建立您的第一個組織。</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setIsCreateFormOpen(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      新增組織
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 分頁控制 - 只在有組織時顯示 */}
          {organizations.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-text-secondary">
                顯示 1 至 3 筆，共 15 筆
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">上一頁</button>
                <button className="px-3 py-1 bg-accent-color text-white rounded-lg">1</button>
                <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">2</button>
                <button className="px-3 py-1 border border-border-color rounded-lg text-text-secondary hover:bg-hover-color transition-colors">下一頁</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 新增組織表單 */}
      {isCreateFormOpen && (
        <CreateOrganizationForm 
          isOpen={isCreateFormOpen}
          onClose={() => setIsCreateFormOpen(false)}
        />
      )}

      {/* 查看組織模態框 */}
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
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  組織詳細資訊
                </Dialog.Title>
                {selectedOrganization && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">組織名稱</label>
                        <p className="text-sm text-gray-900">{selectedOrganization.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">合約名稱</label>
                        <p className="text-sm text-gray-900">{selectedOrganization.contractName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">合約類型</label>
                        <p className="text-sm text-gray-900">{selectedOrganization.contractType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">負責人</label>
                        <p className="text-sm text-gray-900">{selectedOrganization.manager}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">用戶數</label>
                        <p className="text-sm text-gray-900">{selectedOrganization.members}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">建立時間</label>
                        <p className="text-sm text-gray-900">{selectedOrganization.createdAt}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
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

      {/* 編輯組織模態框 */}
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
                  編輯組織
                </Dialog.Title>
                {selectedOrganization && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">組織名稱</label>
                        <input
                          type="text"
                          value={selectedOrganization.name}
                          disabled
                          className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">合約名稱</label>
                        <input
                          type="text"
                          value={selectedOrganization.contractName}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">負責人</label>
                        <input
                          type="text"
                          value={selectedOrganization.manager}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">用戶數</label>
                        <input
                          type="number"
                          value={selectedOrganization.members}
                          min="0"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
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
                    onClick={() => {
                      // TODO: 實作更新組織邏輯
                      setIsEditModalOpen(false);
                    }}
                  >
                    保存
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
