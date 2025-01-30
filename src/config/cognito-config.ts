import { 
  CognitoIdentityProviderClient,
  ListUsersCommand
} from "@aws-sdk/client-cognito-identity-provider";

// Cognito 配置
export const COGNITO_CONFIG = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-northeast-1',
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
  }
};

// 檢查必要的配置
function validateCognitoConfig() {
  const missingConfigs: string[] = [];
  const configs = {
    'AWS_REGION': process.env.NEXT_PUBLIC_AWS_REGION,
    'COGNITO_USER_POOL_ID': process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    'COGNITO_CLIENT_ID': process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    'AWS_ACCESS_KEY_ID': process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    'AWS_SECRET_ACCESS_KEY': process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
  };

  // 檢查每個配置項
  Object.entries(configs).forEach(([key, value]) => {
    console.log(`檢查 Cognito 環境變數 ${key}:`, value ? '已設置' : '未設置');
    if (!value) {
      missingConfigs.push(key);
    }
  });

  console.log('Cognito 配置檢查:', {
    region: COGNITO_CONFIG.region,
    userPoolId: COGNITO_CONFIG.userPoolId,
    clientId: COGNITO_CONFIG.clientId,
    hasAccessKey: !!COGNITO_CONFIG.credentials.accessKeyId,
    hasSecretKey: !!COGNITO_CONFIG.credentials.secretAccessKey,
    missingConfigs
  });

  if (missingConfigs.length > 0) {
    const error = new Error(`缺少必要的 Cognito 配置: ${missingConfigs.join(', ')}`);
    console.error('Cognito 配置錯誤:', error);
    throw error;
  }
}

// 驗證配置
validateCognitoConfig();

// 創建 Cognito 客戶端實例
export const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_CONFIG.region,
  credentials: {
    accessKeyId: COGNITO_CONFIG.credentials.accessKeyId,
    secretAccessKey: COGNITO_CONFIG.credentials.secretAccessKey
  },
  maxAttempts: 3,
  retryMode: 'standard',
  endpoint: `https://cognito-idp.${COGNITO_CONFIG.region}.amazonaws.com`,
  apiVersion: '2016-04-18',
  logger: {
    debug: (...args) => console.log('Cognito Debug:', ...args),
    info: (...args) => console.log('Cognito Info:', ...args),
    warn: (...args) => console.warn('Cognito Warning:', ...args),
    error: (...args) => console.error('Cognito Error:', ...args)
  }
});

// 測試 Cognito 客戶端連接
(async () => {
  try {
    console.log('測試 Cognito 客戶端連接...');
    console.log('Cognito 客戶端配置:', {
      region: COGNITO_CONFIG.region,
      endpoint: `https://cognito-idp.${COGNITO_CONFIG.region}.amazonaws.com`,
      credentials: {
        accessKeyId: COGNITO_CONFIG.credentials.accessKeyId ? '已設置' : '未設置',
        secretAccessKey: COGNITO_CONFIG.credentials.secretAccessKey ? '已設置' : '未設置'
      },
      userPoolId: COGNITO_CONFIG.userPoolId,
      clientId: COGNITO_CONFIG.clientId
    });

    const testCommand = new ListUsersCommand({
      UserPoolId: COGNITO_CONFIG.userPoolId,
      Limit: 1
    });

    console.log('發送測試請求到 Cognito...', {
      commandName: testCommand.constructor.name,
      input: testCommand.input
    });

    const response = await cognitoClient.send(testCommand);
    console.log('Cognito 客戶端連接測試成功', {
      statusCode: response.$metadata.httpStatusCode,
      requestId: response.$metadata.requestId
    });
  } catch (error: any) {
    console.error('Cognito 客戶端連接測試失敗:', {
      name: error.name,
      message: error.message,
      code: error.code,
      $metadata: error.$metadata
    });
  }
})();

// 輸出配置資訊
console.log('Cognito 客戶端初始化完成:', {
  region: COGNITO_CONFIG.region,
  userPoolId: COGNITO_CONFIG.userPoolId ? '已設置' : '未設置',
  clientId: COGNITO_CONFIG.clientId ? '已設置' : '未設置',
  hasCredentials: !!COGNITO_CONFIG.credentials.accessKeyId && !!COGNITO_CONFIG.credentials.secretAccessKey,
  endpoint: `https://cognito-idp.${COGNITO_CONFIG.region}.amazonaws.com`
}); 