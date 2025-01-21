import Link from 'next/link';
import CreateOrganizationForm from '../components/UserManagement/CreateOrganizationForm';
import { useState, useEffect } from 'react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

interface Organization {
  name: string;
  contractName: string;
  contractType: string;
  manager: string;
  members: number;
  createdAt: string;
}

export default function OrganizationManagement() {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
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
            ProjectionExpression: "contractName, contractType"
          })
        );

        // 建立合約名稱到類型的映射
        const contractTypeMap = new Map(
          contracts.map(contract => [contract.contractName, contract.contractType])
        );

        // 獲取組織資料
        const { Items: organizations = [] } = await docClient.send(
          new ScanCommand({
            TableName: "MetaAge-MSP-Organization-Management"
          })
        );

        // 整合組織資料和合約類型
        const updatedOrganizations = organizations.map(org => ({
          name: org.organizationName,
          contractName: org.contractName,
          contractType: contractTypeMap.get(org.contractName) || '未知',
          manager: org.manager || '',
          members: org.members || 0,
          createdAt: org.createdAt || ''
        }));

        setOrganizations(updatedOrganizations);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchOrganizationsWithContracts();
  }, []);

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
          { title: '組織數', value: '15', color: 'accent', icon: '🏢' },
          { title: '總用戶數', value: '342', color: 'success', icon: '👥' },
          { title: '本月新增', value: '3', color: 'warning', icon: '📈' },
          { title: '活躍組織', value: '12', color: 'info', icon: '✨' },
        ].map((stat) => (
          <div key={stat.title} className={`bg-background-primary rounded-xl shadow-sm p-6 border-l-4 ${
            stat.color === 'accent' ? 'border-accent-color' :
            stat.color === 'success' ? 'border-success-color' :
            stat.color === 'warning' ? 'border-warning-color' :
            'border-info-color'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-secondary text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold text-text-primary mt-1">{stat.value}</h3>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
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
                ))}
              </tbody>
            </table>
          </div>

          {/* 分頁控制 */}
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
        </div>
      </div>

      {/* 新增組織表單 */}
      {isCreateFormOpen && (
        <CreateOrganizationForm 
          isOpen={isCreateFormOpen}
          onClose={() => setIsCreateFormOpen(false)}
        />
      )}
    </div>
  );
}
