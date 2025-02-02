import { DynamoDB } from 'aws-sdk';
import { DB_CONFIG } from '../config/db-config';

const dynamoDB = new DynamoDB.DocumentClient();

export interface CustomerData {
  id: string;
  name: string;
  type: string;
  contact: string;
  status: string;
  service: string;
  lastActivity: string;
  manager: {
    name: string;
    avatar: string;
  };
}

export const customerService = {
  async getAllCustomers(): Promise<CustomerData[]> {
    try {
      // 首先從用戶管理表中獲取所有客戶角色的用戶
      const userParams = {
        TableName: DB_CONFIG.tables.USER_MANAGEMENT,
        FilterExpression: '#role = :roleValue',
        ExpressionAttributeNames: {
          '#role': 'role'
        },
        ExpressionAttributeValues: {
          ':roleValue': '客戶'
        }
      };

      const userResult = await dynamoDB.scan(userParams).promise();
      const customerIds = userResult.Items?.map(user => user.id) || [];

      if (customerIds.length === 0) {
        return [];
      }

      // 然後從客戶管理表中獲取這些用戶的詳細信息
      const customerParams = {
        TableName: DB_CONFIG.tables.CUSTOMER_MANAGEMENT,
        FilterExpression: 'id IN (' + customerIds.map((_, index) => `:id${index}`).join(',') + ')',
        ExpressionAttributeValues: customerIds.reduce((acc, id, index) => ({
          ...acc,
          [`:id${index}`]: id
        }), {})
      };

      const customerResult = await dynamoDB.scan(customerParams).promise();
      return customerResult.Items as CustomerData[];
    } catch (error) {
      console.error('獲取客戶數據失敗:', error);
      throw error;
    }
  }
}; 