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

export class CognitoService {
  // 登入 (保持在客戶端，因為需要使用 Cognito 的 AuthFlow)
  static async login({ email, password }: LoginParams) {
    const params: InitiateAuthCommandInput = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: AWS_CONFIG.cognito.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    try {
      const command = new InitiateAuthCommand(params);
      const response = await cognitoClient.send(command);
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // 獲取用戶列表 (通過 API 路由)
  static async listUsers(params: UserListParams = {}) {
    try {
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch users');
      }
      return await response.json();
    } catch (error) {
      console.error("List users error:", error);
      throw error;
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
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
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
} 