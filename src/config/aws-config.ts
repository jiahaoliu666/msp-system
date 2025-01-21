import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

// 客戶端配置
export const AWS_CONFIG = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-northeast-1',
  cognito: {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
  },
};

// 檢查必要的配置
if (!AWS_CONFIG.cognito.userPoolId || !AWS_CONFIG.cognito.clientId) {
  console.error('AWS Cognito 配置缺失:', {
    region: AWS_CONFIG.region,
    userPoolId: AWS_CONFIG.cognito.userPoolId ? '已設置' : '未設置',
    clientId: AWS_CONFIG.cognito.clientId ? '已設置' : '未設置'
  });
}

// 創建 Cognito 客戶端實例
export const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_CONFIG.region,
  endpoint: `https://cognito-idp.${AWS_CONFIG.region}.amazonaws.com`,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  },
  maxAttempts: 3,
  logger: {
    debug: (...args) => console.debug(...args),
    info: (...args) => console.log(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args)
  }
});

// 輸出配置資訊
console.log('AWS Cognito 客戶端初始化完成:', {
  region: AWS_CONFIG.region,
  userPoolId: AWS_CONFIG.cognito.userPoolId ? '已設置' : '未設置',
  clientId: AWS_CONFIG.cognito.clientId ? '已設置' : '未設置',
  endpoint: `https://cognito-idp.${AWS_CONFIG.region}.amazonaws.com`,
  hasCredentials: !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY
}); 