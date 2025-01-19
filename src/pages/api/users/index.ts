import { NextApiRequest, NextApiResponse } from 'next';
import { 
  ListUsersCommand,
  AdminCreateUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from '@/config/aws-config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 驗證環境變數
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return res.status(500).json({ 
      error: 'AWS credentials not configured',
      message: '系統配置錯誤，請聯繫管理員'
    });
  }

  if (!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID) {
    return res.status(500).json({ 
      error: 'Cognito User Pool ID not configured',
      message: '系統配置錯誤，請聯繫管理員'
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        // 獲取用戶列表
        const listCommand = new ListUsersCommand({
          UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
          Limit: 50,
        });
        const users = await cognitoClient.send(listCommand);
        return res.status(200).json(users);

      case 'POST':
        // 創建新用戶
        const { email, temporaryPassword, userAttributes } = req.body;
        const createCommand = new AdminCreateUserCommand({
          UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
          Username: email,
          TemporaryPassword: temporaryPassword,
          UserAttributes: [
            { Name: "email", Value: email },
            { Name: "email_verified", Value: "true" },
            ...(userAttributes?.department ? [{ Name: "custom:department", Value: userAttributes.department }] : []),
            ...(userAttributes?.role ? [{ Name: "custom:role", Value: userAttributes.role }] : []),
          ],
          MessageAction: "SUPPRESS",
        });
        const newUser = await cognitoClient.send(createCommand);
        return res.status(201).json(newUser);

      case 'PUT':
        // 更新用戶狀態
        const { username, action } = req.body;
        if (action === 'enable') {
          const enableCommand = new AdminEnableUserCommand({
            UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
            Username: username,
          });
          await cognitoClient.send(enableCommand);
        } else if (action === 'disable') {
          const disableCommand = new AdminDisableUserCommand({
            UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
            Username: username,
          });
          await cognitoClient.send(disableCommand);
        }
        return res.status(200).json({ message: 'User status updated successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      code: error.name
    });
  }
} 