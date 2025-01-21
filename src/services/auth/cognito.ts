import {
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  AdminGetUserCommand,
  AdminGetUserCommandInput,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  ListUsersCommand,
  ListUsersCommandInput,
  AttributeType,
  AdminDeleteUserCommand,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient, AWS_CONFIG } from "@/config/aws-config";

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

export class CognitoService {
  // 登入 (保持在客戶端，因為需要使用 Cognito 的 AuthFlow)
  static async login({ email, password }: LoginParams) {
    console.log('開始登入流程，檢查配置...');
    
    // 檢查配置
    if (!AWS_CONFIG.cognito.clientId) {
      console.error('Cognito Client ID 未設置');
      throw new Error('系統配置錯誤：Cognito Client ID 未設置');
    }

    const params: InitiateAuthCommandInput = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: AWS_CONFIG.cognito.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    try {
      console.log('發送認證請求...');
      const command = new InitiateAuthCommand(params);
      
      let response;
      try {
        response = await cognitoClient.send(command);
        console.log('收到認證回應:', {
          hasAuthResult: !!response.AuthenticationResult,
          hasAccessToken: !!response.AuthenticationResult?.AccessToken,
          hasIdToken: !!response.AuthenticationResult?.IdToken,
          hasRefreshToken: !!response.AuthenticationResult?.RefreshToken,
          hasChallenge: !!response.ChallengeName
        });
      } catch (sendError: any) {
        console.error('認證請求失敗:', {
          error: sendError,
          name: sendError.name,
          message: sendError.message,
          $metadata: sendError.$metadata
        });
        throw sendError;
      }

      if (!response.AuthenticationResult?.AccessToken) {
        console.error('認證回應中缺少 AccessToken');
        throw new Error('認證失敗：未收到有效的認證令牌');
      }

      return response;
    } catch (error: any) {
      console.error('認證過程發生錯誤:', {
        name: error.name,
        message: error.message,
        $metadata: error.$metadata
      });

      let errorMessage: string;
      switch (error.name) {
        case 'NotAuthorizedException':
          errorMessage = '帳號或密碼錯誤';
          break;
        case 'UserNotConfirmedException':
          errorMessage = '帳號尚未驗證，請查收電子郵件進行驗證';
          break;
        case 'UserNotFoundException':
          errorMessage = '找不到此帳號';
          break;
        case 'InvalidParameterException':
          errorMessage = '請檢查輸入的帳號密碼格式是否正確';
          break;
        case 'TooManyRequestsException':
          errorMessage = '登入嘗試次數過多，請稍後再試';
          break;
        default:
          errorMessage = `登入失敗：${error.message || '請稍後再試'}`;
      }

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
      UserPoolId: AWS_CONFIG.cognito.userPoolId,
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
        UserPoolId: AWS_CONFIG.cognito.userPoolId,
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
        UserPoolId: AWS_CONFIG.cognito.userPoolId,
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
    if (!AWS_CONFIG.cognito.clientId) {
      console.error('Cognito Client ID 未設置');
      throw new Error('系統配置錯誤：Cognito Client ID 未設置');
    }

    const params: InitiateAuthCommandInput = {
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: AWS_CONFIG.cognito.clientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken
      },
    };

    try {
      console.log('發送 Token 刷新請求...');
      const command = new InitiateAuthCommand(params);
      const response = await cognitoClient.send(command);

      if (!response.AuthenticationResult?.AccessToken) {
        throw new Error('Token 刷新失敗：未收到有效的認證令牌');
      }

      return response;
    } catch (error: any) {
      console.error('Token 刷新失敗:', {
        name: error.name,
        message: error.message,
        $metadata: error.$metadata
      });

      throw new Error('Token 刷新失敗：' + (error.message || '請重新登入'));
    }
  }
} 