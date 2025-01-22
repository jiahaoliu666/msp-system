import { 
  CognitoIdentityProviderClient,
  ListUsersCommand
} from "@aws-sdk/client-cognito-identity-provider";

// 客戶端配置
export const AWS_CONFIG = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-northeast-1',
  cognito: {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
  },
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
    'COGNITO_USER_POOL_ID': process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    'COGNITO_CLIENT_ID': process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
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
    userPoolId: AWS_CONFIG.cognito.userPoolId,
    clientId: AWS_CONFIG.cognito.clientId,
    hasAccessKey: !!AWS_CONFIG.credentials.accessKeyId,
    hasSecretKey: !!AWS_CONFIG.credentials.secretAccessKey,
    missingConfigs
  });

  if (missingConfigs.length > 0) {
    const error = new Error(`缺少必要的 AWS 配置: ${missingConfigs.join(', ')}`);
    console.error('AWS Cognito 配置錯誤:', error);
    throw error;
  }
}

// 驗證配置
validateConfig();

// 創建 Cognito 客戶端實例
export const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_CONFIG.region,
  credentials: {
    accessKeyId: AWS_CONFIG.credentials.accessKeyId,
    secretAccessKey: AWS_CONFIG.credentials.secretAccessKey
  },
  maxAttempts: 3,
  retryMode: 'standard',
  endpoint: `https://cognito-idp.${AWS_CONFIG.region}.amazonaws.com`,
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
      region: AWS_CONFIG.region,
      endpoint: `https://cognito-idp.${AWS_CONFIG.region}.amazonaws.com`,
      credentials: {
        accessKeyId: AWS_CONFIG.credentials.accessKeyId ? '已設置' : '未設置',
        secretAccessKey: AWS_CONFIG.credentials.secretAccessKey ? '已設置' : '未設置'
      },
      userPoolId: AWS_CONFIG.cognito.userPoolId,
      clientId: AWS_CONFIG.cognito.clientId
    });

    const testCommand = new ListUsersCommand({
      UserPoolId: AWS_CONFIG.cognito.userPoolId,
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
console.log('AWS Cognito 客戶端初始化完成:', {
  region: AWS_CONFIG.region,
  userPoolId: AWS_CONFIG.cognito.userPoolId ? '已設置' : '未設置',
  clientId: AWS_CONFIG.cognito.clientId ? '已設置' : '未設置',
  hasCredentials: !!AWS_CONFIG.credentials.accessKeyId && !!AWS_CONFIG.credentials.secretAccessKey,
  endpoint: `https://cognito-idp.${AWS_CONFIG.region}.amazonaws.com`
}); 