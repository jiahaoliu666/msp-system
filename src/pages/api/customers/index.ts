import { NextApiRequest, NextApiResponse } from 'next';
import { customerService } from '../../customer-management';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不被允許' });
  }

  try {
    const customers = await customerService.getAllCustomers();
    res.status(200).json(customers);
  } catch (error) {
    console.error('獲取客戶數據失敗:', error);
    res.status(500).json({ message: '獲取客戶數據失敗' });
  }
} 