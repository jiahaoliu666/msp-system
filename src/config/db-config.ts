// DynamoDB 表名配置
export const DB_CONFIG = {
  tables: {
    CONTRACT_MANAGEMENT: 'MetaAge-MSP-Contract-Management',
    ORGANIZATION_MANAGEMENT: 'MetaAge-MSP-Organization-Management',
    USER_MANAGEMENT: 'MetaAge-MSP-User-Management',
    CUSTOMER_MANAGEMENT: 'MetaAge-MSP-Customer-Management'
  }
} as const;

// 檢查必要的表名配置
function validateTableNames() {
  const missingTables: string[] = [];
  
  Object.entries(DB_CONFIG.tables).forEach(([key, value]) => {
    if (!value) {
      missingTables.push(key);
    }
  });

  if (missingTables.length > 0) {
    throw new Error(`缺少必要的資料表配置: ${missingTables.join(', ')}`);
  }
}

// 驗證配置
validateTableNames();

// 輸出配置資訊
console.log('DynamoDB 表名配置初始化完成:', {
  tables: Object.entries(DB_CONFIG.tables).reduce((acc, [key]) => ({
    ...acc,
    [key]: '已設置'
  }), {})
}); 