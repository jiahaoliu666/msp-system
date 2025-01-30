// AWS 基本配置
export const AWS_CONFIG = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
  }
};

// 檢查必要的配置
function validateConfig() {
  const missingConfigs: string[] = [];
  const configs = {
    'AWS_REGION': process.env.NEXT_PUBLIC_AWS_REGION,
    'AWS_ACCESS_KEY_ID': process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    'AWS_SECRET_ACCESS_KEY': process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
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
    missingConfigs
  });

  if (missingConfigs.length > 0) {
    const error = new Error(`缺少必要的 AWS 配置: ${missingConfigs.join(', ')}`);
    console.error('AWS 配置錯誤:', error);
    throw error;
  }
}

// 驗證配置
validateConfig();

// 輸出配置資訊
console.log('AWS 配置初始化完成:', {
  region: AWS_CONFIG.region,
  hasCredentials: !!AWS_CONFIG.credentials.accessKeyId && !!AWS_CONFIG.credentials.secretAccessKey
}); 