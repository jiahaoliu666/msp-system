import { useState, useEffect, Fragment } from 'react';
import { CognitoService } from '@/services/auth/cognito';
import { UserType, AttributeType } from '@aws-sdk/client-cognito-identity-provider';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import CreateUserForm, { roleOptions } from '@/components/UserManagement/CreateUserForm';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/router';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DB_CONFIG } from '../config/db-config';

interface User {
  username: string;
  email: string;
  organization?: string;
  department?: string;
  role?: string;
  status: string;
  emailVerified: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const { showToast } = useToast();
  const router = useRouter();

  // 新增篩選狀態
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // 處理篩選邏輯
  useEffect(() => {
    let filtered = [...users];

    // 根據 URL 參數篩選組織
    const { organization } = router.query;
    if (organization && typeof organization === 'string') {
      const decodedOrg = decodeURIComponent(organization);
      filtered = filtered.filter(user => user.organization === decodedOrg);
      setSelectedOrganization(decodedOrg);
    }

    // 根據搜尋詞篩選
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 根據選擇的組織篩選
    if (selectedOrganization && !organization) {
      filtered = filtered.filter(user => user.organization === selectedOrganization);
    }

    // 根據選擇的角色篩選
    if (selectedRole) {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // 根據選擇的狀態篩選
    if (selectedStatus) {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedOrganization, selectedRole, selectedStatus, router.query]);

  // 獲取所有可用的組織和角色選項
  useEffect(() => {
    const orgs = Array.from(new Set(users.map(user => user.organization).filter(Boolean))) as string[];
    setOrganizations(orgs);
  }, [users]);

  // 獲取用戶列表
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('開始獲取用戶列表...');
      
      const response = await CognitoService.listUsers();
      console.log('成功獲取用戶列表，開始處理數據...');
      
      if (!Array.isArray(response)) {
        throw new Error('返回數據格式錯誤');
      }
      
      const formattedUsers = response.map((user: any) => {
        // 格式化時間
        const lastLoginDate = user.lastLogin ? new Date(user.lastLogin) : null;
        const formattedLastLogin = lastLoginDate ? 
          lastLoginDate.toLocaleString('zh-TW', {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).replace(/\//g, '-') : null;

        return {
          username: user.username,
          email: user.email,
          organization: user.organization,
          role: user.role,
          status: !user.enabled ? '已停用' : user.status === 'FORCE_CHANGE_PASSWORD' ? '使用中' : '使用中',
          emailVerified: user.emailVerified || false,
          lastLogin: formattedLastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      });

      console.log('數據處理完成，更新用戶列表...');
      setUsers(formattedUsers);
    } catch (err: any) {
      console.error('獲取用戶列表失敗:', err);
      const errorMessage = err.message || '獲取用戶列表失敗';
      setError(errorMessage);
      showToast('error', errorMessage);
      
      // 如果是認證相關的錯誤，可能需要重新登入
      if (err.name === 'NotAuthorizedException' || err.name === 'TokenExpiredError') {
        showToast('error', '登入已過期，請重新登入');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // 獲取組織列表
  const fetchOrganizations = async () => {
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
          TableName: DB_CONFIG.tables.ORGANIZATION_MANAGEMENT,
          ProjectionExpression: "organizationName"
        })
      );

      const orgNames = Items.map(item => item.organizationName as string);
      setOrganizations(orgNames);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      showToast('error', '獲取組織列表失敗');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 停用/啟用用戶
  const handleToggleUserStatus = async (username: string, currentStatus: string) => {
    const action = currentStatus === '使用中' ? '停用' : '啟用';
    const confirmMessage = `確定要${action}此用戶嗎？`;
    
    if (window.confirm(confirmMessage)) {
      try {
        if (currentStatus === '使用中') {
          await CognitoService.disableUser(username);
          showToast('success', '已成功停用用戶');
        } else {
          await CognitoService.enableUser(username);
          showToast('success', '已成功啟用用戶');
        }
        await fetchUsers();
      } catch (err) {
        console.error('Toggle user status error:', err);
        setError('更改用戶狀態失敗');
        showToast('error', '更改用戶狀態失敗');
      }
    }
  };

  // 處理查看用戶
  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // 處理編輯用戶
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditFormData(user);
    setIsEditModalOpen(true);
    fetchOrganizations();
  };

  // 處理編輯表單變更
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
  };

  // 處理更新用戶
  const handleUpdateUser = async () => {
    if (!editFormData) return;

    try {
      // 檢查是否正在編輯自己的帳號
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const currentUserEmail = userInfo.email;
      
      if (currentUserEmail === editFormData.email && editFormData.role === '客戶') {
        showToast('error', '無法將自己的角色更改為客戶');
        return;
      }

      // 建立 DynamoDB 客戶端
      const client = new DynamoDBClient({
        region: process.env.NEXT_PUBLIC_AWS_REGION,
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
        }
      });

      const docClient = DynamoDBDocumentClient.from(client);

      // 先獲取現有用戶資料以保留 createdAt
      const { Item: existingUser } = await docClient.send(
        new GetCommand({
          TableName: DB_CONFIG.tables.USER_MANAGEMENT,
          Key: {
            email: editFormData.email
          }
        })
      );

      // 格式化更新時間
      const now = new Date();
      const formattedUpdatedAt = now.toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-');

      // 準備要儲存的用戶資料
      const userItem = {
        email: editFormData.email,
        organization: editFormData.organization || null,
        role: editFormData.role || null,
        createdAt: existingUser?.createdAt,
        updatedAt: formattedUpdatedAt
      };

      // 更新 DynamoDB 中的用戶資料
      await docClient.send(
        new PutCommand({
          TableName: DB_CONFIG.tables.USER_MANAGEMENT,
          Item: userItem
        })
      );

      // 檢查角色變更情況
      const oldRole = selectedUser?.role;
      const newRole = editFormData.role;

      // 如果新角色是客戶，則更新或創建客戶管理資料表記錄
      if (newRole === '客戶' && editFormData.organization) {
        // 先檢查是否已存在客戶資料
        const { Item: existingCustomer } = await docClient.send(
          new GetCommand({
            TableName: DB_CONFIG.tables.CUSTOMER_MANAGEMENT,
            Key: {
              customerName: editFormData.organization
            }
          })
        );

        const customerItem = {
          customerName: editFormData.organization,
          email: editFormData.email,
          type: existingCustomer?.type || '企業客戶',
          status: existingCustomer?.status || '使用中',
          service: existingCustomer?.service || '基礎維護',
          lastActivity: formattedUpdatedAt,
          manager: existingCustomer?.manager || {
            name: '系統管理員',
            avatar: ''
          },
          createdAt: existingCustomer?.createdAt || formattedUpdatedAt,
          updatedAt: formattedUpdatedAt
        };

        await docClient.send(
          new PutCommand({
            TableName: DB_CONFIG.tables.CUSTOMER_MANAGEMENT,
            Item: customerItem
          })
        );
      }
      // 如果舊角色是客戶，但新角色不是客戶，則刪除客戶管理資料表記錄
      else if (oldRole === '客戶' && newRole !== '客戶' && selectedUser?.organization) {
        try {
          await docClient.send(
            new DeleteCommand({
              TableName: DB_CONFIG.tables.CUSTOMER_MANAGEMENT,
              Key: {
                customerName: selectedUser.organization
              }
            })
          );
          console.log('成功刪除客戶管理資料表記錄');
        } catch (deleteError) {
          console.error('刪除客戶管理資料表記錄時發生錯誤:', deleteError);
          // 不中斷流程，繼續執行
        }
      }

      setIsEditModalOpen(false);
      showToast('success', '用戶資料更新成功');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('更新用戶時發生錯誤');
      showToast('error', '更新用戶時發生錯誤');
    }
  };

  // 處理刪除用戶
  const handleDelete = async (username: string, email: string) => {
    if (window.confirm('確定要刪除此用戶嗎？')) {
      try {
        const response = await fetch('/api/users', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email }),
        });

        if (!response.ok) {
          throw new Error('刪除用戶失敗');
        }

        showToast('success', '用戶已成功刪除');
        await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('刪除用戶時發生錯誤');
        showToast('error', '刪除用戶時發生錯誤');
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
          <span className="text-gray-700">使用者管理</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">使用者管理</h1>
            <p className="text-gray-600 mt-1">管理系統使用者帳號與權限設定</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 flex items-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增使用者
            </button>
          </div>
        </div>
      </div>

      {/* 篩選區域 */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋使用者..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg
                       text-gray-700 placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-500">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <select
            value={selectedOrganization}
            onChange={(e) => setSelectedOrganization(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg
                     text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">所有組織</option>
            {organizations.map((org) => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg
                     text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">所有角色</option>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg
                     text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">所有狀態</option>
            <option value="使用中">使用中</option>
            <option value="已停用">已停用</option>
          </select>
        </div>

        {/* 已選擇的篩選標籤 */}
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedOrganization && (
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full
                         flex items-center gap-2 text-sm">
              組織：{selectedOrganization}
              <button onClick={() => setSelectedOrganization('')} className="hover:text-blue-800">
                ×
              </button>
            </span>
          )}
          {selectedRole && (
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full
                         flex items-center gap-2 text-sm">
              角色：{selectedRole}
              <button onClick={() => setSelectedRole('')} className="hover:text-blue-800">
                ×
              </button>
            </span>
          )}
          {selectedStatus && (
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full
                         flex items-center gap-2 text-sm">
              狀態：{selectedStatus}
              <button onClick={() => setSelectedStatus('')} className="hover:text-blue-800">
                ×
              </button>
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* 使用者列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 text-center">項次</th>
                  <th className="px-6 py-3 text-center">組織</th>
                  <th className="px-6 py-3 text-center">電子郵件</th>
                  <th className="px-6 py-3 text-center">角色</th>
                  <th className="px-6 py-3 text-center">狀態</th>
                  <th className="px-6 py-3 text-center">最後登入</th>
                  <th className="px-6 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr key={user.username} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/organization-management?organization=${encodeURIComponent(user.organization || '')}`}
                        className="font-medium text-text-primary hover:text-blue-600 cursor-pointer"
                      >
                        {user.organization || '-'}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {user.role || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === '使用中' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'FORCE_CHANGE_PASSWORD' ? '使用中' : user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-center">
                      {user.lastLogin || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleView(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          查看
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => handleDelete(user.username, user.email)}
                          className="text-red-600 hover:text-red-900"
                        >
                          刪除
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.username, user.status)}
                          className={`${
                            user.status === '使用中'
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.status === '使用中' ? '停用' : '啟用'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 查看用戶模態框 */}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    使用者詳細資訊
                  </Dialog.Title>
                  <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${
                    selectedUser?.status === '使用中' ? 'bg-green-100 text-green-800 border border-green-200' :
                    selectedUser?.status === '待驗證' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {selectedUser?.status}
                  </span>
                </div>
                {selectedUser && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                      {/* 基本資訊區塊 */}
                      <div className="p-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          基本資訊
                        </h4>
                        <div className="grid grid-cols-1 gap-x-8 gap-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">電子郵件</label>
                            <p className="text-sm text-gray-900">{selectedUser.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* 組織資訊區塊 */}
                      <div className="p-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          組織資訊
                        </h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">組織</label>
                            <p className="text-sm text-gray-900">{selectedUser.organization || '-'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">角色</label>
                            <p className="text-sm text-gray-900">{selectedUser.role || '-'}</p>
                          </div>
                        </div>
                      </div>

                      {/* 系統資訊 */}
                      <div className="p-6 bg-gray-50">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>最後登入：{selectedUser.lastLogin || '-'}</span>
                          <span>建立時間：{selectedUser.createdAt || '-'}</span>
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

      {/* 編輯用戶模態框 */}
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
                  編輯使用者
                </Dialog.Title>
                {editFormData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
                        <input
                          type="email"
                          name="email"
                          value={editFormData.email}
                          disabled
                          className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">組織</label>
                        <select
                          name="organization"
                          value={editFormData.organization || ''}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">請選擇組織</option>
                          {organizations.map((org, index) => (
                            <option key={index} value={org}>{org}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                        <select
                          name="role"
                          value={editFormData.role || ''}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">請選擇角色</option>
                          {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
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
                    disabled={!editFormData?.role || !editFormData?.organization}
                    className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
                      editFormData?.role && editFormData?.organization
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    onClick={handleUpdateUser}
                  >
                    保存
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* 新增使用者表單 */}
      <CreateUserForm 
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          fetchUsers();
        }}
      />
    </div>
  );
}
  