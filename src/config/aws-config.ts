import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

// 客戶端配置
export const AWS_CONFIG = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-northeast-1',
  cognito: {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
  },
};

// 創建 Cognito 客戶端實例
export const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_CONFIG.region,
  // 在伺服器端運行時使用環境變數中的憑證
  ...(typeof window === 'undefined' && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  }),
}); 