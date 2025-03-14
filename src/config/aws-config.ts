// AWS 基本配置
export const AWS_CONFIG = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
  },
  endpoint: process.env.NEXT_PUBLIC_S3_ENDPOINT || undefined,
  retryMode: 'standard' as const,
  maxAttempts: 3,
  requestTimeout: 30000,
  customUserAgent: 'MetaAge-MSP/1.0'
};

// 檢查必要的配置
function validateConfig() {
  const missingConfigs: string[] = [];
  const configs = {
    'AWS_REGION': process.env.NEXT_PUBLIC_AWS_REGION,
    'AWS_ACCESS_KEY_ID': process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    'AWS_SECRET_ACCESS_KEY': process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    'S3_ENDPOINT': process.env.NEXT_PUBLIC_S3_ENDPOINT,
    'S3_BUCKET_NAME': process.env.NEXT_PUBLIC_S3_BUCKET_NAME
  };

  // 檢查每個配置項
  Object.entries(configs).forEach(([key, value]) => {
    console.log(`檢查環境變數 ${key}:`, value ? '已設置' : '未設置');
    if (!value) {
      missingConfigs.push(key);
    }
  });

  console.log('AWS 配置檢查:', {
    region: AWS_CONFIG.region,
    hasAccessKey: !!AWS_CONFIG.credentials.accessKeyId,
    hasSecretKey: !!AWS_CONFIG.credentials.secretAccessKey,
    hasEndpoint: !!AWS_CONFIG.endpoint,
    bucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    missingConfigs
  });

  if (missingConfigs.length > 0) {
    // 僅輸出警告而不拋出錯誤，避免阻止應用啟動
    console.warn(`⚠️ 警告: 缺少某些 AWS 配置: ${missingConfigs.join(', ')}`);
    console.warn('某些功能可能無法正常工作。請檢查環境變數配置。');
  }
}

// 驗證配置
try {
  validateConfig();
  
  // 輸出配置資訊
  console.log('AWS 配置初始化完成:', {
    region: AWS_CONFIG.region,
    hasCredentials: !!AWS_CONFIG.credentials.accessKeyId && !!AWS_CONFIG.credentials.secretAccessKey,
    endpoint: AWS_CONFIG.endpoint,
    environment: process.env.NODE_ENV
  });
} catch (error) {
  console.error('AWS 配置初始化失敗:', error);
}

// 提供一個測試連接功能
export async function testAWSConnection() {
  console.log('正在測試 AWS 連接...');
  
  try {
    // 基本信息檢查
    if (!AWS_CONFIG.credentials.accessKeyId || !AWS_CONFIG.credentials.secretAccessKey) {
      throw new Error('AWS 認證信息缺失');
    }
    
    if (!AWS_CONFIG.region) {
      throw new Error('AWS 區域信息缺失');
    }
    
    console.log('AWS 基本配置檢查通過');
    return true;
  } catch (error) {
    console.error('AWS 連接測試失敗:', error);
    return false;
  }
} 