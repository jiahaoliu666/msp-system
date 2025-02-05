export const CONTRACT_TYPES = {
  SERVICE: {
    value: '帳務託管',
    label: '帳務託管'
  },
  MAINTENANCE_8: {
    value: '5*8 雲顧問',
    label: '5*8 雲顧問'
  },
  MAINTENANCE_24: {
    value: '7*24 雲託管',
    label: '7*24 雲託管'
  },
  INTERNAL: {
    value: '內部合約',
    label: '內部合約'
  }
} as const;

// 合約狀態常數
export const CONTRACT_STATUS = {
  ACTIVE: {
    value: '生效中',
    label: '生效中',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200'
  },
  PENDING_SIGNATURE: {
    value: '待簽署',
    label: '待簽署',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200'
  },
  PENDING_RENEWAL: {
    value: '待續約',
    label: '待續約',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  EXPIRED: {
    value: '已到期',
    label: '已到期',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200'
  }
} as const;

// 獲取合約狀態的樣式
export const getContractStatusStyle = (status: string) => {
  const statusConfig = Object.values(CONTRACT_STATUS).find(s => s.value === status);
  return statusConfig ? {
    bgColor: statusConfig.bgColor,
    textColor: statusConfig.textColor,
    borderColor: statusConfig.borderColor
  } : {
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200'
  };
};

// 合約相關的工具函數
export const getContractTypeLabel = (value: string): string => {
  const type = Object.values(CONTRACT_TYPES).find(type => type.value === value);
  return type?.label || value;
};

export const getContractStatusLabel = (value: string): string => {
  const status = Object.values(CONTRACT_STATUS).find(status => status.value === value);
  return status?.label || value;
};

// 合約相關的類型定義
export interface Contract {
  contractId: string;
  contractName: string;
  contractType: string;
  description: string;
  startDate: string;
  endDate: string;
  contractStatus: string;
  createdAt: string;
  updatedAt: string;
  productName: string;
  remainingHours?: number;
} 