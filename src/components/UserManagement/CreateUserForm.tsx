import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { CognitoService } from '@/services/auth/cognito';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { useToast } from '@/context/ToastContext';

interface CreateUserFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Organization {
  organizationName: string;
}

const roleOptions = [
  { value: '架構師', label: '架構師' },
  { value: '維運工程師', label: '維運工程師' },
  { value: '系統管理員', label: '系統管理員' },
  { value: '一般用戶', label: '一般用戶' },
];

export default function CreateUserForm({ isOpen, onClose }: CreateUserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    temporaryPassword: '',
    organization: '',
    role: '',
  });

  const [organizations, setOrganizations] = useState<{ value: string; label: string; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatePassword, setGeneratePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();

  // 監聽 isOpen，當表單開啟時重置所有狀態
  useEffect(() => {
    if (isOpen) {
      // 重置表單數據
      setFormData({
        email: '',
        temporaryPassword: '',
        organization: '',
        role: '',
      });
      // 重置其他狀態
      setError('');
      setGeneratePassword(false);
      setShowPassword(false);
    }
  }, [isOpen]);

  // 產生隨機臨時密碼
  const generateTemporaryPassword = () => {
    const length = 12;
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*';

    // 確保每種字符至少出現一次
    let password = '';
    password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)]; // 一個大寫字母
    password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]; // 一個小寫字母
    password += numberChars[Math.floor(Math.random() * numberChars.length)]; // 一個數字
    password += specialChars[Math.floor(Math.random() * specialChars.length)]; // 一個特殊字符

    // 剩餘長度隨機填充
    const remainingLength = length - password.length;
    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    
    for (let i = 0; i < remainingLength; i++) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      password += allChars[randomIndex];
    }

    // 打亂密碼順序
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  // 處理產生臨時密碼選項變更
  const handleGeneratePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setGeneratePassword(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        temporaryPassword: generateTemporaryPassword()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        temporaryPassword: ''
      }));
    }
  };

  useEffect(() => {
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
            TableName: "MetaAge-MSP-Organization-Management",
            ProjectionExpression: "organizationName"
          })
        );

        const organizationOptions = (Items as Organization[]).map((item: Organization) => ({
          value: item.organizationName,
          label: item.organizationName
        }));

        setOrganizations(organizationOptions);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setError('獲取組織列表時發生錯誤');
      }
    };

    fetchOrganizations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('請輸入電子郵件');
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('請輸入有效的電子郵件格式');
      return false;
    }
    if (!formData.temporaryPassword) {
      setError('請輸入臨時密碼');
      return false;
    }
    
    // 密碼驗證規則
    const passwordRules = {
      length: formData.temporaryPassword.length >= 8,
      uppercase: /[A-Z]/.test(formData.temporaryPassword),
      lowercase: /[a-z]/.test(formData.temporaryPassword),
      number: /[0-9]/.test(formData.temporaryPassword),
      special: /[!@#$%^&*]/.test(formData.temporaryPassword),
    };

    if (!passwordRules.length || !passwordRules.uppercase || !passwordRules.lowercase || 
        !passwordRules.number || !passwordRules.special) {
      setError('密碼不符合要求');
      return false;
    }

    if (!formData.organization) {
      setError('請選擇組織');
      return false;
    }
    if (!formData.role) {
      setError('請選擇角色');
      return false;
    }
    return true;
  };

  // 檢查密碼是否符合規則
  const checkPasswordRules = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      showToast('error', '請檢查表單填寫是否完整');
      return;
    }

    setLoading(true);
    try {
      await CognitoService.createUser({
        email: formData.email,
        temporaryPassword: formData.temporaryPassword,
        userAttributes: {
          organization: formData.organization,
          role: formData.role,
        },
      });

      showToast('success', '用戶創建成功，請通知用戶查收驗證郵件');

      // 重置表單
      setFormData({
        email: '',
        temporaryPassword: '',
        organization: '',
        role: '',
      });

      onClose();
    } catch (error: any) {
      console.error('Create user error:', error);
      if (error.code === 'UsernameExistsException') {
        setError('此電子郵件已被使用，請更換電子郵件再嘗試');
        showToast('error', '此電子郵件已被使用，請更換電子郵件再嘗試');
      } else if (error.code === 'InvalidParameterException') {
        setError('輸入資料格式不正確');
        showToast('error', '輸入資料格式不正確');
      } else {
        setError(error.message || '系統發生錯誤，請稍後再試');
        showToast('error', error.message || '系統發生錯誤，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
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
            <div className="inline-block w-full max-w-2xl p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              {/* 標題區域 */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <Dialog.Title as="h2" className="text-2xl font-bold text-gray-800">
                  新增使用者
                </Dialog.Title>
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
                  {/* 電子郵件 */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                      電子郵件 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="請輸入電子郵件"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      required
                    />
                  </div>

                  {/* 臨時密碼 */}
                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                        臨時密碼 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="temporaryPassword"
                          value={formData.temporaryPassword}
                          onChange={handleChange}
                          placeholder="請輸入臨時密碼"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 pr-12"
                          required
                          readOnly={generatePassword}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          {showPassword ? (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">密碼要求</span>
                        </div>
                        <div className="ml-7 space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              checkPasswordRules(formData.temporaryPassword).length ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              {checkPasswordRules(formData.temporaryPassword).length && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-gray-600">至少 8 個字符</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              checkPasswordRules(formData.temporaryPassword).uppercase ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              {checkPasswordRules(formData.temporaryPassword).uppercase && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-gray-600">包含大寫字母</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              checkPasswordRules(formData.temporaryPassword).lowercase ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              {checkPasswordRules(formData.temporaryPassword).lowercase && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-gray-600">包含小寫字母</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              checkPasswordRules(formData.temporaryPassword).number ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              {checkPasswordRules(formData.temporaryPassword).number && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-gray-600">包含數字</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              checkPasswordRules(formData.temporaryPassword).special ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              {checkPasswordRules(formData.temporaryPassword).special && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-gray-600">包含特殊字符</span>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="generatePassword"
                        checked={generatePassword}
                        onChange={handleGeneratePasswordChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="generatePassword" className="text-sm text-gray-700">
                        自動產生臨時密碼
                      </label>
                    </div>

                    {/* 組織 */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                        組織 <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                        required
                      >
                        <option value="">請選擇組織</option>
                        {organizations.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 角色 */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                        角色 <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                        required
                      >
                        <option value="">請選擇角色</option>
                        {roleOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 錯誤提示 */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* 按鈕組 */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-gray-200 flex items-center space-x-2"
                      disabled={loading}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>取消</span>
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 focus:ring-2 focus:ring-blue-300 flex items-center space-x-2 shadow-lg shadow-blue-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>處理中...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>建立使用者</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
