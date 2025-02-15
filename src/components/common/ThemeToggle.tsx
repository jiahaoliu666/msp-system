import { useThemeContext } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-background-secondary hover:bg-hover-color 
                transition-all duration-300 focus:outline-none focus:ring-2 
                focus:ring-accent-color focus:ring-offset-2 
                dark:focus:ring-offset-background-primary group"
      aria-label={theme === 'dark' ? '切換至淺色模式' : '切換至深色模式'}
    >
      <div className="relative w-6 h-6">
        {/* 太陽圖標 */}
        <div className={`absolute inset-0 transform transition-all duration-500
                        ${theme === 'dark' ? 'rotate-180 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}>
          <svg
            className="w-6 h-6 text-amber-500 transition-colors duration-200
                       transform origin-center transition-transform duration-500 
                       group-hover:rotate-12 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        
        {/* 月亮圖標 */}
        <div className={`absolute inset-0 transform transition-all duration-500
                        ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-180 scale-0 opacity-0'}`}>
          <svg
            className="w-6 h-6 text-sky-400 transition-colors duration-200
                       transform origin-center transition-transform duration-500 
                       group-hover:-rotate-12 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </div>
      </div>
      
      {/* 懸浮提示 */}
      <span className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 
                     bg-background-primary border border-border-color rounded-lg text-xs
                     opacity-0 group-hover:opacity-100 transition-all duration-200
                     whitespace-nowrap shadow-sm z-50 font-medium text-text-primary">
        {theme === 'dark' ? '切換至淺色模式' : '切換至深色模式'}
        <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 rotate-45 
                      w-2 h-2 bg-background-primary border-t border-l border-border-color" />
      </span>
    </button>
  );
} 