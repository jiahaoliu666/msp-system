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
  const { showToast } = useToast();
  const router = useRouter();

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
        createdAt: existingUser?.createdAt, // 保留原本的 createdAt
        updatedAt: formattedUpdatedAt
      };

      // 更新 DynamoDB 中的用戶資料
      await docClient.send(
        new PutCommand({
          TableName: DB_CONFIG.tables.USER_MANAGEMENT,
          Item: userItem
        })
      );

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
                {users.map((user, index) => (
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
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
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
  