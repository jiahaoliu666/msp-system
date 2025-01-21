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
import { cognitoClient } from '@/config/aws-config';

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
              TableName: "MetaAge-MSP-User-Management"
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
            { Name: "email_verified", Value: "false" }
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
              TableName: "MetaAge-MSP-User-Management",
              Item: {
                email,
                organization: userAttributes.organization,
                role: userAttributes.role,
                emailVerified: false,
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
                TableName: "MetaAge-MSP-User-Management",
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
                TableName: "MetaAge-MSP-User-Management",
                Item: {
                  email: username,
                  organization,
                  role,
                  emailVerified: currentUser?.emailVerified || false,
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
        const { username: deleteUsername } = req.body;
        
        try {
          // 1. 從 Cognito 刪除用戶
          const deleteCommand = new AdminDeleteUserCommand({
            UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
            Username: deleteUsername,
          });
          await cognitoClient.send(deleteCommand);

          // 2. 從 DynamoDB 刪除用戶資訊
          // 先查詢所有相關記錄
          const { Items = [] } = await docClient.send(
            new QueryCommand({
              TableName: "MetaAge-MSP-User-Management",
              KeyConditionExpression: "email = :email",
              ExpressionAttributeValues: {
                ":email": deleteUsername
              }
            })
          );

          // 刪除所有找到的記錄
          const deletePromises = Items.map(item => 
            docClient.send(
              new DeleteCommand({
                TableName: "MetaAge-MSP-User-Management",
                Key: {
                  email: deleteUsername
                }
              })
            )
          );

          await Promise.all(deletePromises);

          return res.status(200).json({ message: 'User and all related records deleted successfully' });
        } catch (error) {
          console.error('Delete user error:', error);
          return res.status(500).json({ 
            error: 'Failed to delete user and related records',
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