import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  isDark: boolean;
  systemTheme: string | undefined;
  isSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
  systemTheme: undefined,
  isSystemTheme: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';
  const isSystemTheme = theme === 'system';

  const toggleTheme = () => {
    if (isSystemTheme) {
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(isDark ? 'light' : 'dark');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        theme: theme || 'light',
        setTheme,
        toggleTheme,
        isDark,
        systemTheme,
        isSystemTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext 必須在 ThemeProvider 內使用');
  }
  return context;
}; 