import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SidebarProps {
  isSidebarOpen: boolean;
}

export default function Sidebar({ isSidebarOpen }: SidebarProps) {
  const router = useRouter();

  const isCurrentPath = (path: string) => {
    return router.pathname === path;
  };

  return (
    <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-background-primary dark:bg-background-secondary 
                    shadow-lg h-[calc(100vh-4rem)] overflow-y-auto fixed left-0 top-16 
                    transition-all duration-300 ease-in-out z-40`}>
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {/* 主要功能區 */}
          <div className={`px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider ${!isSidebarOpen && 'hidden'}`}>
            主要功能
          </div>
          {[
            { name: '總覽', icon: '📊', badge: '', link: '/' },
            { name: '工單系統', icon: '🎫', badge: '8', link: '/ticket-system' },
            { name: '客戶管理', icon: '👥', badge: '12', link: '/customer-management' },
            { name: '服務記錄', icon: '📝', badge: '3', link: '/service-record' },
            { name: '專案追蹤', icon: '📌', badge: '5', link: '/project-tracking' },
            { name: '合約管理', icon: '📋', badge: '', link: '/contract-management' },
            { name: '待辦事項', icon: '📝', badge: '2', link: '/todo-list' },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.link}
              className={`nav-item flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer 
                       transition-all duration-200 group ${
                         isCurrentPath(item.link)
                           ? 'bg-accent-color/10 text-accent-color'
                           : 'text-text-primary hover:bg-accent-color/10 hover:text-accent-color'
                       }`}
              title={!isSidebarOpen ? item.name : ''}
            >
              <div className="flex items-center">
                <span className={`text-xl group-hover:scale-110 transition-transform duration-200 
                               ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`}>
                  {item.icon}
                </span>
                <span className={`font-medium ${!isSidebarOpen && 'hidden'}`}>{item.name}</span>
              </div>
              {item.badge && isSidebarOpen && (
                <span className="bg-accent-color/10 text-accent-color text-xs px-2 py-1 rounded-full 
                               font-medium group-hover:bg-accent-color/20 transition-colors duration-200">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}

          {/* 系統管理區 */}
          <div className={`mt-8 px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider ${!isSidebarOpen && 'hidden'}`}>
            系統管理
          </div>
          {[
            { name: '使用者管理', icon: '👤', link: '/user-management' },
            { name: '權限設定', icon: '🔒', link: '/permission-setting' },
            { name: '操作記錄', icon: '📜', link: '/operation-record' },
            { name: '系統設定', icon: '⚙️', link: '/system-settings' },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.link}
              className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                isCurrentPath(item.link)
                  ? 'bg-accent-color/10 text-accent-color'
                  : 'text-text-primary hover:bg-accent-color/10 hover:text-accent-color'
              }`}
            >
              <span className="mr-3 text-xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
              <span className={`font-medium ${!isSidebarOpen && 'hidden'}`}>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
