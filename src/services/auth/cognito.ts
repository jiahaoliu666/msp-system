import {
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AdminRespondToAuthChallengeCommand,
  AdminRespondToAuthChallengeCommandInput,
  AdminGetUserCommand,
  AdminGetUserCommandInput,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  ListUsersCommand,
  ListUsersCommandInput,
  AttributeType,
  AdminDeleteUserCommand,
  AdminUpdateUserAttributesCommand,
  AuthFlowType,
  ChallengeNameType
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "@/config/cognito-config";
import { COGNITO_CONFIG } from "@/config/cognito-config";

export interface CreateUserParams {
  email: string;
  temporaryPassword: string;
  userAttributes?: {
    department?: string;
    role?: string;
    [key: string]: string | undefined;
  };
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface UserListParams {
  limit?: number;
  paginationToken?: string;
  filter?: string;
}

export interface UpdateUserParams {
  username: string;
  email: string;
  organization?: string;
  role?: string;
  [key: string]: string | undefined;
}

export interface NewPasswordRequiredData {
  email: string;
  session: string;
  newPassword: string;
}

export class CognitoService {
  // 處理首次登入需要更改密碼的情況
  static async completeNewPasswordChallenge({ email, session, newPassword }: NewPasswordRequiredData) {
    console.log('CognitoService: 開始處理密碼更改挑戰...');

    if (!COGNITO_CONFIG.clientId || !COGNITO_CONFIG.userPoolId) {
      throw new Error('系統配置錯誤：Cognito 配置未完整設置');
    }

    const params: AdminRespondToAuthChallengeCommandInput = {
      UserPoolId: COGNITO_CONFIG.userPoolId,
      ClientId: COGNITO_CONFIG.clientId,
      ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
      ChallengeResponses: {
        USERNAME: email,
        NEW_PASSWORD: newPassword
      },
      Session: session
    };

    try {
      console.log('CognitoService: 發送密碼更改請求...');
      const command = new AdminRespondToAuthChallengeCommand(params);
      const response = await cognitoClient.send(command);

      if (!response.AuthenticationResult?.AccessToken) {
        throw new Error('密碼更改失敗：未收到有效的認證令牌');
      }

      console.log('CognitoService: 密碼更改成功');
      return response;
    } catch (error: any) {
      console.error('密碼更改失敗:', error);
      throw new Error('密碼更改失敗：' + (error.message || '請稍後再試'));
    }
  }

  // 登入 (保持在客戶端，因為需要使用 Cognito 的 AuthFlow)
  static async login({ email, password }: LoginParams) {
    console.log('CognitoService: 開始登入流程，檢查配置...');
    
    try {
      // 檢查配置
      if (!COGNITO_CONFIG.clientId || !COGNITO_CONFIG.userPoolId) {
        console.error('CognitoService: Cognito 配置未完整設置', {
          hasClientId: !!COGNITO_CONFIG.clientId,
          hasUserPoolId: !!COGNITO_CONFIG.userPoolId
        });
        throw new Error('系統配置錯誤：Cognito 配置未完整設置');
      }

      // 檢查輸入
      if (!email || !password) {
        throw new Error('請輸入電子郵件和密碼');
      }

      console.log('CognitoService: 配置檢查完成，準備發送認證請求...', {
        region: COGNITO_CONFIG.region,
        userPoolId: COGNITO_CONFIG.userPoolId,
        clientId: COGNITO_CONFIG.clientId,
        email: email
      });

      // 使用 AdminInitiateAuth
      const params: AdminInitiateAuthCommandInput = {
        UserPoolId: COGNITO_CONFIG.userPoolId,
        ClientId: COGNITO_CONFIG.clientId,
        AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      };

      const command = new AdminInitiateAuthCommand(params);

      console.log('CognitoService: 準備發送認證請求，完整參數：', {
        authFlow: params.AuthFlow,
        userPoolId: params.UserPoolId ? '已設置' : '未設置',
        clientId: params.ClientId ? '已設置' : '未設置',
        hasUsername: !!params.AuthParameters?.USERNAME,
        hasPassword: !!params.AuthParameters?.PASSWORD,
        endpoint: cognitoClient.config.endpoint
      });
      
      try {
        console.log('CognitoService: 開始發送請求到 Cognito...', {
          commandType: command.constructor.name,
          input: {
            AuthFlow: command.input.AuthFlow,
            UserPoolId: command.input.UserPoolId ? '已設置' : '未設置',
            ClientId: command.input.ClientId ? '已設置' : '未設置',
            hasAuthParams: !!command.input.AuthParameters
          }
        });

        console.log('CognitoService: 使用的 Cognito 客戶端配置:', {
          region: cognitoClient.config.region,
          endpoint: cognitoClient.config.endpoint,
          credentials: {
            accessKeyId: COGNITO_CONFIG.credentials.accessKeyId ? '已設置' : '未設置',
            secretAccessKey: COGNITO_CONFIG.credentials.secretAccessKey ? '已設置' : '未設置'
          }
        });

        const response = await cognitoClient.send(command).catch((error: any) => {
          console.error('CognitoService: 請求發送失敗:', {
            errorName: error.name,
            errorMessage: error.message,
            errorCode: error.code,
            errorStack: error.stack,
            errorMetadata: error.$metadata,
            requestId: error.$metadata?.requestId
          });

          // 特殊處理 UNAUTHORIZED_CLIENT 錯誤
          if (error.name === 'NotAuthorizedException' && 
              error.message.includes('UNAUTHORIZED_CLIENT')) {
            console.error('CognitoService: 應用程式用戶端未啟用 ADMIN_USER_PASSWORD_AUTH 流程');
            throw new Error('系統配置錯誤：應用程式用戶端未啟用管理員密碼認證流程');
          }

          throw error;
        });

        console.log('CognitoService: 收到 Cognito 回應:', {
          hasAuthResult: !!response.AuthenticationResult,
          hasAccessToken: !!response.AuthenticationResult?.AccessToken,
          hasIdToken: !!response.AuthenticationResult?.IdToken,
          hasRefreshToken: !!response.AuthenticationResult?.RefreshToken,
          hasChallenge: !!response.ChallengeName,
          challengeName: response.ChallengeName,
          hasSession: !!response.Session,
          $metadata: response.$metadata,
          statusCode: response.$metadata?.httpStatusCode,
          requestId: response.$metadata?.requestId
        });

        // 如果需要更改密碼
        if (response.ChallengeName === ChallengeNameType.NEW_PASSWORD_REQUIRED) {
          return {
            challengeName: response.ChallengeName,
            session: response.Session,
            email: email
          };
        }

        if (!response.AuthenticationResult?.AccessToken) {
          console.error('認證回應中缺少 AccessToken');
          throw new Error('認證失敗：未收到有效的認證令牌');
        }

        console.log('登入成功，返回認證結果');
        return response;

      } catch (sendError: any) {
        console.error('認證請求處理失敗:', {
          error: sendError,
          name: sendError.name,
          message: sendError.message,
          code: sendError.code,
          $metadata: sendError.$metadata,
          stack: sendError.stack
        });

        // 特殊處理 NotAuthorizedException
        if (sendError.name === 'NotAuthorizedException') {
          if (sendError.message.includes('Password attempts exceeded')) {
            throw new Error('密碼嘗試次數過多，請稍後再試');
          }
          throw new Error('電子郵件或密碼錯誤');
        }

        // 特殊處理 UserNotConfirmedException
        if (sendError.name === 'UserNotConfirmedException') {
          throw new Error('帳號尚未驗證，請查收電子郵件進行驗證');
        }

        throw sendError;
      }
    } catch (error: any) {
      console.error('認證過程發生錯誤:', {
        name: error.name,
        message: error.message,
        code: error.code,
        $metadata: error.$metadata,
        stack: error.stack
      });

      let errorMessage: string;
      switch (error.name) {
        case 'NotAuthorizedException':
          errorMessage = error.message.includes('Password attempts exceeded') 
            ? '密碼嘗試次數過多，請稍後再試'
            : '電子郵件或密碼錯誤';
          break;
        case 'UserNotConfirmedException':
          errorMessage = '帳號尚未驗證，請查收電子郵件進行驗證';
          break;
        case 'UserNotFoundException':
          errorMessage = '找不到此電子郵件';
          break;
        case 'InvalidParameterException':
          errorMessage = '請檢查輸入的電子郵件密碼格式是否正確';
          break;
        case 'TooManyRequestsException':
          errorMessage = '登入嘗試次數過多，請稍後再試';
          break;
        case 'InvalidClientTokenId':
          errorMessage = '無效的應用程式用戶端 ID';
          break;
        case 'ResourceNotFoundException':
          errorMessage = '找不到用戶池資源';
          break;
        default:
          errorMessage = `登入失敗：${error.message || '請稍後再試'}`;
      }

      console.error('格式化的錯誤訊息:', errorMessage);
      const enhancedError = new Error(errorMessage);
      enhancedError.name = error.name || 'UnknownError';
      throw enhancedError;
    }
  }

  // 獲取用戶列表 (通過 API 路由)
  static async listUsers(params: UserListParams = {}) {
    try {
      console.log('開始呼叫 API 獲取用戶列表...');
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API 回應狀態:', response.status);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API 回應錯誤:', data);
        throw new Error(data.message || 'Failed to fetch users');
      }

      if (!Array.isArray(data)) {
        console.error('API 回應格式錯誤:', data);
        throw new Error('Invalid response format');
      }

      console.log('成功獲取用戶列表，數量:', data.length);
      return data;
    } catch (error: any) {
      console.error("獲取用戶列表錯誤:", error);
      throw new Error(error.message || '獲取用戶列表失敗');
    }
  }

  // 創建新用戶 (通過 API 路由)
  static async createUser(params: CreateUserParams) {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          code: data.code,
          message: data.message,
          error: data.error
        };
      }
      
      return data;
    } catch (error: any) {
      console.error("Create user error:", error);
      throw {
        code: error.code || 'UnknownError',
        message: error.message || '系統發生錯誤，請稍後再試',
        error: error.error || '創建用戶失敗'
      };
    }
  }

  // 停用用戶 (通過 API 路由)
  static async disableUser(username: string) {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, action: 'disable' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to disable user');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Disable user error:", error);
      throw error;
    }
  }

  // 啟用用戶 (通過 API 路由)
  static async enableUser(username: string) {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, action: 'enable' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to enable user');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Enable user error:", error);
      throw error;
    }
  }

  // 獲取用戶詳細資訊
  static async getUser(username: string) {
    const params: AdminGetUserCommandInput = {
      UserPoolId: COGNITO_CONFIG.userPoolId,
      Username: username,
    };

    try {
      const command = new AdminGetUserCommand(params);
      const response = await cognitoClient.send(command);
      return response;
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  }

  // 更新用戶
  static async updateUser(params: UpdateUserParams) {
    try {
      const userAttributes: AttributeType[] = [];
      
      // 添加可更新的屬性
      if (params.organization) {
        userAttributes.push({
          Name: 'custom:organization',
          Value: params.organization
        });
      }
      if (params.role) {
        userAttributes.push({
          Name: 'custom:role',
          Value: params.role
        });
      }

      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: COGNITO_CONFIG.userPoolId,
        Username: params.username,
        UserAttributes: userAttributes,
      });

      await cognitoClient.send(command);

      // 更新 DynamoDB 中的用戶資訊
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          username: params.username,
          organization: params.organization,
          role: params.role,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user in DynamoDB');
      }

      return await response.json();
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  }

  // 刪除用戶
  static async deleteUser(username: string) {
    try {
      const command = new AdminDeleteUserCommand({
        UserPoolId: COGNITO_CONFIG.userPoolId,
        Username: username,
      });

      await cognitoClient.send(command);

      // 從 DynamoDB 中刪除用戶資訊
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user from DynamoDB');
      }

      return await response.json();
    } catch (error) {
      console.error("Delete user error:", error);
      throw error;
    }
  }

  // 刷新 Token
  static async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new Error('刷新令牌不能為空');
    }

    if (!COGNITO_CONFIG.clientId || !COGNITO_CONFIG.userPoolId) {
      throw new Error('系統配置錯誤：Cognito 配置未完整設置');
    }

    const params: AdminInitiateAuthCommandInput = {
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: COGNITO_CONFIG.clientId,
      UserPoolId: COGNITO_CONFIG.userPoolId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken
      }
    };

    try {
      console.log('發送 Token 刷新請求...');
      const command = new AdminInitiateAuthCommand(params);
      const response = await cognitoClient.send(command);

      if (!response.AuthenticationResult?.AccessToken) {
        throw new Error('刷新令牌失敗：未收到新的訪問令牌');
      }

      return response.AuthenticationResult;
    } catch (error: any) {
      console.error('刷新令牌失敗:', error);
      throw new Error('刷新令牌失敗：' + (error.message || '請重新登入'));
    }
  }
} 