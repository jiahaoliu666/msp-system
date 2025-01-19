import { useState, useEffect } from 'react';
import { CognitoService } from '@/services/auth/cognito';
import { UserType, AttributeType } from '@aws-sdk/client-cognito-identity-provider';

interface User {
  username: string;
  email: string;
  department?: string;
  role?: string;
  status: string;
  lastLogin?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    temporaryPassword: '',
    department: '',
    role: '',
  });

  // 獲取用戶列表
  const fetchUsers = async () => {
    try {
      const response = await CognitoService.listUsers();
      const formattedUsers = response.Users?.map((user: UserType) => {
        const attributes = user.Attributes || [];
        const email = attributes.find((attr: AttributeType) => attr.Name === 'email')?.Value || '';
        const department = attributes.find((attr: AttributeType) => attr.Name === 'custom:department')?.Value;
        const role = attributes.find((attr: AttributeType) => attr.Name === 'custom:role')?.Value;
        const lastLogin = user.UserLastModifiedDate?.toLocaleString();

        return {
          username: user.Username || '',
          email,
          department,
          role,
          status: user.Enabled ? '使用中' : '已停用',
          lastLogin,
        };
      }) || [];

      setUsers(formattedUsers);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError('獲取用戶列表失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 創建新用戶
  const handleCreateUser = async () => {
    try {
      await CognitoService.createUser({
        email: newUserData.email,
        temporaryPassword: newUserData.temporaryPassword,
        userAttributes: {
          department: newUserData.department,
          role: newUserData.role,
        },
      });
      
      setShowCreateModal(false);
      setNewUserData({
        email: '',
        temporaryPassword: '',
        department: '',
        role: '',
      });
      
      // 重新獲取用戶列表
      await fetchUsers();
    } catch (err) {
      console.error('Create user error:', err);
      setError('創建用戶失敗');
    }
  };

  // 停用/啟用用戶
  const handleToggleUserStatus = async (username: string, currentStatus: string) => {
    try {
      if (currentStatus === '使用中') {
        await CognitoService.disableUser(username);
      } else {
        await CognitoService.enableUser(username);
      }
      await fetchUsers();
    } catch (err) {
      console.error('Toggle user status error:', err);
      setError('更改用戶狀態失敗');
    }
  };

  // 創建用戶 Modal
  const CreateUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">新增使用者</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              電子郵件
            </label>
            <input
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              臨時密碼
            </label>
            <input
              type="password"
              value={newUserData.temporaryPassword}
              onChange={(e) => setNewUserData({ ...newUserData, temporaryPassword: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              部門
            </label>
            <select
              value={newUserData.department}
              onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">選擇部門</option>
              <option value="it">資訊部</option>
              <option value="sales">業務部</option>
              <option value="support">技術支援部</option>
              <option value="finance">財務部</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              角色
            </label>
            <select
              value={newUserData.role}
              onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">選擇角色</option>
              <option value="admin">系統管理員</option>
              <option value="manager">部門主管</option>
              <option value="user">一般使用者</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            取消
          </button>
          <button
            onClick={handleCreateUser}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            建立
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-100 p-8">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <a href="#" className="hover:text-blue-600">首頁</a>
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

      {/* 使用者列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">使用者資訊</th>
                  <th className="px-6 py-3">部門/角色</th>
                  <th className="px-6 py-3">狀態</th>
                  <th className="px-6 py-3">最後登入</th>
                  <th className="px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.username} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.department || '-'}</div>
                      <div className="text-sm text-gray-500">{user.role || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === '使用中' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.lastLogin || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
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

      {/* 錯誤提示 */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 創建用戶 Modal */}
      {showCreateModal && <CreateUserModal />}
    </div>
  );
}
  