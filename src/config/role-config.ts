export const ROLE_CONFIG = {
  ROLES: {
    ARCHITECT: {
      value: '架構師',
      label: '架構師',
      permissions: ['view', 'edit', 'delete', 'create'] as const
    },
    OPERATION_ENGINEER: {
      value: '維運工程師',
      label: '維運工程師',
      permissions: ['view'] as const
    },
    SYSTEM_ADMIN: {
      value: '系統管理員',
      label: '系統管理員',
      permissions: ['view', 'edit', 'delete', 'create'] as const
    },
    CUSTOMER: {
      value: '客戶',
      label: '客戶',
      permissions: ['view'] as const
    }
  },

  // 獲取所有角色選項的輔助函數
  getRoleOptions: (currentUserRole?: string) => {
    const roles = Object.values(ROLE_CONFIG.ROLES);
    
    // 如果是系統管理員，返回所有角色
    if (currentUserRole === '系統管理員') {
      return roles.map(role => ({
        value: role.value,
        label: role.label
      }));
    }
    
    // 如果不是系統管理員，過濾掉系統管理員角色
    return roles
      .filter(role => role.value !== '系統管理員')
      .map(role => ({
        value: role.value,
        label: role.label
      }));
  },

  // 檢查角色權限的輔助函數
  hasPermission: (role: string, permission: PermissionType): boolean => {
    const roleConfig = Object.values(ROLE_CONFIG.ROLES).find(r => r.value === role);
    return roleConfig?.permissions.includes(permission as any) || false;
  }
} as const;

// 導出常用的類型
export type RoleType = typeof ROLE_CONFIG.ROLES[keyof typeof ROLE_CONFIG.ROLES]['value'];
export type PermissionType = 'view' | 'edit' | 'delete' | 'create'; 