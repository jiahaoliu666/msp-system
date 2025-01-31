import { NextApiRequest, NextApiResponse } from 'next';
import { 
  ListUsersCommand,
  AdminCreateUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { cognitoClient } from '@/config/cognito-config';
import { DB_CONFIG } from '@/config/db-config';

// 初始化 DynamoDB 客戶端
const ddbClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const docClient = DynamoDBDocumentClient.from(ddbClient);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 驗證環境變數
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('AWS credentials not configured');
    return res.status(500).json({ 
      error: 'AWS credentials not configured',
      message: '系統配置錯誤：AWS 認證未設置，請聯繫管理員'
    });
  }

  if (!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID) {
    console.error('Cognito User Pool ID not configured');
    return res.status(500).json({ 
      error: 'Cognito User Pool ID not configured',
      message: '系統配置錯誤：Cognito User Pool ID 未設置，請聯繫管理員'
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        try {
          // 獲取用戶列表
          const listCommand = new ListUsersCommand({
            UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
            Limit: 50,
          });
          
          console.log('開始從 Cognito 獲取用戶列表...');
          const cognitoUsers = await cognitoClient.send(listCommand);
          
          if (!cognitoUsers.Users) {
            console.error('Cognito 未返回用戶數據');
            return res.status(500).json({
              error: 'No users data',
              message: '無法獲取用戶數據'
            });
          }
          
          console.log('成功從 Cognito 獲取用戶列表，數量:', cognitoUsers.Users.length);

          // 從 DynamoDB 獲取用戶額外資訊
          console.log('開始從 DynamoDB 獲取用戶詳細信息...');
          const { Items: userDetails = [] } = await docClient.send(
            new ScanCommand({
              TableName: DB_CONFIG.tables.USER_MANAGEMENT
            })
          );
          console.log('成功從 DynamoDB 獲取用戶詳細信息，數量:', userDetails.length);

          // 合併 Cognito 和 DynamoDB 的數據
          const users = cognitoUsers.Users.map(user => {
            const email = user.Attributes?.find(attr => attr.Name === 'email')?.Value || '';
            const userDetail = userDetails.find(detail => detail.email === email);

            return {
              username: user.Username,
              email,
              organization: userDetail?.organization || '',
              role: userDetail?.role || '',
              enabled: user.Enabled,
              status: user.UserStatus,
              lastLogin: user.UserLastModifiedDate,
              emailVerified: userDetail?.emailVerified || false,
              createdAt: userDetail?.createdAt,
              updatedAt: userDetail?.updatedAt
            };
          });

          console.log('成功處理並合併用戶數據，總數量:', users.length);
          return res.status(200).json(users);
        } catch (error: any) {
          console.error('獲取用戶列表時發生錯誤:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          
          return res.status(500).json({
            error: 'Failed to fetch users',
            message: '獲取用戶列表失敗',
            details: error.message,
            errorType: error.name
          });
        }

      case 'POST':
        // 創建新用戶
        const { email, temporaryPassword, userAttributes } = req.body;
        
        // 1. 在 Cognito 中創建用戶
        const createCommand = new AdminCreateUserCommand({
          UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
          Username: email,
          TemporaryPassword: temporaryPassword,
          UserAttributes: [
            { Name: "email", Value: email },
            { Name: "email_verified", Value: "true" }
          ],
        });
        
        try {
          // 創建 Cognito 用戶
          const newUser = await cognitoClient.send(createCommand);
          
          // 2. 在 DynamoDB 中存儲額外資訊
          const now = new Date();
          const options: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          };
          
          // 格式化時間為 "YYYY-MM-DD HH:mm:ss" 格式
          const formattedTime = now.toLocaleString('zh-TW', options)
            .replace(/\//g, '-');

          await docClient.send(
            new PutCommand({
              TableName: DB_CONFIG.tables.USER_MANAGEMENT,
              Item: {
                email,
                organization: userAttributes.organization,
                role: userAttributes.role,
                createdAt: formattedTime,
                updatedAt: formattedTime
              }
            })
          );

          return res.status(201).json(newUser);
        } catch (error: any) {
          console.error('Create user error:', error);
          
          // 統一錯誤訊息格式
          if (error.__type === 'UsernameExistsException') {
            return res.status(400).json({ 
              error: '創建用戶失敗',
              code: 'UsernameExistsException',
              message: '此電子郵件已被使用，請更換電子郵件再嘗試'
            });
          }
          
          if (error.__type === 'InvalidParameterException') {
            return res.status(400).json({ 
              error: '創建用戶失敗',
              code: 'InvalidParameterException',
              message: '輸入資料格式不正確'
            });
          }

          return res.status(500).json({ 
            error: '創建用戶失敗',
            code: error.__type || 'UnknownError',
            message: '系統發生錯誤，請稍後再試'
          });
        }

      case 'PUT':
        const { username, action, organization, role } = req.body;
        
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
        } else if (action === 'update') {
          try {
            // 1. 獲取當前用戶資訊
            const { Items = [] } = await docClient.send(
              new QueryCommand({
                TableName: DB_CONFIG.tables.USER_MANAGEMENT,
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: {
                  ":email": username
                }
              })
            );

            const currentUser = Items[0];

            // 1. 更新 Cognito 用戶屬性
            const userAttributes = [];
            if (organization) {
              userAttributes.push({
                Name: 'custom:organization',
                Value: organization
              });
            }
            if (role) {
              userAttributes.push({
                Name: 'custom:role',
                Value: role
              });
            }

            if (userAttributes.length > 0) {
              const updateCommand = new AdminUpdateUserAttributesCommand({
                UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
                Username: username,
                UserAttributes: userAttributes,
              });
              await cognitoClient.send(updateCommand);
            }

            // 2. 更新 DynamoDB 中的用戶資訊
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = {
              timeZone: 'Asia/Taipei',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            };
            
            const formattedTime = now.toLocaleString('zh-TW', options)
              .replace(/\//g, '-');

            await docClient.send(
              new PutCommand({
                TableName: DB_CONFIG.tables.USER_MANAGEMENT,
                Item: {
                  email: username,
                  organization,
                  role,
                  createdAt: currentUser?.createdAt,
                  updatedAt: formattedTime
                }
              })
            );

            return res.status(200).json({ message: 'User updated successfully' });
          } catch (error) {
            console.error('Update user error:', error);
            return res.status(500).json({ 
              error: 'Failed to update user',
              details: error
            });
          }
        }
        return res.status(200).json({ message: 'User updated successfully' });

      case 'DELETE':
        const { username: deleteUsername, email: deleteEmail } = req.body;
        
        try {
          console.log('開始刪除用戶:', { username: deleteUsername, email: deleteEmail });

          // 1. 從 Cognito 刪除用戶
          const deleteCommand = new AdminDeleteUserCommand({
            UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
            Username: deleteUsername,
          });
          await cognitoClient.send(deleteCommand);
          console.log('Cognito 用戶刪除成功');

          // 2. 從 DynamoDB 刪除用戶資訊
          try {
            console.log('開始從 DynamoDB 刪除用戶資料，email:', deleteEmail);
            const deleteResult = await docClient.send(
              new DeleteCommand({
                TableName: DB_CONFIG.tables.USER_MANAGEMENT,
                Key: {
                  email: deleteEmail
                }
              })
            );
            console.log('DynamoDB 刪除結果:', deleteResult);
            console.log('DynamoDB 用戶資料刪除成功');
          } catch (dbError: any) {
            console.error('DynamoDB 刪除錯誤:', {
              name: dbError.name,
              message: dbError.message,
              code: dbError.code,
              statusCode: dbError.$metadata?.httpStatusCode,
              requestId: dbError.$metadata?.requestId
            });
            // 即使 DynamoDB 刪除失敗，我們仍然返回成功
            // 因為 Cognito 用戶已經被刪除
          }

          return res.status(200).json({ message: '用戶已成功刪除' });
        } catch (error: any) {
          console.error('Delete user error:', {
            name: error.name,
            message: error.message,
            code: error.code,
            statusCode: error.$metadata?.httpStatusCode,
            requestId: error.$metadata?.requestId
          });
          return res.status(500).json({ 
            error: '刪除用戶失敗',
            details: error
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
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