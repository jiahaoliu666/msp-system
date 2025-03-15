import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'background-primary': 'var(--background-primary)',
        'background-secondary': 'var(--background-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border-color': 'var(--border-color)',
        'hover-color': 'var(--hover-color)',
        'accent-color': 'var(--accent-color)',
        'accent-hover': 'var(--accent-hover)',
        'success-color': 'var(--success-color)',
        'warning-color': 'var(--warning-color)',
        'error-color': 'var(--error-color)',
        'info-color': 'var(--info-color)',
        
        // 添加表格特定顏色
        'table-header': '#f8fafc',
        'table-header-dark': '#1e293b',
        'table-row-hover': '#f1f5f9',
        'table-row-hover-dark': '#334155',
        'table-row-selected': '#eff6ff',
        'table-row-selected-dark': '#1e3a8a',
        'table-border': '#e2e8f0',
        'table-border-dark': '#334155',
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.1)',
        'table': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        'dropdown': '0 2px 5px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
      },
      animation: {
        'data-flow': 'dataFlow 8s linear infinite',
        'float-particle': 'floatParticle 8s ease-in-out infinite',
        'pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'circuit-pulse': 'circuitPulse 3s ease-in-out infinite',
        'glow': 'glow 5s ease-in-out infinite',
        'rotate-slow': 'rotate 15s linear infinite',
        'rotate-medium': 'rotate 10s linear infinite',
        'rotate-fast': 'rotate 5s linear infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'data-node': 'dataNode 4s ease-in-out infinite',
        'binary-fade': 'binaryFade 8s ease-in-out infinite',
        'matrix-fall': 'matrixFall 10s linear infinite',
      },
      keyframes: {
        dataFlow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        floatParticle: {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1)',
            opacity: '0.7'
          },
          '50%': { 
            transform: 'translateY(-20px) scale(1.5)',
            opacity: '1'
          }
        },
        pulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '0.3' }
        },
        circuitPulse: {
          '0%': { 
            boxShadow: '0 0 0 0 rgba(56, 189, 248, 0.4)',
            opacity: '1'
          },
          '70%': { 
            boxShadow: '0 0 0 10px rgba(56, 189, 248, 0)',
            opacity: '0.8'
          },
          '100%': { 
            boxShadow: '0 0 0 0 rgba(56, 189, 248, 0)',
            opacity: '1'
          }
        },
        glow: {
          '0%': { 
            filter: 'brightness(1) drop-shadow(0 0 5px rgba(56, 189, 248, 0.5))'
          },
          '25%': { 
            filter: 'brightness(1.1) drop-shadow(0 0 7px rgba(56, 189, 248, 0.6))'
          },
          '50%': { 
            filter: 'brightness(1.2) drop-shadow(0 0 10px rgba(56, 189, 248, 0.8))'
          },
          '75%': { 
            filter: 'brightness(1.1) drop-shadow(0 0 7px rgba(56, 189, 248, 0.6))'
          },
          '100%': { 
            filter: 'brightness(1) drop-shadow(0 0 5px rgba(56, 189, 248, 0.5))'
          }
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        scanLine: {
          '0%': { 
            transform: 'translateY(-100%)',
            opacity: '0.5'
          },
          '50%': { 
            opacity: '0.8'
          },
          '100%': { 
            transform: 'translateY(100%)',
            opacity: '0.5'
          }
        },
        dataNode: {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: '0.7',
            boxShadow: '0 0 0 rgba(56, 189, 248, 0.4)'
          },
          '50%': { 
            transform: 'scale(1.3)',
            opacity: '1',
            boxShadow: '0 0 15px rgba(56, 189, 248, 0.7)'
          }
        },
        binaryFade: {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '0.3' }
        },
        matrixFall: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        }
      },
      scale: {
        '102': '1.02',
      },
      perspective: {
        '1000': '1000px',
      },
      rotate: {
        'x-60': 'rotateX(60deg)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      transformOrigin: {
        'center': 'center',
      },
      fontSize: {
        'xxs': '0.625rem', // 10px
      },
      
      minWidth: {
        'table-cell': '80px',
        'table-action': '100px', 
      },
      
      maxWidth: {
        'name-cell': '240px',
      },
      
      zIndex: {
        'table-header': '5',
        'table-action': '10',
        'dropdown': '50',
        'modal': '100',
      },
    },
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [
    // 添加自定義工具類來處理表格交互
    plugin(function({ addUtilities }) {
      const newUtilities = {
        '.table-compact': {
          '& th, & td': {
            padding: '0.5rem 0.75rem',
          },
        },
        '.table-normal': {
          '& th, & td': {
            padding: '0.75rem 1rem',
          },
        },
        '.table-relaxed': {
          '& th, & td': {
            padding: '1rem 1.5rem',
          },
        },
        '.cell-truncate': {
          maxWidth: '0',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        '.sticky-header': {
          position: 'sticky',
          top: '0',
          zIndex: '10',
          backgroundColor: 'inherit',
        },
      }
      addUtilities(newUtilities)
    })
  ],
} satisfies Config;
